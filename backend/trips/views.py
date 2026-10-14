from rest_framework import status, generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from accounts.permissions import IsAdminOrSuperAdmin, HasAdminPermission
from .models import Trip, Registration, TravelCompanion, AttendancePeriod, AttendanceRecord
from .serializers import (
    TripSerializer, RegistrationSerializer, CreateRegistrationSerializer,
    TravelCompanionSerializer, AttendancePeriodSerializer, AttendanceRecordSerializer
)


class TripListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = TripSerializer

    def get_queryset(self):
        queryset = Trip.objects.filter(is_active=True)
        trip_type = self.request.query_params.get('type', '')
        if trip_type:
            queryset = queryset.filter(trip_type=trip_type)
        return queryset


class TripDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = TripSerializer
    queryset = Trip.objects.all()


class CreateRegistrationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CreateRegistrationSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            registration = serializer.save()
            return Response(
                RegistrationSerializer(registration).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyRegistrationsView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = RegistrationSerializer

    def get_queryset(self):
        return Registration.objects.filter(user=self.request.user)


class TrackRegistrationView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        tracking_code = request.query_params.get('tracking_code', '')
        national_code = request.query_params.get('national_code', '')
        if not tracking_code or not national_code:
            return Response(
                {'error': 'کد پیگیری و کد ملی الزامی است'},
                status=status.HTTP_400_BAD_REQUEST
            )
        registration = Registration.objects.filter(
            tracking_code=tracking_code,
            user__national_code=national_code
        ).order_by('-registered_at').first()
        if not registration:
            return Response(
                {'error': 'ثبت‌نامی با این مشخصات یافت نشد'},
                status=status.HTTP_404_NOT_FOUND
            )
        return Response(RegistrationSerializer(registration).data)


class RegistrationDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = RegistrationSerializer

    def get_queryset(self):
        return Registration.objects.filter(user=self.request.user)


class CancelRegistrationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            registration = Registration.objects.get(pk=pk, user=request.user)
            if registration.status in ['cancelled', 'attended']:
                return Response(
                    {'error': 'امکان انصراف وجود ندارد'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            registration.status = 'cancelled'
            registration.refund_requested = True
            registration.refund_status = 'pending'
            registration.save()
            return Response({'message': 'انصراف با موفقیت ثبت شد. عودت وجه پس از تایید ادمین انجام می‌شود'})
        except Registration.DoesNotExist:
            return Response({'error': 'ثبت‌نام یافت نشد'}, status=status.HTTP_404_NOT_FOUND)

class RequestRefundView(APIView):
    """
    درخواست عودت وجه برای یک ثبت‌نامِ رد‌شده (بدون اینکه انصراف محسوب بشه).
    body: { "amount": عدد }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            registration = Registration.objects.get(pk=pk, user=request.user)
        except Registration.DoesNotExist:
            return Response({'error': 'ثبت‌نام یافت نشد'}, status=status.HTTP_404_NOT_FOUND)

        if registration.status != 'rejected':
            return Response({'error': 'درخواست عودت فقط برای ثبت‌نام رد‌شده امکان‌پذیر است'}, status=status.HTTP_400_BAD_REQUEST)

        if registration.refund_requested:
            return Response({'error': 'قبلاً درخواست عودت ثبت شده است'}, status=status.HTTP_400_BAD_REQUEST)

        total_paid = registration.paid_from_wallet + registration.paid_directly
        if total_paid <= 0:
            return Response({'error': 'مبلغی برای عودت پرداخت نشده است'}, status=status.HTTP_400_BAD_REQUEST)

        amount = request.data.get('amount')
        try:
            amount = int(amount)
        except (TypeError, ValueError):
            return Response({'error': 'مبلغ نامعتبر است'}, status=status.HTTP_400_BAD_REQUEST)

        if amount <= 0 or amount > total_paid:
            return Response({'error': 'مبلغ نامعتبر است'}, status=status.HTTP_400_BAD_REQUEST)

        registration.refund_requested = True
        registration.refund_status = 'pending'
        registration.requested_refund_amount = amount
        registration.save()
        return Response(RegistrationSerializer(registration).data)

class AddCompanionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        from accounts.models import User
        try:
            registration = Registration.objects.get(pk=pk, user=request.user)
            national_code = request.data.get('national_code')
            if not national_code:
                return Response({'error': 'کد ملی الزامی است'}, status=status.HTTP_400_BAD_REQUEST)
            try:
                companion = User.objects.get(national_code=national_code)
                if companion == request.user:
                    return Response({'error': 'نمی‌توانید خودتان را اضافه کنید'}, status=status.HTTP_400_BAD_REQUEST)
                travel_companion, created = TravelCompanion.objects.get_or_create(
                    registration=registration,
                    companion=companion
                )
                if not created:
                    return Response({'error': 'این کاربر قبلاً اضافه شده'}, status=status.HTTP_400_BAD_REQUEST)
                return Response(TravelCompanionSerializer(travel_companion).data, status=status.HTTP_201_CREATED)
            except User.DoesNotExist:
                return Response({'error': 'کاربری با این کد ملی یافت نشد'}, status=status.HTTP_404_NOT_FOUND)
        except Registration.DoesNotExist:
            return Response({'error': 'ثبت‌نام یافت نشد'}, status=status.HTTP_404_NOT_FOUND)


class AttendancePeriodListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AttendancePeriodSerializer

    def get_queryset(self):
        trip_id = self.request.query_params.get('trip_id', '')
        if trip_id:
            return AttendancePeriod.objects.filter(trip_id=trip_id)
        return AttendancePeriod.objects.all()


class RecordAttendanceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        period_id = request.data.get('period_id')
        national_code = request.data.get('national_code')
        if not period_id or not national_code:
            return Response({'error': 'اطلاعات ناقص است'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            from accounts.models import User
            period = AttendancePeriod.objects.get(pk=period_id, status='active')
            user = User.objects.get(national_code=national_code)
            record, created = AttendanceRecord.objects.get_or_create(
                period=period,
                user=user,
                defaults={'is_present': True, 'method': 'qr'}
            )
            if not created:
                return Response({'error': 'حضور این کاربر قبلاً ثبت شده'}, status=status.HTTP_400_BAD_REQUEST)
            return Response(AttendanceRecordSerializer(record).data, status=status.HTTP_201_CREATED)
        except AttendancePeriod.DoesNotExist:
            return Response({'error': 'دوره یافت نشد یا بسته شده'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ============ پنل ادمین ============

class AdminTripListView(generics.ListCreateAPIView):
    """لیست همه‌ی سفرها (فعال و غیرفعال) + ایجاد سفر جدید."""
    permission_classes = [HasAdminPermission('perm_trips')]
    serializer_class = TripSerializer
    queryset = Trip.objects.all()


class AdminTripDetailView(generics.RetrieveUpdateDestroyAPIView):
    """ویرایش/حذف یک سفر."""
    permission_classes = [HasAdminPermission('perm_trips')]
    serializer_class = TripSerializer
    queryset = Trip.objects.all()


class AdminRegistrationListView(generics.ListAPIView):
    """لیست همه‌ی ثبت‌نام‌ها (همه‌ی کاربران) با فیلتر و جستجو."""
    permission_classes = [HasAdminPermission('perm_registrations')]
    serializer_class = RegistrationSerializer

    def get_queryset(self):
        queryset = Registration.objects.select_related('user', 'trip').order_by('-registered_at')
        status_param = self.request.query_params.get('status', '')
        trip_id = self.request.query_params.get('trip_id', '')
        search = self.request.query_params.get('search', '')
        gender = self.request.query_params.get('gender', '')
        education_level = self.request.query_params.get('education_level', '')
        nationality = self.request.query_params.get('nationality', '')
        payment_method = self.request.query_params.get('payment_method', '')
        refund_status = self.request.query_params.get('refund_status', '')
        student_status = self.request.query_params.get('student_status', '')
        university = self.request.query_params.get('university', '')
        group_code = self.request.query_params.get('group_code', '')
        first_name = self.request.query_params.get('first_name', '')
        last_name = self.request.query_params.get('last_name', '')
        national_code = self.request.query_params.get('national_code', '')
        mobile = self.request.query_params.get('mobile', '')

        if status_param == '__blank__':
            queryset = queryset.filter(status='')
        elif status_param:
            queryset = queryset.filter(status=status_param)
        if trip_id:
            queryset = queryset.filter(trip_id=trip_id)
        if search:
            queryset = queryset.filter(
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(user__mobile__icontains=search) |
                Q(user__national_code__icontains=search) |
                Q(tracking_code__icontains=search)
            )
        if gender:
            queryset = queryset.filter(user__gender=gender)
        if education_level:
            queryset = queryset.filter(user__education_level=education_level)
        if nationality:
            queryset = queryset.filter(user__nationality__icontains=nationality)
        if payment_method:
            queryset = queryset.filter(payment_method=payment_method)
        if refund_status == '__none__':
            queryset = queryset.filter(refund_status='')
        elif refund_status:
            queryset = queryset.filter(refund_status=refund_status)
        if student_status:
            queryset = queryset.filter(user__student_status=student_status)
        if university:
            queryset = queryset.filter(user__university__icontains=university)
        if group_code:
            queryset = queryset.filter(group_code__icontains=group_code)
        if first_name:
            queryset = queryset.filter(user__first_name__icontains=first_name)
        if last_name:
            queryset = queryset.filter(user__last_name__icontains=last_name)
        if national_code:
            queryset = queryset.filter(user__national_code__icontains=national_code)
        if mobile:
            queryset = queryset.filter(user__mobile__icontains=mobile)


        return queryset


class AdminRegistrationActionView(APIView):
    """تایید/رد/علامت‌گذاری «در دست بررسی» یک ثبت‌نام. body: {action: 'approve'|'reject'|'mark_pending', rejection_reason?, admin_note?}"""
    permission_classes = [HasAdminPermission('perm_registrations')]

    def post(self, request, pk):
        try:
            registration = Registration.objects.get(pk=pk)
        except Registration.DoesNotExist:
            return Response({'error': 'ثبت‌نام یافت نشد'}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action')
        if action == 'approve':
            registration.status = 'approved'
            registration.rejection_reason = ''
        elif action == 'reject':
            registration.status = 'rejected'
            registration.rejection_reason = request.data.get('rejection_reason', '')
        elif action == 'mark_pending':
            registration.status = 'pending'
        elif action == 'reset':
            registration.status = ''
            registration.rejection_reason = ''
        elif action == 'set_note':
            registration.admin_note = request.data.get('admin_note', '')
            registration.save()
            return Response(RegistrationSerializer(registration).data)
        else:
            return Response({'error': 'عملیات نامعتبر است'}, status=status.HTTP_400_BAD_REQUEST)

        admin_note = request.data.get('admin_note')
        if admin_note is not None:
            registration.admin_note = admin_note

        registration.save()
        return Response(RegistrationSerializer(registration).data)


class AdminRefundListView(generics.ListAPIView):
    """لیست درخواست‌های عودت وجه (از انصراف سفر) — شامل تاریخچه‌ی کامل، نه فقط در انتظار."""
    permission_classes = [HasAdminPermission('perm_financial')]
    serializer_class = RegistrationSerializer

    def get_queryset(self):
        return Registration.objects.filter(
            refund_requested=True
        ).select_related('user', 'trip').order_by('-registered_at')


class AdminRefundActionView(APIView):
    """
    تایید یا رد یک درخواست عودت وجه.
    body: { "action": "approve" | "reject", "amount"?: عدد اختیاری برای override مبلغ }
    در حالت تایید، مبلغ به کیف‌پول کاربر اضافه می‌شود و یک تراکنش موفق ثبت می‌شود.
    """
    permission_classes = [HasAdminPermission('perm_financial')]

    def post(self, request, pk):
        from financial.models import Wallet, WalletTransaction
        try:
            registration = Registration.objects.get(pk=pk, refund_requested=True)
        except Registration.DoesNotExist:
            return Response({'error': 'درخواست عودتی با این مشخصات یافت نشد'}, status=status.HTTP_404_NOT_FOUND)

        if registration.refund_status in ('approved', 'rejected'):
            return Response(
                {'error': 'این درخواست قبلاً بررسی شده و نمی‌توان دوباره روی آن اقدام کرد'},
                status=status.HTTP_400_BAD_REQUEST
            )

        action = request.data.get('action')
        if action == 'approve':
            amount = request.data.get('amount')
            try:
                if amount not in (None, ''):
                    amount = int(amount)
                elif registration.requested_refund_amount:
                    amount = registration.requested_refund_amount
                else:
                    amount = int(registration.trip.refund_amount or 0)
            except (TypeError, ValueError):
                amount = 0

            wallet, _ = Wallet.objects.get_or_create(user=registration.user)
            wallet.balance = wallet.balance + amount
            wallet.save()

            WalletTransaction.objects.create(
                wallet=wallet,
                transaction_type='refund',
                amount=amount,
                status='success',
                description=f'عودت وجه سفر «{registration.trip.title}» (کد پیگیری {registration.tracking_code})'
            )

            registration.refund_status = 'approved'
            registration.save()
            return Response(RegistrationSerializer(registration).data)

        elif action == 'reject':
            registration.refund_status = 'rejected'
            registration.save()
            return Response(RegistrationSerializer(registration).data)

        return Response({'error': 'عملیات نامعتبر است'}, status=status.HTTP_400_BAD_REQUEST)

class PayDirectRegistrationView(APIView):
    """
    پرداخت مستقیم (آنلاین، خارج از کیف پول) برای یک ثبت‌نام.
    body: { "amount"?: عدد اختیاری، پیش‌فرض کل مبلغ باقیمانده }

    TODO (اتصال درگاه): اینجا باید به‌جای ثبت مستقیم، کاربر به درگاه زرین‌پال
    ریدایرکت بشه و این منطق (پایین) فقط در callback بعد از تایید پرداخت واقعی
    اجرا بشه. فعلاً چون درگاه وصل نیست، برای تست مستقیم موفق ثبت می‌شود.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        from financial.models import DirectPaymentRecord
        try:
            registration = Registration.objects.get(pk=pk, user=request.user)
        except Registration.DoesNotExist:
            return Response({'error': 'ثبت‌نام یافت نشد'}, status=status.HTTP_404_NOT_FOUND)

        amount = request.data.get('amount')
        try:
            amount = int(amount) if amount not in (None, '') else registration.remaining_amount
        except (TypeError, ValueError):
            return Response({'error': 'مبلغ نامعتبر است'}, status=status.HTTP_400_BAD_REQUEST)

        if amount <= 0 or amount > registration.remaining_amount:
            return Response({'error': 'مبلغ نامعتبر است'}, status=status.HTTP_400_BAD_REQUEST)

        registration.paid_directly += amount
        registration.payment_method = 'online'
        registration.save()

        DirectPaymentRecord.objects.create(
            user=request.user,
            registration=registration,
            amount=amount,
        )
        return Response(RegistrationSerializer(registration).data)
class AdminSetGroupCodeView(APIView):
    """تنظیم کد گروه (اتوبوس) یک ثبت‌نام. body: { "group_code": "1" }"""
    permission_classes = [HasAdminPermission('perm_registrations')]

    def post(self, request, pk):
        try:
            registration = Registration.objects.get(pk=pk)
        except Registration.DoesNotExist:
            return Response({'error': 'ثبت‌نام یافت نشد'}, status=status.HTTP_404_NOT_FOUND)

        registration.group_code = request.data.get('group_code', '')
        registration.save()
        return Response(RegistrationSerializer(registration).data)


class AdminRegistrationCompanionsNetworkView(APIView):
    """
    لیست ثبت‌نام‌های مرتبط (همسفرهای دوطرفه) با یک ثبت‌نام مشخص، برای همون سفر —
    تا ادمین بتونه هم‌زمان کد گروه رو به همسفرها هم اختصاص بده.
    """
    permission_classes = [HasAdminPermission('perm_registrations')]

    def get(self, request, pk):
        try:
            registration = Registration.objects.select_related('trip', 'user').get(pk=pk)
        except Registration.DoesNotExist:
            return Response({'error': 'ثبت‌نام یافت نشد'}, status=status.HTTP_404_NOT_FOUND)

        added_by_me = TravelCompanion.objects.filter(registration=registration).values_list('companion_id', flat=True)
        added_me = TravelCompanion.objects.filter(
            companion=registration.user, registration__trip=registration.trip
        ).exclude(registration=registration).values_list('registration__user_id', flat=True)

        related_user_ids = (set(added_by_me) | set(added_me)) - {registration.user_id}

        related_registrations = Registration.objects.filter(
            trip=registration.trip, user_id__in=related_user_ids
        ).select_related('user').exclude(pk=registration.pk)

        return Response(RegistrationSerializer(related_registrations, many=True).data)


class AdminBulkSetGroupCodeView(APIView):
    """تنظیم یکجای کد گروه برای چند ثبت‌نام. body: { "registration_ids": [..], "group_code": "1" }"""
    permission_classes = [HasAdminPermission('perm_registrations')]

    def post(self, request):
        ids = request.data.get('registration_ids', [])
        group_code = request.data.get('group_code', '')
        if not isinstance(ids, list) or not ids:
            return Response({'error': 'لیست ثبت‌نام‌ها الزامی است'}, status=status.HTTP_400_BAD_REQUEST)

        updated = Registration.objects.filter(pk__in=ids).update(group_code=group_code)
        return Response({'updated_count': updated})