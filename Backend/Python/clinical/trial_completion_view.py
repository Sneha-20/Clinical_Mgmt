from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.db.models import F
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
                    # Scenario1: Patient wants to book devices (array format only)
                    booked_devices = serializer.validated_data.get('booked_devices', [])
                    
                    if not booked_devices:
                        return Response({
                            "status": "error",
                            "message": "booked_devices array is required when booking devices"
                        }, status=status.HTTP_400_BAD_REQUEST)
                    
                    # Process devices from array format and update trial with bilateral fields
                    left_device_data = None
                    right_device_data = None
                    
                    for device_data in booked_devices:
                        ear_side = device_data.get('ear_side')
                        
                        if ear_side == 'LEFT':
                            left_device_data = device_data
                        elif ear_side == 'RIGHT':
                            right_device_data = device_data
                    
                    # Update trial with bilateral booking fields
                    if left_device_data:
                        inventory_item_left = InventoryItem.objects.get(id=left_device_data['booked_device_inventory'])
                        serial_obj_left = None
                        
                        # Handle serial number for serialized items
                        if inventory_item_left.stock_type == 'Serialized' and left_device_data.get('booked_device_serial'):
                            try:
                                serial_obj_left = InventorySerial.objects.get(
                                    serial_number=left_device_data['booked_device_serial'],
                                    inventory_item=inventory_item_left,
                                    status='In Stock'
                                )
                            except InventorySerial.DoesNotExist:
                                return Response({
                                    "status": "error",
                                    "message": f"Serial number {left_device_data['booked_device_serial']} is not available in stock for selected inventory item."
                                }, status=status.HTTP_400_BAD_REQUEST)
                        
                        # Update trial fields
                        trial.booked_device_inventory_left = inventory_item_left
                        trial.booked_device_serial_left = serial_obj_left
                        
                        # Create purchase record for left ear
                        PatientPurchase.objects.create(
                            clinic=trial.clinic,
                            patient=trial.assigned_patient,
                            visit=trial.visit,
                            inventory_item=inventory_item_left,
                            inventory_serial=serial_obj_left,
                            quantity=1,
                            unit_price=inventory_item_left.unit_price,
                            total_price=inventory_item_left.unit_price,
                            ear_side='LEFT'
                        )
                        
                        # Update inventory
                        if serial_obj_left:
                            serial_obj_left.status = 'Sold'
                            serial_obj_left.save()
                            inventory_item_left.update_quantity_from_serials()
                        else:
                            inventory_item_left.quantity_in_stock -= 1
                            inventory_item_left.save()
                    
                    if right_device_data:
                        inventory_item_right = InventoryItem.objects.get(id=right_device_data['booked_device_inventory'])
                        serial_obj_right = None
                        
                        # Handle serial number for serialized items
                        if inventory_item_right.stock_type == 'Serialized' and right_device_data.get('booked_device_serial'):
                            try:
                                serial_obj_right = InventorySerial.objects.get(
                                    serial_number=right_device_data['booked_device_serial'],
                                    inventory_item=inventory_item_right,
                                    status='In Stock'
                                )
                            except InventorySerial.DoesNotExist:
                                return Response({
                                    "status": "error",
                                    "message": f"Serial number {right_device_data['booked_device_serial']} is not available in stock for selected inventory item."
                                }, status=status.HTTP_400_BAD_REQUEST)
                        
                        # Update trial fields
                        trial.booked_device_inventory_right = inventory_item_right
                        trial.booked_device_serial_right = serial_obj_right
                        # trial.need_customization_right = right_device_data.get('need_customization_right', '') != ''
                        
                        # Create purchase record for right ear
                        PatientPurchase.objects.create(
                            clinic=trial.clinic,
                            patient=trial.assigned_patient,
                            visit=trial.visit,
                            inventory_item=inventory_item_right,
                            inventory_serial=serial_obj_right,
                            quantity=1,
                            unit_price=inventory_item_right.unit_price,
                            total_price=inventory_item_right.unit_price,
                            ear_side='RIGHT'
                        )
                        
                        # Update inventory
                        if serial_obj_right:
                            serial_obj_right.status = 'Sold'
                            serial_obj_right.save()
                            inventory_item_right.update_quantity_from_serials()
                        else:
                            inventory_item_right.quantity_in_stock -= 1
                            inventory_item_right.save()
                    
                    # Create bill for device purchases
                    bill, created = Bill.objects.get_or_create(
                        visit=trial.visit,
                        defaults={
                            'clinic': trial.clinic,
                            'created_by': request.user,
                            'gst_amount': inventory_item_left.gst_value if left_device_data else (inventory_item_right.gst_value if right_device_data else 0),
                        }
                    )

                    if not created and (left_device_data or right_device_data):
                        primary_inventory = left_device_data['booked_device_inventory'] if left_device_data else right_device_data['booked_device_inventory']
                        primary_inventory_obj = InventoryItem.objects.get(id=primary_inventory)
                        Bill.objects.filter(id=bill.id).update(
                            gst_amount=primary_inventory_obj.gst_value
                        )
                        bill.refresh_from_db()

                    # Add bill items for each device
                    if left_device_data:
                        device_desc = f" Purchase - {inventory_item_left.product_name} ({inventory_item_left.brand} {inventory_item_left.model_type.name or ''}) - LEFT Ear"
                        if serial_obj_left:
                            device_desc += f" - Serial: {serial_obj_left.serial_number}"
                        
                        
                        BillItem.objects.create(
                            bill=bill,
                            item_type='Purchase',
                            description=device_desc,
                            cost=inventory_item_left.unit_price,
                            quantity=1,
                        )
                    
                    if right_device_data:
                        device_desc = f"Purchase - {inventory_item_right.product_name} ({inventory_item_right.brand} {inventory_item_right.model_type.name or ''}) - RIGHT Ear"
                        if serial_obj_right:
                            device_desc += f" - Serial: {serial_obj_right.serial_number}"
                        
                        
                        BillItem.objects.create(
                            bill=bill,
                            item_type='Purchase',
                            description=device_desc,
                            cost=inventory_item_right.unit_price,
                            quantity=1,
                        )
                    
                    # Recalculate bill totals
                    bill.calculate_total()
                    
                    # Update visit status
                    device_count = (1 if left_device_data else 0) + (1 if right_device_data else 0)
                    trial.visit.status = 'Book - Device Allocated'
                    trial.visit.status_note = f'Trial completed, {device_count} device(s) allocated for booking'
                    trial.visit.save()
                    trial.save()

                elif trial_decision == 'BOOK - Awaiting Stock':
                    # Handle awaiting stock for multiple devices
                    booked_devices = serializer.validated_data.get('booked_devices', [])
                    
                    if not booked_devices:
                        return Response({
                            "status": "error",
                            "message": "booked_devices array is required when booking devices"
                        }, status=status.HTTP_400_BAD_REQUEST)
                    
                    # Process awaiting stock devices
                    left_device_data = None
                    right_device_data = None
                    
                    for device_data in booked_devices:
                        ear_side = device_data.get('ear_side')
                        
                        if ear_side == 'LEFT':
                            left_device_data = device_data
                        elif ear_side == 'RIGHT':
                            right_device_data = device_data
                    
                    # Update trial with bilateral booking fields
                    if left_device_data:
                        inventory_item_left = InventoryItem.objects.get(id=left_device_data['booked_device_inventory'])
                        trial.booked_device_inventory_left = inventory_item_left
                        # trial.customization_notes_left = left_device_data.get('need_customization_left', '')
                    
                    if right_device_data:
                        inventory_item_right = InventoryItem.objects.get(id=right_device_data['booked_device_inventory'])
                        trial.booked_device_inventory_right = inventory_item_right
                        # trial.customization_notes_right = right_device_data.get('need_customization_right', '')
                    
                    # Update visit status
                    device_count = (1 if left_device_data else 0) + (1 if right_device_data else 0)
                    trial.visit.status = 'Book - Awaiting Stock'
                    trial.visit.status_note = f'Trial completed, Awaiting stock for {device_count} device(s)'
                    trial.visit.save()
                    trial.save()

                elif trial_decision == 'BOOK - With Customization':
                    # Handle customization for multiple devices
                    booked_devices = serializer.validated_data.get('booked_devices', [])
                    
                    if not booked_devices:
                        return Response({
                            "status": "error",
                            "message": "booked_devices array is required when booking devices"
                        }, status=status.HTTP_400_BAD_REQUEST)
                    
                    # Process customization devices
                    left_device_data = None
                    right_device_data = None
                    
                    for device_data in booked_devices:
                        ear_side = device_data.get('ear_side')
                        
                        if ear_side == 'LEFT':
                            left_device_data = device_data
                        elif ear_side == 'RIGHT':
                            right_device_data = device_data
                    
                    # Update trial with bilateral booking fields
                    if left_device_data:
                        inventory_item_left = InventoryItem.objects.get(id=left_device_data['booked_device_inventory'])
                        serial_obj_left = None
                        
                        # Handle serial number for serialized items
                        if inventory_item_left.stock_type == 'Serialized' and left_device_data.get('booked_device_serial'):
                            try:
                                serial_obj_left = InventorySerial.objects.get(
                                    serial_number=left_device_data['booked_device_serial'],
                                    inventory_item=inventory_item_left,
                                    status='In Stock'
                                )
                            except InventorySerial.DoesNotExist:
                                return Response({
                                    "status": "error",
                                    "message": f"Serial number {left_device_data['booked_device_serial']} is not available in stock for the selected inventory item."
                                }, status=status.HTTP_400_BAD_REQUEST)
                        
                        # Update trial fields
                        trial.booked_device_inventory_left = inventory_item_left
                        trial.booked_device_serial_left = serial_obj_left
                        trial.need_customization_left = True
                        # trial.customization_notes_left = left_device_data.get('need_customization_left', '')
                        
                        # Create purchase record for left ear
                        PatientPurchase.objects.create(
                            clinic=trial.clinic,
                            patient=trial.assigned_patient,
                            visit=trial.visit,
                            inventory_item=inventory_item_left,
                            inventory_serial=serial_obj_left,
                            quantity=1,
                            unit_price=inventory_item_left.unit_price,
                            total_price=inventory_item_left.unit_price,
                            ear_side='LEFT'
                        )
                        
                        # Update inventory
                        if serial_obj_left:
                            serial_obj_left.status = 'Customization In Progress'
                            serial_obj_left.save()
                            inventory_item_left.update_quantity_from_serials()
                        else:
                            inventory_item_left.quantity_in_stock -= 1
                            inventory_item_left.save()
                    
                    if right_device_data:
                        inventory_item_right = InventoryItem.objects.get(id=right_device_data['booked_device_inventory'])
                        serial_obj_right = None
                        
                        # Handle serial number for serialized items
                        if inventory_item_right.stock_type == 'Serialized' and right_device_data.get('booked_device_serial'):
                            try:
                                serial_obj_right = InventorySerial.objects.get(
                                    serial_number=right_device_data['booked_device_serial'],
                                    inventory_item=inventory_item_right,
                                    status='In Stock'
                                )
                            except InventorySerial.DoesNotExist:
                                return Response({
                                    "status": "error",
                                    "message": f"Serial number {right_device_data['booked_device_serial']} is not available in stock for the selected inventory item."
                                }, status=status.HTTP_400_BAD_REQUEST)
                        
                        # Update trial fields
                        trial.booked_device_inventory_right = inventory_item_right
                        trial.booked_device_serial_right = serial_obj_right
                        trial.need_customization_right = True
                        # trial.customization_notes_right = right_device_data.get('customization_notes_right', '')
                        
                        # Create purchase record for right ear
                        PatientPurchase.objects.create(
                            clinic=trial.clinic,
                            patient=trial.assigned_patient,
                            visit=trial.visit,
                            inventory_item=inventory_item_right,
                            inventory_serial=serial_obj_right,
                            quantity=1,
                            unit_price=inventory_item_right.unit_price,
                            total_price=inventory_item_right.unit_price,
                            ear_side='RIGHT'
                        )
                        
                        # Update inventory
                        if serial_obj_right:
                            serial_obj_right.status = 'Customization In Progress'
                            serial_obj_right.save()
                            inventory_item_right.update_quantity_from_serials()
                        else:
                            inventory_item_right.quantity_in_stock -= 1
                            inventory_item_right.save()
                    
                    # Update visit status
                    device_count = (1 if left_device_data else 0) + (1 if right_device_data else 0)
                    trial.visit.status = 'Book - With Customization'
                    trial.visit.status_note = f'Trial completed, {device_count} device(s) booked with customization'
                    trial.need_customization = serializer.validated_data.get('need_customization', False)
                    trial.visit.save()
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
                    left_device = trial.booked_device_inventory_left
                    right_device = trial.booked_device_inventory_right
                    device_name = left_device.product_name if left_device else (right_device.product_name if right_device else 'N/A')
                    message = f"Trial completed successfully. Device booked: {device_name}"
                
                elif trial_decision == 'BOOK - Awaiting Stock':
                    left_device = trial.booked_device_inventory_left
                    right_device = trial.booked_device_inventory_right
                    device_name = left_device.product_name if left_device else (right_device.product_name if right_device else 'N/A')
                    message = f"Trial completed successfully. Awaiting stock for booked device: {device_name}"
                elif trial_decision == 'TRIAL ACTIVE':
                    message = f"Trial completed successfully. Follow-up scheduled in {followup_days} days."
                elif trial_decision == 'BOOK - With Customization':
                    message = "Trial completed successfully. Device booked with customization"
                elif trial_decision == 'DECLINE':
                    message = "Trial completed successfully. Patient declined device booking."
                
                return Response({
                    "status": "success",
                    "message": message
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
        queryset = Trial.objects.filter(trial_decision__in=['BOOK - Awaiting Stock', 'BOOK - With Customization'])
        
        # Filter by trial_decision if provided as query parameter
        trial_decision = self.request.query_params.get('trial_decision', None)
        if trial_decision:
            queryset = queryset.filter(trial_decision=trial_decision)
        
        return queryset
    
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
    queryset = Trial.objects.filter(trial_decision__in=['BOOK - Awaiting Stock', 'BOOK - With Customization'])
    lookup_field = 'id'
    lookup_url_kwarg = 'trial_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        trial_decision = instance.trial_decision
        booked_device_serial = request.data.get('booked_device_serial')
        is_customization_completed = request.data.get('is_customization_completed',False)
        serial_obj = None
        with transaction.atomic():
            # For serialized items, validate the serial number exists and is in stock
            if instance.booked_device_inventory.stock_type == 'Serialized':
                try:
                    from .models import InventorySerial
                    serial_obj = InventorySerial.objects.get(
                        serial_number=booked_device_serial_left,
                        inventory_item=instance.booked_device_inventory,
                        status='In Stock'
                    )
                except InventorySerial.DoesNotExist:
                    return Response({
                        "status": "error",
                        "message": f"Serial number {booked_device_serial} is not available in stock for the selected inventory item."
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Handle different trial decisions
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
                
            elif trial_decision == 'BOOK - With Customization':
                # Handle completion notes for customization trials
                if is_customization_completed:
                    instance.is_customization_completed = is_customization_completed
                    instance.need_customization = False
                    instance.trial_decision = 'BOOK - Device Allocated'
                    instance.save()
                    
                    # Create purchase record if not already created
                    if not PatientPurchase.objects.filter(visit=instance.visit, inventory_item=instance.booked_device_inventory).exists():
                        unit_price = instance.booked_device_inventory.unit_price
                        PatientPurchase.objects.create(
                            clinic=instance.clinic,
                            patient=instance.assigned_patient,
                            visit=instance.visit,
                            inventory_item=instance.booked_device_inventory,
                            inventory_serial=serial_obj if serial_obj else None,
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
                                'gst_amount': instance.booked_device_inventory.gst_value,
                            }
                        )
                        if not created:
                            Bill.objects.filter(id=bill.id).update(
                                gst_amount=instance.booked_device_inventory.gst_value
                            )
                            bill.refresh_from_db()
                        
                        # Add bill item for device with customization
                        BillItem.objects.create(
                            bill=bill,
                            item_type='Purchase',
                            description=f"Purchase of {instance.booked_device_inventory.product_name} ({instance.booked_device_inventory.brand} {instance.booked_device_inventory.model_type}) - With Customization",
                            cost=unit_price,
                            quantity=1,
                        )
                        bill.calculate_total()
                        
                        # Update inventory if serial allocated
                        if serial_obj:
                            serial_obj.status = 'Sold'
                            serial_obj.save()
                            instance.booked_device_serial = serial_obj
                            instance.booked_device_inventory.update_quantity_from_serials()
                    
                    instance.visit.status = 'Book - Device Allocated'
                    instance.visit.status_note = 'Trial completed , Device Allocated with customization'
                    instance.visit.save()
                
        return Response({
            "status": "success",
            "message": f"Processing Completed and trial updated to BOOK - Device Allocated."
        })

       
    
    