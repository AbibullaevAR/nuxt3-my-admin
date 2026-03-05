export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth-token')

  if (!token) {
    throw createError({ statusCode: 401, message: 'Не авторизован' })
  }

  const body = await readBody(event)

  return {
    id: '00000000-0000-4000-8000-000000000001',
    firstName: body.firstName ?? 'Иван',
    lastName: body.lastName ?? 'Иванов',
    email: 'admin@example.com',
    avatar: body.avatar,
    role: 'admin',
    isActive: true,
    lastLoginAt: new Date().toISOString(),
    createdAt: '2024-01-01T00:00:00.000Z',
  }
})
