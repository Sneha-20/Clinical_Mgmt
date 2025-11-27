
# ...existing code...
from django.urls import path
from .views import PatientRegistrationView,PatientVisitListView,PatientDetailView,PatientVisitsView,PatientVisitCreateView,TodayPatientVisitsView

urlpatterns = [
   path('patient/register/', PatientRegistrationView.as_view(), name='patient_register'),
   path('patient/visit/', PatientVisitListView.as_view(), name='patient_list'),
   path('patient/<int:id>/', PatientDetailView.as_view(), name='patient_detail'),
   path('patient/<int:id>/visits/', PatientVisitsView.as_view(), name='patient_visits'),
   path('patient/visit/create/', PatientVisitCreateView.as_view(), name='patient_visit_create'),
   path('patient/visits/today/', TodayPatientVisitsView.as_view(), name='today_patient_visits'),




]
