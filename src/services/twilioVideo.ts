import { connect, Room, LocalParticipant, RemoteParticipant, LocalTrack, RemoteTrack } from 'twilio-video';

export interface TwilioVideoCall {
  room: Room | null;
  localParticipant: LocalParticipant | null;
  remoteParticipants: Map<string, RemoteParticipant>;
  isConnected: boolean;
  error: string | null;
}

class TwilioVideoService {
  private accessToken: string = '';
  private roomName: string = '';
  private callState: TwilioVideoCall = {
    room: null,
    localParticipant: null,
    remoteParticipants: new Map(),
    isConnected: false,
    error: null
  };

  // Set Twilio credentials (in production, get these from your backend)
  setCredentials(accountSid: string, authToken: string, apiKey: string, apiSecret: string) {
    // In production, you'd generate access tokens on your backend
    // For demo purposes, we'll use mock credentials
    this.accessToken = 'demo-access-token';
  }

  // Generate access token from backend
  async generateAccessToken(identity: string, roomName: string): Promise<string> {
    try {
      console.log('🔄 Requesting Twilio token from backend...');
      const response = await fetch('http://localhost:3001/api/video/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomName, identity })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Token received from backend:', data);
      this.roomName = roomName;
      return data.data.token;
    } catch (error) {
      console.error('❌ Error generating access token:', error);
      // Fallback to demo token for development
      this.roomName = roomName;
      return 'demo-access-token';
    }
  }

  // Join a video room
  async joinRoom(roomName: string, identity: string): Promise<TwilioVideoCall> {
    try {
      const token = await this.generateAccessToken(identity, roomName);
      
      // Check if we have a real Twilio token or demo token
      if (token === 'demo-access-token') {
        // Demo mode - simulate joining
        this.callState = {
          room: null,
          localParticipant: null,
          remoteParticipants: new Map(),
          isConnected: true,
          error: null
        };
        return this.callState;
      }

      // Real Twilio Video connection
      const room = await connect(token, {
        name: roomName,
        audio: true,
        video: { width: 640, height: 480 }
      });

      // Set up room event listeners
      room.on('participantConnected', (participant) => {
        console.log('Participant connected:', participant.identity);
        this.callState.remoteParticipants.set(participant.sid, participant);
      });

      room.on('participantDisconnected', (participant) => {
        console.log('Participant disconnected:', participant.identity);
        this.callState.remoteParticipants.delete(participant.sid);
      });

      room.on('disconnected', () => {
        console.log('Room disconnected');
        this.callState.isConnected = false;
      });

      this.callState = {
        room: room,
        localParticipant: room.localParticipant,
        remoteParticipants: room.participants,
        isConnected: true,
        error: null
      };
      
      return this.callState;
    } catch (error) {
      console.error('Error joining room:', error);
      this.callState.error = error instanceof Error ? error.message : 'Unknown error';
      this.callState.isConnected = false;
      return this.callState;
    }
  }

  // Leave the current room
  async leaveRoom(): Promise<void> {
    if (this.callState.room) {
      await this.callState.room.disconnect();
      this.callState = {
        room: null,
        localParticipant: null,
        remoteParticipants: new Map(),
        isConnected: false,
        error: null
      };
    }
  }

  // Get current call state
  getCallState(): TwilioVideoCall {
    return this.callState;
  }

  // Enable/disable camera
  async toggleCamera(): Promise<boolean> {
    if (this.callState.localParticipant) {
      const videoTracks = Array.from(this.callState.localParticipant.videoTracks.values());
      if (videoTracks.length > 0) {
        const videoTrack = videoTracks[0].track;
        if (videoTrack.isEnabled) {
          videoTrack.disable();
          return false;
        } else {
          videoTrack.enable();
          return true;
        }
      }
    }
    return true;
  }

  // Enable/disable microphone
  async toggleMicrophone(): Promise<boolean> {
    if (this.callState.localParticipant) {
      const audioTracks = Array.from(this.callState.localParticipant.audioTracks.values());
      if (audioTracks.length > 0) {
        const audioTrack = audioTracks[0].track;
        if (audioTrack.isEnabled) {
          audioTrack.disable();
          return false;
        } else {
          audioTrack.enable();
          return true;
        }
      }
    }
    return true;
  }

  // Share screen
  async shareScreen(): Promise<void> {
    // In production: start screen sharing
  }

  // Stop screen sharing
  async stopScreenShare(): Promise<void> {
    // In production: stop screen sharing
  }

  // Get local video element (for demo, return mock)
  getLocalVideoElement(): HTMLVideoElement | null {
    // In production: return actual video element
    return null;
  }

  // Get remote video elements (for demo, return mock)
  getRemoteVideoElements(): Map<string, HTMLVideoElement> {
    // In production: return actual video elements
    return new Map();
  }
}

export const twilioVideoService = new TwilioVideoService();
export default twilioVideoService;
