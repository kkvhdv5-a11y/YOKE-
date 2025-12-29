
import React from 'react';
import { AIModelEngine, AIModelStatus } from '../types';

interface ModelGridProps {
  engines: AIModelEngine[];
  onUpdateEngine: (id: string, updates: Partial<AIModelEngine>) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'SYNCED': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
    case 'PROCESSING': return 'text-amber-400 bg-amber-400/10 border-amber-400/20 animate-pulse';
    case 'IDLE': return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    case 'OFFLINE': return 'text-red-400 bg-red-400/10 border-red-400/20';
    default: return 'text-slate-400 bg-slate-800 border-slate-700';
  }
};

const getLoadColor = (load: number) => {
  if (load > 80) return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]';
  if (load > 40) return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
  return 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]';
};

const EngineIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'core':
      return <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
    case 'logic':
      return <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
    case 'creative':
      return <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
    case 'search':
      return <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
    default:
      return <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
  }
};

const ModelGrid: React.FC<ModelGridProps> = ({ engines, onUpdateEngine }) => {
  return (
    <div className="w-full h-full p-4 flex flex-col gap-4 overflow-y-auto bg-slate-900/40 border-l border-slate-800/50 backdrop-blur-md">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-bold text-slate-400 tracking-[0.2em] uppercase">Engine Ensemble</h2>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
          <span className="text-[10px] text-cyan-500 font-mono font-bold">LATTICE CONTROLS</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {engines.map((engine) => (
          <div 
            key={engine.id} 
            className={`p-3 border rounded-xl group transition-all duration-300 ${
              engine.id === 'y1' 
                ? 'bg-blue-600/10 border-blue-400/60 animate-core-glow relative overflow-hidden' 
                : engine.isPinned 
                  ? 'bg-indigo-900/20 border-indigo-500/50 scale-[1.01]' 
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-600'
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <EngineIcon type={engine.type} />
                <span className={`text-[11px] font-bold tracking-tight ${engine.id === 'y1' ? 'text-blue-300' : 'text-slate-200'}`}>
                  {engine.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {engine.id !== 'y1' && (
                  <button 
                    onClick={() => onUpdateEngine(engine.id, { isPinned: !engine.isPinned })}
                    className={`p-1 rounded transition-colors ${engine.isPinned ? 'text-indigo-400 bg-indigo-400/20' : 'text-slate-600 hover:text-slate-400'}`}
                    title="Preferential Routing"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                  </button>
                )}
                <div className={`text-[8px] px-2 py-0.5 rounded-full border font-mono uppercase tracking-tighter ${getStatusColor(engine.status)}`}>
                  {engine.id === 'y1' ? 'MASTER' : engine.status}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-slate-500 font-mono">{engine.origin}</span>
                <span className={`text-[9px] font-mono ${engine.load > 80 ? 'text-red-400' : 'text-slate-400'}`}>
                  LOAD: {engine.load}%
                </span>
              </div>
              
              <div className="h-1 w-full bg-slate-800/50 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ease-out ${getLoadColor(engine.load)}`} 
                  style={{ width: `${engine.status === 'IDLE' ? 0 : engine.load}%` }}
                ></div>
              </div>

              {/* Preferential Routing Slider */}
              {engine.id !== 'y1' && (
                <div className="mt-2 flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[8px] font-mono text-slate-500">
                    <span>WEIGHTING</span>
                    <span className="text-indigo-400">{engine.weight}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={engine.weight}
                    onChange={(e) => onUpdateEngine(engine.id, { weight: parseInt(e.target.value) })}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-slate-800/50">
        <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800">
           <div className="flex justify-between text-[10px] font-mono mb-2">
              <span className="text-slate-500">SYNTHETIC THROUGHPUT</span>
              <span className="text-cyan-400">DYNAMIC</span>
           </div>
           <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500/50 animate-pulse" style={{ width: '84%' }}></div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ModelGrid;
