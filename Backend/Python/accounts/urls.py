
# ...existing code...
from django.urls import path
from .views import TokenObtainWithClinicView, ClinicListView, RegisterView,ChangePasswordView,RoleListView,ProfileView
from .views import ApproveUserView, RejectUserView, StaffUserList,PendingUserList , RemoveStaffList
urlpatterns = [
    path('users/pending/', PendingUserList.as_view(), name='pending_user_list'),
    path('token/', TokenObtainWithClinicView.as_view(), name='token_obtain_with_clinic'),
    path('clinics/', ClinicListView.as_view(), name='clinic_list'),
        path('roles/', RoleListView.as_view(), name='role_list'),
    path('register/', RegisterView.as_view(), name='register'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('users/<int:user_id>/approve/', ApproveUserView.as_view(), name='approve-user'),
    path('users/<int:user_id>/reject/', RejectUserView.as_view(), name='reject-user'),
    path('users/staff/', StaffUserList.as_view(), name='user_list'),
    path('users/staff/<int:pk>/remove/', RemoveStaffList.as_view(), name='remove-staff')
    ]
