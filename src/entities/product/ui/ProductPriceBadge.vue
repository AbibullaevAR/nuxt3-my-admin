<script setup lang="ts">
import { formatCurrency } from '@/shared/lib/helpers/currency'

interface Props {
  price: number
  compareAtPrice?: number
}

defineProps<Props>()
</script>

<template>
  <div class="flex items-baseline gap-2">
    <span class="font-bold text-gray-900 dark:text-gray-100">
      {{ formatCurrency(price) }}
    </span>
    <span
      v-if="compareAtPrice && compareAtPrice > price"
      class="text-sm text-gray-400 line-through"
    >
      {{ formatCurrency(compareAtPrice) }}
    </span>
    <span
      v-if="compareAtPrice && compareAtPrice > price"
      class="text-xs font-medium text-green-600 dark:text-green-400"
    >
      −{{ Math.round((1 - price / compareAtPrice) * 100) }}%
    </span>
  </div>
</template>
