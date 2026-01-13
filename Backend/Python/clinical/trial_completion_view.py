from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.utils import timezone
from .models import Trial, InventoryItem, InventorySerial, PatientPurchase, Bill, BillItem
from .serializers import TrialCompletionSerializer
from datetime import timedelta


class TrialCompletionView(APIView):
    """API endpoint to complete a trial and handle patient's device booking decision."""
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request, trial_id, *args, **kwargs):
        try:
            # Get trial
            trial = Trial.objects.get(id=trial_id)
            
            # Validate serializer
            serializer = TrialCompletionSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(
                    {"status": "error", "message": "Invalid data", "errors": serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            trial_decision = serializer.validated_data['trial_decision']
            completion_notes = serializer.validated_data.get('completion_notes', '')
            next_followup = serializer.validated_data.get('next_followup', 1)
            
            with transaction.atomic():
                # Update trial completion details
                trial.trial_decision = trial_decision
                trial.trial_completed_at = timezone.now()
                trial.return_notes = completion_notes
                trial.save()
                
                # Update visit status based on decision
                if trial_decision == 'BOOK':
                    # Handle device booking
                    booked_inventory_id = serializer.validated_data['booked_device_inventory']
                    booked_serial = serializer.validated_data.get('validated_serial')
                    
                    # Get inventory item
                    inventory_item = InventoryItem.objects.get(id=booked_inventory_id)
                    
                    # Update trial with booked device info
                    trial.booked_device_inventory = inventory_item
                    if booked_serial:
                        trial.booked_device_serial = booked_serial
                    trial.save()
                    
                    # Create purchase record
                    unit_price = inventory_item.unit_price
                    PatientPurchase.objects.create(
                        clinic=trial.clinic,
                        patient=trial.assigned_patient,
                        visit=trial.visit,
                        inventory_item=inventory_item,
                        inventory_serial=booked_serial,
                        quantity=1,
                        unit_price=unit_price,
                        total_price=unit_price
                    )
                    
                    # Update inventory
                    if booked_serial:
                        # For serialized items, update serial status
                        booked_serial.status = 'Sold'
                        booked_serial.save()
                        
                        # Update inventory quantity from serials
                        inventory_item.update_quantity_from_serials()
                    else:
                        # For non-serialized items, decrease quantity
                        inventory_item.quantity_in_stock -= 1
                        inventory_item.save()
                    
                    # Create bill for device purchase
                    bill, created = Bill.objects.get_or_create(
                        visit=trial.visit,
                        defaults={
                            'clinic': trial.clinic,
                            'created_by': request.user,
                        }
                    )
                    
                    # Add bill item for device
                    BillItem.objects.create(
                        bill=bill,
                        item_type='Purchase',
                        description=f"Purchase of {inventory_item.product_name} ({inventory_item.brand} {inventory_item.model_type})",
                        cost=unit_price,
                        quantity=1,
                    )
                    
                    # Recalculate bill totals
                    bill.calculate_total()
                    
                    # Update visit status
                    trial.visit.status = 'Device Booked'
                    
                else:  # NOT_BOOKED

                    if next_followup:
                        # Update visit status to indicate patient needs time
                        trial.visit.status = 'Book Follow-up Required'
                        trial.followup_date = timezone.now() + timedelta(days=next_followup)
                        trial.save()
                
                trial.visit.save()
                
                return Response({
                    "status": "success",
                    "message": f"Trial completed successfully. Decision: {trial.get_trial_decision_display()}",
                    "data": {
                        "trial_id": trial.id,
                        "decision": trial.trial_decision,
                        "completed_at": trial.trial_completed_at,
                        "booked_device": trial.booked_device_inventory.product_name if trial.booked_device_inventory else None
                    }
                })
                
        except Trial.DoesNotExist:
            return Response(
                {"status": "error", "message": "Trial not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"status": "error", "message": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
