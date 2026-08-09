from rest_framework import status, generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Wallet, WalletTransaction, HampaQafele, FinancialContribution, ContributionPayment, Expense
from .serializers import (
    WalletSerializer, WalletTransactionSerializer, ChargeWalletSerializer,
    HampaQafeleSerializer, FinancialContributionSerializer,
    ContributionPaymentSerializer, ExpenseSerializer
)


class WalletView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        wallet, created = Wallet.objects.get_or_create(user=request.user)
        serializer = WalletSerializer(wallet)
        return Response(serializer.data)


class WalletTransactionsView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = WalletTransactionSerializer

    def get_queryset(self):
        wallet, created = Wallet.objects.get_or_create(user=self.request.user)
        return WalletTransaction.objects.filter(wallet=wallet)


class ChargeWalletView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChargeWalletSerializer(data=request.data)
        if serializer.is_valid():
            amount = serializer.validated_data['amount']
            description = serializer.validated_data['description']
            wallet, created = Wallet.objects.get_or_create(user=request.user)
            transaction = WalletTransaction.objects.create(
                wallet=wallet,
                transaction_type='charge',
                amount=amount,
                status='pending',
                description=description
            )
            # اینجا در آینده به زرین‌پال وصل می‌شه
            # فعلاً برای تست مستقیم تایید می‌کنیم
            transaction.status = 'success'
            transaction.save()
            wallet.balance += amount
            wallet.save()
            return Response({
                'message': 'کیف پول با موفقیت شارژ شد',
                'balance': wallet.balance,
                'transaction_id': transaction.id
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PayFromWalletView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        from trips.models import Registration
        registration_id = request.data.get('registration_id')
        amount = request.data.get('amount')
        if not registration_id or not amount:
            return Response({'error': 'اطلاعات ناقص است'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            registration = Registration.objects.get(pk=registration_id, user=request.user)
            wallet, created = Wallet.objects.get_or_create(user=request.user)
            amount = int(amount)
            if wallet.balance < amount:
                return Response({'error': 'موجودی کیف پول کافی نیست'}, status=status.HTTP_400_BAD_REQUEST)
            if amount > registration.remaining_amount:
                amount = registration.remaining_amount
            wallet.balance -= amount
            wallet.save()
            registration.paid_from_wallet += amount
            registration.save()
            WalletTransaction.objects.create(
                wallet=wallet,
                transaction_type='trip_payment',
                amount=amount,
                status='success',
                description=f'پرداخت سفر {registration.trip.title}'
            )
            return Response({
                'message': 'پرداخت با موفقیت انجام شد',
                'remaining_amount': registration.remaining_amount,
                'payment_status': registration.payment_status,
                'wallet_balance': wallet.balance
            })
        except Registration.DoesNotExist:
            return Response({'error': 'ثبت‌نام یافت نشد'}, status=status.HTTP_404_NOT_FOUND)


class RefundToWalletView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, registration_id):
        from trips.models import Registration
        try:
            registration = Registration.objects.get(pk=registration_id)
            if not registration.refund_requested:
                return Response({'error': 'درخواست عودت وجه ثبت نشده'}, status=status.HTTP_400_BAD_REQUEST)
            if registration.refund_status == 'done':
                return Response({'error': 'عودت وجه قبلاً انجام شده'}, status=status.HTTP_400_BAD_REQUEST)
            total_paid = registration.paid_from_wallet + registration.paid_directly
            if total_paid <= 0:
                return Response({'error': 'مبلغی برای عودت وجود ندارد'}, status=status.HTTP_400_BAD_REQUEST)
            wallet, created = Wallet.objects.get_or_create(user=registration.user)
            wallet.balance += total_paid
            wallet.save()
            WalletTransaction.objects.create(
                wallet=wallet,
                transaction_type='refund',
                amount=total_paid,
                status='success',
                description=f'عودت وجه سفر {registration.trip.title}'
            )
            registration.refund_status = 'done'
            registration.save()
            return Response({
                'message': f'مبلغ {total_paid} تومان به کیف پول {registration.user.full_name} برگشت داده شد'
            })
        except Registration.DoesNotExist:
            return Response({'error': 'ثبت‌نام یافت نشد'}, status=status.HTTP_404_NOT_FOUND)


class HampaQafeleListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = HampaQafeleSerializer
    queryset = HampaQafele.objects.all()


class HampaQafeleCreateView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = HampaQafeleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FinancialContributionListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = FinancialContributionSerializer

    def get_queryset(self):
        return FinancialContribution.objects.filter(is_active=True, is_public=True)


class FinancialContributionDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = FinancialContributionSerializer
    queryset = FinancialContribution.objects.all()


class ContributionPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ContributionPaymentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(payer=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ExpenseListView(generics.ListAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        trip_id = self.request.query_params.get('trip_id', '')
        if trip_id:
            return Expense.objects.filter(trip_id=trip_id)
        return Expense.objects.all()


class ExpenseCreateView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        serializer = ExpenseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(recorder=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)