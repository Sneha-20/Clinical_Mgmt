from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
# from ..clinical.models import Clinic
class Clinic(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField()
    phone = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    is_main_inventory = models.BooleanField(default=False, help_text="Designates this clinic as the main inventory source")

    def __str__(self):
        return self.name
    

class Role(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name
    

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")

        email = self.normalize_email(email)
        # when users self-register they should not be active until approved
        extra_fields.setdefault('is_active', False)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # hashes password
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_approved', True)

        user = self.create_user(email, password, **extra_fields)

        # Ensure superuser has Admin role set
        admin_role, _ = Role.objects.get_or_create(name='Admin')
        user.role = admin_role
        user.save(update_fields=['role'])

        return user

class User(AbstractBaseUser, PermissionsMixin):
    clinic = models.ForeignKey("Clinic", on_delete=models.SET_NULL, null=True, blank=True)

    name = models.CharField(max_length=255)
    # Each user has exactly one role (or None if not yet assigned)
    role = models.ForeignKey(
        Role,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users",
    )
    phone = models.CharField(max_length=50, unique=True, null=True, blank=True)

    email = models.EmailField(unique=True)

    is_approved = models.BooleanField(default=False)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  # email + password only

    objects = UserManager()

    def __str__(self):
        return self.email


class ClinicManagerAssignment(models.Model):
    manager = models.ForeignKey(User, on_delete=models.CASCADE, related_name='managed_clinics_assignments')
    clinic = models.ForeignKey(Clinic, on_delete=models.CASCADE, related_name='manager_assignments')
    assigned_at = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='clinic_assignments_created')

    class Meta:
        unique_together = ('manager', 'clinic')
