from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import InventoryItem,InventorySerial
from .serializers import InventoryUpdateItemSerializer
from clinical_be.utils.permission import IsClinicAdmin, AuditorPermission, ReceptionistPermission


class InventoryItemUpdateView(APIView):
    """
    API endpoint to update InventoryItem by ID.
    Accepts PATCH or PUT with fields to update (e.g., quantity_in_stock, location, expiry_date, etc.)
    """
    permission_classes = [permissions.IsAuthenticated, IsClinicAdmin | ReceptionistPermission]

    def _handle_serializer_errors(self, serializer):
        error_message = "An error occurred."
        if isinstance(serializer.errors, dict):
            for field, messages in serializer.errors.items():
                if isinstance(messages, list) and messages:
                    error_message = f"{field.replace('_', ' ').title()}: {messages[0]}"
                    break
        return Response({"status": 400, "error": error_message}, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk, format=None):
        try:
            item = InventoryItem.objects.get(pk=pk)
        except InventoryItem.DoesNotExist:
            return Response({'status': 404, 'error': 'Inventory item not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = InventoryUpdateItemSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'status': 200, 'message': 'Inventory item updated successfully'}, status=status.HTTP_200_OK)
        
        return self._handle_serializer_errors(serializer)

    def put(self, request, pk, format=None):
        try:
            item = InventoryItem.objects.get(pk=pk)
        except InventoryItem.DoesNotExist:
            return Response({'status': 404, 'error': 'Inventory item not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = InventoryUpdateItemSerializer(item, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'status': 200, 'message': 'Inventory item updated successfully'}, status=status.HTTP_200_OK)
        
        return self._handle_serializer_errors(serializer)



# api to create new serial number device for inventory item 
class InventorySerialNumberCreateView(APIView):
    """
    API endpoint to add inventory items (both serialized and non-serialized).
    For serialized items: accepts serial_numbers array
    For non-serialized items: accepts quantity_in_stock
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, format=None):
        try:
            inventory_item_id = request.data.get('inventory_item_id')
            serial_numbers = request.data.get('serial_numbers')
            quantity_in_stock = request.data.get('quantity_in_stock')
            
            if not inventory_item_id:
                return Response({'status': 400, 'error': 'Inventory item ID is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if inventory item exists
            try:
                inventory_item = InventoryItem.objects.get(pk=inventory_item_id)
            except InventoryItem.DoesNotExist:
                return Response({'status': 404, 'error': 'Inventory item not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Handle serialized items
            if inventory_item.stock_type == 'Serialized':
                if not serial_numbers:
                    return Response({'status': 400, 'error': 'Serial numbers are required for serialized items'}, status=status.HTTP_400_BAD_REQUEST)
                
                # Handle both single string and list of serial numbers
                if isinstance(serial_numbers, str):
                    serial_numbers = [serial_numbers]
                elif not isinstance(serial_numbers, list):
                    return Response({'status': 400, 'error': 'Serial numbers must be a string or list'}, status=status.HTTP_400_BAD_REQUEST)
                
                # Check for duplicate serial numbers
                existing_serials = InventorySerial.objects.filter(
                    serial_number__in=[sn.strip() for sn in serial_numbers if sn.strip()]
                ).values_list('serial_number', flat=True)
                
                if existing_serials:
                    return Response({
                        'status': 400, 
                        'error': f'Duplicate serial numbers found: {", ".join(existing_serials)}'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Create serial number devices for each serial number
                created_serials = []
                for serial_number in serial_numbers:
                    if not serial_number.strip():
                        continue  # Skip empty serial numbers
                    
                    # Create serial number device with "In Stock" status
                    serial_device = InventorySerial.objects.create(
                        inventory_item=inventory_item,
                        serial_number=serial_number.strip(),
                        status='In Stock'
                    )
                    created_serials.append(serial_number.strip())
                
                if not created_serials:
                    return Response({'status': 400, 'error': 'No valid serial numbers provided'}, status=status.HTTP_400_BAD_REQUEST)
                
                # Update inventory item quantity_in_stock
                inventory_item.quantity_in_stock += len(created_serials)
                inventory_item.save()
                
                return Response({
                    'status': 201, 
                    'message': f'{len(created_serials)} serial number devices created successfully and stock quantity updated',
                    'created_serials': created_serials,
                    'new_stock_quantity': inventory_item.quantity_in_stock
                }, status=status.HTTP_201_CREATED)
            
            # Handle non-serialized items
            elif inventory_item.stock_type == 'Non-Serialized':
                if quantity_in_stock is None:
                    return Response({'status': 400, 'error': 'Quantity in stock is required for non-serialized items'}, status=status.HTTP_400_BAD_REQUEST)
                
                try:
                    quantity_to_add = int(quantity_in_stock)
                    if quantity_to_add <= 0:
                        return Response({'status': 400, 'error': 'Quantity must be a positive number'}, status=status.HTTP_400_BAD_REQUEST)
                except (ValueError, TypeError):
                    return Response({'status': 400, 'error': 'Invalid quantity format'}, status=status.HTTP_400_BAD_REQUEST)
                
                # Update inventory item quantity
                inventory_item.quantity_in_stock += quantity_to_add
                inventory_item.save()
                
                return Response({
                    'status': 201, 
                    'message': f'{quantity_to_add} items added to stock successfully',
                    'quantity_added': quantity_to_add,
                    'new_stock_quantity': inventory_item.quantity_in_stock
                }, status=status.HTTP_201_CREATED)
            
            else:
                return Response({'status': 400, 'error': 'Invalid stock type for inventory item'}, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            return Response({'status': 500, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 
