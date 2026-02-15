from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count
from accounts.models import User
from .models import PatientVisit, Trial
from .serializers import PatientVisitSerializer, TrialListSerializer, ServiceVisitListSerializer

class AdminStaffPerformanceAPIView(APIView):
    """
    Get API for admin to view count of tests and trials performed by each audiologist (staff). by staff id 
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Filter only staff/audiologists (customize as needed)

        staff_id = request.query_params.get('staff_id')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if staff_id:
            try:
                staff = User.objects.get(id=staff_id, is_active=True, is_approved=True)
            except User.DoesNotExist:
                return Response({"status": 404, "error": "Staff not found"}, status=404)
        else:
            return Response({"status": 400, "error": "staff_id query parameter is required"}, status=400)
        
        results = []
        if staff:
            role = getattr(staff.role, 'name', '').lower()
            staff_result = {
                "staff_id": staff.id,
                "staff_name": staff.name,
                "role": staff.role.name if staff.role else None
            }
            if role == 'audiologist':
                # wanted to show the count  and details of tests and trials performed by each audiologist
                test_qs = PatientVisit.objects.filter(seen_by=staff, bill__payment_status='Paid', visit_type='New Test')
                if start_date:
                    test_qs = test_qs.filter(created_at__date__gte=start_date)
                if end_date:
                    test_qs = test_qs.filter(created_at__date__lte=end_date)
                test_qs = test_qs.prefetch_related('bill').order_by('-created_at')
                test_count = test_qs.count()
                test_details = PatientVisitSerializer(test_qs, many=True).data
                for i, visit in enumerate(test_qs):
                    try:
                        test_details[i]['cost'] = visit.bill.final_amount
                    except:
                        test_details[i]['cost'] = 0

                trial_qs = Trial.objects.filter(visit__seen_by=staff, visit__bill__payment_status='Paid')
                if start_date:
                    trial_qs = trial_qs.filter(created_at__date__gte=start_date)
                if end_date:
                    trial_qs = trial_qs.filter(created_at__date__lte=end_date)
                trial_qs = trial_qs.order_by('-created_at')
                trial_count = trial_qs.count()
                trial_details = TrialListSerializer(trial_qs, many=True).data
                for i, trial in enumerate(trial_qs):
                    trial_details[i]['cost'] = trial.cost

                patient_seen_qs = PatientVisit.objects.filter(seen_by=staff, bill__payment_status='Paid')
                if start_date:
                    patient_seen_qs = patient_seen_qs.filter(created_at__date__gte=start_date)
                if end_date:
                    patient_seen_qs = patient_seen_qs.filter(created_at__date__lte=end_date)
                patient_seen_qs = patient_seen_qs.values('patient__id', 'patient__name', 'patient__phone_primary').distinct()
                patient_seen = patient_seen_qs.count()

                # Follow-up completion %: completed followups / total followups assigned
                # total_followups = PatientVisit.objects.filter(seen_by=staff, status='Follow-up').count()
                # completed_followups = PatientVisit.objects.filter(seen_by=staff, status='Follow-up', contacted=True).count()
                # followup_completion = (completed_followups / total_followups * 100) if total_followups > 0 else 0
                
                booked_trials_qs = trial_qs.filter(trial_decision='BOOK')
                trials_booked = booked_trials_qs.count()
                booked_trials_details = TrialListSerializer(booked_trials_qs, many=True).data
                for i, trial in enumerate(booked_trials_qs):
                    booked_trials_details[i]['cost'] = trial.cost

                trial_booking_ratio = (trials_booked / trial_count * 100) if trial_count > 0 else 0
                staff_result.update({
                    "test_count": test_count,
                    "test_details": test_details,
                    "trial_count": trial_count,
                    "trial_details": trial_details,
                    "patient_seen": patient_seen,
                    "patient_seen_details": list(patient_seen_qs),
                    "trials_booked": trials_booked,
                    "booked_trials_details": booked_trials_details,
                    "trial_booking_ratio": round(trial_booking_ratio, 2),
                    # "followup_completion_percent": round(followup_completion, 2)
                })

            elif role == 'reception':
                # Pending Service: service visits assigned and not completed
                from .models import ServiceVisit
                pending_service_qs = ServiceVisit.objects.filter(created_by=staff, visit__bill__payment_status='Paid')
                if start_date:
                    pending_service_qs = pending_service_qs.filter(created_at__date__gte=start_date)
                if end_date:
                    pending_service_qs = pending_service_qs.filter(created_at__date__lte=end_date)
                pending_service = pending_service_qs.count()
                pending_service_details = ServiceVisitListSerializer(pending_service_qs, many=True).data
                for i, service in enumerate(pending_service_qs):
                    pending_service_details[i]['cost'] = service.charges_collected

                # Calls made for followup: PatientVisit where contacted_by = staff
                calls_made_qs = PatientVisit.objects.filter(contacted_by=staff, contacted=True, bill__payment_status='Paid')
                if start_date:
                    calls_made_qs = calls_made_qs.filter(updated_at__date__gte=start_date)
                if end_date:
                    calls_made_qs = calls_made_qs.filter(updated_at__date__lte=end_date)
                calls_made_qs = calls_made_qs.order_by('-updated_at')
                calls_made = calls_made_qs.count()
                calls_made_details = PatientVisitSerializer(calls_made_qs, many=True, show_contacted_fields=True).data

                staff_result.update({
                    "pending_service": pending_service,
                    "pending_service_details": pending_service_details,
                    "calls_made_for_followup": calls_made,
                    "calls_made_details": calls_made_details
                })
            results.append(staff_result)

        return Response({"status": 200, "data": results})
