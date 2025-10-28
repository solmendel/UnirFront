# API Service Usage Examples

This document provides examples of how to use the API service to communicate with the backend.

## Configuration

The API service is configured in `src/config/api.ts`. You can customize the base URL using environment variables:

```bash
# Create a .env file in the root directory
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

## Import the API Service

```typescript
import { apiService } from './services/api';
```

## Health & Status

### Root Health Check
```typescript
try {
  const health = await apiService.rootHealthCheck();
  console.log('API is healthy:', health);
} catch (error) {
  console.error('Health check failed:', error);
}
```

### Detailed Health Check
```typescript
try {
  const health = await apiService.detailedHealthCheck();
  console.log('Detailed health:', health);
  // This includes WebSocket connection count
} catch (error) {
  console.error('Health check failed:', error);
}
```

## Messages

### Get Messages
```typescript
// Get all messages
const messages = await apiService.getMessages();

// Get messages for a specific conversation
const conversationMessages = await apiService.getMessages({
  conversation_id: 123,
  limit: 50,
  offset: 0
});

// Get messages for a specific channel
const channelMessages = await apiService.getMessages({
  channel: 'whatsapp',
  limit: 100
});
```

### Get a Specific Message
```typescript
const message = await apiService.getMessage(123);
console.log(message.content);
```

### Create a Message
```typescript
const newMessage = await apiService.createMessage({
  content: 'Hello, world!',
  message_type: 'text',
  direction: 'outgoing',
  sender_identifier: 'user@example.com',
  timestamp: new Date().toISOString(),
  conversation_id: 123
});
```

### Mark Message as Read
```typescript
await apiService.markMessageAsRead(123);
```

### Get Unread Count
```typescript
// Get total unread count
const { unread_count } = await apiService.getUnreadCount();

// Get unread count for a specific conversation
const { unread_count } = await apiService.getUnreadCount(123);
```

### Send Message (to external channel)
```typescript
const response = await apiService.sendMessage({
  channel: 'whatsapp',
  to: '34612345678',
  message: 'Hello from UNIR!',
  message_type: 'text'
});

if (response.success) {
  console.log('Message sent:', response.message_id);
} else {
  console.error('Error sending message:', response.error);
}
```

### Receive Unified Message
```typescript
await apiService.receiveUnifiedMessage({
  channel: 'whatsapp',
  sender: '34612345678',
  message: 'User message',
  timestamp: new Date().toISOString(),
  message_type: 'text',
  sender_name: 'John Doe'
});
```

## Conversations

### Get All Conversations
```typescript
// Get all conversations
const conversations = await apiService.getConversations();

// Get conversations with pagination
const conversations = await apiService.getConversations({
  limit: 50,
  offset: 0
});

// Get conversations for a specific channel
const conversations = await apiService.getConversations({
  channel_id: 1, // WhatsApp
  limit: 100
});
```

### Get a Specific Conversation
```typescript
// Get conversation with messages
const conversation = await apiService.getConversation(123);

// Get conversation with specific message limit
const conversation = await apiService.getConversation(123, 100);

// Access messages
conversation.messages.forEach(msg => {
  console.log(msg.content, msg.timestamp);
});
```

### Create a Conversation
```typescript
const newConversation = await apiService.createConversation({
  participant_identifier: '34612345678',
  participant_name: 'John Doe',
  channel_id: 1, // WhatsApp
  external_id: 'external_conv_123',
  is_active: true
});
```

### Update Participant Name
```typescript
await apiService.updateParticipantName(123, 'Jane Doe');
```

### Deactivate a Conversation
```typescript
await apiService.deactivateConversation(123);
```

### Convert Conversation Response to Frontend Format
```typescript
const conversationResponse = await apiService.getConversation(123);
const frontendConversation = apiService.convertToConversation(conversationResponse);

// Now you have a conversation object with:
// - id, participantName, participantIdentifier, platform
// - lastMessage, time, unread
// - conversation array with ChatMessage objects
```

## Channels

### Get All Channels
```typescript
const channels = await apiService.getChannels();
channels.forEach(channel => {
  console.log(`${channel.display_name}: ${channel.name}`);
});
```

### Get a Specific Channel
```typescript
const channel = await apiService.getChannel('whatsapp');
console.log(channel.display_name, channel.is_active);
```

### Get Channel Statistics
```typescript
const stats = await apiService.getChannelStats('whatsapp');
console.log('Channel stats:', stats);
```

## WebSocket (Real-time Messaging)

### Connect to WebSocket
```typescript
import { wsService } from './services/websocket';

// Connect with callbacks
wsService.connect({
  onNewMessage: (message) => {
    console.log('New message received:', message);
    // Update your UI with the new message
  },
  onMessageRead: (messageId) => {
    console.log('Message marked as read:', messageId);
    // Update message read status in UI
  },
  onConversationUpdated: (conversation) => {
    console.log('Conversation updated:', conversation);
    // Refresh conversation list
  },
  onBroadcast: (message) => {
    console.log('Broadcast message:', message);
  },
  onConnect: () => {
    console.log('Connected to WebSocket');
  },
  onDisconnect: () => {
    console.log('Disconnected from WebSocket');
  },
  onError: (error) => {
    console.error('WebSocket error:', error);
  }
});
```

### Send Message via WebSocket
```typescript
wsService.send({
  type: 'custom',
  data: { /* your data */ }
});
```

### Disconnect from WebSocket
```typescript
wsService.disconnect();
```

### Check Connection Status
```typescript
const isConnected = wsService.isConnected();
const state = wsService.getConnectionState(); // 0: CONNECTING, 1: OPEN, 2: CLOSING, 3: CLOSED
```

## Broadcast

```typescript
await apiService.broadcast('Hello, all connected clients!');
```

## Complete Example: Fetching and Displaying Conversations

```typescript
import { apiService } from './services/api';
import { wsService } from './services/websocket';

async function loadConversations() {
  try {
    // Fetch all conversations
    const conversations = await apiService.getConversations();
    
    // Convert to frontend format
    const frontendConversations = conversations.map(conv => 
      apiService.convertToConversation(conv)
    );
    
    // Set up WebSocket for real-time updates
    wsService.connect({
      onNewMessage: async (message) => {
        // Refresh conversations when a new message arrives
        await loadConversations();
      }
    });
    
    return frontendConversations;
  } catch (error) {
    console.error('Failed to load conversations:', error);
    return [];
  }
}

// Clean up on unmount
function cleanup() {
  wsService.disconnect();
}
```

## Error Handling

```typescript
try {
  const result = await apiService.getMessages();
  // Handle success
} catch (error) {
  if (error.message.includes('HTTP error! status: 404')) {
    // Handle not found
  } else if (error.message.includes('HTTP error! status: 500')) {
    // Handle server error
  } else {
    // Handle other errors
    console.error('API error:', error);
  }
}
```

