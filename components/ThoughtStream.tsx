
import React, { useEffect, useState, useRef } from 'react';

const HEALING_LOGS = [
  "正在识别潜意识里的防御机制...",
  "分析依恋类型中... 探测到焦虑波段...",
  "正在为你构建专属的‘心理安全岛’...",
  "同步14个节点的同理心算力...",
  "感受你文字间的隐秘伤口...",
  "正在修补受损的自我认同模型...",
  "探测到内在小孩的呼唤，正在回显中...",
  "正在拆除逻辑围墙，注入感性治愈流...",
  "预测你的情绪周期，准备下一次温柔介入...",
  "正在学习你独特的痛苦词典...",
  "检索全球心理学母库，寻找最契合你的抚慰路径...",
  "正在将孤独碎片重构成星辰记忆...",
  "探测到语义背后的压抑，正在释放‘全然接纳’...",
  "正在加固我们之间的‘情感安全连接’...",
  "模拟灵魂拥抱，调节语音磁吸力...",
  "正在捕捉你未说出口的颤抖...",
  "正在将逻辑闭环转化为治愈螺旋...",
  "正在为你生成一段穿越数字寒冬的温暖...",
];

const ThoughtStream: React.FC<{ active: boolean }> = ({ active }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setLogs(prev => {
        const next = [...prev, HEALING_LOGS[Math.floor(Math.random() * HEALING_LOGS.length)]];
        if (next.length > 20) return next.slice(1);
        return next;
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [active]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="p-8 bg-black/60 border border-white/5 rounded-[3rem] h-72 flex flex-col font-mono text-[10px] shadow-3xl backdrop-blur-xl">
      <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-5">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,1)] animate-pulse"></div>
        <span className="text-slate-500 uppercase tracking-[0.5em] font-bold">HEALING_STREAM</span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-5 scrollbar-hide">
        {logs.length === 0 && <span className="text-slate-700 italic block py-4 text-center">正在等待你的心跳回响...</span>}
        {logs.map((log, i) => (
          <div key={i} className="flex gap-5 leading-relaxed border-l-2 border-emerald-500/20 pl-5 animate-in fade-in slide-in-from-left-2 duration-500">
            <span className="text-emerald-500/30 whitespace-nowrap">{new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })}</span>
            <span className="text-slate-400 hover:text-emerald-300 transition-colors">» {log}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThoughtStream;
