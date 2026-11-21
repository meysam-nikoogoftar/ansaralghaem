import secrets
import ipaddress
from django.conf import settings
from django.http import JsonResponse


class BffBoundaryMiddleware:
    """Forwarded identity is trusted only on authenticated internal BFF requests."""
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        secret = settings.BFF_SHARED_SECRET
        trusted = bool(secret) and secrets.compare_digest(request.headers.get('X-Bff-Key', ''), secret)
        request.bff_client_ip = request.META.get('REMOTE_ADDR', '')
        if trusted:
            try:
                request.bff_client_ip = str(ipaddress.ip_address(request.headers.get('X-Bff-Client-IP', '')))
            except ValueError:
                pass
        else:
            request.META.pop('HTTP_X_FORWARDED_PROTO', None)
        if request.path.startswith('/api/') and not settings.DEBUG and not trusted:
            return JsonResponse({'detail': 'BFF access required.'}, status=403)
        response = self.get_response(request)
        if request.path.startswith('/api/'):
            response['Cache-Control'] = 'private, no-store'
        return response
