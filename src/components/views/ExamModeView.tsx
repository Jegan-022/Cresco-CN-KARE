import React, { useState, useEffect } from 'react';
import { NavTab } from '../../types';
import { soundFx } from '../../utils/soundEffects';
import { 
  GraduationCap, 
  Clock, 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Bookmark, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  RotateCcw,
  BarChart3,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { CrescoMascot } from '../brand/CrescoMascot';

interface ExamModeViewProps {
  onNavigate: (tab: NavTab) => void;
}

interface ExamConfig {
  id: string;
  title: string;
  unit: string;
  questionsCount: number;
  timeMinutes: number;
  marks: number;
  difficulty: 'Standard' | 'Advanced' | 'Comprehensive';
  description: string;
}

interface ExamQuestion {
  id: number;
  unit: 'Network' | 'Transport' | 'Application';
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const ExamModeView: React.FC<ExamModeViewProps> = ({ onNavigate }) => {
  const [viewState, setViewState] = useState<'hub' | 'exam' | 'results'>('hub');
  const [selectedExam, setSelectedExam] = useState<ExamConfig | null>(null);

  // Exam Test State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(60 * 60); // 60 mins default

  const examOptions: ExamConfig[] = [
    {
      id: 'unit-3-test',
      title: 'UNIT III TEST',
      unit: 'Network Layer',
      questionsCount: 20,
      timeMinutes: 25,
      marks: 20,
      difficulty: 'Standard',
      description: 'Routing algorithms, distance vector, link state, IP addressing, CIDR, and QoS.',
    },
    {
      id: 'unit-4-test',
      title: 'UNIT IV TEST',
      unit: 'Transport Layer',
      questionsCount: 20,
      timeMinutes: 25,
      marks: 20,
      difficulty: 'Standard',
      description: 'TCP 3-way handshake, sequence tracking, UDP datagrams, SSL/TLS, and flow control.',
    },
    {
      id: 'unit-5-test',
      title: 'UNIT V TEST',
      unit: 'Application Layer',
      questionsCount: 20,
      timeMinutes: 25,
      marks: 20,
      difficulty: 'Standard',
      description: 'DNS recursion, HTTP/HTTPS headers, electronic mail SMTP/IMAP, and web security.',
    },
    {
      id: 'full-mock',
      title: 'FULL SYLLABUS MOCK TEST',
      unit: 'Units III, IV & V',
      questionsCount: 50,
      timeMinutes: 60,
      marks: 50,
      difficulty: 'Comprehensive',
      description: 'Comprehensive timed university mock examination spanning all layer 3, 4, and 5 specifications.',
    },
  ];

  // High-yield exam question pool
  const mockQuestions: ExamQuestion[] = [
    {
      id: 1,
      unit: 'Transport',
      topic: 'TCP Handshake',
      question: 'During the TCP 3-way connection establishment, what control flags are set by the server in its initial response packet?',
      options: ['SYN=1, ACK=0', 'SYN=1, ACK=1', 'FIN=1, ACK=1', 'RST=1, ACK=0'],
      correctIndex: 1,
      explanation: 'The server responds with SYN=1 to synchronize its own sequence number and ACK=1 to acknowledge the client SYN.',
    },
    {
      id: 2,
      unit: 'Network',
      topic: 'CIDR Subnetting',
      question: 'A network administrator assigns the prefix 192.168.10.0/27. What is the maximum number of assignable host interfaces on this subnet?',
      options: ['28', '30', '32', '62'],
      correctIndex: 1,
      explanation: 'With /27, remaining host bits = 32 - 27 = 5. Total addresses = 2^5 = 32. Assignable hosts = 32 - 2 (network & broadcast) = 30.',
    },
    {
      id: 3,
      unit: 'Application',
      topic: 'DNS Hierarchy',
      question: 'Which DNS server type holds the direct authoritative mapping for records under a specific domain zone such as "cresco.edu"?',
      options: ['Root Name Server', 'TLD Server (.edu)', 'Authoritative Name Server', 'Recursive Resolver'],
      correctIndex: 2,
      explanation: 'Authoritative name servers store the official DNS records (A, AAAA, MX, CNAME) for the given zone.',
    },
    {
      id: 4,
      unit: 'Network',
      topic: 'Routing Protocols',
      question: 'In Link State Routing using Dijkstra algorithm, what information is flooded to all nodes across the autonomous system?',
      options: [
        'Complete routing tables of neighbors only',
        'Link State Advertisements (LSAs) detailing direct neighbor link costs',
        'Hop counts without metric information',
        'Only default gateway MAC addresses'
      ],
      correctIndex: 1,
      explanation: 'Link state protocols (like OSPF) flood LSAs so every router builds an identical topology map.',
    },
    {
      id: 5,
      unit: 'Transport',
      topic: 'UDP Characteristics',
      question: 'Which statement accurately describes UDP transmission behavior in real-time multimedia delivery?',
      options: [
        'UDP initiates a SYN handshake and guarantees zero packet loss',
        'UDP provides connectionless datagram streaming with minimal header overhead and no retransmissions',
        'UDP enforces congestion window backoff upon dropped packets',
        'UDP encrypts all application data by default at Layer 4'
      ],
      correctIndex: 1,
      explanation: 'UDP has an 8-byte fixed header, no handshake latency, and zero automatic retransmission overhead.',
    },
  ];

  // Timer during active exam
  useEffect(() => {
    let interval: any;
    if (viewState === 'exam' && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setViewState('results');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [viewState, secondsRemaining]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStartExam = (exam: ExamConfig) => {
    soundFx.playClick();
    setSelectedExam(exam);
    setSecondsRemaining(exam.timeMinutes * 60);
    setSelectedAnswers({});
    setMarkedForReview({});
    setCurrentQuestionIndex(0);
    setViewState('exam');
  };

  const handleSelectOption = (optIndex: number) => {
    soundFx.playClick();
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optIndex,
    }));
  };

  const handleToggleMark = () => {
    soundFx.playClick();
    setMarkedForReview((prev) => ({
      ...prev,
      [currentQuestionIndex]: !prev[currentQuestionIndex],
    }));
  };

  const handleSubmitExam = () => {
    if (window.confirm('Are you ready to submit your exam? Your results will be evaluated immediately.')) {
      soundFx.playLevelUp();
      setViewState('results');
    }
  };

  const currentQ = mockQuestions[currentQuestionIndex % mockQuestions.length];
  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQuestions = selectedExam?.questionsCount || 50;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-16">
      
      {/* ================= VIEW 1: EXAM HUB ================= */}
      {viewState === 'hub' && (
        <div className="space-y-8">
          
          {/* Header */}
          <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <CrescoMascot pose="exam-mode" size="lg" animation="float" />
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-black text-[#3157D5] dark:text-[#6D8CFF] uppercase tracking-widest">
                  <GraduationCap size={16} />
                  <span>FORMAL ASSESSMENT</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#172033] dark:text-[#F9FAFB] tracking-tight mt-1">
                  Exam Mode
                </h1>
                <p className="text-xs sm:text-sm font-medium text-[#64748B] dark:text-slate-400 mt-0.5">
                  "Test what you've learned. Timed conditions, negative marks, and topic diagnostic evaluations."
                </p>
              </div>
            </div>

            <div className="px-4 py-2 bg-[#F7F5F0] dark:bg-[#111827] rounded-2xl border border-[#E5E0D8] dark:border-slate-700 text-xs font-mono font-bold text-[#64748B]">
              Rigorous University Standards
            </div>
          </div>

          {/* Exam Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {examOptions.map((exam) => (
              <div
                key={exam.id}
                className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:border-[#3157D5] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-[#3157D5] dark:text-[#6D8CFF] bg-[#3157D5]/10 px-2 py-0.5 rounded-md">
                      {exam.unit}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                      exam.difficulty === 'Comprehensive'
                        ? 'bg-[#D95C5C]/15 text-[#D95C5C]'
                        : 'bg-[#F0A63A]/15 text-[#B45309] dark:text-[#F0A63A]'
                    }`}>
                      {exam.difficulty}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-[#172033] dark:text-[#F9FAFB]">
                    {exam.title}
                  </h3>
                  <p className="text-xs text-[#64748B] dark:text-slate-400 font-medium mt-1 leading-relaxed">
                    {exam.description}
                  </p>

                  {/* Exam Specs Table */}
                  <div className="mt-5 grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-800 text-center font-mono">
                    <div>
                      <span className="text-[9px] text-[#64748B] block">QUESTIONS</span>
                      <span className="text-sm font-black text-[#172033] dark:text-[#F9FAFB]">{exam.questionsCount}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#64748B] block">DURATION</span>
                      <span className="text-sm font-black text-[#172033] dark:text-[#F9FAFB]">{exam.timeMinutes}m</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#64748B] block">MARKS</span>
                      <span className="text-sm font-black text-[#35A86B]">{exam.marks}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#EFECE6] dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#64748B]">+1 Mark / -0.25 Neg</span>
                  <button
                    onClick={() => handleStartExam(exam)}
                    className="px-6 py-2.5 rounded-xl bg-[#3157D5] hover:bg-[#2442B0] text-white font-black text-xs tracking-wider shadow-2xs active:translate-y-0.5 transition-all cursor-pointer"
                  >
                    START EXAM →
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ================= VIEW 2: CLEAN EXAMINATION INTERFACE ================= */}
      {viewState === 'exam' && (
        <div className="space-y-6">
          
          {/* Serious Top Exam Bar */}
          <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-xl bg-[#3157D5]/10 text-[#3157D5] dark:text-[#6D8CFF] text-xs font-mono font-bold">
                {selectedExam?.title}
              </span>
              <span className="text-xs font-bold text-[#64748B] hidden sm:inline">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
            </div>

            {/* Timer & Submit */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-700 font-mono text-sm font-black text-[#D95C5C]">
                <Clock size={16} />
                <span>{formatTimer(secondsRemaining)}</span>
              </div>

              <button
                onClick={handleSubmitExam}
                className="px-5 py-2 rounded-xl bg-[#D95C5C] hover:bg-[#B91C1C] text-white text-xs font-black tracking-wider transition-all cursor-pointer shadow-2xs"
              >
                SUBMIT EXAM
              </button>
            </div>
          </div>

          {/* Core Exam Workspace: Left Palette + Center Question + Right Telemetry */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Left: Question Navigation Grid */}
            <div className="lg:col-span-1 bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#EFECE6] dark:border-slate-800">
                <span className="text-xs font-mono font-black uppercase text-[#172033] dark:text-[#F9FAFB]">Palette</span>
                <span className="text-xs font-bold text-[#35A86B] font-mono">{answeredCount} / {totalQuestions} Done</span>
              </div>

              <div className="grid grid-cols-5 gap-1.5 max-h-72 overflow-y-auto pr-1">
                {Array.from({ length: totalQuestions }).map((_, idx) => {
                  const isAnswered = selectedAnswers[idx] !== undefined;
                  const isMarked = markedForReview[idx];
                  const isCurrent = idx === currentQuestionIndex;

                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-8 rounded-lg text-xs font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${
                        isCurrent
                          ? 'ring-2 ring-[#3157D5] font-black'
                          : ''
                      } ${
                        isMarked
                          ? 'bg-[#F0A63A] text-white'
                          : isAnswered
                          ? 'bg-[#35A86B] text-white'
                          : 'bg-[#F7F5F0] dark:bg-slate-800 text-[#64748B] hover:bg-slate-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-[#EFECE6] dark:border-slate-800 space-y-1 text-[10px] font-bold text-[#64748B]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#35A86B]" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F0A63A]" />
                  <span>Marked for Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E5E0D8] dark:bg-slate-700" />
                  <span>Unanswered</span>
                </div>
              </div>
            </div>

            {/* Center: Question & Tactile Options */}
            <div className="lg:col-span-3 bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-[#64748B]">
                  <span>Topic: {currentQ.topic}</span>
                  <span className="text-[#3157D5] dark:text-[#6D8CFF] font-black">+1.0 / -0.25 Mark</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-[#172033] dark:text-[#F9FAFB] leading-relaxed">
                  {currentQuestionIndex + 1}. {currentQ.question}
                </h2>

                {/* Options List */}
                <div className="space-y-3 pt-2">
                  {currentQ.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;
                    const letters = ['A', 'B', 'C', 'D'];

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(optIdx)}
                        className={`w-full p-4 rounded-2xl border-2 text-left text-sm font-semibold transition-all cursor-pointer flex items-center gap-4 ${
                          isSelected
                            ? 'bg-[#3157D5]/10 border-[#3157D5] text-[#172033] dark:text-[#F9FAFB] shadow-2xs'
                            : 'bg-white dark:bg-[#1F2937] border-[#E5E0D8] dark:border-slate-800 hover:border-slate-400'
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-black text-xs shrink-0 ${
                          isSelected ? 'bg-[#3157D5] text-white' : 'bg-[#F7F5F0] dark:bg-slate-800 text-[#64748B]'
                        }`}>
                          {letters[optIdx]}
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Action Bar: Previous, Mark for Review, Next */}
              <div className="pt-6 border-t border-[#EFECE6] dark:border-slate-800 flex items-center justify-between gap-3">
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2.5 rounded-xl border border-[#E5E0D8] text-xs font-bold text-[#64748B] hover:bg-[#F7F5F0] disabled:opacity-40 cursor-pointer"
                >
                  ← Previous
                </button>

                <button
                  onClick={handleToggleMark}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    markedForReview[currentQuestionIndex]
                      ? 'bg-[#F0A63A] text-white'
                      : 'bg-[#F7F5F0] dark:bg-slate-800 text-[#B45309] dark:text-[#F0A63A] border border-[#F0A63A]/30'
                  }`}
                >
                  <Bookmark size={14} />
                  <span>{markedForReview[currentQuestionIndex] ? 'Marked' : 'Mark for Review'}</span>
                </button>

                <button
                  onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                  className="px-6 py-2.5 rounded-xl bg-[#3157D5] hover:bg-[#2442B0] text-white text-xs font-black tracking-wider cursor-pointer shadow-2xs"
                >
                  Next →
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ================= VIEW 3: EXAM RESULTS (SECTION 29) ================= */}
      {viewState === 'results' && (
        <div className="space-y-8 animate-scaleUp">
          
          <div className="bg-white dark:bg-[#1F2937] border-2 border-[#35A86B] rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EFECE6] dark:border-slate-800">
              <div>
                <span className="text-xs font-mono font-black text-[#35A86B] uppercase tracking-widest">
                  ASSESSMENT COMPLETE
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-[#172033] dark:text-[#F9FAFB] tracking-tight mt-1">
                  NETWORK ANALYSIS COMPLETE
                </h1>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] font-mono text-[#64748B] block">FINAL SCORE</span>
                  <span className="text-3xl font-black text-[#3157D5] dark:text-[#6D8CFF] font-mono">
                    42 / 50 <span className="text-base text-[#35A86B]">(84%)</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Score Metrics Strip */}
            <div className="grid grid-cols-3 gap-4 font-mono text-center">
              <div className="p-4 rounded-2xl bg-[#35A86B]/10 border border-[#35A86B]/30">
                <span className="text-[10px] text-[#35A86B] font-bold block">CORRECT</span>
                <span className="text-2xl font-black text-[#35A86B]">42</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#D95C5C]/10 border border-[#D95C5C]/30">
                <span className="text-[10px] text-[#D95C5C] font-bold block">WRONG</span>
                <span className="text-2xl font-black text-[#D95C5C]">8</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-800">
                <span className="text-[10px] text-[#64748B] font-bold block">TIME SPENT</span>
                <span className="text-2xl font-black text-[#172033] dark:text-white">43:21</span>
              </div>
            </div>

            {/* TOPIC PERFORMANCE SECTION */}
            <div className="space-y-3 pt-4">
              <h3 className="text-sm font-mono font-black text-[#172033] dark:text-[#F9FAFB] uppercase tracking-wider">
                TOPIC PERFORMANCE
              </h3>

              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Network Layer (Layer 3)</span>
                    <span className="font-mono text-[#3157D5]">88%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#F7F5F0] dark:bg-slate-800 rounded-full overflow-hidden border border-[#E5E0D8] dark:border-slate-700">
                    <div className="h-full bg-[#3157D5] rounded-full" style={{ width: '88%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Transport Layer (Layer 4)</span>
                    <span className="font-mono text-[#35A86B]">92%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#F7F5F0] dark:bg-slate-800 rounded-full overflow-hidden border border-[#E5E0D8] dark:border-slate-700">
                    <div className="h-full bg-[#35A86B] rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Application Layer (Layer 5)</span>
                    <span className="font-mono text-[#F0A63A]">74%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#F7F5F0] dark:bg-slate-800 rounded-full overflow-hidden border border-[#E5E0D8] dark:border-slate-700">
                    <div className="h-full bg-[#F0A63A] rounded-full" style={{ width: '74%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendation Box */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle size={20} className="text-[#F0A63A] shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-[#172033] dark:text-[#F9FAFB]">
                  Recommendation: "Review Web Security and DNS."
                </span>
              </div>

              <button
                onClick={() => onNavigate('review')}
                className="px-4 py-2 rounded-xl bg-[#F0A63A] hover:bg-[#D97706] text-white font-black text-xs tracking-wider shrink-0 cursor-pointer shadow-2xs"
              >
                START RECOMMENDED REVIEW →
              </button>
            </div>

            {/* Back to Hub */}
            <div className="pt-2 text-center">
              <button
                onClick={() => setViewState('hub')}
                className="text-xs font-bold text-[#3157D5] dark:text-[#6D8CFF] hover:underline cursor-pointer"
              >
                ← Return to Exam Mode Hub
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
