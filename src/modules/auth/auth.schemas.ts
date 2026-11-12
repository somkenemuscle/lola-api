import { z } from 'zod'

const email = z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address'))

export const signupSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is too short').max(100, 'Full name is too long'),
  email,
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
})

export const loginSchema = z.object({
  email,
  // No length rules on login: just reject empty or absurdly long input before hashing it.
  password: z.string().min(1, 'Password is required').max(128),
})

export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
