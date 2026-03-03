<script setup lang="ts">
import DashboardPage from './ui/DashboardPage.vue'

definePageMeta({
  middleware: ['auth'],
})
</script>

<template>
  <DashboardPage />
</template>
