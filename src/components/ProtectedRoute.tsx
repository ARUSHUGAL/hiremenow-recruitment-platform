import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'recruiter' | 'candidate';
  fallback?: ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallback 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Give some time for auth state to initialize
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setInitialLoadComplete(true);
      }, 100); // Small delay to ensure auth state is properly initialized
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Show loading state
  if (isLoading || !initialLoadComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'radial-gradient(at center, #703075, #2C1D76)'
      }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading...</h2>
          <p className="text-white/80">Please wait while we verify your authentication</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated || !user) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center p-8" style={{
        background: 'radial-gradient(at center, #703075, #2C1D76)'
      }}>
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🔒</div>
          <h2 className="text-3xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-white/80 mb-8">
            Please sign in to access this page. You need to be authenticated to use HireMeNow.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-purple-500 to-pink-600 px-8 py-4 rounded-full text-xl font-bold hover:scale-105 transition-transform"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check role requirement
  if (requiredRole && user.role !== requiredRole) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center p-8" style={{
        background: 'radial-gradient(at center, #703075, #2C1D76)'
      }}>
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🚫</div>
          <h2 className="text-3xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-white/80 mb-8">
            You don't have permission to access this page. This area is restricted to {requiredRole}s only.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-4 rounded-full text-xl font-bold hover:scale-105 transition-transform"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check verification status
  if (!user.isVerified) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center p-8" style={{
        background: 'radial-gradient(at center, #703075, #2C1D76)'
      }}>
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">⏳</div>
          <h2 className="text-3xl font-bold text-white mb-4">Account Verification Required</h2>
          <p className="text-white/80 mb-8">
            Your account is pending verification. Please complete the verification process to access all features.
          </p>
          <div className="bg-white/10 rounded-lg p-4 mb-6">
            <p className="text-white/80 text-sm">
              {user.role === 'recruiter' 
                ? 'Company ID verification is required for recruiters.'
                : 'LinkedIn profile verification is required for candidates.'
              }
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-yellow-500 to-orange-600 px-8 py-4 rounded-full text-xl font-bold hover:scale-105 transition-transform"
          >
            Complete Verification
          </button>
        </div>
      </div>
    );
  }

  // All checks passed, render children
  return <>{children}</>;
}
