export default defineNuxtConfig({
  compatibilityDate: '2024-07-01',
  devtools: { enabled: true },

  srcDir: './src',

  modules: [
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    '@nuxt/image',
    '@nuxtjs/color-mode',
    '@vueuse/nuxt',
    'nuxt-icon',
    '@nuxt/test-utils/module',
  ],

  // Route rules — SSR / ISR / SPA per route
  routeRules: {
    '/':             { redirect: '/dashboard' },
    '/dashboard':    { isr: 60, swr: true },
    '/orders':       { ssr: true },
    '/orders/**':    { ssr: true },
    '/products':     { isr: 300 },
    '/products/**':  { ssr: true },
    '/customers':    { ssr: true },
    '/analytics':    { ssr: false },            // SPA — heavy charts, no SEO needed
    '/settings':     { ssr: false },
    '/api/**':       { cors: true },
  },

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
    databaseUrl: process.env.DATABASE_URL || '',
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
      wsUrl: process.env.NUXT_PUBLIC_WS_URL || 'ws://localhost:3001',
      appName: 'ShopAdmin',
      currency: 'RUB',
    },
  },

  pinia: {
    storesDirs: ['./src/**/model/**'],
  },

  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
    storageKey: 'shop-admin-color-mode',
  },

  image: {
    quality: 80,
    formats: ['webp', 'avif'],
    screens: { xs: 320, sm: 640, md: 768, lg: 1024, xl: 1280, xxl: 1536 },
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  css: [
    '~/app/styles/global.scss',
  ],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  vite: {
    
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/app/styles/variables" as *;',
        },
      },
    },
    optimizeDeps: {
      include: ['echarts', 'fuse.js', 'date-fns', 'zod', 'sortablejs'],
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      title: 'ShopAdmin — E-Commerce Dashboard',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'robots', content: 'noindex, nofollow' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' },
      ],
    },
  },
})
