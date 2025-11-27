# ...existing code...
from django.contrib import admin

# Register your models here.

from .models import User, Role, Clinic
 
class UserAdmin(admin.ModelAdmin):
  list_display = ("email", "name", "phone", "is_active", "is_staff", "is_approved")
  search_fields = ("email", "name", "phone")
  list_filter = ("is_active", "is_staff", "is_approved", "role")
  readonly_fields = ("created_at",)

  def save_model(self, request, obj, form, change):
    # If creating a new user or password was changed in admin form, hash it
    if not change:
        # new object: obj.password contains the raw password entered in admin
        raw = obj.password
        if raw:
            obj.set_password(raw)
    else:
        # existing object: if admin edited password field, hash the new value
        if "password" in form.changed_data:
            raw = obj.password
            if raw:
                obj.set_password(raw)
    super().save_model(request, obj, form, change)

admin.site.register(User, UserAdmin)
admin.site.register(Role)
admin.site.register(Clinic)
