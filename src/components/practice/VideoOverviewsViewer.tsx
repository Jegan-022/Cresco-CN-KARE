import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  BookOpen, 
  ListVideo,
  Award,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface Chapter {
  time: string;
  seconds: number;
  title: string;
  summary: string;
}

interface VideoLesson {
  id: string;
  unit: string;
  unitNum: 3 | 4 | 5;
  title: string;
  duration: string;
  totalSeconds: number;
  thumbnailGradient: string;
  youtubeId?: string;
  overview: string;
  chapters: Chapter[];
  keyTakeaways: string[];
  examTips: string;
}

const VIDEO_LESSONS: VideoLesson[] = [
  {
    id: 'vid-u3-01',
    unit: 'Unit 3',
    unitNum: 3,
    title: 'IPv4 vs IPv6 Packet Headers & Subnetting Deep Dive',
    duration: '14:20',
    totalSeconds: 860,
    thumbnailGradient: 'from-sky-600 via-blue-700 to-indigo-900',
    overview: 'Comprehensive visual walkthrough of Network Layer packet mechanics, IP header fields (TTL, checksum, fragment offsets), IPv6 128-bit hexadecimal addressing, and fast CIDR subnet calculation methods.',
    chapters: [
      { time: '00:00', seconds: 0, title: 'Network Layer Store-and-Forward', summary: 'How routers decouple link-layer frames and route datagrams hop-by-hop.' },
      { time: '03:15', seconds: 195, title: 'IPv4 Header: TTL, Fragmentation, Checksum', summary: 'Breakdown of the 20-byte base header and how fragmentation offsets prevent packet loss.' },
      { time: '07:40', seconds: 460, title: 'Subnetting & CIDR Slash Notation', summary: 'Calculating network ID, broadcast address, and usable host count in seconds.' },
      { time: '11:10', seconds: 670, title: 'IPv6 Simplified 40-byte Header & Flow Labels', summary: 'Why IPv6 eliminated header checksums and broadcast for enhanced routing speed.' }
    ],
    keyTakeaways: [
      'IPv4 headers require 20-60 bytes; IPv6 uses a fixed 40-byte base header with optional chained extension headers.',
      'CIDR notation (/n) indicates the prefix length of network bits; remaining 32 - n bits represent host IDs.',
      'Routers decrement TTL by 1 at each hop; when TTL = 0, an ICMP "Time Exceeded" datagram is sent back to the sender.'
    ],
    examTips: 'Exam favorite: Given IP 192.168.10.130/26, determine Subnet Mask (255.255.255.192), Network ID (192.168.10.128), and Broadcast (192.168.10.191).'
  },
  {
    id: 'vid-u3-02',
    unit: 'Unit 3',
    unitNum: 3,
    title: 'Routing Protocols: Distance Vector (RIP) vs Link State (OSPF)',
    duration: '16:45',
    totalSeconds: 1005,
    thumbnailGradient: 'from-blue-600 via-indigo-700 to-violet-900',
    overview: 'Visualizing graph algorithms in computer networks: Bellman-Ford versus Dijkstra. Learn how count-to-infinity occurs and how OSPF link-state advertisements maintain identical topology databases.',
    chapters: [
      { time: '00:00', seconds: 0, title: 'The Global Routing Problem', summary: 'Autonomous systems, intra-domain vs inter-domain routing architectures.' },
      { time: '03:30', seconds: 210, title: 'Distance Vector & Bellman-Ford', summary: 'Sharing distance vectors only with immediate physical neighbors.' },
      { time: '07:15', seconds: 435, title: 'Count-to-Infinity & Split Horizon', summary: 'Why routing loops occur and how poison reverse mitigates convergence failure.' },
      { time: '11:50', seconds: 710, title: 'OSPF & Dijkstra Shortest Path First', summary: 'Flooding LSAs to build full network topology graph before local shortest path calculations.' }
    ],
    keyTakeaways: [
      'RIP is limited to a maximum hop count of 15; hop 16 is treated as infinity/unreachable.',
      'OSPF uses Dijkstra algorithm with link cost (bandwidth-based metric) and converges significantly faster than RIP.',
      'BGP uses path-vector routing and governs policy-based routing between Internet Autonomous Systems (AS).'
    ],
    examTips: 'Know the 3 solutions to the Count-to-Infinity problem: Split Horizon, Poison Reverse, and Hold-down Timers.'
  },
  {
    id: 'vid-u4-01',
    unit: 'Unit 4',
    unitNum: 4,
    title: 'TCP Handshake, Sliding Window & Reliable Delivery',
    duration: '18:10',
    totalSeconds: 1090,
    thumbnailGradient: 'from-emerald-600 via-teal-700 to-cyan-900',
    overview: 'Trace the full lifecycle of a TCP connection: SYN, SYN-ACK, ACK 3-way handshake, sequence/acknowledgment tracking, cumulative ACKs, dynamic sliding window flow control, and FIN teardown.',
    chapters: [
      { time: '00:00', seconds: 0, title: 'Transport Layer Purpose', summary: 'Process-to-process communication using 16-bit Port numbers.' },
      { time: '03:40', seconds: 220, title: 'Three-Way Handshake Step-by-Step', summary: 'Random Initial Sequence Numbers (ISN) and SYN flood defenses.' },
      { time: '08:15', seconds: 495, title: 'Sliding Window & Flow Control', summary: 'Receiver advertised window (rwnd) preventing buffer overflow.' },
      { time: '13:00', seconds: 780, title: 'Connection Teardown & TIME_WAIT', summary: 'Four-way FIN/ACK handshake and the 2MSL wait state.' }
    ],
    keyTakeaways: [
      'TCP is connection-oriented, byte-stream oriented, and guarantees reliable, in-order delivery.',
      'Acknowledgment number is always the next byte number the receiver expects to get.',
      'TIME_WAIT lasts 2 * MSL (Maximum Segment Lifetime) to ensure lingering ACKs clear the network.'
    ],
    examTips: 'Formula for Effective Window: min(Congestion Window, Receiver Window) = min(cwnd, rwnd).'
  },
  {
    id: 'vid-u4-02',
    unit: 'Unit 4',
    unitNum: 4,
    title: 'TCP Congestion Control: Slow Start, AIMD & Fast Retransmit',
    duration: '15:30',
    totalSeconds: 930,
    thumbnailGradient: 'from-teal-600 via-cyan-700 to-blue-900',
    overview: 'How the Internet avoids complete collapse under load: explore Tahoe and Reno congestion control mechanisms, cwnd exponential growth, additive increase multiplicative decrease, and 3 duplicate ACKs.',
    chapters: [
      { time: '00:00', seconds: 0, title: 'Flow Control vs Congestion Control', summary: 'The critical difference: protecting the host vs protecting the network pipes.' },
      { time: '04:10', seconds: 250, title: 'Slow Start Phase', summary: 'Exponential cwnd doubling each round-trip time (RTT) until ssthresh.' },
      { time: '08:30', seconds: 510, title: 'AIMD (Additive Increase Multiplicative Decrease)', summary: 'Linear cwnd increase (+1 MSS/RTT) and halving cwnd upon packet loss.' },
      { time: '12:00', seconds: 720, title: 'Fast Retransmit & Fast Recovery', summary: 'Triggering retransmission after 3 duplicate ACKs without waiting for RTO timeout.' }
    ],
    keyTakeaways: [
      'Slow Start doubles cwnd every RTT until cwnd >= ssthresh (Slow Start Threshold).',
      'Timeout indicates severe congestion -> cwnd drops to 1 MSS, ssthresh = cwnd / 2.',
      '3 Duplicate ACKs indicate mild congestion -> TCP Reno sets cwnd = ssthresh = cwnd / 2 (Fast Recovery).'
    ],
    examTips: 'Always sketch the sawtooth wave diagram for TCP Reno cwnd over time in semester exams for full marks.'
  },
  {
    id: 'vid-u5-01',
    unit: 'Unit 5',
    unitNum: 5,
    title: 'Application Layer Architecture: DNS, HTTP/2/3 & Web Mechanics',
    duration: '17:50',
    totalSeconds: 1070,
    thumbnailGradient: 'from-amber-600 via-orange-700 to-rose-900',
    overview: 'Master client-server versus P2P models, the hierarchical Domain Name System with root, TLD, and authoritative nameservers, iterative vs recursive queries, HTTP/1.1 head-of-line blocking, and HTTP/3 QUIC.',
    chapters: [
      { time: '00:00', seconds: 0, title: 'Client-Server vs Peer-to-Peer', summary: 'Centralized server bottlenecks versus distributed decentralized swarming.' },
      { time: '04:20', seconds: 260, title: 'DNS Hierarchical Resolution', summary: 'Root servers (A-M), Top-Level Domains (.com, .edu), and Authoritative name servers.' },
      { time: '09:00', seconds: 540, title: 'HTTP/1.1 vs HTTP/2 Multiplexing', summary: 'Binary framing layers, stream interleaving, and eliminating head-of-line blocking.' },
      { time: '13:40', seconds: 820, title: 'HTTP/3 over QUIC (UDP)', summary: 'Zero-RTT handshakes and connection migration when switching Wi-Fi to cellular.' }
    ],
    keyTakeaways: [
      'DNS queries typically use UDP port 53 for speed; zone transfers use TCP port 53 for reliability.',
      'HTTP/2 introduces binary framing and stream multiplexing over a single persistent TCP connection.',
      'HTTP/3 runs over QUIC (UDP), eliminating TCP head-of-line blocking when a single packet drops.'
    ],
    examTips: 'Be ready to draw the 8-step iterative DNS query sequence from client resolver to root, TLD, and authoritative server.'
  },
  {
    id: 'vid-u5-02',
    unit: 'Unit 5',
    unitNum: 5,
    title: 'Internet Mail (SMTP, POP3, IMAP) & Network Security Protocols',
    duration: '13:45',
    totalSeconds: 825,
    thumbnailGradient: 'from-purple-600 via-indigo-700 to-pink-900',
    overview: 'Understand push vs pull email protocols, why SMTP uses port 25/587 for delivery while POP3/IMAP manage mailboxes, plus an introduction to SSL/TLS encryption, symmetric vs asymmetric keys, and cryptographic integrity.',
    chapters: [
      { time: '00:00', seconds: 0, title: 'Email System Architecture', summary: 'User Agents (UA), Mail Transfer Agents (MTA), and Mail Delivery Agents (MDA).' },
      { time: '03:45', seconds: 225, title: 'SMTP Push vs POP3/IMAP Pull', summary: 'Why two different protocol families are necessary for senders and recipients.' },
      { time: '07:30', seconds: 450, title: 'TLS/SSL Cryptographic Handshake', summary: 'Public key exchange for asymmetric negotiation of a fast symmetric session key.' },
      { time: '10:50', seconds: 650, title: 'Firewalls & Network Defense', summary: 'Packet filtering, stateful inspection, and application-layer proxy gateways.' }
    ],
    keyTakeaways: [
      'SMTP is a push protocol using TCP port 25/587; POP3 (port 110) and IMAP (port 143) are pull protocols.',
      'IMAP maintains server-side sync across multiple client devices; POP3 downloads and optionally deletes locally.',
      'TLS combines asymmetric cryptography (RSA/ECDH) for handshake and symmetric cryptography (AES-GCM) for data transfer.'
    ],
    examTips: 'Remember standard port numbers: SMTP=25/587, POP3=110, IMAP=143, HTTPS=443, DNS=53, SSH=22.'
  }
];

export const VideoOverviewsViewer: React.FC = () => {
  const [selectedUnit, setSelectedUnit] = useState<3 | 4 | 5 | 'all'>('all');
  const [activeLessonId, setActiveLessonId] = useState<string>(VIDEO_LESSONS[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(35); // simulated percent
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.25 | 1.5>(1);
  const [watchedLessons, setWatchedLessons] = useState<Record<string, boolean>>({
    'vid-u3-01': true
  });

  const activeLesson = VIDEO_LESSONS.find(v => v.id === activeLessonId) || VIDEO_LESSONS[0];

  const filteredLessons = selectedUnit === 'all' 
    ? VIDEO_LESSONS 
    : VIDEO_LESSONS.filter(v => v.unitNum === selectedUnit);

  const togglePlay = () => {
    soundFx.playClick();
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (percentage: number) => {
    soundFx.playPacketPop();
    setCurrentProgress(percentage);
  };

  const handleMarkCompleted = (lessonId: string) => {
    soundFx.playLevelUp();
    setWatchedLessons(prev => ({
      ...prev,
      [lessonId]: !prev[lessonId]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header Bar & Unit Switcher */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
            <ListVideo className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Curated Video Lesson Overviews
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Interactive Player
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              High-yield visual walkthroughs, chapter breakdown, and key exam takeaways for Units 3, 4 & 5
            </p>
          </div>
        </div>

        {/* Unit Selector Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {(['all', 3, 4, 5] as const).map(u => (
            <button
              key={u}
              onClick={() => {
                soundFx.playPacketPop();
                setSelectedUnit(u);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedUnit === u
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {u === 'all' ? 'All Units' : `Unit ${u}`}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Player & Playlist Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Video Player & Overview Content (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Simulated Premium Video Player Screen */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative group">
            {/* Screen Viewport with Gradient Thumbnail */}
            <div className={`relative h-64 sm:h-80 md:h-96 w-full bg-gradient-to-tr ${activeLesson.thumbnailGradient} flex flex-col justify-between p-6 overflow-hidden`}>
              {/* Subtle Animated Background Grid */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
              
              {/* Top Controls Overlay */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold border border-white/10">
                    {activeLesson.unit}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-slate-300 text-xs font-mono border border-white/5 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    {activeLesson.duration}
                  </span>
                </div>

                <button
                  onClick={() => handleMarkCompleted(activeLesson.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                    watchedLessons[activeLesson.id]
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md border border-white/20'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {watchedLessons[activeLesson.id] ? 'Completed (+25 XP)' : 'Mark Watched'}
                </button>
              </div>

              {/* Center Play Button & Title */}
              <div className="relative z-10 text-center my-auto px-4">
                <button
                  onClick={togglePlay}
                  className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all group-hover:ring-8 group-hover:ring-white/20"
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7 sm:w-8 sm:h-8 fill-slate-900" />
                  ) : (
                    <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-slate-900 ml-1" />
                  )}
                </button>
                <h3 className="mt-4 text-base sm:text-lg md:text-xl font-black text-white drop-shadow-md max-w-xl mx-auto line-clamp-2">
                  {activeLesson.title}
                </h3>
              </div>

              {/* Bottom Video Progress Scrub Bar */}
              <div className="relative z-10 space-y-2 bg-gradient-to-t from-black/80 to-transparent p-2 -mx-6 -mb-6">
                <div 
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percent = Math.round((clickX / rect.width) * 100);
                    handleSeek(Math.min(100, Math.max(0, percent)));
                  }}
                  className="w-full h-2 bg-white/20 rounded-full cursor-pointer relative overflow-hidden group/bar"
                >
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-400 to-sky-400 rounded-full transition-all duration-150"
                    style={{ width: `${currentProgress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-300 font-mono pt-1">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={togglePlay}
                      className="hover:text-white transition-colors"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => handleSeek(0)}
                      className="hover:text-white transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className="hover:text-white transition-colors"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <span>
                      {Math.floor((activeLesson.totalSeconds * currentProgress) / 6000)}:
                      {String(Math.floor(((activeLesson.totalSeconds * currentProgress) / 100) % 60)).padStart(2, '0')} / {activeLesson.duration}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {([1, 1.25, 1.5] as const).map(speed => (
                      <button
                        key={speed}
                        onClick={() => {
                          soundFx.playPacketPop();
                          setPlaybackSpeed(speed);
                        }}
                        className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                          playbackSpeed === speed
                            ? 'bg-white text-slate-950'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Overview Summary Under Player */}
            <div className="p-6 bg-slate-900/90 border-t border-slate-800 space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Lesson Overview</span>
                <p className="mt-1 text-sm text-slate-300 leading-relaxed">
                  {activeLesson.overview}
                </p>
              </div>

              {/* Chapters & Timeline Navigator */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <ListVideo className="w-3.5 h-3.5 text-indigo-400" />
                  Key Chapters & Interactive Timestamps
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeLesson.chapters.map((ch, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const pct = Math.round((ch.seconds / activeLesson.totalSeconds) * 100);
                        handleSeek(pct);
                      }}
                      className="text-left p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 hover:border-indigo-500/40 transition-all group/ch"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-indigo-400 group-hover/ch:text-indigo-300 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {ch.time}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover/ch:text-indigo-400 transition-colors" />
                      </div>
                      <div className="text-xs font-semibold text-white group-hover/ch:text-indigo-200">
                        {ch.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                        {ch.summary}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Key Takeaways Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-950 border border-indigo-500/20">
                <div className="flex items-center gap-2 mb-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  High-Yield Takeaways
                </div>
                <ul className="space-y-1.5">
                  {activeLesson.keyTakeaways.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Exam Highlight Banner */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                <Award className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                    Exam Strategy Note
                  </div>
                  <div className="text-xs text-amber-200/90 mt-0.5">
                    {activeLesson.examTips}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Video Playlist & Topic List (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ListVideo className="w-4 h-4 text-indigo-400" />
                Lesson Modules ({filteredLessons.length})
              </h3>
              <span className="text-[11px] text-slate-400">
                {Object.values(watchedLessons).filter(Boolean).length} / {VIDEO_LESSONS.length} Done
              </span>
            </div>

            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredLessons.map((lesson) => {
                const isActive = lesson.id === activeLesson.id;
                const isCompleted = !!watchedLessons[lesson.id];

                return (
                  <div
                    key={lesson.id}
                    onClick={() => {
                      soundFx.playClick();
                      setActiveLessonId(lesson.id);
                      setIsPlaying(true);
                      setCurrentProgress(0);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-950/60 border-indigo-500/60 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-500/40'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {isActive && isPlaying ? (
                          <div className="flex items-center gap-0.5 h-3">
                            <span className="w-1 bg-white animate-pulse h-3 rounded" />
                            <span className="w-1 bg-white animate-pulse delay-75 h-2 rounded" />
                            <span className="w-1 bg-white animate-pulse delay-150 h-3 rounded" />
                          </div>
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide">
                            {lesson.unit}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {lesson.duration}
                          </span>
                        </div>
                        <h4 className={`text-xs font-semibold line-clamp-2 ${
                          isActive ? 'text-white font-bold' : 'text-slate-300'
                        }`}>
                          {lesson.title}
                        </h4>
                        
                        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/60">
                          <span className="text-[10px] text-slate-400">
                            {lesson.chapters.length} chapters
                          </span>
                          {isCompleted ? (
                            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                              <CheckCircle2 className="w-3 h-3" /> Done
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">
                              +25 XP
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
