import { Lesson } from '../types';
import { fetchWithAuth } from '../lib/api';

export interface LessonSummaryResult {
  bullets: string[];
  keyConcept: string;
  source: 'gemini' | 'curriculum';
  generatedAt: string;
}

// Curated 3-bullet summaries matching Computer Networks curricula
const FALLBACK_SUMMARIES: Record<string, { bullets: [string, string, string]; keyConcept: string }> = {
  'sec-17-les-1': {
    bullets: [
      'Step 1 (SYN): The client sends an initial SYN packet containing a randomized sequence number (ISN_c) to synchronize states without payload.',
      'Step 2 (SYN-ACK): The server allocates socket buffers, echoes the client sequence with ACK = ISN_c + 1, and supplies its own randomized sequence number (ISN_s).',
      'Step 3 (ACK): The client acknowledges the server sequence with ACK = ISN_s + 1, completing the full-duplex handshake and transitioning both endpoints to ESTABLISHED.'
    ],
    keyConcept: 'Reliable Full-Duplex Synchronization (RFC 793)'
  },
  'sec-1-les-1': {
    bullets: [
      'Core Definition: A computer network is an interconnected group of autonomous computing devices exchanging data over packet-switched communication channels.',
      'Packet Switching Paradigm: Information is segmented into variable-length packets routed independently across shared intermediate links, maximizing bandwidth utilization.',
      'Edge vs Core: End systems (hosts, servers) form the network edge running applications, while routers and switches comprise the network core performing forwarding.'
    ],
    keyConcept: 'Packet-Switched Distributed Communication'
  },
  'sec-1-les-2': {
    bullets: [
      'LAN (Local Area Network): High data rates (up to 10 Gbps) spanning single rooms, offices, or campuses under single administrative ownership.',
      'MAN (Metropolitan Area Network): City-wide optical fiber backbones connecting multiple enterprise sites or municipal public service nodes.',
      'WAN (Wide Area Network): Global or trans-continental networks (like the public Internet) composed of leased lines, satellite links, and submarine cables.'
    ],
    keyConcept: 'Geographic Scope & Administrative Boundaries'
  },
  'sec-1-les-3': {
    bullets: [
      'Star Topology: Dominant modern Ethernet layout where each host connects to a central switch; failure of one cable only isolates a single node.',
      'Mesh Topology: Every node possesses point-to-point links to all other nodes, offering maximum fault tolerance at quadratic cabling cost (N*(N-1)/2).',
      'Bus & Ring Legacy: Bus uses a shared coaxial trunk prone to collisions; Token Ring passes circulating tokens where breakages could sever loop communication.'
    ],
    keyConcept: 'Physical Layout vs Single Points of Failure'
  },
  'sec-3-les-1': {
    bullets: [
      '7-Layer Hierarchical Model: Divides network responsibilities into Physical, Data Link, Network, Transport, Session, Presentation, and Application layers.',
      'Encapsulation Flow: User data moves downward during transmission, with each layer attaching a specialized header (PDU: Data → Segment → Packet → Frame → Bits).',
      'Logical Peer-to-Peer Communication: Each layer at the sender communicates virtually with the corresponding layer at the receiver through standard protocol rules.'
    ],
    keyConcept: 'OSI 7-Layer Protocol Abstraction & Encapsulation'
  },
  'sec-4-les-1': {
    bullets: [
      '4-Layer Practical Architecture: Streamlines the OSI model into Link, Internet, Transport, and Application layers for real-world Internet implementation.',
      'The "Hourglass" Waist: IP (Internet Protocol) sits at the narrow center of the stack, allowing diverse application protocols above to run across any physical media below.',
      'OSI vs TCP/IP: TCP/IP integrates Session and Presentation functions into the user Application layer, prioritizing pragmatic implementation over strict theoretical separation.'
    ],
    keyConcept: 'Hourglass Protocol Architecture & Internet Protocols'
  },
  'sec-15-les-1': {
    bullets: [
      'Minimum 20-Byte Header: Contains source/destination 16-bit ports, 32-bit sequence numbers, 32-bit acknowledgment numbers, and header length offset.',
      '6 Core Control Flags: URG, ACK, PSH, RST, SYN, and FIN govern session initiation, graceful teardown, urgent data delivery, and abrupt connection resets.',
      'Flow Control Window: The 16-bit Receive Window (rwnd) field enables the receiver to throttle sender transmission speed to prevent socket buffer overrun.'
    ],
    keyConcept: 'TCP Segment Header Structure & Control Flags'
  },
  'sec-16-les-1': {
    bullets: [
      'Minimal 8-Byte Overhead: UDP provides only Source Port, Destination Port, Length, and optional Checksum fields with zero connection handshake delay.',
      'Unreliable Best-Effort Delivery: No sequence tracking, no retransmissions for dropped packets, and no congestion control mechanisms.',
      'Optimal Use Cases: Real-time audio/video streaming (VoIP, WebRTC), DNS queries, multiplayer gaming, and QUIC/HTTP3 transport foundations.'
    ],
    keyConcept: 'Connectionless, Low-Latency Datagram Transport'
  },
  'sec-18-les-1': {
    bullets: [
      'Slow Start Phase: The sender begins with a small Congestion Window (cwnd = 1 MSS) and doubles it exponentially every RTT until reaching ssthresh.',
      'Congestion Avoidance: Once cwnd reaches ssthresh, cwnd increases linearly by +1 MSS per RTT (Additive Increase) to gently probe available link capacity.',
      'Loss Response (AIMD): Upon packet loss detection via 3 duplicate ACKs, Fast Retransmit triggers and cwnd is halved (Multiplicative Decrease).'
    ],
    keyConcept: 'Additive Increase Multiplicative Decrease (AIMD)'
  },
  'sec-20-les-1': {
    bullets: [
      'DORA 4-Step Exchange: Client broadcasts Discover (UDP 67/68), server replies with Offer, client broadcasts Request, and server confirms with Acknowledgment (ACK).',
      'Dynamic Lease Management: Clients receive temporary IP addresses with a configurable lease duration, renewing automatically at 50% (T1) and 87.5% (T2) intervals.',
      'Essential Network Parameters: Beyond the IP address, DHCP supplies the Subnet Mask, Default Gateway router address, and Primary/Secondary DNS servers.'
    ],
    keyConcept: 'DORA Protocol & Automated Host Configuration'
  },
  'sec-21-les-1': {
    bullets: [
      'Stateless Request-Response: Each HTTP exchange executes independently over TCP port 80/443 without persistent session state between transactions.',
      'HTTP Methods & Status Codes: Standard verbs (GET, POST, PUT, DELETE) pair with standardized response codes (200 OK, 301 Redirect, 404 Not Found, 500 Error).',
      'HTTP/1.1 vs HTTP/2: HTTP/1.1 suffered from Head-of-Line blocking over text pipelines; HTTP/2 introduced binary framing and stream multiplexing over a single TCP socket.'
    ],
    keyConcept: 'Application Protocol Semantics & Multiplexing'
  },
  'sec-22-les-1': {
    bullets: [
      'Triple Security Guarantee: HTTPS provides Confidentiality (encryption), Data Integrity (tamper detection via HMAC), and Server Authentication (X.509 certs).',
      'TLS 1.3 1-RTT Handshake: Combines key agreement and cipher parameter negotiation into a single round trip using Ephemeral Elliptic Curve Diffie-Hellman (ECDHE).',
      'Hybrid Encryption: Uses slow asymmetric public key cryptography only to authenticate the server and negotiate a symmetric session key for high-speed bulk data.'
    ],
    keyConcept: 'TLS 1.3 Hybrid Cryptography & Authenticated Channels'
  }
};

export async function fetchLessonAISummary(lesson: Lesson, sectionTitle: string): Promise<LessonSummaryResult> {
  // First attempt: call server-side Gemini API endpoint
  try {
    const response = await fetchWithAuth('/api/lesson-summary', {
      method: 'POST',
      body: JSON.stringify({
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        sectionTitle: sectionTitle,
        overview: lesson.overview || '',
        keyTakeaway: lesson.keyTakeaway || '',
        duration: lesson.duration,
        type: lesson.type,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.bullets) && data.bullets.length >= 3) {
        return {
          bullets: data.bullets.slice(0, 3),
          keyConcept: data.keyConcept || lesson.keyTakeaway || 'Core Computer Networks Principle',
          source: 'gemini',
          generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }
    }
  } catch {
    // Graceful fallback to client-side curriculum summary
  }

  // Check known curated fallback summaries
  const cached = FALLBACK_SUMMARIES[lesson.id];
  if (cached) {
    return {
      bullets: cached.bullets,
      keyConcept: cached.keyConcept,
      source: 'curriculum',
      generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }

  // Intelligent dynamic synthesis from lesson properties
  const takeaway = lesson.keyTakeaway || 'Fundamental protocol architecture and communication standard.';
  const overview = lesson.overview || 'Exploration of packet structures, state machines, and transmission mechanics.';
  
  return {
    bullets: [
      `Core Principle: ${takeaway}`,
      `Protocol Mechanics: ${overview}`,
      `Exam Takeaway: Master the state transitions, header flags, and latency implications of ${lesson.title} for midterm review.`
    ],
    keyConcept: lesson.title,
    source: 'curriculum',
    generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}
