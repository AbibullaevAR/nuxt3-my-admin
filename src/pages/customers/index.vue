<script setup lang="ts">
import CustomersPage from './ui/CustomersPage.vue'

definePageMeta({ middleware: ['auth'] })
</script>

<template>
  <CustomersPage />
</template>
