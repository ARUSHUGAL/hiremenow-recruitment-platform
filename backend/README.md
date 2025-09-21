# HireMeNow Backend - Omegle for Recruiters

A powerful backend API for HireMeNow, the revolutionary platform that connects recruiters and candidates through instant 5-minute video screening calls with AI-powered matching, transcription, and decision making.

## 🚀 Features

### Core Functionality
- **Instant Matching**: AI-powered predicate logic matching algorithm
- **Real-time Communication**: Socket.IO for instant connections
- **Video Calls**: WebRTC integration for 5-minute screening calls
- **AI Transcription**: Whisper API for real-time speech-to-text
- **AI Summaries**: GPT-4 powered interview analysis and scoring
- **Email Notifications**: Brevo integration for automated communications
- **Decision Tracking**: YES/NO/MAYBE decision system with priority flags

### Technical Features
- **TypeScript**: Full type safety and modern development experience
- **Firebase Integration**: Authentication, Firestore database, and real-time updates
- **Express.js**: Robust REST API with middleware support
- **Socket.IO**: Real-time bidirectional communication
- **Rate Limiting**: Protection against abuse and spam
- **Error Handling**: Comprehensive error management and logging
- **Validation**: Request validation with express-validator
- **Security**: Helmet, CORS, and authentication middleware

## 📋 Prerequisites

- Node.js 18+ 
- Firebase project with Firestore enabled
- OpenAI API key (for AI features)
- Brevo account (for email notifications)

## 🛠️ Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Fill in your actual values in `.env`:
   - Firebase configuration
   - OpenAI API key
   - Brevo API key
   - Other service configurations

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3001) |
| `NODE_ENV` | Environment mode | No (default: development) |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `FIREBASE_PRIVATE_KEY` | Firebase private key | Yes |
| `FIREBASE_CLIENT_EMAIL` | Firebase client email | Yes |
| `OPENAI_API_KEY` | OpenAI API key for AI features | Yes |
| `BREVO_API_KEY` | Brevo API key for emails | Yes |
| `CORS_ORIGIN` | Frontend URL for CORS | Yes |

### Firebase Setup

1. Create a Firebase project
2. Enable Firestore database
3. Generate a service account key
4. Add the key details to your `.env` file

### OpenAI Setup

1. Create an OpenAI account
2. Generate an API key
3. Add it to your `.env` file

### Brevo Setup

1. Create a Brevo account
2. Generate an API key
3. Add it to your `.env` file

## 📚 API Documentation

### Authentication
All routes require Firebase authentication. Include the token in the Authorization header:
```
Authorization: Bearer <firebase-token>
```

### Core Endpoints

#### Candidates
- `GET /api/candidates/profile` - Get candidate profile
- `PUT /api/candidates/profile` - Update candidate profile
- `POST /api/candidates/profile` - Create candidate profile
- `GET /api/candidates/calls` - Get call history
- `PUT /api/candidates/availability` - Update availability

#### Recruiters
- `GET /api/recruiters/profile` - Get recruiter profile
- `PUT /api/recruiters/profile` - Update recruiter profile
- `POST /api/recruiters/profile` - Create recruiter profile
- `PUT /api/recruiters/constraints` - Update matching constraints
- `PUT /api/recruiters/active` - Toggle active status

#### Matching
- `POST /api/matching/find-candidate` - Find best candidate match
- `GET /api/matching/candidates` - Browse available candidates
- `POST /api/matching/evaluate-candidate` - Evaluate specific candidate

#### Video Calls
- `POST /api/calls/:callId/transcript` - Upload audio for transcription
- `POST /api/calls/:callId/summary` - Generate AI summary
- `GET /api/calls/:callId/details` - Get complete call details

#### Notifications
- `POST /api/notifications/welcome` - Send welcome email
- `GET /api/notifications/status` - Check service status

### Socket.IO Events

#### Client → Server
- `find_match` - Recruiter requests a candidate match
- `join_call` - Join a video call room
- `webrtc_offer` - WebRTC offer
- `webrtc_answer` - WebRTC answer
- `webrtc_ice_candidate` - ICE candidate
- `end_call` - End the call
- `recruiter_decision` - Make decision (YES/NO/MAYBE)

#### Server → Client
- `match_found` - Match found for recruiter
- `incoming_call` - Incoming call for candidate
- `call_started` - Call has begun
- `call_ended` - Call has ended
- `decision_received` - Decision notification
- `error` - Error messages

## 🧠 AI Features

### Matching Algorithm
The system uses predicate logic with hard and soft constraints:

**Hard Constraints** (must be satisfied):
- Candidate availability
- Online status
- Required skills
- Experience level

**Soft Constraints** (scored):
- Preferred skills
- Location preferences
- Salary expectations
- Cultural fit indicators

### AI Summary Generation
After each call, the system:
1. Transcribes audio using Whisper
2. Analyzes conversation with GPT-4
3. Generates structured summary with:
   - Communication score (1-10)
   - Technical score (1-10)
   - Cultural fit score (1-10)
   - Strengths and weaknesses
   - Recommendations

### Email Automation
- Welcome emails for new users
- Decision notifications to candidates
- Call summaries to recruiters
- Personalized content generation

## 🔒 Security

- **Authentication**: Firebase JWT tokens
- **Authorization**: Role-based access control
- **Rate Limiting**: Prevents abuse
- **Input Validation**: Comprehensive request validation
- **CORS**: Configured for specific origins
- **Helmet**: Security headers
- **Error Handling**: No sensitive data leakage

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Setup
- Set `NODE_ENV=production`
- Configure production Firebase project
- Set up production email service
- Configure proper CORS origins

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["npm", "start"]
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## 📊 Monitoring

The API includes health check endpoints and comprehensive logging:

- `GET /health` - Service health status
- Request/response logging with Morgan
- Error logging with stack traces
- Performance metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the environment configuration

---

**HireMeNow Backend** - Revolutionizing recruitment through instant AI-powered connections! 🚀
