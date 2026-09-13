import React, { useState, useEffect, useMemo } from 'react';
import { soundFx } from '../../utils/audio';
import { 
  Bookmark, 
  Sun, 
  Moon, 
  ChevronLeft, 
  ChevronRight, 
  List, 
  CheckSquare, 
  CheckCircle2, 
  XCircle, 
  Lightbulb, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  ChevronUp, 
  ChevronDown,
  Sparkles,
  HelpCircle,
  Clock,
  RotateCcw,
  BookOpen,
  X
} from 'lucide-react';

export interface SplitMcqQuestionData {
  id: string;
  unitId?: string;
  unitTitle?: string;
  topic?: string;
  domain?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  scenario?: string; // Problem narrative/premise (Left Pane Statement tab)
  helpNotes?: string[]; // Formula / RFC hints (Left Pane Help tab)
  question: string; // The specific prompt (Right Pane)
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface SplitMcqPlayerProps {
  questions: SplitMcqQuestionData[];
  initialIndex?: number;
  onComplete?: (results: { score: number; total: number; accuracy: number }) => void;
  onExit?: () => void;
  timedSeconds?: number; // Optional countdown per question or quiz
}

export const SplitMcqPlayer: React.FC<SplitMcqPlayerProps> = ({
  questions,
  initialIndex = 0,
  onComplete,
  onExit,
  timedSeconds,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<number, number>>({});
  const [activeLeftTab, setActiveLeftTab] = useState<'statement' | 'help'>('statement');
  const [isSolutionOpen, setIsSolutionOpen] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('netquest_bookmarked_mcqs');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Reaction feedback state
  const [likes, setLikes] = useState<Record<string, { count: number; userLiked: boolean; userDisliked: boolean }>>({});
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [discussionOpen, setDiscussionOpen] = useState(false);
  const [userComment, setUserComment] = useState('');
  const [commentsList, setCommentsList] = useState<Record<string, string[]>>({});

  // Timed challenge state
  const [timeLeft, setTimeLeft] = useState<number | null>(timedSeconds ?? null);

  const currentQ = questions[currentIndex] || questions[0];
  const totalQuestions = questions.length;
  const isSubmitted = submittedAnswers[currentIndex] !== undefined;
  const userAnswerIndex = submittedAnswers[currentIndex];
  const isCorrect = isSubmitted && userAnswerIndex === currentQ.correctIndex;

  // Sync selection when switching questions
  useEffect(() => {
    if (submittedAnswers[currentIndex] !== undefined) {
      setSelectedOption(submittedAnswers[currentIndex]);
      setIsSolutionOpen(true);
    } else {
      setSelectedOption(null);
      setIsSolutionOpen(false);
    }
    setActiveLeftTab('statement');
  }, [currentIndex, submittedAnswers]);

  // Save bookmarks
  const toggleBookmark = (id: string) => {
    soundFx.playClick();
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem('netquest_bookmarked_mcqs', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  // Like / Dislike handlers
  const handleLike = (id: string) => {
    soundFx.playClick();
    setLikes((prev) => {
      const curr = prev[id] || { count: 18, userLiked: false, userDisliked: false };
      if (curr.userLiked) {
        return { ...prev, [id]: { ...curr, count: curr.count - 1, userLiked: false } };
      }
      return {
        ...prev,
        [id]: {
          ...curr,
          count: curr.count + (curr.userDisliked ? 2 : 1),
          userLiked: true,
          userDisliked: false,
        },
      };
    });
  };

  const handleDislike = (id: string) => {
    soundFx.playClick();
    setLikes((prev) => {
      const curr = prev[id] || { count: 18, userLiked: false, userDisliked: false };
      if (curr.userDisliked) {
        return { ...prev, [id]: { ...curr, userDisliked: false } };
      }
      return {
        ...prev,
        [id]: {
          ...curr,
          count: curr.userLiked ? curr.count - 1 : curr.count,
          userLiked: false,
          userDisliked: true,
        },
      };
    });
  };

  const handleAddComment = () => {
    if (!userComment.trim()) return;
    soundFx.playClick();
    setCommentsList((prev) => ({
      ...prev,
      [currentQ.id]: [...(prev[currentQ.id] || []), userComment.trim()],
    }));
    setUserComment('');
  };

  // Select Option
  const handleSelectOption = (idx: number) => {
    if (isSubmitted) return;
    soundFx.playClick();
    setSelectedOption(idx);
  };

  // Submit Answer
  const handleSubmitAnswer = () => {
    if (selectedOption === null || isSubmitted) return;
    const isAnsCorrect = selectedOption === currentQ.correctIndex;
    if (isAnsCorrect) soundFx.playSuccess();
    else soundFx.playClick();

    setSubmittedAnswers((prev) => ({
      ...prev,
      [currentIndex]: selectedOption,
    }));
    setIsSolutionOpen(true);
  };

  // Navigate to Next question
  const handleNext = () => {
    soundFx.playClick();
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Finished all questions
      if (onComplete) {
        let correctCount = 0;
        Object.entries(submittedAnswers).forEach(([idxStr, ans]) => {
          const q = questions[Number(idxStr)];
          if (q && q.correctIndex === ans) correctCount++;
        });
        if (selectedOption === currentQ.correctIndex && !submittedAnswers[currentIndex]) {
          correctCount++;
        }
        onComplete({
          score: correctCount,
          total: totalQuestions,
          accuracy: Math.round((correctCount / totalQuestions) * 100),
        });
      }
    }
  };

  // Navigate to Prev question
  const handlePrev = () => {
    if (currentIndex > 0) {
      soundFx.playClick();
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Calculate difficulty
  const difficulty = currentQ.difficulty || (currentIndex % 3 === 0 ? 'Medium' : currentIndex % 3 === 1 ? 'Hard' : 'Easy');
  const difficultyColor = 
    difficulty === 'Easy' 
      ? 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30' 
      : difficulty === 'Hard' 
      ? 'text-rose-400 bg-rose-950/40 border-rose-500/30' 
      : 'text-amber-400 bg-amber-950/40 border-amber-500/30';

  // Extract scenario vs question prompt
  const { scenarioText, promptText } = useMemo(() => {
    if (currentQ.scenario) {
      return { scenarioText: currentQ.scenario, promptText: currentQ.question };
    }
    // If scenario isn't explicit, check if question has multi-sentence context
    const sentences = currentQ.question.split(/(?<=[.?!])\s+/);
    if (sentences.length > 1) {
      const prompt = sentences[sentences.length - 1];
      const scenario = sentences.slice(0, sentences.length - 1).join(' ');
      return { scenarioText: scenario, promptText: prompt };
    }
    // Fallback scenario text describing the context
    const fallbackScenario = `Examine the RFC networking telemetry and protocol invariants related to ${currentQ.topic || currentQ.domain || 'the protocol layer'}. Analyze state transitions, byte offsets, and design constraints to determine the correct specification.`;
    return { scenarioText: fallbackScenario, promptText: currentQ.question };
  }, [currentQ]);

  // Calculate score summary
  const scoreStats = useMemo(() => {
    let answered = 0;
    let correct = 0;
    Object.entries(submittedAnswers).forEach(([idxStr, ans]) => {
      answered++;
      if (questions[Number(idxStr)]?.correctIndex === ans) correct++;
    });
    return { answered, correct, total: totalQuestions };
  }, [submittedAnswers, questions, totalQuestions]);

  const isBookmarked = bookmarkedIds.has(currentQ.id);
  const qLikes = likes[currentQ.id] || { count: 24 + (currentIndex * 3), userLiked: false, userDisliked: false };
  const currentComments = commentsList[currentQ.id] || [];

  return (
    <div className="w-full bg-[#0b0f19] text-slate-200 rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden flex flex-col min-h-[640px] font-sans">
      
      {/* 1. TOP HEADER BAR */}
      <div className="h-14 bg-[#101422] border-b border-slate-800/80 px-4 flex items-center justify-between gap-3 select-none">
        
        {/* Left Controls */}
        <div className="flex items-center gap-3">
          {/* Question Palette Drawer Toggle */}
          <button
            onClick={() => setIsPaletteOpen(!isPaletteOpen)}
            title="Question List"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <List className="w-4 h-4" />
            <span className="text-xs font-mono text-slate-400 hidden sm:inline">
              {currentIndex + 1}/{totalQuestions}
            </span>
          </button>

          {/* Score Badge Checkmark */}
          <div 
            title={`Score: ${scoreStats.correct}/${scoreStats.answered}`}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono text-slate-400 hidden md:inline">
              {scoreStats.correct}/{scoreStats.total}
            </span>
          </div>

          <div className="h-4 w-[1px] bg-slate-800 mx-0.5 hidden sm:block" />

          {/* Difficulty Badge */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium">Difficulty:</span>
            <span className={`text-xs px-2 py-0.5 rounded-md font-semibold border ${difficultyColor}`}>
              {difficulty}
            </span>
          </div>

          <div className="h-4 w-[1px] bg-slate-800 mx-0.5 hidden sm:block" />

          {/* Bookmark Toggle */}
          <button
            onClick={() => toggleBookmark(currentQ.id)}
            title={isBookmarked ? 'Bookmarked' : 'Bookmark this question'}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isBookmarked 
                ? 'text-amber-400 bg-amber-500/10' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
          </button>
        </div>

        {/* Right Navigation & Segmented Progress Bar */}
        <div className="flex items-center gap-3">
          {/* Previous Button */}
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`text-xs font-semibold flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              currentIndex === 0 
                ? 'text-slate-600 cursor-not-allowed' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Segmented Module Progress Bar */}
          <div className="flex items-center gap-1.5 w-28 sm:w-36 md:w-48">
            {questions.map((_, qIdx) => {
              const isAnswered = submittedAnswers[qIdx] !== undefined;
              const isCurrent = qIdx === currentIndex;
              const isQCorrect = isAnswered && submittedAnswers[qIdx] === questions[qIdx]?.correctIndex;

              return (
                <button
                  key={qIdx}
                  onClick={() => setCurrentIndex(qIdx)}
                  title={`Question ${qIdx + 1}${isAnswered ? (isQCorrect ? ' (Correct)' : ' (Incorrect)') : ''}`}
                  className="flex-1 h-2 rounded-full overflow-hidden transition-all duration-300 relative cursor-pointer"
                >
                  <div
                    className={`w-full h-full transition-all duration-300 ${
                      isCurrent
                        ? 'bg-blue-500 ring-2 ring-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.8)]'
                        : isAnswered
                        ? isQCorrect
                          ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]'
                          : 'bg-rose-500/80 shadow-[0_0_6px_rgba(244,63,94,0.4)]'
                        : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            className="text-xs font-semibold flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <span className="hidden sm:inline">{currentIndex < totalQuestions - 1 ? 'Next' : 'Finish'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* QUESTION PALETTE DRAWER (MODAL OVERLAY) */}
      {isPaletteOpen && (
        <div className="bg-[#131726] border-b border-slate-800 p-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <List className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Question Palette</span>
            </div>
            <button 
              onClick={() => setIsPaletteOpen(false)}
              className="text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, idx) => {
              const isAns = submittedAnswers[idx] !== undefined;
              const isCur = idx === currentIndex;
              const isRight = isAns && submittedAnswers[idx] === q.correctIndex;

              let btnStyle = "bg-slate-800 text-slate-400 border-slate-700";
              if (isCur) btnStyle = "bg-blue-600 text-white border-blue-400 ring-2 ring-blue-500/50";
              else if (isAns && isRight) btnStyle = "bg-emerald-900/60 text-emerald-300 border-emerald-600";
              else if (isAns && !isRight) btnStyle = "bg-rose-900/60 text-rose-300 border-rose-600";

              return (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setIsPaletteOpen(false);
                  }}
                  className={`w-9 h-9 rounded-lg border text-xs font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${btnStyle}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. MAIN SPLIT PANE CONTENT AREA */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800/80 min-h-[540px] relative">
        
        {/* Visual Grab Handle Divider in Center */}
        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <div className="w-3.5 h-7 rounded-sm bg-[#161c2c] border border-slate-700/80 flex flex-col items-center justify-center gap-0.5 shadow-sm">
            <div className="w-1 h-1 rounded-full bg-slate-500" />
            <div className="w-1 h-1 rounded-full bg-slate-500" />
            <div className="w-1 h-1 rounded-full bg-slate-500" />
          </div>
        </div>

        {/* ================= LEFT PANE (STATEMENT & HELP) ================= */}
        <div className="flex flex-col bg-[#0b0f19] justify-between">
          
          {/* Left Pane Top Tabs & Body */}
          <div>
            {/* Tabs: Statement & Help */}
            <div className="flex items-center border-b border-slate-800/80 px-6 pt-3 gap-6 bg-[#0e121e]">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setActiveLeftTab('statement');
                }}
                className={`pb-3 text-sm font-bold flex items-center gap-2 relative transition-colors cursor-pointer ${
                  activeLeftTab === 'statement' 
                    ? 'text-white' 
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                <span>Statement</span>
                {activeLeftTab === 'statement' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                )}
              </button>

              <button
                onClick={() => {
                  soundFx.playClick();
                  setActiveLeftTab('help');
                }}
                className={`pb-3 text-sm font-bold flex items-center gap-2 relative transition-colors cursor-pointer ${
                  activeLeftTab === 'help' 
                    ? 'text-white' 
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                <span>Help</span>
                {activeLeftTab === 'help' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                )}
              </button>
            </div>

            {/* Left Pane Tab Content */}
            <div className="p-6 md:p-8 space-y-6">
              {activeLeftTab === 'statement' ? (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Heading */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-extrabold text-white tracking-tight">
                      MCQ {currentIndex + 1}
                    </h2>
                    {currentQ.topic && (
                      <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-slate-800/80 text-blue-400 border border-slate-700/60 font-semibold">
                        {currentQ.topic}
                      </span>
                    )}
                  </div>

                  {/* Problem Narrative / Context */}
                  <div className="text-sm leading-relaxed text-slate-300 space-y-3 font-normal">
                    <p className="whitespace-pre-line">
                      {scenarioText}
                    </p>
                  </div>

                  {/* Domain / RFC Invariant Badge */}
                  {currentQ.unitTitle && (
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-400 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Curriculum Context: <strong className="text-slate-200">{currentQ.unitTitle}</strong></span>
                    </div>
                  )}
                </div>
              ) : (
                /* HELP TAB: Formulas, RFC Cheatsheet & Hints */
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Lightbulb className="w-4 h-4" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                      RFC Reference & Protocol Hints
                    </h3>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-3 text-slate-300">
                    <div className="font-semibold text-blue-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Key Concept Invariants</span>
                    </div>
                    {currentQ.helpNotes && currentQ.helpNotes.length > 0 ? (
                      <ul className="space-y-2 list-disc list-inside text-slate-400">
                        {currentQ.helpNotes.map((note, nIdx) => (
                          <li key={nIdx}>{note}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="space-y-2 text-slate-400 leading-relaxed">
                        <p>• Verify protocol layer boundaries: Layer 3 (IP/Packets), Layer 4 (TCP/UDP/Segments), Layer 7 (Application/Messages).</p>
                        <p>• For subnetting: Usable host formula is <code className="text-blue-300 bg-slate-800 px-1 py-0.5 rounded font-mono">2^(32 - prefix) - 2</code>.</p>
                        <p>• Remember the end-to-end principle: Intermediate routers inspect only L2/L3 headers, while state management resides strictly on end hosts.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Left Pane Bottom Feedback Bar ("Did you like the problem?") */}
          <div className="p-4 px-6 border-t border-slate-800/80 bg-[#0e121e] flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium text-slate-400">Did you like the problem?</span>
            
            <div className="flex items-center gap-3">
              {/* Thumbs Up */}
              <button
                onClick={() => handleLike(currentQ.id)}
                title="Thumbs Up"
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  qLikes.userLiked 
                    ? 'text-blue-400 bg-blue-500/10' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${qLikes.userLiked ? 'fill-blue-400' : ''}`} />
                <span className="font-mono text-xs">{qLikes.count}</span>
              </button>

              {/* Thumbs Down */}
              <button
                onClick={() => handleDislike(currentQ.id)}
                title="Thumbs Down"
                className={`p-1 rounded-md transition-colors cursor-pointer ${
                  qLikes.userDisliked 
                    ? 'text-rose-400 bg-rose-500/10' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <ThumbsDown className={`w-4 h-4 ${qLikes.userDisliked ? 'fill-rose-400' : ''}`} />
              </button>

              {/* Comment / Discussion */}
              <button
                onClick={() => setDiscussionOpen(!discussionOpen)}
                title="Discussion & Notes"
                className={`p-1 rounded-md transition-colors cursor-pointer ${
                  discussionOpen 
                    ? 'text-blue-400 bg-blue-500/10' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* ================= RIGHT PANE (OPTIONS, VERIFICATION & SOLUTION) ================= */}
        <div className="flex flex-col justify-between bg-[#0e121e] p-6 md:p-8 space-y-6">
          
          <div className="space-y-6">
            
            {/* Question Prompt */}
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
                {promptText}
              </h3>
            </div>

            {/* MCQ Options List */}
            <div className="space-y-3">
              {currentQ.options.map((optionText, optIdx) => {
                const isSelected = selectedOption === optIdx;
                const isCorrectOption = optIdx === currentQ.correctIndex;

                // Dynamic card styling based on selection and submission state
                let cardStyle = "border-slate-800 bg-[#121624] text-slate-300 hover:border-slate-700 hover:bg-[#161c2e]";
                let radioStyle = "border-slate-600 bg-transparent";

                if (!isSubmitted) {
                  if (isSelected) {
                    cardStyle = "border-blue-500/80 bg-blue-950/20 text-blue-100 shadow-[0_0_12px_rgba(59,130,246,0.15)]";
                    radioStyle = "border-blue-500 bg-blue-500";
                  }
                } else {
                  if (isCorrectOption) {
                    // Exact green aesthetic from the user's reference image!
                    cardStyle = "border-emerald-600 bg-emerald-950/30 text-emerald-100 shadow-[0_0_12px_rgba(16,185,129,0.2)]";
                    radioStyle = "border-emerald-500 bg-emerald-500";
                  } else if (isSelected && !isCorrectOption) {
                    cardStyle = "border-rose-600 bg-rose-950/30 text-rose-100 shadow-[0_0_12px_rgba(244,63,94,0.2)]";
                    radioStyle = "border-rose-500 bg-rose-500";
                  } else {
                    cardStyle = "border-slate-800/60 bg-[#10131d]/60 text-slate-500 opacity-40";
                    radioStyle = "border-slate-700 bg-transparent";
                  }
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    disabled={isSubmitted}
                    className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center gap-3.5 group cursor-pointer ${cardStyle}`}
                  >
                    {/* Radio Button Indicator */}
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${radioStyle}`}>
                      {(isSelected || (isSubmitted && isCorrectOption)) && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>

                    {/* Option Text */}
                    <span className="flex-1 leading-snug">
                      {optionText}
                    </span>

                    {/* Result Icon Badge */}
                    {isSubmitted && isCorrectOption && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    )}
                    {isSubmitted && isSelected && !isCorrectOption && (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* CELEBRATORY BANNER (POST-SUBMIT VERIFICATION) */}
            {isSubmitted && (
              <div 
                className={`p-3.5 px-4 rounded-xl border text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300 ${
                  isCorrect
                    ? 'bg-[#d4edda] text-[#155724] border-[#c3e6cb] dark:bg-[#153424] dark:text-[#4ade80] dark:border-[#22573b]'
                    : 'bg-[#f8d7da] text-[#721c24] border-[#f5c6cb] dark:bg-[#3d1a21] dark:text-[#f87171] dark:border-[#5c242c]'
                }`}
              >
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>✔ Hooray, you did it!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                    <span>✖ That's not quite right. Review the solution below to learn why.</span>
                  </>
                )}
              </div>
            )}

            {/* EXPANDABLE SOLUTION / SEE ANSWER CARD */}
            {isSubmitted && (
              <div className="rounded-xl bg-[#121624] border border-slate-800 overflow-hidden animate-in fade-in duration-300">
                {/* Header Toggle */}
                <button
                  onClick={() => setIsSolutionOpen(!isSolutionOpen)}
                  className="w-full p-4 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-300 hover:text-white transition-colors cursor-pointer bg-[#14192a]"
                >
                  <div className="flex items-center gap-2 text-amber-400">
                    <Lightbulb className="w-4 h-4" />
                    <span>See Answer</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
                    <span>{isSolutionOpen ? 'Hide Solution' : 'View Solution'}</span>
                    {isSolutionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {/* Body */}
                {isSolutionOpen && (
                  <div className="p-4 sm:p-5 pt-3 border-t border-slate-800 space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed animate-in fade-in duration-200">
                    <div>
                      <span className="font-semibold text-slate-400 block text-xs uppercase tracking-wider mb-1">
                        Correct Answer:
                      </span>
                      <p className="font-mono text-emerald-400 font-bold text-sm bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-800/40">
                        {currentQ.options[currentQ.correctIndex]}
                      </p>
                    </div>

                    <div className="text-slate-400 text-xs leading-relaxed pt-1">
                      {currentQ.explanation}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* DISCUSSION DRAWER (WHEN OPENED VIA LEFT PANE) */}
            {discussionOpen && (
              <div className="p-4 rounded-xl bg-[#131828] border border-slate-800 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <div className="flex items-center gap-1.5 text-blue-400">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Discussion & Community Notes</span>
                  </div>
                  <button 
                    onClick={() => setDiscussionOpen(false)}
                    className="text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                    placeholder="Ask a question or leave a note..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleAddComment}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Post
                  </button>
                </div>

                {currentComments.length > 0 && (
                  <div className="space-y-1.5 pt-1 max-h-32 overflow-y-auto">
                    {currentComments.map((com, cIdx) => (
                      <div key={cIdx} className="p-2 rounded bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300">
                        {com}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* BOTTOM ACTION BUTTONS: SUBMIT & NEXT */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end gap-3">
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedOption === null || isSubmitted}
              className={`px-7 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                !isSubmitted
                  ? selectedOption !== null
                    ? 'bg-blue-600 hover:bg-blue-500 text-white ring-2 ring-blue-500/20 cursor-pointer'
                    : 'bg-blue-600/40 text-slate-300 border border-blue-500/30 cursor-not-allowed'
                  : 'bg-blue-600/60 text-white/80 cursor-default'
              }`}
            >
              Submit
            </button>

            <button
              onClick={handleNext}
              disabled={!isSubmitted}
              className={`px-7 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center gap-1.5 ${
                isSubmitted
                  ? 'bg-blue-600 hover:bg-blue-500 text-white ring-2 ring-blue-500/20 cursor-pointer'
                  : 'bg-[#161b2a] text-slate-500 border border-slate-800/80 cursor-not-allowed'
              }`}
            >
              <span>{currentIndex < totalQuestions - 1 ? 'Next' : 'Finish'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
