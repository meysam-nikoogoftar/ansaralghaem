from accounts.models import User
from content.models import Article, Gallery
from django.core.files.base import ContentFile
from django.conf import settings
from pathlib import Path
from trips.models import Registration

password = 'Test-password-123'
user = User.objects.get(mobile='09123456789')
User.objects.create_user('09123456780', password, user_type='admin', perm_financial=True)
User.objects.create_user('09123456781', password, user_type='superadmin')
registration = Registration.objects.get(user=user)
registration.refund_requested = True
registration.refund_status = 'pending'
registration.requested_refund_amount = 15
registration.save()
Article.objects.create(author=user, title='دلنوشتهٔ تست مدیریت', content='متن آزمایشی', category='article')
gallery = Gallery(uploader=user, title='تصویر تست مدیریت')
image = next((Path(settings.MEDIA_ROOT) / 'sliders').glob('test*'))
gallery.image.save('admin-test.jpg', ContentFile(image.read_bytes()))
