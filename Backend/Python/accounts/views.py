# ...existing code...
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import AllowAny
from .models import Clinic
from .serializers import TokenWithClinicSerializer, ClinicSimpleSerializer,RegisterSerializer

class TokenObtainWithClinicView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = TokenWithClinicSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)

class ClinicListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ClinicSimpleSerializer
    queryset = Clinic.objects.all()

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        # Registration logic here
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()

        return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
    