import {
  ConversationResponse,
  SendMessageRequest,
  SendMessageResponse
} from '../types/api';
import { WhatsAppApiService } from './whatsapp-api';
import { InstagramApiService } from './instagram-api';
import { GmailApiService } from './gmail-api';

/**
 * Unified API Service
 * Provides access to all messaging platform APIs: WhatsApp, Instagram, and Gmail
 * Simplified to only essential messaging endpoints
 */
class UnifiedApiService {
  public whatsapp: WhatsAppApiService;
  public instagram: InstagramApiService;
  public gmail: GmailApiService;

  constructor() {
    this.whatsapp = new WhatsAppApiService();
    this.instagram = new InstagramApiService();
    this.gmail = new GmailApiService();
  }

  // Backward compatibility - Proxy to WhatsApp by default
  async getConversations(): Promise<ConversationResponse[]> {
    return this.whatsapp.getConversations();
  }

  async getConversation(conversationId: number): Promise<ConversationResponse> {
    return this.whatsapp.getConversation(conversationId);
  }

  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    return this.whatsapp.sendMessage(request);
  }

  async markMessageAsRead(messageId: number): Promise<void> {
    return this.whatsapp.markMessageAsRead(messageId);
  }

  // Utility methods - delegate to WhatsApp service
  convertToConversation(conversationResponse: ConversationResponse) {
    return this.whatsapp.convertToConversation(conversationResponse);
  }

  // Legacy formatTime access
  get formatTime() {
    return (date: Date) => {
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
    };
  }

  // Health check endpoint
  async healthCheck(): Promise<any> {
    return this.whatsapp['request']<any>('/health');
  }

  // Broadcast (for WebSocket)
  async broadcast(message: string): Promise<void> {
    return this.whatsapp['request']<void>(`/broadcast?message=${encodeURIComponent(message)}`, {
      method: 'POST',
    });
  }
}

export const apiService = new UnifiedApiService();

// Re-export individual services for direct access if needed
export { WhatsAppApiService } from './whatsapp-api';
export { InstagramApiService } from './instagram-api';
export { GmailApiService } from './gmail-api';

// Export base service for type checking
export { BaseApiService } from './base-api';
