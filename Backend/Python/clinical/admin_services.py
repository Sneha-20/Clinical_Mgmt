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


class AdminDailyStatusView(APIView):
    """
    Daily Clinic Status Dashboard
    Provides overview of today's activities across all clinics
    """
    permission_classes = [IsAuthenticated,IsClinicAdmin | ReceptionistPermission]
    
    def get(self, request):
        try:
            today = timezone.now().date()
            clinic_id = request.GET.get('clinic_id')  # Optional: filter by specific clinic
            
            # Base queryset with optional clinic filter
            visit_filter = {'created_at__date': today}
            if clinic_id:
                visit_filter['clinic_id'] = clinic_id
            
            # 1.unique Patients today
            patients_today = PatientVisit.objects.filter(**visit_filter).values('patient__name', 'patient__phone_primary', 'clinic__name', 'visit_type', 'created_at').order_by('-created_at')
            
            # 2. New tests today
            new_tests = PatientVisit.objects.filter(
                clinic_id=clinic_id,
                test_requested__isnull=False
            ).exclude(test_requested='').values('patient__name', 'test_requested', 'clinic__name', 'seen_by__name')
            
            # 3. Trials today
            trials_today = Trial.objects.filter(
                visit__clinic_id=clinic_id,
                created_at__date=today
            ).values(
                'assigned_patient__name', 'device_inventory_id__brand', 'device_inventory_id__model_type',
                'visit__clinic__name', 'trial_decision', 'followup_date'
            )
            
            # 4. Bookings today (completed trials that resulted in booking)
            bookings_today = Trial.objects.filter(
                visit__clinic_id=clinic_id,
                trial_completed_at__date=today,
                trial_decision='BOOK'
            ).values(
                'assigned_patient__name', 'booked_device_inventory__brand', 'booked_device_inventory__model_type',
                'visit__clinic__name', 'cost'
            )
            
            # 5. TGAs today
            tgas_today = ServiceVisit.objects.filter(
                visit__clinic_id=clinic_id,
                visit__visit_type__in = ['Troubleshooting General Adjustment','TGA']
            ).values('visit__patient__name', 'visit__clinic__name', 'status', 'complaint')
            
            
            
            # 7. Follow-up pending list
            followup_pending = PatientVisit.objects.filter(
                status='Follow-up',
                appointment_date__lte=today,
                contacted=False
            ).values(
                'patient__name', 'patient__phone_primary', 'clinic__name', 
                'appointment_date', 'created_at'
            ).order_by('appointment_date')
            
            return JsonResponse({
                'status': 'success',
                'data': {
                    'date': today.strftime('%Y-%m-%d'),
                    'summary': {
                        'total_patients': patients_today.count(),
                        'new_tests': new_tests.count(),
                        'active_trials': trials_today.filter(trial_decision='TRIAL_ACTIVE').count(),
                        'bookings': bookings_today.count(),
                        'tgas': tgas_today.count(),
                        'followup_pending': followup_pending.count(),
                        'total_trials': trials_today.count()
                    },
                    'patients': list(patients_today),
                    'new_tests': list(new_tests),
                    'trials': list(trials_today),
                    'bookings': list(bookings_today),
                    'tgas': list(tgas_today),
                    'followup_pending': list(followup_pending)
                }
            })
            
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

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
            
            # 5. TGAs in date range
            if clinic_id:
                tgas_data = ServiceVisit.objects.filter(
                    visit__clinic_id=clinic_id,
                    created_at__date__gte=start_date,
                    created_at__date__lte=end_date,
                    visit__visit_type__in = ['Troubleshooting General Adjustment','TGA']
                ).values('visit__patient__name', 'visit__clinic__name', 'status', 'complaint', 'created_at')
            else:
                tgas_data = ServiceVisit.objects.filter(
                    created_at__date__gte=start_date,
                    created_at__date__lte=end_date,
                    visit__visit_type__in = ['Troubleshooting General Adjustment','TGA']
                ).values('visit__patient__name', 'visit__clinic__name', 'status', 'complaint', 'created_at')
            
            # 6. Follow-up pending in date range
            if clinic_id:
                followup_data = PatientVisit.objects.filter(
                    clinic_id=clinic_id,
                    status='Follow-up',
                    appointment_date__gte=start_date,
                    appointment_date__lte=end_date,
                    contacted=False
                ).values(
                    'patient__name', 'patient__phone_primary', 'clinic__name', 
                    'appointment_date', 'created_at'
                ).order_by('appointment_date')
            else:
                followup_data = PatientVisit.objects.filter(
                    status='Follow-up',
                    appointment_date__gte=start_date,
                    appointment_date__lte=end_date,
                    contacted=False
                ).values(
                    'patient__name', 'patient__phone_primary', 'clinic__name', 
                    'appointment_date', 'created_at'
                ).order_by('appointment_date')
            
            # 7. Revenue data for the period
            if clinic_id:
                revenue_data = Bill.objects.filter(
                    clinic_id=clinic_id,
                    created_at__date__gte=start_date,
                    created_at__date__lte=end_date,
                    payment_status='Paid'
                ).aggregate(
                    total_revenue=Sum('final_amount'),
                    total_bills=Count('id'),
                    avg_bill_amount=Avg('final_amount')
                )
            else:
                revenue_data = Bill.objects.filter(
                    created_at__date__gte=start_date,
                    created_at__date__lte=end_date,
                    payment_status='Paid'
                ).aggregate(
                    total_revenue=Sum('final_amount'),
                    total_bills=Count('id'),
                    avg_bill_amount=Avg('final_amount')
                )
            
            # Convert None values to 0
            revenue_data = {
                'total_revenue': float(revenue_data['total_revenue'] or 0),
                'total_bills': revenue_data['total_bills'] or 0,
                'avg_bill_amount': float(revenue_data['avg_bill_amount'] or 0)
            }
            
            # Prepare response data
            patients_list = list(patients_data) if patients_data.exists() else []
            new_tests_list = list(new_tests) if new_tests.exists() else []
            trials_list = list(trials_data) if trials_data.exists() else []
            bookings_list = list(bookings_data) if bookings_data.exists() else []
            tgas_list = list(tgas_data) if tgas_data.exists() else []
            followup_list = list(followup_data) if followup_data.exists() else []
            
            # Create summary counts
            summary = {
                'total_patients': len(patients_list),
                'new_tests': len(new_tests_list),
                'active_trials': len([t for t in trials_list if t.get('trial_decision') == 'TRIAL_ACTIVE']),
                'completed_trials': len([t for t in trials_list if t.get('trial_decision') == 'TRIAL_COMPLETED']),
                'bookings': len(bookings_list),
                'tgas': len(tgas_list),
                'followup_pending': len(followup_list),
                'total_trials': len(trials_list),
                # 'trial_to_booking_ratio': (len(bookings_list) / len(trials_list) * 100) if len(trials_list) > 0 else 0
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
                    'tgas': tgas_list,
                    'followup_pending': followup_list
                }
            })
            
        except ValueError as e:
            return JsonResponse({'status': 'error', 'message': 'Invalid date format. Use YYYY-MM-DD format.'}, status=400)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

class AdminInventoryStatusView(APIView):
    """
    Inventory Status Dashboard
    Shows current inventory levels across all categories
    """
    permission_classes = [IsAuthenticated,IsClinicAdmin | ReceptionistPermission]
    
    def get(self, request):
        try:
            clinic_id = request.GET.get('clinic_id')  # Optional: filter by clinic
            
            # Get all inventory items with their quantities
            inventory_items = InventoryItem.objects.all()
            
            if clinic_id:
                # If clinic filter is specified, you might need to adjust based on your inventory structure
                # For now, assuming inventory is shared across clinics
                pass
            
            # Group by category
            inventory_by_category = {}
            categories = ['Hearing Aid', 'Battery', 'Dome', 'Receiver', 'Mold', 'Tube', 'Trial Stock', 'Speech Material']
            
            for category in categories:
                items = inventory_items.filter(category=category)
                
                # Calculate totals for this category
                total_quantity_of_category = items.aggregate(total=Sum('quantity_in_stock'))['total'] or 0
                
                # Get items with low stock
                low_stock_items = items.filter(
                    quantity_in_stock__lte=F('reorder_level')
                ).values('product_name', 'brand', 'model_type', 'quantity_in_stock', 'reorder_level')
                
                # Get expired or near-expiry items
                # expired_items = items.filter(expiry_date__lt=timezone.now().date()).values(
                #     'product_name', 'brand', 'model_type', 'expiry_date', 'quantity_in_stock'
                # )
                # near_expiry_items = items.filter(
                #     expiry_date__gt=timezone.now().date(),
                #     expiry_date__lte=timezone.now().date() + timedelta(days=30)
                # ).values('product_name', 'brand', 'model_type', 'expiry_date', 'quantity_in_stock')
                
                inventory_by_category[category] = {
                    'total_quantity_of_category': int(total_quantity_of_category),
                    'low_stock_items': list(low_stock_items),
                    # 'expired_items': list(expired_items),
                    # 'near_expiry_items': list(near_expiry_items),
                    'total_items_of_category': items.count()
                }
            
            # Serialized items status
            serialized_items = InventoryItem.objects.filter(stock_type='Serialized')
            # serialized_status = {}
            
            # for item in serialized_items:
            #     serial_counts = item.serials.values('status').annotate(count=Count('id'))
            #     serialized_status[f"{item.brand} {item.model_type}"] = {
            #         'in_stock': item.serials.filter(status='In Stock').count(),
            #         'in_trial': item.serials.filter(status='Trial').count(),
            #         'sold': item.serials.filter(status='Sold').count(),
            #         'in_service': item.serials.filter(status='Service').count(),
            #         'lost': item.serials.filter(status='Lost').count(),
            #         'total': item.serials.count()
            #     }
            
            # Low stock alerts
            low_stock_alerts = inventory_items.filter(
                quantity_in_stock__lte=F('reorder_level')
            ).values(
                'id', 'product_name', 'brand', 'model_type', 'category',
                'quantity_in_stock', 'reorder_level', 'stock_type'
            ).order_by('quantity_in_stock')
            
            # Fast moving items (based on recent purchases and trials)
            # Get items with high movement in last 30 days
            thirty_days_ago = timezone.now() - timedelta(days=30)
            
            # Items sold frequently
            fast_moving_purchases = PatientPurchase.objects.filter(
                purchased_at__gte=thirty_days_ago
            ).values('inventory_item_id').annotate(
                movement_count=Count('id'),
                total_quantity=Sum('quantity')
            ).order_by('-movement_count')[:20]
            
            # Items used in trials frequently
            fast_moving_trials = Trial.objects.filter(
                created_at__gte=thirty_days_ago
            ).values('device_inventory_id').annotate(
                movement_count=Count('id')
            ).order_by('-movement_count')[:20]
            
            # Combine fast moving items
            fast_moving_items = []
            fast_moving_item_ids = set()
            
            for item in fast_moving_purchases:
                item_id = item['inventory_item_id']
                if item_id not in fast_moving_item_ids:
                    fast_moving_item_ids.add(item_id)
                    try:
                        inventory_item = InventoryItem.objects.get(id=item_id)
                        fast_moving_items.append({
                            'id': inventory_item.id,
                            'product_name': inventory_item.product_name,
                            'brand': inventory_item.brand,
                            'model_type': inventory_item.model_type,
                            'category': inventory_item.category,
                            'movement_type': 'Sales',
                            'movement_count': item['movement_count'],
                            'total_quantity': item['total_quantity'],
                            'current_stock': inventory_item.quantity_in_stock
                        })
                    except InventoryItem.DoesNotExist:
                        continue
            
            for item in fast_moving_trials:
                item_id = item['device_inventory_id']
                if item_id not in fast_moving_item_ids and item_id:
                    try:
                        inventory_item = InventoryItem.objects.get(id=item_id)
                        fast_moving_items.append({
                            'id': inventory_item.id,
                            'product_name': inventory_item.product_name,
                            'brand': inventory_item.brand,
                            'model_type': inventory_item.model_type,
                            'category': inventory_item.category,
                            'movement_type': 'Trials',
                            'movement_count': item['movement_count'],
                            'total_quantity': item['movement_count'],
                            'current_stock': inventory_item.quantity_in_stock
                        })
                    except InventoryItem.DoesNotExist:
                        continue
            
            # Sort by movement count
            fast_moving_items.sort(key=lambda x: x['movement_count'], reverse=True)
            
            # Trial devices in use
            trial_devices_in_use = Trial.objects.filter(
                trial_decision='TRIAL_ACTIVE'
            ).select_related('device_inventory_id', 'visit__patient').values(
                'id', 'trial_start_date', 'trial_end_date', 'serial_number',
                'device_inventory_id__id', 'device_inventory_id__product_name',
                'device_inventory_id__brand', 'device_inventory_id__model_type',
                'visit__patient__name', 'visit__patient__phone_primary'
            ).order_by('trial_end_date')
            
            # # Lost devices
            # lost_devices = InventorySerial.objects.filter(
            #     status='Lost'
            # ).select_related('inventory_item').values(
            #     'id', 'serial_number', 'status',
            #     'inventory_item__id', 'inventory_item__product_name',
            #     'inventory_item__brand', 'inventory_item__model_type',
            #     'updated_at'
            # ).order_by('-updated_at')
            
            return JsonResponse({
                'status': 'success',
                'data': {
                    'summary': {
                        'total_categories': len(categories),
                        'low_stock_alerts_count': low_stock_alerts.count(),
                        'fast_moving_items_count': len(fast_moving_items),
                        'trial_devices_in_use_count': trial_devices_in_use.count()
                    },
                    'low_stock_alerts': list(low_stock_alerts),
                    'fast_moving_items': fast_moving_items,
                    'trial_devices_in_use': list(trial_devices_in_use),
                    'inventory_by_category': inventory_by_category
                }
            })
            
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
                
            elif report_type == 'day':
                # Revenue by day
                revenue_data = bills.annotate(
                    date=TruncDate('created_at')
                ).values('date').annotate(
                    total_revenue=Sum('final_amount'),
                    total_bills=Count('id'),
                    avg_bill_amount=Avg('final_amount')
                ).order_by('date')
                
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
            
            # Get payment method breakdown
            payment_methods = bills.values('payment_method').annotate(
                count=Count('id'),
                total=Sum('final_amount')
            ).order_by('-total')
            
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
                'payment_methods': list(payment_methods)
            })
            
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

class AdminStaffPerformanceView(APIView):
    """
    Staff Performance Dashboard
    Tracks various performance metrics for staff members
    """
    permission_classes = [IsAuthenticated,IsClinicAdmin | ReceptionistPermission]
    
    def get(self, request):
        try:
            # Get filter parameters
            start_date = request.GET.get('start_date')
            end_date = request.GET.get('end_date')
            clinic_id = request.GET.get('clinic_id')
            staff_id = request.GET.get('staff_id')  # Optional: specific staff member
            
            # Set default date range if not provided
            if not start_date:
                start_date = (timezone.now().date() - timedelta(days=30)).strftime('%Y-%m-%d')
            if not end_date:
                end_date = timezone.now().date().strftime('%Y-%m-%d')
            
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            
            # Base filter
            date_filter = {
                'created_at__date__gte': start_date,
                'created_at__date__lte': end_date
            }
            if clinic_id:
                date_filter['clinic_id'] = clinic_id
            
            # Get staff members (excluding superusers for performance tracking)
            staff_queryset = User.objects.filter(is_staff=True, is_superuser=False)
            if staff_id:
                staff_queryset = staff_queryset.filter(id=staff_id)
            
            staff_performance = []
            
            for staff in staff_queryset:
                # 1. Calls made (patients contacted for follow-up)
                calls_made = PatientVisit.objects.filter(
                    contacted_by=staff,
                    contacted=True,
                    **date_filter
                ).count()
                
                # 2. Follow-up conversion (patients who came back after being contacted)
                follow_up_conversions = PatientVisit.objects.filter(
                    contacted_by=staff,
                    contacted=True,
                    status='Completed'  # Assuming completed status means successful conversion
                ).filter(**date_filter).count()
                
                # 3. Trials conducted
                trials_conducted = Trial.objects.filter(
                    created_by=staff,
                    **date_filter
                ).count()
                
                # 4. Trials to booking ratio
                trials_booked = Trial.objects.filter(
                    created_by=staff,
                    trial_decision='BOOK',
                    **date_filter
                ).count()
                trial_booking_ratio = (trials_booked / trials_conducted * 100) if trials_conducted > 0 else 0
                
                # 5. Number of tests conducted
                tests_conducted = PatientVisit.objects.filter(
                    seen_by=staff,
                    test_requested__isnull=False,
                    **date_filter
                ).exclude(test_requested='').count()
                
                # 6. Number of TGAs conducted
                tgas_conducted = ServiceVisit.objects.filter(
                    created_by=staff,
                    service_type='TGA',
                    **date_filter
                ).count()
                
                # 7. Revenue generated
                revenue_generated = Bill.objects.filter(
                    created_by=staff,
                    payment_status='Paid',
                    **date_filter
                ).aggregate(total=Sum('final_amount'))['total'] or 0
                
                # 8. Attendance (days worked)
                days_worked = PatientVisit.objects.filter(
                    seen_by=staff,
                    **date_filter
                ).values('created_at__date').distinct().count()
                
                staff_performance.append({
                    'staff_id': staff.id,
                    'staff_name': staff.name,
                    'calls_made': calls_made,
                    'follow_up_conversions': follow_up_conversions,
                    'trials_conducted': trials_conducted,
                    'trials_booked': trials_booked,
                    'trial_booking_ratio': round(trial_booking_ratio, 2),
                    'tests_conducted': tests_conducted,
                    'tgas_conducted': tgas_conducted,
                    'revenue_generated': float(revenue_generated),
                    'days_worked': days_worked
                })
            
            # Sort by revenue generated (descending)
            staff_performance.sort(key=lambda x: x['revenue_generated'], reverse=True)
            
            # Calculate team totals
            team_totals = {
                'total_calls_made': sum(s['calls_made'] for s in staff_performance),
                'total_conversions': sum(s['follow_up_conversions'] for s in staff_performance),
                'total_trials': sum(s['trials_conducted'] for s in staff_performance),
                'total_bookings': sum(s['trials_booked'] for s in staff_performance),
                'total_tests': sum(s['tests_conducted'] for s in staff_performance),
                'total_tgas': sum(s['tgas_conducted'] for s in staff_performance),
                'total_revenue': sum(s['revenue_generated'] for s in staff_performance)
            }
            
            team_totals['avg_trial_booking_ratio'] = (
                (team_totals['total_bookings'] / team_totals['total_trials'] * 100)
                if team_totals['total_trials'] > 0 else 0
            )
            
            return JsonResponse({
                'status': 'success',
                'date_range': {
                    'start_date': start_date.strftime('%Y-%m-%d'),
                    'end_date': end_date.strftime('%Y-%m-%d')
                },
                'team_totals': team_totals,
                'staff_performance': staff_performance
            })
            
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


from clinical_be.utils.pagination import PageNumberPagination
class AdminPatientMasterSearchView(APIView):
    """
    Advanced Patient Search
    Comprehensive search functionality across multiple criteria
    """
    permission_classes = [IsAuthenticated,IsClinicAdmin | ReceptionistPermission]
    pagination_class = PageNumberPagination

    # search payload parameters
    # name: string
    # phone: string
    # serial_number: string
    # visit_type: string
    # city: string
    # last_visit: string
    # followup_pending: boolean

    # example
    # {
    #     "name": "John",
    #     "phone": "1234567890",
    #     "serial_number": "1234567890",
    #     "visit_type": "Follow-up",
    #     "city": "Bangalore",
    #     "last_visit": "30",
    #     "followup_pending": "true"
    # }

    def get(self, request):
        try:
            # Get search parameters
            name = request.GET.get('name', '').strip()
            phone = request.GET.get('phone', '').strip()
            serial_number = request.GET.get('serial_number', '').strip()
            visit_type = request.GET.get('visit_type', '').strip()
            city = request.GET.get('city', '').strip()
            last_visit_days = request.GET.get('last_visit', '').strip()
            followup_pending = request.GET.get('followup_pending', '').lower() == 'true'
            
            # Start with optimized patient query
            patients = Patient.objects.select_related('clinic').all()
            
            # Apply filters efficiently
            if name:
                patients = patients.filter(name__icontains=name)
            
            if phone:
                patients = patients.filter(
                    Q(phone_primary__icontains=phone) | 
                    Q(phone_secondary__icontains=phone)
                )
            
            if city:
                patients = patients.filter(city__icontains=city)
            
            # Handle serial number filtering efficiently
            if serial_number:
                trial_patients = Trial.objects.filter(
                    Q(serial_number__icontains=serial_number) |
                    Q(booked_device_serial__serial_number__icontains=serial_number)
                ).values_list('visit__patient_id', flat=True)
                
                purchase_patients = PatientPurchase.objects.filter(
                    inventory_serial__serial_number__icontains=serial_number
                ).values_list('patient_id', flat=True)
                
                serial_patient_ids = set(list(trial_patients) + list(purchase_patients))
                if serial_patient_ids:
                    patients = patients.filter(id__in=serial_patient_ids)
                else:
                    return JsonResponse({
                        'status': 'success',
                        'count': 0,
                        'patients': []
                    })
            
            # Get patient IDs for visit-based filtering
            patient_ids = list(patients.values_list('id', flat=True))
            
            # Optimize visit filtering
            visit_filter = {'patient_id__in': patient_ids}
            if visit_type:
                visit_filter['visit_type__icontains'] = visit_type
            if last_visit_days:
                days = int(last_visit_days)
                cutoff_date = timezone.now().date() - timedelta(days=days)
                visit_filter['created_at__date__gte'] = cutoff_date
            if followup_pending:
                visit_filter['status'] = 'Follow-up'
                visit_filter['contacted'] = False
            
            # Apply visit-based filters if needed
            if visit_type or last_visit_days or followup_pending:
                filtered_visit_patient_ids = PatientVisit.objects.filter(
                    **visit_filter
                ).values_list('patient_id', flat=True).distinct()
                patients = patients.filter(id__in=filtered_visit_patient_ids)
            
            # Optimize related data fetching with prefetch_related
            patients = patients.prefetch_related(
                'visits__clinic',
                'visits__seen_by',
                'purchases',
                'visits__bill'
            ).order_by('-created_at')
            
            # Batch fetch related data to avoid N+1 queries
            patient_ids = list(patients.values_list('id', flat=True))
            
            # Get latest visits in bulk
            latest_visits = {}
            for patient_id in patient_ids:
                latest_visit = PatientVisit.objects.filter(
                    patient_id=patient_id
                ).select_related('clinic', 'seen_by').order_by('-created_at').first()
                if latest_visit:
                    latest_visits[patient_id] = latest_visit
            
            # Get latest trials in bulk
            latest_trials = {}
            trial_data = Trial.objects.filter(
                visit__patient_id__in=patient_ids
            ).select_related('device_inventory_id', 'visit__patient').order_by('-created_at')
            
            for trial in trial_data:
                patient_id = trial.visit.patient_id
                if patient_id not in latest_trials:
                    latest_trials[patient_id] = trial
            
            # Get purchase counts in bulk
            purchase_counts = {}
            purchase_data = PatientPurchase.objects.filter(
                patient_id__in=patient_ids
            ).values('patient_id').annotate(count=Count('id'))
            
            for item in purchase_data:
                purchase_counts[item['patient_id']] = item['count']
            
            # Get billing totals in bulk
            billing_totals = {}
            billing_data = Bill.objects.filter(
                visit__patient_id__in=patient_ids,
                payment_status='Paid'
            ).values('visit__patient_id').annotate(total=Sum('final_amount'))
            
            for item in billing_data:
                billing_totals[item['visit__patient_id']] = item['total']
            
            # Build response data efficiently
            patients_data = []
            for patient in patients:
                patient_id = patient.id
                latest_visit = latest_visits.get(patient_id)
                latest_trial = latest_trials.get(patient_id)
                
                patient_data = {
                    'id': patient.id,
                    'name': patient.name,
                    'phone_primary': patient.phone_primary,
                    'phone_secondary': patient.phone_secondary,
                    'city': patient.city,
                    'age': patient.age,
                    'gender': patient.gender,
                    'clinic': patient.clinic.name if patient.clinic else None,
                    'created_at': patient.created_at.strftime('%Y-%m-%d'),
                    'last_updated': patient.updated_at.strftime('%Y-%m-%d'),
                    'total_visits': patient.visits.count(),
                    'total_purchases': purchase_counts.get(patient_id, 0),
                    'total_billed': float(billing_totals.get(patient_id, 0)),
                    'latest_visit': {
                        'date': latest_visit.created_at.strftime('%Y-%m-%d') if latest_visit else None,
                        'type': latest_visit.visit_type if latest_visit else None,
                        'status': latest_visit.status if latest_visit else None,
                        'clinic': latest_visit.clinic.name if latest_visit and latest_visit.clinic else None
                    },
                    'latest_trial': {
                        'device_name': latest_trial.device_inventory_id.product_name if latest_trial and latest_trial.device_inventory_id else None,
                        'status': latest_trial.trial_decision if latest_trial else None,
                        'date': latest_trial.created_at.strftime('%Y-%m-%d') if latest_trial else None
                    }
                }
                patients_data.append(patient_data)

            # Apply pagination
            paginator = self.pagination_class()
            paginated_patients = paginator.paginate_queryset(patients_data, request)
            
            return JsonResponse({
                'status': 'success',
                'count': len(patients_data),
                'patients': paginated_patients,
                'pagination': {
                    'next': paginator.get_next_link(),
                    'previous': paginator.get_previous_link(),
                    'total_pages': paginator.page.paginator.num_pages,
                    'current_page': paginator.page.number,
                    'page_size': paginator.page.paginator.per_page
                }
            })
            
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)