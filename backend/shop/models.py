from django.db import models
from accounts.models import User


class ProductCategory(models.Model):
    name = models.CharField(max_length=100, verbose_name='نام')
    description = models.TextField(blank=True, verbose_name='توضیحات')

    class Meta:
        verbose_name = 'دسته‌بندی محصول'
        verbose_name_plural = 'دسته‌بندی‌های محصول'

    def __str__(self):
        return self.name


class Product(models.Model):
    code = models.CharField(max_length=20, unique=True, verbose_name='کد محصول')
    title = models.CharField(max_length=200, verbose_name='عنوان')
    category = models.ForeignKey(ProductCategory, on_delete=models.SET_NULL, null=True, related_name='products', verbose_name='دسته‌بندی')
    description = models.TextField(blank=True, verbose_name='توضیحات')
    main_image = models.ImageField(upload_to='products/', null=True, blank=True, verbose_name='تصویر اصلی')
    price = models.BigIntegerField(verbose_name='قیمت')
    discounted_price = models.BigIntegerField(null=True, blank=True, verbose_name='قیمت با تخفیف')
    stock = models.IntegerField(default=0, verbose_name='موجودی')
    is_published = models.BooleanField(default=False, verbose_name='منتشر شده')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'محصول'
        verbose_name_plural = 'محصولات'
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    @property
    def final_price(self):
        return self.discounted_price if self.discounted_price else self.price


class Order(models.Model):

    STATUS_CHOICES = (
        ('registered', 'ثبت شده'),
        ('paid', 'پرداخت شده'),
        ('shipped', 'ارسال شده'),
        ('delivered', 'تحویل داده شده'),
    )

    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders', verbose_name='خریدار')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='orders', verbose_name='محصول')
    quantity = models.IntegerField(default=1, verbose_name='تعداد')
    final_price = models.BigIntegerField(verbose_name='قیمت نهایی')
    order_number = models.CharField(max_length=20, unique=True, verbose_name='شماره خرید')
    address = models.TextField(verbose_name='آدرس تحویل')
    postal_code = models.CharField(max_length=10, verbose_name='کد پستی')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='registered', verbose_name='وضعیت')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'سفارش'
        verbose_name_plural = 'سفارشات'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.buyer.full_name} - {self.product.title}"

    def save(self, *args, **kwargs):
        if not self.order_number:
            import random
            import string
            self.order_number = ''.join(random.choices(string.digits, k=10))
        super().save(*args, **kwargs)