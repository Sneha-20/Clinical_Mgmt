from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import InventoryItem
from .serializers import InventoryItemSerializer

class InventoryItemListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        items = InventoryItem.objects.all()
        serializer = InventoryItemSerializer(items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
