import { MessageResponse, ConversationResponse, UnifiedMessage } from '../types/api';
import { API_CONFIG } from '../config/api';

export interface WebSocketMessage {
  type: 'new_message' | 'message_read' | 'conversation_updated' | 'broadcast';
  data: any;
}

export interface WebSocketCallbacks {
  onNewMessage?: (message: MessageResponse) => void;
  onMessageRead?: (messageId: number) => void;
  onConversationUpdated?: (conversation: ConversationResponse) => void;
  onBroadcast?: (message: string) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private callbacks: WebSocketCallbacks = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = API_CONFIG.websocket.maxReconnectAttempts;
  private reconnectInterval = API_CONFIG.websocket.reconnectInterval;
  private isConnecting = false;

  constructor(private wsUrl: string = API_CONFIG.wsUrl) {}

  connect(callbacks: WebSocketCallbacks = {}): void {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;
    this.callbacks = callbacks;

    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.callbacks.onConnect?.();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnecting = false;
        this.callbacks.onDisconnect?.();
        
        // Intentar reconectar si no fue un cierre intencional
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
        this.callbacks.onError?.(error);
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.isConnecting = false;
      this.callbacks.onError?.(error as Event);
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'new_message':
        this.callbacks.onNewMessage?.(message.data);
        break;
      case 'message_read':
        this.callbacks.onMessageRead?.(message.data.messageId);
        break;
      case 'conversation_updated':
        this.callbacks.onConversationUpdated?.(message.data);
        break;
      case 'broadcast':
        this.callbacks.onBroadcast?.(message.data.message);
        break;
      default:
        console.log('Unknown WebSocket message type:', message.type);
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (this.reconnectAttempts <= this.maxReconnectAttempts) {
        this.connect(this.callbacks);
      }
    }, delay);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevenir reconexión automática
  }

  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Cannot send message.');
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  getConnectionState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }
}

// Instancia singleton
export const wsService = new WebSocketService();

// Hook para usar WebSocket en componentes React
export function useWebSocket(callbacks: WebSocketCallbacks = {}) {
  const connect = () => wsService.connect(callbacks);
  const disconnect = () => wsService.disconnect();
  const send = (message: any) => wsService.send(message);
  const isConnected = () => wsService.isConnected();
  const getConnectionState = () => wsService.getConnectionState();

  return {
    connect,
    disconnect,
    send,
    isConnected,
    getConnectionState
  };
}
