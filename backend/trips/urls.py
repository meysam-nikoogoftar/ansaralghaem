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
    path('registration/<int:pk>/pay-direct/', views.PayDirectRegistrationView.as_view(), name='pay_direct_registration'),
    path('registration/<int:pk>/add-companion/', views.AddCompanionView.as_view(), name='add_companion'),
    path('attendance/periods/', views.AttendancePeriodListView.as_view(), name='attendance_periods'),
    path('attendance/record/', views.RecordAttendanceView.as_view(), name='record_attendance'),

    # پنل ادمین
    path('admin/trips/', views.AdminTripListView.as_view(), name='admin_trip_list'),
    path('admin/trips/<int:pk>/', views.AdminTripDetailView.as_view(), name='admin_trip_detail'),
    path('admin/registrations/', views.AdminRegistrationListView.as_view(), name='admin_registration_list'),
    path('admin/registrations/<int:pk>/action/', views.AdminRegistrationActionView.as_view(), name='admin_registration_action'),
    # این خط‌ها رو به urlpatterns تو backend/trips/urls.py اضافه کن (کنار بقیه‌ی روت‌های admin/):

    path('admin/refunds/', views.AdminRefundListView.as_view(), name='admin_refund_list'),
    path('admin/refunds/<int:pk>/action/', views.AdminRefundActionView.as_view(), name='admin_refund_action'),
    path('admin/registrations/<int:pk>/group-code/', views.AdminSetGroupCodeView.as_view(), name='admin_set_group_code'),
    path('admin/registrations/<int:pk>/companions-network/', views.AdminRegistrationCompanionsNetworkView.as_view(), name='admin_registration_companions_network'),
    path('admin/registrations/bulk-group-code/', views.AdminBulkSetGroupCodeView.as_view(), name='admin_bulk_set_group_code'),
]