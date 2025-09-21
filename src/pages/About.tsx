export default function About() {
  return (
    <div className="min-h-screen text-white p-8" style={{
      background: 'radial-gradient(at center, #703075, #2C1D76)'
    }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-8 text-center bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
          About HireMeNow
        </h1>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6 text-center">🚀 The Future of Recruiting</h2>
          <p className="text-xl text-white/90 leading-relaxed mb-6">
            HireMeNow is revolutionizing the recruitment industry by bringing the speed and efficiency of modern dating apps to professional hiring. 
            We eliminate the endless waiting, the spam applications, and the inefficient screening processes that plague traditional recruitment.
          </p>
          <p className="text-xl text-white/90 leading-relaxed">
            Our AI-powered platform matches recruiters with candidates instantly, facilitating 5-minute video calls that get straight to the point. 
            No more weeks of back-and-forth emails. No more wasted time at career fairs. Just meaningful connections that lead to real opportunities.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <h3 className="text-2xl font-bold mb-4 text-center">🎯 The Problem</h3>
            <ul className="space-y-3 text-white/90">
              <li className="flex items-start space-x-3">
                <span className="text-red-400 text-xl">❌</span>
                <span>Recruiters spend hours sifting through irrelevant applications</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-red-400 text-xl">❌</span>
                <span>Candidates wait weeks for responses that never come</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-red-400 text-xl">❌</span>
                <span>Career fairs are inefficient and time-consuming</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-red-400 text-xl">❌</span>
                <span>Traditional job boards are flooded with spam</span>
              </li>
            </ul>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <h3 className="text-2xl font-bold mb-4 text-center">✅ Our Solution</h3>
            <ul className="space-y-3 text-white/90">
              <li className="flex items-start space-x-3">
                <span className="text-green-400 text-xl">✅</span>
                <span>AI-powered matching with predicate logic</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-green-400 text-xl">✅</span>
                <span>Instant 5-minute video screening calls</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-green-400 text-xl">✅</span>
                <span>Real-time transcription and AI summaries</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-green-400 text-xl">✅</span>
                <span>Immediate feedback and decision tracking</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6 text-center">🤖 How Our AI Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-bold mb-2">Hard Constraints</h3>
              <p className="text-white/80 text-sm">Must-meet requirements like availability and location</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">⚖️</div>
              <h3 className="text-lg font-bold mb-2">Soft Constraints</h3>
              <p className="text-white/80 text-sm">Weighted preferences for skills and experience</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-lg font-bold mb-2">AI Matching</h3>
              <p className="text-white/80 text-sm">Advanced algorithms find the best candidates</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-bold mb-2">Scoring</h3>
              <p className="text-white/80 text-sm">Real-time match scores and compatibility</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6 text-center">📈 Impact & Results</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">10x</div>
              <p className="text-white/80">Faster candidate screening</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">85%</div>
              <p className="text-white/80">Average match accuracy</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">5min</div>
              <p className="text-white/80">Average call duration</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">🌟 Ready to Transform Recruiting?</h2>
          <p className="text-xl text-white/90 mb-8">
            Join the revolution and experience the future of hiring today.
          </p>
          <div className="flex justify-center space-x-6">
            <button className="bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-4 rounded-full text-xl font-bold hover:scale-105 transition-transform">
              🚀 Get Started
            </button>
            <button className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-4 rounded-full text-xl font-bold hover:scale-105 transition-transform">
              📞 Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
