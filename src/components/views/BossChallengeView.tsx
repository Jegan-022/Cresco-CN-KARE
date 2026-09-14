import React, { useState, useEffect } from 'react';
import { ByteBot } from '../character/ByteBot';
import { CrescoMascot } from '../brand/CrescoMascot';
import { soundFx } from '../../utils/soundEffects';
import { triggerSubtleSectionConfetti } from '../../utils/confetti';
import { 
  AlertTriangle, 
  Clock, 
  Trophy, 
  CheckCircle2, 
  RotateCcw, 
  ArrowRight, 
  Laptop, 
  Router as RouterIcon, 
  Server, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';

interface BossChallengeViewProps {
  onComplete?: (xp: number) => void;
  onExit?: () => void;
}

export const BossChallengeView: React.FC<BossChallengeViewProps> = ({
  onComplete,
  onExit,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(120); // 02:00
  const [stage, setStage] = useState<1 | 2 | 3 | 4 | 5>(1); // 1: identify, 2: method, 3: fix, 4: test, 5: triumph
  const [failedRouteSelected, setFailedRouteSelected] = useState(false);
  const [chosenMethod, setChosenMethod] = useState<string | null>(null);
  const [isBackupActive, setIsBackupActive] = useState(false);
  const [testPacketSent, setTestPacketSent] = useState(false);

  // Timer effect
  useEffect(() => {
    if (stage === 5) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [stage]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  // Step 1: Identify broken link
  const handleSelectLink = (linkId: string) => {
    if (linkId === 'r1-r2') {
      soundFx.playCorrect();
      setFailedRouteSelected(true);
      setTimeout(() => setStage(2), 600);
    } else {
      soundFx.playIncorrect();
    }
  };

  // Step 2: Choose routing method
  const handleSelectMethod = (method: string) => {
    soundFx.playClick();
    setChosenMethod(method);
    if (method === 'ospf') {
      soundFx.playCorrect();
      setTimeout(() => setStage(3), 600);
    } else {
      soundFx.playIncorrect();
    }
  };

  // Step 3: Activate backup route
  const handleActivateBackup = () => {
    soundFx.playCorrect();
    setIsBackupActive(true);
    setTimeout(() => setStage(4), 800);
  };

  // Step 4: Restore communication probe
  const handleSendProbe = () => {
    soundFx.playPacketPop();
    setTestPacketSent(true);
    setTimeout(() => {
      soundFx.playLevelUp();
      triggerSubtleSectionConfetti();
      setStage(5);
      if (onComplete) onComplete(100);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-16">
      
      {/* 1. Header with Boss Alert & Countdown Timer */}
      <div className="bg-white dark:bg-[#1F2937] border-2 border-[#D95C5C] dark:border-[#D95C5C]/60 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#D95C5C]/15 text-[#D95C5C] flex items-center justify-center shrink-0">
            <AlertTriangle size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-black text-[#D95C5C] uppercase tracking-widest">
              <span>BOSS CHALLENGE</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#D95C5C] animate-ping" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#172033] dark:text-[#F9FAFB] tracking-tight">
              🚨 NETWORK FAILURE
            </h1>
            <p className="text-xs sm:text-sm font-medium text-[#64748B] dark:text-slate-400 mt-0.5">
              "Something went wrong. Critical packet route between Router 1 and Router 2 has severed."
            </p>
          </div>
        </div>

        {/* Timer & Reward Pill */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-700">
            <Clock size={16} className={secondsLeft < 30 ? 'text-[#D95C5C] animate-pulse' : 'text-[#64748B]'} />
            <span className="font-mono text-base font-black text-[#172033] dark:text-[#F9FAFB]">
              {formatTime(secondsLeft)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#F0A63A]/15 text-[#B45309] dark:text-[#F0A63A] border border-[#F0A63A]/30 text-xs font-black">
            <Trophy size={16} />
            <span>+100 XP</span>
          </div>
        </div>
      </div>

      {/* 2. Live Broken Network Topology Diagram */}
      <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
        
        <div className="text-[11px] font-mono font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider mb-6 text-center">
          LIVE TOPOLOGY TELEMETRY
        </div>

        {/* Topology Nodes Flow */}
        <div className="relative min-h-[240px] flex flex-col justify-between">
          
          {/* Primary Top Trunk: PC A -> Router 1 -> Router 2 (BROKEN) -> Server */}
          <div className="flex items-center justify-between relative z-10 px-4 sm:px-10">
            
            {/* PC A */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-[#3157D5] text-white flex items-center justify-center shadow-md">
                <Laptop size={26} />
              </div>
              <span className="font-bold text-xs mt-2">PC A</span>
            </div>

            {/* Cable PC A -> Router 1 */}
            <div className="flex-1 h-1.5 bg-[#35A86B] mx-2" />

            {/* Router 1 */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-[#5B7CFA] text-white flex items-center justify-center shadow-md">
                <RouterIcon size={26} />
              </div>
              <span className="font-bold text-xs mt-2">Router 1</span>
            </div>

            {/* BROKEN SECTOR: Router 1 -> Router 2 */}
            <div 
              onClick={() => stage === 1 && handleSelectLink('r1-r2')}
              className={`flex-1 mx-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
                stage === 1 ? 'hover:scale-105' : ''
              }`}
            >
              <div className="w-full h-1.5 bg-[#D95C5C] relative flex items-center justify-center">
                <span className="text-base font-black px-2 py-0.5 rounded bg-[#D95C5C] text-white text-[10px] uppercase tracking-wider shadow-sm">
                  ❌ SEVERED
                </span>
              </div>
              {stage === 1 && (
                <span className="text-[10px] font-bold text-[#D95C5C] mt-1.5 animate-pulse">
                  TAP TO DIAGNOSE
                </span>
              )}
            </div>

            {/* Router 2 */}
            <div className="flex flex-col items-center opacity-70">
              <div className="w-14 h-14 rounded-2xl bg-slate-400 text-white flex items-center justify-center shadow-md">
                <RouterIcon size={26} />
              </div>
              <span className="font-bold text-xs mt-2">Router 2</span>
            </div>

            {/* Cable Router 2 -> Server */}
            <div className="flex-1 h-1.5 bg-slate-300 dark:bg-slate-700 mx-2" />

            {/* Server */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-[#35A86B] text-white flex items-center justify-center shadow-md">
                <Server size={26} />
              </div>
              <span className="font-bold text-xs mt-2">Target Server</span>
            </div>

          </div>

          {/* Backup Standby Path through Router 3 */}
          <div className="mt-8 flex items-center justify-center relative z-10">
            <div className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${
              isBackupActive
                ? 'bg-[#35A86B]/10 border-[#35A86B] shadow-md'
                : 'bg-[#F7F5F0] dark:bg-[#111827] border-dashed border-[#E5E0D8] dark:border-slate-700 opacity-80'
            }`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${
                isBackupActive ? 'bg-[#35A86B]' : 'bg-slate-400'
              }`}>
                <RouterIcon size={22} />
              </div>
              <div>
                <div className="text-xs font-black font-mono uppercase text-[#172033] dark:text-[#F9FAFB]">
                  Router 3 (Standby Failover Node)
                </div>
                <div className="text-[11px] text-[#64748B] dark:text-slate-400 font-medium">
                  {isBackupActive ? '✓ Backup Route Active (Cost: 15)' : 'Standby Link Available'}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 3. 4-Step Interactive Diagnostic Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Task Control Panel */}
        <div className="md:col-span-2 rounded-3xl bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 p-6 shadow-sm space-y-4">
          
          <div className="flex items-center justify-between pb-3 border-b border-[#EFECE6] dark:border-slate-800">
            <span className="text-xs font-mono font-bold text-[#3157D5] dark:text-[#6D8CFF] uppercase tracking-wider">
              TASK {stage <= 4 ? stage : 4} OF 4
            </span>
            <span className="text-xs font-bold text-[#64748B]">
              {stage === 1 && '1. Identify the failed route'}
              {stage === 2 && '2. Choose correct routing method'}
              {stage === 3 && '3. Fix the route'}
              {stage === 4 && '4. Restore communication'}
              {stage === 5 && 'Restoration Complete!'}
            </span>
          </div>

          {/* Step 1 Task */}
          {stage === 1 && (
            <div className="space-y-3 animate-fadeIn">
              <h3 className="text-base font-extrabold text-[#172033] dark:text-[#F9FAFB]">
                Step 1: Locate the broken link in the topology diagram above.
              </h3>
              <p className="text-xs text-[#64748B] dark:text-slate-400 font-medium">
                Tap on the severed route between Router 1 and Router 2 to mark it as the point of failure.
              </p>
            </div>
          )}

          {/* Step 2 Task */}
          {stage === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-base font-extrabold text-[#172033] dark:text-[#F9FAFB]">
                Step 2: How should the network reroute traffic around the failure?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => handleSelectMethod('ospf')}
                  className="p-4 rounded-2xl border-2 border-[#3157D5] bg-white dark:bg-[#1F2937] hover:bg-[#3157D5]/10 text-left font-bold text-xs cursor-pointer shadow-xs"
                >
                  <div className="text-sm font-black text-[#3157D5] dark:text-[#6D8CFF]">OSPF Dynamic Convergence</div>
                  <div className="text-[11px] text-[#64748B] mt-1">Dijkstra SPF recalculates shortest alternate path automatically.</div>
                </button>
                <button
                  onClick={() => handleSelectMethod('reboot')}
                  className="p-4 rounded-2xl border-2 border-[#E5E0D8] bg-white dark:bg-[#1F2937] hover:bg-slate-100 dark:hover:bg-slate-800 text-left font-bold text-xs cursor-pointer"
                >
                  <div className="text-sm font-black text-[#172033] dark:text-white">Ignore & Drop Packets</div>
                  <div className="text-[11px] text-[#64748B] mt-1">Leave packets unrouted until manual hardware reboot.</div>
                </button>
              </div>
            </div>
          )}

          {/* Step 3 Task */}
          {stage === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-base font-extrabold text-[#172033] dark:text-[#F9FAFB]">
                Step 3: Activate the standby failover route through Router 3.
              </h3>
              <p className="text-xs text-[#64748B] dark:text-slate-400 font-medium">
                Update routing tables to forward packets via Router 3 (metric cost 15).
              </p>
              <button
                onClick={handleActivateBackup}
                className="px-6 py-3 rounded-2xl bg-[#3157D5] hover:bg-[#2442B0] text-white font-black text-xs tracking-wider shadow-[0_4px_0_0_#2442B0] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
              >
                APPLY ROUTE FAILOVER →
              </button>
            </div>
          )}

          {/* Step 4 Task */}
          {stage === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-base font-extrabold text-[#172033] dark:text-[#F9FAFB]">
                Step 4: Restore communication and verify end-to-end packet delivery.
              </h3>
              <p className="text-xs text-[#64748B] dark:text-slate-400 font-medium">
                Dispatch an ICMP echo probe from PC A to Server through Router 3 to confirm full recovery.
              </p>
              <button
                onClick={handleSendProbe}
                className="px-6 py-3 rounded-2xl bg-[#35A86B] hover:bg-[#2F855A] text-white font-black text-xs tracking-wider shadow-[0_4px_0_0_#276749] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
              >
                TRANSMIT TEST PROBE →
              </button>
            </div>
          )}

          {/* Step 5: Triumph */}
          {stage === 5 && (
            <div className="space-y-4 animate-scaleUp text-center py-4">
              <div className="text-xl font-black text-[#35A86B] flex items-center justify-center gap-2">
                <Sparkles size={24} />
                <span>COMMUNICATION FULLY RESTORED!</span>
              </div>
              <p className="text-xs sm:text-sm text-[#475569] dark:text-[#D1D5DB] font-medium max-w-md mx-auto">
                Outstanding diagnosis. You identified the link severance, deployed OSPF convergence, and routed packets across the standby failover node.
              </p>
              <button
                onClick={onExit}
                className="px-8 py-3.5 rounded-2xl bg-[#3157D5] hover:bg-[#2442B0] text-white font-black text-xs tracking-wider shadow-[0_4px_0_0_#2442B0] cursor-pointer"
              >
                CLAIM +100 XP REWARD & RETURN
              </button>
            </div>
          )}

        </div>

        {/* Network Octopus Companion in Boss Battle Pose */}
        <div className="rounded-3xl bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 p-6 shadow-sm flex items-center justify-center">
          <CrescoMascot
            pose={stage === 5 ? 'achievement' : 'boss'}
            size="xl"
            animation={stage === 5 ? 'bounce' : 'float'}
            withGlow
            speechText={
              stage === 1
                ? 'Check the trunk link! Router 1 and Router 2 cannot handshake.'
                : stage === 2
                ? 'Dynamic routing protocols like OSPF recalculate alternate paths!'
                : stage === 3
                ? 'Standby node Router 3 is ready to take traffic!'
                : stage === 4
                ? 'Send the verification packet across the new route!'
                : 'Spectacular work, Network Engineer! The network is safe.'
            }
            speechPosition="top"
          />
        </div>

      </div>

    </div>
  );
};
