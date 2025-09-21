import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import AuthModal from "../components/AuthModal";
import TwilioVideoCall from "../components/TwilioVideoCall";
import WebRTCVideoCall from "../components/WebRTCVideoCall";
import ResumeReview from "../components/ResumeReview";
import CandidateVideoCall from "../components/CandidateVideoCall";
import CandidateProfile from "../components/CandidateProfile";
import CandidateStats from "../components/CandidateStats";
import RecruiterFilters from "../components/RecruiterFilters";
import CandidateList from "../components/CandidateList";
// import liveStatusService, { LiveStatus } from "../services/liveStatusService";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showTwilioCall, setShowTwilioCall] = useState(false);
  const [showWebRTCCall, setShowWebRTCCall] = useState(false);
  const [showResumeReview, setShowResumeReview] = useState(false);
  const [pendingCallType, setPendingCallType] = useState<'demo' | 'twilio' | 'webrtc' | null>(null);
  const [userRole, setUserRole] = useState<'recruiter' | 'candidate' | null>(null);
  const [showCandidateCall, setShowCandidateCall] = useState(false);
  const [showCandidateProfile, setShowCandidateProfile] = useState(false);
  const [showCandidateStats, setShowCandidateStats] = useState(false);
  const [showRecruiterFilters, setShowRecruiterFilters] = useState(false);
  const [showCandidateList, setShowCandidateList] = useState(false);
  const [currentFilters, setCurrentFilters] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [transcript, setTranscript] = useState("");
  // const [liveStatus, setLiveStatus] = useState<LiveStatus | null>(null);

  // Start live status polling
  // useEffect(() => {
  //   const unsubscribe = liveStatusService.subscribe((status) => {
  //     setLiveStatus(status);
  //   });

  //   liveStatusService.startPolling(2000); // Poll every 2 seconds

  //   return () => {
  //     unsubscribe();
  //     liveStatusService.stopPolling();
  //   };
  // }, []);

  const questions = [
    "Tell me about your experience with React and Node.js",
    "What's your approach to debugging complex applications?",
    "How do you handle state management in large applications?",
    "Describe a challenging project you've worked on recently",
    "What's your experience with testing frameworks?"
  ];

  const responses = [
    "I've been working with React for 3 years and Node.js for 2 years. I've built several full-stack applications including an e-commerce platform and a real-time chat application.",
    "I usually start by checking the browser console for errors, then use React DevTools to inspect component state and props. For backend issues, I rely on logging and debugging tools.",
    "I prefer using Redux for complex state management, but I also use React Context for simpler cases. I always try to keep state as close to where it's needed as possible.",
    "Recently I built a real-time collaboration tool using WebRTC and Socket.io. The biggest challenge was handling connection drops and reconnection logic.",
    "I'm experienced with Jest and React Testing Library. I write unit tests for components and integration tests for critical user flows."
  ];

  const startVideoCall = () => {
    setShowVideoCall(true);
    setIsCallActive(true);
    setCallDuration(0);
    setCurrentQuestion(0);
    setTranscript("");
    
    // Simulate call timer and conversation progression
    const timer = setInterval(() => {
      setCallDuration(prev => {
        if (prev >= 300) { // 5 minutes
          clearInterval(timer);
          setIsCallActive(false);
          return 300;
        }
        
        // Progress conversation every 30 seconds
        if (prev > 0 && prev % 30 === 0 && prev < 300) {
          setCurrentQuestion(Math.min(Math.floor(prev / 30), questions.length - 1));
        }
        
        // Simulate live transcription
        if (prev > 10 && prev % 5 === 0) {
          const currentResponse = responses[currentQuestion] || "";
          const words = currentResponse.split(" ");
          const wordsToShow = Math.min(Math.floor(prev / 5), words.length);
          setTranscript(words.slice(0, wordsToShow).join(" "));
        }
        
        return prev + 1;
      });
    }, 1000);
  };

  const endVideoCall = () => {
    setShowVideoCall(false);
    setIsCallActive(false);
    setCallDuration(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startCallWithResumeReview = (callType: 'demo' | 'twilio' | 'webrtc') => {
    setPendingCallType(callType);
    setShowResumeReview(true);
  };

  const handleResumeReviewComplete = () => {
    setShowResumeReview(false);
    if (pendingCallType === 'demo') {
      setShowVideoCall(true);
    } else if (pendingCallType === 'twilio') {
      setShowTwilioCall(true);
    } else if (pendingCallType === 'webrtc') {
      setShowWebRTCCall(true);
    }
    setPendingCallType(null);
  };

  const handleResumeReviewSkip = () => {
    setShowResumeReview(false);
    if (pendingCallType === 'demo') {
      setShowVideoCall(true);
    } else if (pendingCallType === 'twilio') {
      setShowTwilioCall(true);
    } else if (pendingCallType === 'webrtc') {
      setShowWebRTCCall(true);
    }
    setPendingCallType(null);
  };

  const handleSkipCandidate = () => {
    setShowResumeReview(false);
    setPendingCallType(null);
    
    // Show candidate rejection message
    alert('❌ Candidate skipped - Moving to next candidate...');
    
    // In a real app, this would:
    // 1. Log the rejection in the backend
    // 2. Find the next matching candidate
    // 3. Start the process again
    console.log('Candidate skipped - would find next candidate');
  };

  const handleApplyFilters = (filters: any) => {
    setCurrentFilters(filters);
    setShowCandidateList(true);
  };

  const handleStartInterview = (candidate: any) => {
    setShowCandidateList(false);
    // Start interview with the selected candidate
    alert(`🎥 Starting interview with ${candidate.name}!\n\nIn a real app, this would:\n1. Connect to the candidate\n2. Start the video call\n3. Begin the interview process`);
  };
  return (
    <div className="min-h-screen text-white p-8" style={{
      background: 'radial-gradient(at center, #703075, #2C1D76)'
    }}>
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-7xl font-black mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            🚀 HireMeNow
          </h1>
          <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto">
            By Arush and Pranjal
          </p>
          
            {/* Role Selection - Simplified */}
            {!isAuthenticated && !userRole && (
              <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-8 text-white/90">Get Started</h2>
                <div className="flex justify-center space-x-6">
                  <button
                    onClick={() => setUserRole('recruiter')}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 px-10 py-5 rounded-2xl text-xl font-bold hover:scale-105 transition-all duration-300 shadow-lg"
                  >
                    👩‍💼 I'm a Recruiter
                  </button>
                  <button
                    onClick={() => setUserRole('candidate')}
                    className="bg-gradient-to-r from-green-500 to-teal-600 px-10 py-5 rounded-2xl text-xl font-bold hover:scale-105 transition-all duration-300 shadow-lg"
                  >
                    👨‍💻 I'm a Candidate
                  </button>
                </div>
                <div className="text-center mt-6">
                  <p className="text-white/60 text-sm">Or sign in if you already have an account</p>
                </div>
              </div>
            )}

          {/* Role-specific Actions */}
          {(userRole || isAuthenticated) && (
            <div className="mb-12">
              <div className="flex justify-center items-center space-x-4 mb-8">
                <div className={`px-6 py-3 rounded-xl text-lg font-semibold ${
                  (userRole === 'recruiter' || user?.role === 'recruiter')
                    ? 'bg-purple-500/20 text-purple-200 border border-purple-400/50' 
                    : 'bg-green-500/20 text-green-200 border border-green-400/50'
                }`}>
                  {isAuthenticated ? (
                    <>
                      {user?.role === 'recruiter' ? '👩‍💼 Recruiter Mode' : '👨‍💻 Candidate Mode'}
                      {user?.isVerified ? ' ✅' : ' ⏳'}
                    </>
                  ) : (
                    userRole === 'recruiter' ? '👩‍💼 Recruiter Mode' : '👨‍💻 Candidate Mode'
                  )}
                </div>
                {!isAuthenticated && (
                  <button
                    onClick={() => setUserRole(null)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors border border-white/20"
                  >
                    Change Role
                  </button>
                )}
              </div>
              
              {(userRole === 'recruiter' || user?.role === 'recruiter') && (
                <div className="space-y-4">
                  {!isAuthenticated && (
                    <div className="text-center mb-6">
                      <p className="text-white/60 text-sm mb-4">Want to save your progress and access exclusive features?</p>
                      <button
                        onClick={() => setShowAuthModal(true)}
                        className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 px-6 py-3 rounded-lg text-sm font-semibold text-white hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300"
                      >
                        👩‍💼 Sign Up as Recruiter
                      </button>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                    <button 
                      onClick={() => {
                        if (!isAuthenticated) {
                          alert('Please sign up to access candidate filtering features!');
                          return;
                        }
                        setShowRecruiterFilters(true);
                      }}
                      className={`px-6 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg ${
                        isAuthenticated 
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-105' 
                          : 'bg-gradient-to-r from-gray-500 to-gray-600 cursor-not-allowed opacity-60'
                      }`}
                    >
                      🔍 Filter Candidates
                    </button>
                    <button 
                      onClick={() => {
                        if (!isAuthenticated) {
                          alert('Please sign up to start video calls!');
                          return;
                        }
                        startCallWithResumeReview('webrtc');
                      }}
                      className={`px-6 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg ${
                        isAuthenticated 
                          ? 'bg-gradient-to-r from-green-500 to-teal-600 hover:scale-105' 
                          : 'bg-gradient-to-r from-gray-500 to-gray-600 cursor-not-allowed opacity-60'
                      }`}
                    >
                      📹 Start Video Call
                    </button>
                  </div>
                </div>
              )}
              
              {(userRole === 'candidate' || user?.role === 'candidate') && (
                <div className="space-y-6">
                  {!isAuthenticated && (
                    <div className="text-center mb-8">
                      <p className="text-white/60 text-sm mb-4">Want to save your progress and access exclusive features?</p>
                      <button
                        onClick={() => setShowAuthModal(true)}
                        className="bg-gradient-to-r from-green-500/20 to-teal-500/20 border border-green-500/50 px-6 py-3 rounded-lg text-sm font-semibold text-white hover:from-green-500/30 hover:to-teal-500/30 transition-all duration-300"
                      >
                        👨‍💻 Sign Up as Candidate
                      </button>
                    </div>
                  )}
                  
                  {/* Primary Action */}
                  <div className="text-center mb-8">
                    <button 
                      onClick={() => {
                        if (!isAuthenticated) {
                          alert('Please sign up to find recruiters!');
                          return;
                        }
                        setShowCandidateCall(true);
                      }}
                      className={`px-12 py-6 rounded-2xl text-2xl font-bold transition-all duration-300 shadow-xl ${
                        isAuthenticated 
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-105 hover:shadow-2xl' 
                          : 'bg-gradient-to-r from-gray-500 to-gray-600 cursor-not-allowed opacity-60'
                      }`}
                    >
                      🎯 Find Recruiters
                    </button>
                    <p className="text-white/70 text-sm mt-3">Connect with recruiters looking for your skills</p>
                  </div>

                  {/* Secondary Actions */}
                  <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                    <button 
                      onClick={() => {
                        if (!isAuthenticated) {
                          alert('Please sign up to update your profile!');
                          return;
                        }
                        setShowCandidateProfile(true);
                      }}
                      className={`px-6 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg ${
                        isAuthenticated 
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:scale-105' 
                          : 'bg-gradient-to-r from-gray-500 to-gray-600 cursor-not-allowed opacity-60'
                      }`}
                    >
                      📝 Update Profile
                    </button>
                    <button 
                      onClick={() => {
                        if (!isAuthenticated) {
                          alert('Please sign up to view your stats!');
                          return;
                        }
                        setShowCandidateStats(true);
                      }}
                      className={`px-6 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg ${
                        isAuthenticated 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:scale-105' 
                          : 'bg-gradient-to-r from-gray-500 to-gray-600 cursor-not-allowed opacity-60'
                      }`}
                    >
                      📊 My Stats
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* How It Works - Simplified */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-white/90">🎯 How It Works</h2>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">1</div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Set Constraints</h3>
                    <p className="text-white/70">Recruiters define AI matching criteria</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">2</div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Build Profiles</h3>
                    <p className="text-white/70">Candidates showcase skills & experience</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">3</div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Instant Matching</h3>
                    <p className="text-white/70">AI connects them for 5-minute calls</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">4</div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">AI Analysis</h3>
                    <p className="text-white/70">Automatic transcription & summaries</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-white/90">✨ Key Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center hover:bg-white/15 transition-all duration-300">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-xl font-bold mb-3">AI Matching</h3>
              <p className="text-white/70">Predicate logic with hard & soft constraints</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center hover:bg-white/15 transition-all duration-300">
              <div className="text-5xl mb-4">📹</div>
              <h3 className="text-xl font-bold mb-3">Video Calls</h3>
              <p className="text-white/70">WebRTC-powered instant connections</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center hover:bg-white/15 transition-all duration-300">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-xl font-bold mb-3">AI Summaries</h3>
              <p className="text-white/70">Automatic transcription & analysis</p>
            </div>
          </div>
        </div>

        {/* Realistic Video Call Modal */}
        {showVideoCall && (
          <div className="fixed inset-0 bg-black z-50">
            {/* Video Call Interface */}
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="bg-black/50 backdrop-blur-lg border-b border-white/20 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="bg-green-500 w-3 h-3 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-bold">LIVE</span>
                  <span className="text-white/80">Duration: {formatTime(callDuration)}</span>
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-bold">Sarah Wilson (TechCorp) ↔ Alex Johnson</h2>
                  <p className="text-white/80 text-sm">Full Stack Developer Interview</p>
                </div>
                <button 
                  onClick={endVideoCall}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-bold transition-colors"
                >
                  End Call
                </button>
              </div>

              {/* Main Video Area */}
              <div className="flex-1 flex">
                {/* Recruiter Video (Large) */}
                <div className="flex-1 bg-gradient-to-br from-purple-900 to-blue-900 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-32 h-32 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-6xl mb-4 mx-auto">
                        👩‍💼
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Sarah Wilson</h3>
                      <p className="text-white/80 mb-4">Senior Recruiter at TechCorp</p>
                      <div className="bg-white/20 rounded-lg p-4 max-w-md mx-auto">
                        <p className="text-sm font-semibold mb-2">Current Question:</p>
                        <p className="text-sm">"{questions[currentQuestion]}"</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Video Controls Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-4">
                    <button className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors">
                      🎤
                    </button>
                    <button className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors">
                      📹
                    </button>
                    <button 
                      onClick={() => setIsCallActive(!isCallActive)}
                      className={`p-3 rounded-full transition-colors ${
                        isCallActive 
                          ? 'bg-yellow-500 hover:bg-yellow-600' 
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      {isCallActive ? '⏸️' : '▶️'}
                    </button>
                    <button className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors">
                      📱
                    </button>
                  </div>
                </div>

                {/* Candidate Video (Small) */}
                <div className="w-80 bg-gradient-to-br from-green-900 to-teal-900 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center text-4xl mb-3 mx-auto">
                        👨‍💻
                      </div>
                      <h3 className="text-lg font-bold mb-1">Alex Johnson</h3>
                      <p className="text-white/80 text-sm mb-3">Full Stack Developer</p>
                      <div className="bg-white/20 rounded-lg p-3 mx-4">
                        <p className="text-xs font-semibold mb-1">Speaking:</p>
                        <p className="text-xs">{transcript || "Listening..."}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Speaking Indicator */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-green-500 w-3 h-3 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Bottom Panel - AI Features */}
              <div className="bg-black/50 backdrop-blur-lg border-t border-white/20 p-4">
                <div className="grid grid-cols-4 gap-4">
                  {/* Live Transcription */}
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">🎤</span>
                      <span className="text-sm font-semibold">Transcription</span>
                    </div>
                    <div className="text-xs text-white/80 h-12 overflow-y-auto">
                      {transcript ? transcript : "Waiting for speech..."}
                    </div>
                  </div>

                  {/* AI Analysis */}
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">🤖</span>
                      <span className="text-sm font-semibold">AI Analysis</span>
                    </div>
                    <div className="text-xs text-white/80">
                      <div className="mb-1">Sentiment: <span className="text-green-400">Positive</span></div>
                      <div className="mb-1">Confidence: <span className="text-blue-400">High</span></div>
                      <div>Skills: React, Node.js</div>
                    </div>
                  </div>

                  {/* Match Score */}
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">📊</span>
                      <span className="text-sm font-semibold">Match Score</span>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">87%</div>
                      <div className="text-xs text-white/80">Compatibility</div>
                    </div>
                  </div>

                  {/* Call Stats */}
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">📈</span>
                      <span className="text-sm font-semibold">Stats</span>
                    </div>
                    <div className="text-xs text-white/80">
                      <div className="mb-1">Questions: {currentQuestion + 1}/5</div>
                      <div className="mb-1">Words: {transcript.split(' ').length}</div>
                      <div>Quality: Excellent</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Twilio Video Call */}
        {showTwilioCall && (
          <TwilioVideoCall
            roomName="hiremenow-demo-room"
            identity="demo-user"
            onCallEnd={() => setShowTwilioCall(false)}
            onCallDecision={(decision) => {
              console.log('Call decision:', decision);
              // Here you would typically send the decision to your backend
              alert(`Decision recorded: ${decision.toUpperCase()}`);
              setShowTwilioCall(false);
            }}
          />
        )}

        {/* WebRTC Video Call */}
        {showWebRTCCall && (
          <WebRTCVideoCall
            roomName="hiremenow-webrtc-room"
            identity={`user-${Math.random().toString(36).substr(2, 9)}`}
            onCallEnd={() => setShowWebRTCCall(false)}
            onCallDecision={(decision) => {
              console.log('WebRTC Call decision:', decision);
              alert(`Decision recorded: ${decision.toUpperCase()}`);
              setShowWebRTCCall(false);
            }}
          />
        )}

        {/* Resume Review */}
        {showResumeReview && (
          <ResumeReview
            onComplete={handleResumeReviewComplete}
            onSkip={handleResumeReviewSkip}
            onSkipCandidate={handleSkipCandidate}
          />
        )}

        {/* Candidate Video Call */}
        {showCandidateCall && (
          <CandidateVideoCall
            onCallEnd={() => setShowCandidateCall(false)}
          />
        )}

        {/* Candidate Profile */}
        {showCandidateProfile && (
          <CandidateProfile
            onClose={() => setShowCandidateProfile(false)}
          />
        )}

        {/* Candidate Stats */}
        {showCandidateStats && (
          <CandidateStats
            onClose={() => setShowCandidateStats(false)}
          />
        )}

        {/* Recruiter Filters */}
        {showRecruiterFilters && (
          <RecruiterFilters
            onClose={() => setShowRecruiterFilters(false)}
            onApplyFilters={handleApplyFilters}
          />
        )}

        {/* Candidate List */}
        {showCandidateList && currentFilters && (
          <CandidateList
            filters={currentFilters}
            onClose={() => setShowCandidateList(false)}
            onStartInterview={handleStartInterview}
          />
        )}
        </div>

        {/* Auth Modal */}
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
        />
      </div>
    );
  }