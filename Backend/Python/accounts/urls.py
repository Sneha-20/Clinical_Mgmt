
# ...existing code...
from django.urls import path
from .views import TokenObtainWithClinicView, ClinicListView, RegisterView,ChangePasswordView,RoleListView

urlpatterns = [
    path('token/', TokenObtainWithClinicView.as_view(), name='token_obtain_with_clinic'),
    path('clinics/', ClinicListView.as_view(), name='clinic_list'),
        path('roles/', RoleListView.as_view(), name='role_list'),
    path('register/', RegisterView.as_view(), name='register'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password')


]
