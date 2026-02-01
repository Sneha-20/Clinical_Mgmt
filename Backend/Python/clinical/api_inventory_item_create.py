from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import InventoryItem
from .serializers import InventoryItemCreateSerializer, InventoryItemSerializer
from .models import DeletedRecordLog,ContentType

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


class InventoryItemDestroyView(generics.DestroyAPIView):
    """Destroy an existing Inventory Item."""
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        inventory_item = self.get_object()
        # Log deletion
        DeletedRecordLog.objects.create(
            content_type=ContentType.objects.get_for_model(inventory_item),
            object_id=str(inventory_item.pk),
            model_name=inventory_item.__class__.__name__,
            deleted_data=InventoryItemSerializer(inventory_item).data,
            deleted_by=request.user if request.user.is_authenticated else None,
            reason=request.data.get('reason', None)
        )
        inventory_item.delete()
        return Response({"status": 204, "message": "Inventory item and all associated records deleted via cascade"}, status=status.HTTP_204_NO_CONTENT)