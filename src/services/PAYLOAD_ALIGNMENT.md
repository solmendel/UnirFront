# Payload Alignment Documentation

This document verifies that the frontend API service payloads match the core API expectations exactly.

## ✅ Aligned Fields

### Message Directions
**Changed from:** `"inbound"` / `"outbound"`  
**Changed to:** `"incoming"` / `"outgoing"`  
**Status:** ✅ Matches core API

### Unread Count Response
**Changed from:** `{ count: number }`  
**Changed to:** `{ unread_count: number }`  
**Status:** ✅ Matches core API

## Core API Payload Expectations

### Messages

#### POST /api/v1/messages
**Required fields:**
- `content` (string)
- `direction` (string: "incoming" or "outgoing")
- `sender_identifier` (string)
- `timestamp` (ISO string)
- `conversation_id` (number)

**Optional fields:**
- `message_type` (string, default: "text")
- `sender_name` (string | null)
- `message_metadata` (string | null)
- `external_message_id` (string | null)

**Response:** MessageResponse with all fields including `id`, `is_read`, `created_at`

#### POST /api/v1/send
**Request:**
```typescript
{
  channel: string;     // "whatsapp", "instagram", "gmail"
  to: string;          // Phone number, email, or username
  message: string;     // Message content
  message_type?: string; // Optional, default: "text"
  media_url?: string;   // Optional media URL
}
```

**Response:**
```typescript
{
  success: boolean;
  message_id: string | null;
  error: string | null;
  details?: Record<string, any>;
}
```

#### GET /api/v1/messages/unread/count
**Query params:**
- `conversation_id` (optional number)

**Response:**
```typescript
{
  unread_count: number;
}
```

**Note:** Field name is `unread_count`, not `count`

### Conversations

#### POST /api/v1/conversations
**Required fields:**
- `participant_identifier` (string)
- `channel_id` (number)
- `external_id` (string)

**Optional fields:**
- `participant_name` (string | null)
- `is_active` (boolean, default: true)

**Response:** ConversationResponse with all fields

#### GET /api/v1/conversations
**Query params:**
- `channel_id` (optional number)
- `limit` (default: 50, max: 100)
- `offset` (default: 0, min: 0)

**Filters:**
- Only returns `is_active: true` conversations
- Ordered by `updated_at` descending

#### PUT /api/v1/conversations/:id/participant
**Query params:**
- `participant_name` (string)

**Response:**
```typescript
{
  status: "success";
  message: "Participant name updated";
}
```

### Unified Messages

#### POST /api/v1/messages/unified
**Request:**
```typescript
{
  channel: string;       // "whatsapp", "instagram", "gmail"
  sender: string;        // Participant identifier
  message: string;       // Message content
  timestamp: string;     // ISO timestamp
  message_id?: string;   // Optional external message ID
  message_type?: string; // Optional, default: "text"
  sender_name?: string;   // Optional sender name
}
```

**Response:**
```typescript
{
  status: "success";
  message_id: number;    // Internal message ID
}
```

## Frontend Service Updates

### api.ts Changes

1. **getUnreadCount()** - Return type changed to match core API
   ```typescript
   // OLD: Promise<{ count: number }>
   // NEW: Promise<{ unread_count: number }>
   ```

2. **convertToConversation()** - Direction mapping updated
   ```typescript
   // OLD: msg.direction === 'inbound' ? 'user' : 'me'
   // NEW: msg.direction === 'incoming' ? 'user' : 'me'
   ```

### useMessages.ts Changes

1. **sendMessage()** - Direction value updated
   ```typescript
   // OLD: direction: 'outbound'
   // NEW: direction: 'outgoing'
   ```

2. **onNewMessage callback** - Direction check updated
   ```typescript
   // OLD: sender: message.direction === 'inbound' ? 'user' : 'me'
   // NEW: sender: message.direction === 'incoming' ? 'user' : 'me'
   ```

## Testing Alignment

To verify alignment:

1. **Mock Backend** - Updated to expect exact payloads from core API
   - Message directions: "incoming"/"outgoing"
   - Unread count response: `{ unread_count: ... }`
   - All query parameters match core API

2. **Frontend Service** - Updated to send correct payloads
   - Messages created with "outgoing" direction
   - Messages received interpreted as "incoming"
   - Unread count field name corrected

## Status

✅ **All payloads are now aligned between frontend and backend**

The frontend API service now sends and expects exactly the same payloads as the Python core API defined in `src-core/`.

