
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
    clinic_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)
    user = serializers.DictField(read_only=True)
    clinic = ClinicSimpleSerializer(read_only=True)
    role = RoleSimpleSerializer(read_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        clinic_id = attrs.get('clinic_id')

        # authenticate using Django; fallback to manual check if needed
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid credentials")

        if not user.check_password(password):
            raise serializers.ValidationError("Invalid credentials")
        
        if user.is_approved is False:
            raise serializers.ValidationError("User is not approved by admin yet")

        if not user.is_active:
            raise serializers.ValidationError("User account is disabled")
        
        # Admin users do not need to supply clinic_id / clinic membership check
        is_admin = bool(getattr(user, "role", None) and user.role.name == "Admin")

        if not is_admin:
            # For non-admins clinic_id is required and must match user's clinic
            if clinic_id is None:
                raise serializers.ValidationError({"clinic_id": "clinic_id is required for non-admin users"})
            if not user.clinic or user.clinic.id != clinic_id:
                raise serializers.ValidationError("User does not belong to the selected clinic")

        # build tokens
        refresh = RefreshToken.for_user(user)
        access = str(refresh.access_token)
        refresh = str(refresh)

        roles_data = RoleSimpleSerializer(user.role).data if getattr(user, "role", None) else None
        clinic_data = ClinicSimpleSerializer(user.clinic).data if getattr(user, 'clinic', None) else None
        
        return {
            'access': access,
            'refresh': refresh,
            'user': {
                'id': user.id,
                'email': user.email,
                'name': getattr(user, 'name', ''),
                'role': roles_data,
            },
            'clinic': clinic_data,
        }

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    clinic_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    clinic = ClinicSimpleSerializer(read_only=True)

    class Meta:
        model = User
        fields = ('email', 'password', 'name', 'clinic', 'clinic_id', 'role_id', 'phone',)

    def validate_role_id(self, value):
        if value is None:
            return value
        if not Role.objects.filter(id=value).exists():
            raise serializers.ValidationError(f"Invalid role_id: {value}")
        return value


    def validate_phone(self, value):
        if not re.fullmatch(r'\d{10}', (value or '').strip()):
            raise serializers.ValidationError("phone must be exactly 10 digits.")
        return value
    

    def create(self, validated_data):
        role_id = validated_data.pop('role_id', None)
        clinic_id = validated_data.pop('clinic_id', None)
        password = validated_data.pop('password')
        user = User(**validated_data)
        if clinic_id is not None:
            # optional: validate clinic exists
            if not Clinic.objects.filter(id=clinic_id).exists():
                raise serializers.ValidationError({"clinic_id": "Invalid clinic_id"})
            user.clinic_id = clinic_id
        if role_id is not None:
            user.role_id = role_id

        user.set_password(password)
        user.save()

        return user


class UserSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='role.name', read_only=True)
    clinic_name = serializers.CharField(source='clinic.name', read_only=True)
    class Meta:
        model = User
        fields = ('id', 'email', 'name', 'role_name', 'clinic_name', 'phone', 'is_active', 'is_approved')
