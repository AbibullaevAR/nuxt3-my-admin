import { useWebSocket } from '@/shared/lib/composables/useWebSocket'
import { useOrderStore } from '@/entities/order/model/order.store'
import { useNotificationsStore } from '@/features/notifications/model/notifications.store'

export function useWebSocketProvider() {
  const config = useRuntimeConfig()
  const orderStore = useOrderStore()
  const notificationsStore = useNotificationsStore()

  const { status, send } = useWebSocket(config.public.wsUrl, {
    autoReconnect: {
      retries: 10,
      delay: 3000,
      maxDelay: 30000,
      backoffMultiplier: 1.5,
    },
    heartbeat: {
      interval: 30000,
      message: 'ping',
      pongTimeout: 5000,
    },
    onMessage: (message) => {
      switch (message.type) {
        case 'NEW_ORDER':
        case 'STATUS_CHANGE':
        case 'PAYMENT_RECEIVED':
          orderStore.handleWebSocketEvent(message.payload as any)
          break

        case 'NOTIFICATION':
          notificationsStore.add(message.payload as any)
          break
      }
    },
    onConnected: () => {
      console.info('[WS Provider] Connected')
    },
    onDisconnected: () => {
      console.warn('[WS Provider] Disconnected')
    },
  })

  return { status, send }
}
