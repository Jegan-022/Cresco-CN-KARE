/**
 * CRESCO AI Personal Tutor Drawer
 *
 * Interactive conversational tutor component powered by Google Gemini via secure server proxy.
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
            ? `Hi! I'm ByteBot, your personal networking tutor. I see you're working on **${initialContext.conceptTopic}**. How can I help you understand this concept?`
            : "Hi! I'm ByteBot, your AI Personal Tutor for CS-4200 Computer Networks. Ask me anything about network layers, protocols, packet flows, or exam concepts!",
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
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg h-full bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tutor Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-white tracking-tight">ByteBot AI Tutor</h3>
                <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[9px] font-mono font-bold uppercase">
                  Socratic
                </span>
              </div>
              <p className="text-[11px] text-slate-400">CS-4200 Curriculum Assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleClearChat}
              title="Start New Chat"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Close Tutor (Esc)"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Authority Boundary Banner */}
        <div className="px-4 py-2 bg-slate-950 border-b border-slate-800/80 flex items-center gap-2 text-[10px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Assistive only. ByteBot guides learning but cannot alter official grades or certified mastery.</span>
        </div>

        {/* Active Context Chip */}
        {activeContext?.conceptTopic && (
          <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <span className="truncate flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">Context:</span>
              <span className="truncate">{activeContext.conceptTopic}</span>
            </span>
            {activeContext.unitId && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 font-mono text-slate-400 shrink-0">
                {activeContext.unitId.replace('_', ' ')}
              </span>
            )}
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            if (msg.sender === 'system') {
              return (
                <div key={msg.id} className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/50 text-xs text-rose-300 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div className="flex-1 leading-relaxed">{msg.text}</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRetryLastMessage}
                    className="px-2.5 py-1 rounded bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
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
                  <div className="w-7 h-7 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-cyan-400" />
                  </div>
                )}

                <div className={`space-y-2 max-w-[85%] ${isStudent ? 'items-end' : 'items-start'}`}>
                  <div 
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isStudent 
                        ? 'bg-blue-600 text-white rounded-tr-xs' 
                        : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
                  </div>

                  {/* Recommended Lessons Cards */}
                  {msg.recommendedLessons && msg.recommendedLessons.length > 0 && (
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-left">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1">
                        <BookOpen className="w-3 h-3" /> Recommended Curriculum Lessons:
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
                            className="w-full p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-left transition-colors flex items-center justify-between group cursor-pointer"
                          >
                            <div>
                              <div className="text-[11px] font-bold text-slate-200 group-hover:text-cyan-300">
                                {lesson.title}
                              </div>
                              <div className="text-[9px] font-mono text-slate-500">
                                Unit {lesson.unitNumber} • Module {lesson.lessonId}
                              </div>
                            </div>
                            <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 shrink-0" />
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
                          className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className={`text-[9px] font-mono text-slate-500 ${isStudent ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-cyan-400 animate-pulse" />
              </div>
              <div className="p-3.5 rounded-2xl rounded-tl-xs bg-slate-800/90 border border-slate-700/60 text-xs text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-slate-400 ml-1">ByteBot is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800">
          <div className="flex items-end gap-2 bg-slate-900 border border-slate-800 focus-within:border-cyan-500 rounded-xl p-2 transition-colors">
            <textarea
              ref={inputRef}
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDownTextarea}
              placeholder="Ask ByteBot about network protocols, RFCs, or packet flows... (Enter to send)"
              className="flex-1 bg-transparent border-0 text-xs text-white placeholder-slate-500 focus:outline-hidden resize-none font-sans"
            />
            <button
              type="button"
              disabled={!inputText.trim() || isLoading}
              onClick={() => handleSendMessage()}
              className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors shrink-0 cursor-pointer shadow-sm"
              title="Send Message (Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="text-[10px] text-slate-500 text-center mt-1.5 font-mono">
            Press <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-400">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-400">Shift+Enter</kbd> for newline
          </div>
        </div>
      </div>
    </div>
  );
};
