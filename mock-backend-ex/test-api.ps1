# Test script for UNIR Mock Backend (PowerShell)
# Make sure the server is running on http://localhost:8000

Write-Host "🧪 Testing UNIR Mock Backend API" -ForegroundColor Green
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing health check..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "http://localhost:8000/" -Method Get
$response | ConvertTo-Json
Write-Host ""

# Test 2: Get conversations
Write-Host "2. Getting conversations..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/conversations" -Method Get
$response | ConvertTo-Json
Write-Host ""

# Test 3: Get messages
Write-Host "3. Getting messages..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/messages" -Method Get
$response | ConvertTo-Json
Write-Host ""

# Test 4: Get channels
Write-Host "4. Getting channels..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/channels" -Method Get
$response | ConvertTo-Json
Write-Host ""

# Test 5: Send a message
Write-Host "5. Sending a test message..." -ForegroundColor Yellow
$body = @{
    channel = "whatsapp"
    to = "34612345678"
    message = "Hello from test script!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/send" -Method Post -Body $body -ContentType "application/json"
$response | ConvertTo-Json
Write-Host ""

# Test 6: Get unread count
Write-Host "6. Getting unread count..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/messages/unread/count" -Method Get
$response | ConvertTo-Json
Write-Host ""

Write-Host "✅ API tests completed!" -ForegroundColor Green

