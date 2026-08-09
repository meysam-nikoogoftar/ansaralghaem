from rest_framework import serializers
from .models import Wallet, WalletTransaction, HampaQafele, FinancialContribution, ContributionPayment, Expense


class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = ('id', 'balance', 'updated_at')


class WalletTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WalletTransaction
        fields = '__all__'
        read_only_fields = ('wallet', 'status', 'created_at')


class ChargeWalletSerializer(serializers.Serializer):
    amount = serializers.IntegerField(min_value=1000)
    description = serializers.CharField(required=False, default='شارژ کیف پول')


class HampaQafeleSerializer(serializers.ModelSerializer):
    class Meta:
        model = HampaQafele
        fields = '__all__'


class FinancialContributionSerializer(serializers.ModelSerializer):
    collected_amount = serializers.ReadOnlyField()
    progress_percent = serializers.ReadOnlyField()

    class Meta:
        model = FinancialContribution
        fields = '__all__'


class ContributionPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContributionPayment
        fields = '__all__'
        read_only_fields = ('payer', 'created_at')


class ExpenseSerializer(serializers.ModelSerializer):
    payer_name = serializers.CharField(source='payer.full_name', read_only=True)
    recorder_name = serializers.CharField(source='recorder.full_name', read_only=True)
    trip_title = serializers.CharField(source='trip.title', read_only=True)

    class Meta:
        model = Expense
        fields = '__all__'
        read_only_fields = ('recorder', 'created_at')