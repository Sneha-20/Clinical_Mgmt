from django.db import models, transaction
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.core.exceptions import ValidationError
from accounts.models import User,Clinic
from django.utils import timezone
class Patient(models.Model):
    clinic = models.ForeignKey(Clinic, on_delete=models.SET_NULL, null=True)
    name = models.CharField(max_length=255)
    age = models.IntegerField()
    dob = models.DateField()
    email = models.EmailField(blank=True, null=True)
    gender = models.CharField(max_length=50)
    phone_primary = models.CharField(max_length=50)
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
    status = models.CharField(max_length=50,null=True)  #  ( Test Pending / Trial active/ Booked / Follow-up)
    status_note = models.TextField(blank=True, null=True)
    contacted = models.BooleanField(default=False)  # Track if patient has been contacted for follow-up
    contacted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='contacted_visits')  # Who contacted the patient
    contacted_at = models.DateTimeField(null=True, blank=True, default=timezone.now)  # When the patient was contacted
    appointment_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    step_process = models.IntegerField(default=1)  # Track the current step in the process (1-Case History, 2-Tests, 3-Trial, 4-Booking)



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
    red_flags = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    # def __str__(self):
    #     return f"Case History for {self.patient.name}"


class VisitTestPerformed(models.Model):
    visit = models.ForeignKey(PatientVisit, on_delete=models.CASCADE)
    # test_code = models.CharField(max_length=100)
    # required = models.BooleanField(default=False)
    pta = models.BooleanField(default=False)
    typm = models.BooleanField(default=False) # Tympanometry
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
    visit = models.ForeignKey(PatientVisit, on_delete=models.CASCADE, null=True)
    device_inventory_id = models.ForeignKey('InventoryItem', on_delete=models.CASCADE, null=True, blank=True)
    serial_number = models.CharField(max_length=255, blank=True, null=True)
    receiver_size = models.CharField(max_length=255, blank=True, null=True)
    ear_fitted = models.CharField(max_length=50, blank=True, null=True)  # Ear fitted (Right / Left / Both)
    dome_type = models.CharField(max_length=255, blank=True, null=True)  # e.g., Open, Closed, Custom
    gain_settings = models.TextField(blank=True, null=True)  # Gain settings (initial fitting gain, target adjustments, comfort changes)
    srt_before = models.CharField(max_length=255, blank=True, null=True)
    sds_before = models.CharField(max_length=255, blank=True, null=True)
    ucl_before = models.CharField(max_length=255, blank=True, null=True)
    patient_response = models.CharField(max_length=255, blank=True, null=True)
    counselling_notes = models.TextField()
    discount_offered = models.IntegerField(blank=True, null=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, help_text="Cost associated with the trial")
    followup_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    trial_start_date = models.DateField(blank=True, null=True)
    trial_end_date = models.DateField(blank=True, null=True)
    assigned_patient = models.ForeignKey(Patient, on_delete=models.SET_NULL, null=True, blank=True)
    return_notes = models.TextField(blank=True, null=True)
    device_condition_on_return = models.CharField(max_length=50, blank=True, null=True)  # Condition (Good / Bad)
    extended_trial = models.BooleanField(default=False)
    # Trial completion decision fields
    TRIAL_DECISION_CHOICES = [
        ('TRIAL_ACTIVE', 'Trial Active'),
        ('BOOK - Awaiting Stock', 'Book Awaiting Stock'),
        ('BOOK - Allocated', 'Book Device Allocated' ),
        ('FOLLOWUP', 'Need Time - Not Booked'),
        ('DECLINE', 'Decline Device Booking'),
    ]
    trial_decision = models.CharField(max_length=50, choices=TRIAL_DECISION_CHOICES, blank=True, null=True, help_text="Patient decision after trial completion", default='TRIAL_ACTIVE')
    trial_completed_at = models.DateTimeField(null=True, blank=True, help_text="When trial was completed and decision made")
    extended_at = models.DateTimeField(null=True, blank=True, help_text="When trial was extended")
    booked_device_inventory = models.ForeignKey('InventoryItem', on_delete=models.CASCADE, null=True, blank=True, related_name='booked_trials', help_text="Device booked by patient after trial")
    booked_device_serial = models.ForeignKey('InventorySerial', on_delete=models.CASCADE, null=True, blank=True, related_name='booked_trials', help_text="Serial number of booked device")

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

    PAYMENT_METHODS = [
        ('CASH', 'Cash'),
        ('UPI', 'UPI / QR Scan'),
        ('CARD', 'Card'),
        ('PENDING', 'Not Paid Yet'),
    ]

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
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHODS, default='PENDING')
    transaction_id = models.CharField(max_length=100, blank=True, null=True, help_text="Reference for UPI")
    paid_at = models.DateTimeField(null=True, blank=True)
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
        if not self.bill_number:
            from datetime import datetime
            date_prefix = datetime.now().strftime('%Y%m%d')
            last = Bill.objects.filter(bill_number__startswith=f'BILL-{date_prefix}-').order_by('-bill_number').first()
            n = int(last.bill_number.split('-')[-1]) if last and last.bill_number else 0
            self.bill_number = f"BILL-{date_prefix}-{n+1:04d}"
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
        ('Purchase', 'Purchase'),
        ('Service', 'Service'),
        ('Part Used in Service', 'Part Used in Service'),
    ]

    bill = models.ForeignKey(Bill, on_delete=models.CASCADE, related_name='bill_items')
    item_type = models.CharField(max_length=50, choices=ITEM_TYPE_CHOICES, help_text="Type of item: Test / Trial / Service")
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
    service_visit = models.ForeignKey(
        "ServiceVisit",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="bill_items",
        help_text="If item_type is 'Service', link to ServiceVisit",
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
        """Validate correct linkage based on item_type."""
        from django.core.exceptions import ValidationError

        if self.item_type == 'Test':
            if not self.test_type:
                raise ValidationError("Test type must be specified for Test items")
            # Ensure other links are not set
            if self.trial_id or self.service_visit_id:
                raise ValidationError("Only test_type must be set for Test items")

        if self.item_type == 'Trial':
            if not self.trial:
                raise ValidationError("Trial must be specified for Trial items")
            if self.test_type_id or self.service_visit_id:
                raise ValidationError("Only trial must be set for Trial items")

        if self.item_type == 'Service':
            if not self.service_visit:
                raise ValidationError("Service visit must be specified for Service items")
            if self.test_type_id or self.trial_id:
                raise ValidationError("Only service_visit must be set for Service items")

        # If more item types are added in future, they must be validated here.

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
        # Recalculate bill total after saving
        if self.bill:
            self.bill.calculate_total()

    def delete(self, *args, **kwargs):
        bill = self.bill
        result = super().delete(*args, **kwargs)
        if bill:
            bill.calculate_total()
        return result

class PatientPurchase(models.Model):
    PURCHASE_TYPE = [
        ('Consumable', 'Consumable'),   # battery, dome, receiver
        ('Device', 'Device'),           # hearing aid
    ]
    clinic = models.ForeignKey(Clinic, on_delete=models.SET_NULL, null=True)


    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="purchases"
    )

    visit = models.ForeignKey(
        PatientVisit,
        on_delete=models.CASCADE,
        related_name="purchases"
    )

    inventory_item = models.ForeignKey(
        'InventoryItem',
        on_delete=models.CASCADE
    )

    inventory_serial = models.ForeignKey(
        'InventorySerial',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

#     purchase_type = models.CharField(
#         max_length=20,
#         choices=PURCHASE_TYPE
#   )

    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    purchased_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        """Ensure that a serial number is provided for serialized items."""
        if self.inventory_item.stock_type == 'Serialized' and not self.inventory_serial:
            raise ValidationError(
                f"A serial number must be provided for serialized items like '{self.inventory_item}'."
            )
        if self.inventory_item.stock_type == 'Non-Serialized' and self.inventory_serial:
            raise ValidationError(
                f"A serial number should not be provided for non-serialized items like '{self.inventory_item}'."
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


from django.db import models
from django.utils import timezone

# Choices for category
CATEGORY_CHOICES = [
    ('Battery', 'Battery'),
    ('Dome', 'Dome'),
    ('Receiver', 'Receiver'),
    ('Mold', 'Mold'),
    ('Tube', 'Tube'),
    ('Hearing Aid', 'Hearing Aid'),
    ('Trial Stock', 'Trial Stock'),
    ('Speech Material', 'Speech Material'),
]

class Brand(models.Model):
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class ModelType(models.Model):
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name='model_types')
    name = models.CharField(max_length=100)

    class Meta:
        unique_together = ('brand', 'name')

    def __str__(self):
        return f"{self.brand.name} {self.name}"


class InventoryItem(models.Model):
    clinic = models.ForeignKey(Clinic, on_delete=models.SET_NULL, null=True, blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    product_name = models.CharField(max_length=100, blank=True, null=True)  # Product Name
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, blank=True)  # Brand
    model_type = models.ForeignKey(ModelType, on_delete=models.SET_NULL, null=True, blank=True)  # Model / Type
    sku = models.CharField(max_length=100, blank=True, null=True, help_text="Stock Keeping Unit - Unique identifier for the product across clinics")
    STOCK_TYPE_CHOICES = [
        ('Serialized', 'Serialized'),
        ('Non-Serialized', 'Non-Serialized'),
    ]
    description = models.TextField(blank=True, null=True)
    stock_type = models.CharField(max_length=20, choices=STOCK_TYPE_CHOICES, default='Non-Serialized')
    quantity_in_stock = models.PositiveIntegerField(default=0)
    reorder_level = models.PositiveIntegerField(default=10, help_text="Alert when stock falls to this level")
    location = models.CharField(max_length=100, blank=True, null=True)
    expiry_date = models.DateField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    use_in_trial = models.BooleanField(default=False)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_approved = models.BooleanField(default=False)

    master_item = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='distributed_copies', help_text="Link to the main inventory item if this is a distributed copy")

    class Meta:
        verbose_name = "Inventory Item"
        verbose_name_plural = "Inventory Items"
        ordering = ['category', 'brand', 'model_type']

    def __str__(self):
        return f"{self.id} - {self.brand} {self.model_type}"

    @property
    def is_expired(self):
        """Return True if the item is expired."""
        if self.expiry_date:
            return self.expiry_date < timezone.now().date()
        return False

    @property
    def is_near_expiry(self):
        """Return True if the item is within 30 days of expiry."""
        if self.expiry_date:
            return 0 <= (self.expiry_date - timezone.now().date()).days <= 30
        return False

    @property
    def status(self):
        """Return inventory status based on quantity."""
        if self.quantity_in_stock <= 1:
            return 'Critical'
        elif self.quantity_in_stock < 5:
            return 'Low'
        else:
            return 'Good'

    def update_quantity_from_serials(self):
        """
        Update quantity_in_stock to match the number of InventorySerials with status 'In Stock'.
        """
        count = self.serials.filter(status='In Stock').count()
        self.quantity_in_stock = count
        self.save(update_fields=["quantity_in_stock"])

    def save(self, *args, **kwargs):
        if not self.sku:
            import uuid
            self.sku = f"SKU-{uuid.uuid4().hex[:10].upper()}"
        super().save(*args, **kwargs)

class InventorySerial(models.Model):
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, related_name='serials')
    serial_number = models.CharField(max_length=255, unique=True)

    status = models.CharField(
        max_length=50,
        choices=[
            ('In Stock', 'In Stock'),
            ('Trial', 'Trial'),
            ('Sold', 'Sold'),
            ('Service', 'Service'),
            ('Lost', 'Lost'),
        ]
    )

    created_at = models.DateTimeField(auto_now_add=True)


class ServiceVisit(models.Model):
    SERVICE_TYPE_CHOICES = [
        ('TGA', 'TGA'),
        ('Machine Check', 'Machine Check'),
        ('Cleaning', 'Cleaning'),
        ('Dome Change', 'Dome Change'),
        ('Filter Change', 'Filter Change'),
        ('Battery Change', 'Battery Change'),
        ('Receiver Change', 'Receiver Change'),
        ('Tube Change', 'Tube Change'),
        ('Quick Tuning', 'Quick Tuning'),
        ('Repair', 'Repair'),
    ]

    visit = models.OneToOneField(
        PatientVisit,
        on_delete=models.CASCADE,
        related_name="service"
    )

    SERVICE_STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]
    status = models.CharField(max_length=20, choices=SERVICE_STATUS_CHOICES, default='Pending')

    device = models.ForeignKey(
        PatientPurchase,
        on_delete=models.SET_NULL,
        null=True,
        help_text="The purchased item being serviced."
    )

    device_serial = models.ForeignKey(
        InventorySerial,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="The specific serialized item being serviced."
    )

    service_type = models.CharField(max_length=50, choices=SERVICE_TYPE_CHOICES)

    complaint = models.TextField()
    action_taken = models.TextField() 
    action_taken_on = models.DateTimeField(auto_now_add=True)

    warranty_applicable = models.BooleanField(default=False)
    charges_collected = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    rtc_date = models.DateField(blank=True, null=True)

    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)


class ServicePartUsed(models.Model):
    service = models.ForeignKey(
        ServiceVisit,
        on_delete=models.CASCADE,
        related_name="parts_used"
    )
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    

    def clean(self):
        """Ensure that serialized items are not used as service parts."""
        if self.inventory_item.stock_type == 'Serialized':
            raise ValidationError(
                f"Serialized items like '{self.inventory_item}' cannot be used as service parts."
            )

    def save(self, *args, **kwargs):
        """
        Auto-deduct inventory on create/update for non-serialized items.
        - Create: deduct full quantity
        - Update: deduct only the delta (new - old)
        Prevents inventory from going negative.
        """
        self.full_clean()  # Run validation before saving

        if self.quantity is None or int(self.quantity) <= 0:
            raise ValidationError("quantity must be a positive integer")

        with transaction.atomic():
            # Lock inventory row to avoid race conditions
            inv = InventoryItem.objects.select_for_update().get(pk=self.inventory_item_id)

            old_qty = 0
            if self.pk:
                old_qty = (
                    ServicePartUsed.objects.select_for_update()
                    .only("quantity")
                    .get(pk=self.pk)
                    .quantity
                )

            delta = int(self.quantity) - int(old_qty)
            if delta > 0 and inv.quantity_in_stock < delta:
                raise ValidationError(
                    f"Insufficient stock for {inv.product_name}. Available={inv.quantity_in_stock}, required={delta}."
                )

            inv.quantity_in_stock -= delta
            inv.save(update_fields=["quantity_in_stock"])
            super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        """Revert inventory when a part-used row is deleted."""
        with transaction.atomic():
            inv = InventoryItem.objects.select_for_update().get(pk=self.inventory_item_id)
            inv.quantity = inv.quantity + int(self.quantity or 0)
            inv.save(update_fields=["quantity"])
            return super().delete(*args, **kwargs)


class DeletedRecordLog(models.Model):
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.CharField(max_length=255)
    content_object = GenericForeignKey('content_type', 'object_id')
    model_name = models.CharField(max_length=100)
    deleted_data = models.JSONField()
    deleted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    deleted_at = models.DateTimeField(auto_now_add=True)
    reason = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        verbose_name = 'Deleted Record Log'
        verbose_name_plural = 'Deleted Record Logs'
        ordering = ['-deleted_at']

class InventoryTransfer(models.Model):
    """Record of inventory items transferred between clinics"""
    item_name = models.CharField(max_length=255)
    category = models.CharField(max_length=50)
    brand = models.CharField(max_length=50)
    model = models.CharField(max_length=100)
    
    from_clinic = models.ForeignKey(Clinic, related_name='transfers_sent', on_delete=models.SET_NULL, null=True)
    to_clinic = models.ForeignKey(Clinic, related_name='transfers_received', on_delete=models.SET_NULL, null=True)
    
    quantity = models.PositiveIntegerField()
    serial_numbers = models.JSONField(default=list, blank=True, help_text="List of serial numbers transferred")
    
    transferred_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    transferred_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Transfer: {self.item_name} ({self.quantity}) -> {self.to_clinic}"

    @property
    def log_message(self):
        """Returns a formatted log string for the transfer."""
        date_str = self.transferred_at.strftime('%Y-%m-%d %H:%M') if self.transferred_at else "N/A"
        user_name = self.transferred_by.name if self.transferred_by else "System"
        from_name = self.from_clinic.name if self.from_clinic else "Unknown"
        to_name = self.to_clinic.name if self.to_clinic else "Unknown"
        
        return f"[{date_str}] {user_name} transferred {self.quantity} x {self.item_name} ({self.brand} {self.model}) from {from_name} to {to_name}."
