from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count
from accounts.models import User
from .models import PatientVisit, Trial

class AdminTrialPerformanceAPIView(APIView):
    """
    Get API for admin to view count of tests and trials performed by each audiologist (staff).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Filter only staff/audiologists (customize as needed)

        role = request.GET.get('role')
        if role:
            staff_qs = User.objects.filter(is_active=True, is_approved=True, role__name__in=[role]).order_by('name')
        else:
            staff_qs = User.objects.filter(is_active=True, is_approved=True, role__name__in=["Audiologist", "Reception"]).order_by('name')
        results = []
        for staff in staff_qs:
            role = getattr(staff.role, 'name', '').lower()
            staff_result = {
                "staff_id": staff.id,
                "staff_name": staff.name,
                "role": staff.role.name if staff.role else None
            }
            if role == 'audiologist':
                test_count = PatientVisit.objects.filter(seen_by=staff).count()
                trial_count = Trial.objects.filter(visit__seen_by=staff).count()
                patient_seen = PatientVisit.objects.filter(seen_by=staff).values('patient_id').distinct().count()
                # Follow-up completion %: completed followups / total followups assigned
                total_followups = PatientVisit.objects.filter(seen_by=staff, status='Follow-up').count()
                completed_followups = PatientVisit.objects.filter(seen_by=staff, status='Follow-up', contacted=True).count()
                followup_completion = (completed_followups / total_followups * 100) if total_followups > 0 else 0
                trials_booked = Trial.objects.filter(visit__seen_by=staff, trial_decision='BOOK').count()
                trial_booking_ratio = (trials_booked / trial_count * 100) if trial_count > 0 else 0
                staff_result.update({
                    "test_count": test_count,
                    "trial_count": trial_count,
                    "patient_seen": patient_seen,
                    "trial_booking_ratio": round(trial_booking_ratio, 2),
                    # "followup_completion_percent": round(followup_completion, 2)
                })
            elif role == 'reception':
                # Pending Service: service visits assigned and not completed
                from .models import ServiceVisit
                pending_service = ServiceVisit.objects.filter(created_by=staff).count()
                # Calls made for followup: PatientVisit where contacted_by = staff
                calls_made = PatientVisit.objects.filter(contacted_by=staff, contacted=True).count()
                staff_result.update({
                    "pending_service": pending_service,
                    "calls_made_for_followup": calls_made
                })
            results.append(staff_result)

        return Response({"status": 200, "data": results})
