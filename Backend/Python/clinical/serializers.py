from .models import (
    Patient,
    PatientVisit,
    AudiologistCaseHistory,
    VisitTestPerformed,
    Trial,
    TestType,
    Bill,
    BillItem,
    InventorySerial,
    InventoryItem,
    ServiceVisit,
    PatientPurchase,
    TestUpload,
    InventoryTransfer, 
    Brand,  
    ModelType

)

from accounts.models import Clinic
from rest_framework import serializers
from django.db import transaction
import re
from datetime import timedelta
from accounts.models import User
from accounts.serializers import RoleSimpleSerializer
from rest_framework import status


class PatientAllVisitSerializer(serializers.ModelSerializer):
    # Tell DRF what you expect from the API (list of strings)
    seen_by = serializers.CharField(source='seen_by.name', read_only=True)
    test_requested = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )

    total_bill = serializers.SerializerMethodField()
    payment_status = serializers.SerializerMethodField()
    completed_date = serializers.SerializerMethodField()
    trial_details = serializers.SerializerMethodField()

    def get_payment_status(self, obj):
        # get the payment status from Bill
        bills = Bill.objects.filter(visit=obj)
        if bills.exists() and all(bill.payment_status == 'Paid' or bill.payment_status == 'Partially Paid' for bill in bills):
            return 'Paid'
        return 'Pending'


    def get_trial_details(self, obj):
        trial = Trial.objects.filter(visit=obj).first()
        if not trial:
            return None
        
        return {
            'start_date': trial.trial_start_date,
            'end_date': trial.trial_end_date,
            'extended': trial.extended_trial,
            'extended_at': trial.trial_completed_at if trial.extended_trial else None,
            'device': {
                'id': trial.device_inventory_id.id if trial.device_inventory_id else None,
                'name': trial.device_inventory_id.product_name if trial.device_inventory_id else None,
                'serial_number': trial.serial_number
           
             }
        } 


    def get_total_bill(self, obj):
        from django.db.models import Sum
        return Bill.objects.filter(visit=obj).aggregate(total_amount=Sum('total_amount'))['total_amount'] or 0

    def get_completed_date(self, obj):
        from django.db.models import Max
        # Check if all bills for this visit are paid
        bills = Bill.objects.filter(visit=obj)
        if bills.exists() and all(bill.payment_status == 'Paid' or bill.payment_status == 'Partially Paid' for bill in bills):
            # Return the latest payment date
            latest_payment = bills.aggregate(latest_date=Max('paid_at'))['latest_date']
            return latest_payment
        return None

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
            'appointment_date',
            'total_bill',
            'status', 
            'status_note',
            'trial_details',
            'completed_date',
            'payment_status'
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
        print(value)
        if value in (None, "",0):
            return 0
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
        # if Patient.objects.filter(email__iexact=value).exists():
        #     raise serializers.ValidationError("Email already exists.")
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
                if visit_type in ['Troubleshooting General Adjustment','TGA']:
                    status_value = 'Pending for Service'
                    status_note = 'Waiting for service to be completed'
                else:
                    status_value = 'Test pending'
                    status_note = 'Waiting for audiologist availability'

                # Map seen_by (User instance) and test_requested (list -> CSV string)
                
                seen_by_user = visit_data.pop('seen_by') # 0 is the default value if seen_by is not provided
                if seen_by_user == 0:
                    seen_by_user = current_user
                test_requested = visit_data.pop('test_requested', [])
                if isinstance(test_requested, list):
                    test_requested = ",".join(test_requested) if test_requested else ""

                PatientVisit.objects.create(
                    patient=patient,
                    clinic=patient.clinic,  # Inherit clinic from patient
                    status=status_value,
                    status_note=status_note,
                    service_type=service_type or None,
                    appointment_date=appointment_date,
                    seen_by=seen_by_user,
                    test_requested=test_requested,
                    **visit_data
                )

        return patient
    

# Edit Patient record 
class PatientDetailSerializer(serializers.ModelSerializer):
    total_visits = serializers.SerializerMethodField()
    total_bill = serializers.SerializerMethodField()
    case_history = serializers.SerializerMethodField()

    def get_total_bill(self, obj):
        from django.db.models import Sum
        return Bill.objects.filter(visit__patient=obj).aggregate(total_amount=Sum('total_amount'))['total_amount'] or 0

    def get_total_visits(self, obj):
        return PatientVisit.objects.filter(patient=obj).count()
    
    def get_case_history(self, obj):
        try:
            case_history = AudiologistCaseHistory.objects.get(patient=obj)
            return AudiologistCaseHistorySerializer(case_history).data
        except AudiologistCaseHistory.DoesNotExist:
            return None

    class Meta:
        model = Patient
        fields = [
             'name', 'age', 'dob', 'email', 'gender','phone_primary', 'phone_secondary', 'city', 'address',
            'referral_type', 'referral_doctor', 'total_visits', 'total_bill', 'case_history'
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

    def __init__(self, *args, **kwargs):
        # Check if this serializer is being used by PatientVisitFollowupView
        self.show_contacted_fields = kwargs.pop('show_contacted_fields', False)
        super().__init__(*args, **kwargs)

    def get_fields(self):
        fields = super().get_fields()
        
        # Only show contact fields when used by PatientVisitFollowupView
        if self.show_contacted_fields:
            fields['contacted'] = serializers.BooleanField(read_only=True)
            fields['contacted_by'] = serializers.IntegerField(read_only=True, source='contacted_by.id')
            fields['contacted_by_name'] = serializers.CharField(read_only=True,source='contacted_by.name')
        
        return fields

    class Meta:
        model = PatientVisit
        fields = [
            'visit_id',
            'visit_type', 
            'service_type',
            'seen_by',
            'appointment_date',
            'status',
            'status_note',
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
                if visit_type in ['Battery Purchase', 'Tip / Dome Change', 'TGA']:
                    status_value = 'Pending for Service'
                else: #  For new test , followup tests
                    status_value = 'Test pending'

                # `seen_by` has already been validated by PatientVisitRegistrationSerializer
                seen_by_user = visit_data.pop('seen_by', 0)
                if seen_by_user == 0:
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
        fields = [
            # 'id',
            # 'patient',
            'medical_history',
            'family_history',
            'noise_exposure',
            'previous_ha_experience',
            'red_flags',
        ]
        # read_only_fields = ['created_by']

class VisitTestPerformedSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisitTestPerformed
        fields = '__all__'

class TestUploadSerializer(serializers.ModelSerializer):
    file_url = serializers.CharField(source='file_path', read_only=True)
    
    class Meta:
        model = TestUpload
        fields = ['id', 'file_type', 'file_url', 'created_at']

class TrialSerializer(serializers.ModelSerializer):
    device_details = serializers.SerializerMethodField()
    
    def get_device_details(self, obj):
        if obj.device_inventory_id:
            return {
                'id': obj.device_inventory_id.id,
                'brand': obj.device_inventory_id.brand,
                'model_type': obj.device_inventory_id.model_type,
                'category': obj.device_inventory_id.category
            }
        return None
    
    class Meta:
        model = Trial
        fields = '__all__'
        read_only_fields = ['clinic']


# Comprehensive Visit Details Serializer with Tests and Trials
class PatientVisitFullDetailsSerializer(serializers.ModelSerializer):
    """Comprehensive serializer for patient visit details including tests performed and trials"""
    
    # Patient information
    # patient_id = serializers.IntegerField(source='patient.id', read_only=True)
    # patient_name = serializers.CharField(source='patient.name', read_only=True)
    # patient_phone = serializers.CharField(source='patient.phone_primary', read_only=True)
    # patient_email = serializers.EmailField(source='patient.email', read_only=True)
    # patient_age = serializers.IntegerField(source='patient.age', read_only=True)
    # patient_gender = serializers.CharField(source='patient.gender', read_only=True)
    # patient_address = serializers.CharField(source='patient.address', read_only=True)
    # patient_city = serializers.CharField(source='patient.city', read_only=True)
    
    # Seen by doctor information
    seen_by_name = serializers.CharField(source='seen_by.name', read_only=True)
    
    # Case history
    case_history = AudiologistCaseHistorySerializer(source='patient.case_history', read_only=True)
    
    # Conditional data based on visit type
    tests_performed = serializers.SerializerMethodField()
    test_uploads = serializers.SerializerMethodField()
    trials = serializers.SerializerMethodField()
    service_visit = serializers.SerializerMethodField()
    
    # Bill information
    bill_details = serializers.SerializerMethodField()
    
    def get_tests_performed(self, obj):
        """Get tests performed for this visit (only for test-related visits)"""
        if obj.visit_type not in ['TGA', 'Machine Check', 'Battery Purchase', 'Tip / Dome Change']:
            test_performed = VisitTestPerformed.objects.filter(visit=obj).first()
            if test_performed:
                return VisitTestPerformedSerializer(test_performed).data
        return None
    
    def get_test_uploads(self, obj):
        """Get all test upload files for this visit (only for test-related visits)"""
        if obj.visit_type not in ['TGA', 'Machine Check', 'Battery Purchase', 'Tip / Dome Change']:
            test_performed = VisitTestPerformed.objects.filter(visit=obj).first()
            if test_performed:
                uploads = TestUpload.objects.filter(visit=test_performed).order_by('-created_at')
                return TestUploadSerializer(uploads, many=True).data
        return []
    
    def get_trials(self, obj):
        """Get all trials for this visit (only for test-related visits)"""
        if obj.visit_type not in ['TGA', 'Machine Check', 'Battery Purchase', 'Tip / Dome Change']:
            trials = Trial.objects.filter(visit=obj).order_by('-created_at')
            return TrialSerializer(trials, many=True).data
        return []
    
    def get_service_visit(self, obj):
        """Get service visit details for TGA and service-related visits"""
        if obj.visit_type in ['TGA', 'Machine Check', 'Battery Purchase', 'Tip / Dome Change']:
            try:
                service_visit = ServiceVisit.objects.get(visit=obj)
                return {
                    'id': service_visit.id,
                    'service_type': service_visit.service_type,
                    'status': service_visit.status,
                    'complaint': service_visit.complaint,
                    'action_taken': service_visit.action_taken,
                    'action_taken_on': service_visit.action_taken_on,
                    'warranty_applicable': service_visit.warranty_applicable,
                    'charges_collected': service_visit.charges_collected,
                    'rtc_date': service_visit.rtc_date,
                    'device': {
                        'id': service_visit.device.id,
                        'inventory_item': service_visit.device.inventory_item.product_name if service_visit.device.inventory_item else None,
                        'purchased_at': service_visit.device.purchased_at
                    } if service_visit.device else None,
                    'parts_used': [
                        {
                            'id': part.id,
                            'inventory_item': part.inventory_item.product_name,
                            'quantity': part.quantity
                        } for part in service_visit.parts_used.all()
                    ]
                }
            except ServiceVisit.DoesNotExist:
                return None
        return None
    
    def get_bill_details(self, obj):
        """Get bill details for this visit"""
        try:
            bill = Bill.objects.get(visit=obj)
            return {
                'bill_id': bill.id,
                'bill_number': bill.bill_number,
                'total_amount': bill.total_amount,
                'discount_amount': bill.discount_amount,
                'final_amount': bill.final_amount,
                'payment_status': bill.payment_status,
                'payment_method': bill.payment_method if bill.payment_status in ['Paid', 'Partially Paid'] else None,
                'created_at': bill.created_at
            }
        except Bill.DoesNotExist:
            return None
    
    def to_representation(self, instance):
        """Convert test_requested string to list"""
        data = super().to_representation(instance)
        stored_value = instance.test_requested or ""
        data["test_requested"] = (
            stored_value.split(",") if stored_value else []
        )
        return data
    
    class Meta:
        model = PatientVisit
        fields = [
            'id', 'visit_type', 'service_type', 'present_complaint', 'test_requested',
            'notes', 'status', 'status_note', 'appointment_date',
            # # Patient information
            # 'patient_id', 'patient_name', 'patient_phone', 'patient_email', 
            # 'patient_age', 'patient_gender', 'patient_address', 'patient_city',
            # Doctor information
            'seen_by_name',
            # Clinical data (conditional based on visit type)
            'case_history', 'tests_performed', 'test_uploads', 'trials', 'service_visit',
            # Billing
            'bill_details'
        ]


class AudiologistQueueSerializer(serializers.ModelSerializer):
    
    patient_id = serializers.IntegerField(source='patient.id', read_only=True)
    patient_name = serializers.CharField(source='patient.name', read_only=True)
    # patient_phone = serializers.CharField(source='patient.phone_primary', read_only=True)
    visit_id = serializers.IntegerField(source='id', read_only=True)
    # referral_type = serializers.CharField(source='patient.referral_type', read_only=True)
    # referral_doctor = serializers.CharField(source='patient.referral_doctor', read_only=True)
    # service_type = serializers.CharField(source='service_type', read_only=True)

    def to_representation(self, instance):
        """Convert string → list for output"""
        data = super().to_representation(instance)

        stored_value = instance.test_requested or ""

        data["test_requested"] = (
            stored_value.split(",") if stored_value else []
        )
        return data


    # present_complaint = serializers.CharField()
    # test_requested = serializers.CharField()

    class Meta:
        model = PatientVisit
        fields = [
            'visit_id',
            'patient_id',
            'patient_name',
            # 'patient_phone',
            'visit_type',
            'present_complaint',
            'test_requested',
            # 'status',
            'appointment_date',
            # 'referral_type',
            # 'referral_doctor',
            'service_type'
        ]


# Visit record of Patient with case history record of a patient
class PatientVisitWithCaseHistorySerializer(serializers.ModelSerializer):
    visit_id = serializers.IntegerField(source='id', read_only=True)
    patient_id = serializers.IntegerField(source='patient.id', read_only=True)
    patient_name = serializers.CharField(source='patient.name', read_only=True)
    patient_phone = serializers.CharField(source='patient.phone_primary', read_only=True)
    referral_type = serializers.CharField(source='patient.referral_type', read_only=True)
    referral_doctor = serializers.CharField(source='patient.referral_doctor', read_only=True)
    case_history = AudiologistCaseHistorySerializer(source='patient.case_history', read_only=True)


    def to_representation(self, instance):
        data = super().to_representation(instance)
        # test requested to list
        stored_value = instance.test_requested or ""
        data["test_requested"] = (
            stored_value.split(",") if stored_value else []
        )
        return data


    class Meta:
        model = PatientVisit
        fields = [
            'visit_id',
            'patient_id',
            'patient_name',
            'patient_phone',
            'visit_type',
            'present_complaint',
            'test_requested',
            'referral_type',
            'referral_doctor',
            'service_type',
            'case_history'
        ]


# Case History Fill of Patient for Audiologist when test requested 
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


class AudiologistCaseHistoryCreateSerializer(serializers.ModelSerializer):
    """
    Simple payload to create:
      - AudiologistCaseHistory (linked to Patient, one per patient)
      - VisitTestPerformed (test flags, linked to PatientVisit)
      - TestUpload records (uploaded reports)

    # Serializer for AudiologistCaseHistory creation with nested VisitTestPerformed model and TestUpload file list.
    #
    # Expected payload example:
    # {
    #     "visit": 1,       // Required: Visit ID for VisitTestPerformed and report files
    #     "medical_history": "...",
    #     "family_history": "...",
    #     "noise_exposure": "...",
    #     "previous_ha_experience": "...",
    #     "red_flags": "...",
    #     "test_requested": ["pta", "oae"],    // List of test flags performed, sets VisitTestPerformed model fields
    #     
    # }
    # Usage:
    # - On create, it will
    #   (a) create AudiologistCaseHistory (or update if exists for patient)
    #   (b) create VisitTestPerformed for the visit with test flags from 'test_requested'
    
    Note: Case history is linked to Patient (one per patient), but tests and billing
    are linked to the specific Visit.
    """

    # Visit field is needed for VisitTestPerformed and billing, but not stored in AudiologistCaseHistory
    visit = serializers.PrimaryKeyRelatedField(
        queryset=PatientVisit.objects.all(),
        write_only=True,
        help_text="Visit ID for test performed and billing"
    )

    # List of test flags - converts to boolean fields on VisitTestPerformed
    test_requested = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True,
        write_only=True,
        help_text="List of test flags performed, e.g., ['pta', 'oae', 'srt']. Valid values: pta, immittance, oae, bera_assr, srt, sds, ucl, free_field"
    )
    
    class Meta:
        model = AudiologistCaseHistory
        fields = [
            'patient',  # This is not required in the payload anymore, but required as model field; we will set it in create().
            'visit',    # Keep as write_only for VisitTestPerformed and billing
            'medical_history',
            'family_history',
            'noise_exposure',
            'previous_ha_experience',
            'red_flags',
            # VisitTestPerformed fields
            'test_requested'  # List of test flags
        ]

    def create(self, validated_data):
        """
        1. Create/Update AudiologistCaseHistory (linked to Patient, one per patient)
        2. Create VisitTestPerformed (if any test field is set, linked to Visit)
        3. Create / update Bill and BillItem rows based on tests performed
        # 4. Update PatientVisit status to 'test_performed'
        """
        from .models import TestUpload

        # Extract visit (needed for VisitTestPerformed and billing, but not stored in case history)
        visit = validated_data.pop('visit', None)
        if not visit:
            raise serializers.ValidationError({"visit": "Visit ID is required for test performed and billing."})

        # Get the patient from the visit, override any patient present in the payload
        patient = visit.patient

        # Remove any 'patient' from validated_data if present, to avoid conflicts in get_or_create (we'll add it manually)
        validated_data.pop('patient', None)

        # Extract test_requested list and convert to boolean fields for VisitTestPerformed
        test_requested = validated_data.pop('test_requested', [])
        
        # Valid test field names (case-insensitive mapping)
        valid_test_fields = {
            'pta': 'pta',
            'immittance': 'immittance',
            'oae': 'oae',
            'bera_assr': 'bera_assr',
            'bera/assr': 'bera_assr',  # Allow alternative format
            'srt': 'srt',
            'sds': 'sds',
            'ucl': 'ucl',
            'free_field': 'free_field',
            'freefield': 'free_field',  # Allow alternative format
        }
        
        # Convert test_requested list to boolean fields
        test_performed_data = {
            'pta': False,
            'immittance': False,
            'oae': False,
            'bera_assr': False,
            'srt': False,
            'sds': False,
            'ucl': False,
            'free_field': False,
        }
        
        # Set True for tests in the test_requested list
        for test_name in test_requested:
            test_key = valid_test_fields.get(test_name.lower().strip())
            if test_key:
                test_performed_data[test_key] = True
        
    

        # Map VisitTestPerformed boolean fields -> TestType names
        flag_to_testtype_name = {
            'pta': 'PTA',
            'immittance': 'Immittance',
            'oae': 'OAE',
            'bera_assr': 'BERA/ASSR',
            'srt': 'SRT',
            'sds': 'SDS',
            'ucl': 'UCL',
            'free_field': 'Free Field',
        }

        request = self.context.get('request')

        with transaction.atomic():
            # 1. Create or update AudiologistCaseHistory instance (one per patient)
            # Use get_or_create since case history should be one per patient
            case_history, created = AudiologistCaseHistory.objects.get_or_create(
                patient=patient,
                defaults={
                    'created_by': getattr(request, 'user', None) if request else None,
                    **validated_data
                }
            )
            
            # If case history already exists, update only the specified fields
            if not created:
                fields_to_update = [
                    'medical_history',
                    'family_history',
                    'noise_exposure',
                    'previous_ha_experience',
                    'red_flags',
                ]
                for key in fields_to_update:
                    if key in validated_data:
                        setattr(case_history, key, validated_data[key])
                case_history.save(update_fields=fields_to_update)

            # 2. Create or update VisitTestPerformed only if something meaningful is set
            # Check if any boolean test field is True, or if other_test is provided
            boolean_test_fields = ['pta', 'immittance', 'oae', 'bera_assr', 'srt', 'sds', 'ucl', 'free_field']
            has_any_test = any(test_performed_data.get(field, False) for field in boolean_test_fields) or bool(test_performed_data.get('other_test'))
            test_performed_instance = None
            if has_any_test:
                # Check if VisitTestPerformed already exists for this visit
                if VisitTestPerformed.objects.filter(visit=visit).exists():

                    raise serializers.ValidationError({
                        "status": status.HTTP_400_BAD_REQUEST,
                        "error": "Test record already exists for this visit"
                    })
                
                test_performed_instance = VisitTestPerformed.objects.create(
                    visit=visit,  # Use the extracted visit, not case_history.visit
                    **test_performed_data
                )

            # 3. Billing: create / update Bill and BillItems for each test
            if test_performed_instance:
                clinic = getattr(visit, 'clinic', None)

                # Get or create a Bill for this visit
                bill, _ = Bill.objects.get_or_create(
                    visit=visit,  # Use the extracted visit
                    defaults={
                        'clinic': clinic,
                        'created_by': getattr(request, 'user', None) if request else None,
                    },
                )

                # For each True flag in VisitTestPerformed, add a BillItem
                for field_name, testtype_name in flag_to_testtype_name.items():
                    if getattr(test_performed_instance, field_name, False):
                        try:
                            test_type = TestType.objects.get(name__iexact=testtype_name)
                        except TestType.DoesNotExist:
                            # Skip if no configured TestType for this test
                            continue

                        BillItem.objects.create(
                            bill=bill,
                            item_type='Test',
                            test_type=test_type,
                            description=test_type.name,
                            cost=test_type.cost,
                            quantity=1,
                        )

                # Also handle "other_test" if you have a configured TestType with that name
                other_test_name = test_performed_instance.other_test
                if other_test_name:
                    try:
                        other_test_type = TestType.objects.get(name__iexact=other_test_name)
                        BillItem.objects.create(
                            bill=bill,
                            item_type='Test',
                            test_type=other_test_type,
                            description=other_test_type.name,
                            cost=other_test_type.cost,
                            quantity=1,
                        )
                    except TestType.DoesNotExist:
                        # If no TestType exists for this free-text test, skip billing
                        pass

                # Recalculate totals explicitly (BillItem.save also does this, but this is safe)
                bill.calculate_total()

            # 4. Update PatientVisit status to 'test_performed'
            if test_performed_instance:
                visit.status = 'Test Performed'
                visit.status_note = 'Test Performed by Audiologist'
                visit.save(update_fields=['status', 'status_note'])

        return case_history


# ============================================================================
# BILL SERIALIZERS
# ============================================================================

class BillListSerializer(serializers.ModelSerializer):
    """Compact bill summary for listing screens"""
    patient_id = serializers.IntegerField(source='visit.patient.id', read_only=True)
    patient_name = serializers.CharField(source='visit.patient.name', read_only=True)
    patient_phone = serializers.CharField(source='visit.patient.phone_primary', read_only=True)
    visit_id = serializers.IntegerField(source='visit.id', read_only=True)
    visit_date = serializers.DateField(source='visit.appointment_date', read_only=True)

    class Meta:
        model = Bill
        fields = [
            'id',
            'bill_number',
            'payment_status',
            'final_amount',
            'created_at',
            'patient_id',
            'patient_name',
            'patient_phone',
            'visit_id',
            'visit_date',
        ]
    
    def to_representation(self, instance):
        """Override to conditionally include payment fields"""
        data = super().to_representation(instance)
        
        # Only add payment fields if bill is paid or partially paid
        if instance.payment_status in ['Paid', 'Partially Paid']:
            data['payment_method'] = instance.payment_method
            data['transaction_id'] = instance.transaction_id
            data['paid_at'] = instance.paid_at
        
        return data



class BillItemSerializer(serializers.ModelSerializer):
    """Serializer for individual bill items"""
    test_type_name = serializers.CharField(source='test_type.name', read_only=True)
    test_type_code = serializers.CharField(source='test_type.code', read_only=True)
    trial_brand = serializers.CharField(source='trial.brand', read_only=True)
    trial_model = serializers.CharField(source='trial.model', read_only=True)
    item_total = serializers.SerializerMethodField()

    def get_item_total(self, obj):
        """Calculate total for this item (cost * quantity)"""
        return float(obj.cost * obj.quantity)

    class Meta:
        model = BillItem
        fields = [
            'id',
            'item_type',
            'test_type',
            'test_type_name',
            'test_type_code',
            'trial',
            'trial_brand',
            'trial_model',
            'description',
            'cost',
            'quantity',
            'item_total',
            'created_at',
        ]


class BillDetailSerializer(serializers.ModelSerializer):
    """Complete bill serializer with all details for frontend display"""
    # Patient information
    patient_id = serializers.IntegerField(source='visit.patient.id', read_only=True)
    patient_name = serializers.CharField(source='visit.patient.name', read_only=True)
    patient_phone = serializers.CharField(source='visit.patient.phone_primary', read_only=True)
    patient_email = serializers.EmailField(source='visit.patient.email', read_only=True)
    patient_address = serializers.CharField(source='visit.patient.address', read_only=True)
    patient_city = serializers.CharField(source='visit.patient.city', read_only=True)

    # Visit information
    visit_id = serializers.IntegerField(source='visit.id', read_only=True)
    visit_type = serializers.CharField(source='visit.visit_type', read_only=True)
    visit_date = serializers.DateTimeField(source='visit.created_at', read_only=True)
    appointment_date = serializers.DateField(source='visit.appointment_date', read_only=True)
    service_type = serializers.CharField(source='visit.service_type', read_only=True)

    # Clinic information
    clinic_name = serializers.CharField(source='clinic.name', read_only=True)
    clinic_address = serializers.CharField(source='clinic.address', read_only=True)
    clinic_phone = serializers.CharField(source='clinic.phone', read_only=True)

    # Bill items
    bill_items = BillItemSerializer(many=True, read_only=True)

    # Calculated fields
    items_count = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()

    def get_items_count(self, obj):
        """Total number of items in the bill"""
        return obj.bill_items.count()

    def get_subtotal(self, obj):
        """Subtotal before discount (same as total_amount)"""
        return float(obj.total_amount)

    class Meta:
        model = Bill
        fields = [
            # Bill basic info
            'id',
            'bill_number',
            'created_at',
            'updated_at',
            'payment_status',
            'notes',
            
            # Patient info
            'patient_id',
            'patient_name',
            'patient_phone',
            'patient_email',
            'patient_address',
            'patient_city',
            
            # Visit info
            'visit_id',
            'visit_type',
            'visit_date',
            'appointment_date',
            'service_type',
            
            # Clinic info
            'clinic_name',
            'clinic_address',
            'clinic_phone',
            
            # Bill items
            'bill_items',
            'items_count',
            
            # Financial summary
            'total_amount',
            'discount_amount',
            'final_amount',
            'subtotal',
        ]



class InventorySerialDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed inventory serial information."""
    class Meta:
        model = InventorySerial
        fields = ['id', 'serial_number', 'status', 'created_at']
    

class InventoryUpdateItemSerializer(serializers.ModelSerializer):
    """Serializer for updating inventory items."""
    class Meta:
        model = InventoryItem
        fields = [
            'category', 'product_name', 'brand', 'model_type', 'description',
            'quantity_in_stock', 'reorder_level', 'location',
            'notes', 'use_in_trial', 'unit_price', 'sku'
        ]

    def validate_quantity_in_stock(self, value):
        """Prevent direct updates to quantity_in_stock for serialized items."""
        if self.instance and self.instance.stock_type == 'Serialized':
            raise serializers.ValidationError("Quantity for serialized items is managed by its serial numbers and cannot be updated directly.")
        return value
    


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name','category']

    

class ModelTypeSerializer(serializers.ModelSerializer):
    # brand= serializers.CharField(source='brand.id', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True)

    class Meta:
        model = ModelType
        fields = ['id', 'name', 'brand', 'brand_name']



class InventoryItemSerializer(serializers.ModelSerializer):
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    model_type_name = serializers.CharField(source='model_type.name', read_only=True)
    clinic_name = serializers.CharField(source='clinic.name', read_only=True)

    class Meta:
        model = InventoryItem
        fields = [
            'id',
            'category',
            'product_name',    
            'brand_name',
            'model_type_name',
            'sku',
            'description',
            'stock_type',
            'quantity_in_stock',
            'notes',
            'use_in_trial',
            'unit_price',
            'status', 
            'clinic_id',
            'clinic_name'
        ]


class InventoryItemCreateSerializer(serializers.ModelSerializer):
    """
    Serializer to create a new Inventory Item.

    **Payload for Serialized Item:**
    ```json
    {
        "category": "Hearing Aid",
        "product_name": "Audeo Paradise P90",
        "brand": "Phonak",
        "model_type": "P90-R",
        "description": "Premium rechargeable hearing aid.",
        "stock_type": "Serialized",
        "reorder_level": 2,
        "location": "Main Shelf",
        "unit_price": "1500.00",
        "use_in_trial": true,
        "serial_numbers": ["SN12345", "SN12346", "SN12347"]
    }
    ```

    **Payload for Non-Serialized Item:**
    ```json
    {
        "category": "Battery",
        "product_name": "Hearing Aid Battery Size 10",
        "brand": "Rayovac",
        "model_type": "10",
        "description": "Pack of 8 batteries.",
        "stock_type": "Non-Serialized",
        "quantity_in_stock": 100,
        "reorder_level": 20,
        "location": "Drawer 3",
        "unit_price": "5.00",
        "expiry_date": "2027-12-31"
    }
    ```
    """
    serial_numbers = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False,
        help_text="List of serial numbers. Required if stock_type is 'Serialized'."
    )

    class Meta:
        model = InventoryItem
        fields = [
            'category', 'product_name', 'brand', 'model_type', 'description',
            'stock_type', 'quantity_in_stock', 'reorder_level', 'location',
            'expiry_date', 'notes', 'use_in_trial', 'unit_price', 'serial_numbers', 'sku'
        ]
        extra_kwargs = {
            'quantity_in_stock': {'required': False, 'allow_null': True}
        }

    def validate(self, data):
        stock_type = data.get('stock_type')
        serial_numbers = data.get('serial_numbers', [])
        quantity_in_stock = data.get('quantity_in_stock')

        if stock_type == 'Serialized':
            if not serial_numbers:
                raise serializers.ValidationError({"serial_numbers": "Serial numbers are required for serialized items."})
            if quantity_in_stock is not None:
                raise serializers.ValidationError({"quantity_in_stock": "Quantity should not be provided for serialized items; it's calculated from serial numbers."})
            
            # Check for duplicate serial numbers within the payload
            if len(serial_numbers) != len(set(serial_numbers)):
                raise serializers.ValidationError({"serial_numbers": "Duplicate serial numbers found in the payload."})

            # Check for existing serial numbers in the database
            existing_serials = InventorySerial.objects.filter(serial_number__in=serial_numbers).values_list('serial_number', flat=True)
            if existing_serials:
                raise serializers.ValidationError({
                    "serial_numbers": f"The following serial numbers already exist: {', '.join(existing_serials)}"
                })

        elif stock_type == 'Non-Serialized':
            if serial_numbers:
                raise serializers.ValidationError({"serial_numbers": "Serial numbers should not be provided for non-serialized items."})
            if quantity_in_stock is None:
                raise serializers.ValidationError({"quantity_in_stock": "Quantity is required for non-serialized items."})
        return data

    def create(self, validated_data):
        serial_numbers = validated_data.pop('serial_numbers', [])
        stock_type = validated_data.get('stock_type')
        clinic_id = Clinic.objects.filter(is_main_inventory=True).values_list('id', flat=True).first()
        validated_data['clinic_id'] = clinic_id
        validated_data['is_approved'] = True  # Automatically approve new inventory items

        with transaction.atomic():
            if stock_type == 'Serialized':
                validated_data['quantity_in_stock'] = len(serial_numbers)
            
            inventory_item = InventoryItem.objects.create(**validated_data)

            if stock_type == 'Serialized':
                serials_to_create = [
                    InventorySerial(
                        inventory_item=inventory_item,
                        serial_number=sn,
                        status='In Stock'
                    ) for sn in serial_numbers
                ]
                InventorySerial.objects.bulk_create(serials_to_create)
        
        return inventory_item


class ServiceVisitListSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='visit.patient.name', read_only=True)
    patient_phone = serializers.CharField(source='visit.patient.phone_primary', read_only=True)
    device_details = serializers.SerializerMethodField()
    device_serial_number = serializers.CharField(source='device_serial.serial_number', read_only=True, default=None)
    visit_id = serializers.IntegerField(source='visit.id', read_only=True)
    service_date = serializers.DateTimeField(source='action_taken_on', read_only=True)
    # warranty_applicable = serializers.BooleanField(read_only=True)

    class Meta:
        model = ServiceVisit
        fields = [
            'id', 'visit_id', 'patient_name', 'patient_phone', 'status', 'service_type',
            'complaint', 'action_taken', 'device_details', 'device_serial_number',
            'service_date'
        ]
    
    def get_device_details(self, obj):
        if obj.device and obj.device.inventory_item:
            item = obj.device.inventory_item
            return {
                'name': item.product_name,
                'brand': item.brand,
                'model': item.model_type,
                'purchase_date': obj.device.purchased_at.date() if obj.device.purchased_at else None
            }
        return None


class PatientPurchaseSerializer(serializers.ModelSerializer):
    """Serializer for listing a patient's purchased items."""
    item_name = serializers.CharField(source='inventory_item.product_name', read_only=True)
    item_brand = serializers.CharField(source='inventory_item.brand', read_only=True)
    item_model = serializers.CharField(source='inventory_item.model_type', read_only=True)
    serial_number = serializers.CharField(source='inventory_serial.serial_number', read_only=True)
    patient_name = serializers.CharField(source='patient.name', read_only=True)
    visit_id = serializers.IntegerField(source='visit.id', read_only=True)
    purchase_date = serializers.DateTimeField(source='purchased_at', read_only=True)

    class Meta:
        model = PatientPurchase
        fields = [
            'id', 'patient_name', 'visit_id', 'item_name', 'item_brand', 'item_model', 
            'serial_number', 'quantity', 'unit_price', 'total_price', 'purchase_date'
        ]


class ServiceQueueSerializer(serializers.ModelSerializer):
    """Serializer for the service queue, showing patients pending service."""
    patient_name = serializers.CharField(source='patient.name', read_only=True)
    patient_phone = serializers.CharField(source='patient.phone_primary', read_only=True)
    purchased_devices = PatientPurchaseSerializer(source='patient.purchases', many=True, read_only=True)

    class Meta:
        model = PatientVisit
        fields = [
            'id', # Visit ID
            'patient_name',
            'patient_phone',
            'visit_type',
            'service_type',
            'status',
            'appointment_date',
            'purchased_devices',
        ]


class TrialCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new trial record.

    **Payload Example:**
    ```json
    {
        "visit": 1,
        # "device_inventory_id": 5,
        "serial_number": "SN-TRIAL-001",
        "receiver_size": "M",
        "ear_fitted": "Right",
        "dome_type": "Open",
        "gain_settings": "Initial fitting with minor adjustments for high frequencies.",
        "srt_before": "45 dB",
        "sds_before": "88%",
        "ucl_before": "100 dB",
        "patient_response": "Positive, reports better clarity in quiet environments.",
        "counselling_notes": "Counselled on device usage and maintenance. Follow-up scheduled.",
        "cost": "500.00",
        "trial_start_date": "2025-12-19",
        "trial_end_date": "2026-01-02"
        "discount_offered": "10",

    }
    ```
    """
    class Meta:
        model = Trial
        fields = '__all__'
        read_only_fields = ['clinic', 'created_at', 'assigned_patient']

    def create(self, validated_data):
        request = self.context.get('request')
        visit = validated_data.get('visit')

        if not visit:
            raise serializers.ValidationError("A visit is required to create a trial.")

        validated_data['clinic'] = request.user.clinic
        validated_data['assigned_patient'] = visit.patient
        # Automatically set followup_date to the day after trial_end_date
        trial_end_date = validated_data.get('trial_end_date')
        if trial_end_date:
            validated_data['followup_date'] = trial_end_date + timedelta(days=1)
        else:
            validated_data['followup_date'] = None

        
        device_serial_number = validated_data.get('serial_number')
        if device_serial_number:
            if not InventorySerial.objects.filter(serial_number=device_serial_number).exists():
                raise serializers.ValidationError({"status": 400, "error": "Invalid serial number."})
            
            # Update serial status to 'Trial' when creating trial
            try:
                serial = InventorySerial.objects.get(serial_number=device_serial_number)
                if serial.status == 'In Stock':
                    serial.status = 'Use in Trial'
                    serial.save()
            except InventorySerial.DoesNotExist:
                raise serializers.ValidationError({"status": 400, "error": "Invalid serial number."})

        # Update the status of Patient visit ( Trial Active )
        visit.status = 'Trial Active'
        visit.status_note = 'Trial is in progress'
        visit.save()

        validated_data['device_inventory_id'] = serial.inventory_item
        
        with transaction.atomic():     
            trial = super().create(validated_data)
            
            # If a cost is associated, add it to the bill for this visit
            if trial.cost and trial.cost > 0 and trial.visit:
                bill, _ = Bill.objects.get_or_create(
                    visit=trial.visit,
                    defaults={
                        'clinic': trial.clinic,
                        'created_by': request.user,
                    }
                )
                
                # Create a bill item for the trial security deposit
                description = "Security deposit for trial"
                if trial.device_inventory_id:
                    description += f" of {trial.device_inventory_id.product_name}"

                BillItem.objects.create(
                    bill=bill,
                    item_type='Trial',
                    trial=trial,
                    description=description,
                    cost=trial.cost,
                    quantity=1,
                )
                
                # Apply trial discount to bill if offered (as percentage)
                if trial.discount_offered and trial.discount_offered > 0:
                    # Calculate discount as percentage of total bill amount
                    from decimal import Decimal
                    discount_percentage = Decimal(trial.discount_offered) / 100
                    discount_amount = bill.total_amount * discount_percentage
                    bill.discount_amount = discount_amount
                    bill.save()
                
                # Recalculate bill totals
                bill.calculate_total()

        return trial


class TrialListSerializer(serializers.ModelSerializer):
    """Serializer for listing trial records with detailed information."""
    # patient_name = serializers.CharField(source='assigned_patient.name', read_only=True)
    doctor_name = serializers.CharField(source='visit.seen_by.name', read_only=True)
    device_name = serializers.CharField(source='device_inventory_id.product_name', read_only=True)
    device_brand = serializers.CharField(source='device_inventory_id.brand', read_only=True)
    device_model = serializers.CharField(source='device_inventory_id.model_type', read_only=True)
    assigned_patient = serializers.CharField(source='assigned_patient.name', read_only=True)
    assigned_patient_phone = serializers.CharField(source='assigned_patient.phone_primary', read_only=True)
    # status = serializers.CharField(source='visit.status', read_only=True)
    completion_notes = serializers.CharField(source='return_notes', read_only=True)


    class Meta:
        model = Trial
        fields = [
            'id',
            'doctor_name',
            'device_name',
            'device_brand',
            'device_model',
            'serial_number',
            'ear_fitted',
            'trial_start_date',
            'trial_end_date',
            'followup_date',
            'assigned_patient',
            'assigned_patient_phone',
            'patient_response',
            'trial_decision',
            'completion_notes',
            'device_condition_on_return',
            'extended_trial'
        ]


class TrialDeviceSerialSerializer(serializers.ModelSerializer):
    """Serializer for individual serial numbers of trial devices."""
    class Meta:
        model = InventorySerial
        fields = ['id', 'serial_number', 'status']


class TrialDeviceSerializer(serializers.ModelSerializer):
    """Serializer for listing inventory items available for trial."""
    available_serials = serializers.SerializerMethodField()

    class Meta:
        model = InventoryItem
        fields = [
            'id',
            'product_name',
            'brand',
            'model_type',
            'stock_type',
            'available_serials',
        ]

    def get_available_serials(self, obj):
        if obj.stock_type == 'Serialized':
            serials = obj.serials.filter(status='In Stock')
            return TrialDeviceSerialSerializer(serials, many=True).data
        return []


class ProductInfoBySerialSerializer(serializers.ModelSerializer):
    """Serializer for product information by serial number."""
    inventory_item_details = serializers.SerializerMethodField()
    
    class Meta:
        model = InventorySerial
        fields = [
            'serial_number',
            'status',
            'created_at',
            'inventory_item_details'
        ]
    
    def get_inventory_item_details(self, obj):
        """Get detailed inventory item information."""
        item = obj.inventory_item
        return {
            'id': item.id,
            'product_name': item.product_name,
            'brand': item.brand,
            'model_type': item.model_type,
            'category': item.category,
            'stock_type': item.stock_type,
            'description': item.description,
            'unit_price': item.unit_price,
            'use_in_trial': item.use_in_trial,
            'quantity_in_stock': item.quantity_in_stock,
            'reorder_level': item.reorder_level,
            'location': item.location,
            'expiry_date': item.expiry_date,
            'notes': item.notes,
        }


# Return Device Update 
class TrialDeviceReturnSerializer(serializers.Serializer):
    serial_number = serializers.CharField(required=True)
    device_condition_on_return = serializers.CharField(required=False, allow_blank=True)

# Trial Completion Serializer
class TrialCompletionSerializer(serializers.Serializer):
    """
    Serializer for completing a trial and handling patient's device booking decision.
    
    Expected payload:
    {
        "trial_decision": "BOOK" | "NOT_BOOKED",
        "booked_device_inventory": 123,  // Required only if trial_decision is "BOOK"
        "booked_device_serial": "SN12345",  // Required only if device is serialized
        "completion_notes": "Patient satisfied with trial experience"
    }
    """
    trial_decision = serializers.ChoiceField(
        choices=[('BOOK', 'Book Device'), ('TRIAL', 'Need Time - Not Booked'), ('DECLINE', 'Decline Device Booking')],
        required=True,
        help_text="Patient decision after trial completion"
    )
    
    booked_device_inventory = serializers.IntegerField(
        required=False,
        allow_null=True,
        help_text="Inventory item ID of device to book (required only if decision is BOOK)"
    )
    
    booked_device_serial = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
        help_text="Serial number of device to book (required only for serialized items)"
    )
    
    completion_notes = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Notes about trial completion and patient decision"
    )
    
    next_followup = serializers.IntegerField(required=False, allow_null=True)
    
    def validate(self, data):
        trial_decision = data.get('trial_decision')
        
        if trial_decision == 'BOOK':
            if not data.get('booked_device_inventory'):
                raise serializers.ValidationError({
                    'booked_device_inventory': 'Device inventory is required when booking a device'
                })
            
            # Validate that the inventory item exists
            try:
                from .models import InventoryItem
                inventory_item = InventoryItem.objects.get(id=data['booked_device_inventory'])
                
                # Check if it's a serialized item and serial number is provided
                if inventory_item.stock_type == 'Serialized' and not data.get('booked_device_serial'):
                    raise serializers.ValidationError({
                        'booked_device_serial': 'Serial number is required for serialized devices'
                    })
                
                # For serialized items, validate the serial number exists and is in stock
                if inventory_item.stock_type == 'Serialized' and data.get('booked_device_serial'):
                    try:
                        from .models import InventorySerial
                        serial = InventorySerial.objects.get(
                            serial_number=data['booked_device_serial'],
                            inventory_item=inventory_item,
                            status='In Stock'
                        )
                        data['validated_serial'] = serial
                    except InventorySerial.DoesNotExist:
                        raise serializers.ValidationError({
                            'booked_device_serial': 'Serial number not found or not available in stock'
                        })
                
                # Check stock availability for non-serialized items
                if inventory_item.stock_type == 'Non-Serialized' and inventory_item.quantity_in_stock <= 0:
                    raise serializers.ValidationError({
                        'booked_device_inventory': 'Device is out of stock'
                    })
                    
            except InventoryItem.DoesNotExist:
                raise serializers.ValidationError({
                    'booked_device_inventory': 'Invalid inventory item'
                })
        
        return data

class InventoryTransferSerializer(serializers.ModelSerializer):
    from_clinic_name = serializers.CharField(source='from_clinic.name', read_only=True)
    to_clinic_name = serializers.CharField(source='to_clinic.name', read_only=True)
    transferred_by_name = serializers.CharField(source='transferred_by.name', read_only=True)

    log_message = serializers.ReadOnlyField()

    class Meta:
        model = InventoryTransfer
        fields = ['from_clinic_name', 'to_clinic_name', 'transferred_by_name', 'log_message', 'transferred_at']
        