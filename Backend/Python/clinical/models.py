from django.db import models
from accounts.models import User,Clinic
class Patient(models.Model):
    clinic = models.ForeignKey(Clinic, on_delete=models.SET_NULL, null=True)
    name = models.CharField(max_length=255)
    age = models.IntegerField()
    dob = models.DateField()
    email = models.EmailField(blank=True, null=True)
    gender = models.CharField(max_length=50)
    phone_primary = models.CharField(max_length=50, unique=True)
    phone_secondary = models.CharField(max_length=50, blank=True, null=True)
    city = models.CharField(max_length=255)
    address = models.TextField()
    referral_type = models.CharField(max_length=255, blank=True, null=True)
    referral_doctor = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    updated_at = models.DateTimeField(auto_now=True)


class PatientVisit(models.Model):
    clinic = models.ForeignKey(Clinic, on_delete=models.SET_NULL, null=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='visits')
    seen_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    visit_type = models.CharField(max_length=255)  # e.g., New, Follow-up, Service
    service_type = models.CharField(max_length=255, blank=True, null=True) # Clinic / Home
    present_complaint = models.CharField(max_length=255, blank=True, null=True)
    test_requested = models.CharField(max_length=255, blank=True, null=True) # it will be dropdown in frontend
    notes = models.TextField(blank=True, null=True)
    # created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50,null=True)  #  ( Test Pending / Trial Given / Booked / Follow-up)
    appointment_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class AudiologistCaseHistory(models.Model):
    """
    Stores case history for a patient.
    This information is typically filled only once at the patient's first visit.
    For subsequent revisits, the same records are referenced (one per patient).
    """
    patient = models.OneToOneField(Patient, on_delete=models.CASCADE, related_name='case_history', null=True)
    # Instead of linking to PatientVisit, link directly to Patient for one-time entry.

    medical_history = models.TextField()
    family_history = models.TextField()
    noise_exposure = models.TextField()
    previous_ha_experience = models.TextField()
    red_flags = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    # def __str__(self):
    #     return f"Case History for {self.patient.name}"


class VisitTestPerformed(models.Model):
    visit = models.ForeignKey(PatientVisit, on_delete=models.CASCADE)
    # test_code = models.CharField(max_length=100)
    # required = models.BooleanField(default=False)
    pta = models.BooleanField(default=False)
    immittance = models.BooleanField(default=False)
    oae = models.BooleanField(default=False)
    bera_assr = models.BooleanField(default=False)
    srt = models.BooleanField(default=False)
    sds = models.BooleanField(default=False)
    ucl = models.BooleanField(default=False)
    free_field = models.BooleanField(default=False)
    other_test = models.CharField(max_length=255, blank=True, null=True)


class TestUpload(models.Model):
    visit = models.ForeignKey(VisitTestPerformed, on_delete=models.CASCADE)
    file_type = models.CharField(max_length=100)
    file_path = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


class Trial(models.Model):
    clinic = models.ForeignKey(Clinic, on_delete=models.SET_NULL, null=True)
    visit = models.ForeignKey(PatientVisit, on_delete=models.CASCADE)
    # device_inventory_id = models.IntegerField() # Assuming linkage to an inventory system
    brand = models.CharField(max_length=255)
    model = models.CharField(max_length=255)
    technology_level = models.CharField(max_length=255,blank=True, null=True)
    serial_number = models.CharField(max_length=255,blank=True, null=True)
    receiver_size  = models.CharField(max_length=255,blank=True, null=True)
    ear_fitted = models.CharField(max_length=50,blank=True, null=True)  #Ear fitted (Right / Left / Both)
    dome_type = models.CharField(max_length=255,blank=True, null=True) # e.g., Open, Closed, Custom
    gain_settings = models.TextField(blank=True, null=True) # Gain settings (initial fitting gain, target adjustments, comfort changes)
    srt_before = models.CharField(max_length=255, blank=True, null=True)
    sds_before = models.CharField(max_length=255, blank=True, null=True)
    ucl_before = models.CharField(max_length=255, blank=True, null=True)
    patient_response = models.CharField(max_length=255,blank=True, null=True)
    counselling_notes = models.TextField()
    discount_offered = models.FloatField(blank=True, null=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, help_text="Cost associated with the trial")
    followup_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)


class TestType(models.Model):
    """
    Model to store test types and their associated costs.
    Examples: PTA, Immittance, OAE, BERA/ASSR, SRT, SDS, UCL, Free Field, etc.
    """
    clinic = models.ForeignKey(Clinic, on_delete=models.SET_NULL, null=True, blank=True, help_text="If null, applies to all clinics")
    name = models.CharField(max_length=255, unique=True, help_text="Test name (e.g., PTA, OAE, BERA/ASSR)")
    code = models.CharField(max_length=50, unique=True, blank=True, null=True, help_text="Short code for the test")
    cost = models.DecimalField(max_digits=10, decimal_places=2, help_text="Cost of the test")
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} - ₹{self.cost}"


class Bill(models.Model):
    """
    Main bill model linked to a PatientVisit.
    Aggregates all costs from tests and trials.
    """
    visit = models.OneToOneField(PatientVisit, on_delete=models.CASCADE, related_name='bill', help_text="One bill per visit")
    clinic = models.ForeignKey(Clinic, on_delete=models.SET_NULL, null=True)
    bill_number = models.CharField(max_length=100, unique=True, blank=True, null=True, help_text="Auto-generated bill number")
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="Total amount (auto-calculated from bill items)")
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="Total discount applied")
    final_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="Final amount after discount")
    payment_status = models.CharField(
        max_length=50,
        choices=[
            ('Pending', 'Pending'),
            ('Partially Paid', 'Partially Paid'),
            ('Paid', 'Paid'),
        ],
        default='Pending'
    )
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='bills_created')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Bill {self.bill_number or self.id} - {self.visit.patient.name}"

    def calculate_total(self):
        """Calculate total from all bill items (fix Decimal/float subtraction)"""
        from django.db.models import F, Sum, DecimalField
        from decimal import Decimal

        # Aggregate will always return Decimal or None; ensure default is Decimal
        total = self.bill_items.aggregate(
            total=Sum(F('cost') * F('quantity'), output_field=DecimalField())
        )['total']
        if total is None:
            total = Decimal('0.00')
        # Ensure discount_amount is Decimal, not float (avoid subtraction error)
        if self.discount_amount is None:
            self.discount_amount = Decimal('0.00')
        elif not isinstance(self.discount_amount, Decimal):
            self.discount_amount = Decimal(str(self.discount_amount))  # Convert float to str then Decimal, safe for .00
        self.total_amount = total
        self.final_amount = total - self.discount_amount
        self.save(update_fields=['total_amount', 'final_amount'])

    def generate_bill_number(self):
        """Auto-generate a unique bill number"""
        if not self.bill_number:
            from datetime import datetime
            date_prefix = datetime.now().strftime('%Y%m%d')
            # Get the count of bills created today
            today_bills = Bill.objects.filter(
                bill_number__startswith=date_prefix
            ).count()
            self.bill_number = f"BILL-{date_prefix}-{today_bills + 1:04d}"
        return self.bill_number

    def save(self, *args, **kwargs):
        """Override save to auto-generate bill number if not provided"""
        if not self.bill_number:
            self.generate_bill_number()
        super().save(*args, **kwargs)


class BillItem(models.Model):
    """
    Individual line items in a bill.
    Can be either a test or a trial.
    """
    ITEM_TYPE_CHOICES = [
        ('Test', 'Test'),
        ('Trial', 'Trial'),
    ]

    bill = models.ForeignKey(Bill, on_delete=models.CASCADE, related_name='bill_items')
    item_type = models.CharField(max_length=10, choices=ITEM_TYPE_CHOICES, help_text="Type of item: Test or Trial")
    test_type = models.ForeignKey(
        TestType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='bill_items',
        help_text="If item_type is 'Test', link to TestType"
    )
    trial = models.ForeignKey(
        Trial,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='bill_items',
        help_text="If item_type is 'Trial', link to Trial"
    )
    description = models.CharField(max_length=255, help_text="Description of the item")
    cost = models.DecimalField(max_digits=10, decimal_places=2, help_text="Cost of this item")
    quantity = models.IntegerField(default=1, help_text="Quantity (usually 1 for tests/trials)")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.item_type} - {self.description} - ₹{self.cost}"

    def clean(self):
        """Validate that either test_type or trial is set based on item_type"""
        from django.core.exceptions import ValidationError
        if self.item_type == 'Test' and not self.test_type:
            raise ValidationError("Test type must be specified for Test items")
        if self.item_type == 'Trial' and not self.trial:
            raise ValidationError("Trial must be specified for Trial items")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
        # Recalculate bill total after saving
        if self.bill:
            self.bill.calculate_total()





