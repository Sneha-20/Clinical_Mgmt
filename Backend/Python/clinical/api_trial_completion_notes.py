from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Trial, InventoryItem, PatientPurchase, Bill, BillItem
from .serializers import TrialCompletionNotesUpdateSerializer


class TrialCompletionNotesUpdateView(generics.UpdateAPIView):
    """
    API endpoint to update completion notes for trials with BOOK - With Customization decision.
    """
    
    permission_classes = [IsAuthenticated]
    queryset = Trial.objects.filter(trial_decision='BOOK - With Customization')
    lookup_field = 'id'
    lookup_url_kwarg = 'trial_id'
    
    def update(self, request, *args, **kwargs):
        """Update completion notes for a trial"""
        instance = self.get_object()
        
        # Validate that this is a customization trial
        if instance.trial_decision != 'BOOK - With Customization':
            return Response({
                "status": "error",
                "message": "This endpoint is only for trials with 'BOOK - With Customization' decision"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get completion notes from request
        completion_notes = request.data.get('completion_notes')
        if completion_notes is None:
            return Response({
                "status": "error",
                "message": "completion_notes field is required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update the trial
        instance.return_notes = completion_notes
        instance.trial_decision = 'BOOK - Device Allocated'
        instance.save()
        
        # Get inventory item for bill and purchase creation
        inventory_item = instance.booked_device_inventory
        if not inventory_item:
            return Response({
                "status": "error",
                "message": "No booked device inventory found for this trial"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create purchase record
        unit_price = inventory_item.unit_price
        PatientPurchase.objects.create(
            clinic=instance.clinic,
            patient=instance.assigned_patient,
            visit=instance.visit,
            inventory_item=inventory_item,
            inventory_serial=instance.booked_device_serial,
            quantity=1,
            unit_price=unit_price,
            total_price=unit_price
        )
        
        # Create bill for device purchase
        bill, created = Bill.objects.get_or_create(
            visit=instance.visit,
            defaults={
                'clinic': instance.clinic,
                'created_by': request.user,
                'gst_amount': inventory_item.gst_value,
            }
        )

        if not created:
            Bill.objects.filter(id=bill.id).update(
                gst_amount=inventory_item.gst_value
            )
            bill.refresh_from_db()
        
        # Add bill item for device with customization
        BillItem.objects.create(
            bill=bill,
            item_type='Purchase',
            description=f"Purchase of {inventory_item.product_name} ({inventory_item.brand} {inventory_item.model_type}) - With Customization",
            cost=unit_price,
            quantity=1,
        )
        
        # Recalculate bill totals
        bill.calculate_total()
        
        
        return Response({
            "status": "success",
            "message": "Completion notes updated successfully",
            "data": {
                "trial_id": instance.id,
                "completion_notes": instance.return_notes,
                "trial_decision": instance.trial_decision
            }
        }, status=status.HTTP_200_OK)
