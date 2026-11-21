import test from 'node:test'
import assert from 'node:assert/strict'
import { safeReturnTo, safeInternalHref, isNextPath, loginHref } from '../lib/navigation'
import { safeMediaPath, safeAparatLink } from '../lib/urls'
import { articleSchema, newsSchema } from '../lib/contracts'
import { jsonLd } from '../lib/seo'
import { gregorianToJalali, jalaliToGregorian } from '../lib/jalali'

test('redirect destinations reject external, encoded and looping paths', () => {
  for (const input of [
    '//evil.test',
    'https://evil.test',
    '/\\evil.test',
    '/%2f%2fevil.test',
    '/%5cevil.test',
    '/%0aevil',
    '/%6cogin',
    '/login',
    '/register',
    '/bad value',
  ])
    assert.equal(safeReturnTo(input), '/dashboard', input)
  assert.equal(safeReturnTo('/articles/7?from=news#comments'), '/articles/7?from=news#comments')
  assert.equal(loginHref('/articles/7#comments'), '/login?returnTo=%2Farticles%2F7%23comments')
  assert.equal(isNextPath('/articles/7'), true)
  assert.equal(isNextPath('/newsroom'), false)
  assert.equal(isNextPath('/dashboard'), true)
  assert.equal(isNextPath('/admin/users/17/?from=search#profile'), true)
  assert.equal(isNextPath('/admin/users/17/unknown'), false)
  assert.equal(isNextPath('/admin/users-export'), false)
  assert.equal(safeInternalHref('/login'), '/login')
  assert.equal(safeInternalHref('/register'), '/register')
  assert.equal(safeReturnTo('/%252f%252fevil.test'), '/dashboard')
})
test('media never passes an API-provided remote URL to the optimizer', () => {
  assert.equal(safeMediaPath('http://127.0.0.1:8000/media/news/a.jpg'), '/media/news/a.jpg')
  assert.equal(safeMediaPath('https://example.test/media/a.jpg?token=secret'), '/media/a.jpg')
  for (const input of [
    'javascript:alert(1)',
    'http://169.254.169.254/latest/meta-data',
    '/media/../secret.jpg',
    '/media/%2e%2e/secret.jpg',
    '/media/%252e%252e/secret.jpg',
    '/media/file.svg',
    '/media/file.html',
  ])
    assert.equal(safeMediaPath(input), null, input)
  assert.equal(safeAparatLink('javascript:alert(1)'), null)
  assert.equal(safeAparatLink('https://aparat.com.evil.test/a'), null)
  assert.equal(safeAparatLink('https://aparat.com/v/test'), 'https://aparat.com/v/test')
})
test('public contracts drop internal fields and reject malformed payloads', () => {
  const data = {
    id: 7,
    title: 'عنوان',
    content: 'متن',
    created_at: '2026-11-21',
    views_count: 0,
    category: 'article',
    author_name: 'نویسنده',
    approved_by: 'private-sentinel',
  }
  const result = articleSchema.parse(data)
  assert.equal('approved_by' in result, false)
  assert.throws(() => articleSchema.parse({ ...data, id: '../accounts/profile' }))
  assert.throws(() => newsSchema.parse({ ...data, views_count: 'invalid' }))
})
test('structured data cannot terminate its script element', () => {
  assert.doesNotMatch(jsonLd({ title: '</script><script>alert(1)</script>' }), /</)
})
test('typed Jalali conversion preserves leap and new year boundaries', () => {
  for (const day of [
    [2024, 3, 20],
    [2025, 3, 20],
    [2026, 11, 21],
  ] as const) {
    assert.deepEqual(jalaliToGregorian(...gregorianToJalali(day[0], day[1], day[2])), [...day])
  }
})

