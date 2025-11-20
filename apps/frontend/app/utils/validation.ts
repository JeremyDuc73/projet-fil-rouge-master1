import { z } from 'zod'

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caractères'),
})

// Register schema
export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  confirmPassword: z.string(),
  firstname: z.string().min(2, 'Minimum 2 caractères'),
  lastname: z.string().min(2, 'Minimum 2 caractères'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

// Update profile schema
export const updateProfileSchema = z.object({
  firstname: z.string().min(2, 'Minimum 2 caractères'),
  lastname: z.string().min(2, 'Minimum 2 caractères'),
})

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Minimum 6 caractères'),
  newPassword: z.string().min(6, 'Minimum 6 caractères'),
})

// Movie rating schema
export const ratingSchema = z.object({
  rating: z.number().min(1).max(5),
  review: z.string().optional(),
})

export type LoginForm = z.infer<typeof loginSchema>
export type RegisterForm = z.infer<typeof registerSchema>
export type UpdateProfileForm = z.infer<typeof updateProfileSchema>
export type ChangePasswordForm = z.infer<typeof changePasswordSchema>
export type RatingForm = z.infer<typeof ratingSchema>
