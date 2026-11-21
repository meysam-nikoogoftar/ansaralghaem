from pathlib import Path
import os
from django.core.exceptions import ImproperlyConfigured

BASE_DIR = Path(__file__).resolve().parent.parent

DEBUG = os.environ.get('DJANGO_DEBUG', '1') == '1'
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'django-insecure-local-development-only')
BFF_SHARED_SECRET = os.environ.get('BFF_SHARED_SECRET', '')
APP_ORIGIN = os.environ.get('APP_ORIGIN', 'http://127.0.0.1:3000')
if not DEBUG and (len(SECRET_KEY) < 50 or len(BFF_SHARED_SECRET) < 32 or not APP_ORIGIN.startswith('https://')):
    raise ImproperlyConfigured('Production requires strong DJANGO_SECRET_KEY/BFF_SHARED_SECRET and HTTPS APP_ORIGIN')
ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS', '127.0.0.1,localhost,testserver').split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    # Local apps
    'accounts',
    'trips',
    'financial',
    'content',
    'shop',
    'tickets',
    'interactive',
]

MIDDLEWARE = [
    'accounts.middleware.BffBoundaryMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('POSTGRES_DB', 'ansaralghaem_db'),
        'USER': os.environ.get('POSTGRES_USER', 'postgres'),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD', '1234' if DEBUG else ''),
        'HOST': os.environ.get('POSTGRES_HOST', '127.0.0.1'),
        'PORT': os.environ.get('POSTGRES_PORT', '5432'),
    }
}

AUTH_USER_MODEL = 'accounts.User'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'accounts.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'EXCEPTION_HANDLER': 'accounts.authentication.exception_handler',
}

from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
}

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = []
CSRF_TRUSTED_ORIGINS = [APP_ORIGIN]
COOKIE_SECURE = os.environ.get('COOKIE_SECURE', '0' if DEBUG else '1') == '1'
if not DEBUG and not COOKIE_SECURE:
    raise ImproperlyConfigured('Secure cookies are required in production')
SESSION_COOKIE_NAME = '__Host-ansar_session' if COOKIE_SECURE else 'ansar_session'
CSRF_COOKIE_NAME = '__Host-ansar_csrf' if COOKIE_SECURE else 'ansar_csrf'
SESSION_COOKIE_SECURE = CSRF_COOKIE_SECURE = COOKIE_SECURE
SESSION_COOKIE_HTTPONLY = CSRF_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = CSRF_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_AGE = 60 * 60 * 24 * 14
SESSION_ENGINE = 'django.contrib.sessions.backends.db'
CSRF_FAILURE_VIEW = 'accounts.authentication.csrf_failure'
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = not DEBUG
SECURE_HSTS_SECONDS = 31536000 if not DEBUG else 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = False
SECURE_CONTENT_TYPE_NOSNIFF = True
SESSION_SAVE_EVERY_REQUEST = False
AUTH_LOGIN_LIMIT = int(os.environ.get('AUTH_LOGIN_LIMIT', '10'))
AUTH_LOGIN_WINDOW = int(os.environ.get('AUTH_LOGIN_WINDOW', '60'))
AUTH_REGISTER_LIMIT = int(os.environ.get('AUTH_REGISTER_LIMIT', '5'))
AUTH_REGISTER_WINDOW = int(os.environ.get('AUTH_REGISTER_WINDOW', '3600'))
AUTH_TRACK_LIMIT = int(os.environ.get('AUTH_TRACK_LIMIT', '10'))
AUTH_TRACK_WINDOW = int(os.environ.get('AUTH_TRACK_WINDOW', '60'))

LANGUAGE_CODE = 'fa-ir'
TIME_ZONE = 'Asia/Tehran'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
