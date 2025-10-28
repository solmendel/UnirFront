import {
  MessageResponse,
  ConversationResponse,
  Conversation,
  ChatMessage
} from '../types/api';
import { API_CONFIG } from '../config/api';

/**
 * Base API service with shared functionality
 */
export class BaseApiService {
  protected baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
  }

  protected async request<T>(
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
   * Convert backend conversation response to frontend format
   */
  convertToConversation(conversationResponse: ConversationResponse): Conversation {
    const platform = this.getPlatformFromChannelId(conversationResponse.channel_id);
    
    const chatMessages: ChatMessage[] = conversationResponse.messages.map(msg => ({
      id: msg.id.toString(),
      text: msg.content,
      sender: msg.direction === 'inbound' ? 'user' : 'me',
      time: this.formatTime(new Date(msg.timestamp)),
      messageId: msg.id,
      isRead: msg.is_read
    }));

    const lastMessage = conversationResponse.messages[conversationResponse.messages.length - 1];
    const unreadCount = conversationResponse.messages.filter(msg => !msg.is_read && msg.direction === 'inbound').length;

    return {
      id: conversationResponse.id.toString(),
      participantName: conversationResponse.participant_name || 'Usuario',
      participantIdentifier: conversationResponse.participant_identifier,
      platform,
      lastMessage: lastMessage?.content || 'Sin mensajes',
      time: lastMessage ? this.formatTime(new Date(lastMessage.timestamp)) : 'N/A',
      unread: unreadCount > 0,
      conversation: chatMessages,
      channelId: conversationResponse.channel_id,
      externalId: conversationResponse.external_id
    };
  }

  protected getPlatformFromChannelId(channelId: number): 'whatsapp' | 'instagram' | 'gmail' {
    switch (channelId) {
      case 1: return 'whatsapp';
      case 2: return 'instagram';
      case 3: return 'gmail';
      default: return 'whatsapp';
    }
  }

  protected formatTime(date: Date): string {
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

