import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  BookOpen, 
  ListVideo,
  Award,
  ExternalLink,
  ChevronRight,
  Youtube
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
  youtubeId: string;
  overview: string;
  chapters: Chapter[];
  keyTakeaways: string[];
  examTips: string;
}

const VIDEO_LESSONS: VideoLesson[] = [
  // ==========================================
  // UNIT 3: IP ADDRESSING & ROUTING (6 Real Tutorials)
  // ==========================================
  {
    id: 'vid-u3-01',
    unit: 'Unit 3',
    unitNum: 3,
    title: 'IP Address Classes, Subnet Masks & Hosts',
    duration: '12:45',
    totalSeconds: 765,
    youtubeId: 'Uenl6HAR5r8',
    overview: 'Complete visual guide to IPv4 32-bit address architecture, Class A, B, C, D, and E boundary definitions, default subnet masks, and the mathematical deduction of usable host addresses per network.',
    chapters: [
      { time: '00:00', seconds: 0, title: 'IPv4 32-bit Structure', summary: 'Dotted decimal notation and 4-octet division.' },
      { time: '02:30', seconds: 150, title: 'Class A, B, C, D, E Breakdown', summary: 'Leading bit patterns: 0 for Class A, 10 for B, 110 for C.' },
      { time: '06:15', seconds: 375, title: 'Default Subnet Masks', summary: '/8 (255.0.0.0), /16 (255.255.0.0), and /24 (255.255.255.0).' },
      { time: '09:40', seconds: 580, title: 'Usable Hosts Calculation (2^H - 2)', summary: 'Why 2 addresses are reserved for network ID and broadcast.' }
    ],
    keyTakeaways: [
      'Class A: 1.0.0.0 – 126.255.255.255 (/8 default mask, 16.7M hosts/network).',
      'Class B: 128.0.0.0 – 191.255.255.255 (/16 default mask, 65,534 hosts/network).',
      'Class C: 192.0.0.0 – 223.255.255.255 (/24 default mask, 254 hosts/network).',
      '127.0.0.0/8 is strictly reserved for loopback diagnostics (localhost).'
    ],
    examTips: 'In exam numericals, always subtract 2 from total host IP combinations: Total Usable Hosts = (2^h) - 2.'
  },
  {
    id: 'vid-u3-02',
    unit: 'Unit 3',
    unitNum: 3,
    title: 'Network, Broadcast & Host Addressing',
    duration: '11:15',
    totalSeconds: 675,
    youtubeId: 'mNXlW3b7Xss',
    overview: 'Understanding the distinct roles of the Network ID, Direct Broadcast Address, Limited Broadcast (255.255.255.255), and specific host address configurations inside local subnets.',
    chapters: [
      { time: '00:00', seconds: 0, title: 'Network ID as Routing Destination', summary: 'Why routers match network prefixes rather than individual hosts.' },
      { time: '03:10', seconds: 190, title: 'Direct Broadcast vs Limited Broadcast', summary: 'All host bits as 1s vs 255.255.255.255 local wire broadcast.' },
      { time: '06:45', seconds: 405, title: 'Host Bit Patterns', summary: 'Assigning valid IP addresses between Network ID + 1 and Broadcast - 1.' },
      { time: '09:20', seconds: 560, title: 'Router Gateway Assignment', summary: 'Convention of assigning first or last usable IP to the default gateway.' }
    ],
    keyTakeaways: [
      'Network ID has all host bits set to 0 and represents the entire subnetwork.',
      'Directed Broadcast has all host bits set to 1 and sends a packet to all hosts on that target subnet.',
      'Routers drop limited broadcast (255.255.255.255) by default to prevent broadcast radiation storms across the WAN.'
    ],
    examTips: 'For any IP and subnet mask: bitwise AND between the IP and Subnet Mask always yields the Network ID.'
  },
  {
    id: 'vid-u3-03',
    unit: 'Unit 3',
    unitNum: 3,
    title: 'Subnetting with IP Addressing',
    duration: '15:20',
    totalSeconds: 920,
    youtubeId: '-ZsY4kw8zYU',
    overview: 'Step-by-step mathematical guide to subnetting: borrowing host bits to create custom network divisions, calculating custom subnet masks, block size increments, and subnet ranges.',
    chapters: [
      { time: '00:00', seconds: 0, title: 'Why Subnetting is Essential', summary: 'Eliminating address wastage and segmenting traffic broadcast domains.' },
      { time: '03:40', seconds: 220, title: 'Borrowing Host Bits (2^S Rule)', summary: 'How borrowing n bits produces 2^n subnets.' },
      { time: '07:30', seconds: 450, title: 'Block Size (Magic Number Method)', summary: '256 minus the interesting octet value gives the exact jump interval.' },
      { time: '11:50', seconds: 710, title: 'Complete Subnet Table Construction', summary: 'Listing network ID, usable host range, and broadcast for every subnet.' }
    ],
    keyTakeaways: [
      'Each borrowed host bit doubles the number of subnets (2^n) and halves the available hosts per subnet (2^(h-n) - 2).',
      'Interesting octet values: /25=128 (jump 128), /26=192 (jump 64), /27=224 (jump 32), /28=240 (jump 16), /29=248 (jump 8), /30=252 (jump 4).',
      '/30 subnets are commonly used for point-to-point router links because they provide exactly 2 usable host IPs.'
    ],
    examTips: 'Magic Number shortcut: 256 - [last octet of subnet mask] = step size between consecutive subnet network IDs.'
  },
  {
    id: 'vid-u3-04',
    unit: 'Unit 3',
    unitNum: 3,
    title: 'Classful & Classless Addressing (CIDR)',
    duration: '13:50',
    totalSeconds: 830,
    youtubeId: 'DWzm3xOAgm8',
    overview: 'Comparing traditional Classful boundaries against modern Classless Inter-Domain Routing (CIDR, RFC 1519), slash prefix notation, VLSM (Variable Length Subnet Masking), and route aggregation.',
    chapters: [
      { time: '00:00', seconds: 0, title: 'Limits of Classful Routing', summary: 'Huge address waste in Class A/B allocations causing address exhaustion.' },
      { time: '04:15', seconds: 255, title: 'CIDR Slash Notation (/n)', summary: 'Arbitrary prefix length representing network bits independent of classes.' },
      { time: '08:00', seconds: 480, title: 'Route Aggregation & Supernetting', summary: 'Summarizing multiple contiguous /24 prefixes into a single /22 route.' },
      { time: '11:10', seconds: 670, title: 'Longest Prefix Match Rule', summary: 'How routing tables select the most specific matching prefix.' }
    ],
    keyTakeaways: [
      'CIDR freed the Internet from rigid /8, /16, and /24 class boundaries.',
      'Supernetting combines multiple continuous classful networks into one advertised route entry.',
      'Routers resolve packet destinations using Longest Prefix Match (LPM) hardware routing caches.'
    ],
    examTips: 'If two route table entries match an incoming IP (e.g. 10.1.0.0/16 vs 10.1.2.0/24), the router MUST forward via the longer prefix (/24).'
  },
  {
    id: 'vid-u3-05',
    unit: 'Unit 3',
    unitNum: 3,
    title: 'Shortest Path Routing Algorithm',
    duration: '16:30',
    totalSeconds: 990,
    youtubeId: 'BQf_twCuibk',
    overview: 'In-depth graph theoretical walkthrough of Dijkstra’s Shortest Path First (SPF) algorithm: tentative vs permanent node sets, edge weights, relaxation steps, and routing table derivation.',
    chapters: [
      { time: '00:00', seconds: 0, title: 'Network as a Weighted Graph', summary: 'Routers as vertices (V) and physical communication links as edges (E).' },
      { time: '03:45', seconds: 225, title: 'Dijkstra Algorithm Principles', summary: 'Greedy single-source shortest path with non-negative edge costs.' },
      { time: '08:10', seconds: 490, title: 'Step-by-Step Relaxation Table', summary: 'Updating tentative path costs and picking the minimum unvisited vertex.' },
      { time: '13:00', seconds: 780, title: 'Building the Shortest Path Tree (SPT)', summary: 'Extracting next-hop forwarding table from the computed SPT.' }
    ],
    keyTakeaways: [
      'Dijkstra requires all edge weights to be non-negative (links costs >= 0).',
      'Time complexity using a min-heap priority queue is O((V + E) log V).',
      'Forms the mathematical foundation for Link-State routing protocols like OSPF and IS-IS.'
    ],
    examTips: 'Always maintain 3 columns in semester exam tables: Visited Nodes, Tentative Distances, and Predecessor Node.'
  },
  {
    id: 'vid-u3-06',
    unit: 'Unit 3',
    unitNum: 3,
    title: 'Link State Routing Algorithm',
    duration: '17:15',
    totalSeconds: 1035,
    youtubeId: 'QPVkpuFJGm0',
    overview: 'How Open Shortest Path First (OSPF) executes Link-State routing: discovering neighbors with Hello packets, constructing Link-State Advertisements (LSAs), reliable flooding, and LSDB synchronization.',
    chapters: [
      { time: '00:00', seconds: 0, title: 'Link State vs Distance Vector', summary: 'Sharing full topology knowledge with everyone vs sharing distance with neighbors.' },
      { time: '04:10', seconds: 250, title: 'Hello Protocol & Adjacency', summary: 'Neighbor discovery and Designated Router (DR/BDR) election.' },
      { time: '08:35', seconds: 515, title: 'LSA Flooding & Aging', summary: 'Reliable hop-by-hop flooding and Sequence number tracking.' },
      { time: '13:20', seconds: 800, title: 'Link State Database (LSDB) Sync', summary: 'Guaranteeing identical topology maps across all routers in an OSPF area.' }
    ],
    keyTakeaways: [
      'Every router in an OSPF area possesses an identical Link-State Database (LSDB).',
      'Link State converges significantly faster than Distance Vector and is completely immune to the Count-to-Infinity problem.',
      'Link costs in OSPF are calculated using reference bandwidth: Cost = Reference Bandwidth / Link Bandwidth.'
    ],
    examTips: 'Key difference for exams: Distance Vector tells "what it knows to who it knows"; Link State tells "who it knows to what it knows (everyone)".'
  },

  // ==========================================
  // UNIT 4: TRANSPORT LAYER MECHANISMS (5 Real Tutorials)
  // ==========================================
  {
    id: 'vid-u4-01',
    unit: 'Unit 4',
    unitNum: 4,
    title: 'TCP Explained – Three-Way Handshake',
    duration: '14:40',
    totalSeconds: 880,
    youtubeId: 'mbKmqy0wIqg',
    overview: 'Trace the complete connection setup of TCP: client SYN packet, server SYN-ACK response, client final ACK, random Initial Sequence Number (ISN) security, and socket state transitions.',
    chapters: [
      { time: '00:00', seconds: 0, title: 'Transport Layer Process-to-Process', summary: 'How port numbers direct byte streams to specific OS socket processes.' },
      { time: '03:15', seconds: 195, title: 'Step 1: Client SYN & ISN Generation', summary: 'Client chooses random ISN_c and sets SYN flag bit = 1.' },
      { time: '07:00', seconds: 420, title: 'Step 2: Server SYN-ACK Response', summary: 'Server acknowledges client (ACK = ISN_c + 1) and sends own ISN_s.' },
      { time: '11:00', seconds: 660, title: 'Step 3: Client Final ACK & Established State', summary: 'Client acknowledges server (ACK = ISN_s + 1) and enters ESTABLISHED.' }
    ],
    keyTakeaways: [
      'TCP handshake establishes bidirectional sequence numbers before any payload data is exchanged.',
      'SYN packet consumes exactly 1 sequence number even though it contains 0 bytes of application data.',
      'Random Initial Sequence Numbers (ISNs) defend against TCP connection spoofing and replay attacks.'
    ],
    examTips: 'Question tip: In Step 2, if client sent SEQ=100, server responds with ACK=101. If server chooses SEQ=300, client replies in Step 3 with ACK=301.'
  },
  {
    id: 'vid-u4-02',
    unit: 'Unit 4',
    unitNum: 4,
    title: 'Congestion Control Techniques',
    duration: '16:00',
    totalSeconds: 960,
    youtubeId: 'Xg3l7lorzMA',
    overview: 'Principles of network congestion control vs host flow control: open-loop vs closed-loop strategies, Leaky Bucket traffic shaping, Token Bucket burst tolerance, and TCP AIMD mechanisms.',
    chapters: [
      { time: '00:00', seconds: 0, title: 'The Congestion Collapse Problem', summary: 'Packet drops causing retransmissions and complete throughput breakdown.' },
      { time: '03:45', seconds: 225, title: 'Leaky Bucket Algorithm', summary: 'Transforming variable, bursty input streams into constant, steady output rate.' },
      { time: '08:20', seconds: 500, title: 'Token Bucket Algorithm', summary: 'Accumulating tokens at constant rate to permit regulated traffic bursts.' },
      { time: '12:30', seconds: 750, title: 'TCP AIMD & Congestion Window (cwnd)', summary: 'Additive Increase (+1 MSS per RTT) and Multiplicative Decrease (halving cwnd).' }
    ],
    keyTakeaways: [
      'Leaky Bucket enforces rigid, uniform traffic output; packets exceeding bucket capacity are discarded.',
      'Token Bucket permits bursty traffic up to the token capacity while maintaining average rate bounds.',
      'TCP Congestion Window (cwnd) is dynamically adjusted by the sender based on packet loss feedback.'
    ],
    examTips: 'Exam comparative table: Leaky Bucket shapes traffic to constant rate; Token Bucket allows bounded bursts while capping average rate.'
  },
  {
    id: 'vid-u4-03',
    unit: 'Unit 4',
    unitNum: 4,
    title: 'UDP Protocol Explained',
    duration: '10:50',
    totalSeconds: 650,
    youtubeId: 'wBjKY4k8qxs',
    overview: 'User Datagram Protocol (UDP, RFC 768): lightweight 8-byte header, connectionless design, no handshake latency, multiplexing/demultiplexing via ports, and optional checksum verification.',
    chapters: [
      { time: '00:00', seconds: 0, title: 'Why UDP Exists Alongside TCP', summary: 'Speed, low latency, and zero connection setup overhead.' },
      { time: '02:50', seconds: 170, title: 'The 8-Byte UDP Header Breakdown', summary: 'Source Port (16b), Destination Port (16b), Length (16b), Checksum (16b).' },
      { time: '06:15', seconds: 375, title: 'Checksum & 12-Byte Pseudo-Header', summary: 'Verifying IP address delivery integrity without a network-layer dependency.' },
      { time: '08:45', seconds: 525, title: 'Ideal Real-World Use Cases', summary: 'DNS, DHCP, VoIP, live video conferencing, and HTTP/3 QUIC foundations.' }
    ],
    keyTakeaways: [
      'UDP header overhead is strictly 8 bytes (compared to TCP minimum 20 bytes).',
      'UDP does not perform flow control, congestion control, or automatic retransmissions.',
      'Real-time streaming prefers UDP because retransmitted late video/voice packets are useless to human viewers.'
    ],
    examTips: 'Remember the 4 UDP header fields: Source Port (16b), Destination Port (16b), Length (16b), Checksum (16b) = Total 64 bits (8 bytes).'
  },
  {
    id: 'vid-u4-04',
    unit: 'Unit 4',
    unitNum: 4,
    title: 'Transmission Control Protocol (TCP)',
    duration: '18:20',
    totalSeconds: 1100,
    youtubeId: '9QZGKhegzUc',
    overview: 'Full architectural dissection of TCP (RFC 793): 20-byte base header, sequence & acknowledgment numbering, control flags (URG, ACK, PSH, RST, SYN, FIN), sliding window flow control, and checksum.',
    chapters: [
      { time: '00:00', seconds: 0, title: 'TCP Service Model', summary: 'Connection-oriented, reliable, byte-stream process delivery.' },
      { time: '04:10', seconds: 250, title: 'TCP Segment Header Anatomy', summary: 'Detailed field-by-field examination of the 20 to 60-byte header.' },
      { time: '09:00', seconds: 540, title: '6 Control Flag Bits', summary: 'URG (Urgent), ACK, PSH (Push), RST (Reset), SYN (Sync), FIN (Finish).' },
      { time: '13:40', seconds: 820, title: 'Sliding Window & Flow Control', summary: 'Receiver Advertised Window (rwnd) preventing client buffer overflows.' }
    ],
    keyTakeaways: [
      'TCP header length is specified by the 4-bit Data Offset field in 32-bit (4-byte) word increments (min 5 = 20 bytes).',
      'Acknowledgment Number is cumulative: indicates the next sequential byte number the receiver expects to receive.',
      'Effective sending window is governed by: min(Congestion Window, Receiver Window) = min(cwnd, rwnd).'
    ],
    examTips: 'Exam favorite: Calculate header size if Data Offset field value is 7 -> 7 * 4 bytes = 28 bytes total header.'
  },
  {
    id: 'vid-u4-05',
    unit: 'Unit 4',
    unitNum: 4,
    title: 'Stop-and-Wait, Go-Back-N & Selective Repeat – Revision',
    duration: '19:45',
    totalSeconds: 1185,
    youtubeId: 'B7XXb4VuQ44',
    overview: 'Comprehensive revision masterclass comparing Sliding Window ARQ protocols: sender and receiver window sizes, ACK mechanisms, retransmission policies on loss, and channel utilization formulas.',
    chapters: [
      { time: '00:00', seconds: 0, title: 'ARQ Protocol Fundamentals', summary: 'Handling corrupted frames, lost packets, and delayed acknowledgments.' },
      { time: '03:30', seconds: 210, title: 'Stop-and-Wait ARQ (Ws=1, Wr=1)', summary: 'Simple but inefficient on high-latency links (low bandwidth-delay product).' },
      { time: '08:00', seconds: 480, title: 'Go-Back-N ARQ (Ws=N, Wr=1)', summary: 'Pipelined transmissions with cumulative ACKs; discards out-of-order frames.' },
      { time: '13:30', seconds: 810, title: 'Selective Repeat ARQ (Ws=N, Wr=N)', summary: 'Individual ACKs, receiver buffer storage, and selective retransmission of dropped frames.' }
    ],
    keyTakeaways: [
      'Stop-and-Wait: Window Size = 1. Channel efficiency η = 1 / (1 + 2a), where a = T_prop / T_trans.',
      'Go-Back-N: Sender Window Ws = 2^m - 1, Receiver Window Wr = 1. Receiver drops all out-of-order frames.',
      'Selective Repeat: Sender Window Ws = 2^(m-1), Receiver Window Wr = 2^(m-1). Buffers out-of-order packets.'
    ],
    examTips: 'Vital formula to memorize: In m-bit sequence numbering, Go-Back-N Max Ws = (2^m) - 1; Selective Repeat Max Ws = 2^(m-1).'
  }
];

export const VideoOverviewsViewer: React.FC = () => {
  const [selectedUnit, setSelectedUnit] = useState<3 | 4 | 'all'>('all');
  const [activeLessonId, setActiveLessonId] = useState<string>(VIDEO_LESSONS[0].id);
  const [watchedLessons, setWatchedLessons] = useState<Record<string, boolean>>({
    'vid-u3-01': true
  });

  const activeLesson = VIDEO_LESSONS.find(v => v.id === activeLessonId) || VIDEO_LESSONS[0];

  const filteredLessons = selectedUnit === 'all' 
    ? VIDEO_LESSONS 
    : VIDEO_LESSONS.filter(v => v.unitNum === selectedUnit);

  const handleMarkCompleted = (lessonId: string) => {
    soundFx.playLevelUp();
    setWatchedLessons(prev => ({
      ...prev,
      [lessonId]: !prev[lessonId]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Main Interactive Player & Playlist Layout (Block above video removed) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Video Player & Overview Content (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Real Embedded YouTube Video Player Card */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-lg relative">
            
            {/* Top Info Bar Above Player */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                  activeLesson.unitNum === 3 
                    ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25' 
                    : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25'
                }`}>
                  {activeLesson.unit}
                </span>
                <span className="text-xs text-slate-800 dark:text-slate-200 font-bold truncate">
                  {activeLesson.title}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`https://youtu.be/${activeLesson.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
                  title="Open video on YouTube in a new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-red-500" />
                  <span className="hidden sm:inline">Watch on YouTube</span>
                </a>

                <button
                  onClick={() => handleMarkCompleted(activeLesson.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
                    watchedLessons[activeLesson.id]
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 border border-slate-200 dark:border-white/20'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{watchedLessons[activeLesson.id] ? 'Watched (+25 XP)' : 'Mark Watched'}</span>
                </button>
              </div>
            </div>

            {/* Responsive 16:9 YouTube Iframe */}
            <div className="relative w-full aspect-video bg-black">
              <iframe
                key={activeLesson.youtubeId}
                src={`https://www.youtube-nocookie.com/embed/${activeLesson.youtubeId}?rel=0&modestbranding=1`}
                title={activeLesson.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Overview Summary Under Player */}
            <div className="p-6 bg-white dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  Lesson Overview & Conceptual Focus
                </span>
                <p className="mt-1.5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {activeLesson.overview}
                </p>
              </div>

              {/* Chapters & Timeline Navigator */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                  <ListVideo className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  Key Chapters & Core Timestamps
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeLesson.chapters.map((ch, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 hover:border-indigo-500/40 transition-all"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          {ch.time}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-mono">Chapter {idx + 1}</span>
                      </div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">
                        {ch.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                        {ch.summary}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* High-Yield Takeaways Card */}
              <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-500/20">
                <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  High-Yield Takeaways
                </div>
                <ul className="space-y-1.5">
                  {activeLesson.keyTakeaways.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 mt-1.5 shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Exam Highlight Banner */}
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-start gap-3">
                <Award className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide">
                    Exam Strategy Note
                  </div>
                  <div className="text-xs text-amber-900 dark:text-amber-200/90 mt-0.5 leading-relaxed">
                    {activeLesson.examTips}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Video Playlist & Topic List (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 backdrop-blur-md shadow-sm">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ListVideo className="w-4 h-4 text-red-500" />
                Curated Tutorials ({filteredLessons.length})
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                {Object.values(watchedLessons).filter(Boolean).length} / {VIDEO_LESSONS.length} Watched
              </span>
            </div>

            {/* Filter Tabs Inside Playlist Panel */}
            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl mb-3 border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  soundFx.playPacketPop();
                  setSelectedUnit('all');
                }}
                className={`py-1.5 text-center rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedUnit === 'all'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All ({VIDEO_LESSONS.length})
              </button>
              <button
                onClick={() => {
                  soundFx.playPacketPop();
                  setSelectedUnit(3);
                }}
                className={`py-1.5 text-center rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedUnit === 3
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Unit 3 (6)
              </button>
              <button
                onClick={() => {
                  soundFx.playPacketPop();
                  setSelectedUnit(4);
                }}
                className={`py-1.5 text-center rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedUnit === 4
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Unit 4 (5)
              </button>
            </div>

            <div className="space-y-2 max-h-[680px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredLessons.map((lesson, idx) => {
                const isActive = lesson.id === activeLesson.id;
                const isCompleted = !!watchedLessons[lesson.id];

                return (
                  <div
                    key={lesson.id}
                    onClick={() => {
                      soundFx.playClick();
                      setActiveLessonId(lesson.id);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-red-50/80 dark:bg-red-950/40 border-red-300 dark:border-red-500/60 shadow-md shadow-red-500/5 ring-1 ring-red-400/50'
                        : 'bg-slate-50/60 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Video Thumbnail or Play Indicator */}
                      <div className="w-16 h-11 rounded-lg shrink-0 overflow-hidden relative bg-black border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                        <img
                          src={`https://img.youtube.com/vi/${lesson.youtubeId}/mqdefault.jpg`}
                          alt={lesson.title}
                          className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          {isActive ? (
                            <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center shadow-md">
                              <Play className="w-3 h-3 fill-white ml-0.5 text-white" />
                            </div>
                          ) : (
                            <Play className="w-4 h-4 text-white/90" />
                          )}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${
                            lesson.unitNum === 3 ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {lesson.unit} • #{idx + 1}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {lesson.duration}
                          </span>
                        </div>

                        <h4 className={`text-xs font-semibold line-clamp-2 ${
                          isActive ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-700 dark:text-slate-300'
                        }`}>
                          {lesson.title}
                        </h4>
                        
                        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200/80 dark:border-slate-800/60">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            {lesson.chapters.length} topics
                          </span>
                          {isCompleted ? (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                              <CheckCircle2 className="w-3 h-3" /> Watched
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400/90 font-mono font-medium">
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
