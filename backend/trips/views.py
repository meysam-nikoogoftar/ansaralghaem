from rest_framework import status, generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from accounts.permissions import IsAdminOrSuperAdmin
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
        try:
            registration = Registration.objects.get(
                tracking_code=tracking_code,
                user__national_code=national_code
            )
            return Response(RegistrationSerializer(registration).data)
        except Registration.DoesNotExist:
            return Response(
                {'error': 'ثبت‌نامی با این مشخصات یافت نشد'},
                status=status.HTTP_404_NOT_FOUND
            )


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
    permission_classes = [IsAdminOrSuperAdmin]
    serializer_class = TripSerializer
    queryset = Trip.objects.all()


class AdminTripDetailView(generics.RetrieveUpdateDestroyAPIView):
    """ویرایش/حذف یک سفر."""
    permission_classes = [IsAdminOrSuperAdmin]
    serializer_class = TripSerializer
    queryset = Trip.objects.all()


class AdminRegistrationListView(generics.ListAPIView):
    """لیست همه‌ی ثبت‌نام‌ها (همه‌ی کاربران) با فیلتر و جستجو."""
    permission_classes = [IsAdminOrSuperAdmin]
    serializer_class = RegistrationSerializer

    def get_queryset(self):
        queryset = Registration.objects.select_related('user', 'trip').order_by('-registered_at')
        status_param = self.request.query_params.get('status', '')
        trip_id = self.request.query_params.get('trip_id', '')
        search = self.request.query_params.get('search', '')
        if status_param:
            queryset = queryset.filter(status=status_param)
        if trip_id:
            queryset = queryset.filter(trip_id=trip_id)
        if search:
            queryset = queryset.filter(
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(user__mobile__icontains=search) |
                Q(tracking_code__icontains=search)
            )
        return queryset


class AdminRegistrationActionView(APIView):
    """تایید یا رد یک ثبت‌نام توسط ادمین. body: {action: 'approve'|'reject', rejection_reason?, admin_note?}"""
    permission_classes = [IsAdminOrSuperAdmin]

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
        else:
            return Response({'error': 'عملیات نامعتبر است'}, status=status.HTTP_400_BAD_REQUEST)

        admin_note = request.data.get('admin_note')
        if admin_note is not None:
            registration.admin_note = admin_note

        registration.save()
        return Response(RegistrationSerializer(registration).data)