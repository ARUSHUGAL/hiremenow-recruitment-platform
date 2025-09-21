# Twilio Recovery Code Setup

You've provided a Twilio recovery code: **RAAQN95WYKSD9AR6ZJFGTCYC**

## 🔧 Setup Steps

### 1. Recover Your Twilio Account

1. Go to [Twilio Console Recovery](https://console.twilio.com/recover)
2. Enter your recovery code: `RAAQN95WYKSD9AR6ZJFGTCYC`
3. Follow the recovery process to regain access to your account


### 2. Get Your Credentials

Once recovered, get these from your Twilio Console:

#### Account Credentials
- **Account SID**: Found in the main dashboard
- **Auth Token**: Found in the main dashboard (click to reveal)

#### API Key (Create New)
1. Go to "Account" → "API Keys & Tokens"
2. Click "Create API Key"
3. Name it "HireMeNow Video API Key"
4. Save the **SID** and **Secret**

#### Video Service (Create New)
1. Go to "Develop" → "Video" → "Rooms"
2. Create a new Video Service
3. Save the **Service SID**

### 3. Update Environment Variables

Create a `.env` file in your `backend` folder:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_API_KEY_SID=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY_SECRET=your_api_key_secret_here
TWILIO_VIDEO_SERVICE_SID=ISxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. Install Twilio SDK in Backend

```bash
cd backend
npm install twilio
```

### 5. Update Video Routes

Replace the mock implementation in `backend/src/routes/video.ts` with real Twilio code:

```typescript
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Generate real access token
router.post('/token', async (req, res) => {
  try {
    const { roomName, identity } = req.body;
    
    const token = new twilio.jwt.AccessToken(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_API_KEY_SID!,
      process.env.TWILIO_API_KEY_SECRET!,
      { identity }
    );

    const videoGrant = new twilio.jwt.AccessToken.VideoGrant({
      room: roomName,
    });

    token.addGrant(videoGrant);
    
    res.json({
      success: true,
      data: {
        token: token.toJwt(),
        roomName,
        identity,
        expiresAt: new Date(Date.now() + 3600000) // 1 hour
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate access token',
      error: error.message
    });
  }
});
```

### 6. Test the Integration

1. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start your frontend:
   ```bash
   npm run dev
   ```

3. Go to http://localhost:5173
4. Click "🎥 Real Twilio Call"
5. You should see a real video call interface!

## 🚀 Features You'll Get

### Real Video Calling
- ✅ Actual WebRTC video/audio
- ✅ Real-time connection to Twilio servers
- ✅ Professional video call interface
- ✅ Call controls (mute, video toggle, screen share)

### Room Management
- ✅ Create unique interview rooms
- ✅ Join existing rooms
- ✅ Track participants
- ✅ End calls with summaries

### Mobile Support
- ✅ Works on iOS Safari
- ✅ Works on Android Chrome
- ✅ Responsive design

## 🔒 Security Notes

- **Never commit** your `.env` file to version control
- **Regenerate** API keys if compromised
- **Use HTTPS** in production
- **Validate** user identity before joining rooms

## 💰 Pricing

Twilio Video pricing:
- **Free Tier**: 10,000 participant minutes/month
- **Paid**: $0.004 per participant minute
- **Recording**: Additional $0.01 per minute

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid credentials"**: Check your Account SID and Auth Token
2. **"Token expired"**: Tokens expire after 1 hour, regenerate as needed
3. **"Room not found"**: Ensure room names are valid
4. **"Camera not working"**: Check browser permissions

### Debug Steps

1. Check browser console for errors
2. Verify environment variables are loaded
3. Test API endpoints with Postman
4. Check Twilio Console for usage logs

## 📞 Support

- [Twilio Video Documentation](https://www.twilio.com/docs/video)
- [Twilio Support](https://support.twilio.com/)
- [Twilio Console](https://console.twilio.com/)

---

**Ready to enable real video calls?** Follow these steps to replace the mock implementation with actual Twilio Video functionality using your recovery code!
