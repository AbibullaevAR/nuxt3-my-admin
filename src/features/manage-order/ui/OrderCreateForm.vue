<script setup lang="ts">
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useOrderStore } from '@/entities/order/model/order.store'
import { useProductStore } from '@/entities/product/model/product.store'
import { useCustomerStore } from '@/entities/customer/model/customer.store'
import { formatCurrency } from '@/shared/lib/helpers/currency'
import type { OrderItem } from '@/entities/order/model/order.types'

const emit = defineEmits<{ saved: [orderId: string] }>()

const orderStore = useOrderStore()
const productStore = useProductStore()
const customerStore = useCustomerStore()

onMounted(() => {
  productStore.fetchProducts({ limit: 100, status: ['active'] })
  customerStore.fetchCustomers({ limit: 100 })
})

interface LineItem {
  productId: string
  productName: string
  productImage?: string
  sku: string
  unitPrice: number
  quantity: number
}

const lineItems = ref<LineItem[]>([])
const selectedProductId = ref('')

function addProduct() {
  const product = productStore.products.find(p => p.id === selectedProductId.value)
  if (!product) return
  const existing = lineItems.value.find(i => i.productId === product.id)
  if (existing) {
    existing.quantity++
  } else {
    lineItems.value.push({
      productId: product.id,
      productName: product.name,
      productImage: product.images[0]?.url,
      sku: product.sku,
      unitPrice: product.price,
      quantity: 1,
    })
  }
  selectedProductId.value = ''
}

function removeItem(idx: number) {
  lineItems.value.splice(idx, 1)
}

const subtotal = computed(() =>
  lineItems.value.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
)
const shippingCost = computed(() => subtotal.value >= 5000 ? 0 : 350)
const total = computed(() => subtotal.value + shippingCost.value)

const FormSchema = z.object({
  customerId: z.string().uuid('Выберите клиента'),
  paymentMethod: z.enum(['card', 'sbp', 'cash_on_delivery', 'invoice']),
  fullName: z.string().min(2, 'Минимум 2 символа'),
  phone: z.string().regex(/^\+7\d{10}$/, 'Формат: +7XXXXXXXXXX'),
  city: z.string().min(2, 'Введите город'),
  street: z.string().min(3, 'Введите улицу'),
  building: z.string().min(1, 'Введите дом'),
  apartment: z.string().optional(),
  postalCode: z.string().regex(/^\d{6}$/, '6 цифр'),
})

const { handleSubmit, errors } = useForm({ validationSchema: toTypedSchema(FormSchema) })
const { value: customerId } = useField<string>('customerId', undefined, { initialValue: '' })
const { value: paymentMethod } = useField<string>('paymentMethod', undefined, { initialValue: 'card' })
const { value: fullName } = useField<string>('fullName', undefined, { initialValue: '' })
const { value: phone } = useField<string>('phone', undefined, { initialValue: '' })
const { value: city } = useField<string>('city', undefined, { initialValue: '' })
const { value: street } = useField<string>('street', undefined, { initialValue: '' })
const { value: building } = useField<string>('building', undefined, { initialValue: '' })
const { value: apartment } = useField<string>('apartment', undefined, { initialValue: '' })
const { value: postalCode } = useField<string>('postalCode', undefined, { initialValue: '' })

watch(customerId, (id) => {
  const customer = customerStore.customers.find(c => c.id === id)
  if (customer) {
    fullName.value = `${customer.firstName} ${customer.lastName}`
    phone.value = customer.phone ?? ''
  }
})

const isSubmitting = ref(false)
const itemsError = ref('')

const onSubmit = handleSubmit(async (values) => {
  if (lineItems.value.length === 0) {
    itemsError.value = 'Добавьте хотя бы один товар'
    return
  }
  itemsError.value = ''

  isSubmitting.value = true
  try {
    const items: OrderItem[] = lineItems.value.map(i => ({
      id: crypto.randomUUID(),
      productId: i.productId,
      productName: i.productName,
      productImage: i.productImage,
      sku: i.sku,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      totalPrice: i.unitPrice * i.quantity,
    }))

    const customer = customerStore.customers.find(c => c.id === values.customerId)

    const order = await orderStore.createOrder({
      status: 'pending',
      items,
      subtotal: subtotal.value,
      discount: 0,
      shippingCost: shippingCost.value,
      total: total.value,
      paymentMethod: values.paymentMethod as any,
      isPaid: false,
      shippingAddress: {
        fullName: values.fullName,
        phone: values.phone,
        city: values.city,
        street: values.street,
        building: values.building,
        apartment: values.apartment || undefined,
        postalCode: values.postalCode,
      },
      customerId: values.customerId,
      customerName: customer ? `${customer.firstName} ${customer.lastName}` : values.fullName,
      customerEmail: customer?.email ?? '',
    })

    emit('saved', order.id)
  } finally {
    isSubmitting.value = false
  }
})
</script>

<template>
  <form
    class="space-y-6"
    @submit.prevent="onSubmit"
  >
    <div class="card-padded space-y-4">
      <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 pb-2 border-b border-gray-200 dark:border-gray-700">
        Клиент
      </h3>
      <div class="space-y-1.5">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Выберите клиента</label>
        <select
          v-model="customerId"
          class="input"
        >
          <option value="">
            — не выбран —
          </option>
          <option
            v-for="c in customerStore.customers"
            :key="c.id"
            :value="c.id"
          >
            {{ c.firstName }} {{ c.lastName }} ({{ c.email }})
          </option>
        </select>
        <p
          v-if="errors.customerId"
          class="text-xs text-red-500"
        >
          {{ errors.customerId }}
        </p>
      </div>
    </div>

    <div class="card-padded space-y-4">
      <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 pb-2 border-b border-gray-200 dark:border-gray-700">
        Состав заказа
      </h3>

      <div class="flex gap-2">
        <select
          v-model="selectedProductId"
          class="input flex-1"
        >
          <option value="">
            Выберите товар
          </option>
          <option
            v-for="p in productStore.products"
            :key="p.id"
            :value="p.id"
          >
            {{ p.name }} — {{ formatCurrency(p.price) }}
          </option>
        </select>
        <button
          type="button"
          class="btn-primary px-4"
          :disabled="!selectedProductId"
          @click="addProduct"
        >
          <Icon
            name="ph:plus"
            size="18"
          />
        </button>
      </div>

      <p
        v-if="itemsError"
        class="text-xs text-red-500"
      >
        {{ itemsError }}
      </p>

      <div
        v-if="lineItems.length"
        class="divide-y divide-gray-100 dark:divide-gray-800"
      >
        <div
          v-for="(item, idx) in lineItems"
          :key="item.productId"
          class="flex items-center gap-3 py-3"
        >
          <img
            v-if="item.productImage"
            :src="item.productImage"
            :alt="item.productName"
            class="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0"
          >
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {{ item.productName }}
            </p>
            <p class="text-xs text-gray-400 font-mono">
              {{ item.sku }}
            </p>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button
              type="button"
              class="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              @click="item.quantity = Math.max(1, item.quantity - 1)"
            >
              <Icon
                name="ph:minus"
                size="14"
              />
            </button>
            <span class="w-8 text-center text-sm tabular-nums">{{ item.quantity }}</span>
            <button
              type="button"
              class="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              @click="item.quantity++"
            >
              <Icon
                name="ph:plus"
                size="14"
              />
            </button>
          </div>
          <p class="text-sm font-semibold text-gray-900 dark:text-gray-100 w-24 text-right tabular-nums shrink-0">
            {{ formatCurrency(item.unitPrice * item.quantity) }}
          </p>
          <button
            type="button"
            class="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
            @click="removeItem(idx)"
          >
            <Icon
              name="ph:x"
              size="16"
            />
          </button>
        </div>
      </div>

      <div
        v-if="lineItems.length"
        class="space-y-1.5 pt-3 border-t border-gray-200 dark:border-gray-700"
      >
        <div class="flex justify-between text-sm text-gray-500">
          <span>Подытог</span>
          <span>{{ formatCurrency(subtotal) }}</span>
        </div>
        <div class="flex justify-between text-sm text-gray-500">
          <span>Доставка</span>
          <span>{{ shippingCost === 0 ? 'Бесплатно' : formatCurrency(shippingCost) }}</span>
        </div>
        <div class="flex justify-between text-base font-bold text-gray-900 dark:text-gray-100">
          <span>Итого</span>
          <span>{{ formatCurrency(total) }}</span>
        </div>
      </div>
    </div>

    <div class="card-padded space-y-4">
      <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 pb-2 border-b border-gray-200 dark:border-gray-700">
        Адрес доставки
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">ФИО получателя</label>
          <input
            v-model="fullName"
            type="text"
            class="input"
            placeholder="Иван Иванов"
          >
          <p
            v-if="errors.fullName"
            class="text-xs text-red-500"
          >
            {{ errors.fullName }}
          </p>
        </div>
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Телефон</label>
          <input
            v-model="phone"
            type="tel"
            class="input"
            placeholder="+79161234567"
          >
          <p
            v-if="errors.phone"
            class="text-xs text-red-500"
          >
            {{ errors.phone }}
          </p>
        </div>
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Город</label>
          <input
            v-model="city"
            type="text"
            class="input"
            placeholder="Москва"
          >
          <p
            v-if="errors.city"
            class="text-xs text-red-500"
          >
            {{ errors.city }}
          </p>
        </div>
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Улица</label>
          <input
            v-model="street"
            type="text"
            class="input"
            placeholder="ул. Пушкина"
          >
          <p
            v-if="errors.street"
            class="text-xs text-red-500"
          >
            {{ errors.street }}
          </p>
        </div>
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Дом</label>
          <input
            v-model="building"
            type="text"
            class="input"
            placeholder="10"
          >
          <p
            v-if="errors.building"
            class="text-xs text-red-500"
          >
            {{ errors.building }}
          </p>
        </div>
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Квартира (необязательно)</label>
          <input
            v-model="apartment"
            type="text"
            class="input"
            placeholder="42"
          >
        </div>
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Индекс</label>
          <input
            v-model="postalCode"
            type="text"
            class="input"
            placeholder="123456"
          >
          <p
            v-if="errors.postalCode"
            class="text-xs text-red-500"
          >
            {{ errors.postalCode }}
          </p>
        </div>
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Способ оплаты</label>
          <select
            v-model="paymentMethod"
            class="input"
          >
            <option value="card">
              Банковская карта
            </option>
            <option value="sbp">
              СБП
            </option>
            <option value="cash_on_delivery">
              Наложенный платёж
            </option>
            <option value="invoice">
              Счёт для юрлиц
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-3">
      <button
        type="button"
        class="btn-secondary"
        @click="navigateTo('/orders')"
      >
        Отмена
      </button>
      <button
        type="submit"
        class="btn-primary"
        :disabled="isSubmitting"
      >
        <Icon
          v-if="isSubmitting"
          name="ph:spinner"
          size="16"
          class="animate-spin mr-2"
        />
        Создать заказ
      </button>
    </div>
  </form>
</template>
