import socketService from './socket';

export interface WebRTCConfig {
  localVideo: HTMLVideoElement;
  remoteVideo: HTMLVideoElement;
  roomId: string;
}

class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private config: WebRTCConfig | null = null;

  async initialize(config: WebRTCConfig) {
    this.config = config;
    
    // Get user media
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      if (config.localVideo) {
        config.localVideo.srcObject = this.localStream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }

    // Setup peer connection
    this.setupPeerConnection();
    
    // Setup socket listeners
    this.setupSocketListeners();
  }

  private setupPeerConnection() {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    this.peerConnection = new RTCPeerConnection(configuration);

    // Add local stream to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });
    }

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      if (this.config?.remoteVideo) {
        this.config.remoteVideo.srcObject = event.streams[0];
      }
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socketService.sendIceCandidate({
          roomId: this.config?.roomId,
          candidate: event.candidate
        });
      }
    };
  }

  private setupSocketListeners() {
    // Handle incoming offer
    socketService.on('webrtc_offer', async (data) => {
      if (data.roomId === this.config?.roomId && this.peerConnection) {
        try {
          await this.peerConnection.setRemoteDescription(data.offer);
          const answer = await this.peerConnection.createAnswer();
          await this.peerConnection.setLocalDescription(answer);
          
          socketService.sendAnswer({
            roomId: this.config?.roomId,
            answer: answer
          });
        } catch (error) {
          console.error('Error handling offer:', error);
        }
      }
    });

    // Handle incoming answer
    socketService.on('webrtc_answer', async (data) => {
      if (data.roomId === this.config?.roomId && this.peerConnection) {
        try {
          await this.peerConnection.setRemoteDescription(data.answer);
        } catch (error) {
          console.error('Error handling answer:', error);
        }
      }
    });

    // Handle ICE candidates
    socketService.on('webrtc_ice_candidate', async (data) => {
      if (data.roomId === this.config?.roomId && this.peerConnection) {
        try {
          await this.peerConnection.addIceCandidate(data.candidate);
        } catch (error) {
          console.error('Error handling ICE candidate:', error);
        }
      }
    });
  }

  async createOffer() {
    if (!this.peerConnection) return;

    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      
      socketService.sendOffer({
        roomId: this.config?.roomId,
        offer: offer
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }

  async endCall() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.config?.localVideo) {
      this.config.localVideo.srcObject = null;
    }

    if (this.config?.remoteVideo) {
      this.config.remoteVideo.srcObject = null;
    }
  }

  // Audio/Video controls
  toggleAudio() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  }

  toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  }

  isAudioEnabled() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      return audioTrack ? audioTrack.enabled : false;
    }
    return false;
  }

  isVideoEnabled() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      return videoTrack ? videoTrack.enabled : false;
    }
    return false;
  }
}

export const webrtcService = new WebRTCService();
export default webrtcService;
