const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');

const app = express();
const HTTP_PORT = 8000;
const WS_PORT = 8001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data store
let data = {
  whatsapp: { conversations: [], messages: [], lastId: { conversation: 10, message: 100 } },
  instagram: { conversations: [], messages: [], lastId: { conversation: 10, message: 100 } },
  gmail: { conversations: [], messages: [], lastId: { conversation: 10, message: 100 } }
};

// Generate mock data
function generateMockData() {
  // WhatsApp mock data
  const whatsappPeople = [
    { name: 'María González', identifier: '+5491145678900', externalId: 'wa_5491145678900' },
    { name: 'Carlos Ruiz', identifier: '+5491156789012', externalId: 'wa_5491156789012' },
    { name: 'Ana Martínez', identifier: '+5491167890123', externalId: 'wa_5491167890123' },
    { name: 'Pedro López', identifier: '+5491178901234', externalId: 'wa_5491178901234' },
    { name: 'Sofia Fernández', identifier: '+5491189012345', externalId: 'wa_5491189012345' }
  ];

  // Instagram mock data
  const instagramPeople = [
    { name: '@user_mariag', identifier: 'instagram:user_mariag', externalId: 'ig_user_mariag' },
    { name: '@artistic_carlos', identifier: 'instagram:artistic_carlos', externalId: 'ig_artistic_carlos' },
    { name: '@ana_fashion', identifier: 'instagram:ana_fashion', externalId: 'ig_ana_fashion' },
    { name: '@pedro_travel', identifier: 'instagram:pedro_travel', externalId: 'ig_pedro_travel' },
    { name: '@sofia_foodie', identifier: 'instagram:sofia_foodie', externalId: 'ig_sofia_foodie' }
  ];

  // Gmail mock data
  const gmailPeople = [
    { name: 'María González', identifier: 'maria.gonzalez@example.com', externalId: 'gmail_maria.example.com' },
    { name: 'Carlos Ruiz', identifier: 'carlos.ruiz@example.com', externalId: 'gmail_carlos.example.com' },
    { name: 'Ana Martínez', identifier: 'ana.martinez@example.com', externalId: 'gmail_ana.example.com' },
    { name: 'Pedro López', identifier: 'pedro.lopez@example.com', externalId: 'gmail_pedro.example.com' },
    { name: 'Sofia Fernández', identifier: 'sofia.fernandez@example.com', externalId: 'gmail_sofia.example.com' }
  ];

  function createMessages(conversationId, platform, participantName, count, channelId) {
    const messages = [];
    const messageTexts = {
      whatsapp: [
        'Hola, tengo una consulta',
        '¿Tienen disponibilidad para mañana?',
        'Gracias por responder tan rápido',
        '¿Cuánto tiempo tarda el envío?',
        'Perfecto, entonces lo confirmo'
      ],
      instagram: [
        'Me encanta tu contenido!',
        '¿Hacen envíos internacionales?',
        'Espero tu respuesta 😊',
        'Gracias! Ya lo compré',
        'Genial! Muy buen servicio'
      ],
      gmail: [
        'Buenos días, quiero consultar sobre',
        'Necesito información sobre productos',
        'Gracias por su respuesta',
        '¿Podrían darme más información?',
        'Perfecto, procederé con la compra'
      ]
    };

    const texts = messageTexts[platform] || messageTexts.whatsapp;
    
    for (let i = 0; i < count; i++) {
      const hoursAgo = Math.floor(Math.random() * 168); // Last week
      const timestamp = new Date(Date.now() - hoursAgo * 3600000);
      
      messages.push({
        id: data[platform].lastId.message + i + 1,
        content: texts[i % texts.length],
        message_type: 'text',
        direction: i % 2 === 0 ? 'inbound' : 'outbound',
        sender_name: i % 2 === 0 ? participantName : null,
        sender_identifier: i % 2 === 0 ? (platform === 'whatsapp' ? '+1234567890' : platform === 'instagram' ? '@sender' : 'sender@example.com') : 'admin',
        timestamp: timestamp.toISOString(),
        message_metadata: null,
        conversation_id: conversationId,
        external_message_id: null,
        is_read: i % 4 === 0 ? false : true,
        created_at: timestamp.toISOString()
      });
    }
    return messages;
  }

  function createConversations(people, platform, channelId) {
    const conversations = [];
    const messages = [];

    people.forEach((person, index) => {
      const convId = index + 1;
      const messageCount = Math.floor(Math.random() * 5) + 3; // 3-7 messages
      const convMessages = createMessages(convId, platform, person.name, messageCount, channelId);
      
      messages.push(...convMessages);

      const lastMessage = convMessages[convMessages.length - 1];
      
      conversations.push({
        id: convId,
        participant_name: person.name,
        participant_identifier: person.identifier,
        is_active: true,
        channel_id: channelId,
        external_id: person.externalId,
        created_at: lastMessage.timestamp,
        updated_at: lastMessage.timestamp,
        messages: convMessages
      });
    });

    return { conversations, messages };
  }

  // Generate data for all platforms
  const whatsappData = createConversations(whatsappPeople, 'whatsapp', 1);
  const instagramData = createConversations(instagramPeople, 'instagram', 2);
  const gmailData = createConversations(gmailPeople, 'gmail', 3);

  data.whatsapp.conversations = whatsappData.conversations;
  data.whatsapp.messages = whatsappData.messages;
  data.instagram.conversations = instagramData.conversations;
  data.instagram.messages = instagramData.messages;
  data.gmail.conversations = gmailData.conversations;
  data.gmail.messages = gmailData.messages;
}

// Initialize data
generateMockData();

// Helper functions
function getConversations(platform) {
  return data[platform].conversations;
}

function getConversationById(platform, id) {
  return data[platform].conversations.find(c => c.id === parseInt(id));
}

function broadcast(type, data) {
  if (global.wss) {
    global.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type, data }));
      }
    });
  }
}

// ========================================
// ESSENTIAL ENDPOINTS ONLY
// ========================================

// GET /api/v1/:platform/conversations
app.get('/api/v1/:platform/conversations', (req, res) => {
  const conversations = getConversations(req.params.platform);
  res.json(conversations);
});

// GET /api/v1/:platform/conversations/:id
app.get('/api/v1/:platform/conversations/:id', (req, res) => {
  const conversation = getConversationById(req.params.platform, req.params.id);
  if (conversation) {
    res.json(conversation);
  } else {
    res.status(404).json({ error: 'Conversation not found' });
  }
});

// POST /api/v1/:platform/send
app.post('/api/v1/:platform/send', (req, res) => {
  const { channel, to, message, message_type } = req.body;
  const platform = req.params.platform;
  
  // Find or create conversation
  let conversation = data[platform].conversations.find(c => c.participant_identifier === to);
  
  if (!conversation) {
    // Create new conversation
    const convId = ++data[platform].lastId.conversation;
    conversation = {
      id: convId,
      participant_name: to,
      participant_identifier: to,
      is_active: true,
      channel_id: platform === 'whatsapp' ? 1 : platform === 'instagram' ? 2 : 3,
      external_id: to,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages: []
    };
    data[platform].conversations.push(conversation);
  }
  
  // Create the new message
  const newMessage = {
    id: ++data[platform].lastId.message,
    content: message,
    message_type: message_type || 'text',
    direction: 'outbound',
    sender_name: null,
    sender_identifier: 'admin',
    timestamp: new Date().toISOString(),
    message_metadata: null,
    conversation_id: conversation.id,
    external_message_id: `mock_${Date.now()}`,
    is_read: true,
    created_at: new Date().toISOString()
  };
  
  // Add message to conversation
  conversation.messages.push(newMessage);
  conversation.updated_at = new Date().toISOString();
  data[platform].messages.push(newMessage);
  
  // Broadcast new message via WebSocket
  broadcast('new_message', {
    ...newMessage,
    channel_id: conversation.channel_id
  });
  
  // Response
  const response = {
    success: true,
    message_id: newMessage.external_message_id,
    error: null,
    details: {
      channel,
      to,
      message,
      timestamp: newMessage.timestamp,
      conversation_id: conversation.id
    }
  };
  
  res.json(response);
});

// PUT /api/v1/:platform/messages/:id/read
// NOTE: Gmail doesn't support this feature
app.put('/api/v1/:platform/messages/:id/read', (req, res) => {
  if (req.params.platform === 'gmail') {
    return res.status(405).json({ error: 'Gmail does not support mark as read' });
  }
  
  // For WhatsApp and Instagram
  const messages = data[req.params.platform].messages;
  const message = messages.find(m => m.id === parseInt(req.params.id));
  
  if (message) {
    message.is_read = true;
    broadcast('message_read', { messageId: message.id });
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Message not found' });
  }
});

// ========================================
// UTILITY ENDPOINTS
// ========================================

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Reset data
app.post('/api/reset', (req, res) => {
  generateMockData();
  res.json({ success: true, message: 'Data reset successfully' });
});

// Broadcast test endpoint
app.post('/api/broadcast', (req, res) => {
  const { type = 'new_message', data: payload = {} } = req.body;
  broadcast(type, payload);
  res.json({ success: true, message: 'Broadcast sent' });
});

// Start HTTP server
app.listen(HTTP_PORT, () => {
  console.log(`✅ Mock backend running on http://localhost:${HTTP_PORT}`);
  console.log(`   Available platforms: whatsapp, instagram, gmail`);
  console.log(`   GET  /api/v1/:platform/conversations`);
  console.log(`   GET  /api/v1/:platform/conversations/:id`);
  console.log(`   POST /api/v1/:platform/send`);
  console.log(`   PUT  /api/v1/:platform/messages/:id/read (not Gmail)`);
  console.log(`   Health: http://localhost:${HTTP_PORT}/health`);
  console.log(`   Reset: POST http://localhost:${HTTP_PORT}/api/reset`);
});

// Setup WebSocket server
const wss = new WebSocket.Server({ port: WS_PORT });
global.wss = wss;

wss.on('connection', (ws, req) => {
  console.log('📡 WebSocket client connected from', req.socket.remoteAddress);
  
  // Send a welcome message
  ws.send(JSON.stringify({ type: 'connected', message: 'WebSocket connected successfully' }));
  
  ws.on('message', (message) => {
    console.log('📩 Received:', message.toString());
  });
  
  ws.on('close', (code, reason) => {
    console.log('📡 WebSocket client disconnected:', code, reason.toString());
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

console.log(`✅ WebSocket server running on ws://localhost:${WS_PORT}`);
