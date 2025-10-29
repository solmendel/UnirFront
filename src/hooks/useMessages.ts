import { useState, useEffect, useCallback } from "react";
import { apiService } from "../services/api";
import { wsService } from "../services/websocket";
import { logMessageSend } from "../services/historyService";
import {
  Conversation,
  ChatMessage,
  MessageResponse,
  ConversationResponse,
} from "../types/api";

export function useMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar conversaciones iniciales
  const loadConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Intentar cargar conversaciones del backend
      try {
        setIsLoading(true);
        setError(null);

        const conversationResponses = await apiService.getConversations({
          limit: 100,
        });
        const convertedConversations = conversationResponses.map((conv) =>
          apiService.convertToConversation(conv)
        );
        setConversations(convertedConversations);
      } catch (apiError: any) {
        console.warn("⚠️ No se pudo conectar al Core:", apiError.message);
        // En vez de error fuerte, mostramos mensaje informativo
        setConversations([]);
        setError(
          "No se pudo conectar al Core (AWS). Se usarán datos locales cuando esté disponible."
        );
      } finally {
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error loading conversations:", err);
      setError("Error al cargar las conversaciones");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar una conversación específica con sus mensajes
  const loadConversation = useCallback(
    async (conversationId: number) => {
      try {
        const conversationResponse = await apiService.getConversation(
          conversationId
        );
        const conversation =
          apiService.convertToConversation(conversationResponse);

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversation.id ? conversation : conv
          )
        );

        if (selectedConversation?.id === conversation.id) {
          setSelectedConversation(conversation);
        }
      } catch (err) {
        console.error("Error loading conversation:", err);
      }
    },
    [selectedConversation?.id]
  );

  // Enviar mensaje
  const sendMessage = useCallback(
    async (
      conversationId: string,
      content: string,
      messageType: string = "text"
    ) => {
      try {
        const conversation = conversations.find((c) => c.id === conversationId);
        if (!conversation) return;

        const messageData = {
          content,
          message_type: messageType,
          direction: "outgoing",
          sender_identifier: "admin", // Identificador del admin
          timestamp: new Date().toISOString(),
          conversation_id: parseInt(conversationId),
        };

        try {
          const newMessage = await apiService.createMessage(messageData);

          // Registrar en historial (asíncrono, no bloquea)
          logMessageSend(content, conversation.participantName, conversation.platform).catch(
            (err) => console.warn('Error al registrar mensaje en historial:', err)
          );

          // Only update local state if WebSocket is not connected
          // If WebSocket is connected, the broadcast will handle the update
          if (!wsService.isConnected()) {
            const chatMessage: ChatMessage = {
              id: newMessage.id.toString(),
              text: newMessage.content,
              sender: "me",
              time: apiService["formatTime"](new Date(newMessage.timestamp)),
              messageId: newMessage.id,
              isRead: true,
            };

            setConversations((prev) =>
              prev.map((conv) =>
                conv.id === conversationId
                  ? {
                      ...conv,
                      conversation: [...conv.conversation, chatMessage],
                      lastMessage: content,
                      time: chatMessage.time,
                    }
                  : conv
              )
            );

            if (selectedConversation?.id === conversationId) {
              setSelectedConversation((prev) =>
                prev
                  ? {
                      ...prev,
                      conversation: [...prev.conversation, chatMessage],
                      lastMessage: content,
                      time: chatMessage.time,
                    }
                  : null
              );
            }
          }
          // If WebSocket is connected, the broadcast will update the UI
        } catch (apiError) {
          // Si el backend no está disponible, simular envío local
          console.log("Backend no disponible, simulando envío local");
          const chatMessage: ChatMessage = {
            id: Date.now().toString(),
            text: content,
            sender: "me",
            time: new Date().toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            messageId: Date.now(),
            isRead: true,
          };

          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === conversationId
                ? {
                    ...conv,
                    conversation: [...conv.conversation, chatMessage],
                    lastMessage: content,
                    time: chatMessage.time,
                  }
                : conv
            )
          );

          if (selectedConversation?.id === conversationId) {
            setSelectedConversation((prev) =>
              prev
                ? {
                    ...prev,
                    conversation: [...prev.conversation, chatMessage],
                    lastMessage: content,
                    time: chatMessage.time,
                  }
                : null
            );
          }
        }
      } catch (err) {
        console.error("Error sending message:", err);
        setError("Error al enviar el mensaje");
      }
    },
    [conversations, selectedConversation]
  );

  // Enviar mensaje a WhatsApp
  const sendWhatsAppMessage = useCallback(
    async (
      phoneNumber: string,
      message: string,
      messageType: string = "text"
    ) => {
      try {
        const request = {
          channel: "whatsapp",
          to: phoneNumber,
          message,
          message_type: messageType,
        };

        const response = await apiService.sendMessage(request);

        if (!response.success) {
          throw new Error(response.error || "Error al enviar mensaje");
        }

        return response;
      } catch (err) {
        console.error("Error sending WhatsApp message:", err);
        setError("Error al enviar mensaje a WhatsApp");
        throw err;
      }
    },
    []
  );

  // Marcar mensaje como leído
  const markMessageAsRead = useCallback(
    async (messageId: number) => {
      try {
        await apiService.markMessageAsRead(messageId);

        // Actualizar estado local
        setConversations((prev) =>
          prev.map((conv) => ({
            ...conv,
            conversation: conv.conversation.map((msg) =>
              msg.messageId === messageId ? { ...msg, isRead: true } : msg
            ),
            unread: conv.conversation.some(
              (msg) => !msg.isRead && msg.sender === "user"
            ),
          }))
        );

        if (selectedConversation) {
          setSelectedConversation((prev) =>
            prev
              ? {
                  ...prev,
                  conversation: prev.conversation.map((msg) =>
                    msg.messageId === messageId ? { ...msg, isRead: true } : msg
                  ),
                }
              : null
          );
        }
      } catch (err) {
        console.error("Error marking message as read:", err);
      }
    },
    [selectedConversation]
  );

  // Configurar WebSocket (only on mount/unmount, not when state changes)
  useEffect(() => {
    const callbacks = {
      onNewMessage: (message: MessageResponse) => {
        console.log("New message received via WebSocket:", message);

        // Update the specific conversation with the new message
        const convId = message.conversation_id.toString();

        // Convert the incoming message to ChatMessage format
        const chatMessage: ChatMessage = {
          id: message.id.toString(),
          text: message.content,
          sender: message.direction === "incoming" ? "user" : "me",
          time: apiService["formatTime"](new Date(message.timestamp)),
          messageId: message.id,
          isRead: message.is_read,
        };

        // Update conversations list
        setConversations((prev) => {
          return prev.map((conv) => {
            if (conv.id === convId) {
              // Check if message already exists
              const exists = conv.conversation.some(
                (m) => m.messageId === message.id
              );
              if (exists) return conv;

              return {
                ...conv,
                conversation: [...conv.conversation, chatMessage],
                lastMessage: chatMessage.text,
                time: chatMessage.time,
                unread: message.direction === "incoming" && !message.is_read,
              };
            }
            return conv;
          });
        });

        // Update selectedConversation separately
        setSelectedConversation((prev) => {
          if (!prev || prev.id !== convId) return prev;

          const exists = prev.conversation.some(
            (m) => m.messageId === message.id
          );
          if (exists) return prev;

          return {
            ...prev,
            conversation: [...prev.conversation, chatMessage],
            lastMessage: chatMessage.text,
            time: chatMessage.time,
          };
        });
      },

      onMessageRead: (messageId: number) => {
        console.log("Message marked as read:", messageId);
      },

      onConversationUpdated: (conversation: ConversationResponse) => {
        console.log("Conversation updated:", conversation);
      },

      onConnect: () => {
        console.log("✅ WebSocket connected - Real-time updates active");
      },

      onDisconnect: () => {
        console.log("⚠️ WebSocket disconnected");
      },

      onError: (error: Event) => {
        console.error("WebSocket error:", error);
      },
    };

    // Intentar conectar WebSocket
    try {
      wsService.connect(callbacks);
    } catch (error) {
      console.log("WebSocket no disponible:", error);
    }

    return () => {
      wsService.disconnect();
    };
  }, []); // Empty dependencies - only run on mount/unmount

  // Cargar conversaciones al montar el componente
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Cargar mensajes completos cuando se selecciona una conversación
  useEffect(() => {
    if (
      selectedConversation &&
      selectedConversation.conversation.length === 0
    ) {
      // Solo cargar si no tenemos mensajes todavía
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
    isConnected: wsService.isConnected(),
  };
}
