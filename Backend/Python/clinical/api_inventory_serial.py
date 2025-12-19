import csv
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import InventoryItem, InventorySerial
from django.db import transaction
from django.utils.encoding import smart_str
from .serializers import InventorySerialSerializer

class InventorySerialBulkUploadView(APIView):
    """
    API endpoint to upload a CSV file for bulk creation of InventorySerials.
    CSV columns: product_name, brand, model_type, category, serial_number, status (optional)
    """
    parser_classes = [MultiPartParser]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, format=None):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file uploaded.'}, status=status.HTTP_400_BAD_REQUEST)
        decoded_file = file_obj.read().decode('utf-8').splitlines()
        reader = csv.DictReader(decoded_file)
        required_fields = {'product_name', 'brand', 'model_type', 'category', 'serial_number'}
        if not required_fields.issubset(reader.fieldnames):
            return Response({'error': f'Missing required columns: {required_fields - set(reader.fieldnames)}'}, status=status.HTTP_400_BAD_REQUEST)
        created = 0
        errors = []
        items_to_update = set()
        with transaction.atomic():
            for idx, row in enumerate(reader, start=2):  # start=2 for header row
                try:
                    item, _ = InventoryItem.objects.get_or_create(
                        product_name=smart_str(row['product_name']).strip(),
                        brand=smart_str(row['brand']).strip(),
                        model_type=smart_str(row['model_type']).strip(),
                        category=smart_str(row['category']).strip(),
                        defaults={'quantity_in_stock': 0}
                    )
                    serial = smart_str(row['serial_number']).strip()
                    status_val = smart_str(row.get('status', 'In Stock')).strip() or 'In Stock'
                    if InventorySerial.objects.filter(serial_number=serial).exists():
                        errors.append(f"Row {idx}: Serial '{serial}' already exists.")
                        continue
                    InventorySerial.objects.create(
                        inventory_item=item,
                        serial_number=serial,
                        status=status_val
                    )
                    items_to_update.add(item.pk)
                    created += 1
                except Exception as e:
                    errors.append(f"Row {idx}: {str(e)}")
            # Update quantity_in_stock for all affected items
            for pk in items_to_update:
                try:
                    item = InventoryItem.objects.get(pk=pk)
                    item.update_quantity_from_serials()
                except Exception as e:
                    errors.append(f"Error updating quantity for item {pk}: {str(e)}")
        response = {
            "summary": f"Bulk upload completed. {created} serial(s) created. {len(errors)} error(s).",
            "created_count": created,
            "error_count": len(errors),
            "errors": errors,
        }
        return Response(response, status=status.HTTP_201_CREATED if created else status.HTTP_400_BAD_REQUEST)
    


# class for create serial number for small number of inventory serials for  same product
class InventorySerialManualCreateView(APIView):
    ''''

    It should acceept multiple serial numbers for same inventory item in one go.
    Instead of inventory_item id, it should accept product_name, brand, model_type, category to identify the inventory item.
      Example
    {
        "product_name": "Glucometer X200",
        "brand": "HealthTech",
        "model_type": "X200",
        "category": "Diagnostic",
        "serial_numbers": ["SN001", "SN002", "SN003"]
    } 

    '''
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, format=None):
        serializer = InventorySerialSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    