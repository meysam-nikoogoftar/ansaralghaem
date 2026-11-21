import hashlib
import math
import time
from datetime import datetime, timezone
from django.conf import settings
from django.db import DatabaseError
from django.db.models import F
from rest_framework.exceptions import APIException
from rest_framework.throttling import BaseThrottle
from .models import AuthRateBucket


class RateStoreUnavailable(APIException):
    status_code = 503
    default_detail = 'سرویس موقتاً در دسترس نیست.'


class AuthThrottle(BaseThrottle):
    scope = 'LOGIN'

    def allow_request(self, request, view):
        window = max(1, getattr(settings, f'AUTH_{self.scope}_WINDOW'))
        limit = max(1, getattr(settings, f'AUTH_{self.scope}_LIMIT'))
        now = time.time()
        end = (math.floor(now / window) + 1) * window
        self.retry_after = max(1, math.ceil(end - now))
        identity = getattr(request._request, 'bff_client_ip', request.META.get('REMOTE_ADDR', ''))
        key = hashlib.sha256(f'{self.scope}:{identity}:{end}'.encode()).hexdigest()
        try:
            AuthRateBucket.objects.get_or_create(key=key, defaults={'expires_at': datetime.fromtimestamp(end, timezone.utc)})
            # One conditional SQL update; no process-local counters or read/modify/write race.
            return bool(AuthRateBucket.objects.filter(key=key, attempts__lt=limit).update(attempts=F('attempts') + 1))
        except DatabaseError as exc:
            raise RateStoreUnavailable() from exc

    def wait(self):
        return self.retry_after


class LoginThrottle(AuthThrottle):
    scope = 'LOGIN'


class RegisterThrottle(AuthThrottle):
    scope = 'REGISTER'

class TrackingThrottle(AuthThrottle):
    scope = 'TRACK'
