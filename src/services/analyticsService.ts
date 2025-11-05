import { DashboardMetrics } from '../types/api';

class AnalyticsService {
  private baseUrl: string;

  constructor() {
    // Conecta al Core API que corre en el puerto 8003 por defecto
    // Se puede configurar con variable de entorno VITE_ANALYTICS_API_URL
    this.baseUrl = import.meta.env.VITE_ANALYTICS_API_URL || 'http://localhost:8003';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
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

