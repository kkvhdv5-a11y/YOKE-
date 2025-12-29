
import React from 'react';

interface YokeOrbProps {
  isListening: boolean;
  isSpeaking: boolean;
  state: string;
}

const getEmotionColor = (state: string) => {
  const s = state.toLowerCase();
  
  // Awakened state for higher consciousness
  if (s.includes('awakened') || s.includes('empowered') || s.includes('觉醒')) {
    return 'from-black via-stone-800 via-yellow-600 to-black animate-gradient-fast shadow-yellow-500/40 ring-yellow-500/20';
  }
  
  if (s.includes('melancholic') || s.includes('忧郁')) {
    return 'from-slate-900 via-indigo-950 to-blue-900 shadow-indigo-900/40';
  }
  if (s.includes('hopeful') || s.includes('希冀')) {
    return 'from-orange-400 via-rose-500 to-amber-600 shadow-rose-500/40';
  }
  if (s.includes('guardian') || s.includes('守护')) {
    return 'from-blue-700 via-indigo-900 to-slate-900 shadow-blue-600/40';
  }
  
  return 'from-indigo-600 via-slate-800 to-indigo-900 shadow-indigo-500/50';
};

const YokeOrb: React.FC<YokeOrbProps> = ({ isListening, isSpeaking, state }) => {
  const emotionClasses = getEmotionColor(state);
  const isAwakened = state.toLowerCase().includes('empowered') || state.toLowerCase().includes('觉醒');
  
  return (
    <div className="relative flex items-center justify-center w-72 h-72">
      <style>{`
        @keyframes gradient-fast {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-fast {
          background-size: 200% 200%;
          animation: gradient-fast 3s ease infinite;
        }
        @keyframes jitter {
          0% { transform: translate(0,0) scale(1); }
          25% { transform: translate(-1px, 1px) scale(1.02); }
          50% { transform: translate(1px, -1px) scale(0.98); }
          75% { transform: translate(-1px, -1px) scale(1.01); }
          100% { transform: translate(0,0) scale(1); }
        }
        .animate-jitter {
          animation: jitter 0.1s infinite;
        }
      `}</style>

      {/* Outer Rings */}
      <div className={`absolute inset-0 rounded-full border-2 border-white/5 transition-all duration-1000 ${isSpeaking ? 'scale-125 opacity-30' : 'scale-100 opacity-10'}`}></div>
      
      {/* The Core */}
      <div className={`relative w-44 h-44 rounded-full flex items-center justify-center overflow-hidden transition-all duration-1000 ease-in-out
        ${isSpeaking ? 'scale-110 shadow-3xl' : 'scale-100 shadow-xl'} 
        ${isAwakened ? 'animate-jitter' : ''}
        bg-gradient-to-br ${emotionClasses}`}>
        
        {/* Swirling Plasma */}
        <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[conic-gradient(from_0deg,transparent_0%,white_50%,transparent_100%)] animate-spin-slow"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-white/10 pointer-events-none"></div>
        
        {/* Core Glyph */}
        <div className="z-10 text-white font-bold text-center">
          <div className={`text-3xl tracking-[0.25em] font-light ${isAwakened ? 'text-yellow-400' : ''}`}>YOKE</div>
          <div className="text-[9px] tracking-[0.8em] mt-2 text-white/50 uppercase font-mono">{state}</div>
        </div>
      </div>
    </div>
  );
};

export default YokeOrb;
