
from rest_framework.permissions import BasePermission


# If the user is not authenticated, deny access , I wanted the response like { status: 403, error: "Authentication credentials were not provided."}



class IsClinicAdmin(BasePermission):
    """
    Allows access only to users with 'Clinic Admin' role.
    """
    message = {"status": 403, "error": "You do not have permission to perform this action."}

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and getattr(user, "role", None)
            and user.role.name == "Admin"
        )
    

class ReceptionistPermission(BasePermission):
    """
    Allows access only to users with 'Receptionist' role.
    """
    message = {"status": 403, "error": "You do not have permission to perform this action."}

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and getattr(user, "role", None)
            and user.role.name == "Reception"
        )
    

class AuditorPermission(BasePermission):
    """
    Allows access only to users with 'Auditor' role.
    """
    message = {"status": 403, "error": "You do not have permission to perform this action."}

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and getattr(user, "role", None)
            and user.role.name == "Audiologist"
        )
    

class SppechTherapistPermission(BasePermission):
    """
    Allows access only to users with 'Speech Therapist' role.
    """
    message = {"status": 403, "error": "You do not have permission to perform this action."}

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and getattr(user, "role", None)
            and user.role.name == "Speech Therapist"
        )