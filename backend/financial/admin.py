from django.contrib import admin
from .models import Wallet, WalletTransaction, HampaQafele, FinancialContribution, ContributionPayment, Expense


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ('user', 'balance', 'updated_at')
    search_fields = ('user__mobile', 'user__first_name', 'user__last_name')
    readonly_fields = ('updated_at',)


@admin.register(WalletTransaction)
class WalletTransactionAdmin(admin.ModelAdmin):
    list_display = ('wallet', 'transaction_type', 'amount', 'status', 'created_at')
    list_filter = ('transaction_type', 'status')
    search_fields = ('wallet__user__mobile', 'wallet__user__first_name')
    readonly_fields = ('created_at',)


@admin.register(HampaQafele)
class HampaQafeleAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'amount', 'payment_type', 'created_at')
    list_filter = ('payment_type',)
    search_fields = ('first_name', 'last_name')


@admin.register(FinancialContribution)
class FinancialContributionAdmin(admin.ModelAdmin):
    list_display = ('title', 'total_amount', 'share_count', 'share_amount', 'start_date', 'end_date', 'is_active', 'is_public')
    list_filter = ('is_active', 'is_public')
    search_fields = ('title',)
    list_editable = ('is_active', 'is_public')
    readonly_fields = ('collected_amount', 'progress_percent')


@admin.register(ContributionPayment)
class ContributionPaymentAdmin(admin.ModelAdmin):
    list_display = ('contribution', 'payer', 'amount', 'created_at')
    search_fields = ('payer__mobile', 'payer__first_name')


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('trip', 'title', 'amount', 'expense_date', 'payer', 'recorder')
    list_filter = ('trip',)
    search_fields = ('title', 'payer__first_name', 'recorder__first_name')