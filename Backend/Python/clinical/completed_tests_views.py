from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import models
from clinical_be.utils.pagination import StandardResultsSetPagination
from .models import PatientVisit, AudiologistCaseHistory, VisitTestPerformed, TestUpload


class CompletedTestsListView(APIView):
    """Simple list of completed tests for audiologists"""
    pagination_class = StandardResultsSetPagination
    
    def get(self, request):
        try:
            # Get all visits with completed tests (case history + test performed)
            completed_visits = PatientVisit.objects.filter(
                models.Q(patient__case_history__isnull=False) &
                models.Q(visittestperformed__isnull=False)
            ).distinct().order_by('-created_at')
            
            # Apply pagination
            paginator = self.pagination_class()
            page = paginator.paginate_queryset(completed_visits, request)
            
            simple_list = []
            
            for visit in page:
                # Get case history
                case_history = AudiologistCaseHistory.objects.filter(patient=visit.patient).first()
                
                # Get test performed
                test_performed = VisitTestPerformed.objects.filter(visit=visit).first()
                
                # Get test files count
                test_files_count = TestUpload.objects.filter(visit=test_performed).count() if test_performed else 0
                
                # Build test types summary
                test_types = []
                if test_performed:
                    if test_performed.pta: test_types.append("PTA")
                    if test_performed.immittance: test_types.append("Immittance")
                    if test_performed.oae: test_types.append("OAE")
                    if test_performed.bera_assr: test_types.append("BERA/ASSR")
                    if test_performed.srt: test_types.append("SRT")
                    if test_performed.sds: test_types.append("SDS")
                    if test_performed.ucl: test_types.append("UCL")
                    if test_performed.free_field: test_types.append("Free Field")
                    if test_performed.other_test: test_types.append(test_performed.other_test)
                
                # Count total visits for this patient
                total_visits = PatientVisit.objects.filter(patient=visit.patient).count()
                
                simple_list.append({
                    'visit_id': visit.id,
                    'patient_id': visit.patient.id,
                    'patient_name': visit.patient.name,
                    'patient_phone': visit.patient.phone_primary,
                    'visit_date': visit.created_at,
                    'appointment_date': visit.appointment_date,
                    # 'visit_type': visit.visit_type,
                    'test_types': test_types,
                    'test_count': len(test_types),
                    # 'files_count': test_files_count,
                    'total_patient_visits': total_visits,
                    'is_repeat_visit': total_visits > 1,
                    # 'case_history_complete': case_history is not None,
                    # 'files_uploaded': test_files_count > 0
                })
            
            return paginator.get_paginated_response(simple_list)
            
        except Exception as e:
            return Response({
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': f'Error retrieving completed tests: {str(e)}',
                'data': []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CompletedTestDetailView(APIView):
    """Detailed summary view for a specific completed test"""
    
    def get(self, request, visit_id):
        try:
            # Get the specific visit
            visit = PatientVisit.objects.get(id=visit_id)
            
            # Get case history
            case_history = AudiologistCaseHistory.objects.filter(patient=visit.patient).first()
            
            # Get test performed
            test_performed = VisitTestPerformed.objects.filter(visit=visit).first()
            
            if not test_performed:
                return Response({
                    'status': status.HTTP_404_NOT_FOUND,
                    'message': 'No test performed found for this visit',
                    'data': None
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Get test files
            test_files = TestUpload.objects.filter(visit=test_performed)
            
            # Build detailed test types with flags
            test_details = {
                'pta': test_performed.pta,
                'immittance': test_performed.immittance,
                'oae': test_performed.oae,
                'bera_assr': test_performed.bera_assr,
                'srt': test_performed.srt,
                'sds': test_performed.sds,
                'ucl': test_performed.ucl,
                'free_field': test_performed.free_field,
                'other_test': test_performed.other_test
            }
            
            # Build test types list
            test_types = []
            for test_type, performed in test_details.items():
                if performed and test_type != 'other_test':
                    test_types.append(test_type.upper().replace('_', '/'))
            if test_performed.other_test:
                test_types.append(test_performed.other_test)
            
            # Build test files details
            files_details = []
            for file in test_files:
                files_details.append({
                    'id': file.id,
                    'file_type': file.file_type,
                    'file_url': file.file_path,
                    'file_name': file.file_path.split('/')[-1] if file.file_path else 'Unknown',
                    'created_at': file.created_at,
                    'file_size': 'N/A'  # You could add file size if stored
                })
            
            # Get all visits for this patient (for context)
            all_patient_visits = PatientVisit.objects.filter(patient=visit.patient).order_by('-created_at')
            patient_visit_history = []
            
            for patient_visit in all_patient_visits:
                patient_test_performed = VisitTestPerformed.objects.filter(visit=patient_visit).first()
                patient_files_count = TestUpload.objects.filter(visit=patient_test_performed).count() if patient_test_performed else 0
                
                patient_visit_history.append({
                    'visit_id': patient_visit.id,
                    # 'visit_date': patient_visit.created_at,
                    'appointment_date': patient_visit.appointment_date,
                    'visit_type': patient_visit.visit_type,
                    'status': patient_visit.status,
                    'files_count': patient_files_count,
                    'is_current_visit': patient_visit.id == visit.id
                })
            
            detailed_data = {
                'visit_info': {
                    'visit_id': visit.id,
                    # 'visit_date': visit.created_at,
                    'appointment_date': visit.appointment_date,
                    'visit_type': visit.visit_type,
                    'status': visit.status,
                    'service_type': visit.service_type
                },
                'patient_info': {
                    'patient_id': visit.patient.id,
                    'patient_name': visit.patient.name,
                    'patient_phone': visit.patient.phone_primary,
                    'patient_email': visit.patient.email,
                    'patient_age': visit.patient.age,
                    'patient_gender': visit.patient.gender,
                    'total_visits': all_patient_visits.count()
                },
                'case_history': {
                    'medical_history': case_history.medical_history if case_history else None,
                    'family_history': case_history.family_history if case_history else None,
                    'noise_exposure': case_history.noise_exposure if case_history else None,
                    'previous_ha_experience': case_history.previous_ha_experience if case_history else None,
                    'red_flags': case_history.red_flags if case_history else None,
                    # 'created_at': case_history.created_at if case_history else None,
                    # 'updated_at': case_history.updated_at if case_history else None
                } if case_history else None,
                'test_performed': {
                    # 'test_details': test_details,
                    'test_requested': test_types,
                    'test_count': len(test_types),
                    # 'created_at': test_performed.created_at
                },
                'test_files': {
                    'files': files_details,
                    'files_count': len(files_details),
                    'has_files': len(files_details) > 0
                },
                'patient_visit_history': patient_visit_history
            }
            
            return Response({
                'status': status.HTTP_200_OK,
                # 'message': 'Test details retrieved successfully',
                'data': detailed_data
            }, status=status.HTTP_200_OK)
            
        except PatientVisit.DoesNotExist:
            return Response({
                'status': status.HTTP_404_NOT_FOUND,
                'message': 'Visit not found',
                'data': None
            }, status=status.HTTP_404_NOT_FOUND)
            
        except Exception as e:
            return Response({
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': f'Error retrieving test details: {str(e)}',
                'data': None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PatientTestHistoryView(APIView):
    """All test history for a specific patient"""
    
    def get(self, request, patient_id):
        try:
            # Get all visits for this patient with tests
            patient_visits = PatientVisit.objects.filter(
                patient_id=patient_id,
                visittestperformed__isnull=False
            ).distinct().order_by('-created_at')
            
            if not patient_visits.exists():
                return Response({
                    'status': status.HTTP_404_NOT_FOUND,
                    'message': 'No test history found for this patient',
                    'data': []
                }, status=status.HTTP_404_NOT_FOUND)
            
            patient_history = []
            
            for visit in patient_visits:
                # Get case history
                case_history = AudiologistCaseHistory.objects.filter(patient=visit.patient).first()
                
                # Get test performed
                test_performed = VisitTestPerformed.objects.filter(visit=visit).first()
                
                # Get test files
                test_files = TestUpload.objects.filter(visit=test_performed) if test_performed else []
                
                # Build test types list
                test_types = []
                if test_performed:
                    if test_performed.pta: test_types.append("PTA")
                    if test_performed.immittance: test_types.append("Immittance")
                    if test_performed.oae: test_types.append("OAE")
                    if test_performed.bera_assr: test_types.append("BERA/ASSR")
                    if test_performed.srt: test_types.append("SRT")
                    if test_performed.sds: test_types.append("SDS")
                    if test_performed.ucl: test_types.append("UCL")
                    if test_performed.free_field: test_types.append("Free Field")
                    if test_performed.other_test: test_types.append(test_performed.other_test)
                
                patient_history.append({
                    'visit_id': visit.id,
                    # 'visit_date': visit.created_at,
                    'appointment_date': visit.appointment_date,
                    'visit_type': visit.visit_type,
                    'status': visit.status,
                    'test_types': test_types,
                    'test_count': len(test_types),
                    'files_count': len(test_files),
                    'files': [
                        {
                            'file_type': file.file_type,
                            'file_url': file.file_path,
                            # 'created_at': file.created_at
                        } for file in test_files
                    ],
                    'case_history_summary': {
                        'has_medical_history': bool(case_history.medical_history if case_history else ''),
                        'has_family_history': bool(case_history.family_history if case_history else ''),
                        'has_noise_exposure': bool(case_history.noise_exposure if case_history else ''),
                        'has_previous_ha': bool(case_history.previous_ha_experience if case_history else ''),
                        'has_red_flags': bool(case_history.red_flags if case_history else '')
                    } if case_history else None
                })
            
            return Response({
                'status': status.HTTP_200_OK,
                'total_visits': len(patient_history),
                'data': patient_history,
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': f'Error retrieving patient history: {str(e)}',
                'data': []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
