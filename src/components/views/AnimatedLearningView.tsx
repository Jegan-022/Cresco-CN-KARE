import React, { useState } from 'react';
import { NavTab } from '../../types';
import { 
  PlayCircle, 
  Zap, 
  Network,
  Radio,
  Layers,
  ArrowRight,
  Lock,
  Star,
  Clock,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Activity,
  Wifi,
  Shield,
  Box
} from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';
import { useAuth } from '../../context/AuthContext';

interface AnimatedLearningViewProps {
  onNavigate?: (tab: NavTab) => void;
  onSelectLesson?: (lessonId: string, sectionId: number) => void;
}

interface AnimationTopic {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  color: string;
  gradient: string;
  border: string;
  duration: string;
  xp: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  locked?: boolean;
  lessonId?: string;
  sectionId?: number;
  frames: { label: string; icon: string; description: string }[];
}

const ANIMATION_TOPICS: AnimationTopic[] = [
  {
    id: 'osi-model',
    title: 'OSI Model Deep Dive',
    subtitle: '7 Layers Animated',
    description: 'Watch each layer come alive — from physical bits to application data, visualised frame-by-frame.',
    icon: Layers,
    color: 'text-violet-600 dark:text-violet-400',
    gradient: 'from-violet-500/10 via-purple-500/8 to-violet-500/5',
    border: 'border-violet-500/30 hover:border-violet-500/60',
    duration: '8 min',
    xp: 50,
    difficulty: 'Beginner',
    tags: ['OSI', 'Layers', 'Foundation'],
    lessonId: 'u3_m01',
    sectionId: 3,
    frames: [
      { label: 'Physical', icon: '⚡', description: 'Bits travel as electrical/optical signals' },
      { label: 'Data Link', icon: '🔗', description: 'Frames with MAC addressing' },
      { label: 'Network', icon: '🌐', description: 'IP routing across networks' },
      { label: 'Transport', icon: '🚚', description: 'TCP/UDP reliable delivery' },
      { label: 'Session', icon: '🤝', description: 'Connection management' },
      { label: 'Presentation', icon: '🎨', description: 'Data encoding & encryption' },
      { label: 'Application', icon: '💻', description: 'HTTP, FTP, SMTP' },
    ],
  },
  {
    id: 'tcp-handshake',
    title: 'TCP 3-Way Handshake',
    subtitle: 'Connection Lifecycle',
    description: 'See SYN, SYN-ACK, ACK animated in real time. Understand how reliable connections are born.',
    icon: Network,
    color: 'text-cyan-600 dark:text-cyan-400',
    gradient: 'from-cyan-500/10 via-sky-500/8 to-cyan-500/5',
    border: 'border-cyan-500/30 hover:border-cyan-500/60',
    duration: '6 min',
    xp: 60,
    difficulty: 'Intermediate',
    tags: ['TCP', 'Handshake', 'Transport'],
    lessonId: 'u3_m04',
    sectionId: 3,
    frames: [
      { label: 'SYN', icon: '📡', description: 'Client sends synchronise request' },
      { label: 'SYN-ACK', icon: '📶', description: 'Server acknowledges and responds' },
      { label: 'ACK', icon: '✅', description: 'Connection established!' },
    ],
  },
  {
    id: 'packet-routing',
    title: 'Packet Routing Journey',
    subtitle: 'Hop-by-Hop Animation',
    description: 'Follow a packet from source to destination, watching routers make forwarding decisions at each hop.',
    icon: Radio,
    color: 'text-emerald-600 dark:text-emerald-400',
    gradient: 'from-emerald-500/10 via-teal-500/8 to-emerald-500/5',
    border: 'border-emerald-500/30 hover:border-emerald-500/60',
    duration: '7 min',
    xp: 70,
    difficulty: 'Intermediate',
    tags: ['Routing', 'IP', 'Forwarding'],
    lessonId: 'u3_m06',
    sectionId: 3,
    frames: [
      { label: 'Source', icon: '🖥️', description: 'Application generates data' },
      { label: 'Encapsulation', icon: '📦', description: 'Packet headers added' },
      { label: 'Router Hop 1', icon: '🔀', description: 'Routing table lookup' },
      { label: 'Router Hop 2', icon: '🔀', description: 'Next-hop forwarding' },
      { label: 'Destination', icon: '🎯', description: 'Packet delivered!' },
    ],
  },
  {
    id: 'dns-resolution',
    title: 'DNS Resolution Flow',
    subtitle: 'Name → IP Address',
    description: 'Trace how a domain name resolves through recursive and authoritative DNS servers step-by-step.',
    icon: Wifi,
    color: 'text-orange-600 dark:text-orange-400',
    gradient: 'from-orange-500/10 via-amber-500/8 to-orange-500/5',
    border: 'border-orange-500/30 hover:border-orange-500/60',
    duration: '5 min',
    xp: 55,
    difficulty: 'Beginner',
    tags: ['DNS', 'Application', 'Resolution'],
    lessonId: 'u4_m01',
    sectionId: 4,
    frames: [
      { label: 'Query', icon: '❓', description: 'Browser asks: What is google.com?' },
      { label: 'Resolver', icon: '🔍', description: 'Recursive resolver checks cache' },
      { label: 'Root DNS', icon: '🌍', description: 'Directs to .com TLD servers' },
      { label: 'TLD DNS', icon: '🌐', description: 'Directs to google.com nameserver' },
      { label: 'Answer', icon: '✅', description: '142.250.80.46 returned!' },
    ],
  },
  {
    id: 'error-detection',
    title: 'Error Detection & Correction',
    subtitle: 'CRC, Checksum, Hamming',
    description: 'Visualise how CRC checksums catch bit errors and Hamming codes correct them automatically.',
    icon: Shield,
    color: 'text-rose-600 dark:text-rose-400',
    gradient: 'from-rose-500/10 via-red-500/8 to-rose-500/5',
    border: 'border-rose-500/30 hover:border-rose-500/60',
    duration: '9 min',
    xp: 80,
    difficulty: 'Advanced',
    tags: ['CRC', 'Hamming', 'Error Control'],
    locked: true,
    frames: [
      { label: 'Data', icon: '💾', description: 'Original data bits' },
      { label: 'CRC Calc', icon: '🔢', description: 'Generator polynomial division' },
      { label: 'Transmission', icon: '📡', description: 'Data + CRC sent' },
      { label: 'Check', icon: '✔️', description: 'Receiver verifies CRC' },
    ],
  },
  {
    id: 'sliding-window',
    title: 'Sliding Window Protocol',
    subtitle: 'Flow & Congestion Control',
    description: 'Animate sender/receiver window movement to understand throughput optimization in TCP.',
    icon: Activity,
    color: 'text-indigo-600 dark:text-indigo-400',
    gradient: 'from-indigo-500/10 via-blue-500/8 to-indigo-500/5',
    border: 'border-indigo-500/30 hover:border-indigo-500/60',
    duration: '10 min',
    xp: 90,
    difficulty: 'Advanced',
    tags: ['TCP', 'Flow Control', 'Window'],
    locked: true,
    frames: [
      { label: 'Send Window', icon: '📤', description: 'Frames awaiting ACK' },
      { label: 'In Transit', icon: '✈️', description: 'Frames on the wire' },
      { label: 'ACK', icon: '✅', description: 'Window slides forward' },
    ],
  },
  {
    id: 'subnetting',
    title: 'Subnetting Visualized',
    subtitle: 'CIDR & Address Blocks',
    description: 'Break IP address space into subnets visually. Understand network masks, broadcast, and host ranges.',
    icon: Box,
    color: 'text-teal-600 dark:text-teal-400',
    gradient: 'from-teal-500/10 via-cyan-500/8 to-teal-500/5',
    border: 'border-teal-500/30 hover:border-teal-500/60',
    duration: '8 min',
    xp: 75,
    difficulty: 'Intermediate',
    tags: ['IP', 'Subnetting', 'CIDR'],
    locked: true,
    frames: [
      { label: 'IP Address', icon: '📌', description: '192.168.1.0/24 breakdown' },
      { label: 'Network Bits', icon: '🔵', description: 'First 24 bits fixed' },
      { label: 'Host Bits', icon: '🟢', description: 'Last 8 bits variable' },
      { label: 'Ranges', icon: '📊', description: '254 usable host addresses' },
    ],
  },
  {
    id: 'congestion-control',
    title: 'TCP Congestion Control',
    subtitle: 'Slow Start → AIMD',
    description: 'Watch the congestion window grow and collapse in real time through slow-start and AIMD phases.',
    icon: TrendingUp,
    color: 'text-amber-600 dark:text-amber-400',
    gradient: 'from-amber-500/10 via-yellow-500/8 to-amber-500/5',
    border: 'border-amber-500/30 hover:border-amber-500/60',
    duration: '11 min',
    xp: 100,
    difficulty: 'Advanced',
    tags: ['TCP', 'Congestion', 'AIMD'],
    locked: true,
    frames: [
      { label: 'Slow Start', icon: '🐢', description: 'cwnd grows exponentially' },
      { label: 'Threshold', icon: '📈', description: 'ssthresh reached' },
      { label: 'AIMD', icon: '📊', description: 'Linear increase' },
      { label: 'Loss', icon: '💥', description: 'cwnd halved on loss' },
    ],
  },
];

const DIFFICULTY_COLORS = {
  Beginner: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  Intermediate: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  Advanced: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
};

interface FramePlayerProps {
  frames: AnimationTopic['frames'];
  color: string;
}

const FramePlayer: React.FC<FramePlayerProps> = ({ frames, color }) => {
  const [activeFrame, setActiveFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  React.useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveFrame((prev) => {
        if (prev >= frames.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [isPlaying, frames.length]);

  const handlePlay = () => {
    if (activeFrame >= frames.length - 1) setActiveFrame(0);
    setIsPlaying(true);
  };

  return (
    <div className="mt-4 p-3 rounded-2xl bg-white/60 dark:bg-black/20 border border-white/50 dark:border-white/10 space-y-3">
      {/* Playback controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handlePlay}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors cursor-pointer active:scale-95"
        >
          <PlayCircle size={13} />
          {isPlaying ? 'Playing...' : 'Play Animation'}
        </button>
        <div className="flex gap-1 flex-1">
          {frames.map((_, idx) => (
            <button
              key={idx}
              onClick={() => { setIsPlaying(false); setActiveFrame(idx); }}
              className={`flex-1 h-1.5 rounded-full transition-all cursor-pointer ${
                idx <= activeFrame ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>
      {/* Active frame display */}
      <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 min-h-[56px] transition-all duration-300">
        <span className="text-2xl leading-none mt-0.5 shrink-0">{frames[activeFrame].icon}</span>
        <div>
          <span className="text-xs font-black text-slate-800 dark:text-white block">{frames[activeFrame].label}</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{frames[activeFrame].description}</span>
        </div>
        <span className="ml-auto text-[10px] font-mono text-slate-400 shrink-0">{activeFrame + 1}/{frames.length}</span>
      </div>
      {/* Step dots */}
      <div className="flex justify-center gap-1.5">
        {frames.map((f, idx) => (
          <button
            key={idx}
            onClick={() => { setIsPlaying(false); setActiveFrame(idx); }}
            title={f.label}
            className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
              idx === activeFrame ? 'bg-emerald-500 scale-125' : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export const AnimatedLearningView: React.FC<AnimatedLearningViewProps> = ({
  onNavigate,
  onSelectLesson,
}) => {
  const { userProfile } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');

  const xp = userProfile?.totalXP ?? userProfile?.xp ?? 0;
  const unlockedCount = ANIMATION_TOPICS.filter((t) => !t.locked).length;

  const filteredTopics = filterDifficulty === 'All'
    ? ANIMATION_TOPICS
    : ANIMATION_TOPICS.filter((t) => t.difficulty === filterDifficulty);

  const handleTopicClick = (topic: AnimationTopic) => {
    if (topic.locked) return;
    try { soundFx.playClick(); } catch {}
    setExpandedId((prev) => prev === topic.id ? null : topic.id);
  };

  const handleGoToLesson = (topic: AnimationTopic) => {
    if (topic.locked) return;
    try { soundFx.playClick(); } catch {}
    if (onSelectLesson && topic.lessonId && topic.sectionId !== undefined) {
      onSelectLesson(topic.lessonId, topic.sectionId);
    } else if (onNavigate) {
      onNavigate('learn-map');
    }
  };

  return (
    <div className="min-h-screen w-full py-4 sm:py-6">
      {/* Hero Header */}
      <div className="relative mb-8 p-6 sm:p-8 rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-500/10 via-cyan-500/8 to-violet-500/10 border border-emerald-500/20 dark:border-emerald-500/15 shadow-lg">
        {/* Background glow orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-400/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />
        
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-black font-mono uppercase tracking-wider">
              <Sparkles size={12} className="animate-pulse" />
              INTERACTIVE LABS
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-600 dark:text-violet-400 text-xs font-bold font-mono uppercase">
              NEW
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-2">
            Animated <span className="text-emerald-500">Learning</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
            Watch Computer Networks concepts come alive through step-by-step interactive animations. 
            See protocols, algorithms, and architectures visualized in real time.
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-3 mt-5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/60 dark:bg-white/10 border border-white/50 dark:border-white/15 text-xs font-bold text-slate-700 dark:text-slate-300">
              <PlayCircle size={13} className="text-emerald-500" />
              {unlockedCount} Topics Unlocked
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/60 dark:bg-white/10 border border-white/50 dark:border-white/15 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Zap size={13} className="text-amber-500" />
              {ANIMATION_TOPICS.reduce((a, t) => a + t.xp, 0)} Total XP
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/60 dark:bg-white/10 border border-white/50 dark:border-white/15 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Clock size={13} className="text-cyan-500" />
              {ANIMATION_TOPICS.length} Animations
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">Filter:</span>
        {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map((f) => (
          <button
            key={f}
            onClick={() => { setFilterDifficulty(f); try { soundFx.playClick(); } catch {} }}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
              filterDifficulty === f
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                : 'bg-white/70 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500/50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Topic Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTopics.map((topic) => {
          const Icon = topic.icon;
          const isExpanded = expandedId === topic.id;
          const isLocked = topic.locked;

          return (
            <div
              key={topic.id}
              className={`group relative rounded-3xl border transition-all duration-300 overflow-hidden bg-gradient-to-br ${topic.gradient} ${
                isLocked
                  ? 'opacity-60 cursor-not-allowed border-slate-200/60 dark:border-slate-700/40'
                  : `cursor-pointer ${topic.border}`
              } ${isExpanded ? 'md:col-span-2 ring-2 ring-emerald-500/20' : ''}`}
              onClick={() => handleTopicClick(topic)}
            >
              {/* Card Content */}
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Icon + Info */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/70 dark:bg-black/20 border border-white/60 dark:border-white/10 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                      {isLocked ? (
                        <Lock size={20} className="text-slate-400 dark:text-slate-500" />
                      ) : (
                        <Icon size={22} className={topic.color} strokeWidth={2} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${DIFFICULTY_COLORS[topic.difficulty]}`}>
                          {topic.difficulty.toUpperCase()}
                        </span>
                        {topic.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-white/50 dark:bg-white/10 text-slate-500 dark:text-slate-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                        {topic.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{topic.subtitle}</p>
                    </div>
                  </div>

                  {/* Right: Meta */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-black">
                      <Zap size={11} className="fill-amber-500" />
                      +{topic.xp}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                      <Clock size={10} />
                      {topic.duration}
                    </div>
                    {!isLocked && (
                      <ChevronRight
                        size={16}
                        className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}
                      />
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                  {topic.description}
                </p>

                {/* Frame count badge */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex gap-1">
                    {topic.frames.slice(0, 5).map((_, idx) => (
                      <div
                        key={idx}
                        className="w-5 h-1.5 rounded-full bg-white/60 dark:bg-white/15 border border-white/30 dark:border-white/10"
                      />
                    ))}
                    {topic.frames.length > 5 && (
                      <span className="text-[9px] text-slate-400 font-mono ml-1">+{topic.frames.length - 5}</span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{topic.frames.length} animation frames</span>
                </div>

                {/* Locked overlay message */}
                {isLocked && (
                  <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <Lock size={12} />
                    <span>Complete earlier topics to unlock</span>
                  </div>
                )}

                {/* Expanded: Inline Frame Player */}
                {isExpanded && !isLocked && (
                  <div className="mt-4 border-t border-white/30 dark:border-white/10 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <PlayCircle size={15} className="text-emerald-500" />
                      <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wide">Interactive Preview</span>
                    </div>
                    <FramePlayer frames={topic.frames} color={topic.color} />

                    {/* CTA Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGoToLesson(topic);
                      }}
                      className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black tracking-wide shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <Star size={13} />
                      Go to Full Lesson (+{topic.xp} XP)
                      <ArrowRight size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Coming Soon Footer */}
      <div className="mt-8 p-5 rounded-3xl bg-gradient-to-r from-slate-100/80 to-slate-50/80 dark:from-slate-800/60 dark:to-slate-900/60 border border-slate-200/60 dark:border-slate-700/40 text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Sparkles size={16} className="text-emerald-500 animate-pulse" />
          <span className="text-sm font-black text-slate-700 dark:text-slate-200">More animations arriving soon</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          BGP routing, OSPF convergence, TLS handshake, HTTP/2 multiplexing & more in the next update.
        </p>
      </div>
    </div>
  );
};

export default AnimatedLearningView;
