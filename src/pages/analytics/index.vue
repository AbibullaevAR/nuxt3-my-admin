<script setup lang="ts">
import AnalyticsPage from './ui/AnalyticsPage.vue'

definePageMeta({ middleware: ['auth'] })
</script>

<template>
  <AnalyticsPage />
</template>
