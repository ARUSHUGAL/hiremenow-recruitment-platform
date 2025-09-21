import { useState } from 'react';
import authService from '../services/authService';
import type { RecruiterSignupData, CandidateSignupData } from '../types/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type AuthMode = 'login' | 'signup-recruiter' | 'signup-candidate';
type AuthStep = 'form' | 'verification' | 'success';

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [step, setStep] = useState<AuthStep>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form data
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [recruiterData, setRecruiterData] = useState<RecruiterSignupData>({
    email: '',
    password: '',
    displayName: '',
    companyId: '',
    companyName: ''
  });
  const [candidateData, setCandidateData] = useState<CandidateSignupData>({
    email: '',
    password: '',
    displayName: '',
    linkedinProfile: ''
  });

  // Verification data
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setMode('login');
    setStep('form');
    setError(null);
    setSuccessMessage(null);
    setLoginData({ email: '', password: '' });
    setRecruiterData({ email: '', password: '', displayName: '', companyId: '', companyName: '' });
    setCandidateData({ email: '', password: '', displayName: '', linkedinProfile: '' });
    setVerificationCode('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authService.signIn(loginData.email, loginData.password);
      setSuccessMessage('Successfully signed in!');
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecruiterSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create demo recruiter data
      const demoRecruiterData = {
        email: 'demo@recruiter.com',
        password: 'demo123',
        displayName: 'Demo Recruiter',
        companyId: 'DEMO123',
        companyName: 'Demo Company',
      };
      
      // Use the actual auth service to create the account
      try {
        await authService.signUpRecruiter(demoRecruiterData);
      } catch (error) {
        // Fallback: create demo user directly
        const demoProfile = {
          uid: `recruiter-${Date.now()}`,
          email: 'demo@recruiter.com',
          displayName: 'Demo Recruiter',
          role: 'recruiter' as const,
          companyId: 'DEMO123',
          companyName: 'Demo Company',
          isVerified: true,
          createdAt: new Date(),
        };
        authService.setDemoUser(demoProfile);
      }
      
      // Instant success
      setStep('success');
      setSuccessMessage('Recruiter account created instantly! (Demo mode)');
      
      // Close modal after 1 second
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create demo candidate data
      const demoCandidateData = {
        email: 'demo@candidate.com',
        password: 'demo123',
        displayName: 'Demo Candidate',
        linkedinProfile: 'https://linkedin.com/in/demo-candidate',
      };
      
      // Use the actual auth service to create the account
      try {
        await authService.signUpCandidate(demoCandidateData);
      } catch (error) {
        // Fallback: create demo user directly
        const demoProfile = {
          uid: `candidate-${Date.now()}`,
          email: 'demo@candidate.com',
          displayName: 'Demo Candidate',
          role: 'candidate' as const,
          linkedinProfile: 'https://linkedin.com/in/demo-candidate',
          isVerified: true,
          createdAt: new Date(),
        };
        authService.setDemoUser(demoProfile);
      }
      
      // Instant success
      setStep('success');
      setSuccessMessage('Candidate account created instantly! (Demo mode)');
      
      // Close modal after 1 second
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async () => {
    setVerificationLoading(true);
    setError(null);

    try {
      let isValid = false;
      
      if (mode === 'signup-recruiter') {
        isValid = await authService.verifyCompanyId(recruiterData.companyId);
      } else if (mode === 'signup-candidate') {
        isValid = await authService.verifyLinkedInProfile(candidateData.linkedinProfile);
      }

      if (isValid) {
        setStep('success');
        setSuccessMessage('Verification successful! Your account is now active.');
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 2000);
      } else {
        setError('Verification failed. Please check your information and try again.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setVerificationLoading(false);
    }
  };

  const renderLoginForm = () => (
    <div className="text-center">
      <h3 className="text-xl font-bold text-white mb-6">Sign In to Your Account</h3>
      <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">Email</label>
        <input
          type="email"
          value={loginData.email}
          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Enter your email"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">Password</label>
        <input
          type="password"
          value={loginData.password}
          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Enter your password"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-600 py-3 rounded-lg font-bold text-white hover:from-purple-600 hover:to-pink-700 transition-all duration-300 disabled:opacity-50"
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </button>
    </form>
    </div>
  );

  const renderRecruiterSignupForm = () => (
    <div className="text-center">
      <h3 className="text-xl font-bold text-white mb-6">Sign Up as Recruiter</h3>
      <form onSubmit={handleRecruiterSignup} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">Full Name</label>
        <input
          type="text"
          value={recruiterData.displayName}
          onChange={(e) => setRecruiterData({ ...recruiterData, displayName: e.target.value })}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Enter your full name (optional for demo)"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">Work Email</label>
        <input
          type="email"
          value={recruiterData.email}
          onChange={(e) => setRecruiterData({ ...recruiterData, email: e.target.value })}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Enter your work email (optional for demo)"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">Company Name</label>
        <input
          type="text"
          value={recruiterData.companyName}
          onChange={(e) => setRecruiterData({ ...recruiterData, companyName: e.target.value })}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Enter your company name (optional for demo)"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">Company ID</label>
        <input
          type="text"
          value={recruiterData.companyId}
          onChange={(e) => setRecruiterData({ ...recruiterData, companyId: e.target.value })}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="e.g., ABC123, COMP-ABC123 (optional for demo)"
        />
        <p className="text-xs text-white/60 mt-1">
          Format: ABC123, ABCD1234, COMP-ABC123, or ABC-1234
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">Password</label>
        <input
          type="password"
          value={recruiterData.password}
          onChange={(e) => setRecruiterData({ ...recruiterData, password: e.target.value })}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Create a strong password (optional for demo)"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-600 py-3 rounded-lg font-bold text-white hover:from-purple-600 hover:to-pink-700 transition-all duration-300 disabled:opacity-50"
      >
        {loading ? 'Creating Account...' : 'Create Recruiter Account'}
      </button>
    </form>
    </div>
  );

  const renderCandidateSignupForm = () => (
    <div className="text-center">
      <h3 className="text-xl font-bold text-white mb-6">Sign Up as Candidate</h3>
      <form onSubmit={handleCandidateSignup} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">Full Name</label>
        <input
          type="text"
          value={candidateData.displayName}
          onChange={(e) => setCandidateData({ ...candidateData, displayName: e.target.value })}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Enter your full name (optional for demo)"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">Email</label>
        <input
          type="email"
          value={candidateData.email}
          onChange={(e) => setCandidateData({ ...candidateData, email: e.target.value })}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Enter your email (optional for demo)"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">LinkedIn Profile URL</label>
        <input
          type="url"
          value={candidateData.linkedinProfile}
          onChange={(e) => setCandidateData({ ...candidateData, linkedinProfile: e.target.value })}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="https://linkedin.com/in/yourprofile (optional for demo)"
        />
        <p className="text-xs text-white/60 mt-1">
          We'll verify your LinkedIn profile to ensure authenticity
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">Password</label>
        <input
          type="password"
          value={candidateData.password}
          onChange={(e) => setCandidateData({ ...candidateData, password: e.target.value })}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Create a strong password (optional for demo)"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-green-500 to-teal-600 py-3 rounded-lg font-bold text-white hover:from-green-600 hover:to-teal-700 transition-all duration-300 disabled:opacity-50"
      >
        {loading ? 'Creating Account...' : 'Create Candidate Account'}
      </button>
    </form>
    </div>
  );

  const renderVerificationStep = () => (
    <div className="text-center space-y-6">
      <div className="text-6xl mb-4">
        {mode === 'signup-recruiter' ? '🏢' : '💼'}
      </div>
      <h3 className="text-2xl font-bold text-white">
        {mode === 'signup-recruiter' ? 'Verify Company ID' : 'Verify LinkedIn Profile'}
      </h3>
      <p className="text-white/80">
        {mode === 'signup-recruiter' 
          ? 'We need to verify your company ID to ensure you\'re a legitimate recruiter.'
          : 'We need to verify your LinkedIn profile to ensure authenticity.'
        }
      </p>
      
      <div className="bg-white/10 rounded-lg p-4 text-left">
        <h4 className="font-semibold text-white mb-2">Verification Details:</h4>
        {mode === 'signup-recruiter' ? (
          <div className="space-y-2 text-sm text-white/80">
            <p><strong>Company:</strong> {recruiterData.companyName}</p>
            <p><strong>Company ID:</strong> {recruiterData.companyId}</p>
            <p><strong>Email:</strong> {recruiterData.email}</p>
          </div>
        ) : (
          <div className="space-y-2 text-sm text-white/80">
            <p><strong>Name:</strong> {candidateData.displayName}</p>
            <p><strong>Email:</strong> {candidateData.email}</p>
            <p><strong>LinkedIn:</strong> {candidateData.linkedinProfile}</p>
          </div>
        )}
      </div>

      <button
        onClick={handleVerification}
        disabled={verificationLoading}
        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 py-3 rounded-lg font-bold text-white hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50"
      >
        {verificationLoading ? 'Verifying...' : 'Verify & Complete Setup'}
      </button>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="text-center space-y-6">
      <div className="text-6xl mb-4">🎉</div>
      <h3 className="text-2xl font-bold text-white">Welcome to HireMeNow!</h3>
      <p className="text-white/80">
        Your account has been created and verified successfully! (Demo mode - verification bypassed)
      </p>
      <div className="bg-white/10 rounded-lg p-4">
        <p className="text-white/80 text-sm">
          Redirecting you to the dashboard...
        </p>
      </div>
    </div>
  );

  const renderForm = () => {
    switch (step) {
      case 'verification':
        return renderVerificationStep();
      case 'success':
        return renderSuccessStep();
      default:
        switch (mode) {
          case 'login':
            return renderLoginForm();
          case 'signup-recruiter':
            return renderRecruiterSignupForm();
          case 'signup-candidate':
            return renderCandidateSignupForm();
          default:
            return null;
        }
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div 
        className="bg-white/10 backdrop-blur-lg border border-white/30 rounded-2xl p-8 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{
          maxWidth: '28rem',
          width: '100%',
          margin: '0 1rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative mb-6">
          <button
            onClick={handleClose}
            className="absolute top-0 right-0 text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-2xl font-bold text-white text-center">
            {step === 'verification' ? 'Verification' : 
             step === 'success' ? 'Success!' :
             mode === 'login' ? 'Sign In' : 'Sign Up'}
          </h2>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6">
            <p className="text-green-200 text-sm">{successMessage}</p>
          </div>
        )}

        {renderForm()}

        {step === 'form' && (
          <div className="mt-6 space-y-4">
            <div className="text-center text-white/60 text-sm">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            </div>
            
            {mode === 'login' ? (
              <div className="space-y-3">
                <button
                  onClick={() => setMode('signup-recruiter')}
                  className="w-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 py-3 rounded-lg font-semibold text-white hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300"
                >
                  👩‍💼 Sign Up as Recruiter
                </button>
                <button
                  onClick={() => setMode('signup-candidate')}
                  className="w-full bg-gradient-to-r from-green-500/20 to-teal-500/20 border border-green-500/50 py-3 rounded-lg font-semibold text-white hover:from-green-500/30 hover:to-teal-500/30 transition-all duration-300"
                >
                  👨‍💻 Sign Up as Candidate
                </button>
              </div>
            ) : (
              <button
                onClick={() => setMode('login')}
                className="w-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/50 py-3 rounded-lg font-semibold text-white hover:from-blue-500/30 hover:to-indigo-500/30 transition-all duration-300"
              >
                Sign In Instead
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
