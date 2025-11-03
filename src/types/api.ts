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
  category?: string | null; // Categoría de la conversación
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
export type Platform = 'instagram' | 'whatsapp' | 'gmail';
export type MessageSender = 'me' | 'user';
export type ConversationCategory = 'consulta' | 'pedido' | 'reclamo' | 'sin_categoria';

export interface Message {
  id: string;
  sender: MessageSender;
  text: string;
  time: string;
  isRead?: boolean;
  messageId?: string;
}

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
  participantIdentifier?: string;
  platform: Platform;
  lastMessage: string;
  time: string;
  unread: boolean;
  conversation: Message[];
  channelId?: number;
  externalId?: string;
  category?: ConversationCategory;
}

export interface ApiConfig {
  baseUrl: string;
  wsUrl: string;
}
