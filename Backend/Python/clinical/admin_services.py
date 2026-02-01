from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum, Q, F, Avg, DecimalField
from django.utils import timezone
from datetime import datetime, date, timedelta
from django.db.models.functions import TruncDate, TruncMonth, TruncYear
from accounts.models import User, Clinic
from .models import Patient, PatientVisit, Trial, Bill, BillItem, InventoryItem, InventorySerial, ServiceVisit, TestType, PatientPurchase
import json
from clinical_be.utils.permission import IsClinicAdmin, ReceptionistPermission
from rest_framework import status



# List API for clinic 
class ClinicListView(APIView):
    permission_classes = [IsAuthenticated,IsClinicAdmin | ReceptionistPermission]
    
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
    permission_classes = [IsAuthenticated, IsClinicAdmin | ReceptionistPermission]
    
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
            
            # 1. Patients in date range
            patients_data = PatientVisit.objects.filter(**visit_filter).values(
                'patient__name', 'patient__phone_primary', 'clinic__name', 'visit_type', 'created_at'
            ).order_by('-created_at')
            
            # 2. New tests in date range
            if clinic_id:
                new_tests = PatientVisit.objects.filter(
                    clinic_id=clinic_id,
                    created_at__date__gte=start_date,
                    created_at__date__lte=end_date,
                    test_requested__isnull=False
                ).exclude(test_requested='').values('patient__name', 'test_requested', 'clinic__name', 'seen_by__name')
            else:
                new_tests = PatientVisit.objects.filter(
                    created_at__date__gte=start_date,
                    created_at__date__lte=end_date,
                    test_requested__isnull=False
                ).exclude(test_requested='').values('patient__name', 'test_requested', 'clinic__name', 'seen_by__name')
            
            # 3. Trials in date range
            if clinic_id:
                trials_data = Trial.objects.filter(
                    visit__clinic_id=clinic_id,
                    created_at__date__gte=start_date,
                    created_at__date__lte=end_date
                ).values(
                    'assigned_patient__name', 'device_inventory_id__brand', 'device_inventory_id__model_type',
                    'visit__clinic__name', 'trial_decision', 'followup_date', 'created_at'
                )
            else:
                trials_data = Trial.objects.filter(
                    created_at__date__gte=start_date,
                    created_at__date__lte=end_date
                ).values(
                    'assigned_patient__name', 'device_inventory_id__brand', 'device_inventory_id__model_type',
                    'visit__clinic__name', 'trial_decision', 'followup_date', 'created_at'
                )
            
            # 4. Bookings in date range (completed trials that resulted in booking)
            if clinic_id:
                bookings_data = Trial.objects.filter(
                    visit__clinic_id=clinic_id,
                    trial_completed_at__date__gte=start_date,
                    trial_completed_at__date__lte=end_date,
                    trial_decision='BOOK'
                ).values(
                    'assigned_patient__name', 'booked_device_inventory__brand', 'booked_device_inventory__model_type',
                    'visit__clinic__name', 'cost', 'trial_completed_at'
                )
            else:
                bookings_data = Trial.objects.filter(
                    trial_completed_at__date__gte=start_date,
                    trial_completed_at__date__lte=end_date,
                    trial_decision='BOOK'
                ).values(
                    'assigned_patient__name', 'booked_device_inventory__brand', 'booked_device_inventory__model_type',
                    'visit__clinic__name', 'cost', 'trial_completed_at'
                )
            # Prepare response data
            patients_list = list(patients_data) if patients_data.exists() else []
            new_tests_list = list(new_tests) if new_tests.exists() else []
            trials_list = list(trials_data) if trials_data.exists() else []
            bookings_list = list(bookings_data) if bookings_data.exists() else []
            
            # Create summary counts
            summary = {
                'total_patients': len(patients_list),
                'new_tests': len(new_tests_list),
                'bookings': len(bookings_list),
                'total_trials': len(trials_list),
            }
            
            return JsonResponse({
                'status': 'success',
                'data': {
                    'date': f"{start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}",
                    'summary': summary,
                    'patients': patients_list,
                    'new_tests': new_tests_list,
                    'trials': trials_list,
                    'bookings': bookings_list,
                    # 'tgas': tgas_list,
                    # 'followup_pending': followup_list
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
    permission_classes = [IsAuthenticated,IsClinicAdmin | ReceptionistPermission]
    
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
                    total_revenue=Sum('final_amount'),
                    total_bills=Count('id'),
                    avg_bill_amount=Avg('final_amount')
                ).order_by('-total_revenue')
                
            elif report_type == 'staff':
                # Revenue by staff (who created the bills)
                revenue_data = bills.values('created_by__name').annotate(
                    total_revenue=Sum('final_amount'),
                    total_bills=Count('id'),
                    avg_bill_amount=Avg('final_amount')
                ).order_by('-total_revenue')
            
                
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
            total_revenue = bills.aggregate(total=Sum('final_amount'))['total'] or 0
            total_bills = bills.count()
            avg_bill_amount = bills.aggregate(avg=Avg('final_amount'))['avg'] or 0
            
            return JsonResponse({
                'status': 'success',
                'report_type': report_type,
                'date_range': {
                    'start_date': start_date.strftime('%Y-%m-%d'),
                    'end_date': end_date.strftime('%Y-%m-%d')
                },
                'summary': {
                    'total_revenue': float(total_revenue),
                    'total_bills': total_bills,
                    'avg_bill_amount': float(avg_bill_amount)
                },
                'revenue_data': list(revenue_data),
            })
            
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

