from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db import transaction
from django.shortcuts import get_object_or_404
from .models import InventoryItem, InventorySerial, InventoryTransfer
from accounts.models import Clinic
from .serializers import InventoryTransferSerializer
from clinical_be.utils.permission import IsClinicAdmin

class InventoryTransferView(APIView):
    """
    API to transfer inventory items from one clinic to another.
    Handles both Serialized and Non-Serialized items.
    """
    permission_classes = [permissions.IsAuthenticated, IsClinicAdmin]

    def post(self, request, *args, **kwargs):
        to_clinic_id = request.data.get('to_clinic_id')
        products = request.data.get('products', [])
        notes = request.data.get('notes', '')

        if not to_clinic_id:
            return Response({"status": 400, "error": "Destination clinic is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        if not products or not isinstance(products, list):
             return Response({"status": 400, "error": "Products list is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            to_clinic = Clinic.objects.get(id=to_clinic_id)
        except Clinic.DoesNotExist:
            return Response({"status": 404, "error": "Destination Clinic not found."}, status=status.HTTP_404_NOT_FOUND)

        # 1. Fetch all source items
        source_ids = [p.get('source_inventory_id') for p in products if p.get('source_inventory_id')]
        if not source_ids:
             return Response({"status": 400, "error": "No valid source items provided."}, status=status.HTTP_400_BAD_REQUEST)

        source_items = InventoryItem.objects.filter(id__in=source_ids)
        source_item_map = {item.id: item for item in source_items}

        if len(source_items) != len(set(source_ids)):
             return Response({"status": 400, "error": "One or more source items not found."}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Pre-fetch destination items by SKU to minimize queries
        source_skus = [item.sku for item in source_items if item.sku]
        dest_items_by_sku = {}
        if source_skus:
            dest_items = InventoryItem.objects.filter(clinic=to_clinic, sku__in=source_skus)
            for item in dest_items:
                dest_items_by_sku[item.sku] = item

        transfer_logs = []

        with transaction.atomic():
            for product_data in products:
                source_id = product_data.get('source_inventory_id')
                quantity = int(product_data.get('quantity', 0))
                serial_numbers = product_data.get('serial_numbers', [])
                
                source_item = source_item_map.get(source_id)
                if not source_item:
                    continue 

                if source_item.clinic_id == to_clinic.id:
                    return Response({"status": 400, "error": f"Item '{source_item.product_name}' is already in the destination clinic."}, status=status.HTTP_400_BAD_REQUEST)

                master_ref = source_item.master_item if source_item.master_item else source_item

                # Find or Create Destination Item
                dest_item = None
                if source_item.sku and source_item.sku in dest_items_by_sku:
                    dest_item = dest_items_by_sku[source_item.sku]
                
                if not dest_item:
                    # Try legacy match
                    if not source_item.sku:
                        dest_item = InventoryItem.objects.filter(
                            clinic=to_clinic,
                            brand=source_item.brand,
                            model_type=source_item.model_type,
                            product_name=source_item.product_name,
                            category=source_item.category
                        ).first()

                    if not dest_item:
                        dest_item = InventoryItem.objects.create(
                            clinic=to_clinic,
                            product_name=source_item.product_name,
                            brand=source_item.brand,
                            model_type=source_item.model_type,
                            category=source_item.category,
                            stock_type=source_item.stock_type,
                            sku=source_item.sku,
                            master_item=master_ref,
                            description=source_item.description,
                            reorder_level=source_item.reorder_level,
                            unit_price=source_item.unit_price,
                            use_in_trial=source_item.use_in_trial,
                            quantity_in_stock=0
                        )
                        if dest_item.sku:
                            dest_items_by_sku[dest_item.sku] = dest_item
                
                # Ensure linkage
                if not dest_item.master_item:
                    dest_item.master_item = master_ref
                dest_item.save()

                transfer_qty = 0

                if source_item.stock_type == 'Serialized':
                    if not serial_numbers:
                        return Response({"status": 400, "error": f"Serial numbers required for {source_item.product_name}"}, status=status.HTTP_400_BAD_REQUEST)
                    
                    serials_qs = InventorySerial.objects.filter(
                        inventory_item=source_item,
                        serial_number__in=serial_numbers,
                        status='In Stock'
                    )
                    if serials_qs.count() != len(serial_numbers):
                         return Response({"status": 400, "error": f"Invalid or unavailable serials for {source_item.product_name}"}, status=status.HTTP_400_BAD_REQUEST)
                    
                    serials_qs.update(inventory_item=dest_item)
                    
                    # Update quantities manually to save query
                    source_item.quantity_in_stock -= len(serial_numbers)
                    dest_item.quantity_in_stock += len(serial_numbers)
                    transfer_qty = len(serial_numbers)

                else:
                    # Non-Serialized
                    if quantity <= 0:
                        return Response({"status": 400, "error": f"Quantity must be > 0 for {source_item.product_name}"}, status=status.HTTP_400_BAD_REQUEST)
                    
                    if source_item.quantity_in_stock < quantity:
                        return Response({"status": 400, "error": f"Insufficient stock for {source_item.product_name}. Available: {source_item.quantity_in_stock}"}, status=status.HTTP_400_BAD_REQUEST)

                    source_item.quantity_in_stock -= quantity
                    dest_item.quantity_in_stock += quantity
                    transfer_qty = quantity

                source_item.save()
                dest_item.save()

                transfer_logs.append(InventoryTransfer(
                    item_name=source_item.product_name,
                    category=source_item.category,
                    brand=source_item.brand,
                    model=source_item.model_type,
                    from_clinic=source_item.clinic,
                    to_clinic=to_clinic,
                    quantity=transfer_qty,
                    serial_numbers=serial_numbers if source_item.stock_type == 'Serialized' else [],
                    transferred_by=request.user,
                    notes=notes
                ))
            
            InventoryTransfer.objects.bulk_create(transfer_logs)

        return Response({
            "status": 200, 
            "message": "Inventory transferred successfully.",
            "transferred_count": len(transfer_logs)
        }, status=status.HTTP_200_OK)

class InventoryTransferHistoryView(APIView):
    """
    Get transfer history.
    Admin sees all, Clinic Managers see transfers involving their clinic.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        queryset = InventoryTransfer.objects.all().order_by('-transferred_at')

        # Filter based on role/clinic
        if user.role.name != 'Admin':
            user_clinics = [user.clinic] if user.clinic else []
            if user.role.name == 'Clinic Manager':
                 user_clinics = user.managed_clinics_assignments.values_list('clinic', flat=True)
            
            queryset = queryset.filter(models.Q(from_clinic__in=user_clinics) | models.Q(to_clinic__in=user_clinics))

        serializer = InventoryTransferSerializer(queryset, many=True)
        return Response({"status": 200, "data": serializer.data}, status=status.HTTP_200_OK)


class InventoryFlatListView(APIView): # For dropdowns and quick access
    """
    Get flat list of all inventory items across clinics.
    Admin sees all, Clinic Managers see items in their clinics.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        queryset = InventoryItem.objects.select_related('clinic').all().distinct()
        data = queryset.values('id', 'product_name', 'brand__name', 'model_type__name', 'stock_type')
        return Response({"status": 200, "data": list(data)}, status=status.HTTP_200_OK)
    





       
        

        