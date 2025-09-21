import { useState } from 'react';

interface RecruiterFiltersProps {
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
}

export default function RecruiterFilters({ onClose, onApplyFilters }: RecruiterFiltersProps) {
  const [filters, setFilters] = useState({
    // Experience
    minExperience: '0',
    maxExperience: '10',
    
    // Skills
    requiredSkills: [] as string[],
    preferredSkills: [] as string[],
    
    // Location
    location: '',
    remoteWork: 'any', // any, required, not-required
    
    // Salary
    minSalary: '50000',
    maxSalary: '200000',
    
    // Education
    educationLevel: 'any', // any, bachelor, master, phd
    
    // Availability
    availability: 'any', // any, immediate, 2-weeks, 1-month
    
    // Company size preference
    companySize: 'any', // any, startup, mid-size, enterprise
    
    // Industry
    industry: 'any', // any, tech, finance, healthcare, etc.
    
    // Additional criteria
    hasPortfolio: false,
    hasCertifications: false,
    hasOpenSource: false,
    hasLeadership: false
  });

  const skillOptions = [
    'React', 'Node.js', 'TypeScript', 'Python', 'Java', 'C++', 'JavaScript',
    'AWS', 'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL', 'Redis',
    'Machine Learning', 'AI', 'Data Science', 'DevOps', 'Frontend',
    'Backend', 'Full Stack', 'Mobile Development', 'iOS', 'Android',
    'Vue.js', 'Angular', 'Express.js', 'Django', 'Flask', 'Spring Boot'
  ];

  const addRequiredSkill = (skill: string) => {
    if (skill.trim() && !filters.requiredSkills.includes(skill.trim())) {
      setFilters({
        ...filters,
        requiredSkills: [...filters.requiredSkills, skill.trim()]
      });
    }
  };

  const removeRequiredSkill = (skill: string) => {
    setFilters({
      ...filters,
      requiredSkills: filters.requiredSkills.filter(s => s !== skill)
    });
  };

  const addPreferredSkill = (skill: string) => {
    if (skill.trim() && !filters.preferredSkills.includes(skill.trim())) {
      setFilters({
        ...filters,
        preferredSkills: [...filters.preferredSkills, skill.trim()]
      });
    }
  };

  const removePreferredSkill = (skill: string) => {
    setFilters({
      ...filters,
      preferredSkills: filters.preferredSkills.filter(s => s !== skill)
    });
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const resetFilters = () => {
    setFilters({
      minExperience: '0',
      maxExperience: '10',
      requiredSkills: [],
      preferredSkills: [],
      location: '',
      remoteWork: 'any',
      minSalary: '50000',
      maxSalary: '200000',
      educationLevel: 'any',
      availability: 'any',
      companySize: 'any',
      industry: 'any',
      hasPortfolio: false,
      hasCertifications: false,
      hasOpenSource: false,
      hasLeadership: false
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">🔍 Filter Candidates</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Experience */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">💼 Experience</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Years of Experience</label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={filters.minExperience}
                      onChange={(e) => setFilters({...filters, minExperience: e.target.value})}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                      placeholder="Min"
                    />
                    <span className="text-gray-600">to</span>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={filters.maxExperience}
                      onChange={(e) => setFilters({...filters, maxExperience: e.target.value})}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                      placeholder="Max"
                    />
                    <span className="text-gray-600">years</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Required Skills */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">🛠️ Required Skills</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.requiredSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                  >
                    {skill}
                    <button
                      onClick={() => removeRequiredSkill(skill)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addRequiredSkill(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                >
                  <option value="">Select a skill...</option>
                  {skillOptions.map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Preferred Skills */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">⭐ Preferred Skills</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.preferredSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                  >
                    {skill}
                    <button
                      onClick={() => removePreferredSkill(skill)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addPreferredSkill(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                >
                  <option value="">Select a skill...</option>
                  {skillOptions.map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location & Remote */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">📍 Location</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Location</label>
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Remote Work</label>
                  <select
                    value={filters.remoteWork}
                    onChange={(e) => setFilters({...filters, remoteWork: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  >
                    <option value="any">Any</option>
                    <option value="required">Remote Required</option>
                    <option value="not-required">On-site Only</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Salary Range */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">💰 Salary Range</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Salary Range</label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="number"
                      min="0"
                      value={filters.minSalary}
                      onChange={(e) => setFilters({...filters, minSalary: e.target.value})}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                      placeholder="Min"
                    />
                    <span className="text-gray-600">to</span>
                    <input
                      type="number"
                      min="0"
                      value={filters.maxSalary}
                      onChange={(e) => setFilters({...filters, maxSalary: e.target.value})}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                      placeholder="Max"
                    />
                    <span className="text-gray-600">USD</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">🎓 Education</h3>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Education Level</label>
                <select
                  value={filters.educationLevel}
                  onChange={(e) => setFilters({...filters, educationLevel: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                >
                  <option value="any">Any</option>
                  <option value="high-school">High School</option>
                  <option value="bachelor">Bachelor's Degree</option>
                  <option value="master">Master's Degree</option>
                  <option value="phd">PhD</option>
                </select>
              </div>
            </div>

            {/* Availability */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">⏰ Availability</h3>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                <select
                  value={filters.availability}
                  onChange={(e) => setFilters({...filters, availability: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                >
                  <option value="any">Any</option>
                  <option value="immediate">Immediate</option>
                  <option value="2-weeks">Within 2 weeks</option>
                  <option value="1-month">Within 1 month</option>
                  <option value="2-months">Within 2 months</option>
                </select>
              </div>
            </div>

            {/* Additional Criteria */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">✨ Additional Criteria</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={filters.hasPortfolio}
                    onChange={(e) => setFilters({...filters, hasPortfolio: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Has Portfolio/GitHub</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={filters.hasCertifications}
                    onChange={(e) => setFilters({...filters, hasCertifications: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Has Certifications</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={filters.hasOpenSource}
                    onChange={(e) => setFilters({...filters, hasOpenSource: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Open Source Contributions</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={filters.hasLeadership}
                    onChange={(e) => setFilters({...filters, hasLeadership: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Leadership Experience</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={resetFilters}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
          >
            🔄 Reset Filters
          </button>
          <button
            onClick={handleApplyFilters}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
          >
            🔍 Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
