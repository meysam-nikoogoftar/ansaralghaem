from django.db import models
from accounts.models import User


class Trip(models.Model):

    TRIP_TYPE_CHOICES = (
        ('arbaeen', 'اربعین'),
        ('fatemiyeh', 'فاطمیه'),
        ('mashhad', 'مشهد'),
        ('qom', 'قم'),
        ('other', 'سایر'),
    )

    AUDIENCE_CHOICES = (
        ('public', 'عمومی'),
        ('khadamin', 'خادمین'),
        ('students', 'دانشجویان'),
        ('other', 'سایر'),
    )

    title = models.CharField(max_length=200, verbose_name='عنوان سفر')
    trip_type = models.CharField(max_length=20, choices=TRIP_TYPE_CHOICES, verbose_name='نوع سفر')
    audience = models.CharField(max_length=20, choices=AUDIENCE_CHOICES, default='public', verbose_name='مخصوص')
    start_date = models.DateField(verbose_name='از تاریخ')
    end_date = models.DateField(verbose_name='تا تاریخ')
    cost = models.BigIntegerField(default=0, verbose_name='هزینه ثبت‌نام')
    refund_amount = models.BigIntegerField(default=0, verbose_name='مبلغ عودت وجه')
    refund_description = models.TextField(blank=True, verbose_name='توضیحات عودت وجه')
    conditions = models.TextField(blank=True, verbose_name='شرایط سفر')
    is_active = models.BooleanField(default=False, verbose_name='فعال')
    registration_open = models.BooleanField(default=False, verbose_name='ثبت‌نام باز است')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'سفر'
        verbose_name_plural = 'سفرها'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Registration(models.Model):

    STATUS_CHOICES = (
        ('pending', 'در انتظار بررسی'),
        ('approved', 'تایید شده'),
        ('rejected', 'رد شده'),
        ('cancelled', 'انصراف زائر'),
        ('attended', 'شرکت کرد'),
        ('absent', 'شرکت نکرد'),
    )

    PAYMENT_STATUS_CHOICES = (
        ('unpaid', 'پرداخت نشده'),
        ('partial', 'نیمه‌کامل'),
        ('paid', 'کامل'),
    )

    PAYMENT_METHOD_CHOICES = (
        ('online', 'آنلاین'),
        ('cash', 'نقدی'),
        ('wallet', 'کیف پول'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='registrations', verbose_name='کاربر')
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='registrations', verbose_name='سفر')
    tracking_code = models.CharField(max_length=20, unique=True, verbose_name='کد پیگیری')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name='وضعیت')
    rejection_reason = models.TextField(blank=True, verbose_name='دلیل رد')
    total_cost = models.BigIntegerField(default=0, verbose_name='مبلغ کل سفر')
    paid_from_wallet = models.BigIntegerField(default=0, verbose_name='پرداخت از کیف پول')
    paid_directly = models.BigIntegerField(default=0, verbose_name='پرداخت مستقیم')
    remaining_amount = models.BigIntegerField(default=0, verbose_name='مبلغ باقیمانده')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='unpaid', verbose_name='وضعیت پرداخت')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, blank=True, verbose_name='نحوه پرداخت')
    card_number = models.CharField(max_length=20, blank=True, verbose_name='شماره کارت')
    refund_requested = models.BooleanField(default=False, verbose_name='درخواست عودت وجه')
    refund_status = models.CharField(max_length=20, blank=True, verbose_name='وضعیت عودت وجه')
    admin_note = models.TextField(blank=True, verbose_name='توضیحات ادمین')
    registered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'ثبت‌نام'
        verbose_name_plural = 'ثبت‌نام‌ها'
        ordering = ['-registered_at']

    def __str__(self):
        return f"{self.user.full_name} - {self.trip.title}"

    def save(self, *args, **kwargs):
        if not self.tracking_code:
            import random
            import string
            self.tracking_code = ''.join(random.choices(string.digits, k=8))
        self.remaining_amount = self.total_cost - self.paid_from_wallet - self.paid_directly
        if self.remaining_amount <= 0:
            self.payment_status = 'paid'
        elif self.paid_from_wallet > 0 or self.paid_directly > 0:
            self.payment_status = 'partial'
        else:
            self.payment_status = 'unpaid'
        super().save(*args, **kwargs)


class TravelCompanion(models.Model):
    registration = models.ForeignKey(Registration, on_delete=models.CASCADE, related_name='companions', verbose_name='ثبت‌نام')
    companion = models.ForeignKey(User, on_delete=models.CASCADE, related_name='companion_trips', verbose_name='همسفر')
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'همسفر'
        verbose_name_plural = 'همسفران'
        unique_together = ('registration', 'companion')

    def __str__(self):
        return f"{self.companion.full_name} همسفر {self.registration.user.full_name}"


class AttendancePeriod(models.Model):

    STATUS_CHOICES = (
        ('active', 'در حال اجرا'),
        ('closed', 'بسته شده'),
    )

    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='attendance_periods', verbose_name='سفر')
    title = models.CharField(max_length=200, verbose_name='عنوان دوره')
    datetime = models.DateTimeField(verbose_name='تاریخ و زمان')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', verbose_name='وضعیت')

    class Meta:
        verbose_name = 'دوره حضور و غیاب'
        verbose_name_plural = 'دوره‌های حضور و غیاب'

    def __str__(self):
        return f"{self.trip.title} - {self.title}"


class AttendanceRecord(models.Model):

    METHOD_CHOICES = (
        ('qr', 'QR Code'),
        ('manual', 'دستی'),
    )

    period = models.ForeignKey(AttendancePeriod, on_delete=models.CASCADE, related_name='records', verbose_name='دوره')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendance_records', verbose_name='کاربر')
    is_present = models.BooleanField(default=True, verbose_name='حاضر')
    recorded_at = models.DateTimeField(auto_now_add=True, verbose_name='زمان ثبت')
    method = models.CharField(max_length=10, choices=METHOD_CHOICES, default='manual', verbose_name='نحوه ثبت')

    class Meta:
        verbose_name = 'رکورد حضور'
        verbose_name_plural = 'رکوردهای حضور'
        unique_together = ('period', 'user')

    def __str__(self):
        status = 'حاضر' if self.is_present else 'غایب'
        return f"{self.user.full_name} - {status}"