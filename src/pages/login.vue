<script setup lang="ts">
import LoginForm from '@/features/auth/ui/LoginForm.vue'

definePageMeta({ layout: 'auth' })
</script>

<template>
  <div class="min-h-screen bg-[#f8f9fc] dark:bg-[#0d1117] flex items-center justify-center p-4">
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-32 w-96 h-96 bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-3xl" />
      <div class="absolute -bottom-40 -left-32 w-96 h-96 bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-3xl" />
    </div>

    <div class="w-full max-w-sm relative">
      <div class="text-center mb-8">
        <div class="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-600/25">
          <Icon name="ph:shopping-cart-simple" size="22" class="text-white" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          ShopAdmin
        </h1>
        <p class="text-sm text-gray-400 dark:text-[#8b98b4] mt-1.5">
          Войдите в панель управления
        </p>
      </div>

      <div class="card-padded shadow-card-hover">
        <LoginForm />
      </div>
    </div>
  </div>
</template>
