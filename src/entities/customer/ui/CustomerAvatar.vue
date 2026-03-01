<script setup lang="ts">
import type { Customer } from '../model/customer.types'
import { CUSTOMER_SEGMENT_CONFIG } from '../model/customer.types'

interface Props {
  customer: Pick<Customer, 'firstName' | 'lastName' | 'avatar' | 'segment'>
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const initials = computed(() =>
  `${props.customer.firstName.charAt(0)}${props.customer.lastName.charAt(0)}`.toUpperCase(),
)

const segmentColor = computed(() =>
  CUSTOMER_SEGMENT_CONFIG[props.customer.segment].color,
)

const sizeClass = computed(() => ({
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
}[props.size]))
</script>

<template>
  <div
    class="rounded-full flex items-center justify-center font-semibold text-white shrink-0 overflow-hidden"
    :class="sizeClass"
    :style="{ backgroundColor: segmentColor }"
  >
    <img
      v-if="customer.avatar"
      :src="customer.avatar"
      :alt="`${customer.firstName} ${customer.lastName}`"
      class="w-full h-full object-cover"
    >
    <span v-else>{{ initials }}</span>
  </div>
</template>
