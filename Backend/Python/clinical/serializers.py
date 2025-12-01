
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

# 2. Main Serializer for Registration
class PatientRegistrationSerializer(serializers.ModelSerializer):
    # Define the nested field (write_only because we don't need to read it back in this specific structure usually)
    visit_details = PatientAllVisitSerializer(write_only=True)

    class Meta:
        model = Patient
        fields = [
            'id', 'name', 'age', 'dob', 'email', 'gender', 
            'phone_primary', 'phone_secondary', 'city', 'address', 
            'referral_type', 'referral_doctor', 
            'visit_details' # Include the nested field
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
        # A. Extract the visit data from the payload
        visit_data = validated_data.pop('visit_details')

        # B. Get User and Clinic info from the request context (passed from View)
        request = self.context.get('request')
        current_user = request.user if request else None
        # Assuming the user profile has a clinic, or you send clinic_id in the body. 
        # For this example, we assume the logged-in user belongs to a clinic.
        # current_clinic = current_user.profile.clinic if current_user else None 
        current_clinic = getattr(request.user, 'clinic', None)

        visit_type = visit_data.get('visit_type')
        if visit_type in ['TGA / Machine Check', 'Battery Purchase', 'Tip / Dome Change']:
            status_value = 'Pending for Service'
        else:
            status_value = 'Test pending'
                   
        # C. Atomic Transaction
        with transaction.atomic():
            # 1. Create the Patient
            # We manually add created_by here since it's read_only in the serializer
            patient = Patient.objects.create(
                created_by=current_user, 
                clinic=current_clinic, # Uncomment if you have logic to fetch clinic
                **validated_data
            )

            # 2. Create the PatientVisit linked to this Patient
            PatientVisit.objects.create(
                patient=patient,
                clinic=patient.clinic, # Inherit clinic from patient
                status=status_value,      # Default status
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
        print(obj.roles.all())
        # if 2 roles, then return both ( Audiologist and Speech Therapist ) else return the first role
        if obj.roles.all().count() == 2:
            return "Both"
        else:
            return "Audiologist" if obj.roles.all().filter(name='Audiologist').exists() else "Speech Therapist"

    class Meta:
        model = User
        fields = [
            'id', 'name', 'designation'
        ]

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

    
    
class PatientVisitCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientVisit
        fields = [
            'patient',  # Expecting patient ID to link the visit
            'visit_type', 
            'present_complaint', 
            'test_requested', 
            'notes', 
            'appointment_date'
        ]
    
    def create(self, validated_data):
        request = self.context.get('request')
        current_clinic = getattr(request.user, 'clinic', None)

        visit_type = validated_data.get('visit_type')
        if visit_type in ['TGA / Machine Check', 'Battery Purchase', 'Tip / Dome Change']:
            status_value = 'Pending for Service'
        else:
            status_value = 'Test pending'
                   
        return PatientVisit.objects.create(
            clinic=current_clinic,
            status=status_value,
            **validated_data
        )
    
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

# Audiologist Queueu
# Patient Name
# Complaint
# Tests Required
# Referral Type
class AudiologistQueueSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.name', read_only=True)
    patient_phone = serializers.CharField(source='patient.phone_primary', read_only=True)
    # present_complaint = serializers.CharField()
    # test_requested = serializers.CharField()

    class Meta:
        model = PatientVisit
        fields = [
            'id',
            'patient_name',
            'patient_phone',
            'visit_type',
            'present_complaint',
            'test_requested',
            'status',
            'appointment_date',
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
        
