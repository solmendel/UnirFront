// Configuración de la API
export const API_CONFIG = {
  // Cambiar estas URLs según tu configuración de backend
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:8001',
  
  // Configuración de canales (ajustar según tu backend)
  channels: {
    whatsapp: 1,
    instagram: 2,
    gmail: 3
  },
  
  // Configuración de timeouts
  timeouts: {
    request: 10000, // 10 segundos
    websocket: 30000 // 30 segundos
  },
  
  // Configuración de reconexión WebSocket
  websocket: {
    maxReconnectAttempts: 5,
    reconnectInterval: 3000
  }
};

// Función para obtener la URL completa de un endpoint
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.baseUrl}${endpoint}`;
};

// Función para obtener la URL de WebSocket
export const getWsUrl = (): string => {
  return API_CONFIG.wsUrl;
};
