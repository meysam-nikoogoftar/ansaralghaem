from rest_framework.permissions import BasePermission


class IsAdminOrSuperAdmin(BasePermission):
    """
    اجازه دسترسی فقط به کاربرانی با user_type برابر 'admin' یا 'superadmin'.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.user_type in ('admin', 'superadmin')
        )


class IsSuperAdmin(BasePermission):
    """
    اجازه دسترسی فقط به کاربرانی با user_type برابر 'superadmin'.
    برای عملیات حساس مثل ارتقا/تنزل نقش کاربران استفاده می‌شود.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.user_type == 'superadmin'
        )