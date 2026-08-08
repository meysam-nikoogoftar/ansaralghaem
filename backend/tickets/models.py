from django.db import models
from accounts.models import User


class Ticket(models.Model):

    PRIORITY_CHOICES = (
        ('low', 'کم'),
        ('medium', 'متوسط'),
        ('high', 'زیاد'),
    )

    STATUS_CHOICES = (
        ('pending', 'در انتظار پاسخ'),
        ('answered', 'پاسخ داده شده'),
        ('closed', 'بسته شده'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tickets', verbose_name='کاربر')
    title = models.CharField(max_length=200, verbose_name='عنوان')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='low', verbose_name='اولویت')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name='وضعیت')
    attachment = models.FileField(upload_to='tickets/', null=True, blank=True, verbose_name='فایل ضمیمه')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'تیکت'
        verbose_name_plural = 'تیکت‌ها'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.full_name} - {self.title}"


class TicketMessage(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='messages', verbose_name='تیکت')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ticket_messages', verbose_name='فرستنده')
    text = models.TextField(verbose_name='متن')
    attachment = models.FileField(upload_to='ticket_messages/', null=True, blank=True, verbose_name='فایل ضمیمه')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'پیام تیکت'
        verbose_name_plural = 'پیام‌های تیکت'
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender.full_name} - {self.ticket.title}"