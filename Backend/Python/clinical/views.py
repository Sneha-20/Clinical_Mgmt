from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db import models
from .serializers import (
    PatientRegistrationSerializer,
    PatientAllVisitSerializer,
    PatientDetailSerializer,
    PatientVisitSerializer,
    PatientVisitCreateSerializer,
    PatientListSerializer,
    PatientVisitUpdateSerializer,
    PatientUpdateSerializer,
    DoctorListSerializer,
    AudiologistQueueSerializer,
    AudiologistCaseHistoryCreateSerializer,
    BillDetailSerializer,
    BillListSerializer,
    PatientVisitWithCaseHistorySerializer,
    TrialDeviceReturnSerializer,
    TrialCompletionSerializer,
    PatientVisitFullDetailsSerializer,
    TestTypeSerializer
)
from .models import Patient, PatientVisit, AudiologistCaseHistory, Bill, VisitTestPerformed, TestUpload,InventorySerial,Trial,InventoryItem,TestType
from accounts.models import User
from clinical_be.utils.pagination import StandardResultsSetPagination
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from clinical_be.utils.permission import IsClinicAdmin, ReceptionistPermission, AuditorPermission, SppechTherapistPermission
from django.db import transaction
from django.utils import timezone
from django.shortcuts import redirect, get_object_or_404



class PatientRegistrationView(generics.CreateAPIView):
    ''' Register a new Patient along with an initial visit record '''
    queryset = Patient.objects.all()
    serializer_class = PatientRegistrationSerializer
    permission_classes = [IsAuthenticated,ReceptionistPermission] # Ensure user is logged in

    # The 'create' logic is handled inside the serializer, 
    # but we can override perform_create if we needed simple logic. 
    # Here, standard behavior works because we used self.context['request'] in serializer.
    def  create(self, request, *args, **kwargs):
        # Instantiate serializer with context so serializer validations (including email check) run
        serializer = self.get_serializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            # extract first error message
            def _first_error(err):
                print(err)
                if isinstance(err, list) and err:
                    return str(err[0])
                if isinstance(err, dict):
                    for v in err.values():
                        msg = _first_error(v)
                        if msg:
                            return msg
                return str(err)
            first_msg = _first_error(serializer.errors) or "Invalid input."
            return Response({"status": 400, "error": first_msg}, status=status.HTTP_400_BAD_REQUEST)

        # valid -> save and return custom success format
        self.perform_create(serializer)
        return Response({"status": 200, "message": "Patient registered successfully"},
                                status=status.HTTP_200_OK)
    

# Edit Patient Visit Records
class PatientUpdateView(generics.UpdateAPIView):
    ''' Update Patient Details '''
    queryset = Patient.objects.all()
    serializer_class = PatientUpdateSerializer
    permission_classes = [IsAuthenticated,ReceptionistPermission]
    lookup_field = 'id'  # URL will have patient ID as /patient/<id>/

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial, context={'request': request})
        if not serializer.is_valid():
            return Response({"status": 400, "error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        self.perform_update(serializer)
        return Response({"status": 200, "message": "Patient details updated successfully"},
                                status=status.HTTP_200_OK)


class PatientVisitListView(generics.ListAPIView): # Show all Recent Visits
    ''' 
    List all Patient Visits 
    Supports filtering by status, visit_type, appointment_date
    URL parameters example: ?status=pending&visit_type=New
    Supports searching by patient name or phone number
    URL parameters example: ?search=John

    '''
    queryset = PatientVisit.objects.all()
    serializer_class = PatientVisitSerializer
    permission_classes = [IsAuthenticated,ReceptionistPermission]  # Ensure user is logged in
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend,SearchFilter]
    search_fields = ['patient__name','patient__phone_primary']
    filterset_fields = ['status','visit_type', 'appointment_date', 'service_type']
    

    def list(self, request, *args, **kwargs):
            self.queryset = self.queryset.filter(clinic=getattr(request.user, 'clinic', None)).order_by('-created_at')
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                # Pagination class already wraps with status and data
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(queryset, many=True)
            return Response({"status": 200, "data": serializer.data}, status=status.HTTP_200_OK)
    

class PatientDetailView(generics.RetrieveAPIView):  
    ''' Retrieve Patient Details along with latest visit and total visits '''
    queryset = Patient.objects.all()
    serializer_class = PatientDetailSerializer
    permission_classes = [IsAuthenticated,ReceptionistPermission | AuditorPermission]  # Ensure user is logged in
    lookup_field = 'id'  # URL will have patient ID as /patient/<id>/

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({"status": 200, "data": serializer.data}, status=status.HTTP_200_OK)


# GET /patients/<id>/visits
class PatientVisitsView(generics.ListAPIView):
    ''' List all visits for a specific patient '''
    serializer_class = PatientAllVisitSerializer
    permission_classes = [IsAuthenticated, ReceptionistPermission | AuditorPermission]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        patient_id = self.kwargs['id']
        return PatientVisit.objects.filter(patient__id=patient_id).order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            # Pagination class already wraps with status and data
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response({"status": 200, "data": serializer.data}, status=status.HTTP_200_OK)
    


# Add Visit Records 
class PatientVisitCreateView(generics.CreateAPIView):
    ''' Create a new Patient Visit record '''
    queryset = PatientVisit.objects.all()
    serializer_class = PatientVisitCreateSerializer
    permission_classes = [IsAuthenticated,ReceptionistPermission]
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response({"status": 400, "error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)   
        return Response({"status": 200, "message": "Patient visit created successfully"},
                                status=status.HTTP_200_OK)
    
# Edit the visit records 
class PatientVisitUpdateView(generics.UpdateAPIView):  
    ''' Update Patient Visit Details '''     
    queryset = PatientVisit.objects.all()
    serializer_class = PatientVisitUpdateSerializer
    permission_classes = [IsAuthenticated,ReceptionistPermission]
    lookup_field = 'id'  # URL will have visit ID as /patient/visit/<id>/

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial, context={'request': request})
        if not serializer.is_valid():
            return Response({"status": 400, "error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        self.perform_update(serializer)
        return Response({"status": 200, "message": "Patient visit updated successfully"},
                                status=status.HTTP_200_OK)
    


# Today Patient visit records 
class TodayPatientVisitsView(generics.ListAPIView):
    ''' List all Patient Visits for Today '''
    serializer_class = PatientVisitSerializer
    permission_classes = [IsAuthenticated,ReceptionistPermission]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend,SearchFilter]
    search_fields = ['patient__name','patient__phone_primary']
    filterset_fields = ['status','visit_type', 'service_type']


    def get_queryset(self):
        from django.utils import timezone
        today = timezone.now().date()
        return PatientVisit.objects.filter(appointment_date=today, clinic=getattr(self.request.user, 'clinic', None)).order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        # filters 
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response({"status": 200, "data": serializer.data}, status=status.HTTP_200_OK)


# --------------------------------------------------
# FLAT LIST FO DROPDOWNS
# ----------------------------------------------------
# Patient Flat list for dropdowns and search by name
class PatientFlatListView(generics.ListAPIView):
    queryset = Patient.objects.values('id', 'name', 'email', 'phone_primary')
    serializer_class = PatientListSerializer
    permission_classes = [IsAuthenticated]  # Ensure user is logged in
    filter_backends = [DjangoFilterBackend,SearchFilter]
    search_fields = ['name','phone_primary']
    

    def list(self, request, *args, **kwargs):
            self.queryset = self.queryset.filter(clinic=getattr(request.user, 'clinic', None)).order_by('name')
            queryset = self.filter_queryset(self.get_queryset())
            serializer = self.get_serializer(queryset, many=True)
            return Response({"status": 200, "data": serializer.data}, status=status.HTTP_200_OK)
    
# Doctor name and role flat list for dropdowns
class DoctorFlatListView(generics.ListAPIView):
    """
    List all Doctors (Audiologists and Speech Therapists) for dropdowns and search by name.
    If the user has a clinic assigned, only doctors from that clinic are listed.
    """

    serializer_class = DoctorListSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ['name', 'role__name']
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        clinic = getattr(self.request.user, 'clinic', None)
        qs = User.objects.filter(
            role__name__in=['Speech Therapist', 'Audiologist','Audiologist &  Speech Therapist'],
        )
        if clinic:
            qs = qs.filter(clinic=clinic)

        # Optimize role access in DoctorListSerializer.get_designation
        return qs.select_related('clinic', 'role').order_by('name').distinct()

    def list(self, request, *args, **kwargs):
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            return Response({"status": 200, "data": serializer.data}, status=status.HTTP_200_OK)

# Dashboard Tile records count 
# Total patients , today's visits , pending visits etc can be added here in future
class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated, ReceptionistPermission | AuditorPermission]

    def get(self, request, *args, **kwargs):
        from django.utils import timezone
        today = timezone.now().date()
        clinic = getattr(request.user, 'clinic', None)

        role = getattr(request.user.role, 'name', None)
        data = {}

        # If the user.role == 'Reception', show the dashboard
        if role == 'Reception':
            total_patients = Patient.objects.filter(clinic=clinic).count()
            todays_visits = PatientVisit.objects.filter(
                appointment_date=today, clinic=clinic
            ).count()
            pending_tests = PatientVisit.objects.filter(
                status='Pending for Service', clinic=clinic
            ).count()
            followup_visits = PatientVisit.objects.filter(
                status='Follow up', clinic=clinic
            ).count()

            data = {
                "total_patients": total_patients,
                "todays_visits": todays_visits,
                "pending_services": pending_tests,
                "followup_visits": followup_visits
            }
        elif role == 'Audiologist': 
            # For Audiologist, show only relevant stats
            pending_tests = PatientVisit.objects.filter(
                status='Test pending', clinic=clinic, seen_by=request.user
            ).count()
           
            completed_tests = PatientVisit.objects.filter(

                models.Q(patient__case_history__isnull=False) &
                models.Q(visittestperformed__isnull=False),
                seen_by=request.user,
                clinic=request.user.clinic
            ).count()

            trials_active = Trial.objects.filter(
                clinic=clinic, visit__seen_by=request.user,trial_decision='TRIAL_ACTIVE'
            ).count()

            data = {
                "pending_tests": pending_tests,
                "completed_tests": completed_tests,
                "trials_active": trials_active
            }

        else:
            # Should not normally happen because permission already blocks it
            data = {"error": "Access restricted to Receptionists only."}

        return Response({"status": 200, "data": data}, status=status.HTTP_200_OK)
    



# --------------------------------------------------------------------
# AUDIOLOGIST 
# ----------------------------------------------------------------------

# Patient Queue View for Audiologist whose visit type is not either 'TGA / Machine Check' or 'Battery Purchase' or 'Tip / Dome Change'
class AudiologistPatientQueueView(generics.ListAPIView):
    ''' List all Patient Visits for Audiologist Queue '''
    serializer_class = AudiologistQueueSerializer
    permission_classes = [IsAuthenticated, AuditorPermission]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ['patient__name', 'patient__phone_primary']
    filterset_fields = ['service_type','appointment_date']

    def get_queryset(self):
        """
        Return a queryset of PatientVisit records for the audiologist queue after applying filters.
        """
        excluded_types = [
            'Battery Purchase',
            'Tip / Dome Change',
            'Speech Assessment',
            'Speech Therapy Follow-up'
        ]

        queryset = PatientVisit.objects.filter(
            clinic=getattr(self.request.user, 'clinic', None),
            seen_by=self.request.user,
            status='Test pending'
        ).exclude(visit_type__in=excluded_types)

        # Support direct filtering by GET parameters if provided
        appointment_date = self.request.query_params.get('appointment_date', None)
        if appointment_date:
            queryset = queryset.filter(appointment_date=appointment_date)
    
        # The rest of the filtering will be handled by DjangoFilterBackend and search/filter classes

        return queryset.order_by('created_at')
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response({"status": 200, "data": serializer.data}, status=status.HTTP_200_OK)


# Get the details view of patient visit records by visit ID 
class PatientVisitDetailView(generics.RetrieveAPIView):
    ''' Retrieve details of a Patient Visit by Visit ID '''
    queryset = PatientVisit.objects.all()
    serializer_class = PatientVisitWithCaseHistorySerializer
    permission_classes = [IsAuthenticated,AuditorPermission]
    lookup_field = 'id'  # URL will have visit ID as /patient/visit/<id>/

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({"status": 200, "data": serializer.data}, status=status.HTTP_200_OK)


# Get Full Visit Details with Tests and Trials
class PatientVisitFullDetailsView(generics.RetrieveAPIView):
    """
    Retrieve comprehensive details of a Patient Visit by Visit ID including:
    - Patient information
    - Case history
    - Tests performed and uploaded files
    - Trials associated with the visit
    - Bill details
    """
    queryset = PatientVisit.objects.all()
    serializer_class = PatientVisitFullDetailsSerializer
    permission_classes = [IsAuthenticated, AuditorPermission | ReceptionistPermission]
    lookup_field = 'id'  # URL will have visit ID as /patient/visit/<id>/full/

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({"status": 200, "data": serializer.data}, status=status.HTTP_200_OK)

    

# Case History Create View for Audiologist (includes AudiologistCaseHistory, VisitTestPerformed, TestUpload)
class AudiologistCaseHistoryCreateView(generics.CreateAPIView):
    """Create Audiologist Case History, Performed Tests, and Upload Test Reports for a Patient Visit"""
    queryset = AudiologistCaseHistory.objects.all()
    permission_classes = [IsAuthenticated, AuditorPermission]
    serializer_class = AudiologistCaseHistoryCreateSerializer  # This serializer handles all related creation

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response({"status": 400, "error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        return Response(
            {"status": 200, "message": "Audiologist case history, test performed, and reports saved successfully"},
            status=status.HTTP_200_OK,
        )




# ============================================================================
# BILL VIEWS
# ============================================================================

class BillPaidListView(generics.ListAPIView):
    """
    List all bills with patient info and payment status for the logged-in clinic.
    Supports search by patient name/phone and bill number, and filtering by payment_status.
    """
    serializer_class = BillListSerializer
    permission_classes = [IsAuthenticated, ReceptionistPermission]
    pagination_class = StandardResultsSetPagination
    # Use SearchFilter only; handle payment_status filtering manually to avoid ChoiceField setup issues
    filter_backends = [SearchFilter]
    search_fields = ['visit__patient__name', 'visit__patient__phone_primary', 'bill_number']

    def get_queryset(self):
        clinic = getattr(self.request.user, 'clinic', None)
        qs = Bill.objects.select_related('visit', 'visit__patient', 'clinic').filter(payment_status='Paid').order_by('-created_at')
        if clinic:
            qs = qs.filter(clinic=clinic)
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        # Optional filter by payment_status (?payment_status=Paid/Pending/Partially%20Paid)
        payment_status = request.query_params.get('payment_status')
        if payment_status:
            queryset = queryset.filter(payment_status=payment_status)

        # Apply search filter afterwards (name/phone/bill_number)
        queryset = self.filter_queryset(queryset)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response({"status": 200, "data": serializer.data}, status=status.HTTP_200_OK)

class BillPendingListView(generics.ListAPIView):
    """
    List all bills with patient info and payment status for the logged-in clinic.
    Supports search by patient name/phone and bill number, and filtering by payment_status.
    """
    serializer_class = BillListSerializer
    permission_classes = [IsAuthenticated, ReceptionistPermission]
    pagination_class = StandardResultsSetPagination
    # Use SearchFilter only; handle payment_status filtering manually to avoid ChoiceField setup issues
    filter_backends = [SearchFilter]
    search_fields = ['visit__patient__name', 'visit__patient__phone_primary', 'bill_number']

    def get_queryset(self):
        clinic = getattr(self.request.user, 'clinic', None)
        qs = Bill.objects.select_related('visit', 'visit__patient', 'clinic').filter(payment_status='Pending').order_by('-created_at')
        if clinic:
            qs = qs.filter(clinic=clinic)
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        # Optional filter by payment_status (?payment_status=Paid/Pending/Partially%20Paid)
        payment_status = request.query_params.get('payment_status')
        if payment_status:
            queryset = queryset.filter(payment_status=payment_status)

        # Apply search filter afterwards (name/phone/bill_number)
        queryset = self.filter_queryset(queryset)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response({"status": 200, "data": serializer.data}, status=status.HTTP_200_OK)


class BillDetailView(generics.RetrieveAPIView):
    """
    Retrieve bill details for a specific visit.
    
    GET /api/clinical/bill/visit/<visit_id>/
    
    Returns complete bill information including:
    - Bill details (number, dates, totals)
    - Patient information
    - Visit information
    - All bill items (tests and trials)
    - Financial summary
    """
    serializer_class = BillDetailSerializer
    permission_classes = [IsAuthenticated, ReceptionistPermission]
    lookup_field = 'visit_id'
    lookup_url_kwarg = 'visit_id'

    def get_queryset(self):
        """Filter bills by clinic"""
        clinic = getattr(self.request.user, 'clinic', None)
        if clinic:
            return Bill.objects.filter(clinic=clinic).select_related(
                'visit',
                'visit__patient',
                'clinic',
                'created_by'
            ).prefetch_related(
                'bill_items__test_type',
                'bill_items__trial'
            )
        return Bill.objects.select_related(
            'visit',
            'visit__patient',
            'clinic',
            'created_by'
        ).prefetch_related(
            'bill_items__test_type',
            'bill_items__trial'
        )

    def get_object(self):
        """Get bill by visit_id, create if doesn't exist"""
        visit_id = self.kwargs.get(self.lookup_url_kwarg)
        try:
            visit = PatientVisit.objects.get(id=visit_id)
        except PatientVisit.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound("Visit not found")

        # Get or create bill for this visit
        bill = Bill.objects.get(
            visit=visit
            # defaults={
            #     'clinic': visit.clinic,
            #     'created_by': self.request.user,
            # }
        )

        # Ensure bill number is generated
        if not bill.bill_number:
            bill.generate_bill_number()
            bill.save()

        # Recalculate totals to ensure they're up to date
        bill.calculate_total()

        return bill

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({"status": 200, "data": serializer.data}, status=status.HTTP_200_OK)



# Trial Device Return View
class TrialDeviceReturnView(APIView):
    """API endpoint to return a trial device and make it available for another patient."""
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        serializer = TrialDeviceReturnSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"status": "error", "message": "Invalid data", "errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serial_number = serializer.validated_data['serial_number']
        device_condition_on_return = serializer.validated_data.get('device_condition_on_return', '')
        # condition = serializer.validated_data.get('condition', 'Good')
        
        try:
            # Get the serial number record
            serial = InventorySerial.objects.get(
                serial_number=serial_number,
                status='Use in Trial'  # Only allow returning devices that are in trial
            )
            
            # # Get the active trial for this serial
            trial = Trial.objects.filter(
                serial_number=serial_number,
                # trial_end_date__isnull=True  # Only if trial end date is not set
            ).first()
            
           
                # Update trial end date
            trial.trial_end_date = timezone.now().date()
            trial.device_condition_on_return = device_condition_on_return
            # trial.device_condition_on_return = condition
            trial.save()
            
            # Update serial status back to 'In Stock' to make it available again
            serial.status = 'In Stock'
            serial.save()
            
            # Update the inventory item's quantity
            # if serial.inventory_item:
            #     serial.inventory_item.quantity_in_stock += 1
            #     serial.inventory_item.save()
            
            return Response({
                    "status": "success",
                    "message": "Device returned successfully",
                    # "data": {
                    #     "serial_number": serial.serial_number,
                    #     "status": serial.status,
                    #     "return_date": timezone.now().date()
                    # }
                })
                
        except InventorySerial.DoesNotExist:
            return Response(
                {"status": "error", "message": "Device not found or not in trial"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"status": "error", "message": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# List of test result (TestUpload) for a visit ID 
class TestResultListView(APIView):
    """List all test results (TestUpload) for a specific visit"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, visit_id):
        try:
            # Validate that the visit exists
            if not PatientVisit.objects.filter(id=visit_id).exists():
                return Response({
                    'status': status.HTTP_404_NOT_FOUND,
                    'message': 'Visit not found',
                    'data': []
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Get test performed for this visit
            test_performed = VisitTestPerformed.objects.filter(visit_id=visit_id).first()
            
            if not test_performed:
                return Response({
                    'status': status.HTTP_404_NOT_FOUND,
                    'message': 'No test performed found for this visit',
                    'data': []
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Get all test uploads for this test performed
            test_results = TestUpload.objects.filter(visit=test_performed).order_by('-created_at')
            
            # Serialize the results
            result_data = []
            for test_file in test_results:
                result_data.append({
                    'id': test_file.id,
                    'report_type': test_file.report_type,
                    'report_description': test_file.report_description,
                    'file_url': test_file.file_path,  # For frontend convenience
                    'created_at': test_file.created_at,
                    # 'uploaded_by': test_file.uploaded_by.username if test_file.uploaded_by else None
                })
            
            return Response({
                'status': status.HTTP_200_OK,
                # 'message': 'Test results retrieved successfully',
                # 'visit_id': visit_id,
                'total_files': len(result_data),
                'data': result_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': f'Error retrieving test results: {str(e)}',
                'data': []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 


class VisitTestTypesView(APIView):
    """
    Get list of test names performed for a specific visit ID.
    Returns names of tests where the boolean flag is True.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, visit_id):
        try:
            test_performed = VisitTestPerformed.objects.get(visit_id=visit_id)
            
            test_mapping = [
                (test_performed.pta, "PTA"),
                (test_performed.speech_assessment, "Speech Assessment"),
                (test_performed.bera_assr, "BERA/ASSR"),
                (test_performed.impedance, "Impedance"),
                (test_performed.impedance_etf, "Impedance/ETF"),
                (test_performed.pta_sds, "PTA/SDS"),
                (test_performed.srt_sds, "SRT/SDS"),
                (test_performed.bera, "BERA"),
                (test_performed.assr, "ASSR"),
                (test_performed.special_tests, "Special Tests"),
               
            ]
            
            test_types = [name for flag, name in test_mapping if flag]
            
            # if test_performed.other_test:
            #     test_types.append(test_performed.other_test)
                
            return Response({"status": 200, "data": test_types}, status=status.HTTP_200_OK)
            
        except VisitTestPerformed.DoesNotExist:
             return Response({"status": 200, "data": []}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"status": 500, "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Delete the Testupload file
class TestUploadDeleteView(APIView):
    """Delete a specific test upload file"""
    permission_classes = [IsAuthenticated, AuditorPermission]
    
    def delete(self, request, file_id):
        try:
            # Get the test upload file
            test_file = TestUpload.objects.get(id=file_id)
            
            # Delete the file from S3
            if test_file.file_path:
                try:
                    import boto3
                    from django.conf import settings
                    from urllib.parse import urlparse
                    
                    # Parse the S3 URL to get bucket and key
                    parsed_url = urlparse(test_file.file_path)
                    bucket_name = parsed_url.netloc.split('.')[0]
                    file_key = parsed_url.path.lstrip('/')
                    
                    # Initialize S3 client
                    s3_client = boto3.client(
                        's3',
                        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                        region_name=settings.AWS_S3_REGION_NAME
                    )
                    
                    # Delete the file from S3
                    s3_client.delete_object(Bucket=bucket_name, Key=file_key)
                    
                except Exception as e:
                    # Log the error but continue with database deletion
                    print(f"Warning: Could not delete file from S3 {test_file.file_path}: {e}")
            
            # Delete the database record
            test_file.delete()
            
            return Response({
                'status': status.HTTP_200_OK,
                'message': 'Test upload file deleted successfully'
            }, status=status.HTTP_200_OK)
            
        except TestUpload.DoesNotExist:
            return Response({
                'status': status.HTTP_404_NOT_FOUND,
                'message': 'Test upload file not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        except Exception as e:
            return Response({
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': f'Error deleting test upload file: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 

class MarkAsPaidView(APIView):
    """
    Mark a bill as paid with payment details.
    
    POST /api/clinical/mark-bill-paid/<bill_id>/
    
    Payload:
    {
        "payment_method": "UPI",
        "transaction_id": "TXN123456"
    }
    """
    permission_classes = [IsAuthenticated, ReceptionistPermission]
    
    def post(self, request, bill_id):
        # Get bill for the current clinic
        clinic = getattr(request.user, 'clinic', None)
        bill = get_object_or_404(Bill, id=bill_id, clinic=clinic)
        
        # Validate bill is not already paid
        if bill.payment_status == 'Paid':
            return Response({
                'status': status.HTTP_400_BAD_REQUEST,
                'message': 'Bill is already marked as paid'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        payment_method = request.data.get('payment_method')
        transaction_id = request.data.get('transaction_id', '')
        payment_status = request.data.get('payment_status', 'Paid')
        notes = request.data.get('notes', '')

        # Validate payment method
        valid_methods = [choice[0] for choice in Bill.PAYMENT_METHODS]
        if payment_method not in valid_methods:
            return Response({
                'status': status.HTTP_400_BAD_REQUEST,
                'error': f'Invalid payment method. Valid methods: {", ".join(valid_methods)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate required fields for UPI payments
        if payment_method == 'UPI' and not transaction_id:
            return Response({
                'status': status.HTTP_400_BAD_REQUEST,
                'error': 'Transaction ID is required for UPI payments'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update bill payment details
        bill.payment_method = payment_method
        bill.transaction_id = transaction_id
        bill.payment_status = payment_status
        bill.paid_at = timezone.now()
        bill.notes = notes
        bill.save()
        
        # Update the visit status to 'Completed'
        visit = bill.visit
        visit.status = 'Completed with payment'
        visit.save()
        
        return Response({
            'status': status.HTTP_200_OK,
            'message': 'Bill marked as paid successfully'
        }, status=status.HTTP_200_OK)



# API For Inventory item whose category is Hearing aids and use_in_trial is False 
class DeviceBookingDropdownView(generics.ListAPIView):
    """
    API to get dropdown values for device booking.
    Returns inventory items (Hearing aids, use_in_trial=False) and their available serials.
    Supports search by brand and product_name.
    """
    
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ['product_name', 'brand']

    def get_queryset(self):
        """
        Get inventory items for booking (Hearing aids, not for trial)
        Apply search filter if provided
        """
        queryset = InventoryItem.objects.filter(
            category='Hearing Aid',
            use_in_trial=False, 
            clinic=getattr(self.request.user, 'clinic', None)  # Filter by clinic for multi-tenant support
            
        )
        
        # Apply search filter from query parameters
        search_term = self.request.query_params.get('search', None)
        if search_term:
            queryset = queryset.filter(
                models.Q(product_name__icontains=search_term) |
                models.Q(brand__icontains=search_term) 
            )
        
        return queryset.order_by('product_name')
    
    def get(self, request, *args, **kwargs):
        try:
            # Get inventory items for booking (Hearing aids, not for trial)
            queryset = self.get_queryset()
            
            # Prepare dropdown data
            dropdown_data = []
            for item in queryset:
                item_data = {
                    'id': item.id,
                    'product_name': item.product_name,
                    'brand': item.brand.name if item.brand else '',
                    'model_type': item.model_type.name if item.model_type else '',
                    'stock_type': item.stock_type,
                    'quantity_in_stock': item.quantity_in_stock,
                    'unit_price': float(item.unit_price) if item.unit_price else 0,
                }

                dropdown_data.append(item_data)
            
            return Response({
                'status': status.HTTP_200_OK,
                'data': dropdown_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': f'Error fetching device booking options: {str(e)}',
                'data': []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Get serial number of inventory item by inventory item id which are in stock 
class DeviceBookingSerialView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ['serial_number']
    
    def get_queryset(self):
        inventory_item_id = self.kwargs['inventory_item_id']
        return InventorySerial.objects.filter(inventory_item_id=inventory_item_id, status='In Stock')
    
    def get(self, request, *args, **kwargs):
        try:
            # Get serial numbers for the specific inventory item
            queryset = self.filter_queryset(self.get_queryset())
            
            # Extract only serial numbers
            serial_numbers = [serial.serial_number for serial in queryset]
            
            return Response({
                'status': status.HTTP_200_OK,
                'data': serial_numbers
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': f'Error fetching serial numbers: {str(e)}',
                'data': []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# Get the patient visit for status followup required
class PatientVisitFollowupView(generics.ListAPIView):
    """
    API to get patient visits that require follow-up.
    Returns visits with status 'Follow up' or 'Book Follow-up Required'.
    Supports search by patient name and pagination.
    """
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ['patient__name']
    filterset_fields = ['contacted']
    
    def get_queryset(self):
        """
        Get patient visits that need follow-up
        Filter by clinic for multi-tenant support
        """
        clinic = getattr(self.request.user, 'clinic', None)
        queryset = PatientVisit.objects.filter(
            status__in=['Follow up']
        )
        
        if clinic:
            queryset = queryset.filter(clinic=clinic)
            
        return queryset.order_by('-appointment_date', '-created_at')
    
    def list(self, request, *args, **kwargs):
        """
        Override list method to provide custom response format
        """
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            # Pass show_contacted_fields=True to include contact fields
            serializer = PatientVisitSerializer(page, many=True, show_contacted_fields=True)
            return self.get_paginated_response(serializer.data)
        
        # Pass show_contacted_fields=True to include contact fields
        serializer = PatientVisitSerializer(queryset, many=True, show_contacted_fields=True)
        return Response({
            "status": 200,
            "data": serializer.data
        }, status=status.HTTP_200_OK)


# Mark patient as contacted for follow-up
class MarkPatientContactedView(APIView):
    """
    API to mark a patient as contacted for follow-up.
    
    POST /api/clinical/patient-visits/<visit_id>/mark-contacted/
    
    Payload:
    {
        "contacted": true,
        "contact_note": "Patient confirmed appointment for tomorrow"
    }
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, visit_id):
        try:
            # Get the visit
            visit = get_object_or_404(PatientVisit, id=visit_id)
            
            # Check if user has access to this visit (clinic-based)
            clinic = getattr(request.user, 'clinic', None)
            if clinic and visit.clinic != clinic:
                return Response({
                    'status': status.HTTP_403_FORBIDDEN,
                    'message': 'You do not have permission to access this visit'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Get contact data from request
            contacted = request.data.get('contacted', True)
            contact_note = request.data.get('contact_note', '')
            
            # Update visit with contact information
            visit.contacted = contacted
            visit.contacted_by = request.user if contacted else None
            visit.contacted_at = timezone.now() if contacted else None
            
            # Update status note if contact note provided
            if contact_note:
                if visit.status_note:
                    visit.status_note = f"{contact_note}"
                else:
                    visit.status_note = contact_note
            
            visit.save(update_fields=['contacted', 'contacted_by', 'status_note','contacted_at'])
            
            return Response({
                'status': status.HTTP_200_OK,
                'message': 'Patient contact status updated successfully'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': f'Error updating contact status: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class TestTypeUpdateListView(generics.ListAPIView):
    """
    API to get list of available test types for dropdowns (GET) and update in bulk (PATCH).
    Returns all test types defined in the system.
    PATCH expects a list of test types with id and name.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = TestTypeSerializer
    queryset = TestType.objects.all().order_by('-id')  # Assuming newer test types are more relevant for dropdowns

    def get(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            data = self.get_serializer(queryset, many=True).data
            return Response({
                'status': status.HTTP_200_OK,
                'data': data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': f'Error fetching test types: {str(e)}',
                'data': []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def patch(self, request, *args, **kwargs):
        """
        Update a single TestType by id using serializer validation. Expects: {"id": 1, ...fields...}
        You can update any field of TestType.
        """
        try:
            data = request.data
            test_type_id = data.get('id')
            if not test_type_id:
                return Response({
                    'status': status.HTTP_400_BAD_REQUEST,
                    'message': 'TestType id is required.'
                }, status=status.HTTP_400_BAD_REQUEST)

            try:
                test_type = TestType.objects.get(id=test_type_id)
            except TestType.DoesNotExist:
                return Response({
                    'status': status.HTTP_404_NOT_FOUND,
                    'message': 'TestType not found.'
                }, status=status.HTTP_404_NOT_FOUND)

            serializer = TestTypeSerializer(test_type, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'status': status.HTTP_200_OK,
                    'message': 'TestType updated successfully.',
                    # 'data': serializer.data
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'status': status.HTTP_400_BAD_REQUEST,
                    'message': 'Validation error.',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': f'Error updating test type: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)