// Tipos basados en el swagger-core.json

export interface MessageResponse {
  id: number;
  content: string;
  message_type: string;
  direction: string;
  sender_name: string | null;
  sender_identifier: string;
  timestamp: string;
  message_metadata: string | null;
  conversation_id: number;
  external_message_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface MessageCreate {
  content: string;
  message_type?: string;
  direction: string;
  sender_name?: string | null;
  sender_identifier: string;
  timestamp: string;
  message_metadata?: string | null;
  conversation_id: number;
  external_message_id?: string | null;
}

export interface ConversationResponse {
  id: number;
  participant_name: string | null;
  participant_identifier: string;
  is_active: boolean;
  channel_id: number;
  external_id: string;
  created_at: string;
  updated_at: string;
  messages?: MessageResponse[]; // Optional - included when fetching a single conversation
}

export interface ConversationCreate {
  participant_name?: string | null;
  participant_identifier: string;
  is_active?: boolean;
  channel_id: number;
  external_id: string;
}

export interface ChannelResponse {
  id: number;
  name: string;
  display_name: string;
  is_active: boolean;
  created_at: string;
}

export interface SendMessageRequest {
  channel: string;
  to: string;
  message: string;
  message_type?: string;
  media_url?: string | null;
}

export interface SendMessageResponse {
  success: boolean;
  message_id: string | null;
  error: string | null;
  details: Record<string, any> | null;
}

export interface UnifiedMessage {
  channel: string;
  sender: string;
  message: string;
  timestamp: string;
  message_id?: string | null;
  message_type?: string;
  sender_name?: string | null;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

// Tipos para el frontend
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'me';
  time: string;
  messageId?: number;
  isRead?: boolean;
}

export interface Conversation {
  id: string;
  participantName: string;
  participantIdentifier: string;
  platform: 'whatsapp' | 'instagram' | 'gmail';
  lastMessage: string;
  time: string;
  unread: boolean;
  conversation: ChatMessage[];
  channelId: number;
  externalId: string;
}

export interface ApiConfig {
  baseUrl: string;
  wsUrl: string;
}

// Tipos para Analytics Dashboard
export interface DashboardMetrics {
  general: GeneralMetrics;
  semana_anterior: WeeklyMetrics;
  semana_actual: WeeklyMetrics;
  comparativa_semanal: WeeklyComparison;
}

export interface GeneralMetrics {
  frt_avg_min: number | null;
  pct_respondido_24h: number | null;
  conversations_total: number;
  mensajes_totales_in: number;
  mensajes_totales_out: number;
  por_canal_total: Record<string, { in: number; out: number }>;
}

export interface WeeklyMetrics {
  ventana: {
    desde_lunes: string;
    hasta_domingo: string;
    zona: string;
  };
  frt_avg_min: number | null;
  pct_respondido_24h: number | null;
  conversations: number;
  mensajes_totales_in: number;
  mensajes_totales_out: number;
  por_canal: Record<string, { in: number; out: number }>;
  mensajes_por_dia: Record<string, { in: number; out: number }>;
  mensajes_por_dia_por_canal?: Record<string, Record<string, { in: number; out: number }>>;
}

export interface WeeklyComparison {
  mensajes_totales_in: {
    semana_anterior: number;
    semana_actual: number;
    cambio_porcentual: number | null;
  };
  mensajes_respondidos: {
    semana_anterior: number;
    semana_actual: number;
    cambio_porcentual: number | null;
  };
  tiempo_promedio_respuesta_min: {
    semana_anterior: number | null;
    semana_actual: number | null;
    cambio_porcentual: number | null;
  };
  tasa_respuesta_24h: {
    semana_anterior: number | null;
    semana_actual: number | null;
    cambio_porcentual: number | null;
  };
  conversaciones: {
    semana_anterior: number;
    semana_actual: number;
    cambio_porcentual: number | null;
  };
}