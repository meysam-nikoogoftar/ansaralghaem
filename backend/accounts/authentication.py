from django.http import JsonResponse
from django.contrib.auth import logout
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.authentication import SessionAuthentication as BaseSessionAuthentication


class SessionAuthentication(BaseSessionAuthentication):
    def authenticate(self, request):
        result = super().authenticate(request)
        if result and result[0].status != 'active':
            logout(request._request)
            raise AuthenticationFailed('حساب در دسترس نیست.')
        return result

    def authenticate_header(self, request):
        return 'Session'


def csrf_failure(request, reason=''):
    return JsonResponse({'detail': 'درخواست معتبر نیست. دوباره تلاش کنید.', 'code': 'csrf_failed'}, status=403)


def exception_handler(exc, context):
    from rest_framework.views import exception_handler as default_handler
    response = default_handler(exc, context)
    if response is not None and response.status_code == 403 and str(getattr(exc, 'detail', '')).startswith('CSRF Failed'):
        response.data = {'detail': 'درخواست معتبر نیست. دوباره تلاش کنید.', 'code': 'csrf_failed'}
    return response

