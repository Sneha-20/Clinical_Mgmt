from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from .models import TestUpload, VisitTestPerformed
from .test_upload_serializers import (
    TestUploadSerializer, 
    TestUploadCreateSerializer, 
    # BulkTestUploadSerializer
)

class TestUploadListCreateView(generics.ListCreateAPIView):
    """List and create test upload records"""
    queryset = TestUpload.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['visit', 'report_type']
    search_fields = ['report_type', 'visit__visit__patient__name']
    ordering_fields = ['created_at', 'report_type']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            print("POST")
            return TestUploadCreateSerializer
        return TestUploadSerializer


    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({"status":status.HTTP_201_CREATED,"message":"Test uploaded successfully"}, status=status.HTTP_201_CREATED)


# class TestUploadDetailView(generics.RetrieveUpdateDestroyAPIView):
#     """Retrieve, update, or delete a test upload record"""
#     queryset = TestUpload.objects.all()
#     serializer_class = TestUploadSerializer


# class TestUploadByVisitView(generics.ListAPIView):
#     """Get all test uploads for a specific visit"""
#     serializer_class = TestUploadSerializer
#     filter_backends = [filters.SearchFilter, filters.OrderingFilter]
#     search_fields = ['file_type']
#     ordering = ['-created_at']
    
#     def get_queryset(self):
#         visit_id = self.kwargs['visit_id']
#         return TestUpload.objects.filter(visit__id=visit_id)



class TestUploadByPatientView(generics.ListAPIView):
    """Get all test uploads for a specific patient across all visits"""
    serializer_class = TestUploadSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['report_type']
    ordering = ['-created_at']
    
    def get_queryset(self):
        patient_id = self.kwargs['patient_id']
        return TestUpload.objects.filter(
            visit__visit__patient__id=patient_id
        )
