from rest_framework import generics, permissions
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from .models import InventoryItem
from .serializers import TrialDeviceSerializer
from rest_framework.response import Response
from rest_framework import status

class TrialDeviceListView(generics.ListAPIView):
    """API endpoint for listing all inventory items available for trial."""
    serializer_class = TrialDeviceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ['product_name', 'brand', 'model_type']

    def get_queryset(self):
        """Only return items that are marked for trial use."""
        return InventoryItem.objects.filter(use_in_trial=True).prefetch_related('serials').order_by('product_name')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({"status":status.HTTP_200_OK,"data":serializer.data})
