# اجرای فاز صفر و خط مبنای مهاجرت

## محیط ثابت

Node `22.23.2` در `.nvmrc` ریشه و پوسته ثبت شده است؛ engines هر دو package روی `22.23.x` است. دستورات را داخل WSL و مسیر لینوکسی اجرا کنید، نه با npm ویندوز روی UNC.

```sh
cd /home/parham/ansaralghaem
nvm install
nvm use
cd frontend && npm ci
cd ../frontend-next && npm ci
```

اگر Node با روش دیگری نصب شده، خروجی `node -v` باید همان نسخه باشد. lockfileها باید ثبت شوند و registry خصوصی/موقت نباید در آن‌ها باقی بماند.

## اجرای توسعه، هر دستور در ترمینال مستقل

```sh
backend/.venv/bin/python backend/manage.py runserver 127.0.0.1:8000
```

```sh
cd frontend && npm run dev
```

```sh
cd frontend-next && npm run dev
```

ورودی مشترک `http://127.0.0.1:3000` است؛ مسیر `/migration` از Next و مسیرهای محصول از Vite می‌آیند. Django به دیتابیس محلی تنظیم‌شدهٔ پروژه متصل می‌شود؛ تست ناشناس زیر تغییری در داده ایجاد نمی‌کند.

```sh
node scripts/check-migration.mjs
```

این تست HTML دو اپ، دسترسی مستقیم مسیرهای SPA، فایل‌های JS/CSS، پاسخ JSON 401 پروفایل مهمان و 404 فایل media ناموجود را بررسی می‌کند. این تست جای تست مرورگر و مجوزهای نقش‌ها را نمی‌گیرد.

## استقرار آزمایشی production روی همین دستگاه

ابتدا dev server پوسته را متوقف کنید تا پورت 3000 آزاد شود.

```sh
cd frontend && npm run build
cd ..
docker compose -f deploy/compose.phase-zero.yml up -d
cd frontend-next
LEGACY_ORIGIN=http://127.0.0.1:5174 API_ORIGIN=http://127.0.0.1:8000 npm run build
LEGACY_ORIGIN=http://127.0.0.1:5174 API_ORIGIN=http://127.0.0.1:8000 npm start
```

در ترمینال دیگر از ریشه:

```sh
node scripts/check-migration.mjs
```

Nginx خروجی Vite را روی 5174 ارائه می‌کند. مسیر عمیق SPA به index.html می‌رود و asset ناموجود زیر `/assets` باید 404 بدهد. این محیط آزمایشی محلی است؛ Django runserver، DEBUG و تنظیمات دیتابیس فعلی برای استقرار عمومی تولید آماده نشده‌اند.

توقف Nginx پس از بررسی:

```sh
docker compose -f deploy/compose.phase-zero.yml down
```

## خط مبنای رفتار و تصویر

```sh
cd frontend
npm run build
npm run lint
npm test
```

اسکریپت موجود `scripts/browser-check.mjs` به Chromium با CDP روی 9223 نیاز دارد. از پروفایل موقت و مستقل استفاده شود؛ APIهای آن با دادهٔ fixture رهگیری می‌شوند و تست رفتاری آن تست یکپارچگی دیتابیس واقعی نیست.

```sh
AUDIT_BASE_URL=http://127.0.0.1:3000 node scripts/browser-check.mjs
AUDIT_BASE_URL=http://127.0.0.1:3000 node scripts/browser-check.mjs --visual
```

خروجی JSON و PNG در `frontend/.test-artifacts` است و وارد Git نمی‌شود. تصاویر مرجع باید همراه نتیجهٔ تست نگه داشته شوند. فایل‌های تصویر، فونت و پاسخ API واقعی جدا از fixture در smoke و مرورگر بررسی شوند.

## سناریوهای مرجع پیش از انتقال اولین صفحه

| جریان | رفتار مورد انتظار |
|---|---|
| عمومی | خانه، اخبار و مقاله، گالری، فروشگاه و پیگیری از origin مشترک باز شوند |
| ورود | مهمان مسیر خصوصی را باز کند، به login برسد و مقصد بازگشت حفظ شود |
| کاربر | پروفایل، سفر، کیف پول، سفارش و تیکت با نقش کاربر دیده شوند |
| مدیریت | نقش مجاز وارد پنل شود؛ کاربر عادی و مهمان دسترسی نداشته باشند |
| فرم | خطای فیلدی، قطع شبکه، تلاش مجدد و ارسال موفق مطابق رفتار موجود باشد |
| ظاهر | موبایل/دسکتاپ، روشن/تیره، فونت، RTL و منو با PNGهای مرجع تطبیق داشته باشد |
| زیرساخت توسعه | HMR از Vite برقرار باشد، فایل‌های وابسته به HTML نیز بارگذاری شوند |

شکست‌های قبلی اپ باید با نام تست، نشانهٔ خطا و artifact ثبت شوند و با موفقیت زیرساخت اشتباه گرفته نشوند.

## نتایج ثبت‌شده — ۲۱ نوامبر ۲۰۲۶

- Node داخل WSL: `v22.23.2`، npm: `11.13.0`؛ Django system check بدون خطا.
- Next دقیقاً `16.4.6` و lockfile مستقل با URL رجیستری رسمی و integrity ثبت‌شده در فایل است؛ `npm ci` عادی برای هر دو اپ و build نهایی هر دو موفق شدند. به دلیل مشکل دریافت شبکه، نصب از cache کامل‌شده با `--offline` تأیید شد؛ CI از رجیستری عادی استفاده می‌کند.
- توسعه: ۹ بررسی smoke مسیر/asset/API/media پاس شدند؛ مرورگر بدون خطای منابع یا JavaScript، فونت بارگذاری‌شده و HMR با وضعیت 101 تأیید شد.
- production محلی: همان ۹ بررسی smoke با JS/CSS خروجی build پاس شدند؛ مرورگر بدون خطا و فونت بارگذاری‌شده تأیید شد. API مهمان پاسخ JSON با وضعیت 401 دارد و media ناموجود به Django می‌رسد.
- دو اصلاح زیرساختی ضروری اعمال شد: نگه‌داشتن اسلش پایانی API در rewrite برای جلوگیری از حلقهٔ redirect با Django، و برگرداندن query flagهای خالی Vite مانند `raw=` به `raw` در middleware توسعه. در غیر این صورت import خام SVG پشت پوسته خراب می‌شد.
- build اپ Vite موفق؛ lint بدون خطا؛ تست واحد ۵ از ۵ موفق.
- هشدار قبلی build: دو chunk اصلی حدود ۵۴۸ و ۶۷۱ کیلوبایت هستند و از حد پیشنهادی ۵۰۰ کیلوبایت بزرگ‌ترند. این هشدار مانع build نیست و بهینه‌سازی آن در فاز صفر انجام نشده است.
- Nginx محلی روی 5174 از build واقعی Vite اجرا شد؛ asset ناموجود پاسخ 404 می‌دهد.
- بررسی route/field/reflow در پنج عرض `360, 390, 768, 1024, 1440` و هر دو تم موفق بود. ۱۱ بررسی تعاملی بعدی نیز پاس شدند.
- مجموعهٔ کامل workflow در `frontend/scripts/browser-check.mjs:425` متوقف شد: selector `.tk-reply-row input` برای focus پاسخ تیکت عنصری پیدا نکرد. این شکست تست موجود قبل از انتقال صفحات است؛ بقیهٔ تست‌های بعد از آن اجرا نشدند. `browserErrors` تا این نقطه خالی بود.
- بررسی مستقل visual در عرض‌های 390 و 1440 و هر دو تم، ۴ از ۴ پاس شد؛ ۱۱۶ درخواست API با fixture پاسخ داده شدند.
- چهار تصویر خانه و خروجی JSON تست‌ها در [phase-zero-baseline](phase-zero-baseline/) نگه داشته شده‌اند. تصاویر fixture مرجع رابط هستند و تأیید دادهٔ واقعی بک‌اند محسوب نمی‌شوند.
- CI برای نصب و build هر دو اپ و lint/test اپ فعلی تعریف شده است؛ اجرای remote آن هنوز انجام نشده است. این گزارش موفقیت اجرای محلی را ثبت می‌کند.

برای مرورگر واقعی و HMR، پس از اجرای سه سرویس و Chromium با پورت CDP برابر 9223، از ریشه اجرا کنید:

```sh
node scripts/check-migration.mjs
node scripts/check-migration-browser.mjs --dev
```

در حالت production، دستور دوم بدون `--dev` اجرا شود. این بررسی API را mock نمی‌کند و بارگذاری assetها، فونت و خطاهای مرورگر را می‌سنجد.
