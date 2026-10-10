from rest_framework.permissions import BasePermission


class IsAdminOrSuperAdmin(BasePermission):
    """اجازه دسترسی به هر کاربری با user_type برابر 'admin' یا 'superadmin' (بدون چک دسترسی گزینشی)."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.user_type in ('admin', 'superadmin')
        )


class IsSuperAdmin(BasePermission):
    """فقط سوپرادمین — برای عملیات حساس مثل ارتقا نقش یا ویرایش دسترسی‌های ادمین‌های دیگر."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.user_type == 'superadmin'
        )


def HasAdminPermission(field_name):
    """
    فکتوری یه permission class که دسترسی گزینشی رو چک می‌کنه:
    سوپرادمین همیشه true، ادمین عادی فقط اگه فیلد مشخص‌شده روش true باشه.
    مثال استفاده: permission_classes = [HasAdminPermission('perm_trips')]
    """
    class _HasAdminPermission(BasePermission):
        def has_permission(self, request, view):
            user = request.user
            if not (user and user.is_authenticated):
                return False
            if user.user_type == 'superadmin':
                return True
            if user.user_type == 'admin':
                return bool(getattr(user, field_name, False))
            return False
    return _HasAdminPermission