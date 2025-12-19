
# ...existing code...
from django.urls import path
from .views import (PatientRegistrationView,PatientVisitListView,PatientDetailView,PatientVisitsView,PatientVisitCreateView,TodayPatientVisitsView,
                    PatientVisitUpdateView,PatientUpdateView,PatientFlatListView,DashboardStatsView,DoctorFlatListView,AudiologistPatientQueueView,
                    PatientVisitDetailView,AudiologistCaseHistoryCreateView,BillDetailView,BillPaidListView,BillPendingListView)

from .api_inventory_serial import InventorySerialBulkUploadView,InventorySerialManualCreateView
from .api_inventory_item_update import InventoryItemUpdateView
from .api_inventory_dropdowns import InventoryDropdownsView
from .api_inventory_item_list import InventoryItemListView
from .api_inventory_item_create import InventoryItemCreateView
from .api_service_visit_list import ServiceVisitListView
from .api_service_queue import ServiceQueueView
from .api_trials import TrialCreateView, TrialListView
from .api_trial_devices import TrialDeviceListView

urlpatterns = [
   path('inventory/item/create/', InventoryItemCreateView.as_view(), name='inventory_item_create'),
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
   path('audiologits/queue/',AudiologistPatientQueueView.as_view(), name='audiologist_queue'), # Audiologist queue 

   path('patient/visit/<int:id>/',PatientVisitDetailView.as_view()), # Patient visit details by visit ID 
   path('audiologist/test/perform/',AudiologistCaseHistoryCreateView.as_view()), # PAtient test performed and result uploaded 
   
   # Bill endpoints
   path('bill/paid/', BillPaidListView.as_view(), name='bill_list'), # List bills with patient info and status
   path('bill/pending/', BillPendingListView.as_view(), name='bill_list'), # List bills with patient info and status
   path('bill/visit/<int:visit_id>/', BillDetailView.as_view(), name='bill_detail'), # Get bill details by visit ID

   # # InventorySerial bulk upload endpoint
   # path('inventory-serial/bulk-upload/', InventorySerialBulkUploadView.as_view(), name='inventory_serial_bulk_upload'),
   # path('inventory-serial/manual-create/', InventorySerialManualCreateView.as_view(), name='inventory_serial_manual_create'),

   #  # InventoryItem update endpoint
   path('inventory-item/<int:pk>/update/', InventoryItemUpdateView.as_view(), name='inventory_item_update'),

   # Inventory dropdowns endpoint
   path('inventory/dropdowns/', InventoryDropdownsView.as_view(), name='inventory_dropdowns'),

   # Inventory item list endpoint
   path('inventory/items/', InventoryItemListView.as_view(), name='inventory_item_list'),
   path('service-visits/', ServiceVisitListView.as_view(), name='service_visit_list'),
   path('service-queue/', ServiceQueueView.as_view(), name='service_queue'),

   # Trial endpoints
   path('trials/create/', TrialCreateView.as_view(), name='trial_create'),
   path('trials/', TrialListView.as_view(), name='trial_list'),

   # Trial devices from inventory
   path('inventory/trial-devices/', TrialDeviceListView.as_view(), name='trial_device_list'),









]


