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
    filterset_fields = ['visit', 'file_type']
    search_fields = ['file_type', 'visit__visit__patient__name']
    ordering_fields = ['created_at', 'file_type']
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


# class BulkTestUploadView(APIView):
#     """Bulk upload multiple test files"""
    
#     def post(self, request):
#         serializer = BulkTestUploadSerializer(
#             data=request.data, 
#             context={'request': request}
#         )
        
#         if serializer.is_valid():
#             created_uploads = serializer.save()
            
#             # Serialize the created uploads for response
#             response_serializer = TestUploadSerializer(created_uploads, many=True)
            
#             return Response({
#                 'message': f'Successfully uploaded {len(created_uploads)} files',
#                 'uploads': response_serializer.data
#             }, status=status.HTTP_201_CREATED)
        
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TestUploadByPatientView(generics.ListAPIView):
    """Get all test uploads for a specific patient across all visits"""
    serializer_class = TestUploadSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['file_type']
    ordering = ['-created_at']
    
    def get_queryset(self):
        patient_id = self.kwargs['patient_id']
        return TestUpload.objects.filter(
            visit__visit__patient__id=patient_id
        )
