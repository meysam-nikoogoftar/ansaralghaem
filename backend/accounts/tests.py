from django.test import TestCase, Client, override_settings
from .models import User

@override_settings(DEBUG=True, AUTH_LOGIN_LIMIT=3)
class SessionSecurityTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user('09123456789', 'Test-password-123', national_code='1234567890')
        self.client = Client(enforce_csrf_checks=True)

    def bootstrap(self):
        return self.client.get('/api/accounts/session/').json()['csrfToken']

    def sign_in(self):
        token = self.bootstrap()
        return self.client.post('/api/accounts/login/', {'mobile': self.user.mobile, 'password': 'Test-password-123'}, content_type='application/json', HTTP_X_CSRFTOKEN=token)

    def test_csrf_required(self):
        self.assertEqual(self.client.post('/api/accounts/login/', {}, content_type='application/json').status_code, 403)

    def test_session_cookie_and_logout_revocation(self):
        response = self.sign_in()
        self.assertEqual(response.status_code, 200)
        self.assertNotIn('access', response.json())
        cookie = self.client.cookies['ansar_session']
        self.assertTrue(cookie['httponly'])
        self.assertEqual(cookie['samesite'], 'Lax')
        old = cookie.value
        self.assertEqual(self.client.get('/api/accounts/profile/').status_code, 200)
        response = self.client.post('/api/accounts/logout/', {}, content_type='application/json', HTTP_X_CSRFTOKEN=response.json()['csrfToken'])
        self.assertEqual(response.status_code, 200)
        self.client.cookies['ansar_session'] = old
        self.assertEqual(self.client.get('/api/accounts/profile/').status_code, 401)

    def test_rate_limit_is_server_side(self):
        token = self.bootstrap()
        for _ in range(3):
            self.assertEqual(self.client.post('/api/accounts/login/', {'mobile': self.user.mobile, 'password': 'wrong'}, content_type='application/json', HTTP_X_CSRFTOKEN=token).status_code, 401)
        response = self.client.post('/api/accounts/login/', {}, content_type='application/json', HTTP_X_CSRFTOKEN=token, HTTP_X_FORWARDED_FOR='9.9.9.9')
        self.assertEqual(response.status_code, 429)
        self.assertIn('Retry-After', response)

    def test_blocked_user_cannot_reuse_session(self):
        self.sign_in()
        self.user.status = 'blocked'
        self.user.save()
        self.assertEqual(self.client.get('/api/accounts/profile/').status_code, 401)

    def test_cross_site_and_bearer_rejected(self):
        token = self.bootstrap()
        self.assertEqual(self.client.post('/api/accounts/login/', {}, content_type='application/json', HTTP_X_CSRFTOKEN=token, HTTP_ORIGIN='https://evil.example').status_code, 403)
        self.assertEqual(self.client.get('/api/accounts/profile/', HTTP_AUTHORIZATION='Bearer old-token').status_code, 401)

