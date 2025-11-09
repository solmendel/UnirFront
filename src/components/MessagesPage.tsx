import { useState, useEffect } from 'react';
import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Instagram, Mail, MessageCircle, Send, Loader2, Plus, Trash2, Tag } from 'lucide-react';
import { useMessages } from '../hooks/useMessages';
import { MessageList } from './MessageList';
import { ConversationList } from './ConversationList';
import type { ConversationCategory } from '../types/api';

const CATEGORY_CONFIG: Record<ConversationCategory, { label: string; color: string; bgColor: string }> = {
  consulta: { label: 'Consulta', color: '#3b82f6', bgColor: '#dbeafe' },
  pedido: { label: 'Pedido', color: '#10b981', bgColor: '#d1fae5' },
  reclamo: { label: 'Reclamo', color: '#ef4444', bgColor: '#fee2e2' },
  sin_categoria: { label: 'Sin categoría', color: '#6b7280', bgColor: '#f3f4f6' }
};

export function MessagesPage() {
  const {
    conversations,
    selectedConversation,
    setSelectedConversation,
    isLoading,
    error,
    sendMessage,
    markMessageAsRead,
    isConnected,
    updateConversationCategory
  } = useMessages();

  const [categoryFilter, setCategoryFilter] = useState<'all' | ConversationCategory>('all');
  const [reply, setReply] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [pollTrigger, setPollTrigger] = useState(0);

  // Synchronized polling trigger - interval from .env (default 5000ms)
  useEffect(() => {
    const pollIntervalMs = parseInt((import.meta as any).env.VITE_POLL_INTERVAL) || 5000;
    
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        setPollTrigger(prev => prev + 1);
      }
    }, pollIntervalMs);

    return () => clearInterval(interval);
  }, []);

  // 👉 Estado de plantillas
  const [templates, setTemplates] = useState([
    { id: '1', name: 'Saludo inicial', content: 'Hola, gracias por contactarnos. ¿En qué podemos ayudarte?' },
    { id: '2', name: 'Consulta de producto', content: 'Gracias por tu interés en nuestros productos. Te proporcionaré toda la información que necesites.' },
    { id: '3', name: 'Estado de pedido', content: 'Voy a revisar el estado de tu pedido y te informo en breve.' },
    { id: '4', name: 'Despedida', content: 'Gracias por contactarnos. ¡Que tengas un excelente día!' },
  ]);

  // 👉 Modal para nueva plantilla
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateContent, setNewTemplateContent] = useState('');

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

  const handleCreateTemplate = () => {
    if (!newTemplateName.trim() || !newTemplateContent.trim()) return;
    const newTemplate = {
      id: Date.now().toString(),
      name: newTemplateName,
      content: newTemplateContent,
    };
    setTemplates([...templates, newTemplate]);
    setNewTemplateName('');
    setNewTemplateContent('');
    setIsDialogOpen(false);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  const handleCategoryChange = (category: ConversationCategory) => {
    if (selectedConversation) {
      updateConversationCategory(selectedConversation.id, category);
    }
  };

  useEffect(() => {
    if (selectedConversation && selectedConversation.conversation.length > 0) {
      const unreadMessages = selectedConversation.conversation.filter(
        msg => msg.sender === 'user' && !msg.isRead
      );
      unreadMessages.forEach(msg => {
        if (msg.messageId) markMessageAsRead(msg.messageId);
      });
    }
  }, [selectedConversation, markMessageAsRead]);

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
    <div className="h-screen flex flex-col bg-gradient-to-br from-pink-50/30 to-green-50/30 overflow-hidden">
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
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        <ConversationList
          onSelectConversation={setSelectedConversation}
          selectedConversationId={selectedConversation?.id || null}
          initialConversations={conversations}
          error={error}
          pollTrigger={pollTrigger}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          categoryConfig={CATEGORY_CONFIG}
        />

        {/* Chat View */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {selectedConversation ? (
            <>
              <div className="border-b bg-white/80 backdrop-blur-sm px-6 py-4 flex-shrink-0">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h3>{selectedConversation.participantName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="rounded-full" style={{ borderColor: platformColors[selectedConversation.platform], color: platformColors[selectedConversation.platform] }}>
                        {platformIcons[selectedConversation.platform]}
                        <span className="ml-1 capitalize">{selectedConversation.platform}</span>
                      </Badge>
                      {selectedConversation.category && (
                        <Badge
                          variant="secondary"
                          className="rounded-full border-none"
                          style={{
                            backgroundColor: CATEGORY_CONFIG[selectedConversation.category].bgColor,
                            color: CATEGORY_CONFIG[selectedConversation.category].color
                          }}
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {CATEGORY_CONFIG[selectedConversation.category].label}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Select
                    value={selectedConversation.category || 'sin_categoria'}
                    onValueChange={(value) => handleCategoryChange(value as ConversationCategory)}
                  >
                    <SelectTrigger className="w-44 rounded-xl">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.color }} />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <MessageList
                conversationId={selectedConversation.id}
                participantName={selectedConversation.participantName}
                platform={selectedConversation.platform}
                initialMessages={selectedConversation.conversation}
                pollTrigger={pollTrigger}
              />

              {/* Área de plantillas + entrada */}
              <div className="border-t bg-white/80 backdrop-blur-sm p-6 flex-shrink-0">
                <div className="w-full space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1">
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
                            <div key={template.id} className="flex items-center justify-between">
                              <SelectItem value={template.id}>{template.name}</SelectItem>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-red-500 hover:bg-red-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTemplate(template.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={() => setIsDialogOpen(true)}
                      variant="outline"
                      className="rounded-xl flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" /> Nuevo
                    </Button>
                  </div>

                  <div className="flex gap-2 items-end">
                    <Textarea
                      placeholder="Escribe tu respuesta..."
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      className="rounded-xl resize-none flex-1 min-h-[90px] text-base"
                      rows={4}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      disabled={isSending}
                    />
                    <Button
                      className="rounded-xl h-auto px-4 py-6"
                      style={{ backgroundColor: '#acce60' }}
                      onClick={handleSendMessage}
                      disabled={!reply.trim() || isSending}
                    >
                      {isSending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
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
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialog de nueva plantilla */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Crear nueva plantilla</DialogTitle>
            <DialogDescription>
              Define un nombre y un mensaje predeterminado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre de la plantilla</Label>
              <Input
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="Ej: Respuesta de envío"
              />
            </div>
            <div className="space-y-2">
              <Label>Mensaje</Label>
              <Textarea
                value={newTemplateContent}
                onChange={(e) => setNewTemplateContent(e.target.value)}
                placeholder="Escribe el mensaje predeterminado..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateTemplate}
              style={{ backgroundColor: '#ec6c8c' }}
              disabled={!newTemplateName.trim() || !newTemplateContent.trim()}
            >
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
