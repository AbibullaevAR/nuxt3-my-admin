import { ApiError } from './http-client'

export function getErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.isValidation) return 'Ошибка валидации данных'
    if (err.isUnauthorized) return 'Необходима авторизация'
    if (err.isNotFound) return 'Запись не найдена'
    return err.message || 'Ошибка сервера'
  }

  if (err instanceof Error) {
    return err.message
  }

  return 'Произошла неизвестная ошибка'
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError
}

export function getValidationErrors(err: unknown): Record<string, string> {
  if (err instanceof ApiError && err.isValidation && err.data) {
    const data = err.data as { errors?: Record<string, string[]> }
    if (data.errors) {
      return Object.fromEntries(
        Object.entries(data.errors).map(([key, messages]) => [key, messages[0]]),
      )
    }
  }
  return {}
}
