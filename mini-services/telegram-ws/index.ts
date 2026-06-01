import { Server } from 'socket.io'

const PORT = 3003

// Telegram Bot configuration
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || ''

// Types
interface TelegramUpdate {
  update_id: number
  message?: {
    message_id: number
    from?: { id: number; first_name: string; username?: string }
    chat: { id: number; type: string }
    text?: string
  }
  callback_query?: {
    id: string
    from: { id: number; first_name: string }
    message?: { message_id: number; chat: { id: number }; text?: string }
    data?: string
  }
}

// State
let lastUpdateId = 0
let pollingActive = true

// Create Socket.io server
const io = new Server(PORT, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

console.log(`🔌 WebSocket server running on port ${PORT}`)

// Handle connections
io.on('connection', (socket) => {
  console.log('📱 Client connected:', socket.id)
  
  socket.emit('connected', { 
    message: 'Connected to Abu-Zahra WebSocket',
    timestamp: new Date().toISOString()
  })

  socket.on('disconnect', () => {
    console.log('📱 Client disconnected:', socket.id)
  })

  // Handle command requests from web
  socket.on('send_command', async (data) => {
    console.log('📤 Command request:', data)
    // Forward to main API
    try {
      const res = await fetch('http://localhost:3000/api/commands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await res.json()
      socket.emit('command_sent', result)
    } catch (error) {
      socket.emit('error', { message: 'Failed to send command' })
    }
  })

  // Handle link code generation
  socket.on('generate_link_code', async () => {
    try {
      const res = await fetch('http://localhost:3000/api/link-code', {
        method: 'POST'
      })
      const result = await res.json()
      socket.emit('link_code', result)
    } catch (error) {
      socket.emit('error', { message: 'Failed to generate link code' })
    }
  })
})

// Telegram polling function
async function pollTelegram() {
  if (!BOT_TOKEN) {
    console.log('⚠️ No TELEGRAM_BOT_TOKEN set, skipping Telegram polling')
    return
  }

  console.log('🤖 Starting Telegram polling...')
  
  while (pollingActive) {
    try {
      const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=30&allowed_updates=["message","callback_query"]`
      
      const res = await fetch(url)
      const data = await res.json() as { ok: boolean; result?: TelegramUpdate[] }
      
      if (data.ok && data.result) {
        for (const update of data.result) {
          lastUpdateId = update.update_id
          
          // Check if message is from admin
          const chatId = update.message?.chat?.id || update.callback_query?.message?.chat?.id
          if (chatId && ADMIN_CHAT_ID && chatId.toString() !== ADMIN_CHAT_ID) {
            continue
          }

          // Emit update to all connected clients
          io.emit('telegram_update', update)
          
          console.log('📨 Telegram update:', update.update_id)
        }
      }
    } catch (error) {
      console.error('Polling error:', error)
    }
    
    await new Promise(r => setTimeout(r, 1000))
  }
}

// Start polling
pollTelegram()

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down...')
  pollingActive = false
  io.close()
  process.exit(0)
})
