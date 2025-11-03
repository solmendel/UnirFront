import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { wsService } from '../services/websocket';
import { Conversation, Message, ConversationResponse, ConversationCategory } from '../types/api';

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
        const convertedConversations = conversationResponses.map(conv => {
          const converted = apiService.convertToConversation(conv);
          return converted;
        });
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
        sender_identifier: 'admin',
        timestamp: new Date().toISOString(),
        conversation_id: parseInt(conversationId),
      };

      try {
        const newMessage = await apiService.createMessage(messageData);
        
        // Only update local state if WebSocket is not connected
        if (!wsService.isConnected()) {
          const chatMessage: Message = {
            id: newMessage.id.toString(),
            sender: 'me',
            text: newMessage.content,
            time: apiService['formatTime'](new Date(newMessage.timestamp)),
            messageId: newMessage.id.toString(),
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
        
      } catch (apiError) {
        // Si el backend no está disponible, simular envío local
        console.log('Backend no disponible, simulando envío local');
        const chatMessage: Message = {
          id: Date.now().toString(),
          sender: 'me',
          text: content,
          time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          messageId: Date.now().toString(),
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
  const markMessageAsRead = useCallback(async (messageId: string) => {
    try {
      const msgId = parseInt(messageId);
      if (!isNaN(msgId)) {
        await apiService.markMessageAsRead(msgId);
      }
      
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

  // Actualizar categoría de conversación
  const updateConversationCategory = useCallback(async (
    conversationId: string,
    category: ConversationCategory
  ) => {
    try {
      const convId = parseInt(conversationId);
      if (!isNaN(convId)) {
        await apiService.updateConversationCategory(convId, category === 'sin_categoria' ? null : category);
      }
      
      // Actualizar estado local
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, category }
            : conv
        )
      );

      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(prev => 
          prev ? { ...prev, category } : null
        );
      }
    } catch (err) {
      console.error('Error updating conversation category:', err);
      // Actualizar estado local aunque falle el backend
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, category }
            : conv
        )
      );

      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(prev => 
          prev ? { ...prev, category } : null
        );
      }
    }
  }, [selectedConversation?.id]);

  // Configurar WebSocket
  useEffect(() => {
    const callbacks = {
      onNewMessage: (message: any) => {
        console.log('New message received via WebSocket:', message);
        
        const convId = message.conversation_id.toString();
        
        const chatMessage: Message = {
          id: message.id.toString(),
          sender: message.direction === 'incoming' ? 'user' : 'me',
          text: message.content,
          time: apiService['formatTime'](new Date(message.timestamp)),
          messageId: message.id.toString(),
          isRead: message.is_read
        };

        setConversations(prev => {
          return prev.map(conv => {
            if (conv.id === convId) {
              const exists = conv.conversation.some(m => m.messageId === message.id.toString());
              if (exists) return conv;
              
              return {
                ...conv,
                conversation: [...conv.conversation, chatMessage],
                lastMessage: chatMessage.text,
                time: chatMessage.time,
                unread: message.direction === 'incoming' && !message.is_read
              };
            }
            return conv;
          });
        });

        setSelectedConversation(prev => {
          if (!prev || prev.id !== convId) return prev;
          
          const exists = prev.conversation.some(m => m.messageId === message.id.toString());
          if (exists) return prev;
          
          return {
            ...prev,
            conversation: [...prev.conversation, chatMessage],
            lastMessage: chatMessage.text,
            time: chatMessage.time
          };
        });
      },
      
      onMessageRead: (messageId: number) => {
        console.log('Message marked as read:', messageId);
      },
      
      onConversationUpdated: (conversation: ConversationResponse) => {
        console.log('Conversation updated:', conversation);
        const updated = apiService.convertToConversation(conversation);
        setConversations(prev => 
          prev.map(conv => conv.id === updated.id ? updated : conv)
        );
        if (selectedConversation?.id === updated.id) {
          setSelectedConversation(updated);
        }
      },
      
      onConnect: () => {
        console.log('✅ WebSocket connected - Real-time updates active');
      },
      
      onDisconnect: () => {
        console.log('⚠️ WebSocket disconnected');
      },
      
      onError: (error: Event) => {
        console.error('WebSocket error:', error);
      }
    };

    try {
      wsService.connect(callbacks);
    } catch (error) {
      console.log('WebSocket no disponible:', error);
    }

    return () => {
      wsService.disconnect();
    };
  }, []);

  // Cargar conversaciones al montar el componente
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Cargar mensajes completos cuando se selecciona una conversación
  useEffect(() => {
    if (selectedConversation && selectedConversation.conversation.length === 0) {
      const convId = parseInt(selectedConversation.id);
      if (!isNaN(convId)) {
        loadConversation(convId);
      }
    }
  }, [selectedConversation?.id, loadConversation]);

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
    updateConversationCategory,
    isConnected: wsService.isConnected()
  };
}
