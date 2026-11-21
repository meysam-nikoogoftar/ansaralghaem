import test from 'node:test'
import assert from 'node:assert/strict'
import { browserRequest } from '../lib/api/browser'
import { invalidateCsrf } from '../../shared/session-client'
test('mutations bootstrap CSRF and use cookies without bearer tokens', async () => {
  const original = globalThis.fetch
  invalidateCsrf()
  const calls: string[] = []
  globalThis.fetch = async (input, init) => {
    calls.push(String(input))
    assert.equal(init?.credentials, 'same-origin')
    assert.equal(new Headers(init?.headers).has('Authorization'), false)
    if (String(input).endsWith('/session/')) return Response.json({ user: null, csrfToken: 'a'.repeat(64) })
    assert.equal(new Headers(init?.headers).get('X-CSRFToken'), 'a'.repeat(64))
    return Response.json({ ok: true })
  }
  try { assert.deepEqual(await browserRequest('/accounts/login/', value => value, { method: 'POST', body: {} }), { ok: true }); assert.equal(calls.length, 2) }
  finally { globalThis.fetch = original; invalidateCsrf() }
})
