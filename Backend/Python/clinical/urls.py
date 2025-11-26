
# ...existing code...
from django.urls import path
from .views import PatientRegistrationView,PatientListView,PatientDetailView,PatientVisitsView

urlpatterns = [
   path('patient/register/', PatientRegistrationView.as_view(), name='patient_register'),
   path('patient/list/', PatientListView.as_view(), name='patient_list'),
   path('patient/<int:id>/', PatientDetailView.as_view(), name='patient_detail'),
   path('patient/<int:id>/visits/', PatientVisitsView.as_view(), name='patient_visits'),


]
