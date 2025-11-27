# ...existing code...
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from .models import Clinic , Role, User
from .serializers import TokenWithClinicSerializer, ClinicSimpleSerializer,RegisterSerializer,RoleSimpleSerializer
from django.shortcuts import get_object_or_404

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
    permission_classes = [IsAuthenticated]

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
    

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        role_data = RoleSimpleSerializer(user.role).data if user.role else None
        clinic_data = ClinicSimpleSerializer(user.clinic).data if user.clinic else None

        user_data = {
            'id': user.id,
            'email': user.email,
            'name': getattr(user, 'name', ''),
            'phone': getattr(user, 'phone', ''),
            'role': role_data,
            'clinic': clinic_data,
        }

        return Response({"status": 200, "data": user_data}, status=status.HTTP_200_OK)
    


class ApproveUserView(APIView):
    permission_classes = [IsAuthenticated]  # restrict to admin users in code below

    def post(self, request, user_id):
        # you can check role or is_staff/is_superuser
        if not (request.user.is_superuser or request.user.is_staff or request.user.role.name == 'admin'):
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        user = get_object_or_404(User, pk=user_id)
        user.is_approved = True
        user.is_active = True  # allow login
        user.save()
        return Response({"status":status.HTTP_200_OK, 'message':'Approved' }, status=status.HTTP_200_OK)

class RejectUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        if not (request.user.is_superuser or request.user.is_staff):
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        user = get_object_or_404(User, pk=user_id)
        # either delete or mark as inactive/rejected
        user.is_approved = False
        user.is_active = False
        user.save()
        return Response({"status":status.HTTP_200_OK, "message":"Rejected" }, status=status.HTTP_200_OK)