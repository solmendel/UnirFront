import { DashboardMetrics } from '../types/api';
import { API_CONFIG } from '../config/api';

class AnalyticsService {
  private baseUrl: string;

  constructor() {
    // Usa la URL del backend de analytics definida en la configuración
    // Se puede sobrescribir con la variable de entorno VITE_ANALYTICS_API_URL
    this.baseUrl = (import.meta.env.VITE_ANALYTICS_API_URL as string) || API_CONFIG.analyticsUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // Intentar adjuntar el token de sesión, si existe
    let authHeaders = {};
    try {
      const sessionRaw = localStorage.getItem('unir-session');
      if (sessionRaw) {
        const session = JSON.parse(sessionRaw);
        if (session?.token) {
          authHeaders = { Authorization: `Bearer ${session.token}` };
        }
      }
    } catch (err) {
      console.warn('No se pudo leer la sesión almacenada:', err);
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...authHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  /**
   * Obtiene los datos del dashboard de analytics
   */
  async getDashboard(): Promise<DashboardMetrics> {
    // El Core API usa /api/v1/analytics/dashboard
    return this.request<DashboardMetrics>('/api/v1/analytics/dashboard');
  }

  /**
   * Envía un mensaje al backend de analytics para su ingesta
   */
  async ingestMessage(payload: {
    channel: string;
    sender: string;
    message: string;
    timestamp: string;
    outgoing?: boolean;
    agent_id?: string;
    tag?: string;
  }): Promise<{ ok: boolean }> {
    return this.request<{ ok: boolean }>('/messages', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export const analyticsService = new AnalyticsService();

