export interface PracticeTopicItem {
  id: string;
  unit: 3 | 4 | 5;
  unitTitle: string;
  title: string;
  iconName: string;
  masteryPercentage: number; // 0 to 100
  questionsCount: number;
  totalQuestions: number;
  lastPracticed: string;
  isWeak?: boolean;
  statusText?: 'Needs Practice' | 'Improving' | 'Mastered' | 'Starting';
}

export interface PracticeQuestion {
  id: string;
  topicId: string;
  topicName: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface PracticeMode {
  id: 'quick' | 'topic' | 'weak' | 'mixed';
  title: string;
  subtitle: string;
  questionCount: number;
  estimatedTime: string;
  xpReward: number;
  badge: string;
}

export const PRACTICE_MODES: PracticeMode[] = [
  {
    id: 'quick',
    title: 'QUICK PRACTICE',
    subtitle: 'Warm up your network with 5 high-yield questions.',
    questionCount: 5,
    estimatedTime: '~2 min',
    xpReward: 10,
    badge: '⚡ Sprint'
  },
  {
    id: 'topic',
    title: 'TOPIC PRACTICE',
    subtitle: 'Deep-dive into a single protocol or architectural domain.',
    questionCount: 10,
    estimatedTime: '~5 min',
    xpReward: 20,
    badge: '🎯 Focused'
  },
  {
    id: 'weak',
    title: 'WEAK TOPICS',
    subtitle: 'Automatically target the concepts where you missed questions.',
    questionCount: 10,
    estimatedTime: '~5 min',
    xpReward: 25,
    badge: '🛡 Recovery'
  },
  {
    id: 'mixed',
    title: 'MIXED PRACTICE',
    subtitle: 'Comprehensive review pulling from all completed units.',
    questionCount: 15,
    estimatedTime: '~8 min',
    xpReward: 30,
    badge: '🌐 Full Stack'
  }
];

export const getMasteryLevel = (percentage: number): {
  level: 'STARTING' | 'LEARNING' | 'STRONG' | 'MASTERED';
  color: string;
  bgLight: string;
  bgDark: string;
} => {
  if (percentage >= 86) {
    return { level: 'MASTERED', color: '#35A86B', bgLight: '#ECFDF5', bgDark: '#064E3B/40' };
  }
  if (percentage >= 61) {
    return { level: 'STRONG', color: '#3157D5', bgLight: '#EFF6FF', bgDark: '#1E3A8A/40' };
  }
  if (percentage >= 31) {
    return { level: 'LEARNING', color: '#F0A63A', bgLight: '#FFFBEB', bgDark: '#78350F/40' };
  }
  return { level: 'STARTING', color: '#64748B', bgLight: '#F1F5F9', bgDark: '#334155/40' };
};

// 30 Handcrafted Topics across Units III, IV, and V as specified
export const CURRICULUM_PRACTICE_TOPICS: PracticeTopicItem[] = [
  // UNIT III — NETWORK LAYER (10 Topics)
  {
    id: 'u3-basics',
    unit: 3,
    unitTitle: 'UNIT III — NETWORK LAYER',
    title: 'Network Layer Basics',
    iconName: 'Network',
    masteryPercentage: 78,
    questionsCount: 22,
    totalQuestions: 25,
    lastPracticed: 'Yesterday',
    statusText: 'Improving'
  },
  {
    id: 'u3-routing',
    unit: 3,
    unitTitle: 'UNIT III — NETWORK LAYER',
    title: 'Routing Algorithms',
    iconName: 'GitBranch',
    masteryPercentage: 68,
    questionsCount: 18,
    totalQuestions: 25,
    lastPracticed: '2 days ago',
    isWeak: true,
    statusText: 'Needs Practice'
  },
  {
    id: 'u3-congestion',
    unit: 3,
    unitTitle: 'UNIT III — NETWORK LAYER',
    title: 'Congestion Control',
    iconName: 'Activity',
    masteryPercentage: 82,
    questionsCount: 24,
    totalQuestions: 30,
    lastPracticed: '3 days ago',
    statusText: 'Improving'
  },
  {
    id: 'u3-qos',
    unit: 3,
    unitTitle: 'UNIT III — NETWORK LAYER',
    title: 'Quality of Service (QoS)',
    iconName: 'Sliders',
    masteryPercentage: 55,
    questionsCount: 11,
    totalQuestions: 20,
    lastPracticed: '4 days ago',
    statusText: 'Improving'
  },
  {
    id: 'u3-addressing',
    unit: 3,
    unitTitle: 'UNIT III — NETWORK LAYER',
    title: 'Network Addressing & Subnetting',
    iconName: 'Hash',
    masteryPercentage: 42,
    questionsCount: 12,
    totalQuestions: 30,
    lastPracticed: 'Today',
    isWeak: true,
    statusText: 'Needs Practice'
  },
  {
    id: 'u3-router-cfg',
    unit: 3,
    unitTitle: 'UNIT III — NETWORK LAYER',
    title: 'Router Configuration',
    iconName: 'Router',
    masteryPercentage: 64,
    questionsCount: 16,
    totalQuestions: 25,
    lastPracticed: '5 days ago',
    statusText: 'Improving'
  },
  {
    id: 'u3-arp',
    unit: 3,
    unitTitle: 'UNIT III — NETWORK LAYER',
    title: 'ARP & RARP',
    iconName: 'Cpu',
    masteryPercentage: 88,
    questionsCount: 22,
    totalQuestions: 25,
    lastPracticed: 'Yesterday',
    statusText: 'Mastered'
  },
  {
    id: 'u3-nac',
    unit: 3,
    unitTitle: 'UNIT III — NETWORK LAYER',
    title: 'Network Access Control',
    iconName: 'ShieldAlert',
    masteryPercentage: 58,
    questionsCount: 14,
    totalQuestions: 24,
    lastPracticed: '3 days ago',
    statusText: 'Improving'
  },
  {
    id: 'u3-eap',
    unit: 3,
    unitTitle: 'UNIT III — NETWORK LAYER',
    title: 'Extensible Authentication Protocol (EAP)',
    iconName: 'KeyRound',
    masteryPercentage: 51,
    questionsCount: 10,
    totalQuestions: 20,
    lastPracticed: 'Yesterday',
    isWeak: true,
    statusText: 'Needs Practice'
  },
  {
    id: 'u3-8021x',
    unit: 3,
    unitTitle: 'UNIT III — NETWORK LAYER',
    title: 'IEEE 802.1X Port Security',
    iconName: 'Lock',
    masteryPercentage: 62,
    questionsCount: 15,
    totalQuestions: 25,
    lastPracticed: '4 days ago',
    statusText: 'Improving'
  },

  // UNIT IV — TRANSPORT LAYER (10 Topics)
  {
    id: 'u4-basics',
    unit: 4,
    unitTitle: 'UNIT IV — TRANSPORT LAYER',
    title: 'Transport Layer Basics',
    iconName: 'Layers',
    masteryPercentage: 90,
    questionsCount: 27,
    totalQuestions: 30,
    lastPracticed: 'Today',
    statusText: 'Mastered'
  },
  {
    id: 'u4-services',
    unit: 4,
    unitTitle: 'UNIT IV — TRANSPORT LAYER',
    title: 'Transport Services & Sockets',
    iconName: 'Share2',
    masteryPercentage: 74,
    questionsCount: 18,
    totalQuestions: 25,
    lastPracticed: '2 days ago',
    statusText: 'Improving'
  },
  {
    id: 'u4-elements',
    unit: 4,
    unitTitle: 'UNIT IV — TRANSPORT LAYER',
    title: 'Transport Protocol Elements',
    iconName: 'FileCode2',
    masteryPercentage: 70,
    questionsCount: 14,
    totalQuestions: 20,
    lastPracticed: '3 days ago',
    statusText: 'Improving'
  },
  {
    id: 'u4-simple-proto',
    unit: 4,
    unitTitle: 'UNIT IV — TRANSPORT LAYER',
    title: 'Simple Transport Protocol',
    iconName: 'PackageCheck',
    masteryPercentage: 80,
    questionsCount: 16,
    totalQuestions: 20,
    lastPracticed: '4 days ago',
    statusText: 'Improving'
  },
  {
    id: 'u4-tcp',
    unit: 4,
    unitTitle: 'UNIT IV — TRANSPORT LAYER',
    title: 'TCP Handshake & Reliability',
    iconName: 'Repeat',
    masteryPercentage: 91,
    questionsCount: 28,
    totalQuestions: 30,
    lastPracticed: 'Today',
    statusText: 'Mastered'
  },
  {
    id: 'u4-udp',
    unit: 4,
    unitTitle: 'UNIT IV — TRANSPORT LAYER',
    title: 'UDP Datagrams & Streaming',
    iconName: 'Zap',
    masteryPercentage: 60,
    questionsCount: 15,
    totalQuestions: 25,
    lastPracticed: 'Today',
    isWeak: true,
    statusText: 'Needs Practice'
  },
  {
    id: 'u4-security',
    unit: 4,
    unitTitle: 'UNIT IV — TRANSPORT LAYER',
    title: 'Transport-Level Security',
    iconName: 'ShieldCheck',
    masteryPercentage: 75,
    questionsCount: 18,
    totalQuestions: 24,
    lastPracticed: 'Yesterday',
    statusText: 'Improving'
  },
  {
    id: 'u4-ssl',
    unit: 4,
    unitTitle: 'UNIT IV — TRANSPORT LAYER',
    title: 'SSL Cryptographic Framework',
    iconName: 'FileCheck',
    masteryPercentage: 65,
    questionsCount: 13,
    totalQuestions: 20,
    lastPracticed: '3 days ago',
    statusText: 'Improving'
  },
  {
    id: 'u4-tls',
    unit: 4,
    unitTitle: 'UNIT IV — TRANSPORT LAYER',
    title: 'TLS 1.3 Tunnel & Handshake',
    iconName: 'Fingerprint',
    masteryPercentage: 84,
    questionsCount: 21,
    totalQuestions: 25,
    lastPracticed: '2 days ago',
    statusText: 'Improving'
  },
  {
    id: 'u4-ssh',
    unit: 4,
    unitTitle: 'UNIT IV — TRANSPORT LAYER',
    title: 'SSH Secure Shell Terminal',
    iconName: 'Terminal',
    masteryPercentage: 86,
    questionsCount: 19,
    totalQuestions: 22,
    lastPracticed: 'Yesterday',
    statusText: 'Mastered'
  },

  // UNIT V — APPLICATION LAYER (10 Topics)
  {
    id: 'u5-basics',
    unit: 5,
    unitTitle: 'UNIT V — APPLICATION LAYER',
    title: 'Application Layer Basics',
    iconName: 'Laptop',
    masteryPercentage: 85,
    questionsCount: 23,
    totalQuestions: 27,
    lastPracticed: 'Yesterday',
    statusText: 'Improving'
  },
  {
    id: 'u5-dns',
    unit: 5,
    unitTitle: 'UNIT V — APPLICATION LAYER',
    title: 'DNS Domain Name System',
    iconName: 'Globe',
    masteryPercentage: 96,
    questionsCount: 29,
    totalQuestions: 30,
    lastPracticed: 'Today',
    statusText: 'Mastered'
  },
  {
    id: 'u5-email',
    unit: 5,
    unitTitle: 'UNIT V — APPLICATION LAYER',
    title: 'Electronic Mail (SMTP/IMAP)',
    iconName: 'Mail',
    masteryPercentage: 72,
    questionsCount: 18,
    totalQuestions: 25,
    lastPracticed: '3 days ago',
    statusText: 'Improving'
  },
  {
    id: 'u5-ftp',
    unit: 5,
    unitTitle: 'UNIT V — APPLICATION LAYER',
    title: 'FTP File Transfer Protocol',
    iconName: 'FolderSync',
    masteryPercentage: 78,
    questionsCount: 15,
    totalQuestions: 20,
    lastPracticed: '4 days ago',
    statusText: 'Improving'
  },
  {
    id: 'u5-http',
    unit: 5,
    unitTitle: 'UNIT V — APPLICATION LAYER',
    title: 'HTTP Request & Response Cycle',
    iconName: 'FileText',
    masteryPercentage: 88,
    questionsCount: 26,
    totalQuestions: 30,
    lastPracticed: 'Yesterday',
    statusText: 'Mastered'
  },
  {
    id: 'u5-www',
    unit: 5,
    unitTitle: 'UNIT V — APPLICATION LAYER',
    title: 'World Wide Web Architecture',
    iconName: 'Compass',
    masteryPercentage: 81,
    questionsCount: 16,
    totalQuestions: 20,
    lastPracticed: '5 days ago',
    statusText: 'Improving'
  },
  {
    id: 'u5-https',
    unit: 5,
    unitTitle: 'UNIT V — APPLICATION LAYER',
    title: 'HTTPS Secure Web Encapsulation',
    iconName: 'Shield',
    masteryPercentage: 89,
    questionsCount: 25,
    totalQuestions: 28,
    lastPracticed: 'Today',
    statusText: 'Mastered'
  },
  {
    id: 'u5-dhcp',
    unit: 5,
    unitTitle: 'UNIT V — APPLICATION LAYER',
    title: 'DHCP Dynamic Host Configuration',
    iconName: 'Server',
    masteryPercentage: 76,
    questionsCount: 19,
    totalQuestions: 25,
    lastPracticed: '2 days ago',
    statusText: 'Improving'
  },
  {
    id: 'u5-security',
    unit: 5,
    unitTitle: 'UNIT V — APPLICATION LAYER',
    title: 'Application Layer Security',
    iconName: 'Key',
    masteryPercentage: 65,
    questionsCount: 13,
    totalQuestions: 20,
    lastPracticed: '3 days ago',
    statusText: 'Improving'
  },
  {
    id: 'u5-web-security',
    unit: 5,
    unitTitle: 'UNIT V — APPLICATION LAYER',
    title: 'Web Security & Phishing Defense',
    iconName: 'AlertOctagon',
    masteryPercentage: 63,
    questionsCount: 15,
    totalQuestions: 25,
    lastPracticed: 'Yesterday',
    isWeak: true,
    statusText: 'Needs Practice'
  }
];

// Rich Practice Question Bank for the interactive runner
export const PRACTICE_QUESTIONS_POOL: PracticeQuestion[] = [
  {
    id: 'pq-1',
    topicId: 'u4-udp',
    topicName: 'TCP vs UDP',
    question: 'Why does live video conferencing choose UDP over TCP despite potential packet loss?',
    options: [
      'UDP encrypts video streams automatically at the kernel level',
      'UDP avoids head-of-line blocking and retransmission delays, ensuring minimal latency',
      'UDP guarantees 100% packet arrival with hardware checksums',
      'UDP negotiates sequence numbers faster than TCP during handshakes'
    ],
    correctIndex: 1,
    explanation: 'Real-time media values timely delivery over perfect reliability. Late retransmitted video frames are useless to the viewer.'
  },
  {
    id: 'pq-2',
    topicId: 'u5-dns',
    topicName: 'DNS Domain Name System',
    question: 'What protocol translates domain names into IP addresses?',
    options: ['DNS', 'DHCP', 'FTP', 'SSH'],
    correctIndex: 0,
    explanation: 'DNS (Domain Name System) maps human-readable domain names (like example.com) to machine-routable IP addresses on Port 53.'
  },
  {
    id: 'pq-3',
    topicId: 'u3-addressing',
    topicName: 'Network Addressing & Subnetting',
    question: 'Which of the following represents a valid, routable IPv4 host address?',
    options: ['192.168.1.999', '300.168.1.1', '10.0.0.25', '256.0.0.1'],
    correctIndex: 2,
    explanation: 'Each octet in an IPv4 address must be between 0 and 255 (8 bits). 10.0.0.25 is valid; the others have octets exceeding 255.'
  },
  {
    id: 'pq-4',
    topicId: 'u3-arp',
    topicName: 'ARP & RARP',
    question: 'When a host knows a target IP but not its Layer 2 hardware address, what message does it broadcast?',
    options: [
      'ARP Request ("Who has this IP?")',
      'RARP Reply',
      'DNS MX Query',
      'DHCP Discover'
    ],
    correctIndex: 0,
    explanation: 'An ARP Request is broadcast to FF:FF:FF:FF:FF:FF asking the owner of the destination IP to reply with its MAC address.'
  },
  {
    id: 'pq-5',
    topicId: 'u4-tcp',
    topicName: 'TCP Handshake & Reliability',
    question: 'During a TCP 3-way connection handshake, what does the server send back in response to an incoming SYN?',
    options: ['FIN-ACK', 'SYN-ACK', 'RST', 'DATA'],
    correctIndex: 1,
    explanation: 'The server acknowledges the client SYN and simultaneously sends its own SYN in the SYN-ACK segment (Step 2).'
  },
  {
    id: 'pq-6',
    topicId: 'u5-dhcp',
    topicName: 'DHCP Dynamic Host Configuration',
    question: 'What is the correct 4-step message sequence for a client leasing an IP address via DHCP?',
    options: [
      'DISCOVER → OFFER → REQUEST → ACK',
      'REQUEST → OFFER → DISCOVER → ACK',
      'HELLO → SYN → SYN-ACK → ACK',
      'PROBE → ASSIGN → BIND → RENEW'
    ],
    correctIndex: 0,
    explanation: 'The classic DORA sequence is: DHCP Discover, DHCP Offer, DHCP Request, and DHCP Acknowledge.'
  },
  {
    id: 'pq-7',
    topicId: 'u3-eap',
    topicName: 'Extensible Authentication Protocol (EAP)',
    question: 'In an IEEE 802.1X / EAP deployment, what device acts as the "Authenticator"?',
    options: [
      'The client workstation (Supplicant)',
      'The edge switch or wireless access point',
      'The backend RADIUS / TACACS+ server',
      'The DNS authoritative name server'
    ],
    correctIndex: 1,
    explanation: 'The edge switch or AP relays EAPOL packets from the Supplicant to the RADIUS server over RADIUS/EAP.'
  },
  {
    id: 'pq-8',
    topicId: 'u5-web-security',
    topicName: 'Web Security & Phishing Defense',
    question: 'You receive an email claiming your university account is suspended, linking to "login-cresco-portal.xyz". What is this?',
    options: [
      'Legitimate TLS session resumption',
      'Phishing attack attempting credential theft',
      'Standard DHCP lease renewal request',
      'BGP autonomous system hijack'
    ],
    correctIndex: 1,
    explanation: 'Phishing mimics genuine institutions using look-alike domain names to harvest credentials. Always inspect the domain.'
  },
  {
    id: 'pq-9',
    topicId: 'u3-routing',
    topicName: 'Routing Algorithms',
    question: 'Which routing protocol algorithm operates by having every router broadcast its link states to all nodes in the area?',
    options: [
      'Link-State (e.g., OSPF / Dijkstra)',
      'Distance-Vector (e.g., RIP / Bellman-Ford)',
      'Path-Vector (e.g., BGP)',
      'Flooding without TTL'
    ],
    correctIndex: 0,
    explanation: 'Link-State protocols like OSPF flood Link-State Advertisements (LSAs), allowing each router to build the complete topology map.'
  },
  {
    id: 'pq-10',
    topicId: 'u4-security',
    topicName: 'Transport-Level Security',
    question: 'What crucial operation is performed during the TLS handshake before symmetric data encryption begins?',
    options: [
      'Digital certificate validation and asymmetric key exchange',
      'Subnet mask recalculation',
      'ARP table cache purging',
      'Port 80 HTTP fallback'
    ],
    correctIndex: 0,
    explanation: 'TLS uses the server certificate to authenticate its identity and executes asymmetric key exchange (ECDHE) to generate symmetric session keys.'
  }
];

export const WEAK_TOPICS_RECOMMENDATION = {
  primaryCard: {
    topicId: 'u4-udp',
    topicName: 'TCP vs UDP',
    unitName: 'UNIT IV · TRANSPORT LAYER',
    reason: 'You missed 3 questions about transport protocol reliability & streaming.',
    progressCurrent: 6,
    progressTotal: 10,
    estimatedTime: '3 min',
    xpReward: 20,
    badge: 'High Yield'
  },
  attentionList: [
    { name: 'Subnetting & CIDR', score: 42, status: 'Needs Practice', icon: 'Hash', color: '#D95C5C' },
    { name: 'EAP / 802.1X Roles', score: 51, status: 'Needs Practice', icon: 'KeyRound', color: '#D95C5C' },
    { name: 'Web Security & Phishing', score: 63, status: 'Improving', icon: 'AlertOctagon', color: '#F0A63A' },
    { name: 'TCP Handshake & Flags', score: 91, status: 'Mastered', icon: 'Repeat', color: '#35A86B' }
  ]
};

export const RECENT_PRACTICE_HISTORY = [
  { id: 'h1', topicName: 'TCP vs UDP', score: 92, date: 'Today', questions: 10, time: '2m 14s' },
  { id: 'h2', topicName: 'DNS Resolution', score: 100, date: 'Yesterday', questions: 5, time: '1m 05s' },
  { id: 'h3', topicName: 'Routing Algorithms', score: 78, date: '2 days ago', questions: 10, time: '3m 42s' },
  { id: 'h4', topicName: 'DHCP DORA Sequence', score: 85, date: '3 days ago', questions: 8, time: '2m 30s' }
];

export const PERFORMANCE_INSIGHTS = [
  { text: "You're strongest in Transport Layer (91% overall accuracy).", type: 'positive' },
  { text: "Routing algorithms and CIDR notation need more practice.", type: 'warning' },
  { text: "Your TCP accuracy improved by +12% this week!", type: 'growth' }
];
