<script setup lang="ts">
interface Props {
  label?: string
  error?: string
  hint?: string
  required?: boolean
}

defineProps<Props>()
</script>

<template>
  <div class="space-y-1.5">
    <label
      v-if="label"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      {{ label }}
      <span
        v-if="required"
        class="text-red-500 ml-0.5"
      >*</span>
    </label>

    <slot />

    <p
      v-if="error"
      class="text-xs text-red-500 flex items-center gap-1"
    >
      <Icon name="ph:warning-circle" size="12" />
      {{ error }}
    </p>
    <p
      v-else-if="hint"
      class="text-xs text-gray-500 dark:text-gray-400"
    >
      {{ hint }}
    </p>
  </div>
</template>
