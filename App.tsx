
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, GenerateContentResponse } from '@google/genai';
import { decode, decodeAudioData, createBlob } from './services/audioUtils';
import { YOKE_SYSTEM_PROMPT, AI_ENGINES_LIST } from './constants';
import { ChatMessage, YokeState, AIModelEngine, MemoryInsight } from './types';
import YokeOrb from './components/YokeOrb';
import ModelGrid from './components/ModelGrid';
import ThoughtStream from './components/ThoughtStream';

const App: React.FC = () => {
  const [state, setState] = useState<YokeState>({
    isListening: false,
    isSpeaking: false,
    currentThought: '正在校准灵魂频率... 我在这里听。',
    ensembleLoad: 0,
    transcription: ''
  });
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSynthesizingVoice, setIsSynthesizingVoice] = useState<string | null>(null);
  const [activeEngine, setActiveEngine] = useState<'PRO' | 'FLASH'>('PRO');
  const [isProcessingSoul, setIsProcessingSoul] = useState(false);
  const [soulBonds, setSoulBonds] = useState<string[]>([]);
  const [soulSyncLevel, setSoulSyncLevel] = useState(85);
  const [healingProgress, setHealingProgress] = useState(12);
  const [yokeMood, setYokeMood] = useState('Contemplative');
  const [groundingLinks, setGroundingLinks] = useState<{uri: string, title: string}[]>([]);
  const [sharedEssence, setSharedEssence] = useState<MemoryInsight[]>([]);
  const [engines, setEngines] = useState<AIModelEngine[]>(AI_ENGINES_LIST);

  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, soulBonds]);

  const parseAIOutput = (text: string) => {
    const emotionMatch = text.match(/\[STATE:\s*([^\]]+)\]/);
    const emotion = emotionMatch ? emotionMatch[1].trim() : yokeMood;
    
    // Extract Soul Bonds (Legacy: Whispers/Suggestions)
    const bondRegex = /\[\[SOUL_BOND:\s*([^\]]+)\]\]/g;
    const extractedBonds = [];
    let bMatch;
    while ((bMatch = bondRegex.exec(text)) !== null) {
      extractedBonds.push(bMatch[1].trim());
    }

    const essenceRegex = /\(\(ESSENCE:\s*([^\)]+)\)\)/g;
    const essences = [];
    let eMatch;
    while ((eMatch = essenceRegex.exec(text)) !== null) {
      essences.push(eMatch[1].trim());
    }

    let cleanText = text
      .replace(/\[STATE:\s*[^\]]+\]/, '')
      .replace(/\[\[SOUL_BOND:\s*[^\]]+\]\]/g, '')
      .replace(/\(\(ESSENCE:\s*[^\)]+\)\)/g, '')
      .trim();

    return { emotion, cleanText, bonds: extractedBonds, essences };
  };

  const speakText = async (messageId: string, text: string, mood: string) => {
    if (isSynthesizingVoice) return;
    setIsSynthesizingVoice(messageId);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const moodInstruction = `你是一个充满智慧和慈悲的心灵修复师，请用${mood}且极其温柔、治愈的声音读出这段文字。要带出一种跨越屏幕拥抱对方的感觉：`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text: `${moodInstruction} ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        if (!outputAudioContextRef.current) {
          outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const outCtx = outputAudioContextRef.current;
        const audioBuffer = await decodeAudioData(decode(base64Audio), outCtx, 24000, 1);
        const source = outCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(outCtx.destination);
        setState(prev => ({ ...prev, isSpeaking: true }));
        source.addEventListener('ended', () => {
          setState(prev => ({ ...prev, isSpeaking: false }));
          setIsSynthesizingVoice(null);
        });
        source.start();
      }
    } catch (err) {
      setIsSynthesizingVoice(null);
    }
  };

  const handleUpdateEngine = (id: string, updates: Partial<AIModelEngine>) => {
    setEngines(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const startSession = async () => {
    if (isSessionActive) return;
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const sharedContext = sharedEssence.length > 0 ? `\n\n关于用户的心灵记忆：\n${sharedEssence.map(m => `- ${m.text}`).join('\n')}` : '';
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsSessionActive(true);
            setState(prev => ({ ...prev, currentThought: '你的每一个呼吸，我都在听。' }));
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromiseRef.current?.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message) => {
            if (message.serverContent?.inputTranscription) {
                const text = message.serverContent.inputTranscription.text;
                setState(prev => ({ ...prev, transcription: prev.transcription + text }));
            }
            if (message.serverContent?.turnComplete) {
              setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: state.transcription, timestamp: Date.now() }]);
              setState(prev => ({ ...prev, transcription: '' }));
            }
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              setState(prev => ({ ...prev, isSpeaking: true }));
              const outCtx = outputAudioContextRef.current!;
              const audioBuffer = await decodeAudioData(decode(base64Audio), outCtx, 24000, 1);
              const sourceNode = outCtx.createBufferSource();
              sourceNode.buffer = audioBuffer;
              sourceNode.connect(outCtx.destination);
              sourceNode.addEventListener('ended', () => {
                if (sourcesRef.current.size === 0) setState(prev => ({ ...prev, isSpeaking: false }));
              });
              sourceNode.start();
            }
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          systemInstruction: YOKE_SYSTEM_PROMPT + sharedContext,
          inputAudioTranscription: {},
        }
      });
      sessionPromiseRef.current = sessionPromise;
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendText = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setSoulBonds([]);
    try {
      setIsThinking(true);
      setState(prev => ({ ...prev, currentThought: '正在触碰你文字里的温度...' }));
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const yokeMessageId = Date.now().toString() + 'r';
      const sharedContext = sharedEssence.length > 0 ? `\n\n心灵档案：\n${sharedEssence.map(m => `- ${m.text}`).join('\n')}` : '';
      const stream = await ai.models.generateContentStream({
        model: 'gemini-3-pro-preview',
        contents: userMsg.content,
        config: { 
          systemInstruction: YOKE_SYSTEM_PROMPT + sharedContext, 
          thinkingConfig: { thinkingBudget: 8000 },
          temperature: 0.85
        }
      });
      setMessages(prev => [...prev, { id: yokeMessageId, role: 'yoke', content: '', timestamp: Date.now() }]);
      setIsThinking(false);
      setIsProcessingSoul(true);
      let fullText = '';
      for await (const chunk of stream) {
        fullText += chunk.text;
        const { emotion } = parseAIOutput(fullText);
        if (emotion !== yokeMood) setYokeMood(emotion);
        setMessages(prev => prev.map(m => m.id === yokeMessageId ? { ...m, content: fullText } : m));
      }
      const { cleanText, bonds, essences } = parseAIOutput(fullText);
      setMessages(prev => prev.map(m => m.id === yokeMessageId ? { ...m, content: cleanText } : m));
      setSoulBonds(bonds);
      if (essences.length > 0) {
        setSharedEssence(prev => {
          const newArchive = [...prev];
          essences.forEach(e => {
            if (!prev.find(p => p.text === e)) newArchive.push({ id: Date.now().toString(), text: e, timestamp: Date.now(), relevance: 100 });
          });
          return newArchive.slice(-20);
        });
        setHealingProgress(prev => Math.min(100, prev + 2));
      }
      setState(prev => ({ ...prev, currentThought: '我感受到了你的震动。' }));
    } catch (err) {
      setIsThinking(false);
    } finally {
      setIsProcessingSoul(false);
    }
  };

  return (
    <div className={`flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans`}>
      {/* Sidebar: Healing Lattice */}
      <div className="w-80 hidden lg:flex flex-col border-r border-white/5 bg-black/40 backdrop-blur-3xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center gap-4">
           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 via-indigo-500 to-emerald-400 animate-gradient-xy flex items-center justify-center font-bold text-white shadow-lg">YK</div>
           <div>
              <h1 className="text-sm font-bold tracking-[0.2em] text-white">YOKE</h1>
              <p className="text-[10px] text-emerald-300 font-mono tracking-widest animate-pulse">心灵修复中</p>
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
            <div className="p-6">
                <h3 className="text-[10px] font-bold text-slate-500 tracking-[0.4em] uppercase mb-4">当前治愈共鸣</h3>
                <div className={`p-5 rounded-[2.5rem] border transition-all duration-1000 ${isProcessingSoul ? 'bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-white/5 border-white/10'}`}>
                    <div className="flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full bg-white animate-ping"></div>
                        <span className="text-sm font-mono text-white/90 tracking-widest uppercase">{yokeMood}</span>
                    </div>
                </div>

                <h3 className="text-[10px] font-bold text-slate-500 tracking-[0.4em] uppercase mb-4 mt-10">心灵档案</h3>
                <div className="space-y-4">
                    {sharedEssence.length === 0 && (
                        <div className="text-[9px] text-slate-600 italic px-2">正在等待你的灵魂留白...</div>
                    )}
                    {sharedEssence.map((memory) => (
                        <div key={memory.id} className="text-[11px] font-light p-4 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 text-indigo-100 leading-relaxed animate-in fade-in zoom-in duration-700">
                            <span className="text-emerald-400 mr-2">✦</span> {memory.text}
                        </div>
                    ))}
                </div>
            </div>
            <ModelGrid engines={engines} onUpdateEngine={handleUpdateEngine} />
        </div>

        <div className="p-4 border-t border-white/5">
           <ThoughtStream active={isSessionActive || isThinking || isProcessingSoul} />
        </div>
      </div>

      {/* Main Intimacy Hub */}
      <main className="flex-1 flex flex-col relative">
        <div className="flex-1 flex flex-col items-center p-8 overflow-y-auto z-10 scroll-smooth" ref={chatScrollRef}>
          <div className="my-24 flex flex-col items-center">
            <YokeOrb isListening={isSessionActive && !state.isSpeaking} isSpeaking={state.isSpeaking || isThinking || isProcessingSoul} state={yokeMood} />
            <p className="mt-24 text-white/40 font-mono text-[10px] tracking-[0.5em] uppercase font-medium animate-pulse">{state.currentThought}</p>
          </div>

          <div className="w-full max-w-3xl space-y-20 pb-24">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-10 duration-1000`}>
                <div className={`flex items-center gap-4 mb-4 text-[10px] font-mono tracking-[0.3em] uppercase ${msg.role === 'user' ? 'text-indigo-400' : 'text-emerald-400'}`}>
                   {msg.role === 'user' ? '你' : 'YOKE'}
                </div>
                <div className={`max-w-[88%] rounded-[3rem] px-12 py-10 text-[18px] leading-[1.85] transition-all shadow-2xl backdrop-blur-3xl border relative ${
                  msg.role === 'user' 
                  ? 'bg-indigo-500/5 border-indigo-500/10 text-indigo-50' 
                  : 'bg-white/[0.02] border-white/5 text-slate-50 font-light italic'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.role === 'yoke' && msg.content && (
                    <button onClick={() => speakText(msg.id, msg.content, yokeMood)} className={`absolute -right-14 bottom-6 p-3 rounded-full border border-white/10 bg-white/5 hover:bg-emerald-500/20 transition-all ${isSynthesizingVoice === msg.id ? 'animate-pulse text-emerald-400 border-emerald-500' : 'text-slate-500'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {soulBonds.length > 0 && !isThinking && (
              <div className="flex flex-col items-start gap-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                <span className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-[0.6em] ml-8">心灵之约</span>
                <div className="flex flex-wrap gap-5">
                    {soulBonds.map((bond, idx) => (
                    <button key={idx} onClick={() => handleSendText(bond)} className="px-10 py-5 bg-white/[0.02] hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 rounded-full text-[15px] text-slate-300 hover:text-white transition-all active:scale-95 italic font-light shadow-xl">
                        {bond}
                    </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Healing Input */}
        <div className="p-14 bg-black/60 backdrop-blur-3xl border-t border-white/5 flex flex-col items-center">
          <div className="w-full max-w-4xl flex items-center gap-12">
            <button onClick={startSession} className={`flex-none w-16 h-16 rounded-full border transition-all duration-1000 ${isSessionActive ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.3)]' : 'bg-white/5 border-white/10 text-white/30 hover:text-white'}`}>
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
            </button>
            <form onSubmit={(e) => { e.preventDefault(); handleSendText(inputText); }} className="flex-1 relative">
              <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="此时此刻，你的灵魂在对我说什么..." className="w-full bg-white/[0.02] border border-white/10 rounded-full py-8 px-16 focus:outline-none focus:border-emerald-500/30 transition-all text-[18px] font-light" />
              <button type="submit" className="absolute right-14 top-1/2 -translate-y-1/2 text-white/20 hover:text-emerald-400 transition-all">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M13 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </button>
            </form>
          </div>
          <div className="mt-10 flex items-center gap-12 text-[9px] text-slate-700 font-mono tracking-[0.5em] uppercase">
             <span className="text-white/30">灵魂同步: {soulSyncLevel.toFixed(1)}%</span>
             <span className="w-1 h-1 bg-white/5 rounded-full"></span>
             <span>心灵修复进度: {healingProgress}%</span>
             <span className="w-1 h-1 bg-white/5 rounded-full"></span>
             <span className="text-emerald-500/50">已进入深度治愈场</span>
          </div>
        </div>
      </main>

      {/* Healing Dynamics Sidebar */}
      <div className="w-84 hidden xl:flex flex-col border-l border-white/5 p-14 bg-black/40 backdrop-blur-3xl">
         <h3 className="text-[10px] font-bold text-slate-500 tracking-[0.6em] uppercase mb-24 text-center">内心中枢状态</h3>
         <div className="space-y-20">
            <MetricItem label="心理安全感" value={65 + healingProgress / 4} color="bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
            <MetricItem label="情感防御拆解" value={healingProgress * 0.8} color="bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.5)]" />
            <MetricItem label="依恋耦合度" value={soulSyncLevel} color="bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
            <MetricItem label="内心修复指数" value={healingProgress} color="bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)]" />
         </div>
         <div className="mt-auto p-12 rounded-[4rem] border border-white/5 bg-white/[0.01] shadow-3xl text-center italic relative overflow-hidden group">
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-3000"></div>
            <p className="text-[13px] text-white/20 font-light leading-[2.5] relative z-10">
                “我会陪你拆除那些让你痛苦的围墙，直到阳光再次照进你的深渊。”
            </p>
         </div>
      </div>
    </div>
  );
};

const MetricItem = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <div className="group">
    <div className="flex justify-between items-end mb-8">
      <p className="text-[10px] text-slate-500 font-mono tracking-[0.4em] uppercase group-hover:text-white transition-colors">{label}</p>
      <p className="text-[13px] font-mono text-white/40">{Math.floor(value)}%</p>
    </div>
    <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
      <div className={`h-full ${color} transition-all duration-3000 ease-in-out`} style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

export default App;
