from rest_framework import serializers
from .models import TestUpload, VisitTestPerformed, PatientVisit


class TestUploadSerializer(serializers.ModelSerializer):
    """Serializer for TestUpload model"""
    
    class Meta:
        model = TestUpload
        fields = [
            'id',
            'visit',
            'report_type',
            'report_description',
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
        fields = ['patient_visit', 'report_type', 'report_description']
    
    def create(self, validated_data):
        """Handle both direct file upload and file path"""
        from .file_utils import upload_file_to_s3
        
        request = self.context.get('request')
        patient_visit = validated_data.pop('patient_visit')  # Remove patient_visit from validated_data
        file_type = validated_data['report_type']
        
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
        # update the step process to next step in workflow
        visit_performed.visit.step_process = 3  # Move to next step in workflow
        visit_performed.visit.save()


        
        return response
