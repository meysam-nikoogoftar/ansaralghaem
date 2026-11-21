# Next frontend

پوستهٔ مهاجرت تدریجی اپ، با Next App Router و TypeScript strict. مسیرهای `/news`، `/news/[id]`، `/articles`، `/articles/[id]`، `/gallery`، `/login` و `/register` منتقل شده‌اند؛ باقی مسیرهای محصول از Vite ارائه می‌شوند.

## اجرا

Node نسخهٔ `.nvmrc` ریشه را در WSL فعال کنید و Django را روی 8000 و Vite را روی 5173 اجرا کنید. سپس:

```sh
cd frontend-next
npm ci
npm run dev
```

ورودی مشترک پورت 3000 است. متغیرهای `.env.example` را در صورت نیاز در `.env.local` قرار دهید. برای production، `SITE_URL` باید origin واقعی و عمومی سایت باشد تا canonical، Open Graph و sitemap آدرس درست داشته باشند. originها نباید path، query یا credentials داشته باشند.

برای اجرای production با Nginx محلی به [راهنمای فاز صفر](../docs/phase-zero.md) رجوع کنید. پس از تغییر originها یا تنظیمات rewrite دوباره build بگیرید.

## ساختار

```text
app/                 # routeها، metadata، loading/error و layout سرور
components/content/  # کارت‌ها، تصویر، گالری و نمایش تعاملات
components/layout/   # header/footer و navigation مشترک
components/auth/     # نشست کلاینت و gate مسیرهای خصوصی آینده
components/ui/       # فرم، پیام خطا، dialog و تاریخ جلالی
hooks/               # منطق کلاینت مستقل از نمایش
lib/api/public.ts    # فقط سرور؛ دریافت عمومی بدون credentials
lib/api/browser.ts   # فقط مصرف از کلاینت؛ API نسبی و refresh مشترک
lib/contracts.ts     # اعتبارسنجی runtime داده‌های ناشناخته
types/               # تایپ‌های دامنه با import صریح؛ بدون ambient any
proxy.ts             # CSP و nonce برای مسیرهای منتقل‌شده
../shared/           # منبع واحد مالکیت routeها برای Next و Vite
```

route group به نام `(list)` فقط loading فهرست را محدود می‌کند؛ جزئیات نباید از loading والد ارث ببرند و پیش از تشخیص 404 پاسخ 200 بفرستند.

## قواعد توسعه

- صفحه و محتوای اصلی Server Component باقی بماند؛ state و browser API در فایل‌های `use client` باشند. دادهٔ خصوصی را در public fetch یا cache مشترک نگذارید.
- تایپ‌ها از `@/types` وارد شوند؛ `any` و cast برای اعتماد به JSON مجاز نیست. دادهٔ API با schema اعتبارسنجی و فقط فیلدهای لازم به مرورگر منتقل شود.
- لینک داخلی از `AppLink` استفاده کند. برای مسیر جدید، مالکیت را در `shared/migration-routes.json` تغییر دهید و لینک‌های imperative قدیمی را نیز بررسی کنید.
- GET جزئیات خبر و مقاله در Django شمارندهٔ بازدید را تغییر می‌دهد؛ `get*Detail` با React cache فقط در یک render مشترک است و به صورت سراسری cache نمی‌شود. prefetch خودکار لینک‌ها خاموش است.
- فهرست‌های عمومی حداکثر ۶۰ ثانیه cache داده دارند. انتشار/ویرایش در پنل قدیمی ممکن است تا پایان این زمان در فهرست دیده نشود. مقدار صفر برای تست یا دریافت لحظه‌ای است؛ پیش‌فرض production را بدون دلیل صفر نکنید.
- URL تصویر فقط به مسیر محلی raster زیر `/media` تبدیل می‌شود. optimizer مقصد خارجی از دادهٔ API نمی‌پذیرد و مجوز IP خصوصی فعال نشده است. لینک آپارات فقط HTTPS با hostname مشخص مجاز است.
- محتوای نویسنده و نظر به شکل متن رندر می‌شود، نه HTML خام. JSON-LD جداگانه escape می‌شود. اسکریپت جدید باید nonce همان درخواست را دریافت کند.
- `AuthGate` به تنهایی کنترل امنیت سرور نیست؛ Django باید همچنان مجوزها را اعمال کند. نگهداری توکن در localStorage برای سازگاری با Vite حفظ شده؛ SSR خصوصی و مهاجرت به cookie HttpOnly در این فاز انجام نشده است.
- فرم‌های حساب Server Shell و ورودی‌های بومی دارند؛ منطق فرم در `use-auth-submission` و schemaهای آن در `lib/auth/validation.ts` است. رمز عبور normalize، log یا persist نمی‌شود. فرم‌ها `method="post"` دارند و پیش از hydration قابل ارسال نیستند؛ برای JSON فقط فیلدهای مجاز ارسال می‌شوند.
- auth pageها noindex و private/no-store هستند. مقدار `returnTo` باید با `safeReturnTo` بررسی شود. هنگام انتقال مسیرهای خصوصی دیگر، bridge مربوط به redirect برنامه‌ای Vite نیز حفظ شود؛ capture کردن کلیک لینک‌ها به‌تنهایی کافی نیست.
- CSS پایه از پروژهٔ فعلی منتقل شده تا ظاهر تغییر نکند؛ قواعد تازه در فایل‌های همان بخش قرار بگیرند. کامپوننت سه‌بعدی و کد اپ قدیمی وارد bundle صفحات منتقل‌شده نشوند.

## بررسی‌ها

```sh
npm run typecheck
npm test
npm run build
npm run test:e2e
```

تست E2E بک‌اند fixture خود را روی 8101، Next production را روی 3100 و Vite را روی 5173 اجرا و در پایان متوقف می‌کند. این پورت‌ها باید آزاد باشند. Playwright باید Chromium در دسترس داشته باشد؛ ابتدا `npx playwright install --with-deps chromium` اجرا کنید. مسیر اختیاری مرورگر را می‌توان با `CHROMIUM_PATH` تعیین کرد؛ روی دستگاه فعلی مرورگر موجود تشخیص داده می‌شود و در CI مرورگر نصب‌شدهٔ Playwright استفاده خواهد شد. دادهٔ تست به حساب واقعی ارسال نمی‌شود.

خروجی تصاویر، گزارش سناریوها و اندازهٔ انتقال منابع در `.test-artifacts/phase-two` است. نتیجهٔ زمان‌سنجی محلی معادل Lighthouse یا سرعت شبکهٔ واقعی کاربر نیست.

برای قالب‌بندی:

```sh
npx prettier --write app components hooks lib types tests styles proxy.ts next.config.mjs
```

برای برگرداندن یک مسیر به Vite، route متناظر Next و مالکیت مسیر را در یک تغییر برگردانید؛ نسخه‌های قبلی هنوز در `frontend` نگه داشته شده‌اند.
