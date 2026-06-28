from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework import serializers
from .models import InventoryItem, InventorySerial
from .serializers import InventoryItemDetailSerializer
from clinical_be.utils.permission import IsClinicAdmin, ReceptionistPermission, ClinicManagerPermission
from collections import defaultdict


class InventoryWithStockSerializer(serializers.ModelSerializer):
    """Custom serializer to show serial numbers for serialized items and quantity for non-serialized"""
    
    brand_name = serializers.CharField(source='brand.name', read_only=True, allow_null=True)
    model_type_name = serializers.CharField(source='model_type.name', read_only=True, allow_null=True)
    clinic_name = serializers.CharField(source='clinic.name', read_only=True)
    stock_info = serializers.SerializerMethodField()
    display_name = serializers.SerializerMethodField()
    subtitle = serializers.SerializerMethodField()
    
    def get_stock_info(self, obj):
        """Return serial numbers for serialized items, quantity for non-serialized"""
        if obj.stock_type == 'Serialized':
            # Get list of serial numbers that are 'In Stock'
            in_stock_serials = obj.serials.filter(status='In Stock').values_list('serial_number', flat=True)
            return {
                'type': 'serialized',
                'serial_numbers': list(in_stock_serials),
                'count': len(in_stock_serials)
            }
        else:
            # For non-serialized items, return quantity
            return {
                'type': 'non_serialized',
                'quantity': obj.quantity_in_stock
            }
    
    def get_display_name(self, obj):
        """Generate display name based on category"""
        category = obj.category
        
        if category == 'Hearing Aids Accessories':
            return f"{obj.brand.name if obj.brand else ''} - {obj.accessories_type or ''}"
        elif category == 'Diagnostic Equipment':
            return f"{obj.model_type.name if obj.model_type else ''}"
        elif category == 'Cochlear Implant Accessories':
            return f"{obj.brand.name if obj.brand else ''} {obj.implant_systems or ''} {obj.cochlear_accessory or ''}"
        elif category == 'Speech & Therapy Materials':
            return f"{obj.age_groups or ''} - {obj.accessories_type or ''}"
        else:
            return f"{obj.brand.name if obj.brand else ''} {obj.model_type.name if obj.model_type else ''}"
    
    def get_subtitle(self, obj):
        """Generate subtitle based on category"""
        category = obj.category
        
        if category == 'Hearing Aids Accessories':
            return f"Accessories Type: {obj.accessories_type or 'N/A'}"
        elif category == 'Diagnostic Equipment':
            return f"SKU: {obj.sku or 'N/A'}"
        elif category == 'Cochlear Implant Accessories':
            return f"System: {obj.implant_systems or 'N/A'} | Accessory: {obj.cochlear_accessory or 'N/A'}"
        elif category == 'Speech & Therapy Materials':
            return f"Age Group: {obj.age_groups or 'N/A'} | Type: {obj.accessories_type or 'N/A'}"
        else:
            return f"SKU: {obj.sku or 'N/A'}"
    
    class Meta:
        model = InventoryItem
        fields = [
            'id', 'category', 'product_name', 'brand_name', 'model_type_name',
            'implant_systems', 'cochlear_accessory', 'age_groups', 'sku',
            'description', 'stock_type', 'stock_info', 'notes', 'use_in_trial',
            'unit_price', 'status', 'clinic_id', 'clinic_name',
            'accessories_type', 'gst_value', 'display_name', 'subtitle'
        ]


class InventoryExcludingHearingAidsView(APIView):
    """
    API to get inventory list excluding Hearing Aids category, organized by category
    """
    permission_classes = [permissions.IsAuthenticated, IsClinicAdmin | ReceptionistPermission | ClinicManagerPermission]

    def get(self, request, format=None):
        try:
            # Get search query parameter
            search_query = request.query_params.get('search', '').strip()
            
            # Filter items based on user's clinic and exclude Hearing Aids
            if request.user.role.name == 'Reception':
                items = InventoryItem.objects.filter(
                    is_approved=True,
                    use_in_trial=False,
                    quantity_in_stock__gt=0
                ).exclude(
                    category='Hearing Aid'
                ).order_by('-id')
                
                # Filter by user's clinic
                clinic_id = request.user.clinic_id
                if clinic_id:
                    items = items.filter(clinic_id=clinic_id)
                
                # Apply search by product name if search query provided
                if search_query:
                    items = items.filter(product_name__icontains=search_query)

            # Optimize query to include only In Stock serial numbers for serialized items
            from django.db.models import Prefetch
            items = items.select_related('brand', 'model_type', 'clinic').prefetch_related(
                Prefetch('serials', queryset=InventorySerial.objects.filter(status='In Stock'))
            )
            
            # Serialize all items (no pagination)
            serializer = InventoryWithStockSerializer(items, many=True)
            
            # Organize items by category
            items_by_category = defaultdict(list)
            for item in serializer.data:
                category = item['category']
                items_by_category[category].append(item)
            
            # Convert defaultdict to regular dict for JSON response
            return Response({
                'status': status.HTTP_200_OK,
                'data': dict(items_by_category)
            })

        except Exception as e:
            return Response({
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
