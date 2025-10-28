import {
  ConversationResponse,
  SendMessageRequest,
  SendMessageResponse
} from '../types/api';
import { BaseApiService } from './base-api';

/**
 * Simplified Gmail API Service
 * Only essential endpoints for messaging
 * Note: Gmail doesn't support "mark as read" via API
 */
export class GmailApiService extends BaseApiService {
  /**
   * Get all conversations with their messages
   */
  async getConversations(): Promise<ConversationResponse[]> {
    return this.request<ConversationResponse[]>('/api/v1/gmail/conversations');
  }

  /**
   * Get a single conversation with messages
   */
  async getConversation(conversationId: number): Promise<ConversationResponse> {
    return this.request<ConversationResponse>(`/api/v1/gmail/conversations/${conversationId}`);
  }

  /**
   * Send a message via Gmail
   */
  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    return this.request<SendMessageResponse>('/api/v1/gmail/send', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // No markMessageAsRead - Gmail API doesn't support this feature
}
