# Twilio Video Integration Setup

This guide explains how to set up real Twilio Video calls in HireMeNow.

## 🚀 Quick Start

### 1. Get Twilio Credentials

1. Sign up for a [Twilio account](https://www.twilio.com/try-twilio)
2. Go to the [Twilio Console](https://console.twilio.com/)
3. Get your credentials:
   - **Account SID**: Found in the console dashboard
   - **Auth Token**: Found in the console dashboard
   - **API Key SID**: Create in "Account" → "API Keys & Tokens"
   - **API Key Secret**: Generated with the API Key

### 2. Environment Variables

Add these to your backend `.env` file:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_API_KEY_SID=your_api_key_sid_here
TWILIO_API_KEY_SECRET=your_api_key_secret_here
TWILIO_VIDEO_SERVICE_SID=your_video_service_sid_here
```

### 3. Install Twilio SDK

The frontend already has `twilio-video` installed. For the backend:

```bash
cd backend
npm install twilio
```

### 4. Update Backend Video Routes

Replace the mock implementation in `backend/src/routes/video.ts` with real Twilio code:

```typescript
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Generate real access token
router.post('/token', async (req, res) => {
  const { roomName, identity } = req.body;
  
  const token = new twilio.jwt.AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY_SID,
    process.env.TWILIO_API_KEY_SECRET,
    { identity }
  );

  const videoGrant = new twilio.jwt.AccessToken.VideoGrant({
    room: roomName,
  });

  token.addGrant(videoGrant);
  
  res.json({
    token: token.toJwt(),
    roomName,
    identity
  });
});
```

### 5. Update Frontend Twilio Service

Replace the mock implementation in `src/services/twilioVideo.ts` with real Twilio Video:

```typescript
import { connect, Room } from 'twilio-video';

// Real implementation
async joinRoom(roomName: string, identity: string): Promise<TwilioVideoCall> {
  try {
    // Get access token from your backend
    const response = await fetch('/api/video/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomName, identity })
    });
    
    const { token } = await response.json();
    
    // Connect to Twilio Video room
    const room = await connect(token, {
      name: roomName,
      audio: true,
      video: { width: 640, height: 480 }
    });

    // Handle room events
    room.on('participantConnected', (participant) => {
      console.log('Participant connected:', participant.identity);
    });

    room.on('participantDisconnected', (participant) => {
      console.log('Participant disconnected:', participant.identity);
    });

    return {
      room,
      localParticipant: room.localParticipant,
      remoteParticipants: room.participants,
      isConnected: true,
      error: null
    };
  } catch (error) {
    return {
      room: null,
      localParticipant: null,
      remoteParticipants: new Map(),
      isConnected: false,
      error: error.message
    };
  }
}
```

## 🎯 Features Implemented

### ✅ Current Demo Features
- **Mock Video Interface**: Realistic video call UI
- **Call Controls**: Mute, video toggle, screen share, end call
- **Live Timer**: Real-time call duration
- **Connection States**: Connecting, connected, error states
- **Responsive Design**: Works on desktop and mobile

### 🚀 Real Twilio Features (When Implemented)
- **Real Video/Audio**: Actual WebRTC video calls
- **Room Management**: Create, join, leave rooms
- **Participant Management**: Track connected users
- **Screen Sharing**: Share screen during calls
- **Recording**: Optional call recording
- **Transcription**: Real-time speech-to-text
- **AI Analysis**: Sentiment and skill analysis

## 🔧 Configuration Options

### Room Settings
```typescript
const roomOptions = {
  name: 'interview-room-123',
  maxParticipants: 10,
  recordParticipantsOnConnect: false,
  statusCallback: 'https://your-app.com/webhooks/room-status',
  type: 'group' // or 'peer-to-peer'
};
```

### Video Quality Settings
```typescript
const videoConstraints = {
  width: { min: 320, ideal: 640, max: 1280 },
  height: { min: 240, ideal: 480, max: 720 },
  frameRate: { min: 15, ideal: 24, max: 30 }
};
```

## 📱 Mobile Support

Twilio Video works on:
- ✅ iOS Safari
- ✅ Android Chrome
- ✅ React Native (with additional setup)
- ✅ Progressive Web Apps

## 🔒 Security Considerations

1. **Access Tokens**: Generate on backend, never expose secrets
2. **Room Names**: Use UUIDs or encrypted identifiers
3. **Identity Validation**: Verify user identity before joining
4. **Rate Limiting**: Implement call frequency limits
5. **Recording Consent**: Get explicit permission for recording

## 💰 Pricing

Twilio Video pricing (as of 2024):
- **Free Tier**: 10,000 participant minutes/month
- **Paid**: $0.004 per participant minute
- **Recording**: Additional $0.01 per minute

## 🐛 Troubleshooting

### Common Issues

1. **"Room not found"**: Check room name and permissions
2. **"Token expired"**: Regenerate access token
3. **"Camera not working"**: Check browser permissions
4. **"Audio issues"**: Verify microphone permissions

### Debug Mode

Enable Twilio debug logging:
```typescript
import { setLogLevel } from 'twilio-video';

setLogLevel('debug');
```

## 🚀 Production Deployment

1. **Environment Variables**: Set all Twilio credentials
2. **HTTPS Required**: Twilio Video requires HTTPS in production
3. **CORS Configuration**: Update CORS settings for your domain
4. **Monitoring**: Set up Twilio webhooks for call monitoring
5. **Scaling**: Consider Twilio's auto-scaling features

## 📞 Support

- [Twilio Video Documentation](https://www.twilio.com/docs/video)
- [Twilio Video React SDK](https://github.com/twilio/twilio-video.js)
- [Twilio Support](https://support.twilio.com/)

---

**Ready to implement real video calls?** Follow the steps above to replace the mock implementation with actual Twilio Video functionality!
