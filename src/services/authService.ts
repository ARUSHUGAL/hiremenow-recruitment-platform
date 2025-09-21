import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  type User
} from 'firebase/auth';
import { auth } from '../firebase';
import type { UserProfile, RecruiterSignupData, CandidateSignupData } from '../types/auth';

class AuthService {
  private currentUser: User | null = null;
  private userProfile: UserProfile | null = null;
  private authStateListeners: ((user: UserProfile | null) => void)[] = [];

  constructor() {
    // Initialize with stored user profile if available
    this.initializeFromStorage();
    
    // Listen to auth state changes
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;
      if (user) {
        this.userProfile = await this.getUserProfile(user.uid);
      } else {
        this.userProfile = null;
      }
      this.notifyAuthStateListeners();
    });
  }

  // Initialize user profile from localStorage on app start
  private initializeFromStorage() {
    try {
      // Get all localStorage keys that start with 'userProfile_'
      const keys = Object.keys(localStorage).filter(key => key.startsWith('userProfile_'));
      if (keys.length > 0) {
        // Get the most recent user profile
        const latestKey = keys[keys.length - 1];
        const stored = localStorage.getItem(latestKey);
        if (stored) {
          const profile = JSON.parse(stored);
          profile.createdAt = new Date(profile.createdAt);
          this.userProfile = profile;
          console.log('✅ Restored user profile from localStorage:', profile);
        }
      }
    } catch (error) {
      console.error('❌ Error initializing from storage:', error);
    }
  }

  // Subscribe to auth state changes
  public onAuthStateChange(callback: (user: UserProfile | null) => void): () => void {
    this.authStateListeners.push(callback);
    // Immediately call with current state
    callback(this.userProfile);
    
    return () => {
      this.authStateListeners = this.authStateListeners.filter(listener => listener !== callback);
    };
  }

  // Force refresh auth state (useful for debugging)
  public refreshAuthState(): void {
    this.notifyAuthStateListeners();
  }

  private notifyAuthStateListeners() {
    this.authStateListeners.forEach(listener => listener(this.userProfile));
  }

  // Get current user profile
  public getCurrentUser(): UserProfile | null {
    return this.userProfile;
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Check if user has stored profile (for persistence)
  public hasStoredProfile(): boolean {
    return this.userProfile !== null;
  }

  // Check if user has specific role
  public hasRole(role: 'recruiter' | 'candidate'): boolean {
    return this.userProfile?.role === role;
  }

  // Sign up recruiter with company ID validation
  public async signUpRecruiter(data: RecruiterSignupData): Promise<UserProfile> {
    try {
      console.log('🔄 Creating recruiter account...');
      
      // Validate company ID format (basic validation)
      if (!this.validateCompanyId(data.companyId)) {
        throw new Error('Invalid company ID format. Please use a valid company identifier.');
      }

      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      // Update display name
      await updateProfile(userCredential.user, {
        displayName: data.displayName
      });

      // Create user profile
      const userProfile: UserProfile = {
        uid: userCredential.user.uid,
        email: data.email,
        displayName: data.displayName,
        role: 'recruiter',
        companyId: data.companyId,
        companyName: data.companyName,
        isVerified: true, // Bypass verification for demo
        createdAt: new Date()
      };

      // Store profile in localStorage (in real app, this would be in Firestore)
      this.storeUserProfile(userProfile);

      console.log('✅ Recruiter account created successfully');
      return userProfile;
    } catch (error: any) {
      console.error('❌ Error creating recruiter account:', error);
      throw new Error(this.getFirebaseErrorMessage(error));
    }
  }

  // Sign up candidate with LinkedIn verification
  public async signUpCandidate(data: CandidateSignupData): Promise<UserProfile> {
    try {
      console.log('🔄 Creating candidate account...');
      
      // Validate LinkedIn profile URL
      if (!this.validateLinkedInProfile(data.linkedinProfile)) {
        throw new Error('Invalid LinkedIn profile URL. Please provide a valid LinkedIn profile link.');
      }

      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      // Update display name
      await updateProfile(userCredential.user, {
        displayName: data.displayName
      });

      // Create user profile
      const userProfile: UserProfile = {
        uid: userCredential.user.uid,
        email: data.email,
        displayName: data.displayName,
        role: 'candidate',
        linkedinProfile: data.linkedinProfile,
        isVerified: true, // Bypass verification for demo
        createdAt: new Date()
      };

      // Store profile in localStorage (in real app, this would be in Firestore)
      this.storeUserProfile(userProfile);

      console.log('✅ Candidate account created successfully');
      return userProfile;
    } catch (error: any) {
      console.error('❌ Error creating candidate account:', error);
      throw new Error(this.getFirebaseErrorMessage(error));
    }
  }

  // Sign in with email and password
  public async signIn(email: string, password: string): Promise<UserProfile> {
    try {
      console.log('🔄 Signing in...');
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userProfile = await this.getUserProfile(userCredential.user.uid);
      
      if (!userProfile) {
        throw new Error('User profile not found. Please sign up again.');
      }

      console.log('✅ Signed in successfully');
      return userProfile;
    } catch (error: any) {
      console.error('❌ Error signing in:', error);
      throw new Error(this.getFirebaseErrorMessage(error));
    }
  }

  // Sign in with Google (for LinkedIn verification)
  public async signInWithGoogle(): Promise<UserProfile> {
    try {
      console.log('🔄 Signing in with Google...');
      
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      const result = await signInWithPopup(auth, provider);
      
      // Check if this is a new user or existing user
      const userProfile = await this.getUserProfile(result.user.uid);
      
      if (!userProfile) {
        // New user - need to complete profile
        throw new Error('Please complete your profile setup first.');
      }

      console.log('✅ Signed in with Google successfully');
      return userProfile;
    } catch (error: any) {
      console.error('❌ Error signing in with Google:', error);
      throw new Error(this.getFirebaseErrorMessage(error));
    }
  }

  // Sign out
  public async signOut(): Promise<void> {
    try {
      console.log('🔄 Signing out...');
      await signOut(auth);
      this.userProfile = null;
      
      // Clear all user profiles from localStorage
      const keys = Object.keys(localStorage).filter(key => key.startsWith('userProfile_'));
      keys.forEach(key => localStorage.removeItem(key));
      
      console.log('✅ Signed out successfully');
    } catch (error: any) {
      console.error('❌ Error signing out:', error);
      throw new Error('Failed to sign out');
    }
  }

  // Verify company ID (mock implementation)
  public async verifyCompanyId(companyId: string): Promise<boolean> {
    try {
      console.log('🔄 Verifying company ID:', companyId);
      
      // Mock API call to verify company ID
      // In real implementation, this would call a company verification service
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation - accept certain patterns
      const isValid = /^[A-Z]{2,4}[0-9]{3,6}$/.test(companyId) || 
                     /^COMP-[A-Z0-9]{6,12}$/.test(companyId);
      
      if (isValid && this.userProfile) {
        this.userProfile.isVerified = true;
        this.storeUserProfile(this.userProfile);
        console.log('✅ Company ID verified successfully');
      }
      
      return isValid;
    } catch (error) {
      console.error('❌ Error verifying company ID:', error);
      return false;
    }
  }

  // Verify LinkedIn profile (mock implementation)
  public async verifyLinkedInProfile(linkedinUrl: string): Promise<boolean> {
    try {
      console.log('🔄 Verifying LinkedIn profile:', linkedinUrl);
      
      // Mock API call to verify LinkedIn profile
      // In real implementation, this would call LinkedIn API or verification service
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation - check if URL is accessible
      const isValid = this.validateLinkedInProfile(linkedinUrl);
      
      if (isValid && this.userProfile) {
        this.userProfile.isVerified = true;
        this.storeUserProfile(this.userProfile);
        console.log('✅ LinkedIn profile verified successfully');
      }
      
      return isValid;
    } catch (error) {
      console.error('❌ Error verifying LinkedIn profile:', error);
      return false;
    }
  }

  // Get user profile from storage
  private async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const stored = localStorage.getItem(`userProfile_${uid}`);
      if (stored) {
        const profile = JSON.parse(stored);
        profile.createdAt = new Date(profile.createdAt);
        return profile;
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting user profile:', error);
      return null;
    }
  }

  // Store user profile in storage
  private storeUserProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(`userProfile_${profile.uid}`, JSON.stringify(profile));
      // Update current user profile and notify listeners
      this.userProfile = profile;
      this.notifyAuthStateListeners();
      console.log('✅ User profile stored and listeners notified:', profile);
    } catch (error) {
      console.error('❌ Error storing user profile:', error);
    }
  }

  // Demo method to manually set user (for testing)
  public setDemoUser(profile: UserProfile): void {
    this.userProfile = profile;
    this.storeUserProfile(profile);
    console.log('✅ Demo user set:', profile);
  }

  // Validate company ID format
  private validateCompanyId(companyId: string): boolean {
    // Basic validation patterns for company IDs
    const patterns = [
      /^[A-Z]{2,4}[0-9]{3,6}$/, // ABC123, ABCD1234
      /^COMP-[A-Z0-9]{6,12}$/, // COMP-ABC123
      /^[A-Z]{3}-[0-9]{4}$/, // ABC-1234
    ];
    
    return patterns.some(pattern => pattern.test(companyId));
  }

  // Validate LinkedIn profile URL
  private validateLinkedInProfile(url: string): boolean {
    const linkedinPattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;
    return linkedinPattern.test(url);
  }

  // Get user-friendly Firebase error messages
  private getFirebaseErrorMessage(error: any): string {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please sign in instead.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-not-found':
        return 'No account found with this email. Please sign up first.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed. Please try again.';
      default:
        return error.message || 'An error occurred. Please try again.';
    }
  }
}

export const authService = new AuthService();
export default authService;
