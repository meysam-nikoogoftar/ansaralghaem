from django.db import models
from accounts.models import User
from trips.models import Trip


class Wallet(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wallet', verbose_name='کاربر')
    balance = models.BigIntegerField(default=0, verbose_name='موجودی')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='آخرین بروزرسانی')

    class Meta:
        verbose_name = 'کیف پول'
        verbose_name_plural = 'کیف پول‌ها'

    def __str__(self):
        return f"کیف پول {self.user.full_name} - {self.balance} تومان"


class WalletTransaction(models.Model):

    TYPE_CHOICES = (
        ('charge', 'شارژ'),
        ('withdraw', 'برداشت'),
        ('trip_payment', 'پرداخت سفر'),
        ('refund', 'عودت وجه'),
    )

    STATUS_CHOICES = (
        ('success', 'موفق'),
        ('failed', 'ناموفق'),
        ('pending', 'در انتظار'),
    )

    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='transactions', verbose_name='کیف پول')
    transaction_type = models.CharField(max_length=20, choices=TYPE_CHOICES, verbose_name='نوع تراکنش')
    amount = models.BigIntegerField(verbose_name='مبلغ')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name='وضعیت')
    tracking_code = models.CharField(max_length=50, blank=True, verbose_name='شماره پیگیری')
    description = models.TextField(blank=True, verbose_name='توضیحات')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'تراکنش کیف پول'
        verbose_name_plural = 'تراکنش‌های کیف پول'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.wallet.user.full_name} - {self.transaction_type} - {self.amount}"


class HampaQafele(models.Model):

    PAYMENT_TYPE_CHOICES = (
        ('online', 'اینترنتی'),
        ('cash', 'نقدی'),
    )

    first_name = models.CharField(max_length=100, blank=True, verbose_name='نام')
    last_name = models.CharField(max_length=100, blank=True, verbose_name='نام خانوادگی')
    amount = models.BigIntegerField(verbose_name='مبلغ واریزی')
    payment_type = models.CharField(max_length=10, choices=PAYMENT_TYPE_CHOICES, default='online', verbose_name='نوع واریز')
    description = models.TextField(blank=True, verbose_name='توضیحات/سفارش خاص')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'همپای قافله'
        verbose_name_plural = 'همپای قافله'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.amount}"


class FinancialContribution(models.Model):

    title = models.CharField(max_length=200, verbose_name='عنوان')
    image = models.ImageField(upload_to='contributions/', null=True, blank=True, verbose_name='تصویر')
    total_amount = models.BigIntegerField(verbose_name='کل مبلغ مورد نیاز')
    share_count = models.IntegerField(verbose_name='تعداد سهم')
    share_amount = models.BigIntegerField(verbose_name='مبلغ هر سهم')
    start_date = models.DateField(verbose_name='از تاریخ')
    end_date = models.DateField(verbose_name='تا تاریخ')
    is_active = models.BooleanField(default=True, verbose_name='فعال')
    is_public = models.BooleanField(default=True, verbose_name='نمایش عمومی')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'مشارکت مالی'
        verbose_name_plural = 'مشارکت‌های مالی'
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    @property
    def collected_amount(self):
        return self.payments.aggregate(
            total=models.Sum('amount')
        )['total'] or 0

    @property
    def progress_percent(self):
        if self.total_amount == 0:
            return 0
        return min(int((self.collected_amount / self.total_amount) * 100), 100)


class ContributionPayment(models.Model):
    contribution = models.ForeignKey(FinancialContribution, on_delete=models.CASCADE, related_name='payments', verbose_name='مشارکت مالی')
    payer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='contribution_payments', verbose_name='پرداخت‌کننده')
    amount = models.BigIntegerField(verbose_name='مبلغ')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'پرداخت مشارکت'
        verbose_name_plural = 'پرداخت‌های مشارکت'

    def __str__(self):
        return f"{self.contribution.title} - {self.amount}"


class Expense(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='expenses', verbose_name='سفر')
    title = models.CharField(max_length=200, verbose_name='عنوان هزینه')
    amount = models.BigIntegerField(verbose_name='مبلغ')
    expense_date = models.DateField(verbose_name='تاریخ واریز')
    payer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='paid_expenses', verbose_name='هزینه‌کننده')
    recorder = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='recorded_expenses', verbose_name='ثبت‌کننده')
    document = models.FileField(upload_to='expense_docs/', null=True, blank=True, verbose_name='سند')
    description = models.TextField(blank=True, verbose_name='توضیحات')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'ریزهزینه'
        verbose_name_plural = 'ریزهزینه‌ها'
        ordering = ['-expense_date']

    def __str__(self):
        return f"{self.trip.title} - {self.title} - {self.amount}"