import { Course, CourseSection, PracticeCategory, LeaderboardStudent, StudentProfile, TeacherMetric, LiveClassroomState, SearchResultItem } from '../types';

export const PRIMARY_COURSE: Course = {
  id: 'cs-4200',
  title: 'Computer Networks: Units 3, 4 & 5',
  subtitle: 'Gamified, pedagogical learning system for Network Layer, Transport Layer, and Application Layer.',
  instructor: 'Prof. David Miller',
  instructorTitle: 'Chair of Computer Science & Systems, MIT/Stanford Fellow',
  instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  rating: 4.8,
  studentsCount: 300,
  progressPercent: 0,
  completedLessonsCount: 0,
  totalLessonsCount: 30,
  currentLessonId: 'u3_m1',
  currentLessonTitle: 'Module 3.1: Network Layer: Need, Issues & Services',
  lastAccessed: 'Never',
  sectionsCount: 3,
  category: 'Computer Science',
  description: 'This comprehensive course equips engineering and computer science students with a rigorous, practical understanding of modern data communications. From physical bit signaling to application layer protocols, you will explore the full TCP/IP stack with interactive protocol packet walkthroughs and hands-on drills.',
};

export const SECONDARY_COURSES: Course[] = [
  {
    id: 'cs-4210',
    title: 'Network Security & Cryptography',
    subtitle: 'Principles of secure communication, public key infrastructure, firewalls, and TLS handshake architecture.',
    instructor: 'Dr. Sarah Jenkins',
    instructorTitle: 'Associate Professor of Cybersecurity',
    instructorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    rating: 4.9,
    studentsCount: 215,
    progressPercent: 0,
    completedLessonsCount: 0,
    totalLessonsCount: 30,
    currentLessonId: 'sec-sec-1',
    currentLessonTitle: 'Symmetric vs Asymmetric Encryption',
    lastAccessed: 'Yesterday, 4:10 PM',
    sectionsCount: 3,
    category: 'Cybersecurity',
    description: 'Master foundational concepts in threat vectors, cryptosystems, and protocol defense implementations.',
  },
  {
    id: 'cs-3150',
    title: 'Cloud Computing & Distributed Systems',
    subtitle: 'Container networking, load balancers, CDN architectures, and microservice RPC communication.',
    instructor: 'Dr. Marcus Vance',
    instructorTitle: 'Principal Cloud Architect',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 4.7,
    studentsCount: 180,
    progressPercent: 0,
    completedLessonsCount: 0,
    totalLessonsCount: 17,
    currentLessonId: 'sec-cld-1',
    currentLessonTitle: 'Introduction to Distributed Architectures',
    lastAccessed: '3 days ago',
    sectionsCount: 3,
    category: 'Cloud Systems',
    description: 'Learn how massive global networks coordinate distributed consensus and low-latency replication.',
  },
];

// Clean 30 non-duplicate curriculum modules across Units 3, 4, and 5
export const COURSE_SECTIONS: CourseSection[] = [
  {
    id: 3,
    title: "Unit 3: Network Layer",
    completedLessonsCount: 0,
    totalLessonsCount: 12,
    lessons: [
      {
        id: "u3_m1",
        sectionId: 3,
        title: "Module 3.1: Network Layer: Need, Issues & Services",
        duration: "5 min",
        type: "interactive",
        completed: false,
        overview: "End-to-end host addressing and routing across diverse physical networks.",
        keyTakeaway: "Provides end-to-end host addressing; connectionless datagram vs virtual circuits."
      },
      {
        id: "u3_m2",
        sectionId: 3,
        title: "Module 3.2: Routing Algorithms & Distance Vector vs Link State",
        duration: "8 min",
        type: "interactive",
        completed: false,
        overview: "Bellman-Ford vs Dijkstra SPF algorithms and count-to-infinity mitigation.",
        keyTakeaway: "Distance Vector uses Bellman-Ford; Link State uses Dijkstra SPF."
      },
      {
        id: "u3_m3",
        sectionId: 3,
        title: "Module 3.3: Quality of Service (QoS)",
        duration: "6 min",
        type: "interactive",
        completed: false,
        overview: "Bandwidth, delay, jitter, packet loss, Leaky Bucket and Token Bucket traffic shaping.",
        keyTakeaway: "Leaky Bucket enforces constant rate; Token Bucket allows controlled bursts."
      },
      {
        id: "u3_m4",
        sectionId: 3,
        title: "Module 3.4: IPv4 vs IPv6: Features, Addressing & Packet Formats",
        duration: "9 min",
        type: "interactive",
        completed: false,
        overview: "32-bit dotted-decimal vs 128-bit hexadecimal addressing and header comparisons.",
        keyTakeaway: "IPv4 20-60B header with TTL/checksum; IPv6 fixed 40B header with Hop Limit."
      },
      {
        id: "u3_m5",
        sectionId: 3,
        title: "Module 3.5: Subnetting, CIDR & VLSM",
        duration: "10 min",
        type: "interactive",
        completed: false,
        overview: "Subnet masks, CIDR prefix notation (/n), and variable length subnet design.",
        keyTakeaway: "Usable hosts = 2^(remaining_bits) - 2. Allocate largest requirements first."
      },
      {
        id: "u3_m6",
        sectionId: 3,
        title: "Module 3.6: Routing Protocols: RIP, OSPF & BGP",
        duration: "8 min",
        type: "interactive",
        completed: false,
        overview: "RIP hop count (max 15), OSPF Dijkstra SPF area hierarchy, and BGP AS-Path.",
        keyTakeaway: "RIP (IGP distance vector), OSPF (IGP link state), BGP (EGP path vector over TCP 179)."
      },
      {
        id: "u3_m7",
        sectionId: 3,
        title: "Module 3.7: Network Helpers: DHCP, ARP, NAT & ICMP",
        duration: "9 min",
        type: "interactive",
        completed: false,
        overview: "DHCP DORA sequence, ARP MAC resolution, NAT/PAT translation, and ICMP diagnostics.",
        keyTakeaway: "DHCP leases IPs dynamically; ARP resolves IP to MAC; NAT translates sockets; ICMP reports errors."
      },
      {
        id: "u3_m8",
        sectionId: 3,
        title: "Module 3.8: Hierarchical Routing & Autonomous Systems",
        duration: "8 min",
        type: "interactive",
        completed: false,
        overview: "Autonomous Systems (AS), IGP vs EGP boundary routers, and route aggregation.",
        keyTakeaway: "Divides massive networks into regions and AS domains to bound routing table sizes."
      },
      {
        id: "u3_m9",
        sectionId: 3,
        title: "Module 3.9: IP Packet Fragmentation, Offset & MTU Calculations",
        duration: "9 min",
        type: "interactive",
        completed: false,
        overview: "Maximum Transmission Unit (MTU), DF/MF flags, and Fragment Offset (8-byte units) math.",
        keyTakeaway: "Fragment Offset represents the starting data byte divided by 8; only destination reassembles."
      },
      {
        id: "u3_m10",
        sectionId: 3,
        title: "Module 3.10: Multicast Routing & IGMP",
        duration: "7 min",
        type: "interactive",
        completed: false,
        overview: "Class D multicast addresses, IGMP group joining, and reverse path forwarding (RPF) trees.",
        keyTakeaway: "Class D 224.0.0.0/4 range; IGMP coordinates host group memberships with local routers."
      },
      {
        id: "u3_m11",
        sectionId: 3,
        title: "Module 3.11: Network Layer Congestion Control: RED & ECN",
        duration: "8 min",
        type: "interactive",
        completed: false,
        overview: "Queue management, Random Early Detection (RED), and Explicit Congestion Notification (ECN).",
        keyTakeaway: "RED avoids TCP global synchronization by probabilistic packet drops; ECN marks CE bits without dropping."
      },
      {
        id: "u3_m12",
        sectionId: 3,
        title: "Module 3.12: Software Defined Networking (SDN) & OpenFlow",
        duration: "9 min",
        type: "interactive",
        completed: false,
        overview: "Decoupling control plane from data plane, Southbound OpenFlow APIs, and central controller intelligence.",
        keyTakeaway: "Centralized SDN controllers push match-action flow tables to commodity switch data planes via OpenFlow."
      }
    ]
  },
  {
    id: 4,
    title: "Unit 4: Transport Layer",
    completedLessonsCount: 0,
    totalLessonsCount: 9,
    lessons: [
      {
        id: "u4_m1",
        sectionId: 4,
        title: "Module 4.1: Transport Layer Services & Port Addressing",
        duration: "5 min",
        type: "interactive",
        completed: false,
        overview: "Process-to-process communication, 16-bit ports, multiplexing and demultiplexing.",
        keyTakeaway: "Sockets uniquely identify endpoints. Well-known ports: 0-1023."
      },
      {
        id: "u4_m2",
        sectionId: 4,
        title: "Module 4.2: Reliable Protocols: Stop-and-Wait, Go-Back-N & Selective Repeat",
        duration: "9 min",
        type: "interactive",
        completed: false,
        overview: "Pipelining, cumulative ACKs, window sliding, buffer queues, and sequence space.",
        keyTakeaway: "Stop-and-Wait (N=1); GBN (cumulative ACK, seq space N+1); SR (individual ACK, seq space 2N)."
      },
      {
        id: "u4_m3",
        sectionId: 4,
        title: "Module 4.3: UDP: Datagrams, Services & Applications",
        duration: "5 min",
        type: "interactive",
        completed: false,
        overview: "Connectionless datagram delivery, 8-byte header, zero handshake overhead.",
        keyTakeaway: "8-byte fixed header; low delay; no connection state; ideal for DNS and real-time media."
      },
      {
        id: "u4_m4",
        sectionId: 4,
        title: "Module 4.4: TCP: Segment Format, 3-Way Handshake & Connection States",
        duration: "10 min",
        type: "interactive",
        completed: false,
        overview: "Reliable byte-stream, 20-60B header, 3-way handshake, 4-way teardown, TIME_WAIT.",
        keyTakeaway: "SYN -> SYN+ACK -> ACK establishment; sequence numbers count bytes; TIME_WAIT purges lingering segments."
      },
      {
        id: "u4_m5",
        sectionId: 4,
        title: "Module 4.5: TCP Flow Control, Error Control & Congestion Control",
        duration: "12 min",
        type: "interactive",
        completed: false,
        overview: "Receiver window (rwnd), Slow Start, AIMD, Fast Retransmit on 3 duplicate ACKs.",
        keyTakeaway: "Window = Min(rwnd, cwnd); AIMD increases linearly and cuts cwnd in half on loss."
      },
      {
        id: "u4_m6",
        sectionId: 4,
        title: "Module 4.6: TCP Congestion Control Evolution: Tahoe, Reno, NewReno & BBR",
        duration: "10 min",
        type: "interactive",
        completed: false,
        overview: "Evolution from slow start resets in Tahoe to Fast Recovery in Reno, partial ACKs in NewReno, and Google's model-based BBR.",
        keyTakeaway: "Tahoe resets cwnd=1 on 3 DUP ACKs; Reno enters Fast Recovery; BBR bounds bottleneck bandwidth and min RTT without bufferbloat."
      },
      {
        id: "u4_m7",
        sectionId: 4,
        title: "Module 4.7: TCP Timers, RTT Estimation & Karn's Algorithm",
        duration: "9 min",
        type: "interactive",
        completed: false,
        overview: "Jacobson's SRTT/DevRTT math, dynamic Retransmission Timeout (RTO), and Karn's rule ignoring retransmitted segment samples.",
        keyTakeaway: "RTO adapts dynamically via smoothed RTT and variance; Karn's algorithm prevents RTT sample ambiguity during retransmission."
      },
      {
        id: "u4_m8",
        sectionId: 4,
        title: "Module 4.8: Silly Window Syndrome & Nagle's Algorithm",
        duration: "8 min",
        type: "interactive",
        completed: false,
        overview: "Sender and receiver silly window syndromes, Clark's solution, and Nagle's algorithm buffering tinygrams.",
        keyTakeaway: "Silly Window Syndrome causes 40:1 protocol overhead; Nagle buffers unacknowledged small packets unless a full MSS is ready."
      },
      {
        id: "u4_m9",
        sectionId: 4,
        title: "Module 4.9: Modern Transport Protocols: QUIC & SCTP",
        duration: "9 min",
        type: "interactive",
        completed: false,
        overview: "Limitations of TCP head-of-line blocking, Google/IETF QUIC over UDP with TLS 1.3 0-RTT, and SCTP multi-homing/multi-streaming.",
        keyTakeaway: "QUIC runs over UDP eliminating HoL blocking across multiplexed streams; SCTP provides multi-homing message framing."
      }
    ]
  },
  {
    id: 5,
    title: "Unit 5: Application Layer",
    completedLessonsCount: 0,
    totalLessonsCount: 9,
    lessons: [
      {
        id: "u5_m1",
        sectionId: 5,
        title: "Module 5.1: WWW and HTTP / HTTPS",
        duration: "7 min",
        type: "interactive",
        completed: false,
        overview: "Stateless request-response, methods, status codes, persistent connections, TLS.",
        keyTakeaway: "HTTP over port 80 / HTTPS 443 with TLS; methods GET/POST; status codes 2xx, 3xx, 4xx, 5xx."
      },
      {
        id: "u5_m2",
        sectionId: 5,
        title: "Module 5.2: FTP (File Transfer Protocol)",
        duration: "5 min",
        type: "interactive",
        completed: false,
        overview: "Dual TCP connections: Port 21 Control channel vs Port 20 Active/Passive Data channel.",
        keyTakeaway: "Port 21 commands, Port 20 data; Passive mode prevents client firewall blocks."
      },
      {
        id: "u5_m3",
        sectionId: 5,
        title: "Module 5.3: Email Protocols: SMTP, POP3 & IMAP",
        duration: "7 min",
        type: "interactive",
        completed: false,
        overview: "SMTP push (port 25/587), POP3 pull & delete (port 110), IMAP multi-device sync (port 143).",
        keyTakeaway: "SMTP pushes mail to servers; POP3 downloads locally; IMAP synchronizes cloud mailboxes."
      },
      {
        id: "u5_m4",
        sectionId: 5,
        title: "Module 5.4: Remote Terminal: Telnet vs SSH",
        duration: "5 min",
        type: "interactive",
        completed: false,
        overview: "Plaintext terminal risks (port 23) vs encrypted cryptographic tunnels (port 22).",
        keyTakeaway: "Telnet sends credentials in cleartext; SSH encrypts all keystrokes and authentication."
      },
      {
        id: "u5_m5",
        sectionId: 5,
        title: "Module 5.5: DNS (Domain Name System)",
        duration: "8 min",
        type: "interactive",
        completed: false,
        overview: "Hierarchical namespace (Root, TLD, Authoritative), recursive queries, A/AAAA/CNAME/MX records.",
        keyTakeaway: "UDP port 53; translates human domain names to numeric IP addresses."
      },
      {
        id: "u5_m6",
        sectionId: 5,
        title: "Module 5.6: HTTP Evolution: HTTP/1.1 vs HTTP/2 vs HTTP/3",
        duration: "9 min",
        type: "interactive",
        completed: false,
        overview: "Text pipelining in HTTP/1.1, binary framing & multiplexed streams in HTTP/2, and UDP/QUIC transport in HTTP/3.",
        keyTakeaway: "HTTP/2 introduces binary framing and single-connection multiplexing; HTTP/3 moves to QUIC/UDP to eliminate TCP HoL blocking."
      },
      {
        id: "u5_m7",
        sectionId: 5,
        title: "Module 5.7: Web Caching, Cookies & Content Delivery Networks (CDNs)",
        duration: "8 min",
        type: "interactive",
        completed: false,
        overview: "HTTP caching headers (Cache-Control, ETag), 304 Not Modified conditional GETs, session state cookies, and edge CDN distribution.",
        keyTakeaway: "ETag/If-None-Match conditional requests prevent retransmission; edge CDNs terminate connections geographically close to users."
      },
      {
        id: "u5_m8",
        sectionId: 5,
        title: "Module 5.8: Real-Time Multimedia Protocols: RTP, RTSP & WebRTC",
        duration: "9 min",
        type: "interactive",
        completed: false,
        overview: "RTP timestamps & jitter buffering, RTCP QoS feedback, RTSP media session control, and WebRTC peer-to-peer browser mesh.",
        keyTakeaway: "RTP provides sequence numbers and timestamps for real-time playout; WebRTC enables zero-plugin peer-to-peer browser voice/video."
      },
      {
        id: "u5_m9",
        sectionId: 5,
        title: "Module 5.9: Network Management & Monitoring: SNMP & Syslog",
        duration: "7 min",
        type: "interactive",
        completed: false,
        overview: "SNMP architecture (Manager, Agent, MIB OID trees, GET/SET/TRAP), and Syslog standard logging daemon levels.",
        keyTakeaway: "SNMP queries MIB variable trees via UDP 161 and receives asynchronous event traps on UDP 162; Syslog aggregates device logs."
      }
    ]
  }
];

// Clean Practice Categories
export const PRACTICE_CATEGORIES: PracticeCategory[] = [
  {
    id: 'fund',
    title: 'Network Fundamentals',
    description: 'Bandwidth, topologies, transmission media, and packet-switching foundations.',
    questionsCount: 20,
    difficulty: 'Beginner',
    accuracyPercent: 0,
    questions: [
      {
        id: 'q-fund-1',
        lessonNumber: 1,
        totalLessons: 28,
        courseTitle: 'Computer Networks',
        question: 'Which network topology connects all client devices to a single centralized networking device such as a switch?',
        options: [
          { id: 'opt-a', text: 'Ring topology' },
          { id: 'opt-b', text: 'Star topology' },
          { id: 'opt-c', text: 'Bus topology' },
          { id: 'opt-d', text: 'Full mesh topology' },
        ],
        correctOptionId: 'opt-b',
        explanation: 'In a Star topology, all cable runs terminate into a central switch or hub, isolating cable cuts to individual host drops.',
      },
    ],
  },
  {
    id: 'osi',
    title: 'OSI Model',
    description: 'Protocol data units, 7-layer functional roles, and layer boundary encapsulations.',
    questionsCount: 24,
    difficulty: 'Intermediate',
    accuracyPercent: 0,
    questions: [
      {
        id: 'q-osi-1',
        lessonNumber: 6,
        totalLessons: 28,
        courseTitle: 'Computer Networks',
        question: 'Which layer of the OSI model is responsible for routing packets across intermediate networks?',
        options: [
          { id: 'opt-a', text: 'Layer 2: Data Link Layer' },
          { id: 'opt-b', text: 'Layer 3: Network Layer' },
          { id: 'opt-c', text: 'Layer 4: Transport Layer' },
          { id: 'opt-d', text: 'Layer 5: Session Layer' },
        ],
        correctOptionId: 'opt-b',
        explanation: 'The Network layer (Layer 3) handles logical addressing (IPv4/IPv6) and routing decisions across autonomous systems.',
      },
    ],
  },
  {
    id: 'tcp-ip',
    title: 'TCP/IP',
    description: '4-layer model mapping, socket interfaces, and RFC internetworking standards.',
    questionsCount: 18,
    difficulty: 'Intermediate',
    accuracyPercent: 0,
    questions: [
      {
        id: 'q-tcpip-1',
        lessonNumber: 8,
        totalLessons: 28,
        courseTitle: 'Computer Networks',
        question: 'In the 4-layer TCP/IP model, which layer corresponds to the OSI Application, Presentation, and Session layers?',
        options: [
          { id: 'opt-a', text: 'Internet Layer' },
          { id: 'opt-b', text: 'Transport Layer' },
          { id: 'opt-c', text: 'Application Layer' },
          { id: 'opt-d', text: 'Network Access Layer' },
        ],
        correctOptionId: 'opt-c',
        explanation: 'TCP/IP combines the upper three OSI layers into a single Application layer where HTTP, DNS, and TLS operate directly.',
      },
    ],
  },
  {
    id: 'ipv4-ipv6',
    title: 'IPv4 & IPv6',
    description: 'Addressing formats, header fields, broadcast elimination, and SLAAC.',
    questionsCount: 22,
    difficulty: 'Intermediate',
    accuracyPercent: 0,
    questions: [
      {
        id: 'q-ip-1',
        lessonNumber: 10,
        totalLessons: 28,
        courseTitle: 'Computer Networks',
        question: 'How many bits are used in an IPv6 address compared to an IPv4 address?',
        options: [
          { id: 'opt-a', text: '64 bits vs 32 bits' },
          { id: 'opt-b', text: '128 bits vs 32 bits' },
          { id: 'opt-c', text: '128 bits vs 64 bits' },
          { id: 'opt-d', text: '256 bits vs 32 bits' },
        ],
        correctOptionId: 'opt-b',
        explanation: 'IPv4 utilizes 32-bit addresses (~4.3 billion), whereas IPv6 expands the address space to 128 bits (3.4 × 10^38 addresses).',
      },
    ],
  },
  {
    id: 'subnetting',
    title: 'Subnetting',
    description: 'CIDR prefix calculation, wildcard masks, usable host ranges, and VLSM allocation.',
    questionsCount: 25,
    difficulty: 'Advanced',
    accuracyPercent: 0,
    questions: [
      {
        id: 'q-sub-1',
        lessonNumber: 12,
        totalLessons: 28,
        courseTitle: 'Computer Networks',
        question: 'How many usable host IP addresses are available in a subnet with a /26 CIDR prefix?',
        options: [
          { id: 'opt-a', text: '30 hosts' },
          { id: 'opt-b', text: '62 hosts' },
          { id: 'opt-c', text: '64 hosts' },
          { id: 'opt-d', text: '126 hosts' },
        ],
        correctOptionId: 'opt-b',
        explanation: 'A /26 prefix leaves 32 - 26 = 6 host bits. 2^6 = 64 total addresses. Subtracting 2 (network and broadcast addresses) leaves 62 usable host addresses.',
      },
    ],
  },
  {
    id: 'routing',
    title: 'Routing',
    description: 'Static routing, distance-vector protocols, link-state algorithms, and BGP peering.',
    questionsCount: 16,
    difficulty: 'Advanced',
    accuracyPercent: 0,
    questions: [
      {
        id: 'q-route-1',
        lessonNumber: 13,
        totalLessons: 28,
        courseTitle: 'Computer Networks',
        question: 'Which routing protocol uses Dijkstra\'s Shortest Path First (SPF) algorithm to compute loop-free paths?',
        options: [
          { id: 'opt-a', text: 'RIP (Routing Information Protocol)' },
          { id: 'opt-b', text: 'OSPF (Open Shortest Path First)' },
          { id: 'opt-c', text: 'BGP (Border Gateway Protocol)' },
          { id: 'opt-d', text: 'ARP' },
        ],
        correctOptionId: 'opt-b',
        explanation: 'OSPF is a link-state protocol that uses Dijkstra\'s SPF algorithm on its complete topological database to calculate minimal-cost paths.',
      },
    ],
  },
  {
    id: 'tcp-udp',
    title: 'TCP & UDP',
    description: 'Connection establishment, three-way handshakes, sequence numbers, and datagram streaming.',
    questionsCount: 28,
    difficulty: 'Intermediate',
    accuracyPercent: 0,
    questions: [
      {
        id: 'q-tcpudp-1',
        lessonNumber: 17,
        totalLessons: 28,
        courseTitle: 'Computer Networks',
        question: 'What is the exact sequence of TCP control flags exchanged to establish a normal TCP connection?',
        options: [
          { id: 'opt-a', text: 'SYN → ACK → SYN-ACK' },
          { id: 'opt-b', text: 'SYN → SYN-ACK → ACK' },
          { id: 'opt-c', text: 'ACK → SYN → ACK' },
          { id: 'opt-d', text: 'SYN → FIN → ACK' },
        ],
        correctOptionId: 'opt-b',
        explanation: 'The client initiates with a SYN segment, the server responds with SYN-ACK, and the client finishes with an ACK segment.',
      },
    ],
  },
  {
    id: 'app-layer',
    title: 'Application Layer',
    description: 'DNS lookups, HTTP methods, DHCP leasing cycle, and socket communication.',
    questionsCount: 22,
    difficulty: 'Beginner',
    accuracyPercent: 0,
    questions: [
      {
        id: 'q-app-1',
        lessonNumber: 19,
        totalLessons: 28,
        courseTitle: 'Computer Networks',
        question: 'Which protocol is responsible for translating a domain name into an IP address?',
        options: [
          { id: 'opt-a', text: 'HTTP' },
          { id: 'opt-b', text: 'DNS' },
          { id: 'opt-c', text: 'FTP' },
          { id: 'opt-d', text: 'TCP' },
        ],
        correctOptionId: 'opt-b',
        explanation: 'DNS (Domain Name System) translates domain names such as example.com into IP addresses for routing.',
      },
    ],
  },
  {
    id: 'security',
    title: 'Network Security',
    description: 'Packet filtering firewalls, symmetric/asymmetric cryptography, and TLS handshakes.',
    questionsCount: 15,
    difficulty: 'Advanced',
    accuracyPercent: 0,
    questions: [
      {
        id: 'q-sec-1',
        lessonNumber: 23,
        totalLessons: 28,
        courseTitle: 'Computer Networks',
        question: 'In a TLS 1.3 handshake, which cryptographic mechanism is primarily used to securely derive a shared symmetric session key over an insecure channel?',
        options: [
          { id: 'opt-a', text: 'Elliptic Curve Diffie-Hellman (ECDHE)' },
          { id: 'opt-b', text: 'MD5 Hashing' },
          { id: 'opt-c', text: 'Static DES' },
          { id: 'opt-d', text: 'Base64 Encoding' },
        ],
        correctOptionId: 'opt-a',
        explanation: 'ECDHE ephemeral key exchange generates forward-secret symmetric keys so past sessions cannot be decrypted if the server private key is compromised.',
      },
    ],
  },
];

// Clean Student Profile (Zero Initial State)
export const STUDENT_PROFILE: StudentProfile = {
  name: 'Student',
  email: '',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  major: 'Computer Science & Engineering',
  university: 'KLU',
  enrolledCourse: 'Computer Networks (CS-4200)',
  level: 1,
  xp: 0,
  courseProgressPercent: 0,
  quizAccuracyPercent: 0,
  lessonsCompletedCount: 0,
  learningStreakDays: 0,
  recentActivity: [],
};

// Clean Class Leaderboard (Driven strictly by real-time Firestore database)
export const LEADERBOARD_STUDENTS: LeaderboardStudent[] = [];


// Teacher Dashboard Metrics (Computed dynamically from real Firestore students collection)
export const TEACHER_STATS: TeacherMetric = {
  totalStudents: 0,
  activeStudents: 0,
  avgProgressPercent: 0,
  avgQuizScorePercent: 0,
  currentlyLearning: 0,
  takingQuiz: 0,
  idle: 0,
};

// Initial Live Classroom State (Zero baseline, updated live from Firestore live_classroom)
export const INITIAL_LIVE_CLASSROOM: LiveClassroomState = {
  isActive: true,
  connectedCount: 0,
  totalEnrolled: 0,
  currentQuestion: 'Which layer of the OSI model is responsible for routing?',
  isAnswerRevealed: false,
  options: [
    { id: 'opt-a', label: 'A', text: 'Data Link Layer', votes: 0, percentage: 0, isCorrect: false },
    { id: 'opt-b', label: 'B', text: 'Transport Layer', votes: 0, percentage: 0, isCorrect: false },
    { id: 'opt-c', label: 'C', text: 'Network Layer', votes: 0, percentage: 0, isCorrect: true },
    { id: 'opt-d', label: 'D', text: 'Session Layer', votes: 0, percentage: 0, isCorrect: false },
  ],
};

// Global Search Index
export const SEARCH_INDEX: SearchResultItem[] = [
  { id: 's-course-1', title: 'Computer Networks', subtitle: 'Primary course (42% completed, 28 lessons)', category: 'Course', targetTab: 'courses' },
  { id: 's-course-2', title: 'Network Security & Cryptography', subtitle: 'Elective course (18% completed)', category: 'Course', targetTab: 'courses' },
  { id: 's-les-tcp', title: 'TCP 3-Way Handshake', subtitle: 'Lesson 17 // SYN, SYN-ACK, ACK interactive animation', category: 'Lesson', targetTab: 'lesson-player', lessonId: 'sec-17-les-1', sectionId: 17 },
  { id: 's-les-osi', title: 'Understanding the OSI Model', subtitle: 'Lesson 3 // 7-Layer Architecture and PDU hierarchy', category: 'Lesson', targetTab: 'lesson-player', lessonId: 'sec-3-les-1', sectionId: 3 },
  { id: 's-les-sub', title: 'CIDR Notation & Subnet Masks', subtitle: 'Lesson 12 // Prefix math and host calculation', category: 'Lesson', targetTab: 'lesson-player', lessonId: 'sec-12-les-1', sectionId: 12 },
  { id: 's-les-ip', title: 'IPv4 Addressing', subtitle: 'Lesson 10 // 32-bit dotted decimal and private address spaces', category: 'Lesson', targetTab: 'lesson-player', lessonId: 'sec-10-les-1', sectionId: 10 },
  { id: 's-les-dns', title: 'DNS (Domain Name System)', subtitle: 'Lesson 19 // Name resolution and record types', category: 'Lesson', targetTab: 'lesson-player', lessonId: 'sec-19-les-1', sectionId: 19 },
  { id: 's-prac-sub', title: 'Subnetting Practice Drills', subtitle: '25 questions, Accuracy: 68%', category: 'Practice', targetTab: 'practice' },
  { id: 's-prac-tcp', title: 'TCP & UDP Practice Drills', subtitle: '28 questions, Accuracy: 86%', category: 'Practice', targetTab: 'practice' },
  { id: 's-top-cidr', title: 'CIDR Notation & VLSM', subtitle: 'Topic in Section 12', category: 'Topic', targetTab: 'courses' },
  { id: 's-top-arp', title: 'Address Resolution Protocol (ARP)', subtitle: 'Topic in Section 8', category: 'Topic', targetTab: 'courses' },
  { id: 's-top-bgp', title: 'Border Gateway Protocol (BGP)', subtitle: 'Topic in Section 13 Routing', category: 'Topic', targetTab: 'courses' },
];
