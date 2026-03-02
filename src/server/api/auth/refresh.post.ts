export default defineEventHandler((event) => {
  const token = getCookie(event, 'auth-token')
  if (!token) {
    throw createError({ statusCode: 401, message: 'Не авторизован' })
  }
  const newToken = 'demo-token-' + Date.now()
  return { accessToken: newToken }
})
