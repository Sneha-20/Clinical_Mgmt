from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Q
from .models import InventoryItem, InventorySerial
from .serializers import TrialDeviceSerialSerializer, ProductInfoBySerialSerializer


class TrialDeviceSerialListView(generics.ListAPIView):
    """API endpoint for listing serial numbers of trial devices with count > 0."""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get serial numbers for trial devices with available count > 0."""
        return InventorySerial.objects.filter(
            inventory_item__use_in_trial=True,
            status='In Stock'
        ).values('serial_number')
    
    def list(self, request, *args, **kwargs):
        """Return serial numbers grouped by device with counts."""
        queryset = self.get_queryset()
        serial_numbers = [serial['serial_number'] for serial in queryset]
        
        return Response({
            "status": status.HTTP_200_OK,
            "data": serial_numbers
        })


class ProductInfoBySerialView(generics.RetrieveAPIView):
    """API endpoint to get product information by serial number."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProductInfoBySerialSerializer
    
    def get_object(self):
        """Get inventory item and serial info by serial number."""
        serial_number = self.kwargs.get('serial_number')
        
        try:
            serial = InventorySerial.objects.select_related('inventory_item').get(
                serial_number=serial_number
            )
            return serial
        except InventorySerial.DoesNotExist:
            return None
    
    def retrieve(self, request, *args, **kwargs):
        """Get product info by serial number."""
        serial_number = self.kwargs.get('serial_number')
        
        try:
            serial = InventorySerial.objects.select_related('inventory_item').get(
                serial_number=serial_number
            )
            
            product_info = {
                # 'serial_number': serial.serial_number,
                # 'status': serial.status,
                # 'created_at': serial.created_at,
                # /
                    'id': serial.inventory_item.id,
                    'product_name': serial.inventory_item.product_name,
                    'brand': serial.inventory_item.brand,
                    'model_type': serial.inventory_item.model_type,
                    'category': serial.inventory_item.category,
                    # 'stock_type': serial.inventory_item.stock_type,
                    'description': serial.inventory_item.description,
                    # 'unit_price': serial.inventory_item.unit_price,
                    # 'use_in_trial': serial.inventory_item.use_in_trial,
                    # 'quantity_in_stock': serial.inventory_item.quantity_in_stock,
                    # 'reorder_level': serial.inventory_item.reorder_level,
                    # 'location': serial.inventory_item.location,
                    # 'expiry_date': serial.inventory_item.expiry_date,
                    # 'notes': serial.inventory_item.notes,
                # }
            }
            
            return Response({
                "status": status.HTTP_200_OK,
                "data": product_info
            })
            
        except InventorySerial.DoesNotExist:
            return Response({
                "status": status.HTTP_404_NOT_FOUND,
                "message": f"Serial number '{serial_number}' not found"
            }, status=status.HTTP_404_NOT_FOUND)
