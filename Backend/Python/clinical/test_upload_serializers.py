from rest_framework import serializers
from .models import TestUpload, VisitTestPerformed, PatientVisit


class TestUploadSerializer(serializers.ModelSerializer):
    """Serializer for TestUpload model"""
    # visit_id = serializers.IntegerField(source='visit.id', read_only=True)
    # visit_patient_name = serializers.CharField(source='visit.patient.name', read_only=True)
    
    class Meta:
        model = TestUpload
        fields = [
            'id',
            'visit',
            # 'visit_id',
            # 'visit_patient_name',
            'file_type',
            'file_path',
            'created_at'
        ]


class TestUploadCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating TestUpload records with file upload"""
    patient_visit = serializers.PrimaryKeyRelatedField(
        queryset=PatientVisit.objects.all(),
        write_only=True,
        help_text="PatientVisit ID - will automatically find/create VisitTestPerformed"
    )
    
    class Meta:
        model = TestUpload
        fields = ['patient_visit', 'file_type']
    
    def create(self, validated_data):
        """Handle both direct file upload and file path"""
        from .file_utils import upload_file_to_s3
        
        request = self.context.get('request')
        patient_visit = validated_data.pop('patient_visit')  # Remove patient_visit from validated_data
        file_type = validated_data['file_type']
        
        # Find or create VisitTestPerformed for this patient visit
        visit_performed = VisitTestPerformed.objects.get(
            visit=patient_visit
        )
        
        # Set the visit field for TestUpload
        validated_data['visit'] = visit_performed
        
        # Check if there's a file in the request
        uploaded_file = request.FILES.get('file') if request else None
        print(uploaded_file)
        
        if uploaded_file:
            # Direct file upload - upload to S3
            try:
                file_path = upload_file_to_s3(uploaded_file, file_type)
                validated_data['file_path'] = file_path
            except Exception as e:
                raise serializers.ValidationError(f"File upload failed: {str(e)}")
        else:
            # Use provided file_path
            if not validated_data.get('file_path'):
                raise serializers.ValidationError("Either file upload or file_path is required")
        
        response =  super().create(validated_data)
        return response


# class BulkTestUploadSerializer(serializers.Serializer):
#     """Serializer for bulk uploading multiple test files"""
#     visit = serializers.PrimaryKeyRelatedField(queryset=VisitTestPerformed.objects.all())
#     test_files = serializers.ListField(
#         child=serializers.DictField(),
#         help_text="List of {'file_type': str, 'file': File} or {'file_type': str, 'file_path': str}"
#     )
    
#     def create(self, validated_data):
#         """Create multiple TestUpload records"""
#         from .file_utils import upload_file_to_s3
        
#         request = self.context.get('request')
#         visit = validated_data['visit']
#         test_files = validated_data['test_files']
        
#         created_uploads = []
        
#         for file_data in test_files:
#             file_type = file_data.get('file_type')
            
#             if 'file' in file_data:
#                 # Direct file upload
#                 uploaded_file = file_data['file']
#                 file_path = upload_file_to_s3(uploaded_file, file_type)
#             else:
#                 # Use provided file_path
#                 file_path = file_data.get('file_path')
#                 if not file_path:
#                     raise serializers.ValidationError(f"file_path required for {file_type}")
            
#             test_upload = TestUpload.objects.create(
#                 visit=visit,
#                 file_type=file_type,
#                 file_path=file_path
#             )
#             created_uploads.append(test_upload)
        
#         return created_uploads
