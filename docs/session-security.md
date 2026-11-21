# نشست امن و BFF

این سند جایگزین محدودیت localStorage در گزارش فاز چهار است.

- نشست Django در دیتابیس است؛ مرورگر فقط شناسه opaque در cookie میزبان با HttpOnly و SameSite=Lax دارد. در HTTPS نام cookie با __Host- شروع می‌شود و Secure الزامی است.
- JWT قبلی پذیرفته نمی‌شود. کاربران پس از انتشار یک بار دوباره وارد می‌شوند؛ کلاینت کلیدهای قدیمی localStorage را پاک می‌کند.
- هر دو اپ درخواست API را از Next BFF می‌فرستند. Authorization مرورگر عبور نمی‌کند. فقط cookieهای نشست/CSRF مجاز عبور می‌کنند.
- CSRF از bootstrap نشست گرفته می‌شود، فقط در حافظه کلاینت می‌ماند، هنگام ورود/خروج می‌چرخد. Origin در BFF و Django کنترل می‌شود.
- خروج رکورد نشست را باطل می‌کند؛ بازپخش cookie قبلی بی‌اثر است. حساب مسدود هم نمی‌تواند نشست را ادامه دهد.
- /dashboard در Next با اطلاعات هویتی SSR می‌شود. زیربخش‌های داشبورد و مدیریت هنوز Vite هستند، اما قبل از ارسال صفحه در Next کنترل نشست و نقش می‌شوند. همه صفحات خصوصی و APIها private,no-store هستند.
- محدودیت ورود پیش‌فرض ۱۰ درخواست در ۶۰ ثانیه و ثبت‌نام ۵ درخواست در ساعت برای هر IP است. شمارنده دیتابیس با UPDATE شرطی اتمیک بین پردازش‌ها مشترک است؛ شکست دیتابیس پاسخ 503 می‌دهد. محدودیت از نوع پنجره ثابت است؛ پشت NAT سهم مشترک دارد.
- کار روزانه: `python manage.py prune_security_data`؛ migration جدید accounts.0004 اجرا شود.

## استقرار

برای Django: DJANGO_DEBUG=0، DJANGO_SECRET_KEY تصادفی حداقل ۵۰ کاراکتر، BFF_SHARED_SECRET تصادفی حداقل ۳۲ کاراکتر، APP_ORIGIN=https://دامنه، DJANGO_ALLOWED_HOSTS، متغیرهای POSTGRES_* و COOKIE_SECURE=1. نام دقیق متغیرهای hosts/secret را در core/settings.py ببینید.

برای Next: همان BFF_SHARED_SECRET، SITE_URL برابر APP_ORIGIN، API_ORIGIN آدرس داخلی Django، LEGACY_ORIGIN آدرس داخلی Vite/nginx و TRUST_PROXY_HEADERS=1 فقط پشت پراکسی مورد اعتماد. پورت‌های Django و Next باید فقط در loopback یا شبکه داخلی قابل دسترسی باشند. پراکسی باید X-Forwarded-For را بازنویسی کند؛ قالب deploy/https.production.conf.template این کار را می‌کند. Django در production دسترسی API بدون کلید داخلی BFF را رد می‌کند.

HTTPS عمومی با قالب nginx و گواهی معتبر fullchain.pem/privkey.pem فعال می‌شود. صدور و نصب گواهی عمومی به دامنه و دسترسی استقرار نیاز دارد؛ در این محیط استقرار عمومی انجام نشده است.

برای پیش‌نمایش محلی: گواهی توسعه در deploy/certs (gitignored) ساخته شده؛ `docker compose -f deploy/compose.https.yml up -d`، HTTPS روی localhost:8443 و انتقال HTTP از 8080 است. Django را با APP_ORIGIN=https://localhost:8443 و COOKIE_SECURE=1 و Next را با SITE_URL=https://localhost:8443 اجرا کنید. گواهی محلی self-signed است و باید در محیط توسعه مورد اعتماد قرار گیرد. HSTS برای localhost اعمال نمی‌شود. ALLOW_INSECURE_HTTP=1 فقط برای تست loopback است.

## بررسی‌های اجرایی

- پنج تست Django: CSRF، HttpOnly، خروج و بازپخش cookie، حساب مسدود، نرخ و جلوگیری از جعل IP با X-Forwarded-For.
- هشت تست واحد Next و پنج تست اپ قدیمی.
- build تولید هر دو اپ و typecheck.
- `npm run test:e2e` در frontend-next: Django واقعی با دیتابیس SQLite موقت و Next production؛ کنترل CSRF/Origin، cookie، SSR خصوصی، نقش، خروج و ابطال نشست. داده واقعی کاربران تغییر نمی‌کند. این تست HTTP است؛ جایگزین آزمون مرورگری جامع صفحات عمومی نیست.
- کانفیگ nginx محلی با nginx -t بررسی شده است.
