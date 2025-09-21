import { useState, useEffect, useRef } from 'react';

interface CandidateVideoCallProps {
  onCallEnd: () => void;
}

export default function CandidateVideoCall({ onCallEnd }: CandidateVideoCallProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [recruiterInfo, setRecruiterInfo] = useState({
    name: "Sarah Wilson",
    company: "TechCorp",
    position: "Senior Recruiter"
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [transcript, setTranscript] = useState("");
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    // Simulate connecting to recruiter
    const connectTimer = setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      
      // Start call timer
      timerRef.current = setInterval(() => {
        setCallDuration(prev => {
          if (prev >= 300) { // 5 minutes
            clearInterval(timerRef.current!);
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
    }, 2000);

    // Initialize camera
    initializeCamera();

    return () => {
      clearTimeout(connectTimer);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const initializeCamera = async () => {
    try {
      console.log('🎥 Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      console.log('✅ Camera access granted!', stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
        localVideoRef.current.autoplay = true;
        localVideoRef.current.playsInline = true;
        
        try {
          await localVideoRef.current.play();
          console.log('✅ Local video playing successfully');
        } catch (playError) {
          console.warn('⚠️ Autoplay failed:', playError);
        }
      }
    } catch (error) {
      console.error('❌ Camera access failed:', error);
      alert('Camera access denied. Please allow camera access to continue.');
    }
  };

  const toggleMute = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        console.log('🎤 Microphone:', audioTrack.enabled ? 'ON' : 'OFF');
      }
    }
  };

  const toggleVideo = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
        console.log('📹 Camera:', videoTrack.enabled ? 'ON' : 'OFF');
      }
    }
  };

  const endCall = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    onCallEnd();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isConnecting) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Connecting to Recruiter...</h2>
          <p className="text-white/80">Finding matching recruiters...</p>
          <div className="mt-4 text-sm text-white/60">
            <p>✅ Profile visible to recruiters</p>
            <p>✅ AI matching in progress</p>
            <p>🔄 Connecting to {recruiterInfo.name}...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-lg border-b border-white/20 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="bg-green-500 w-3 h-3 rounded-full animate-pulse"></div>
          <span className="text-green-400 font-bold">CONNECTED</span>
          <span className="text-white/80">Duration: {formatTime(callDuration)}</span>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold">Interview with {recruiterInfo.name}</h2>
          <p className="text-white/80 text-sm">{recruiterInfo.position} at {recruiterInfo.company}</p>
        </div>
        <button 
          onClick={endCall}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-bold transition-colors"
        >
          End Call
        </button>
      </div>

      {/* Video Area */}
      <div className="flex-1 flex h-[calc(100vh-140px)]">
        {/* Recruiter Video (Main) */}
        <div className="flex-1 bg-gradient-to-br from-purple-900 to-blue-900 relative">
          <video 
            ref={remoteVideoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            controls={false}
            style={{ backgroundColor: '#1a1a1a' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-6xl mb-4 mx-auto">
                👩‍💼
              </div>
              <h3 className="text-2xl font-bold mb-2">{recruiterInfo.name}</h3>
              <p className="text-white/80 mb-4">{recruiterInfo.position} at {recruiterInfo.company}</p>
              <div className="bg-white/20 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm font-semibold mb-2">Current Question:</p>
                <p className="text-sm">"{questions[currentQuestion]}"</p>
              </div>
            </div>
          </div>
        </div>

        {/* Candidate Video (Small) */}
        <div className="w-80 bg-gradient-to-br from-green-900 to-teal-900 relative">
          <video 
            ref={localVideoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
            controls={false}
            style={{ backgroundColor: '#1a1a1a' }}
          />
          
          {/* Overlay with your info */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-3">
            <div className="text-center">
              <h3 className="text-lg font-bold mb-1 text-white">You</h3>
              <p className="text-white/80 text-sm mb-2">Candidate</p>
              <div className="bg-white/20 rounded-lg p-2">
                <p className="text-xs font-semibold mb-1 text-white">Speaking:</p>
                <p className="text-xs text-white/90">{transcript || "Listening..."}</p>
              </div>
            </div>
          </div>
          
          {/* Speaking Indicator */}
          <div className="absolute top-4 right-4">
            <div className={`w-3 h-3 rounded-full animate-pulse ${!isMuted ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
          
          {/* Camera status indicator */}
          <div className="absolute top-4 left-4">
            <div className={`w-3 h-3 rounded-full ${isVideoOn ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-black/50 backdrop-blur-lg border-t border-white/20 p-4">
        <div className="flex justify-center space-x-4">
          <button 
            onClick={toggleMute}
            className={`p-4 rounded-full transition-colors ${
              isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-white/20 hover:bg-white/30'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? '🔇' : '🎤'}
          </button>
          
          <button 
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-colors ${
              !isVideoOn ? 'bg-red-600 hover:bg-red-700' : 'bg-white/20 hover:bg-white/30'
            }`}
            title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoOn ? '📹' : '📷'}
          </button>
          
          <button 
            onClick={endCall}
            className="bg-red-600 hover:bg-red-700 p-4 rounded-full transition-colors"
            title="End call"
          >
            📞
          </button>
        </div>
      </div>

      {/* Bottom Panel - Candidate Info */}
      <div className="bg-black/50 backdrop-blur-lg border-t border-white/20 p-4">
        <div className="grid grid-cols-4 gap-4">
          {/* Live Transcription */}
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">🎤</span>
              <span className="text-sm font-semibold">Your Response</span>
            </div>
            <div className="text-xs text-white/80 h-12 overflow-y-auto">
              {transcript ? transcript : "Waiting for your turn to speak..."}
            </div>
          </div>

          {/* Interview Tips */}
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">💡</span>
              <span className="text-sm font-semibold">Tips</span>
            </div>
            <div className="text-xs text-white/80">
              <div className="mb-1">• Be specific with examples</div>
              <div className="mb-1">• Ask clarifying questions</div>
              <div>• Show enthusiasm</div>
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
              <div>Engagement: High</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
