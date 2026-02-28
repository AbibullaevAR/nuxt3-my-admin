<script setup lang="ts">
interface Props {
  padded?: boolean
}

withDefaults(defineProps<Props>(), {
  padded: true,
})
</script>

<template>
  <main
    class="flex-1 overflow-y-auto"
    :class="padded && 'p-6'"
  >
    <slot />
  </main>
</template>
