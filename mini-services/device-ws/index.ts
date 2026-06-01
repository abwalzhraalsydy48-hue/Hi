import { WebSocketServer, WebSocket } from 'ws'

const PORT = parseInt(process.env.DEVICE_WS_PORT || '3004')

// Device connection map: deviceId -> WebSocket
const deviceConnections = new Map<string, WebSocket>()

// Create WebSocket server
const wss = new WebSocketServer({ port: PORT })

console.log(`🔌 Device WebSocket server running on port ${PORT}`)

// Handle connections
wss.on('connection', (ws, req) => {
  let deviceId: string | null = null
  
  console.log('📱 New connection from:', req.socket.remoteAddress)
  
  // Send connected message
  sendMessage(ws, {
    type: 'connected',
    message: 'Connected to Abu-Zahra Device WebSocket',
    timestamp: new Date().toISOString()
  })
  
  // Handle incoming messages
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString())
      console.log('📥 Received:', message)
      
      handleMessage(ws, message)
    } catch (error) {
      console.error('❌ Parse error:', error)
      sendMessage(ws, { type: 'error', error: 'Invalid JSON' })
    }
  })
  
  // Handle close
  ws.on('close', () => {
    if (deviceId) {
      deviceConnections.delete(deviceId)
      console.log(`📱 Device disconnected: ${deviceId}`)
      console.log(`   Active connections: ${deviceConnections.size}`)
    }
  })
  
  // Handle errors
  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error)
  })
  
  // Helper to handle messages
  function handleMessage(ws: WebSocket, message: any) {
    const { type } = message
    
    switch (type) {
      case 'register':
        handleRegister(ws, message)
        break
      case 'pong':
        // Pong response - do nothing
        break
      case 'command_result':
        handleCommandResult(ws, message)
        break
      default:
        console.log('❓ Unknown message type:', type)
        sendMessage(ws, { type: 'error', error: 'Unknown message type' })
    }
  }
  
  function handleRegister(ws: WebSocket, message: any) {
    const id = message.device_id
    
    if (!id) {
      sendMessage(ws, { type: 'error', error: 'device_id required' })
      return
    }
    
    // Store connection
    deviceId = id
    deviceConnections.set(id, ws)
    
    console.log(`✅ Device registered: ${id}`)
    console.log(`   Active connections: ${deviceConnections.size}`)
    
    sendMessage(ws, {
      type: 'registered',
      device_id: id,
      timestamp: new Date().toISOString()
    })
  }
  
  function handleCommandResult(ws: WebSocket, message: any) {
    console.log('📤 Command result:', message)
    // TODO: Store result in database or forward to admin
  }
})

// Helper to send JSON message
function sendMessage(ws: WebSocket, data: any) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data))
  }
}

// Send command to a specific device
export function sendCommandToDevice(deviceId: string, command: any): boolean {
  const ws = deviceConnections.get(deviceId)
  
  if (ws && ws.readyState === WebSocket.OPEN) {
    sendMessage(ws, {
      type: 'command',
      ...command,
      timestamp: new Date().toISOString()
    })
    return true
  }
  
  return false
}

// Broadcast to all connected devices
export function broadcast(message: any) {
  const data = JSON.stringify({
    ...message,
    timestamp: new Date().toISOString()
  })
  
  deviceConnections.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data)
    }
  })
}

// Get connected devices
export function getConnectedDevices(): string[] {
  return Array.from(deviceConnections.keys())
}

// Ping all devices periodically
setInterval(() => {
  deviceConnections.forEach((ws, id) => {
    if (ws.readyState === WebSocket.OPEN) {
      sendMessage(ws, { type: 'ping' })
    }
  })
}, 25000)

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down device WebSocket server...')
  wss.close(() => {
    console.log('✅ WebSocket server closed')
    process.exit(0)
  })
})

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down...')
  wss.close(() => {
    console.log('✅ WebSocket server closed')
    process.exit(0)
  })
})
