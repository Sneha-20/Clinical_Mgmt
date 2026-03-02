from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import models
from clinical_be.utils.pagination import StandardResultsSetPagination
from .models import PatientVisit, AudiologistCaseHistory, VisitTestPerformed, TestUpload, Trial


class CompletedTestsListView(APIView):
    """Simple list of completed tests for audiologists"""
    pagination_class = StandardResultsSetPagination
    
    def get(self, request):
        try:
            # Get all visits with completed tests (case history + test performed)
            # Use select_related and prefetch_related to optimize queries
            completed_visits = PatientVisit.objects.filter(
                models.Q(patient__case_history__isnull=False) &
                models.Q(visittestperformed__isnull=False),
                seen_by=request.user,
                clinic=request.user.clinic
            ).select_related(
                'patient',
                'patient__case_history'
            ).prefetch_related(
                'visittestperformed_set',
                'visittestperformed_set__testupload_set'
            ).distinct().order_by('-created_at')
            
            # Apply pagination
            paginator = self.pagination_class()
            page = paginator.paginate_queryset(completed_visits, request)
            
            # Pre-fetch all test performed data and test uploads in one query
            visit_ids = [visit.id for visit in page]
            test_performed_map = {}
            test_files_count_map = {}
            
            if visit_ids:
                test_performed_queryset = VisitTestPerformed.objects.filter(
                    visit_id__in=visit_ids
                ).prefetch_related('testupload_set')
                
                for tp in test_performed_queryset:
                    test_performed_map[tp.visit_id] = tp
                    test_files_count_map[tp.visit_id] = tp.testupload_set.count()
            
           
            simple_list = []
            
            for visit in page:
                # Get test performed from pre-fetched map
                test_performed = test_performed_map.get(visit.id)
                
                # Build test types summary efficiently
                test_types = []
                if test_performed:
                    # Use list comprehension for better performance
                    test_mapping = [
                        (test_performed.pta, "PTA"),
                        (test_performed.impedance, "Impedance"),
                        (test_performed.srt_sds, "SRT/SDS"),
                        (test_performed.bera_assr, "BERA/ASSR"),
                        (test_performed.pta_sds, "PTA/SDS"),
                        (test_performed.special_tests, "Special Tests"),
                        (test_performed.impedance_etf, "Impedance/ETF"),
                        (test_performed.bera, "BERA"),
                        (test_performed.assr , "ASSR"),
                        (test_performed.speech_assessment, "Speech Assessment"),
                       
                    ]
                    
                    test_types = [name for flag, name in test_mapping if flag]
                    
                    # if test_performed.other_test:
                    #     test_types.append(test_performed.other_test)
                
                
                simple_list.append({
                    'visit_id': visit.id,
                    'patient_id': visit.patient.id,
                    'patient_name': visit.patient.name,
                    'patient_phone': visit.patient.phone_primary,
                    'appointment_date': visit.appointment_date,
                    'visit_type': visit.visit_type,
                    'present_complaint': visit.present_complaint,
                    'test_performed': test_types,
                    'total_test_performed': len(test_types),
                    'step_process': visit.step_process,
                    'is_test_uploaded': bool(test_files_count_map.get(visit.id, 0)),
                    'is_trial_done': Trial.objects.filter(visit=visit).exists()
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
            
            # # Get case history
            # case_history = AudiologistCaseHistory.objects.filter(patient=visit.patient).first()
            
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
                'impedance': test_performed.impedance,
                'srt_sds': test_performed.srt_sds,
                'bera_assr': test_performed.bera_assr,
                'pta_sds': test_performed.pta_sds,
                'special_tests': test_performed.special_tests,
                'impedance_etf': test_performed.impedance_etf,
                'bera': test_performed.bera,
                'assr': test_performed.assr,
                'speech_assessment': test_performed.speech_assessment
            }
            
            # Build test types list
            test_types = []
            for test_type, performed in test_details.items():
                if performed:
                    test_types.append(test_type.upper().replace('_', '/'))
            # if test_performed.other_test:
            #     test_types.append(test_performed.other_test)
            
            # Build test files details
            files_details = []
            for file in test_files:
                files_details.append({
                    'id': file.id,
                    'file_type': file.report_type,
                    'file_description': file.report_description,
                    'file_url': file.file_path,
                    'file_name': file.file_path.split('/')[-1] if file.file_path else 'Unknown',
                    'created_at': file.created_at,
                    'file_size': 'N/A'  # You could add file size if stored
                })
            
            # Get all visits for this patient (for context)
            # all_patient_visits = PatientVisit.objects.filter(patient=visit.patient).order_by('-created_at')
            # patient_visit_history = []
            
            # for patient_visit in all_patient_visits:
            #     patient_test_performed = VisitTestPerformed.objects.filter(visit=patient_visit).first()
            #     patient_files_count = TestUpload.objects.filter(visit=patient_test_performed).count() if patient_test_performed else 0
                
            #     patient_visit_history.append({
            #         'visit_id': patient_visit.id,
            #         # 'visit_date': patient_visit.created_at,
            #         'appointment_date': patient_visit.appointment_date,
            #         'visit_type': patient_visit.visit_type,
            #         'status': patient_visit.status,
            #         'files_count': patient_files_count,
            #         'is_current_visit': patient_visit.id == visit.id
            #     })
            
            detailed_data = {
                'visit_info': {
                    'visit_id': visit.id,
                    # 'visit_date': visit.created_at,
                    'appointment_date': visit.appointment_date,
                    'visit_type': visit.visit_type,
                    'present_complaint':visit.present_complaint,
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
                    # 'total_visits': all_patient_visits.count()
                },
                # 'case_history': {
                #     'medical_history': case_history.medical_history if case_history else None,
                #     'family_history': case_history.family_history if case_history else None,
                #     'noise_exposure': case_history.noise_exposure if case_history else None,
                #     'previous_ha_experience': case_history.previous_ha_experience if case_history else None,
                #     'red_flags': case_history.red_flags if case_history else None,
                #     # 'created_at': case_history.created_at if case_history else None,
                #     # 'updated_at': case_history.updated_at if case_history else None
                # } if case_history else None,
                'test_performed': {
                    # 'test_details': test_details,
                    'test_requested': test_types,
                    'test_count': len(test_types),
                    # 'created_at': test_performed.created_at
                },
                'test_reports': {
                    'reports': files_details,
                    'files_count': len(files_details),
                    # 'has_files': len(files_details) > 0
                },
                # 'patient_visit_history': patient_visit_history
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
            # Use select_related and prefetch_related to optimize queries
            patient_visits = PatientVisit.objects.filter(
                patient_id=patient_id,
                visittestperformed__isnull=False
            ).select_related(
                'patient',
                'patient__case_history'
            ).prefetch_related(
                'visittestperformed_set',
                'visittestperformed_set__testupload_set'
            ).distinct().order_by('-created_at')
            
            if not patient_visits.exists():
                return Response({
                    'status': status.HTTP_404_NOT_FOUND,
                    'message': 'No test history found for this patient',
                    'data': []
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Pre-fetch case history once
            case_history = AudiologistCaseHistory.objects.filter(
                patient_id=patient_id
            ).first()
            
            patient_history = []
            
            for visit in patient_visits:
                # Get test performed from pre-fetched data
                test_performed = visit.visittestperformed_set.first()
                
                # Get test files from pre-fetched data
                test_files = list(test_performed.testupload_set.all()) if test_performed else []
                
                # Build test types list efficiently
                test_types = []
                if test_performed:
                    # Use list comprehension for better performance
                    test_mapping = [
                        (test_performed.pta, "PTA"),
                        (test_performed.impedance, "Impedance"),
                        (test_performed.srt_sds, "SRT/SDS"),
                        (test_performed.bera_assr, "BERA/ASSR"),
                        (test_performed.pta_sds, "PTA/SDS"),
                        (test_performed.special_tests, "Special Tests"),
                        (test_performed.impedance_etf, "Impedance/ETF"),
                        (test_performed.bera, "BERA"),
                        (test_performed.assr , "ASSR"),
                        (test_performed.speech_assessment, "Speech Assessment"),
                    ]
                    
                    test_types = [name for flag, name in test_mapping if flag]
                    
                    if test_performed.other_test:
                        test_types.append(test_performed.other_test)
                
                patient_history.append({
                    'visit_id': visit.id,
                    'patient_name': visit.patient.name,
                    'patient_phone': visit.patient.phone_primary,
                    'appointment_date': visit.appointment_date,
                    'visit_type': visit.visit_type,
                    'present_complaint': visit.present_complaint,
                    'status': visit.status,
                    'test_performed': test_types,
                    'total_test_peformed': len(test_types),
                    'total_test_result': len(test_files),
                    'test_results_files': [
                        {
                            'test_type': file.report_type,
                            'report_description': file.report_description,
                            'report_url': file.file_path,
                        } for file in test_files
                    ],
                    'case_history_summary': {
                        'has_medical_history': case_history.medical_history if case_history else None,
                        'has_family_history': case_history.family_history if case_history else None,
                        'has_noise_exposure': case_history.noise_exposure if case_history else None,
                        'has_previous_ha': case_history.previous_ha_experience if case_history else None,
                        'has_red_flags': case_history.red_flags if case_history else None
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
