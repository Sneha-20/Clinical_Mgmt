from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
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
)
from .models import Patient, PatientVisit, AudiologistCaseHistory, Bill
from accounts.models import User
from clinical_be.utils.pagination import StandardResultsSetPagination
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from clinical_be.utils.permission import IsClinicAdmin, ReceptionistPermission, AuditorPermission, SppechTherapistPermission

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
    permission_classes = [IsAuthenticated,ReceptionistPermission]  # Ensure user is logged in
    lookup_field = 'id'  # URL will have patient ID as /patient/<id>/

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({"status": 200, "data": serializer.data}, status=status.HTTP_200_OK)


# GET /patients/<id>/visits
class PatientVisitsView(generics.ListAPIView):
    ''' List all visits for a specific patient '''
    serializer_class = PatientAllVisitSerializer
    permission_classes = [IsAuthenticated,ReceptionistPermission]
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
        queryset = self.get_queryset()
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
    permission_classes = [IsAuthenticated, ReceptionistPermission]

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
                status='Test pending', clinic=clinic
            ).count()
            followup_visits = PatientVisit.objects.filter(
                visit_type='Follow-up', clinic=clinic
            ).count()

            data = {
                "total_patients": total_patients,
                "todays_visits": todays_visits,
                "pending_visits": pending_tests,
                "followup_visits": followup_visits
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
    permission_classes = [IsAuthenticated,AuditorPermission]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        excluded_types = ['Battery Purchase', 'Tip / Dome Change','Speech Assessment','Speech Therapy Follow-up']
        from django.utils import timezone
        today = timezone.now().date()
        return PatientVisit.objects.filter(
            clinic=getattr(self.request.user, 'clinic', None),seen_by=self.request.user,status='Test pending',appointment_date=today
        ).exclude(visit_type__in=excluded_types).order_by('created_at')
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
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
    serializer_class = AudiologistQueueSerializer
    permission_classes = [IsAuthenticated,AuditorPermission]
    lookup_field = 'id'  # URL will have visit ID as /patient/visit/<id>/

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


# List audiologist case history records for a specific visit ID
# class AudiologistCaseHistoryView(generics.ListAPIView):
#     """
#     List all AudiologistCaseHistory records for a given visit ID.

#     GET /api/clinical/casehistory/visit/<visit_id>/

#     Returns:
#     - All case history records associated with the specified visit.
#     """
#     serializer_class = Audiolog
#     permission_classes = [IsAuthenticated, AuditorPermission]

#     def get_queryset(self):
#         visit_id = self.kwargs.get('visit_id')
#         return AudiologistCaseHistory.objects.filter(visit__id=visit_id)

    

# ============================================================================
# BILL VIEWS
# ============================================================================

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
        bill, created = Bill.objects.get_or_create(
            visit=visit,
            defaults={
                'clinic': visit.clinic,
                'created_by': self.request.user,
            }
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



    