from rest_framework import generics, permissions
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from .models import ServiceVisit
from .serializers import ServiceVisitListSerializer
from clinical_be.utils.pagination import StandardResultsSetPagination

class ServiceVisitListView(generics.ListAPIView):
    """List all Service Visits with patient and item details."""
    queryset = ServiceVisit.objects.select_related(
        'visit__patient', 'device__inventory_item', 'device_serial'
    ).order_by('-created_at')
    serializer_class = ServiceVisitListSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['status', 'service_type']
    search_fields = ['visit__patient__name', 'visit__patient__phone_primary', 'device_serial__serial_number']
