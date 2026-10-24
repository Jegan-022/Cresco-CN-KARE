/**
 * CRESCO AI Personal Tutor Drawer
 *
 * Interactive conversational tutor component powered by Groq API via secure server proxy.
 * Features Socratic dialogue, curriculum grounding, lesson recommendations, accessible
 * keyboard shortcuts, error handling with retries, learning authority disclaimers,
 * message copy, thumbs up/down feedback, past conversations history, and voice recognition.
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  RotateCcw, 
  Sparkles, 
  BookOpen, 
  AlertCircle, 
  ExternalLink,
  ShieldCheck,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Mic,
  MicOff,
  History,
  Trash2,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { 
  TutorMessage, 
  TutorInstructionalContext 
} from '../../types/aiTutor';
import { queryAiTutor } from '../../services/aiTutorService';
import { NavTab } from '../../types';

interface AiTutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  initialContext?: TutorInstructionalContext;
  onNavigate?: (tab: NavTab, lessonId?: string, sectionId?: number) => void;
}

interface SavedSession {
  id: string;
  timestamp: string;
  preview: string;
  messages: TutorMessage[];
}

const STORAGE_KEY = 'cresco_neta_chat_sessions';

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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [messageFeedback, setMessageFeedback] = useState<Record<string, 'up' | 'down'>>({});
  
  // Past conversations state
  const [showHistory, setShowHistory] = useState(false);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);

  // Voice recognition state
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputText((prev) => (prev ? `${prev.trim()} ${transcript}` : transcript));
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('[Neta Speech Recognition Error]:', event?.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Speech recognition setup error:', err);
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  const toggleVoiceInput = () => {
    if (!speechSupported) {
      alert('Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.warn('Speech recognition start failed:', err);
      }
    }
  };

  // Load saved sessions on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSavedSessions(parsed);
        }
      }
    } catch {}
  }, []);

  // Sync initial context on prop change
  useEffect(() => {
    if (initialContext) {
      setActiveContext(initialContext);
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

  // Auto-save current conversation to session history
  useEffect(() => {
    const studentMsgs = messages.filter((m) => m.sender === 'student');
    if (studentMsgs.length > 0) {
      const firstStudentMsg = studentMsgs[0].text;
      const preview = firstStudentMsg.length > 48 ? `${firstStudentMsg.slice(0, 48)}...` : firstStudentMsg;
      
      const currentSessionId = messages[0]?.id || `session-${Date.now()}`;
      const newSession: SavedSession = {
        id: currentSessionId,
        timestamp: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        preview,
        messages
      };

      setSavedSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== currentSessionId);
        const updated = [newSession, ...filtered].slice(0, 15);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }
  }, [messages]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen && !showHistory) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, showHistory]);

  // Focus textarea when opened
  useEffect(() => {
    if (isOpen && !showHistory) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, showHistory]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (showHistory) {
          setShowHistory(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showHistory, onClose]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
    }

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
    setShowHistory(false);
  };

  const handleRestoreSession = (session: SavedSession) => {
    setMessages(session.messages);
    setShowHistory(false);
  };

  const handleClearAllHistory = () => {
    if (confirm('Clear all saved conversations?')) {
      setSavedSessions([]);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleFeedback = (id: string, type: 'up' | 'down') => {
    setMessageFeedback((prev) => ({
      ...prev,
      [id]: prev[id] === type ? undefined! : type
    }));
  };

  const handleKeyDownTextarea = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Safe markdown text formatting renderer (renders **bold**, `code`, and clean bullet lists)
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');
    return lines.map((line, lineIdx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={lineIdx} className="h-1.5" />;
      }

      const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ');
      const cleanLine = isBullet ? trimmed.replace(/^[-•*]\s+/, '') : line;

      // Split on **bold**, `code`
      const parts = cleanLine.split(/(\*\*.*?\*\*|`.*?`)/g);

      const formattedContent = parts.map((part, partIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={partIdx} className="font-bold text-slate-950">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={partIdx} className="px-1.5 py-0.5 rounded-md bg-slate-900/10 font-mono text-[11px] text-slate-900 font-semibold border border-slate-900/5">
              {part.slice(1, -1)}
            </code>
          );
        }
        return <React.Fragment key={partIdx}>{part}</React.Fragment>;
      });

      if (isBullet) {
        return (
          <div key={lineIdx} className="flex items-start gap-2 my-1 pl-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-700 shrink-0 mt-1.5" />
            <span className="flex-1 leading-relaxed">{formattedContent}</span>
          </div>
        );
      }

      return (
        <p key={lineIdx} className="my-1 leading-relaxed">
          {formattedContent}
        </p>
      );
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end items-end sm:items-stretch p-0 sm:p-3 md:p-4 bg-slate-950/40 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full sm:max-w-[480px] md:max-w-[500px] h-full sm:rounded-[32px] bg-gradient-to-b from-white/94 via-white/88 to-white/94 backdrop-blur-2xl border border-white/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(255,255,255,1),inset_0_-1px_2px_rgba(255,255,255,0.4)] flex flex-col overflow-hidden relative text-slate-800 animate-in slide-in-from-right duration-300 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Glassmorphic & Mercury Highlights */}
        <div className="pointer-events-none absolute -top-12 -left-12 w-44 h-44 rounded-full bg-gradient-to-br from-white via-cyan-100/40 to-violet-100/30 blur-2xl opacity-90" />
        <div className="pointer-events-none absolute top-4 right-14 w-16 h-16 rounded-full bg-slate-900/10 blur-xl" />
        <div className="pointer-events-none absolute -bottom-14 -right-14 w-48 h-48 rounded-full bg-gradient-to-tl from-white via-slate-100/60 to-slate-200/40 blur-2xl opacity-80" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-95 z-20" />

        {/* Minimalist Top Indicator Dots (• ◦ ◦ ◦ ◦ ⊞) */}
        <div className="pt-3 pb-1 flex items-center justify-center gap-1.5 select-none relative z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-800 shadow-2xs" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400/50" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400/50" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400/50" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400/50" />
          <span className="w-2.5 h-2.5 rounded-xs border border-slate-400/60 ml-0.5 opacity-60 flex items-center justify-center text-[7px] text-slate-500 font-mono font-bold leading-none">⊞</span>
        </div>

        {/* Neta Glass Header */}
        <div className="px-5 py-3 border-b border-slate-200/60 bg-white/50 backdrop-blur-md flex items-center justify-between relative z-10">
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
              onClick={() => setShowHistory((prev) => !prev)}
              title="Past Conversations"
              className={`w-8 h-8 rounded-full border border-white/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                showHistory 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
            </button>
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
        <div className="px-5 py-2 bg-white/45 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between text-[10px] text-slate-600 relative z-10">
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

        {/* MAIN BODY: History Panel OR Chat Stream */}
        {showHistory ? (
          /* Past Conversations View */
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-white/60 to-white/80 relative z-10">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowHistory(false)}
                  className="p-1.5 rounded-full hover:bg-white text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  title="Back to Chat"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h4 className="text-sm font-bold text-slate-900">Past Conversations</h4>
              </div>
              {savedSessions.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllHistory}
                  className="text-[11px] text-rose-500 hover:text-rose-700 font-medium flex items-center gap-1 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-rose-50"
                >
                  <Trash2 className="w-3 h-3" /> Clear All
                </button>
              )}
            </div>

            {savedSessions.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">No saved conversations yet.</p>
                <p className="text-[11px] text-slate-400">Ask Neta any networking question to save sessions here.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {savedSessions.map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => handleRestoreSession(session)}
                    className="w-full p-3.5 rounded-2xl bg-white/85 hover:bg-white border border-white/90 hover:border-slate-300 shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-left transition-all hover:scale-[1.01] cursor-pointer group space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{session.timestamp}</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        {session.messages.length} msgs
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-800 line-clamp-2 group-hover:text-slate-950">
                      "{session.preview}"
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Live Chat Message Stream */
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
                    <div className="w-8 h-8 rounded-full bg-white/95 border border-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex items-center justify-center shrink-0 mt-0.5 overflow-hidden p-1">
                      <img src="/assets/mascot/network AI.png" alt="Neta" className="w-full h-full object-contain" />
                    </div>
                  )}

                  <div className={`space-y-1.5 max-w-[85%] ${isStudent ? 'items-end' : 'items-start'}`}>
                    <div 
                      className={`p-4 rounded-[24px] text-xs leading-relaxed ${
                        isStudent 
                          ? 'bg-gradient-to-br from-slate-900 to-zinc-800 text-white rounded-tr-xs shadow-[0_4px_16px_rgba(15,23,42,0.18)]' 
                          : 'bg-white/92 backdrop-blur-xl text-slate-800 border border-white/95 rounded-tl-xs shadow-[0_4px_20px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)]'
                      }`}
                    >
                      {isStudent ? (
                        <div className="whitespace-pre-wrap font-sans font-normal">{msg.text}</div>
                      ) : (
                        <div className="font-sans font-normal text-slate-800">
                          {renderFormattedText(msg.text)}
                        </div>
                      )}
                    </div>

                    {/* Tutor Message Action Row: Copy + Thumbs Up/Down Feedback + Timestamp */}
                    {!isStudent && (
                      <div className="flex items-center justify-between px-1.5 pt-0.5 text-[10px] text-slate-500">
                        <div className="flex items-center gap-1 bg-white/70 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/80 shadow-2xs">
                          {/* Copy Button */}
                          <button
                            type="button"
                            onClick={() => handleCopyText(msg.id, msg.text)}
                            className="p-1 rounded-md hover:bg-white text-slate-500 hover:text-slate-800 transition-all flex items-center gap-1 cursor-pointer"
                            title="Copy reply to clipboard"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-[10px] text-emerald-600 font-semibold">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span className="text-[10px]">Copy</span>
                              </>
                            )}
                          </button>

                          <div className="w-px h-3 bg-slate-300 mx-0.5" />

                          {/* Thumbs Up Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleFeedback(msg.id, 'up')}
                            className={`p-1 rounded-md transition-all cursor-pointer ${
                              messageFeedback[msg.id] === 'up'
                                ? 'bg-emerald-100 text-emerald-700 shadow-2xs'
                                : 'hover:bg-white text-slate-400 hover:text-emerald-600'
                            }`}
                            title="Helpful response"
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </button>

                          {/* Thumbs Down Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleFeedback(msg.id, 'down')}
                            className={`p-1 rounded-md transition-all cursor-pointer ${
                              messageFeedback[msg.id] === 'down'
                                ? 'bg-rose-100 text-rose-700 shadow-2xs'
                                : 'hover:bg-white text-slate-400 hover:text-rose-600'
                            }`}
                            title="Not helpful"
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-[9px] font-mono text-slate-400">{msg.timestamp}</span>
                      </div>
                    )}

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

                    {isStudent && (
                      <div className="text-[9px] font-mono text-slate-400 text-right pr-1">
                        {msg.timestamp}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/95 border border-white shadow-xs flex items-center justify-center shrink-0 overflow-hidden p-1">
                  <img src="/assets/mascot/network AI.png" alt="Neta" className="w-full h-full object-contain animate-pulse" />
                </div>
                <div className="p-3.5 rounded-[22px] rounded-tl-xs bg-white/88 backdrop-blur-xl border border-white/90 shadow-xs text-xs text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-800 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-slate-800 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-slate-800 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] text-slate-700 font-medium ml-1">Neta is thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Bar */}
        <div className="px-4 sm:px-5 pt-4 pb-4 bg-white/35 backdrop-blur-2xl border-t border-white/60 relative z-10 mt-auto shadow-[0_-10px_35px_rgba(255,255,255,0.18)]">
          <div className="flex items-end gap-2 bg-white/70 backdrop-blur-2xl border border-white/90 shadow-[0_8px_30px_rgba(31,41,55,0.10),inset_0_1px_0_rgba(255,255,255,0.95)] focus-within:border-white focus-within:ring-4 focus-within:ring-sky-200/35 focus-within:shadow-[0_12px_36px_rgba(31,41,55,0.14),inset_0_1px_0_rgba(255,255,255,1)] rounded-[26px] p-2.5 transition-all w-full min-w-0">
            
            {/* Microphone Button (Voice Recognition) */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              title={isListening ? "Listening... click to stop" : "Voice input (Speak to Neta)"}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                isListening 
                  ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30 ring-2 ring-rose-400/50' 
                  : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Input Textarea */}
            <textarea
              ref={inputRef}
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDownTextarea}
              placeholder={isListening ? "Listening to your voice..." : "Ask Neta about protocols, RFCs, or packet flows... (Enter to send)"}
              className="flex-1 min-w-0 min-h-[44px] max-h-36 bg-transparent border-0 text-[14px] text-slate-800 placeholder-slate-500/90 focus:outline-none focus:ring-0 resize-none font-sans px-2.5 py-2.5 leading-relaxed"
            />

            {/* Send Button */}
            <button
              type="button"
              disabled={!inputText.trim() || isLoading}
              onClick={() => handleSendMessage()}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-950 hover:from-slate-700 hover:to-slate-900 disabled:opacity-35 disabled:cursor-not-allowed text-white transition-all shrink-0 cursor-pointer shadow-[0_5px_14px_rgba(15,23,42,0.25)] flex items-center justify-center active:scale-95"
              title="Send Message (Enter)"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Keyboard shortcut guide */}
          <div className="text-[10px] text-slate-400 text-center mt-2 font-sans flex flex-wrap items-center justify-center gap-1.5">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 bg-white/80 border border-slate-200/60 rounded text-slate-600 font-bold shadow-2xs">Enter</kbd>
            <span>to send,</span>
            <kbd className="px-1.5 py-0.5 bg-white/80 border border-slate-200/60 rounded text-slate-500 shadow-2xs">Shift+Enter</kbd>
            <span>for newline</span>
          </div>
        </div>
      </div>
    </div>
  );
};
