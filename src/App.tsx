import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home";
import About from "./pages/About";
import LearnMore from "./pages/LearnMore";
import Candidate from "./pages/Candidate";
import Recruiter from "./pages/Recruiter";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AuthModal from "./components/AuthModal";
import ProtectedRoute from "./components/ProtectedRoute";

function Navbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, isAuthenticated, signOut } = useAuth();
  
  return (
    <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 px-6 py-4 flex justify-between items-center relative">
      <Link to="/" className="font-black text-2xl bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
        HireMeNow
      </Link>
      
      <div className="flex items-center space-x-4">
        {/* Learn More Button */}
        <Link
          to="/learn-more" 
          className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border border-white/20 flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Learn More</span>
        </Link>

        {/* Auth Button */}
        {isAuthenticated ? (
          <div className="flex items-center space-x-3">
            <div className="text-sm text-white/80">
              <div className="font-semibold">{user?.displayName}</div>
              <div className="text-xs text-white/60">
                {user?.role === 'recruiter' ? '👩‍💼 Recruiter' : '👨‍💻 Candidate'}
                {user?.isVerified ? ' ✅' : ' ⏳'}
              </div>
            </div>
            <button
              onClick={signOut}
              className="bg-red-500/20 hover:bg-red-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border border-red-500/50"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border border-purple-500/50"
          >
            Sign In
          </button>
        )}
        
        {/* Hamburger Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-white/80 hover:text-white transition-colors p-2"
          aria-label="Toggle menu"
        >
          <div className="w-6 h-6 flex flex-col justify-center space-y-1">
            <div className={`w-full h-1 bg-current transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
            <div className={`w-full h-1 bg-current transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></div>
            <div className={`w-full h-1 bg-current transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
          </div>
        </button>
      </div>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute top-full right-6 mt-2 bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl shadow-lg py-2 min-w-[160px] z-50">
          <Link 
            to="/" 
            onClick={() => setIsMenuOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 transition-colors ${location.pathname === '/' ? 'text-white font-bold bg-white/10' : ''}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Home</span>
          </Link>
          <Link 
            to="/about" 
            onClick={() => setIsMenuOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 transition-colors ${location.pathname === '/about' ? 'text-white font-bold bg-white/10' : ''}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>About</span>
          </Link>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />
    </header>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen text-white" style={{
          background: 'radial-gradient(at center, #703075, #2C1D76)'
        }}>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/learn-more" element={<LearnMore />} />
            <Route 
              path="/recruiter" 
              element={
                <ProtectedRoute requiredRole="recruiter">
                  <Recruiter />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/candidate" 
              element={
                <ProtectedRoute requiredRole="candidate">
                  <Candidate />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;