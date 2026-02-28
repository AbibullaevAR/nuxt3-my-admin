import { ofetch, type FetchOptions } from 'ofetch'

export async function httpClient<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const config = useRuntimeConfig()
  const tokenCookie = useCookie('auth-token')

  return ofetch<T>(endpoint, {
    baseURL: config.public.apiBase,

    headers: {
      'Content-Type': 'application/json',
      ...(tokenCookie.value && {
        Authorization: `Bearer ${tokenCookie.value}`,
      }),
      ...options.headers,
    },

    onResponseError: async ({ response }) => {
      if (response.status === 401) {
        try {
          const newToken = await ofetch<{ accessToken: string }>(
            '/auth/refresh',
            { baseURL: config.public.apiBase, method: 'POST' },
          )
          tokenCookie.value = newToken.accessToken

          return httpClient<T>(endpoint, options)
        } catch {
          tokenCookie.value = null
          navigateTo('/login')
        }
      }

      const message = response._data?.message || `HTTP Error ${response.status}`
      throw new ApiError(message, response.status, response._data)
    },

    ...options,
  })
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly data?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }

  get isNotFound() { return this.statusCode === 404 }
  get isUnauthorized() { return this.statusCode === 401 }
  get isValidation() { return this.statusCode === 422 }
}
