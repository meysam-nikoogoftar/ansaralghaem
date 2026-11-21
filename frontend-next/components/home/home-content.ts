import type { HomeSlide, HomePhoto, HomeNews } from '@/types/home'
const heroDomeSunset = '/home/hero-1-dome-sunset.jpg'
const heroAerialNight = '/home/hero-2-aerial-night.jpg'
const heroSilhouette = '/home/hero-3-silhouette-prayer.jpg'
const galleryPoster = '/home/gallery-1-poster.jpg'
const galleryDomeCloseup = '/home/gallery-2-dome-closeup.jpg'
const galleryTwinMinarets = '/home/gallery-3-twin-minarets.jpg'
const galleryRedInterior = '/home/gallery-4-red-interior.jpg'
const galleryMoonDome = '/home/gallery-5-moon-dome.jpg'
export const toFa = (n: number) =>
  String(n)
    .padStart(2, '0')
    .replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]!)

export const DEFAULT_SLIDES: HomeSlide[] = [
  {
    id: 1,
    image: heroDomeSunset,
    title: 'هفتمین کاروان پیاده‌روی اربعین حسینی',
    summary: 'از تهران تا کربلای معلی؛ همراه کاروان دانشجویی انصار القائم در مسیر عشق.',
    badge: 'ثبت‌نام آغاز شد · ظرفیت محدود',
    btnLabel: 'ثبت‌نام کاروان',
    link: '/dashboard/trips/register',
  },
  {
    id: 2,
    image: heroAerialNight,
    title: 'شب‌های حرم، همراه با میلیون‌ها عاشق',
    summary: 'کاروان با نظارت خادمین هیئت، در کنار جمعیت عظیم زائرین اربعین حسینی.',
    badge: 'پیاده‌روی اربعین · نجف تا کربلا',
    btnLabel: 'مشاهده جزئیات کاروان',
    link: '/dashboard/trips/register',
  },
  {
    id: 3,
    image: heroSilhouette,
    title: 'خادمانی کوچک، برای آقایی بزرگ',
    summary: 'هیئت انصار القائم با جمعی از دانشجویان دلباخته اباعبدالله، از سال ۱۳۹۷.',
    badge: 'هیئت دانشجویی · از سال ۱۳۹۷',
    btnLabel: 'آشنایی با هیئت',
    link: '/dashboard',
  },
]

export const GALLERY_TABS = [
  { key: 'all', label: 'همه' },
  { key: 'night', label: 'شب‌های مسیر' },
  { key: 'dome', label: 'گنبد و بارگاه' },
  { key: 'servants', label: 'خادمین کاروان' },
  { key: 'mokeb', label: 'موکب اربعین' },
  { key: 'path', label: 'مسیر پیاده‌روی' },
]

export const STATIC_GALLERY: HomePhoto[] = [
  {
    id: 1,
    image: galleryPoster,
    title: 'پوستر هفتمین کاروان اربعین',
    category: 'mokeb',
    featured: true,
  },
  {
    id: 2,
    image: galleryDomeCloseup,
    title: 'گنبدهای طلایی حرم',
    category: 'dome',
    featured: false,
  },
  {
    id: 3,
    image: galleryTwinMinarets,
    title: 'مناره‌های حرم در غروب',
    category: 'dome',
    featured: false,
  },
  { id: 4, image: galleryRedInterior, title: 'رواق حرم مطهر', category: 'night', featured: false },
  {
    id: 5,
    image: galleryMoonDome,
    title: 'گنبد طلایی زیر ماه',
    category: 'night',
    featured: false,
  },
  { id: 6, image: heroDomeSunset, title: 'غروب بر فراز حرم', category: 'dome', featured: false },
  {
    id: 7,
    image: heroAerialNight,
    title: 'ازدحام زائرین در شب اربعین',
    category: 'path',
    featured: false,
  },
  { id: 8, image: heroSilhouette, title: 'دعا در صحن حرم', category: 'servants', featured: false },
]

export const STATIC_NEWS: HomeNews[] = [
  {
    id: 1,
    title: 'آغاز ثبت‌نام هفتمین دوره کاروان پیاده اربعین انصار القائم',
    image: galleryPoster,
    excerpt: 'ثبت‌نام کاروان با اولویت دانشجویان و اساتید از امروز آغاز شد. ظرفیت محدود است.',
    date: '۱۴۰۵/۰۲/۱۲',
    category: 'ثبت‌نام کاروان',
    link: '/news',
  },
  {
    id: 2,
    title: 'جلسه توجیهی کاروانیان، ۲۹ تیرماه برگزار می‌شود',
    image: galleryTwinMinarets,
    excerpt: 'حضور در جلسه توجیهی الزامی بوده و عدم حضور به منزله انصراف تلقی می‌گردد.',
    date: '۱۴۰۵/۰۱/۲۸',
    category: 'اطلاعیه',
    link: '/news',
  },
  {
    id: 3,
    title: 'شروع پویش مغناطیس حسینی در آستانه اربعین',
    image: galleryRedInterior,
    excerpt: 'پویشی مردمی برای جذب کمک‌های خیرین جهت پوشش هزینه زائرین کم‌بضاعت.',
    date: '۱۴۰۴/۱۲/۰۵',
    category: 'پویش مردمی',
    link: '/news',
  },
]
