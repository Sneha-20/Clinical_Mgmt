# ...existing code...
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from .models import User, Clinic, Role
import re

class ClinicSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Clinic
        fields = ('id', 'name')

class RoleSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ('id', 'name')


class TokenWithClinicSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    clinic_id = serializers.IntegerField(write_only=True)

    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)
    user = serializers.DictField(read_only=True)
    clinic = ClinicSimpleSerializer(read_only=True)
    role = serializers.CharField(read_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        clinic_id = attrs.get('clinic_id')

        # authenticate using Django; fallback to manual check if needed
        user = None
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid credentials")

        if not user.check_password(password):
            raise serializers.ValidationError("Invalid credentials")
        
        if user.is_approved is False:
            raise serializers.ValidationError("User is not approved by admin yet")

        # ensure user is active
        if not user.is_active:
            raise serializers.ValidationError("User account is disabled")

        # check clinic membership
        if not user.clinic or user.clinic.id != clinic_id:
            raise serializers.ValidationError("User does not belong to the selected clinic")

        # build tokens
        refresh = RefreshToken.for_user(user)
        access = str(refresh.access_token)
        refresh = str(refresh)

        role_data = RoleSimpleSerializer(user.role).data if user.role else None

        return {
            'access': access,
            'refresh': refresh,
            'user': {
                'id': user.id,
                'email': user.email,
                'name': getattr(user, 'name', ''),
                'role': role_data,
            },
            'clinic': ClinicSimpleSerializer(user.clinic).data,
        }

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    clinic_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    clinic = ClinicSimpleSerializer(read_only=True)

    class Meta:
        model = User
        fields = ('email', 'password', 'name', 'clinic', 'clinic_id', 'role_id', 'phone',)


    def validate_phone(self, value):
        if not re.fullmatch(r'\d{10}', (value or '').strip()):
            raise serializers.ValidationError("phone must be exactly 10 digits.")
        return value
    

    def create(self, validated_data):
        role_id = validated_data.pop('role_id', None)
        clinic_id = validated_data.pop('clinic_id', None)
        password = validated_data.pop('password')
        user = User(**validated_data)

        if role_id is not None:
            # optional: validate role exists
            if not Role.objects.filter(id=role_id).exists():
                raise serializers.ValidationError({"role_id": "Invalid role_id"})
            user.role_id = role_id

        if clinic_id is not None:
            # optional: validate clinic exists
            if not Clinic.objects.filter(id=clinic_id).exists():
                raise serializers.ValidationError({"clinic_id": "Invalid clinic_id"})
            user.clinic_id = clinic_id

        user.set_password(password)
        user.save()
        return user