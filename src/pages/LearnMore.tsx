import { useState } from 'react';

export default function LearnMore() {
  const [showContactModal, setShowContactModal] = useState(false);

  return (
    <div className="min-h-screen text-white p-8" style={{
      background: 'radial-gradient(at center, #703075, #2C1D76)'
    }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-8 text-center bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
          🚀 Learn More About HireMeNow
        </h1>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6 text-center">🎯 Why This Matters</h2>
          
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/50 rounded-xl p-6">
              <h3 className="text-2xl font-bold mb-4 text-center">🎯 The Pain Point – Career Fair Experience</h3>
              <p className="text-lg text-white/90 mb-4">
                At our last career fair, we stood in line for almost <strong className="text-red-400">60 minutes</strong> just to talk to one recruiter. After finally getting to the front, the recruiter barely looked at our resumes before saying:
              </p>
              <blockquote className="bg-white/10 border-l-4 border-red-400 pl-4 py-2 italic text-lg text-white/80">
                "Sorry, we don't consider sophomores."
              </blockquote>
              <p className="text-lg text-white/90 mt-4">
                That was it. One hour wasted, not on a meaningful conversation, not on skill evaluation, but on logistics and waiting.
              </p>
            </div>

            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-xl p-6">
              <h3 className="text-2xl font-bold mb-4 text-center">🚦 Why This Matters</h3>
              <ul className="space-y-3 text-lg text-white/90">
                <li className="flex items-start space-x-3">
                  <span className="text-yellow-400 text-xl">•</span>
                  <span>Multiply this by hundreds of students at the fair → hours of time wasted for both students and recruiters.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-yellow-400 text-xl">•</span>
                  <span>Recruiters spend more time <strong>filtering</strong> than actually <strong>evaluating talent</strong>.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-yellow-400 text-xl">•</span>
                  <span>Students walk away with <strong>no feedback</strong>, just rejection.</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/50 rounded-xl p-6">
              <h3 className="text-2xl font-bold mb-4 text-center">💡 The Shift</h3>
              <p className="text-lg text-white/90 mb-4">
                This exact frustration is what inspired our project. Instead of queues, paper resumes, and instant rejection, we thought:
              </p>
              <ul className="space-y-3 text-lg text-white/90">
                <li className="flex items-start space-x-3">
                  <span className="text-green-400 text-xl">•</span>
                  <span>What if recruiters could instantly match with candidates who fit their <strong>real needs</strong>?</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-green-400 text-xl">•</span>
                  <span>What if students got a chance to actually <strong>speak</strong> and <strong>show their skills</strong>, even briefly?</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-green-400 text-xl">•</span>
                  <span>What if the system handled all the <strong>filtering, summarizing, and feedback automatically</strong>?</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-xl p-6 text-center">
              <p className="text-lg text-white/90 mb-2">
                ⚡ That one <strong className="text-purple-400">60-minute rejection line</strong> became the seed for our solution:
              </p>
              <p className="text-xl font-bold text-white">
                <strong className="text-purple-400">HireMeNow</strong> – an Omegle-style platform for recruiters and candidates, powered by AI.
              </p>
            </div>
          </div>
        </div>


        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">🌟 Ready to Transform Recruiting?</h2>
          <p className="text-xl text-white/90 mb-8">
            Join the revolution and experience the future of hiring today.
          </p>
          <div className="flex justify-center space-x-6">
            <a 
              href="/" 
              className="bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-4 rounded-full text-xl font-bold hover:scale-105 transition-transform inline-block"
            >
              🚀 Get Started
            </a>
            <button 
              onClick={() => setShowContactModal(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-4 rounded-full text-xl font-bold hover:scale-105 transition-transform"
            >
              📞 Contact Us
            </button>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/30 rounded-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">📞 Contact Us</h2>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-4">Meet the Team</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-lg font-bold text-white mb-2">Pranjal Ganvir | Logic + Backend Developer</h4>
                  <a 
                    href="https://www.linkedin.com/in/pranjalganvir/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span>LinkedIn Profile</span>
                  </a>
                </div>
                
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-lg font-bold text-white mb-2">Arush Ugal | Backend + Frontend Developer</h4>
                  <a 
                    href="https://www.linkedin.com/in/arushugal/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span>LinkedIn Profile</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
