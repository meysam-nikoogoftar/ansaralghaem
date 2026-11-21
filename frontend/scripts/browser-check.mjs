import fs from 'node:fs'
import assert from 'node:assert/strict'

const baseUrl = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:5173'
const homeSections = process.argv.includes('--home-sections')
const homeInteractions = process.argv.includes('--home-interactions')
const visual = process.argv.includes('--visual') || homeSections
let currentRoute = ''
const artifact = new URL('../.test-artifacts/', import.meta.url)
fs.mkdirSync(artifact, { recursive: true })
class CDP {
  constructor(url) {
    this.socket = new WebSocket(url); this.id = 0; this.waiters = new Map(); this.listeners = new Map()
    this.ready = new Promise(resolve => this.socket.addEventListener('open', resolve, { once: true }))
    this.socket.addEventListener('message', event => {
      const message = JSON.parse(event.data)
      if (message.id) {
        const pending = this.waiters.get(message.id); this.waiters.delete(message.id)
        if (message.error) pending?.reject(new Error(JSON.stringify(message.error)))
        else pending?.resolve(message.result)
      } else for (const listener of this.listeners.get(message.method) || []) listener(message.params)
    })
  }
  async send(method, params = {}) {
    await this.ready
    return new Promise((resolve, reject) => { const id = ++this.id; this.waiters.set(id, { resolve, reject }); this.socket.send(JSON.stringify({ id, method, params })) })
  }
  on(method, fn) { this.listeners.set(method, [...(this.listeners.get(method) || []), fn]) }
}
const targets = await (await fetch('http://127.0.0.1:9223/json/new?about:blank', { method: 'PUT' })).json()
const cdp = new CDP(targets.webSocketDebuggerUrl)
const image = '/assets/' + fs.readdirSync(new URL('../dist/assets/', import.meta.url)).find(name => name.startsWith('gallery-2-dome-closeup-'))
const user = { id: 1, first_name: 'کاربر', last_name: 'آزمایشی', mobile: '09120000000', user_type: 'superadmin', gender: 'male', status: 'active', passport_expiry: '2029-01-20', national_code: '1234567890', birth_date: '2000-01-01', perm_users: true, perm_financial: true, perm_trips: true, perm_registrations: true, perm_content: true }
const trip = { id: 7, title: 'سفر آزمایشی', registration_open: true, is_active: true, conditions: 'شرایط سفر اول', cost: 100000, start_date: '2027-07-20', end_date: '2027-07-30', refund_amount: 10000 }
const registration = { id: 3, user: 1, user_name: 'کاربر آزمایشی', user_first_name: 'کاربر', user_last_name: 'آزمایشی', user_mobile: user.mobile, user_national_code: user.national_code, trip: 7, trip_detail: trip, tracking_code: '12345', paid_from_wallet: 10000, paid_directly: 0, remaining_amount: 90000, total_cost: 100000, status: 'pending', payment_status: 'partial', refund_requested: false, refund_status: '', companions: [], registered_at: '2026-11-18' }
const article = { id: 4, title: 'دلنوشته آزمایشی', content: 'متن طولانی برای بررسی نمایش در اندازه‌های مختلف '.repeat(20), category: 'article', author_name: 'نویسنده', status: 'pending', created_at: '2026-11-18', views_count: 1, is_published: true }
const product = { id: 2, title: 'محصول آزمایشی', code: 'ABC', description: 'شرح محصول', price: 50000, final_price: 50000, stock: 5, category_name: 'صنایع دستی', main_image: image }
const ticket = { id: 5, title: 'پرسش آزمایشی', status: 'answered', priority: 'low', user: 1, messages: [{ id: 1, text: 'متن پیام', sender: 1, created_at: '2026-11-18' }] }
const photo = { id: 6, image, title: 'تصویر آزمایشی', uploader_name: 'کاربر', status: 'pending', created_at: '2026-11-18' }
const report = { summary: { wallet_balance: 500000, total_charged: 500000, total_wallet_spent: 10000, total_direct_paid: 0, total_refunded: 0, total_contributed: 0 }, wallet_transactions: [{ id: 1, amount: 1234567890, transaction_type: 'charge', status: 'success', description: 'شرح بلند تراکنش مالی '.repeat(15), created_at: '2026-11-18' }], direct_payments: [], contribution_payments: [] }
let orders = [], authenticated = true, theme = 'light', failures = new Map(), delayWrites = 0, lastWrite
const requests = [], browserErrors = [], results = []
const note = (name, detail = {}) => { results.push({ name, ...detail }); console.log('PASS', name) }
const evaluate = async expression => {
  const result = await cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text + ': ' + JSON.stringify(result.exceptionDetails.exception))
  return result.result.value
}
const pause = ms => new Promise(resolve => setTimeout(resolve, ms))
async function until(expression, timeout = 15000) {
  const start = Date.now()
  while (!(await evaluate(`Boolean(${expression})`))) { if (Date.now() - start > timeout) throw new Error('Timed out: ' + expression); await pause(40) }
}
function fixture(url, method, payload) {
  const pathname = new URL(url).pathname.replace(/^\/api/, '')
  if (method !== 'GET') {
    if (pathname === '/accounts/login/' || pathname === '/accounts/register/') return { access: 'fixture', refresh: 'fixture-refresh', user }
    if (pathname === '/accounts/profile/') return { ...user, ...(payload || {}) }
    if (pathname === '/shop/orders/create/') { const order = { id: 9, order_number: 'TEST-900', status: 'registered', final_price: 50000, product_title: product.title, quantity: 1, ...payload }; orders.push(order); return order }
    if (pathname.includes('/registrations/') || pathname.includes('/registration/')) return registration
    if (pathname.includes('/react/')) return { success: true }
    return { id: 10, message: 'عملیات با موفقیت انجام شد', balance: 500000, wallet_balance: 500000, ...payload }
  }
  if (pathname === '/accounts/profile/') return user
  if (pathname.includes('/dashboard-stats/')) return { total_users: 1, total_admins: 1, total_trips: 1, total_wallet_balance: 500000, pending_tickets: 1, pending_gallery: 1, pending_articles: 1, registrations_by_status: { pending: 1 }, recent_registrations: [registration] }
  if (/\/accounts\/admin\/users\/\d+\//.test(pathname)) return user
  if (pathname.includes('/accounts/admin/users/')) return [user]
  if (pathname.includes('/search-user/')) return { ...user, id: 2, first_name: 'همسفر' }
  if (pathname.includes('/financial/admin/report/') || pathname === '/financial/report/') return report
  if (pathname === '/financial/wallet/') return { balance: 500000 }
  if (pathname.includes('/wallet/transactions/')) return report.wallet_transactions
  if (pathname.includes('/contributions/')) return [{ id: 8, title: 'کمپین آزمایشی', total_amount: 1000000, share_count: 10, share_amount: 100000, start_date: trip.start_date, end_date: trip.end_date, is_active: true, is_public: true }]
  if (pathname.includes('/expenses/')) return []
  if (pathname.includes('/my-registrations/') || pathname.includes('/admin/registrations/')) return [registration]
  if (pathname.includes('/refunds/')) return [{ ...registration, refund_status: 'pending', requested_refund_amount: 5000 }]
  if (pathname.includes('/trips/track/')) return registration
  if (pathname === '/trips/' || pathname === '/trips/admin/trips/') return [trip, { ...trip, id: 8, title: 'سفر دوم', conditions: 'شرایط متفاوت سفر دوم' }]
  if (pathname.includes('/announcements/')) return [{ id: 1, text: 'اطلاعیه اول', announcement_type: 'info' }, { id: 2, text: 'اطلاعیه دوم', announcement_type: 'info' }]
  if (pathname.includes('/sliders/')) return []
  if (/\/news\/\d+\//.test(pathname)) return { ...article, image }
  if (pathname.includes('/news/')) return [{ ...article, image }]
  if (/\/articles\/\d+\//.test(pathname)) return article
  if (pathname.includes('/articles/')) return [article]
  if (pathname.includes('/gallery/')) return (visual || homeInteractions) && currentRoute === '/' ? [] : [photo]
  if (pathname.includes('/reactions/')) return { heart: 1, pray: 0, cry: 0, rose: 0 }
  if (pathname.includes('/comments/')) return []
  if (pathname.includes('/shop/categories/')) return [{ id: 1, name: 'صنایع دستی' }]
  if (/\/shop\/products\/\d+\//.test(pathname)) return product
  if (pathname.includes('/shop/products/')) return [product]
  if (pathname.includes('/shop/orders/my/')) return orders
  if (/\/tickets\/\d+\//.test(pathname)) return ticket
  if (pathname.includes('/tickets/')) return [ticket]
  return []
}
cdp.on('Runtime.exceptionThrown', event => browserErrors.push(event.exceptionDetails.exception?.description || event.exceptionDetails.text))
cdp.on('Fetch.requestPaused', async event => {
  const { requestId, request } = event
  const url = new URL(request.url)
  requests.push({ method: request.method, path: url.pathname })
  let payload
  try { payload = JSON.parse(request.postData || '{}') } catch { payload = {} }
  if (request.method !== 'GET') lastWrite = { path: url.pathname, payload }
  const failure = [...failures].find(([pattern]) => request.url.includes(pattern))?.[1]
  const data = failure?.data || fixture(request.url, request.method, payload)
  if (request.method !== 'GET' && delayWrites) await pause(delayWrites)
  await cdp.send('Fetch.fulfillRequest', { requestId, responseCode: failure?.status || 200, responseHeaders: [{ name: 'Content-Type', value: 'application/json' }], body: Buffer.from(JSON.stringify(data)).toString('base64') }).catch(() => {})
})
await cdp.send('Runtime.enable'); await cdp.send('Page.enable')
await cdp.send('Page.bringToFront')
await cdp.send('Emulation.setFocusEmulationEnabled', { enabled: true })
await cdp.send('Fetch.enable', { patterns: [{ urlPattern: '*/api/*', requestStage: 'Request' }] })
let initScript
async function go(route, width = 390, height = 844) {
  currentRoute = route
  if (initScript) await cdp.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: initScript })
  const result = await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: `localStorage.clear();localStorage.setItem('theme_preference',${JSON.stringify(theme)});${authenticated ? "localStorage.setItem('access_token','fixture');localStorage.setItem('refresh_token','fixture-refresh');" : ''}` })
  initScript = result.identifier
  await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false })
  await cdp.send('Page.navigate', { url: baseUrl + route })
  await until("document.readyState !== 'loading' && document.querySelector('#root')?.children.length > 0")
  await until("document.querySelector('main, .auth-page')")
  await until("!document.querySelector('[data-loading=true]')")
  await evaluate('document.fonts.ready')
  await pause(160)
}
const click = selector => evaluate(`document.querySelector(${JSON.stringify(selector)})?.click()`)
async function mouseClick(selector) {
  await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`)
  await pause(80)
  const point = await evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`)
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...point })
  await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 })
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 })
}
const key = async (key, code = key, modifiers = 0) => {
  const windowsVirtualKeyCode = { Enter: 13, Tab: 9, Escape: 27, ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40, ' ': 32 }[key]
  const text = key === 'Enter' ? '\r' : key === ' ' ? ' ' : ''
  await cdp.send('Input.dispatchKeyEvent', { type: text ? 'keyDown' : 'rawKeyDown', key, code, modifiers, windowsVirtualKeyCode, text, unmodifiedText: text })
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, modifiers, windowsVirtualKeyCode })
}
async function screenshot(name) {
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
  fs.writeFileSync(new URL(name + '.png', artifact), Buffer.from(data, 'base64'))
}
try {
  if (process.argv.includes('--theme')) {
    authenticated = false
    for(const width of [320,375,795,1024,1440]) {
      theme='light'
      await go('/',width,844)
      assert.equal(await evaluate("document.querySelectorAll('.navbar .theme-cycle').length"),1)
      const icons=[]
      for(const expected of ['dark','auto','light']) {
        await mouseClick('.navbar .theme-cycle')
        assert.equal(await evaluate("document.querySelector('.navbar .theme-cycle').dataset.preference"),expected)
        assert.equal(await evaluate("localStorage.getItem('theme_preference')"),expected)
        icons.push(await evaluate("document.querySelector('.navbar .theme-cycle svg').innerHTML"))
      }
      assert.equal(new Set(icons).size,3)
      assert.equal(await evaluate('document.documentElement.scrollWidth > innerWidth + 1'),false)
      if(width===375) await screenshot('theme-header-mobile')
      if(width>900) { assert.equal(await evaluate("document.querySelector('.header-auth-button').getAttribute('href')"), '/login'); await screenshot('auth-header-'+width) }
      note('single header theme control, cycle, three icons and saved preference '+width)
    }
  } else if (process.argv.includes('--countdown')) {
    for (const variant of ['light','dark']) {
      theme=variant
      for(const width of [320,375,390,600,656]) {
        await go('/',width,844)
        await evaluate("document.querySelector('.countdown-section').scrollIntoView({block:'center',behavior:'instant'})")
        const boxes=await evaluate("[...document.querySelectorAll('.count-box')].map(el=>{const r=el.getBoundingClientRect();return {top:r.top,left:r.left,right:r.right}})")
        assert.equal(boxes.length,4)
        assert.ok(boxes.every(box=>Math.abs(box.top-boxes[0].top)<1 && box.left>=0 && box.right<=width))
        if(width===375) await screenshot('countdown-375-'+theme)
        note('four countdown values in one row '+width+' '+theme)
      }
    }
  } else if (process.argv.includes('--menu')) {
    for(const variant of ['light','dark']) {
      theme=variant
      await go('/',390,844)
      const before=await evaluate("document.querySelector('.hero-slider').getBoundingClientRect().top")
      await mouseClick('.mobile-menu-btn')
      await pause(250)
      assert.equal(await evaluate("document.querySelector('.hero-slider').getBoundingClientRect().top"),before)
      assert.equal(await evaluate("getComputedStyle(document.querySelector('#public-mobile-menu')).position"),'absolute')
      assert.equal(await evaluate("document.querySelector('.mobile-menu-btn').getAttribute('aria-expanded')"),'true')
      await screenshot('mobile-menu-overlay-'+theme)
      assert.equal(await evaluate("document.querySelectorAll('#public-mobile-menu .mobile-menu-auth button').length"),1)
      assert.equal(await evaluate("!!document.querySelector('#public-mobile-menu a[href=\"/dashboard\"]')"),false)
      const authBox=await evaluate("document.querySelector('.mobile-menu-auth').getBoundingClientRect().width")
      const logoutWidth=await evaluate("document.querySelector('.mobile-menu-logout').getBoundingClientRect().width")
      assert.ok(Math.abs(authBox-logoutWidth)<1)
      await mouseClick('.mobile-menu-logout')
      await until("document.querySelectorAll('.mobile-menu-auth a').length === 2")
      assert.equal(await evaluate("localStorage.getItem('access_token')"),null)
      assert.equal(await evaluate("localStorage.getItem('refresh_token')"),null)
      const guest=await evaluate("[...document.querySelectorAll('.mobile-menu-auth a')].map(el=>({href:el.getAttribute('href'),top:el.getBoundingClientRect().top}))")
      assert.deepEqual(guest.map(el=>el.href),['/login','/register'])
      assert.ok(Math.abs(guest[0].top-guest[1].top)<1)
      await screenshot('mobile-menu-guest-'+theme)

      await key('Escape')
      assert.equal(await evaluate("document.activeElement.matches('.mobile-menu-btn')"),true)
      assert.equal(await evaluate("document.querySelector('#public-mobile-menu').inert"),true)
      note('public overlay menu does not move content; Escape and focus '+theme)
    }
  } else if (process.argv.includes('--swipe')) {
    await go('/', 390, 844)
    const active = () => evaluate("[...document.querySelectorAll('.slide')].findIndex(el=>el.classList.contains('active'))")
    for (const touch of [false, true]) {
      await cdp.send('Emulation.setTouchEmulationEnabled', {enabled:touch})
      for (const [dx,dy,expected] of [[-100,0,1],[100,0,-1],[15,0,0],[0,70,0]]) {
        const before=await active()
        const point=await evaluate("(()=>{const r=document.querySelector('.hero-slider').getBoundingClientRect();return {x:r.x+r.width/2,y:r.top+60}})()")
        if(touch) {
          await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...point,id:1}]})
          for(const progress of [.2,.5,1]) await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:point.x+dx*progress,y:point.y+dy*progress,id:1}]})
          await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})
        } else {
          await cdp.send('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',clickCount:1})
          for(const progress of [.2,.5,1]) await cdp.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:point.x+dx*progress,y:point.y+dy*progress,buttons:1})
          await cdp.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:point.x+dx,y:point.y+dy,button:'left',clickCount:1})
        }
        await pause(150)
        assert.equal(await active(),(before+expected+3)%3, `${touch?'touch':'mouse'} swipe ${dx},${dy}`)
      }
      note((touch?'touch':'mouse')+' swipes both ways, short drag and vertical gesture')
    }
  } else if (visual) {
    for (const currentTheme of ['light', 'dark']) {
      theme = currentTheme
      for (const width of [390, 1440]) {
        await go('/', width, 1000)
        await evaluate('document.fonts.ready')
        await pause(650)
        const firstAnnouncement = await evaluate("document.querySelector('.an-text').textContent")
        await click('.an-controls button:last-child')
        assert.notEqual(await evaluate("document.querySelector('.an-text').textContent"), firstAnnouncement)
        assert.equal(await evaluate("!!document.querySelector('.rotation-control, .slider-pause')"), false)
        await screenshot(`visual-home-${width}-${theme}`)
        if (homeSections) {
          for (const [name, selector] of [['principles', '.community-principles'], ['trip', '#caravan'], ['updates', '.home-updates'], ['quote', '.quote-section'], ['donate', '.donate-stats']]) {
            await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`)
            await screenshot(`home-${name}-${width}-${theme}`)
          }
          assert.equal(await evaluate('document.documentElement.scrollWidth > innerWidth + 1'), false)
          assert.equal(await evaluate("document.querySelector('.caravan-notice a').getAttribute('href')"), '/news')
          assert.equal(await evaluate("document.querySelector('.community-shop a').getAttribute('href')"), '/shop')
          assert.equal(await evaluate("document.querySelector('.trip-overview-head a').getAttribute('href')"), '/dashboard/trips/register')
          note('home information sections ' + width + ' ' + theme)
          continue
        }
        await evaluate("document.querySelector('#gallery').scrollIntoView({block:'start',behavior:'instant'})")
        await pause(200)
        await screenshot(`visual-gallery-${width}-${theme}`)
        const grid = await evaluate("({cols:getComputedStyle(document.querySelector('.gallery-grid')).gridTemplateColumns.split(' ').length,count:document.querySelectorAll('#gallery .gallery-item').length,font:document.fonts.check('16px Vazirmatn'),stop:!!document.querySelector('.slider-pause')})")
        assert.equal(grid.count, 8); assert.equal(grid.cols, width === 1440 ? 4 : 2); assert.equal(grid.font,true); assert.equal(grid.stop,false)
        assert.equal(await evaluate("getComputedStyle(document.querySelector('#gallery .gallery-item')).cursor"), 'pointer')
        assert.equal(await evaluate("[...document.fonts].some(face=>face.family === 'Vazirmatn' && face.status === 'loaded')"), true)
        await evaluate("document.querySelector('#gallery .gallery-item').focus()")
        await key('Enter')
        await until("document.querySelector('[role=dialog]')")
        await key('Escape')
        assert.equal(await evaluate("document.activeElement.matches('#gallery .gallery-item')"),true)
        await evaluate('scrollTo({top:document.body.scrollHeight,behavior:"instant"})')
        await pause(200)
        await screenshot(`visual-footer-${width}-${theme}`)
        for (const route of ['/news', '/articles/4', '/shop/2', '/login', '/dashboard', '/dashboard/profile', '/admin', '/admin/registrations']) {
          await go(route, width, 1000)
          await screenshot(`visual-${route.replaceAll('/','-')}-${width}-${theme}`)
        }
        note('visual gallery/font/footer and shared screens ' + width + ' ' + theme)
      }
    }
  } else if (homeInteractions) {
    for (const currentTheme of ['light', 'dark']) {
      theme = currentTheme
      for (const [width, height] of [[360,640], [390,844], [656,728], [795,877], [1366,768], [1440,900]]) {
        authenticated = false
        await go('/register', width, height)
        assert.equal(await evaluate('document.documentElement.scrollHeight > innerHeight + 1'), false, 'Registration scroll ' + width + 'x' + height)
        await screenshot(`register-fit-${width}-${height}-${theme}`)
        await go('/', width, height)
        await pause(650)
        await screenshot(`hero-responsive-${width}-${theme}`)
        if (width <= 900) {
          assert.equal(await evaluate("document.querySelector('.hero-slider').getBoundingClientRect().bottom <= document.querySelector('.bottom-nav').getBoundingClientRect().top + 1"), true, 'Hero must clear mobile navigation')
          assert.equal(await evaluate("getComputedStyle(document.querySelector('.slide.active .slide-bg')).backgroundSize"), 'cover')
          const sizes = await evaluate("[...document.querySelectorAll('.home-updates-layout .home-action-button')].map(el=>({w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height}))")
          assert.ok(Math.abs(sizes[0].w-sizes[1].w)<1 && Math.abs(sizes[0].h-sizes[1].h)<1, 'Promo button sizes')
          for (let slideIndex=0;slideIndex<3;slideIndex++) {
            await click('.slider-dots .dot:nth-child('+(slideIndex+1)+')')
            await pause(850)
            await screenshot(`hero-slide-${slideIndex}-${width}-${theme}`)
          }
        }

        await evaluate("document.querySelector('#gallery').scrollIntoView({block:'start',behavior:'instant'})")
        await until("[...document.querySelectorAll('#gallery img')].every(img=>img.complete && img.naturalWidth > 0)")
        assert.equal(await evaluate("[...document.querySelectorAll('#gallery img')].every(img=>!img.draggable)"), true)
        await screenshot(`gallery-refined-${width}-${theme}`)
        await mouseClick('#gallery .gallery-item img')
        await until("document.querySelector('.home-lightbox [role=dialog]')")
        const overlay = await evaluate(`(()=>{const el=document.querySelector('.home-lightbox'),img=el.querySelector('img'),r=img.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {body:el.parentElement===document.body,above:el.contains(hit),visible:r.height>100&&r.top>=0&&r.bottom<=innerHeight,loaded:img.complete&&img.naturalWidth>0}})()`)
        assert.deepEqual(overlay, {body:true,above:true,visible:true,loaded:true})
        await screenshot(`gallery-open-${width}-${theme}`)
        await mouseClick('.home-lightbox button')
        await until("!document.querySelector('.home-lightbox')")
        assert.equal(await evaluate("document.activeElement.matches('#gallery .gallery-item')"), true)
        await evaluate("document.querySelector('#news').scrollIntoView({block:'center',behavior:'instant'})")
        const cursors = await evaluate("[...document.querySelectorAll('#news .news-card, #news .news-card *')].map(el=>getComputedStyle(el).cursor)")
        assert.equal(cursors.includes('none'), false)
        const destination = await evaluate("new URL(document.querySelector('#news .news-img').href).pathname")
        await mouseClick('#news .news-img img')
        await until(`location.pathname === ${JSON.stringify(destination)}`)
        note('registration fit, real gallery click/layering/close, news cursor and image link ' + width + 'x' + height + ' ' + theme)
      }
    }
  } else {
  const routes = ['/', '/login', '/register', '/news', '/news/4', '/articles', '/articles/4', '/gallery', '/shop', '/shop/2', '/track', '/dashboard', '/dashboard/profile', '/dashboard/trips', '/dashboard/trips/register', '/dashboard/wallet', '/dashboard/tickets', '/dashboard/gallery', '/dashboard/articles', '/dashboard/financial-report', '/admin', '/admin/users', '/admin/users/1', '/admin/trips', '/admin/registrations', '/admin/articles', '/admin/gallery', '/admin/news', '/admin/expenses', '/admin/contributions', '/admin/refunds', '/dashboard/orders', '/missing-test-page']
  if (!process.argv.includes('--targeted')) for (const currentTheme of ['light', 'dark']) {
    theme = currentTheme
    for (const width of (process.env.AUDIT_WIDTHS || '360,390,768,1024,1440').split(',').map(Number)) {
      for (const route of routes) {
        await go(route, width)
        const health = await evaluate(`({ text: document.querySelector('#root')?.innerText.length || 0, overflow: document.documentElement.scrollWidth > innerWidth + 1, duplicates: [...document.querySelectorAll('[id]')].map(e=>e.id).filter((id,i,a)=>a.indexOf(id)!==i), title: document.title, unnamed: [...document.querySelectorAll('input,select,textarea')].filter(e=>!e.labels?.length&&!e.getAttribute('aria-label')&&!e.getAttribute('aria-labelledby')&&e.type!=='hidden').map(e=>e.name||e.className) })`)
        assert.ok(health.text > 10, 'Blank route: ' + route)
        assert.equal(health.overflow, false, 'Overflow: ' + route + '@' + width)
        assert.deepEqual(health.duplicates, [], 'Duplicate ids: ' + route)
        assert.deepEqual(health.unnamed, [], 'Unnamed fields: ' + route + ': ' + JSON.stringify(health.unnamed))
        if (route === '/') await screenshot(`home-${width}-${theme}`)
        if (width === 390 && ['/dashboard/profile', '/admin/registrations', '/dashboard/financial-report'].includes(route)) await screenshot(`${route.replaceAll('/', '-')}-${theme}`)
      }
      note('route/field/reflow smoke ' + currentTheme + ' ' + width, { routes: routes.length })
    }
  }
  await go('/dashboard/profile')
  assert.equal(await evaluate("document.querySelector('main').getBoundingClientRect().width >= innerWidth - 40"), true, 'Member content width')
  await until("document.querySelector('[name=first_name]')")
  await evaluate("window.profileInput=document.querySelector('[name=first_name]');profileInput.focus()")
  await cdp.send('Input.insertText', { text: 'نام تازه' })
  assert.equal(await evaluate("profileInput.value.includes('نام تازه')"), true)
  assert.equal(await evaluate("document.activeElement===profileInput && document.querySelector('[name=first_name]')===profileInput"), true)
  assert.equal(await evaluate("document.querySelector('[name=passport_expiry]').value"), user.passport_expiry)
  note('stable profile identity and saved passport expiry')
  await evaluate("document.querySelector('.jdp-input').focus()")
  await key('Enter')
  await until("document.querySelector('.jdp-popup') && document.activeElement.dataset.day")
  const day = await evaluate('document.activeElement.dataset.day')
  await key('ArrowLeft')
  assert.notEqual(await evaluate('document.activeElement.dataset.day'), day)
  await key('Enter')
  assert.equal(await evaluate("!!document.querySelector('.jdp-popup')"), false)
  assert.equal(await evaluate("document.activeElement.classList.contains('jdp-input')"), true)
  note('calendar keyboard open, arrow, pick and focus return')
  await go('/dashboard/trips/register')
  await click('[role=radio]'); await click('.tr-agree input')
  assert.equal(await evaluate("document.querySelector('.tr-agree input').checked"), true)
  await evaluate("document.querySelectorAll('[role=radio]')[1].click()")
  assert.equal(await evaluate("document.querySelector('.tr-agree input').checked"), false)
  note('trip terms reset')
  await go('/gallery')
  await evaluate("document.querySelector('.gl-item').focus()")
  await key('Enter'); await until("document.querySelector('[role=dialog]')")
  assert.equal(await evaluate("document.querySelector('[role=dialog]').contains(document.activeElement)"), true)
  await key('Tab'); assert.equal(await evaluate("document.querySelector('[role=dialog]').contains(document.activeElement)"), true)
  await key('Escape'); assert.equal(await evaluate("document.activeElement.classList.contains('gl-item')"), true)
  note('gallery keyboard dialog trap, Escape and restoration')
  await go('/dashboard')
  assert.equal(await evaluate("document.querySelector('#member-navigation').inert"), true)
  await click('.sidebar-toggle'); assert.equal(await evaluate("document.querySelector('#member-navigation').inert"), false)
  await key('Escape'); assert.equal(await evaluate("document.querySelector('#member-navigation').inert"), true)
  note('mobile drawer exposure and Escape')
  failures.set('/content/news/', { status: 500, data: { detail: 'failed fixture' } })
  await go('/news'); await until("document.querySelector('.request-feedback button')")
  assert.equal(await evaluate("!!document.querySelector('.nw-empty')"), false, 'Failed data is not an empty result')
  failures.clear(); await click('.request-feedback button'); await until("document.querySelector('.nw-card')")
  note('failed list retry restores records')
  await go('/admin/registrations')
  await click('.art-menu-btn'); await evaluate("[...document.querySelectorAll('.art-menu-item')].find(e=>e.textContent.includes('سایر توضیحات')).click()")
  await until("document.querySelector('.art-modal-textarea')")
  await evaluate("document.querySelector('.art-modal-textarea').focus()")
  await cdp.send('Input.insertText', { text: 'یادداشت حفظ شود' })
  failures.set('/trips/admin/registrations/3/action/', { status: 400, data: { error: 'ذخیره نشد' } })
  await click('.art-reject-confirm'); await pause(160)
  assert.equal(await evaluate("!!document.querySelector('[role=dialog]') && document.querySelector('.art-modal-textarea').value.includes('یادداشت')"), true)
  failures.clear(); await click('.art-reject-confirm'); await until("!document.querySelector('[role=dialog]')")
  assert.equal(await evaluate("document.activeElement.id"), 'registration-action-trigger-3')
  note('failed modal save retains draft and retry succeeds')
  authenticated = false
  await go('/dashboard/trips/register')
  await until("location.pathname==='/login'")
  await evaluate("document.querySelector('[name=mobile]').focus()")
  await cdp.send('Input.insertText', { text: user.mobile })
  await evaluate("document.querySelector('[name=password]').focus()")
  await cdp.send('Input.insertText', { text: 'fixture-password' })
  await click('.auth-submit'); await until("location.pathname==='/dashboard/trips/register'")
  note('login returns to intended protected route')
  authenticated = true; await go('/shop/2')
  await evaluate("document.querySelector('[name=address]').focus()")
  await cdp.send('Input.insertText', { text: 'آدرس تست' })
  await evaluate("document.querySelector('[name=postal_code]').focus()")
  await cdp.send('Input.insertText', { text: '1234567890' })
  delayWrites = 180
  const before = requests.filter(request => request.path.endsWith('/orders/create/')).length
  await evaluate("document.querySelector('.pd-submit').click();document.querySelector('.pd-submit').click()")
  await until("document.body.innerText.includes('TEST-900')")
  assert.equal(requests.filter(request => request.path.endsWith('/orders/create/')).length - before, 1)
  await go('/dashboard/orders'); await until("document.body.innerText.includes('TEST-900')")
  note('single order submission, receipt and existing history endpoint')
  await go('/articles/4'); const commentBefore = requests.filter(request => request.path.endsWith('/comments/create/')).length
  await evaluate("document.querySelector('.ad-comment-input').focus()")
  await cdp.send('Input.insertText', { text: 'نظر تست' })
  await evaluate("document.querySelector('.ad-comment-submit').click();document.querySelector('.ad-comment-submit').click()")
  await pause(250)
  assert.equal(requests.filter(request => request.path.endsWith('/comments/create/')).length - commentBefore, 1)
  note('duplicate comment submission guarded')
  const reactionBefore = requests.filter(request => request.path.endsWith('/interactive/react/')).length
  await evaluate("document.querySelector('.ad-reaction-btn').click();document.querySelector('.ad-reaction-btn').click()")
  await pause(260)
  assert.equal(requests.filter(request => request.path.endsWith('/interactive/react/')).length - reactionBefore, 1)
  note('duplicate reaction guarded')
  await go('/dashboard/tickets'); await click('.tk-row'); await until("document.querySelector('.tk-send-btn')")
  await evaluate("document.querySelector('.tk-reply-row input').focus()")
  await cdp.send('Input.insertText', { text: 'پاسخ تست' })
  const replyBefore = requests.filter(request => /\/tickets\/5\/reply\//.test(request.path)).length
  await evaluate("document.querySelector('.tk-send-btn').click();document.querySelector('.tk-send-btn').click()")
  await pause(260)
  assert.equal(requests.filter(request => /\/tickets\/5\/reply\//.test(request.path)).length - replyBefore, 1)
  note('duplicate ticket reply guarded')
  await go('/gallery', 844, 390); await click('.gl-item'); await until("document.querySelector('[role=dialog]')")
  const bounds = await evaluate("(()=>{const r=document.querySelector('.dialog-surface').getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:innerHeight}})()")
  assert.ok(bounds.top >= 0 && bounds.bottom <= bounds.height + 1)
  note('landscape lightbox containment')
  await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await go('/')
  assert.equal(await evaluate("document.querySelector('.cursor-dot') === null && getComputedStyle(document.body).cursor === 'auto'"), true)
  assert.equal(await evaluate("[...document.querySelectorAll('.slide:not(.active)')].every(e=>e.inert)"), true)
  note('reduced motion and inert inactive slides')
  await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] })
  for (const currentTheme of ['light', 'dark']) {
    theme = currentTheme
    await go('/dashboard/financial-report')
    const contrast = await evaluate(`(() => {
      const rgb = value => (value.match(/[\\d.]+/g)||[]).map(Number);
      const luminance = color => color.slice(0,3).map(v=>v/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[0.2126,0.7152,0.0722][i],0);
      return ['.fr-date','.fr-row-desc','.fr-status','.fr-row-title'].map(selector => {
        const el=document.querySelector(selector); const fg=rgb(getComputedStyle(el).color); let node=el,bg;
        while(node){const style=getComputedStyle(node);if(style.backgroundImage!=='none')return {selector,unmeasured:'gradient/image'};const color=rgb(style.backgroundColor);if(color.length===3||color[3]===1){bg=color;break}node=node.parentElement}
        if(!bg)return {selector,unmeasured:'no solid surface'};
        const a=luminance(fg), b=luminance(bg);return {selector,ratio:(Math.max(a,b)+0.05)/(Math.min(a,b)+0.05),fg,bg};
      });
    })()`)
    for (const sample of contrast) if (sample.ratio) assert.ok(sample.ratio >= 4.5, JSON.stringify(sample))
    note('rendered financial text contrast ' + currentTheme, { contrast })
  }
  authenticated = false
  await go('/register')
  await evaluate(`(() => { const values={first_name:'Test',last_name:'User',mobile:'09120000000',password:'fixture-password',password2:'fixture-password'};for(const [name,value] of Object.entries(values)){const input=document.querySelector('[name='+name+']');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,value);input.dispatchEvent(new Event('input',{bubbles:true}))}})()`)
  failures.set('/accounts/register/', { status: 400, data: { mobile: ['شماره قابل استفاده نیست'], password: ['رمز را بررسی کنید'] } })
  await click('.auth-submit'); await until("document.querySelectorAll('[aria-invalid=true]').length === 2")
  assert.equal(await evaluate("document.querySelector('[name=mobile]').value"), '09120000000')
  note('multiple field validation and retained values')
  failures.clear(); authenticated = true; user.user_type = 'admin'; user.perm_financial = false
  await go('/admin/expenses')
  assert.equal(await evaluate("!!document.querySelector('a[href=\"/admin/expenses\"]')"), false)
  assert.equal(await evaluate("document.body.innerText.includes('دسترسی به این بخش')"), true)
  note('permission-aware navigation and denied deep link')
  user.user_type = 'superadmin'; user.perm_financial = true
  failures.set('/accounts/profile/', { status: 503, data: { detail: 'unavailable' } })
  await go('/news'); await until("document.querySelector('.request-feedback')")
  assert.equal(await evaluate("!!document.querySelector('.nw-card')"), true)
  failures.clear(); await click('.request-feedback button'); await pause(200)
  note('public content survives failed authentication and offers retry')
  await go('/')
  await evaluate("document.querySelector('.slide.active a').focus()")
  const initialSlide = await evaluate("[...document.querySelectorAll('.slide')].findIndex(el=>el.classList.contains('active'))")
  await pause(6300)
  assert.equal(await evaluate("[...document.querySelectorAll('.slide')].findIndex(el=>el.classList.contains('active'))"), initialSlide)
  assert.equal(await evaluate("!!document.querySelector('.slider-pause')"), false)
  note('carousel pauses on focus without a visible stop control')
  authenticated = false
  await go('/')
  await click('.slide.active .btn-ghost')
  await until("location.hash === '#about' && scrollY > 100")
  note('about action scrolls to its real destination')
  authenticated = true
  await go('/admin/contributions'); await click('.acn-new-btn')
  await evaluate(`(() => { const values={title:'Campaign',total_amount:'1000000',share_count:'10',share_amount:'100000',start_date:'2027-07-20',end_date:'2027-07-30'};for(const [name,value] of Object.entries(values)){const input=document.querySelector('[name='+name+']');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,value);input.dispatchEvent(new Event('input',{bubbles:true}))}})()`)
  await click('.acn-submit-btn'); await until("!document.querySelector('.acn-form')")
  assert.equal(lastWrite.path, '/api/financial/admin/contributions/')
  assert.equal(lastWrite.payload.share_count, 10)
  assert.equal(lastWrite.payload.share_amount, 100000)
  assert.equal(lastWrite.payload.start_date, '2027-07-20')
  assert.equal(lastWrite.payload.end_date, '2027-07-30')
  note('campaign form sends the existing required schema')
  }
  assert.deepEqual(browserErrors, [], 'Browser exceptions')
  console.log('ALL PASS:', results.length, 'checks; backend requests intercepted:', requests.length)
} catch (error) {
  fs.writeFileSync(new URL('workflow-failure.json', artifact), JSON.stringify(await evaluate("({url:location.href,active:document.activeElement?.outerHTML,popup:document.querySelector('.jdp-popup')?.outerHTML,text:document.body.innerText.slice(-3000)})"), null, 2))
  await screenshot('workflow-failure').catch(() => {})
  throw error
} finally {
  fs.writeFileSync(new URL(process.argv.includes('--theme') ? 'browser-theme.json' : process.argv.includes('--countdown') ? 'browser-countdown.json' : process.argv.includes('--menu') ? 'browser-menu.json' : process.argv.includes('--swipe') ? 'browser-swipe.json' : homeInteractions ? 'browser-home-interactions.json' : visual ? 'browser-visual.json' : process.argv.includes('--targeted') ? 'browser-workflows.json' : 'browser-results.json', artifact), JSON.stringify({ results, browserErrors, requests: requests.length }, null, 2))
  await cdp.send('Page.close').catch(() => {})
  cdp.socket.close()
}
