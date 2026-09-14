import React, { useState, useEffect } from 'react';
import { LiveClassroomState, NavTab, UserRole } from '../../types';
import { INITIAL_LIVE_CLASSROOM } from '../../data/networkCourse';
import { useAuth } from '../../context/AuthContext';
import { doc, onSnapshot, setDoc, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  Radio, 
  Users, 
  CheckCircle2, 
  HelpCircle, 
  Eye, 
  Play, 
  RotateCcw, 
  ArrowRight,
  MessageSquare,
  Sparkles,
  Award
} from 'lucide-react';

interface LiveClassroomViewProps {
  userRole: UserRole;
  onNavigate: (tab: NavTab) => void;
}

const SAMPLE_QUESTIONS = [
  {
    question: 'Which layer of the OSI model is responsible for routing and logical addressing?',
    explanation: 'Layer 3 (Network Layer) handles logical IP addressing and path determination across multi-hop router topologies. The Data Link layer only deals with hop-to-hop framing across local broadcast domains.',
    options: [
      { id: 'opt-a', label: 'A', text: 'Data Link Layer', votes: 0, percentage: 0, isCorrect: false },
      { id: 'opt-b', label: 'B', text: 'Transport Layer', votes: 0, percentage: 0, isCorrect: false },
      { id: 'opt-c', label: 'C', text: 'Network Layer', votes: 0, percentage: 0, isCorrect: true },
      { id: 'opt-d', label: 'D', text: 'Session Layer', votes: 0, percentage: 0, isCorrect: false },
    ],
  },
  {
    question: 'What is the primary purpose of the SYN flag during the TCP 3-Way Handshake?',
    explanation: 'The SYN (Synchronize Sequence Numbers) flag begins the TCP 3-way connection handshake so client and server can negotiate starting sequence numbers.',
    options: [
      { id: 'opt-a', label: 'A', text: 'To terminate the connection gracefully', votes: 0, percentage: 0, isCorrect: false },
      { id: 'opt-b', label: 'B', text: 'To synchronize initial sequence numbers', votes: 0, percentage: 0, isCorrect: true },
      { id: 'opt-c', label: 'C', text: 'To request expedited high-priority queuing', votes: 0, percentage: 0, isCorrect: false },
      { id: 'opt-d', label: 'D', text: 'To immediately reset a faulted socket', votes: 0, percentage: 0, isCorrect: false },
    ],
  },
  {
    question: 'In IPv4 CIDR notation, how many usable host addresses are available in a /28 subnet?',
    explanation: 'A /28 subnet has 32 - 28 = 4 host bits. 2^4 = 16 total addresses minus 2 (network ID and broadcast) equals 14 usable host IPs.',
    options: [
      { id: 'opt-a', label: 'A', text: '16 usable hosts', votes: 0, percentage: 0, isCorrect: false },
      { id: 'opt-b', label: 'B', text: '14 usable hosts', votes: 0, percentage: 0, isCorrect: true },
      { id: 'opt-c', label: 'C', text: '30 usable hosts', votes: 0, percentage: 0, isCorrect: false },
      { id: 'opt-d', label: 'D', text: '12 usable hosts', votes: 0, percentage: 0, isCorrect: false },
    ],
  },
];

export const LiveClassroomView: React.FC<LiveClassroomViewProps> = ({
  userRole,
  onNavigate,
}) => {
  const { currentUser, userProfile } = useAuth();
  const displayName = userProfile?.displayName || userProfile?.name || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Student';

  const [liveState, setLiveState] = useState<LiveClassroomState>(INITIAL_LIVE_CLASSROOM);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [explanation, setExplanation] = useState<string>(SAMPLE_QUESTIONS[0].explanation);
  const [isFirebaseSynced, setIsFirebaseSynced] = useState<boolean>(false);
  const [connectedStudentsCount, setConnectedStudentsCount] = useState<number>(1);

  // 1. Listen to real-time student presence / count
  useEffect(() => {
    try {
      const studentsRef = collection(db, 'students');
      const unsubscribeStudents = onSnapshot(studentsRef, (snapshot) => {
        if (!snapshot.empty) {
          let countOnline = 0;
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.isOnline) countOnline++;
          });
          setConnectedStudentsCount(Math.max(countOnline, 1));
        }
      }, (err) => console.warn('LiveClassroom: students count warning', err));

      return () => unsubscribeStudents();
    } catch (e) {
      console.warn('LiveClassroom: error attaching students listener', e);
    }
  }, []);

  // 2. Connect to live Firestore poll document
  useEffect(() => {
    try {
      const pollDocRef = doc(db, 'live_classroom', 'current_poll');
      const unsubscribePoll = onSnapshot(pollDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setLiveState((prev) => ({
            ...prev,
            isActive: data.isActive ?? true,
            connectedCount: data.connectedCount ?? connectedStudentsCount,
            totalEnrolled: data.totalEnrolled ?? 66,
            currentQuestion: data.currentQuestion || SAMPLE_QUESTIONS[0].question,
            options: data.options || SAMPLE_QUESTIONS[0].options,
            isAnswerRevealed: data.isAnswerRevealed ?? false,
          }));
          if (data.questionIndex !== undefined) {
            setQuestionIndex(data.questionIndex);
          }
          if (data.explanation) {
            setExplanation(data.explanation);
          }
          setIsFirebaseSynced(true);
        } else {
          // Initialize document in Firestore if not yet seeded
          const initialData = {
            isActive: true,
            connectedCount: 66,
            totalEnrolled: 66,
            currentQuestion: SAMPLE_QUESTIONS[0].question,
            explanation: SAMPLE_QUESTIONS[0].explanation,
            options: SAMPLE_QUESTIONS[0].options,
            isAnswerRevealed: false,
            questionIndex: 0,
            updatedAt: new Date().toISOString(),
          };
          setDoc(pollDocRef, initialData).catch((err) => {
            console.warn('Could not seed live_classroom poll:', err);
          });
        }
      }, (err) => {
        console.warn('LiveClassroom: Firestore poll listener warning:', err);
      });

      return () => unsubscribePoll();
    } catch (e) {
      console.warn('LiveClassroom: Firestore init error:', e);
    }
  }, []);

  // Track vote per question
  useEffect(() => {
    const savedVote = localStorage.getItem(`live_poll_vote_q_${questionIndex}`);
    if (savedVote) {
      setSelectedOptionId(savedVote);
      setHasVoted(true);
    } else {
      setSelectedOptionId(null);
      setHasVoted(false);
    }
  }, [questionIndex]);

  const handleVote = async (optionId: string) => {
    if (hasVoted) return;
    setSelectedOptionId(optionId);
    setHasVoted(true);
    try {
      localStorage.setItem(`live_poll_vote_q_${questionIndex}`, optionId);
    } catch (e) {}

    // Calculate updated votes & percentages
    const updatedOptions = liveState.options.map((opt) => {
      if (opt.id === optionId) {
        return { ...opt, votes: (opt.votes || 0) + 1 };
      }
      return opt;
    });
    const totalVotes = updatedOptions.reduce((acc, curr) => acc + curr.votes, 0);
    const withPercentages = updatedOptions.map((opt) => ({
      ...opt,
      percentage: totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0,
    }));

    // Optimistic UI update
    setLiveState((prev) => ({
      ...prev,
      options: withPercentages,
      userVotedOptionId: optionId,
    }));

    // Sync to Firestore in real time
    try {
      const pollDocRef = doc(db, 'live_classroom', 'current_poll');
      await setDoc(pollDocRef, {
        options: withPercentages,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (e) {
      console.warn('Failed to sync vote to Firestore:', e);
    }
  };

  const handleRevealAnswer = async () => {
    const nextRevealed = !liveState.isAnswerRevealed;
    setLiveState((prev) => ({ ...prev, isAnswerRevealed: nextRevealed }));

    try {
      const pollDocRef = doc(db, 'live_classroom', 'current_poll');
      await setDoc(pollDocRef, {
        isAnswerRevealed: nextRevealed,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (e) {
      console.warn('Failed to update answer reveal state:', e);
    }
  };

  const handleNextQuestion = async () => {
    const nextIdx = (questionIndex + 1) % SAMPLE_QUESTIONS.length;
    const nextQ = SAMPLE_QUESTIONS[nextIdx];
    
    setQuestionIndex(nextIdx);
    setExplanation(nextQ.explanation);
    setSelectedOptionId(null);
    setHasVoted(false);

    const nextState = {
      isActive: true,
      connectedCount: Math.max(connectedStudentsCount, 1),
      totalEnrolled: 66,
      currentQuestion: nextQ.question,
      explanation: nextQ.explanation,
      options: nextQ.options,
      isAnswerRevealed: false,
      questionIndex: nextIdx,
      updatedAt: new Date().toISOString(),
    };

    setLiveState((prev) => ({
      ...prev,
      currentQuestion: nextQ.question,
      options: nextQ.options,
      isAnswerRevealed: false,
    }));

    try {
      const pollDocRef = doc(db, 'live_classroom', 'current_poll');
      await setDoc(pollDocRef, nextState, { merge: true });
    } catch (e) {
      console.warn('Failed to advance question in Firestore:', e);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      
      {/* 1. Header with Live Status Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-rose-600 dark:text-rose-400 mb-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="uppercase tracking-wider font-mono font-bold">Interactive Live Lecture Session</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Live Classroom: Computer Networks
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Instructor: Dr. B. Snyder • Section: All Cohorts
          </p>
        </div>

        {/* Real-Time Firebase Connected Badges */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-mono text-[11px]">{isFirebaseSynced ? 'REAL-TIME FIREBASE DB' : 'CONNECTING...'}</span>
          </div>
          <div className="flex items-center space-x-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-700 dark:text-slate-300 text-xs font-semibold">
            <Users className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span><strong className="text-slate-900 dark:text-white font-mono">{connectedStudentsCount}</strong> / 66 Online</span>
          </div>
        </div>
      </div>

      {/* 2. Main Live Poll Card */}
      <div className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
        
        {/* Top Poll Info */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
              Live In-Class Question #{questionIndex + 1}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Real-time response aggregation</span>
          </div>

          <span className="text-xs font-semibold font-mono text-slate-500 dark:text-slate-400">
            {liveState.options.reduce((sum, o) => sum + (o.votes || 0), 0)} responses recorded
          </span>
        </div>

        {/* Question Heading */}
        <div className="my-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
            {liveState.currentQuestion}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            Select your answer below. Once submitted, your vote is recorded anonymously into the live classroom histogram in Firestore.
          </p>
        </div>

        {/* Live Options & Response Bar Chart */}
        <div className="space-y-3.5">
          {liveState.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            const isCorrect = opt.isCorrect;
            const showCorrect = liveState.isAnswerRevealed;

            return (
              <div
                key={opt.id}
                id={`live-option-${opt.id}`}
                onClick={() => handleVote(opt.id)}
                className={`relative p-4 rounded-xl border transition-all transform-gpu cursor-pointer overflow-hidden ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 ring-2 ring-blue-100 dark:ring-blue-900/50'
                    : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                }`}
              >
                {/* Background Percentage Fill Bar */}
                <div
                  className={`absolute inset-y-0 left-0 transition-all transform-gpu duration-700 ${
                    showCorrect && isCorrect
                      ? 'bg-emerald-100/70 dark:bg-emerald-900/40'
                      : showCorrect && isSelected && !isCorrect
                      ? 'bg-rose-100/70 dark:bg-rose-900/40'
                      : 'bg-blue-100/50 dark:bg-blue-900/30'
                  }`}
                  style={{ width: `${opt.percentage}%` }}
                />

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-slate-800 dark:text-slate-200 shrink-0 shadow-xs font-mono">
                      {opt.label}
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {opt.text}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    {showCorrect && isCorrect && (
                      <span className="flex items-center space-x-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Correct</span>
                      </span>
                    )}

                    <div className="text-right">
                      <span className="font-bold text-slate-900 dark:text-white text-sm font-mono">{opt.percentage}%</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-1.5 font-mono">({opt.votes} votes)</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Student Feedback Status */}
        {hasVoted && !liveState.isAnswerRevealed && (
          <div className="mt-5 p-3.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Your response was synced to Firebase. Waiting for instructor explanation...</span>
            </div>
            <span className="font-semibold text-blue-700 dark:text-blue-400 font-mono">{displayName}: Active</span>
          </div>
        )}

        {/* Revealed Explanation Banner */}
        {liveState.isAnswerRevealed && (
          <div className="mt-5 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-950 dark:text-emerald-200 animate-in fade-in">
            <div className="flex items-center space-x-2 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Explanation:</span>
            </div>
            <p className="text-xs text-emerald-900 dark:text-emerald-300 mt-1 leading-relaxed">
              {explanation}
            </p>
          </div>
        )}

        {/* Controls Section */}
        <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Instructor Controls & Session Status:
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="reveal-live-answer-btn"
              onClick={handleRevealAnswer}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                liveState.isAnswerRevealed
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{liveState.isAnswerRevealed ? 'Hide Answer' : 'Reveal Answer to Class'}</span>
            </button>

            <button
              id="next-live-question-btn"
              onClick={handleNextQuestion}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <span>Next Question</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
