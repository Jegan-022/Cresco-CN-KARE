export interface LessonResource {
  id: string;
  title: string;
  subtitle: string;
  type: 'PDF Summary' | 'Cheat Sheet' | 'RFC Spec' | 'Lab Guide';
  fileFormat: 'PDF';
  fileSize: string;
  pages: string;
  tags: string[];
  description: string;
  keyTopics: string[];
  downloadFileName: string;
  fileContent: string;
}

export const TCP_HANDSHAKE_RESOURCES: LessonResource[] = [
  {
    id: 'res-tcp-1',
    title: 'TCP 3-Way Handshake Visual Summary',
    subtitle: 'Step-by-step state machine & message sequence diagram',
    type: 'PDF Summary',
    fileFormat: 'PDF',
    fileSize: '480 KB',
    pages: '2 Pages',
    tags: ['Handshake', 'Sequence Numbers', 'ISN', 'SYN/ACK'],
    description: 'Comprehensive visual summary illustrating client-server synchronization, pseudo-random Initial Sequence Number (ISN) generation, socket options negotiation, and state transitions.',
    keyTopics: [
      'Step 1: Client SYN (Seq=X, ACK=0, State=SYN_SENT)',
      'Step 2: Server SYN+ACK (Seq=Y, Ack=X+1, State=SYN_RCVD)',
      'Step 3: Client ACK (Seq=X+1, Ack=Y+1, State=ESTABLISHED)',
      'Simultaneous Open & Reset (RST) error handling edge cases'
    ],
    downloadFileName: 'TCP_3-Way_Handshake_Visual_Summary.pdf',
    fileContent: `%PDF-1.4
% Cresco CN University Study Guide
================================================================================
COURSE: CS-4200 COMPUTER NETWORKS
MODULE: SECTION 17 - TCP 3-WAY HANDSHAKE
INSTRUCTOR: Prof. David Miller
================================================================================

1. EXECUTIVE SUMMARY
The Transmission Control Protocol (TCP) establishes full-duplex reliable byte
stream communication using a three-way handshake (RFC 793 / RFC 1122).

2. MESSAGE SEQUENCE TIMELINE
[Client (Active Open)]                           [Server (Passive Open)]
State: CLOSED                                    State: LISTEN
       |                                                |
       | -------- (1) SYN, Seq = X -------------------> |
       |          (Client selects random ISN X)         | State: SYN_RCVD
State: SYN_SENT                                         |
       |                                                |
       | <------- (2) SYN + ACK, Seq = Y, Ack = X+1 --- |
       |          (Server selects random ISN Y)         |
       |                                                |
State: ESTABLISHED                                      |
       |                                                |
       | -------- (3) ACK, Seq = X+1, Ack = Y+1 ------> |
       |          (Optional HTTP payload begins)        | State: ESTABLISHED
       v                                                v

3. SEQUENCE NUMBER ARITHMETIC RULES
- Control flags (SYN, FIN) consume exactly 1 sequence number count.
- The acknowledgment number specifies the NEXT byte expected from the peer.
- Step 1: Client transmits Seq = X (no payload).
- Step 2: Server acknowledges X by sending Ack = X + 1, and introduces Seq = Y.
- Step 3: Client acknowledges Y by sending Ack = Y + 1.

4. EXAM TIPS & PITFALLS
- Why 3 steps instead of 2? A 2-way handshake cannot protect against duplicate
  delayed packets from previous dead connections, causing phantom half-open states.
- TCP Options negotiated during SYN: Maximum Segment Size (MSS), Window Scale (WS),
  Selective Acknowledgment (SACK-Permitted), and Timestamps.
================================================================================`,
  },
  {
    id: 'res-tcp-2',
    title: 'TCP Header & Flags Quick Cheat Sheet',
    subtitle: 'Bit-by-bit header layout, flags truth table, and standard port reference',
    type: 'Cheat Sheet',
    fileFormat: 'PDF',
    fileSize: '320 KB',
    pages: '1 Page',
    tags: ['Header Flags', 'Bit Offsets', 'Window Size', 'Checksum'],
    description: 'Compact 1-page printable reference of the 20-byte TCP minimum header, bit flags (URG, ACK, PSH, RST, SYN, FIN), window scale parameters, and default timeouts.',
    keyTopics: [
      '20-byte standard TCP header layout (0 to 31 bit grid)',
      '6 Control Flags: URG, ACK, PSH, RST, SYN, FIN semantics',
      'Window Size field & Window Scale Option (RFC 7323)',
      'TCP Timer Reference: RTO, Keep-Alive, and TIME_WAIT (2MSL)'
    ],
    downloadFileName: 'TCP_Header_and_Flags_CheatSheet.pdf',
    fileContent: `%PDF-1.4
% Cresco CN Academic Cheat Sheet
================================================================================
TCP HEADER SPECIFICATION CHEAT SHEET (RFC 793)
================================================================================

0                   1                   2                   3
0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|          Source Port          |       Destination Port        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                        Sequence Number                        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Acknowledgment Number                      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Data |           |U|A|P|R|S|F|                               |
| Offset| Reserved  |R|C|S|S|Y|I|            Window             |
| (4b)  |   (6b)    |G|K|H|T|N|N|                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|           Checksum            |        Urgent Pointer         |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Options                    |    Padding    |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

FLAG DEFINITIONS:
- SYN (Synchronize): Establishes connection, consumes 1 sequence number.
- ACK (Acknowledgment): Validates the Ack Number field (set on all non-initial packets).
- FIN (Finish): Sender has finished sending data, initiates graceful termination.
- RST (Reset): Erroneous connection abort; rejects invalid port or malformed segment.
- PSH (Push): Prompts receiver application buffer to process data immediately.
- URG (Urgent): Points to out-of-band high-priority emergency byte payload.
================================================================================`,
  },
  {
    id: 'res-tcp-3',
    title: 'TCP vs UDP Comparison & Exam Formula Card',
    subtitle: 'Side-by-side protocol architecture matrix for university exams',
    type: 'Cheat Sheet',
    fileFormat: 'PDF',
    fileSize: '390 KB',
    pages: '2 Pages',
    tags: ['Exam Prep', 'TCP vs UDP', 'Flow Control', 'Congestion'],
    description: 'High-yield examination review matrix comparing connection models, reliability guarantees, flow control, congestion window algorithms (AIMD, Slow Start), and overhead.',
    keyTopics: [
      'Connection-oriented vs Connectionless operational models',
      'Reliability: Retransmissions, Checksums, and In-Order Sequencing',
      'Throughput & Latency: Real-time UDP (VoIP, Gaming) vs TCP',
      'Congestion Control: Slow Start, Additive Increase Multiplicative Decrease (AIMD)'
    ],
    downloadFileName: 'TCP_vs_UDP_Exam_Formula_Card.pdf',
    fileContent: `%PDF-1.4
% Cresco CN University Study Guide
================================================================================
TCP VS UDP ARCHITECTURAL COMPARISON & FORMULA CARD
================================================================================
PROPERTY               TCP (RFC 793)               UDP (RFC 768)
--------------------------------------------------------------------------------
Connection Type        Connection-Oriented         Connectionless
Header Overhead        20 - 60 Bytes               8 Bytes fixed
Reliability            Guaranteed (ACK + Retrans)  Best Effort (Unreliable)
Ordering               In-order delivery (Seq #)   Unordered arrival
Flow Control           Yes (Sliding Window)        None
Congestion Control     Yes (AIMD, Reno, CUBIC)     None (Handled in app layer)
Handshake Delay        1 RTT (3-Way Handshake)     0 RTT (Instant sending)
Typical Protocols      HTTP/HTTPS, SSH, SMTP, FTP  DNS, DHCP, QUIC, VoIP, WireGuard
================================================================================
KEY FORMULAS:
1. Effective Window = min(Congestion Window [CWND], Receiver Advertised Window [RWND])
2. Retransmission Timeout: RTO = SRTT + 4 * RTTVAR
3. TCP Bandwidth-Delay Product: BDP = Bandwidth (bps) * Round-Trip Time (sec)
================================================================================`,
  },
  {
    id: 'res-tcp-4',
    title: 'RFC 793 Specification Summary & State Machine',
    subtitle: 'Curated 4-page academic abstract of official IETF standards',
    type: 'RFC Spec',
    fileFormat: 'PDF',
    fileSize: '610 KB',
    pages: '4 Pages',
    tags: ['RFC 793', 'IETF Standard', 'State Machine', 'FIN/RST'],
    description: 'Condensed academic summary of the original IETF RFC 793 standardizing Transmission Control Protocol mechanisms, connection teardown (4-way wave), and timeout heuristics.',
    keyTopics: [
      'Official IETF RFC 793 architectural motivation & design criteria',
      'Complete 11-State TCP Finite State Machine diagram',
      '4-way connection teardown (FIN, ACK, FIN, ACK)',
      'TIME_WAIT 2MSL rationale (flushing delayed duplicate segments)'
    ],
    downloadFileName: 'RFC_793_TCP_Specification_Summary.pdf',
    fileContent: `%PDF-1.4
% IETF Educational Series
================================================================================
IETF RFC 793 SPECIFICATION SUMMARY: TRANSMISSION CONTROL PROTOCOL
================================================================================
1. SCOPE & PHILOSOPHY
RFC 793 provides a highly reliable host-to-host protocol for packet-switched
computer communication networks.

2. TCP FINITE STATE MACHINE (FSM) STATES:
- CLOSED: Fictional state; connection does not exist.
- LISTEN: Server waiting for connection request from remote peer.
- SYN-SENT: Active open sent; waiting for matching connection request.
- SYN-RECEIVED: Connection request received & ACK sent; awaiting ACK.
- ESTABLISHED: Open connection; data transfer phase.
- FIN-WAIT-1: Active close initiated; FIN sent.
- FIN-WAIT-2: Peer ACK received; waiting for peer FIN.
- CLOSE-WAIT: Passive close; received FIN, sent ACK; waiting for local close.
- CLOSING: Both ends sent FIN simultaneously.
- LAST-ACK: Passive close; FIN sent; awaiting final ACK.
- TIME-WAIT: Wait state (2 * MSL = 120 sec) to ensure remote host received final ACK.
================================================================================`,
  },
  {
    id: 'res-tcp-5',
    title: 'Wireshark Packet Analysis Trace Guide',
    subtitle: 'Hands-on lab filter cheat sheet and live packet capture walkthrough',
    type: 'Lab Guide',
    fileFormat: 'PDF',
    fileSize: '440 KB',
    pages: '2 Pages',
    tags: ['Wireshark', 'Packet Capture', 'PCAP', 'tcpdump'],
    description: 'Practical lab cheat sheet for dissecting TCP 3-way handshake packets inside Wireshark, including display filters, relative vs absolute sequence numbers, and flag byte decoding.',
    keyTopics: [
      'Top Wireshark display filters: tcp.flags.syn==1, tcp.port==443',
      'Dissecting flags in hex: 0x002 (SYN) and 0x012 (SYN+ACK)',
      'Understanding Wireshark Relative Sequence Numbers vs Raw 32-bit values',
      'Diagnosing TCP resets, retransmissions, and duplicate ACKs'
    ],
    downloadFileName: 'Wireshark_TCP_Handshake_Trace_Guide.pdf',
    fileContent: `%PDF-1.4
% Cresco CN Practical Network Labs
================================================================================
WIRESHARK PACKET ANALYSIS: TCP HANDSHAKE LAB GUIDE
================================================================================
USEFUL DISPLAY FILTERS:
- Filter SYN packets only:               tcp.flags.syn == 1 && tcp.flags.ack == 0
- Filter SYN-ACK packets only:           tcp.flags.syn == 1 && tcp.flags.ack == 1
- Filter packets by socket pair:         ip.addr == 192.168.1.10 && tcp.port == 80
- Find connection resets:                tcp.flags.reset == 1
- Detect Retransmissions:                tcp.analysis.retransmission

INTERPRETING RAW HEX FLAG BYTES:
Byte 13 in the TCP header stores control flags:
- 0x02 = SYN (0000 0010)
- 0x12 = SYN + ACK (0001 0010)
- 0x10 = ACK (0001 0000)
- 0x11 = FIN + ACK (0001 0001)
- 0x14 = RST + ACK (0001 0100)
================================================================================`,
  },
];

export function getLessonResources(lessonTitle: string, sectionTitle: string): LessonResource[] {
  const normalizedLesson = lessonTitle.toLowerCase();
  const normalizedSection = sectionTitle.toLowerCase();

  // If TCP Handshake or Section 17, return the comprehensive 5-resource suite
  if (normalizedLesson.includes('handshake') || normalizedLesson.includes('tcp') && normalizedSection.includes('17')) {
    return TCP_HANDSHAKE_RESOURCES;
  }

  // If Subnetting or IP Addressing
  if (normalizedLesson.includes('subnet') || normalizedSection.includes('subnet') || normalizedLesson.includes('ipv4') || normalizedLesson.includes('cidr')) {
    return [
      {
        id: 'res-subnet-1',
        title: 'Subnetting & VLSM Calculation Cheat Sheet',
        subtitle: 'CIDR prefix table (/8 through /30), host formulas & bitmask chart',
        type: 'Cheat Sheet',
        fileFormat: 'PDF',
        fileSize: '360 KB',
        pages: '2 Pages',
        tags: ['Subnetting', 'VLSM', 'CIDR', 'Host Math'],
        description: 'Instant lookup tables for subnet masks, total vs usable hosts calculation (2^(32-prefix) - 2), and step-by-step Variable Length Subnet Masking.',
        keyTopics: [
          'Binary to decimal conversion table for Octet 4',
          'Usable host formula: 2^H - 2 (subtract network ID and broadcast)',
          'Block sizes and magic number increment method',
          'RFC 1918 Private IPv4 address blocks: 10/8, 172.16/12, 192.168/16'
        ],
        downloadFileName: 'Subnetting_VLSM_CheatSheet.pdf',
        fileContent: `%PDF-1.4\n% Cresco CN Subnetting Study Sheet\nUsable Hosts = 2^(32 - prefix) - 2\nMagic Number = 256 - Subnet Octet Value`,
      },
      {
        id: 'res-subnet-2',
        title: 'IPv4 vs IPv6 Header Architecture Summary',
        subtitle: 'Field-by-field packet header comparison & transition protocols',
        type: 'PDF Summary',
        fileFormat: 'PDF',
        fileSize: '410 KB',
        pages: '2 Pages',
        tags: ['IPv4', 'IPv6', 'Header Comparison', 'Dual-Stack'],
        description: 'Comprehensive diagram showing IPv4 20-byte dynamic header vs IPv6 streamlined 40-byte fixed header, eliminating checksums and hop-by-hop fragmentation.',
        keyTopics: [
          'IPv4 20-byte header: TTL, Protocol, Header Checksum, Options',
          'IPv6 40-byte fixed header: Hop Limit, Next Header, Flow Label',
          'Why IPv6 eliminated header checksums and intermediate fragmentation',
          'Dual-stack, 6to4 tunneling, and NAT64 migration mechanisms'
        ],
        downloadFileName: 'IPv4_vs_IPv6_Header_Summary.pdf',
        fileContent: `%PDF-1.4\n% Cresco CN Header Architecture\nIPv4 Header: 20-60 bytes (variable)\nIPv6 Header: 40 bytes (fixed)`,
      },
      {
        id: 'res-subnet-3',
        title: 'Subnetting Exam Practice & Shortcut Guide',
        subtitle: 'High-yield exam techniques for rapid network boundary calculation',
        type: 'Cheat Sheet',
        fileFormat: 'PDF',
        fileSize: '310 KB',
        pages: '1 Page',
        tags: ['Exam Prep', 'Fast Math', 'Network ID', 'Broadcast'],
        description: 'Fast mental math shortcuts for finding network ID, broadcast IP, and first/last usable host addresses in under 20 seconds during timed exams.',
        keyTopics: [
          'The 256 minus Subnet Mask rule',
          'Classless Inter-Domain Routing (CIDR) notation shortcuts',
          'Common exam trap questions: /31 point-to-point links and /32 host routes'
        ],
        downloadFileName: 'Subnetting_Exam_Shortcut_Guide.pdf',
        fileContent: `%PDF-1.4\n% Cresco CN Exam Prep Guide\nRule of 256: Subtract the non-zero octet from 256 to find interval block size.`,
      },
      {
        id: 'res-subnet-4',
        title: 'RFC 4632 & RFC 1918 Standards Abstract',
        subtitle: 'Official IETF specification of CIDR and private address allocations',
        type: 'RFC Spec',
        fileFormat: 'PDF',
        fileSize: '520 KB',
        pages: '3 Pages',
        tags: ['RFC 4632', 'RFC 1918', 'IETF', 'CIDR Architecture'],
        description: 'Curated standard specifications outlining the elimination of Class A/B/C networks and the establishment of prefix-based routing.',
        keyTopics: [
          'History and exhaustion of classful addressing',
          'Hierarchical aggregation of route advertisements',
          'Private address space allocation rules'
        ],
        downloadFileName: 'RFC_4632_CIDR_Standards_Summary.pdf',
        fileContent: `%PDF-1.4\n% IETF RFC 4632 Abstract\nClassless Inter-domain Routing (CIDR): The Internet Address Assignment and Aggregation Plan.`,
      },
    ];
  }

  // If OSI or Network Fundamentals
  if (normalizedLesson.includes('osi') || normalizedSection.includes('osi') || normalizedLesson.includes('model') || normalizedSection.includes('introduction')) {
    return [
      {
        id: 'res-osi-1',
        title: 'OSI 7-Layer vs TCP/IP 4-Layer Master Summary',
        subtitle: 'Cross-layer protocol mapping, encapsulation, and PDU definitions',
        type: 'PDF Summary',
        fileFormat: 'PDF',
        fileSize: '490 KB',
        pages: '3 Pages',
        tags: ['OSI Model', 'TCP/IP Model', 'PDU', 'Encapsulation'],
        description: 'Complete comparative study guide detailing Physical, Data Link, Network, Transport, Session, Presentation, and Application layers with data encapsulation stages.',
        keyTopics: [
          'Protocol Data Units: Bits -> Frames -> Packets -> Segments -> Data',
          'Layer-to-layer header encapsulation & de-encapsulation flow',
          'Comparing ISO OSI reference model with practical Internet TCP/IP stack',
          'Hardware mapping: Hubs (L1), Switches (L2), Routers (L3), Gateways (L7)'
        ],
        downloadFileName: 'OSI_7_Layer_Master_Summary.pdf',
        fileContent: `%PDF-1.4\n% Cresco CN OSI Reference Guide\nLayer 7: Application | Layer 4: Transport (Segment)\nLayer 3: Network (Packet) | Layer 2: Data Link (Frame) | Layer 1: Physical (Bits)`,
      },
      {
        id: 'res-osi-2',
        title: 'Network Protocols & Port Numbers Cheat Sheet',
        subtitle: 'Standard IANA well-known port allocations (0-1023) and protocol specs',
        type: 'Cheat Sheet',
        fileFormat: 'PDF',
        fileSize: '290 KB',
        pages: '1 Page',
        tags: ['Port Numbers', 'IANA', 'Protocols', 'Cheat Sheet'],
        description: 'Quick-reference sheet listing all critical networking ports (DNS 53, HTTP 80, HTTPS 443, SSH 22, DHCP 67/68, NTP 123) with transport protocol associations.',
        keyTopics: [
          'Well-known ports (0-1023), Registered ports (1024-49151), Dynamic ports',
          'TCP-only vs UDP-only vs Dual-mode (DNS 53, SNMP) services',
          'Security implications of unencrypted legacy protocols (Telnet 23, FTP 21)'
        ],
        downloadFileName: 'Network_Protocols_and_Ports_CheatSheet.pdf',
        fileContent: `%PDF-1.4\n% Cresco CN Ports Reference\nSSH: 22/tcp | DNS: 53/udp+tcp | HTTP: 80/tcp | HTTPS: 443/tcp`,
      },
      {
        id: 'res-osi-3',
        title: 'Data Encapsulation & Framing Lab Guide',
        subtitle: 'Dissecting Ethernet frames, preamble, MAC addresses, and FCS',
        type: 'Lab Guide',
        fileFormat: 'PDF',
        fileSize: '380 KB',
        pages: '2 Pages',
        tags: ['Ethernet', 'MAC Address', 'Framing', 'CRC Checksum'],
        description: 'Visual breakdown of Ethernet II frame structures, 48-bit MAC addresses, OUI manufacturer prefixes, MTU boundaries, and CRC-32 Frame Check Sequence verification.',
        keyTopics: [
          'Ethernet II frame: Preamble, SFD, Dest MAC, Source MAC, EtherType, Payload, FCS',
          'Standard 1500-byte MTU and Jumbo Frames (9000 bytes)',
          'Broadcast (FF:FF:FF:FF:FF:FF) vs Multicast vs Unicast MAC addressing'
        ],
        downloadFileName: 'Data_Encapsulation_and_Framing_Guide.pdf',
        fileContent: `%PDF-1.4\n% Cresco CN Ethernet Architecture\nEthernet II Framing & MAC Addressing Specification Guide.`,
      },
      {
        id: 'res-osi-4',
        title: 'RFC 1122 Host Requirements Architectural Abstract',
        subtitle: 'Fundamental engineering principles of the Internet architecture',
        type: 'RFC Spec',
        fileFormat: 'PDF',
        fileSize: '540 KB',
        pages: '3 Pages',
        tags: ['RFC 1122', 'Host Requirements', 'Internet Model', 'End-to-End'],
        description: 'Essential review of RFC 1122 standardizing communication layer requirements and the robust Postel Principle ("Be conservative in what you send, liberal in what you accept").',
        keyTopics: [
          'The End-to-End Argument in system design',
          'Communication layer requirements for Internet hosts',
          'Postel\'s Robustness Principle in protocol implementation'
        ],
        downloadFileName: 'RFC_1122_Host_Requirements_Summary.pdf',
        fileContent: `%PDF-1.4\n% IETF RFC 1122 Summary\nRequirements for Internet Hosts -- Communication Layers.`,
      },
    ];
  }

  // Default dynamic contextual set for any other lesson/section in the course
  return [
    {
      id: `res-${lessonTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}-1`,
      title: `${lessonTitle} Lecture Summary`,
      subtitle: 'Complete structured lecture notes & architectural takeaways',
      type: 'PDF Summary',
      fileFormat: 'PDF',
      fileSize: '460 KB',
      pages: '2 Pages',
      tags: ['Lecture Notes', 'Key Takeaways', 'Architecture', 'Syllabus'],
      description: `Comprehensive PDF lecture review covering fundamental principles, message exchanges, state machines, and core formulas for ${lessonTitle}.`,
      keyTopics: [
        `Core theoretical foundations of ${lessonTitle}`,
        'Protocol message formats and header field definitions',
        'Real-world deployment considerations and performance impacts',
        'Summary checklist for midterms and final exams'
      ],
      downloadFileName: `${lessonTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_Summary.pdf`,
      fileContent: `%PDF-1.4\n% Cresco CN Lecture Notes\nCourse: CS-4200 Computer Networks\nTopic: ${lessonTitle}\nSection: ${sectionTitle}\nInstructor: Prof. David Miller\n================================================================================\nSummary notes and key architectural principles for ${lessonTitle}.`,
    },
    {
      id: `res-${lessonTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}-2`,
      title: `${lessonTitle} Quick Reference Cheat Sheet`,
      subtitle: 'High-density printable lookup card with formulas and flags',
      type: 'Cheat Sheet',
      fileFormat: 'PDF',
      fileSize: '310 KB',
      pages: '1 Page',
      tags: ['Cheat Sheet', 'Quick Reference', 'Formulas', 'Syntax'],
      description: `Single-page dense cheat sheet with critical packet formats, state transitions, port associations, and troubleshooting command shortcuts for ${lessonTitle}.`,
      keyTopics: [
        'Quick parameter and flag lookup tables',
        'Diagnostic terminal commands (netstat, ss, tcpdump, traceroute, dig)',
        'Common failure modes and debugging checklists'
      ],
      downloadFileName: `${lessonTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_CheatSheet.pdf`,
      fileContent: `%PDF-1.4\n% Cresco CN Quick Reference Cheat Sheet\n${lessonTitle} fast reference lookup table and diagnostics commands.`,
    },
    {
      id: `res-${lessonTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}-3`,
      title: `${sectionTitle} Exam Preparation Review`,
      subtitle: 'Targeted high-yield review questions and practice problems',
      type: 'Cheat Sheet',
      fileFormat: 'PDF',
      fileSize: '380 KB',
      pages: '2 Pages',
      tags: ['Exam Review', 'Practice Problems', 'High-Yield', 'CS-4200'],
      description: `Targeted review card with typical examination questions, calculation walkthroughs, and warning notes on common student misunderstandings.`,
      keyTopics: [
        '5 high-yield exam questions with model answers',
        'Mathematical problem solving steps',
        'Trap questions and subtle protocol edge cases'
      ],
      downloadFileName: `${sectionTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_Exam_Review.pdf`,
      fileContent: `%PDF-1.4\n% Cresco CN Academic Exam Review\nHigh-yield practice problems and theoretical checks for ${sectionTitle}.`,
    },
    {
      id: `res-${lessonTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}-4`,
      title: `IETF Standards & Architecture Reference`,
      subtitle: 'Condensed RFC specification and protocol format standard',
      type: 'RFC Spec',
      fileFormat: 'PDF',
      fileSize: '520 KB',
      pages: '3 Pages',
      tags: ['IETF', 'RFC Standard', 'Wire Format', 'Specifications'],
      description: `Academic summary of applicable RFC standards, packet wire layout diagrams, and protocol conformance guidelines for ${lessonTitle}.`,
      keyTopics: [
        'Official IETF standards citations and RFC references',
        'Interoperability rules and security considerations',
        'Protocol extensions and contemporary RFC updates'
      ],
      downloadFileName: `${lessonTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_RFC_Spec.pdf`,
      fileContent: `%PDF-1.4\n% IETF Specification Series\nOfficial standards abstract and wire format reference for ${lessonTitle}.`,
    },
  ];
}

