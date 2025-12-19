from rest_framework import generics, permissions
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from .models import Trial
from .serializers import TrialCreateSerializer, TrialListSerializer
from clinical_be.utils.pagination import StandardResultsSetPagination

class TrialCreateView(generics.CreateAPIView):
    """API endpoint for creating a new trial record."""
    queryset = Trial.objects.all()
    serializer_class = TrialCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

class TrialListView(generics.ListAPIView):
    """API endpoint for listing all trial records."""
    queryset = Trial.objects.select_related(
        'assigned_patient', 'visit__seen_by', 'device_inventory_id'
    ).order_by('-created_at')
    serializer_class = TrialListSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['ear_fitted', 'patient_response']
    search_fields = [
        'assigned_patient__name', 
        'visit__seen_by__name', 
        'device_inventory_id__product_name', 
        'serial_number'
    ]

    def create(self, validated_data):
        return super().create(validated_data)
        # add status and message as response 
        return Response({"status":status.HTTP_201_CREATED,"message":"Trial created successfully."})