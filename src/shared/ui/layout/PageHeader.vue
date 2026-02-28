<script setup lang="ts">
interface Props {
  title: string
  description?: string
}

defineProps<Props>()
</script>

<template>
  <div class="flex items-start justify-between gap-4 mb-6">
    <div>
      <h1 class="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
        {{ title }}
      </h1>
      <p
        v-if="description"
        class="mt-1 text-sm text-gray-500 dark:text-[#8b98b4]"
      >
        {{ description }}
      </p>
    </div>
    <div
      v-if="$slots.actions"
      class="flex items-center gap-2 shrink-0"
    >
      <slot name="actions" />
    </div>
  </div>
</template>
