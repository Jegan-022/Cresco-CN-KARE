import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  BookOpen, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  ChevronRight,
  ExternalLink,
  Award,
  FileCode,
  Copy,
  Check
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface UnitNote {
  id: string;
  unitNum: 3 | 4 | 5;
  title: string;
  subtitle: string;
  wordCount: string;
  readingTime: string;
  topics: {
    heading: string;
    content: string[];
    keyPoints: string[];
    formulas?: string[];
  }[];
}

const UNIT_NOTES: UnitNote[] = [
  {
    id: 'note-unit-3',
    unitNum: 3,
    title: 'Unit III: Network Layer Architecture, Addressing & Routing',
    subtitle: 'Store-and-Forward, IPv4/IPv6 Headers, Subnetting, CIDR, RIP, OSPF, BGP, NAT, ARP & ICMP',
    wordCount: '4,200 words',
    readingTime: '18 min read',
    topics: [
      {
        heading: '1. Network Layer Principles & Store-and-Forward Packet Switching',
        content: [
          'The Network Layer provides end-to-end host-to-host communication across heterogeneous networks. Routers operate up to Layer 3, inspecting destination IP addresses in packet headers and using forwarding tables to direct packets across appropriate outgoing interfaces.',
          'Store-and-Forward Transmission: A packet switch or router must receive the entire packet before it can begin transmitting the first bit onto the outbound link, introducing store-and-forward queueing delays.'
        ],
        keyPoints: [
          'Forwarding (Data Plane): Local router action transferring a packet from an input link interface to an appropriate output link interface (hardware timeframe: nanoseconds).',
          'Routing (Control Plane): Network-wide process coordinating routing protocols (RIP, OSPF, BGP) to determine end-to-end paths between senders and receivers (software timeframe: milliseconds to seconds).'
        ]
      },
      {
        heading: '2. IPv4 Datagram Format & Header Mechanics',
        content: [
          'The IPv4 datagram consists of a 20-byte base header plus optional extension fields (up to 60 bytes maximum).',
          'Version (4 bits), IHL (4 bits, minimum 5 = 20 bytes), Type of Service / DSCP (8 bits), Total Length (16 bits, max 65,535 bytes).',
          'Identification (16 bits), Flags (3 bits: Reserved, DF - Don\'t Fragment, MF - More Fragments), Fragment Offset (13 bits, measured in 8-byte blocks).',
          'Time to Live (TTL, 8 bits): Decremented by 1 at every router hop. Prevents infinite looping; drops packet and emits ICMP Time Exceeded (Type 11) when TTL reaches 0.',
          'Protocol (8 bits): Identifies upper-layer protocol (6 for TCP, 17 for UDP, 1 for ICMP).',
          'Header Checksum (16 bits): Recomputed at every router hop due to TTL modification.'
        ],
        keyPoints: [
          'Base header size: 20 bytes.',
          'Fragment Offset represents data offset divided by 8.',
          'Checksum covers ONLY header, NOT payload.'
        ],
        formulas: [
          'Number of 8-byte units in Fragment Offset = ByteOffset / 8',
          'Usable Hosts = 2^(32 - n) - 2 (where n is CIDR prefix)'
        ]
      },
      {
        heading: '3. IPv6 Architecture & Header Improvements',
        content: [
          'IPv6 uses 128-bit addresses (16 bytes), written as 8 groups of 4 hexadecimal digits separated by colons (e.g., 2001:0db8:85a3:0000:0000:8a2e:0370:7334).',
          'Fixed 40-byte base header removes header length, checksum, and hop-by-hop fragmentation, enabling fast router processing in hardware ASICs.',
          'Extension Headers: Additional options (Routing, Fragmentation, Security/ESP) are chained via the Next Header field.'
        ],
        keyPoints: [
          'No router fragmentation: Source host performs Path MTU Discovery (PMTUD).',
          'No Header Checksum: Rely on Link layer (CRC) and Transport layer (TCP/UDP checksums).',
          'Eliminated Broadcast: Replaced with Multicast and Anycast.'
        ]
      },
      {
        heading: '4. Subnetting, CIDR & Variable Length Subnet Masking (VLSM)',
        content: [
          'Classless Inter-Domain Routing (CIDR, RFC 1519) replaced Class A, B, C allocations with arbitrary-length prefix notation (a.b.c.d/n).',
          'The network prefix (n bits) defines the subnet, while the remaining (32 - n) bits define host identifiers within the subnet.',
          'VLSM allows network administrators to recursively subnet subnets to minimize wasted host address space.'
        ],
        keyPoints: [
          'Subnet Mask bitwise AND IP Address = Network ID.',
          'Broadcast address has all host bits set to binary 1.',
          'RFC 1918 Private Ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16.'
        ],
        formulas: [
          'Total Addresses = 2^(32 - Prefix)',
          'Usable Host Addresses = 2^(32 - Prefix) - 2'
        ]
      },
      {
        heading: '5. Routing Protocols: Distance Vector (RIP) vs Link State (OSPF)',
        content: [
          'Distance Vector (Bellman-Ford Algorithm): Each node periodically sends its estimated distance vector to immediate physical neighbors. Subject to Count-to-Infinity problem; mitigated via Split Horizon and Poison Reverse.',
          'RIP (Routing Information Protocol): Uses hop count as metric. Max hops = 15 (16 = infinity). Updates broadcast/multicast every 30 seconds.',
          'Link State (Dijkstra\'s Shortest Path First): Every router floods Link State Advertisements (LSAs) so all routers build an identical topological graph of the Autonomous System (AS).',
          'OSPF (Open Shortest Path First): Uses bandwidth-based cost metric, supports hierarchical areas (Area 0 Backbone), converges instantaneously without loops.'
        ],
        keyPoints: [
          'RIP: Slow convergence, limited to small networks (<15 hops).',
          'OSPF: Fast convergence, LSA flooding, area hierarchy, authentication.',
          'BGP (Border Gateway Protocol): De-facto inter-domain path-vector routing protocol governing Autonomous Systems across the global Internet.'
        ]
      }
    ]
  },
  {
    id: 'note-unit-4',
    unitNum: 4,
    title: 'Unit IV: Transport Layer Protocols, Flow & Congestion Control',
    subtitle: 'Process-to-Process Delivery, TCP 3-Way Handshake, Sliding Window, AIMD, Tahoe & Reno',
    wordCount: '4,600 words',
    readingTime: '20 min read',
    topics: [
      {
        heading: '1. Transport Layer Fundamentals: Process-to-Process Communication',
        content: [
          'While the Network Layer delivers packets host-to-host, the Transport Layer delivers messages process-to-process using 16-bit Port numbers (0 to 65,535).',
          'Well-Known Ports (0-1023): HTTP (80), HTTPS (443), DNS (53), SSH (22), SMTP (25), FTP (20/21).',
          'Socket = IP Address + Port Number (e.g., 192.168.1.50:443).'
        ],
        keyPoints: [
          'Multiplexing: Gathering data chunks from multiple sockets, adding transport headers, and passing to Network layer.',
          'Demultiplexing: Inspecting destination port and delivering payload to the correct socket.'
        ]
      },
      {
        heading: '2. User Datagram Protocol (UDP, RFC 768)',
        content: [
          'Connectionless, lightweight, unreliable best-effort delivery mechanism.',
          'Minimal 8-byte header: Source Port (16b), Destination Port (16b), Length (16b), Checksum (16b).',
          'No connection establishment delays, no congestion throttle, predictable sending rate.'
        ],
        keyPoints: [
          'Used by DNS, VoIP, video streaming, DHCP, SNMP, and HTTP/3 QUIC.',
          'Optional checksum in IPv4, mandatory checksum in IPv6.'
        ]
      },
      {
        heading: '3. Transmission Control Protocol (TCP, RFC 793): Connection Lifecycle',
        content: [
          'Connection-oriented, full-duplex, reliable byte-stream protocol.',
          'Three-Way Handshake:',
          '  1. Client sends SYN (seq = client_isn)',
          '  2. Server responds with SYN-ACK (seq = server_isn, ack = client_isn + 1)',
          '  3. Client acknowledges with ACK (seq = client_isn + 1, ack = server_isn + 1)',
          'Connection Teardown (Four-Way Handshake): FIN -> ACK -> FIN -> ACK. Client enters TIME_WAIT state for 2 * MSL (Maximum Segment Lifetime, typically 120s).'
        ],
        keyPoints: [
          'Sequence Numbers count data bytes, NOT packet chunks.',
          'Acknowledgment Number is cumulative: indicates the next byte expected.',
          'TIME_WAIT prevents old delayed segments from corrupting a newly opened incarnation of the socket.'
        ]
      },
      {
        heading: '4. Flow Control vs Congestion Control Mechanics',
        content: [
          'Flow Control (Host protection): Receiver advertises remaining buffer space in the 16-bit Window field (rwnd). Senders ensure (LastByteSent - LastByteAcked) <= rwnd.',
          'Congestion Control (Network protection): Dynamic Congestion Window (cwnd) maintained by sender to prevent swamping intermediate routers.',
          'Effective Window = min(cwnd, rwnd).'
        ],
        keyPoints: [
          'Slow Start: cwnd starts at 1 MSS and doubles every RTT (exponential growth) until cwnd >= ssthresh.',
          'Congestion Avoidance: cwnd increases linearly (+1 MSS per RTT - Additive Increase) once ssthresh is crossed.',
          'Timeout Detection: Severe congestion. ssthresh = cwnd / 2; cwnd drops to 1 MSS (Slow Start restarted).',
          '3 Duplicate ACKs (Fast Retransmit): Mild congestion. Immediate retransmission without waiting for RTO timeout.'
        ],
        formulas: [
          'Tahoe upon Loss: cwnd = 1 MSS, ssthresh = cwnd / 2',
          'Reno upon 3 Dup ACKs: cwnd = ssthresh = cwnd / 2 (Fast Recovery)'
        ]
      }
    ]
  },
  {
    id: 'note-unit-5',
    unitNum: 5,
    title: 'Unit V: Application Layer Architectures, Web, DNS & Security',
    subtitle: 'Client-Server, P2P, HTTP/1.1 vs HTTP/2 vs HTTP/3, DNS Resolution, SMTP, POP3, IMAP, TLS/SSL',
    wordCount: '4,400 words',
    readingTime: '19 min read',
    topics: [
      {
        heading: '1. Network Application Architectures: Client-Server vs Peer-to-Peer',
        content: [
          'Client-Server Architecture: Always-on server with fixed IP address serves requests from transient clients. Prone to server bottlenecks under surge traffic.',
          'P2P Architecture: Minimal or no reliance on dedicated servers; peers communicate directly and distribute upload workload (self-scalability).'
        ],
        keyPoints: [
          'Client-Server: Web (HTTP), Email (SMTP), DNS.',
          'P2P: BitTorrent, Blockchain networks, distributed DHT storage.'
        ]
      },
      {
        heading: '2. Domain Name System (DNS, Port 53): Distributed Hierarchical Database',
        content: [
          'Translates human-friendly hostnames (www.klu.ac.in) into routable IP addresses (115.240.10.2).',
          'Hierarchy:',
          '  1. Root DNS Servers (13 logical root server identities managed globally A-M)',
          '  2. Top-Level Domain (TLD) Servers (.com, .org, .edu, .in)',
          '  3. Authoritative DNS Servers (organization\'s own servers mapping hostnames to IPs)',
          'Query Types: Recursive (client delegates full search to Local DNS resolver) and Iterative (resolver asks root, then TLD, then authoritative step-by-step).'
        ],
        keyPoints: [
          'Record Types: A (IPv4), AAAA (IPv6), CNAME (canonical alias), MX (mail exchange server), NS (authoritative name server).',
          'Transport: Uses UDP port 53 for queries, TCP port 53 for zone transfers (>512 bytes).'
        ]
      },
      {
        heading: '3. HTTP Protocol Evolution: HTTP/1.1 to HTTP/2 and HTTP/3 (QUIC)',
        content: [
          'HTTP/1.0: Non-persistent connections (1 TCP connection per object).',
          'HTTP/1.1: Persistent connections and pipelining, but still suffered from Head-of-Line (HoL) blocking at application level.',
          'HTTP/2 (RFC 7540): Single persistent TCP connection per domain with binary framing, stream multiplexing, header compression (HPACK), and server push.',
          'HTTP/3 (QUIC over UDP): Replaces TCP with QUIC protocol running on UDP port 443. Solves TCP Head-of-Line packet loss blocking, supports 0-RTT handshakes and seamless Wi-Fi/cellular connection migration.'
        ],
        keyPoints: [
          'HTTP Status Codes: 200 (OK), 301 (Moved Permanently), 404 (Not Found), 500 (Internal Server Error).',
          'HTTPS = HTTP over Transport Layer Security (TLS port 443).'
        ]
      },
      {
        heading: '4. Electronic Mail Protocols: SMTP, POP3 & IMAP',
        content: [
          'Electronic mail utilizes User Agents (UAs), Mail Transfer Agents (MTAs), and Mail Delivery Agents (MDAs).',
          'SMTP (Simple Mail Transfer Protocol, Port 25/587): Push protocol delivering email from sender client to mail server, and between mail servers.',
          'POP3 (Post Office Protocol v3, Port 110/995): Pull protocol downloading mail to local client and optionally deleting from server.',
          'IMAP (Internet Message Access Protocol, Port 143/993): Pull protocol maintaining two-way synchronized folder hierarchies on the server across multiple devices.'
        ],
        keyPoints: [
          'SMTP uses ASCII commands (HELO, MAIL FROM, RCPT TO, DATA, QUIT).',
          'MIME (Multipurpose Internet Mail Extensions) allows non-ASCII multimedia attachments via Base64 encoding.'
        ]
      },
      {
        heading: '5. Network Security & Cryptographic Handshakes',
        content: [
          'Core Security Goals (CIA Triad): Confidentiality, Integrity, Availability + Authentication.',
          'Symmetric Encryption (AES, DES): Single shared key used for both encryption and decryption. Fast computational throughput.',
          'Asymmetric Encryption (RSA, ECC): Public key for encryption, Private key for decryption. Used to authenticate and exchange symmetric session keys.',
          'TLS/SSL Handshake: Client Hello -> Server Hello + Digital Certificate -> Client key exchange -> Secure symmetric session established.'
        ],
        keyPoints: [
          'Digital Signatures provide Non-Repudiation and Integrity using private key encryption of SHA-256 hash.',
          'Firewalls: Packet-filtering (Layer 3/4 headers) vs Stateful Inspection (connection state table) vs Application Gateways (Proxy Layer 7 inspection).'
        ]
      }
    ]
  }
];

interface SmartReviewViewProps {
  onBack?: () => void;
  onSelectTopic?: (topicId?: string) => void;
  onNavigate?: (tab: string) => void;
}

export const SmartReviewView: React.FC<SmartReviewViewProps> = ({
  onBack,
  onSelectTopic,
  onNavigate
}) => {
  const [selectedUnit, setSelectedUnit] = useState<3 | 4 | 5 | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const displayedNotes = selectedUnit === 'all' 
    ? UNIT_NOTES 
    : UNIT_NOTES.filter(n => n.unitNum === selectedUnit);

  // Generate downloadable Word (.doc) formatted document
  const downloadWordDoc = (unit: UnitNote) => {
    soundFx.playLevelUp();

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>${unit.title}</title>
        <style>
          body { font-family: Calibri, Arial, sans-serif; line-height: 1.6; color: #111; margin: 24px; }
          h1 { color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 6px; }
          h2 { color: #2563eb; margin-top: 24px; }
          .meta { font-size: 11pt; color: #4b5563; margin-bottom: 20px; }
          .key-box { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 12px; margin: 12px 0; }
          .formula-box { background: #eff6ff; border-left: 4px solid #2563eb; padding: 10px; font-family: Consolas, monospace; }
          p { margin: 8px 0; }
          ul { margin: 8px 0 16px 20px; }
          li { margin-bottom: 4px; }
        </style>
      </head>
      <body>
        <h1>${unit.title}</h1>
        <p class="meta"><strong>Cresco CN Academy • KLU Computer Networks Curriculum</strong><br/>${unit.subtitle}</p>
        <hr/>
        ${unit.topics.map(t => `
          <h2>${t.heading}</h2>
          ${t.content.map(c => `<p>${c}</p>`).join('')}
          <div class="key-box">
            <strong>Key Exam Concepts & RFC Rules:</strong>
            <ul>${t.keyPoints.map(kp => `<li>${kp}</li>`).join('')}</ul>
          </div>
          ${t.formulas && t.formulas.length > 0 ? `
            <div class="formula-box">
              <strong>Formulas & Reference Equations:</strong>
              <ul>${t.formulas.map(f => `<li><code>${f}</code></li>`).join('')}</ul>
            </div>
          ` : ''}
        `).join('')}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cresco_CN_${unit.id}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Browser Print / Save to PDF
  const handlePrintPdf = () => {
    soundFx.playClick();
    window.print();
  };

  const copyTopicSummary = (text: string, id: string) => {
    soundFx.playClick();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full space-y-6 pb-20 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 shadow-sm print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-black text-[#3157D5] dark:text-[#6D8CFF] uppercase tracking-widest mb-1">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            <span>OFFICIAL SYLLABUS MATERIALS • UNITS III, IV, V</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#172033] dark:text-[#F9FAFB] tracking-tight">
            COURSE NOTES & DOWNLOADS
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#64748B] dark:text-slate-400 mt-0.5">
            Downloadable PDF and Microsoft Word reference materials covering Network, Transport & Application Layers.
          </p>
        </div>

        {/* Global Print Action */}
        <button
          onClick={handlePrintPdf}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 shrink-0 self-start sm:self-center cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save Complete Notes (PDF)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl print:hidden">
        {/* Unit Selector Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start">
          {(['all', 3, 4, 5] as const).map(u => (
            <button
              key={u}
              onClick={() => {
                soundFx.playPacketPop();
                setSelectedUnit(u);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedUnit === u
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {u === 'all' ? 'All Units' : `Unit ${u}`}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords (e.g. OSPF, TCP, DNS)..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Main Units Content Cards */}
      <div className="space-y-8">
        {displayedNotes.map((unit) => {
          const filteredTopics = searchQuery.trim()
            ? unit.topics.filter(t => 
                t.heading.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.content.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
                t.keyPoints.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
              )
            : unit.topics;

          if (filteredTopics.length === 0) return null;

          return (
            <div 
              key={unit.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl print:bg-white print:text-black print:border-none print:shadow-none"
            >
              {/* Unit Card Header */}
              <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 print:p-0 print:border-b-2 print:border-black">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-mono font-bold">
                      Unit {unit.unitNum}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {unit.wordCount} • {unit.readingTime}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white print:text-black">
                    {unit.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 print:text-slate-600">
                    {unit.subtitle}
                  </p>
                </div>

                {/* Download Actions */}
                <div className="flex items-center gap-2 shrink-0 print:hidden">
                  <button
                    onClick={() => downloadWordDoc(unit)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Word (.doc)</span>
                  </button>
                  <button
                    onClick={handlePrintPdf}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print PDF</span>
                  </button>
                </div>
              </div>

              {/* Topics Breakdown */}
              <div className="p-6 sm:p-8 space-y-8 divide-y divide-slate-800/80 print:divide-slate-300">
                {filteredTopics.map((topic, tIdx) => (
                  <div key={tIdx} className={tIdx > 0 ? 'pt-8' : ''}>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h3 className="text-base sm:text-lg font-bold text-white print:text-black flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 print:bg-black" />
                        <span>{topic.heading}</span>
                      </h3>

                      <button
                        onClick={() => copyTopicSummary(
                          `${topic.heading}\n\n${topic.content.join('\n\n')}\n\nKey Points:\n${topic.keyPoints.join('\n')}`,
                          `${unit.id}-${tIdx}`
                        )}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all text-xs print:hidden"
                        title="Copy topic notes"
                      >
                        {copiedId === `${unit.id}-${tIdx}` ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Explanatory Content */}
                    <div className="space-y-2 text-sm text-slate-300 leading-relaxed print:text-slate-800">
                      {topic.content.map((p, pIdx) => (
                        <p key={pIdx}>{p}</p>
                      ))}
                    </div>

                    {/* Key Exam Rules & Concepts Box */}
                    <div className="mt-4 p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/20 print:bg-slate-50 print:border-slate-300">
                      <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 mb-2 uppercase tracking-wider print:text-slate-800">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Key Exam Rules & RFC Takeaways</span>
                      </div>
                      <ul className="space-y-1.5">
                        {topic.keyPoints.map((kp, kIdx) => (
                          <li key={kIdx} className="flex items-start gap-2 text-xs text-slate-300 print:text-slate-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                            <span>{kp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Formulas if applicable */}
                    {topic.formulas && topic.formulas.length > 0 && (
                      <div className="mt-3 p-3 rounded-xl bg-blue-950/30 border border-blue-500/20 font-mono text-xs text-blue-300 print:bg-slate-50 print:text-slate-900">
                        <span className="font-bold text-[10px] uppercase tracking-wider block mb-1 text-blue-400">
                          Formulas & Calculations:
                        </span>
                        <div className="space-y-1">
                          {topic.formulas.map((f, fIdx) => (
                            <div key={fIdx} className="flex items-center gap-2">
                              <span className="text-slate-500">▶</span>
                              <span>{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
