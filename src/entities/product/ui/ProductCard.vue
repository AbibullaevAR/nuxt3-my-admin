<script setup lang="ts">
import type { Product } from '../model/product.types'
import { PRODUCT_STATUS_CONFIG } from '../model/product.types'
import { formatCurrency } from '@/shared/lib/helpers/currency'

interface Props {
  product: Product
}

const props = defineProps<Props>()
const statusConfig = computed(() => PRODUCT_STATUS_CONFIG[props.product.status])
const coverImage = computed(() => props.product.images[0])
const isLowStock = computed(() =>
  props.product.stock > 0 && props.product.stock <= props.product.lowStockThreshold,
)
</script>

<template>
  <NuxtLink
    :to="`/products/${product.id}`"
    class="group block card hover:shadow-md transition-shadow overflow-hidden"
  >
    <div class="relative aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden">
      <NuxtImg
        v-if="coverImage"
        :src="coverImage.url"
        :alt="coverImage.alt ?? product.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        width="300"
        height="300"
        format="webp"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center"
      >
        <Icon
          name="ph:image"
          size="48"
          class="text-gray-300 dark:text-gray-600"
        />
      </div>

      <span
        class="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium"
        :style="{ color: statusConfig.color, backgroundColor: statusConfig.bgColor }"
      >
        {{ statusConfig.label }}
      </span>

      <span
        v-if="product.isFeatured"
        class="absolute top-2 right-2 p-1 rounded-full bg-amber-400 text-amber-900"
        title="Рекомендуемый"
      >
        <Icon name="ph:star-fill" size="12" />
      </span>
    </div>

    <div class="p-4">
      <p class="text-xs text-gray-400 font-mono mb-1">
        {{ product.sku }}
      </p>
      <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug mb-3">
        {{ product.name }}
      </h3>

      <div class="flex items-end justify-between">
        <div>
          <span class="text-base font-bold text-gray-900 dark:text-gray-100">
            {{ formatCurrency(product.price) }}
          </span>
          <span
            v-if="product.compareAtPrice"
            class="text-xs text-gray-400 line-through ml-1.5"
          >
            {{ formatCurrency(product.compareAtPrice) }}
          </span>
        </div>

        <span
          class="text-xs font-medium"
          :class="{
            'text-red-500': product.stock === 0,
            'text-amber-500': isLowStock,
            'text-gray-500 dark:text-gray-400': !isLowStock && product.stock > 0,
          }"
        >
          {{ product.stock === 0 ? 'Нет в наличии' : `${product.stock} шт.` }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
