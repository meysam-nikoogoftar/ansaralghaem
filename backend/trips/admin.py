from django.contrib import admin
from .models import Trip, Registration, TravelCompanion, AttendancePeriod, AttendanceRecord


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ('title', 'trip_type', 'audience', 'start_date', 'end_date', 'cost', 'is_active', 'registration_open')
    list_filter = ('trip_type', 'audience', 'is_active', 'registration_open')
    search_fields = ('title',)
    list_editable = ('is_active', 'registration_open')


@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    list_display = ('user', 'trip', 'tracking_code', 'status', 'payment_status', 'total_cost', 'remaining_amount', 'registered_at')
    list_filter = ('status', 'payment_status', 'trip')
    search_fields = ('user__mobile', 'user__first_name', 'user__last_name', 'tracking_code')
    readonly_fields = ('tracking_code', 'remaining_amount', 'payment_status')


@admin.register(TravelCompanion)
class TravelCompanionAdmin(admin.ModelAdmin):
    list_display = ('registration', 'companion', 'added_at')
    search_fields = ('companion__mobile', 'companion__first_name', 'companion__last_name')


@admin.register(AttendancePeriod)
class AttendancePeriodAdmin(admin.ModelAdmin):
    list_display = ('trip', 'title', 'datetime', 'status')
    list_filter = ('status', 'trip')


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ('user', 'period', 'is_present', 'method', 'recorded_at')
    list_filter = ('is_present', 'method', 'period')
    search_fields = ('user__mobile', 'user__first_name', 'user__last_name')