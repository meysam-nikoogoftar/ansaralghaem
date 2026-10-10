from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change_password'),
    path('search-user/', views.SearchUserView.as_view(), name='search_user'),
    path('users/', views.UserListView.as_view(), name='user_list'),

    # پنل ادمین
    path('admin/dashboard-stats/', views.AdminDashboardStatsView.as_view(), name='admin_dashboard_stats'),
    path('admin/users/', views.AdminUserListView.as_view(), name='admin_user_list'),
    path('admin/users/<int:pk>/', views.AdminUserDetailView.as_view(), name='admin_user_detail'),
    path('admin/users/<int:pk>/', views.AdminUserDetailView.as_view(), name='admin_user_detail'),
    path('admin/users/<int:pk>/permissions/', views.AdminUserPermissionsView.as_view(), name='admin_user_permissions'),
    path('admin/users/<int:pk>/promote/', views.PromoteUserView.as_view(), name='promote_user'),
    
]