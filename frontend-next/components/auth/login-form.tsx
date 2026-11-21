'use client'
import AppLink from '@/components/navigation/app-link'
import { FormValidation } from '@/components/ui/forms'
import { useSession } from './session-provider'
import AuthField from './auth-field'
import AuthFeedback from './auth-feedback'
import useAuthSubmission from '@/hooks/use-auth-submission'
import { loginFormSchema } from '@/lib/auth/validation'

export default function LoginForm({ returnTo }: { returnTo: string }) {
  const { login } = useSession()
  const form = useAuthSubmission({
    schema: loginFormSchema,
    submit: (values, signal) => login(values.mobile, values.password, signal),
    returnTo,
  })
  return (
    <>
      <AuthFeedback
        checking={form.checking}
        sessionError={form.sessionError}
        onRetry={form.retrySession}
      />
      <form
        ref={form.formRef}
        method="post"
        onSubmit={form.onSubmit}
        noValidate
        className="auth-form-block"
        aria-label="ورود به حساب"
        aria-busy={form.disabled}
      >
        <FormValidation errors={form.errors}>
          <AuthField
            name="mobile"
            label="شماره موبایل"
            type="tel"
            inputMode="tel"
            autoComplete="username"
            placeholder="09120000000"
            maxLength={32}
            dir="ltr"
          />
          <AuthField
            name="password"
            label="رمز عبور"
            type="password"
            autoComplete="current-password"
            placeholder="رمز عبور"
            maxLength={1024}
          />
          <button type="submit" disabled={form.disabled} className="auth-submit">
            {form.pending ? 'در حال ورود…' : 'ورود'}
          </button>
        </FormValidation>
      </form>
      <p className="field-hint auth-support">
        رمز عبور را فراموش کرده‌اید؟ برای راهنمایی با پشتیبانی هیئت تماس بگیرید:{' '}
        <a href="tel:09301066288">۰۹۳۰۱۰۶۶۲۸۸</a> / <a href="tel:09384776775">۰۹۳۸۴۷۷۶۷۷۵</a>
      </p>
      <div className="auth-footer-link">
        حساب کاربری ندارید؟{' '}
        <AppLink href={`/register?returnTo=${encodeURIComponent(returnTo)}`}>ثبت‌نام کنید</AppLink>
      </div>
    </>
  )
}
