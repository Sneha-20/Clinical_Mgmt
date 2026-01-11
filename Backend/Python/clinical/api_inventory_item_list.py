from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import InventoryItem, InventorySerial
from .serializers import InventoryItemSerializer, InventorySerialDetailSerializer
from clinical_be.utils.permission import IsClinicAdmin

class InventoryItemListView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsClinicAdmin]

    def get(self, request, format=None):
        items = InventoryItem.objects.all()
        serializer = InventoryItemSerializer(items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# Get the InventorySerial info for a product ( inventoryItem)
class InventorySerialListView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsClinicAdmin]

    def get(self, request, format=None):
        inventory_item = request.query_params.get('inventory_item')
        if not inventory_item:
            return Response({"error": "inventory_item is required"}, status=status.HTTP_400_BAD_REQUEST)
        inventory_serials = InventorySerial.objects.filter(inventory_item=inventory_item)
        serializer = InventorySerialDetailSerializer(inventory_serials, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
