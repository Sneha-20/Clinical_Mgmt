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


    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        result = serializer.save()
        return Response({
            "status": status.HTTP_201_CREATED,
            "message": "Trial created successfully.",
            "step_process": result.visit.step_process if hasattr(result, 'visit') else None
        }, status=status.HTTP_201_CREATED)

class TrialListView(generics.ListAPIView):
    """API endpoint for listing all trial records."""
    queryset = Trial.objects.select_related(
        'assigned_patient', 'visit__seen_by', 'device_inventory_id'
    ).order_by('-created_at')
    serializer_class = TrialListSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['trial_decision']
    search_fields = [
        'assigned_patient__name', 
        'assigned_patient__phone_primary',
        # 'visit__seen_by__name', 
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