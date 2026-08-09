from django.urls import path
from . import views

urlpatterns = [
    path('wallet/', views.WalletView.as_view(), name='wallet'),
    path('wallet/transactions/', views.WalletTransactionsView.as_view(), name='wallet_transactions'),
    path('wallet/charge/', views.ChargeWalletView.as_view(), name='charge_wallet'),
    path('wallet/pay/', views.PayFromWalletView.as_view(), name='pay_from_wallet'),
    path('wallet/refund/<int:registration_id>/', views.RefundToWalletView.as_view(), name='refund_to_wallet'),
    path('hampa-qafele/', views.HampaQafeleListView.as_view(), name='hampa_qafele_list'),
    path('hampa-qafele/create/', views.HampaQafeleCreateView.as_view(), name='hampa_qafele_create'),
    path('contributions/', views.FinancialContributionListView.as_view(), name='contribution_list'),
    path('contributions/<int:pk>/', views.FinancialContributionDetailView.as_view(), name='contribution_detail'),
    path('contributions/pay/', views.ContributionPaymentView.as_view(), name='contribution_pay'),
    path('expenses/', views.ExpenseListView.as_view(), name='expense_list'),
    path('expenses/create/', views.ExpenseCreateView.as_view(), name='expense_create'),
]