export type WSReadyState = 'connecting' | 'connected' | 'disconnected' | 'error'

export interface WSMessage<T = unknown> {
  type: string
  payload: T
  timestamp: string
}

export function createWebSocketMessage<T>(type: string, payload: T): WSMessage<T> {
  return {
    type,
    payload,
    timestamp: new Date().toISOString(),
  }
}
