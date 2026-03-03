<script setup lang="ts">
import OrderStatusBadge from '@/entities/order/ui/OrderStatusBadge.vue'
import OrderStatusSelect from '@/features/manage-order/ui/OrderStatusSelect.vue'
import PageHeader from '@/shared/ui/layout/PageHeader.vue'
import { useOrderStore } from '@/entities/order/model/order.store'
import { PAYMENT_METHOD_LABELS } from '@/entities/order/model/order.types'
import { formatCurrency } from '@/shared/lib/helpers/currency'
import { formatDateTime } from '@/shared/lib/helpers/date'

const route = useRoute()
const orderStore = useOrderStore()
const orderId = route.params.id as string

onMounted(() => orderStore.fetchOrderById(orderId))

const order = computed(() => orderStore.currentOrder)
</script>

<template>
  <div class="p-6 space-y-5">
    <div class="flex items-center gap-3">
      <button
        class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
        @click="navigateTo('/orders')"
      >
        <Icon name="ph:arrow-left" size="20" />
      </button>
      <PageHeader
        :title="order?.orderNumber ?? 'Загрузка...'"
        :description="order ? formatDateTime(order.createdAt) : ''"
      />
    </div>

    <div
      v-if="orderStore.isLoading"
      class="py-20 text-center"
    >
      <Icon
        name="ph:spinner"
        size="40"
        class="animate-spin text-primary-500 mx-auto"
      />
    </div>

    <template v-else-if="order">
      <div class="card-padded flex items-center justify-between gap-4 flex-wrap">
        <div class="flex items-center gap-3">
          <OrderStatusBadge :status="order.status" />
          <span class="text-sm text-gray-500">
            {{ order.isPaid ? '✓ Оплачен' : '✗ Не оплачен' }}
          </span>
        </div>
        <OrderStatusSelect
          :order-id="order.id"
          :current-status="order.status"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div class="lg:col-span-2 card-padded space-y-4">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Состав заказа
          </h3>
          <div
            v-for="item in order.items"
            :key="item.id"
            class="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
          >
            <img
              v-if="item.productImage"
              :src="item.productImage"
              :alt="item.productName"
              class="w-12 h-12 rounded-lg object-cover bg-gray-100"
            >
            <div
              v-else
              class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
            >
              <Icon name="ph:package" size="20" class="text-gray-400" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                {{ item.productName }}
              </p>
              <p class="text-xs text-gray-500 font-mono">
                {{ item.sku }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold">
                {{ formatCurrency(item.totalPrice) }}
              </p>
              <p class="text-xs text-gray-500">
                {{ formatCurrency(item.unitPrice) }} × {{ item.quantity }}
              </p>
            </div>
          </div>

          <div class="space-y-2 pt-2">
            <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Подытог</span>
              <span>{{ formatCurrency(order.subtotal) }}</span>
            </div>
            <div
              v-if="order.discount > 0"
              class="flex justify-between text-sm text-red-500"
            >
              <span>Скидка</span>
              <span>−{{ formatCurrency(order.discount) }}</span>
            </div>
            <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Доставка</span>
              <span>{{ order.shippingCost === 0 ? 'Бесплатно' : formatCurrency(order.shippingCost) }}</span>
            </div>
            <div class="flex justify-between text-base font-bold text-gray-900 dark:text-gray-100 pt-2 border-t border-gray-200 dark:border-gray-700">
              <span>Итого</span>
              <span>{{ formatCurrency(order.total) }}</span>
            </div>
          </div>
        </div>

        <div class="space-y-5">
          <div class="card-padded space-y-3">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Клиент
            </h3>
            <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
              {{ order.customerName }}
            </p>
            <p class="text-sm text-gray-500">
              {{ order.customerEmail }}
            </p>
          </div>

          <div class="card-padded space-y-3">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Адрес доставки
            </h3>
            <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>{{ order.shippingAddress.fullName }}</p>
              <p>{{ order.shippingAddress.phone }}</p>
              <p>{{ order.shippingAddress.city }}, {{ order.shippingAddress.street }}, {{ order.shippingAddress.building }}</p>
              <p v-if="order.shippingAddress.apartment">
                кв. {{ order.shippingAddress.apartment }}
              </p>
              <p>{{ order.shippingAddress.postalCode }}</p>
            </div>
          </div>

          <div class="card-padded space-y-2">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Оплата
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ PAYMENT_METHOD_LABELS[order.paymentMethod] }}
            </p>
            <p class="text-xs">
              <span
                :class="order.isPaid
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-amber-600 dark:text-amber-400'"
              >
                {{ order.isPaid ? '✓ Оплачен' : '⏳ Ожидает оплаты' }}
              </span>
            </p>
          </div>

          <div
            v-if="order.trackingNumber"
            class="card-padded space-y-2"
          >
            <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Трек-номер
            </h3>
            <p class="text-sm font-mono text-primary-600 dark:text-primary-400">
              {{ order.trackingNumber }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
