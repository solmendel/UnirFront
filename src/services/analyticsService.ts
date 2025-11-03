import { DashboardMetrics } from '../types/api';

class AnalyticsService {
  private baseUrl: string;

  constructor() {
    // El backend de analytics corre en el puerto 8000 por defecto según el README
    // Se puede configurar con variable de entorno VITE_ANALYTICS_API_URL
    this.baseUrl = import.meta.env.VITE_ANALYTICS_API_URL || 'http://127.0.0.1:8000';
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
    return this.request<DashboardMetrics>('/analytics/dashboard');
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

