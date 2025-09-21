const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Twilio credentials - Use environment variables
const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || 'your_account_sid_here';
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || 'your_auth_token_here';
const API_KEY_SID = process.env.TWILIO_API_KEY_SID || 'your_api_key_sid_here';
const API_KEY_SECRET = process.env.TWILIO_API_KEY_SECRET || 'your_api_key_secret_here';

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Live matching status
app.get('/api/live-status', (req, res) => {
  const totalActiveCalls = activeCalls.size;
  const totalParticipants = Array.from(activeCalls.values())
    .reduce((sum, call) => sum + call.participants.length, 0);
  
  const activeCallsList = Array.from(activeCalls.values()).map(call => ({
    roomName: call.roomName,
    participantCount: call.participants.length,
    duration: Math.floor((new Date() - call.startTime) / 1000),
    participants: call.participants.map(p => ({
      identity: p.identity,
      joinedAt: p.joinedAt
    }))
  }));

  res.json({
    success: true,
    data: {
      totalActiveCalls,
      totalParticipants,
      activeCalls: activeCallsList,
      lastUpdated: new Date().toISOString()
    }
  });
});

// Generate Twilio Video access token
app.post('/api/video/token', (req, res) => {
  try {
    const { roomName, identity } = req.body;
    
    if (!roomName || !identity) {
      return res.status(400).json({ 
        success: false, 
        error: 'Room name and identity are required' 
      });
    }

    // Generate access token
    const token = new twilio.jwt.AccessToken(
      ACCOUNT_SID,
      API_KEY_SID,
      API_KEY_SECRET,
      { identity }
    );

    const videoGrant = new twilio.jwt.AccessToken.VideoGrant({
      room: roomName,
    });

    token.addGrant(videoGrant);

    const tokenData = {
      token: token.toJwt(),
      roomName: roomName,
      identity: identity,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      capabilities: {
        video: true,
        audio: true,
        screenShare: true
      }
    };

    res.json({ 
      success: true, 
      message: 'Access token generated', 
      data: tokenData 
    });
  } catch (error) {
    console.error('Error generating video token:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate access token' 
    });
  }
});

// Socket.IO WebRTC signaling
const rooms = new Map(); // roomName -> Set of socketIds
const activeCalls = new Map(); // roomName -> { participants: [], startTime: Date }

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  socket.on('join-room', (data) => {
    const { roomName, identity } = data;
    console.log(`👤 ${identity} joining room: ${roomName}`);
    
    socket.join(roomName);
    socket.roomName = roomName;
    socket.identity = identity;

    // Add to room tracking
    if (!rooms.has(roomName)) {
      rooms.set(roomName, new Set());
    }
    rooms.get(roomName).add(socket.id);

    // Notify others in the room
    socket.to(roomName).emit('user-joined', { identity, socketId: socket.id });
    
    // Track active calls
    if (!activeCalls.has(roomName)) {
      activeCalls.set(roomName, {
        participants: [],
        startTime: new Date(),
        roomName: roomName
      });
    }
    
    const call = activeCalls.get(roomName);
    call.participants.push({ identity, socketId: socket.id, joinedAt: new Date() });
    
    console.log(`📊 Room ${roomName} now has ${rooms.get(roomName).size} users`);
    console.log(`📞 Active calls: ${activeCalls.size}`);
  });

  socket.on('offer', (offer) => {
    console.log('📞 Forwarding offer');
    socket.to(socket.roomName).emit('offer', offer);
  });

  socket.on('answer', (answer) => {
    console.log('📞 Forwarding answer');
    socket.to(socket.roomName).emit('answer', answer);
  });

  socket.on('ice-candidate', (candidate) => {
    console.log('🧊 Forwarding ICE candidate');
    socket.to(socket.roomName).emit('ice-candidate', candidate);
  });

  socket.on('disconnect', () => {
    console.log('👋 User disconnected:', socket.id);
    
    if (socket.roomName && rooms.has(socket.roomName)) {
      rooms.get(socket.roomName).delete(socket.id);
      
      // Notify others in the room
      socket.to(socket.roomName).emit('user-left', { 
        identity: socket.identity,
        socketId: socket.id 
      });
      
      // Clean up empty rooms and active calls
      if (rooms.get(socket.roomName).size === 0) {
        rooms.delete(socket.roomName);
        activeCalls.delete(socket.roomName);
        console.log(`📞 Call ended in room: ${socket.roomName}`);
      } else {
        // Remove participant from active call
        const call = activeCalls.get(socket.roomName);
        if (call) {
          call.participants = call.participants.filter(p => p.socketId !== socket.id);
        }
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 WebRTC signaling server running on port ${PORT}`);
  console.log(`📹 Video token endpoint: http://localhost:${PORT}/api/video/token`);
  console.log(`🔌 Socket.IO endpoint: ws://localhost:${PORT}`);
});
