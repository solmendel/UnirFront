import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Search, Instagram, Mail, MessageCircle, AlertCircle, Loader2 } from 'lucide-react';
import { apiService } from '../services/api';
import { Conversation } from '../types/api';

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId: string | null;
  initialConversations: Conversation[];
  error: string | null;
  pollTrigger: number;
}

export function ConversationList({ 
  onSelectConversation, 
  selectedConversationId,
  initialConversations,
  error: parentError,
  pollTrigger
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(parentError);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // Poll for updated conversations when pollTrigger changes
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setIsRefreshing(true);
        const conversationResponses = await apiService.getConversations({
          limit: 100,
        });
        const convertedConversations = conversationResponses.map((conv) =>
          apiService.convertToConversation(conv)
        );
        // Filter conversations that contain "invertir" in the participant name
        const filteredConversations = convertedConversations.filter(
          (conv) => !conv.participantName.toLowerCase().includes('invertir')
        );
        setConversations(filteredConversations);
        setError(null);
      } catch (apiError: any) {
        console.warn("⚠️ Error loading conversations:", apiError.message);
        setError("No se pudo conectar al Core (AWS). Se usarán datos locales cuando esté disponible.");
      } finally {
        setIsRefreshing(false);
      }
    };

    if (pollTrigger > 0) {
      loadConversations();
    }
  }, [pollTrigger]);

  // Update conversations when initialConversations prop changes
  useEffect(() => {
    setConversations(initialConversations);
  }, [initialConversations]);

  // Update error when parent error changes
  useEffect(() => {
    setError(parentError);
  }, [parentError]);

  const filteredConversations = conversations
    .filter(conv => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        conv.participantName.toLowerCase().includes(query) ||
        conv.lastMessage.toLowerCase().includes(query) ||
        conv.conversation.some(chat => chat.text.toLowerCase().includes(query))
      );
    });

  return (
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

      <ScrollArea className="flex-1 overflow-hidden min-h-0 [&>div>div]:max-w-full [&>div>div]:w-full [&>div>div]:box-border">
        <div className="p-3 pb-6 box-border" style={{ width: '100%', maxWidth: '100%', minWidth: 0, display: 'block' }}>
          {error && (
            <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-700 break-words">{error}</span>
              </div>
            </div>
          )}
          {filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation)}
              className={`w-full text-left p-4 rounded-xl mb-2 transition-all overflow-hidden ${
                selectedConversationId === conversation.id
                  ? 'bg-gradient-to-r from-pink-100/50 to-green-100/50 shadow-sm'
                  : 'hover:bg-white/80'
              }`}
            >
              <div className="flex items-start justify-between mb-2 gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="font-medium truncate">{conversation.participantName}</span>
                  {conversation.unread && (
                    <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#ec6c8c' }} />
                  )}
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">{conversation.time}</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2 break-words">
                {conversation.lastMessage}
              </p>
              <div className="flex items-center gap-1 text-xs flex-shrink-0" style={{ color: platformColors[conversation.platform] }}>
                {platformIcons[conversation.platform]}
                <span className="capitalize">{conversation.platform}</span>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

