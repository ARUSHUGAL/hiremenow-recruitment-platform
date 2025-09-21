export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'candidate' | 'recruiter';
  createdAt: Date;
  updatedAt: Date;
}

export interface Candidate extends User {
  role: 'candidate';
  skills: string[];
  experience: number; // years of experience
  location: string;
  bio?: string;
  resumeUrl?: string;
  availability: 'available' | 'busy' | 'unavailable';
  expectedSalary?: number;
  preferredJobTypes: string[];
  isOnline: boolean;
  lastSeen: Date;
}

export interface Recruiter extends User {
  role: 'recruiter';
  company: string;
  position: string;
  bio?: string;
  companySize: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  industry: string;
  isOnline: boolean;
  lastSeen: Date;
}

// Predicate logic constraints for matching
export interface MatchingConstraints {
  hardConstraints: HardConstraint[];
  softConstraints: SoftConstraint[];
  softConstraintThreshold: number; // minimum score to pass soft constraints
}

export interface HardConstraint {
  field: string; // 'skills', 'experience', 'location', etc.
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

export interface SoftConstraint {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  weight: number; // scoring weight (0-1)
}

export interface RecruiterProfile extends Recruiter {
  matchingConstraints: MatchingConstraints;
  isActive: boolean; // actively looking for candidates
}

export interface VideoCall {
  id: string;
  candidateId: string;
  recruiterId: string;
  roomId: string;
  status: 'waiting' | 'active' | 'ended' | 'expired';
  startTime?: Date;
  endTime?: Date;
  duration?: number; // in seconds
  transcript?: string;
  aiSummary?: CallSummary;
  recruiterDecision?: RecruiterDecision;
  createdAt: Date;
}

export interface CallSummary {
  candidateStrengths: string[];
  candidateWeaknesses: string[];
  keySkills: string[];
  communicationScore: number; // 1-10
  technicalScore: number; // 1-10
  culturalFitScore: number; // 1-10
  overallScore: number; // 1-10
  summary: string;
  recommendations: string[];
}

export interface RecruiterDecision {
  decision: 'YES' | 'NO' | 'MAYBE';
  notes?: string;
  priority?: 'high' | 'medium' | 'low'; // for MAYBE decisions
  nextSteps?: string[];
  timestamp: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams extends PaginationParams {
  query?: string;
  location?: string;
  skills?: string[];
  experienceLevel?: string;
  jobType?: string;
  salaryMin?: number;
  salaryMax?: number;
}
