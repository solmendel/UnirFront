import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Search, Instagram, Mail, MessageCircle, Send } from 'lucide-react';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'me';
  time: string;
}

interface Message {
  id: string;
  sender: string;
  preview: string;
  platform: 'instagram' | 'whatsapp' | 'gmail';
  time: string;
  unread: boolean;
  conversation: ChatMessage[];
}

const initialMessages: Message[] = [
  {
    id: '1',
    sender: 'María González',
    preview: 'Hola, tengo una consulta sobre el producto...',
    platform: 'instagram',
    time: '10:30',
    unread: true,
    conversation: [
      {
        id: '1-1',
        text: 'Hola, tengo una consulta sobre el producto que publicaron ayer. ¿Está disponible en otros colores?',
        sender: 'user',
        time: '10:30'
      }
    ]
  },
  {
    id: '2',
    sender: 'Carlos Ruiz',
    preview: 'Gracias por la información',
    platform: 'whatsapp',
    time: '09:45',
    unread: false,
    conversation: [
      {
        id: '2-1',
        text: 'Hola, me gustaría información sobre sus servicios',
        sender: 'user',
        time: '09:30'
      },
      {
        id: '2-2',
        text: 'Por supuesto, contamos con diversos planes que se adaptan a tus necesidades.',
        sender: 'me',
        time: '09:35'
      },
      {
        id: '2-3',
        text: 'Gracias por la información. Me gustaría proceder con la compra.',
        sender: 'user',
        time: '09:45'
      }
    ]
  },
  {
    id: '3',
    sender: 'Ana Martínez',
    preview: 'Consulta sobre el pedido #1234',
    platform: 'gmail',
    time: 'Ayer',
    unread: true,
    conversation: [
      {
        id: '3-1',
        text: 'Buenos días, escribo para consultar sobre el estado de mi pedido #1234. ¿Cuándo llegará?',
        sender: 'user',
        time: 'Ayer 15:20'
      }
    ]
  },
  {
    id: '4',
    sender: 'Pedro López',
    preview: '¿Tienen envío a domicilio?',
    platform: 'whatsapp',
    time: 'Ayer',
    unread: false,
    conversation: [
      {
        id: '4-1',
        text: '¿Tienen envío a domicilio? ¿Cuál es el costo?',
        sender: 'user',
        time: 'Ayer 12:00'
      },
      {
        id: '4-2',
        text: 'Sí, tenemos envío a domicilio. El costo varía según la zona, entre $50 y $100.',
        sender: 'me',
        time: 'Ayer 12:15'
      }
    ]
  },
  {
    id: '5',
    sender: 'Laura Torres',
    preview: 'Me encanta su contenido',
    platform: 'instagram',
    time: '15 Mar',
    unread: false,
    conversation: [
      {
        id: '5-1',
        text: 'Me encanta su contenido. ¿Hacen colaboraciones con influencers?',
        sender: 'user',
        time: '15 Mar 18:00'
      },
      {
        id: '5-2',
        text: '¡Gracias! Sí, estamos abiertos a colaboraciones. Te enviaré más información.',
        sender: 'me',
        time: '15 Mar 18:30'
      }
    ]
  },
];

const templates = [
  { id: '1', name: 'Saludo inicial', content: 'Hola, gracias por contactarnos. ¿En qué podemos ayudarte?' },
  { id: '2', name: 'Consulta de producto', content: 'Gracias por tu interés en nuestros productos. Te proporcionaré toda la información que necesites.' },
  { id: '3', name: 'Estado de pedido', content: 'Voy a revisar el estado de tu pedido y te informo en breve.' },
  { id: '4', name: 'Despedida', content: 'Gracias por contactarnos. ¡Que tengas un excelente día!' },
];

export function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [reply, setReply] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredMessages = messages
    .filter(msg => filter === 'all' ? true : msg.platform === filter)
    .filter(msg => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        msg.sender.toLowerCase().includes(query) ||
        msg.preview.toLowerCase().includes(query) ||
        msg.conversation.some(chat => chat.text.toLowerCase().includes(query))
      );
    });

  const handleTemplateSelect = (templateContent: string) => {
    setReply(templateContent);
  };

  const handleSendMessage = () => {
    if (!reply.trim() || !selectedMessage) return;

    const now = new Date();
    const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newChatMessage: ChatMessage = {
      id: `${selectedMessage.id}-${selectedMessage.conversation.length + 1}`,
      text: reply,
      sender: 'me',
      time: timeString
    };

    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === selectedMessage.id
          ? {
              ...msg,
              conversation: [...msg.conversation, newChatMessage],
              preview: reply,
              time: timeString,
              unread: false
            }
          : msg
      )
    );

    // Update selected message
    if (selectedMessage) {
      setSelectedMessage({
        ...selectedMessage,
        conversation: [...selectedMessage.conversation, newChatMessage],
        preview: reply,
        time: timeString
      });
    }

    setReply('');
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-pink-50/30 to-green-50/30">
      <div className="border-b bg-white/80 backdrop-blur-sm px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2>Mensajes</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Gestiona todos tus mensajes en un solo lugar
            </p>
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
              {filteredMessages.map((message) => (
                <button
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={`w-full text-left p-4 rounded-xl mb-2 transition-all ${
                    selectedMessage?.id === message.id
                      ? 'bg-gradient-to-r from-pink-100/50 to-green-100/50 shadow-sm'
                      : 'hover:bg-white/80'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span>{message.sender}</span>
                      {message.unread && (
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: '#ec6c8c' }} />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{message.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {message.preview}
                  </p>
                  <div className="flex items-center gap-1 text-xs" style={{ color: platformColors[message.platform] }}>
                    {platformIcons[message.platform]}
                    <span className="capitalize">{message.platform}</span>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Vista de conversación */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedMessage ? (
            <>
              <div className="border-b bg-white/80 backdrop-blur-sm px-6 py-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3>{selectedMessage.sender}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="rounded-full" style={{ borderColor: platformColors[selectedMessage.platform], color: platformColors[selectedMessage.platform] }}>
                        {platformIcons[selectedMessage.platform]}
                        <span className="ml-1 capitalize">{selectedMessage.platform}</span>
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4 max-w-3xl pb-6">
                  {selectedMessage.conversation.map((chat) => (
                    <div key={chat.id} className={`flex gap-3 ${chat.sender === 'me' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 ${chat.sender === 'me' ? 'bg-gradient-to-br from-pink-400 to-green-400' : ''}`} style={chat.sender === 'user' ? { backgroundColor: '#ec6c8c' } : {}}>
                        {chat.sender === 'me' ? 'Yo' : selectedMessage.sender.charAt(0)}
                      </div>
                      <div className="flex-1 max-w-lg">
                        <div className={`rounded-2xl p-4 shadow-sm ${chat.sender === 'me' ? 'bg-gradient-to-br from-pink-100 to-green-100 rounded-tr-sm' : 'bg-white rounded-tl-sm'}`}>
                          <p>{chat.text}</p>
                        </div>
                        <span className="text-xs text-muted-foreground mt-1 ml-1">{chat.time}</span>
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
                    />
                    <Button 
                      className="rounded-xl h-auto" 
                      style={{ backgroundColor: '#acce60' }}
                      onClick={handleSendMessage}
                      disabled={!reply.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>Selecciona un mensaje para ver la conversación</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
