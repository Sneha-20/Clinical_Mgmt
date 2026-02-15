from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from django.shortcuts import get_object_or_404
from .models import PatientPurchase, ServiceVisit, Patient
from .serializers import PatientPurchaseSerializer, ServiceVisitListSerializer
from clinical_be.utils.permission import IsClinicAdmin, ReceptionistPermission
from clinical_be.utils.pagination import StandardResultsSetPagination


class PatientPurchaseHistoryView(ListAPIView):
    """
    API to get purchase history for a specific patient
    GET /api/clinical/patients/{patient_id}/purchases/
    """
    permission_classes = [permissions.IsAuthenticated, IsClinicAdmin | ReceptionistPermission]
    pagination_class = StandardResultsSetPagination
    serializer_class = PatientPurchaseSerializer

    def get_queryset(self):
        patient_id = self.kwargs.get('patient_id')
        patient = get_object_or_404(Patient, id=patient_id)
        return PatientPurchase.objects.filter(patient=patient).order_by('-purchased_at')


class PatientServiceVisitHistoryView(ListAPIView):
    """
    API to get service visit history for a specific patient
    GET /api/clinical/patients/{patient_id}/service-visits/
    """
    permission_classes = [permissions.IsAuthenticated, IsClinicAdmin | ReceptionistPermission]
    pagination_class = StandardResultsSetPagination
    serializer_class = ServiceVisitListSerializer

    def get_queryset(self):
        patient_id = self.kwargs.get('patient_id')
        patient = get_object_or_404(Patient, id=patient_id)
        return ServiceVisit.objects.filter(visit__patient=patient).order_by('-action_taken_on')


class PatientPurchaseDetailView(APIView):
    """
    API to get details of a specific purchase
    GET /api/clinical/purchases/{purchase_id}/
    """
    permission_classes = [permissions.IsAuthenticated, IsClinicAdmin | ReceptionistPermission]

    def get(self, request, purchase_id, format=None):
        purchase = get_object_or_404(PatientPurchase, id=purchase_id)
        serializer = PatientPurchaseSerializer(purchase)
        return Response(serializer.data, status=status.HTTP_200_OK)


class PatientServiceVisitDetailView(APIView):
    """
    API to get details of a specific service visit
    GET /api/clinical/service-visits/{service_id}/
    """
    permission_classes = [permissions.IsAuthenticated, IsClinicAdmin | ReceptionistPermission]

    def get(self, request, service_id, format=None):
        service_visit = get_object_or_404(ServiceVisit, id=service_id)
        serializer = ServiceVisitListSerializer(service_visit)
        return Response(serializer.data, status=status.HTTP_200_OK)
