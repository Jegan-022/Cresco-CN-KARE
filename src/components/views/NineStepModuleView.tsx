import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CurriculumModule, QuickCheckQuestion, SimulatorType 
} from '../../data/unitsCurriculum';
import { 
  RouterCLISimulator, 
  IPv4HeaderSimulator, 
  SubnetCalculatorSimulator, 
  DHCPDORASimulator, 
  DNSLookupSimulator, 
  HTTPBuilderSimulator, 
  SSHTelnetSimulator 
} from '../simulators/ModuleSimulators';
import {
  NetworkHeroVisualizer,
  RoutingGraphVisualizer,
  IPv6Visualizer,
  TCPHandshakeSimulator,
  TCPCongestionSimulator,
  ARPAnimationSimulator,
  NATVisualizer
} from '../simulators/InteractiveSimulatorsSuite';
import { 
  CheckCircle2, ArrowRight, ArrowLeft, Award, HelpCircle, 
  BookOpen, Target, Activity, Image as ImageIcon, Sparkles, 
  Lightbulb, Zap, Share2, Check, RefreshCw
} from 'lucide-react';
import { GooeyButton } from '../ui/GooeyButton';

interface NineStepModuleViewProps {
  module: CurriculumModule;
  isCompleted: boolean;
  onCompleteModule: (moduleId: string, xp: number) => void;
  onNextModule?: () => void;
  onBackToCourse?: () => void;
}

export const NineStepModuleView: React.FC<NineStepModuleViewProps> = ({
  module,
  isCompleted,
  onCompleteModule,
  onNextModule,
  onBackToCourse
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showExplanations, setShowExplanations] = useState<Record<string, boolean>>({});
  const [completionClaimed, setCompletionClaimed] = useState<boolean>(isCompleted);

  // Steps configuration
  const steps = [
    { num: 1, title: 'What is it?', icon: BookOpen },
    { num: 2, title: 'Why is it needed?', icon: Target },
    { num: 3, title: 'How does it work?', icon: Activity },
    { num: 4, title: 'Diagram', icon: ImageIcon },
    { num: 5, title: 'Interactive Simulator', icon: Zap },
    { num: 6, title: 'Real-World Example', icon: Lightbulb },
    { num: 7, title: 'Key Points', icon: Sparkles },
    { num: 8, title: 'Quick Check', icon: HelpCircle },
    { num: 9, title: 'Module Completion', icon: Award },
  ];

  const handleSelectOption = (qId: string, optIdx: number) => {
    setSelectedAnswers(prev => ({ ...prev, [qId]: optIdx }));
    setShowExplanations(prev => ({ ...prev, [qId]: true }));
  };

  const handleClaimCompletion = () => {
    if (!completionClaimed) {
      setCompletionClaimed(true);
      onCompleteModule(module.id, module.xpReward || 50);
    }
  };

  // Render the appropriate simulator for Step 5
  const renderSimulator = (type: SimulatorType) => {
    switch (type) {
      case 'router-cli':
        return <RouterCLISimulator />;
      case 'ipv4-header':
        return <IPv4HeaderSimulator />;
      case 'ipv6-format':
        return <IPv6Visualizer />;
      case 'subnet-calc':
      case 'vlsm-calc':
        return <SubnetCalculatorSimulator />;
      case 'dhcp-dora':
        return <DHCPDORASimulator />;
      case 'arp-table':
        return <ARPAnimationSimulator />;
      case 'nat-trans':
        return <NATVisualizer />;
      case 'icmp-ping':
      case 'internet-arch':
        return <NetworkHeroVisualizer />;
      case 'dijkstra-graph':
      case 'distance-vector':
      case 'bgp-as':
        return <RoutingGraphVisualizer />;
      case 'tcp-handshake':
        return <TCPHandshakeSimulator />;
      case 'tcp-congestion':
      case 'tcp-sliding-window':
      case 'tcp-states':
        return <TCPCongestionSimulator />;
      case 'dns-lookup':
        return <DNSLookupSimulator />;
      case 'http-builder':
        return <HTTPBuilderSimulator />;
      case 'ssh-telnet-compare':
        return <SSHTelnetSimulator />;
      default:
        return (
          <div className="p-8 bg-[#0B0D12] border border-[#252B36] text-white rounded-xl text-center space-y-3">
            <Zap className="w-12 h-12 text-[#5B7CFF] mx-auto" />
            <h4 className="text-lg font-bold">Interactive Protocol Simulator</h4>
            <p className="text-xs text-[#94A3B8] max-w-lg mx-auto leading-relaxed">
              Step-by-step state visualization for <span className="text-[#5B7CFF] font-bold">{module.title}</span>.
            </p>
            <div className="inline-block px-4 py-2 bg-[#5B7CFF] text-white text-xs font-semibold rounded-lg">
              Active Simulation Mode
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="bg-[#11141B] border border-[#252B36] rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-[#5B7CFF] uppercase tracking-wider bg-[#5B7CFF]/10 border border-[#5B7CFF]/20 px-2.5 py-0.5 rounded-full">
              {module.moduleCode} • {module.unitTitle}
            </span>
            {completionClaimed && (
              <span className="text-xs font-semibold text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/30 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-[#22C55E]" />
                <span>Completed (+50 XP)</span>
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1.5 tracking-tight">
            {module.title}
          </h1>
        </div>

        {onBackToCourse && (
          <button
            onClick={onBackToCourse}
            className="self-start sm:self-auto px-3.5 py-1.5 text-xs font-semibold text-[#94A3B8] bg-[#171B24] hover:bg-[#1E2330] border border-[#252B36] rounded-lg transition-colors cursor-pointer"
          >
            ← Back to Units
          </button>
        )}
      </div>

      {/* 9-Step Navigation Ribbon */}
      <div className="bg-[#11141B] border border-[#252B36] rounded-xl p-2 shadow-xs overflow-x-auto">
        <div className="flex items-center space-x-1 min-w-max">
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = activeStep === s.num;
            return (
              <button
                key={s.num}
                onClick={() => setActiveStep(s.num)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all transform-gpu cursor-pointer ${
                  isActive
                    ? 'bg-[#5B7CFF] text-white shadow-xs'
                    : 'text-[#94A3B8] hover:bg-[#171B24] hover:text-white'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isActive ? 'bg-white text-[#5B7CFF]' : 'bg-[#171B24] text-[#94A3B8]'
                }`}>
                  {s.num}
                </span>
                <span>{s.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Pedagogical Step Content */}
      <div className="bg-[#11141B] border border-[#252B36] rounded-xl p-6 sm:p-8 shadow-xs min-h-[420px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="space-y-6"
          >
            {/* STEP 1: WHAT IS IT? */}
            {activeStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-[#5B7CFF] font-bold text-xs uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" />
                  <span>Pedagogical Step 1: Definition & Concept</span>
                </div>
                <h2 className="text-xl font-bold text-white">What is {module.title}?</h2>
                <div className="p-5 bg-[#0B0D12] border border-[#252B36] rounded-xl text-slate-200 text-base leading-relaxed font-medium">
                  {module.whatIsIt}
                </div>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  In Computer Networks curriculum at KLU, mastering this foundational principle is mandatory for analyzing packet traces, diagnosing routing issues, and excelling in mid-term and semester examinations.
                </p>
              </div>
            )}

            {/* STEP 2: WHY IS IT NEEDED? */}
            {activeStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-[#8B5CF6] font-bold text-xs uppercase tracking-wider">
                  <Target className="w-4 h-4" />
                  <span>Pedagogical Step 2: Problem Statement & Motivation</span>
                </div>
                <h2 className="text-xl font-bold text-white">Why is it needed?</h2>
                <div className="p-5 bg-[#0B0D12] border border-[#252B36] rounded-xl text-slate-200 text-base leading-relaxed">
                  {module.whyNeeded}
                </div>
                <div className="p-4 bg-[#171B24] border border-[#252B36] rounded-xl text-xs text-[#94A3B8] space-y-1">
                  <span className="font-bold text-white block">Engineering Tradeoff:</span>
                  <p>
                    Without this mechanism, protocol stacks suffer from buffer exhaustion, unbounded latency, or unrecoverable packet collisions across autonomous network segments.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 3: HOW DOES IT WORK? */}
            {activeStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-[#22C55E] font-bold text-xs uppercase tracking-wider">
                  <Activity className="w-4 h-4" />
                  <span>Pedagogical Step 3: Mechanics & Execution Flow</span>
                </div>
                <h2 className="text-xl font-bold text-white">How does it work?</h2>
                <div className="space-y-3">
                  {module.howItWorks.map((stepDesc, idx) => (
                    <div key={idx} className="flex items-start space-x-3 p-4 bg-[#0B0D12] border border-[#252B36] rounded-xl">
                      <div className="w-6 h-6 rounded-full bg-[#5B7CFF] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-slate-200 leading-relaxed font-medium">
                        {stepDesc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: DIAGRAM */}
            {activeStep === 4 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-[#F59E0B] font-bold text-xs uppercase tracking-wider">
                  <ImageIcon className="w-4 h-4" />
                  <span>Pedagogical Step 4: Architectural Blueprint</span>
                </div>
                <h2 className="text-xl font-bold text-white">Visual Topology & Packet Flow</h2>
                <div className="p-6 bg-[#0B0D12] text-[#22C55E] font-mono text-xs sm:text-sm rounded-xl overflow-x-auto shadow-inner border border-[#252B36] leading-relaxed whitespace-pre-wrap">
                  {module.diagramText}
                </div>
                <p className="text-xs text-[#94A3B8] italic">
                  Tip: Trace the flow of packet headers and state changes from left to right as described in the architecture diagram above.
                </p>
              </div>
            )}

            {/* STEP 5: ANIMATION / SIMULATOR */}
            {activeStep === 5 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-[#5B7CFF] font-bold text-xs uppercase tracking-wider">
                  <Zap className="w-4 h-4" />
                  <span>Pedagogical Step 5: Interactive Hands-On Lab</span>
                </div>
                <h2 className="text-xl font-bold text-white">Interactive Simulation: {module.title}</h2>
                {renderSimulator(module.simulatorType)}
              </div>
            )}

            {/* STEP 6: REAL-WORLD EXAMPLE */}
            {activeStep === 6 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-[#8B5CF6] font-bold text-xs uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4" />
                  <span>Pedagogical Step 6: Production Application</span>
                </div>
                <h2 className="text-xl font-bold text-white">Real-World Case Study</h2>
                <div className="p-5 bg-[#0B0D12] border border-[#252B36] rounded-xl text-slate-200 text-sm sm:text-base leading-relaxed font-medium">
                  {module.realWorldExample}
                </div>
                <div className="p-4 bg-[#171B24] border border-[#252B36] rounded-xl text-xs text-[#94A3B8]">
                  <span className="font-bold text-white block mb-1">Campus Context:</span>
                  KLU’s campus network engineering team deploys these exact architectural designs across academic blocks, research labs, and dormitory Wi-Fi nodes.
                </div>
              </div>
            )}

            {/* STEP 7: KEY POINTS */}
            {activeStep === 7 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-[#F59E0B] font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Pedagogical Step 7: Exam Revision & Key Takeaways</span>
                </div>
                <h2 className="text-xl font-bold text-white">Essential Takeaways for Exams</h2>
                <div className="grid grid-cols-1 gap-3">
                  {module.keyPoints.map((point, idx) => (
                    <div key={idx} className="flex items-start space-x-3 p-4 bg-[#0B0D12] border border-[#252B36] rounded-xl">
                      <div className="w-5 h-5 rounded-full bg-[#F59E0B] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        ★
                      </div>
                      <p className="text-sm text-slate-200 font-medium leading-relaxed">
                        {point}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 8: QUICK CHECK */}
            {activeStep === 8 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2 text-[#5B7CFF] font-bold text-xs uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4" />
                  <span>Pedagogical Step 8: Knowledge Check</span>
                </div>
                <h2 className="text-xl font-bold text-white">Quick Concept Verification</h2>
                <div className="space-y-6">
                  {module.quickCheck.map((qc, qIdx) => {
                    const selected = selectedAnswers[qc.id];
                    const isAnswered = selected !== undefined;
                    const isCorrect = selected === qc.correctIndex;

                    return (
                      <div key={qc.id} className="p-5 bg-[#0B0D12] border border-[#252B36] rounded-xl space-y-3">
                        <h3 className="font-bold text-white text-sm leading-relaxed">
                          Q{qIdx + 1}: {qc.question}
                        </h3>

                        <div className="space-y-2">
                          {qc.options.map((opt, optIdx) => {
                            let btnStyle = 'bg-[#171B24] border-[#252B36] text-slate-200 hover:bg-[#1E2330]';
                            if (isAnswered) {
                              if (optIdx === qc.correctIndex) {
                                btnStyle = 'bg-[#22C55E]/15 border-[#22C55E] text-[#22C55E] font-bold shadow-xs';
                              } else if (optIdx === selected) {
                                btnStyle = 'bg-[#EF4444]/15 border-[#EF4444] text-[#EF4444] font-bold';
                              } else {
                                btnStyle = 'bg-[#171B24] border-[#252B36] text-slate-500 opacity-50';
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                disabled={isAnswered}
                                onClick={() => handleSelectOption(qc.id, optIdx)}
                                className={`w-full text-left p-3 rounded-lg border text-xs sm:text-sm transition-all transform-gpu flex items-center justify-between cursor-pointer ${btnStyle}`}
                              >
                                <span>{opt}</span>
                                {isAnswered && optIdx === qc.correctIndex && (
                                  <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 ml-2" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {showExplanations[qc.id] && (
                          <div className={`p-3.5 rounded-lg border text-xs ${
                            isCorrect ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]' : 'bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]'
                          }`}>
                            <span className="font-bold block mb-0.5">
                              {isCorrect ? '✓ Correct!' : 'Explanation:'}
                            </span>
                            {qc.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 9: MODULE COMPLETION */}
            {activeStep === 9 && (
              <div className="space-y-6 text-center py-6">
                <div className="w-16 h-16 rounded-3xl bg-[#5B7CFF]/15 text-[#5B7CFF] border border-[#5B7CFF]/30 flex items-center justify-center mx-auto shadow-md">
                  <Award className="w-9 h-9" />
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <h2 className="text-2xl font-extrabold text-white">
                    {completionClaimed ? 'Module Mastered!' : 'Ready to Complete Module!'}
                  </h2>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">
                    You have reviewed the 9-step pedagogical breakdown for <span className="font-bold text-white">{module.title}</span>.
                  </p>
                </div>

                <div className="p-4 max-w-sm mx-auto bg-[#171B24] border border-[#252B36] rounded-2xl flex items-center justify-center space-x-3">
                  <Sparkles className="w-5 h-5 text-[#F59E0B]" />
                  <span className="text-base font-extrabold text-white">+50 XP Awarded</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  {!completionClaimed ? (
                    <GooeyButton
                      onClick={handleClaimCompletion}
                      variant="cyan"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Claim +50 XP & Sync Progress</span>
                    </GooeyButton>
                  ) : (
                    <div className="text-xs font-semibold text-[#22C55E] bg-[#22C55E]/10 px-4 py-2 rounded-lg border border-[#22C55E]/30">
                      ✓ Progress Synced with Firestore
                    </div>
                  )}

                  {onNextModule && (
                    <GooeyButton
                      onClick={onNextModule}
                      variant="cyan"
                    >
                      <span>Proceed to Next Module</span>
                      <ArrowRight className="w-4 h-4" />
                    </GooeyButton>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Step Control Navigation */}
      <div className="flex items-center justify-between bg-[#11141B] border border-[#252B36] rounded-xl p-4 shadow-xs">
        <GooeyButton
          disabled={activeStep === 1}
          onClick={() => setActiveStep(prev => Math.max(prev - 1, 1))}
          variant="cyan"
          size="sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous Step</span>
        </GooeyButton>

        <span className="text-xs font-bold text-[#94A3B8]">
          Step {activeStep} of 9
        </span>

        {activeStep < 9 ? (
          <GooeyButton
            onClick={() => setActiveStep(prev => Math.min(prev + 1, 9))}
            variant="cyan"
            size="sm"
          >
            <span>Next Step</span>
            <ArrowRight className="w-4 h-4" />
          </GooeyButton>
        ) : (
          <GooeyButton
            onClick={onNextModule}
            variant="emerald"
            size="sm"
          >
            <span>Finish & Next</span>
            <ArrowRight className="w-4 h-4" />
          </GooeyButton>
        )}
      </div>
    </div>
  );
};
