import {
  MessageResponse,
  MessageCreate,
  ConversationResponse,
  ConversationCreate,
  ChannelResponse,
  SendMessageRequest,
  SendMessageResponse,
  UnifiedMessage,
  Conversation,
  ChatMessage
} from '../types/api';
import { API_CONFIG } from '../config/api';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
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

  // Endpoints de mensajes
  async getMessages(params?: {
    conversation_id?: number;
    channel?: string;
    limit?: number;
    offset?: number;
  }): Promise<MessageResponse[]> {
    const searchParams = new URLSearchParams();

    if (params?.conversation_id !== undefined) {
      searchParams.append('conversation_id', params.conversation_id.toString());
    }
    if (params?.channel) {
      searchParams.append('channel', params.channel);
    }
    if (params?.limit !== undefined) {
      searchParams.append('limit', params.limit.toString());
    }
    if (params?.offset !== undefined) {
      searchParams.append('offset', params.offset.toString());
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/v1/messages${queryString ? `?${queryString}` : ''}`;

    return this.request<MessageResponse[]>(endpoint);
  }

  async getMessage(messageId: number): Promise<MessageResponse> {
    return this.request<MessageResponse>(`/api/v1/messages/${messageId}`);
  }

  async createMessage(message: MessageCreate): Promise<MessageResponse> {
    return this.request<MessageResponse>('/api/v1/messages', {
      method: 'POST',
      body: JSON.stringify(message),
    });
  }

  async markMessageAsRead(messageId: number): Promise<void> {
    return this.request<void>(`/api/v1/messages/${messageId}/read`, {
      method: 'PUT',
    });
  }

  async getUnreadCount(conversationId?: number): Promise<{ unread_count: number }> {
    const endpoint = conversationId
      ? `/api/v1/messages/unread/count?conversation_id=${conversationId}`
      : '/api/v1/messages/unread/count';

    return this.request<{ unread_count: number }>(endpoint);
  }

  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    return this.request<SendMessageResponse>('/api/v1/send', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Endpoints de conversaciones
  async getConversations(params?: {
    channel_id?: number;
    limit?: number;
    offset?: number;
  }): Promise<ConversationResponse[]> {
    const searchParams = new URLSearchParams();

    if (params?.channel_id !== undefined) {
      searchParams.append('channel_id', params.channel_id.toString());
    }
    if (params?.limit !== undefined) {
      searchParams.append('limit', params.limit.toString());
    }
    if (params?.offset !== undefined) {
      searchParams.append('offset', params.offset.toString());
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/v1/conversations${queryString ? `?${queryString}` : ''}`;

    return this.request<ConversationResponse[]>(endpoint);
  }

  async getConversation(conversationId: number, limit?: number): Promise<ConversationResponse> {
    const searchParams = new URLSearchParams();
    if (limit !== undefined) {
      searchParams.append('limit', limit.toString());
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/v1/conversations/${conversationId}${queryString ? `?${queryString}` : ''}`;

    return this.request<ConversationResponse>(endpoint);
  }

  async createConversation(conversation: ConversationCreate): Promise<ConversationResponse> {
    return this.request<ConversationResponse>('/api/v1/conversations', {
      method: 'POST',
      body: JSON.stringify(conversation),
    });
  }

  async updateParticipantName(conversationId: number, participantName: string): Promise<void> {
    return this.request<void>(`/api/v1/conversations/${conversationId}/participant?participant_name=${encodeURIComponent(participantName)}`, {
      method: 'PUT',
    });
  }

  async deactivateConversation(conversationId: number): Promise<void> {
    return this.request<void>(`/api/v1/conversations/${conversationId}/deactivate`, {
      method: 'PUT',
    });
  }

  async updateConversationCategory(
    conversationId: number,
    category: Conversation['category'],
    updatedAt: string = new Date().toISOString(),
  ): Promise<void> {
    return this.request<void>('/api/v1/conversations/category', {
      method: 'PUT',
      body: JSON.stringify({
        conversation_id: conversationId,
        category,
        updated_at: updatedAt,
      }),
    });
  }

  // Endpoints de canales
  async getChannels(): Promise<ChannelResponse[]> {
    return this.request<ChannelResponse[]>('/api/v1/channels');
  }

  async getChannel(channelName: string): Promise<ChannelResponse> {
    return this.request<ChannelResponse>(`/api/v1/channels/${channelName}`);
  }

  async getChannelStats(channelName: string): Promise<any> {
    return this.request<any>(`/api/v1/channels/${channelName}/stats`);
  }

  // Endpoint para recibir mensajes unificados
  async receiveUnifiedMessage(message: UnifiedMessage): Promise<void> {
    return this.request<void>('/api/v1/messages/unified', {
      method: 'POST',
      body: JSON.stringify(message),
    });
  }

  // Health & Status
  async rootHealthCheck(): Promise<any> {
    return this.request<any>('/');
  }

  async detailedHealthCheck(): Promise<any> {
    return this.request<any>('/health');
  }

  // Broadcast (para WebSocket)
  async broadcast(message: string): Promise<void> {
    return this.request<void>(`/broadcast`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // Métodos de utilidad para convertir datos
  convertToConversation(conversationResponse: any): Conversation {
    const platform = this.getPlatformFromChannelId(conversationResponse.channel_id);

    // Manejo de mensajes
    const messages = conversationResponse.messages || [];
    // Sort messages by ID to ensure chronological order
    const sortedMessages = [...messages].sort((a, b) => a.id - b.id);
    const chatMessages: ChatMessage[] = sortedMessages.map(msg => ({
      id: msg.id.toString(),
      text: msg.content,
      sender: msg.direction === 'incoming' ? 'user' : 'me',
      time: this.formatTime(new Date(msg.timestamp)),
      messageId: msg.id,
      isRead: msg.is_read
    }));

    // Determinar último mensaje y hora
    let lastMessage = null;
    let lastMessageTime = 'N/A';

    if (conversationResponse.last_message) {
      lastMessage = conversationResponse.last_message.content;
      lastMessageTime = this.formatTime(new Date(conversationResponse.last_message.timestamp));
    } else if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      lastMessage = lastMsg.content;
      lastMessageTime = this.formatTime(new Date(lastMsg.timestamp));
    }

    const hasUnread = conversationResponse.has_unread ||
      messages.some(msg => !msg.is_read && msg.direction === 'incoming');

    // Intentar obtener el nombre del participante de diferentes fuentes
    let participantName = conversationResponse.participant_name;
    
    // Si no hay nombre, intentar obtenerlo del sender_name del primer mensaje entrante
    if (!participantName || participantName === 'Usuario') {
      const firstIncomingMsg = messages.find(msg => msg.direction === 'incoming' && msg.sender_name);
      if (firstIncomingMsg && firstIncomingMsg.sender_name) {
        participantName = firstIncomingMsg.sender_name;
      } else {
        // Si tampoco hay sender_name, usar el identificador (email, teléfono, etc)
        participantName = conversationResponse.participant_identifier || 'Usuario';
      }
    }

    return {
      id: conversationResponse.id.toString(),
      participantName: participantName,
      participantIdentifier: conversationResponse.participant_identifier,
      platform,
      lastMessage: lastMessage || 'Sin mensajes',
      time: lastMessageTime,
      unread: hasUnread,
      conversation: chatMessages,
      channelId: conversationResponse.channel_id,
      externalId: conversationResponse.external_id,
      category: conversationResponse.category ?? 'sin_categoria'
    };
  }

  private getPlatformFromChannelId(channelId: number): 'whatsapp' | 'instagram' | 'gmail' {
    // Mapear channel_id a plataforma (ajustar según backend real)
    switch (channelId) {
      case 1: return 'whatsapp';
      case 2: return 'gmail';
      case 3: return 'instagram';
      default: return 'whatsapp';
    }
  }

  private formatTime(date: Date): string {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInHours < 48) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short'
      });
    }
  }
}

export const apiService = new ApiService();
