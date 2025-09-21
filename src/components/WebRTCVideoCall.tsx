import { useState, useEffect, useRef } from 'react';
import webrtcService from '../services/webrtcService';

interface WebRTCVideoCallProps {
  roomName: string;
  identity: string;
  onCallEnd: () => void;
  onCallDecision?: (decision: 'yes' | 'no' | 'maybe') => void;
}

export default function WebRTCVideoCall({ roomName, identity, onCallEnd, onCallDecision }: WebRTCVideoCallProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [remoteUser, setRemoteUser] = useState<string>('Waiting for connection...');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Ensure video elements are available before joining
    const setupCall = async () => {
      if (localVideoRef.current && remoteVideoRef.current) {
        await joinRoom();
      } else {
        // Retry after a short delay
        setTimeout(setupCall, 100);
      }
    };
    
    setupCall();
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      webrtcService.leaveRoom();
    };
  }, []);

  const joinRoom = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      console.log('🔄 Starting WebRTC call...');
      
      // Set video element references
      if (localVideoRef.current && remoteVideoRef.current) {
        webrtcService.setVideoElements(localVideoRef.current, remoteVideoRef.current);
        console.log('📹 Video elements passed to WebRTC service');
      } else {
        console.warn('⚠️ Video refs not ready:', { 
          local: !!localVideoRef.current, 
          remote: !!remoteVideoRef.current 
        });
      }

      // Join room and establish connection
      const callState = await webrtcService.joinRoom(roomName, identity);
      
      if (callState.error) {
        setError(callState.error);
        setIsConnecting(false);
        return;
      }

      setIsConnected(true);
      setIsConnecting(false);
      setRemoteUser('Connected user');
      
      // Start call timer
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      // Monitor connection state
      const checkConnection = setInterval(() => {
        const state = webrtcService.getCallState();
        setIsConnected(state.isConnected);
        setIsMuted(state.isMuted);
        setIsVideoOn(state.isVideoOn);
        
        if (state.error) {
          setError(state.error);
        }
      }, 1000);

      // Cleanup interval on unmount
      return () => clearInterval(checkConnection);
      
    } catch (err) {
      console.error('❌ Error in joinRoom:', err);
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setError('Camera and microphone access denied. Please allow access and try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to join room');
      }
      setIsConnecting(false);
    }
  };

  const toggleMute = async () => {
    const newMuteState = await webrtcService.toggleMicrophone();
    setIsMuted(!newMuteState);
  };

  const toggleVideo = async () => {
    const newVideoState = await webrtcService.toggleCamera();
    setIsVideoOn(newVideoState);
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      await webrtcService.stopScreenShare();
      setIsScreenSharing(false);
    } else {
      await webrtcService.shareScreen();
      setIsScreenSharing(true);
    }
  };

  const endCall = async () => {
    console.log('📞 Ending call...');
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    await webrtcService.leaveRoom();
    console.log('🚪 Left WebRTC room');
    
    // Always show decision modal if callback provided
    if (onCallDecision) {
      console.log('🤔 Showing decision modal...');
      setShowDecisionModal(true);
    } else {
      console.log('❌ No decision callback provided, ending call directly');
      onCallEnd();
    }
  };

  const handleDecision = (decision: 'yes' | 'no' | 'maybe') => {
    console.log('🎯 Decision made:', decision);
    if (onCallDecision) {
      onCallDecision(decision);
    }
    setShowDecisionModal(false);
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
          <h2 className="text-2xl font-bold mb-2">Connecting to Video Call...</h2>
          <p className="text-white/80">Room: {roomName}</p>
          <p className="text-white/80 mt-2">Requesting camera access...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-4">Connection Failed</h2>
          <p className="text-white/80 mb-6">{error}</p>
          <div className="space-x-4">
            <button 
              onClick={joinRoom}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold transition-colors"
            >
              Try Again
            </button>
            <button 
              onClick={onCallEnd}
              className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-bold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Decision Modal */}
      {showDecisionModal && (
        <div className="fixed inset-0 bg-black/80 z-60 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
            <div className="text-6xl mb-4">🤔</div>
            <h2 className="text-2xl font-bold mb-4">Call Complete!</h2>
            <p className="text-gray-600 mb-6">
              Duration: {formatTime(callDuration)}<br/>
              What's your decision about this candidate?
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => handleDecision('yes')}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-bold transition-colors"
              >
                ✅ YES - Move Forward
              </button>
              <button 
                onClick={() => handleDecision('maybe')}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-6 rounded-lg font-bold transition-colors"
              >
                🤔 MAYBE - Keep in Mind
              </button>
              <button 
                onClick={() => handleDecision('no')}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-bold transition-colors"
              >
                ❌ NO - Not a Fit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-black/50 backdrop-blur-lg border-b border-white/20 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className={`w-3 h-3 rounded-full animate-pulse ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className={`font-bold ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
            {isConnected ? 'CONNECTED' : 'CONNECTING'}
          </span>
          <span className="text-white/80">Duration: {formatTime(callDuration)}</span>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold">WebRTC Video Call</h2>
          <p className="text-white/80 text-sm">Room: {roomName}</p>
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
        {/* Remote Video (Main) */}
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
                👤
              </div>
              <h3 className="text-2xl font-bold mb-2">{remoteUser}</h3>
              <p className="text-white/80">Remote Participant</p>
            </div>
          </div>
        </div>

        {/* Local Video (Small) */}
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
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center text-4xl mb-3 mx-auto">
                👨‍💻
              </div>
              <h3 className="text-lg font-bold mb-1">You</h3>
              <p className="text-white/80 text-sm">{identity}</p>
            </div>
          </div>
          
          {/* Speaking Indicator */}
          <div className="absolute top-4 right-4">
            <div className={`w-3 h-3 rounded-full animate-pulse ${!isMuted ? 'bg-green-500' : 'bg-red-500'}`}></div>
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
            onClick={toggleScreenShare}
            className={`p-4 rounded-full transition-colors ${
              isScreenSharing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-white/20 hover:bg-white/30'
            }`}
            title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          >
            📱
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
    </div>
  );
}
