// Mock data for demo purposes
export const mockCandidates = [
  {
    id: 'candidate-1',
    displayName: 'Alex Johnson',
    email: 'alex@example.com',
    skills: ['JavaScript', 'React', 'Node.js', 'Python'],
    experience: 3,
    location: 'San Francisco, CA',
    bio: 'Full-stack developer with 3 years of experience building scalable web applications.',
    availability: 'available',
    expectedSalary: 120000,
    preferredJobTypes: ['full-time', 'remote'],
    photoURL: '👨‍💻',
    isOnline: true,
    lastSeen: new Date(),
  },
  {
    id: 'candidate-2',
    displayName: 'Sarah Chen',
    email: 'sarah@example.com',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL'],
    experience: 5,
    location: 'Seattle, WA',
    bio: 'Data scientist passionate about AI and machine learning solutions.',
    availability: 'available',
    expectedSalary: 140000,
    preferredJobTypes: ['full-time'],
    photoURL: '👩‍💻',
    isOnline: true,
    lastSeen: new Date(),
  },
  {
    id: 'candidate-3',
    displayName: 'Mike Rodriguez',
    email: 'mike@example.com',
    skills: ['Java', 'Spring Boot', 'AWS', 'Docker'],
    experience: 4,
    location: 'Austin, TX',
    bio: 'Backend engineer specializing in microservices and cloud architecture.',
    availability: 'available',
    expectedSalary: 130000,
    preferredJobTypes: ['full-time', 'hybrid'],
    photoURL: '👨‍🔧',
    isOnline: true,
    lastSeen: new Date(),
  },
];

export const mockRecruiters = [
  {
    id: 'recruiter-1',
    displayName: 'Sarah Wilson',
    email: 'sarah@techcorp.com',
    company: 'TechCorp',
    position: 'Senior Recruiter',
    bio: 'Looking for talented developers to join our growing team.',
    companySize: 'medium',
    industry: 'Technology',
    isOnline: true,
    lastSeen: new Date(),
  },
  {
    id: 'recruiter-2',
    displayName: 'Mike Thompson',
    email: 'mike@startupxyz.com',
    company: 'StartupXYZ',
    position: 'Talent Acquisition',
    bio: 'Fast-growing startup seeking passionate engineers.',
    companySize: 'startup',
    industry: 'Fintech',
    isOnline: true,
    lastSeen: new Date(),
  },
];

export const mockCalls = [
  {
    id: 'call-1',
    candidateId: 'candidate-1',
    recruiterId: 'recruiter-1',
    roomId: 'room-1',
    status: 'ended',
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000), // 5 minutes later
    duration: 300,
    transcript: 'Interview transcript would go here...',
    aiSummary: {
      candidateStrengths: ['Strong technical skills', 'Good communication'],
      candidateWeaknesses: ['Limited experience with cloud'],
      keySkills: ['JavaScript', 'React', 'Node.js'],
      communicationScore: 8,
      technicalScore: 7,
      culturalFitScore: 9,
      overallScore: 8,
      summary: 'Strong candidate with good technical foundation and excellent communication skills.',
      recommendations: ['Consider for next round', 'Technical assessment recommended']
    },
    recruiterDecision: {
      decision: 'YES',
      notes: 'Great candidate, would like to move forward',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 10 * 60 * 1000)
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
];

export const mockMatchResults = [
  {
    candidate: mockCandidates[0],
    matchScore: 87,
    softConstraintScore: 0.8,
    reasons: [
      'Passed hard constraint: availability equals available',
      'Passed soft constraint: skills contains JavaScript (weight: 0.3)',
      'Passed soft constraint: experience greater_than 2 (weight: 0.2)',
    ],
  },
];

export const generateMockCall = (candidateId: string, recruiterId: string) => {
  const candidate = mockCandidates.find(c => c.id === candidateId);
  const recruiter = mockRecruiters.find(r => r.id === recruiterId);
  
  return {
    id: `call-${Date.now()}`,
    candidateId,
    recruiterId,
    roomId: `room-${Date.now()}`,
    status: 'waiting',
    createdAt: new Date(),
    candidate: candidate ? {
      id: candidate.id,
      displayName: candidate.displayName,
      skills: candidate.skills,
      experience: candidate.experience,
      location: candidate.location,
      photoURL: candidate.photoURL,
    } : null,
    recruiter: recruiter ? {
      id: recruiter.id,
      displayName: recruiter.displayName,
      company: recruiter.company,
    } : null,
  };
};

export const generateMockMatch = () => {
  const randomCandidate = mockCandidates[Math.floor(Math.random() * mockCandidates.length)];
  const randomRecruiter = mockRecruiters[Math.floor(Math.random() * mockRecruiters.length)];
  
  return {
    callId: `call-${Date.now()}`,
    roomId: `room-${Date.now()}`,
    candidate: {
      id: randomCandidate.id,
      displayName: randomCandidate.displayName,
      skills: randomCandidate.skills,
      experience: randomCandidate.experience,
      location: randomCandidate.location,
      photoURL: randomCandidate.photoURL,
    },
    recruiter: {
      id: randomRecruiter.id,
      company: randomRecruiter.company,
    },
    matchScore: Math.floor(Math.random() * 30) + 70, // 70-100
  };
};
