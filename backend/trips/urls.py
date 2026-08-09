from django.urls import path
from . import views

urlpatterns = [
    path('', views.TripListView.as_view(), name='trip_list'),
    path('<int:pk>/', views.TripDetailView.as_view(), name='trip_detail'),
    path('register/', views.CreateRegistrationView.as_view(), name='create_registration'),
    path('my-registrations/', views.MyRegistrationsView.as_view(), name='my_registrations'),
    path('track/', views.TrackRegistrationView.as_view(), name='track_registration'),
    path('registration/<int:pk>/', views.RegistrationDetailView.as_view(), name='registration_detail'),
    path('registration/<int:pk>/cancel/', views.CancelRegistrationView.as_view(), name='cancel_registration'),
    path('registration/<int:pk>/add-companion/', views.AddCompanionView.as_view(), name='add_companion'),
    path('attendance/periods/', views.AttendancePeriodListView.as_view(), name='attendance_periods'),
    path('attendance/record/', views.RecordAttendanceView.as_view(), name='record_attendance'),
]