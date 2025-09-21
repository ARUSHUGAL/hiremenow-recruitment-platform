import { useState, useEffect } from 'react';

interface CandidateStatsProps {
  onClose: () => void;
}

export default function CandidateStats({ onClose }: CandidateStatsProps) {
  const [stats, setStats] = useState({
    profileViews: 0,
    interviewsCompleted: 0,
    matchSuccessRate: 0,
    averageMatchScore: 0,
    totalTimeSpent: 0,
    skillsMatched: 0,
    companiesInterested: 0,
    lastActive: new Date().toISOString()
  });

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'profile_view',
      company: 'TechCorp',
      recruiter: 'Sarah Wilson',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      matchScore: 87
    },
    {
      id: 2,
      type: 'interview',
      company: 'StartupXYZ',
      recruiter: 'Mike Chen',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      matchScore: 92
    },
    {
      id: 3,
      type: 'profile_view',
      company: 'BigTech Inc',
      recruiter: 'Emily Davis',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      matchScore: 78
    },
    {
      id: 4,
      type: 'interview',
      company: 'InnovateLab',
      recruiter: 'David Park',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      matchScore: 85
    }
  ]);

  const [weeklyStats, setWeeklyStats] = useState([
    { day: 'Mon', views: 3, interviews: 1 },
    { day: 'Tue', views: 5, interviews: 2 },
    { day: 'Wed', views: 2, interviews: 0 },
    { day: 'Thu', views: 7, interviews: 1 },
    { day: 'Fri', views: 4, interviews: 1 },
    { day: 'Sat', views: 1, interviews: 0 },
    { day: 'Sun', views: 2, interviews: 0 }
  ]);

  useEffect(() => {
    // Simulate loading stats
    const loadStats = () => {
      setStats({
        profileViews: 24,
        interviewsCompleted: 4,
        matchSuccessRate: 87,
        averageMatchScore: 85,
        totalTimeSpent: 180, // minutes
        skillsMatched: 8,
        companiesInterested: 6,
        lastActive: new Date().toISOString()
      });
    };

    loadStats();
  }, []);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'profile_view': return '👀';
      case 'interview': return '🎥';
      default: return '📊';
    }
  };

  const getActivityText = (type: string) => {
    switch (type) {
      case 'profile_view': return 'Profile viewed by';
      case 'interview': return 'Interview with';
      default: return 'Activity with';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">📊 My Stats</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-800">{stats.profileViews}</div>
            <div className="text-sm text-blue-600">Profile Views</div>
          </div>
          <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-800">{stats.interviewsCompleted}</div>
            <div className="text-sm text-green-600">Interviews</div>
          </div>
          <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-800">{stats.matchSuccessRate}%</div>
            <div className="text-sm text-purple-600">Success Rate</div>
          </div>
          <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-800">{stats.averageMatchScore}%</div>
            <div className="text-sm text-orange-600">Avg Match Score</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Weekly Activity Chart */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">📈 Weekly Activity</h3>
            <div className="space-y-3">
              {weeklyStats.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 text-sm font-medium text-gray-700">{day.day}</div>
                    <div className="flex space-x-2">
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">{day.views} views</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">{day.interviews} interviews</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">🎯 Performance Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Time Spent</span>
                <span className="font-bold text-gray-900">{formatTime(stats.totalTimeSpent)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Skills Matched</span>
                <span className="font-bold text-gray-900">{stats.skillsMatched}/10</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Companies Interested</span>
                <span className="font-bold text-gray-900">{stats.companiesInterested}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Last Active</span>
                <span className="font-bold text-gray-900">{formatTimestamp(stats.lastActive)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4 text-gray-800">🕒 Recent Activity</h3>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {getActivityText(activity.type)} {activity.recruiter}
                      </div>
                      <div className="text-sm text-gray-600">{activity.company}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{activity.matchScore}% match</div>
                    <div className="text-xs text-gray-500">{formatTimestamp(activity.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4 text-gray-800">💡 Insights & Recommendations</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg p-6">
              <h4 className="font-bold text-green-800 mb-2">✅ Strengths</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• High match scores (85%+ average)</li>
                <li>• Strong interview completion rate</li>
                <li>• Active profile engagement</li>
                <li>• Good skill diversity</li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg p-6">
              <h4 className="font-bold text-yellow-800 mb-2">🚀 Opportunities</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Add more technical skills</li>
                <li>• Update profile summary</li>
                <li>• Increase availability hours</li>
                <li>• Connect with more recruiters</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center mt-8">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
