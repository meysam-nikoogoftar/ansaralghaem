// تبدیل تاریخ میلادی ↔ شمسی (الگوریتم نجومی استاندارد، بدون وابستگی به کتابخونه‌ی خارجی)

function div(a, b) {
  return Math.floor(a / b)
}

function mod(a, b) {
  return ((a % b) + b) % b
}

function gregorianToJDN(gy, gm, gd) {
  const a = div(14 - gm, 12)
  const y = gy + 4800 - a
  const m = gm + 12 * a - 3
  return gd + div(153 * m + 2, 5) + 365 * y + div(y, 4) - div(y, 100) + div(y, 400) - 32045
}

function jdnToGregorian(jdn) {
  const a = jdn + 32044
  const b = div(4 * a + 3, 146097)
  const c = a - div(146097 * b, 4)
  const d = div(4 * c + 3, 1461)
  const e = c - div(1461 * d, 4)
  const m = div(5 * e + 2, 153)
  const day = e - div(153 * m + 2, 5) + 1
  const month = m + 3 - 12 * div(m, 10)
  const year = 100 * b + d - 4800 + div(m, 10)
  return [year, month, day]
}

const PERSIAN_EPOCH = 1948320

function jalaliToJDN(jy, jm, jd) {
  const epbase = jy - (jy >= 0 ? 474 : 473)
  const epyear = 474 + mod(epbase, 2820)
  return (
    jd +
    (jm <= 7 ? (jm - 1) * 31 : (jm - 1) * 30 + 6) +
    div(epyear * 682 - 110, 2816) +
    (epyear - 1) * 365 +
    div(epbase, 2820) * 1029983 +
    PERSIAN_EPOCH
  )
}

function jdnToJalali(jdn) {
  const depoch = jdn - jalaliToJDN(475, 1, 1)
  const cycle = div(depoch, 1029983)
  const cyear = mod(depoch, 1029983)
  let ycycle
  if (cyear === 1029982) {
    ycycle = 2820
  } else {
    const aux1 = div(cyear, 366)
    const aux2 = mod(cyear, 366)
    ycycle = div(2134 * aux1 + 2816 * aux2 + 2815, 1028522) + aux1 + 1
  }
  let year = ycycle + 2820 * cycle + 474
  if (year <= 0) year -= 1
  const yday = jdn - jalaliToJDN(year, 1, 1) + 1
  const month = yday <= 186 ? Math.ceil(yday / 31) : Math.ceil((yday - 6) / 30)
  const day = jdn - jalaliToJDN(year, month, 1) + 1
  return [year, month, day]
}

export function gregorianToJalali(gy, gm, gd) {
  return jdnToJalali(gregorianToJDN(gy, gm, gd))
}

export function jalaliToGregorian(jy, jm, jd) {
  return jdnToGregorian(jalaliToJDN(jy, jm, jd))
}

export function isJalaliLeapYear(jy) {
  return jalaliToJDN(jy + 1, 1, 1) - jalaliToJDN(jy, 1, 1) === 366
}

export function jalaliMonthLength(jy, jm) {
  if (jm <= 6) return 31
  if (jm <= 11) return 30
  return isJalaliLeapYear(jy) ? 30 : 29
}

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

export function toPersianDigits(input) {
  return String(input).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[d])
}

export const JALALI_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
]

export const WEEKDAYS_FA = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']