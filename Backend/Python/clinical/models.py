from django.db import models
from accounts.models import User,Clinic


    

class Patient(models.Model):
    clinic = models.ForeignKey(Clinic, on_delete=models.SET_NULL, null=True)
    name = models.CharField(max_length=255)
    age = models.IntegerField()
    dob = models.DateField()
    gender = models.CharField(max_length=50)
    phone_primary = models.CharField(max_length=50)
    phone_secondary = models.CharField(max_length=50, blank=True, null=True)
    city = models.CharField(max_length=255)
    address = models.TextField()
    referral_type = models.CharField(max_length=255, blank=True, null=True)
    referral_doctor = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    

class PatientVisit(models.Model):
    clinic = models.ForeignKey(Clinic, on_delete=models.SET_NULL, null=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    visited_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    purpose_of_visit = models.CharField(max_length=255)
    present_complaint = models.CharField(max_length=255)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

class TestsRequired(models.Model):
    visit = models.ForeignKey(PatientVisit, on_delete=models.CASCADE)
    pta = models.BooleanField(default=False)
    tympanometry = models.BooleanField(default=False)
    srt = models.BooleanField(default=False)
    sds = models.BooleanField(default=False)
    ucl = models.BooleanField(default=False)
    free_field = models.BooleanField(default=False)
    bera_assr = models.BooleanField(default=False)
    oae = models.BooleanField(default=False)
    special_test = models.BooleanField(default=False)


class AudiologistCaseHistory(models.Model):
    visit = models.ForeignKey(PatientVisit, on_delete=models.CASCADE)
    medical_history = models.TextField()
    family_history = models.TextField()
    noise_exposure = models.TextField()
    previous_ha_experience = models.TextField()
    red_flags = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class TestsPerformed(models.Model):
    visit = models.ForeignKey(PatientVisit, on_delete=models.CASCADE)
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
    visit = models.ForeignKey(PatientVisit, on_delete=models.CASCADE)
    file_type = models.CharField(max_length=100)
    file_path = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


class Trial(models.Model):
    clinic = models.ForeignKey(Clinic, on_delete=models.SET_NULL, null=True)
    visit = models.ForeignKey(PatientVisit, on_delete=models.CASCADE)
    
    brand = models.CharField(max_length=255)
    model = models.CharField(max_length=255)
    technology_level = models.CharField(max_length=255)
    serial_number = models.CharField(max_length=255)

    srt_before = models.CharField(max_length=255, blank=True, null=True)
    sds_before = models.CharField(max_length=255, blank=True, null=True)
    ucl_before = models.CharField(max_length=255, blank=True, null=True)

    patient_response = models.CharField(max_length=255)
    counselling_notes = models.TextField()
    discount_offered = models.FloatField(blank=True, null=True)
    followup_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    







