<script setup lang="ts">
const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === 'dark')

function toggle() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>

<template>
  <button
    class="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    :title="isDark ? 'Светлая тема' : 'Тёмная тема'"
    @click="toggle"
  >
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0 rotate-90 scale-75"
      leave-active-class="transition-all duration-200"
      leave-to-class="opacity-0 -rotate-90 scale-75"
      mode="out-in"
    >
      <Icon
        :key="isDark ? 'sun' : 'moon'"
        :name="isDark ? 'ph:sun' : 'ph:moon'"
        size="22"
      />
    </Transition>
  </button>
</template>
