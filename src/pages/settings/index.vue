<script setup lang="ts">
import SettingsPage from './ui/SettingsPage.vue'

definePageMeta({ middleware: ['auth'] })
</script>

<template>
  <SettingsPage />
</template>
