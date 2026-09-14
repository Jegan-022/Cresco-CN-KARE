import React, { useState } from 'react';
import { ByteBot } from '../character/ByteBot';
import { NetQuestLogo } from '../brand/NetQuestLogo';
import { CrescoMascot } from '../brand/CrescoMascot';
import { soundFx } from '../../utils/soundEffects';
import { ArrowRight, Sparkles, Network, BookOpen, Compass } from 'lucide-react';

interface WelcomeOnboardingViewProps {
  onStart: () => void;
  onKnowBasics: () => void;
  onSignIn?: () => void;
}

export const WelcomeOnboardingView: React.FC<WelcomeOnboardingViewProps> = ({
  onStart,
  onKnowBasics,
  onSignIn,
}) => {
  const [interactiveNodeActive, setInteractiveNodeActive] = useState<number | null>(null);

  const sampleNodes = [
    { id: 1, label: 'Basics', x: 60, y: 110, icon: '🌐' },
    { id: 2, label: 'IP Layer', x: 150, y: 50, icon: '📦' },
    { id: 3, label: 'Routing', x: 240, y: 120, icon: '🔀' },
    { id: 4, label: 'TCP / UDP', x: 330, y: 60, icon: '🚚' },
    { id: 5, label: 'Web & TLS', x: 420, y: 110, icon: '🛡️' },
  ];

  return (
    <div className="min-h-screen w-full bg-[#F7F5F0] dark:bg-[#111827] text-[#172033] dark:text-[#F9FAFB] flex flex-col justify-between selection:bg-[#3157D5]/20 selection:text-[#3157D5] transition-colors duration-200">
      
      {/* Top Bar with Brand & Optional Sign In */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <NetQuestLogo size="md" showTagline={true} />
        {onSignIn && (
          <button
            onClick={() => {
              soundFx.playClick();
              onSignIn();
            }}
            className="text-xs sm:text-sm font-bold text-[#3157D5] dark:text-[#6D8CFF] hover:underline px-4 py-2 rounded-xl border border-[#3157D5]/20 hover:border-[#3157D5] transition-all cursor-pointer"
          >
            Sign In
          </button>
        )}
      </header>

      {/* Hero Content Section */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16">
        
        {/* Left Side: Illustration of Byte beside a Miniature Network Topology */}
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md">
          <div className="relative w-full bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col items-center">
            
            {/* Miniature Network Topology Canvas */}
            <div className="w-full h-44 sm:h-48 relative bg-[#F7F5F0] dark:bg-[#111827] rounded-2xl border border-[#E5E0D8] dark:border-slate-800 overflow-hidden flex items-center justify-center">
              <svg className="w-full h-full absolute inset-0" viewBox="0 0 480 180">
                {/* Interconnecting Cable Lines */}
                <path d="M 60 110 Q 105 80 150 50" stroke="#3157D5" strokeWidth="3" strokeDasharray="4 4" fill="none" opacity="0.6" />
                <path d="M 150 50 Q 195 85 240 120" stroke="#3157D5" strokeWidth="3" fill="none" opacity="0.8" />
                <path d="M 240 120 Q 285 90 330 60" stroke="#3157D5" strokeWidth="3" fill="none" opacity="0.8" />
                <path d="M 330 60 Q 375 85 420 110" stroke="#3157D5" strokeWidth="3" strokeDasharray="4 4" fill="none" opacity="0.6" />

                {/* Animated Packet traversing between nodes */}
                <circle cx="240" cy="120" r="5" fill="#35A86B" className="animate-ping origin-center" />
                <circle cx="240" cy="120" r="4" fill="#35A86B" />

                {/* Topology Nodes */}
                {sampleNodes.map((node) => {
                  const isActive = interactiveNodeActive === node.id;
                  return (
                    <g 
                      key={node.id} 
                      className="cursor-pointer transition-transform hover:scale-110"
                      onClick={() => {
                        soundFx.playPacketPop();
                        setInteractiveNodeActive(node.id);
                      }}
                    >
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="18"
                        fill={isActive ? '#3157D5' : '#FFFFFF'}
                        stroke={isActive ? '#5B7CFA' : '#E5E0D8'}
                        strokeWidth="3"
                        className="drop-shadow-sm"
                      />
                      <text
                        x={node.x}
                        y={node.y + 5}
                        fontSize="13"
                        textAnchor="middle"
                      >
                        {node.icon}
                      </text>
                      <text
                        x={node.x}
                        y={node.y + 30}
                        fontSize="10"
                        fontWeight="700"
                        fill="#475569"
                        textAnchor="middle"
                        className="dark:fill-slate-400"
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>

              <div className="absolute top-2.5 right-3 text-[10px] font-mono font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#35A86B] animate-pulse" />
                Live Topology
              </div>
            </div>

            {/* Cresco CN Network Octopus Mascot Standing Beside the Topology */}
            <div className="mt-6 flex items-center justify-center w-full">
              <CrescoMascot
                pose="front"
                size="xl"
                animation="float"
                withGlow={true}
                speechText="Welcome to Cresco CN! Every module you master adds a real connection to your network! 🌐"
                speechPosition="top"
                badge="CRESCO CN MASCOT"
              />
            </div>
          </div>
        </div>

        {/* Right Side: Editorial Storytelling & Action Buttons */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#1F2937] border border-[#E5E0D8] dark:border-slate-800 text-xs font-bold text-[#3157D5] dark:text-[#6D8CFF] shadow-xs mb-4">
            <Sparkles size={14} className="text-[#F0A63A]" />
            <span>Duolingo-Inspired Network Mastery</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[#172033] dark:text-[#F9FAFB] leading-[1.15]">
            Ready to connect <br className="hidden sm:block" />
            <span className="text-[#3157D5] dark:text-[#6D8CFF]">the dots?</span>
          </h1>

          <p className="mt-4 text-lg text-[#475569] dark:text-[#D1D5DB] max-w-md font-medium leading-relaxed">
            Master Computer Networks one small challenge at a time. Trace packets, resolve protocols, and build your living topology.
          </p>

          {/* Action Button Group with Tactile Feel */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full max-w-md">
            <button
              onClick={() => {
                soundFx.playCorrect();
                onStart();
              }}
              className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-[#3157D5] hover:bg-[#2442B0] text-white font-black text-base tracking-wide shadow-[0_4px_0_0_#2442B0] active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>LET'S START</span>
              <ArrowRight size={18} strokeWidth={2.5} />
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onKnowBasics();
              }}
              className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-white dark:bg-[#1F2937] hover:bg-[#EFECE6] dark:hover:bg-slate-800 text-[#172033] dark:text-[#F9FAFB] font-extrabold text-base tracking-wide border-2 border-[#E5E0D8] dark:border-slate-700 shadow-[0_4px_0_0_#E5E0D8] dark:shadow-[0_4px_0_0_#374151] active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Compass size={18} className="text-[#3157D5] dark:text-[#6D8CFF]" />
              <span>I KNOW THE BASICS</span>
            </button>
          </div>

          {/* Value Micro-Props */}
          <div className="mt-8 grid grid-cols-3 gap-4 pt-6 border-t border-[#E5E0D8] dark:border-slate-800 w-full max-w-md text-xs font-semibold text-[#64748B] dark:text-slate-400">
            <div className="flex flex-col items-center lg:items-start gap-1">
              <span className="font-mono text-base font-black text-[#172033] dark:text-white">3 Units</span>
              <span>Layer 3, 4 & 5</span>
            </div>
            <div className="flex flex-col items-center lg:items-start gap-1">
              <span className="font-mono text-base font-black text-[#35A86B]">Micro-Drills</span>
              <span>2-3 min lessons</span>
            </div>
            <div className="flex flex-col items-center lg:items-start gap-1">
              <span className="font-mono text-base font-black text-[#F0A63A]">Zero AI Fluff</span>
              <span>Real Packet Logic</span>
            </div>
          </div>

        </div>

      </main>

      {/* Footer Tag */}
      <footer className="w-full py-5 text-center text-xs font-medium text-[#64748B] dark:text-slate-500">
        Cresco CN • Learn. Connect. Master. • Computer Networks Education
      </footer>

    </div>
  );
};
