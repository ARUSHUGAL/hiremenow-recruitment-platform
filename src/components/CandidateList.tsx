import { useState, useEffect } from 'react';

interface Candidate {
  id: string;
  name: string;
  title: string;
  experience: string;
  location: string;
  skills: string[];
  matchScore: number;
  salary: string;
  availability: string;
  education: string;
  hasPortfolio: boolean;
  hasCertifications: boolean;
  hasOpenSource?: boolean;
  hasLeadership?: boolean;
  lastActive: string;
  avatar: string;
}

interface CandidateListProps {
  filters: any;
  onClose: () => void;
  onStartInterview: (candidate: Candidate) => void;
}

export default function CandidateList({ filters, onClose, onStartInterview }: CandidateListProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [sortBy, setSortBy] = useState<'matchScore' | 'experience' | 'salary' | 'name'>('matchScore');
  const [isLoading, setIsLoading] = useState(true);

  // Mock candidate data
  const mockCandidates: Candidate[] = [
    // Frontend Developers
    {
      id: '1',
      name: 'Alex Johnson',
      title: 'Full Stack Developer',
      experience: '5 years',
      location: 'San Francisco, CA',
      skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker'],
      matchScore: 92,
      salary: '$120,000 - $150,000',
      availability: 'Immediate',
      education: 'Bachelor of Computer Science',
      hasPortfolio: true,
      hasCertifications: true,
      hasOpenSource: true,
      hasLeadership: false,
      lastActive: '2 hours ago',
      avatar: '👨‍💻'
    },
    {
      id: '2',
      name: 'Sarah Chen',
      title: 'Frontend Developer',
      experience: '3 years',
      location: 'New York, NY',
      skills: ['React', 'Vue.js', 'JavaScript', 'CSS', 'Figma'],
      matchScore: 87,
      salary: '$90,000 - $120,000',
      availability: 'Within 2 weeks',
      education: 'Bachelor of Computer Science',
      hasPortfolio: true,
      hasCertifications: false,
      hasOpenSource: false,
      hasLeadership: false,
      lastActive: '1 hour ago',
      avatar: '👩‍💻'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      title: 'Frontend Developer',
      experience: '2 years',
      location: 'Chicago, IL',
      skills: ['Angular', 'TypeScript', 'SCSS', 'RxJS', 'Jest'],
      matchScore: 78,
      salary: '$75,000 - $95,000',
      availability: 'Immediate',
      education: 'Bachelor of Computer Science',
      hasPortfolio: false,
      hasCertifications: true,
      hasOpenSource: true,
      hasLeadership: false,
      lastActive: '4 hours ago',
      avatar: '👩‍💻'
    },
    {
      id: '4',
      name: 'James Wilson',
      title: 'UI/UX Developer',
      experience: '4 years',
      location: 'Portland, OR',
      skills: ['React', 'Figma', 'Adobe XD', 'CSS', 'JavaScript'],
      matchScore: 85,
      salary: '$95,000 - $125,000',
      availability: 'Within 1 month',
      education: 'Bachelor of Design',
      hasPortfolio: true,
      hasCertifications: false,
      hasOpenSource: false,
      hasLeadership: false,
      lastActive: '6 hours ago',
      avatar: '👨‍🎨'
    },

    // Backend Developers
    {
      id: '5',
      name: 'Mike Rodriguez',
      title: 'Backend Developer',
      experience: '7 years',
      location: 'Austin, TX',
      skills: ['Python', 'Django', 'PostgreSQL', 'AWS', 'Kubernetes'],
      matchScore: 89,
      salary: '$130,000 - $160,000',
      availability: 'Within 1 month',
      education: 'Master of Computer Science',
      hasPortfolio: true,
      hasCertifications: true,
      hasOpenSource: true,
      hasLeadership: true,
      lastActive: '3 hours ago',
      avatar: '👨‍💻'
    },
    {
      id: '6',
      name: 'David Park',
      title: 'Backend Developer',
      experience: '6 years',
      location: 'Denver, CO',
      skills: ['Java', 'Spring Boot', 'MySQL', 'Redis', 'Docker'],
      matchScore: 88,
      salary: '$125,000 - $155,000',
      availability: 'Within 2 weeks',
      education: 'Bachelor of Computer Science',
      hasPortfolio: true,
      hasCertifications: true,
      hasOpenSource: false,
      hasLeadership: false,
      lastActive: '1 hour ago',
      avatar: '👨‍💻'
    },
    {
      id: '7',
      name: 'Anna Thompson',
      title: 'Backend Developer',
      experience: '3 years',
      location: 'Miami, FL',
      skills: ['Node.js', 'Express', 'MongoDB', 'GraphQL', 'Jest'],
      matchScore: 82,
      salary: '$85,000 - $110,000',
      availability: 'Immediate',
      education: 'Bachelor of Computer Science',
      hasPortfolio: false,
      hasCertifications: true,
      hasOpenSource: false,
      hasLeadership: false,
      lastActive: '2 hours ago',
      avatar: '👩‍💻'
    },
    {
      id: '8',
      name: 'Carlos Mendez',
      title: 'Backend Developer',
      experience: '8 years',
      location: 'Phoenix, AZ',
      skills: ['C#', '.NET Core', 'SQL Server', 'Azure', 'Docker'],
      matchScore: 91,
      salary: '$140,000 - $170,000',
      availability: 'Within 1 month',
      education: 'Master of Computer Science',
      hasPortfolio: true,
      hasCertifications: true,
      hasOpenSource: true,
      hasLeadership: false,
      lastActive: '5 hours ago',
      avatar: '👨‍💻'
    },

    // DevOps Engineers
    {
      id: '9',
      name: 'Lisa Wang',
      title: 'DevOps Engineer',
      experience: '4 years',
      location: 'Seattle, WA',
      skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'Python'],
      matchScore: 85,
      salary: '$110,000 - $140,000',
      availability: 'Immediate',
      education: 'Bachelor of Computer Science',
      hasPortfolio: false,
      hasCertifications: true,
      hasOpenSource: true,
      hasLeadership: false,
      lastActive: '30 minutes ago',
      avatar: '👩‍💻'
    },
    {
      id: '10',
      name: 'Robert Kim',
      title: 'DevOps Engineer',
      experience: '5 years',
      location: 'Atlanta, GA',
      skills: ['Jenkins', 'GitLab CI', 'AWS', 'Ansible', 'Bash'],
      matchScore: 87,
      salary: '$115,000 - $145,000',
      availability: 'Within 2 weeks',
      education: 'Bachelor of Computer Science',
      hasPortfolio: true,
      hasCertifications: true,
      hasOpenSource: false,
      hasLeadership: true,
      lastActive: '3 hours ago',
      avatar: '👨‍🔧'
    },
    {
      id: '11',
      name: 'Maria Garcia',
      title: 'Cloud Engineer',
      experience: '3 years',
      location: 'San Diego, CA',
      skills: ['AWS', 'Azure', 'Terraform', 'Python', 'Linux'],
      matchScore: 83,
      salary: '$100,000 - $130,000',
      availability: 'Within 1 month',
      education: 'Bachelor of Computer Science',
      hasPortfolio: true,
      hasCertifications: false,
      hasOpenSource: true,
      hasLeadership: false,
      lastActive: '4 hours ago',
      avatar: '👩‍💻'
    },

    // Mobile Developers
    {
      id: '12',
      name: 'Kevin Lee',
      title: 'Mobile Developer',
      experience: '6 years',
      location: 'Los Angeles, CA',
      skills: ['React Native', 'iOS', 'Android', 'JavaScript', 'Swift'],
      matchScore: 78,
      salary: '$100,000 - $130,000',
      availability: 'Within 2 weeks',
      education: 'Bachelor of Computer Science',
      hasPortfolio: true,
      hasCertifications: false,
      hasOpenSource: false,
      hasLeadership: false,
      lastActive: '5 hours ago',
      avatar: '👨‍💻'
    },
    {
      id: '13',
      name: 'Jennifer Brown',
      title: 'iOS Developer',
      experience: '4 years',
      location: 'Nashville, TN',
      skills: ['Swift', 'UIKit', 'SwiftUI', 'Core Data', 'Xcode'],
      matchScore: 86,
      salary: '$95,000 - $125,000',
      availability: 'Immediate',
      education: 'Bachelor of Computer Science',
      hasPortfolio: true,
      hasCertifications: true,
      hasOpenSource: false,
      hasLeadership: false,
      lastActive: '2 hours ago',
      avatar: '👩‍💻'
    },
    {
      id: '14',
      name: 'Ahmed Hassan',
      title: 'Android Developer',
      experience: '5 years',
      location: 'Detroit, MI',
      skills: ['Kotlin', 'Java', 'Android Studio', 'Room', 'Retrofit'],
      matchScore: 84,
      salary: '$105,000 - $135,000',
      availability: 'Within 1 month',
      education: 'Bachelor of Computer Science',
      hasPortfolio: false,
      hasCertifications: true,
      hasOpenSource: true,
      hasLeadership: false,
      lastActive: '6 hours ago',
      avatar: '👨‍💻'
    },

    // Data Scientists & ML Engineers
    {
      id: '15',
      name: 'Dr. Priya Patel',
      title: 'Data Scientist',
      experience: '6 years',
      location: 'Boston, MA',
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'R'],
      matchScore: 91,
      salary: '$125,000 - $155,000',
      availability: 'Within 1 month',
      education: 'PhD in Data Science',
      hasPortfolio: true,
      hasCertifications: true,
      hasOpenSource: true,
      hasLeadership: true,
      lastActive: '1 hour ago',
      avatar: '👩‍🔬'
    },
    {
      id: '16',
      name: 'Marcus Johnson',
      title: 'ML Engineer',
      experience: '4 years',
      location: 'Raleigh, NC',
      skills: ['Python', 'PyTorch', 'MLflow', 'AWS SageMaker', 'Docker'],
      matchScore: 88,
      salary: '$120,000 - $150,000',
      availability: 'Within 2 weeks',
      education: 'Master of Computer Science',
      hasPortfolio: true,
      hasCertifications: true,
      hasOpenSource: true,
      hasLeadership: false,
      lastActive: '3 hours ago',
      avatar: '👨‍🔬'
    },
    {
      id: '17',
      name: 'Sophie Chen',
      title: 'Data Engineer',
      experience: '3 years',
      location: 'Minneapolis, MN',
      skills: ['Python', 'Apache Spark', 'Kafka', 'PostgreSQL', 'Airflow'],
      matchScore: 82,
      salary: '$90,000 - $120,000',
      availability: 'Immediate',
      education: 'Bachelor of Computer Science',
      hasPortfolio: false,
      hasCertifications: true,
      hasOpenSource: true,
      hasLeadership: false,
      lastActive: '4 hours ago',
      avatar: '👩‍💻'
    },

    // Full Stack Developers
    {
      id: '18',
      name: 'Ryan O\'Connor',
      title: 'Full Stack Developer',
      experience: '5 years',
      location: 'Philadelphia, PA',
      skills: ['React', 'Node.js', 'PostgreSQL', 'AWS', 'TypeScript'],
      matchScore: 89,
      salary: '$115,000 - $145,000',
      availability: 'Within 2 weeks',
      education: 'Bachelor of Computer Science',
      hasPortfolio: true,
      hasCertifications: false,
      hasOpenSource: true,
      hasLeadership: false,
      lastActive: '2 hours ago',
      avatar: '👨‍💻'
    },
    {
      id: '19',
      name: 'Isabella Martinez',
      title: 'Full Stack Developer',
      experience: '3 years',
      location: 'Tampa, FL',
      skills: ['Vue.js', 'Laravel', 'MySQL', 'Docker', 'JavaScript'],
      matchScore: 81,
      salary: '$80,000 - $105,000',
      availability: 'Immediate',
      education: 'Bachelor of Computer Science',
      hasPortfolio: true,
      hasCertifications: true,
      hasOpenSource: false,
      hasLeadership: false,
      lastActive: '5 hours ago',
      avatar: '👩‍💻'
    },
    {
      id: '20',
      name: 'Thomas Anderson',
      title: 'Full Stack Developer',
      experience: '7 years',
      location: 'Salt Lake City, UT',
      skills: ['Angular', 'Spring Boot', 'MongoDB', 'Azure', 'Java'],
      matchScore: 90,
      salary: '$130,000 - $160,000',
      availability: 'Within 1 month',
      education: 'Master of Computer Science',
      hasPortfolio: true,
      hasCertifications: true,
      hasOpenSource: false,
      hasLeadership: false,
      lastActive: '1 hour ago',
      avatar: '👨‍💻'
    },

    // Specialized Roles
    {
      id: '21',
      name: 'Grace Liu',
      title: 'Security Engineer',
      experience: '5 years',
      location: 'Washington, DC',
      skills: ['Python', 'Security Tools', 'AWS Security', 'Penetration Testing', 'Linux'],
      matchScore: 87,
      salary: '$125,000 - $155,000',
      availability: 'Within 2 weeks',
      education: 'Bachelor of Computer Science',
      hasPortfolio: false,
      hasCertifications: true,
      hasOpenSource: false,
      hasLeadership: true,
      lastActive: '3 hours ago',
      avatar: '👩‍🔒'
    },
    {
      id: '22',
      name: 'Daniel Wright',
      title: 'Blockchain Developer',
      experience: '4 years',
      location: 'San Francisco, CA',
      skills: ['Solidity', 'Web3.js', 'Ethereum', 'JavaScript', 'React'],
      matchScore: 85,
      salary: '$140,000 - $180,000',
      availability: 'Immediate',
      education: 'Bachelor of Computer Science',
      hasPortfolio: true,
      hasCertifications: true,
      hasOpenSource: true,
      hasLeadership: false,
      lastActive: '2 hours ago',
      avatar: '👨‍💻'
    },
    {
      id: '23',
      name: 'Rachel Green',
      title: 'QA Engineer',
      experience: '3 years',
      location: 'Orlando, FL',
      skills: ['Selenium', 'Cypress', 'JavaScript', 'Test Automation', 'API Testing'],
      matchScore: 79,
      salary: '$75,000 - $95,000',
      availability: 'Within 1 month',
      education: 'Bachelor of Computer Science',
      hasPortfolio: true,
      hasCertifications: false,
      hasOpenSource: true,
      hasLeadership: false,
      lastActive: '6 hours ago',
      avatar: '👩‍💻'
    },
    {
      id: '24',
      name: 'Alex Turner',
      title: 'Game Developer',
      experience: '6 years',
      location: 'Austin, TX',
      skills: ['Unity', 'C#', 'Unreal Engine', 'C++', 'Game Design'],
      matchScore: 83,
      salary: '$95,000 - $125,000',
      availability: 'Within 2 weeks',
      education: 'Bachelor of Game Development',
      hasPortfolio: true,
      hasCertifications: true,
      hasOpenSource: true,
      hasLeadership: false,
      lastActive: '4 hours ago',
      avatar: '👨‍🎮'
    },

    // Junior Developers
    {
      id: '25',
      name: 'Emma Wilson',
      title: 'Junior Frontend Developer',
      experience: '1 year',
      location: 'Columbus, OH',
      skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Git'],
      matchScore: 72,
      salary: '$55,000 - $70,000',
      availability: 'Immediate',
      education: 'Bachelor of Computer Science',
      hasPortfolio: true,
      hasCertifications: false,
      hasOpenSource: false,
      hasLeadership: false,
      lastActive: '1 hour ago',
      avatar: '👩‍💻'
    },
    {
      id: '26',
      name: 'Lucas Silva',
      title: 'Junior Backend Developer',
      experience: '1 year',
      location: 'Houston, TX',
      skills: ['Python', 'Django', 'PostgreSQL', 'Git', 'Linux'],
      matchScore: 74,
      salary: '$60,000 - $75,000',
      availability: 'Within 2 weeks',
      education: 'Bachelor of Computer Science',
      hasPortfolio: false,
      hasCertifications: true,
      hasOpenSource: false,
      hasLeadership: false,
      lastActive: '3 hours ago',
      avatar: '👨‍💻'
    },

    // Senior/Lead Developers
    {
      id: '27',
      name: 'Dr. Sarah Mitchell',
      title: 'Senior Software Architect',
      experience: '12 years',
      location: 'Seattle, WA',
      skills: ['System Design', 'Microservices', 'AWS', 'Kubernetes', 'Python'],
      matchScore: 95,
      salary: '$180,000 - $220,000',
      availability: 'Within 1 month',
      education: 'PhD in Computer Science',
      hasPortfolio: true,
      hasCertifications: true,
      hasOpenSource: true,
      hasLeadership: true,
      lastActive: '30 minutes ago',
      avatar: '👩‍💼'
    },
    {
      id: '28',
      name: 'Michael Chang',
      title: 'Tech Lead',
      experience: '10 years',
      location: 'New York, NY',
      skills: ['Leadership', 'React', 'Node.js', 'AWS', 'Team Management'],
      matchScore: 93,
      salary: '$160,000 - $200,000',
      availability: 'Within 2 weeks',
      education: 'Master of Computer Science',
      hasPortfolio: true,
      hasCertifications: true,
      hasOpenSource: true,
      hasLeadership: true,
      lastActive: '2 hours ago',
      avatar: '👨‍💼'
    },

    // Remote Workers
    {
      id: '29',
      name: 'Yuki Tanaka',
      title: 'Remote Full Stack Developer',
      experience: '4 years',
      location: 'Remote (Japan)',
      skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker'],
      matchScore: 86,
      salary: '$100,000 - $130,000',
      availability: 'Immediate',
      education: 'Bachelor of Computer Science',
      hasPortfolio: true,
      hasCertifications: true,
      hasOpenSource: false,
      hasLeadership: false,
      lastActive: '1 hour ago',
      avatar: '👨‍💻'
    },
    {
      id: '30',
      name: 'Olga Petrov',
      title: 'Remote DevOps Engineer',
      experience: '5 years',
      location: 'Remote (Ukraine)',
      skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'Python'],
      matchScore: 88,
      salary: '$90,000 - $120,000',
      availability: 'Within 1 month',
      education: 'Master of Computer Science',
      hasPortfolio: true,
      hasCertifications: true,
      lastActive: '4 hours ago',
      avatar: '👩‍💻'
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setCandidates(mockCandidates);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = [...candidates];

    // Experience filter - Fix: Extract number from "X years" string
    if (filters.minExperience || filters.maxExperience) {
      filtered = filtered.filter(candidate => {
        // Extract number from "5 years" format
        const expMatch = candidate.experience.match(/(\d+)/);
        const expYears = expMatch ? parseInt(expMatch[1]) : 0;
        const minExp = parseInt(filters.minExperience) || 0;
        const maxExp = parseInt(filters.maxExperience) || 20;
        return expYears >= minExp && expYears <= maxExp;
      });
    }

    // Required skills filter
    if (filters.requiredSkills && filters.requiredSkills.length > 0) {
      filtered = filtered.filter(candidate =>
        filters.requiredSkills.every((skill: string) =>
          candidate.skills.includes(skill)
        )
      );
    }

    // Preferred skills filter
    if (filters.preferredSkills && filters.preferredSkills.length > 0) {
      filtered = filtered.filter(candidate =>
        filters.preferredSkills.some((skill: string) =>
          candidate.skills.includes(skill)
        )
      );
    }

    // Location filter
    if (filters.location && filters.location.trim()) {
      filtered = filtered.filter(candidate =>
        candidate.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Remote work filter
    if (filters.remoteWork && filters.remoteWork !== 'any') {
      filtered = filtered.filter(candidate => {
        if (filters.remoteWork === 'required') {
          return candidate.location.toLowerCase().includes('remote');
        } else if (filters.remoteWork === 'not-required') {
          return !candidate.location.toLowerCase().includes('remote');
        }
        return true;
      });
    }

    // Salary filter - Fix: Better regex for salary parsing
    if (filters.minSalary || filters.maxSalary) {
      filtered = filtered.filter(candidate => {
        // Extract salary numbers from "$120,000 - $150,000" format
        const salaryMatch = candidate.salary.match(/\$(\d{1,3}(?:,\d{3})*)/g);
        if (salaryMatch && salaryMatch.length >= 1) {
          const minSalary = parseInt(salaryMatch[0].replace(/[$,]/g, ''));
          const maxSalary = salaryMatch[1] ? parseInt(salaryMatch[1].replace(/[$,]/g, '')) : minSalary;
          const filterMin = parseInt(filters.minSalary) || 0;
          const filterMax = parseInt(filters.maxSalary) || 999999;
          return maxSalary >= filterMin && minSalary <= filterMax;
        }
        return true;
      });
    }

    // Education filter
    if (filters.educationLevel && filters.educationLevel !== 'any') {
      filtered = filtered.filter(candidate => {
        const education = candidate.education.toLowerCase();
        switch (filters.educationLevel) {
          case 'high-school':
            return education.includes('high school');
          case 'bachelor':
            return education.includes('bachelor');
          case 'master':
            return education.includes('master');
          case 'phd':
            return education.includes('phd') || education.includes('doctor');
          default:
            return true;
        }
      });
    }

    // Availability filter
    if (filters.availability && filters.availability !== 'any') {
      filtered = filtered.filter(candidate => {
        const availability = candidate.availability.toLowerCase();
        switch (filters.availability) {
          case 'immediate':
            return availability.includes('immediate');
          case '2-weeks':
            return availability.includes('2 weeks');
          case '1-month':
            return availability.includes('1 month');
          case '2-months':
            return availability.includes('2 months');
          default:
            return true;
        }
      });
    }

    // Additional criteria
    if (filters.hasPortfolio) {
      filtered = filtered.filter(candidate => candidate.hasPortfolio);
    }
    if (filters.hasCertifications) {
      filtered = filtered.filter(candidate => candidate.hasCertifications);
    }
    if (filters.hasOpenSource) {
      filtered = filtered.filter(candidate => candidate.hasOpenSource);
    }
    if (filters.hasLeadership) {
      filtered = filtered.filter(candidate => candidate.hasLeadership);
    }

    setFilteredCandidates(filtered);
  }, [candidates, filters]);

  const sortCandidates = (candidates: Candidate[]) => {
    return [...candidates].sort((a, b) => {
      switch (sortBy) {
        case 'matchScore':
          return b.matchScore - a.matchScore;
        case 'experience':
          const aExpMatch = a.experience.match(/(\d+)/);
          const bExpMatch = b.experience.match(/(\d+)/);
          const aExpYears = aExpMatch ? parseInt(aExpMatch[1]) : 0;
          const bExpYears = bExpMatch ? parseInt(bExpMatch[1]) : 0;
          return bExpYears - aExpYears;
        case 'salary':
          const aSalaryMatch = a.salary.match(/\$(\d{1,3}(?:,\d{3})*)/);
          const bSalaryMatch = b.salary.match(/\$(\d{1,3}(?:,\d{3})*)/);
          const aSalary = aSalaryMatch ? parseInt(aSalaryMatch[1].replace(/,/g, '')) : 0;
          const bSalary = bSalaryMatch ? parseInt(bSalaryMatch[1].replace(/,/g, '')) : 0;
          return bSalary - aSalary;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Finding Candidates...</h2>
          <p className="text-white/80">Applying your filters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold">👥 Filtered Candidates</h2>
            <p className="text-gray-600 mt-2">{filteredCandidates.length} candidates found</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Sort Options */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="matchScore">Match Score</option>
              <option value="experience">Experience</option>
              <option value="salary">Salary</option>
              <option value="name">Name</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            Showing {filteredCandidates.length} of {candidates.length} candidates
          </div>
        </div>

        {/* Candidate List */}
        <div className="space-y-4">
          {sortCandidates(filteredCandidates).map((candidate) => (
            <div key={candidate.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="text-4xl">{candidate.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{candidate.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${getMatchScoreColor(candidate.matchScore)}`}>
                        {candidate.matchScore}% match
                      </span>
                    </div>
                    <p className="text-lg text-gray-700 mb-2">{candidate.title}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">Experience:</span> {candidate.experience}
                      </div>
                      <div>
                        <span className="font-medium">Location:</span> {candidate.location}
                      </div>
                      <div>
                        <span className="font-medium">Salary:</span> {candidate.salary}
                      </div>
                      <div>
                        <span className="font-medium">Available:</span> {candidate.availability}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {candidate.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Last active: {candidate.lastActive}</span>
                      {candidate.hasPortfolio && <span className="text-green-600">📁 Portfolio</span>}
                      {candidate.hasCertifications && <span className="text-blue-600">🏆 Certifications</span>}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => onStartInterview(candidate)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                  >
                    🎥 Start Interview
                  </button>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors">
                    👁️ View Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCandidates.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No candidates found</h3>
            <p className="text-gray-600">Try adjusting your filters to find more candidates.</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center mt-8">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
