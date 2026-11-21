from .permissions import IsAdminOrSuperAdmin, IsSuperAdmin, HasAdminPermission
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token, rotate_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from .throttling import LoginThrottle, RegisterThrottle
from django.db.models import Sum
from .models import User
from .permissions import IsAdminOrSuperAdmin, IsSuperAdmin
from .serializers import (
    RegisterSerializer, UserProfileSerializer, UpdateOwnProfileSerializer,
    UserListSerializer, ChangePasswordSerializer,
    SearchUserSerializer, AdminUserPermissionsSerializer, AdminUserProfileSerializer
)


@method_decorator(csrf_protect, name='dispatch')
class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [RegisterThrottle]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            login(request, user, backend='django.contrib.auth.backends.ModelBackend')
            return Response({
                'user': UserProfileSerializer(user).data,
                'csrfToken': get_token(request),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_protect, name='dispatch')
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [LoginThrottle]

    def post(self, request):
        mobile = request.data.get('mobile')
        password = request.data.get('password')
        user = authenticate(request, username=mobile, password=password)
        if user:
            if user.status != 'active':
                messages = {
                    'inactive': 'حساب شما غیرفعال شده است',
                    'blocked': 'حساب شما مسدود شده است',
                    'deleted': 'این حساب حذف شده است',
                }
                return Response({'error': messages.get(user.status, 'امکان ورود وجود ندارد')}, status=status.HTTP_403_FORBIDDEN)
            login(request, user)
            return Response({
                'user': UserProfileSerializer(user).data,
                'csrfToken': get_token(request),
            })
        return Response({'error': 'موبایل یا رمز عبور اشتباه است'}, status=status.HTTP_401_UNAUTHORIZED)


class SessionView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        user = request.user
        if user.is_authenticated and user.status != 'active':
            logout(request)
            user = None
        return Response({'user': UserProfileSerializer(user).data if user and user.is_authenticated else None, 'csrfToken': get_token(request)})


@method_decorator(csrf_protect, name='dispatch')
class LogoutView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        logout(request)
        rotate_token(request)
        return Response({'user': None, 'csrfToken': get_token(request)})


class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.status != 'active':
            logout(request)
            return Response({'detail': 'حساب در دسترس نیست.'}, status=401)
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UpdateOwnProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserProfileSerializer(serializer.instance).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            request.user.set_password(serializer.validated_data['new_password'])
            request.user.save()
            return Response({'message': 'رمز عبور با موفقیت تغییر کرد'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SearchUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        national_code = request.query_params.get('national_code', '')
        if not national_code:
            return Response({'error': 'کد ملی را وارد کنید'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(national_code=national_code)
            if user == request.user:
                return Response({'error': 'نمی‌توانید خودتان را به عنوان همسفر اضافه کنید'}, status=status.HTTP_400_BAD_REQUEST)
            serializer = SearchUserSerializer(user)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({'error': 'کاربری با این کد ملی یافت نشد'}, status=status.HTTP_404_NOT_FOUND)


class UserListView(generics.ListAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = UserListSerializer
    queryset = User.objects.all().order_by('-date_joined')

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', '')
        if search:
            queryset = queryset.filter(
                first_name__icontains=search
            ) | queryset.filter(
                last_name__icontains=search
            ) | queryset.filter(
                mobile__icontains=search
            ) | queryset.filter(
                national_code__icontains=search
            )
        return queryset


# ============ پنل ادمین ============

class AdminDashboardStatsView(APIView):
    """
    آمار کلی برای داشبورد پنل ادمین: تعداد کاربران، سفرها، وضعیت ثبت‌نام‌ها،
    مجموع موجودی کیف‌پول‌ها، تیکت/گالری/دلنوشته‌های در انتظار بررسی و آخرین ثبت‌نام‌ها.
    """
    permission_classes = [IsAdminOrSuperAdmin]

    def get(self, request):
        from trips.models import Registration, Trip
        from financial.models import Wallet
        from tickets.models import Ticket
        from content.models import Gallery, Article

        def allowed(field):
            return request.user.user_type == 'superadmin' or getattr(request.user, field)

        registrations_by_status = {}
        recent_registrations = []
        if allowed('perm_registrations'):
            registrations_by_status = {
                key: Registration.objects.filter(status=key).count()
                for key, _ in Registration.STATUS_CHOICES
            }
            recent = Registration.objects.select_related('user', 'trip').order_by('-registered_at')[:6]
            recent_registrations = [
                {
                    'id': item.pk, 'user': item.user_id, 'user_name': item.user.full_name,
                    'user_mobile': item.user.mobile, 'trip_detail': {'title': item.trip.title},
                    'tracking_code': item.tracking_code, 'registered_at': item.registered_at,
                    'status': item.status,
                }
                for item in recent
            ]

        return Response({
            'total_users': User.objects.filter(user_type='user').count() if allowed('perm_users') else 0,
            'total_admins': User.objects.filter(user_type__in=['admin', 'superadmin']).count() if allowed('perm_users') else 0,
            'total_trips': Trip.objects.filter(is_active=True).count() if allowed('perm_trips') else 0,
            'registrations_by_status': registrations_by_status,
            'total_wallet_balance': (Wallet.objects.aggregate(total=Sum('balance'))['total'] or 0) if allowed('perm_financial') else 0,
            'pending_tickets': Ticket.objects.filter(status='pending').count() if allowed('perm_tickets') else 0,
            'pending_gallery': Gallery.objects.filter(status='pending').count() if allowed('perm_content') else 0,
            'pending_articles': Article.objects.filter(status='pending').count() if allowed('perm_content') else 0,
            'recent_registrations': recent_registrations,
        })



class AdminUserListView(generics.ListAPIView):
    """
    لیست کاربران برای پنل ادمین (بر پایه user_type، نه is_staff).
    """
    permission_classes = [HasAdminPermission('perm_users')]
    serializer_class = UserListSerializer

    def get_queryset(self):
        queryset = User.objects.all().order_by('-date_joined')
        search = self.request.query_params.get('search', '')
        user_type = self.request.query_params.get('user_type', '')
        if search:
            queryset = queryset.filter(
                first_name__icontains=search
            ) | queryset.filter(
                last_name__icontains=search
            ) | queryset.filter(
                mobile__icontains=search
            ) | queryset.filter(
                national_code__icontains=search
            )
        if user_type:
            queryset = queryset.filter(user_type=user_type)
        return queryset


class PromoteUserView(APIView):
    """
    ارتقا/تنزل نقش کاربر. فقط سوپرادمین می‌تواند نقش کاربران را تغییر دهد.
    body: { "user_type": "admin" | "user" }
    """
    permission_classes = [IsSuperAdmin]

    def post(self, request, pk):
        new_type = request.data.get('user_type')
        if new_type not in ('admin', 'user'):
            return Response({'error': 'نوع کاربر نامعتبر است'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'کاربر یافت نشد'}, status=status.HTTP_404_NOT_FOUND)

        if user.user_type == 'superadmin':
            return Response({'error': 'نمی‌توان نقش سوپرادمین را تغییر داد'}, status=status.HTTP_400_BAD_REQUEST)

        user.user_type = new_type
        user.is_staff = new_type == 'admin'
        if new_type == 'user':
            user.admin_role = 'custom'
            for field in ('perm_users', 'perm_trips', 'perm_registrations', 'perm_attendance',
                          'perm_financial', 'perm_shop', 'perm_content', 'perm_tickets',
                          'perm_announcements', 'perm_sms'):
                setattr(user, field, False)
        user.save()
        return Response(UserListSerializer(user).data)

class AdminUserDetailView(generics.RetrieveAPIView):
    """جزئیات کامل یک کاربر برای پنل ادمین (همه‌ی فیلدهای پروفایل، بدون پسورد)."""
    permission_classes = [IsAdminOrSuperAdmin]
    serializer_class = UserProfileSerializer
    queryset = User.objects.all()

class AdminUserDetailView(generics.RetrieveUpdateAPIView):
    """جزئیات کامل یک کاربر برای پنل ادمین (همه‌ی فیلدهای پروفایل، بدون پسورد)."""
    permission_classes = [HasAdminPermission('perm_users')]
    serializer_class = AdminUserProfileSerializer
    queryset = User.objects.all()


class AdminUserPermissionsView(generics.RetrieveUpdateAPIView):
    """مشاهده/ویرایش دسترسی‌های گزینشی یک ادمین. فقط سوپرادمین."""
    permission_classes = [IsSuperAdmin]
    serializer_class = AdminUserPermissionsSerializer
    queryset = User.objects.all()

class AdminSetUserStatusView(APIView):
    """تغییر وضعیت حساب کاربر (فعال/غیرفعال/حذف). فقط سوپرادمین. body: { "status": "active"|"inactive"|"deleted" }"""
    permission_classes = [IsSuperAdmin]

    def post(self, request, pk):
        new_status = request.data.get('status')
        if new_status not in ('active', 'inactive', 'deleted'):
            return Response({'error': 'وضعیت نامعتبر است'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'کاربر یافت نشد'}, status=status.HTTP_404_NOT_FOUND)
        if user.user_type == 'superadmin':
            return Response({'error': 'نمی‌توان وضعیت سوپرادمین را تغییر داد'}, status=status.HTTP_400_BAD_REQUEST)
        user.status = new_status
        user.save()
        return Response(UserListSerializer(user).data)
