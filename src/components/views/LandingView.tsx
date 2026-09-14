import React, { useState, useMemo } from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  ShieldCheck, 
  Activity, 
  BookOpen, 
  Trophy, 
  Laptop, 
  Globe, 
  Terminal,
  Compass,
  Cpu,
  Zap,
  Sparkles,
  Lock,
  ChevronDown,
  HelpCircle,
  Clock,
  Flame,
  Award
} from 'lucide-react';
import { PillNav, PillNavItem } from '../ui/PillNav';
import { SpotlightCard } from '../ui/SpotlightCard';
import { ShimmerButton } from '../ui/ShimmerButton';
import { ProtocolMarquee } from '../ui/ProtocolMarquee';
import { InteractiveTerminal } from '../landing/InteractiveTerminal';
import { SubnetCalculatorWidget } from '../landing/SubnetCalculatorWidget';
import { InteractiveOsiExplorer } from '../landing/InteractiveOsiExplorer';
import { ThemeToggleSwitch } from '../ThemeToggleSwitch';

interface LandingViewProps {
  onNavigateToLogin: () => void;
  onNavigateToSignup: () => void;
  onNavigateToLaunch?: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onNavigateToLogin,
  onNavigateToSignup,
  onNavigateToLaunch,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // PillNav Items
  const navItems = useMemo<PillNavItem[]>(() => [
    {
      label: 'Home',
      href: '#hero',
      onClick: (e) => {
        e?.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    {
      label: 'Launch',
      href: '#launch',
      onClick: (e) => {
        e?.preventDefault();
        onNavigateToLaunch?.();
      }
    },
    {
      label: 'Simulators',
      href: '#simulators',
      onClick: (e) => {
        e?.preventDefault();
        document.getElementById('simulators')?.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      label: 'OSI Layers',
      href: '#layers',
      onClick: (e) => {
        e?.preventDefault();
        document.getElementById('layers')?.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      label: 'Syllabus',
      href: '#syllabus',
      onClick: (e) => {
        e?.preventDefault();
        document.getElementById('syllabus')?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  ], [onNavigateToLaunch]);

  const faqs = [
    {
      q: 'How does Cresco CN align with the university Computer Networks syllabus?',
      a: 'Cresco CN is directly mapped to the CSE curriculum covering Unit 3 (Network Layer & Subnetting), Unit 4 (Transport Layer & TCP Mechanics), and Unit 5 (Application Layer Protocols). Every module contains theory, interactive animations, and practice questions matching actual university exam patterns.'
    },
    {
      q: 'Do I need to install Wireshark or Cisco Packet Tracer?',
      a: 'No external software is required! Cresco CN features embedded browser-based packet simulators and network builders powered by WebAssembly, allowing you to trace handshakes, ping IP addresses, and inspect protocol headers directly in your browser.'
    },
    {
      q: 'What is the Launch Countdown on September 15?',
      a: 'The full university cohort launches on September 15 at 00:00:00. Registered students and developers with early access credentials can log in immediately to explore all modules and earn early XP.'
    },
    {
      q: 'Can I track my streak and compete on the university leaderboard?',
      a: 'Yes! Cresco CN includes daily challenges, streak multipliers, level progression, and a real-time leaderboard where CSE students can compare their mastery and earned badges.'
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#0B0B11] text-white selection:bg-cyan-500/20 selection:text-cyan-300 font-sans relative overflow-x-hidden">
      
      {/* 1. Global Navigation Bar with PillNav */}
      <header className="sticky top-0 w-full px-4 sm:px-10 py-4 z-50 bg-[#0B0B11]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left Brand Badge */}
          <div className="hidden md:flex items-center gap-3 min-w-[180px]">
            <div className="relative w-10 h-10 rounded-2xl overflow-hidden border border-cyan-400/40 shadow-[0_4px_12px_rgba(6,182,212,0.3)] shrink-0 bg-gradient-to-br from-[#0d3b46] to-[#08252d] flex items-center justify-center">
              <img 
                src="/assets/brand/cresco-favicon.png" 
                alt="Cresco CN Mascot Logo" 
                className="w-full h-full object-contain p-0.5" 
              />
              <span className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-900 shadow-xs animate-packet-beacon" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-white leading-none font-headline">
                CRESCO<span className="text-cyan-400 font-black">-CN</span>
              </span>
              <span className="text-[9px] font-mono text-emerald-400 tracking-wider uppercase leading-none mt-1">
                GAMIFIED LEARNING
              </span>
            </div>
          </div>

          {/* Center PillNav (UIverse & ReactBits Inspired) */}
          <div className="flex-1 sm:flex-none flex items-center justify-center">
            <PillNav
              logo="/logo-green.svg"
              logoAlt="Cresco CN Logo"
              items={navItems}
              activeHref="#hero"
              baseColor="#12131C"
              pillColor="rgba(255, 255, 255, 0.06)"
              hoverCircleColor="#10B981"
              hoveredPillTextColor="#FFFFFF"
              pillTextColor="#94A3B8"
              ease="power3.easeOut"
            />
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-[120px] justify-end">
            <ThemeToggleSwitch variant="compact" className="text-slate-300 hover:text-white" />

            <button
              onClick={onNavigateToLogin}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
            >
              <Lock size={12} className="text-slate-400" />
              <span>Sign In</span>
            </button>

            <ShimmerButton
              onClick={onNavigateToLogin}
              variant="emerald"
              size="sm"
              className="hidden sm:inline-flex"
            >
              Start Learning
            </ShimmerButton>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section id="hero" className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Ambient Glows (GPU Hardware Accelerated) */}
        <div 
          className="pointer-events-none absolute top-0 left-1/4 -translate-x-1/2 w-[460px] h-[350px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)', transform: 'translateZ(0)' }} 
        />
        <div 
          className="pointer-events-none absolute top-10 right-1/4 w-[460px] h-[350px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)', transform: 'translateZ(0)' }} 
        />

        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-6 space-y-6">
            {/* Academic Eyebrow Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold tracking-wider uppercase">CRESCO CN • KLU CSE</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05]">
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
                CRESCO CN
              </span>
              <br />
              <span className="text-3xl sm:text-5xl lg:text-5xl font-extrabold text-slate-100">
                Understand Networks. <br className="hidden sm:inline" />Not Just Memorize Them.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed font-normal">
              Master the physical wire to the application layer. Trace live TCP 3-way handshakes, calculate CIDR subnet masks interactively, and conquer boss exams with ByteBot AI.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <ShimmerButton
                onClick={onNavigateToLogin}
                variant="emerald"
                size="lg"
                icon={<ArrowRight size={18} />}
              >
                Launch Learning Hub
              </ShimmerButton>

              <button
                onClick={() => document.getElementById('simulators')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-slate-200 hover:text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md"
              >
                <Terminal size={16} className="text-cyan-400" />
                <span>Try Live Simulator</span>
              </button>
            </div>

            {/* Credibility Badges */}
            <div className="pt-4 flex flex-wrap items-center gap-5 text-xs text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>17 Interactive Modules</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>Zero Installation Simulator</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>CSE Exam Aligned</span>
              </div>
            </div>
          </div>

          {/* Right Hero: Interactive Terminal Sandbox */}
          <div className="lg:col-span-6">
            <InteractiveTerminal />
          </div>
        </div>
      </section>

      {/* 3. Protocol Marquee (ReactBits Style) */}
      <ProtocolMarquee />

      {/* 4. Curriculum Metrics Section */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SpotlightCard className="p-6 text-center">
            <div className="text-3xl sm:text-4xl font-mono font-extrabold text-emerald-400 mb-1">
              17
            </div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Interactive Modules
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Complete Units 3, 4 & 5
            </div>
          </SpotlightCard>

          <SpotlightCard className="p-6 text-center">
            <div className="text-3xl sm:text-4xl font-mono font-extrabold text-cyan-400 mb-1">
              45+
            </div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Hands-On Drills
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Packet Traces & Math
            </div>
          </SpotlightCard>

          <SpotlightCard className="p-6 text-center">
            <div className="text-3xl sm:text-4xl font-mono font-extrabold text-emerald-400 mb-1">
              100%
            </div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Curriculum Aligned
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              KLU CSE Department
            </div>
          </SpotlightCard>

          <SpotlightCard className="p-6 text-center">
            <div className="text-3xl sm:text-4xl font-mono font-extrabold text-purple-400 mb-1">
              &lt;10ms
            </div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Simulator Latency
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Real-Time Visuals
            </div>
          </SpotlightCard>
        </div>
      </section>

      {/* 5. Interactive Simulators Section */}
      <section id="simulators" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
            Interactive Tools
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Learn By Simulating, Not Memorizing
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Tackle complex subnetting math and packet flows with immediate visual feedback.
          </p>
        </div>

        {/* Subnet Calculator Interactive Widget */}
        <SubnetCalculatorWidget />
      </section>

      {/* 6. Interactive OSI 7-Layer Model */}
      <section id="layers" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <InteractiveOsiExplorer />
      </section>

      {/* 7. Bento Grid Feature Showcase (UIverse & ReactBits Inspired) */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
            Platform Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Built for Serious Engineering Students
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            A comprehensive suite of gamified learning tools designed to help you ace your midterms and finals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Card 1: Packet Tracer */}
          <SpotlightCard className="p-7 flex flex-col justify-between" spotlightColor="rgba(6,182,212,0.18)">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Activity size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">
                Live Packet Tracer
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Watch IP packets move hop-by-hop across routers, switches, and firewalls. Inspect TTL decrements and checksum recalculations in real time.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-cyan-400 font-semibold">
              <span>Zero-lag Canvas</span>
              <ArrowRight size={14} />
            </div>
          </SpotlightCard>

          {/* Bento Card 2: Boss Challenges & Gamification */}
          <SpotlightCard className="p-7 flex flex-col justify-between" spotlightColor="rgba(16,185,129,0.18)">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Trophy size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">
                Boss Challenges & XP
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Test your mastery against time-pressured boss battles at the end of each unit. Maintain streaks, climb leagues, and unlock prestigious certifications.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-emerald-400 font-semibold">
              <span>Duolingo-style Streaks</span>
              <Flame size={14} />
            </div>
          </SpotlightCard>

          {/* Bento Card 3: University Exam Mode */}
          <SpotlightCard className="p-7 flex flex-col justify-between" spotlightColor="rgba(168,85,247,0.18)">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Award size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">
                University Exam Mode
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Timed exam simulations crafted around real KLU midterm questions. Get comprehensive score analytics and weak-area diagnosis.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-purple-400 font-semibold">
              <span>Instant Score Breakdown</span>
              <CheckCircle2 size={14} />
            </div>
          </SpotlightCard>
        </div>
      </section>


      {/* 9. University Syllabus Breakdown */}
      <section id="syllabus" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
            Curriculum Map
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Three Comprehensive Academic Units
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Structured into 17 sequentially unlocked modules with integrated quizzes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Unit 3 */}
          <SpotlightCard className="p-6 flex flex-col justify-between" spotlightColor="rgba(6,182,212,0.15)">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono font-bold text-sm flex items-center justify-center">
                  U3
                </span>
                <span className="text-xs font-mono font-bold text-cyan-400">
                  7 Modules
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Unit 3: Network Layer
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Routing algorithms, IPv4/IPv6 address hierarchies, subnetting calculations (CIDR/VLSM), NAT, ICMP, and BGP exterior routing.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 size={13} /> Unlocked on Start
              </span>
              <button
                onClick={onNavigateToLogin}
                className="font-bold text-cyan-400 hover:underline cursor-pointer"
              >
                Start Unit →
              </button>
            </div>
          </SpotlightCard>

          {/* Unit 4 */}
          <SpotlightCard className="p-6 flex flex-col justify-between" spotlightColor="rgba(168,85,247,0.15)">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 font-mono font-bold text-sm flex items-center justify-center">
                  U4
                </span>
                <span className="text-xs font-mono font-bold text-purple-400">
                  5 Modules
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Unit 4: Transport Layer
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  TCP connection management, 3-way handshake, congestion avoidance (AIMD), flow control sliding windows, and UDP socket mechanics.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                Unlocks via Unit 3 Exam
              </span>
              <button
                onClick={onNavigateToLogin}
                className="font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                Preview →
              </button>
            </div>
          </SpotlightCard>

          {/* Unit 5 */}
          <SpotlightCard className="p-6 flex flex-col justify-between" spotlightColor="rgba(16,185,129,0.15)">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-sm flex items-center justify-center">
                  U5
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  5 Modules
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Unit 5: Application Layer
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  DNS recursive resolution, HTTP/1.1 vs HTTP/2/3, email protocols (SMTP/IMAP), and modern network security (TLS 1.3).
                </p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                Unlocks via Unit 4 Exam
              </span>
              <button
                onClick={onNavigateToLogin}
                className="font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                Preview →
              </button>
            </div>
          </SpotlightCard>
        </div>
      </section>

      {/* 10. Modern FAQ Accordion (UIverse Dark Glassmorphic Style) */}
      <section id="faq" className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
            Frequently Asked Questions
          </div>
          <h2 className="text-3xl font-extrabold text-white">
            Everything You Need to Know
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-white/[0.08] bg-[#12131C] overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02]"
                >
                  <span className="text-sm sm:text-base font-semibold text-white">
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-cyan-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/[0.04]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 11. Final High-Impact CTA Banner */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl border border-white/15 bg-gradient-to-r from-emerald-600/20 via-teal-500/15 to-cyan-500/20 p-8 sm:p-14 text-center overflow-hidden shadow-2xl">
          <div className="pointer-events-none absolute inset-0 bg-[#0E101A]/60 backdrop-blur-md" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white font-mono text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2">
              <Sparkles size={14} className="text-amber-300" />
              <span>University Access Available</span>
            </span>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Ready to Master Computer Networks?
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Join thousands of CSE students preparing for exams and interviews with interactive simulators and AI guidance.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <ShimmerButton
                onClick={onNavigateToLogin}
                variant="emerald"
                size="lg"
                icon={<ArrowRight size={18} />}
              >
                Start Learning Now
              </ShimmerButton>

              {onNavigateToLaunch && (
                <button
                  onClick={onNavigateToLaunch}
                  className="px-6 py-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-slate-200 font-semibold text-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  <Clock size={16} className="text-cyan-400" />
                  <span>View Launch Countdown</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 12. Modern University Academic Footer */}
      <footer className="w-full bg-[#08080E] border-t border-white/[0.06] py-12 px-4 sm:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-cyan-400/40 shadow-xs shrink-0 bg-gradient-to-br from-[#0d3b46] to-[#08252d] flex items-center justify-center">
              <img 
                src="/assets/brand/cresco-favicon.png" 
                alt="Cresco CN Mascot" 
                className="w-full h-full object-contain p-0.5" 
              />
            </div>
            <div>
              <div className="text-white font-bold text-sm flex items-center gap-1 font-headline">
                Cresco<span className="text-cyan-400">-CN</span>
              </div>
              <div className="text-[11px] text-slate-400">Gamified Network Learning Platform</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-slate-400 font-medium">
            <a href="#hero" className="hover:text-white transition-colors">Home</a>
            <a href="#simulators" className="hover:text-white transition-colors">Simulators</a>
            <a href="#layers" className="hover:text-white transition-colors">OSI Layers</a>
            <a href="#syllabus" className="hover:text-white transition-colors">Syllabus</a>
            <button onClick={onNavigateToLogin} className="hover:text-white transition-colors cursor-pointer">Sign In</button>
          </div>

          <div className="text-center sm:text-right font-mono text-[11px] text-slate-400">
            <div>Department of Computer Science & Engineering</div>
            <div className="text-slate-400">© {new Date().getFullYear()} Cresco CN • KLU</div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingView;
