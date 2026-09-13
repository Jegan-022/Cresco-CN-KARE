import React, { useState } from 'react';
import { ByteBot } from '../character/ByteBot';
import { soundFx } from '../../utils/soundEffects';
import { triggerSubtleSectionConfetti } from '../../utils/confetti';
import { 
  Package, 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Search,
  Zap
} from 'lucide-react';

interface DailyChallengeViewProps {
  onComplete?: (xp: number) => void;
  onBack?: () => void;
}

export const DailyChallengeView: React.FC<DailyChallengeViewProps> = ({
  onComplete,
  onBack,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const options = [
    { id: 'DNS', name: 'DNS (Domain Name System)', isCorrect: true, desc: 'Port 53, translates hostname to IP address' },
    { id: 'DHCP', name: 'DHCP (Dynamic Host Configuration)', isCorrect: false, desc: 'Port 67/68, assigns dynamic IP addresses' },
    { id: 'FTP', name: 'FTP (File Transfer Protocol)', isCorrect: false, desc: 'Port 20/21, transfers files across hosts' },
    { id: 'SSH', name: 'SSH (Secure Shell)', isCorrect: false, desc: 'Port 22, encrypted terminal sessions' },
  ];

  const handleSelect = (id: string) => {
    if (isAnswered && isCorrect) return;
    soundFx.playClick();
    setSelectedAnswer(id);
  };

  const handleCheck = () => {
    if (!selectedAnswer) return;
    setIsAnswered(true);

    if (selectedAnswer === 'DNS') {
      soundFx.playCorrect();
      setIsCorrect(true);
      triggerSubtleSectionConfetti();
      if (onComplete) onComplete(30);
    } else {
      soundFx.playIncorrect();
      setIsCorrect(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn pb-16">
      
      {/* 1. Header */}
      <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-black text-[#F0A63A] uppercase tracking-widest">
            <Flame size={14} className="fill-[#F0A63A]" />
            <span>DAILY SPRINT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#172033] dark:text-[#F9FAFB] tracking-tight mt-1">
            Today's Packet
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#64748B] dark:text-slate-400 mt-0.5">
            "Can you identify this protocol from its network signature?"
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#F0A63A]/15 text-[#B45309] dark:text-[#F0A63A] border border-[#F0A63A]/30 text-xs font-black">
          <Zap size={16} />
          <span>🔥 +30 XP</span>
        </div>
      </div>

      {/* 2. Animated Packet Traversal Canvas */}
      <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <span className="text-[11px] font-mono font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
          LIVE PACKET INTERCEPTION
        </span>

        {/* Packet Animation Display */}
        <div className="p-5 rounded-2xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#3157D5] text-white flex items-center justify-center shadow-md animate-bounce">
              <Package size={24} />
            </div>
            <div>
              <div className="font-mono text-xs font-bold text-[#172033] dark:text-[#F9FAFB]">
                Frame #4081 · UDP Payload (53 Bytes)
              </div>
              <div className="font-mono text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                Query: "cresco.edu" ➔ Record Type: A (IPv4 Address)
              </div>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-[#E5E0D8] dark:border-slate-700 text-xs font-mono font-bold text-[#3157D5] dark:text-[#6D8CFF]">
            UDP Port 53
          </div>
        </div>

        {/* The Question */}
        <div className="pt-4">
          <h2 className="text-xl sm:text-2xl font-black text-[#172033] dark:text-[#F9FAFB] tracking-tight">
            Which protocol translates domain names into IP addresses?
          </h2>
        </div>

        {/* Answer Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {options.map((opt) => {
            const isSelected = selectedAnswer === opt.id;
            const isTargetCorrect = isAnswered && opt.isCorrect;
            const isTargetWrong = isAnswered && isSelected && !opt.isCorrect;

            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                  isTargetCorrect
                    ? 'bg-[#35A86B]/15 border-[#35A86B] text-[#172033] dark:text-[#F9FAFB] shadow-[0_4px_0_0_#35A86B]'
                    : isTargetWrong
                    ? 'bg-[#F0A63A]/15 border-[#F0A63A] text-[#172033] dark:text-[#F9FAFB]'
                    : isSelected
                    ? 'bg-white dark:bg-[#1F2937] border-[#3157D5] shadow-[0_4px_0_0_#3157D5]'
                    : 'bg-white dark:bg-[#1F2937] border-[#E5E0D8] dark:border-slate-800 hover:border-slate-400'
                }`}
              >
                <div>
                  <div className="font-black text-sm text-[#172033] dark:text-[#F9FAFB]">{opt.name}</div>
                  <div className="text-[11px] text-[#64748B] dark:text-slate-400 font-medium mt-0.5">{opt.desc}</div>
                </div>

                {isTargetCorrect && <CheckCircle2 size={20} className="text-[#35A86B]" />}
                {isTargetWrong && <AlertCircle size={20} className="text-[#F0A63A]" />}
              </button>
            );
          })}
        </div>

        {/* Action Button & Feedback */}
        <div className="pt-4 flex items-center justify-between">
          <div className="text-xs font-semibold text-[#64748B]">
            {isAnswered && isCorrect ? '✓ Streak Protected!' : 'One attempt per day'}
          </div>

          <div>
            {!isAnswered ? (
              <button
                onClick={handleCheck}
                disabled={!selectedAnswer}
                className={`px-6 py-3 rounded-2xl font-black text-xs tracking-wider transition-all cursor-pointer ${
                  selectedAnswer
                    ? 'bg-[#3157D5] hover:bg-[#2442B0] text-white shadow-[0_4px_0_0_#2442B0] active:translate-y-1 active:shadow-none'
                    : 'bg-[#E5E0D8] dark:bg-slate-800 text-[#94A3B8] cursor-not-allowed'
                }`}
              >
                SUBMIT ANSWER
              </button>
            ) : isCorrect ? (
              <button
                onClick={onBack}
                className="px-6 py-3 rounded-2xl bg-[#35A86B] hover:bg-[#2F855A] text-white font-black text-xs tracking-wider shadow-[0_4px_0_0_#276749] cursor-pointer"
              >
                CLAIM +30 XP & RETURN
              </button>
            ) : (
              <button
                onClick={() => {
                  soundFx.playClick();
                  setIsAnswered(false);
                  setSelectedAnswer(null);
                }}
                className="px-6 py-3 rounded-2xl bg-[#F0A63A] hover:bg-[#D97706] text-white font-black text-xs tracking-wider shadow-[0_4px_0_0_#B45309] cursor-pointer"
              >
                TRY AGAIN
              </button>
            )}
          </div>
        </div>

      </div>

      {/* 3. Byte Bot Commentary */}
      <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-center">
        <ByteBot
          pose={isCorrect ? 'celebrating' : 'thinking'}
          size="lg"
          showSpeech={true}
          speechText={
            isCorrect
              ? 'Spot on! DNS is the phonebook of the Internet, translating human names into 32-bit or 128-bit IP addresses.'
              : 'Inspect the UDP port number 53 and query payload!'
          }
        />
      </div>

    </div>
  );
};
