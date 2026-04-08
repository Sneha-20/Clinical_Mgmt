from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum, Q, F, Avg, DecimalField
from django.utils import timezone
from datetime import datetime, date, timedelta
from django.db.models.functions import TruncDate, TruncMonth, TruncYear
from accounts.models import User, Clinic
from .models import Patient, PatientVisit, Trial, Bill, BillItem, InventoryItem, InventorySerial, ServiceVisit, TestType, PatientPurchase, BookedDeviceAfterTrial, VisitTestPerformed
import json
from clinical_be.utils.permission import IsClinicAdmin, ReceptionistPermission, ClinicManagerPermission
from rest_framework import status



# List API for clinic 
class ClinicListView(APIView):
    permission_classes = [IsAuthenticated,IsClinicAdmin | ReceptionistPermission | ClinicManagerPermission]
    
    def get(self, request):
        try:
            clinics = Clinic.objects.all().values('id', 'name', 'address', 'phone')
            return JsonResponse({'status': status.HTTP_200_OK, 'data': list(clinics)})
        except Exception as e:
            return JsonResponse({'status': status.HTTP_500_INTERNAL_SERVER_ERROR, 'message': str(e)}, status=500)


class AdminClinicReportView(APIView):
    """
    Clinic Report Dashboard
    Provides comprehensive clinic data for a date range (similar to AdminDailyStatusView)
    """
    permission_classes = [IsAuthenticated, IsClinicAdmin | ReceptionistPermission | ClinicManagerPermission]
    
    def get(self, request):
        try:
            # Get date range parameters
            start_date = request.GET.get('start_date')
            end_date = request.GET.get('end_date')
            clinic_id = request.GET.get('clinic_id')  # Optional: filter by specific clinic
            
            # Set default date range if not provided (last 2 days)
            if not start_date:
                start_date = (timezone.now().date() - timedelta(days=2)).strftime('%Y-%m-%d')
            if not end_date:
                end_date = timezone.now().date().strftime('%Y-%m-%d')
            
            # Parse dates
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            
            # Base queryset with optional clinic filter
            visit_filter = {
                'created_at__date__gte': start_date,
                'created_at__date__lte': end_date
            }
            if clinic_id:
                visit_filter['clinic_id'] = clinic_id
            
            # 1. Patient records in date range
            patient_filter = {
                'created_at__date__gte': start_date,
                'created_at__date__lte': end_date
            }
            if clinic_id:
                patient_filter['clinic_id'] = clinic_id
            
            patients_qs = Patient.objects.filter(**patient_filter).select_related('clinic').order_by('-created_at')
            patients_list = []
            for patient in patients_qs:
                patients_list.append({
                    'id': patient.id,
                    'name': patient.name,
                    'phone_primary': patient.phone_primary,
                    'address': patient.address,
                    'age': patient.age,
                    'referral_doctor': patient.referral_doctor,
                })
            
            # 2. Patient visit records in date range
            patients_data = PatientVisit.objects.filter(**visit_filter).values(
                'id', 'patient__name', 'patient__phone_primary', 'created_at', 'visit_type', 'status'
            ).order_by('-created_at')
            
            patient_visits_list = []
            for visit in patients_data:
                patient_visits_list.append({
                    'visit_id': visit['id'],
                    'patient_name': visit['patient__name'],
                    'patient_phone': visit['patient__phone_primary'],
                    'visit_date': visit['created_at'],
                    'visit_type': visit['visit_type'],
                    'visit_status': visit['status']
                })
            
            # 3. Tests performed in date range
            test_filter = {
                'visit__created_at__date__gte': start_date,
                'visit__created_at__date__lte': end_date
            }
            if clinic_id:
                test_filter['visit__clinic_id'] = clinic_id

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
            
            # 4. Trials in date range
            trial_filter = {
                'created_at__date__gte': start_date,
                'created_at__date__lte': end_date
            }
            if clinic_id:
                trial_filter['visit__clinic_id'] = clinic_id

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
                        # 'model_type': device_inventory.model_type.name if device_inventory and device_inventory.model_type else None,
                        # 'receiver_power': detail.receiver_power,
                        # 'receiver_length': detail.receiver_length,
                        # 'dome_type': detail.dome_type,
                        # 'dome_size': detail.dome_size,
                        # 'ear_piece': detail.ear_piece,
                        # 'universal_eartip_size': detail.universal_eartip_size,
                        # 'vent': detail.vent,
                        # 'vent_size': detail.vent_size,
                        # 'rechargeable': detail.rechargeable,
                        # 'battery_number': detail.battery_number,
                        # 'wireless': detail.wireless,
                        # 'better_ear_device': detail.better_ear_device,
                        # 'routing_device': detail.routing_device,
                        # 'srt_before': detail.srt_before,
                        # 'sds_before': detail.sds_before,
                        # 'ucl_before': detail.ucl_before,
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

            # 5. Bookings in date range (completed trials that resulted in booking)
            booking_filter = {
                'trial__trial_completed_at__date__gte': start_date,
                'trial__trial_completed_at__date__lte': end_date,
            }
            if clinic_id:
                booking_filter['trial__visit__clinic_id'] = clinic_id

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
                    # 'clinic_name': booking.trial.visit.clinic.name if booking.trial and booking.trial.visit and booking.trial.visit.clinic else None,
                    'booking_status': booking.booking_status,
                    'booking_created_at': booking.created_at,
                    'trial_decision': booking.trial.trial_decision if booking.trial else None,
                    # 'trial_completed_at': booking.trial.trial_completed_at if booking.trial else None,
                    'inventory_item': inventory_item.product_name if inventory_item else None,
                    'brand': inventory_item.brand.name if inventory_item and inventory_item.brand else None,
                    'model_type': inventory_item.model_type.name if inventory_item and inventory_item.model_type else None,
                    'serial_number': booking.serial_number.serial_number if booking.serial_number else None,
                    'ear_side': booking.ear_side,
                    'is_customization_needed': booking.is_customization_needed,
                    'is_customization_completed': booking.is_customization_completed,
                    # 'trial_cost': booking.trial.cost if booking.trial else None,
                })

            # 6. Purchase records in date range
            purchase_filter = {
                'purchased_at__date__gte': start_date,
                'purchased_at__date__lte': end_date,
            }
            if clinic_id:
                purchase_filter['clinic_id'] = clinic_id

            purchases_qs = PatientPurchase.objects.filter(**purchase_filter).select_related(
                'patient',
                'clinic',
                'inventory_item__brand',
                'inventory_item__model_type',
                'inventory_serial'
            ).order_by('-purchased_at')

            purchase_records = []
            for purchase in purchases_qs:
                item = purchase.inventory_item
                purchase_records.append({
                    'patient_name': purchase.patient.name if purchase.patient else None,
                    'clinic_name': purchase.clinic.name if purchase.clinic else None,
                    'inventory_item': item.product_name if item else None,
                    'brand': item.brand.name if item and item.brand else None,
                    'model_type': item.model_type.name if item and item.model_type else None,
                    'serial_number': purchase.inventory_serial.serial_number if purchase.inventory_serial else None,
                    'quantity': purchase.quantity,
                    'unit_price': purchase.unit_price,
                    'total_price': purchase.total_price,
                    'ear_side': purchase.ear_side,
                    'purchased_at': purchase.purchased_at,
                })
            
            # Create summary counts
            summary = {
                'total_patients': len(patients_list),
                'total_patient_visits': len(patient_visits_list),
                'total_tests': len(tests_list),
                'total_trials': len(trials_list),
                'total_bookings': len(bookings_list),
                'total_purchases': len(purchase_records),
            }
            
            return JsonResponse({
                'status': 'success',
                'data': {
                    'date': f"{start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}",
                    'summary': summary,
                    'patients': patients_list,
                    'patient_visits': patient_visits_list,
                    'tests': tests_list,
                    'trials': trials_list,
                    'bookings': bookings_list,
                    'purchase_records': purchase_records,
                }
            })
            
        except ValueError as e:
            return JsonResponse({'status': 'error', 'message': 'Invalid date format. Use YYYY-MM-DD format.'}, status=400)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


class AdminRevenueReportsView(APIView):
    """
    Revenue Reports Dashboard
    Provides comprehensive revenue analytics
    """
    permission_classes = [IsAuthenticated,IsClinicAdmin | ReceptionistPermission | ClinicManagerPermission]
    
    def get(self, request):
        try:
            # Get filter parameters
            report_type = request.GET.get('type', 'clinic')  # clinic, staff, day, category
            start_date = request.GET.get('start_date')
            end_date = request.GET.get('end_date')
            clinic_id = request.GET.get('clinic_id')
            
            # Set default date range if not provided
            if not start_date:
                start_date = (timezone.now().date() - timedelta(days=30)).strftime('%Y-%m-%d')
            if not end_date:
                end_date = timezone.now().date().strftime('%Y-%m-%d')
            
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            
            # Base filter for bills
            bill_filter = {
                'created_at__date__gte': start_date,
                'created_at__date__lte': end_date,
                'payment_status': 'Paid'
            }
            if clinic_id:
                bill_filter['clinic_id'] = clinic_id
            
            bills = Bill.objects.filter(**bill_filter)
            
            if report_type == 'clinic':
                # Revenue by clinic
                revenue_data = bills.values('clinic__name').annotate(
                    total_revenue=Sum('total_amount'),
                    total_bills=Count('id'),
                    avg_bill_amount=Avg('total_amount')
                ).order_by('-total_revenue')
                
            # elif report_type == 'staff':
                # Revenue by staff (who created the bills)
            
                
            elif report_type == 'category':
                # Revenue by category (tests, trials, services, purchases)
                revenue_data = BillItem.objects.filter(
                    bill__in=bills
                ).values('item_type').annotate(
                    total_revenue=Sum(F('cost') * F('quantity'), output_field=DecimalField()),
                    total_items=Count('id')
                ).order_by('-total_revenue')
                
            else:
                return JsonResponse({'status': 'error', 'message': 'Invalid report type'}, status=400)
            
            # Calculate overall totals
            total_revenue = bills.aggregate(total=Sum('total_amount'))['total'] or 0
            total_bills = bills.count()
            avg_bill_amount = bills.aggregate(avg=Avg('total_amount'))['avg'] or 0

            staff_revenue_data = bills.values('created_by__name', 'created_by__id').annotate(
                    total_revenue=Sum('total_amount'),
                    total_bills=Count('id'),
                    avg_bill_amount=Avg('total_amount')
                ).order_by('-total_revenue')
            
            return JsonResponse({
                'status': status.HTTP_200_OK,
                'data': {
                    'report_type': report_type,
                    'date_range': {
                        'start_date': start_date.strftime('%Y-%m-%d'),
                        'end_date': end_date.strftime('%Y-%m-%d')
                    },
                    'revenue_data': list(revenue_data),
                    'staff_revenue_data': list(staff_revenue_data)
                }
            })
            
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)



class DoctorReferrralListView(APIView):
    """
    List of doctor referrals for admin dashboard
    """
    permission_classes = [IsAuthenticated,IsClinicAdmin | ReceptionistPermission | ClinicManagerPermission]
    
    def get(self, request):
        clinic_id = request.GET.get('clinic_id')  # Optional filter by clinic
        try:
           # 1. Start with a base queryset using ONE model
            queryset = Patient.objects.filter(referral_doctor__isnull=False).exclude(
            referral_doctor__exact=""
        )
        
            # 2. Apply the optional filter dynamically
            if clinic_id:
                queryset = queryset.filter(clinic_id=clinic_id)
            
            return JsonResponse({'status': status.HTTP_200_OK, 'data': list(queryset.values('referral_doctor', 'clinic__name', 'created_at').distinct('referral_doctor'))})
        except Exception as e:
            return JsonResponse({'status': status.HTTP_500_INTERNAL_SERVER_ERROR, 'message': str(e)}, status=500)



# get the patient record (name , bills) with referral doctor name
class PatientReferralDetailView(APIView):
    permission_classes = [IsAuthenticated,IsClinicAdmin | ReceptionistPermission | ClinicManagerPermission]
    
    def get(self, request):
        referral_doctor = request.query_params.get('referral_doctor')
        clinic_id = request.query_params.get('clinic_id')  # Optional filter by clinic
        try:
            if not referral_doctor:
                return JsonResponse({'status': status.HTTP_400_BAD_REQUEST, 'message': 'Referral doctor name is required'}, status=400)
            
            # 1. Start with a base queryset using ONE model
            queryset = PatientVisit.objects.filter(patient__referral_doctor=referral_doctor)
        
            # 2. Apply the optional filter dynamically
            if clinic_id:
                queryset = queryset.filter(clinic_id=clinic_id)
            
            # 3. Prefetch related visits and bills to avoid N+1 queries
            queryset = queryset.prefetch_related('bill')


            # 4. Prepare the response data
            data = []
            for visit in queryset:
                bill_amount = visit.bill.total_amount if hasattr(visit, 'bill') else 0
                data.append({
                    'patient_name': visit.patient.name,
                    'clinic_name': visit.clinic.name if visit.clinic else None,
                    'visit_type': visit.visit_type,
                    'present_complaint': visit.present_complaint,
                    'visit_date': visit.created_at.date(),
                    'trial_given': True if visit.trial_set.exists() else False,
                    'bills_items': list(visit.bill.bill_items.values('item_type', 'description', 'cost', 'quantity')) if hasattr(visit, 'bill') else [],
                    'total_amount': bill_amount
                })

            
            return JsonResponse({'status': status.HTTP_200_OK, 'data': data})
        except Exception as e:
            return JsonResponse({'status': status.HTTP_500_INTERNAL_SERVER_ERROR, 'message': str(e)}, status=500)