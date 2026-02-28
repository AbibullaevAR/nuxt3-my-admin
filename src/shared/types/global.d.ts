export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
  limit: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
}

export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type Variant = 'primary' | 'secondary' | 'danger' | 'warning' | 'success' | 'ghost'
export type ColorScheme = 'light' | 'dark' | 'system'

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

export type Nullable<T> = { [K in keyof T]: T[K] | null }

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}

export interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

export interface FilterConfig {
  key: string
  value: unknown
}
