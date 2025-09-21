export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'recruiter' | 'candidate';
  companyId?: string; // For recruiters
  linkedinProfile?: string; // For candidates
  isVerified: boolean;
  createdAt: Date;
}

export interface RecruiterSignupData {
  email: string;
  password: string;
  displayName: string;
  companyId: string;
  companyName: string;
}

export interface CandidateSignupData {
  email: string;
  password: string;
  displayName: string;
  linkedinProfile: string;
}
