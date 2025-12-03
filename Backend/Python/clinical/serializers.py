
from .models import Patient, PatientVisit, AudiologistCaseHistory, VisitTestPerformed, Trial
from rest_framework import serializers
from django.db import transaction
import re
from accounts.models import User
from accounts.serializers import RoleSimpleSerializer


class PatientAllVisitSerializer(serializers.ModelSerializer):
    # Tell DRF what you expect from the API (list of strings)
    seen_by = serializers.CharField(source='seen_by.name', read_only=True)
    test_requested = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )

    class Meta:
        model = PatientVisit
        fields = [
            'id',
            'visit_type',
            'service_type',
            'seen_by',
            'present_complaint',
            'test_requested',
            'notes',
            'appointment_date'
        ]

    def validate_test_requested(self, value):
        """Convert list → string before saving"""
        if isinstance(value, list):
            return ",".join(value)
        return value

    def to_representation(self, instance):
        """Convert string → list for output"""
        data = super().to_representation(instance)

        stored_value = instance.test_requested or ""

        data["test_requested"] = (
            stored_value.split(",") if stored_value else []
        )
        return data


class PatientVisitRegistrationSerializer(serializers.Serializer):
    """
    Nested serializer used only during Patient registration to accept
    one or more visit records in the incoming payload.
    """

    visit_type = serializers.CharField()
    present_complaint = serializers.CharField(required=False, allow_blank=True)
    test_requested = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
    notes = serializers.CharField(required=False, allow_blank=True)
    seen_by = serializers.IntegerField(required=False, allow_null=True)

    def validate_seen_by(self, value):
        if value in (None, ""):
            return None
        try:
            return User.objects.get(pk=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid 'seen_by' user id.")


# 2. Main Serializer for Registration
class PatientRegistrationSerializer(serializers.ModelSerializer):
    """
    Register a patient together with one or more visit records.

    Matches payload structure provided from frontend.
    """

    # Root-level extra fields (not stored on Patient model) but used for each visit
    service_type = serializers.CharField(
        write_only=True,
        required=True,
        error_messages={'required': "Service type is mandatory."},
    )
    appointment_date = serializers.DateField(write_only=True, required=False)

    # Nested list of visit records
    visit_details = PatientVisitRegistrationSerializer(many=True, write_only=True)

    class Meta:
        model = Patient
        fields = [
            'id', 'name', 'age', 'dob', 'email', 'gender',
            'phone_primary', 'phone_secondary', 'city', 'address',
            'referral_type', 'referral_doctor',
            'service_type', 'appointment_date',
            'visit_details'  # Include the nested field
        ]
        read_only_fields = ['created_at', 'updated_at', 'created_by', 'clinic']

    def validate_phone_primary(self, value):
        if not re.fullmatch(r'\d{10}', (value or '').strip()):
            raise serializers.ValidationError("Primary Phone must be exactly 10 digits.")
        return value

    def validate_phone_secondary(self, value):
        if value in (None, ''):
            return value
        if not re.fullmatch(r'\d{10}', value.strip()):
            raise serializers.ValidationError("Secondary Phone must be exactly 10 digits if provided.")
        return value

    # -- Added email uniqueness validation --
    def validate_email(self, value):
        # Allow blank/null emails to pass (model allows blank)
        if not value:
            return value
        # Case-insensitive check for existing patient email
        if Patient.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value

    def create(self, validated_data):
        # A. Extract visit list and common visit fields from the payload
        visits_data = validated_data.pop('visit_details', [])
        service_type = validated_data.pop('service_type', None)
        appointment_date = validated_data.pop('appointment_date', None)

        # B. Get User and Clinic info from the request context (passed from View)
        request = self.context.get('request')
        current_user = request.user if request else None
        # For this example, we assume the logged-in user belongs to a clinic.
        current_clinic = getattr(request.user, 'clinic', None)

        # C. Atomic Transaction
        with transaction.atomic():
            # 1. Create the Patient
            # We manually add created_by here since it's read_only in the serializer
            patient = Patient.objects.create(
                created_by=current_user,
                clinic=current_clinic,  # Inherit clinic from logged-in user
                **validated_data
            )

            # 2. Create one PatientVisit per item in visits_data
            for visit_data in visits_data:
                visit_type = visit_data.get('visit_type')
                if visit_type in ['TGA / Machine Check', 'Battery Purchase', 'Tip / Dome Change']:
                    status_value = 'Pending for Service'
                else:
                    status_value = 'Test pending'

                # Map seen_by (User instance) and test_requested (list -> CSV string)
                
                seen_by_user = visit_data.pop('seen_by', None)
                if seen_by_user is None:
                    seen_by_user = current_user
                test_requested = visit_data.pop('test_requested', [])
                if isinstance(test_requested, list):
                    test_requested = ",".join(test_requested) if test_requested else ""

                PatientVisit.objects.create(
                    patient=patient,
                    clinic=patient.clinic,  # Inherit clinic from patient
                    status=status_value,
                    service_type=service_type or None,
                    appointment_date=appointment_date,
                    seen_by=seen_by_user,
                    test_requested=test_requested,
                    **visit_data
                )

        return patient
    

# Edit Patient record 
class PatientDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = [
             'name', 'age', 'dob', 'email', 'gender','phone_primary', 'phone_secondary', 'city', 'address',
            'referral_type', 'referral_doctor'
        ]               
    
# Flat List Serializer for dropdowns and search
class PatientListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = [
            'id', 'name' , 'email', 'phone_primary']


class DoctorListSerializer(serializers.ModelSerializer):
    designation = serializers.SerializerMethodField()


    def get_designation(self, obj):
        """
        With single role per user, designation is simply the role name.
        """
        if not getattr(obj, "role", None):
            return ""
        return obj.role.name

    class Meta:
        model = User
        fields = [
            'id', 'name', 'designation'
        ]


# All PAtient visit list 
class PatientVisitSerializer(serializers.ModelSerializer):
    patient_id = serializers.IntegerField(source='patient.id', read_only=True)
    patient_name = serializers.CharField(source='patient.name', read_only=True)
    patient_phone = serializers.CharField(source='patient.phone_primary', read_only=True)
    visit_id = serializers.IntegerField(source='id', read_only=True)
    seen_by = serializers.SerializerMethodField()

    def get_seen_by(self, obj):
        if obj.seen_by is None:
            return None
        return obj.seen_by.name

    class Meta:
        model = PatientVisit
        fields = [
            'visit_id',
            'visit_type', 
            'service_type',
            'seen_by',
            'appointment_date',
            'status',
            'patient_id',
            'patient_name',
            'patient_phone'
        ]
        

class PatientUpdateSerializer(serializers.ModelSerializer):
    # latest visit details
    latest_visit = serializers.SerializerMethodField()
    # total visits count
    total_visits = serializers.SerializerMethodField()


    def get_latest_visit(self, obj):
        latest = obj.visits.order_by('-id').first()
        if latest:
            return PatientVisitSerializer(latest).data
        return None

    def get_total_visits(self, obj):
         return obj.visits.count()

    class Meta:
        model = Patient
        fields = [
            'id', 'name', 'age', 'dob', 'email', 'gender','phone_primary', 'phone_secondary', 'city', 'address',
            'referral_type', 'referral_doctor', 'created_at', 'updated_at', 'latest_visit', 'total_visits'
        ]

    
    
class PatientVisitCreateSerializer(serializers.Serializer):
    """
    Create one or more visits for an EXISTING patient.

    Expected payload:
    {
        "patient": 3,
        "service_type": "Clinic",
        "appointment_date": "2025-11-27",
        "visit_details": [
            { ... visit fields ... },
            { ... visit fields ... }
        ]
    }
    """

    patient = serializers.PrimaryKeyRelatedField(queryset=Patient.objects.all())
    service_type = serializers.CharField(write_only=True, required=False, allow_blank=True)
    appointment_date = serializers.DateField(write_only=True, required=False)
    visit_details = PatientVisitRegistrationSerializer(many=True, write_only=True)

    def create(self, validated_data):
        request = self.context.get('request')
        current_clinic = getattr(request.user, 'clinic', None) if request else None
        current_user = request.user if request else None

        patient = validated_data.get('patient')
        service_type = validated_data.get('service_type')
        appointment_date = validated_data.get('appointment_date')
        visits_data = validated_data.get('visit_details', [])

        created_visits = []

        with transaction.atomic():
            for visit_data in visits_data:
                visit_type = visit_data.get('visit_type')
                if visit_type in ['Battery Purchase', 'Tip / Dome Change']:
                    status_value = 'Pending for Service'
                else:
                    status_value = 'Test pending'

                # `seen_by` has already been validated by PatientVisitRegistrationSerializer
                seen_by_user = visit_data.pop('seen_by', None)
                if seen_by_user is None:
                    seen_by_user=current_user

                # Convert list of tests to CSV string for storage on the model
                test_requested = visit_data.pop('test_requested', [])
                if isinstance(test_requested, list):
                    test_requested = ",".join(test_requested) if test_requested else ""

                visit = PatientVisit.objects.create(
                    patient=patient,
                    clinic=current_clinic or patient.clinic,
                    status=status_value,
                    service_type=service_type or None,
                    appointment_date=appointment_date,
                    seen_by=seen_by_user,
                    test_requested=test_requested,
                    **visit_data
                )
                created_visits.append(visit)

        # View does not use serializer.data, so returning list is fine
        return created_visits
    
# Edit Patient Visit Serializer (used in Update View)
class PatientVisitUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientVisit
        fields = [
            'visit_type', 
            'present_complaint', 
            'test_requested', 
            'notes', 
            'appointment_date'
        ]


# Serializers for Audiologist Workflow
class AudiologistCaseHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = AudiologistCaseHistory
        fields = '__all__'
        read_only_fields = ['created_by']

class VisitTestPerformedSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisitTestPerformed
        fields = '__all__'

class TrialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trial
        fields = '__all__'
        read_only_fields = ['clinic']


class AudiologistQueueSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.name', read_only=True)
    patient_phone = serializers.CharField(source='patient.phone_primary', read_only=True)
    visit_id = serializers.IntegerField(source='id', read_only=True)
    referral_type = serializers.CharField(source='patient.referral_type', read_only=True)
    referral_doctor = serializers.CharField(source='patient.referral_doctor', read_only=True)


    # present_complaint = serializers.CharField()
    # test_requested = serializers.CharField()

    class Meta:
        model = PatientVisit
        fields = [
            'visit_id',
            'patient_name',
            'patient_phone',
            'visit_type',
            'present_complaint',
            'test_requested',
            'status',
            # 'appointment_date',
            'referral_type',
            'referral_doctor'
        ]


# Case History Fill of Patient for Audiologist when test requested is OAE
class AudiologistCaseHistoryViewSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='visit.patient.name', read_only=True)
    patient_phone = serializers.CharField(source='visit.patient.phone_primary', read_only=True)
    visit_id = serializers.IntegerField(source='visit.id', read_only=True)

    class Meta:
        model = AudiologistCaseHistory
        fields = [
            'id',
            'visit_id',
            'patient_name',
            'patient_phone',
            'medical_history',
            'family_history',
            'noise_exposure',
            'previous_ha_experience',
            'red_flags',
            'created_at'
        ]
        
