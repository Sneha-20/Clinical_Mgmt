
# ...existing code...
from django.urls import path
from .views import TokenObtainWithClinicView, ClinicListView, RegisterView

urlpatterns = [
    path('token/', TokenObtainWithClinicView.as_view(), name='token_obtain_with_clinic'),
    path('clinics/', ClinicListView.as_view(), name='clinic_list'),
    path('register/', RegisterView.as_view(), name='register'),

]
# ...existing code...