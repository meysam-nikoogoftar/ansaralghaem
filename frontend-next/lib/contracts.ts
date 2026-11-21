import { z } from 'zod'

const id = z.number().int().positive()
const text = z.string().max(200_000)
const image = z.string().max(2048).nullable().optional()
const date = z.string().max(80)
const content = {
  id,
  title: z.string().max(200),
  content: text,
  created_at: date,
  views_count: z.number().int().nonnegative(),
}

export const categorySchema = z.enum(['article', 'memory', 'munajat', 'madahi', 'mouludi'])
export const newsSchema = z.object({ ...content, image, published_at: date.nullable().optional() })
export const articleSchema = z.object({
  ...content,
  category: categorySchema,
  author_name: z.string().max(200),
  main_image: image,
  extra_image1: image,
  extra_image2: image,
  extra_image3: image,
  aparat_link: z.string().max(2048).optional(),
})
export const gallerySchema = z.object({
  id,
  title: z.string().max(200),
  image: z.string().max(2048),
  uploader_name: z.string().max(200),
  category: z.string().max(100).optional(),
})
export const announcementSchema = z.object({
  id,
  text,
  announcement_type: z.enum(['info', 'warning', 'welcome']),
})
export const userSchema = z.object({
  id,
  first_name: z.string(),
  last_name: z.string(),
  mobile: z.string(),
  user_type: z.enum(['user', 'admin', 'superadmin']),
  admin_role: z.string().optional(),
  perm_users: z.boolean().optional(),
  perm_trips: z.boolean().optional(),
  perm_registrations: z.boolean().optional(),
  perm_financial: z.boolean().optional(),
  perm_content: z.boolean().optional(),
  perm_tickets: z.boolean().optional(),
  profile_image: image,
})
export const authSchema = z.object({
  user: userSchema,
  csrfToken: z.string().min(32),
})
export const sessionSchema = z.object({ user: userSchema.nullable(), csrfToken: z.string().min(32) })
export const reactionsSchema = z.object({
  heart: z.number().int().nonnegative().default(0),
  pray: z.number().int().nonnegative().default(0),
  cry: z.number().int().nonnegative().default(0),
  rose: z.number().int().nonnegative().default(0),
})
const commentFields = { id, user_name: z.string(), user_image: image, text, created_at: date }
export const commentSchema = z.object({
  ...commentFields,
  replies: z.array(z.object(commentFields)).default([]),
})
export const listOf = <T>(schema: z.ZodType<T>) => z.array(schema).max(10_000)
