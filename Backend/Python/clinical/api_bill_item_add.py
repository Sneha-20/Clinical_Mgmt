from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db import transaction
from django.utils import timezone
from .models import Bill, BillItem, InventoryItem, PatientPurchase, InventorySerial
from .serializers import BillItemSerializer, InventoryItemSerializer
from clinical_be.utils.permission import IsClinicAdmin, ReceptionistPermission, ClinicManagerPermission
from decimal import Decimal


class BillItemAddView(APIView):
    """
    API to add inventory products to an existing bill and create purchase history
    """
    permission_classes = [permissions.IsAuthenticated, IsClinicAdmin | ReceptionistPermission | ClinicManagerPermission]

    def post(self, request, format=None):
        try:
            bill_id = request.data.get('bill_id')
            items = request.data.get('items', [])
            
            if not bill_id:
                return Response({
                    'status': status.HTTP_400_BAD_REQUEST,
                    'error': 'Bill ID is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not items:
                return Response({
                    'status': status.HTTP_400_BAD_REQUEST,
                    'error': 'Items list is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Get the bill
            try:
                bill = Bill.objects.get(id=bill_id)
            except Bill.DoesNotExist:
                return Response({
                    'status': status.HTTP_404_NOT_FOUND,
                    'error': 'Bill not found'
                }, status=status.HTTP_404_NOT_FOUND)

            # Check if user has access to this bill
            if (request.user.role.name != 'Admin' and 
                bill.clinic != request.user.clinic and 
                bill.clinic not in request.user.managed_clinics_assignments.values_list('clinic', flat=True)):
                return Response({
                    'status': status.HTTP_403_FORBIDDEN,
                    'error': 'Access denied'
                }, status=status.HTTP_403_FORBIDDEN)

            with transaction.atomic():
                created_items = []
                created_purchases = []
                
                for item_data in items:
                    inventory_item_id = item_data.get('inventory_item_id')
                    quantity = item_data.get('quantity', 1)
                    serial_numbers = item_data.get('serial_numbers', [])
                    
                    if not inventory_item_id:
                        continue
                    
                    # Get inventory item
                    try:
                        inventory_item = InventoryItem.objects.get(
                            id=inventory_item_id, 
                            is_approved=True
                        )
                    except InventoryItem.DoesNotExist:
                        return Response({
                            'status': status.HTTP_400_BAD_REQUEST,
                            'error': f'Inventory item with ID {inventory_item_id} not found'
                        }, status=status.HTTP_400_BAD_REQUEST)

                    # Handle serialized vs non-serialized items
                    if inventory_item.stock_type == 'Serialized':
                        # For serialized items, validate serial numbers
                        if not serial_numbers:
                            return Response({
                                'status': status.HTTP_400_BAD_REQUEST,
                                'error': f'Serial numbers are required for serialized item {inventory_item.product_name}'
                            }, status=status.HTTP_400_BAD_REQUEST)
                        
                        # Check if all serial numbers exist and are in stock
                        available_serials = InventorySerial.objects.filter(
                            inventory_item=inventory_item,
                            serial_number__in=serial_numbers,
                            status='In Stock'
                        )
                        
                        if available_serials.count() != len(serial_numbers):
                            found_serials = list(available_serials.values_list('serial_number', flat=True))
                            missing_serials = [sn for sn in serial_numbers if sn not in found_serials]
                            return Response({
                                'status': status.HTTP_400_BAD_REQUEST,
                                'error': f'Serial numbers not available for {inventory_item.product_name}: {missing_serials}'
                            }, status=status.HTTP_400_BAD_REQUEST)
                        
                        # Update serial numbers status to 'Sold'
                        available_serials.update(status='Sold')
                        
                        # Calculate price and quantity
                        actual_quantity = len(serial_numbers)
                        
                    else:
                        # For non-serialized items, validate quantity
                        if inventory_item.quantity_in_stock < quantity:
                            return Response({
                                'status': status.HTTP_400_BAD_REQUEST,
                                'error': f'Insufficient stock for {inventory_item.product_name}. Available: {inventory_item.quantity_in_stock}, Requested: {quantity}'
                            }, status=status.HTTP_400_BAD_REQUEST)
                        
                        actual_quantity = quantity

                    # Calculate price
                    unit_price = inventory_item.unit_price
                    total_price = unit_price * actual_quantity
                    
                    # Create bill item
                    if inventory_item.stock_type == 'Serialized':
                        description = f"Purchase - {inventory_item.product_name} (S/N: {', '.join(serial_numbers)})"
                    else:
                        description = f"Purchase - {inventory_item.product_name}"
                    
                    bill_item = BillItem.objects.create(
                        bill=bill,
                        item_type='Purchase',
                        description=description,
                        cost=unit_price,
                        quantity=actual_quantity,
                    )
                    created_items.append(bill_item)

                   
                
                    # Create purchase history record(s)
                    if inventory_item.stock_type == 'Serialized':
                        # For serialized items, create separate purchase record for each serial number
                        for serial_number in serial_numbers:
                            try:
                                serial_obj = InventorySerial.objects.get(
                                    inventory_item=inventory_item,
                                    serial_number=serial_number
                                )
                                purchase = PatientPurchase.objects.create(
                                    patient=bill.visit.patient,
                                    clinic=bill.clinic,
                                    visit=bill.visit,
                                    inventory_item_id=inventory_item_id,
                                    inventory_serial=serial_obj,
                                    quantity=1,
                                    unit_price=unit_price,
                                    total_price=unit_price,
                                    purchased_at=timezone.now(),
                                    # created_by=request.user
                                )
                                created_purchases.append(purchase)
                            except InventorySerial.DoesNotExist:
                                continue  # Skip if serial not found
                    else:
                        # For non-serialized items, create single purchase record
                        purchase = PatientPurchase.objects.create(
                            patient=bill.visit.patient,
                            clinic=bill.clinic,
                            visit=bill.visit,
                            inventory_item_id=inventory_item_id,
                            quantity=actual_quantity,
                            unit_price=unit_price,
                            total_price=total_price,
                            purchased_at=timezone.now(),
                            # created_by=request.user
                        )
                        created_purchases.append(purchase)

                    # Update inventory stock
                    if inventory_item.stock_type == 'Serialized':
                        # For serialized items, stock is managed by serial status
                        inventory_item.quantity_in_stock = InventorySerial.objects.filter(
                            inventory_item=inventory_item, 
                            status='In Stock'
                        ).count()
                    else:
                        # For non-serialized items, subtract quantity
                        inventory_item.quantity_in_stock -= actual_quantity
                    
                    inventory_item.save()

                # Recalculate bill total
                bill.calculate_total()
                
                return Response({
                    'status': status.HTTP_200_OK,
                    'message': 'Items added to bill successfully',
                    'data': {
                        'bill_items': BillItemSerializer(created_items, many=True).data,
                        'purchase_history': [
                            {
                                'id': p.id,
                                'patient_name': p.patient.name,
                                'product_name': p.inventory_item.product_name if p.inventory_item else 'N/A',
                                'quantity': p.quantity,
                                'unit_price': str(p.unit_price),
                                'total_price': str(p.total_price),
                                'purchased_at': p.purchased_at
                            } for p in created_purchases
                        ]
                    }
                }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
