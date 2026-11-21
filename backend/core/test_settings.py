import os
from .settings import *  # noqa: F403

DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': os.environ.get('SECURITY_TEST_DB', ':memory:')}}
PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher']
ALLOWED_HOSTS = ['testserver', '127.0.0.1', 'localhost']

if os.environ.get('SECURITY_TEST_DB'):
    MEDIA_ROOT = os.path.join(os.path.dirname(os.environ['SECURITY_TEST_DB']), 'media')
