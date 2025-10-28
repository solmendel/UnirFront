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
import { Conversation, ChatMessage } from '../types/api';

const templates = [
  { id: '1', name: 'Saludo inicial', content: 'Hola, gracias por contactarnos. ¿En qué podemos ayudarte?' },
  { id: '2', name: 'Consulta de producto', content: 'Gracias por tu interés en nuestros productos. Te proporcionaré toda la información que necesites.' },
  { id: '3', name: 'Estado de pedido', content: 'Voy a revisar el estado de tu pedido y te informo en breve.' },
  { id: '4', name: 'Despedida', content: 'Gracias por contactarnos. ¡Que tengas un excelente día!' },
];

// No mock data - all data comes from the backend API

export function MessagesPage() {
  // Use the useMessages hook to get data from the API
  const {
    conversations,
    selectedConversation,
    setSelectedConversation,
    isLoading,
    error,
    loadConversations,
    loadConversation,
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
      await sendMessage(selectedConversation.id, reply);
      setReply('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversation && selectedConversation.conversation.length > 0) {
      const unreadMessages = selectedConversation.conversation
        .filter(msg => msg.sender === 'user' && !msg.isRead);
      
      // Mark all unread messages as read
      unreadMessages.forEach(msg => {
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
        {/* Lista de mensajes */}
        <div className="w-96 border-r bg-white/50 backdrop-blur-sm flex flex-col">
          <div className="p-4 border-b flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar mensajes..."
                className="pl-10 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-2 pb-6">
              {error && (
                <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                </div>
              )}
              
              <div className="p-4 mb-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-blue-700">
                    Modo demo activo - Los datos son de ejemplo. Configura el backend para conectar con WhatsApp real.
                  </span>
                </div>
              </div>
              
              {filteredConversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay conversaciones que coincidan con el filtro</p>
                  <p className="text-sm mt-2">Prueba cambiar el filtro o la búsqueda</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`w-full text-left p-4 rounded-xl mb-2 transition-all ${
                      selectedConversation?.id === conversation.id
                        ? 'bg-gradient-to-r from-pink-100/50 to-green-100/50 shadow-sm'
                        : 'hover:bg-white/80'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{conversation.participantName}</span>
                        {conversation.unread && (
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: '#ec6c8c' }} />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{conversation.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {conversation.lastMessage}
                    </p>
                    <div className="flex items-center gap-1 text-xs" style={{ color: platformColors[conversation.platform] }}>
                      {platformIcons[conversation.platform]}
                      <span className="capitalize">{conversation.platform}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Vista de conversación */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedConversation ? (
            <>
              <div className="border-b bg-white/80 backdrop-blur-sm px-6 py-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3>{selectedConversation.participantName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="rounded-full" style={{ borderColor: platformColors[selectedConversation.platform], color: platformColors[selectedConversation.platform] }}>
                        {platformIcons[selectedConversation.platform]}
                        <span className="ml-1 capitalize">{selectedConversation.platform}</span>
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {selectedConversation.participantIdentifier}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4 max-w-3xl pb-6">
                  {selectedConversation.conversation.map((chat) => (
                    <div key={chat.id} className={`flex gap-3 ${chat.sender === 'me' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 ${chat.sender === 'me' ? 'bg-gradient-to-br from-pink-400 to-green-400' : ''}`} style={chat.sender === 'user' ? { backgroundColor: '#ec6c8c' } : {}}>
                        {chat.sender === 'me' ? 'Yo' : selectedConversation.participantName.charAt(0)}
                      </div>
                      <div className="flex-1 max-w-lg">
                        <div className={`rounded-2xl p-4 shadow-sm ${chat.sender === 'me' ? 'bg-gradient-to-br from-pink-100 to-green-100 rounded-tr-sm' : 'bg-white rounded-tl-sm'}`}>
                          <p>{chat.text}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1 ml-1">
                          <span className="text-xs text-muted-foreground">{chat.time}</span>
                          {!chat.isRead && chat.sender === 'user' && (
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="border-t bg-white/80 backdrop-blur-sm p-6 flex-shrink-0">
                <div className="max-w-3xl space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Plantilla:</span>
                    <Select onValueChange={(value) => {
                      const template = templates.find(t => t.id === value);
                      if (template) handleTemplateSelect(template.content);
                    }}>
                      <SelectTrigger className="w-64 rounded-xl">
                        <SelectValue placeholder="Seleccionar plantilla" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Escribe tu respuesta..."
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      className="rounded-xl resize-none"
                      rows={3}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      disabled={isSending}
                    />
                    <Button 
                      className="rounded-xl h-auto" 
                      style={{ backgroundColor: '#acce60' }}
                      onClick={handleSendMessage}
                      disabled={!reply.trim() || isSending}
                    >
                      {isSending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>Selecciona una conversación para ver los mensajes</p>
                <p className="text-sm mt-2">Puedes responder usando las plantillas o escribiendo tu propio mensaje</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
