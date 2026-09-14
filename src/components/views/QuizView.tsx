import React, { useState, useMemo } from 'react';
import { soundFx } from '../../utils/audio';
import { ALL_MODULE_QUIZ_QUESTIONS } from '../../data/courseContent';
import { SplitMcqPlayer, SplitMcqQuestionData } from '../quiz/SplitMcqPlayer';
import { Bolt, Calculator, Layers, Trophy, Sparkles, CheckCircle2 } from 'lucide-react';
import { CrescoMascot } from '../brand/CrescoMascot';

interface QuizViewProps {
  onStartBlitz?: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({ onStartBlitz }) => {
  const [activeTab, setActiveTab] = useState<'mcq-arena' | 'cidr-drill'>('mcq-arena');
  const [cidrIp, setCidrIp] = useState('192.168.10.0/26');
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);
  const [sessionScore, setSessionScore] = useState<{ score: number; total: number; accuracy: number } | null>(null);

  // High-yield RFC quiz questions formatted for SplitMcqPlayer
  const arenaQuestions: SplitMcqQuestionData[] = useMemo(() => {
    return ALL_MODULE_QUIZ_QUESTIONS.map((q, idx) => ({
      id: q.id || `quiz-arena-${idx}`,
      unitId: q.unitId,
      unitTitle: q.unitTitle,
      topic: q.domain,
      domain: q.unitTitle,
      difficulty: (idx % 3 === 0 ? 'Medium' : idx % 3 === 1 ? 'Hard' : 'Easy') as 'Easy' | 'Medium' | 'Hard',
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      helpNotes: [
        `Curriculum Area: ${q.unitTitle}`,
        `Topic: ${q.domain}`,
        'Verify protocol headers, byte boundaries, and state transitions.',
        'Review standard RFC definitions and end-to-end transport invariants.'
      ]
    }));
  }, []);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 py-6 animate-in fade-in space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#101422] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <CrescoMascot
            pose={sessionCompleted ? (sessionScore && sessionScore.accuracy >= 80 ? 'exam-excellent' : 'exam-done') : 'thinking'}
            size="lg"
            animation={sessionCompleted ? 'bounce' : 'float'}
            withGlow={sessionCompleted && sessionScore !== null && sessionScore.accuracy >= 80}
          />
          <div>
            <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              HIGH-YIELD ASSESSMENT ARENA
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              RFC Protocol & Practice Quiz
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Master RFC header decodes, CIDR bitwise arithmetic, and state-space transport layer transitions.
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 self-start md:self-auto">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('mcq-arena');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'mcq-arena'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>MCQ Problem Solver</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('cidr-drill');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'cidr-drill'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>CIDR Subnet Drill</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: SPLIT-PANE MCQ ARENA */}
      {activeTab === 'mcq-arena' && (
        <div className="space-y-6">
          {!sessionCompleted ? (
            <SplitMcqPlayer
              questions={arenaQuestions}
              onComplete={(results) => {
                setSessionScore(results);
                setSessionCompleted(true);
              }}
            />
          ) : (
            <div className="bg-white dark:bg-[#101422] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center shadow-lg space-y-6 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center border border-amber-200 dark:border-amber-500/20">
                <Trophy className="w-10 h-10" />
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" /> Quiz Session Completed
              </span>

              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {sessionScore && sessionScore.accuracy >= 70 ? 'Outstanding Work!' : 'Good Effort! Keep Practicing'}
              </h2>

              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                You scored <strong className="text-slate-900 dark:text-white">{sessionScore?.score}</strong> out of <strong className="text-slate-900 dark:text-white">{sessionScore?.total}</strong> questions ({sessionScore?.accuracy}% accuracy).
              </p>

              <div className="pt-2">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setSessionCompleted(false);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  Restart Quiz Session
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: CIDR SUBNET DRILL */}
      {activeTab === 'cidr-drill' && (
        <div className="bg-white dark:bg-[#101422] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800/80 space-y-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
            <Layers className="w-5 h-5" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Interactive CIDR Subnet Drill</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Calculate the usable host range and network mask for prefix: <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{cidrIp}</span>
          </p>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono space-y-2.5">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Subnet Mask:</span>
              <span className="font-bold text-slate-900 dark:text-white">255.255.255.192</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Wildcard Mask:</span>
              <span className="font-bold text-slate-900 dark:text-white">0.0.0.63</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Total Addresses:</span>
              <span className="font-bold text-slate-900 dark:text-white">64 (2^(32-26))</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Usable Hosts:</span>
              <span className="font-bold text-cyan-600 dark:text-cyan-400">62 hosts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Host Range:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">192.168.10.1 - 192.168.10.62</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => {
                soundFx.playClick();
                setCidrIp('10.0.0.0/28');
              }}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Try /28
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setCidrIp('172.16.0.0/22');
              }}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Try /22
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setCidrIp('192.168.10.0/26');
              }}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Reset to /26
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
