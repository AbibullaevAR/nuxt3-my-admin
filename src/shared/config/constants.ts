export const DEFAULT_PAGE_SIZE = 20
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const

export const DEBOUNCE_SEARCH = 300
export const DEBOUNCE_FILTER = 200
export const TOAST_DURATION = 4000
export const WS_RECONNECT_DELAY = 3000

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024
export const MAX_IMAGES_PER_PRODUCT = 10
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

export const LOW_STOCK_THRESHOLD = 5
export const FREE_SHIPPING_THRESHOLD = 5000

export const ROUTES = {
  DASHBOARD: '/dashboard',
  ORDERS: '/orders',
  ORDER_DETAIL: (id: string) => `/orders/${id}`,
  ORDER_CREATE: '/orders/create',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (id: string) => `/products/${id}`,
  PRODUCT_CREATE: '/products/create',
  CUSTOMERS: '/customers',
  CUSTOMER_DETAIL: (id: string) => `/customers/${id}`,
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
  LOGIN: '/login',
} as const

export const STATUS_COLORS = {
  success: { text: '#10b981', bg: '#d1fae5' },
  warning: { text: '#f59e0b', bg: '#fef3c7' },
  error:   { text: '#ef4444', bg: '#fee2e2' },
  info:    { text: '#3b82f6', bg: '#dbeafe' },
  muted:   { text: '#6b7280', bg: '#f3f4f6' },
} as const

export const NAV_ITEMS = [
  { label: 'Дашборд',  icon: 'ph:squares-four',    path: '/dashboard' },
  { label: 'Заказы',   icon: 'ph:shopping-bag',     path: '/orders' },
  { label: 'Товары',   icon: 'ph:package',          path: '/products' },
  { label: 'Клиенты',  icon: 'ph:users',            path: '/customers' },
  { label: 'Аналитика', icon: 'ph:chart-line-up',  path: '/analytics' },
  { label: 'Настройки', icon: 'ph:gear-six',        path: '/settings' },
] as const
