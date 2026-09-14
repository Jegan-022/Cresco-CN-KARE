import React, { useState, useEffect, useRef } from 'react';
import { 
  GUIDE_MASTERS, 
  GuideMasterId, 
  GuideMasterProfile, 
  GuideMasterMood,
  ExplanationMode,
  StudentLevel,
  getGuideMasterById
} from '../../data/guideMasterCharacters';
import { GuideMasterAvatar } from './GuideMasterAvatar';
import { VisualTeachingCanvas, VisualDiagramType } from './VisualTeachingCanvas';
import { soundFx } from '../../utils/soundEffects';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw, 
  Mic, 
  MicOff, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  BookOpen, 
  HelpCircle, 
  Layers, 
  SlidersHorizontal,
  ChevronDown,
  X,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'student' | 'guidemaster';
  text: string;
  timestamp: string;
  diagramType?: VisualDiagramType;
  diagramTitle?: string;
  modeUsed?: ExplanationMode;
}

interface GuideMasterTutorPanelProps {
  currentTopic?: string;
  onNavigateToSelect?: () => void;
  isFloating?: boolean;
  onClose?: () => void;
  className?: string;
}

export const GuideMasterTutorPanel: React.FC<GuideMasterTutorPanelProps> = ({
  currentTopic = 'TCP 3-Way Handshake',
  onNavigateToSelect,
  isFloating = false,
  onClose,
  className = '',
}) => {
  // Active GuideMaster
  const [activeMasterId, setActiveMasterId] = useState<GuideMasterId>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('netquest_guidemaster_id');
      if (saved && GUIDE_MASTERS.some((m) => m.id === saved)) {
        return saved as GuideMasterId;
      }
    }
    return 'anaya';
  });

  const master: GuideMasterProfile = getGuideMasterById(activeMasterId);

  // Tutor State
  const [mood, setMood] = useState<GuideMasterMood>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [amplitude, setAmplitude] = useState(0);
  const [speechRate, setSpeechRate] = useState<1.0 | 0.8 | 1.2>(1.0);
  const [isMuted, setIsMuted] = useState(false);

  // Student Level & Mode
  const [studentLevel, setStudentLevel] = useState<StudentLevel>('beginner');
  const [inputQuery, setInputQuery] = useState('');
  const [isListeningVoice, setIsListeningVoice] = useState(false);

  // Conversation Memory
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init-1',
      sender: 'guidemaster',
      text: master.introMessage,
      timestamp: 'Just now',
    },
    {
      id: 'init-2',
      sender: 'guidemaster',
      text: `We are currently focusing on **${currentTopic}**. Ask me any question, click one of the explanation modes below, or tap the microphone to talk with me!`,
      timestamp: 'Just now',
      diagramType: 'tcp-handshake',
      diagramTitle: 'TCP 3-Way Handshake Workflow',
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const ampTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, mood]);

  // Audio Speech synthesis wrapper
  const speakText = (text: string, onEnd?: () => void) => {
    if (isMuted) {
      if (onEnd) onEnd();
      return;
    }

    // Cancel current speech
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(true);
    setIsPaused(false);
    setMood('explaining');

    // Simulate animated lip-sync audio wave amplitude
    if (ampTimerRef.current) clearInterval(ampTimerRef.current);
    ampTimerRef.current = setInterval(() => {
      setAmplitude(Math.random() * 0.7 + 0.3);
    }, 110);

    // Filter out markdown syntax from speech
    const cleanSpeech = text.replace(/[*_#`\[\]]/g, '').trim();

    soundFx.speak(cleanSpeech, () => {
      if (ampTimerRef.current) clearInterval(ampTimerRef.current);
      setAmplitude(0);
      setIsSpeaking(false);
      setMood('idle');
      if (onEnd) onEnd();
    });
  };

  // 11 Quick Explanation Mode Actions
  const explanationModes: { mode: ExplanationMode; label: string; icon: string }[] = [
    { mode: 'explain', label: 'Explain', icon: '💡' },
    { mode: 'explain-simply', label: 'Explain Simply', icon: '🌱' },
    { mode: 'explain-deeply', label: 'Explain Deeply', icon: '🔬' },
    { mode: 'give-example', label: 'Give Example', icon: '✨' },
    { mode: 'show-steps', label: 'Show Steps', icon: '📋' },
    { mode: 'give-analogy', label: 'Give Analogy', icon: '🎨' },
    { mode: 'quiz-me', label: 'Quiz Me', icon: '❓' },
    { mode: 'ask-questions', label: 'Ask Me Questions', icon: '🎯' },
    { mode: 'summarize', label: 'Summarize', icon: '⚡' },
    { mode: 'exam-answer', label: 'Exam Answer', icon: '📝' },
    { mode: 'practice-problem', label: 'Practice Problem', icon: '🛠️' },
  ];

  // Natural Human Pedagogical Response Generator
  const generateEducationalResponse = (
    userText: string,
    mode?: ExplanationMode,
    level: StudentLevel = studentLevel
  ): { text: string; diagramType?: VisualDiagramType; diagramTitle?: string } => {
    const lower = userText.toLowerCase();

    // 1. TCP 3-Way Handshake
    if (lower.includes('tcp') || lower.includes('handshake') || lower.includes('three-way')) {
      if (mode === 'explain-simply' || level === 'beginner') {
        return {
          text: `Okay, let's make TCP's three-way handshake super intuitive!\n\nImagine two people trying to talk across a walkie-talkie:\n1. **SYN**: "Hey, can you hear me?" (Client sends initial sequence number)\n2. **SYN-ACK**: "Yes, I hear you loud and clear! Can you hear me?" (Server acknowledges and sends its own sequence)\n3. **ACK**: "Awesome, let's begin talking."\n\nBecause packets can get dropped or delayed on the Internet, neither side starts sending critical data until they verify that **both directions** of communication are completely working.`,
          diagramType: 'tcp-handshake',
          diagramTitle: 'TCP 3-Way Handshake (SYN → SYN-ACK → ACK)'
        };
      }
      if (mode === 'exam-answer' || level === 'exam') {
        return {
          text: `**Examination Model Answer — TCP 3-Way Handshake**\n\n**Definition:** The mechanism used by Transmission Control Protocol (RFC 793) to establish a reliable, full-duplex connection before data transfer occurs.\n\n**Three Essential Steps:**\n1. **SYN (Synchronize):** Client sends a TCP segment with \`SYN=1\`, random Sequence Number \`Seq = ISN_c\`.\n2. **SYN-ACK (Synchronize-Acknowledge):** Server acknowledges receipt with \`ACK=1\`, \`Ack = ISN_c + 1\`, and sends its own \`SYN=1\` with \`Seq = ISN_s\`.\n3. **ACK (Acknowledge):** Client confirms with \`ACK=1\`, \`Ack = ISN_s + 1\`, transitioning both endpoints to the \`ESTABLISHED\` state.\n\n**Key Exam Keywords:** Sequence Number Synchronization, Full-Duplex Verification, Preventing Stale Duplicate Connections.`,
          diagramType: 'tcp-handshake',
          diagramTitle: 'RFC 793 Connection Establishment State Machine'
        };
      }
      return {
        text: `TCP uses a three-way handshake because network links are inherently unreliable. A two-way handshake wouldn't be enough! If an old, delayed SYN packet arrived at the server from an abandoned connection, the server would open a half-open socket and waste memory without the client ever knowing.\n\nThe 3-way handshake guarantees that both client and server mutually verify each other's presence and agree on initial sequence numbers before a single byte of application data is sent.`,
        diagramType: 'tcp-handshake',
        diagramTitle: 'Reliable Transport Verification'
      };
    }

    // 2. UDP vs TCP comparison
    if (lower.includes('udp') || lower.includes('faster') || lower.includes('difference')) {
      return {
        text: `Great question! While TCP acts like a registered certified postal letter (confirming every packet and retransmitting lost data), **UDP is like a live radio broadcast**.\n\nUDP does zero handshakes, zero packet acknowledgments, and zero retransmissions. That's why UDP is blindingly fast and ideal for live video calls, voice, and real-time gaming, where getting the latest frame right now matters more than waiting for a lost frame from 200 milliseconds ago.`,
        diagramType: 'packet-encapsulation',
        diagramTitle: 'TCP vs UDP Transport Layer Framing'
      };
    }

    // 3. Binary Search
    if (lower.includes('binary search') || lower.includes('search')) {
      return {
        text: `Imagine you're opening a 1,000-page dictionary looking for the word "Network". You don't start at page 1 and turn every single page! You flip right to the middle.\n\nIf the middle page is "Mountain", you know "Network" comes later, so you instantly throw away the entire first 500 pages. That's **Binary Search**! With every single step, it cuts the search space exactly in half, giving it an ultra-fast O(log N) runtime.`,
        diagramType: 'binary-search',
        diagramTitle: 'Binary Search O(log N) Divide & Conquer'
      };
    }

    // 4. Quiz Me Mode
    if (mode === 'quiz-me' || lower.includes('quiz')) {
      return {
        text: `Here is a quick diagnostic question to test your understanding:\n\n**Question:** During the TCP 3-way handshake, if the Client sends a SYN segment with sequence number \`400\`, what will the Server's SYN-ACK segment set as its \`Acknowledgment Number (Ack)\`?\n\n- A) 400\n- B) 401\n- C) 0\n- D) Random value\n\nWhat do you think? Type your answer or speak it!`,
        diagramType: 'tcp-handshake',
        diagramTitle: 'Interactive TCP Handshake Check'
      };
    }

    // 5. General / Contextual default
    return {
      text: `Let's break down "${userText}". In computer networking, everything follows a simple design principle: keeping links resilient while maximizing throughput.\n\nWhat specific part would you like to explore first? We can look at a visual diagram, step through an analogy, or do a quick practice quiz together!`,
      diagramType: 'packet-encapsulation',
      diagramTitle: `${currentTopic} Overview`
    };
  };

  // Submit Question / Prompt
  const handleAskQuestion = (queryText: string, mode?: ExplanationMode) => {
    const text = queryText.trim();
    if (!text) return;

    soundFx.playClick();

    // 1. Add student message
    const studentMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'student',
      text,
      timestamp: 'Just now',
      modeUsed: mode,
    };

    setMessages((prev) => [...prev, studentMsg]);
    setInputQuery('');
    setMood('thinking');

    // 2. Tutor reasoning delay
    setTimeout(() => {
      const response = generateEducationalResponse(text, mode, studentLevel);
      const tutorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'guidemaster',
        text: response.text,
        timestamp: 'Just now',
        diagramType: response.diagramType,
        diagramTitle: response.diagramTitle,
      };

      setMessages((prev) => [...prev, tutorMsg]);
      speakText(response.text);
    }, 600);
  };

  // Speech-To-Text / Voice Input via Web Speech API
  const handleToggleVoiceInput = () => {
    soundFx.playClick();

    if (isListeningVoice) {
      setIsListeningVoice(false);
      setMood('idle');
      return;
    }

    const SpeechRecognition = 
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. You can type your question!');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      setIsListeningVoice(true);
      setMood('listening');

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListeningVoice(false);
        setMood('thinking');
        handleAskQuestion(transcript);
      };

      recognition.onerror = () => {
        setIsListeningVoice(false);
        setMood('idle');
      };

      recognition.onend = () => {
        setIsListeningVoice(false);
      };

      recognition.start();
    } catch {
      setIsListeningVoice(false);
      setMood('idle');
    }
  };

  return (
    <div className={`flex flex-col bg-surface border border-outline-variant/30 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ${isFloating ? 'max-w-md w-full h-[620px]' : 'h-full w-full'} ${className}`}>
      
      {/* Tutor Header */}
      <div 
        className="p-4 border-b border-outline-variant/30 flex items-center justify-between shrink-0"
        style={{ backgroundColor: master.color.background }}
      >
        {/* Avatar & Mood Indicator */}
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center relative overflow-visible border shadow-xs"
            style={{ borderColor: master.color.border }}
          >
            <GuideMasterAvatar
              characterId={master.id}
              mood={mood}
              size="sm"
              isSpeaking={isSpeaking}
              amplitude={amplitude}
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-headline font-black text-sm text-on-surface">
                {master.name}
              </span>
              <span 
                className="px-2 py-0.2 rounded-full text-[9px] font-bold text-white uppercase tracking-wider"
                style={{ backgroundColor: master.color.primary }}
              >
                {master.role.split(' ')[0]}
              </span>
            </div>

            {/* Live Mood State */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono">
              <span className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? 'bg-primary animate-ping' : isListeningVoice ? 'bg-sky-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span className="text-on-surface-variant capitalize">
                {isSpeaking ? '● Explaining' : isListeningVoice ? '● Listening to You...' : mood === 'thinking' ? '● Thinking...' : '● Ready to Help'}
              </span>
            </div>
          </div>
        </div>

        {/* Top Controls: Mute, Voice rate, Change Tutor */}
        <div className="flex items-center gap-1">
          {/* Mute Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              setIsMuted((m) => !m);
              if (!isMuted && typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
              }
            }}
            className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Tutor' : 'Mute Tutor'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Change Tutor Studio Link */}
          {onNavigateToSelect && (
            <button
              onClick={() => {
                soundFx.playClick();
                onNavigateToSelect();
              }}
              className="px-2.5 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface transition-colors cursor-pointer flex items-center gap-1"
              title="Select another GuideMaster"
            >
              <span>Change Tutor</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-outline hover:text-on-surface transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Adaptive Level Selector Bar */}
      <div className="px-4 py-2 bg-surface-container-lowest border-b border-outline-variant/20 flex items-center justify-between text-xs shrink-0">
        <span className="font-bold text-outline uppercase text-[10px] tracking-wider">
          Student Level:
        </span>
        <div className="flex items-center gap-1 bg-surface-container p-0.5 rounded-xl border border-outline-variant/30">
          {(['beginner', 'intermediate', 'advanced', 'exam'] as StudentLevel[]).map((lvl) => (
            <button
              key={lvl}
              onClick={() => {
                soundFx.playClick();
                setStudentLevel(lvl);
              }}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold capitalize transition-all cursor-pointer ${
                studentLevel === lvl
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Main Conversation Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-0 bg-surface">
        {messages.map((msg) => {
          const isTutor = msg.sender === 'guidemaster';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isTutor ? 'items-start' : 'items-end'} space-y-1`}
            >
              <div
                className={`max-w-[88%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                  isTutor
                    ? 'bg-surface-container-low border border-outline-variant/30 text-on-surface shadow-xs'
                    : 'bg-primary-container text-white shadow-sm font-medium'
                }`}
              >
                {/* Message Body */}
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Synchronized Visual Teaching Diagram if present */}
                {isTutor && msg.diagramType && (
                  <div className="mt-3">
                    <VisualTeachingCanvas
                      diagramType={msg.diagramType}
                      topicTitle={msg.diagramTitle}
                    />
                  </div>
                )}
              </div>

              {/* Timestamp & Replay Button */}
              <div className="flex items-center gap-2 px-1 text-[10px] text-outline font-mono">
                <span>{msg.timestamp}</span>
                {isTutor && (
                  <button
                    onClick={() => speakText(msg.text)}
                    className="hover:text-primary transition-colors cursor-pointer flex items-center gap-1"
                    title="Replay speech"
                  >
                    <Volume2 size={11} /> Replay
                  </button>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 11 Quick Pedagogical Mode Buttons */}
      <div className="px-3 py-2 bg-surface-container-lowest border-t border-outline-variant/20 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {explanationModes.map((m) => (
            <button
              key={m.mode}
              onClick={() => handleAskQuestion(`Can you ${m.label.toLowerCase()} this?`, m.mode)}
              className="px-2.5 py-1 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-[11px] font-bold text-on-surface-variant hover:text-on-surface whitespace-nowrap transition-all cursor-pointer shrink-0"
            >
              <span className="mr-1">{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat & Voice Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAskQuestion(inputQuery);
        }}
        className="p-3 bg-surface-container border-t border-outline-variant/30 flex items-center gap-2 shrink-0"
      >
        {/* Voice Input Mic Button */}
        <button
          type="button"
          onClick={handleToggleVoiceInput}
          className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
            isListeningVoice
              ? 'bg-rose-500 text-white border-rose-600 animate-pulse shadow-md'
              : 'bg-surface-container-lowest text-on-surface-variant hover:text-primary border-outline-variant/40'
          }`}
          title={isListeningVoice ? 'Listening... click to stop' : 'Speak to GuideMaster'}
        >
          {isListeningVoice ? <Mic size={18} /> : <MicOff size={18} />}
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder={`Ask ${master.name} anything... (e.g. "Why does TCP use a 3-way handshake?")`}
          className="flex-1 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputQuery.trim()}
          className="p-2.5 rounded-2xl bg-primary text-white hover:brightness-105 active:brightness-95 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer shadow-xs"
        >
          <Send size={18} />
        </button>
      </form>

    </div>
  );
};
