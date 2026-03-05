import type { Order, OrderStatus, OrderItem, OrderAddress } from '@/entities/order/model/order.types'
import type { Product, ProductStatus } from '@/entities/product/model/product.types'
import type { Customer, CustomerSegment } from '@/entities/customer/model/customer.types'

const ORDER_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
const PRODUCT_STATUSES: ProductStatus[] = ['active', 'active', 'active', 'draft', 'out_of_stock']
const CUSTOMER_SEGMENTS: CustomerSegment[] = ['vip', 'loyal', 'loyal', 'new', 'new', 'at_risk', 'inactive']

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomDate(daysAgo: number = 30): string {
  const d = new Date()
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo))
  d.setHours(randomInt(8, 22), randomInt(0, 59))
  return d.toISOString()
}

const PRODUCT_NAMES = [
  'Кроссовки беговые', 'Футболка хлопковая', 'Джинсы slim-fit', 'Куртка зимняя',
  'Рюкзак городской', 'Кепка бейсболка', 'Носки спортивные', 'Толстовка с капюшоном',
  'Шорты пляжные', 'Платье летнее', 'Пальто кашемировое', 'Кеды классические',
  'Сумка кожаная', 'Ремень плетёный', 'Шарф шерстяной', 'Перчатки зимние',
]

const CATEGORIES = [
  { id: uuid(), name: 'Обувь', slug: 'obuv' },
  { id: uuid(), name: 'Одежда', slug: 'odezhda' },
  { id: uuid(), name: 'Аксессуары', slug: 'aksessuary' },
]

const CUSTOMER_NAMES = [
  ['Иван', 'Иванов'], ['Мария', 'Петрова'], ['Алексей', 'Сидоров'],
  ['Анна', 'Козлова'], ['Дмитрий', 'Новиков'], ['Елена', 'Морозова'],
  ['Сергей', 'Волков'], ['Ольга', 'Соколова'], ['Андрей', 'Попов'],
  ['Наталья', 'Лебедева'],
]

export function generateProducts(count: number = 50): Product[] {
  return Array.from({ length: count }, (_, i) => {
    const name = randomFrom(PRODUCT_NAMES) + ` ${String.fromCharCode(65 + (i % 26))}-${i + 1}`
    const category = randomFrom(CATEGORIES)
    const price = randomInt(500, 15000)
    const compareAtPrice = Math.random() > 0.6 ? Math.round(price * (1.1 + Math.random() * 0.4)) : undefined

    return {
      id: uuid(),
      name,
      slug: `product-${i + 1}`,
      sku: `${name.substring(0, 2).toUpperCase()}-${String(1000 + i).padStart(4, '0')}`,
      price,
      compareAtPrice,
      costPrice: Math.round(price * 0.5),
      categoryId: category.id,
      categoryName: category.name,
      images: [{
        id: uuid(),
        url: `https://picsum.photos/seed/${i + 1}/400/400`,
        alt: name,
        order: 0,
      }],
      stock: randomInt(0, 100),
      lowStockThreshold: 5,
      weight: randomInt(100, 2000),
      tags: [],
      status: randomFrom(PRODUCT_STATUSES),
      isFeatured: Math.random() > 0.8,
      createdAt: randomDate(90),
      updatedAt: randomDate(10),
    } satisfies Product
  })
}

export function generateCustomers(count: number = 80): Customer[] {
  return Array.from({ length: count }, (_, i) => {
    const [firstName, lastName] = randomFrom(CUSTOMER_NAMES)
    const totalOrders = randomInt(0, 50)
    const totalSpent = totalOrders * randomInt(1000, 8000)

    return {
      id: uuid(),
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      phone: i % 3 === 0 ? `+7916${String(randomInt(1000000, 9999999))}` : undefined,
      segment: randomFrom(CUSTOMER_SEGMENTS),
      totalOrders,
      totalSpent,
      averageOrderValue: totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0,
      lastOrderAt: totalOrders > 0 ? randomDate(30) : undefined,
      isEmailVerified: Math.random() > 0.2,
      isBlocked: Math.random() > 0.95,
      tags: [],
      createdAt: randomDate(365),
      updatedAt: randomDate(30),
    } satisfies Customer
  })
}

export function generateOrders(customers: Customer[], products: Product[], count: number = 100): Order[] {
  return Array.from({ length: count }, (_, i) => {
    const customer = randomFrom(customers)
    const itemCount = randomInt(1, 4)
    const items: OrderItem[] = Array.from({ length: itemCount }, () => {
      const product = randomFrom(products)
      const quantity = randomInt(1, 3)
      const unitPrice = product.price
      return {
        id: uuid(),
        productId: product.id,
        productName: product.name,
        productImage: product.images[0]?.url,
        sku: product.sku,
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity,
      }
    })

    const subtotal = items.reduce((s, it) => s + it.totalPrice, 0)
    const discount = Math.random() > 0.7 ? Math.round(subtotal * 0.1) : 0
    const shippingCost = subtotal >= 5000 ? 0 : 350
    const total = subtotal - discount + shippingCost
    const status = randomFrom(ORDER_STATUSES)
    const createdAt = randomDate(60)

    const address: OrderAddress = {
      fullName: `${customer.firstName} ${customer.lastName}`,
      phone: customer.phone ?? '+79161234567',
      city: randomFrom(['Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург']),
      street: 'ул. Пушкина',
      building: String(randomInt(1, 200)),
      apartment: Math.random() > 0.5 ? String(randomInt(1, 200)) : undefined,
      postalCode: String(100000 + randomInt(0, 899999)),
    }

    return {
      id: uuid(),
      orderNumber: `ORD-2025-${String(1000 + i).padStart(6, '0')}`,
      status,
      items,
      subtotal,
      discount,
      shippingCost,
      total,
      paymentMethod: randomFrom(['card', 'sbp', 'cash_on_delivery', 'invoice']),
      isPaid: status === 'delivered' || status === 'shipped' || Math.random() > 0.3,
      shippingAddress: address,
      customerId: customer.id,
      customerName: `${customer.firstName} ${customer.lastName}`,
      customerEmail: customer.email,
      trackingNumber: ['shipped', 'delivered'].includes(status)
        ? `RU${String(randomInt(100000000, 999999999))}SU`
        : undefined,
      createdAt,
      updatedAt: createdAt,
      deliveredAt: status === 'delivered' ? randomDate(5) : undefined,
    } satisfies Order
  })
}

export const MOCK_PRODUCTS = generateProducts(60)
export const MOCK_CUSTOMERS = generateCustomers(80)
export const MOCK_ORDERS = generateOrders(MOCK_CUSTOMERS, MOCK_PRODUCTS, 120)
export const MOCK_CATEGORIES = [
  { id: uuid(), name: 'Обувь', slug: 'obuv', productCount: 20, isActive: true, parentId: null, order: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: uuid(), name: 'Одежда', slug: 'odezhda', productCount: 30, isActive: true, parentId: null, order: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: uuid(), name: 'Аксессуары', slug: 'aksessuary', productCount: 10, isActive: true, parentId: null, order: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
]
