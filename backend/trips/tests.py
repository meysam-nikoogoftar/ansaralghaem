from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from accounts.models import User
from trips.models import Trip, Registration

@override_settings(DEBUG=True, AUTH_TRACK_LIMIT=2)
class PublicTrackingTests(TestCase):
    def setUp(self):
        user = User.objects.create_user('09123456789', 'password', national_code='1234567890')
        trip = Trip.objects.create(title='Test', start_date='2027-01-01', end_date='2027-01-02')
        Registration.objects.create(user=user, trip=trip, tracking_code='12345', total_cost=100)
        self.client = APIClient()

    def test_response_does_not_expose_identity_fields(self):
        response = self.client.post('/api/trips/track/', {'tracking_code':'12345', 'national_code':'1234567890'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(set(response.data), {'user_name','tracking_code','trip_detail','status','payment_status'})
        self.assertNotIn('1234567890', str(response.data))
        self.assertEqual(self.client.get('/api/trips/track/').status_code, 405)

    def test_invalid_and_missing_then_throttled(self):
        self.assertEqual(self.client.post('/api/trips/track/', {}).status_code, 400)
        self.assertEqual(self.client.post('/api/trips/track/', {'tracking_code':'wrong', 'national_code':'1234567890'}).status_code, 404)
        self.assertEqual(self.client.post('/api/trips/track/', {}).status_code, 429)


@override_settings(DEBUG=True)
class TripCapacityTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user('09123456780', 'password', user_type='admin', perm_trips=True, perm_registrations=True)
        self.first = User.objects.create_user('09123456781', 'password')
        self.second = User.objects.create_user('09123456782', 'password')
        self.trip = Trip.objects.create(
            title='Test capacity', trip_type='qom', start_date='2027-01-01', end_date='2027-01-02',
            is_active=True, registration_open=True, capacity=1,
        )
        self.trip_url = f'/api/trips/admin/trips/{self.trip.pk}/'

    def register(self, user):
        self.client.force_authenticate(user)
        return self.client.post('/api/trips/register/', {'trip': self.trip.pk})

    def test_public_availability_and_registration_after_a_place_is_released(self):
        self.assertEqual(self.client.get('/api/trips/').data[0]['remaining_capacity'], 1)
        created = self.register(self.first)
        self.assertEqual(created.status_code, 201)
        self.assertEqual(self.client.get(f'/api/trips/{self.trip.pk}/').data['remaining_capacity'], 0)
        full = self.register(self.second)
        self.assertEqual(full.status_code, 409)
        self.assertEqual(full.data['code'], 'trip_full')
        self.client.force_authenticate(self.first)
        self.assertEqual(self.client.post(f"/api/trips/registration/{created.data['id']}/cancel/", {}).status_code, 200)
        self.assertEqual(self.register(self.second).status_code, 201)

    def test_admin_cannot_overbook_when_reactivating_or_reducing_capacity(self):
        rejected = Registration.objects.create(trip=self.trip, user=self.first, status='rejected')
        self.assertEqual(self.register(self.second).status_code, 201)
        self.client.force_authenticate(self.admin)
        action_url = f'/api/trips/admin/registrations/{rejected.pk}/action/'
        self.assertEqual(self.client.post(action_url, {'action': 'approve'}).status_code, 409)
        rejected.refresh_from_db()
        self.assertEqual(rejected.status, 'rejected')
        self.assertEqual(self.client.patch(self.trip_url, {'capacity': 2}).status_code, 200)
        self.assertEqual(self.client.post(action_url, {'action': 'approve'}).status_code, 200)
        self.assertEqual(self.client.patch(self.trip_url, {'capacity': 1}).status_code, 400)
        self.assertEqual(self.client.get(self.trip_url).data['remaining_capacity'], 0)

    def test_unlimited_and_invalid_capacity(self):
        self.client.force_authenticate(self.admin)
        self.assertEqual(self.client.patch(self.trip_url, {'capacity': 0}).status_code, 400)
        self.assertEqual(self.client.patch(self.trip_url, {'end_date': '2026-12-31'}).status_code, 400)
        self.assertIsNone(self.client.patch(self.trip_url, {'capacity': None}, format='json').data['remaining_capacity'])
        self.assertEqual(self.register(self.first).status_code, 201)
        self.assertEqual(self.register(self.second).status_code, 201)
