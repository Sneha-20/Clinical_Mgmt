from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import InventoryItem
from .serializers import InventoryItemCreateSerializer, InventoryItemSerializer

class InventoryItemCreateView(generics.CreateAPIView):
    """Create a new Inventory Item (Serialized or Non-Serialized)."""
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            # Flatten the error dictionary to a single string
            error_message = "An error occurred."
            if isinstance(serializer.errors, dict):
                for field, messages in serializer.errors.items():
                    if isinstance(messages, list) and messages:
                        error_message = f"{field.replace('_', ' ').title()}: {messages[0]}"
                        break
            return Response({"status": 400, "error": error_message}, status=status.HTTP_400_BAD_REQUEST)
        
        inventory_item = serializer.save()
        
        # Return the created item using the detailed serializer
        response_serializer = InventoryItemSerializer(inventory_item)
        return Response({
            "status": 201,
            "message": "Inventory item created successfully",
            # "data": response_serializer.data
        }, status=status.HTTP_201_CREATED)
