from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, mobile, password=None, **extra_fields):
        if not mobile:
            raise ValueError('شماره موبایل الزامی است')
        user = self.model(mobile=mobile, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, mobile, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('user_type', 'superadmin')
        return self.create_user(mobile, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):

    USER_TYPE_CHOICES = (
        ('user', 'کاربر عادی'),
        ('admin', 'ادمین'),
        ('superadmin', 'سوپر ادمین'),
    )

    STATUS_CHOICES = (
        ('active', 'فعال'),
        ('inactive', 'غیرفعال'),
        ('blocked', 'مسدود'),
    )

    GENDER_CHOICES = (
        ('male', 'برادر'),
        ('female', 'خواهر'),
    )

    MARITAL_CHOICES = (
        ('single', 'مجرد'),
        ('married', 'متاهل'),
    )

    MILITARY_CHOICES = (
        ('exempt', 'معاف'),
        ('done', 'کارت پایان خدمت'),
        ('student', 'معافیت تحصیلی'),
        ('other', 'سایر'),
    )

    EDUCATION_CHOICES = (
        ('diploma', 'دیپلم'),
        ('associate', 'فوق دیپلم'),
        ('bachelor', 'لیسانس'),
        ('master', 'فوق لیسانس'),
        ('phd', 'دکترا'),
    )

    STUDENT_STATUS_CHOICES = (
        ('student', 'دانشجو'),
        ('graduate', 'فارغ‌التحصیل'),
        ('professor', 'استاد'),
    )
    # اطلاعات حساب
    mobile = models.CharField(max_length=11, unique=True, verbose_name='موبایل')
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='user', verbose_name='نوع کاربر')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', verbose_name='وضعیت')
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    # اطلاعات هویتی
    first_name = models.CharField(max_length=100, blank=True, verbose_name='نام')
    last_name = models.CharField(max_length=100, blank=True, verbose_name='نام خانوادگی')
    father_name = models.CharField(max_length=100, blank=True, verbose_name='نام پدر')
    first_name_en = models.CharField(max_length=100, blank=True, verbose_name='نام لاتین')
    last_name_en = models.CharField(max_length=100, blank=True, verbose_name='نام خانوادگی لاتین')
    national_code = models.CharField(max_length=10, unique=True, null=True, blank=True, verbose_name='کد ملی')
    birth_date = models.DateField(null=True, blank=True, verbose_name='تاریخ تولد')
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, verbose_name='جنسیت')
    marital_status = models.CharField(max_length=10, choices=MARITAL_CHOICES, blank=True, verbose_name='وضعیت تاهل')
    nationality = models.CharField(max_length=50, default='ایران', verbose_name='تابعیت')

    # اطلاعات تماس
    phone = models.CharField(max_length=11, blank=True, verbose_name='شماره منزل')
    address = models.TextField(blank=True, verbose_name='آدرس')
    emergency_name = models.CharField(max_length=100, blank=True, verbose_name='نام نزدیکان')
    emergency_phone = models.CharField(max_length=11, blank=True, verbose_name='شماره نزدیکان')
    emergency_relation = models.CharField(max_length=50, blank=True, verbose_name='نسبت')

    # اطلاعات دانشگاهی
    university = models.CharField(max_length=200, blank=True, verbose_name='نام دانشگاه')
    education_level = models.CharField(max_length=20, choices=EDUCATION_CHOICES, blank=True, verbose_name='مقطع تحصیلی')
    student_status = models.CharField(max_length=20, choices=STUDENT_STATUS_CHOICES, blank=True, verbose_name='وضعیت دانشجویی')

    # اطلاعات گذرنامه
    passport_number = models.CharField(max_length=20, blank=True, verbose_name='شماره گذرنامه')
    passport_expiry = models.DateField(null=True, blank=True, verbose_name='تاریخ انقضا گذرنامه')

    # اطلاعات بهداشتی
    has_disease = models.BooleanField(default=False, verbose_name='سابقه بیماری زمینه‌ای')
    disease_description = models.TextField(blank=True, verbose_name='توضیح بیماری')
    has_asthma = models.BooleanField(default=False, verbose_name='سابقه بیماری آسم/ریوی')
    has_allergy = models.BooleanField(default=False, verbose_name='حساسیت دارویی/غذایی')
    allergy_description = models.TextField(blank=True, verbose_name='توضیح حساسیت')

    # اطلاعات نظامی
    military_status = models.CharField(max_length=20, choices=MILITARY_CHOICES, blank=True, verbose_name='وضعیت نظام وظیفه')

    # کد سرپرست
    guardian_national_code = models.CharField(max_length=10, blank=True, verbose_name='کد ملی سرپرست')

    # تصاویر
    profile_image = models.ImageField(upload_to='profiles/', null=True, blank=True, verbose_name='عکس پرسنلی')
    national_card_image = models.ImageField(upload_to='national_cards/', null=True, blank=True, verbose_name='تصویر کارت ملی')
    student_card_image = models.ImageField(upload_to='student_cards/', null=True, blank=True, verbose_name='تصویر کارت دانشجویی')
    commitment_form = models.FileField(upload_to='commitments/', null=True, blank=True, verbose_name='تعهدنامه/رضایت‌نامه')
    passport_image = models.ImageField(upload_to='passports/', null=True, blank=True, verbose_name='تصویر گذرنامه')
    objects = UserManager()

    USERNAME_FIELD = 'mobile'
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = 'کاربر'
        verbose_name_plural = 'کاربران'

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.mobile})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"