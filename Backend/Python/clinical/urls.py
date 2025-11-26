
# ...existing code...
from django.urls import path
from .views import PatientRegistrationView,PatientListView

urlpatterns = [
   path('patient/register/', PatientRegistrationView.as_view(), name='patient_register'),
   path('patient/list/', PatientListView.as_view(), name='patient_list'),


]
