from accounts.models import User
from shop.models import Product, ProductCategory
from trips.models import Trip, Registration
from content.models import Slider
user = User.objects.get(mobile='09123456789')
category = ProductCategory.objects.create(name='آزمایشی')
Product.objects.create(code='E2E', title='محصول آزمایشی', description='توضیحات محصول', category=category, price=1000, discounted_price=800, stock=4, is_published=True)
Product.objects.create(code='EMPTY', title='محصول ناموجود', price=2000, stock=0, is_published=True)
trip = Trip.objects.create(title='سفر آزمایشی', trip_type='arbaeen', start_date='2027-07-27', end_date='2027-08-01', cost=100, is_active=True, registration_open=True)
Registration.objects.create(user=user, trip=trip, tracking_code='12345', total_cost=100)
from django.core.files.base import ContentFile
from io import BytesIO
from PIL import Image
stream = BytesIO()
Image.new('RGB', (640, 480), '#15644f').save(stream, format='JPEG')
slider = Slider.objects.create(title='اسلاید آزمایشی', summary='شرح اسلاید', image='sliders/test.jpg', link='javascript:alert(1)')

slider.image.save('test.jpg', ContentFile(stream.getvalue()))
