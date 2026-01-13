## Get the Patient Name with Phone number whose patient visit status is Pending for Service 
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import PatientVisit, Patient, InventorySerial, PatientPurchase, ServiceVisit
from django.utils import timezone


class CustomerNeedService(APIView):
    """
    API to get patients whose visit status is 'Pending for Service'.
    Returns patient name and phone number for service queue.
    """
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        try:
            # Get patient visits with status 'Pending for Service'
            # Use values to get unique patients with their latest visit
            service_visits = PatientVisit.objects.filter(
                status='Pending for Service',
                clinic=getattr(request.user, 'clinic', None)
            ).select_related('patient').order_by('patient_id', '-created_at')
            
            # Get unique patients (latest visit per patient)
            unique_patients = {}
            for visit in service_visits:
                if visit.patient_id not in unique_patients:
                    unique_patients[visit.patient_id] = visit
            
            # Prepare patient data
            patients_data = []
            for patient_id, visit in unique_patients.items():
                patient_data = {
                    'patient_id': visit.patient.id,
                    'patient_name': visit.patient.name,
                    'phone_primary': visit.patient.phone_primary
                }
                patients_data.append(patient_data)
            
            return Response({
                'status': status.HTTP_200_OK,
                # 'message': f'Found {len(patients_data)} patients pending for service',
                'data': patients_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': f'Error fetching service queue: {str(e)}',
                'data': []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Get Device Inventory Purchase  based on patient ID 
class DeviceNeedService(APIView):
    """
    API to get device inventory purchases for a specific patient.
    Returns all devices purchased by the patient with purchase details.
    """
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request, patient_id, *args, **kwargs):
        try:
            # Validate patient exists
            from .models import PatientPurchase
            try:
                patient = Patient.objects.get(id=patient_id, clinic=getattr(request.user, 'clinic', None))
            except Patient.DoesNotExist:
                return Response({
                    'status': status.HTTP_404_NOT_FOUND,
                    'message': 'Patient not found',
                    'data': []
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Get all purchases for this patient
            purchases = PatientPurchase.objects.filter(
                patient=patient,
                clinic=getattr(request.user, 'clinic', None)
            ).select_related(
                'inventory_item', 
                'inventory_serial',
                'visit'
            ).order_by('-purchased_at')
            
            # Prepare purchase data
            purchases_data = []
            for purchase in purchases:
                purchase_data = {
                    'inventory_item_id': purchase.inventory_item.id,
                    'product_name': purchase.inventory_item.product_name,
                    'brand': purchase.inventory_item.brand,
                    'model_type': purchase.inventory_item.model_type,
                    'serial_number': purchase.inventory_serial.serial_number if purchase.inventory_serial else None
                }
                purchases_data.append(purchase_data)
            
            return Response({
                'status': status.HTTP_200_OK,
                'data': purchases_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': f'Error fetching device purchases: {str(e)}',
                'data': []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ServiceVisitCreateView(APIView):
    """
    API to create service visit records.
    Handles various service types including device repairs, adjustments, and maintenance.
    """
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        try:
            # Get data from request
            patient_id = request.data.get('patient_id')
            service_type = request.data.get('service_type')
            device_need_service = request.data.get('device_serial_need_service')  # From purchase record history
            complaint = request.data.get('complaint', '')
            warranty_applicable = request.data.get('warranty_applicable', False)
            
            # Validate required fields
            if not patient_id:
                return Response({
                    'status': status.HTTP_400_BAD_REQUEST,
                    'message': 'Customer name is required',
                    'data': {}
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not service_type:
                return Response({
                    'status': status.HTTP_400_BAD_REQUEST,
                    'message': 'Service type is required',
                    'data': {}
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get or create patient
            patient = Patient.objects.get(id=patient_id)

            visit_id = PatientVisit.objects.filter(patient=patient, status='Pending for Service').latest('created_at')
            print(device_need_service)
            inventory_serial = PatientPurchase.objects.get(inventory_serial__serial_number=device_need_service)

            # Create record in ServiceVisit table 
            service_visit_data = {
                'visit': visit_id,
                'device': inventory_serial,
                'device_serial': inventory_serial.inventory_serial,
                'service_type': service_type,
                'complaint': complaint,
                'warranty_applicable': warranty_applicable,
                'created_by': request.user,
                'created_at': timezone.now(),
            }
            
            service_visit = ServiceVisit.objects.create(**service_visit_data)
            
            return Response({
                'status': status.HTTP_200_OK,
                'message': 'Service visit created successfully'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': f'Error creating service visit: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ServiceTypeListView(APIView):
    """
    API to get list of available service types.
    """
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        try:
            service_types = [
                {'value': 'Battery Change', 'label': 'Battery Change'},
                {'value': 'Tip / Dome Change', 'label': 'Tip / Dome Change'},
                {'value': 'Repair', 'label': 'Repair'},
                {'value': 'Cleaning & Maintenance', 'label': 'Cleaning & Maintenance'},
                {'value': 'Follow-up Service', 'label': 'Follow-up Service'},
            ]
            
            return Response({
                'status': status.HTTP_200_OK,
                'message': f'Found {len(service_types)} service types',
                'data': service_types
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': f'Error fetching service types: {str(e)}',
                'data': []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
