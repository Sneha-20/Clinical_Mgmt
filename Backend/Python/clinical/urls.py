
# ...existing code...
from django.urls import path
from .views import (PatientRegistrationView,PatientVisitListView,PatientDetailView,PatientVisitsView,PatientVisitCreateView,TodayPatientVisitsView,
                    PatientVisitUpdateView,PatientUpdateView,PatientFlatListView,DashboardStatsView,DoctorFlatListView)

urlpatterns = [
   path('patient/register/', PatientRegistrationView.as_view(), name='patient_register'),
   path('patient/<int:id>/', PatientDetailView.as_view(), name='patient_detail'), # Retrieve patient details
   
   path('patient/visit/create/', PatientVisitCreateView.as_view(), name='patient_visit_create'), # Create patient visit record
   path('patient/visits/today/', TodayPatientVisitsView.as_view(), name='today_patient_visits'), # Today's patient visits
   path('patient/<int:id>/visits/', PatientVisitsView.as_view(), name='patient_visits'), # All visits for a patient
   path('patient/visit/', PatientVisitListView.as_view(), name='patient_list'), # List all patient visits
   path('patient/visit/<int:id>/update/', PatientVisitUpdateView.as_view(), name='patient_visit_update'), # Update patient visit
   path('patient/<int:id>/update/', PatientUpdateView.as_view(), name='patient_update'), # Update patient details
   path('patient/flat-list/', PatientFlatListView.as_view(), name='patient_flat_list'), # Flat list of patients for dropdowns and search by name

   path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard_stats'), # Dashboard statistics
   path('doctor/flat-list/', DoctorFlatListView.as_view(), name='doctor_flat_list'), # Flat list of doctors for dropdowns and search by name

]
