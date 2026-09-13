import React, { useState, useEffect } from 'react';
import { BLITZ_QUESTIONS } from '../data/courseData';
import { soundFx } from '../utils/audio';

interface SprintModalProps {
  onClose: () => void;
  onFinishSprint: (xpEarned: number) => void;
}

export const SprintModal: React.FC<SprintModalProps> = ({
  onClose,
  onFinishSprint,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(300); // 5 minutes
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    if (quizFinished || secondsRemaining <= 0) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setQuizFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [quizFinished, secondsRemaining]);

  const currentQ = BLITZ_QUESTIONS[currentIndex];

  const handleSelect = (index: number) => {
    if (submitted) return;
    soundFx.playClick();
    setSelectedOption(index);
  };

  const handleConfirmAnswer = () => {
    if (selectedOption === null) return;
    setSubmitted(true);
    if (selectedOption === currentQ.correctIndex) {
      setScore(s => s + 1);
      soundFx.playSuccess();
    } else {
      soundFx.playClick();
    }
  };

  const handleNext = () => {
    soundFx.playClick();
    if (currentIndex < BLITZ_QUESTIONS.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
      setSubmitted(false);
    } else {
      setQuizFinished(true);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#131b2e]/60  animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#dae2fd] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-[#f2f3ff] border-b border-[#dae2fd] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#004ac6] text-white flex items-center justify-center">
              <span className="material-symbols-outlined fill-1">bolt</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold text-[#00687a] uppercase">
                  DAILY SPRINT CHALLENGE
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] font-mono text-[10px] font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">timer</span>
                  {formatTime(secondsRemaining)}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#131b2e]">
                Packet Header Blitz: RFC Verification
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#434655] hover:bg-[#eaedff]"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {!quizFinished ? (
            <div className="space-y-4">
              {/* Question counter bar */}
              <div className="flex items-center justify-between text-xs font-mono text-[#434655]">
                <span>Question {currentIndex + 1} of {BLITZ_QUESTIONS.length}</span>
                <span className="text-[#004ac6] font-bold">Bounty: +50 XP</span>
              </div>
              <div className="w-full bg-[#eaedff] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#004ac6] h-full transition-all transform-gpu duration-300"
                  style={{ width: `${((currentIndex + 1) / BLITZ_QUESTIONS.length) * 100}%` }}
                ></div>
              </div>

              {/* Protocol Badge */}
              <div className="flex items-center gap-2 pt-2">
                <span className="px-2.5 py-1 rounded-md bg-[#eaedff] text-[#131b2e] font-mono text-xs font-bold">
                  {currentQ.protocol}
                </span>
                <h3 className="font-bold text-base text-[#131b2e]">{currentQ.title}</h3>
              </div>

              {/* Hex Dump Inspector Block */}
              <div className="p-3.5 rounded-xl bg-[#283044] text-[#eef0ff] font-mono text-xs">
                <div className="text-[10px] text-[#57dffe] mb-1 font-semibold uppercase">
                  RAW WIRE HEX FRAME (Wireshark Dump):
                </div>
                <div className="space-y-1 text-[#acedff]">
                  {currentQ.hexDump.map((line, idx) => (
                    <div key={idx} className="tracking-widest">
                      <span className="text-[#dae2fd]/50 mr-2">0x{(idx * 16).toString(16).padStart(4, '0')}</span>
                      {line}
                    </div>
                  ))}
                </div>
              </div>

              {/* Question Text */}
              <p className="text-sm font-semibold text-[#131b2e] leading-snug">
                {currentQ.question}
              </p>

              {/* Options */}
              <div className="space-y-2 pt-1">
                {currentQ.options.map((opt, idx) => {
                  let btnStyle = 'bg-white border-[#dae2fd] text-[#131b2e] hover:bg-[#f2f3ff]';

                  if (selectedOption === idx) {
                    btnStyle = 'bg-[#dbe1ff] border-[#004ac6] text-[#00174b] ring-1 ring-[#004ac6]';
                  }

                  if (submitted) {
                    if (idx === currentQ.correctIndex) {
                      btnStyle = 'bg-[#acedff] border-[#00687a] text-[#001f26] font-bold';
                    } else if (selectedOption === idx) {
                      btnStyle = 'bg-[#ffdad6] border-[#ba1a1a] text-[#93000a]';
                    } else {
                      btnStyle = 'opacity-50 bg-white border-gray-200';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      disabled={submitted}
                      className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all transform-gpu flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {submitted && idx === currentQ.correctIndex && (
                        <span className="material-symbols-outlined text-sm text-[#00687a] fill-1">check_circle</span>
                      )}
                      {submitted && selectedOption === idx && idx !== currentQ.correctIndex && (
                        <span className="material-symbols-outlined text-sm text-[#ba1a1a]">cancel</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation note */}
              {submitted && (
                <div className="p-3 bg-[#eaedff] rounded-xl border border-[#dae2fd] text-xs text-[#131b2e] animate-in fade-in">
                  <span className="font-bold text-[#004ac6] block mb-0.5">RFC Inspection Analysis:</span>
                  {currentQ.explanation}
                </div>
              )}
            </div>
          ) : (
            /* Results Screen */
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#acedff] text-[#00687a] mx-auto flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl fill-1">military_tech</span>
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-[#131b2e]">Blitz Sprint Completed!</h3>
                <p className="text-sm text-[#434655] mt-1">
                  You scored <span className="font-bold text-[#004ac6]">{score} / {BLITZ_QUESTIONS.length}</span> correct against RFC specifications.
                </p>
              </div>

              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-[#f2f3ff] border border-[#dae2fd]">
                <span className="material-symbols-outlined text-[#004ac6]">star</span>
                <span className="font-mono text-sm font-bold text-[#131b2e]">+50 XP Awarded</span>
                <span className="text-[#c3c6d7]">•</span>
                <span className="font-mono text-xs text-[#00687a] font-semibold">Streak Shield Preserved</span>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => {
                    onFinishSprint(50);
                    onClose();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#004ac6] text-white text-sm font-bold shadow-md hover:bg-[#003ea8] transition-all transform-gpu"
                >
                  Return to Workspace
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        {!quizFinished && (
          <div className="p-4 bg-[#f2f3ff] border-t border-[#dae2fd] flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-[#434655] hover:text-[#131b2e]"
            >
              Abandon Sprint
            </button>

            {!submitted ? (
              <button
                onClick={handleConfirmAnswer}
                disabled={selectedOption === null}
                className="px-5 py-2 rounded-xl bg-[#004ac6] text-white text-xs font-bold shadow hover:bg-[#003ea8] disabled:opacity-50 transition-colors"
              >
                Validate Hex Bits
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-5 py-2 rounded-xl bg-[#00687a] text-white text-xs font-bold shadow hover:bg-[#004e5c] transition-colors flex items-center gap-1"
              >
                <span>{currentIndex < BLITZ_QUESTIONS.length - 1 ? 'Next Hex Dump' : 'View Results'}</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
