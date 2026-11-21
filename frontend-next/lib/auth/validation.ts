import { z } from 'zod'

export function normalizeMobile(value: string): string {
  return value.trim().replace(/[۰-۹٠-٩]/g, (digit) => {
    const code = digit.charCodeAt(0)
    return String(code >= 0x6f0 ? code - 0x6f0 : code - 0x660)
  })
}

const mobile = z
  .string()
  .transform(normalizeMobile)
  .pipe(z.string().regex(/^09\d{9}$/, 'شماره موبایل را به صورت ۱۱ رقم و با ۰۹ وارد کنید.'))
// Passwords are never trimmed or normalized. Existing passwords remain exact.
const password = z
  .string()
  .min(1, 'رمز عبور را وارد کنید.')
  .max(1024, 'رمز عبور بیش از حد طولانی است.')
const name = z
  .string()
  .trim()
  .min(1, 'این فیلد الزامی است.')
  .max(100, 'حداکثر ۱۰۰ نویسه وارد کنید.')
export const loginFormSchema = z.object({ mobile, password })
export const registerFormSchema = z
  .object({
    first_name: name,
    last_name: name,
    mobile,
    password: password.refine(
      (value) => value.length >= 6,
      'رمز عبور باید حداقل ۶ نویسه داشته باشد.',
    ),
    password2: z.string(),
  })
  .refine((value) => value.password === value.password2, {
    path: ['password2'],
    message: 'رمز عبور و تکرار آن یکسان نیستند.',
  })
