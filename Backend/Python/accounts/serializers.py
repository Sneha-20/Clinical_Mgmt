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


# ...existing code...
class TokenWithClinicSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    clinic_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)
    user = serializers.DictField(read_only=True)
    clinic = ClinicSimpleSerializer(read_only=True)
    roles = RoleSimpleSerializer(many=True, read_only=True)

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
        is_admin = bool(user.roles and user.roles.filter(name='Admin').exists())

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

        roles_qs = user.roles.all()
        roles_data = RoleSimpleSerializer(roles_qs, many=True).data if roles_qs.exists() else None
        clinic_data = ClinicSimpleSerializer(user.clinic).data if getattr(user, 'clinic', None) else None
        
        return {
            'access': access,
            'refresh': refresh,
            'user': {
                'id': user.id,
                'email': user.email,
                'name': getattr(user, 'name', ''),
                'roles': roles_data,
            },
            'clinic': clinic_data,
        }
# ...existing code...
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    roles = serializers.ListField(write_only=True, required=False, allow_null=True)
    clinic_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    clinic = ClinicSimpleSerializer(read_only=True)

    class Meta:
        model = User
        fields = ('email', 'password', 'name', 'clinic', 'clinic_id', 'roles', 'phone',)

    def validate_roles(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("roles must be a list")
        for role_id in value:
            if not Role.objects.filter(id=role_id).exists():
                raise serializers.ValidationError(f"Invalid role_id: {role_id}")
        return value


    def validate_phone(self, value):
        if not re.fullmatch(r'\d{10}', (value or '').strip()):
            raise serializers.ValidationError("phone must be exactly 10 digits.")
        return value
    

    def create(self, validated_data):
        roles = validated_data.pop('roles', None)
        clinic_id = validated_data.pop('clinic_id', None)
        password = validated_data.pop('password')
        user = User(**validated_data)
        if clinic_id is not None:
            # optional: validate clinic exists
            if not Clinic.objects.filter(id=clinic_id).exists():
                raise serializers.ValidationError({"clinic_id": "Invalid clinic_id"})
            user.clinic_id = clinic_id
        user.set_password(password)
        user.save()
        if roles:
            role_qs = Role.objects.filter(id__in=roles)
            user.roles.add(*role_qs)
        return user