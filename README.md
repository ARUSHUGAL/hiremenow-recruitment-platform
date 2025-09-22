# 🚀 HireMeNow - AI-Powered Recruitment Platform

A modern, intelligent recruitment platform that revolutionizes the hiring process with AI-powered resume parsing, advanced candidate matching, and seamless video calling capabilities.

## ✨ Key Features

### 🤖 AI-Powered Resume Parser
- **Smart PDF Processing** - Automatically extracts name, email, phone, skills, experience
- **Intelligent Data Extraction** - Parses 40+ technical skills and professional qualities
- **AI Summary Generation** - Creates professional summaries from parsed resume data
- **Zero Manual Entry** - Upload once, fill all profile sections automatically

### 🎯 Advanced Candidate Matching Engine
- **Multi-Dimensional Filtering** - Experience, salary, skills, location, remote work preferences
- **Real-Time Match Scoring** - Dynamic compatibility calculation between candidates and jobs
- **Smart Search Algorithm** - Finds perfect candidates based on multiple criteria simultaneously
- **Comprehensive Database** - 30+ diverse candidate profiles with all possible combinations

### 📱 Seamless User Experience
- **One-Click Actions** - Drag & drop resume upload with instant parsing
- **Guided Workflows** - Step-by-step instructions for complex tasks
- **Real-Time Updates** - Live form validation and auto-fill without page refresh
- **Contextual Help System** - Tips and guidance throughout the interface

### 🔐 Enterprise-Grade Security
- **Role-Based Access Control** - Different experiences for candidates vs recruiters
- **Protected Route System** - Secure access based on user permissions
- **Persistent Authentication** - Maintains login state across sessions
- **Google OAuth Integration** - Social login with enterprise security

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for modern, responsive design
- **React Router DOM** for client-side routing
- **Firebase Authentication** for user management

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Firebase Admin SDK** for backend services
- **Socket.io** for real-time communication
- **Twilio Video** for video calling

### Key Libraries
- **pdf-parse** for resume parsing
- **socket.io-client** for real-time features
- **twilio-video** for video calling
- **firebase** for authentication and database

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project setup
- Twilio account (for video calling)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/hiremenow.git
   cd hiremenow/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   Fill in your Firebase and Twilio credentials

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open [http://localhost:5173](http://localhost:5173) in your browser

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Set up backend environment**
   ```bash
   cp env.example .env
   ```

4. **Start the backend server**
   ```bash
   npm run dev
   ```


## 🎯 Core Components

### Resume Parser (`CandidateProfile.tsx`)
- Handles PDF and TXT file uploads
- Extracts personal information, skills, experience
- Generates AI-powered professional summaries
- Provides manual override options

### Candidate Matching (`CandidateList.tsx`)
- Advanced filtering system
- Real-time search and matching
- Comprehensive candidate database
- Match score calculation

### Authentication (`AuthContext.tsx`)
- Firebase authentication integration
- Role-based access control
- Persistent login state
- Google OAuth support

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project
2. Enable Authentication (Email/Password and Google)
3. Add your Firebase config to `.env`

### Twilio Setup
1. Create a Twilio account
2. Get your Account SID and Auth Token
3. Add credentials to `.env`
4. Run the setup script: `./setup-twilio.sh`

## 📊 Features Overview

| Feature | Status | Description |
|---------|--------|-------------|
| Resume Parsing | ✅ Complete | AI-powered PDF/TXT parsing with auto-fill |
| Candidate Matching | ✅ Complete | Advanced filtering and scoring system |
| Video Calling | ✅ Complete | Twilio-powered video interviews |
| Authentication | ✅ Complete | Firebase auth with role management |
| Real-time Updates | ✅ Complete | Live form updates and notifications |
| Responsive Design | ✅ Complete | Mobile-first responsive UI |

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Backend (Railway/Heroku)
1. Connect your repository
2. Set environment variables
3. Deploy the backend service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Firebase for authentication services
- Twilio for video calling capabilities
- React and TypeScript communities
- Tailwind CSS for the design system

---

**Built with ❤️ by the Pranjal and Arush**