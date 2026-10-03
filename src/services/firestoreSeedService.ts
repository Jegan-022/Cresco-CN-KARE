import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  ALL_MODULES, 
  QUICK_REFERENCE_FLASHCARDS, 
  ALL_MODULE_QUIZ_QUESTIONS 
} from '../data/courseContent';
import { UNIT_CHALLENGES } from '../data/unitQuizzes';
import { 
  CourseDocument, 
  UnitDocument, 
  LevelDocument, 
  LessonDocument, 
  ConceptDocument, 
  QuestionDocument, 
  FlashcardDocument, 
  ActivityDocument, 
  MissionDocument, 
  BossDocument, 
  UserDocument, 
  UserProgressDocument, 
  UserMasteryDocument, 
  QuizAttemptDocument, 
  AchievementDocument 
} from '../types/firestoreSchema';

export interface SeedProgressCallback {
  (collection: string, current: number, total: number, status: 'seeding' | 'done' | 'skipped' | 'error', error?: string): void;
}

/**
 * 1. COURSES COLLECTION SEED
 */
export const SEED_COURSES: CourseDocument[] = [
  {
    id: 'cs-comp-networks',
    code: 'CS-3101 / CS455',
    title: 'Computer Networks (Cresco CN)',
    description: 'Comprehensive, interactive, gamified Computer Networks curriculum tailored for KL University students covering Network Layer, Transport Layer, Application Layer and Network Security.',
    department: 'Computer Science & Engineering',
    semester: 'Academic Year 2024-2025',
    totalUnits: 3,
    totalModules: 30,
    totalXP: 2400,
    units: ['unit-3', 'unit-4', 'unit-5'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
    syllabusUrl: 'documents/syllabus/KLU_CN_Syllabus_2025.pdf',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

/**
 * 2. UNITS COLLECTION SEED
 */
export const SEED_UNITS: UnitDocument[] = [
  {
    id: 'unit-3',
    courseId: 'cs-comp-networks',
    unitNumber: 3,
    title: 'Network Layer & Routing Protocols',
    description: 'IP Addressing, Subnetting, CIDR, NAT, Routing Algorithms (Distance Vector, Link State), OSPF, and BGP.',
    totalModules: 12,
    totalXP: 960,
    icon: 'Network',
    color: '#06b6d4',
    order: 1,
    prerequisites: [],
    bossId: 'boss_unit_3',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'unit-4',
    courseId: 'cs-comp-networks',
    unitNumber: 4,
    title: 'Transport Layer & End-to-End Reliability',
    description: 'TCP vs UDP, 3-Way Handshake, Flow Control (Sliding Window), Congestion Control, and Error Recovery.',
    totalModules: 9,
    totalXP: 720,
    icon: 'Cpu',
    color: '#8b5cf6',
    order: 2,
    prerequisites: ['unit-3'],
    bossId: 'boss_unit_4',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'unit-5',
    courseId: 'cs-comp-networks',
    unitNumber: 5,
    title: 'Application Layer, Network Management & Security',
    description: 'DNS, HTTP/1.1, HTTP/2, HTTP/3, SMTP, FTP, TLS/SSL, Firewalls, Cryptography, and Network Defense.',
    totalModules: 9,
    totalXP: 720,
    icon: 'ShieldCheck',
    color: '#10b981',
    order: 3,
    prerequisites: ['unit-4'],
    bossId: 'boss_unit_5',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

/**
 * 3. LEVELS COLLECTION SEED (10 Level Tier Progression)
 */
export const SEED_LEVELS: LevelDocument[] = [
  { id: 'level-1', levelNumber: 1, title: 'Byte Scout', minXP: 0, maxXP: 200, iconName: 'Compass', colorHex: '#94a3b8', rewards: { title: 'Network Trainee', perk: 'Unlocked Unit 3 Fundamentals' } },
  { id: 'level-2', levelNumber: 2, title: 'Packet Pioneer', minXP: 201, maxXP: 500, iconName: 'Radio', colorHex: '#38bdf8', rewards: { title: 'Packet Tracer Access', perk: 'Interactive Lab Simulator Tier 1' } },
  { id: 'level-3', levelNumber: 3, title: 'Frame Weaver', minXP: 501, maxXP: 900, iconName: 'Layers', colorHex: '#06b6d4', rewards: { title: 'Subnet Apprentice', perk: 'Subnet Calculator Drill Unlocked' } },
  { id: 'level-4', levelNumber: 4, title: 'Segment Sorter', minXP: 901, maxXP: 1400, iconName: 'Split', colorHex: '#6366f1', rewards: { title: 'Protocol Explorer', perk: 'Unlocked Practice Quizzes' } },
  { id: 'level-5', levelNumber: 5, title: 'Router Knight', minXP: 1401, maxXP: 2000, iconName: 'Shield', colorHex: '#8b5cf6', rewards: { title: 'Unit 4 Boss Challenger', perk: 'Can challenge The Segment Slayer' } },
  { id: 'level-6', levelNumber: 6, title: 'Subnet Samurai', minXP: 2001, maxXP: 2700, iconName: 'Sword', colorHex: '#ec4899', rewards: { title: 'Network Craftsman', perk: 'Special Profile Banner Unlocked' } },
  { id: 'level-7', levelNumber: 7, title: 'Protocol Paladin', minXP: 2701, maxXP: 3500, iconName: 'Crown', colorHex: '#f59e0b', rewards: { title: 'Transport Layer Master', perk: 'Full Access to Unit 5 Labs' } },
  { id: 'level-8', levelNumber: 8, title: 'Firewall Fortress', minXP: 3501, maxXP: 4400, iconName: 'Lock', colorHex: '#ef4444', rewards: { title: 'Cyber Defender', perk: 'Unlocked Cryptographic Labs' } },
  { id: 'level-9', levelNumber: 9, title: 'Cyber Architect', minXP: 4401, maxXP: 5400, iconName: 'Sparkles', colorHex: '#10b981', rewards: { title: 'Grand Engineer', perk: 'Custom Badge on Leaderboard' } },
  { id: 'level-10', levelNumber: 10, title: 'NetQuest Grandmaster', minXP: 5401, maxXP: 99999, iconName: 'Trophy', colorHex: '#eab308', rewards: { title: 'Immortal Networker', perk: 'Cresco Hall of Fame Inductee' } }
];

/**
 * 4. LESSONS COLLECTION SEED (From 30 syllabus modules)
 */
export const SEED_LESSONS: LessonDocument[] = ALL_MODULES.map((m, index) => ({
  id: m.id,
  unitId: m.unitId.replace('_', '-'),
  courseId: 'cs-comp-networks',
  title: m.title,
  order: index + 1,
  durationMinutes: m.readTimeMinutes || 15,
  xpReward: m.xp || 80,
  simulatorType: m.simulatorType || 'packet_tracer',
  pedagogy: {
    hook: m.pedagogy?.hook || 'Imagine packets travelling through an interconnected superhighway...',
    analogy: m.pedagogy?.analogy || 'Like postal letters forwarded across distribution centers...',
    concept: m.pedagogy?.concept || 'Network layer forwarding and routing mechanics...',
    visualNotes: 'Packet header breakdown and data flow diagram.'
  },
  keyTakeaways: m.keyTakeaways || ['Core protocol principles', 'Header structures', 'Packet flow stages'],
  mediaAssets: {
    diagramUrl: `images/diagrams/${m.id}_diagram.png`,
    pdfSlidesUrl: `documents/pdfs/${m.id}_lecture_notes.pdf`,
    animationUrl: `animations/packet-flows/${m.id}_flow.json`
  },
  quizCount: m.quiz?.length || 3,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}));

/**
 * 5. CONCEPTS COLLECTION SEED
 */
export const SEED_CONCEPTS: ConceptDocument[] = [
  {
    id: 'concept_ipv4_addressing',
    unitId: 'unit-3',
    lessonId: 'u3_m2',
    term: 'IPv4 Addressing & CIDR',
    definition: '32-bit logical address divided into network and host portions denoted in dotted-decimal format with a prefix length (e.g., 192.168.1.0/24).',
    analogy: 'Like postal street addresses where the network prefix is the street and the host bits specify the house number.',
    keyPoints: [
      '32-bit binary number split into 4 octets',
      'CIDR replaces legacy Class A/B/C addressing with flexible subnet masks',
      'Host range is calculated via bitwise AND with the subnet mask'
    ],
    difficulty: 'beginner',
    diagramUrl: 'images/diagrams/ipv4_cidr_concept.png',
    tags: ['Network Layer', 'Addressing', 'Subnetting', 'IPv4'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'concept_tcp_handshake',
    unitId: 'unit-4',
    lessonId: 'u4_m2',
    term: 'TCP 3-Way Handshake',
    definition: 'Connection establishment protocol ensuring both host and server synchronize initial sequence numbers (ISN) and allocate buffers before transmitting data.',
    analogy: 'A formal phone greeting: Caller says "Can you hear me?" (SYN), receiver replies "Yes, I hear you, can you hear me?" (SYN-ACK), caller confirms "Yes, I hear you!" (ACK).',
    keyPoints: [
      'Step 1: Client sends SYN with random ISN_c',
      'Step 2: Server responds with SYN-ACK, acknowledging ISN_c+1 and sending ISN_s',
      'Step 3: Client sends ACK acknowledging ISN_s+1; connection is ESTABLISHED'
    ],
    difficulty: 'intermediate',
    diagramUrl: 'images/diagrams/tcp_handshake_flow.png',
    tags: ['Transport Layer', 'TCP', 'Reliability', 'Handshake'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'concept_tcp_congestion_control',
    unitId: 'unit-4',
    lessonId: 'u4_m5',
    term: 'TCP Congestion Control',
    definition: 'End-to-end mechanism to prevent sender from overwhelming intermediate network routers, utilizing Congestion Window (cwnd), Slow Start, and AIMD.',
    analogy: 'Driving a car into fog: accelerate cautiously until you sense traffic congestion, then brake immediately by half, then creep forward incrementally.',
    keyPoints: [
      'Slow Start: cwnd doubles every RTT until ssthresh is reached',
      'Congestion Avoidance: cwnd increases linearly by 1 MSS per RTT (AIMD)',
      'Fast Retransmit & Fast Recovery triggered by 3 duplicate ACKs'
    ],
    difficulty: 'advanced',
    diagramUrl: 'images/diagrams/tcp_congestion_graph.png',
    tags: ['Transport Layer', 'Congestion', 'AIMD', 'Flow Control'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'concept_dns_resolution',
    unitId: 'unit-5',
    lessonId: 'u5_m2',
    term: 'Hierarchical DNS Resolution',
    definition: 'Distributed database mapping human-readable domain names (e.g., klu.ac.in) to IP addresses via Root, TLD (.in, .edu), and Authoritative Name Servers.',
    analogy: 'A global phone directory with specialized departments: the receptionist directs you to the regional branch, which directs you to the exact desk.',
    keyPoints: [
      'Operates primarily over UDP port 53 for speed',
      'Recursive resolvers query Root servers (.), TLD servers (.in), then Authoritative servers',
      'Local caching (TTL) dramatically speeds up repeated lookups'
    ],
    difficulty: 'beginner',
    diagramUrl: 'images/diagrams/dns_hierarchy.png',
    tags: ['Application Layer', 'DNS', 'UDP', 'Resolution'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'concept_tls_handshake',
    unitId: 'unit-5',
    lessonId: 'u5_m7',
    term: 'TLS 1.3 Cryptographic Handshake',
    definition: 'Security protocol providing encryption, authentication, and integrity over TCP, achieving 1-RTT handshake and forward secrecy.',
    analogy: 'Passing secret messages inside a tamper-evident locked box using asymmetric keys to exchange a shared symmetric lock.',
    keyPoints: [
      'ClientHello initiates supported ciphers and Diffie-Hellman key share',
      'Server verifies identity with X.509 Certificate and completes shared secret calculation',
      'Symmetric encryption (AES-GCM or ChaCha20-Poly1305) protects all subsequent data'
    ],
    difficulty: 'advanced',
    diagramUrl: 'images/diagrams/tls_13_handshake.png',
    tags: ['Security', 'Application Layer', 'TLS', 'Cryptography'],
    createdAt: new Date().toISOString()
  }
];

/**
 * 6. QUESTIONS COLLECTION SEED
 */
export const SEED_QUESTIONS: QuestionDocument[] = ALL_MODULE_QUIZ_QUESTIONS.slice(0, 15).map((q, idx) => ({
  id: `q_${q.moduleId || 'm'}_${idx + 1}`,
  unitId: q.moduleId?.startsWith('u3') ? 'unit-3' : q.moduleId?.startsWith('u4') ? 'unit-4' : 'unit-5',
  lessonId: q.moduleId,
  quizType: 'module_quiz',
  question: q.question,
  options: q.options,
  correctIndex: q.correctIndex,
  explanation: q.explanation || 'Verified correct standard response based on RFC specifications.',
  difficulty: idx % 3 === 0 ? 'hard' : idx % 2 === 0 ? 'medium' : 'easy',
  xpReward: 25,
  tags: ['Curriculum Quiz', q.moduleId || 'general']
}));

/**
 * 7. FLASHCARDS COLLECTION SEED
 */
export const SEED_FLASHCARDS: FlashcardDocument[] = QUICK_REFERENCE_FLASHCARDS.map((fc, idx) => ({
  id: `flashcard_${idx + 1}`,
  unitId: 'unit-3',
  front: fc.front,
  back: fc.back,
  tag: fc.tag || 'Networking',
  difficulty: 'medium'
}));

/**
 * 8. ACTIVITIES COLLECTION SEED
 */
export const SEED_ACTIVITIES: ActivityDocument[] = [
  {
    id: 'act_subnet_calc_drill',
    unitId: 'unit-3',
    lessonId: 'u3_m2',
    type: 'subnet_calculator',
    title: 'IPv4 CIDR Subnet Calculator Drill',
    instructions: 'Given the IP 172.16.45.100/22, determine the Network Address, Broadcast Address, and Valid Host Range.',
    initialConfig: { ip: '172.16.45.100', cidr: 22 },
    solutionCriteria: { network: '172.16.44.0', broadcast: '172.16.47.255', usableHosts: 1022 },
    xpReward: 50,
    estimatedMinutes: 10
  },
  {
    id: 'act_tcp_handshake_builder',
    unitId: 'unit-4',
    lessonId: 'u4_m2',
    type: 'protocol_analyzer',
    title: 'TCP 3-Way Handshake Packet Sequencer',
    instructions: 'Order the packet segments correctly to establish a stateful connection between client socket 10.0.0.1:49152 and web server 198.51.100.1:443.',
    initialConfig: { steps: ['SYN', 'SYN-ACK', 'ACK'] },
    xpReward: 60,
    estimatedMinutes: 8
  },
  {
    id: 'act_dijkstra_routing_lab',
    unitId: 'unit-3',
    lessonId: 'u3_m7',
    type: 'drag_drop_topology',
    title: 'Link-State OSPF Dijkstra Shortest Path Finder',
    instructions: 'Calculate the least-cost path from Router A to Router F across a 6-node weighted graph.',
    initialConfig: { source: 'A', destination: 'F' },
    xpReward: 75,
    estimatedMinutes: 15
  },
  {
    id: 'act_firewall_rule_builder',
    unitId: 'unit-5',
    lessonId: 'u5_m8',
    type: 'router_cli',
    title: 'Stateful Firewall ACL Rule Configurator',
    instructions: 'Configure iptables/ACL rules to allow inbound HTTPS (port 443) and SSH (port 22) only from trusted subnet 10.50.0.0/16, dropping all other packets.',
    initialConfig: { defaultPolicy: 'DROP' },
    xpReward: 80,
    estimatedMinutes: 12
  }
];

/**
 * 9. MISSIONS COLLECTION SEED
 */
export const SEED_MISSIONS: MissionDocument[] = [
  {
    id: 'mission_daily_packet_scout',
    title: 'Daily Packet Scout',
    description: 'Complete at least 2 networking lessons today to maintain momentum.',
    category: 'daily',
    targetCount: 2,
    metric: 'lessons_completed',
    xpReward: 50,
    isDaily: true,
    active: true
  },
  {
    id: 'mission_daily_perfect_quiz',
    title: 'Zero Packet Loss',
    description: 'Score 100% on any module quiz on your very first try.',
    category: 'daily',
    targetCount: 1,
    metric: 'quizzes_perfect',
    xpReward: 75,
    badgeReward: 'Bullseye Badge',
    isDaily: true,
    active: true
  },
  {
    id: 'mission_weekly_streak_hero',
    title: 'Consistency Champion',
    description: 'Log in and study for 5 consecutive days this week.',
    category: 'weekly',
    targetCount: 5,
    metric: 'streak_days',
    xpReward: 150,
    badgeReward: 'Streak Hero Badge',
    isDaily: false,
    active: true
  },
  {
    id: 'mission_milestone_xp_thousand',
    title: 'KiloByte Scholar',
    description: 'Earn a total of 1,000 XP across all units and interactive labs.',
    category: 'milestone',
    targetCount: 1000,
    metric: 'xp_earned',
    xpReward: 200,
    badgeReward: '1K XP Crest',
    isDaily: false,
    active: true
  }
];

/**
 * 10. BOSSES COLLECTION SEED
 */
export const SEED_BOSSES: BossDocument[] = [
  {
    id: 'boss_unit_3',
    unitId: 'unit-3',
    bossName: 'The Congestion Colossus',
    title: 'Gatekeeper of the Routing Fabric',
    description: 'Defeat this massive entity by proving your mastery over Subnetting, CIDR prefix matching, and Dijkstra routing algorithms.',
    avatarUrl: 'images/avatars/boss_unit_3.png',
    hp: 100,
    timeLimitSeconds: 600,
    passPercentage: 70,
    xpReward: 300,
    badgeReward: 'Colossus Destroyer Trophy',
    questionIds: UNIT_CHALLENGES['unit-3']?.questions?.map((_, i) => `boss_u3_q${i + 1}`) || []
  },
  {
    id: 'boss_unit_4',
    unitId: 'unit-4',
    bossName: 'The Segment Slayer',
    title: 'Master of Reliable Transmissions',
    description: 'Overcome out-of-order segment chaos, sliding window buffer overflows, and TCP retransmission timeouts.',
    avatarUrl: 'images/avatars/boss_unit_4.png',
    hp: 100,
    timeLimitSeconds: 600,
    passPercentage: 70,
    xpReward: 350,
    badgeReward: 'Reliability Sovereign Crest',
    questionIds: UNIT_CHALLENGES['unit-4']?.questions?.map((_, i) => `boss_u4_q${i + 1}`) || []
  },
  {
    id: 'boss_unit_5',
    unitId: 'unit-5',
    bossName: 'The Cipher King',
    title: 'Architect of Cryptographic Fortresses',
    description: 'Crack asymmetric keys, navigate DNS poisoning hazards, and configure enterprise firewall defenses.',
    avatarUrl: 'images/avatars/boss_unit_5.png',
    hp: 100,
    timeLimitSeconds: 600,
    passPercentage: 70,
    xpReward: 400,
    badgeReward: 'Grand Cryptographer Seal',
    questionIds: UNIT_CHALLENGES['unit-5']?.questions?.map((_, i) => `boss_u5_q${i + 1}`) || []
  }
];

/**
 * 11. USERS COLLECTION SEED (Template / Initial Seed)
 */
export const SEED_USERS: UserDocument[] = [
  {
    uid: 'klu_demo_student_01',
    email: '2400030001@klu.ac.in',
    displayName: 'Priya KLU Scholar',
    studentId: '2400030001',
    college: 'K L University (KARE)',
    course: 'B.Tech CSE - Computer Networks',
    year: '2nd Year',
    section: 'Section S14',
    role: 'student',
    photoURL: 'images/avatars/default_student.png',
    totalXP: 450,
    streak: 3,
    currentLevel: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  }
];

/**
 * 12. USERPROGRESS COLLECTION SEED
 */
export const SEED_USER_PROGRESS: UserProgressDocument[] = [
  {
    id: 'klu_demo_student_01_cs-comp-networks',
    userId: 'klu_demo_student_01',
    courseId: 'cs-comp-networks',
    completedUnits: [],
    completedLessons: ['u3_m1', 'u3_m2'],
    currentUnit: 'unit-3',
    currentLesson: 'u3_m3',
    overallProgressPercent: 7,
    unitProgress: {
      unit3: 17,
      unit4: 0,
      unit5: 0
    },
    totalXP: 450,
    streak: 3,
    lastActiveAt: new Date().toISOString()
  }
];

/**
 * 13. USERMASTERY COLLECTION SEED
 */
export const SEED_USER_MASTERY: UserMasteryDocument[] = [
  {
    id: 'klu_demo_student_01_concept_ipv4_addressing',
    userId: 'klu_demo_student_01',
    conceptId: 'concept_ipv4_addressing',
    masteryScore: 85,
    reviewCount: 3,
    correctCount: 3,
    lastReviewedAt: new Date().toISOString(),
    nextReviewAt: new Date(Date.now() + 86400000 * 3).toISOString(),
    confidenceLevel: 'high'
  }
];

/**
 * 14. QUIZATTEMPTS COLLECTION SEED
 */
export const SEED_QUIZ_ATTEMPTS: QuizAttemptDocument[] = [
  {
    id: 'sample_attempt_001',
    userId: 'klu_demo_student_01',
    studentId: '2400030001',
    quizId: 'quiz_u3_m1',
    unitId: 'unit-3',
    lessonId: 'u3_m1',
    score: 3,
    totalQuestions: 3,
    percentage: 100,
    passed: true,
    answers: { 0: 1, 1: 0, 2: 2 },
    timeTakenSeconds: 94,
    completedAt: new Date().toISOString()
  }
];

/**
 * 15. ACHIEVEMENTS COLLECTION SEED
 */
export const SEED_ACHIEVEMENTS: AchievementDocument[] = [
  {
    id: 'ach_first_packet',
    code: 'FIRST_PACKET',
    title: 'First Packet Sent',
    description: 'Complete your first networking curriculum module.',
    category: 'progress',
    icon: 'Send',
    badgeUrl: 'images/badges/badge_first_packet.png',
    xpReward: 50,
    unlockedByDefault: false
  },
  {
    id: 'ach_streak_3',
    code: 'STREAK_3',
    title: 'Persistent Node',
    description: 'Maintain a 3-day active learning streak.',
    category: 'streak',
    icon: 'Flame',
    badgeUrl: 'images/badges/badge_streak_3.png',
    xpReward: 100
  },
  {
    id: 'ach_subnet_samurai',
    code: 'SUBNET_SAMURAI',
    title: 'Subnet Samurai',
    description: 'Achieve a 100% score on the IPv4 CIDR drill without hints.',
    category: 'mastery',
    icon: 'Zap',
    badgeUrl: 'images/badges/badge_subnet_ninja.png',
    xpReward: 150
  },
  {
    id: 'ach_boss_slayer_u3',
    code: 'BOSS_SLAYER_U3',
    title: 'Colossus Conquered',
    description: 'Defeat the Unit 3 Boss: The Congestion Colossus.',
    category: 'challenge',
    icon: 'Trophy',
    badgeUrl: 'images/badges/badge_boss_u3.png',
    xpReward: 250
  },
  {
    id: 'ach_boss_slayer_u4',
    code: 'BOSS_SLAYER_U4',
    title: 'Segment Savior',
    description: 'Defeat the Unit 4 Boss: The Segment Slayer.',
    category: 'challenge',
    icon: 'Shield',
    badgeUrl: 'images/badges/badge_boss_u4.png',
    xpReward: 300
  },
  {
    id: 'ach_boss_slayer_u5',
    code: 'BOSS_SLAYER_U5',
    title: 'Cryptographic Overlord',
    description: 'Defeat the Unit 5 Boss: The Cipher King.',
    category: 'challenge',
    icon: 'Lock',
    badgeUrl: 'images/badges/badge_boss_u5.png',
    xpReward: 400
  },
  {
    id: 'ach_perfect_score',
    code: 'PERFECT_SCORE',
    title: 'Zero Packet Loss',
    description: 'Score 100% on 3 module quizzes consecutively.',
    category: 'mastery',
    icon: 'CheckCircle',
    badgeUrl: 'images/badges/badge_perfect.png',
    xpReward: 120
  },
  {
    id: 'ach_curriculum_complete',
    code: 'CURRICULUM_COMPLETE',
    title: 'Network Virtuoso',
    description: 'Complete all 30 modules across Unit 3, Unit 4, and Unit 5.',
    category: 'progress',
    icon: 'Crown',
    badgeUrl: 'images/badges/badge_master.png',
    xpReward: 500
  }
];

/**
 * Map collection names to their seed datasets
 */
export const ALL_SEEDS: Record<string, { docs: any[]; idField: string }> = {
  courses: { docs: SEED_COURSES, idField: 'id' },
  units: { docs: SEED_UNITS, idField: 'id' },
  levels: { docs: SEED_LEVELS, idField: 'id' },
  lessons: { docs: SEED_LESSONS, idField: 'id' },
  concepts: { docs: SEED_CONCEPTS, idField: 'id' },
  questions: { docs: SEED_QUESTIONS, idField: 'id' },
  flashcards: { docs: SEED_FLASHCARDS, idField: 'id' },
  activities: { docs: SEED_ACTIVITIES, idField: 'id' },
  missions: { docs: SEED_MISSIONS, idField: 'id' },
  bosses: { docs: SEED_BOSSES, idField: 'id' },
  users: { docs: SEED_USERS, idField: 'uid' },
  userProgress: { docs: SEED_USER_PROGRESS, idField: 'id' },
  userMastery: { docs: SEED_USER_MASTERY, idField: 'id' },
  quizAttempts: { docs: SEED_QUIZ_ATTEMPTS, idField: 'id' },
  achievements: { docs: SEED_ACHIEVEMENTS, idField: 'id' }
};

/**
 * Seed all 15 Firestore collections sequentially.
 * If overwrite is false, documents that already exist won't be replaced.
 */
export async function seedAllFirestoreCollections(
  options: { overwrite?: boolean; onProgress?: SeedProgressCallback } = {}
): Promise<{ success: boolean; seededCount: number; errors: string[] }> {
  const { overwrite = false, onProgress } = options;
  const errors: string[] = [];
  let totalSeeded = 0;

  console.info('[Firestore Seeder] Starting seeding of all 15 top-level collections...');

  for (const [collectionName, seedData] of Object.entries(ALL_SEEDS)) {
    const totalDocs = seedData.docs.length;
    let currentDocIndex = 0;

    for (const docData of seedData.docs) {
      currentDocIndex++;
      const docId = String(docData[seedData.idField] || `${collectionName}_${currentDocIndex}`);

      try {
        const docRef = doc(db, collectionName, docId);

        if (!overwrite) {
          try {
            const existing = await getDoc(docRef);
            if (existing.exists()) {
              if (onProgress) {
                onProgress(collectionName, currentDocIndex, totalDocs, 'skipped');
              }
              continue;
            }
          } catch {
            // If getDoc fails (e.g. offline/cache only), proceed to set
          }
        }

        await setDoc(docRef, docData, { merge: true });
        totalSeeded++;

        if (onProgress) {
          onProgress(collectionName, currentDocIndex, totalDocs, 'seeding');
        }
      } catch (err: any) {
        const msg = `[${collectionName}/${docId}]: ${err.message || String(err)}`;
        console.warn(`[Firestore Seeder Error] ${msg}`);
        errors.push(msg);

        if (onProgress) {
          onProgress(collectionName, currentDocIndex, totalDocs, 'error', msg);
        }
      }
    }

    if (onProgress) {
      onProgress(collectionName, totalDocs, totalDocs, 'done');
    }
  }

  console.info(`[Firestore Seeder] Completed. Seeded ${totalSeeded} documents with ${errors.length} non-fatal errors.`);
  return {
    success: errors.length === 0,
    seededCount: totalSeeded,
    errors
  };
}
