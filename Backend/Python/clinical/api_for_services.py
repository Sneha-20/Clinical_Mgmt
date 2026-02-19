## Get the Patient Name with Phone number whose patient visit status is Pending for Service 
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db import transaction
from .models import PatientVisit, Patient, InventorySerial, PatientPurchase, ServiceVisit, InventoryItem
from django.utils import timezone
from clinical_be.utils.pagination import StandardResultsSetPagination
from django.db.models import Q



class CustomerNeedService(APIView):
    """
    API to get patients whose visit status is 'Pending for Service'.
    Returns patient name and phone number for service queue.
    """
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        try:
            # Get patient visits with status 'Pending for Service' that don't have service visits yet
            # Use values to get unique patients with their latest visit
            service_visits = PatientVisit.objects.filter(
                status='Pending for Service',
                clinic=getattr(request.user, 'clinic', None)
            ).exclude(
                id__in=ServiceVisit.objects.values_list('visit_id', flat=True)
            ).select_related('patient').order_by('patient_id', '-created_at')

            search_query = request.query_params.get('search', None)
            if search_query:
                service_visits = service_visits.filter(
                    Q(patient__name__icontains=search_query) |
                    Q(patient__phone_primary__icontains=search_query)
                )
            
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
            
            # Get all devices that already have service visits created
            serviced_devices = ServiceVisit.objects.filter(
                visit__patient=patient
            ).values_list('device_id', flat=True)

            print(serviced_devices)
            
            # Get serial numbers that are already in service for this patient
            service_serials = ServiceVisit.objects.filter(
                visit__patient=patient,
                device_serial__isnull=False
            ).values_list('device_serial__serial_number', flat=True)
            
            # Prepare purchase data
            purchases_data = []
            for purchase in purchases:
                # Skip if this device already has a service visit created
                if purchase.id in serviced_devices:
                    continue
                    
                # Skip if this device serial is already in service
                if purchase.inventory_serial and purchase.inventory_serial.serial_number in service_serials:
                    continue
                    
                purchase_data = {
                    'inventory_item_id': purchase.inventory_item.id,
                    'product_name': purchase.inventory_item.product_name,
                    'brand': purchase.inventory_item.brand.name,
                    'model_type': purchase.inventory_item.model_type.name,
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


class ServiceVisitUpdateView(APIView):
    """
    API to update service visit records with action taken, parts used, charges, and billing.
    """
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request, service_id, *args, **kwargs):
        try:
            # Get service visit
            from .models import ServiceVisit, ServicePartUsed, Bill, BillItem, InventoryItem
            try:
                service_visit = ServiceVisit.objects.get(
                    id=service_id,
                    # clinic=getattr(request.user, 'clinic', None)
                )
            except ServiceVisit.DoesNotExist:
                return Response({
                    'status': status.HTTP_404_NOT_FOUND,
                    'message': 'Service visit not found',
                    'data': {}
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Get data from request
            action_taken = request.data.get('action_taken', '')
            parts_used = request.data.get('parts_used', [])  # List of parts with quantity
            charges_collected = request.data.get('charges_collect_for_service', 0)
            rtc_date = request.data.get('rtc_date')  # Return to customer date
            status_update = request.data.get('status', 'Completed')
            add_to_bill = request.data.get('add_to_bill', True)
            
            with transaction.atomic():
                # Update service visit
                service_visit.action_taken = action_taken
                service_visit.charges_collected = charges_collected
                service_visit.status = status_update
                service_visit.action_taken_on = timezone.now()
                
                if rtc_date:
                    service_visit.rtc_date = rtc_date
                
                service_visit.save()
                
                # Handle parts used
                parts_created = []
                if parts_used:
                    # Remove existing parts if any
                    ServicePartUsed.objects.filter(service=service_visit).delete()
                    
                    # Add new parts
                    for part_data in parts_used:
                        inventory_item_id = part_data.get('inventory_item_id')
                        quantity = part_data.get('quantity', 1)
                        
                        if inventory_item_id and quantity > 0:
                            try:
                                inventory_item = InventoryItem.objects.get(id=inventory_item_id)
                                
                                # Create service part record
                                service_part = ServicePartUsed.objects.create(
                                    service=service_visit,
                                    inventory_item=inventory_item,
                                    quantity=quantity
                                )
                                parts_created.append({
                                    'part_id': service_part.id,
                                    'inventory_item': inventory_item.id,
                                    'quantity': quantity
                                })
                                
                                # Update inventory quantity for non-serialized items
                                if inventory_item.stock_type == 'Non-Serialized':
                                    inventory_item.quantity_in_stock -= quantity
                                    inventory_item.save()
                                    
                            except InventoryItem.DoesNotExist:
                                continue
                
                # Add to bill if requested
                bill_created = None

                # change
                if add_to_bill and (charges_collected > 0.0 or parts_used):
                    # Get or create bill for the service visit
                    bill, created = Bill.objects.get_or_create(
                        visit=service_visit.visit,
                        defaults={
                            'clinic': service_visit.visit.clinic,
                            'created_by': request.user,
                        }
                    )
                    
                    # Add service charges to bill
                    if charges_collected > 0:
                        BillItem.objects.create(
                            bill=bill,
                            item_type='Service',
                            service_visit=service_visit,
                            description=f"Service charges for {service_visit.service_type}",
                            cost=charges_collected,
                            quantity=1,
                        )
                    
                    # Add parts to bill
                    if len(parts_created) > 0:
                        for part_data in parts_created:
                            inventory_item = InventoryItem.objects.get(id=part_data['inventory_item'])
                            BillItem.objects.create(
                                bill=bill,
                                item_type='Part Used in Service',
                                description=f"{inventory_item.product_name} (Qty: {part_data['quantity']})",
                                cost=inventory_item.unit_price * part_data['quantity'],
                                quantity=part_data['quantity'],
                            )
                    
                    # Calculate bill total
                    bill.calculate_total()
                    bill_created = {
                        'bill_id': bill.id,
                        'total_amount': float(bill.total_amount),
                        # 'status': bill.status
                    }
                    
                    # Update the visit status to 'Completed'
                    visit = service_visit.visit
                    visit.status = 'Service Completed'
                    visit.save()
                
                return Response({
                    'status': status.HTTP_200_OK,
                    'message': 'Service visit updated successfully',
                    # 'data': {
                    #     'service_id': service_visit.id,
                    #     'status': service_visit.status,
                    #     'action_taken': action_taken,
                    #     'charges_collected': float(charges_collected),
                    #     'rtc_date': service_visit.rtc_date,
                    #     'parts_used': parts_created,
                    #     'bill_created': bill_created
                    # }
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': f'Error updating service visit: {str(e)}',
                'data': {}
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



# List the service visit details
class ServiceVisitList(APIView):
    """
    API to list all service visit records with filtering and search capabilities.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        try:
            # Get query parameters
            status_filter = request.query_params.get('status')
            service_type = request.query_params.get('service_type')
            patient_name = request.query_params.get('search')
            # date_from = request.query_params.get('date_from')
            # date_to = request.query_params.get('date_to')
            
            # Start with base queryset
            service_visits = ServiceVisit.objects.filter(
                visit__clinic=getattr(request.user, 'clinic', None)
            ).select_related(
                'visit__patient',
                'device__inventory_item',
                'device__inventory_serial',
                'device_serial',
                'created_by'
            ).order_by('-created_at')
            
            # Apply filters
            if status_filter:
                service_visits = service_visits.filter(status=status_filter)
            
            if service_type:
                service_visits = service_visits.filter(service_type__icontains=service_type)
            
            if patient_name:
                service_visits = service_visits.filter(
                    visit__patient__name__icontains=patient_name
                )
            
            # if date_from:
            #     service_visits = service_visits.filter(created_at__date__gte=date_from)
            
            # if date_to:
            #     service_visits = service_visits.filter(created_at__date__lte=date_to)
            
            # Apply pagination
            paginator = StandardResultsSetPagination()
            paginated_queryset = paginator.paginate_queryset(service_visits, request)
            
            # Prepare service visit data
            service_data = []
            for service in paginated_queryset:
                # Get parts used for this service
                # parts_used = []
                # for part in service.parts_used.all():
                #     parts_used.append({
                #         'part_id': part.id,
                #         'inventory_item_id': part.inventory_item.id,
                #         'inventory_item_name': part.inventory_item.product_name,
                #         'quantity': part.quantity,
                #         'unit_price': float(part.inventory_item.unit_price) if part.inventory_item.unit_price else 0
                #     })
                
                service_record = {
                    'service_id': service.id,
                    # 'patient_id': service.visit.patient.id if service.visit and service.visit.patient else None,
                    'patient_name': service.visit.patient.name if service.visit and service.visit.patient else None,
                    'phone_primary': service.visit.patient.phone_primary if service.visit and service.visit.patient else None,
                    'service_type': service.service_type,
                    'status': service.status,
                    'complaint': service.complaint,
                    'action_taken': service.action_taken,
                    'action_taken_on': service.action_taken_on if service.action_taken else None
                    # 'warranty_applicable': service.warranty_applicable,
                    # 'charges_collected': float(service.charges_collected) if service.charges_collected else 0,
                    # 'rtc_date': service.rtc_date,
                    # 'created_at': service.created_at,
                    # 'created_by': service.created_by.name if service.created_by else None,
                    # 'device_info': {
                    #     'device_id': service.device.id if service.device else None,
                    #     'product_name': service.device.inventory_item.product_name if service.device and service.device.inventory_item else None,
                    #     'brand': service.device.inventory_item.brand.name if service.device and service.device.inventory_item and service.device.inventory_item.brand else None,
                    #     'model': service.device.inventory_item.model_type if service.device and service.device.inventory_item else None,
                    #     'serial_number': service.device.inventory_serial.serial_number if service.device and service.device.inventory_serial else None,
                    # } if service.device else None,
                    # 'parts_used': parts_used,
                    # 'total_parts_cost': sum([part['unit_price'] * part['quantity'] for part in parts_used])
                }
                service_data.append(service_record)
            
            return paginator.get_paginated_response(service_data)
            
        except Exception as e:
            return Response({
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': f'Error fetching service visits: {str(e)}',
                'data': []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# API for service detail by service id
class ServiceDetailView(APIView):
    """
    API to get detailed information for a specific service visit.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, service_id, *args, **kwargs):
        try:
            # Get service visit with all related data
            service_visit = ServiceVisit.objects.filter(
                id=service_id,
                # clinic=getattr(request.user, 'clinic', None)
            ).select_related(
                'visit__patient',
                'device__inventory_item',
                'device__inventory_serial',
                'device_serial',
                'created_by'
            ).prefetch_related('parts_used__inventory_item').first()
            
            if not service_visit:
                return Response({
                    'status': status.HTTP_404_NOT_FOUND,
                    'message': 'Service visit not found',
                    'data': {}
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Get parts used for this service
            parts_used = []
            for part in service_visit.parts_used.all():
                parts_used.append({
                    'part_id': part.id,
                    'inventory_item_id': part.inventory_item.id,
                    'inventory_item_name': part.inventory_item.product_name,
                    'inventory_item_brand': part.inventory_item.brand if part.inventory_item.brand else None,
                    'inventory_item_model': part.inventory_item.model_type,
                    'quantity': part.quantity,
                    'unit_price': float(part.inventory_item.unit_price) if part.inventory_item.unit_price else 0,
                    'total_cost': float(part.inventory_item.unit_price * part.quantity) if part.inventory_item.unit_price else 0
                })
            
            # Prepare complete service record
            service_record = {
                'service_id': service_visit.id,
                # 'patient_id': service_visit.visit.patient.id if service_visit.visit and service_visit.visit.patient else None,
                'patient_name': service_visit.visit.patient.name if service_visit.visit and service_visit.visit.patient else None,
                'phone_primary': service_visit.visit.patient.phone_primary if service_visit.visit and service_visit.visit.patient else None,
                # 'phone_secondary': service_visit.visit.patient.phone_secondary if service_visit.visit and service_visit.visit.patient else None,
                # 'email': service_visit.visit.patient.email if service_visit.visit and service_visit.visit.patient else None,
                'service_type': service_visit.service_type,
                'status': service_visit.status,
                'complaint': service_visit.complaint,
                'action_taken': service_visit.action_taken,
                'action_taken_on': service_visit.action_taken_on,
                # 'warranty_applicable': service_visit.warranty_applicable,
                'charges_collected': float(service_visit.charges_collected) if service_visit.charges_collected else 0,
                'rtc_date': service_visit.rtc_date,
                # 'created_at': service_visit.created_at,
                # 'created_by': service_visit.created_by.name if service_visit.created_by else None,
                'device_info': {
                    'device_id': service_visit.device.id if service_visit.device else None,
                    # 'purchase_id': service_visit.device.id if service_visit.device else None,
                    'product_name': service_visit.device.inventory_item.product_name if service_visit.device and service_visit.device.inventory_item else None,
                    'brand': service_visit.device.inventory_item.brand.name if service_visit.device and service_visit.device.inventory_item and service_visit.device.inventory_item.brand else None,
                    'model': service_visit.device.inventory_item.model_type.name if service_visit.device and service_visit.device.inventory_item else None,
                    'serial_number': service_visit.device.inventory_serial.serial_number if service_visit.device and service_visit.device.inventory_serial else None,
                    'purchase_date': service_visit.device.purchased_at if service_visit.device else None
                } if service_visit.device else None,
                'parts_used': parts_used,
                'total_parts_cost': sum([part['total_cost'] for part in parts_used]),
                'total_service_cost': float(service_visit.charges_collected) if service_visit.charges_collected else 0,
                'grand_total': sum([part['total_cost'] for part in parts_used]) + (float(service_visit.charges_collected) if service_visit.charges_collected else 0)
            }
            
            return Response({
                'status': status.HTTP_200_OK,
                'message': 'Service visit details retrieved successfully',
                'data': service_record
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': f'Error fetching service visit details: {str(e)}',
                'data': {}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Parts Used Dropdown API
class PartsUsedListView(APIView):
    """
    API to list all inventory items for parts used dropdown.
    Returns inventory items with product name, brand, model, and price.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        try:
            # Get search parameter from query params
            search_query = request.query_params.get('search', None)
            
            # Start with base queryset
            inventory_items = InventoryItem.objects.filter(clinic=self.request.user.clinic).exclude(category='Hearing Aid').order_by('product_name')
            
            # Apply search filter if provided
            if search_query:
                inventory_items = inventory_items.filter(
                    product_name__icontains=search_query
                )
            
            # Prepare inventory item data
            parts_data = []
            for item in inventory_items:
                part_data = {
                    'inventory_item_id': item.id,
                    'product_name': item.product_name,
                    'brand': item.brand.name,
                    'model_type': item.model_type.name,
                    'unit_price': float(item.unit_price) if item.unit_price else 0,
                    # 'quantity_in_stock': item.quantity_in_stock or 0,
                    # 'category': item.category if hasattr(item, 'category') else None
                }
                parts_data.append(part_data)
            
            return Response({
                'status': status.HTTP_200_OK,
                'message': f'Found {len(parts_data)} inventory items',
                'data': parts_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': f'Error fetching inventory items: {str(e)}',
                'data': []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




