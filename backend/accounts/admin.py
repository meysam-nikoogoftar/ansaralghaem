from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('mobile', 'first_name', 'last_name', 'user_type', 'status', 'date_joined')
    list_filter = ('user_type', 'status', 'gender')
    search_fields = ('mobile', 'first_name', 'last_name', 'national_code')
    ordering = ('-date_joined',)

    fieldsets = (
        ('اطلاعات حساب', {'fields': ('mobile', 'password', 'user_type', 'status')}),
        ('اطلاعات هویتی', {'fields': ('first_name', 'last_name', 'father_name', 'first_name_en', 'last_name_en', 'national_code', 'birth_date', 'gender', 'marital_status', 'nationality')}),
        ('اطلاعات تماس', {'fields': ('phone', 'address', 'emergency_name', 'emergency_phone', 'emergency_relation')}),
        ('اطلاعات دانشگاهی', {'fields': ('university', 'education_level', 'student_status')}),
        ('اطلاعات گذرنامه', {'fields': ('passport_number', 'passport_expiry')}),
        ('اطلاعات بهداشتی', {'fields': ('has_disease', 'disease_description', 'has_asthma', 'has_allergy', 'allergy_description')}),
        ('اطلاعات نظامی', {'fields': ('military_status',)}),
        ('سرپرست', {'fields': ('guardian_national_code',)}),
        ('تصاویر', {'fields': ('profile_image', 'national_card_image', 'student_card_image', 'commitment_form', 'passport_image')}),
        ('دسترسی‌ها', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('mobile', 'password1', 'password2', 'first_name', 'last_name', 'user_type'),
        }),
    )