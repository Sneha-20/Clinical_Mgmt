
from rest_framework.permissions import BasePermission


# If the user is not authenticated, deny access , I wanted the response like { status: 403, error: "Authentication credentials were not provided."}



class IsClinicAdmin(BasePermission):
    """
    Allows access only to users with 'Clinic Admin' role.
    """
    message = {"status": 403, "error": "You do not have permission to perform this action."}

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.roles.filter(name='Admin').exists())
    

class ReceptionistPermission(BasePermission):
    """
    Allows access only to users with 'Receptionist' role.
    """
    message = {"status": 403, "error": "You do not have permission to perform this action."}

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.roles.filter(name='Reception').exists())
    

class AuditorPermission(BasePermission):
    """
    Allows access only to users with 'Auditor' role.
    """
    message = {"status": 403, "error": "You do not have permission to perform this action."}

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.roles.filter(name='Audiologist').exists())
    

class SppechTherapistPermission(BasePermission):
    """
    Allows access only to users with 'Speech Therapist' role.
    """
    message = {"status": 403, "error": "You do not have permission to perform this action."}

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.roles.filter(name='Speech Therapist').exists())