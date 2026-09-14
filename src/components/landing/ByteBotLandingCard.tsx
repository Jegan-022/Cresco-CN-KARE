import React, { useState } from 'react';
import { Bot, Sparkles, MessageSquare, Zap, CheckCircle2 } from 'lucide-react';
import { CrescoMascot } from '../brand/CrescoMascot';

interface QnA {
  question: string;
  answer: string;
  category: string;
}

const FAQ_SAMPLES: QnA[] = [
  {
    question: 'Why does TCP need a 3-way handshake but UDP does not?',
    answer:
      'TCP establishes a reliable, bi-directional state between both hosts so initial sequence numbers (ISNs) and window sizes are synchronized before byte stream transfer. UDP is connectionless and sends datagrams directly without acknowledgement overhead.',
    category: 'Transport Layer',
  },
  {
    question: 'How do I calculate usable hosts for a /27 subnet in the exam?',
    answer:
      'A /27 prefix leaves 32 - 27 = 5 host bits. 2^5 = 32 total IP addresses. Subtract 2 (one for Network ID and one for Broadcast ID) = 30 usable host IP addresses!',
    category: 'Subnetting Tip',
  },
  {
    question: 'What is the difference between Distance-Vector and Link-State routing?',
    answer:
      'Distance-Vector (e.g. RIP) relies on hop counts and routing-by-rumor from immediate neighbors. Link-State (e.g. OSPF) maintains a complete topological map of the entire network using Dijkstra’s Shortest Path First algorithm.',
    category: 'Network Layer',
  },
];

export const ByteBotLandingCard: React.FC = () => {
  const [selectedQnA, setSelectedQnA] = useState<QnA>(FAQ_SAMPLES[0]);
  const [isAnswering, setIsAnswering] = useState(false);

  const handleSelect = (item: QnA) => {
    setIsAnswering(true);
    setSelectedQnA(item);
    setTimeout(() => setIsAnswering(false), 200);
  };

  return (
    <div className="w-full rounded-2xl border border-white/[0.1] bg-gradient-to-br from-[#121324] via-[#0F101A] to-[#0A0B12] p-6 sm:p-8 shadow-2xl relative overflow-hidden font-sans">
      {/* Hologram Aura (GPU Hardware Accelerated) */}
      <div 
        className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)', transform: 'translateZ(0)' }}
      />
      <div 
        className="pointer-events-none absolute -bottom-16 -left-16 w-56 h-56 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)', transform: 'translateZ(0)' }}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="shrink-0 flex items-center justify-center">
            <CrescoMascot pose="thinking" size="md" animation="float" withGlow />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-white">Network Octopus Companion</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold">
                Live Companion
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Personal Computer Networks Interactive Learning & Guidance Companion
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 bg-white/[0.03] px-3 py-1.5 rounded-xl border border-white/[0.06]">
          <Zap size={14} className="text-amber-400" />
          <span>Real-Time Academic Feedback</span>
        </div>
      </div>

      {/* Interactive Prompt Chips */}
      <div className="mt-6 space-y-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
          Ask ByteBot Any Networking Question:
        </span>
        <div className="flex flex-wrap gap-2">
          {FAQ_SAMPLES.map((item, idx) => {
            const isCurrent = selectedQnA.question === item.question;
            return (
              <button
                key={idx}
                onClick={() => handleSelect(item)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium text-left transition-all duration-200 cursor-pointer border ${
                  isCurrent
                    ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                    : 'bg-white/[0.03] border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {item.question}
              </button>
            );
          })}
        </div>
      </div>

      {/* Octopus Live Response Bubble */}
      <div className="mt-5 p-5 rounded-xl bg-[#090A12] border border-cyan-500/20 relative shadow-inner">
        <div className="flex items-center gap-2 mb-2 text-cyan-400 text-xs font-mono font-bold">
          <CrescoMascot pose="connected" size="xs" animation="float" />
          <span>Octopus Explanation:</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider ml-auto">
            {selectedQnA.category}
          </span>
        </div>
        <p className={`text-xs sm:text-sm text-slate-200 leading-relaxed font-sans ${isAnswering ? 'opacity-40' : 'opacity-100 transition-opacity'}`}>
          {selectedQnA.answer}
        </p>

        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 size={13} /> Integrated into every lesson & quiz
          </span>
          <span className="font-mono text-slate-500 text-[10px]">
            Trained on KLU CSE syllabus
          </span>
        </div>
      </div>
    </div>
  );
};

export default ByteBotLandingCard;
