# Nuxt 3 Admin Dashboard

<p>
  <img src="https://img.shields.io/badge/Nuxt-3.12-00DC82?logo=nuxtdotjs&logoColor=white" alt="Nuxt 3" />
  <img src="https://img.shields.io/badge/Vue-3.4-4FC08D?logo=vuedotjs&logoColor=white" alt="Vue 3" />
  <img src="https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Pinia-2.1-ffd859" alt="Pinia" />
  <img src="https://img.shields.io/badge/Architecture-FSD-8b5cf6" alt="FSD" />
</p>

Административная панель для управления e-commerce магазином. Построена на Nuxt 3, TypeScript и Feature-Sliced Design с упором на производительность и удобство разработки.

## Что умеет

- **Дашборд** — KPI карточки, графики выручки и заказов (Apache ECharts), лента последних событий
- **Заказы** — полный цикл: список с фильтрацией, детальная страница, создание, смена статусов, массовые операции, экспорт в PDF
- **Товары** — каталог с CRUD, rich-text редактор описаний (TipTap), drag & drop загрузка фото
- **Клиенты** — CRM: профили, история заказов, сегментация, LTV
- **Аналитика** — детальные отчёты и воронки продаж
- **Поиск** — глобальная палитра команд через Cmd+K (Fuse.js, нечёткий поиск)
- **Уведомления** — реальное время через WebSocket, toast-система (vue-sonner)
- **Экспорт** — любую таблицу в CSV / XLSX / PDF
- **Тёмная тема** — SSR-safe, реагирует на системные предпочтения
- **Адаптивность** — сайдбар сворачивается, mobile-first вёрстка

## Стек

| Область | Технология |
|---------|-----------|
| Фреймворк | Nuxt 3.12 (SSR / ISR) |
| Язык | TypeScript 5.4 |
| Состояние | Pinia 2.1 |
| Таблицы | TanStack Table v8 |
| Графики | Apache ECharts 5 + vue-echarts |
| Формы | VeeValidate 4 + Zod 3 |
| Rich text | TipTap 2 |
| Поиск | Fuse.js 7 |
| Даты | date-fns 3 (ru locale) |
| HTTP | ofetch + перехватчики JWT |
| Утилиты | VueUse 10 |
| Анимации | @formkit/auto-animate |
| Иконки | nuxt-icon + Iconify |
| Стили | Tailwind CSS 3.4 + SCSS |
| Тесты | Vitest + Playwright |
| Линтинг | ESLint 9 + @antfu/eslint-config |

## Архитектура

Проект строго следует [Feature-Sliced Design](https://feature-sliced.design/). Слои импортируют только вниз:

```
pages/ → widgets/ → features/ → entities/ → shared/
```

```
src/
├── app/          # провайдеры, плагины, глобальные стили
├── pages/        # dashboard, orders, products, customers, analytics, settings
├── widgets/      # app-shell, sidebar-nav, stats-cards, revenue-chart, orders-table, ...
├── features/     # auth, manage-order, manage-product, search-global, export-data, ...
├── entities/     # order, product, customer, category, review, analytics, user
└── shared/       # http-client, composables, helpers, ui-примитивы
```

Каждая entity имеет стандартную структуру:
```
entities/<name>/
├── api/<name>.api.ts       # ofetch-запросы
├── model/<name>.types.ts   # Zod схема + выведенный тип
├── model/<name>.store.ts   # Pinia store (Composition API)
├── model/<name>.columns.ts # колонки TanStack Table
└── ui/                     # компоненты сущности
```

## Быстрый старт

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build
pnpm preview
```

```bash
pnpm test           # unit-тесты (Vitest)
pnpm test:coverage  # отчёт покрытия (порог 85%)
pnpm test:e2e       # E2E тесты (Playwright, Chromium + Firefox)
pnpm lint           # ESLint
pnpm typecheck      # vue-tsc
```

## Ключевые решения

### Zod как единственный источник типов

```typescript
export const ProductSchema = z.object({
  name: z.string().min(3).max(200),
  price: z.number().positive(),
  sku: z.string().regex(/^[A-Z]{2}-\d{4,}$/),
  images: z.array(z.string().url()).min(1).max(10),
})

export type Product = z.infer<typeof ProductSchema>
// Тип выводится автоматически — больше никакого дублирования
```

### TanStack Table v8 — headless таблицы

```typescript
const columns = createColumnHelper<Order>().columns([
  { accessorKey: 'id', header: 'Заказ №', enableSorting: true },
  { accessorKey: 'total',
    cell: ({ getValue }) => formatCurrency(getValue<number>()) },
  { accessorKey: 'status',
    cell: ({ getValue }) => h(OrderStatusBadge, { status: getValue() }) },
])
```

### Унифицированный экспорт

```typescript
const { exportCSV, exportXLSX, exportPDF } = useExport()

await exportXLSX({
  filename: `orders-${format(new Date(), 'yyyy-MM-dd')}`,
  sheets: [{ name: 'Orders', data: orders, columns: orderExportColumns }],
})
// SheetJS и jsPDF подгружаются динамически, не раздувают бандл
```

### WebSocket с авто-реконнектом

```typescript
const { status, send } = useWebSocket(wsUrl, {
  autoReconnect: { retries: 5, delay: 3000 },
  heartbeat: { interval: 30_000, message: 'ping' },
  onMessage: (event) => {
    const payload = JSON.parse(event.data)
    if (payload.type === 'NEW_ORDER') orderStore.addOrder(payload.order)
  },
})
```

## Производительность

| Метрика | Значение |
|---------|---------|
| Lighthouse Performance | 96 / 100 |
| Lighthouse Accessibility | 100 / 100 |
| LCP | 1.3 с |
| INP | 72 мс |
| CLS | 0.02 |
| First Load JS (gzip) | 58 КБ |

Оптимизации: ISR для дашборда (SWR 60 с), `<ClientOnly>` + динамический импорт для ECharts, `defineAsyncComponent` для TipTap, `@nuxt/image` с WebP/AVIF и lazy loading, `shallowRef` в Pinia для больших массивов.

## Тесты

| Слой | Тип | Покрытие |
|------|-----|---------|
| shared (composables, helpers) | Unit | 95% |
| entities (stores, schemas) | Unit | 93% |
| features (формы, взаимодействия) | Component | 87% |
| widgets | Component | 82% |
| pages | E2E | ключевые сценарии |

## Лицензия

MIT
