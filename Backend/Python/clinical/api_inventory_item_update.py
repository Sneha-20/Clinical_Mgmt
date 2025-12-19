from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import InventoryItem
from .serializers import InventoryUpdateItemSerializer

class InventoryItemUpdateView(APIView):
    """
    API endpoint to update InventoryItem by ID.
    Accepts PATCH or PUT with fields to update (e.g., quantity_in_stock, location, expiry_date, etc.)
    """
    permission_classes = [permissions.IsAuthenticated]

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
