import {
  ConversationResponse,
  SendMessageRequest,
  SendMessageResponse
} from '../types/api';
import { BaseApiService } from './base-api';

/**
 * Simplified WhatsApp API Service
 * Only essential endpoints for messaging
 */
export class WhatsAppApiService extends BaseApiService {
  /**
   * Get all conversations with their messages
   */
  async getConversations(): Promise<ConversationResponse[]> {
    return this.request<ConversationResponse[]>('/api/v1/whatsapp/conversations');
  }

  /**
   * Get a single conversation with messages
   */
  async getConversation(conversationId: number): Promise<ConversationResponse> {
    return this.request<ConversationResponse>(`/api/v1/whatsapp/conversations/${conversationId}`);
  }

  /**
   * Send a message via WhatsApp
   */
  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    return this.request<SendMessageResponse>('/api/v1/whatsapp/send', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Mark a message as read
   */
  async markMessageAsRead(messageId: number): Promise<void> {
    return this.request<void>(`/api/v1/whatsapp/messages/${messageId}/read`, {
      method: 'PUT',
    });
  }
}
