from django.core.management.base import BaseCommand
from django.contrib.sessions.models import Session
from django.utils import timezone
from accounts.models import AuthRateBucket


class Command(BaseCommand):
    help = 'Delete expired session and authentication rate-limit records.'

    def handle(self, *args, **options):
        now = timezone.now()
        AuthRateBucket.objects.filter(expires_at__lt=now).delete()
        Session.objects.filter(expire_date__lt=now).delete()
        self.stdout.write('Expired security records removed.')
