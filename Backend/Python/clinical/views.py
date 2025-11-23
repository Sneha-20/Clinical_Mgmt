from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from .serializers import PatientRegistrationSerializer          
from .models import Patient

# Create your views here.
class PatientRegistrationView(generics.CreateAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientRegistrationSerializer
    permission_classes = [IsAuthenticated] # Ensure user is logged in

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