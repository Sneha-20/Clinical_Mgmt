from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db import transaction
from django.utils import timezone
from .models import Bill, BillItem, InventoryItem, PatientPurchase
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
                    # custom_price = item_data.get('custom_price')  # Optional custom price
                    
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

                    # Check stock availability
                    if inventory_item.quantity_in_stock < quantity:
                        return Response({
                            'status': status.HTTP_400_BAD_REQUEST,
                            'error': f'Insufficient stock for {inventory_item.product_name}. Available: {inventory_item.quantity_in_stock}, Requested: {quantity}'
                        }, status=status.HTTP_400_BAD_REQUEST)

                    # Calculate price
                    unit_price = inventory_item.unit_price
                    total_price = unit_price * quantity
                    
                    # Create bill item
                    bill_item = BillItem.objects.create(
                        bill=bill,
                        item_type='Purchase',
                        description=f"Purchase - {inventory_item.product_name}",
                        cost=unit_price,
                        quantity=quantity,
                    )
                    created_items.append(bill_item)

                    # Create purchase history record
                    purchase = PatientPurchase.objects.create(
                        patient=bill.visit.patient,
                        clinic=bill.clinic,
                        visit=bill.visit,
                        inventory_item_id=inventory_item_id,
                        quantity=quantity,
                        unit_price=unit_price,
                        total_price=total_price,
                        purchased_at=timezone.now(),
                        # created_by=request.user
                    )
                    created_purchases.append(purchase)

                    # Update inventory stock
                    inventory_item.quantity_in_stock -= quantity
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
