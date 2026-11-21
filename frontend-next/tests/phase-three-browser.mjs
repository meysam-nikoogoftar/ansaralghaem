import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || (existsSync('/home/parham/.cache/ms-playwright/chromium-1179/chrome-linux/chrome') ? '/home/parham/.cache/ms-playwright/chromium-1179/chrome-linux/chrome' : undefined), args: ['--no-sandbox'] })
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
const page = await context.newPage()
const errors = []
page.on('pageerror', error => errors.push(error.message))
const timings = {}
await context.addInitScript(() => { window.__vitals = { cls: 0, lcp: 0 }; new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__vitals.cls += entry.value }).observe({ type: 'layout-shift', buffered: true }); new PerformanceObserver(list => { for (const entry of list.getEntries()) window.__vitals.lcp = entry.startTime }).observe({ type: 'largest-contentful-paint', buffered: true }) })
const output = '.test-artifacts/phase-three'
await mkdir(output, { recursive: true })
try {
  const home = await page.goto('http://127.0.0.1:3100/')
  assert.equal(home.status(), 200)
  assert.ok((await home.text()).includes('خادمانی کوچک'))
  assert.equal(await page.locator('h1').count(), 1)
  assert.equal(await page.locator('a[href^="javascript:"]').count(), 0)
  await page.getByRole('button', { name: 'اسلاید بعدی' }).click()
  await page.locator('#gallery .gallery-item').first().click()
  await page.getByRole('dialog').waitFor()
  await page.keyboard.press('Escape')
  await page.locator('#gallery .gallery-tab').nth(1).click()
  await page.screenshot({ path: `${output}/home-desktop.png`, fullPage: true })
  await page.goto('http://127.0.0.1:3100/shop')
  await page.getByRole('heading', { name: 'محصول آزمایشی' }).waitFor()
  await page.getByLabel('جست‌وجوی محصول').fill('پیدا نمی‌شود')
  await page.getByRole('button', { name: 'جست‌وجو', exact: true }).click()
  await page.getByText('محصولی یافت نشد').waitFor()
  const missing = await page.goto('http://127.0.0.1:3100/shop/99999')
  assert.equal(missing.status(), 404)
  await page.goto('http://127.0.0.1:3100/shop/2')
  assert.equal(await page.getByRole('button', { name: 'ثبت سفارش', exact: true }).count(), 0)
  await page.goto('http://127.0.0.1:3100/shop/1')
  assert.ok((await page.locator('link[rel=canonical]').getAttribute('href')).endsWith('/shop/1'))
  const productJson = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent())
  assert.equal(productJson['@type'], 'Product')
  assert.equal(productJson.offers.price, 8000)
  await page.getByText('برای خرید وارد حساب شوید').click()
  await page.locator('input[name="mobile"]').fill('09123456789')
  await page.locator('input[name="password"]').fill('Test-password-123')
  await page.locator('form button[type="submit"]').click()
  await page.waitForURL('**/shop/1')
  await page.getByLabel('آدرس تحویل').fill('آدرس آزمایشی')
  await page.getByLabel('کد پستی').fill('1234567890')
  await page.getByRole('button', { name: 'ثبت سفارش', exact: true }).click()
  await page.getByText(/سفارش با موفقیت ثبت شد/).waitFor()
  const orders = await page.goto('http://127.0.0.1:3100/dashboard/orders')
  assert.equal(orders.status(), 200)
  assert.match(orders.headers()['cache-control'], /no-store/)
  assert.ok((await orders.text()).includes('آدرس آزمایشی'))
  await page.getByRole('heading', { name: 'سفارش‌های من' }).waitFor()
  await page.screenshot({ path: `${output}/product-desktop.png`, fullPage: true })
  await page.goto('http://127.0.0.1:3100/dashboard/profile')
  await page.getByRole('heading', { name: 'ویرایش پروفایل' }).waitFor()
  assert.equal(new URL(page.url()).pathname, '/dashboard/profile')
  const dashboardRoutes = [
    ['profile', 'ویرایش پروفایل'],
    ['articles', 'دلنوشته'],
    ['gallery', 'گالری'],
    ['tickets', 'تیکت'],
    ['trips', 'سفر'],
    ['trips/register', 'ثبت‌نام سفر'],
    ['wallet', 'کیف پول'],
    ['financial-report', 'گزارش مالی'],
  ]
  for (const [route, title] of dashboardRoutes) {
    const response = await page.goto(`http://127.0.0.1:3100/dashboard/${route}`)
    assert.equal(response.status(), 200)
    assert.match(response.headers()['cache-control'], /no-store/)
    assert.match(await page.locator('meta[name=robots]').getAttribute('content'), /noindex/)
    await page.getByRole('heading', { name: new RegExp(title), level: 1 }).waitFor()
    assert.equal(await page.locator('#root').count(), 0)
    assert.equal(await page.getByText(/دریافت (بخشی از اطلاعات|پروفایل|گزارش) انجام نشد/).count(), 0)
  }
  const sidebar = page.locator('.dashboard-sidebar')
  const desktopMain = page.locator('.dashboard-main')
  const sidebarBox = await sidebar.boundingBox()
  const contentBox = await desktopMain.boundingBox()
  assert.ok(sidebarBox && contentBox && sidebarBox.x >= contentBox.x + contentBox.width - 1)
  assert.equal(await sidebar.locator('a[aria-current=page]').getAttribute('href'), '/dashboard/financial-report')
  await page.screenshot({ path: `${output}/dashboard-desktop.png` })
  await page.setViewportSize({ width: 390, height: 844 })
  const dashboardMenu = page.getByRole('button', { name: 'باز کردن منوی داشبورد' })
  await dashboardMenu.click()
  const panel = page.getByRole('dialog', { name: 'منوی داشبورد' })
  await panel.waitFor()
  const panelBox = await panel.boundingBox()
  assert.deepEqual(panelBox, { x: 0, y: 0, width: 390, height: 844 })
  assert.equal(await panel.getByRole('link').count(), 10)
  await page.screenshot({ path: `${output}/dashboard-menu-mobile.png` })
  await page.keyboard.press('Escape')
  await panel.waitFor({ state: 'hidden' })
  assert.ok(await dashboardMenu.evaluate(button => button === document.activeElement))
  await dashboardMenu.click()
  await panel.getByRole('link', { name: 'پروفایل من' }).click()
  await page.waitForURL('**/dashboard/profile')
  await panel.waitFor({ state: 'hidden' })
  const fixtureImage = {
    name: 'fixture.png',
    mimeType: 'image/png',
    buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAALUlEQVR4nGMUTfFnoCVgoqnpoxaMWjBqwagFoxaMWjBqwagFoxaMWjBqARUBAAf7AQihVclGAAAAAElFTkSuQmCC', 'base64'),
  }
  await page.locator('#document-national_card_image').setInputFiles(fixtureImage)
  await page.getByRole('button', { name: 'ذخیره تغییرات' }).click()
  await page.getByText(/پروفایل با موفقیت/).waitFor()
  const documentHref = await page.getByRole('link', { name: 'مشاهده مدرک فعلی' }).getAttribute('href')
  const documentResponse = await page.request.get(new URL(documentHref, page.url()).href)
  assert.equal(documentResponse.status(), 200)
  assert.match(documentResponse.headers()['cache-control'], /no-store/)
  const guest = await browser.newContext()
  assert.equal((await guest.request.get(new URL(documentHref, page.url()).href)).status(), 404)
  await guest.close()
  await page.goto('http://127.0.0.1:3100/dashboard/gallery')
  await page.getByRole('button', { name: 'آپلود تصویر', exact: true }).click()
  await page.locator('input[type=file]').setInputFiles(fixtureImage)
  await page.locator('input[name=title]').fill('Gallery fixture')
  await page.locator('.mg-form button[type=submit]').click()
  await page.getByText('Gallery fixture', { exact: true }).waitFor()
  for (const [route] of dashboardRoutes) {
    await page.goto(`http://127.0.0.1:3100/dashboard/${route}`)
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), `dashboard/${route}: horizontal overflow`)
  }
  await page.goto('http://127.0.0.1:3100/track')
  assert.ok((await page.locator('meta[name=robots]').getAttribute('content')).includes('noindex'))
  const trackingRequests = []
  page.on('request', request => { if (request.url().includes('/api/trips/track')) trackingRequests.push({ url: request.url(), method: request.method() }) })
  await page.getByLabel('کد پیگیری').fill('12345')
  await page.getByLabel('کد ملی').fill('1234567890')
  await page.getByRole('button', { name: 'پیگیری', exact: true }).click()
  await page.getByRole('heading', { name: 'نتیجه پیگیری' }).waitFor()
  assert.ok(trackingRequests.every(r => r.method === 'POST' && !r.url.includes('1234567890')))
  assert.equal(new URL(page.url()).search, '')
  for (const path of ['/', '/shop', '/shop/1', '/track']) {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(`http://127.0.0.1:3100${path}`)
    await page.waitForTimeout(300)
    timings[path] = await page.evaluate(() => ({ ...window.__vitals, ttfb: performance.getEntriesByType('navigation')[0].responseStart, domContentLoaded: performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd }))
    await page.screenshot({ path: `${output}/${path.replaceAll('/', '_') || 'home'}-mobile.png`, fullPage: true })
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), `${path}: horizontal overflow`)
  }
  // Keyboard/reduced-motion and normal-motion rendering both remain usable.
  await page.emulateMedia({ reducedMotion: 'no-preference', colorScheme: 'dark' })
  await page.goto('http://127.0.0.1:3100/')
  await page.locator('.shrine-animation').scrollIntoViewIfNeeded()
  await page.locator('.shrine-animation-art > svg').waitFor()
  await page.screenshot({ path: `${output}/home-dark-mobile.png`, fullPage: true })
  await page.goto('http://127.0.0.1:3100/track')
  await page.getByLabel('کد پیگیری').fill('54321')
  await page.getByLabel('کد ملی').fill('1234567890')
  await page.getByRole('button', { name: 'پیگیری', exact: true }).click()
  await page.getByText(/نتیجه‌ای دریافت نشد/).waitFor()
  await page.route('**/api/trips/track/', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{"detail":"unavailable"}' }))
  await page.getByRole('button', { name: 'پیگیری', exact: true }).click()
  await page.getByText(/نتیجه‌ای دریافت نشد/).waitFor()
  assert.deepEqual(errors, [])
  await writeFile(`${output}/results.json`, JSON.stringify({ passed: true, errors, timings }, null, 2))
  console.log('PASS: phase three browser flows, mobile overflow, real order, private legacy boundary, tracking privacy')
} finally { await browser.close() }


