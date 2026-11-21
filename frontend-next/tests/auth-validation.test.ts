import test from 'node:test'
import assert from 'node:assert/strict'
import { loginFormSchema, registerFormSchema, normalizeMobile } from '../lib/auth/validation'

test('mobile input accepts Persian/Arabic digits without changing passwords', () => {
  assert.equal(normalizeMobile(' ۰۹۱۲۰۰۰۰۰۰۰ '), '09120000000')
  assert.equal(normalizeMobile('٠٩١٢٠٠٠٠٠٠٠'), '09120000000')
  const result = loginFormSchema.parse({ mobile: '۰۹۱۲۰۰۰۰۰۰۰', password: '  رمز عبور  ' })
  assert.equal(result.password, '  رمز عبور  ')
  assert.equal(result.mobile, '09120000000')
  for (const mobile of ['0912', 'abc', '00989120000000', '091200000000'])
    assert.equal(loginFormSchema.safeParse({ mobile, password: 'password' }).success, false)
})
test('registration rejects mismatched/short passwords and strips role injection', () => {
  const values = {
    first_name: ' نام ',
    last_name: ' خانواده ',
    mobile: '09120000000',
    password: 'secret 123',
    password2: 'secret 123',
    user_type: 'superadmin',
    is_staff: true,
  }
  const result = registerFormSchema.parse(values)
  assert.equal(result.first_name, 'نام')
  assert.equal('user_type' in result, false)
  assert.equal('is_staff' in result, false)
  const mismatch = registerFormSchema.safeParse({ ...values, password2: 'different' })
  assert.equal(mismatch.success, false)
  if (!mismatch.success) assert.equal(mismatch.error.issues[0]?.path[0], 'password2')
  assert.equal(
    registerFormSchema.safeParse({ ...values, password: 'short', password2: 'short' }).success,
    false,
  )
  assert.equal(registerFormSchema.safeParse({ ...values, first_name: '   ' }).success, false)
})
