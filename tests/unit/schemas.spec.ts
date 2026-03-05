import { describe, it, expect } from 'vitest'
import {
  OrderSchema,
  OrderCreateSchema,
  OrderFilterSchema,
  OrderAddressSchema,
  ProductSchema,
  ProductCreateSchema,
} from '@/entities/order/model/order.types'
import { ProductSchema as ProdSchema } from '@/entities/product/model/product.types'

describe('Order Zod Schemas', () => {
  describe('OrderAddressSchema', () => {
    const validAddress = {
      fullName: 'Иван Иванов',
      phone: '+71234567890',
      city: 'Москва',
      street: 'Тверская ул.',
      building: '1',
      postalCode: '123456',
    }

    it('validates correct address', () => {
      expect(() => OrderAddressSchema.parse(validAddress)).not.toThrow()
    })

    it('rejects invalid phone format', () => {
      const result = OrderAddressSchema.safeParse({
        ...validAddress,
        phone: '81234567890',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('phone')
      }
    })

    it('rejects invalid postal code', () => {
      const result = OrderAddressSchema.safeParse({
        ...validAddress,
        postalCode: '12345', // should be 6 digits
      })
      expect(result.success).toBe(false)
    })

    it('allows optional fields', () => {
      const result = OrderAddressSchema.safeParse(validAddress)
      expect(result.success).toBe(true)
      // apartment and comment are optional
    })
  })

  describe('OrderFilterSchema', () => {
    it('applies defaults for empty input', () => {
      const result = OrderFilterSchema.parse({})
      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
      expect(result.sortBy).toBe('createdAt')
      expect(result.sortOrder).toBe('desc')
    })

    it('validates status array', () => {
      const result = OrderFilterSchema.parse({
        status: ['pending', 'confirmed'],
      })
      expect(result.status).toEqual(['pending', 'confirmed'])
    })

    it('rejects invalid status values', () => {
      const result = OrderFilterSchema.safeParse({
        status: ['invalid_status'],
      })
      expect(result.success).toBe(false)
    })

    it('enforces limit maximum', () => {
      const result = OrderFilterSchema.safeParse({ limit: 200 })
      expect(result.success).toBe(false)
    })
  })

  describe('OrderCreateSchema', () => {
    it('applies default status as pending', () => {
      const minPayload = {
        items: [{
          id: '550e8400-e29b-41d4-a716-446655440000',
          productId: '550e8400-e29b-41d4-a716-446655440001',
          productName: 'Test',
          sku: 'TP-0001',
          quantity: 1,
          unitPrice: 100,
          totalPrice: 100,
        }],
        subtotal: 100,
        shippingCost: 0,
        total: 100,
        paymentMethod: 'card',
        shippingAddress: {
          fullName: 'Тест',
          phone: '+71234567890',
          city: 'Москва',
          street: 'Тест',
          building: '1',
          postalCode: '123456',
        },
        customerId: '550e8400-e29b-41d4-a716-446655440002',
        customerName: 'Тест',
        customerEmail: 'test@example.com',
      }

      const result = OrderCreateSchema.parse(minPayload)
      expect(result.status).toBe('pending')
      expect(result.isPaid).toBe(false)
    })

    it('requires at least 1 item', () => {
      const result = OrderCreateSchema.safeParse({ items: [] })
      expect(result.success).toBe(false)
    })
  })
})

describe('Product Zod Schemas', () => {
  it('validates SKU format', () => {
    const validSKU = ProdSchema.shape.sku
    expect(validSKU.safeParse('AB-1234').success).toBe(true)
    expect(validSKU.safeParse('ABCD-12345678').success).toBe(true)
    expect(validSKU.safeParse('ab-1234').success).toBe(false) // lowercase
    expect(validSKU.safeParse('A-123').success).toBe(false) // too short prefix
    expect(validSKU.safeParse('AB-123').success).toBe(false) // too short number
  })

  it('validates product name length', () => {
    const nameSchema = ProdSchema.shape.name
    expect(nameSchema.safeParse('AB').success).toBe(false) // min 3
    expect(nameSchema.safeParse('ABC').success).toBe(true)
    expect(nameSchema.safeParse('A'.repeat(201)).success).toBe(false) // max 200
  })

  it('requires positive price', () => {
    const priceSchema = ProdSchema.shape.price
    expect(priceSchema.safeParse(0).success).toBe(false)
    expect(priceSchema.safeParse(-100).success).toBe(false)
    expect(priceSchema.safeParse(1).success).toBe(true)
  })

  it('requires at least 1 image', () => {
    const imagesSchema = ProdSchema.shape.images
    expect(imagesSchema.safeParse([]).success).toBe(false)
    expect(imagesSchema.safeParse([{
      id: '1', url: 'https://img.test/1.jpg', order: 0,
    }]).success).toBe(true)
  })
})
