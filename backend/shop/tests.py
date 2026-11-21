from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from accounts.models import User
from .models import Product, Order

@override_settings(DEBUG=True)
class OrderSecurityTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user('09123456789', 'password', national_code='1234567890')
        self.product = Product.objects.create(code='TEST', title='test', price=100, stock=2, is_published=True)
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        self.payload = {'product': self.product.pk, 'quantity': 1, 'address': 'Test address', 'postal_code': '1234567890'}

    def test_positive_quantity_and_stock_are_enforced(self):
        for quantity in [-1, 0, 3]:
            self.assertEqual(self.client.post('/api/shop/orders/create/', dict(self.payload, quantity=quantity)).status_code, 400)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 2)
        self.assertEqual(Order.objects.count(), 0)

    def test_price_is_calculated_on_server(self):
        response = self.client.post('/api/shop/orders/create/', dict(self.payload, final_price=1))
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['final_price'], 100)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 1)

    def test_unpublished_product_cannot_be_ordered(self):
        self.product.is_published = False
        self.product.save()
        self.assertEqual(self.client.post('/api/shop/orders/create/', self.payload).status_code, 400)
