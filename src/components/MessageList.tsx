import { useEffect, useState, useRef } from 'react';
import { apiService } from '../services/api';
import { ChatMessage } from '../types/api';

interface MessageListProps {
  conversationId: string;
  participantName: string;
  platform: 'whatsapp' | 'instagram' | 'gmail';
  initialMessages: ChatMessage[];
  pollTrigger: number;
}

export function MessageList({ conversationId, participantName, platform, initialMessages, pollTrigger }: MessageListProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasAutoScrolled = useRef(false);

  // Auto scroll to bottom only once per conversation
  useEffect(() => {
    if (!hasAutoScrolled.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      hasAutoScrolled.current = true;
    }
  }, [messages]);

  useEffect(() => {
    hasAutoScrolled.current = false;
  }, [conversationId]);

  // Poll for new messages when pollTrigger changes
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const convId = parseInt(conversationId);
        if (isNaN(convId)) return;

        const conversationResponse = await apiService.getConversation(convId);
        const conversation = apiService.convertToConversation(conversationResponse);
        setMessages(conversation.conversation);
      } catch (err) {
        console.error('Error loading messages:', err);
      }
    };

    if (pollTrigger > 0) {
      loadMessages();
    }
  }, [conversationId, pollTrigger]);

  // Update messages when initialMessages prop changes
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6">
      <div className="space-y-4 w-full pb-6">
        {messages.map((chat) => (
          <div key={chat.id} className={`flex gap-3 ${chat.sender === 'me' ? 'flex-row-reverse' : ''}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 ${
                chat.sender === 'me' ? 'bg-gradient-to-br from-pink-400 to-green-400' : ''
              }`}
              style={chat.sender === 'user' ? { backgroundColor: '#ec6c8c' } : {}}
            >
              {chat.sender === 'me' ? 'Yo' : participantName.charAt(0)}
            </div>
            <div className="flex-1 max-w-lg">
              <div
                className={`rounded-2xl p-4 shadow-sm ${
                  chat.sender === 'me'
                    ? 'bg-gradient-to-br from-pink-100 to-green-100 rounded-tr-sm'
                    : 'bg-white rounded-tl-sm'
                }`}
              >
                <p>{chat.text}</p>
              </div>
              <span className="text-xs text-muted-foreground mt-1 ml-1 block">{chat.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

