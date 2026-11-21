import type { z } from 'zod'
import type { loginFormSchema, registerFormSchema } from '@/lib/auth/validation'
import type {
  articleSchema,
  newsSchema,
  gallerySchema,
  userSchema,
  authSchema,
  commentSchema,
  reactionsSchema,
  categorySchema,
  announcementSchema,
} from '@/lib/contracts'

// Shared domain contracts are explicit imports, never ambient window/global state.
export type Article = z.infer<typeof articleSchema>
export type News = z.infer<typeof newsSchema>
export type GalleryImage = z.infer<typeof gallerySchema>
export type User = z.infer<typeof userSchema>
export type AuthResponse = z.infer<typeof authSchema>
export type ArticleComment = z.infer<typeof commentSchema>
export type Reactions = z.infer<typeof reactionsSchema>
export type ArticleCategory = z.infer<typeof categorySchema>
export type Announcement = z.infer<typeof announcementSchema>
export type FieldErrors = Readonly<Record<string, string>>
export type ThemePreference = 'light' | 'dark' | 'auto'
export type RequestDecoder<T> = (input: unknown) => T
export type LoginCredentials = z.output<typeof loginFormSchema>
export type RegistrationValues = z.output<typeof registerFormSchema>
export type RegisterCredentials = Omit<RegistrationValues, 'password2'>
export type AuthFieldName = keyof RegistrationValues
