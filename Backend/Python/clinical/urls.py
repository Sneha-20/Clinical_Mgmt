
# ...existing code...
from django.urls import path
from .views import (PatientRegistrationView,PatientVisitListView,PatientDetailView,PatientVisitsView,PatientVisitCreateView,TodayPatientVisitsView,
                    PatientVisitUpdateView,PatientUpdateView,PatientFlatListView,DashboardStatsView,DoctorFlatListView,AudiologistPatientQueueView,
                    PatientVisitDetailView,PatientVisitFullDetailsView,AudiologistCaseHistoryCreateView,BillDetailView,BillPaidListView,BillPendingListView,TrialDeviceReturnView,
                    TestResultListView,TestUploadDeleteView,MarkAsPaidView,DeviceBookingDropdownView,DeviceBookingSerialView,PatientVisitFollowupView,
                    MarkPatientContactedView)

from .api_inventory_item_update import InventoryItemUpdateView,InventorySerialNumberCreateView
from .api_inventory_dropdowns import InventoryDropdownsView
from .api_inventory_item_list import (InventoryItemListView, InventorySerialListView, InventoryItemPendingListView,
                                      ApproveInventoryItemView,MainInventoryItemListView,InventoryTransferHistoryView)
from .api_inventory_item_create import InventoryItemCreateView,InventoryItemDestroyView, BrandListView, BrandCreateView, ModelCreateView, ModelListView
from .api_trials import TrialCreateView, TrialListView
from .api_trial_devices import TrialDeviceListView
from .api_trial_device_serials import TrialDeviceSerialListView, ProductInfoBySerialView, TrialDeviceInUseListView, TrialAvailableModelsView
from .test_upload_views import TestUploadListCreateView
from .completed_tests_views import CompletedTestsListView, CompletedTestDetailView, PatientTestHistoryView
from .trial_completion_view import TrialCompletionView
from .api_for_services import CustomerNeedService,DeviceNeedService,ServiceVisitUpdateView,ServiceVisitCreateView,ServiceTypeListView,ServiceVisitList,ServiceDetailView,PartsUsedListView
from .admin_services import (AdminRevenueReportsView,AdminClinicReportView)
from .admin_staff_performance import AdminTrialPerformanceAPIView
from .api_patient_history import PatientPurchaseHistoryView, PatientServiceVisitHistoryView, PatientPurchaseDetailView, PatientServiceVisitDetailView
from .api_inventory_transfer import InventoryTransferView, InventoryTransferHistoryView,InventoryFlatListView


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
   path('audiologits/queue/',AudiologistPatientQueueView.as_view(), name='audiologist_queue'), # Audiologist queue 

   path('patient/visit/<int:id>/',PatientVisitDetailView.as_view()), # Patient visit details by visit ID 
   # path('patient/visit/<int:id>/full/',PatientVisitFullDetailsView.as_view()), # Full patient visit details with tests and trials
   path('audiologist/test/perform/',AudiologistCaseHistoryCreateView.as_view()), # PAtient test performed and result uploaded 
   
   # Bill endpoints
   path('bill/paid/', BillPaidListView.as_view(), name='bill_list'), # List bills with patient info and status
   path('bill/pending/', BillPendingListView.as_view(), name='bill_list'), # List bills with patient info and status
   path('bill/visit/<int:visit_id>/', BillDetailView.as_view(), name='bill_detail'), # Get bill details by visit ID

   #  # InventoryItem update endpoint
   path('inventory-item/<int:pk>/update/', InventoryItemUpdateView.as_view(), name='inventory_item_update'),

   # Inventory dropdowns endpoint
   path('inventory/dropdowns/', InventoryDropdownsView.as_view(), name='inventory_dropdowns'),

   # Trial endpoints
   path('trials/create/', TrialCreateView.as_view(), name='trial_create'),
   path('trials/', TrialListView.as_view(), name='trial_list'),
   path('trials/<int:trial_id>/complete/', TrialCompletionView.as_view(), name='trial_complete'),

   # Trial devices from inventory
   path('inventory/trial-devices/', TrialDeviceListView.as_view(), name='trial_device_list'),

   # Trial device serials with count > 0
   path('inventory/trial-device-serials/', TrialDeviceSerialListView.as_view(), name='trial_device_serial_list'),
   path('inventory/trial-available-models/', TrialAvailableModelsView.as_view(), name='trial_available_models'),

   # Product info by serial number
   path('inventory/product-by-serial/<str:serial_number>/', ProductInfoBySerialView.as_view(), name='product_info_by_serial'),

   # Trial devices in use list
   path('inventory/trial-devices-in-use/', TrialDeviceInUseListView.as_view(), name='trial_devices_in_use'),

   path('test-uploads/', TestUploadListCreateView.as_view(), name='test-upload-list-create'),

   # Completed tests APIs for audiologists
   path('completed-tests/', CompletedTestsListView.as_view(), name='completed-tests-list'),
   path('completed-tests/<int:visit_id>/', CompletedTestDetailView.as_view(), name='completed-test-detail'),
   path('patient/<int:patient_id>/test-history/', PatientTestHistoryView.as_view(), name='patient-test-history'),
   path('api/inventory/return-trial-device/', TrialDeviceReturnView.as_view(), name='return-trial-device'),


   path('test-results/<int:visit_id>/', TestResultListView.as_view(), name='test-result-list'),
   path('test-upload/<int:file_id>/delete/', TestUploadDeleteView.as_view(), name='test-upload-delete'),

   path('mark-bill-paid/<int:bill_id>/', MarkAsPaidView.as_view(), name='mark-bill-paid'),

   path('device-booking/inventory/',DeviceBookingDropdownView.as_view()),

   # Service queue endpoints
   path('patient/service-list/', CustomerNeedService.as_view(), name='service_queue'),
   path('patient/<int:patient_id>/device-purchases/', DeviceNeedService.as_view(), name='patient_device_purchases'),
   
   # Service visit endpoints
   path('service/visit/create/', ServiceVisitCreateView.as_view(), name='service_visit_create'),
   path('service/visit/<int:service_id>/update/', ServiceVisitUpdateView.as_view(), name='service_visit_update'),
   path('service/visit/list/', ServiceVisitList.as_view(), name='service_visit_list'),
   path('service/visit/<int:service_id>/', ServiceDetailView.as_view(), name='service_detail'),
   path('service/types/', ServiceTypeListView.as_view(), name='service_types'),
   path('service/parts-used/', PartsUsedListView.as_view(), name='parts_used_list'),

   path('device-booking/serial/<int:inventory_item_id>/',DeviceBookingSerialView.as_view()),
   path('patient-visits/followup',PatientVisitFollowupView.as_view()),
   path('patient-visits/<int:visit_id>/mark-contacted/',MarkPatientContactedView.as_view()),

   # Admin Dashboard APIs
   path('admin/revenue-reports/', AdminRevenueReportsView.as_view(), name='admin_revenue_reports'),
   path('inventory/serial-number/create/', InventorySerialNumberCreateView.as_view(), name='inventory_serial_number_create'),
   path('admin/clinic-report/', AdminClinicReportView.as_view(), name='admin_clinic_report'),
   path('inventory/item/create/', InventoryItemCreateView.as_view(), name='inventory_item_create'),
   path('inventory/items/', InventoryItemListView.as_view(), name='inventory_item_list'),
   path('inventory/serial/list/', InventorySerialListView.as_view(), name='inventory_serial_list'),
   path('inventory/item/<int:pk>/destroy/', InventoryItemDestroyView.as_view(), name='inventory_item_destroy'),
   path('admin/trial-performance/',AdminTrialPerformanceAPIView.as_view(),name='admin_trial_performance'),

   # Patient history APIs
   path('patient/<int:patient_id>/purchases/', PatientPurchaseHistoryView.as_view(), name='patient_purchase_history'),
   path('patient/<int:patient_id>/service-visits/', PatientServiceVisitHistoryView.as_view(), name='patient_service_visit_history'),
   # path('patient/purchase/<int:purchase_id>/', PatientPurchaseDetailView.as_view(), name='patient_purchase_detail'),
   # path('patient/service-visit/<int:service_id>/', PatientServiceVisitDetailView.as_view(), name='patient_service_visit_detail'),

   # Inventory Transfer
   path('inventory/transfer/', InventoryTransferView.as_view(), name='inventory_transfer'),
   path('inventory/transfer/history/', InventoryTransferHistoryView.as_view(), name='inventory_transfer_history'),
   path('inventory/flat-list/', InventoryFlatListView.as_view(), name='inventory_flat_list'),
   path('inventory/items/pending/', InventoryItemPendingListView.as_view(), name='inventory_item_pending_list'),
   path('inventory/item/<int:pk>/approve/', ApproveInventoryItemView.as_view(), name='approve_inventory_item'),
   path('inventory/items/main/', MainInventoryItemListView.as_view(), name='main_inventory_item_list'),
   path('inventory/transfers/', InventoryTransferHistoryView.as_view(), name='inventory_transfers'),
   


   # Brand and Model endpoints
   path('inventory/brands/', BrandListView.as_view(), name='brand_list'),
   path('inventory/brands/create/', BrandCreateView.as_view(), name='brand_create'),
   path('inventory/models/', ModelListView.as_view(), name='model_list'),
   path('inventory/models/create/', ModelCreateView.as_view(), name='model_create'),

]
