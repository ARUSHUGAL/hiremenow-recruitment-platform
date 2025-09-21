import { useState, useEffect } from 'react';

interface ResumeReviewProps {
  onComplete: () => void;
  onSkip: () => void;
  onSkipCandidate: () => void;
}

export default function ResumeReview({ onComplete, onSkip, onSkipCandidate }: ResumeReviewProps) {
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [currentSection, setCurrentSection] = useState(0);
  const [isReviewing, setIsReviewing] = useState(true);

  const resumeSections = [
    {
      title: "📋 Personal Information",
      content: "John Smith - Software Engineer\nEmail: john.smith@email.com\nPhone: (555) 123-4567\nLocation: San Francisco, CA",
      duration: 20
    },
    {
      title: "🎯 Professional Summary",
      content: "Experienced full-stack developer with 5+ years in React, Node.js, and cloud technologies. Passionate about building scalable web applications and leading technical teams.",
      duration: 25
    },
    {
      title: "💼 Work Experience",
      content: "Senior Software Engineer at TechCorp (2021-2024)\n- Led development of microservices architecture\n- Improved system performance by 40%\n- Mentored 3 junior developers\n\nSoftware Engineer at StartupXYZ (2019-2021)\n- Built React frontend for e-commerce platform\n- Implemented real-time chat features\n- Reduced bug reports by 60%",
      duration: 35
    },
    {
      title: "🛠️ Technical Skills",
      content: "Frontend: React, TypeScript, Next.js, Tailwind CSS\nBackend: Node.js, Express, Python, Django\nDatabase: PostgreSQL, MongoDB, Redis\nCloud: AWS, Docker, Kubernetes\nTools: Git, Jest, Cypress, Figma",
      duration: 25
    },
    {
      title: "🎓 Education & Certifications",
      content: "Bachelor of Computer Science - Stanford University (2019)\nAWS Certified Solutions Architect\nGoogle Cloud Professional Developer\nReact Developer Certification",
      duration: 15
    }
  ];

  useEffect(() => {
    if (!isReviewing) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsReviewing(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isReviewing]);

  useEffect(() => {
    if (!isReviewing) return;

    const sectionTimer = setInterval(() => {
      setCurrentSection(prev => {
        if (prev >= resumeSections.length - 1) {
          return prev;
        }
        return prev + 1;
      });
    }, 20000); // Change section every 20 seconds

    return () => clearInterval(sectionTimer);
  }, [isReviewing]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentResumeSection = resumeSections[currentSection];

  if (!isReviewing) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-4">Resume Review Complete!</h2>
          <p className="text-gray-600 mb-6">
            You've reviewed the candidate's resume. Ready to start the video call?
          </p>
          <div className="space-y-3">
            <button
              onClick={onComplete}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-bold transition-colors"
            >
              🎥 Start Video Call
            </button>
            <button
              onClick={onSkip}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-bold transition-colors"
            >
              Skip to Call
            </button>
            <button
              onClick={onSkipCandidate}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-bold transition-colors"
            >
              ❌ Skip Candidate
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 max-w-4xl mx-4 w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">📄 Resume Review</h2>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{formatTime(timeLeft)}</div>
            <div className="text-sm text-gray-500">Time remaining</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${((120 - timeLeft) / 120) * 100}%` }}
          ></div>
        </div>

        {/* Resume Content */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold mb-4 text-blue-800">{currentResumeSection.title}</h3>
          <div className="text-gray-700 whitespace-pre-line leading-relaxed">
            {currentResumeSection.content}
          </div>
        </div>

        {/* Section Progress */}
        <div className="flex justify-center space-x-2 mb-6">
          {resumeSections.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === currentSection ? 'bg-blue-600' : 
                index < currentSection ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
            disabled={currentSection === 0}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
          >
            ← Previous
          </button>
          <button
            onClick={() => setCurrentSection(Math.min(resumeSections.length - 1, currentSection + 1))}
            disabled={currentSection === resumeSections.length - 1}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
          >
            Next →
          </button>
          <button
            onClick={onSkip}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
          >
            Skip Review
          </button>
          <button
            onClick={onSkipCandidate}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            ❌ Skip Candidate
          </button>
        </div>

        {/* Instructions */}
        <div className="text-center mt-4 text-sm text-gray-500">
          Review the candidate's resume. The video call will start automatically when time runs out.<br/>
          Use "Skip Candidate" if this candidate doesn't meet your requirements.
        </div>
      </div>
    </div>
  );
}
