from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from .serializers import (PatientRegistrationSerializer ,PatientAllVisitSerializer ,PatientDetailSerializer ,PatientVisitSerializer ,
PatientVisitCreateSerializer,PatientListSerializer,PatientVisitUpdateSerializer,PatientUpdateSerializer)
from .models import Patient,PatientVisit
from clinical_be.utils.pagination import StandardResultsSetPagination
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from clinical_be.utils.permission import IsClinicAdmin, ReceptionistPermission, AuditorPermission, SppechTherapistPermission

# Create your views here.


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
    filterset_fields = ['status','visit_type', 'appointment_date']
    

    def list(self, request, *args, **kwargs):
            self.queryset = self.queryset.filter(clinic=getattr(request.user, 'clinic', None)).order_by('-created_at')
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response({"status": 200, "data": serializer.data})
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
            return self.get_paginated_response({"status": 200, "data": serializer.data})
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


    def get_queryset(self):
        from django.utils import timezone
        today = timezone.now().date()
        return PatientVisit.objects.filter(appointment_date=today, clinic=getattr(self.request.user, 'clinic', None)).order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({"status": 200, "data": serializer.data})
        serializer = self.get_serializer(queryset, many=True)
        return Response({"status": 200, "data": serializer.data}, status=status.HTTP_200_OK)



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
    
# Dashboard Tile records count 
# Total patients , today's visits , pending visits etc can be added here in future




    