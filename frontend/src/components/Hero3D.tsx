'use client';

export default function CosmicBackground() {
  return (
    <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden bg-[#020617]">
      {/* Base radial gradient mesh */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(120,40,200,0.25) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 80%, rgba(45,212,191,0.1) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 20% 70%, rgba(244,114,182,0.08) 0%, transparent 60%)'
      }} />

      {/* Animated floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl animate-[orb1_12s_ease-in-out_infinite]"
        style={{ background: 'radial-gradient(circle, #7c3aed, #4f46e5)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl animate-[orb2_16s_ease-in-out_infinite]"
        style={{ background: 'radial-gradient(circle, #2dd4bf, #0891b2)' }} />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full opacity-10 blur-3xl animate-[orb3_20s_ease-in-out_infinite]"
        style={{ background: 'radial-gradient(circle, #f472b6, #e11d48)' }} />
      <div className="absolute top-3/4 left-1/3 w-72 h-72 rounded-full opacity-12 blur-3xl animate-[orb4_14s_ease-in-out_infinite]"
        style={{ background: 'radial-gradient(circle, #8b5cf6, #6366f1)' }} />

      {/* Grid lines overlay */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      {/* Dot pattern */}
      <div className="absolute inset-0 opacity-[0.15]" style={{
        backgroundImage: 'radial-gradient(circle, rgba(139,92,246,0.4) 1px, transparent 1px)',
        backgroundSize: '32px 32px'
      }} />

      {/* Top shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-px opacity-30"
        style={{ background: 'linear-gradient(90deg, transparent, #7c3aed, #2dd4bf, transparent)' }} />

      <style>{`
        @keyframes orb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(60px, -40px) scale(1.1); }
          66%       { transform: translate(-40px, 60px) scale(0.9); }
        }
        @keyframes orb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(-80px, 50px) scale(1.15); }
          66%       { transform: translate(50px, -60px) scale(0.85); }
        }
        @keyframes orb3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(-60px, -80px) scale(1.2); }
        }
        @keyframes orb4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40%       { transform: translate(80px, -30px) scale(0.9); }
          80%       { transform: translate(-20px, 60px) scale(1.1); }
        }
      `}</style>
    </div>
  );
}
