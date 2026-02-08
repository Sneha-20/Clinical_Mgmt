from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from .models import InventoryItem, Brand,ModelType
from .serializers import InventoryItemCreateSerializer, InventoryItemSerializer, BrandSerializer, ModelTypeSerializer
from .models import DeletedRecordLog,ContentType
from clinical_be.utils.permission import IsClinicAdmin, AuditorPermission, ReceptionistPermission
 

class BrandListView(generics.ListAPIView):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer  # Use the BrandSerializer for returning brand data
    permission_classes = [permissions.IsAuthenticated]
    

    def list(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return Response({"status": 200, "data": serializer.data}, status=status.HTTP_200_OK)

class BrandCreateView(generics.CreateAPIView):
    # queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [permissions.IsAuthenticated, IsClinicAdmin | ReceptionistPermission ]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            error_message = "Invalid data"
            # Flatten the error dictionary to a single string
            if isinstance(serializer.errors, dict):
                for field, messages in serializer.errors.items():
                    if isinstance(messages, list) and messages:
                        error_message = f"{field.replace('_', ' ').title()}: {messages[0]}"
                        break

            return Response({"status": 400, "error": error_message}, status=status.HTTP_400_BAD_REQUEST)
    
        serializer.save()
        return Response({"status": 201, "message": "Brand created successfully"}, status=status.HTTP_201_CREATED)


class ModelListView(generics.ListAPIView):
    queryset = ModelType.objects.all()
    serializer_class = ModelTypeSerializer  # Use the ModelTypeSerializer for returning model data

    def list(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return Response({"status": 200, "data": serializer.data}, status=status.HTTP_200_OK)
    
class ModelCreateView(generics.CreateAPIView):  
    queryset = ModelType.objects.all()
    serializer_class = ModelTypeSerializer
    permission_classes = [permissions.IsAuthenticated, IsClinicAdmin | ReceptionistPermission ]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            # Flatten the error dictionary to a single string
            if isinstance(serializer.errors, dict):
                for field, messages in serializer.errors.items():
                    if isinstance(messages, list) and messages:
                        error_message = f"{field.replace('_', ' ').title()}: {messages[0]}"
                        break

            return Response({"status": 400, "error": error_message}, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response({"status": 201, "message": "Model created successfully"}, status=status.HTTP_201_CREATED)
        
class InventoryItemCreateView(generics.CreateAPIView):
    """Create a new Inventory Item (Serialized or Non-Serialized)."""
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemCreateSerializer
    permission_classes = [permissions.IsAuthenticated, IsClinicAdmin | ReceptionistPermission ]

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
        
        # Assign the item to the user's clinic (Admin's clinic acts as Main Inventory)
        if request.user.clinic:
            serializer.validated_data['clinic'] = request.user.clinic
            
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