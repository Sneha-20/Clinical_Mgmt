from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from .models import TestUpload, VisitTestPerformed
from .test_upload_serializers import (
    TestUploadSerializer, 
    BulkReportTestUploadSerializer
)
from .file_utils import upload_file_to_s3


class ReportTestCreateView(generics.CreateAPIView):
    """Create test upload records with file upload"""
    serializer_class = BulkReportTestUploadSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({"status":status.HTTP_201_CREATED,"message":"Report added successfully"}, status=status.HTTP_201_CREATED)
    

class ReportUploadView(generics.UpdateAPIView):
    """Update test upload record with file upload"""
    queryset = TestUpload.objects.all()
    lookup_field = 'id'

    def patch(self, request, *args, **kwargs):
        """Handle PATCH request for file upload"""
        instance = self.get_object()
        # get the uploaded file from request
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response({"status":status.HTTP_400_BAD_REQUEST,"message":"No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            file_path = upload_file_to_s3(uploaded_file, instance.report_type)
            instance.file_path = file_path
            instance.save()

            return Response({"status":status.HTTP_200_OK,"message":"File uploaded successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"status":status.HTTP_500_INTERNAL_SERVER_ERROR,"message":f"File upload failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        


class TestUploadListView(generics.ListAPIView):
    """List and create test upload records"""
    queryset = TestUpload.objects.all()
    serializer_class = TestUploadSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['visit', 'report_type']
    search_fields = ['report_type', 'visit__visit__patient__name']
    ordering = ['-created_at']
    



   
