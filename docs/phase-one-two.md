# گزارش تکمیل فاز یک و دو مهاجرت به Next

تاریخ بررسی: ۲۱ نوامبر ۲۰۲۶. مقصد کد `frontend-next` و برنچ کار `change-framework` است. تغییرات این فاز هنوز کامیت یا منتشر نشده‌اند.

## مسیرهای منتقل‌شده

| URL | فایل مقصد | رندر و رفتار |
|---|---|---|
| `/news` | `app/(public)/news/(list)/page.tsx` | فهرست SSR با loading و empty |
| `/news/:id` | `app/(public)/news/[id]/page.tsx` | محتوای SSR، metadata، JSON-LD و 404 واقعی |
| `/articles` | `app/(public)/articles/(list)/page.tsx` | فیلتر قابل اشتراک با query، refresh و بازگشت مرورگر |
| `/articles/:id` | `app/(public)/articles/[id]/page.tsx` | محتوای SSR؛ نظر، پاسخ و واکنش در کلاینت |
| `/gallery` | `app/(public)/gallery/page.tsx` | تصاویر SSR و نمایش بزرگ با dialog بومی و کنترل صفحه‌کلید |

خانه، فروشگاه، پیگیری، ورود، داشبورد و مدیریت همچنان متعلق به اپ Vite هستند. فایل‌های قدیمی مسیرهای منتقل‌شده برای امکان rollback نگه داشته شده‌اند.

## فاز یک: پایهٔ مشترک

- TypeScript strict همراه `noUncheckedIndexedAccess`، `noUnusedLocals` و `noUnusedParameters` فعال است. تایپ‌های دامنه از schemaهای معتبر استخراج و از `types/index.ts` به شکل صریح صادر می‌شوند؛ ambient global یا `any` برای دادهٔ API وجود ندارد.
- QueryClient در provider هر اپ پایدار است و به صورت global در سرور ساخته نمی‌شود. تنظیمات retry و refetch قبلی حفظ شده‌اند.
- نشست و تم در providerهای کلاینت نگه داشته می‌شوند. خواندن storage پس از mount انجام می‌شود؛ بررسی ورود عمومی را مسدود نمی‌کند. خطای شبکه با نشست نامعتبر یکی گرفته نمی‌شود.
- refresh توکن بین درخواست‌های هم‌زمان مشترک است. logout هنگام refresh اجازهٔ احیای توکن قبلی را نمی‌دهد. خروج و تغییر storage، دادهٔ QueryClient را پاک می‌کنند.
- Navbar، Footer، AccountMenu، ThemeToggle، Announcement، bottom navigation و layout عمومی به کامپوننت‌های مستقل منتقل شده‌اند؛ برند فقط یک H1 در صفحهٔ محتوا باقی می‌گذارد.
- فرم، validation، پیام خطا، loading و تاریخ جلالی تایپ‌شده در `components/ui` آماده‌اند. dialog بومی مرورگر جای منطق دستی focus trap را گرفته است و Escape و بازگشت focus بررسی شده‌اند.
- فونت محلی با `next/font/local`، display swap و preload داخلی Next ارائه می‌شود. توکن‌ها و CSS فعلی برای حفظ ظاهر منتقل شده‌اند.
- `shared/migration-routes.json` منبع واحد مالک مسیرهاست. `AppLink` در Next و `MigrationBoundary` در Vite عبور کامل بین دو اپ را انجام می‌دهند. ورود قدیمی نیز مقصد منتقل‌شده را با navigation کامل باز می‌کند.
- مقصد بازگشت به شکل query داخلی معتبر است. پیش‌نویس نظر برای بازگشت از ورود در sessionStorage همان تب نگه داشته می‌شود و در URL قرار نمی‌گیرد؛ زمان اعتبار یک ساعت است.

## کارایی و SEO

- متن اصلی و عنوان هر پنج مسیر در HTML سرور وجود دارد؛ متن جزئیات بدون JavaScript هم خوانده می‌شود.
- فهرست‌ها و اعلان‌ها به طور پیش‌فرض ۶۰ ثانیه cache داده دارند. جزئیات خبر و مقاله cache بین درخواست‌ها ندارند چون endpoint فعلی Django بازدید را افزایش می‌دهد. React cache از درخواست تکراری metadata و همان صفحه جلوگیری می‌کند.
- prefetch خودکار لینک‌ها خاموش است تا ورود فرضی به جزئیات، بازدید را تغییر ندهد و دادهٔ اضافی دریافت نشود.
- تصاویر با `next/image`، sizes متناسب با کارت/جزئیات/آواتار، ابعاد ثابت و preload تصویر اصلی ارائه می‌شوند. font یا اسکریپت خارجی برای صفحات عمومی لازم نیست؛ WebGL و Three.js اپ قدیمی در این صفحات بارگیری نمی‌شوند.
- metadata فارسی، canonical، Open Graph، Twitter، JSON-LD مقاله/خبر، robots و sitemap اضافه شده‌اند. فیلتر دسته‌بندی canonical فهرست دارد و noindex می‌شود.
- loading فهرست‌ها در route group جداست تا پاسخ 404 جزئیات زودتر با وضعیت 200 stream نشود. خطای upstream از محتوای ناموجود تفکیک و تلاش مجدد با refresh دادهٔ سرور انجام می‌شود.
- اندازهٔ JavaScript دریافتی در تست محلی production حدود ۱۸۴ تا ۱۹۱ کیلوبایت encoded بود. زمان‌های محلی و جزئیات منابع در گزارش تست ذخیره‌اند؛ این اعداد معیار Lighthouse یا تضمین سرعت روی اینترنت موبایل نیستند.
- `SITE_URL` پیش از انتشار واقعی باید روی origin عمومی سایت تنظیم شود؛ مقدار localhost فقط برای پیش‌نمایش محلی است.

## امنیت

- دریافت عمومی سرور هیچ Authorization یا cookie کاربر را به Django ارسال نمی‌کند. schemaها فیلدهای اضافهٔ داخلی بک‌اند را پیش از رندر حذف می‌کنند.
- شناسه و category پیش از ساخت URL اعتبارسنجی می‌شوند. مقصد API ثابت و سمت سرور است؛ کاربر نمی‌تواند آدرس مقصد fetch را تعیین کند.
- optimizer تصویر فقط مسیر محلی raster زیر `/media` و لوگوی ثابت را می‌پذیرد. origin، query و credentials تصاویر API حذف می‌شوند؛ SVG و traversal پذیرفته نیستند و مجوز IP خصوصی optimizer فعال نشده است.
- متن خبر، مقاله و نظر HTML خام نیست. JSON-LD برای جلوگیری از بسته‌شدن script escape می‌شود. لینک آپارات تنها HTTPS با hostname مشخص را می‌پذیرد.
- مسیرهای منتقل‌شده CSP با nonce اختصاصی هر درخواست، محدودیت frame/object/form و headerهای امنیتی دارند. HTML/RSC دارای nonce نباید در cache عمومی قرار بگیرد؛ cache دادهٔ عمومی مستقل است.
- کنترل نقش کلاینت تنها برای تجربهٔ کاربری است؛ مجوز واقعی همچنان باید در Django اعمال شود. توکن‌ها برای هم‌زیستی با Vite در localStorage مانده‌اند؛ cookie HttpOnly، SSR خصوصی و تغییر قرارداد نشست بخشی از این فاز نیستند.

## شواهد بررسی

| بررسی | نتیجه |
|---|---|
| Next typecheck و build production | موفق |
| تست‌های واحد امنیت، قرارداد API و تاریخ | ۷ از ۷ موفق |
| Vite build، lint و تست واحد | موفق؛ ۵ از ۵ تست |
| SSR، metadata، JSON-LD، sitemap و robots | موفق |
| درخواست جزئیات مشترک بین metadata و صفحه | دقیقاً یک درخواست در هر render |
| شناسهٔ نامعتبر و محتوای ناموجود | HTTP 404 همراه noindex |
| خواندن محتوا با JavaScript خاموش | موفق |
| موبایل 390px تیره و دسکتاپ 1440px روشن | بدون overflow، یک H1 و بدون خطای JS/تصویر |
| فیلتر، refresh، Escape و بازگشت focus گالری | موفق |
| ورود از Vite و بازگشت به مقاله همراه پیش‌نویس | موفق |
| نظر، پاسخ و جلوگیری از ارسال/واکنش تکراری | موفق روی fixture مستقل |
| navigation داخل Next و عبور به/از Vite | موفق |
| حالت خالی، قطعی API و تلاش مجدد | موفق |
| اتصال read-only به Django واقعی روی 3000 | smoke مسیرهای عمومی و خصوصی قدیمی موفق |
| مرورگر با Django واقعی برای اخبار، مقاله‌ها و گالری | عنوان و H1 درست، لینک ورود درست و بدون خطای JavaScript |

تست E2E دیتابیس واقعی را تغییر نمی‌دهد. خروجی کامل و تصاویر در `frontend-next/.test-artifacts/phase-two` قرار دارند؛ نسخهٔ قابل مرور گزارش و چند تصویر منتخب در `docs/phase-two-baseline` نگه داشته می‌شوند. workflow CI برای build، typecheck، unit و E2E تعریف شده ولی اجرای remote آن هنوز انجام نشده است.

بررسی مکانیکی طراحی نیز انجام شد؛ هشدارهای gradient مربوط به CSS به‌ارث‌رسیدهٔ اپ قبلی بود. این فاز بازطراحی هویت بصری نیست؛ رندر واقعی پنج صفحه در دو اندازه بازبینی شد.

## اجرا و ادامه

دستورها و قرارداد توسعه در [README پوسته](../frontend-next/README.md) آمده است. فاز بعدی طبق [برنامهٔ مهاجرت](NEXT-MIGRATION-PLAN.md)، فروشگاه، پیگیری و سپس خانه است. قبل از انتقال صفحهٔ بعدی، همان قرارداد مالکیت مسیر، تست SSR/تعامل و روش rollback حفظ شود.

مراجع فنی: [Server/Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)، [Metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)، [Images](https://nextjs.org/docs/app/api-reference/components/image)، [TanStack SSR](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr).
