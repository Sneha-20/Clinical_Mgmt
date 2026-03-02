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


class BulkReportTestUploadSerializer(serializers.Serializer):
    """
    Serializer for bulk creation of TestUpload records (no file upload).
    Accepts a list of test reports for a single VisitTestPerformed.
    """
    patient_visit = serializers.PrimaryKeyRelatedField(
        queryset=PatientVisit.objects.all(),
        write_only=True,
        help_text="PatientVisit ID - will automatically find/create VisitTestPerformed"
    )
    reports = serializers.ListField(
        child=serializers.DictField(),
        help_text="List of report dicts: {report_type, report_description, file_path (optional)}"
    )

    def validate_reports(self, value):
        if not value:
            raise serializers.ValidationError("At least one report is required.")
        for report in value:
            if 'report_type' not in report:
                raise serializers.ValidationError("Each report must have a 'report_type'.")
        return value

    def create(self, validated_data):
        patient_visit = validated_data['patient_visit']
        # Find or create VisitTestPerformed for this patient visit
        visit_performed = VisitTestPerformed.objects.get(
            visit=patient_visit
        )
        reports = validated_data['reports']
        created = []
        for report in reports:
            # Only allow fields that exist on TestUpload
            data = {
                'visit': visit_performed,
                'report_type': report.get('report_type'),
                'report_description': report.get('report_description', ''),
                # 'file_path': report.get('file_path', None),
            }
            created.append(TestUpload.objects.create(**data))
        return created


