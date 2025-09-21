import { useState } from "react";

export default function Candidate() {
  const [profile, setProfile] = useState({
    name: "Alex Johnson",
    email: "alex@example.com",
    skills: ["JavaScript", "React", "Node.js"],
    experience: 3,
    location: "San Francisco, CA",
    availability: "available"
  });

  const [isOnline, setIsOnline] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callHistory, setCallHistory] = useState([
    { id: 1, recruiter: "Sarah from TechCorp", date: "2024-01-15", duration: "5:30", status: "Completed", decision: "YES" },
    { id: 2, recruiter: "Mike from StartupXYZ", date: "2024-01-14", duration: "4:45", status: "Completed", decision: "MAYBE" },
    { id: 3, recruiter: "Lisa from BigCorp", date: "2024-01-13", duration: "6:15", status: "Completed", decision: "NO" }
  ]);

  const simulateIncomingCall = () => {
    const recruiters = [
      { name: "Sarah Wilson", company: "TechCorp", position: "Senior Recruiter" },
      { name: "Mike Thompson", company: "StartupXYZ", position: "Talent Acquisition" },
      { name: "Lisa Chen", company: "BigCorp", position: "HR Manager" }
    ];
    const randomRecruiter = recruiters[Math.floor(Math.random() * recruiters.length)];
    setIncomingCall({
      id: Date.now(),
      recruiter: randomRecruiter,
      matchScore: Math.floor(Math.random() * 30) + 70
    });
  };

  const acceptCall = () => {
    setIncomingCall(null);
    // Simulate call ending after 5 seconds
    setTimeout(() => {
      alert("Call completed! Check your call history for updates.");
    }, 5000);
  };

  const rejectCall = () => {
    setIncomingCall(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">👨‍💻 Candidate Dashboard</h1>
        
        {/* Main Action */}
        <div className="text-center mb-12">
          <button 
            onClick={simulateIncomingCall}
            disabled={!isOnline}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 px-12 py-6 rounded-2xl text-2xl font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
          >
            📞 Simulate Incoming Call
          </button>
          <p className="text-white/70 text-sm mt-3">Test the video call experience</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Profile Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">👤 Quick Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input 
                  type="text" 
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Skills</label>
                <input 
                  type="text" 
                  value={profile.skills.join(", ")}
                  onChange={(e) => setProfile({...profile, skills: e.target.value.split(", ").filter(s => s.trim())})}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-gray-800"
                  placeholder="JavaScript, React, Node.js"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Experience (years)</label>
                <input 
                  type="number" 
                  value={profile.experience}
                  onChange={(e) => setProfile({...profile, experience: parseInt(e.target.value)})}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">📅 Status</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Online Status</span>
                <div className="flex items-center space-x-4">
                  <span className={`px-4 py-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`}>
                    {isOnline ? '🟢 Online' : '🔴 Offline'}
                  </span>
                  <button 
                    onClick={() => setIsOnline(!isOnline)}
                    className="bg-gradient-to-r from-green-500 to-teal-600 px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform"
                  >
                    {isOnline ? 'Go Offline' : 'Go Online'}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Availability</label>
                <select 
                  value={profile.availability}
                  onChange={(e) => setProfile({...profile, availability: e.target.value})}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-gray-800"
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Incoming Call Modal */}
        {incomingCall && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="text-6xl mb-4">📞</div>
                <h2 className="text-2xl font-bold mb-2">Incoming Call!</h2>
                <p className="text-xl mb-2">{incomingCall.recruiter.name}</p>
                <p className="text-white/80 mb-4">{incomingCall.recruiter.company}</p>
                <p className="text-sm text-white/60 mb-6">Match Score: {incomingCall.matchScore}%</p>
                
                <div className="flex space-x-4">
                  <button 
                    onClick={acceptCall}
                    className="bg-gradient-to-r from-green-500 to-teal-600 px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform flex-1"
                  >
                    ✅ Accept
                  </button>
                  <button 
                    onClick={rejectCall}
                    className="bg-gradient-to-r from-red-500 to-pink-600 px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform flex-1"
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-400">8</div>
            <p className="text-white/80">Total Calls</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-green-400">3</div>
            <p className="text-white/80">Positive Responses</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-400">85%</div>
            <p className="text-white/80">Avg Match Score</p>
          </div>
        </div>

        {/* Recent Calls */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">📋 Recent Calls</h2>
          <div className="space-y-3">
            {callHistory.slice(0, 3).map((call) => (
              <div key={call.id} className="bg-white/5 border border-white/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">{call.recruiter}</h3>
                    <p className="text-white/80 text-sm">{call.date} • {call.duration}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      call.decision === 'YES' ? 'bg-green-500' : 
                      call.decision === 'MAYBE' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}>
                      {call.decision}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}