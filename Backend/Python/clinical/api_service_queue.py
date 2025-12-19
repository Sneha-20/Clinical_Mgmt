from rest_framework import generics, permissions
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from .models import PatientVisit
from .serializers import ServiceQueueSerializer
from clinical_be.utils.pagination import StandardResultsSetPagination

class ServiceQueueView(generics.ListAPIView):
    """List all Patient Visits with status 'Pending for Service'."""
    queryset = PatientVisit.objects.filter(status='Pending for Service').select_related(
        'patient'
    ).prefetch_related(
        'patient__purchases__inventory_item', 
        'patient__purchases__inventory_serial'
    ).order_by('-created_at')
    serializer_class = ServiceQueueSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['service_type', 'appointment_date']
    search_fields = ['patient__name', 'patient__phone_primary']
