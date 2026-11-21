"""Isolated real Django + production Next integration test. No live accounts."""
import http.cookiejar
import json
import os
from pathlib import Path
import subprocess
import tempfile
import time
import urllib.request
import urllib.error

root = Path(__file__).resolve().parents[1]
python = str(root / 'backend/.venv/bin/python')
secret = 'integration-only-secret-at-least-thirty-two-characters'
with tempfile.TemporaryDirectory() as folder:
    env = dict(os.environ, DJANGO_SETTINGS_MODULE='core.test_settings', SECURITY_TEST_DB=folder+'/db.sqlite3', DJANGO_DEBUG='1', COOKIE_SECURE='0', BFF_SHARED_SECRET=secret, APP_ORIGIN='http://127.0.0.1:3100', SITE_URL='http://127.0.0.1:3100', API_ORIGIN='http://127.0.0.1:8101', ALLOW_INSECURE_HTTP='1', LEGACY_ORIGIN='http://127.0.0.1:5193')
    subprocess.run(['npm', 'run', 'build'], cwd=root/'frontend-next', env=env, check=True)
    subprocess.run([python, 'manage.py', 'migrate', '--noinput'], cwd=root/'backend', env=env, check=True, stdout=subprocess.DEVNULL)
    subprocess.run([python, 'manage.py', 'shell', '-c', "from accounts.models import User; User.objects.create_user('09123456789', 'Test-password-123', first_name='PrivateFixture', national_code='1234567890')"], cwd=root/'backend', env=env, check=True, stdout=subprocess.DEVNULL)
    subprocess.run([python, 'manage.py', 'shell', '-c', "exec(open('../scripts/phase-three-fixtures.py', encoding='utf-8-sig').read())"], cwd=root/'backend', env=env, check=True, stdout=subprocess.DEVNULL)
    subprocess.run([python, 'manage.py', 'shell', '-c', "exec(open('../scripts/phase-six-fixtures.py').read())"], cwd=root/'backend', env=env, check=True, stdout=subprocess.DEVNULL)
    log = open(folder+'/services.log', 'w+')
    processes = [subprocess.Popen([python, 'manage.py', 'runserver', '127.0.0.1:8101', '--noreload'], cwd=root/'backend', env=env, stdout=log, stderr=log), subprocess.Popen(['node', 'node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3100'], cwd=root/'frontend-next', env=env, stdout=log, stderr=log)]
    processes.append(subprocess.Popen(['node', 'node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5193'], cwd=root/'frontend', env=dict(env, VITE_TEST_DISABLE_HMR='1'), stdout=log, stderr=log))
    jar = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
    def request(path, data=None, token=None, origin='http://127.0.0.1:3100', method=None):
        headers = {'Origin': origin, 'Content-Type': 'application/json'}
        if token: headers['X-CSRFToken'] = token
        req = urllib.request.Request('http://127.0.0.1:3100'+path, data=json.dumps(data).encode() if data is not None else None, headers=headers, method=method)
        try:
            response = opener.open(req, timeout=15)
        except urllib.error.HTTPError as error:
            response = error
        return response.status, response.read().decode(), response.headers, response.url
    try:
        for _ in range(60):
            try:
                if request('/api/accounts/session/')[0] == 200: break
            except (OSError, urllib.error.URLError): pass
            time.sleep(.25)
        else: raise AssertionError('Services did not start')
        status, body, _, _ = request('/api/accounts/session/')
        token = json.loads(body)['csrfToken']
        assert request('/api/accounts/login/', {}, None)[0] == 403
        assert request('/api/accounts/login/', {}, token, 'https://evil.example')[0] == 403
        status, body, headers, _ = request('/api/accounts/login/', {'mobile': '09123456789', 'password': 'Test-password-123'}, token)
        assert status == 200, (status, body)
        result = json.loads(body)
        assert 'access' not in result and 'refresh' not in result
        assert 'HttpOnly' in '\n'.join(headers.get_all('Set-Cookie'))
        status, html, headers, _ = request('/dashboard')
        assert status == 200 and 'PrivateFixture' in html
        assert 'no-store' in headers['Cache-Control']
        assert request('/admin')[3].endswith('/dashboard')
        token = result['csrfToken']
        status, body, _, _ = request('/api/accounts/profile/', {'first_name': 'PrivateFixture', 'is_superuser': True, 'is_staff': True, 'perm_financial': True}, token, method='PUT')
        assert status == 200, body
        assert all(not json.loads(body)[key] for key in ['is_superuser', 'is_staff', 'perm_financial'])
        assert request('/api/financial/wallet/charge/', {'amount': 1000}, token)[0] == 200
        registration = json.loads(request('/api/trips/my-registrations/')[1])[0]
        payment = {'registration_id': registration['id'], 'amount': 20, 'expected_remaining': 100}
        assert request('/api/financial/wallet/pay/', {**payment, 'amount': -20}, token)[0] == 400
        assert request('/api/financial/wallet/pay/', payment, token)[0] == 200
        assert request('/api/financial/wallet/pay/', payment, token)[0] == 409
        assert request('/api/trips/register/', {'trip': registration['trip']}, token)[0] == 409
        status, body, _, _ = request('/api/tickets/create/', {'title': 'Private ticket fixture', 'priority': 'low', 'first_message': 'Initial message'}, token)
        assert status == 201, body
        ticket_id = json.loads(body)['id']
        assert request(f'/api/tickets/{ticket_id}/reply/', {'text': 'Follow-up message'}, token)[0] == 201
        assert 'Private ticket fixture' in request('/dashboard/tickets')[1]
        assert request('/api/content/articles/create/', {'title': 'Private article fixture', 'content': 'Draft body', 'category': 'article'}, token)[0] == 201
        assert 'Private article fixture' in request('/dashboard/articles')[1]
        old_cookie = next(c.value for c in jar if c.name == 'ansar_session')
        assert request('/api/accounts/logout/', {}, result['csrfToken'])[0] == 200
        assert request('/api/accounts/profile/')[0] == 401
        assert '/login?' in request('/dashboard')[3]
        for route in ['profile', 'articles', 'gallery', 'tickets', 'trips', 'trips/register', 'wallet', 'financial-report', 'orders']:
            assert '/login?' in request('/dashboard/' + route)[3]
        replay = urllib.request.Request('http://127.0.0.1:3100/api/accounts/profile/', headers={'Cookie': 'ansar_session='+old_cookie})
        try: urllib.request.urlopen(replay); raise AssertionError('Revoked session accepted')
        except urllib.error.HTTPError as error: assert error.code == 401
        subprocess.run(['node', 'tests/phase-three-browser.mjs'], cwd=root/'frontend-next', env=env, check=True)
        subprocess.run(['node', 'tests/phase-six-browser.mjs'], cwd=root/'frontend-next', env=env, check=True)
        processes[0].terminate()
        processes[0].wait(timeout=10)
        jar.clear()
        jar.set_cookie(http.cookiejar.Cookie(0, 'ansar_session', 'expired-fixture', None, False, '127.0.0.1', False, False, '/', True, False, None, True, None, None, {}))
        assert request('/')[0] == 200
        assert request('/login')[0] == 200
        assert request('/register')[0] == 200
        assert request('/dashboard/profile')[0] == 503
        print('PASS: real BFF CSRF, HttpOnly, private SSR, role guard, logout and revoked-cookie replay')
        print('PASS: public routes remain available during a Django outage; private access fails closed')
    except Exception:
        log.flush(); log.seek(0); print(log.read()[-5000:]); raise
    finally:
        for process in processes: process.terminate()
        for process in processes:
            try: process.wait(timeout=10)
            except subprocess.TimeoutExpired: process.kill(); process.wait()
        log.close()
