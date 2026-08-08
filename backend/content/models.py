from django.db import models
from accounts.models import User


class Article(models.Model):

    CATEGORY_CHOICES = (
        ('article', 'دلنوشته'),
        ('memory', 'خاطره'),
        ('munajat', 'مناجات'),
        ('madahi', 'کلیپ مداحی'),
        ('mouludi', 'کلیپ مولودی'),
    )

    STATUS_CHOICES = (
        ('pending', 'در انتظار بررسی'),
        ('approved', 'تایید شده'),
        ('rejected', 'رد شده'),
    )

    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='articles', verbose_name='نویسنده')
    title = models.CharField(max_length=200, verbose_name='عنوان')
    content = models.TextField(verbose_name='متن')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, verbose_name='دسته‌بندی')
    main_image = models.ImageField(upload_to='articles/', null=True, blank=True, verbose_name='تصویر اصلی')
    extra_image1 = models.ImageField(upload_to='articles/', null=True, blank=True, verbose_name='تصویر اضافی ۱')
    extra_image2 = models.ImageField(upload_to='articles/', null=True, blank=True, verbose_name='تصویر اضافی ۲')
    extra_image3 = models.ImageField(upload_to='articles/', null=True, blank=True, verbose_name='تصویر اضافی ۳')
    aparat_link = models.CharField(max_length=200, blank=True, verbose_name='لینک آپارات')
    is_featured = models.BooleanField(default=False, verbose_name='پیش‌نمایش')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name='وضعیت')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_articles', verbose_name='تاییدکننده')
    approved_at = models.DateTimeField(null=True, blank=True, verbose_name='تاریخ تایید')
    views_count = models.IntegerField(default=0, verbose_name='بازدید')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'دلنوشته'
        verbose_name_plural = 'دلنوشته‌ها'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class News(models.Model):
    title = models.CharField(max_length=200, verbose_name='عنوان')
    image = models.ImageField(upload_to='news/', null=True, blank=True, verbose_name='تصویر')
    content = models.TextField(verbose_name='متن کامل')
    is_published = models.BooleanField(default=False, verbose_name='منتشر شده')
    views_count = models.IntegerField(default=0, verbose_name='بازدید')
    published_at = models.DateTimeField(null=True, blank=True, verbose_name='تاریخ انتشار')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'خبر'
        verbose_name_plural = 'اخبار'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Gallery(models.Model):

    STATUS_CHOICES = (
        ('pending', 'در انتظار بررسی'),
        ('approved', 'تایید شده'),
        ('rejected', 'رد شده'),
    )

    uploader = models.ForeignKey(User, on_delete=models.CASCADE, related_name='gallery_images', verbose_name='فرستنده')
    title = models.CharField(max_length=200, blank=True, verbose_name='عنوان')
    image = models.ImageField(upload_to='gallery/', verbose_name='تصویر')
    category = models.CharField(max_length=100, blank=True, verbose_name='دسته‌بندی')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name='وضعیت')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_gallery', verbose_name='تاییدکننده')
    approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'تصویر گالری'
        verbose_name_plural = 'گالری تصاویر'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.uploader.full_name} - {self.title}"


class Download(models.Model):

    CATEGORY_CHOICES = (
        ('madahi', 'کلیپ مداحی'),
        ('memory', 'خاطره'),
        ('munajat', 'مناجات'),
        ('mouludi', 'کلیپ مولودی'),
        ('other', 'دانلوشته'),
    )

    title = models.CharField(max_length=200, verbose_name='عنوان')
    file = models.FileField(upload_to='downloads/', null=True, blank=True, verbose_name='فایل')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, verbose_name='دسته‌بندی')
    description = models.TextField(blank=True, verbose_name='توضیحات')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'دانلوشته'
        verbose_name_plural = 'دانلوشته‌ها'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Slider(models.Model):
    image = models.ImageField(upload_to='sliders/', verbose_name='تصویر')
    title = models.CharField(max_length=200, blank=True, verbose_name='عنوان')
    summary = models.TextField(blank=True, verbose_name='خلاصه')
    link = models.CharField(max_length=500, blank=True, verbose_name='لینک')
    is_active = models.BooleanField(default=True, verbose_name='فعال')
    order = models.IntegerField(default=0, verbose_name='ترتیب')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'اسلایدر'
        verbose_name_plural = 'اسلایدرها'
        ordering = ['order']

    def __str__(self):
        return self.title


class Announcement(models.Model):

    TYPE_CHOICES = (
        ('info', 'اطلاعیه'),
        ('warning', 'هشدار'),
        ('welcome', 'خوش‌آمد'),
    )

    text = models.TextField(verbose_name='متن')
    announcement_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='info', verbose_name='نوع')
    is_active = models.BooleanField(default=True, verbose_name='فعال')
    start_date = models.DateTimeField(verbose_name='از تاریخ')
    end_date = models.DateTimeField(verbose_name='تا تاریخ')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'اعلان'
        verbose_name_plural = 'اعلان‌ها'

    def __str__(self):
        return self.text[:50]