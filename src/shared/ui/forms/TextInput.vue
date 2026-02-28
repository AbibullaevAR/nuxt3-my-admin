<script setup lang="ts">
interface Props {
  modelValue: string | number
  type?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  prefix?: string
  suffix?: string
}

withDefaults(defineProps<Props>(), {
  type: 'text',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="relative flex items-center">
    <span
      v-if="prefix"
      class="absolute left-3 text-sm text-gray-400 select-none pointer-events-none"
    >
      {{ prefix }}
    </span>
    <input
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      class="input"
      :class="{
        'pl-8': prefix,
        'pr-8': suffix,
        'opacity-50 cursor-not-allowed': disabled,
        'bg-gray-50 dark:bg-gray-900': readonly,
      }"
      v-bind="$attrs"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
    <span
      v-if="suffix"
      class="absolute right-3 text-sm text-gray-400 select-none pointer-events-none"
    >
      {{ suffix }}
    </span>
  </div>
</template>
