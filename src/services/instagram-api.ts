import {
  ConversationResponse,
  SendMessageRequest,
  SendMessageResponse
} from '../types/api';
import { BaseApiService } from './base-api';

/**
 * Simplified Instagram API Service
 * Only essential endpoints for messaging
 */
export class InstagramApiService extends BaseApiService {
  /**
   * Get all conversations with their messages
   */
  async getConversations(): Promise<ConversationResponse[]> {
    return this.request<ConversationResponse[]>('/api/v1/instagram/conversations');
  }

  /**
   * Get a single conversation with messages
   */
  async getConversation(conversationId: number): Promise<ConversationResponse> {
    return this.request<ConversationResponse>(`/api/v1/instagram/conversations/${conversationId}`);
  }

  /**
   * Send a message via Instagram
   */
  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    return this.request<SendMessageResponse>('/api/v1/instagram/send', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Mark a message as read
   */
  async markMessageAsRead(messageId: number): Promise<void> {
    return this.request<void>(`/api/v1/instagram/messages/${messageId}/read`, {
      method: 'PUT',
    });
  }
}
