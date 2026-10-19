import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Layers,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Award,
  Download,
  Share2,
  Calculator,
  RefreshCw,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Send,
  Zap,
  Cpu,
  Eye,
  Target,
  Sparkles,
  Users,
  FileText
} from 'lucide-react';
import { auth } from '../../lib/firebase';
import {
  UDL_SUBNET_PROBLEM_A,
  UDL_SUBNET_PROBLEM_B,
  UDL_TCP_VS_UDP_SCENARIOS,
  UDL_TCP_TROUBLESHOOTING_SCENARIOS,
  UDL_EDUCATIONAL_PACKET_TRACE,
  UDL_TCP_STATES
} from '../../data/udlCurriculum';
import {
  validateSubnetEntry,
  validateTcpHeaderPuzzle,
  validateTcpCloseSequence,
  persistUdlSubmission,
  fetchStudentUdlSubmissions,
  UdlSubmissionRecord
} from '../../services/udlService';

export const UdlLearningView: React.FC = () => {
  // Navigation tabs
  const [activeModule, setActiveModule] = useState<'module_a' | 'module_b'>('module_a');
  const [moduleATab, setModuleATab] = useState<'representation' | 'engagement' | 'expression'>('representation');
  const [moduleBTab, setModuleBTab] = useState<'handshake' | 'loss' | 'window' | 'congestion' | 'compare' | 'states' | 'header' | 'wireshark' | 'troubleshoot'>('handshake');

  // Submissions state
  const [submissions, setSubmissions] = useState<UdlSubmissionRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  // Load past submissions
  useEffect(() => {
    const uid = auth.currentUser?.uid || 'guest_student';
    fetchStudentUdlSubmissions(uid).then(records => setSubmissions(records));
  }, []);

  // ==========================================
  // MODULE A: IPv4 SUBNETTING STATE
  // ==========================================
  // Problem A entries (4 subnets)
  const [subAInputs, setSubAInputs] = useState<Record<number, { networkId: string; firstUsableHost: string; lastUsableHost: string; broadcastAddress: string }>>({
    1: { networkId: '', firstUsableHost: '', lastUsableHost: '', broadcastAddress: '' },
    2: { networkId: '', firstUsableHost: '', lastUsableHost: '', broadcastAddress: '' },
    3: { networkId: '', firstUsableHost: '', lastUsableHost: '', broadcastAddress: '' },
    4: { networkId: '', firstUsableHost: '', lastUsableHost: '', broadcastAddress: '' }
  });
  const [subAValidation, setSubAValidation] = useState<Record<number, { isCorrect: boolean; message: string; fieldMatches?: Record<string, boolean> }>>({});
  const [subAHintTier, setSubAHintTier] = useState<number>(0);
  const [groupRole, setGroupRole] = useState<'individual' | 'architect' | 'allocator' | 'verifier'>('individual');

  // Subnet Calculator Tool State
  const [calcIp, setCalcIp] = useState('192.168.10.0');
  const [calcCidr, setCalcCidr] = useState(26);

  // Expression: Written explanation
  const [writtenExplanation, setWrittenExplanation] = useState('');
  const [writtenSubmitting, setWrittenSubmitting] = useState(false);

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Problem B entries (172.16.0.0/20 into 8 subnets)
  const [subBInputs, setSubBInputs] = useState<Record<number, { networkId: string; firstUsableHost: string; lastUsableHost: string; broadcastAddress: string }>>({
    1: { networkId: '', firstUsableHost: '', lastUsableHost: '', broadcastAddress: '' },
    2: { networkId: '', firstUsableHost: '', lastUsableHost: '', broadcastAddress: '' },
    3: { networkId: '', firstUsableHost: '', lastUsableHost: '', broadcastAddress: '' },
    4: { networkId: '', firstUsableHost: '', lastUsableHost: '', broadcastAddress: '' },
    5: { networkId: '', firstUsableHost: '', lastUsableHost: '', broadcastAddress: '' },
    6: { networkId: '', firstUsableHost: '', lastUsableHost: '', broadcastAddress: '' },
    7: { networkId: '', firstUsableHost: '', lastUsableHost: '', broadcastAddress: '' },
    8: { networkId: '', firstUsableHost: '', lastUsableHost: '', broadcastAddress: '' }
  });
  const [subBValidation, setSubBValidation] = useState<Record<number, { isCorrect: boolean; message: string }>>({});

  // ==========================================
  // MODULE B: TCP & UDP STATE
  // ==========================================
  // Handshake Step
  const [handshakeStep, setHandshakeStep] = useState<number>(0); // 0=idle, 1=SYN, 2=SYN-ACK, 3=ACK (ESTABLISHED)
  const [rolePlayMode, setRolePlayMode] = useState<'client' | 'server'>('client');
  const [rolePlayFeedback, setRolePlayFeedback] = useState<string | null>(null);

  // Packet Loss Sim
  const [lossSimStep, setLossSimStep] = useState<number>(0);
  const [lossPrediction, setLossPrediction] = useState<string>('');
  const [lossPredictionFeedback, setLossPredictionFeedback] = useState<string | null>(null);

  // Sliding Window
  const [windowSize, setWindowSize] = useState<number>(4);
  const [windowOffset, setWindowOffset] = useState<number>(0);

  // Congestion Control Sim
  const [cwnd, setCwnd] = useState<number>(1);
  const [ssthresh, setSsthresh] = useState<number>(16);
  const [ccPhase, setCcPhase] = useState<'slow_start' | 'avoidance' | 'recovery'>('slow_start');
  const [ccHistory, setCcHistory] = useState<{ round: number; cwnd: number; phase: string }[]>([
    { round: 1, cwnd: 1, phase: 'Slow Start' }
  ]);

  // TCP vs UDP Classifier
  const [scenarioAnswers, setScenarioAnswers] = useState<Record<string, 'TCP' | 'UDP'>>({});
  const [scenarioFeedback, setScenarioFeedback] = useState<Record<string, boolean>>({});

  // State Machine Sequence
  const [stateSequence, setStateSequence] = useState<string[]>(['ESTABLISHED']);
  const [stateSeqFeedback, setStateSeqFeedback] = useState<{ isCorrect: boolean; feedback: string } | null>(null);

  // Header Puzzle
  const [headerPlacements, setHeaderPlacements] = useState<Record<string, string>>({});
  const [headerScore, setHeaderScore] = useState<{ correctCount: number; total: number; scorePercentage: number } | null>(null);

  // Wireshark guided questions
  const [wiresharkAnswers, setWiresharkAnswers] = useState<Record<number, string>>({});
  const [wiresharkSubmitted, setWiresharkSubmitted] = useState<boolean>(false);

  // Troubleshooting Scenarios
  const [selectedTsId, setSelectedTsId] = useState<string>('ts_conn_fail');
  const [tsDiagnosis, setTsDiagnosis] = useState<{ rootCause: string; mechanism: string; solution: string }>({
    rootCause: '',
    mechanism: '',
    solution: ''
  });

  // Reference Sheet Modal
  const [showCheatSheet, setShowCheatSheet] = useState<boolean>(false);

  // ------------------------------------------
  // HANDLERS: Subnetting
  // ------------------------------------------
  const handleValidateSubnetA = (subnetIdx: number) => {
    const entry = subAInputs[subnetIdx];
    const res = validateSubnetEntry(UDL_SUBNET_PROBLEM_A.id, subnetIdx, entry);
    setSubAValidation(prev => ({ ...prev, [subnetIdx]: res }));
  };

  const handleValidateAllSubnetA = async () => {
    let allCorrect = true;
    const newValidations: Record<number, any> = {};
    for (let i = 1; i <= 4; i++) {
      const res = validateSubnetEntry(UDL_SUBNET_PROBLEM_A.id, i, subAInputs[i]);
      newValidations[i] = res;
      if (!res.isCorrect) allCorrect = false;
    }
    setSubAValidation(newValidations);

    if (allCorrect) {
      setIsSubmitting(true);
      const student = auth.currentUser;
      const rec = await persistUdlSubmission({
        activityId: 'udl_sub_192_168_10',
        moduleId: 'module_a_ipv4',
        modality: 'calculation',
        studentId: student?.uid || 'guest_student',
        studentName: student?.displayName || 'Student Learner',
        studentRegNo: student?.email?.split('@')[0].toUpperCase() || 'REG-UDL',
        studentEmail: student?.email || 'student@cresco.edu',
        answers: { subnets: subAInputs, groupRole },
        autoScore: 100,
        maxScore: 100,
        isEvaluated: true,
        facultyFeedback: 'Excellent! All 4 subnets verified mathematically with correct network IDs, broadcast addresses, and host ranges.'
      });
      setSubmissions(prev => [rec, ...prev]);
      setIsSubmitting(false);
      setSubmissionSuccess('Subnet Challenge A completed! Score (100/100) persisted to Firestore.');
      setTimeout(() => setSubmissionSuccess(null), 5000);
    }
  };

  const handleValidateAllSubnetB = async () => {
    let allCorrect = true;
    const newValidations: Record<number, any> = {};
    for (let i = 1; i <= 8; i++) {
      const res = validateSubnetEntry(UDL_SUBNET_PROBLEM_B.id, i, subBInputs[i]);
      newValidations[i] = res;
      if (!res.isCorrect) allCorrect = false;
    }
    setSubBValidation(newValidations);

    if (allCorrect) {
      setIsSubmitting(true);
      const student = auth.currentUser;
      const rec = await persistUdlSubmission({
        activityId: 'udl_sub_172_16_0',
        moduleId: 'module_a_ipv4',
        modality: 'calculation',
        studentId: student?.uid || 'guest_student',
        studentName: student?.displayName || 'Student Learner',
        studentRegNo: student?.email?.split('@')[0].toUpperCase() || 'REG-UDL',
        studentEmail: student?.email || 'student@cresco.edu',
        answers: { subnets: subBInputs },
        autoScore: 100,
        maxScore: 100,
        isEvaluated: true,
        facultyFeedback: 'Superb! 8 subnets on 172.16.0.0/20 (/23) correctly mapped across 3rd octet increments.'
      });
      setSubmissions(prev => [rec, ...prev]);
      setIsSubmitting(false);
      setSubmissionSuccess('Challenge B completed! 100/100 saved to Firestore.');
      setTimeout(() => setSubmissionSuccess(null), 5000);
    }
  };

  const handleWrittenSubmit = async () => {
    if (!writtenExplanation.trim()) return;
    setWrittenSubmitting(true);
    const student = auth.currentUser;
    const rec = await persistUdlSubmission({
      activityId: 'udl_sub_written_expl',
      moduleId: 'module_a_ipv4',
      modality: 'written_explanation',
      studentId: student?.uid || 'guest_student',
      studentName: student?.displayName || 'Student Learner',
      studentRegNo: student?.email?.split('@')[0].toUpperCase() || 'REG-UDL',
      studentEmail: student?.email || 'student@cresco.edu',
      answers: { explanation: writtenExplanation },
      autoScore: 0,
      maxScore: 25,
      isEvaluated: false,
      facultyFeedback: 'Pending faculty rubric evaluation (Representation, Engagement, Expression).'
    });
    setSubmissions(prev => [rec, ...prev]);
    setWrittenSubmitting(false);
    setSubmissionSuccess('Written explanation submitted for Faculty Rubric grading.');
    setTimeout(() => setSubmissionSuccess(null), 5000);
  };

  // Subnet Calculator Math Helper
  const calculateCidrInfo = (ipStr: string, prefix: number) => {
    try {
      const parts = ipStr.split('.').map(Number);
      if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
        return null;
      }
      const ipNum = (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
      const maskNum = prefix === 0 ? 0 : (~0 << (32 - prefix));
      const netNum = ipNum & maskNum;
      const bcastNum = netNum | ~maskNum;

      const numToIp = (n: number) => [
        (n >>> 24) & 255,
        (n >>> 16) & 255,
        (n >>> 8) & 255,
        n & 255
      ].join('.');

      const totalHosts = prefix >= 31 ? (prefix === 31 ? 2 : 1) : Math.pow(2, 32 - prefix);
      const usableHosts = prefix >= 31 ? 0 : Math.max(0, totalHosts - 2);

      return {
        subnetMask: numToIp(maskNum),
        networkId: numToIp(netNum),
        broadcastAddress: numToIp(bcastNum),
        firstUsableHost: usableHosts > 0 ? numToIp(netNum + 1) : 'N/A',
        lastUsableHost: usableHosts > 0 ? numToIp(bcastNum - 1) : 'N/A',
        usableHosts,
        totalHosts
      };
    } catch {
      return null;
    }
  };

  const calculatedInfo = calculateCidrInfo(calcIp, calcCidr);

  // ------------------------------------------
  // HANDLERS: Module B (TCP / UDP)
  // ------------------------------------------
  const advanceCongestionSim = (event: 'ack' | 'loss') => {
    const nextRound = ccHistory.length + 1;
    let nextCwnd = cwnd;
    let nextSsthresh = ssthresh;
    let nextPhase = ccPhase;

    if (event === 'loss') {
      nextSsthresh = Math.max(2, Math.floor(cwnd / 2));
      nextCwnd = 1;
      nextPhase = 'slow_start';
    } else {
      if (ccPhase === 'slow_start') {
        nextCwnd = cwnd * 2;
        if (nextCwnd >= nextSsthresh) {
          nextPhase = 'avoidance';
        }
      } else {
        // Congestion avoidance: additive increase +1 per RTT
        nextCwnd = cwnd + 1;
      }
    }

    setCwnd(nextCwnd);
    setSsthresh(nextSsthresh);
    setCcPhase(nextPhase);
    setCcHistory(prev => [...prev.slice(-9), {
      round: nextRound,
      cwnd: nextCwnd,
      phase: nextPhase === 'slow_start' ? 'Slow Start' : 'Congestion Avoidance'
    }]);
  };

  const handleScenarioSelect = (id: string, protocol: 'TCP' | 'UDP') => {
    setScenarioAnswers(prev => ({ ...prev, [id]: protocol }));
    const scenario = UDL_TCP_VS_UDP_SCENARIOS.find(s => s.id === id);
    const isCorrect = scenario?.correctProtocol === protocol;
    setScenarioFeedback(prev => ({ ...prev, [id]: isCorrect }));
  };

  const submitTcpVsUdpScenarios = async () => {
    const total = UDL_TCP_VS_UDP_SCENARIOS.length;
    let correct = 0;
    UDL_TCP_VS_UDP_SCENARIOS.forEach(sc => {
      if (scenarioAnswers[sc.id] === sc.correctProtocol) correct++;
    });

    const score = Math.round((correct / total) * 100);
    setIsSubmitting(true);
    const student = auth.currentUser;
    const rec = await persistUdlSubmission({
      activityId: 'udl_tcp_vs_udp',
      moduleId: 'module_b_tcp_udp',
      modality: 'interactive_sim',
      studentId: student?.uid || 'guest_student',
      studentName: student?.displayName || 'Student Learner',
      studentRegNo: student?.email?.split('@')[0].toUpperCase() || 'REG-UDL',
      studentEmail: student?.email || 'student@cresco.edu',
      answers: scenarioAnswers,
      autoScore: score,
      maxScore: 100,
      isEvaluated: true,
      facultyFeedback: `Classified ${correct}/${total} transport scenarios accurately with transport protocol trade-off analysis.`
    });
    setSubmissions(prev => [rec, ...prev]);
    setIsSubmitting(false);
    setSubmissionSuccess(`TCP vs UDP assessment saved (${score}/100) to Firestore!`);
    setTimeout(() => setSubmissionSuccess(null), 5000);
  };

  const handleHeaderPuzzleCheck = async () => {
    const res = validateTcpHeaderPuzzle(headerPlacements);
    setHeaderScore(res);

    if (res.correctCount === res.total) {
      setIsSubmitting(true);
      const student = auth.currentUser;
      const rec = await persistUdlSubmission({
        activityId: 'udl_tcp_header_puzzle',
        moduleId: 'module_b_tcp_udp',
        modality: 'interactive_sim',
        studentId: student?.uid || 'guest_student',
        studentName: student?.displayName || 'Student Learner',
        studentRegNo: student?.email?.split('@')[0].toUpperCase() || 'REG-UDL',
        studentEmail: student?.email || 'student@cresco.edu',
        answers: headerPlacements,
        autoScore: 100,
        maxScore: 100,
        isEvaluated: true,
        facultyFeedback: 'Flawless 32-bit TCP header assembly from Source Port to Urgent Pointer.'
      });
      setSubmissions(prev => [rec, ...prev]);
      setIsSubmitting(false);
      setSubmissionSuccess('TCP Header Puzzle complete! 100/100 saved.');
      setTimeout(() => setSubmissionSuccess(null), 5000);
    }
  };

  const handleWiresharkSubmit = async () => {
    setWiresharkSubmitted(true);
    setIsSubmitting(true);
    const student = auth.currentUser;
    const rec = await persistUdlSubmission({
      activityId: 'udl_packet_trace_wireshark',
      moduleId: 'module_b_tcp_udp',
      modality: 'packet_analysis',
      studentId: student?.uid || 'guest_student',
      studentName: student?.displayName || 'Student Learner',
      studentRegNo: student?.email?.split('@')[0].toUpperCase() || 'REG-UDL',
      studentEmail: student?.email || 'student@cresco.edu',
      answers: wiresharkAnswers,
      autoScore: 90,
      maxScore: 100,
      isEvaluated: false,
      facultyFeedback: 'Submitted packet capture trace extraction. Pending faculty manual inspection of frame interpretation.'
    });
    setSubmissions(prev => [rec, ...prev]);
    setIsSubmitting(false);
    setSubmissionSuccess('Packet analysis submission saved for Faculty evaluation.');
    setTimeout(() => setSubmissionSuccess(null), 5000);
  };

  const handleTroubleshootingSubmit = async () => {
    if (!tsDiagnosis.rootCause.trim()) return;
    setIsSubmitting(true);
    const student = auth.currentUser;
    const rec = await persistUdlSubmission({
      activityId: `udl_ts_${selectedTsId}`,
      moduleId: 'module_b_tcp_udp',
      modality: 'written_explanation',
      studentId: student?.uid || 'guest_student',
      studentName: student?.displayName || 'Student Learner',
      studentRegNo: student?.email?.split('@')[0].toUpperCase() || 'REG-UDL',
      studentEmail: student?.email || 'student@cresco.edu',
      answers: { scenarioId: selectedTsId, ...tsDiagnosis },
      autoScore: 0,
      maxScore: 30,
      isEvaluated: false,
      facultyFeedback: 'Pending faculty evaluation of root-cause diagnosis, TCP mechanism, and proposed remediation.'
    });
    setSubmissions(prev => [rec, ...prev]);
    setIsSubmitting(false);
    setSubmissionSuccess('Troubleshooting diagnosis persisted for Faculty review.');
    setTimeout(() => setSubmissionSuccess(null), 5000);
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-6">
      {/* HEADER WITH UDL PILLARS */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-48 h-48 text-indigo-400" />
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-semibold uppercase tracking-wider">
                Universal Design for Learning (UDL)
              </span>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-medium">
                Live Persistent Backend
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Layers className="w-8 h-8 text-indigo-400" />
              UDL Computer Networks Studio
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Experience the Network & Transport layers through multi-modal representation, interactive engagement challenges, and flexible expression formats.
            </p>
          </div>

          {/* UDL Pillar Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-950/70 border border-blue-500/30 rounded-lg text-xs text-blue-200">
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span>Representation</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/70 border border-amber-500/30 rounded-lg text-xs text-amber-200">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>Engagement</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/70 border border-emerald-500/30 rounded-lg text-xs text-emerald-200">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Action & Expression</span>
            </div>
            <button
              onClick={() => setShowCheatSheet(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-xs transition shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>1-Page Cheat Sheet</span>
            </button>
          </div>
        </div>

        {/* Global Success Banner */}
        {submissionSuccess && (
          <div className="mt-4 p-3 bg-emerald-900/60 border border-emerald-500/40 rounded-xl text-emerald-200 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{submissionSuccess}</span>
          </div>
        )}
      </div>

      {/* PRIMARY MODULE NAVIGATION TABS */}
      <div className="flex border-b border-slate-800 space-x-2">
        <button
          onClick={() => setActiveModule('module_a')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm rounded-t-xl transition-all border-b-2 ${
            activeModule === 'module_a'
              ? 'border-indigo-500 bg-slate-900 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span>Module A: IPv4 Addressing & Subnetting</span>
        </button>
        <button
          onClick={() => setActiveModule('module_b')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm rounded-t-xl transition-all border-b-2 ${
            activeModule === 'module_b'
              ? 'border-indigo-500 bg-slate-900 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Module B: TCP & UDP Transport Protocols</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* MODULE A: IPv4 ADDRESSING & SUBNETTING                        */}
      {/* ============================================================ */}
      {activeModule === 'module_a' && (
        <div className="space-y-6">
          {/* UDL Dimensions Sub-Navigation */}
          <div className="flex flex-wrap gap-2 p-1 bg-slate-900/80 border border-slate-800 rounded-xl">
            <button
              onClick={() => setModuleATab('representation')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                moduleATab === 'representation'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>1. Representation (Visuals, Tables & Worked Examples)</span>
            </button>
            <button
              onClick={() => setModuleATab('engagement')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                moduleATab === 'engagement'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>2. Engagement (Interactive Subnet Challenges)</span>
            </button>
            <button
              onClick={() => setModuleATab('expression')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                moduleATab === 'expression'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>3. Action & Expression (Calculator, Quizzes & Written Proof)</span>
            </button>
          </div>

          {/* 1. REPRESENTATION VIEW */}
          {moduleATab === 'representation' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card 1: 32-bit IPv4 Anatomy Visual */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-400" />
                    IPv4 Address Anatomy: 32 Bits in 4 Octets
                  </h3>
                  <span className="text-xs bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded">
                    Visual Representation
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Every IPv4 address comprises exactly 32 bits separated into 4 octets (8 bits each). In Classless Inter-Domain Routing (CIDR), the prefix length (/N) dictates how many leading bits belong to the <strong>Network ID</strong>, leaving the remainder for <strong>Host IDs</strong>.
                </p>

                {/* Octet Visualizer */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="text-xs font-mono text-slate-400 flex justify-between">
                    <span>Example: 192.168.10.0 / 26</span>
                    <span className="text-indigo-400 font-bold">26 Network Bits | 6 Host Bits</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center font-mono">
                    <div className="p-2.5 bg-blue-950/80 border border-blue-500/50 rounded-lg">
                      <div className="text-lg font-bold text-blue-300">192</div>
                      <div className="text-[10px] text-blue-400/80 mt-1">11000000</div>
                      <div className="text-[9px] text-slate-400">Octet 1 (Net)</div>
                    </div>
                    <div className="p-2.5 bg-blue-950/80 border border-blue-500/50 rounded-lg">
                      <div className="text-lg font-bold text-blue-300">168</div>
                      <div className="text-[10px] text-blue-400/80 mt-1">10101000</div>
                      <div className="text-[9px] text-slate-400">Octet 2 (Net)</div>
                    </div>
                    <div className="p-2.5 bg-blue-950/80 border border-blue-500/50 rounded-lg">
                      <div className="text-lg font-bold text-blue-300">10</div>
                      <div className="text-[10px] text-blue-400/80 mt-1">00001010</div>
                      <div className="text-[9px] text-slate-400">Octet 3 (Net)</div>
                    </div>
                    <div className="p-2.5 bg-purple-950/80 border border-purple-500/50 rounded-lg">
                      <div className="text-lg font-bold text-purple-300">0</div>
                      <div className="text-[10px] text-purple-300 mt-1">
                        <span className="text-amber-400 font-bold underline">11</span>
                        <span className="text-slate-400">0000</span>
                      </div>
                      <div className="text-[9px] text-amber-300">2 Subnet | 6 Host</div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Subnet Mask:</span>
                      <span className="font-mono text-emerald-400">255.255.255.192</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Block Size (Increment):</span>
                      <span className="font-mono text-amber-400">256 - 192 = 64</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Usable Hosts per Subnet:</span>
                      <span className="font-mono text-cyan-400">2^6 - 2 = 62 hosts</span>
                    </div>
                  </div>
                </div>

                {/* Animated Block Division Diagram */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-300">
                    Network Division Diagram: 192.168.10.0/24 divided into 4 Subnets (/26)
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 font-mono text-xs">
                    <div className="bg-blue-900/40 border border-blue-500/40 p-2.5 rounded-lg text-center hover:bg-blue-900/60 transition">
                      <div className="text-[10px] text-blue-400 font-bold uppercase">Subnet 1</div>
                      <div className="font-bold text-white text-xs mt-1">.0/26</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">.1 – .62</div>
                      <div className="text-[9px] text-amber-300/80">Bcast: .63</div>
                    </div>
                    <div className="bg-emerald-900/40 border border-emerald-500/40 p-2.5 rounded-lg text-center hover:bg-emerald-900/60 transition">
                      <div className="text-[10px] text-emerald-400 font-bold uppercase">Subnet 2</div>
                      <div className="font-bold text-white text-xs mt-1">.64/26</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">.65 – .126</div>
                      <div className="text-[9px] text-amber-300/80">Bcast: .127</div>
                    </div>
                    <div className="bg-amber-900/40 border border-amber-500/40 p-2.5 rounded-lg text-center hover:bg-amber-900/60 transition">
                      <div className="text-[10px] text-amber-400 font-bold uppercase">Subnet 3</div>
                      <div className="font-bold text-white text-xs mt-1">.128/26</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">.129 – .190</div>
                      <div className="text-[9px] text-amber-300/80">Bcast: .191</div>
                    </div>
                    <div className="bg-purple-900/40 border border-purple-500/40 p-2.5 rounded-lg text-center hover:bg-purple-900/60 transition">
                      <div className="text-[10px] text-purple-400 font-bold uppercase">Subnet 4</div>
                      <div className="font-bold text-white text-xs mt-1">.192/26</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">.193 – .254</div>
                      <div className="text-[9px] text-amber-300/80">Bcast: .255</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Step-by-Step Worked Subnetting Example */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    Step-by-Step Worked Subnetting Walkthrough
                  </h3>
                  <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
                    Pedagogical Formula
                  </span>
                </div>

                <div className="space-y-2.5">
                  {UDL_SUBNET_PROBLEM_A.stepByStepRationale.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs">
                      <span className="w-5 h-5 rounded-full bg-indigo-600/40 text-indigo-300 flex items-center justify-center font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-slate-300 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-blue-950/40 border border-blue-900/60 rounded-xl text-xs text-blue-200">
                  <span className="font-bold block mb-1">💡 UDL Representation Rule:</span>
                  Always calculate the magic number increment first (256 - last octet mask). Starting at 0, repeatedly add the increment until 256 is reached. The broadcast address is always 1 less than the next network address.
                </div>
              </div>
            </div>
          )}

          {/* 2. ENGAGEMENT VIEW: Interactive Subnet Challenges */}
          {moduleATab === 'engagement' && (
            <div className="space-y-6">
              {/* Problem A Container */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <h3 className="font-bold text-white text-lg flex items-center gap-2">
                      <Target className="w-5 h-5 text-amber-400" />
                      Interactive Challenge: Divide 192.168.10.0/24 into 4 Equal Subnets
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Enter the calculated values for all 4 subnets below. Live backend validation checks mathematical accuracy.
                    </p>
                  </div>

                  {/* Group Activity Role Switcher */}
                  <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
                    <Users className="w-4 h-4 text-indigo-400 ml-1" />
                    <span className="text-slate-400 text-[11px]">Role:</span>
                    <button
                      onClick={() => setGroupRole('individual')}
                      className={`px-2 py-1 rounded text-xs font-medium transition ${
                        groupRole === 'individual' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      Individual
                    </button>
                    <button
                      onClick={() => setGroupRole('architect')}
                      className={`px-2 py-1 rounded text-xs font-medium transition ${
                        groupRole === 'architect' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      Subnet Architect
                    </button>
                    <button
                      onClick={() => setGroupRole('allocator')}
                      className={`px-2 py-1 rounded text-xs font-medium transition ${
                        groupRole === 'allocator' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      Host Allocator
                    </button>
                  </div>
                </div>

                {/* Subnet Input Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3">Subnet</th>
                        <th className="p-3">Network ID</th>
                        <th className="p-3">First Usable Host</th>
                        <th className="p-3">Last Usable Host</th>
                        <th className="p-3">Broadcast Address</th>
                        <th className="p-3 text-right">Verification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono">
                      {[1, 2, 3, 4].map(idx => {
                        const val = subAValidation[idx];
                        return (
                          <tr key={idx} className="hover:bg-slate-950/40">
                            <td className="p-3 font-sans font-bold text-slate-300">
                              Subnet {idx}
                            </td>
                            <td className="p-3">
                              <input
                                type="text"
                                placeholder="e.g. 192.168.10.0"
                                value={subAInputs[idx]?.networkId || ''}
                                onChange={e => {
                                  const val = e.target.value;
                                  setSubAInputs(prev => ({
                                    ...prev,
                                    [idx]: { ...prev[idx], networkId: val }
                                  }));
                                }}
                                className={`w-36 bg-slate-950 border px-2.5 py-1.5 rounded-lg text-white focus:outline-none ${
                                  val && !val.fieldMatches?.networkId ? 'border-red-500' : 'border-slate-700'
                                }`}
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="text"
                                placeholder="e.g. 192.168.10.1"
                                value={subAInputs[idx]?.firstUsableHost || ''}
                                onChange={e => {
                                  const val = e.target.value;
                                  setSubAInputs(prev => ({
                                    ...prev,
                                    [idx]: { ...prev[idx], firstUsableHost: val }
                                  }));
                                }}
                                className={`w-36 bg-slate-950 border px-2.5 py-1.5 rounded-lg text-white focus:outline-none ${
                                  val && !val.fieldMatches?.firstUsableHost ? 'border-red-500' : 'border-slate-700'
                                }`}
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="text"
                                placeholder="e.g. 192.168.10.62"
                                value={subAInputs[idx]?.lastUsableHost || ''}
                                onChange={e => {
                                  const val = e.target.value;
                                  setSubAInputs(prev => ({
                                    ...prev,
                                    [idx]: { ...prev[idx], lastUsableHost: val }
                                  }));
                                }}
                                className={`w-36 bg-slate-950 border px-2.5 py-1.5 rounded-lg text-white focus:outline-none ${
                                  val && !val.fieldMatches?.lastUsableHost ? 'border-red-500' : 'border-slate-700'
                                }`}
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="text"
                                placeholder="e.g. 192.168.10.63"
                                value={subAInputs[idx]?.broadcastAddress || ''}
                                onChange={e => {
                                  const val = e.target.value;
                                  setSubAInputs(prev => ({
                                    ...prev,
                                    [idx]: { ...prev[idx], broadcastAddress: val }
                                  }));
                                }}
                                className={`w-36 bg-slate-950 border px-2.5 py-1.5 rounded-lg text-white focus:outline-none ${
                                  val && !val.fieldMatches?.broadcastAddress ? 'border-red-500' : 'border-slate-700'
                                }`}
                              />
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleValidateSubnetA(idx)}
                                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-sans font-medium transition"
                              >
                                Test Subnet {idx}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Progressive Hints Tier */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4" />
                      Progressive Scaffolding Hints ({subAHintTier}/3)
                    </span>
                    <button
                      onClick={() => setSubAHintTier(t => Math.min(3, t + 1))}
                      disabled={subAHintTier >= 3}
                      className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-xs transition disabled:opacity-40"
                    >
                      Reveal Next Hint
                    </button>
                  </div>

                  {subAHintTier >= 1 && (
                    <div className="text-xs text-slate-300 p-2 bg-slate-900 rounded-lg border border-slate-800">
                      <strong>Hint 1:</strong> To create 4 subnets, we need $2^n \ge 4$, which means borrowing 2 bits ($n=2$). The prefix changes from /24 to /26 ($24 + 2 = 26$).
                    </div>
                  )}
                  {subAHintTier >= 2 && (
                    <div className="text-xs text-slate-300 p-2 bg-slate-900 rounded-lg border border-slate-800">
                      <strong>Hint 2:</strong> In the 4th octet, 2 bits = 128 + 64 = 192 mask. The block size (magic number) is $256 - 192 = 64$.
                    </div>
                  )}
                  {subAHintTier >= 3 && (
                    <div className="text-xs text-slate-300 p-2 bg-slate-900 rounded-lg border border-slate-800">
                      <strong>Hint 3:</strong> Subnet boundaries start at .0, .64, .128, .192. Broadcast addresses are .63, .127, .191, .255.
                    </div>
                  )}
                </div>

                {/* Submit All */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-slate-400">
                    All 4 subnets must be correct to earn full persistent XP and credit.
                  </div>
                  <button
                    onClick={handleValidateAllSubnetA}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-950 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Validating...' : 'Validate & Submit to Backend (100 XP)'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. ACTION & EXPRESSION VIEW */}
          {moduleATab === 'expression' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Interactive Subnet Calculator Tool */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-cyan-400" />
                    Interactive Subnet Calculator & Range Verifier
                  </h3>
                  <span className="text-xs bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded">
                    Tool Modality
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">IP Address</label>
                    <input
                      type="text"
                      value={calcIp}
                      onChange={e => setCalcIp(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">CIDR Prefix (/{calcCidr})</label>
                    <input
                      type="range"
                      min="8"
                      max="30"
                      value={calcCidr}
                      onChange={e => setCalcCidr(Number(e.target.value))}
                      className="w-full accent-cyan-500 cursor-pointer mt-2"
                    />
                  </div>
                </div>

                {calculatedInfo && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-2">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Subnet Mask:</span>
                      <span className="text-cyan-400 font-bold">{calculatedInfo.subnetMask}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Network ID:</span>
                      <span className="text-white font-bold">{calculatedInfo.networkId}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Usable Range:</span>
                      <span className="text-emerald-400">{calculatedInfo.firstUsableHost} – {calculatedInfo.lastUsableHost}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Broadcast:</span>
                      <span className="text-amber-400">{calculatedInfo.broadcastAddress}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Usable Hosts:</span>
                      <span className="text-indigo-400 font-bold">{calculatedInfo.usableHosts.toLocaleString()} hosts</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Written Explanation Submission */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-400" />
                    Written Mathematical Explanation
                  </h3>
                  <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded">
                    Faculty Rubric Evaluated
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Demonstrate conceptual mastery in your own words. Explain why borrowing 2 bits creates 4 subnets, how the magic number is derived, and why 2 IP addresses in each subnet cannot be assigned to hosts.
                </p>

                <textarea
                  rows={5}
                  value={writtenExplanation}
                  onChange={e => setWrittenExplanation(e.target.value)}
                  placeholder="Explain step-by-step: 1. Bit borrowing formula, 2. Magic number calculation, 3. Special role of Network and Broadcast IPs..."
                  className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">
                    Assessed on Representation, Accuracy, and Expression.
                  </span>
                  <button
                    onClick={handleWrittenSubmit}
                    disabled={writtenSubmitting || !writtenExplanation.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition disabled:opacity-50"
                  >
                    {writtenSubmitting ? 'Submitting...' : 'Submit to Faculty Queue'}
                  </button>
                </div>
              </div>

              {/* Challenge B: 172.16.0.0/20 into 8 Subnets */}
              <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-400" />
                      Advanced Practice Challenge B: Divide 172.16.0.0/20 into 8 Subnets
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Requires borrowing 3 bits into the 3rd octet (/20 to /23). Increment = 2 in the 3rd octet. 510 usable hosts per subnet.
                    </p>
                  </div>
                  <button
                    onClick={handleValidateAllSubnetB}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition shadow"
                  >
                    Validate All 8 Subnets
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(idx => {
                    const isOk = subBValidation[idx]?.isCorrect;
                    return (
                      <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs text-purple-300">Subnet {idx}</span>
                          {subBValidation[idx] && (
                            <span className={`text-[10px] font-bold ${isOk ? 'text-emerald-400' : 'text-red-400'}`}>
                              {isOk ? '✓ Correct' : '✗ Retry'}
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder="Net ID (e.g. 172.16.0.0)"
                          value={subBInputs[idx]?.networkId || ''}
                          onChange={e => setSubBInputs(p => ({ ...p, [idx]: { ...p[idx], networkId: e.target.value } }))}
                          className="w-full bg-slate-900 border border-slate-700 px-2 py-1 rounded text-xs font-mono text-white"
                        />
                        <input
                          type="text"
                          placeholder="Broadcast (e.g. 172.16.1.255)"
                          value={subBInputs[idx]?.broadcastAddress || ''}
                          onChange={e => setSubBInputs(p => ({ ...p, [idx]: { ...p[idx], broadcastAddress: e.target.value } }))}
                          className="w-full bg-slate-900 border border-slate-700 px-2 py-1 rounded text-xs font-mono text-white"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODULE B: TCP & UDP TRANSPORT PROTOCOLS                      */}
      {/* ============================================================ */}
      {activeModule === 'module_b' && (
        <div className="space-y-6">
          {/* Sub-Tabs for Module B */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-xl">
            {[
              { id: 'handshake', label: '1. Handshake & Role-Play' },
              { id: 'loss', label: '2. Loss & Retransmission' },
              { id: 'window', label: '3. Sliding Window' },
              { id: 'congestion', label: '4. Congestion (cwnd)' },
              { id: 'compare', label: '5. TCP vs UDP' },
              { id: 'states', label: '6. State Machine' },
              { id: 'header', label: '7. Header Puzzle' },
              { id: 'wireshark', label: '8. Packet Analysis' },
              { id: 'troubleshoot', label: '9. Troubleshooting' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setModuleBTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  moduleBTab === tab.id
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 1. 3-WAY HANDSHAKE & ROLE-PLAY */}
          {moduleBTab === 'handshake' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-400" />
                    Interactive TCP 3-Way Handshake & Role-Play Simulation
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Step through the client-server synchronization sequence or switch into faculty role-play mode.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setHandshakeStep(s => (s + 1) % 4)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition"
                  >
                    Step Forward ({handshakeStep}/3)
                  </button>
                  <button
                    onClick={() => setHandshakeStep(0)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition"
                    title="Reset"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Handshake Sequence Diagram Canvas */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 relative">
                <div className="flex justify-between font-mono text-sm font-bold text-slate-300 pb-4 border-b border-slate-800">
                  <div className="text-center">
                    <div className="text-blue-400">CLIENT (Initiator)</div>
                    <div className="text-xs text-slate-500 font-normal mt-0.5">
                      State: {handshakeStep === 0 ? 'CLOSED' : handshakeStep === 1 ? 'SYN_SENT' : 'ESTABLISHED'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-emerald-400">SERVER (Listener)</div>
                    <div className="text-xs text-slate-500 font-normal mt-0.5">
                      State: {handshakeStep < 2 ? 'LISTEN' : handshakeStep === 2 ? 'SYN_RCVD' : 'ESTABLISHED'}
                    </div>
                  </div>
                </div>

                {/* Packet Flows */}
                <div className="py-6 space-y-6 font-mono text-xs">
                  {/* Message 1: SYN */}
                  <div className={`transition-opacity duration-500 ${handshakeStep >= 1 ? 'opacity-100' : 'opacity-20'}`}>
                    <div className="flex items-center justify-between text-blue-300">
                      <span>Client SYN (Seq=1000)</span>
                      <span className="text-[10px] text-slate-500">MSS=1460, WS=128</span>
                    </div>
                    <div className="relative h-2 bg-blue-950 rounded my-1">
                      <div className="absolute inset-0 bg-blue-500 rounded flex items-center justify-end pr-2 text-[10px] font-bold text-white">
                        SYN ➔
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans">
                      Purpose: Synchronizes client sequence number (ISN) and advertises receive window parameters.
                    </div>
                  </div>

                  {/* Message 2: SYN-ACK */}
                  <div className={`transition-opacity duration-500 ${handshakeStep >= 2 ? 'opacity-100' : 'opacity-20'}`}>
                    <div className="flex items-center justify-between text-emerald-300">
                      <span className="text-[10px] text-slate-500">Win=65535</span>
                      <span>Server SYN-ACK (Seq=5000, Ack=1001)</span>
                    </div>
                    <div className="relative h-2 bg-emerald-950 rounded my-1">
                      <div className="absolute inset-0 bg-emerald-500 rounded flex items-center justify-start pl-2 text-[10px] font-bold text-white">
                        ⬅ SYN + ACK
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans text-right">
                      Purpose: Server accepts request, synchronizes its own sequence number, and acknowledges client's ISN+1.
                    </div>
                  </div>

                  {/* Message 3: ACK */}
                  <div className={`transition-opacity duration-500 ${handshakeStep >= 3 ? 'opacity-100' : 'opacity-20'}`}>
                    <div className="flex items-center justify-between text-purple-300">
                      <span>Client ACK (Seq=1001, Ack=5001)</span>
                      <span className="text-emerald-400 font-bold">ESTABLISHED</span>
                    </div>
                    <div className="relative h-2 bg-purple-950 rounded my-1">
                      <div className="absolute inset-0 bg-purple-500 rounded flex items-center justify-end pr-2 text-[10px] font-bold text-white">
                        ACK ➔
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans">
                      Purpose: Handshake complete! Socket is now bidirectional and ready to carry application data (e.g. HTTP GET / TLS Client Hello).
                    </div>
                  </div>
                </div>

                {/* Handshake Reflection Questions */}
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs space-y-2">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4" />
                    Handshake Edge Case: What happens if the final ACK is lost?
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    If the client's final ACK is lost, the client believes the connection is ESTABLISHED and may immediately transmit data. The server remains in <strong>SYN_RCVD</strong>. When the client's data arrives with Ack=5001, the server infers the connection and transitions to ESTABLISHED. If no data arrives, the server retransmits the SYN-ACK timer.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. RELIABLE DATA TRANSFER & PACKET LOSS */}
          {moduleBTab === 'loss' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-400" />
                    Reliable Data Transfer: Packet Loss & Retransmission Activity
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Packets P1 through P5 are dispatched. Segment P3 is dropped in transit. Predict receiver acknowledgement behavior.
                  </p>
                </div>
                <button
                  onClick={() => setLossSimStep(s => (s + 1) % 4)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition"
                >
                  Step Simulation ({lossSimStep}/3)
                </button>
              </div>

              {/* Packet Sequence Visual */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="grid grid-cols-5 gap-3 font-mono text-center">
                  <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl">
                    <div className="text-emerald-300 font-bold">Packet P1</div>
                    <div className="text-[10px] text-slate-400">Seq=1001..2000</div>
                    <div className="text-xs text-emerald-400 font-bold mt-1">✓ ACKed (2001)</div>
                  </div>
                  <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl">
                    <div className="text-emerald-300 font-bold">Packet P2</div>
                    <div className="text-[10px] text-slate-400">Seq=2001..3000</div>
                    <div className="text-xs text-emerald-400 font-bold mt-1">✓ ACKed (3001)</div>
                  </div>
                  <div className="p-3 bg-red-950/80 border border-red-500/80 rounded-xl animate-pulse">
                    <div className="text-red-300 font-bold">Packet P3</div>
                    <div className="text-[10px] text-slate-400">Seq=3001..4000</div>
                    <div className="text-xs text-red-400 font-bold mt-1">✗ DROPPED</div>
                  </div>
                  <div className="p-3 bg-amber-950/80 border border-amber-500/50 rounded-xl">
                    <div className="text-amber-300 font-bold">Packet P4</div>
                    <div className="text-[10px] text-slate-400">Seq=4001..5000</div>
                    <div className="text-xs text-amber-400 font-bold mt-1">Dup ACK 1 (3001)</div>
                  </div>
                  <div className="p-3 bg-amber-950/80 border border-amber-500/50 rounded-xl">
                    <div className="text-amber-300 font-bold">Packet P5</div>
                    <div className="text-[10px] text-slate-400">Seq=5001..6000</div>
                    <div className="text-xs text-amber-400 font-bold mt-1">Dup ACK 2 (3001)</div>
                  </div>
                </div>

                {/* Prediction Checkpoint */}
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-indigo-400" />
                    Prediction Challenge: Why does the receiver continue acknowledging byte 3001?
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => {
                        setLossPrediction('cumulative');
                        setLossPredictionFeedback('Correct! TCP ACKs are strictly cumulative. The receiver acknowledges the next expected contiguous in-order byte (3001), buffering P4 and P5.');
                      }}
                      className="p-3 bg-slate-950 hover:bg-indigo-950/50 border border-slate-800 rounded-xl text-left transition"
                    >
                      <strong>Option A (Cumulative ACK):</strong> TCP uses cumulative acknowledgements; because P3 is missing, the receiver cannot acknowledge beyond 3001 until the gap is filled.
                    </button>
                    <button
                      onClick={() => {
                        setLossPrediction('error');
                        setLossPredictionFeedback('Incorrect. TCP does not discard out-of-order packets immediately in modern stacks (SACK); it buffers them but cannot advance the ACK pointer.');
                      }}
                      className="p-3 bg-slate-950 hover:bg-red-950/50 border border-slate-800 rounded-xl text-left transition"
                    >
                      <strong>Option B (Discard):</strong> The receiver discards P4 and P5 completely because TCP cannot buffer out-of-order data.
                    </button>
                  </div>

                  {lossPredictionFeedback && (
                    <div className="p-3 bg-indigo-950 border border-indigo-500/40 rounded-lg text-xs text-indigo-200">
                      {lossPredictionFeedback}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. SLIDING WINDOW FLOW CONTROL */}
          {moduleBTab === 'window' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-indigo-400" />
                    TCP Sliding Window Flow Control Interactive Sandbox
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Adjust the advertised window size ($W$) and slide across packet cards to observe flow limits and calculate BDP throughput.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-xs font-mono">
                    <span className="text-slate-400">Window Size (W): </span>
                    <span className="text-indigo-400 font-bold text-sm">{windowSize} packets</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={windowSize}
                    onChange={e => setWindowSize(Number(e.target.value))}
                    className="accent-indigo-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Slider Packet Cards */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Packet Sequence Stream (1 to 12)</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setWindowOffset(o => Math.max(0, o - 1))}
                      disabled={windowOffset === 0}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs disabled:opacity-40"
                    >
                      ◀ Slide Back
                    </button>
                    <button
                      onClick={() => setWindowOffset(o => Math.min(12 - windowSize, o + 1))}
                      disabled={windowOffset >= 12 - windowSize}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs disabled:opacity-40"
                    >
                      Slide Forward ▶
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-1.5 font-mono text-center">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(pkt => {
                    const isInWindow = pkt > windowOffset && pkt <= windowOffset + windowSize;
                    const isAcked = pkt <= windowOffset;
                    return (
                      <div
                        key={pkt}
                        className={`p-2 rounded-lg border transition-all ${
                          isInWindow
                            ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold scale-105 shadow-md shadow-indigo-950'
                            : isAcked
                            ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400 text-xs'
                            : 'bg-slate-900 border-slate-800 text-slate-600 text-xs'
                        }`}
                      >
                        <div className="text-[10px]">P{pkt}</div>
                        <div className="text-[8px] mt-1">
                          {isAcked ? 'ACK' : isInWindow ? 'IN FLIGHT' : 'WAIT'}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Numerical Problem Solving */}
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs space-y-2">
                  <div className="font-bold text-white">
                    Numerical Problem: Bandwidth-Delay Product (BDP) Formula
                  </div>
                  <div className="text-slate-300 font-mono">
                    Throughput Ceiling = Window Size (bytes) / Round Trip Time (RTT).
                  </div>
                  <div className="text-slate-400 text-[11px] leading-relaxed">
                    With a default 64 KB window (65,535 bytes) and an RTT of 40 ms, maximum possible speed is 65,535 / 0.040 = 1.63 MB/s—regardless of whether your physical link is 1 Gbps or 10 Gbps! This is why TCP Window Scaling (RFC 1323) is required.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. CONGESTION CONTROL (CWND) */}
          {moduleBTab === 'congestion' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    TCP Congestion Control (cwnd): Slow Start, Avoidance & Loss
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Simulate the evolution of the congestion window ($cwnd$). Step through RTT rounds or trigger a packet loss event.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => advanceCongestionSim('ack')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition"
                  >
                    Receive ACKs (+RTT)
                  </button>
                  <button
                    onClick={() => advanceCongestionSim('loss')}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition"
                  >
                    Simulate Packet Loss!
                  </button>
                </div>
              </div>

              {/* Status HUD */}
              <div className="grid grid-cols-3 gap-3 font-mono text-center">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400">Current cwnd</div>
                  <div className="text-2xl font-bold text-emerald-400">{cwnd} MSS</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400">Slow Start Threshold (ssthresh)</div>
                  <div className="text-2xl font-bold text-amber-400">{ssthresh} MSS</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400">Active Phase</div>
                  <div className="text-sm font-bold text-indigo-300 uppercase mt-1">
                    {ccPhase === 'slow_start' ? 'Slow Start (Exp)' : 'Congestion Avoidance (Linear)'}
                  </div>
                </div>
              </div>

              {/* Congestion Window History Sparkline */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
                <div className="text-xs font-semibold text-slate-300">
                  Congestion Window Progression (Last {ccHistory.length} Rounds)
                </div>
                <div className="h-32 flex items-end gap-2 border-b border-slate-800 pb-2">
                  {ccHistory.map((item, idx) => {
                    const heightPercent = Math.min(100, (item.cwnd / 32) * 100);
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                        <div className="text-[9px] text-slate-500 font-mono opacity-0 group-hover:opacity-100 transition">
                          {item.cwnd}
                        </div>
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t transition-all ${
                            item.phase.includes('Slow') ? 'bg-indigo-500' : 'bg-emerald-500'
                          }`}
                        />
                        <div className="text-[8px] text-slate-500">R{item.round}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 5. TCP VS UDP COMPARISON & SCENARIO CLASSIFIER */}
          {moduleBTab === 'compare' && (
            <div className="space-y-6">
              {/* Matrix Card */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                  Protocol Architectural Comparison Matrix
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Dimension</th>
                        <th className="p-3 text-blue-300">Transmission Control Protocol (TCP)</th>
                        <th className="p-3 text-amber-300">User Datagram Protocol (UDP)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      <tr>
                        <td className="p-3 font-semibold text-slate-400">Connection State</td>
                        <td className="p-3 text-slate-200">Connection-oriented (3-way handshake required)</td>
                        <td className="p-3 text-slate-200">Connectionless (Fire-and-forget datagrams)</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-400">Reliability & ACKs</td>
                        <td className="p-3 text-slate-200">Guaranteed in-order delivery via ACKs & retransmission</td>
                        <td className="p-3 text-slate-200">Unreliable; packets may drop, duplicate, or arrive out-of-order</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-400">Flow & Congestion Control</td>
                        <td className="p-3 text-slate-200">Full sliding window flow control + cwnd congestion backoff</td>
                        <td className="p-3 text-slate-200">None at transport layer; application controls transmission rate</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-400">Header Overhead</td>
                        <td className="p-3 text-slate-200">20 to 60 bytes</td>
                        <td className="p-3 text-slate-200">8 bytes fixed</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 6 Real-World Scenarios Classifier */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <Target className="w-5 h-5 text-amber-400" />
                      Transport Protocol Scenario Classifier (6 Real-World Cases)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Choose the appropriate transport protocol based on application latency tolerance vs loss tolerance.
                    </p>
                  </div>
                  <button
                    onClick={submitTcpVsUdpScenarios}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow"
                  >
                    Submit Answers to Backend
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {UDL_TCP_VS_UDP_SCENARIOS.map(sc => {
                    const chosen = scenarioAnswers[sc.id];
                    const isOk = scenarioFeedback[sc.id];
                    return (
                      <div key={sc.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-xs text-white">{sc.application}</h4>
                          {chosen && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              isOk ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'
                            }`}>
                              {isOk ? '✓ Correct' : '✗ Incorrect'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{sc.description}</p>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleScenarioSelect(sc.id, 'TCP')}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                              chosen === 'TCP' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                            }`}
                          >
                            TCP
                          </button>
                          <button
                            onClick={() => handleScenarioSelect(sc.id, 'UDP')}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                              chosen === 'UDP' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                            }`}
                          >
                            UDP
                          </button>
                        </div>

                        {chosen && (
                          <div className="text-[11px] text-slate-300 p-2 bg-slate-900 rounded-lg">
                            <span className="font-semibold text-slate-400">Rationale: </span>
                            {sc.rationale}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 6. TCP STATE MACHINE & TEARDOWN */}
          {moduleBTab === 'states' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-400" />
                    RFC 793 TCP State Machine & Active Close Arranger
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Arrange the 5 sequential states for a client executing an active close teardown (FIN exchange).
                  </p>
                </div>
                <button
                  onClick={() => {
                    const res = validateTcpCloseSequence(stateSequence);
                    setStateSeqFeedback(res);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition"
                >
                  Verify State Sequence
                </button>
              </div>

              {/* State Chips Arranger */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-400">Available States:</span>
                  {UDL_TCP_STATES.map(st => (
                    <button
                      key={st.id}
                      onClick={() => setStateSequence(prev => [...prev, st.name])}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono transition"
                    >
                      + {st.name}
                    </button>
                  ))}
                  <button
                    onClick={() => setStateSequence(['ESTABLISHED'])}
                    className="px-2.5 py-1 bg-red-950 text-red-300 hover:bg-red-900 rounded text-xs transition"
                  >
                    Reset Sequence
                  </button>
                </div>

                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-xs font-semibold text-slate-400 mb-2">Your Active Close Path:</div>
                  <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
                    {stateSequence.map((st, i) => (
                      <React.Fragment key={i}>
                        <span className="px-3 py-1.5 bg-indigo-950 border border-indigo-500/50 rounded-lg text-indigo-200 font-bold">
                          {i + 1}. {st}
                        </span>
                        {i < stateSequence.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {stateSeqFeedback && (
                  <div className={`p-3 rounded-lg text-xs ${
                    stateSeqFeedback.isCorrect ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-200' : 'bg-red-950 border border-red-500/40 text-red-200'
                  }`}>
                    {stateSeqFeedback.feedback}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 7. TCP HEADER PUZZLE */}
          {moduleBTab === 'header' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-cyan-400" />
                    Interactive 32-Bit TCP Header Assembly Puzzle
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Place each TCP header field into its correct bit offset in the standard 20-byte base header.
                  </p>
                </div>
                <button
                  onClick={handleHeaderPuzzleCheck}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition shadow"
                >
                  Verify & Persist Score
                </button>
              </div>

              {/* 32-bit Header Grid */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
                {/* Row 1: Source & Dest Port */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-500 mb-1">Bits 0-15 (16 bits)</div>
                    <select
                      value={headerPlacements['pos_0_15'] || ''}
                      onChange={e => setHeaderPlacements(p => ({ ...p, 'pos_0_15': e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-xs text-white"
                    >
                      <option value="">Select Field...</option>
                      <option value="Source Port (16 bits)">Source Port (16 bits)</option>
                      <option value="Destination Port (16 bits)">Destination Port (16 bits)</option>
                      <option value="Window Size (16 bits)">Window Size (16 bits)</option>
                    </select>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-500 mb-1">Bits 16-31 (16 bits)</div>
                    <select
                      value={headerPlacements['pos_16_31'] || ''}
                      onChange={e => setHeaderPlacements(p => ({ ...p, 'pos_16_31': e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-xs text-white"
                    >
                      <option value="">Select Field...</option>
                      <option value="Source Port (16 bits)">Source Port (16 bits)</option>
                      <option value="Destination Port (16 bits)">Destination Port (16 bits)</option>
                      <option value="Checksum (16 bits)">Checksum (16 bits)</option>
                    </select>
                  </div>
                </div>

                {/* Row 2: Sequence Number */}
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 mb-1">Bits 32-63 (32 bits)</div>
                  <select
                    value={headerPlacements['pos_32_63'] || ''}
                    onChange={e => setHeaderPlacements(p => ({ ...p, 'pos_32_63': e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-xs text-white"
                  >
                    <option value="">Select Field...</option>
                    <option value="Sequence Number (32 bits)">Sequence Number (32 bits)</option>
                    <option value="Acknowledgement Number (32 bits)">Acknowledgement Number (32 bits)</option>
                  </select>
                </div>

                {/* Row 3: Acknowledgement Number */}
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 mb-1">Bits 64-95 (32 bits)</div>
                  <select
                    value={headerPlacements['pos_64_95'] || ''}
                    onChange={e => setHeaderPlacements(p => ({ ...p, 'pos_64_95': e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-xs text-white"
                  >
                    <option value="">Select Field...</option>
                    <option value="Sequence Number (32 bits)">Sequence Number (32 bits)</option>
                    <option value="Acknowledgement Number (32 bits)">Acknowledgement Number (32 bits)</option>
                  </select>
                </div>
              </div>

              {headerScore && (
                <div className="p-3 bg-indigo-950 border border-indigo-500/40 rounded-xl text-xs text-indigo-200">
                  Score: {headerScore.correctCount}/{headerScore.total} fields placed accurately ({headerScore.scorePercentage}%).
                </div>
              )}
            </div>
          )}

          {/* 8. PACKET CAPTURE ANALYSIS */}
          {moduleBTab === 'wireshark' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    Guided Packet Capture Analysis (Educational Trace)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Inspect 8 realistic frames captured between client (192.168.10.45) and web server (10.0.0.1:443).
                  </p>
                </div>
                <button
                  onClick={handleWiresharkSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition"
                >
                  Submit Packet Analysis
                </button>
              </div>

              {/* Wireshark Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left font-mono">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">No.</th>
                      <th className="p-2.5">Time</th>
                      <th className="p-2.5">Source</th>
                      <th className="p-2.5">Destination</th>
                      <th className="p-2.5">Flags</th>
                      <th className="p-2.5">Seq / Ack</th>
                      <th className="p-2.5">Len</th>
                      <th className="p-2.5 font-sans">Pedagogical Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {UDL_EDUCATIONAL_PACKET_TRACE.map(f => (
                      <tr key={f.frameNumber} className="hover:bg-slate-950/60">
                        <td className="p-2.5 font-bold text-slate-400">{f.frameNumber}</td>
                        <td className="p-2.5 text-slate-500">{f.timeOffset}</td>
                        <td className="p-2.5 text-blue-300">{f.sourceIp}:{f.sourcePort}</td>
                        <td className="p-2.5 text-emerald-300">{f.destinationIp}:{f.destinationPort}</td>
                        <td className="p-2.5">
                          <span className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-amber-300">
                            {f.flags.join(', ')}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-300">Seq={f.seqNumber} Ack={f.ackNumber}</td>
                        <td className="p-2.5 font-bold text-white">{f.lengthBytes}B</td>
                        <td className="p-2.5 font-sans text-slate-400 text-[11px]">{f.pedagogicalNotes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 9. TCP TROUBLESHOOTING */}
          {moduleBTab === 'troubleshoot' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-400" />
                    Scenario-Based TCP Troubleshooting Lab
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Diagnose real enterprise networking failures and propose root-cause remedies.
                  </p>
                </div>
              </div>

              {/* Scenario Selector */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {UDL_TCP_TROUBLESHOOTING_SCENARIOS.map(sc => (
                  <button
                    key={sc.id}
                    onClick={() => {
                      setSelectedTsId(sc.id);
                      setTsDiagnosis({ rootCause: '', mechanism: '', solution: '' });
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                      selectedTsId === sc.id
                        ? 'bg-red-600 text-white shadow'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {sc.title.split(':')[0]}
                  </button>
                ))}
              </div>

              {/* Active Scenario Card */}
              {(() => {
                const sc = UDL_TCP_TROUBLESHOOTING_SCENARIOS.find(s => s.id === selectedTsId);
                if (!sc) return null;
                return (
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                    <h4 className="font-bold text-white text-sm">{sc.title}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <span className="font-bold text-amber-400 block mb-1">Symptom:</span>
                        <p className="text-slate-300">{sc.symptom}</p>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 font-mono">
                        <span className="font-bold text-blue-400 block mb-1 font-sans">Trace Observation:</span>
                        <p className="text-slate-300">{sc.packetTraceObservation}</p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Your Root Cause Diagnosis:</label>
                        <input
                          type="text"
                          value={tsDiagnosis.rootCause}
                          onChange={e => setTsDiagnosis(p => ({ ...p, rootCause: e.target.value }))}
                          placeholder="e.g. Inactive listening daemon on port 8080..."
                          className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Proposed Resolution:</label>
                        <input
                          type="text"
                          value={tsDiagnosis.solution}
                          onChange={e => setTsDiagnosis(p => ({ ...p, solution: e.target.value }))}
                          placeholder="e.g. Start web daemon and check with netstat -tlpn..."
                          className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-xs text-white"
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={handleTroubleshootingSubmit}
                          disabled={isSubmitting || !tsDiagnosis.rootCause.trim()}
                          className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition disabled:opacity-50"
                        >
                          Submit Troubleshooting Case to Faculty
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* RECENT SUBMISSIONS LOG DRAWER */}
      {submissions.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Your Real Persistent UDL Submissions & Scores ({submissions.length})
            </h3>
            <span className="text-xs text-slate-400">Authenticated Firestore Collection: udl_submissions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Activity</th>
                  <th className="p-3">Modality</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Faculty / Auto Feedback</th>
                  <th className="p-3">Submitted At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {submissions.map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-950/40">
                    <td className="p-3 font-semibold text-white">{sub.activityId}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded text-[10px]">
                        {sub.modality}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-400">
                      {sub.autoScore} / {sub.maxScore}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sub.isEvaluated ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {sub.isEvaluated ? 'Graded' : 'Pending Review'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300 max-w-xs truncate">
                      {sub.facultyFeedback || '—'}
                    </td>
                    <td className="p-3 text-slate-500 font-mono text-[11px]">
                      {new Date(sub.submittedAt).toLocaleDateString()} {new Date(sub.submittedAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 1-PAGE SUBNETTING CHEAT SHEET MODAL */}
      {showCheatSheet && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-indigo-900/60 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-indigo-400" />
                1-Page Subnetting Reference Sheet (Printable Cheat Sheet)
              </h3>
              <button
                onClick={() => setShowCheatSheet(false)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs space-y-3">
              <div className="text-amber-400 font-bold font-sans">CIDR /24 to /30 Quick Reference</div>
              <table className="w-full text-left text-[11px]">
                <thead className="text-slate-500 border-b border-slate-800">
                  <tr>
                    <th className="py-1">Prefix</th>
                    <th className="py-1">Subnet Mask</th>
                    <th className="py-1">Magic (Block Size)</th>
                    <th className="py-1">Usable Hosts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300">
                  <tr><td>/24</td><td>255.255.255.0</td><td>256</td><td>254</td></tr>
                  <tr><td>/25</td><td>255.255.255.128</td><td>128</td><td>126</td></tr>
                  <tr><td>/26</td><td>255.255.255.192</td><td>64</td><td>62</td></tr>
                  <tr><td>/27</td><td>255.255.255.224</td><td>32</td><td>30</td></tr>
                  <tr><td>/28</td><td>255.255.255.240</td><td>16</td><td>14</td></tr>
                  <tr><td>/29</td><td>255.255.255.248</td><td>8</td><td>6</td></tr>
                  <tr><td>/30</td><td>255.255.255.252</td><td>4</td><td>2 (Point-to-Point)</td></tr>
                </tbody>
              </table>

              <div className="pt-2 text-indigo-300 font-sans text-xs">
                <strong>Golden Rules:</strong>
                <ul className="list-disc list-inside text-slate-400 mt-1 space-y-1">
                  <li>Borrowed bits n implies 2^n subnets.</li>
                  <li>Remaining host bits h implies 2^h - 2 usable host addresses.</li>
                  <li>Magic number increment = 256 - (last octet mask).</li>
                  <li>First IP is Network ID; Last IP is Broadcast Address. Neither can be assigned to a host NIC.</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Print Reference Sheet</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default UdlLearningView;
