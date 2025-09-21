import { useState } from "react";

export default function Recruiter() {
  const [profile, setProfile] = useState({
    company: "TechCorp",
    position: "Senior Recruiter",
    companySize: "medium",
    industry: "Technology"
  });

  const [constraints, setConstraints] = useState({
    hardConstraints: [
      { field: "availability", operator: "equals", value: "available" }
    ],
    softConstraints: [
      { field: "skills", operator: "contains", value: "JavaScript", weight: 0.3 },
      { field: "experience", operator: "greater_than", value: 2, weight: 0.2 }
    ]
  });

  const [isActive, setIsActive] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(null);

  const mockCandidates = [
    { id: 1, name: "Alex Johnson", skills: ["JavaScript", "React", "Node.js"], experience: 3, location: "San Francisco", matchScore: 87 },
    { id: 2, name: "Sarah Chen", skills: ["Python", "Machine Learning", "TensorFlow"], experience: 5, location: "Seattle", matchScore: 92 },
    { id: 3, name: "Mike Rodriguez", skills: ["Java", "Spring Boot", "AWS"], experience: 4, location: "Austin", matchScore: 78 }
  ];

  const findMatch = () => {
    const randomCandidate = mockCandidates[Math.floor(Math.random() * mockCandidates.length)];
    setCurrentMatch(randomCandidate);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">👔 Recruiter Dashboard</h1>
        
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Profile Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">🏢 Company Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Company</label>
                <input 
                  type="text" 
                  value={profile.company}
                  onChange={(e) => setProfile({...profile, company: e.target.value})}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Position</label>
                <input 
                  type="text" 
                  value={profile.position}
                  onChange={(e) => setProfile({...profile, position: e.target.value})}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Company Size</label>
                <select 
                  value={profile.companySize}
                  onChange={(e) => setProfile({...profile, companySize: e.target.value})}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2"
                >
                  <option value="startup">Startup</option>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>
          </div>

          {/* Matching Constraints */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">🎯 Matching Constraints</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Hard Constraints (Must Meet)</h3>
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                  <p className="text-sm">Availability = Available</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Soft Constraints (Scored)</h3>
                <div className="space-y-2">
                  <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3">
                    <p className="text-sm">Skills contains JavaScript (Weight: 0.3)</p>
                  </div>
                  <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3">
                      <p className="text-sm">Experience &gt; 2 years (Weight: 0.2)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Status & Match Finding */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">🔍 Find Candidates</h2>
            <div className="flex items-center space-x-4">
              <span className={`px-4 py-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-500'}`}>
                {isActive ? '🟢 Active' : '🔴 Inactive'}
              </span>
              <button 
                onClick={() => setIsActive(!isActive)}
                className="bg-gradient-to-r from-green-500 to-teal-600 px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform"
              >
                {isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
          
          <div className="text-center">
            <button 
              onClick={findMatch}
              disabled={!isActive}
              className="bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-4 rounded-full text-xl font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🎯 Find Match
            </button>
          </div>
        </div>

        {/* Match Results */}
        {currentMatch && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">🎉 Match Found!</h2>
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">{currentMatch.name}</h3>
                <span className="bg-green-500 px-4 py-2 rounded-full font-bold">
                  {currentMatch.matchScore}% Match
                </span>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-white/80">Skills</p>
                  <p className="font-semibold">{currentMatch.skills.join(", ")}</p>
                </div>
                <div>
                  <p className="text-sm text-white/80">Experience</p>
                  <p className="font-semibold">{currentMatch.experience} years</p>
                </div>
                <div>
                  <p className="text-sm text-white/80">Location</p>
                  <p className="font-semibold">{currentMatch.location}</p>
                </div>
              </div>
              <div className="flex space-x-4 mt-6">
                <button className="bg-gradient-to-r from-green-500 to-teal-600 px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform">
                  ✅ Start Call
                </button>
                <button className="bg-gradient-to-r from-red-500 to-pink-600 px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform">
                  ❌ Reject
                </button>
                <button className="bg-gradient-to-r from-yellow-500 to-orange-600 px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform">
                  ⏰ Maybe Later
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-green-400">12</div>
            <p className="text-white/80">Calls Today</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-400">87%</div>
            <p className="text-white/80">Avg Match Score</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-400">5</div>
            <p className="text-white/80">Hired This Week</p>
          </div>
        </div>
      </div>
    </div>
  );
}