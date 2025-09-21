import { io, Socket } from 'socket.io-client';

export interface WebRTCCall {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  peerConnection: RTCPeerConnection | null;
  socket: Socket | null;
  isConnected: boolean;
  isMuted: boolean;
  isVideoOn: boolean;
  error: string | null;
}

class WebRTCService {
  private callState: WebRTCCall = {
    localStream: null,
    remoteStream: null,
    peerConnection: null,
    socket: null,
    isConnected: false,
    isMuted: false,
    isVideoOn: true,
    error: null
  };

  private localVideoRef: HTMLVideoElement | null = null;
  private remoteVideoRef: HTMLVideoElement | null = null;

  // WebRTC configuration
  private rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // Set video element references
  setVideoElements(localVideo: HTMLVideoElement, remoteVideo: HTMLVideoElement) {
    this.localVideoRef = localVideo;
    this.remoteVideoRef = remoteVideo;
    console.log('📹 Video elements set:', { localVideo, remoteVideo });
  }

  // Initialize local media stream
  async initializeLocalStream(): Promise<MediaStream> {
    try {
      console.log('🎥 Requesting camera and microphone access...');
      
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
      this.callState.localStream = stream;

      // Attach to local video element
      if (this.localVideoRef) {
        this.localVideoRef.srcObject = stream;
        this.localVideoRef.muted = true; // Mute local video to prevent echo
        this.localVideoRef.autoplay = true;
        this.localVideoRef.playsInline = true;
        console.log('📹 Local stream attached to video element');
        
        // Force play with error handling
        try {
          await this.localVideoRef.play();
          console.log('✅ Local video playing successfully');
        } catch (playError) {
          console.warn('⚠️ Autoplay failed, user interaction required:', playError);
        }
      } else {
        console.warn('⚠️ Local video ref not set');
      }

      return stream;
    } catch (error) {
      console.error('❌ Error accessing camera:', error);
      this.callState.error = error instanceof Error ? error.message : 'Camera access failed';
      throw error;
    }
  }

  // Create peer connection
  private createPeerConnection(): RTCPeerConnection {
    const peerConnection = new RTCPeerConnection(this.rtcConfig);

    // Add local stream tracks
    if (this.callState.localStream) {
      this.callState.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.callState.localStream!);
      });
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log('📹 Remote stream received');
      const remoteStream = event.streams[0];
      this.callState.remoteStream = remoteStream;
      
      if (this.remoteVideoRef) {
        this.remoteVideoRef.srcObject = remoteStream;
        this.remoteVideoRef.autoplay = true;
        this.remoteVideoRef.playsInline = true;
        console.log('📹 Remote stream attached to video element');
        
        // Force play with error handling
        try {
          this.remoteVideoRef.play().then(() => {
            console.log('✅ Remote video playing successfully');
          }).catch(playError => {
            console.warn('⚠️ Remote video autoplay failed:', playError);
          });
        } catch (error) {
          console.warn('⚠️ Remote video play error:', error);
        }
      } else {
        console.warn('⚠️ Remote video ref not set');
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.callState.socket) {
        console.log('🧊 Sending ICE candidate');
        this.callState.socket.emit('ice-candidate', event.candidate);
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log('🔗 Connection state:', peerConnection.connectionState);
      this.callState.isConnected = peerConnection.connectionState === 'connected';
    };

    return peerConnection;
  }

  // Join a room (like Omegle matching)
  async joinRoom(roomName: string, identity: string): Promise<WebRTCCall> {
    try {
      console.log('🔄 Joining room:', roomName);

      // Initialize local stream first
      await this.initializeLocalStream();

      // Create socket connection
      this.callState.socket = io('http://localhost:3001', {
        transports: ['websocket']
      });

      // Create peer connection
      this.callState.peerConnection = this.createPeerConnection();

      // Socket event handlers
      this.callState.socket.on('connect', () => {
        console.log('🔌 Connected to signaling server');
        this.callState.socket!.emit('join-room', { roomName, identity });
      });

      this.callState.socket.on('user-joined', async (data) => {
        console.log('👤 User joined:', data.identity);
        await this.createOffer();
      });

      this.callState.socket.on('offer', async (offer) => {
        console.log('📞 Received offer');
        await this.handleOffer(offer);
      });

      this.callState.socket.on('answer', async (answer) => {
        console.log('📞 Received answer');
        await this.handleAnswer(answer);
      });

      this.callState.socket.on('ice-candidate', async (candidate) => {
        console.log('🧊 Received ICE candidate');
        await this.handleIceCandidate(candidate);
      });

      this.callState.socket.on('user-left', () => {
        console.log('👋 User left');
        this.callState.isConnected = false;
      });

      return this.callState;
    } catch (error) {
      console.error('❌ Error joining room:', error);
      this.callState.error = error instanceof Error ? error.message : 'Failed to join room';
      return this.callState;
    }
  }

  // Create and send offer
  private async createOffer() {
    if (!this.callState.peerConnection || !this.callState.socket) return;

    try {
      const offer = await this.callState.peerConnection.createOffer();
      await this.callState.peerConnection.setLocalDescription(offer);
      
      console.log('📞 Sending offer');
      this.callState.socket.emit('offer', offer);
    } catch (error) {
      console.error('❌ Error creating offer:', error);
    }
  }

  // Handle incoming offer
  private async handleOffer(offer: RTCSessionDescriptionInit) {
    if (!this.callState.peerConnection || !this.callState.socket) return;

    try {
      await this.callState.peerConnection.setRemoteDescription(offer);
      const answer = await this.callState.peerConnection.createAnswer();
      await this.callState.peerConnection.setLocalDescription(answer);
      
      console.log('📞 Sending answer');
      this.callState.socket.emit('answer', answer);
    } catch (error) {
      console.error('❌ Error handling offer:', error);
    }
  }

  // Handle incoming answer
  private async handleAnswer(answer: RTCSessionDescriptionInit) {
    if (!this.callState.peerConnection) return;

    try {
      await this.callState.peerConnection.setRemoteDescription(answer);
      console.log('✅ Answer processed');
    } catch (error) {
      console.error('❌ Error handling answer:', error);
    }
  }

  // Handle ICE candidate
  private async handleIceCandidate(candidate: RTCIceCandidateInit) {
    if (!this.callState.peerConnection) return;

    try {
      await this.callState.peerConnection.addIceCandidate(candidate);
      console.log('🧊 ICE candidate processed');
    } catch (error) {
      console.error('❌ Error handling ICE candidate:', error);
    }
  }

  // Toggle microphone
  async toggleMicrophone(): Promise<boolean> {
    if (!this.callState.localStream) return false;

    const audioTrack = this.callState.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      this.callState.isMuted = !audioTrack.enabled;
      console.log('🎤 Microphone:', audioTrack.enabled ? 'ON' : 'OFF');
      return audioTrack.enabled;
    }
    return false;
  }

  // Toggle camera
  async toggleCamera(): Promise<boolean> {
    if (!this.callState.localStream) return false;

    const videoTrack = this.callState.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      this.callState.isVideoOn = videoTrack.enabled;
      console.log('📹 Camera:', videoTrack.enabled ? 'ON' : 'OFF');
      return videoTrack.enabled;
    }
    return false;
  }

  // Share screen
  async shareScreen(): Promise<void> {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      // Replace video track with screen share
      if (this.callState.localStream && this.callState.peerConnection) {
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = this.callState.peerConnection.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }

        // Update local video element
        if (this.localVideoRef) {
          this.localVideoRef.srcObject = screenStream;
        }
      }

      console.log('📱 Screen sharing started');
    } catch (error) {
      console.error('❌ Error sharing screen:', error);
    }
  }

  // Stop screen sharing
  async stopScreenShare(): Promise<void> {
    // Restore original camera stream
    if (this.callState.localStream && this.localVideoRef) {
      this.localVideoRef.srcObject = this.callState.localStream;
    }
    console.log('📱 Screen sharing stopped');
  }

  // Leave room
  async leaveRoom(): Promise<void> {
    console.log('🚪 Leaving room...');

    // Stop local stream
    if (this.callState.localStream) {
      this.callState.localStream.getTracks().forEach(track => track.stop());
    }

    // Close peer connection
    if (this.callState.peerConnection) {
      this.callState.peerConnection.close();
    }

    // Disconnect socket
    if (this.callState.socket) {
      this.callState.socket.disconnect();
    }

    // Reset state
    this.callState = {
      localStream: null,
      remoteStream: null,
      peerConnection: null,
      socket: null,
      isConnected: false,
      isMuted: false,
      isVideoOn: true,
      error: null
    };

    console.log('✅ Left room');
  }

  // Get current call state
  getCallState(): WebRTCCall {
    return this.callState;
  }
}

export const webrtcService = new WebRTCService();
export default webrtcService;
