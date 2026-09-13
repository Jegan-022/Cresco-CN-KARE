import React, { useState } from 'react';
import { ByteBot } from '../character/ByteBot';
import { soundFx } from '../../utils/soundEffects';
import { triggerSubtleSectionConfetti } from '../../utils/confetti';
import { 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  ArrowRight,
  RotateCcw,
  Check,
  Flame,
  HelpCircle
} from 'lucide-react';

interface SmartReviewViewProps {
  onBack?: () => void;
  onSelectTopic?: (topicId: string) => void;
}

interface ReviewTopic {
  id: string;
  name: string;
  category: string;
  statusText: string;
  statusTier: 'needs-practice' | 'almost-mastered' | 'mastered';
  reason: string;
  recommendedAction: string;
  score: number;
}

export const SmartReviewView: React.FC<SmartReviewViewProps> = ({
  onBack,
  onSelectTopic,
}) => {
  const [reviewActive, setReviewActive] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [reviewCompleted, setReviewCompleted] = useState(false);

  const topics: ReviewTopic[] = [
    {
      id: 'subnetting',
      name: 'Subnetting',
      category: 'Unit III: Network Layer',
      statusText: 'Needs practice',
      statusTier: 'needs-practice',
      score: 42,
      reason: '3 incorrect calculations on prefix mask (/27, /29) in recent drills.',
      recommendedAction: 'Focus on remaining host bits (2^h - 2) and CIDR prefixes.',
    },
    {
      id: 'tcp-udp',
      name: 'TCP vs UDP',
      category: 'Unit IV: Transport Layer',
      statusText: 'Almost mastered',
      statusTier: 'almost-mastered',
      score: 82,
      reason: 'Solid on 3-way handshake; review sequence numbering and receiver windows.',
      recommendedAction: 'Quick refresher on sliding window flow control.',
    },
    {
      id: 'eap-8021x',
      name: 'EAP / IEEE 802.1X',
      category: 'Unit III: Security',
      statusText: 'Needs practice',
      statusTier: 'needs-practice',
      score: 38,
      reason: 'Authenticator vs Authentication Server roles mixed up in recent quizzes.',
      recommendedAction: 'Clarify Supplicant ➔ Authenticator ➔ RADIUS Server flow.',
    },
    {
      id: 'dns',
      name: 'DNS',
      category: 'Unit V: Application Layer',
      statusText: 'Mastered',
      statusTier: 'mastered',
      score: 96,
      reason: 'High accuracy on root & TLD recursion. Spaced repetition retention verified.',
      recommendedAction: 'Retained in long-term memory.',
    },
  ];

  const reviewQuestions = [
    {
      topic: 'Subnetting & CIDR',
      question: 'How many usable host addresses are available in a /28 subnet prefix?',
      options: ['14', '16', '30', '32'],
      correctIndex: 0,
      explanation: 'In /28, remaining host bits = 32 - 28 = 4. Total IPs = 2^4 = 16. Usable hosts = 16 - 2 = 14 (network & broadcast excluded).',
    },
    {
      topic: 'EAP / 802.1X',
      question: 'In IEEE 802.1X port-based access control, what is the role of the network switch?',
      options: ['Supplicant', 'Authenticator', 'Authentication Server', 'Certificate Authority'],
      correctIndex: 1,
      explanation: 'The switch/AP acts as the Authenticator, relaying EAP messages between the Supplicant client and the RADIUS server.',
    },
  ];

  const handleStartReview = () => {
    soundFx.playCorrect();
    setReviewActive(true);
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setReviewCompleted(false);
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    soundFx.playClick();
    setSelectedAnswer(idx);
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;
    setIsAnswered(true);
    const q = reviewQuestions[currentQuizIndex];
    if (selectedAnswer === q.correctIndex) {
      soundFx.playCorrect();
    } else {
      soundFx.playIncorrect();
    }
  };

  const handleNextQuestion = () => {
    if (currentQuizIndex < reviewQuestions.length - 1) {
      soundFx.playClick();
      setCurrentQuizIndex(currentQuizIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      soundFx.playLevelUp();
      triggerSubtleSectionConfetti();
      setReviewCompleted(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-16">
      
      {/* 1. Header */}
      <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-black text-[#7957C7] uppercase tracking-widest">
            <BookOpen size={14} />
            <span>ADAPTIVE SPACED REPETITION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#172033] dark:text-[#F9FAFB] tracking-tight mt-1">
            SMART REVIEW
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#64748B] dark:text-slate-400 mt-0.5">
            "These topics need another connection."
          </p>
        </div>

        {!reviewActive && (
          <button
            onClick={handleStartReview}
            className="px-6 py-3 rounded-2xl bg-[#3157D5] hover:bg-[#2442B0] text-white font-black text-xs tracking-wider shadow-[0_4px_0_0_#2442B0] active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto"
          >
            <Sparkles size={16} />
            <span>START REVIEW</span>
          </button>
        )}
      </div>

      {/* 2. Interactive Review Mode or Needs Practice Diagnostic List */}
      {!reviewActive ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-[#172033] dark:text-[#F9FAFB]">
              NEEDS PRACTICE
            </h2>
            <span className="text-xs text-[#64748B] dark:text-slate-400 font-medium">
              Ranked by error frequency & spaced decay
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topics.map((t) => {
              const isNeedsPractice = t.statusTier === 'needs-practice';
              const isAlmostMastered = t.statusTier === 'almost-mastered';

              return (
                <div
                  key={t.id}
                  className="rounded-2xl bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold uppercase text-[#64748B] dark:text-slate-400">
                        {t.category}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black font-mono ${
                        isNeedsPractice
                          ? 'bg-[#D95C5C]/15 text-[#D95C5C]'
                          : isAlmostMastered
                          ? 'bg-[#F0A63A]/15 text-[#B45309] dark:text-[#F0A63A]'
                          : 'bg-[#35A86B]/15 text-[#35A86B]'
                      }`}>
                        {t.statusText}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base text-[#172033] dark:text-[#F9FAFB]">
                      {t.name}
                    </h3>
                    <p className="text-xs text-[#475569] dark:text-[#D1D5DB] font-medium mt-1 leading-relaxed">
                      {t.reason}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#EFECE6] dark:border-slate-800 text-[11px] text-[#64748B] dark:text-slate-400 font-medium flex items-center justify-between">
                    <span className="italic">{t.recommendedAction}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Byte Bot Guidance Panel */}
          <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-center">
            <ByteBot
              pose="explaining"
              size="lg"
              showSpeech={true}
              speechText="Smart review targets concepts you hesitated on earlier. 5 minutes here prevents network amnesia!"
            />
          </div>
        </div>
      ) : reviewCompleted ? (
        /* Review Complete Celebration */
        <div className="bg-white dark:bg-[#1F2937] border-2 border-[#35A86B] rounded-3xl p-8 text-center space-y-6 animate-scaleUp">
          <ByteBot pose="celebrating" size="xl" className="justify-center" />
          <div>
            <span className="text-xs font-mono font-black text-[#35A86B] uppercase tracking-widest">
              SMART REVIEW COMPLETE
            </span>
            <h2 className="text-3xl font-black text-[#172033] dark:text-[#F9FAFB] mt-1">
              Weak Nodes Strengthened!
            </h2>
            <p className="text-sm text-[#64748B] dark:text-slate-400 max-w-sm mx-auto mt-2 font-medium">
              Subnetting and 802.1X mastery ratings improved. +25 Bonus XP awarded!
            </p>
          </div>

          <button
            onClick={() => setReviewActive(false)}
            className="px-8 py-3.5 rounded-2xl bg-[#3157D5] hover:bg-[#2442B0] text-white font-black text-xs tracking-wider shadow-[0_4px_0_0_#2442B0] cursor-pointer"
          >
            BACK TO REVIEW DASHBOARD
          </button>
        </div>
      ) : (
        /* Active Micro-Quiz */
        <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#64748B]">
            <span className="text-[#3157D5] dark:text-[#6D8CFF] uppercase">
              {reviewQuestions[currentQuizIndex].topic}
            </span>
            <span>Question {currentQuizIndex + 1} of {reviewQuestions.length}</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-[#172033] dark:text-[#F9FAFB]">
            {reviewQuestions[currentQuizIndex].question}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {reviewQuestions[currentQuizIndex].options.map((opt, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = isAnswered && idx === reviewQuestions[currentQuizIndex].correctIndex;
              const isWrong = isAnswered && isSelected && !isCorrect;

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-4 rounded-2xl border-2 text-left font-bold text-sm transition-all cursor-pointer flex items-center justify-between ${
                    isCorrect
                      ? 'bg-[#35A86B]/15 border-[#35A86B] text-[#172033] dark:text-white shadow-xs'
                      : isWrong
                      ? 'bg-[#F0A63A]/15 border-[#F0A63A] text-[#172033] dark:text-white'
                      : isSelected
                      ? 'bg-white dark:bg-[#1F2937] border-[#3157D5] shadow-xs'
                      : 'bg-[#F7F5F0] dark:bg-[#111827] border-[#E5E0D8] dark:border-slate-800 hover:border-slate-400'
                  }`}
                >
                  <span>{opt}</span>
                  {isCorrect && <CheckCircle2 size={18} className="text-[#35A86B]" />}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="p-4 rounded-2xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-800 text-xs font-medium text-[#475569] dark:text-[#D1D5DB] leading-relaxed animate-fadeIn">
              <span className="font-bold text-[#172033] dark:text-white block mb-0.5">Explanation:</span>
              {reviewQuestions[currentQuizIndex].explanation}
            </div>
          )}

          <div className="pt-4 flex items-center justify-between">
            <button
              onClick={() => setReviewActive(false)}
              className="text-xs font-bold text-[#64748B] hover:text-[#172033]"
            >
              Cancel Review
            </button>

            {!isAnswered ? (
              <button
                onClick={handleCheckAnswer}
                disabled={selectedAnswer === null}
                className={`px-6 py-3 rounded-2xl font-black text-xs tracking-wider transition-all cursor-pointer ${
                  selectedAnswer !== null
                    ? 'bg-[#3157D5] hover:bg-[#2442B0] text-white shadow-[0_4px_0_0_#2442B0] active:translate-y-1 active:shadow-none'
                    : 'bg-[#E5E0D8] dark:bg-slate-800 text-[#94A3B8] cursor-not-allowed'
                }`}
              >
                CHECK ANSWER
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-6 py-3 rounded-2xl bg-[#35A86B] hover:bg-[#2F855A] text-white font-black text-xs tracking-wider shadow-[0_4px_0_0_#276749] cursor-pointer flex items-center gap-1.5"
              >
                <span>CONTINUE</span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
