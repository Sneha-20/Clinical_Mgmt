from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.db.models import Count, Q
from .models import InventoryItem, InventorySerial, Trial, Patient
from .serializers import TrialDeviceSerialSerializer, ProductInfoBySerialSerializer
from clinical_be.utils.pagination import StandardResultsSetPagination


class TrialDeviceSerialListView(generics.ListAPIView):
    """API endpoint for listing serial numbers of trial devices with count > 0."""
    permission_classes = [permissions.IsAuthenticated]
    
    
    def get_queryset(self):
        """Get serial numbers for trial devices with available count > 0 and not used in trials."""
        # Get serial numbers that are already used in trials
        used_serial_numbers = Trial.objects.filter(
            serial_number__isnull=False
        ).values_list('serial_number', flat=True)

        # Get search parameter from query params
        search_serial = self.request.query_params.get('serial_number', None)
        
        # Filter available devices excluding those used in trials
        queryset = InventorySerial.objects.filter(
            inventory_item__use_in_trial=True,
            status='In Stock'
        ).exclude(
            serial_number__in=used_serial_numbers
        )
        
        # Apply search filter if serial_number parameter is provided
        if search_serial:
            queryset = queryset.filter(
                serial_number__icontains=search_serial
            )
        
        return queryset.values('serial_number')
    
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


class TrialDeviceInUseListView(generics.ListAPIView):
    """API endpoint for listing trial devices currently in use."""
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        """Get serial numbers for trial devices currently in trial status."""
        return InventorySerial.objects.filter(
            inventory_item__use_in_trial=True,
            status='Use in Trial'
        ).select_related('inventory_item').order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        """Return trial devices currently in use with patient assignment info."""
        queryset = self.get_queryset()
        
        devices_in_use = []
        for serial in queryset:
            # Get trial information for this serial
            trial_info = None
            try:
                trial = Trial.objects.filter(serial_number=serial.serial_number).first()
                if trial and trial.assigned_patient:
                    trial_info = {
                        'trial_id': trial.id,
                        'patient_name': trial.assigned_patient.name,
                        'patient_phone': trial.assigned_patient.phone_primary,
                        'trial_start_date': trial.trial_start_date,
                        'trial_end_date': trial.trial_end_date,
                        'followup_date': trial.followup_date,
                        'ear_fitted': trial.ear_fitted,
                    }
            except:
                pass
            
            device_data = {
                'serial_number': serial.serial_number,
                'status': serial.status,
                # 'created_at': serial.created_at,
                'product_info': {
                    'id': serial.inventory_item.id,
                    'product_name': serial.inventory_item.product_name,
                    'brand': serial.inventory_item.brand,
                    'model_type': serial.inventory_item.model_type,
                    'category': serial.inventory_item.category,
                },
                'trial_assignment': trial_info
            }
            devices_in_use.append(device_data)
        
        return Response({
            "status": status.HTTP_200_OK,
            "data": devices_in_use
        })


