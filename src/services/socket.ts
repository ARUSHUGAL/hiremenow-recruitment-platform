import { connectSocket, getSocket, disconnectSocket } from '../config/socket';

export interface SocketEvents {
  // Client to Server
  find_match: (data?: any) => void;
  join_call: (data: { callId: string; roomId: string }) => void;
  webrtc_offer: (data: any) => void;
  webrtc_answer: (data: any) => void;
  webrtc_ice_candidate: (data: any) => void;
  end_call: (data: { callId: string }) => void;
  recruiter_decision: (data: { callId: string; decision: 'YES' | 'NO' | 'MAYBE'; notes?: string; priority?: string }) => void;
  
  // Server to Client
  match_found: (data: { callId: string; roomId: string; candidate: any; matchScore: number }) => void;
  incoming_call: (data: { callId: string; roomId: string; recruiter: any }) => void;
  call_started: (data: { callId: string; duration: number }) => void;
  call_ended: (data: { callId: string; duration: number }) => void;
  decision_received: (data: { decision: string; notes?: string }) => void;
  no_match_found: (data: { message: string }) => void;
  joined_call: (data: { callId: string; roomId: string }) => void;
  decision_saved: (data: { success: boolean }) => void;
  error: (data: { message: string }) => void;
}

class SocketService {
  private socket: any = null;
  private listeners: Map<string, Function[]> = new Map();

  connect(token: string) {
    this.socket = connectSocket(token);
    this.setupEventListeners();
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    disconnectSocket();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Listen for all events and forward to registered listeners
    const events: (keyof SocketEvents)[] = [
      'match_found', 'incoming_call', 'call_started', 'call_ended',
      'decision_received', 'no_match_found', 'joined_call', 'decision_saved', 'error'
    ];

    events.forEach(event => {
      this.socket.on(event, (data: any) => {
        const listeners = this.listeners.get(event) || [];
        listeners.forEach(listener => listener(data));
      });
    });
  }

  // Event emission
  emit<K extends keyof SocketEvents>(event: K, data?: Parameters<SocketEvents[K]>[0]) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  // Event listening
  on<K extends keyof SocketEvents>(event: K, listener: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(event) || [];
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  // Specific methods for common operations
  findMatch(data?: any) {
    this.emit('find_match', data);
  }

  joinCall(callId: string, roomId: string) {
    this.emit('join_call', { callId, roomId });
  }

  endCall(callId: string) {
    this.emit('end_call', { callId });
  }

  makeDecision(callId: string, decision: 'YES' | 'NO' | 'MAYBE', notes?: string, priority?: string) {
    this.emit('recruiter_decision', { callId, decision, notes, priority });
  }

  // WebRTC methods
  sendOffer(data: any) {
    this.emit('webrtc_offer', data);
  }

  sendAnswer(data: any) {
    this.emit('webrtc_answer', data);
  }

  sendIceCandidate(data: any) {
    this.emit('webrtc_ice_candidate', data);
  }

  // Convenience methods for common listeners
  onMatchFound(callback: (data: any) => void) {
    return this.on('match_found', callback);
  }

  onIncomingCall(callback: (data: any) => void) {
    return this.on('incoming_call', callback);
  }

  onCallStarted(callback: (data: any) => void) {
    return this.on('call_started', callback);
  }

  onCallEnded(callback: (data: any) => void) {
    return this.on('call_ended', callback);
  }

  onDecisionReceived(callback: (data: any) => void) {
    return this.on('decision_received', callback);
  }

  onError(callback: (data: any) => void) {
    return this.on('error', callback);
  }

  isConnected() {
    return this.socket && this.socket.connected;
  }
}

export const socketService = new SocketService();
export default socketService;
