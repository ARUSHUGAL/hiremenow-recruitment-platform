export interface LiveStatus {
  totalActiveCalls: number;
  totalParticipants: number;
  activeCalls: ActiveCall[];
  lastUpdated: string;
}

export interface ActiveCall {
  roomName: string;
  participantCount: number;
  duration: number;
  participants: Participant[];
}

export interface Participant {
  identity: string;
  joinedAt: string;
}

class LiveStatusService {
  private status: LiveStatus | null = null;
  private updateInterval: NodeJS.Timeout | null = null;
  private listeners: ((status: LiveStatus) => void)[] = [];

  // Start polling for live status updates
  startPolling(intervalMs: number = 2000) {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(async () => {
      await this.fetchStatus();
    }, intervalMs);

    // Fetch initial status
    this.fetchStatus();
  }

  // Stop polling
  stopPolling() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // Fetch live status from backend
  async fetchStatus(): Promise<LiveStatus | null> {
    try {
      const response = await fetch('http://localhost:3001/api/live-status');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.status = data.data;
      
      // Notify all listeners
      this.listeners.forEach(listener => {
        listener(this.status!);
      });

      return this.status;
    } catch (error) {
      console.error('❌ Error fetching live status:', error);
      return null;
    }
  }

  // Subscribe to status updates
  subscribe(listener: (status: LiveStatus) => void) {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Get current status
  getCurrentStatus(): LiveStatus | null {
    return this.status;
  }

  // Format duration in human readable format
  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  }

  // Get status summary text
  getStatusSummary(): string {
    if (!this.status) {
      return 'Loading...';
    }

    const { totalActiveCalls, totalParticipants } = this.status;
    
    if (totalActiveCalls === 0) {
      return 'No active calls';
    }
    
    if (totalActiveCalls === 1) {
      return `${totalParticipants} people in 1 call`;
    }
    
    return `${totalParticipants} people in ${totalActiveCalls} calls`;
  }
}

export const liveStatusService = new LiveStatusService();
export default liveStatusService;