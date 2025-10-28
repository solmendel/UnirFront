#!/bin/bash

# Test script for UNIR Mock Backend
# Make sure the server is running on http://localhost:8000

echo "🧪 Testing UNIR Mock Backend API"
echo ""

# Test 1: Health Check
echo "1. Testing health check..."
curl -s http://localhost:8000/ | jq .
echo ""

# Test 2: Get conversations
echo "2. Getting conversations..."
curl -s http://localhost:8000/api/v1/conversations | jq .
echo ""

# Test 3: Get messages
echo "3. Getting messages..."
curl -s http://localhost:8000/api/v1/messages | jq .
echo ""

# Test 4: Get channels
echo "4. Getting channels..."
curl -s http://localhost:8000/api/v1/channels | jq .
echo ""

# Test 5: Send a message
echo "5. Sending a test message..."
curl -s -X POST http://localhost:8000/api/v1/send \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "whatsapp",
    "to": "34612345678",
    "message": "Hello from test script!"
  }' | jq .
echo ""

# Test 6: Get unread count
echo "6. Getting unread count..."
curl -s http://localhost:8000/api/v1/messages/unread/count | jq .
echo ""

echo "✅ API tests completed!"

