from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('accounts', '0003_alter_user_status')]
    operations = [migrations.CreateModel(name='AuthRateBucket', fields=[
        ('key', models.CharField(max_length=64, primary_key=True, serialize=False)),
        ('attempts', models.PositiveIntegerField(default=0)),
        ('expires_at', models.DateTimeField(db_index=True)),
    ])]
