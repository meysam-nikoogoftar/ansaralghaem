import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'

const origin = process.env.SITE_URL || 'http://127.0.0.1:3100'
const executable = '/home/parham/.cache/ms-playwright/chromium-1179/chrome-linux/chrome'
const browser = await chromium.launch({
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || (existsSync(executable) ? executable : undefined),
  args: ['--no-sandbox'],
})
const routes = [
  ['/admin', /داشبورد مدیریت/, '/api/accounts/admin/dashboard-stats/'],
  ['/admin/users', /مدیریت کاربران/, '/api/accounts/admin/users/'],
  ['/admin/users/1', /PrivateFixture/, '/api/accounts/admin/users/1/'],
  ['/admin/news', /مدیریت اخبار/, '/api/content/admin/news/'],
  ['/admin/articles', /تایید دلنوشته/, '/api/content/admin/articles/'],
  ['/admin/gallery', /تایید تصاویر گالری/, '/api/content/admin/gallery/'],
  ['/admin/trips', /مدیریت سفرها/, '/api/trips/admin/trips/'],
  ['/admin/registrations', /ثبت‌نام/, '/api/trips/admin/registrations/'],
  ['/admin/contributions', /مشارکت‌های مالی/, '/api/financial/admin/contributions/'],
  ['/admin/expenses', /ریزهزینه‌ها/, '/api/financial/admin/expenses/'],
  ['/admin/refunds', /عودت وجه کیف پول/, '/api/trips/admin/refunds/'],
]
const password = 'Test-password-123'
const output = '.test-artifacts/phase-six'

async function signIn(context, mobile) {
  const initial = await context.request.get('/api/accounts/session/')
  const csrf = (await initial.json()).csrfToken
  const response = await context.request.post('/api/accounts/login/', {
    headers: { Origin: origin, 'X-CSRFToken': csrf },
    data: { mobile, password },
  })
  assert.equal(response.status(), 200, await response.text())
  return (await response.json()).csrfToken
}

try {
  await mkdir(output, { recursive: true })
  const context = await browser.newContext({
    baseURL: origin,
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'reduce',
  })
  for (const [path] of routes) {
    const guest = await context.request.get(path + '?test=role', { maxRedirects: 0 })
    assert.equal(guest.status(), 307, path)
    assert.equal(
      new URL(guest.headers().location, origin).searchParams.get('returnTo'),
      path + '?test=role',
    )
  }
  await signIn(context, '09123456789')
  for (const [path, , api] of routes) {
    const ordinary = await context.request.get(path, { maxRedirects: 0 })
    assert.equal(ordinary.status(), 307, path)
    assert.equal(new URL(ordinary.headers().location, origin).pathname, '/dashboard')
    assert.equal((await context.request.get(api)).status(), 403, api)
  }

  const admin = await browser.newContext({ baseURL: origin })
  const adminToken = await signIn(admin, '09123456780')
  const financeOnly = await admin.newPage()
  await financeOnly.goto('/admin/registrations')
  await financeOnly.getByRole('alert').filter({ hasText: 'دسترسی به این بخش' }).waitFor()
  assert.equal(
    await financeOnly.locator('.dashboard-sidebar a[href="/admin/registrations"]').count(),
    0,
  )
  assert.equal((await admin.request.get('/api/trips/admin/registrations/export/')).status(), 403)
  assert.equal(
    (
      await admin.request.post('/api/accounts/admin/users/1/promote/', {
        headers: { Origin: origin, 'X-CSRFToken': adminToken },
        data: { user_type: 'admin' },
      })
    ).status(),
    403,
  )
  const restrictedStats = await admin.request.get('/api/accounts/admin/dashboard-stats/')
  assert.deepEqual((await restrictedStats.json()).recent_registrations, [])
  await financeOnly.goto('/admin/expenses')
  await financeOnly.locator('.aex-new-btn').click()
  await financeOnly.locator('select[name="trip"] option[value="1"]').waitFor({ state: 'attached' })
  await admin.close()

  await context.clearCookies()
  const page = await context.newPage()
  page.setDefaultTimeout(12000)
  await page.goto('/admin/users?test=return#main-content')
  await page.locator('input[name="mobile"]').fill('09123456781')
  await page.locator('input[name="password"]').fill(password)
  await page.locator('form button[type="submit"]').click()
  await page.waitForURL(
    (url) =>
      url.pathname === '/admin/users' &&
      url.search === '?test=return' &&
      url.hash === '#main-content',
  )
  const session = await context.request.get('/api/accounts/session/')
  const csrf = (await session.json()).csrfToken
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error' && /hydrat/i.test(message.text())) errors.push(message.text())
  })
  for (const [path, title, api] of routes) {
    const result = page.waitForResponse((response) => new URL(response.url()).pathname === api)
    const response = await page.goto(path)
    assert.equal(response.status(), 200, path)
    assert.match(response.headers()['cache-control'], /no-store/)
    assert.match(await page.locator('meta[name="robots"]').getAttribute('content'), /noindex/)
    await page.getByRole('heading', { name: title, level: 1 }).waitFor()
    assert.equal((await result).status(), 200, api)
    assert.equal(await page.locator('#root').count(), 0)
  }
  await page.goto('/admin/users/99999')
  await page.getByText('کاربر یافت نشد', { exact: true }).waitFor()
  assert.equal((await page.goto('/admin/users/invalid')).status(), 404)
  await page.goto('/admin')
  await page.getByRole('heading', { name: 'داشبورد مدیریت', level: 1 }).waitFor()
  assert.equal(await page.locator('.dashboard-sidebar a').count(), 10)
  await page.screenshot({ path: `${output}/admin-desktop.png` })
  await page.setViewportSize({ width: 390, height: 844 })

  const geometry = async (name) => {
    const button = page.getByRole('button', { name: `باز کردن ${name}` })
    await button.click()
    const menu = page.getByRole('dialog', { name })
    await menu.waitFor()
    return {
      button,
      menu,
      dimensions: await menu.evaluate((element) => {
        const { x, y, width, height } = element.getBoundingClientRect()
        const style = getComputedStyle(element)
        const link = getComputedStyle(element.querySelector('nav a'))
        return {
          x,
          y,
          width,
          height,
          background: style.backgroundColor,
          rowHeight: link.minHeight,
          radius: link.borderRadius,
          padding: link.padding,
        }
      }),
    }
  }
  await page.goto('/dashboard')
  const themeBackgrounds = new Set()
  for (const theme of ['light', 'dark']) {
    await page.evaluate((value) => localStorage.setItem('theme_preference', value), theme)
    await page.goto('/dashboard')
    await page.locator(`html[data-theme="${theme}"]`).waitFor()
    const member = await geometry('منوی داشبورد')
    await page.keyboard.press('Escape')
    await member.menu.waitFor({ state: 'hidden' })
    await page.goto('/admin')
    await page.locator(`html[data-theme="${theme}"]`).waitFor()
    const management = await geometry('منوی مدیریت')
    assert.deepEqual(management.dimensions, member.dimensions)
    themeBackgrounds.add(management.dimensions.background)
    assert.equal(await management.menu.getByRole('link').count(), 10)
    assert.equal(
      await management.menu.locator('[aria-current=page]').getAttribute('href'),
      '/admin',
    )
    await page.screenshot({ path: `${output}/admin-menu-${theme}.png` })
    await page.keyboard.press('Escape')
    await management.menu.waitFor({ state: 'hidden' })
    assert.ok(await management.button.evaluate((button) => button === document.activeElement))
    await page.goto('/dashboard')
  }
  assert.equal(themeBackgrounds.size, 2)
  await page.goto('/admin')
  const mobile = await geometry('منوی مدیریت')
  await mobile.menu.getByRole('link', { name: 'کاربران' }).click()
  await page.waitForURL('**/admin/users')
  await mobile.menu.waitFor({ state: 'hidden' })
  await page.goBack()
  await page.waitForURL('**/admin')
  for (const [path, title] of routes) {
    await page.goto(path)
    await page.getByRole('heading', { name: title, level: 1 }).waitFor()
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
      path,
    )
  }
  await page.setViewportSize({ width: 1440, height: 1000 })

  async function api(method, path, data, expected) {
    const options = { method, headers: { Origin: origin, 'X-CSRFToken': csrf } }
    if (data !== undefined) options.data = data
    const result = await context.request.fetch(path, options)
    assert.equal(result.status(), expected, `${path} ${await result.text()}`)
    return expected === 204 ? null : result.json()
  }

  await page.goto('/admin/users')
  await page.getByLabel('جستجوی کاربران').fill('۰۹۱۲۳۴۵۶۷۸۹')
  await page.locator('.aus-search-form button[type="submit"]').click()
  const userRow = page.getByRole('row').filter({ hasText: 'PrivateFixture' })
  await userRow.waitFor()
  assert.equal(await page.locator('.aus-table tbody tr').count(), 1)
  await userRow.getByRole('button', { name: 'تغییر نقش' }).click()
  const roleDialog = page.getByRole('dialog', { name: 'تأیید تغییر نقش کاربر' })
  await roleDialog.getByRole('button', { name: 'تأیید تغییر نقش', exact: true }).click()
  await roleDialog.waitFor({ state: 'hidden' })
  const promoted = await api('GET', '/api/accounts/admin/users/1/', undefined, 200)
  assert.equal(promoted.user_type, 'admin')
  await api('POST', '/api/accounts/admin/users/1/promote/', { user_type: 'user' }, 200)
  await page.goto('/admin/users/1')
  await page.getByRole('button', { name: 'ویرایش اطلاعات' }).click()
  await page.getByLabel('نام', { exact: true }).fill('ویرایش آزمایشی')
  await page.getByRole('button', { name: 'ذخیره تغییرات' }).click()
  await page.getByRole('heading', { name: /ویرایش آزمایشی/, level: 1 }).waitFor()

  const newsApi = '**/api/content/admin/news/'
  await page.route(newsApi, (route) =>
    route.fulfill({ status: 403, json: { detail: 'Forbidden' } }),
  )
  await page.goto('/admin/news')
  const denied = page.getByRole('alert').filter({ hasText: 'دسترسی به این اطلاعات' })
  await denied.waitFor()
  await page.unroute(newsApi)
  await denied.getByRole('button', { name: 'تلاش مجدد' }).click()
  await denied.waitFor({ state: 'hidden' })
  await page.locator('.anw-new-btn').click()
  await page.locator('[name="title"]').fill('خبر آزمایشی مدیریت')
  await page.locator('[name="content"]').fill('متن خبر آزمایشی')
  await page.locator('.anw-submit-btn').click()
  const newsItem = page.getByText('خبر آزمایشی مدیریت', { exact: true })
  await newsItem.waitFor()
  const [draft] = await api('GET', '/api/content/admin/news/', undefined, 200)
  await page.locator('.anw-toggle-pill').first().click()
  await page.getByText('● منتشر شده', { exact: true }).waitFor()
  const published = await api('GET', `/api/content/admin/news/${draft.id}/`, undefined, 200)
  assert.equal(published.is_published, true)
  assert.ok(published.published_at && Number.isFinite(Date.parse(published.published_at)))
  await api(
    'PUT',
    `/api/content/admin/news/${draft.id}/`,
    { ...draft, is_published: true, title: 'ویرایش تست', image: null },
    200,
  )
  await api('DELETE', `/api/content/admin/news/${draft.id}/`, {}, 204)
  assert.equal((await api('GET', '/api/content/admin/news/', undefined, 200)).length, 0)

  await page.goto('/admin/expenses')
  await page.locator('.aex-new-btn').click()
  await page.locator('[name="title"]').fill('هزینهٔ آزمایشی')
  await page.locator('[name="amount"]').fill('1250')
  await page.locator('[name="trip"]').selectOption('1')
  await page.locator('[name="expense_date"]').fill('2027-07-27')
  await page.locator('.aex-submit-btn').click()
  await page.getByText('هزینه ثبت شد').waitFor()
  const expenseRow = page.getByRole('row').filter({ hasText: 'هزینهٔ آزمایشی' })
  await expenseRow.getByRole('button', { name: 'ویرایش' }).click()
  await page.locator('[name="amount"]').fill('1400')
  await page.locator('.aex-submit-btn').click()
  await page.getByText('هزینه ویرایش شد').waitFor()
  const [expense] = await api('GET', '/api/financial/admin/expenses/', undefined, 200)
  assert.equal(expense.amount, 1400)
  page.once('dialog', (dialog) => dialog.accept())
  await expenseRow.getByRole('button', { name: 'حذف' }).click()
  await expenseRow.waitFor({ state: 'detached' })
  assert.equal((await api('GET', '/api/financial/admin/expenses/', undefined, 200)).length, 0)

  await page.goto('/admin/contributions')
  await page.locator('.acn-new-btn').click()
  for (const [field, value] of Object.entries({
    title: 'مشارکت تست',
    total_amount: '1200',
    share_count: '3',
    share_amount: '400',
    start_date: '2027-01-01',
    end_date: '2027-02-01',
  }))
    await page.locator(`[name="${field}"]`).fill(value)
  await page.locator('.acn-submit-btn').click()
  await page.getByText('مشارکت تست', { exact: true }).waitFor()
  const [contribution] = await api('GET', '/api/financial/admin/contributions/', undefined, 200)
  assert.equal(contribution.share_amount * contribution.share_count, contribution.total_amount)

  await page.goto('/admin/articles')
  const article = page.locator('.aar-card').filter({ hasText: 'دلنوشتهٔ تست مدیریت' })
  await article.locator('.aar-approve-btn').click()
  await article.getByText('تایید شده', { exact: true }).waitFor()
  await page.goto('/admin/gallery')
  await page
    .locator('.agm-thumb-wrap')
    .filter({ has: page.getByAltText('تصویر تست مدیریت') })
    .click()
  const gallery = page.getByRole('dialog', { name: 'نمایش تصویر' })
  await gallery.waitFor()
  await gallery.locator('img').evaluate((img) => img.decode())
  await gallery.locator('.agm-approve-btn').click()
  await gallery.getByText('تایید شده', { exact: true }).waitFor()
  await page.keyboard.press('Escape')

  await page.goto('/admin/trips')
  await page.locator('.atp-new-btn').click()
  await page.locator('#trip-start_date').click()
  await page.keyboard.press('Escape')
  const trip = await api(
    'POST',
    '/api/trips/admin/trips/',
    {
      title: 'سفر تست مدیریت',
      trip_type: 'qom',
      is_active: true,
      registration_open: true,
      capacity: 1,
      start_date: '2027-07-27',
      end_date: '2027-08-01',
    },
    201,
  )
  await page.goto('/admin/trips')
  const tripCard = page.locator('.atp-trip-card').filter({ hasText: 'سفر تست مدیریت' })
  await tripCard.getByText('۱ جای خالی از ۱ ثبت‌نام').waitFor()
  await tripCard.getByRole('button', { name: 'ویرایش' }).click()
  await page.getByRole('spinbutton', { name: 'ظرفیت ثبت‌نام' }).fill('2')
  await page.locator('.atp-submit-btn').click()
  await tripCard.getByText('۲ جای خالی از ۲ ثبت‌نام').waitFor()
  await api('PATCH', `/api/trips/admin/trips/${trip.id}/`, { capacity: 1 }, 200)
  await api('POST', '/api/trips/register/', { trip: trip.id }, 201)
  await page.goto('/dashboard/trips/register')
  const fullTrip = page.getByRole('radio', { name: /سفر تست مدیریت/ })
  await fullTrip.getByText('ظرفیت تکمیل شده').waitFor()
  assert.equal(await fullTrip.isDisabled(), true)
  await api('DELETE', `/api/trips/admin/trips/${trip.id}/`, {}, 204)

  await page.goto('/admin/registrations')
  const downloadResult = page.waitForEvent('download')
  await page.locator('.art-export-btn').click()
  const download = await downloadResult
  assert.match(download.suggestedFilename(), /\.xlsx$/)
  const registration = await api(
    'POST',
    '/api/trips/admin/registrations/1/action/',
    { action: 'approve' },
    200,
  )
  assert.equal(registration.status, 'approved')
  await api('GET', '/api/trips/admin/registrations/?trip_id=invalid', undefined, 400)
  await api('POST', '/api/trips/admin/registrations/1/group-code/', { group_code: null }, 400)
  await api(
    'POST',
    '/api/trips/admin/registrations/bulk-group-code/',
    { registration_ids: ['invalid'], group_code: '7' },
    400,
  )
  await api('POST', '/api/trips/admin/registrations/1/group-code/', { group_code: '7' }, 200)
  assert.deepEqual(
    await api('GET', '/api/trips/admin/registrations/1/companions-network/', undefined, 200),
    [],
  )

  await page.goto('/admin/refunds')
  const before = await api('GET', '/api/financial/admin/report/1/', undefined, 200)
  await page.locator('.arf-approve-btn').click()
  await page.getByText('تایید و واریز شد', { exact: true }).waitFor()
  await api('POST', '/api/trips/admin/refunds/1/action/', { action: 'approve' }, 400)
  const after = await api('GET', '/api/financial/admin/report/1/', undefined, 200)
  assert.equal(after.summary.wallet_balance - before.summary.wallet_balance, 15)
  assert.equal(after.summary.total_refunded - before.summary.total_refunded, 15)
  assert.deepEqual(errors, [])
  console.log(
    'PASS: phase-six routes, private responses, roles, shared responsive menu, and admin mutations',
  )
} finally {
  await browser.close()
}
