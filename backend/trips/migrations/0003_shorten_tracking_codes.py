import random
import string

from django.db import migrations, models


def shrink_tracking_codes(apps, schema_editor):
    Registration = apps.get_model('trips', 'Registration')
    used_codes = set(Registration.objects.values_list('tracking_code', flat=True))

    for registration in Registration.objects.all():
        while True:
            code = ''.join(random.choices(string.digits, k=5))
            if code not in used_codes:
                used_codes.add(code)
                break
        registration.tracking_code = code
        registration.save(update_fields=['tracking_code'])


class Migration(migrations.Migration):

    dependencies = [
        ('trips', '0002_registration_group_code'),
    ]

    operations = [
        migrations.RunPython(shrink_tracking_codes, reverse_code=migrations.RunPython.noop),
        migrations.AlterField(
            model_name='registration',
            name='tracking_code',
            field=models.CharField(max_length=5, verbose_name='کد پیگیری'),
        ),
        migrations.AlterUniqueTogether(
            name='registration',
            unique_together={('trip', 'tracking_code')},
        ),
    ]