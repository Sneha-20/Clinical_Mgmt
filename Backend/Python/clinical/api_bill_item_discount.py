from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import BillItem, Bill
from .serializers import BillItemSerializer
from rest_framework.permissions import IsAuthenticated
from django.db import transaction


class BillItemDiscountUpdateView(APIView):
    """
    Update discount amount for a specific BillItem
    """
    permission_classes = [IsAuthenticated]

    def put(self, request, item_id):
        """
        Update discount amount for a BillItem
        """
        try:
            with transaction.atomic():
                # Get the BillItem
                bill_item = get_object_or_404(BillItem, id=item_id)
                
                # Get discount amount from request
                discount_amount = request.data.get('discount_amount')
                # discount_reason = request.data.get('discount_reason', '')
                
                # Validate discount amount
                if discount_amount is None:
                    return Response(
                        {'error': 'discount_amount is required'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                try:
                    discount_amount = float(discount_amount)
                    if discount_amount < 0:
                        return Response(
                            {'error': 'discount_amount cannot be negative'}, 
                            status=status.HTTP_400_BAD_REQUEST
                        )
                except (ValueError, TypeError):
                    return Response(
                        {'error': 'discount_amount must be a valid number'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Check if discount doesn't exceed item total
                item_total = float(bill_item.cost * bill_item.quantity)
                if discount_amount > item_total:
                    return Response(
                        {'error': f'discount_amount ({discount_amount}) cannot exceed item total ({item_total})'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Update the BillItem
                bill_item.discount_amount = discount_amount
                # bill_item.discount_reason = discount_reason
                bill_item.save()
                
                # Recalculate bill total
                bill_item.bill.calculate_total()
                
                # Return updated BillItem
                serializer = BillItemSerializer(bill_item)
                return Response({
                    'message': 'Discount updated successfully',
                    'bill_item': serializer.data
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            return Response(
                {'error': f'Failed to update discount: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class BillItemBulkDiscountUpdateView(APIView):
    """
    Update discount amounts for multiple BillItems at once
    """
    permission_classes = [IsAuthenticated]

    def put(self, request, bill_id):
        """
        Update discount amounts for multiple BillItems in a bill
        """
        try:
            with transaction.atomic():
                # Get the bill
                bill = get_object_or_404(Bill, id=bill_id)
                
                # Get discount updates from request
                discount_updates = request.data.get('discount_updates', [])
                
                if not discount_updates:
                    return Response(
                        {'error': 'discount_updates array is required'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                updated_items = []
                errors = []
                
                for update in discount_updates:
                    item_id = update.get('item_id')
                    discount_amount = update.get('discount_amount')
                    # discount_reason = update.get('discount_reason', '')
                    
                    if not item_id:
                        errors.append('item_id is required')
                        continue
                    
                    if discount_amount is None:
                        errors.append(f'discount_amount is required for item_id {item_id}')
                        continue
                    
                    try:
                        # Get the BillItem
                        bill_item = BillItem.objects.get(id=item_id, bill=bill)
                        
                        # Validate discount amount
                        try:
                            discount_amount = float(discount_amount)
                            if discount_amount < 0:
                                errors.append(f'discount_amount cannot be negative for item_id {item_id}')
                                continue
                        except (ValueError, TypeError):
                            errors.append(f'discount_amount must be a valid number for item_id {item_id}')
                            continue
                        
                        # Check if discount doesn't exceed item total
                        item_total = float(bill_item.cost * bill_item.quantity)
                        if discount_amount > item_total:
                            errors.append(f'discount_amount ({discount_amount}) cannot exceed item total ({item_total}) for item_id {item_id}')
                            continue
                        
                        # Update the BillItem
                        bill_item.discount_amount = discount_amount
                        # bill_item.discount_reason = discount_reason
                        bill_item.save()
                        
                        updated_items.append(bill_item)
                        
                    except BillItem.DoesNotExist:
                        errors.append(f'BillItem with id {item_id} not found in this bill')
                        continue
                
                if errors:
                    return Response({
                        'error': 'Some updates failed',
                        'errors': errors
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Recalculate bill total
                bill.calculate_total()
                
                # Return updated BillItems
                serializer = BillItemSerializer(updated_items, many=True)
                return Response({
                    'message': f'Successfully updated {len(updated_items)} items',
                    'updated_items': serializer.data
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            return Response(
                {'error': f'Failed to update discounts: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
