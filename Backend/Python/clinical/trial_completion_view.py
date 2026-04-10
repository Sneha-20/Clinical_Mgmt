from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.db.models import F
from django.utils import timezone
from .models import Trial, InventoryItem, InventorySerial, PatientPurchase, Bill, BillItem, BookedDeviceAfterTrial
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
                
                # Handle different decision scenarios using BookedDeviceAfterTrial
                booked_devices = serializer.validated_data.get('booked_devices', [])

                # Only require booked_devices when actually booking devices
                if trial_decision == 'BOOKED':
                    if not booked_devices:
                        return Response({
                            "status": "error",
                            "message": "booked_devices array is required when booking devices"
                        }, status=status.HTTP_400_BAD_REQUEST)

                booked_device_records = []
                allocated_devices = []
                awaiting_stock_devices = []
                customization_devices = []

                if trial_decision == 'BOOKED' and booked_devices:
                    for device_data in booked_devices:
                        ear_side = device_data.get('ear_side')
                        inventory_item_id = device_data.get('inventory_item_id')
                        serial_number = device_data.get('serial_number')
                        device_trial_decision = device_data.get('booking_status', 'BOOK - Device Allocated')

                        # Validate inventory item exists
                        try:
                            inventory_item = InventoryItem.objects.get(id=inventory_item_id)
                        except InventoryItem.DoesNotExist:
                            return Response({
                                "status": "error",
                                "message": f"Inventory item with ID {inventory_item_id} not found"
                            }, status=status.HTTP_400_BAD_REQUEST)

                        # Handle serial number for serialized items
                        serial_obj = None
                        if inventory_item.stock_type == 'Serialized' and serial_number:
                            try:
                                serial_obj = InventorySerial.objects.get(
                                    serial_number=serial_number,
                                    inventory_item=inventory_item,
                                    status='In Stock'
                                )
                            except InventorySerial.DoesNotExist:
                                return Response({
                                    "status": "error",
                                    "message": f"Serial number {serial_number} is not available in stock for selected inventory item."
                                }, status=status.HTTP_400_BAD_REQUEST)

                        # Create BookedDeviceAfterTrial record
                        booked_device = BookedDeviceAfterTrial.objects.create(
                            trial=trial,
                            inventory_item=inventory_item,
                            serial_number=serial_obj,
                            ear_side=ear_side,
                            booking_status=device_trial_decision
                        )

                        booked_device_records.append(booked_device)

                        # Categorize devices by decision
                        if device_trial_decision == 'BOOK - Device Allocated':
                            allocated_devices.append(booked_device)

                            # Create purchase record
                            PatientPurchase.objects.create(
                                clinic=trial.clinic,
                                patient=trial.assigned_patient,
                                visit=trial.visit,
                                inventory_item=inventory_item,
                                inventory_serial=serial_obj,
                                quantity=1,
                                unit_price=inventory_item.unit_price,
                                total_price=inventory_item.unit_price,
                                ear_side=ear_side
                            )

                            # Update inventory
                            if serial_obj:
                                serial_obj.status = 'Sold'
                                serial_obj.save()
                                inventory_item.update_quantity_from_serials()
                            else:
                                inventory_item.quantity_in_stock -= 1
                                inventory_item.save()

                        elif device_trial_decision == 'BOOK - Awaiting Stock':
                            awaiting_stock_devices.append(booked_device)

                        elif device_trial_decision == 'BOOK - With Customization':
                            # saved the is_customization_needed in BookedDeviceAfterTrial
                            booked_device.is_customization_needed = True
                            booked_device.save()
                            customization_devices.append(booked_device)

                            # Create purchase record
                            PatientPurchase.objects.create(
                                clinic=trial.clinic,
                                patient=trial.assigned_patient,
                                visit=trial.visit,
                                inventory_item=inventory_item,
                                inventory_serial=serial_obj,
                                quantity=1,
                                unit_price=inventory_item.unit_price,
                                total_price=inventory_item.unit_price,
                                ear_side=ear_side
                            )

                            # Update inventory
                            if serial_obj:
                                serial_obj.status = 'Sold'
                                serial_obj.save()
                                inventory_item.update_quantity_from_serials()
                            else:
                                inventory_item.quantity_in_stock -= 1
                                inventory_item.save()

                if trial_decision == 'BOOKED':
                    # Create bill for device purchases (allocated and customization devices)
                    billable_devices = allocated_devices + customization_devices
                    if billable_devices:
                        # Calculate total GST amount from all billable devices
                        total_gst_amount = sum(device.inventory_item.gst_value for device in billable_devices)

                        bill, created = Bill.objects.get_or_create(
                            visit=trial.visit,
                            defaults={
                                'clinic': trial.clinic,
                                'created_by': request.user,
                                'gst_amount': total_gst_amount,
                            }
                        )

                        if not created:
                            Bill.objects.filter(id=bill.id).update(
                                gst_amount=total_gst_amount
                            )
                            bill.refresh_from_db()

                        # Add bill items for each billable device
                        for booked_device in billable_devices:
                            device_desc = f"Purchase - {booked_device.inventory_item.product_name} ({booked_device.inventory_item.brand} {booked_device.inventory_item.model_type.name or ''}) - {booked_device.ear_side} Ear"
                            if booked_device.serial_number:
                                device_desc += f" - Serial: {booked_device.serial_number.serial_number}"
                            if booked_device.booking_status == 'BOOK - With Customization':
                                device_desc += " - With Customization"

                            BillItem.objects.create(
                                bill=bill,
                                item_type='Purchase',
                                description=device_desc,
                                cost=booked_device.inventory_item.unit_price,
                                quantity=1,
                            )

                        # Recalculate bill totals
                        bill.calculate_total()

                    # Determine overall trial status based on device decisions
                    if customization_devices:
                        trial.visit.status = 'Book - With Customization'
                        trial.visit.status_note = f'Trial completed, {len(customization_devices)} device(s) with customization'
                    elif awaiting_stock_devices and not allocated_devices:
                        trial.visit.status = 'Book - Awaiting Stock'
                        trial.visit.status_note = f'Trial completed, {len(awaiting_stock_devices)} device(s) awaiting stock'
                    elif allocated_devices and not awaiting_stock_devices:
                        trial.visit.status = 'Book - Device Allocated'
                        trial.visit.status_note = f'Trial completed, {len(allocated_devices)} device(s) allocated for booking'
                    else:
                        # Mixed scenario
                        trial.visit.status = 'Book - Mixed Status'
                        trial.visit.status_note = f'Trial completed - Mixed: {len(allocated_devices)} allocated, {len(awaiting_stock_devices)} awaiting stock, {len(customization_devices)} with customization'

                elif trial_decision == 'TRIAL_ACTIVE':
                    # Scenario 2: Patient needs time (2-3 days) for decision - followup
                    trial.visit.status = 'Trial Active'
                    trial.extended_trial = True
                    trial.visit.status_note = 'Trial extended for booking device decision'
                    trial.extended_at = timezone.now()
                    trial.trial_end_date = timezone.now() + timedelta(days=followup_days)
                    trial.followup_date = timezone.now() + timedelta(days=followup_days + 1)

                elif trial_decision == 'DECLINE':
                    # Scenario 3: Patient doesn't need new device anymore
                    trial.visit.status = 'Trial Completed - No Device'
                    trial.visit.status_note = 'Trial completed , Device not booked'
                    # No followup needed, trial is complete

                trial.visit.save()
                trial.save()
        
                # # Prepare response data with booked devices information
                # response_data = {
                #     "trial_id": trial.id,
                #     "trial_decision": trial_decision,
                #     "booked_devices": []
                # }
                
                # for booked_device in booked_device_records:
                #     device_status = "Allocated"
                #     if booked_device.booking_status == 'BOOK - Awaiting Stock':
                #         device_status = "Awaiting Stock"
                #     elif booked_device.booking_status == 'BOOK - With Customization':
                #         device_status = "With Customization"
                    
                #     response_data["booked_devices"].append({
                #         "ear_side": booked_device.ear_side,
                #         "inventory_item_id": booked_device.inventory_item.id,
                #         "serial_number": booked_device.serial_number.serial_number if booked_device.serial_number else None,
                #         "booking_status": booked_device.booking_status,
                #         "device_name": booked_device.inventory_item.product_name,
                #         "status": device_status
                #     })
                
                # Add summary
                # response_data["summary"] = {
                #     "total_devices": len(booked_device_records),
                #     "allocated_devices": len(allocated_devices),
                #     "awaiting_stock_devices": len(awaiting_stock_devices),
                #     "customization_devices": len(customization_devices)
                # }
                
                return Response({
                    "status": "success",
                    "message": "Trial Booking status completed successfully",
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
        clinic = getattr(self.request.user, 'clinic', None)
        queryset = BookedDeviceAfterTrial.objects.filter(booking_status__in=['BOOK - Awaiting Stock', 'BOOK - With Customization'])
        if clinic:
            queryset = queryset.filter(trial__clinic=clinic)
        
        # Filter by trial_decision if provided as query parameter
        booking_status = self.request.query_params.get('booking_status', None)
        if booking_status:
            queryset = queryset.filter(booking_status=booking_status)
        
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
    lookup_field = 'id'
    lookup_url_kwarg = 'trial_id'

    def get_queryset(self):
        clinic = getattr(self.request.user, 'clinic', None)
        queryset = Trial.objects.filter(trial_decision='BOOK - Awaiting Stock')
        if clinic:
            queryset = queryset.filter(clinic=clinic)
        return queryset


class AllocateSerialNumber(generics.UpdateAPIView):
    """API endpoint to allocate a serial number to a trial that is awaiting stock."""
    
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'
    lookup_url_kwarg = 'trial_id'

    def get_queryset(self):
        clinic = getattr(self.request.user, 'clinic', None)
        queryset = BookedDeviceAfterTrial.objects.filter(booking_status__in=['BOOK - Awaiting Stock', 'BOOK - With Customization'])
        if clinic:
            queryset = queryset.filter(trial__clinic=clinic)
        return queryset

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        booking_status = instance.booking_status
        booked_device_serial = request.data.get('booked_device_serial')
        is_customization_completed = request.data.get('is_customization_completed', False)
        serial_obj = None
        
        with transaction.atomic():
            # For serialized items, validate serial number exists and is in stock
            if instance.inventory_item.stock_type == 'Serialized' and booked_device_serial:
                try:
                    from .models import InventorySerial
                    serial_obj = InventorySerial.objects.get(
                        serial_number=booked_device_serial,
                        inventory_item=instance.inventory_item,
                        status='In Stock'
                    )
                except InventorySerial.DoesNotExist:
                    return Response({
                        "status": "error",
                        "message": f"Serial number {booked_device_serial} is not available in stock for the selected inventory item."
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Handle different booking statuses
            if booking_status == 'BOOK - Awaiting Stock' and serial_obj:
                # Update booked device with allocated serial
                instance.serial_number = serial_obj
                instance.booking_status = 'BOOK - Device Allocated'
                instance.save()
                
                # Create purchase record
                unit_price = instance.inventory_item.unit_price
                PatientPurchase.objects.create(
                    clinic=instance.trial.clinic,
                    patient=instance.trial.assigned_patient,
                    visit=instance.trial.visit,
                    inventory_item=instance.inventory_item,
                    inventory_serial=serial_obj,
                    quantity=1,
                    unit_price=unit_price,
                    total_price=unit_price,
                    ear_side=instance.ear_side
                )
                # Update inventory
                serial_obj.status = 'Sold'
                serial_obj.save()
                instance.inventory_item.update_quantity_from_serials()
                # Create bill for device purchase
                bill, created = Bill.objects.get_or_create(
                    visit=instance.trial.visit,
                    defaults={
                        'clinic': instance.trial.clinic,
                        'created_by': request.user,
                    }
                )
                BillItem.objects.create(
                    bill=bill,
                    item_type='Purchase',
                    description=f"Purchase of {instance.inventory_item.product_name} ({instance.inventory_item.brand} {instance.inventory_item.model_type}) - Serial: {booked_device_serial}",
                    cost=unit_price,
                    quantity=1,
                )
                bill.calculate_total()
                instance.trial.visit.status = 'Book - Device Allocated'
                instance.trial.visit.status_note = 'Trial completed , Device Allocated for booking'
                instance.trial.visit.save()
                
            elif booking_status == 'BOOK - With Customization':
                # Handle completion notes for customization trials
                if is_customization_completed:
                    instance.is_customization_completed = is_customization_completed
                    instance.is_customization_needed = False
                    instance.booking_status = 'BOOK - Device Allocated'
                    instance.save()
                    
                    # Create purchase record if not already created
                    if not PatientPurchase.objects.filter(visit=instance.trial.visit, inventory_item=instance.inventory_item).exists():
                        unit_price = instance.inventory_item.unit_price
                        PatientPurchase.objects.create(
                            clinic=instance.trial.clinic,
                            patient=instance.trial.assigned_patient,
                            visit=instance.trial.visit,
                            inventory_item=instance.inventory_item,
                            inventory_serial=serial_obj if serial_obj else None,
                            quantity=1,
                            unit_price=unit_price,
                            total_price=unit_price,
                            ear_side=instance.ear_side,
                        )
                        
                        # Create bill for device purchase
                        bill, created = Bill.objects.get_or_create(
                            visit=instance.visit,
                            defaults={
                                'clinic': instance.clinic,
                                'created_by': request.user,
                                'gst_amount': instance.inventory_item.gst_value,
                            }
                        )
                        if not created:
                            Bill.objects.filter(id=bill.id).update(
                                gst_amount=instance.inventory_item.gst_value
                            )
                            bill.refresh_from_db()
                        
                        # Add bill item for device with customization
                        BillItem.objects.create(
                            bill=bill,
                            item_type='Purchase',
                            description=f"Purchase of {instance.inventory_item.product_name} ({instance.inventory_item.brand} {instance.inventory_item.model_type}) - With Customization",
                            cost=unit_price,
                            quantity=1,
                        )
                        bill.calculate_total()
                        
                        # Update inventory if serial allocated
                        if serial_obj:
                            serial_obj.status = 'Sold'
                            serial_obj.save()
                            instance.inventory_serial = serial_obj
                            instance.inventory_item.update_quantity_from_serials()
                    
                    instance.trial.visit.status = 'Book - Device Allocated'
                    instance.trial.visit.status_note = 'Trial completed , Device Allocated with customization'
                    instance.trial.visit.save()
                
        return Response({
            "status": "success",
            "message": f"Processing Completed and trial updated to BOOK - Device Allocated."
        })

       
    
    