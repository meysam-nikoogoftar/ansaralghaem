from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Sum
from .models import User
from .permissions import IsAdminOrSuperAdmin, IsSuperAdmin
from .serializers import (
    RegisterSerializer, UserProfileSerializer,
    UserListSerializer, ChangePasswordSerializer,
    SearchUserSerializer
)


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserProfileSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        mobile = request.data.get('mobile')
        password = request.data.get('password')
        user = authenticate(request, username=mobile, password=password)
        if user:
            if user.status == 'blocked':
                return Response({'error': 'حساب شما مسدود شده است'}, status=status.HTTP_403_FORBIDDEN)
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserProfileSerializer(user).data
            })
        return Response({'error': 'موبایل یا رمز عبور اشتباه است'}, status=status.HTTP_401_UNAUTHORIZED)


class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
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
        from trips.serializers import RegistrationSerializer
        from financial.models import Wallet
        from tickets.models import Ticket
        from content.models import Gallery, Article

        total_users = User.objects.filter(user_type='user').count()
        total_admins = User.objects.filter(user_type__in=['admin', 'superadmin']).count()
        total_trips = Trip.objects.filter(is_active=True).count()

        registrations_by_status = {
            key: Registration.objects.filter(status=key).count()
            for key, _ in Registration.STATUS_CHOICES
        }

        total_wallet_balance = Wallet.objects.aggregate(total=Sum('balance'))['total'] or 0
        pending_tickets = Ticket.objects.filter(status='pending').count()
        pending_gallery = Gallery.objects.filter(status='pending').count()
        pending_articles = Article.objects.filter(status='pending').count()

        recent_registrations = Registration.objects.select_related('user', 'trip').order_by('-registered_at')[:6]

        return Response({
            'total_users': total_users,
            'total_admins': total_admins,
            'total_trips': total_trips,
            'registrations_by_status': registrations_by_status,
            'total_wallet_balance': total_wallet_balance,
            'pending_tickets': pending_tickets,
            'pending_gallery': pending_gallery,
            'pending_articles': pending_articles,
            'recent_registrations': RegistrationSerializer(recent_registrations, many=True).data,
        })


class AdminUserListView(generics.ListAPIView):
    """
    لیست کاربران برای پنل ادمین (بر پایه user_type، نه is_staff).
    """
    permission_classes = [IsAdminOrSuperAdmin]
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
        user.save()
        return Response(UserListSerializer(user).data)