import { z } from 'zod'

export const UserRoleSchema = z.enum(['admin', 'manager', 'viewer'])

export const UserSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  avatar: z.string().url().optional(),
  role: UserRoleSchema,
  isActive: z.boolean().default(true),
  lastLoginAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
})

export type UserRole = z.infer<typeof UserRoleSchema>
export type User = z.infer<typeof UserSchema>

export const USER_ROLE_CONFIG: Record<UserRole, { label: string; color: string }> = {
  admin:   { label: 'Администратор', color: '#ef4444' },
  manager: { label: 'Менеджер',      color: '#3b82f6' },
  viewer:  { label: 'Наблюдатель',   color: '#6b7280' },
}
