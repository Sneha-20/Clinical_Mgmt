from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.utils import timezone
from .models import Trial, InventoryItem, InventorySerial, PatientPurchase, Bill, BillItem
from .serializers import TrialCompletionSerializer,AwaitingStockListSerializer
from datetime import timedelta
from clinical_be.utils.pagination import StandardResultsSetPagination


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
            followup_days = serializer.validated_data.get('followup_days', 3)
            
            with transaction.atomic():
                # Update trial completion details
                trial.trial_decision = trial_decision
                trial.trial_completed_at = timezone.now()
                trial.return_notes = completion_notes
                trial.save()
                
                # Handle different decision scenarios
                if trial_decision == 'BOOK - Device Allocated':
                    # Scenario 1: Patient wants to book a new device
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
                        inventory_serial=trial.booked_device_serial,
                        quantity=1,
                        unit_price=unit_price,
                        total_price=unit_price
                    )
                    
                    # Update inventory
                    if trial.booked_device_serial:
                        # For serialized items, update serial status
                        trial.booked_device_serial.status = 'Sold'
                        trial.booked_device_serial.save()
                        
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
                    trial.visit.status = 'Book - Device Allocated'
                    trial.visit.status_note = 'Trial completed , Device Allocated for booking'
                    trial.visit.save()

                elif trial_decision == 'BOOK - Awaiting Stock':

                    booked_inventory_id = serializer.validated_data['booked_device_inventory']
            
                    # Get inventory item
                    inventory_item = InventoryItem.objects.get(id=booked_inventory_id)
                    
                    # Update trial with booked device info
                    trial.booked_device_inventory = inventory_item
                    trial.save()

                    # Scenario 1b: Patient wants to book a new device but it's out of stock
                    trial.visit.status = 'Book - Awaiting Stock'
                    trial.visit.status_note = 'Trial completed , Awaiting stock for booked device'
                    trial.save()

                    
                elif trial_decision == 'TRIAL ACTIVE':
                    # Scenario 2: Patient needs time (2-3 days) for decision - followup
                    trial.visit.status = 'Trial Active'
                    trial.extended_trial = True
                    trial.visit.status_note = 'Trial extended for booking device decision'
                    trial.extended_at = timezone.now()
                    trial.trial_end_date = timezone.now() + timedelta(days=followup_days)
                    trial.followup_date = timezone.now() + timedelta(days=followup_days + 1)
                    trial.save()
                    
                elif trial_decision == 'DECLINE':
                    # Scenario 3: Patient doesn't need new device anymore
                    trial.visit.status = 'Trial Completed - No Device'
                    trial.visit.status_note = 'Trial completed , Device not booked'
                    # No followup needed, trial is complete
                    trial.save()
                
                trial.visit.save()
        
                # Add decision-specific messages
                if trial_decision == 'BOOK - Device Allocated':
                    message = f"Trial completed successfully. Device booked: {trial.booked_device_inventory.product_name if trial.booked_device_inventory else 'N/A'}"
                
                elif trial_decision == 'BOOK - Awaiting Stock':
                    message = f"Trial completed successfully. Awaiting stock for booked device: {trial.booked_device_inventory.product_name if trial.booked_device_inventory else 'N/A'}"
                elif trial_decision == 'TRIAL ACTIVE':
                    message = f"Trial completed successfully. Follow-up scheduled in {followup_days} days."
                elif trial_decision == 'DECLINE':
                    message = "Trial completed successfully. Patient declined device booking."
                
                return Response({
                    "status": "success",
                    "message": message,
                    # "data": response_data
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


class AwaitingStockListView(generics.ListAPIView):
    """API endpoint to list trials that are awaiting stock for booked devices."""
    
    permission_classes = [IsAuthenticated]
    serializer_class = AwaitingStockListSerializer
    pagination_class = StandardResultsSetPagination


    def get_queryset(self):
        return Trial.objects.filter(trial_decision='BOOK - Awaiting Stock')
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
       
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "status": status.HTTP_200_OK,
            "data": serializer.data
        })

class AllocateSerialFlatList(generics.RetrieveAPIView):
    """API endpoint to list AwaitingStockListSerializer items by ID."""
    
    permission_classes = [IsAuthenticated]
    serializer_class = AwaitingStockListSerializer
    queryset = Trial.objects.filter(trial_decision='BOOK - Awaiting Stock')
    lookup_field = 'id'
    lookup_url_kwarg = 'trial_id'


class AllocateSerialNumber(generics.UpdateAPIView):
    """API endpoint to allocate a serial number to a trial that is awaiting stock."""
    
    permission_classes = [IsAuthenticated]
    queryset = Trial.objects.filter(trial_decision='BOOK - Awaiting Stock')
    lookup_field = 'id'
    lookup_url_kwarg = 'trial_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        trial_decision = instance.trial_decision
        booked_device_serial = request.data.get('booked_device_serial')
        serial_obj = None
        with transaction.atomic():
            # For serialized items, validate the serial number exists and is in stock
            if instance.booked_device_inventory.stock_type == 'Serialized' and booked_device_serial:
                try:
                    from .models import InventorySerial
                    serial_obj = InventorySerial.objects.get(
                        serial_number=booked_device_serial,
                        inventory_item=instance.booked_device_inventory,
                        status='In Stock'
                    )
                except InventorySerial.DoesNotExist:
                    return Response({
                        "status": "error",
                        "message": f"Serial number {booked_device_serial} is not available in stock for the selected inventory item."
                    }, status=status.HTTP_400_BAD_REQUEST)
            if trial_decision == 'BOOK - Awaiting Stock' and serial_obj:
                instance.booked_device_serial = serial_obj
                instance.trial_decision = 'BOOK - Device Allocated'
                instance.save()
                # Create purchase record
                unit_price = instance.booked_device_inventory.unit_price
                PatientPurchase.objects.create(
                    clinic=instance.clinic,
                    patient=instance.assigned_patient,
                    visit=instance.visit,
                    inventory_item=instance.booked_device_inventory,
                    inventory_serial=serial_obj,
                    quantity=1,
                    unit_price=unit_price,
                    total_price=unit_price
                )
                # Update inventory
                serial_obj.status = 'Sold'
                serial_obj.save()
                instance.booked_device_inventory.update_quantity_from_serials()
                # Create bill for device purchase
                bill, created = Bill.objects.get_or_create(
                    visit=instance.visit,
                    defaults={
                        'clinic': instance.clinic,
                        'created_by': request.user,
                    }
                )
                BillItem.objects.create(
                    bill=bill,
                    item_type='Purchase',
                    description=f"Purchase of {instance.booked_device_inventory.product_name} ({instance.booked_device_inventory.brand} {instance.booked_device_inventory.model_type}) - Serial: {booked_device_serial}",
                    cost=unit_price,
                    quantity=1,
                )
                bill.calculate_total()
                instance.visit.status = 'Book - Device Allocated'
                instance.visit.status_note = 'Trial completed , Device Allocated for booking'
                instance.visit.save()
        return Response({
            "status": "success",
            "message": f"Serial number {booked_device_serial} allocated successfully and trial updated to BOOK - Device Allocated."
        })



       
    
    