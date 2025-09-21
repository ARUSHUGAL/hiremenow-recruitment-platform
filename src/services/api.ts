import apiClient from '../config/api';

// Types
export interface CandidateProfile {
  name: string;
  email: string;
  skills: string[];
  experience: number;
  location: string;
  bio?: string;
  availability: 'available' | 'busy' | 'unavailable';
  expectedSalary?: number;
  preferredJobTypes: string[];
}

export interface RecruiterProfile {
  company: string;
  position: string;
  bio?: string;
  companySize: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  industry: string;
}

export interface MatchingConstraints {
  hardConstraints: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
  softConstraints: Array<{
    field: string;
    operator: string;
    value: any;
    weight: number;
  }>;
  softConstraintThreshold: number;
}

export interface MatchResult {
  candidate: {
    id: string;
    displayName: string;
    skills: string[];
    experience: number;
    location: string;
    photoURL?: string;
  };
  matchScore: number;
  softConstraintScore: number;
  reasons: string[];
}

// Candidate API
export const candidateAPI = {
  getProfile: () => apiClient.get('/candidates/profile'),
  
  createProfile: (profile: CandidateProfile) => 
    apiClient.post('/candidates/profile', profile),
  
  updateProfile: (profile: Partial<CandidateProfile>) => 
    apiClient.put('/candidates/profile', profile),
  
  updateAvailability: (availability: string) => 
    apiClient.put('/candidates/availability', { availability }),
  
  getCalls: (page = 1, limit = 10) => 
    apiClient.get(`/candidates/calls?page=${page}&limit=${limit}`),
  
  getStats: () => apiClient.get('/candidates/stats'),
};

// Recruiter API
export const recruiterAPI = {
  getProfile: () => apiClient.get('/recruiters/profile'),
  
  createProfile: (profile: RecruiterProfile) => 
    apiClient.post('/recruiters/profile', profile),
  
  updateProfile: (profile: Partial<RecruiterProfile>) => 
    apiClient.put('/recruiters/profile', profile),
  
  updateConstraints: (constraints: MatchingConstraints) => 
    apiClient.put('/recruiters/constraints', constraints),
  
  getConstraints: () => apiClient.get('/recruiters/constraints'),
  
  setActive: (isActive: boolean) => 
    apiClient.put('/recruiters/active', { isActive }),
  
  getCalls: (page = 1, limit = 10) => 
    apiClient.get(`/recruiters/calls?page=${page}&limit=${limit}`),
  
  makeDecision: (callId: string, decision: 'YES' | 'NO' | 'MAYBE', notes?: string, priority?: string) => 
    apiClient.post(`/recruiters/calls/${callId}/decision`, { decision, notes, priority }),
  
  getStats: () => apiClient.get('/recruiters/stats'),
};

// Matching API
export const matchingAPI = {
  findCandidate: () => apiClient.post('/matching/find-candidate'),
  
  getCandidates: (filters?: any) => 
    apiClient.get('/matching/candidates', { params: filters }),
  
  getCandidate: (candidateId: string) => 
    apiClient.get(`/matching/candidates/${candidateId}`),
  
  evaluateCandidate: (candidateId: string) => 
    apiClient.post('/matching/evaluate-candidate', { candidateId }),
  
  getConstraintsTemplate: () => apiClient.get('/matching/constraints-template'),
  
  getStats: () => apiClient.get('/matching/stats'),
};

// Calls API
export const callsAPI = {
  uploadTranscript: (callId: string, audioFile: File) => {
    const formData = new FormData();
    formData.append('audio', audioFile);
    return apiClient.post(`/calls/${callId}/transcript`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  generateSummary: (callId: string) => 
    apiClient.post(`/calls/${callId}/summary`),
  
  getTranscript: (callId: string) => 
    apiClient.get(`/calls/${callId}/transcript`),
  
  getSummary: (callId: string) => 
    apiClient.get(`/calls/${callId}/summary`),
  
  getDetails: (callId: string) => 
    apiClient.get(`/calls/${callId}/details`),
  
  updateStatus: (callId: string, status: string) => 
    apiClient.put(`/calls/${callId}/status`, { status }),
  
  addFeedback: (callId: string, feedback: string, rating?: number) => 
    apiClient.post(`/calls/${callId}/feedback`, { feedback, rating }),
};

// Notifications API
export const notificationsAPI = {
  sendWelcome: (email: string, name: string) => 
    apiClient.post('/notifications/welcome', { email, name }),
  
  getStatus: () => apiClient.get('/notifications/status'),
};
