<script setup lang="ts">
import type { OrderStatus } from '../model/order.types'
import { ORDER_STATUS_CONFIG } from '../model/order.types'

interface Props {
  status: OrderStatus
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const config = computed(() => ORDER_STATUS_CONFIG[props.status])
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full font-medium"
    :class="{
      'px-2 py-0.5 text-xs': size === 'sm',
      'px-2.5 py-1 text-sm': size === 'md',
    }"
    :style="{
      color: config.color,
      backgroundColor: config.bgColor,
    }"
  >
    <Icon
      :name="config.icon"
      :size="size === 'sm' ? '12' : '14'"
    />
    {{ config.label }}
  </span>
</template>
