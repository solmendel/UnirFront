import { useState, useEffect } from 'react';
import React from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Search, Instagram, Mail, MessageCircle, Send, Loader2, AlertCircle } from 'lucide-react';
import { useMessages } from '../hooks/useMessages';

const templates = [
  { id: '1', name: 'Saludo inicial', content: 'Hola, gracias por contactarnos. ¿En qué podemos ayudarte?' },
  { id: '2', name: 'Consulta de producto', content: 'Gracias por tu interés en nuestros productos. Te proporcionaré toda la información que necesites.' },
  { id: '3', name: 'Estado de pedido', content: 'Voy a revisar el estado de tu pedido y te informo en breve.' },
  { id: '4', name: 'Despedida', content: 'Gracias por contactarnos. ¡Que tengas un excelente día!' },
];

export function MessagesPage() {
  // Use the real API hook
  const {
    conversations,
    selectedConversation,
    setSelectedConversation,
    isLoading,
    error,
    sendMessage,
    markMessageAsRead,
    isConnected
  } = useMessages();

  const [filter, setFilter] = useState<string>('all');
  const [reply, setReply] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);

  const platformIcons = {
    instagram: <Instagram className="h-4 w-4" />,
    whatsapp: <MessageCircle className="h-4 w-4" />,
    gmail: <Mail className="h-4 w-4" />
  };

  const platformColors = {
    instagram: '#e4405f',
    whatsapp: '#25d366',
    gmail: '#ea4335'
  };

  const filteredConversations = conversations
    .filter(conv => filter === 'all' ? true : conv.platform === filter)
    .filter(conv => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        conv.participantName.toLowerCase().includes(query) ||
        conv.lastMessage.toLowerCase().includes(query) ||
        conv.conversation.some(chat => chat.text.toLowerCase().includes(query))
      );
    });

  const handleTemplateSelect = (templateContent: string) => {
    setReply(templateContent);
  };

  const handleSendMessage = async () => {
    if (!reply.trim() || !selectedConversation) return;

    setIsSending(true);
    try {
      const platform = selectedConversation.platform;
      const participantIdentifier = selectedConversation.participantIdentifier;
      
      // Send message via the API
      await sendMessage(
        selectedConversation.id,
        reply,
        'text'
      );

      // Clear reply field
      setReply('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Mark messages as read when selecting a conversation
  useEffect(() => {
    if (selectedConversation) {
      // Mark unread inbound messages as read
      selectedConversation.conversation
        .filter(msg => msg.sender === 'user' && !msg.isRead)
        .forEach(msg => {
          if (msg.messageId) {
            markMessageAsRead(msg.messageId);
          }
        });
    }
  }, [selectedConversation, markMessageAsRead]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Cargando conversaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-pink-50/30 to-green-50/30">
      <div className="border-b bg-white/80 backdrop-blur-sm px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2>Mensajes</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Gestiona todos tus mensajes en un solo lugar
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-orange-500'}`} />
              <span className="text-xs text-muted-foreground">
                {isConnected ? 'Conectado al backend' : 'Modo demo - Backend no configurado'}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className="rounded-xl"
              style={filter === 'all' ? { backgroundColor: '#ec6c8c' } : {}}
            >
              Todos
            </Button>
            <Button
              variant={filter === 'instagram' ? 'default' : 'outline'}
              onClick={() => setFilter('instagram')}
              className="rounded-xl"
              style={filter === 'instagram' ? { backgroundColor: '#e4405f' } : {}}
            >
              <Instagram className="h-4 w-4 mr-2" />
              Instagram
            </Button>
            <Button
              variant={filter === 'whatsapp' ? 'default' : 'outline'}
              onClick={() => setFilter('whatsapp')}
              className="rounded-xl"
              style={filter === 'whatsapp' ? { backgroundColor: '#25d366' } : {}}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
            <Button
              variant={filter === 'gmail' ? 'default' : 'outline'}
              onClick={() => setFilter('gmail')}
              className="rounded-xl"
              style={filter === 'gmail' ? { backgroundColor: '#ea4335' } : {}}
            >
              <Mail className="h-4 w-4 mr-2" />
              Gmail
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Lista de conversaciones */}
        <div className="w-96 border-r bg-white/50 backdrop-blur-sm flex flex-col">
          <div className="p-4 border-b flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar conversaciones..."
                className="pl-10 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="divide-y">
              {error && (
                <div className="p-4">
                  <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                </div>
              )}
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`p-4 cursor-pointer transition-colors hover:bg-pink-50/50 ${
                    selectedConversation?.id === conversation.id ? 'bg-pink-100/50' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white flex-shrink-0"
                      style={{ backgroundColor: platformColors[conversation.platform] }}
                    >
                      {platformIcons[conversation.platform]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold truncate">{conversation.participantName}</p>
                        {conversation.unread && (
                          <Badge className="bg-pink-500 text-white">Nuevo</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{conversation.time}</p>
                    </div>
                  </div>
                </div>
              ))}
              {filteredConversations.length === 0 && !isLoading && (
                <div className="p-4 text-center text-muted-foreground">
                  No hay conversaciones
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Vista de chat */}
        <div className="flex-1 flex flex-col bg-white/50">
          {selectedConversation ? (
            <>
              {/* Header del chat */}
              <div className="border-b bg-white/80 backdrop-blur-sm p-4 flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: platformColors[selectedConversation.platform] }}
                >
                  {platformIcons[selectedConversation.platform]}
                </div>
                <div>
                  <p className="font-semibold">{selectedConversation.participantName}</p>
                  <p className="text-sm text-muted-foreground">{selectedConversation.platform}</p>
                </div>
              </div>

              {/* Mensajes */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {selectedConversation.conversation.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          message.sender === 'me'
                            ? 'bg-pink-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p>{message.text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.sender === 'me' ? 'text-pink-100' : 'text-muted-foreground'
                          }`}
                        >
                          {message.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Plantillas */}
              <div className="border-t bg-white/80 backdrop-blur-sm p-3">
                <ScrollArea className="flex gap-2">
                  <div className="flex gap-2">
                    {templates.map((template) => (
                      <Button
                        key={template.id}
                        variant="outline"
                        size="sm"
                        className="rounded-lg text-xs whitespace-nowrap"
                        onClick={() => handleTemplateSelect(template.content)}
                      >
                        {template.name}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Input de respuesta */}
              <div className="border-t bg-white/80 backdrop-blur-sm p-4 flex gap-2">
                <Textarea
                  placeholder="Escribe un mensaje..."
                  className="rounded-xl"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!reply.trim() || isSending}
                  className="rounded-xl"
                  style={{ backgroundColor: '#ec6c8c' }}
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground">Selecciona una conversación</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
