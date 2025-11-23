# ...existing code...
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated as isAuthenticated
from .models import Clinic , Role
from .serializers import TokenWithClinicSerializer, ClinicSimpleSerializer,RegisterSerializer,RoleSimpleSerializer

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
    queryset = Clinic.objects.values('id', 'name')

class RoleListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = RoleSimpleSerializer
    queryset = Role.objects.values('id', 'name')

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
        


class ChangePasswordView(APIView):
    permission_classes = [isAuthenticated]

    def post(self, request, *args, **kwargs):
        # Change password logic here
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        if new_password != confirm_password:
            return Response({"status": 400, "error": "New password and confirm password do not match"}, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(old_password):
            return Response({"status": 400, "error": "Old password is incorrect"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"status": 200, "message": "Password changed successfully"}, status=status.HTTP_200_OK)