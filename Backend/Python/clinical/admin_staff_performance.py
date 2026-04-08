from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from accounts.models import User
from .models import PatientVisit, Trial, VisitTestPerformed, BookedDeviceAfterTrial, ServiceVisit, PatientPurchase
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
                "role": staff.role.name if staff.role else None,
                "total_revenue": 0.00
            }
            if role == 'audiologist':
                # Test conducted
                test_filter = {
                    'visit__seen_by': staff
                }
                if start_date:
                    test_filter['visit__created_at__date__gte'] = start_date
                if end_date:
                    test_filter['visit__created_at__date__lte'] = end_date

                tests_qs = VisitTestPerformed.objects.filter(**test_filter).select_related(
                    'visit__patient', 'visit__seen_by'
                ).order_by('-visit__created_at')

                tests_list = []
                for test in tests_qs:
                    # Map boolean fields to test names
                    test_names = []
                    flag_to_testtype_name = {
                        'pta': 'PTA',
                        'impedance': 'Impedance',
                        'special_tests': 'Special Tests',
                        'speech_assessment': 'Speech Assessment',
                        'srt_sds': 'SRT/SDS',
                        'pta_sds': 'PTA/SDS',
                        'impedance_etf': 'Impedance/ETF',
                        'bera': 'BERA',
                        'assr': 'ASSR',
                        'bera_assr': 'BERA/ASSR',
                    }
                    
                    for field, name in flag_to_testtype_name.items():
                        if getattr(test, field, False):
                            test_names.append(name)
                    
                    tests_list.append({
                        'patient_name': test.visit.patient.name if test.visit and test.visit.patient else None,
                        'visit_date': test.visit.created_at if test.visit else None,
                        'test_name': test_names,  # List of test names
                        'seen_by': test.visit.seen_by.name if test.visit and test.visit.seen_by else None,
                    })

                # Trial details
                trial_filter = {
                    'visit__seen_by': staff
                }
                if start_date:
                    trial_filter['created_at__date__gte'] = start_date
                if end_date:
                    trial_filter['created_at__date__lte'] = end_date

                trials_qs = Trial.objects.filter(**trial_filter).select_related(
                    'assigned_patient', 'visit__clinic'
                ).prefetch_related(
                    'device_details_set__device_inventory_id__brand',
                    'device_details_set__device_inventory_id__model_type'
                ).order_by('-created_at')

                trials_list = []
                for trial in trials_qs:
                    device_details = []
                    for detail in trial.device_details_set.all():
                        device_inventory = detail.device_inventory_id
                        device_details.append({
                            'ear_side': detail.ear_side,
                            'serial_number': detail.serial_number,
                            'style_type': detail.style_type,
                            'device_name': device_inventory.product_name if device_inventory else None,
                            'brand': device_inventory.brand.name if device_inventory and device_inventory.brand else None,
                        })

                    trials_list.append({
                        'patient_name': trial.assigned_patient.name if trial.assigned_patient else None,
                        'clinic_name': trial.visit.clinic.name if trial.visit and trial.visit.clinic else None,
                        'trial_decision': trial.trial_decision,
                        'followup_date': trial.followup_date,
                        'trial_start_date': trial.trial_start_date,
                        'trial_end_date': trial.trial_end_date,
                        'trial_cost': trial.cost,
                        'trial_completed_at': trial.trial_completed_at,
                        'device_details': device_details,
                        'created_at': trial.created_at,
                    })

                # Patient List Seen
                patient_seen_qs = PatientVisit.objects.filter(seen_by=staff)
                if start_date:
                    patient_seen_qs = patient_seen_qs.filter(created_at__date__gte=start_date)
                if end_date:
                    patient_seen_qs = patient_seen_qs.filter(created_at__date__lte=end_date)
                patient_seen_qs = patient_seen_qs.values('patient__id', 'patient__name', 'patient__phone_primary').distinct()
                patient_list_seen = list(patient_seen_qs)

                # Booking
                booking_filter = {
                    'trial__visit__seen_by': staff
                }
                if start_date:
                    booking_filter['trial__trial_completed_at__date__gte'] = start_date
                if end_date:
                    booking_filter['trial__trial_completed_at__date__lte'] = end_date

                bookings_qs = BookedDeviceAfterTrial.objects.filter(
                    **booking_filter,
                    booking_status__in=['BOOK - Awaiting Stock', 'BOOK - Device Allocated']
                ).select_related(
                    'trial__assigned_patient',
                    'trial__visit__clinic',
                    'inventory_item__brand',
                    'inventory_item__model_type',
                    'serial_number'
                ).order_by('-created_at')

                bookings_list = []
                for booking in bookings_qs:
                    inventory_item = booking.inventory_item
                    bookings_list.append({
                        'patient_name': booking.trial.assigned_patient.name if booking.trial and booking.trial.assigned_patient else None,
                        'booking_status': booking.booking_status,
                        'booking_created_at': booking.created_at,
                        'trial_decision': booking.trial.trial_decision if booking.trial else None,
                        'inventory_item': inventory_item.product_name if inventory_item else None,
                        'brand': inventory_item.brand.name if inventory_item and inventory_item.brand else None,
                        'model_type': inventory_item.model_type.name if inventory_item and inventory_item.model_type else None,
                        'serial_number': booking.serial_number.serial_number if booking.serial_number else None,
                        'ear_side': booking.ear_side,
                        'is_customization_needed': booking.is_customization_needed,
                        'is_customization_completed': booking.is_customization_completed,
                    })

                # Visit details with bill cost for Test/Trial related visits
                visit_bill_filter = {
                    'seen_by': staff
                }
                if start_date:
                    visit_bill_filter['created_at__date__gte'] = start_date
                if end_date:
                    visit_bill_filter['created_at__date__lte'] = end_date

                visit_bills_qs = PatientVisit.objects.filter(**visit_bill_filter).select_related(
                    'patient', 'clinic', 'bill'
                ).filter(
                    Q(visit_type__icontains='Test') | Q(visit_type__icontains='Trial')
                ).order_by('-created_at')

                visit_bills_list = []
                total_bills_cost = 0.00
                for visit in visit_bills_qs:
                    bill_amount = float(visit.bill.total_amount) if hasattr(visit, 'bill') and visit.bill and visit.bill.total_amount else 0.00
                    total_bills_cost += bill_amount
                    visit_bills_list.append({
                        'patient_name': visit.patient.name if visit.patient else None,
                        'clinic_name': visit.clinic.name if visit.clinic else None,
                        'visit_type': visit.visit_type,
                        'visit_date': visit.created_at,
                        'bill_amount': bill_amount,
                        'payment_status': visit.bill.payment_status if hasattr(visit, 'bill') and visit.bill else None,
                    })

                # Calculate total revenue for audiologist
                total_revenue = total_bills_cost
                for trial in trials_qs:
                    total_revenue += float(trial.cost) if trial.cost else 0.00

                staff_result.update({
                    "tests": tests_list,
                    "trials": trials_list,
                    "patient_list_seen": patient_list_seen,
                    "bookings": bookings_list,
                    "visit_details_with_bills": visit_bills_list,
                    "total_bills_cost": total_bills_cost,
                    "total_revenue": total_revenue,
                })

            elif role in ('reception', 'receptionist'): 
                # Service visits
                service_visit_filter = {
                    'created_by': staff
                }
                if start_date:
                    service_visit_filter['created_at__date__gte'] = start_date
                if end_date:
                    service_visit_filter['created_at__date__lte'] = end_date

                service_visits_qs = ServiceVisit.objects.filter(**service_visit_filter).select_related(
                    'visit__patient', 'visit__clinic'
                ).order_by('-created_at')

                service_visits_list = []
                for service in service_visits_qs:
                    service_visits_list.append({
                        'patient_name': service.visit.patient.name if service.visit and service.visit.patient else None,
                        'clinic_name': service.visit.clinic.name if service.visit and service.visit.clinic else None,
                        'service_type': service.service_type,
                        'charges_collected': service.charges_collected,
                        'created_at': service.created_at,
                    })

                # Followup/Call made
                followup_filter = {
                    'contacted_by': staff,
                    'contacted': True
                }
                if start_date:
                    followup_filter['updated_at__date__gte'] = start_date
                if end_date:
                    followup_filter['updated_at__date__lte'] = end_date

                followup_qs = PatientVisit.objects.filter(**followup_filter).select_related(
                    'patient', 'clinic', 'contacted_by'
                ).order_by('-updated_at')

                followup_list = []
                for visit in followup_qs:
                    followup_list.append({
                        'patient_name': visit.patient.name if visit.patient else None,
                        'clinic_name': visit.clinic.name if visit.clinic else None,
                        'visit_type': visit.visit_type,
                        'contacted_date': visit.updated_at,
                        'contacted_by': visit.contacted_by.name if visit.contacted_by else None,
                    })

                # Service/TGA visits
                tga_filter = {
                    'created_by': staff,
                    'service_type': 'TGA'
                }
                if start_date:
                    tga_filter['created_at__date__gte'] = start_date
                if end_date:
                    tga_filter['created_at__date__lte'] = end_date

                tga_visits_qs = ServiceVisit.objects.filter(**tga_filter).select_related(
                    'visit__patient', 'visit__clinic'
                ).order_by('-created_at')

                tga_visits_list = []
                for service in tga_visits_qs:
                    tga_visits_list.append({
                        'patient_name': service.visit.patient.name if service.visit and service.visit.patient else None,
                        'clinic_name': service.visit.clinic.name if service.visit and service.visit.clinic else None,
                        'service_type': service.service_type,
                        'charges_collected': service.charges_collected,
                        'created_at': service.created_at,
                    })

                # Purchase records
                purchase_filter = {
                    'visit__seen_by': staff
                }
                if start_date:
                    purchase_filter['purchased_at__date__gte'] = start_date
                if end_date:
                    purchase_filter['purchased_at__date__lte'] = end_date

                purchases_qs = PatientPurchase.objects.filter(**purchase_filter).select_related(
                    'patient', 'visit', 'inventory_item'
                ).order_by('-purchased_at')

                purchases_list = []
                total_purchase_cost = 0.00
                for purchase in purchases_qs:
                    total_price = float(purchase.total_price) if purchase.total_price else 0.00
                    total_purchase_cost += total_price
                    purchases_list.append({
                        'patient_name': purchase.patient.name if purchase.patient else None,
                        'inventory_item': purchase.inventory_item.product_name if purchase.inventory_item else None,
                        'quantity': purchase.quantity,
                        'unit_price': purchase.unit_price,
                        'total_price': total_price,
                        'ear_side': purchase.ear_side,
                        'purchased_at': purchase.purchased_at,
                    })

                # Calculate total revenue for receptionist
                total_service_cost = 0.00
                for service in service_visits_qs:
                    total_service_cost += float(service.charges_collected) if service.charges_collected else 0.00
                total_tga_cost = 0.00
                for tga in tga_visits_qs:
                    total_tga_cost += float(tga.charges_collected) if tga.charges_collected else 0.00
                total_revenue = total_service_cost + total_tga_cost + total_purchase_cost

                staff_result.update({
                    "service_visits": service_visits_list,
                    "followup_calls": followup_list,
                    "service_tga": tga_visits_list,
                    "purchases": purchases_list,
                    "total_service_cost": total_service_cost,
                    "total_tga_cost": total_tga_cost,
                    "total_purchase_cost": total_purchase_cost,
                    "total_revenue": total_revenue,
                })
            results.append(staff_result)

        return Response({"status": 200, "data": results})
