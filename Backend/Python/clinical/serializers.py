
from .models import Patient, PatientVisit
from rest_framework import serializers
from django.db import transaction
import re

class PatientVisitSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientVisit
        fields = [
            'id',
            'visit_type', 
            # 'purpose_of_visit', 
            'present_complaint', 
            'test_requested', 
            'notes', 
            # 'seen_by',
            'appointment_date'
        ]

# 2. Main Serializer for Registration
class PatientRegistrationSerializer(serializers.ModelSerializer):
    # Define the nested field (write_only because we don't need to read it back in this specific structure usually)
    visit_details = PatientVisitSerializer(write_only=True)

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
                status='pending',      # Default status
                **visit_data
            )

        return patient
    

class PatientListRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = [
            'id', 'name', 'age', 'email','phone_primary', 'city']
        

class PatientDetailSerializer(serializers.ModelSerializer):
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

    
    
