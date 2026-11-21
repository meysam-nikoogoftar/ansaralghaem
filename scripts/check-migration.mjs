import assert from 'node:assert/strict'

const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:3000'
const checks = []
async function get(path) {
  const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(20000) })
  return { response, body: await response.text() }
}
const next = await get('/migration')
assert.equal(next.response.status, 200)
assert.match(next.body, /_next/)
checks.push('Next route')
for (const path of ['/', '/dashboard/profile', '/admin/users']) {
  const legacy = await get(path)
  assert.equal(legacy.response.status, 200, path)
  assert.match(legacy.body, /id="root"/, path)
  checks.push(`Legacy SPA: ${path}`)
  if (path === '/') {
    const assets = [...legacy.body.matchAll(/<script[^>]+src="([^"]+)"|<link[^>]+href="([^"]+\.css(?:\?[^"]*)?)"/g)]
    assert.ok(assets.length, 'Legacy JS/CSS present')
    for (const [, script, stylesheet] of assets) {
      const asset = script || stylesheet
      const result = await get(asset)
      assert.equal(result.response.status, 200, asset)
      assert.doesNotMatch(result.response.headers.get('content-type') || '', /text\/html/, asset)
      checks.push(`Asset: ${asset}`)
    }
  }
}
for (const path of ['/news', '/articles', '/gallery']) {
  const page = await get(path)
  assert.equal(page.response.status, 200, path)
  assert.match(page.body, /<h1/, path)
  assert.doesNotMatch(page.body, /id="root"/, path)
  checks.push(`Next public SSR: ${path}`)
}
for (const path of ['/login', '/register']) {
  const page = await get(path)
  assert.equal(page.response.status, 200, path)
  assert.match(page.body, /noindex/, path)
  assert.match(page.body, /method="post"/, path)
  assert.match(page.response.headers.get('content-security-policy') || '', /nonce-/)
  checks.push(`Next authentication: ${path}`)
}
// An anonymous protected endpoint proves that the request reached Django/DRF.
const api = await get('/api/accounts/profile/')
assert.equal(api.response.status, 401)
assert.match(api.response.headers.get('content-type') || '', /json/)
checks.push('Django API: anonymous profile returns JSON 401')
const media = await get('/media/phase-zero-missing.txt')
assert.equal(media.response.status, 404)
assert.doesNotMatch(media.body, /id="root"/)
checks.push('Missing media reaches Django, not SPA fallback')
console.log(JSON.stringify({ base, checks }, null, 2))
