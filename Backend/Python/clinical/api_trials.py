from rest_framework import generics, permissions
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from .models import Trial
from .serializers import TrialCreateSerializer, TrialListSerializer
from clinical_be.utils.pagination import StandardResultsSetPagination
from rest_framework.response import Response
from rest_framework import status

class TrialCreateView(generics.CreateAPIView):
    """API endpoint for creating a new trial record."""
    queryset = Trial.objects.all()
    serializer_class = TrialCreateSerializer
    permission_classes = [permissions.IsAuthenticated]


    def create(self, validated_data):
        super().create(validated_data)
        # add status and message as response 
        return Response({"status":status.HTTP_201_CREATED,"message":"Trial created successfully."})

class TrialListView(generics.ListAPIView):
    """API endpoint for listing all trial records."""
    queryset = Trial.objects.select_related(
        'assigned_patient', 'visit__seen_by', 'device_inventory_id'
    ).order_by('-created_at')
    serializer_class = TrialListSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['ear_fitted', 'patient_response', 'visit__status']
    search_fields = [
        'assigned_patient__name', 
        'visit__seen_by__name', 
        'device_inventory_id__product_name', 
        'serial_number'
    ]
    
    def get_queryset(self):
        """Filter trials by clinic and visit status if provided"""
        queryset = super().get_queryset()
        clinic = getattr(self.request.user, 'clinic', None)
        if clinic:
            queryset = queryset.filter(visit__clinic=clinic)
        
        # Filter by visit status if provided
        visit_status = self.request.query_params.get('visit_status')
        if visit_status:
            queryset = queryset.filter(visit__status=visit_status)
            
        return queryset