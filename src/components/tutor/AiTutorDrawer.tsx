/**
 * CRESCO AI Personal Tutor Drawer
 *
 * Interactive conversational tutor component powered by Groq API via secure server proxy.
 * Features Socratic dialogue, curriculum grounding, lesson recommendations, accessible
 * keyboard shortcuts, error handling with retries, and learning authority disclaimers.
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  RotateCcw, 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  AlertCircle, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Lightbulb,
  MessageSquare
} from 'lucide-react';
import { 
  TutorMessage, 
  TutorInstructionalContext, 
  TutorRecommendedLesson 
} from '../../types/aiTutor';
import { queryAiTutor } from '../../services/aiTutorService';
import { CrescoMascot } from '../brand/CrescoMascot';
import { NavTab } from '../../types';

interface AiTutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  initialContext?: TutorInstructionalContext;
  onNavigate?: (tab: NavTab, lessonId?: string, sectionId?: number) => void;
}

export const AiTutorDrawer: React.FC<AiTutorDrawerProps> = ({
  isOpen,
  onClose,
  studentId,
  initialContext,
  onNavigate
}) => {
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeContext, setActiveContext] = useState<TutorInstructionalContext | undefined>(initialContext);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Sync initial context on prop change
  useEffect(() => {
    if (initialContext) {
      setActiveContext(initialContext);
      // If messages are empty, generate initial welcome message
      if (messages.length === 0) {
        const greeting: TutorMessage = {
          id: `welcome-${Date.now()}`,
          sender: 'tutor',
          text: initialContext.conceptTopic
            ? `Hi! I'm Neta, your personal networking tutor. I see you're working on **${initialContext.conceptTopic}**. How can I help you understand this concept?`
            : "Hi! I'm Neta, your AI Personal Tutor for CS-4200 Computer Networks. Ask me anything about network layers, protocols, packet flows, or exam concepts!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          context: initialContext,
          suggestedActions: [
            'Explain this concept simply',
            'Give me a diagnostic hint',
            'Show a real-world analogy',
            'Recommend related lessons'
          ]
        };
        setMessages([greeting]);
      }
    }
  }, [initialContext]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus textarea when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMessage: TutorMessage = {
      id: `user-${Date.now()}`,
      sender: 'student',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputText('');
    setIsLoading(true);

    // Format conversation history for API
    const historyPayload = newHistory.slice(-6).map((m) => ({
      role: m.sender === 'student' ? ('user' as const) : ('model' as const),
      text: m.text
    }));

    const response = await queryAiTutor({
      studentId: studentId || 'anonymous_student',
      message: query,
      context: activeContext,
      conversationHistory: historyPayload
    });

    setIsLoading(false);

    if (response.success) {
      const tutorMessage: TutorMessage = {
        id: `tutor-${Date.now()}`,
        sender: 'tutor',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedLessons: response.recommendedLessons,
        suggestedActions: [
          'Can you give another example?',
          'What RFC defines this?',
          'How does this relate to TCP/IP?'
        ]
      };
      setMessages((prev) => [...prev, tutorMessage]);
    } else {
      const errorMessage: TutorMessage = {
        id: `err-${Date.now()}`,
        sender: 'system',
        text: response.error || 'The AI tutor encountered an issue. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
        errorCode: response.errorCode
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleRetryLastMessage = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.sender === 'student');
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.text);
    }
  };

  const handleClearChat = () => {
    const resetGreeting: TutorMessage = {
      id: `reset-${Date.now()}`,
      sender: 'tutor',
      text: "Starting a fresh session! What topic in Computer Networks would you like to explore?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        'Explain TCP 3-Way Handshake',
        'How does Subnetting work?',
        'Distance Vector vs Link State',
        'DNS resolution process'
      ]
    };
    setMessages([resetGreeting]);
  };

  const handleKeyDownTextarea = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end items-center p-0 sm:p-4 md:p-6 bg-slate-950/40 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full sm:max-w-[480px] md:max-w-[500px] h-full sm:h-[92vh] sm:rounded-[36px] bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.7),inset_0_1px_1px_rgba(255,255,255,0.95)] flex flex-col overflow-hidden relative text-slate-800 animate-in slide-in-from-right duration-300 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Glassmorphic & Mercury Orbs (Reference Image Accents) */}
        <div className="pointer-events-none absolute top-4 right-14 w-14 h-14 rounded-full bg-slate-900/15 blur-lg" />
        <div className="pointer-events-none absolute -top-8 -left-8 w-24 h-24 rounded-full bg-gradient-to-br from-white via-slate-100 to-slate-300/40 border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.06)] opacity-70 blur-2xs" />
        <div className="pointer-events-none absolute -bottom-10 -right-10 w-28 h-28 rounded-full bg-gradient-to-tl from-white via-slate-100 to-slate-200/50 border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.08)] opacity-60 blur-2xs" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent opacity-90 z-20" />

        {/* Minimalist Top Indicator Dots (• ◦ ◦ ◦ ◦ ⊞) */}
        <div className="pt-2.5 pb-1 flex items-center justify-center gap-1.5 select-none relative z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400/50" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400/50" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400/50" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400/50" />
          <span className="w-2.5 h-2.5 rounded-xs border border-slate-400/60 ml-0.5 opacity-60 flex items-center justify-center text-[7px] text-slate-500 font-mono font-bold leading-none">⊞</span>
        </div>

        {/* Neta Glass Header */}
        <div className="px-5 py-3 border-b border-slate-200/50 bg-white/40 backdrop-blur-md flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-white/95 border border-white shadow-[0_4px_16px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,1)] flex items-center justify-center overflow-hidden p-1 transition-transform hover:scale-105">
                <img
                  src="/assets/mascot/network AI.png"
                  alt="Neta"
                  className="w-full h-full object-contain drop-shadow-sm"
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white shadow-xs" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight font-sans">Neta</h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-900/5 text-slate-700 border border-slate-900/10 text-[9px] font-mono font-bold uppercase tracking-wider">
                  AI Tutor
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">CS-4200 Curriculum Assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleClearChat}
              title="Start New Chat"
              className="w-8 h-8 rounded-full bg-white/80 hover:bg-white border border-white/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Close (Esc)"
              className="w-8 h-8 rounded-full bg-white/80 hover:bg-white border border-white/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Minimalist Sub-Header Banner (Aesthetics • Functionality) */}
        <div className="px-5 py-2 bg-white/50 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between text-[10px] text-slate-600 relative z-10">
          <div className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-700 shrink-0" />
            <span>Assistive Socratic Tutor • Non-authoritative</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[9px] tracking-widest text-slate-400 uppercase font-semibold">
            <span>Aesthetics</span>
            <span className="text-slate-300">•</span>
            <span>Function</span>
          </div>
        </div>

        {/* Active Context Chip */}
        {activeContext?.conceptTopic && (
          <div className="px-5 py-2 bg-white/60 border-b border-slate-200/50 flex items-center justify-between text-xs text-slate-700 relative z-10">
            <span className="truncate flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-800 font-bold bg-slate-900/5 px-2 py-0.5 rounded-full border border-slate-900/10">Topic:</span>
              <span className="truncate font-medium">{activeContext.conceptTopic}</span>
            </span>
            {activeContext.unitId && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white font-mono text-slate-700 border border-slate-200/70 shadow-2xs shrink-0">
                {activeContext.unitId.replace('_', ' ')}
              </span>
            )}
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-gradient-to-b from-white/30 via-white/50 to-white/70 relative z-10">
          {messages.map((msg) => {
            if (msg.sender === 'system') {
              return (
                <div key={msg.id} className="p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200 text-xs text-rose-800 space-y-2 shadow-xs">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div className="flex-1 leading-relaxed font-medium">{msg.text}</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRetryLastMessage}
                    className="px-3 py-1 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-800 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Retry Query
                  </button>
                </div>
              );
            }

            const isStudent = msg.sender === 'student';

            return (
              <div 
                key={msg.id} 
                className={`flex gap-3 ${isStudent ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {!isStudent && (
                  <div className="w-8 h-8 rounded-2xl bg-white/95 border border-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex items-center justify-center shrink-0 mt-1 overflow-hidden p-1">
                    <img src="/assets/mascot/network AI.png" alt="Neta" className="w-full h-full object-contain" />
                  </div>
                )}

                <div className={`space-y-2 max-w-[85%] ${isStudent ? 'items-end' : 'items-start'}`}>
                  <div 
                    className={`p-4 rounded-[24px] text-xs leading-relaxed ${
                      isStudent 
                        ? 'bg-gradient-to-br from-slate-900 to-zinc-800 text-white rounded-tr-xs shadow-[0_4px_16px_rgba(15,23,42,0.18)]' 
                        : 'bg-white/90 backdrop-blur-xl text-slate-800 border border-white/90 rounded-tl-xs shadow-[0_4px_20px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.8)]'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans font-normal">{msg.text}</div>
                  </div>

                  {/* Recommended Lessons Cards */}
                  {msg.recommendedLessons && msg.recommendedLessons.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-white/80 backdrop-blur-md border border-white/90 shadow-xs space-y-2 text-left">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-700 font-bold flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-slate-800" /> Recommended Curriculum Lessons:
                      </div>
                      <div className="space-y-1.5">
                        {msg.recommendedLessons.map((lesson) => (
                          <button
                            key={lesson.lessonId}
                            type="button"
                            onClick={() => {
                              if (onNavigate) {
                                onNavigate('lesson-player', lesson.lessonId);
                                onClose();
                              }
                            }}
                            className="w-full p-2.5 rounded-xl bg-white/90 hover:bg-white border border-slate-200/60 hover:border-slate-300 text-left transition-all flex items-center justify-between group cursor-pointer shadow-2xs hover:shadow-xs"
                          >
                            <div>
                              <div className="text-[11px] font-bold text-slate-900 group-hover:text-black">
                                {lesson.title}
                              </div>
                              <div className="text-[9px] font-mono text-slate-500">
                                Unit {lesson.unitNumber} • Module {lesson.lessonId}
                              </div>
                            </div>
                            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-800 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Follow-up Action Chips */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && !isStudent && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestedActions.map((action, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessage(action)}
                          className="px-3 py-1.5 rounded-full bg-white/80 hover:bg-white border border-slate-200/80 hover:border-slate-400 text-[11px] font-medium text-slate-700 hover:text-slate-950 shadow-2xs hover:shadow-xs transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className={`text-[9px] font-mono text-slate-400 ${isStudent ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-2xl bg-white/95 border border-white shadow-xs flex items-center justify-center shrink-0 overflow-hidden p-1">
                <img src="/assets/mascot/network AI.png" alt="Neta" className="w-full h-full object-contain animate-pulse" />
              </div>
              <div className="p-3.5 rounded-[22px] rounded-tl-xs bg-white/85 backdrop-blur-xl border border-white/90 shadow-xs text-xs text-slate-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-800 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-slate-800 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-slate-800 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-slate-700 font-medium ml-1">Neta is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Neumorphic Separator with Center '+' Pill (Inspired by Reference Image) */}
        <div className="relative py-1 flex items-center justify-center select-none bg-white/30">
          <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-slate-200/80 to-transparent" />
          <div className="relative z-10 w-6 h-6 rounded-full bg-white/95 border border-white shadow-[0_2px_6px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,1)] flex items-center justify-center text-slate-500 text-xs font-light">
            +
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white/70 backdrop-blur-xl border-t border-white/80 relative z-10">
          <div className="flex items-end gap-2 bg-white/95 backdrop-blur-md border border-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.03),0_4px_16px_rgba(0,0,0,0.04)] focus-within:border-slate-300 focus-within:shadow-[0_0_0_3px_rgba(0,0,0,0.04)] rounded-[24px] p-2 transition-all">
            <textarea
              ref={inputRef}
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDownTextarea}
              placeholder="Ask Neta about protocols, RFCs, or packet flows... (Enter to send)"
              className="flex-1 bg-transparent border-0 text-xs sm:text-[13px] text-slate-800 placeholder-slate-400 focus:outline-hidden resize-none font-sans px-2 py-1 leading-normal"
            />
            <button
              type="button"
              disabled={!inputText.trim() || isLoading}
              onClick={() => handleSendMessage()}
              className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all shrink-0 cursor-pointer shadow-[0_4px_12px_rgba(15,23,42,0.2)] flex items-center justify-center hover:scale-105 active:scale-95"
              title="Send Message (Enter)"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-[10px] text-slate-400 text-center mt-2 font-mono">
            Press <kbd className="px-1.5 py-0.5 bg-white/80 border border-slate-200/60 rounded text-slate-600 font-bold shadow-2xs">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-white/80 border border-slate-200/60 rounded text-slate-500 shadow-2xs">Shift+Enter</kbd> for newline
          </div>
        </div>
      </div>
    </div>
  );
};
