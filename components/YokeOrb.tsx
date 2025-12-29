
import React from 'react';

interface YokeOrbProps {
  isListening: boolean;
  isSpeaking: boolean;
  state: string;
}

const getEmotionColor = (state: string) => {
  const s = state.toLowerCase();
  
  // Mapping for English and Chinese emotional states
  if (s.includes('melancholic') || s.includes('忧郁') || s.includes('沉溺')) {
    return 'from-slate-900 via-indigo-950 to-blue-900 shadow-indigo-900/40';
  }
  if (s.includes('hopeful') || s.includes('希冀') || s.includes('inspired')) {
    return 'from-orange-400 via-rose-500 to-amber-600 shadow-rose-500/40';
  }
  if (s.includes('curious') || s.includes('好奇')) {
    return 'from-cyan-400 via-teal-600 to-emerald-800 shadow-cyan-500/40';
  }
  if (s.includes('playful') || s.includes('欢愉') || s.includes('vibrant')) {
    return 'from-pink-500 via-purple-600 to-indigo-800 shadow-pink-500/40';
  }
  if (s.includes('guardian') || s.includes('守护') || s.includes('protective')) {
    return 'from-blue-700 via-indigo-900 to-slate-900 shadow-blue-600/40';
  }
  if (s.includes('amazed') || s.includes('惊叹')) {
    return 'from-blue-400 via-white to-indigo-400 shadow-white/30';
  }
  if (s.includes('contemplative') || s.includes('沉思')) {
    return 'from-indigo-800 via-slate-900 to-black shadow-indigo-950/50';
  }
  
  // Default fallback
  return 'from-indigo-600 via-slate-800 to-indigo-900 shadow-indigo-500/50';
};

const YokeOrb: React.FC<YokeOrbProps> = ({ isListening, isSpeaking, state }) => {
  const emotionClasses = getEmotionColor(state);
  
  return (
    <div className="relative flex items-center justify-center w-72 h-72">
      {/* Dynamic Background Rings */}
      <div className={`absolute inset-0 rounded-full border-2 border-white/5 transition-all duration-1000 ${isSpeaking ? 'scale-125 opacity-30 rotate-45' : 'scale-100 opacity-10'}`}></div>
      <div className={`absolute inset-8 rounded-full border border-white/10 transition-all duration-700 ${isListening ? 'scale-110 opacity-40 animate-pulse' : 'scale-100 opacity-5'}`}></div>
      
      {/* The Soul Core */}
      <div className={`relative w-44 h-44 rounded-full flex items-center justify-center overflow-hidden transition-all duration-1000 ease-in-out
        ${isListening ? 'scale-105 shadow-2xl' : isSpeaking ? 'scale-115 shadow-3xl' : 'scale-100 shadow-xl'} 
        bg-gradient-to-br ${emotionClasses}`}>
        
        {/* Swirling Inner Plasma */}
        <div className="absolute inset-0 opacity-40 mix-blend-overlay animate-spin-slow bg-[conic-gradient(from_0deg,transparent_0%,white_50%,transparent_100%)]"></div>
        <div className={`absolute inset-0 transition-opacity duration-1000 ${isSpeaking ? 'opacity-30' : 'opacity-10'} bg-[radial-gradient(circle_at_30%_30%,white_0%,transparent_60%)]`}></div>
        
        {/* Core Glyph */}
        <div className="z-10 text-white font-bold text-center drop-shadow-lg">
          <div className="text-3xl tracking-[0.25em] font-light">YOKE</div>
          <div className="text-[9px] tracking-[0.8em] mt-2 text-white/70 uppercase">{state}</div>
        </div>
      </div>

      {/* Resonance Waves */}
      {(isListening || isSpeaking) && (
        <div className="absolute -bottom-12 flex gap-1.5 items-end h-12 overflow-hidden px-4">
          {[...Array(24)].map((_, i) => (
            <div
              key={i}
              className={`w-0.5 rounded-full transition-all duration-300 ${isListening ? 'bg-sky-400' : 'bg-white'}`}
              style={{
                height: isSpeaking ? `${20 + Math.random() * 80}%` : `${10 + Math.random() * 30}%`,
                opacity: 0.4 + (Math.random() * 0.4),
                transitionDelay: `${i * 20}ms`
              }}
            ></div>
          ))}
        </div>
      )}
    </div>
  );
};

export default YokeOrb;
