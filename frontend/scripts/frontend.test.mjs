import test from 'node:test'
import assert from 'node:assert/strict'
import { safeReturnTo } from '../src/utils/navigation.js'
import { fieldErrors, errorMessage } from '../src/utils/validation.js'
import { gregorianToJalali, jalaliToGregorian } from '../src/utils/jalali.js'

globalThis.window = { location: { origin: 'https://example.test' } }

test('login return destinations preserve internal task context', () => {
  assert.equal(safeReturnTo('/dashboard/trips/register?trip=7#terms'), '/dashboard/trips/register?trip=7#terms')
  assert.equal(safeReturnTo('/shop/2'), '/shop/2')
})

test('login return destinations reject external, malformed and auth-loop targets', () => {
  for (const value of ['https://evil.test', '//evil.test', '/\\evil.test', 'javascript:alert(1)', '/\nevil', '/login', '/login?returnTo=/shop', '/register/', null, {}, 'shop/2']) {
    assert.equal(safeReturnTo(value), '/dashboard', String(value))
  }
})

test('all server field errors survive normalization', () => {
  const error = { response: { data: { mobile: ['Invalid mobile', 'Already used'], password: ['Too short'], non_field_errors: ['Try again'] } } }
  assert.deepEqual(fieldErrors(error), { mobile: 'Invalid mobile، Already used', password: 'Too short', non_field_errors: 'Try again' })
  assert.equal(errorMessage(error), 'Try again')
})

test('network exceptions do not expose request configuration as field errors', () => {
  const error = new Error('Network Error')
  error.config = { headers: { Authorization: 'private fixture' } }
  assert.deepEqual(fieldErrors(error), {})
  assert.ok(!errorMessage(error).includes('private'))
})

test('Jalali dates round-trip across new year and leap boundaries', () => {
  assert.deepEqual(gregorianToJalali(2024, 3, 20), [1403, 1, 1])
  for (const date of [[2000, 1, 1], [2024, 3, 19], [2024, 3, 20], [2025, 3, 20], [2027, 7, 27]]) {
    assert.deepEqual(jalaliToGregorian(...gregorianToJalali(...date)), date)
  }
})
