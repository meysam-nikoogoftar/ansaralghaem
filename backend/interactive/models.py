from django.db import models
from accounts.models import User
from trips.models import Trip


class Reaction(models.Model):

    REACTION_TYPE_CHOICES = (
        ('heart', '❤️'),
        ('pray', '🤲'),
        ('cry', '😢'),
        ('rose', '🌹'),
    )

    CONTENT_TYPE_CHOICES = (
        ('article', 'دلنوشته'),
        ('gallery', 'گالری'),
        ('lovewall', 'دیوار عشق'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reactions', verbose_name='کاربر')
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPE_CHOICES, verbose_name='نوع محتوا')
    content_id = models.IntegerField(verbose_name='شناسه محتوا')
    reaction_type = models.CharField(max_length=10, choices=REACTION_TYPE_CHOICES, verbose_name='نوع ریکشن')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'ریکشن'
        verbose_name_plural = 'ریکشن‌ها'
        unique_together = ('user', 'content_type', 'content_id')

    def __str__(self):
        return f"{self.user.full_name} - {self.reaction_type}"


class Comment(models.Model):

    STATUS_CHOICES = (
        ('approved', 'تایید شده'),
        ('rejected', 'رد شده'),
    )

    CONTENT_TYPE_CHOICES = (
        ('article', 'دلنوشته'),
        ('gallery', 'گالری'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments', verbose_name='کاربر')
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPE_CHOICES, verbose_name='نوع محتوا')
    content_id = models.IntegerField(verbose_name='شناسه محتوا')
    text = models.TextField(verbose_name='متن')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies', verbose_name='پاسخ به')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='approved', verbose_name='وضعیت')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'کامنت'
        verbose_name_plural = 'کامنت‌ها'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.full_name} - {self.text[:50]}"


class LoveWall(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='love_wall_posts', verbose_name='کاربر')
    text = models.CharField(max_length=280, verbose_name='متن')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'دیوار عشق'
        verbose_name_plural = 'دیوار عشق'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.full_name} - {self.text[:50]}"


class Poll(models.Model):
    question = models.CharField(max_length=500, verbose_name='سوال')
    is_active = models.BooleanField(default=True, verbose_name='فعال')
    start_date = models.DateTimeField(verbose_name='از تاریخ')
    end_date = models.DateTimeField(verbose_name='تا تاریخ')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'نظرسنجی'
        verbose_name_plural = 'نظرسنجی‌ها'

    def __str__(self):
        return self.question


class PollOption(models.Model):
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE, related_name='options', verbose_name='نظرسنجی')
    text = models.CharField(max_length=200, verbose_name='متن گزینه')

    class Meta:
        verbose_name = 'گزینه نظرسنجی'
        verbose_name_plural = 'گزینه‌های نظرسنجی'

    def __str__(self):
        return f"{self.poll.question} - {self.text}"


class PollVote(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='poll_votes', verbose_name='کاربر')
    option = models.ForeignKey(PollOption, on_delete=models.CASCADE, related_name='votes', verbose_name='گزینه')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'رای'
        verbose_name_plural = 'آرا'
        unique_together = ('user', 'option')

    def __str__(self):
        return f"{self.user.full_name} - {self.option.text}"


class TripTimeline(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='timeline_posts', verbose_name='کاربر')
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='timeline_posts', verbose_name='سفر')
    title = models.CharField(max_length=200, verbose_name='عنوان')
    text = models.TextField(verbose_name='متن')
    image = models.ImageField(upload_to='timeline/', null=True, blank=True, verbose_name='تصویر')
    event_date = models.DateField(verbose_name='تاریخ رویداد')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'تایم‌لاین سفر'
        verbose_name_plural = 'تایم‌لاین‌های سفر'
        ordering = ['event_date']

    def __str__(self):
        return f"{self.user.full_name} - {self.title}"


class Badge(models.Model):
    title = models.CharField(max_length=100, verbose_name='عنوان')
    icon = models.CharField(max_length=10, verbose_name='آیکون')
    required_trips = models.IntegerField(verbose_name='تعداد سفر لازم')

    class Meta:
        verbose_name = 'بج'
        verbose_name_plural = 'بج‌ها'

    def __str__(self):
        return self.title


class UserBadge(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='badges', verbose_name='کاربر')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name='users', verbose_name='بج')
    awarded_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ دریافت')

    class Meta:
        verbose_name = 'بج کاربر'
        verbose_name_plural = 'بج‌های کاربران'
        unique_together = ('user', 'badge')

    def __str__(self):
        return f"{self.user.full_name} - {self.badge.title}"


class PilgrimLocation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='locations', verbose_name='کاربر')
    latitude = models.FloatField(verbose_name='عرض جغرافیایی')
    longitude = models.FloatField(verbose_name='طول جغرافیایی')
    recorded_at = models.DateTimeField(auto_now_add=True, verbose_name='زمان ثبت')

    class Meta:
        verbose_name = 'موقعیت زائر'
        verbose_name_plural = 'موقعیت زائرین'
        ordering = ['-recorded_at']

    def __str__(self):
        return f"{self.user.full_name} - {self.recorded_at}"