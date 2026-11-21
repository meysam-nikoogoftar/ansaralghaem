'use client'
import AppLink from '@/components/navigation/app-link'
import { FormValidation } from '@/components/ui/forms'
import { useSession } from './session-provider'
import AuthField from './auth-field'
import AuthFeedback from './auth-feedback'
import useAuthSubmission from '@/hooks/use-auth-submission'
import { registerFormSchema } from '@/lib/auth/validation'

export default function RegisterForm({ returnTo }: { returnTo: string }) {
  const { register } = useSession()
  const form = useAuthSubmission({
    schema: registerFormSchema,
    submit: ({ password2: _, ...values }, signal) => register(values, signal),
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
        aria-label="ایجاد حساب کاربری"
        aria-busy={form.disabled}
      >
        <FormValidation errors={form.errors}>
          <div className="auth-field-row">
            <AuthField
              label="نام"
              name="first_name"
              autoComplete="given-name"
              placeholder="نام"
              maxLength={100}
            />
            <AuthField
              label="نام خانوادگی"
              name="last_name"
              autoComplete="family-name"
              placeholder="نام خانوادگی"
              maxLength={100}
            />
          </div>
          <AuthField
            label="شماره موبایل"
            name="mobile"
            mobile
            type="tel"
            inputMode="tel"
            autoComplete="username"
            placeholder="09120000000"
            maxLength={32}
            dir="ltr"
          />
          <AuthField
            label="رمز عبور"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="حداقل ۶ نویسه"
            minLength={6}
            maxLength={1024}
          />
          <AuthField
            label="تکرار رمز عبور"
            name="password2"
            type="password"
            autoComplete="new-password"
            placeholder="تکرار رمز عبور"
            maxLength={1024}
          />
          <button type="submit" disabled={form.disabled} className="auth-submit">
            {form.pending ? 'در حال ثبت‌نام…' : 'ثبت‌نام'}
          </button>
        </FormValidation>
      </form>
      <div className="auth-footer-link">
        حساب کاربری دارید؟{' '}
        <AppLink href={`/login?returnTo=${encodeURIComponent(returnTo)}`}>وارد شوید</AppLink>
      </div>
    </>
  )
}
