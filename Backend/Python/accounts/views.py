# ...existing code...
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import AllowAny
from .models import Clinic
from .serializers import TokenWithClinicSerializer, ClinicSimpleSerializer,RegisterSerializer

def _first_error_message(errors):
    if isinstance(errors, dict):
        for v in errors.values():
            return _first_error_message(v)
    if isinstance(errors, (list, tuple)):
        for v in errors:
            return _first_error_message(v)
    return str(errors)

class TokenObtainWithClinicView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = TokenWithClinicSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            return Response({
                "status": 200,
                "message": "Login successful",
                "data": serializer.validated_data
            }, status=status.HTTP_200_OK)

        err = _first_error_message(serializer.errors)
        return Response({"status": 400, "error": err}, status=status.HTTP_400_BAD_REQUEST)

class ClinicListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ClinicSimpleSerializer
    queryset = Clinic.objects.all()

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        # Registration logic here
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"status": 200, "message": "User registered successfully"}, status=status.HTTP_200_OK)

        err = _first_error_message(serializer.errors)
        return Response({"status": 400, "error": err}, status=status.HTTP_400_BAD_REQUEST)
