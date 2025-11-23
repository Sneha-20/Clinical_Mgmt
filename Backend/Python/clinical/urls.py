
# ...existing code...
from django.urls import path
from .views import PatientRegistrationView

urlpatterns = [
   path('patient/register/', PatientRegistrationView.as_view(), name='patient_register'),


]
