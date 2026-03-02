export default defineEventHandler(() => {
  return { accessToken: 'demo-token-' + Date.now() }
})
