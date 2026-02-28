import { ref, onMounted, onUnmounted, type Ref } from 'vue'

type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

interface WebSocketMessage<T = unknown> {
  type: string
  payload: T
  timestamp: string
}

interface UseWebSocketOptions {
  autoReconnect?: {
    retries: number
    delay: number
    maxDelay?: number
    backoffMultiplier?: number
  }
  heartbeat?: {
    interval: number
    message: string
    pongTimeout?: number
  }
  onMessage?: (message: WebSocketMessage) => void
  onConnected?: () => void
  onDisconnected?: (event: CloseEvent) => void
  onError?: (event: Event) => void
}

export function useWebSocket(
  url: string | Ref<string>,
  options: UseWebSocketOptions = {},
) {
  const {
    autoReconnect = { retries: 5, delay: 3000 },
    heartbeat,
    onMessage,
    onConnected,
    onDisconnected,
    onError,
  } = options

  const status = ref<WebSocketStatus>('disconnected')
  const lastMessage = ref<WebSocketMessage | null>(null)
  const messageCount = ref(0)

  let ws: WebSocket | null = null
  let reconnectAttempts = 0
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null
  let pongTimer: ReturnType<typeof setTimeout> | null = null

  function getUrl(): string {
    return typeof url === 'string' ? url : url.value
  }

  function connect(): void {
    if (ws?.readyState === WebSocket.OPEN || ws?.readyState === WebSocket.CONNECTING) {
      return
    }

    status.value = 'connecting'

    try {
      ws = new WebSocket(getUrl())
    } catch (err) {
      status.value = 'error'
      scheduleReconnect()
      return
    }

    ws.onopen = () => {
      status.value = 'connected'
      reconnectAttempts = 0
      startHeartbeat()
      onConnected?.()
    }

    ws.onmessage = (event: MessageEvent) => {
      if (event.data === 'pong') {
        clearPongTimeout()
        return
      }

      try {
        const message: WebSocketMessage = JSON.parse(event.data)
        lastMessage.value = message
        messageCount.value++
        onMessage?.(message)
      } catch {
        console.warn('[WebSocket] Failed to parse message:', event.data)
      }
    }

    ws.onclose = (event: CloseEvent) => {
      status.value = 'disconnected'
      stopHeartbeat()
      onDisconnected?.(event)

      if (event.code !== 1000) {
        scheduleReconnect()
      }
    }

    ws.onerror = (event: Event) => {
      status.value = 'error'
      onError?.(event)
    }
  }

  function send(data: unknown): void {
    if (ws?.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocket] Cannot send — not connected')
      return
    }

    const payload = typeof data === 'string' ? data : JSON.stringify(data)
    ws.send(payload)
  }

  function close(code: number = 1000, reason?: string): void {
    clearReconnectTimer()
    stopHeartbeat()
    ws?.close(code, reason)
    ws = null
    status.value = 'disconnected'
  }

  function scheduleReconnect(): void {
    if (!autoReconnect || reconnectAttempts >= autoReconnect.retries) {
      console.warn(`[WebSocket] Max reconnect attempts (${autoReconnect.retries}) reached`)
      return
    }

    const multiplier = autoReconnect.backoffMultiplier ?? 1.5
    const maxDelay = autoReconnect.maxDelay ?? 30000
    const delay = Math.min(autoReconnect.delay * (multiplier ** reconnectAttempts), maxDelay)

    reconnectAttempts++
    console.info(`[WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`)

    reconnectTimer = setTimeout(() => {
      connect()
    }, delay)
  }

  function clearReconnectTimer(): void {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }

  function startHeartbeat(): void {
    if (!heartbeat) return

    heartbeatTimer = setInterval(() => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(heartbeat.message)
        startPongTimeout()
      }
    }, heartbeat.interval)
  }

  function stopHeartbeat(): void {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
    clearPongTimeout()
  }

  function startPongTimeout(): void {
    const timeout = heartbeat?.pongTimeout ?? 5000
    pongTimer = setTimeout(() => {
      console.warn('[WebSocket] Pong timeout — closing connection')
      ws?.close(4000, 'Pong timeout')
    }, timeout)
  }

  function clearPongTimeout(): void {
    if (pongTimer) {
      clearTimeout(pongTimer)
      pongTimer = null
    }
  }

  onMounted(() => {
    connect()
  })

  onUnmounted(() => {
    close()
  })

  return {
    status,
    lastMessage,
    messageCount,
    send,
    close,
    connect,
  }
}
