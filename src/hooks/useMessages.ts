import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { wsService } from '../services/websocket';
import { Conversation, ChatMessage, MessageResponse, ConversationResponse } from '../types/api';

export function useMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar conversaciones iniciales
  const loadConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Intentar cargar conversaciones del backend
      try {
        const conversationResponses = await apiService.getConversations({ limit: 100 });
        const convertedConversations = conversationResponses.map(conv => 
          apiService.convertToConversation(conv)
        );
        setConversations(convertedConversations);
      } catch (apiError) {
        // Si el backend no está disponible, mostrar lista vacía
        console.log('Backend no disponible, mostrando lista vacía');
        setConversations([]);
        setError('Backend no configurado - Los mensajes aparecerán cuando se conecte el servidor');
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError('Error al cargar las conversaciones');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar una conversación específica con sus mensajes
  const loadConversation = useCallback(async (conversationId: number) => {
    try {
      const conversationResponse = await apiService.getConversation(conversationId);
      const conversation = apiService.convertToConversation(conversationResponse);
      
      setConversations(prev => 
        prev.map(conv => conv.id === conversation.id ? conversation : conv)
      );
      
      if (selectedConversation?.id === conversation.id) {
        setSelectedConversation(conversation);
      }
    } catch (err) {
      console.error('Error loading conversation:', err);
    }
  }, [selectedConversation?.id]);

  // Enviar mensaje
  const sendMessage = useCallback(async (
    conversationId: string,
    content: string,
    messageType: string = 'text'
  ) => {
    try {
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) return;

      const messageData = {
        content,
        message_type: messageType,
        direction: 'outgoing',
        sender_identifier: 'admin', // Identificador del admin
        timestamp: new Date().toISOString(),
        conversation_id: parseInt(conversationId),
      };

      try {
        const newMessage = await apiService.createMessage(messageData);
        
        // Actualizar la conversación localmente
        const chatMessage: ChatMessage = {
          id: newMessage.id.toString(),
          text: newMessage.content,
          sender: 'me',
          time: apiService['formatTime'](new Date(newMessage.timestamp)),
          messageId: newMessage.id,
          isRead: true
        };

        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId 
              ? {
                  ...conv,
                  conversation: [...conv.conversation, chatMessage],
                  lastMessage: content,
                  time: chatMessage.time
                }
              : conv
          )
        );

        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(prev => 
            prev ? {
              ...prev,
              conversation: [...prev.conversation, chatMessage],
              lastMessage: content,
              time: chatMessage.time
            } : null
          );
        }
      } catch (apiError) {
        // Si el backend no está disponible, simular envío local
        console.log('Backend no disponible, simulando envío local');
        const chatMessage: ChatMessage = {
          id: Date.now().toString(),
          text: content,
          sender: 'me',
          time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          messageId: Date.now(),
          isRead: true
        };

        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId 
              ? {
                  ...conv,
                  conversation: [...conv.conversation, chatMessage],
                  lastMessage: content,
                  time: chatMessage.time
                }
              : conv
          )
        );

        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(prev => 
            prev ? {
              ...prev,
              conversation: [...prev.conversation, chatMessage],
              lastMessage: content,
              time: chatMessage.time
            } : null
          );
        }
      }

    } catch (err) {
      console.error('Error sending message:', err);
      setError('Error al enviar el mensaje');
    }
  }, [conversations, selectedConversation]);

  // Enviar mensaje a WhatsApp
  const sendWhatsAppMessage = useCallback(async (
    phoneNumber: string,
    message: string,
    messageType: string = 'text'
  ) => {
    try {
      const request = {
        channel: 'whatsapp',
        to: phoneNumber,
        message,
        message_type: messageType
      };

      const response = await apiService.sendMessage(request);
      
      if (!response.success) {
        throw new Error(response.error || 'Error al enviar mensaje');
      }

      return response;
    } catch (err) {
      console.error('Error sending WhatsApp message:', err);
      setError('Error al enviar mensaje a WhatsApp');
      throw err;
    }
  }, []);

  // Marcar mensaje como leído
  const markMessageAsRead = useCallback(async (messageId: number) => {
    try {
      await apiService.markMessageAsRead(messageId);
      
      // Actualizar estado local
      setConversations(prev => 
        prev.map(conv => ({
          ...conv,
          conversation: conv.conversation.map(msg => 
            msg.messageId === messageId ? { ...msg, isRead: true } : msg
          ),
          unread: conv.conversation.some(msg => !msg.isRead && msg.sender === 'user')
        }))
      );

      if (selectedConversation) {
        setSelectedConversation(prev => 
          prev ? {
            ...prev,
            conversation: prev.conversation.map(msg => 
              msg.messageId === messageId ? { ...msg, isRead: true } : msg
            )
          } : null
        );
      }
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  }, [selectedConversation]);

  // Configurar WebSocket
  useEffect(() => {
    const callbacks = {
      onNewMessage: (message: MessageResponse) => {
        console.log('New message received:', message);
        
        // Buscar la conversación correspondiente
        const conversationId = message.conversation_id.toString();
        const existingConv = conversations.find(c => c.id === conversationId);
        
        if (existingConv) {
          // Actualizar conversación existente
          const chatMessage: ChatMessage = {
            id: message.id.toString(),
            text: message.content,
            sender: message.direction === 'incoming' ? 'user' : 'me',
            time: apiService['formatTime'](new Date(message.timestamp)),
            messageId: message.id,
            isRead: message.is_read
          };

          setConversations(prev => 
            prev.map(conv => 
              conv.id === conversationId 
                ? {
                    ...conv,
                    conversation: [...conv.conversation, chatMessage],
                    lastMessage: message.content,
                    time: chatMessage.time,
                    unread: message.direction === 'incoming' ? true : conv.unread
                  }
                : conv
            )
          );

          // Actualizar conversación seleccionada si es la misma
          if (selectedConversation?.id === conversationId) {
            setSelectedConversation(prev => 
              prev ? {
                ...prev,
                conversation: [...prev.conversation, chatMessage],
                lastMessage: message.content,
                time: chatMessage.time
              } : null
            );
          }
        } else {
          // Recargar conversaciones si es una nueva conversación
          loadConversations();
        }
      },
      
      onMessageRead: (messageId: number) => {
        markMessageAsRead(messageId);
      },
      
      onConversationUpdated: (conversation: ConversationResponse) => {
        const convertedConversation = apiService.convertToConversation(conversation);
        setConversations(prev => 
          prev.map(conv => conv.id === convertedConversation.id ? convertedConversation : conv)
        );
      },
      
      onConnect: () => {
        console.log('WebSocket connected');
      },
      
      onDisconnect: () => {
        console.log('WebSocket disconnected');
      },
      
      onError: (error: Event) => {
        console.error('WebSocket error:', error);
      }
    };

    // Intentar conectar WebSocket
    try {
      wsService.connect(callbacks);
    } catch (error) {
      console.log('WebSocket no disponible:', error);
    }

    return () => {
      wsService.disconnect();
    };
  }, [conversations, selectedConversation, loadConversations, markMessageAsRead]);

  // Cargar conversaciones al montar el componente
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    selectedConversation,
    setSelectedConversation,
    isLoading,
    error,
    loadConversations,
    loadConversation,
    sendMessage,
    sendWhatsAppMessage,
    markMessageAsRead,
    isConnected: wsService.isConnected()
  };
}
