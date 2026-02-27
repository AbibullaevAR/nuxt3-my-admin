<script setup lang="ts">
import { Toaster } from 'vue-sonner'
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <Toaster
    position="bottom-right"
    :duration="4000"
    rich-colors
  />
</template>
