
from .models import (
    Patient,
    PatientVisit,
    AudiologistCaseHistory,
    VisitTestPerformed,
    Trial,
    TestType,
    Bill,
    BillItem,
)
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

    total_bill = serializers.SerializerMethodField()

    def get_total_bill(self, obj):
        from django.db.models import Sum
        return Bill.objects.filter(visit=obj).aggregate(total_amount=Sum('total_amount'))['total_amount'] or 0

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
            'total_bill'
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
                if visit_type in ['TGA / Machine Check', 'Battery Purchase', 'Tip / Dome Change']:
                    status_value = 'Pending for Service'
                else:
                    status_value = 'Test pending'

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

class TrialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trial
        fields = '__all__'
        read_only_fields = ['clinic']


class AudiologistQueueSerializer(serializers.ModelSerializer):
    
    patient_id = serializers.IntegerField(source='patient.id', read_only=True)
    patient_name = serializers.CharField(source='patient.name', read_only=True)
    patient_phone = serializers.CharField(source='patient.phone_primary', read_only=True)
    visit_id = serializers.IntegerField(source='id', read_only=True)
    referral_type = serializers.CharField(source='patient.referral_type', read_only=True)
    referral_doctor = serializers.CharField(source='patient.referral_doctor', read_only=True)
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
            'patient_phone',
            'visit_type',
            'present_complaint',
            'test_requested',
            'status',
            # 'appointment_date',
            'referral_type',
            'referral_doctor',
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

    Expected payload example:
    {
        # "visit": 1,     // Required: Visit ID for test performed and billing
        "medical_history": "...",
        "family_history": "...",
        "noise_exposure": "...",
        "previous_ha_experience": "...",
        "red_flags": "...",

        "pta": true,
        "oae": true,
        "srt": true,
        "sds": true,
        "other_test": "Any other test name or notes",

        "test_report_files": [
            { "file_type": "PTA", "file_path": "path-or-url-1" },
            { "file_type": "OAE", "file_path": "path-or-url-2" }
        ]
    }
    
    Note: Case history is linked to Patient (one per patient), but tests and billing
    are linked to the specific Visit.
    """

    # Visit field is needed for VisitTestPerformed and billing, but not stored in AudiologistCaseHistory
    visit = serializers.PrimaryKeyRelatedField(
        queryset=PatientVisit.objects.all(),
        write_only=True,
        help_text="Visit ID for test performed and billing"
    )

    # Flat fields corresponding to VisitTestPerformed model
    # required = serializers.BooleanField(default=False, write_only=True)
    pta = serializers.BooleanField(default=False, write_only=True)
    immittance = serializers.BooleanField(default=False, write_only=True)
    oae = serializers.BooleanField(default=False, write_only=True)
    bera_assr = serializers.BooleanField(default=False, write_only=True)
    srt = serializers.BooleanField(default=False, write_only=True)
    sds = serializers.BooleanField(default=False, write_only=True)
    ucl = serializers.BooleanField(default=False, write_only=True)
    free_field = serializers.BooleanField(default=False, write_only=True)
    other_test = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=True,
        write_only=True
    )

    # List of uploaded report files
    test_report_files = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        write_only=True,
        help_text="List of {'file_type': str, 'file_path': str} items"
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
            # 'required',
            'pta',
            'immittance',
            'oae',
            'bera_assr',
            'srt',
            'sds',
            'ucl',
            'free_field',
            'other_test',
            # TestUpload helper
            'test_report_files',
        ]

    def create(self, validated_data):
        """
        1. Create/Update AudiologistCaseHistory (linked to Patient, one per patient)
        2. Create VisitTestPerformed (if any test field is set, linked to Visit)
        3. Create TestUpload rows for given files
        4. Create / update Bill and BillItem rows based on tests performed
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

        # Extract VisitTestPerformed-related fields
        test_fields = [
            # 'required',
            'pta',
            'immittance',
            'oae',
            'bera_assr',
            'srt',
            'sds',
            'ucl',
            'free_field',
            'other_test',
        ]
        test_performed_data = {field: validated_data.pop(field, False) for field in test_fields}

        # Extract uploaded report files
        test_report_files = validated_data.pop('test_report_files', [])

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

            # 2. Create VisitTestPerformed only if something meaningful is set
            has_any_test = any(bool(value) for _, value in test_performed_data.items())
            test_performed_instance = None
            if has_any_test:
                test_performed_instance = VisitTestPerformed.objects.create(
                    visit=visit,  # Use the extracted visit, not case_history.visit
                    **test_performed_data
                )

            # 3. Save uploaded report files in the TestUpload table
            if test_performed_instance and test_report_files:
                for f in test_report_files:
                    file_type = f.get('file_type')
                    file_path = f.get('file_path')
                    if file_type and file_path:
                        TestUpload.objects.create(
                            visit=test_performed_instance,
                            file_type=file_type,
                            file_path=file_path,
                        )

            # 4. Billing: create / update Bill and BillItems for each test
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

        return case_history


# ============================================================================
# BILL SERIALIZERS
# ============================================================================

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

