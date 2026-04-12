from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count
from django.utils import timezone
from .models import ClinicFormRecord
from .serializers import ClinicFormRecordSerializer
from accounts.models import Clinic
from accounts.serializers import ClinicSimpleSerializer
from rest_framework.permissions import AllowAny


class ClinicFormRecordCreateView(generics.CreateAPIView):
    """API endpoint for creating a new clinic form record."""
    queryset = ClinicFormRecord.objects.all()
    serializer_class = ClinicFormRecordSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        serializer.save()


class ClinicFormRecordListView(generics.ListAPIView):
    """API endpoint for listing clinic form records."""
    queryset = ClinicFormRecord.objects.select_related('clinic', 'created_by').order_by('-created_at')
    serializer_class = ClinicFormRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter records by clinic if provided"""
        queryset = super().get_queryset()
        clinic_id = self.request.query_params.get('clinic_id')
        if clinic_id:
            queryset = queryset.filter(clinic_id=clinic_id)
        return queryset


class ClinicFormRecordUpdateView(generics.UpdateAPIView):
    """API endpoint for updating clinic form record status."""
    queryset = ClinicFormRecord.objects.all()
    serializer_class = ClinicFormRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request, *args, **kwargs):
        """Update only the status field."""
        instance = self.get_object()
        is_contacted = request.data.get('contacted')
        
        if is_contacted not in [True, False]:
            return Response({
                'status': status.HTTP_400_BAD_REQUEST,
                'error': 'Invalid contacted value'
            })
        
        instance.contacted = is_contacted
        instance.contacted_at = timezone.now()
        instance.contacted_by = self.request.user
        instance.save()
        
        return Response({
            'status': status.HTTP_200_OK,
            'message': 'Contacted status updated successfully',
            'data': ClinicFormRecordSerializer(instance).data
        })
