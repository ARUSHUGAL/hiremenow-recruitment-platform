import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import authService from '../services/authService';
import type { UserProfile } from '../types/auth';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize with current user from localStorage if available
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setIsLoading(false); // If we have a stored user, we're not loading
    }

    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChange((userProfile) => {
      setUser(userProfile);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const refreshUser = () => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signOut,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
