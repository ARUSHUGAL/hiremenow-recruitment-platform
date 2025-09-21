import { useState } from 'react';

interface CandidateProfileProps {
  onClose: () => void;
}

interface ParsedResume {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  title?: string;
  experience?: string;
  skills?: string[];
  education?: string;
  summary?: string;
}

export default function CandidateProfile({ onClose }: CandidateProfileProps) {
  const [profile, setProfile] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    phone: "(555) 123-4567",
    location: "San Francisco, CA",
    title: "Full Stack Developer",
    experience: "5 years",
    skills: ["React", "Node.js", "TypeScript", "Python", "AWS"],
    education: "Bachelor of Computer Science - Stanford University",
    summary: "Experienced full-stack developer with 5+ years in React, Node.js, and cloud technologies. Passionate about building scalable web applications and leading technical teams.",
    availability: "Available immediately",
    salary: "$120,000 - $150,000",
    remote: true
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState(profile);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [manualText, setManualText] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const handleSave = () => {
    setProfile(tempProfile);
    setIsEditing(false);
    alert('✅ Profile updated successfully! Your matching score will improve.');
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setIsEditing(false);
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !tempProfile.skills.includes(skill.trim())) {
      setTempProfile({
        ...tempProfile,
        skills: [...tempProfile.skills, skill.trim()]
      });
    }
  };

  const removeSkill = (skill: string) => {
    setTempProfile({
      ...tempProfile,
      skills: tempProfile.skills.filter(s => s !== skill)
    });
  };

  // Resume parsing function - simplified approach
  const parseResume = async (file: File): Promise<ParsedResume> => {
    const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    
    if (isPDF) {
      // For PDF files, show helpful instructions instead of trying to parse
      throw new Error('PDF_DETECTED');
    } else {
      // For TXT files, parse normally
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          resolve(parseResumeText(text));
        };
        reader.readAsText(file);
      });
    }
  };

  // Generate professional summary automatically
  const generateProfessionalSummary = (parsed: ParsedResume, text: string): string => {
    console.log('🤖 Generating professional summary...');
    
    const parts: string[] = [];
    
    // Start with experience and title
    if (parsed.title && parsed.experience) {
      parts.push(`Experienced ${parsed.title.toLowerCase()} with ${parsed.experience} of professional experience`);
    } else if (parsed.title) {
      parts.push(`Professional ${parsed.title.toLowerCase()}`);
    } else if (parsed.experience) {
      parts.push(`Experienced professional with ${parsed.experience} of experience`);
    }
    
    // Add skills
    if (parsed.skills && parsed.skills.length > 0) {
      const topSkills = parsed.skills.slice(0, 5); // Take top 5 skills
      parts.push(`specializing in ${topSkills.join(', ')}`);
    }
    
    // Add education if available
    if (parsed.education) {
      const eduKeywords = ['Bachelor', 'Master', 'PhD', 'B.S.', 'M.S.', 'Ph.D.', 'University', 'College'];
      const hasEducation = eduKeywords.some(keyword => parsed.education!.includes(keyword));
      if (hasEducation) {
        parts.push(`with strong educational background`);
      }
    }
    
    // Add location if available
    if (parsed.location) {
      parts.push(`based in ${parsed.location}`);
    }
    
    // Add professional qualities based on text analysis
    const professionalQualities: string[] = [];
    
    if (text.toLowerCase().includes('lead') || text.toLowerCase().includes('manage')) {
      professionalQualities.push('leadership');
    }
    if (text.toLowerCase().includes('team') || text.toLowerCase().includes('collaborat')) {
      professionalQualities.push('team collaboration');
    }
    if (text.toLowerCase().includes('problem') || text.toLowerCase().includes('solve')) {
      professionalQualities.push('problem-solving');
    }
    if (text.toLowerCase().includes('innov') || text.toLowerCase().includes('creative')) {
      professionalQualities.push('innovation');
    }
    if (text.toLowerCase().includes('analyt') || text.toLowerCase().includes('data')) {
      professionalQualities.push('analytical thinking');
    }
    
    if (professionalQualities.length > 0) {
      parts.push(`known for ${professionalQualities.slice(0, 3).join(', ')}`);
    }
    
    // Add passion statement
    if (parsed.skills && parsed.skills.length > 0) {
      const techSkills = parsed.skills.filter(skill => 
        ['JavaScript', 'Python', 'React', 'Node.js', 'Java', 'C++', 'AWS', 'Docker'].includes(skill)
      );
      if (techSkills.length > 0) {
        parts.push(`passionate about building scalable solutions and staying current with technology trends`);
      } else {
        parts.push(`passionate about delivering high-quality results and continuous professional growth`);
      }
    } else {
      parts.push(`passionate about delivering high-quality results and continuous professional growth`);
    }
    
    // Combine all parts
    let summary = parts.join(', ');
    
    // Ensure it ends with a period
    if (!summary.endsWith('.')) {
      summary += '.';
    }
    
    // Capitalize first letter
    summary = summary.charAt(0).toUpperCase() + summary.slice(1);
    
    console.log('✅ Generated summary:', summary);
    return summary;
  };

  // Parse resume text (common function for both PDF and TXT)
  const parseResumeText = (text: string): ParsedResume => {
    console.log('🔍 Starting to parse resume text...');
    console.log('📄 Text length:', text.length);
    console.log('📄 First 200 characters:', text.substring(0, 200));
    
    const parsed: ParsedResume = {};
    
    // Extract name - simplified approach
    const nameRegex = /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/m;
    const nameMatch = text.match(nameRegex);
    console.log('👤 Name match:', nameMatch);
    
    if (nameMatch) {
      const fullName = nameMatch[1].trim();
      console.log('👤 Full name found:', fullName);
      parsed.name = fullName; // Use any name found for now
      console.log('✅ Name parsed:', parsed.name);
    } else {
      console.log('❌ No name match found');
    }
    
    // Extract email - improved accuracy
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    const emailMatches = text.match(emailRegex);
    console.log('📧 Email matches found:', emailMatches);
    
    if (emailMatches && emailMatches.length > 0) {
      // Use the first email found for now
      parsed.email = emailMatches[0];
      console.log('✅ Email parsed:', parsed.email);
    } else {
      console.log('❌ No email matches found');
    }
    
    // Extract phone - simplified approach
    const phoneRegex = /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g;
    const phoneMatches = text.match(phoneRegex);
    console.log('📞 Phone matches found:', phoneMatches);
    
    if (phoneMatches && phoneMatches.length > 0) {
      parsed.phone = phoneMatches[0];
      console.log('✅ Phone parsed:', parsed.phone);
    } else {
      console.log('❌ No phone matches found');
    }
    
    // Extract location
    const locationMatch = text.match(/([A-Z][a-z]+(?: [A-Z][a-z]+)*,?\s*[A-Z]{2}(?:\s*\d{5})?)/);
    if (locationMatch) parsed.location = locationMatch[1];
    
    // Extract job title - improved accuracy
    const titleRegex = /(Software Engineer|Developer|Programmer|Frontend|Backend|Full Stack|DevOps|Data Scientist|Product Manager|Designer|Analyst|Consultant|Manager|Director|Lead|Senior|Junior|Intern|Engineer|Architect|Specialist|Coordinator|Executive|Officer|Assistant|Technician|Technologist)/i;
    const titleMatch = text.match(titleRegex);
    
    if (titleMatch) {
      const title = titleMatch[1];
      // Filter out common placeholder titles
      if (!title.toLowerCase().includes('example') &&
          !title.toLowerCase().includes('sample') &&
          !title.toLowerCase().includes('placeholder') &&
          title.length > 3) {
        parsed.title = title;
      }
    }
    
    // Extract experience
    const expMatch = text.match(/(\d+)\+?\s*(?:years?|yrs?)/i);
    if (expMatch) {
      const years = parseInt(expMatch[1]);
      if (years <= 1) parsed.experience = "0-1 years";
      else if (years <= 2) parsed.experience = "1-2 years";
      else if (years <= 3) parsed.experience = "2-3 years";
      else if (years <= 5) parsed.experience = "3-5 years";
      else parsed.experience = "5+ years";
    }
    
    // Extract skills
    const skillsKeywords = [
      'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Node.js', 'Python', 'Java', 'C++', 'C#',
      'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'HTML', 'CSS', 'SASS', 'LESS',
      'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
      'Git', 'GitHub', 'GitLab', 'Jenkins', 'CI/CD', 'REST', 'GraphQL', 'Microservices', 'Agile', 'Scrum'
    ];
    
    const foundSkills: string[] = [];
    skillsKeywords.forEach(skill => {
      if (text.toLowerCase().includes(skill.toLowerCase())) {
        foundSkills.push(skill);
      }
    });
    if (foundSkills.length > 0) parsed.skills = foundSkills;
    
    // Extract education
    const eduMatch = text.match(/(Bachelor|Master|PhD|B\.S\.|M\.S\.|Ph\.D\.|University|College|Institute)[^.]*/i);
    if (eduMatch) parsed.education = eduMatch[1];
    
    // Extract summary (first paragraph or objective section)
    const summaryMatch = text.match(/(?:Summary|Objective|About|Profile)[:\s]*([^.\n]+(?:\.[^.\n]+)*)/i);
    if (summaryMatch) {
      parsed.summary = summaryMatch[1].trim();
    } else {
      // Generate summary automatically if not found
      parsed.summary = generateProfessionalSummary(parsed, text);
    }
    
    // Debug logging
    console.log('🔍 Parsed resume data:', parsed);
    
    return parsed;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type - support both PDF and TXT
    const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isTXT = file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt');
    
    if (!isPDF && !isTXT) {
      alert('Please upload a PDF or TXT file. Supported formats: .pdf, .txt');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      console.log('🚀 Starting resume parsing for file:', file.name, 'Type:', file.type);
      
      // Parse both PDF and TXT files automatically
      const parsedData = await parseResume(file);
      console.log('✅ Resume parsing completed:', parsedData);
      console.log('📊 Parsed data keys:', Object.keys(parsedData));
      console.log('📊 Parsed data values:', Object.values(parsedData));
      
      // Update temp profile with parsed data
      setTempProfile(prev => ({
        ...prev,
        ...parsedData,
        skills: parsedData.skills ? [...new Set([...prev.skills, ...parsedData.skills])] : prev.skills
      }));

      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        alert(`✅ Resume parsed successfully! Extracted: ${Object.keys(parsedData).length} fields. Please review and edit the information below.`);
      }, 500);

    } catch (error) {
      console.error('❌ Resume parsing failed:', error);
      setIsUploading(false);
      setUploadProgress(0);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      
      if (errorMessage === 'PDF_DETECTED' || isPDF) {
        // Show helpful PDF instructions
        alert(`📄 PDF File Detected!\n\nFor best results with PDF files:\n\n1️⃣ Open your PDF in a browser or PDF viewer\n2️⃣ Select all text (Ctrl+A / Cmd+A)\n3️⃣ Copy the text (Ctrl+C / Cmd+C)\n4️⃣ Paste it in the text area below\n5️⃣ Click "Parse Text" to extract information\n\n💡 This method works with any PDF format!`);
        setShowManualInput(true); // Automatically show manual input
      } else {
        alert(`❌ Error parsing resume: ${errorMessage}\n\nPlease try again or enter information manually.`);
      }
    }
  };

  const parseManualText = async () => {
    if (!manualText.trim()) {
      alert('Please enter some resume text to parse.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate parsing progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      console.log('📝 Starting manual text parsing...');
      console.log('📝 Manual text length:', manualText.length);
      console.log('📝 Manual text preview:', manualText.substring(0, 200));
      
      // Parse the manual text using the same function as file parsing
      const parsedData = parseResumeText(manualText);
      console.log('✅ Manual parsing completed:', parsedData);
      
      // Update temp profile with parsed data
      setTempProfile(prev => ({
        ...prev,
        ...parsedData,
        skills: parsedData.skills ? [...new Set([...prev.skills, ...parsedData.skills])] : prev.skills
      }));

      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setManualText('');
        setShowManualInput(false);
        alert(`✅ Resume text parsed successfully! Extracted: ${Object.keys(parsedData).length} fields. Please review and edit the information below.`);
      }, 500);

    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      alert('❌ Error parsing resume text. Please try again or enter information manually.');
    }
  };

  const calculateMatchScore = () => {
    // Simulate match score calculation based on profile completeness
    const baseScore = 60;
    const skillBonus = tempProfile.skills.length * 3;
    const summaryBonus = tempProfile.summary.length > 100 ? 10 : 0;
    const educationBonus = tempProfile.education ? 5 : 0;
    const experienceBonus = parseInt(tempProfile.experience) * 2;
    
    return Math.min(95, baseScore + skillBonus + summaryBonus + educationBonus + experienceBonus);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <style dangerouslySetInnerHTML={{
          __html: `
            input, textarea, select {
              color: #000000 !important;
            }
            input::placeholder, textarea::placeholder {
              color: #6b7280 !important;
            }
          `
        }} />
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">📝 Update Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Match Score */}
        <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Current Match Score</h3>
              <p className="text-sm text-gray-600">Based on profile completeness</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">{calculateMatchScore()}%</div>
              <div className="text-sm text-gray-600">Compatibility</div>
            </div>
          </div>
        </div>

        {!isEditing ? (
          /* View Mode */
          <div className="space-y-6">
            {/* Personal Info */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">👤 Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                  <p className="text-gray-900">{profile.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{profile.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                  <p className="text-gray-900">{profile.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                  <p className="text-gray-900">{profile.location}</p>
                </div>
              </div>
            </div>

            {/* Professional Info */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">💼 Professional Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Job Title</label>
                  <p className="text-gray-900">{profile.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Experience</label>
                  <p className="text-gray-900">{profile.experience}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Salary Range</label>
                  <p className="text-gray-900">{profile.salary}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Remote Work</label>
                  <p className="text-gray-900">{profile.remote ? "Yes" : "No"}</p>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">🛠️ Technical Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">📝 Professional Summary</h3>
              <p className="text-gray-900 leading-relaxed">{profile.summary}</p>
            </div>

            {/* Education */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">🎓 Education</h3>
              <p className="text-gray-900">{profile.education}</p>
            </div>

            {/* Actions */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
              >
                ✏️ Edit Profile
              </button>
              <button
                onClick={() => {
                  setIsEditing(true);
                  // Scroll to upload section after a brief delay
                  setTimeout(() => {
                    const uploadSection = document.querySelector('[data-upload-section]');
                    uploadSection?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
              >
                📄 Upload Resume
              </button>
              <button
                onClick={onClose}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <div className="space-y-6">
            {/* Resume Upload Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-dashed border-blue-300" data-upload-section>
              <h3 className="text-xl font-bold mb-4 text-gray-800">📄 Upload Resume</h3>
              <p className="text-gray-600 mb-4">
                Upload your resume (PDF or TXT file) and we'll automatically extract your information to fill the form below.
              </p>
              
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                  id="resume-upload"
                />
                <label
                  htmlFor="resume-upload"
                  className={`px-6 py-3 rounded-lg font-bold transition-colors cursor-pointer ${
                    isUploading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isUploading ? '⏳ Processing...' : '📁 Choose Resume File'}
                </label>
                
                {isUploading && (
                  <div className="flex-1">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Parsing resume... {uploadProgress}%</p>
                  </div>
                )}
              </div>
              
              <div className="mt-3 text-sm text-gray-500">
                <p>📄 <strong>File Upload:</strong> Upload TXT files for automatic parsing, or PDF files for manual text extraction</p>
                <p>🔍 We'll extract: Name, Contact Info, Skills, Experience, Education, and Summary</p>
                <p>💡 <strong>For PDF files:</strong> We'll guide you through copying the text - it's quick and works with any PDF!</p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-blue-200">
                <button
                  onClick={() => setShowManualInput(!showManualInput)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium underline mb-3"
                >
                  {showManualInput ? '📁 Hide Text Input' : '📝 Paste Resume Text (Works with any PDF!)'}
                </button>
                
                {showManualInput && (
                  <div className="space-y-3">
                    <textarea
                      value={manualText}
                      onChange={(e) => setManualText(e.target.value)}
                      placeholder="Paste your resume text here (from PDF or any document)..."
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-black"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={parseManualText}
                        disabled={isUploading || !manualText.trim()}
                        className={`px-4 py-2 rounded-lg font-bold transition-colors text-sm ${
                          isUploading || !manualText.trim()
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {isUploading ? '⏳ Parsing...' : '🔍 Parse Text'}
                      </button>
                      <button
                        onClick={() => {
                          setManualText('');
                          setShowManualInput(false);
                        }}
                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-bold transition-colors text-sm"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-blue-200">
                <button
                  onClick={() => {
                    // Generate sample resume data for testing
                    const sampleData: ParsedResume = {
                      name: "Sarah Chen",
                      email: "sarah.chen@email.com",
                      phone: "(555) 987-6543",
                      location: "Seattle, WA",
                      title: "Senior Software Engineer",
                      experience: "5+ years",
                      skills: ["React", "TypeScript", "Node.js", "AWS", "Docker", "Python"],
                      education: "Master of Computer Science - University of Washington",
                      summary: "Experienced software engineer with 5+ years developing scalable web applications. Passionate about clean code, team collaboration, and continuous learning."
                    };
                    
                    setTempProfile(prev => ({
                      ...prev,
                      ...sampleData,
                      skills: [...new Set([...prev.skills, ...sampleData.skills!])]
                    }));
                    
                    alert('✅ Sample resume data loaded! This demonstrates how the parsing would work.');
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                >
                  🧪 Try with Sample Data (Demo)
                </button>
              </div>
            </div>

            {/* Personal Info */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">👤 Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={tempProfile.name}
                    onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={tempProfile.email}
                    onChange={(e) => setTempProfile({...tempProfile, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={tempProfile.phone}
                    onChange={(e) => setTempProfile({...tempProfile, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={tempProfile.location}
                    onChange={(e) => setTempProfile({...tempProfile, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Professional Info */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">💼 Professional Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    value={tempProfile.title}
                    onChange={(e) => setTempProfile({...tempProfile, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Experience</label>
                  <select
                    value={tempProfile.experience}
                    onChange={(e) => setTempProfile({...tempProfile, experience: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-500"
                  >
                    <option value="0-1 years">0-1 years</option>
                    <option value="1-2 years">1-2 years</option>
                    <option value="2-3 years">2-3 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="5+ years">5+ years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Salary Range</label>
                  <select
                    value={tempProfile.salary}
                    onChange={(e) => setTempProfile({...tempProfile, salary: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-500"
                  >
                    <option value="$50,000 - $70,000">$50,000 - $70,000</option>
                    <option value="$70,000 - $90,000">$70,000 - $90,000</option>
                    <option value="$90,000 - $120,000">$90,000 - $120,000</option>
                    <option value="$120,000 - $150,000">$120,000 - $150,000</option>
                    <option value="$150,000+">$150,000+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Remote Work</label>
                  <select
                    value={tempProfile.remote ? "Yes" : "No"}
                    onChange={(e) => setTempProfile({...tempProfile, remote: e.target.value === "Yes"})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-500"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">🛠️ Technical Skills</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {tempProfile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                  >
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a skill..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addSkill(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Add a skill..."]') as HTMLInputElement;
                    if (input) {
                      addSkill(input.value);
                      input.value = '';
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">📝 Professional Summary</h3>
                <button
                  onClick={() => {
                    const generatedSummary = generateProfessionalSummary(tempProfile, '');
                    setTempProfile({...tempProfile, summary: generatedSummary});
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold transition-colors text-sm"
                >
                  🤖 Generate Summary
                </button>
              </div>
              <textarea
                value={tempProfile.summary}
                onChange={(e) => setTempProfile({...tempProfile, summary: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your experience, skills, and career goals..."
              />
              <p className="text-sm text-gray-500 mt-2">
                💡 <strong>Tip:</strong> Click "Generate Summary" to automatically create a professional summary based on your profile information.
              </p>
            </div>

            {/* Education */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">🎓 Education</h3>
              <input
                type="text"
                value={tempProfile.education}
                onChange={(e) => setTempProfile({...tempProfile, education: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your educational background..."
              />
            </div>

            {/* Actions */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
              >
                💾 Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
