from rest_framework import serializers
from .models import BillItem, PatientPurchase, InventoryItem


class BillItemCreateSerializer(serializers.Serializer):
    """Serializer for creating bill items with inventory products"""
    
    inventory_item_id = serializers.IntegerField(write_only=True)
    quantity = serializers.IntegerField(write_only=True, min_value=1, default=1)
    
    def validate_inventory_item_id(self, value):
        """Validate that inventory item exists and is approved"""
        try:
            inventory_item = InventoryItem.objects.get(id=value, is_approved=True)
            return inventory_item
        except InventoryItem.DoesNotExist:
            raise serializers.ValidationError("Inventory item not found or not approved")
    
    def validate_quantity(self, value):
        """Validate quantity is positive"""
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value


class BillItemSerializer(serializers.ModelSerializer):
    """Serializer for bill items"""
    
    class Meta:
        model = BillItem
        fields = [
            'id', 'bill', 'item_type', 'description', 'cost', 
            'quantity', 'discount_amount', 'created_at'
        ]


class PurchaseHistorySerializer(serializers.ModelSerializer):
    """Serializer for patient purchase history"""
    
    product_name = serializers.CharField(source='inventory_item.product_name', read_only=True)
    brand_name = serializers.CharField(source='inventory_item.brand.name', read_only=True)
    category = serializers.CharField(source='inventory_item.category', read_only=True)
    patient_name = serializers.CharField(source='patient.name', read_only=True)
    
    class Meta:
        model = PatientPurchase
        fields = [
            'id', 'patient', 'patient_name', 'clinic', 'visit', 
            'inventory_item', 'product_name', 'brand_name', 'category',
            'quantity', 'unit_price', 'total_price', 'purchased_at', 'created_by'
        ]
