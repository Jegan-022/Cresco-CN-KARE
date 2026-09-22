import React, { useState } from 'react';
import { 
  Presentation, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  Layers, 
  BookOpen, 
  Download,
  CheckCircle2
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface Slide {
  title: string;
  subtitle: string;
  points: string[];
  diagram: string;
  takeaway: string;
}

interface Deck {
  id: string;
  unit: string;
  unitNum: 3 | 4 | 5;
  title: string;
  slidesCount: number;
  color: string;
  slides: Slide[];
}

const PPT_DECKS: Deck[] = [
  {
    id: 'unit-3-ppt',
    unit: 'Unit 3',
    unitNum: 3,
    title: 'Network Layer Architecture & Routing Protocols',
    slidesCount: 6,
    color: '#0284c7',
    slides: [
      {
        title: 'Network Layer Overview & Store-and-Forward',
        subtitle: 'Host-to-host logical packet delivery across heterogeneous internetworks',
        points: [
          'Encapsulates Transport Layer segments into IP Datagrams with 20-60 byte headers.',
          'Store-and-Forward Packet Switching: Routers buffer incoming packets, verify checksum, and forward along calculated shortest paths.',
          'Connectionless vs Connection-Oriented: Datagrams route independently (IP) vs Virtual Circuits with call setup/teardown (ATM/MPLS).'
        ],
        diagram: 'Host A [L3 Datagram] ──> Router R1 [Route Lookup] ──> Router R2 ──> Host B',
        takeaway: 'Layer 3 isolates transport endpoints from physical transmission mechanics across diverse links.'
      },
      {
        title: 'IPv4 vs IPv6 Packet Header Engineering',
        subtitle: 'Addressing exhaustion, bit offsets, and architectural streamlining',
        points: [
          'IPv4: 32-bit addresses (4.29 billion space), 20-60 bytes header, handles fragmentation via Identification, Flags (DF, MF) & Fragment Offset.',
          'IPv6: 128-bit addresses (3.4×10^38 space), fixed 40-byte base header with Next Header daisy-chain for options.',
          'IPv6 eliminates in-network fragmentation: End-hosts perform Path MTU Discovery (PMTUD).'
        ],
        diagram: 'IPv4: [Ver|IHL|TOS|TotalLen|ID|Flags|Offset|TTL|Proto|Checksum|SrcIP|DstIP|Options]\nIPv6: [Ver|TrafficClass|FlowLabel|PayloadLen|NextHeader|HopLimit|SrcIP(128b)|DstIP(128b)]',
        takeaway: 'Fixed 40-byte IPv6 headers eliminate router checksum recalculation, reducing per-packet forwarding latency.'
      },
      {
        title: 'Classless Inter-Domain Routing (CIDR) & VLSM',
        subtitle: 'Hierarchical route aggregation and conservation of IPv4 space',
        points: [
          'Eliminated obsolete Class A/B/C boundaries using variable length prefix notation (/n).',
          'Subnet Mask bitwise AND-ed with IP address reveals Network ID; remaining bits identify Host ID.',
          'VLSM allows subnetting a subnet, enabling engineers to allocate subnets tailored to exact host requirements (e.g. /30 for point-to-point links).'
        ],
        diagram: 'IP: 192.168.10.65 /26\nMask: 255.255.255.192 (11111111.11111111.11111111.11000000)\nSubnet: 192.168.10.64 | Usable: .65 to .126 | Broadcast: .127',
        takeaway: 'CIDR aggregation (Supernetting) shrinks global BGP routing tables by combining contiguous network prefixes.'
      },
      {
        title: 'Routing Algorithms: Distance Vector vs Link State',
        subtitle: 'Bellman-Ford distributed iteration vs Dijkstra centralized SPF',
        points: [
          'Distance Vector (RIP): Nodes share entire distance vector with direct neighbors periodically. Suffers from Count-to-Infinity (mitigated by Split Horizon & Poison Reverse).',
          'Link State (OSPF): Nodes flood Link State Advertisements (LSAs) containing link costs. Every router builds identical link-state database (LSDB) and computes Dijkstra shortest path tree.',
          'BGP (Border Gateway Protocol): Path vector protocol connecting Autonomous Systems (AS) via policy-based routing over TCP port 179.'
        ],
        diagram: 'Distance Vector: "Tell neighbors about the world" (Periodic, slow convergence)\nLink State: "Tell the world about direct neighbors" (Event-driven, fast Dijkstra OSPF)',
        takeaway: 'Link State converges in milliseconds without routing loops, making it the de-facto intra-domain standard.'
      },
      {
        title: 'Network Helper Protocols: DHCP, ARP, NAT & ICMP',
        subtitle: 'The auxiliary control and resolution backbone of modern IP',
        points: [
          'ARP (Address Resolution Protocol): Resolves known 32-bit IP address to 48-bit Ethernet MAC address on local broadcast domain.',
          'DHCP (Dynamic Host Configuration Protocol): Automatic IP configuration via 4-step DORA handshake (Discover -> Offer -> Request -> Ack).',
          'NAT (Network Address Translation / NAPT): Maps private RFC 1918 IPs (10.x, 172.16.x, 192.168.x) to public IPs using ephemeral source port translation.',
          'ICMP: Error reporting (Destination Unreachable, Time Exceeded for Traceroute) and diagnostic Echo (Ping).'
        ],
        diagram: 'Client ────[DHCP Discover]────> Broadcast (UDP 67)\nClient <────[DHCP Offer]──────── Server\nClient ────[DHCP Request]──────> Broadcast\nClient <────[DHCP Ack]────────── Server',
        takeaway: 'NAT prolonged IPv4 viability while DHCP and ARP automate zero-configuration local networking.'
      },
      {
        title: 'Software-Defined Networking (SDN) & OpenFlow',
        subtitle: 'Decoupling control plane logic from high-speed data plane forwarding',
        points: [
          'Traditional Routers: Control Plane (routing decision) and Data Plane (packet forwarding) are tightly bundled on the same physical box.',
          'SDN Architecture: Centralized SDN controller (e.g., OpenFlow, ODL) programs distributed hardware flow tables.',
          'Enables programmable traffic engineering, instantaneous global failover, and programmatic network virtualization.'
        ],
        diagram: '[Application Layer: Orchestration & Policy]\n                    │ (Northbound REST API)\n[Control Layer: Centralized SDN Controller (Global Topology)]\n                    │ (Southbound OpenFlow API)\n[Data Plane Layer: Dumb Whitebox Switches (Flow Table Match/Action)]',
        takeaway: 'SDN transforms network infrastructure into programmable code, enabling cloud hyperscalers to manage millions of flows dynamically.'
      }
    ]
  },
  {
    id: 'unit-4-ppt',
    unit: 'Unit 4',
    unitNum: 4,
    title: 'Transport Layer Protocols & Congestion Mechanics',
    slidesCount: 5,
    color: '#059669',
    slides: [
      {
        title: 'Transport Layer Principles & Port Demultiplexing',
        subtitle: 'Process-to-process delivery, ephemeral ports, and socket abstraction',
        points: [
          'Provides logical communication between application processes running on different hosts.',
          'Socket = IP Address + Port Number (e.g. 192.168.1.100:54321 to 93.184.216.34:443).',
          'Multiplexing: Gathering data chunks from multiple application sockets and encapsulating with transport headers.',
          'Demultiplexing: Inspecting destination port in segment header to deliver data payload to the correct listening process socket.'
        ],
        diagram: 'App Process A (Port 8080) ──┐\nApp Process B (Port 443)  ──┼──> [Transport Multiplexing] ──> IP Packet\nApp Process C (Port 53)   ──┘',
        takeaway: 'Port numbers provide the final addressing hop to differentiate between concurrent services running on the same host.'
      },
      {
        title: 'UDP vs TCP: Architectural Trade-Offs',
        subtitle: 'Connectionless minimal overhead vs Connection-oriented guaranteed reliability',
        points: [
          'UDP (RFC 768): 8-byte fixed header (SrcPort, DstPort, Length, Checksum). No connection setup, no retransmissions, no flow control. Ideal for real-time VoIP, DNS, and gaming.',
          'TCP (RFC 793): 20-60 byte variable header. Full-duplex byte stream, reliable in-order delivery, flow control, congestion control, and connection lifecycle management.',
          'Check of Checksum: UDP checksum is optional in IPv4 but mandatory in IPv6.'
        ],
        diagram: 'UDP Header (8 Bytes):\n[16b Source Port | 16b Destination Port]\n[16b Length      | 16b Checksum         ]\n\nTCP Header (20 Bytes min):\n[SrcPort|DstPort|SeqNum|AckNum|Offset|Flags|Window|Checksum|UrgPtr]',
        takeaway: 'Choose UDP when low latency outranks packet loss; choose TCP when missing bytes break application correctness.'
      },
      {
        title: 'TCP 3-Way Handshake & Connection State Machine',
        subtitle: 'Deterministic state synchronization and sequence numbering',
        points: [
          'Step 1 (SYN): Client sends SYN=1, Seq=ISN_c (Initial Sequence Number). State: SYN_SENT.',
          'Step 2 (SYN-ACK): Server replies with SYN=1, ACK=1, Seq=ISN_s, Ack=ISN_c + 1. State: SYN_RCVD.',
          'Step 3 (ACK): Client replies with ACK=1, Seq=ISN_c + 1, Ack=ISN_s + 1. State: ESTABLISHED.',
          'Connection Teardown: 4-way handshake using FIN and ACK control flags. Client enters TIME_WAIT (2*MSL) to guarantee graceful teardown.'
        ],
        diagram: 'Client                               Server\n  │ ─── SYN (Seq=X) ───────────────> │ (LISTEN -> SYN_RCVD)\n  │ <── SYN-ACK (Seq=Y, Ack=X+1) ─── │\n  │ ─── ACK (Seq=X+1, Ack=Y+1) ────> │ (ESTABLISHED)',
        takeaway: 'The 3-way handshake prevents phantom duplicates from previous reincarnations from corrupting new sessions.'
      },
      {
        title: 'TCP Flow Control & Sliding Window Protocol',
        subtitle: 'Protecting the receiving buffer from overrun',
        points: [
          'Receive Window (rwnd): Server advertises its free buffer space in the 16-bit Window size header field.',
          'Sender guarantees: (LastByteSent - LastByteAcked) <= rwnd.',
          'Zero Window Probe: When receiver advertises rwnd=0, sender periodically transmits 1-byte probe segments to solicit window updates and prevent deadlock.',
          'Silly Window Syndrome: Receiver advertises tiny buffers; mitigated by Clark algorithm (receiver) and Nagle algorithm (sender).'
        ],
        diagram: '[Sent & Acked] ── [Sent, Not Acked] ── [Usable Window] ── [Cannot Send]\n                  ▲                    ▲\n                  LastByteAcked        LastByteSent <= rwnd',
        takeaway: 'Flow control is an end-to-end agreement between sender and receiver buffer speeds.'
      },
      {
        title: 'TCP Congestion Control: AIMD, Slow Start & BBR',
        subtitle: 'Protecting the intermediate network fabric from collapse',
        points: [
          'Congestion Window (cwnd): Sender-side estimation of network capacity. Effective window = min(cwnd, rwnd).',
          'Slow Start: cwnd starts at 1-10 MSS and doubles every RTT (exponential growth) until ssthresh.',
          'Congestion Avoidance: Additive Increase Multiplicative Decrease (AIMD) — increases by 1 MSS per RTT; cuts cwnd in half on packet drop.',
          'Fast Retransmit & Fast Recovery: Triggered by 3 duplicate ACKs without waiting for expensive RTO timer expiry.',
          'Modern BBR (Bottleneck Bandwidth and RTT): Measures max bandwidth and min RTT without needing buffer packet drops.'
        ],
        diagram: 'cwnd |            /|   /|\n     |    /|     / |  / |\n     |   / |    /  | /  |\n     |  /  |___/   |/   |  (AIMD Sawtooth Pattern)\n     +──────────────────────── Time',
        takeaway: 'AIMD guarantees distributed fairness and stability across millions of shared Internet links.'
      }
    ]
  },
  {
    id: 'unit-5-ppt',
    unit: 'Unit 5',
    unitNum: 5,
    title: 'Application Layer Protocols, DNS & Modern Web',
    slidesCount: 5,
    color: '#7c3aed',
    slides: [
      {
        title: 'Application Layer Architecture & HTTP Paradigm',
        subtitle: 'Client-server paradigm, P2P networks, and stateless request-response',
        points: [
          'Client-Server: Dedicated servers listen on well-known ports; clients initiate transactions.',
          'P2P (Peer-to-Peer): Decentralized nodes serve both as clients and servers with high scalability (BitTorrent).',
          'HTTP (Hypertext Transfer Protocol): ASCII-based stateless protocol running over TCP port 80 / 443.',
          'Methods: GET (retrieve), POST (submit payload), PUT (replace), DELETE, HEAD, OPTIONS.',
          'Stateless Nature: State is maintained across sessions via Cookies, Sessions, and JWT Bearer Tokens.'
        ],
        diagram: 'Client ────[GET /index.html HTTP/1.1]────> Web Server (Port 80/443)\nClient <───[HTTP/1.1 200 OK (HTML)]─────── Web Server',
        takeaway: 'HTTP statelessness enables massive load-balancing and horizontal web server scaling.'
      },
      {
        title: 'Evolution of HTTP: HTTP/1.1 -> HTTP/2 -> HTTP/3',
        subtitle: 'Pipelining, binary framing, multiplexing, and QUIC over UDP',
        points: [
          'HTTP/1.1: Persistent TCP connections with pipelining. Suffers from Head-of-Line (HoL) blocking at application level.',
          'HTTP/2 (RFC 7540): Single TCP connection per domain. Binary framing, header compression (HPACK), and interleaved stream multiplexing.',
          'HTTP/3 (RFC 9114): Replaces TCP with QUIC over UDP. Eliminates transport-layer HoL blocking and enables zero-RTT handshakes.'
        ],
        diagram: 'HTTP/1.1: [Request 1]──>[Response 1]──>[Request 2]──>[Response 2] (Sequential)\nHTTP/2:   Stream 1 [Frame A][Frame B] interleaved with Stream 2 [Frame C]\nHTTP/3:   Runs over QUIC (UDP) — Packet drops in Stream 1 do NOT stall Stream 2',
        takeaway: 'HTTP/3 over QUIC delivers sub-100ms first-contentful paint across lossy mobile networks.'
      },
      {
        title: 'Domain Name System (DNS) Resolution Hierarchy',
        subtitle: 'Distributed hierarchical database converting hostnames to IP addresses',
        points: [
          'Root Servers (.): 13 logical root server authorities deployed worldwide via Anycast routing.',
          'Top-Level Domain (TLD) Servers: Manage .com, .org, .edu, .in registry pointers.',
          'Authoritative DNS Servers: Maintain actual zone files for individual domain names.',
          'Recursive Resolver (ISP / 8.8.8.8): Queries the hierarchy iteratively and caches records based on TTL.'
        ],
        diagram: 'Client -> Recursive Resolver -> Root Server -> TLD Server (.com) -> Authoritative Server (cresco.edu) -> IP Answer',
        takeaway: 'DNS caching at browser, OS, and recursive resolver prevents global root servers from being overwhelmed.'
      },
      {
        title: 'Core DNS Record Types & Secure DNS (DNSSEC)',
        subtitle: 'Zone file record structures and cryptographic validation',
        points: [
          'A Record: Maps hostname to 32-bit IPv4 address (e.g. cresco.edu -> 93.184.216.34).',
          'AAAA Record: Maps hostname to 128-bit IPv6 address.',
          'CNAME (Canonical Name): Alias pointing to another domain name.',
          'MX (Mail Exchange): Directs email traffic to designated SMTP mail servers with priority weights.',
          'DNSSEC (DNS Security Extensions): Cryptographic signatures (RRSIG) verify integrity and prevent DNS cache poisoning.'
        ],
        diagram: 'example.com.   300   IN   A      93.184.216.34\nexample.com.   300   IN   AAAA   2606:2800:220:1:248:1893:25c8:1946\nmail.example.  300   IN   MX     10 mailserver.example.com.',
        takeaway: 'DNS records define the routing fabric for web, mail, domain verification, and security certificates.'
      },
      {
        title: 'Electronic Mail Architecture: SMTP, POP3 & IMAP',
        subtitle: 'Push delivery protocols vs Pull retrieval protocols',
        points: [
          'SMTP (Simple Mail Transfer Protocol - RFC 5321): Push protocol using TCP port 25 / 587 to send messages between mail servers (MTA to MTA).',
          'POP3 (Post Office Protocol v3 - TCP port 110/995): Simple pull protocol that downloads emails to local client and deletes from server.',
          'IMAP (Internet Message Access Protocol - TCP port 143/993): Synchronized server-side mailbox hierarchy allowing seamless access across multiple devices.',
          'MIME: Extends ASCII email to support UTF-8, multipart attachments, and HTML formatting.'
        ],
        diagram: 'Sender MUA ────[SMTP Push]────> Sender MTA ────[SMTP Push]────> Receiver MTA ────[IMAP Pull]────> Receiver MUA',
        takeaway: 'SMTP is strictly a push delivery protocol; user mailboxes rely on IMAP to maintain persistent folder states.'
      }
    ]
  }
];

export const PptDeckViewer: React.FC = () => {
  const [selectedDeckIdx, setSelectedDeckIdx] = useState(0);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const activeDeck = PPT_DECKS[selectedDeckIdx] || PPT_DECKS[0];
  const activeSlide = activeDeck.slides[currentSlideIdx] || activeDeck.slides[0];

  const handleSelectDeck = (idx: number) => {
    soundFx.playClick();
    setSelectedDeckIdx(idx);
    setCurrentSlideIdx(0);
  };

  const handleNextSlide = () => {
    if (currentSlideIdx < activeDeck.slides.length - 1) {
      soundFx.playClick();
      setCurrentSlideIdx(prev => prev + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIdx > 0) {
      soundFx.playClick();
      setCurrentSlideIdx(prev => prev - 1);
    }
  };

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900/98 p-6 md:p-12 overflow-y-auto' : ''}`}>
      {/* Deck Selector Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {PPT_DECKS.map((deck, idx) => {
            const isSelected = selectedDeckIdx === idx;
            return (
              <button
                key={deck.id}
                onClick={() => handleSelectDeck(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-headline font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-surface-container hover:bg-surface-container-high text-slate-700 dark:text-slate-300'
                }`}
              >
                <Presentation className="w-3.5 h-3.5" />
                <span>{deck.unit} Deck</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/20 text-white">
                  {deck.slidesCount} slides
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-slate-600 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Presentation'}
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Present'}</span>
        </button>
      </div>

      {/* Main Slide Card Container */}
      <div className="bg-white dark:bg-[#111827] border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden transition-all min-h-[460px] flex flex-col justify-between">
        {/* Subtle accent bar */}
        <div 
          className="absolute top-0 left-0 right-0 h-2" 
          style={{ backgroundColor: activeDeck.color }}
        />

        {/* Slide Header */}
        <div>
          <div className="flex items-center justify-between gap-4 mb-3">
            <span 
              className="text-[11px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full"
              style={{ color: activeDeck.color, backgroundColor: `${activeDeck.color}15` }}
            >
              {activeDeck.unit} • Slide {currentSlideIdx + 1} of {activeDeck.slides.length}
            </span>

            <span className="text-xs font-mono text-slate-400">
              {activeDeck.title}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
            {activeSlide.title}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {activeSlide.subtitle}
          </p>
        </div>

        {/* Slide Content Body: Bullet Points + ASCII/Vector Diagram */}
        <div className="my-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Bullet points */}
          <div className="lg:col-span-7 space-y-3">
            {activeSlide.points.map((pt, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  ✓
                </span>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                  {pt}
                </p>
              </div>
            ))}
          </div>

          {/* Architectural Diagram Box */}
          <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 overflow-x-auto whitespace-pre leading-relaxed shadow-inner">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Architectural Model</span>
            </div>
            {activeSlide.diagram}
          </div>
        </div>

        {/* Key Takeaway & Slide Nav Controls */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2 max-w-lg">
            <span className="font-bold text-primary dark:text-primary-fixed uppercase tracking-wider text-[10px]">
              Key Rule:
            </span>
            <span className="italic">{activeSlide.takeaway}</span>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrevSlide}
              disabled={currentSlideIdx === 0}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
              title="Previous Slide"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 px-2">
              {currentSlideIdx + 1} / {activeDeck.slides.length}
            </span>

            <button
              onClick={handleNextSlide}
              disabled={currentSlideIdx === activeDeck.slides.length - 1}
              className="p-2.5 rounded-xl bg-primary hover:bg-primary-container text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
              title="Next Slide"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
