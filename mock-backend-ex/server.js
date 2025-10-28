const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

// Initialize express-ws for the app
const expressWs = require('express-ws')(app);
const wss = expressWs.getWss();

// Middleware
app.use(cors());
app.use(express.json());

// Store for WebSocket connections
const connections = [];

// File-based storage
const DATA_FILE = path.join(__dirname, 'data.json');

// Mock data storage
let messages = [];
let conversations = [];
let messageCounter = 1;
let conversationCounter = 1;

// Load data from file
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      messages = data.messages || [];
      conversations = data.conversations || [];
      messageCounter = data.messageCounter || 1;
      conversationCounter = data.conversationCounter || 1;
      console.log(`📂 Loaded ${messages.length} messages and ${conversations.length} conversations from disk`);
    }
  } catch (error) {
    console.error('Error loading data from file:', error);
  }
}

// Save data to file
function saveData() {
  try {
    const data = {
      messages,
      conversations,
      messageCounter,
      conversationCounter
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving data to file:', error);
  }
}

// Initialize mock data to match core API
const mockChannels = [
  { id: 1, name: 'whatsapp', display_name: 'WhatsApp', is_active: true, created_at: new Date().toISOString() },
  { id: 2, name: 'instagram', display_name: 'Instagram', is_active: true, created_at: new Date().toISOString() },
  { id: 3, name: 'gmail', display_name: 'Gmail', is_active: true, created_at: new Date().toISOString() }
];

const mockConversations = [
  {
    id: 1,
    participant_name: 'María González',
    participant_identifier: '+1234567890',
    is_active: true,
    channel_id: 1,
    external_id: 'whatsapp_+1234567890',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    participant_name: 'Carlos Ruiz',
    participant_identifier: '+0987654321',
    is_active: true,
    channel_id: 1,
    external_id: 'whatsapp_+0987654321',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 3,
    participant_name: 'Ana Martínez',
    participant_identifier: 'ana.martinez@email.com',
    is_active: true,
    channel_id: 3,
    external_id: 'gmail_ana.martinez@email.com',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 4,
    participant_name: 'Pedro López',
    participant_identifier: '+1122334455',
    is_active: true,
    channel_id: 1,
    external_id: 'whatsapp_+1122334455',
    created_at: new Date(Date.now() - 259200000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 5,
    participant_name: 'Laura Torres',
    participant_identifier: '@laura_torres',
    is_active: true,
    channel_id: 2,
    external_id: 'instagram_@laura_torres',
    created_at: new Date(Date.now() - 432000000).toISOString(),
    updated_at: new Date(Date.now() - 259200000).toISOString()
  }
];

const mockMessages = [
  // Conversation 1 - María González (WhatsApp)
  {
    id: 1,
    content: 'Hola, tengo una consulta sobre el producto que publicaron ayer. ¿Está disponible en otros colores?',
    message_type: 'text',
    direction: 'incoming',
    sender_name: 'María González',
    sender_identifier: '+1234567890',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    message_metadata: null,
    conversation_id: 1,
    external_message_id: 'wa_msg_1',
    is_read: false,
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  // Conversation 2 - Carlos Ruiz (WhatsApp)
  {
    id: 2,
    content: 'Hola, me gustaría información sobre sus servicios',
    message_type: 'text',
    direction: 'incoming',
    sender_name: 'Carlos Ruiz',
    sender_identifier: '+0987654321',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    message_metadata: null,
    conversation_id: 2,
    external_message_id: 'wa_msg_2',
    is_read: true,
    created_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 3,
    content: 'Por supuesto, contamos con diversos planes que se adaptan a tus necesidades.',
    message_type: 'text',
    direction: 'outgoing',
    sender_name: null,
    sender_identifier: 'system',
    timestamp: new Date(Date.now() - 5400000).toISOString(),
    message_metadata: null,
    conversation_id: 2,
    external_message_id: 'wa_msg_3',
    is_read: true,
    created_at: new Date(Date.now() - 5400000).toISOString()
  },
  {
    id: 4,
    content: 'Gracias por la información. Me gustaría proceder con la compra.',
    message_type: 'text',
    direction: 'incoming',
    sender_name: 'Carlos Ruiz',
    sender_identifier: '+0987654321',
    timestamp: new Date(Date.now() - 2700000).toISOString(),
    message_metadata: null,
    conversation_id: 2,
    external_message_id: 'wa_msg_4',
    is_read: true,
    created_at: new Date(Date.now() - 2700000).toISOString()
  },
  // Conversation 3 - Ana Martínez (Gmail)
  {
    id: 5,
    content: 'Buenos días, escribo para consultar sobre el estado de mi pedido #1233. ¿Cuándo llegará?',
    message_type: 'text',
    direction: 'incoming',
    sender_name: 'Ana Martínez',
    sender_identifier: 'ana.martinez@email.com',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    message_metadata: null,
    conversation_id: 3,
    external_message_id: 'gmail_msg_1',
    is_read: false,
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  // Conversation 4 - Pedro López (WhatsApp)
  {
    id: 6,
    content: '¿Tienen envío a domicilio? ¿Cuál es el costo?',
    message_type: 'text',
    direction: 'incoming',
    sender_name: 'Pedro López',
    sender_identifier: '+1122334455',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    message_metadata: null,
    conversation_id: 4,
    external_message_id: 'wa_msg_5',
    is_read: true,
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 7,
    content: 'Sí, tenemos envío a domicilio. El costo varía según la zona, entre $50 y $100.',
    message_type: 'text',
    direction: 'outgoing',
    sender_name: null,
    sender_identifier: 'system',
    timestamp: new Date(Date.now() - 81000000).toISOString(),
    message_metadata: null,
    conversation_id: 4,
    external_message_id: 'wa_msg_6',
    is_read: true,
    created_at: new Date(Date.now() - 81000000).toISOString()
  },
  // Conversation 5 - Laura Torres (Instagram)
  {
    id: 8,
    content: 'Me encanta su contenido. ¿Hacen colaboraciones con influencers?',
    message_type: 'text',
    direction: 'incoming',
    sender_name: 'Laura Torres',
    sender_identifier: '@laura_torres',
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    message_metadata: null,
    conversation_id: 5,
    external_message_id: 'ig_msg_1',
    is_read: true,
    created_at: new Date(Date.now() - 259200000).toISOString()
  },
  {
    id: 9,
    content: '¡Gracias! Sí, estamos abiertos a colaboraciones. Te enviaré más información.',
    message_type: 'text',
    direction: 'outgoing',
    sender_name: null,
    sender_identifier: 'system',
    timestamp: new Date(Date.now() - 256000000).toISOString(),
    message_metadata: null,
    conversation_id: 5,
    external_message_id: 'ig_msg_2',
    is_read: true,
    created_at: new Date(Date.now() - 256000000).toISOString()
  }
];

// Initialize storage - first try to load from disk, otherwise use mock data
loadData();

// If no data was loaded from file, initialize with mock data
if (messages.length === 0 && conversations.length === 0) {
  conversations = JSON.parse(JSON.stringify(mockConversations));
  messages = JSON.parse(JSON.stringify(mockMessages));
  saveData(); // Save initial data
  console.log('📝 Initialized with mock data');
}

// Utility function to send message to all connected clients
function broadcastToAll(type, data) {
  const message = JSON.stringify({ type, data });
  connections.forEach(conn => {
    if (conn.readyState === 1) { // WebSocket.OPEN
      conn.send(message);
    }
  });
}

// Helper to format date for ISO string
function toISOString(date) {
  if (!date) return new Date().toISOString();
  return date instanceof Date ? date.toISOString() : date;
}

// ========== HEALTH & STATUS ENDPOINTS ==========

app.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Core Unified Messaging API',
    version: '1.0.0',
    description: 'API para unificar mensajes de WhatsApp, Gmail e Instagram'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Core Unified Messaging API',
    version: '1.0.0',
    database: 'connected',
    websocket_connections: connections.length
  });
});

// ========== MESSAGES ENDPOINTS ==========

app.get('/api/v1/messages', (req, res) => {
  let filteredMessages = [...messages];

  // Filter by conversation_id
  if (req.query.conversation_id) {
    filteredMessages = filteredMessages.filter(
      m => m.conversation_id === parseInt(req.query.conversation_id)
    );
  }

  // Filter by channel (needs to join with conversations)
  if (req.query.channel) {
    const channel = mockChannels.find(c => c.name === req.query.channel);
    if (channel) {
      const convs = conversations.filter(c => c.channel_id === channel.id);
      const convIds = convs.map(c => c.id);
      filteredMessages = filteredMessages.filter(m => convIds.includes(m.conversation_id));
    }
  }

  // Sort by timestamp descending (most recent first)
  filteredMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Pagination with validation
  const limit = Math.min(parseInt(req.query.limit) || 50, 100);
  const offset = Math.max(parseInt(req.query.offset) || 0, 0);
  const paginated = filteredMessages.slice(offset, offset + limit);

  res.json(paginated);
});

app.get('/api/v1/messages/:message_id', (req, res) => {
  const message = messages.find(m => m.id === parseInt(req.params.message_id));
  if (!message) {
    return res.status(404).json({ detail: 'Message not found' });
  }
  res.json(message);
});

app.post('/api/v1/messages', (req, res) => {
  const { content, message_type, direction, sender_name, sender_identifier, timestamp, 
          message_metadata, conversation_id, external_message_id } = req.body;

  console.log('📨 Mensaje recibido desde UNIR');
  console.log(`   Contenido: "${content}"`);
  console.log(`   Conversación: ${conversation_id} | De: ${sender_identifier}`);

  // Validate required fields
  if (!content || !direction || !sender_identifier || !timestamp || !conversation_id) {
    return res.status(400).json({ 
      detail: 'Missing required fields: content, direction, sender_identifier, timestamp, conversation_id' 
    });
  }

  const newMessage = {
    id: messageCounter++,
    content,
    message_type: message_type || 'text',
    direction,
    sender_name: sender_name || null,
    sender_identifier,
    timestamp: toISOString(timestamp),
    message_metadata: message_metadata || null,
    conversation_id,
    external_message_id: external_message_id || null,
    is_read: false,
    created_at: new Date().toISOString()
  };

  messages.push(newMessage);
  saveData();
  broadcastToAll('new_message', newMessage);
  res.json(newMessage);
});

app.put('/api/v1/messages/:message_id/read', (req, res) => {
  const message = messages.find(m => m.id === parseInt(req.params.message_id));
  if (!message) {
    return res.status(404).json({ detail: 'Message not found' });
  }
  message.is_read = true;
  saveData();
  broadcastToAll('message_read', { messageId: message.id });
  res.json({ status: 'success', message: 'Message marked as read' });
});

app.get('/api/v1/messages/unread/count', (req, res) => {
  let filteredMessages = messages.filter(m => !m.is_read);

  if (req.query.conversation_id) {
    filteredMessages = filteredMessages.filter(
      m => m.conversation_id === parseInt(req.query.conversation_id)
    );
  }

  // Match core API response format
  res.json({ unread_count: filteredMessages.length });
});

app.post('/api/v1/messages/unified', (req, res) => {
  const { channel, sender, message, timestamp, message_type, sender_name, message_id } = req.body;

  if (!channel || !sender || !message || !timestamp) {
    return res.status(400).json({ detail: 'Missing required fields' });
  }

  // Find or create conversation
  let conversation = conversations.find(c => 
    c.participant_identifier === sender && c.channel_id === mockChannels.find(ch => ch.name === channel)?.id
  );

  if (!conversation) {
    const channelObj = mockChannels.find(c => c.name === channel);
    if (!channelObj) {
      return res.status(400).json({ detail: 'Invalid channel' });
    }

    conversation = {
      id: conversationCounter++,
      participant_name: sender_name || null,
      participant_identifier: sender,
      is_active: true,
      channel_id: channelObj.id,
      external_id: `${channel}_${sender}`,
      created_at: toISOString(timestamp),
      updated_at: toISOString(timestamp)
    };
    conversations.push(conversation);
    saveData();
  }

  // Create message (direction is "incoming" for unified messages)
  const newMessage = {
    id: messageCounter++,
    content: message,
    message_type: message_type || 'text',
    direction: 'incoming',
    sender_name: sender_name || null,
    sender_identifier: sender,
    timestamp: toISOString(timestamp),
    message_metadata: null,
    conversation_id: conversation.id,
    external_message_id: message_id || null,
    is_read: false,
    created_at: new Date().toISOString()
  };

  messages.push(newMessage);
  saveData();
  broadcastToAll('new_message', newMessage);

  // Return in format expected by core API
  res.json({ status: 'success', message_id: newMessage.id });
});

app.post('/api/v1/send', async (req, res) => {
  const { channel, to, message, message_type, media_url } = req.body;

  if (!channel || !to || !message) {
    return res.status(400).json({
      success: false,
      message_id: null,
      error: 'Missing required fields'
    });
  }

  const channelObj = mockChannels.find(c => c.name === channel);
  if (!channelObj) {
    return res.status(400).json({
      success: false,
      message_id: null,
      error: `Unsupported channel: ${channel}`
    });
  }

  // Format phone number for WhatsApp (mimic core API behavior)
  let formattedTo = to;
  if (channel === 'whatsapp' && to.startsWith('+')) {
    const number = to.substring(1);
    if (number.startsWith('549')) {
      formattedTo = '54' + number.substring(3);
    } else {
      formattedTo = number;
    }
  }

  // Find or create conversation
  let conversation = conversations.find(c => 
    c.participant_identifier === formattedTo && c.channel_id === channelObj.id && c.is_active
  );

  if (!conversation) {
    conversation = {
      id: conversationCounter++,
      participant_name: formattedTo,
      participant_identifier: formattedTo,
      is_active: true,
      channel_id: channelObj.id,
      external_id: `${channel}_${formattedTo}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    conversations.push(conversation);
    saveData();
  }

  // Create outbound message
  const externalMsgId = `msg_${Date.now()}`;
  const newMessage = {
    id: messageCounter++,
    content: message,
    message_type: message_type || 'text',
    direction: 'outgoing',
    sender_name: null,
    sender_identifier: 'system',
    timestamp: new Date().toISOString(),
    message_metadata: media_url ? JSON.stringify({ media_url }) : null,
    conversation_id: conversation.id,
    external_message_id: externalMsgId,
    is_read: true,
    created_at: new Date().toISOString()
  };

  messages.push(newMessage);
  saveData();
  broadcastToAll('new_message', newMessage);

  // Return in format expected by core API
  res.json({
    success: true,
    message_id: externalMsgId,
    error: null,
    details: newMessage
  });
});

// ========== CONVERSATIONS ENDPOINTS ==========

app.get('/api/v1/conversations', (req, res) => {
  let filteredConversations = conversations.filter(c => c.is_active);

  // Filter by channel_id
  if (req.query.channel_id) {
    filteredConversations = filteredConversations.filter(
      c => c.channel_id === parseInt(req.query.channel_id)
    );
  }

  // Sort by updated_at descending (most recent first)
  filteredConversations.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

  // Enrich with last message info for display
  const enrichedConversations = filteredConversations.map(conv => {
    const conversationMessages = messages.filter(m => m.conversation_id === conv.id);
    if (conversationMessages.length > 0) {
      // Sort by timestamp descending to get the most recent
      conversationMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const lastMessage = conversationMessages[0];
      const hasUnread = conversationMessages.some(m => !m.is_read && m.direction === 'incoming');
      
      return {
        ...conv,
        last_message: {
          content: lastMessage.content,
          timestamp: lastMessage.timestamp,
          direction: lastMessage.direction,
          is_read: lastMessage.is_read
        },
        has_unread: hasUnread
      };
    }
    return conv;
  });

  // Pagination with validation
  const limit = Math.min(parseInt(req.query.limit) || 50, 100);
  const offset = Math.max(parseInt(req.query.offset) || 0, 0);
  const paginated = enrichedConversations.slice(offset, offset + limit);

  res.json(paginated);
});

app.get('/api/v1/conversations/:conversation_id', (req, res) => {
  const conversation = conversations.find(c => c.id === parseInt(req.params.conversation_id));
  if (!conversation) {
    return res.status(404).json({ detail: 'Conversation not found' });
  }

  // Get messages for this conversation
  const conversationMessages = messages.filter(m => m.conversation_id === conversation.id);
  
  // Sort by timestamp ascending (oldest first) for chat display
  conversationMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  // Apply limit
  const limit = Math.min(parseInt(req.query.limit) || 50, 100);
  const limitedMessages = conversationMessages.slice(-limit); // Get the most recent N messages

  res.json({
    ...conversation,
    messages: limitedMessages
  });
});

app.post('/api/v1/conversations', (req, res) => {
  const { participant_name, participant_identifier, is_active, channel_id, external_id } = req.body;

  if (!participant_identifier || !channel_id || !external_id) {
    return res.status(400).json({ detail: 'Missing required fields' });
  }

  // Validate channel exists
  const channel = mockChannels.find(c => c.id === channel_id);
  if (!channel) {
    return res.status(400).json({ detail: `Channel with id ${channel_id} not found` });
  }

  const newConversation = {
    id: conversationCounter++,
    participant_name: participant_name || null,
    participant_identifier,
    is_active: is_active !== undefined ? is_active : true,
    channel_id,
    external_id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  conversations.push(newConversation);
  saveData();
  broadcastToAll('conversation_updated', newConversation);
  res.json(newConversation);
});

app.put('/api/v1/conversations/:conversation_id/participant', (req, res) => {
  const conversation = conversations.find(c => c.id === parseInt(req.params.conversation_id));
  if (!conversation) {
    return res.status(404).json({ detail: 'Conversation not found' });
  }

  // participant_name comes from query parameter
  const participantName = req.query.participant_name;
  if (participantName) {
    conversation.participant_name = participantName;
    conversation.updated_at = new Date().toISOString();
    saveData();
    broadcastToAll('conversation_updated', conversation);
  }

  res.json({ status: 'success', message: 'Participant name updated' });
});

app.put('/api/v1/conversations/:conversation_id/deactivate', (req, res) => {
  const conversation = conversations.find(c => c.id === parseInt(req.params.conversation_id));
  if (!conversation) {
    return res.status(404).json({ detail: 'Conversation not found' });
  }

  conversation.is_active = false;
  conversation.updated_at = new Date().toISOString();
  saveData();
  broadcastToAll('conversation_updated', conversation);
  res.json({ status: 'success', message: 'Conversation deactivated' });
});

// ========== CHANNELS ENDPOINTS ==========

app.get('/api/v1/channels', (req, res) => {
  const activeChannels = mockChannels.filter(c => c.is_active);
  res.json(activeChannels);
});

app.get('/api/v1/channels/:channel_name', (req, res) => {
  const channel = mockChannels.find(c => c.name === req.params.channel_name && c.is_active);
  if (!channel) {
    return res.status(404).json({ detail: 'Channel not found' });
  }
  res.json(channel);
});

app.get('/api/v1/channels/:channel_name/stats', (req, res) => {
  const channel = mockChannels.find(c => c.name === req.params.channel_name);
  if (!channel) {
    return res.status(404).json({ detail: 'Channel not found' });
  }

  const channelConversations = conversations.filter(c => c.channel_id === channel.id);
  const channelMessages = messages.filter(m => 
    channelConversations.some(c => c.id === m.conversation_id)
  );

  // Return in format expected by core API
  res.json({
    channel_name: channel.name,
    conversation_count: channelConversations.length,
    message_count: channelMessages.length,
    unread_count: channelMessages.filter(m => !m.is_read && m.direction === 'incoming').length
  });
});

// ========== BROADCAST ENDPOINT ==========

app.post('/broadcast', (req, res) => {
  const message = typeof req.body === 'string' ? req.body : (req.body.message || 'Test broadcast');
  broadcastToAll('broadcast', { message });
  res.json({ status: 'success', message: 'Broadcasted to all clients' });
});

// ========== WEBSOCKET ENDPOINT ==========

app.ws('/ws', (ws, req) => {
  connections.push(ws);
  console.log(`WebSocket client connected. Total connections: ${connections.length}`);

  ws.on('close', () => {
    const index = connections.indexOf(ws);
    if (index > -1) {
      connections.splice(index, 1);
    }
    console.log(`WebSocket client disconnected. Total connections: ${connections.length}`);
  });

  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);
      console.log('Received WebSocket message:', data);
      // Echo back for testing (as done in core API)
      ws.send(JSON.stringify({ type: 'echo', message: `Echo: ${data}` }));
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  });
});

// ========== START SERVER ==========

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
  console.log(`\n🚀 UNIR Mock Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}/ws`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   GET  / - Health check`);
  console.log(`   GET  /health - Detailed health`);
  console.log(`   GET  /api/v1/messages`);
  console.log(`   POST /api/v1/messages`);
  console.log(`   GET  /api/v1/messages/:id`);
  console.log(`   PUT  /api/v1/messages/:id/read`);
  console.log(`   GET  /api/v1/messages/unread/count`);
  console.log(`   POST /api/v1/messages/unified`);
  console.log(`   POST /api/v1/send`);
  console.log(`   GET  /api/v1/conversations`);
  console.log(`   POST /api/v1/conversations`);
  console.log(`   GET  /api/v1/conversations/:id`);
  console.log(`   PUT  /api/v1/conversations/:id/participant`);
  console.log(`   PUT  /api/v1/conversations/:id/deactivate`);
  console.log(`   GET  /api/v1/channels`);
  console.log(`   GET  /api/v1/channels/:name`);
  console.log(`   GET  /api/v1/channels/:name/stats`);
  console.log(`   POST /broadcast`);
  console.log(`\n💡 Use WebSocket at ws://localhost:${PORT}/ws\n`);
});

