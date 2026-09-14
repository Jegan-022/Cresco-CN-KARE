/**
 * Cresco CN Animated Human Female Mentors & Guides
 * Specializing in Computer Networks: Learning, Practice, Voice Guidance & Companionship
 */

export type CharacterId =
  | 'aria-vance'
  | 'maya-lin'
  | 'chloe-sterling'
  | 'sera-cruz'
  | 'kira-tanaka'
  | 'zoe-bennett'
  | 'elena-rostova'
  | 'tanya-okafor'
  | 'hana-mori'
  | 'luna-chen';

export type CharacterPose =
  | 'idle'
  | 'explaining'
  | 'thinking'
  | 'correct'
  | 'wrong'
  | 'celebrating'
  | 'boss-mode'
  | 'boss-battle'
  | 'sleeping'
  | 'streak'
  | 'level-up';

export interface CharacterProfile {
  id: CharacterId;
  name: string;
  title: string;
  archetype: string;
  category: 'architect' | 'security' | 'developer' | 'routing' | 'optical';
  networkLayer: string;
  themeColor: string;
  accentColor: string;
  gradient: string;
  badgeText: string;
  avatarMood: string;
  
  // Speech & Voice Configuration
  voiceName: string;
  voiceDescription: string;
  voiceStyleTag: string;
  voiceSettings: {
    stability: number;
    similarity_boost: number;
    style?: number;
  };
  fallbackVoice: {
    pitch: number;
    rate: number;
  };

  // Profile Details & Story
  learnBio: string;
  playBio: string;
  catchphrase: string;
  defaultIntro: string;
  gameplayPerk: string;
  studyTips: string[];
}

export const CHARACTERS: CharacterProfile[] = [
  {
    id: 'aria-vance',
    name: 'Aria Vance',
    title: 'Chief Network Architect',
    archetype: 'Intellectual & Graceful Mentor',
    category: 'architect',
    networkLayer: 'Layers 1–7 (Full Stack Architecture)',
    themeColor: '#EA580C',
    accentColor: '#F97316',
    gradient: 'from-orange-500 via-amber-500 to-rose-500',
    badgeText: 'CHIEF ARCHITECT',
    avatarMood: 'Glasses & Ponytail, Confident Smile',
    voiceName: 'Rachel',
    voiceDescription: 'Articulate, warm, inspiring and encouraging mentor voice',
    voiceStyleTag: 'Clear & Authoritative',
    voiceSettings: {
      stability: 0.6,
      similarity_boost: 0.8,
    },
    fallbackVoice: {
      pitch: 1.05,
      rate: 1.0,
    },
    learnBio: 'A brilliant senior network engineer who simplifies complex architectures into intuitive mental models.',
    playBio: 'Provides steady bonus XP multipliers and celebrates architectural breakthroughs with radiant confidence.',
    catchphrase: 'Every packet has a destination, and together we are engineering its flawless journey!',
    defaultIntro: 'Welcome Cadet! I am Aria Vance. Grab your coffee and tablet—we are going to build the most resilient networks on earth.',
    gameplayPerk: '+15% XP bonus on all completed module steps and final exams',
    studyTips: [
      'The OSI model has 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application.',
      'Always remember: routers operate primarily at Layer 3 (IP), while switches operate at Layer 2 (MAC).',
      'Think of encapsulation like nesting envelopes: each layer adds its own address and control header.'
    ]
  },
  {
    id: 'maya-lin',
    name: 'Maya Lin',
    title: 'Cyber Defense Valkyrie',
    archetype: 'Tactical Cybersecurity Specialist',
    category: 'security',
    networkLayer: 'Firewalls, IDS/IPS & Threat Defense',
    themeColor: '#DC2626',
    accentColor: '#EF4444',
    gradient: 'from-red-600 via-rose-500 to-amber-500',
    badgeText: 'SECURITY SENTINEL',
    avatarMood: 'Tactical Headset, Crimson Hair Bangs',
    voiceName: 'Nicole',
    voiceDescription: 'Energetic, protective, confident and alert tactical tone',
    voiceStyleTag: 'Energetic & Crisp',
    voiceSettings: {
      stability: 0.5,
      similarity_boost: 0.85,
    },
    fallbackVoice: {
      pitch: 1.15,
      rate: 1.05,
    },
    learnBio: 'Specializes in stateful packet inspection, access control lists (ACLs), DDoS mitigation, and encrypted tunnels.',
    playBio: 'Grants protective shield barriers during boss fights that absorb unexpected mistake penalties.',
    catchphrase: 'Zero trust, maximum vigilance! No unauthorized packets enter our perimeter.',
    defaultIntro: 'Systems armed! I am Maya Lin. The firewall rules are set, and I have got your back on every cyber battleground.',
    gameplayPerk: 'Shield protection: Absorbs 1 incorrect answer per challenge without heart loss',
    studyTips: [
      'A firewall filters traffic based on established policies; stateful inspection tracks ongoing TCP sessions.',
      'ACL rules are evaluated top-down; always place specific permit rules above broad deny rules.',
      'SYN flood attacks exhaust server connection buffers by sending incomplete TCP handshakes.'
    ]
  },
  {
    id: 'chloe-sterling',
    name: 'Chloe Sterling',
    title: 'Protocol & Socket Prodigy',
    archetype: 'Playful & Bouncy Code Girl',
    category: 'developer',
    networkLayer: 'Transport & Real-Time Protocols',
    themeColor: '#EC4899',
    accentColor: '#F472B6',
    gradient: 'from-pink-500 via-rose-400 to-amber-400',
    badgeText: 'PROTOCOL GENIUS',
    avatarMood: 'Pink Twin-Tails, Cyber Goggles',
    voiceName: 'Emily',
    voiceDescription: 'Cheerful, upbeat, enthusiastic and sweet student voice',
    voiceStyleTag: 'Playful & Uplifting',
    voiceSettings: {
      stability: 0.45,
      similarity_boost: 0.75,
    },
    fallbackVoice: {
      pitch: 1.35,
      rate: 1.1,
    },
    learnBio: 'Dismantles TCP 3-way handshakes, sliding window algorithms, and UDP streaming headers with sheer delight.',
    playBio: 'Triggers vibrant celebration confetti bursts and speed combos when answering questions rapidly.',
    catchphrase: 'SYN, SYN-ACK, ACK! Connection confirmed, now let us accelerate!',
    defaultIntro: 'Yaaaay! Hi there! I am Chloe Sterling! Protocols are like secret handshakes between machines, let us decode them all!',
    gameplayPerk: 'Speed combo bonus: +25% XP when answering questions within 15 seconds',
    studyTips: [
      'TCP provides reliable, ordered, byte-stream delivery using sequence and acknowledgment numbers.',
      'UDP is lightweight and connectionless, making it perfect for gaming and voice streaming where low latency beats reliability.',
      'Sliding window flow control prevents a fast sender from overwhelming a slow receiver buffer.'
    ]
  },
  {
    id: 'sera-cruz',
    name: 'Seraphina Cruz',
    title: 'Senior Routing Strategist',
    archetype: 'Charismatic Space & Cloud Navigator',
    category: 'routing',
    networkLayer: 'Network Layer (BGP, OSPF, Routing)',
    themeColor: '#D97706',
    accentColor: '#F59E0B',
    gradient: 'from-amber-500 via-orange-500 to-yellow-400',
    badgeText: 'ROUTE CAPTAIN',
    avatarMood: 'Golden Waves, Holographic Visor',
    voiceName: 'Charlotte',
    voiceDescription: 'Smooth, charismatic, commanding yet deeply supportive leader',
    voiceStyleTag: 'Warm & Strategic',
    voiceSettings: {
      stability: 0.65,
      similarity_boost: 0.8,
    },
    fallbackVoice: {
      pitch: 1.0,
      rate: 1.0,
    },
    learnBio: 'Master of Autonomous Systems, Dijkstra shortest path computations, and global BGP route convergence.',
    playBio: 'Reveals route shortcuts, eliminating 1 false answer option on difficult multi-choice exams.',
    catchphrase: 'Identify the optimal path, and the destination takes care of itself.',
    defaultIntro: 'Welcome to the bridge, Navigator. I am Seraphina Cruz. Let us calculate the shortest path through the global mesh.',
    gameplayPerk: 'Route Radar: Automatically eliminates 1 wrong option in tricky exam questions',
    studyTips: [
      'Dijkstra algorithm finds the shortest path tree from a single source node to all other network nodes.',
      'BGP (Border Gateway Protocol) is the path-vector protocol that routes data between Autonomous Systems across the internet.',
      'OSPF uses link-state advertisements and cost metrics based on bandwidth.'
    ]
  },
  {
    id: 'kira-tanaka',
    name: 'Kira Tanaka',
    title: 'The Packet Whisperer',
    archetype: 'Serene & Brilliant Kyoto Engineer',
    category: 'architect',
    networkLayer: 'Data Link Framing, Bit-Stuffing & CRC',
    themeColor: '#059669',
    accentColor: '#10B981',
    gradient: 'from-emerald-600 via-teal-500 to-cyan-400',
    badgeText: 'DATA LINK MASTER',
    avatarMood: 'Sleek Dark Hair, Jade Hairpins, Glowing Scarf',
    voiceName: 'Serena',
    voiceDescription: 'Serene, elegant, soothing and melodious tone',
    voiceStyleTag: 'Calm & Graceful',
    voiceSettings: {
      stability: 0.7,
      similarity_boost: 0.85,
    },
    fallbackVoice: {
      pitch: 1.1,
      rate: 0.95,
    },
    learnBio: 'Expert in bit-level framing, byte stuffing, error-detecting polynomials, and Hamming code distance math.',
    playBio: 'Restores heart meters when maintaining steady study streaks, keeping student calm under pressure.',
    catchphrase: 'Listen closely to the pulses of data; even a single slipped bit tells an important story.',
    defaultIntro: 'Konnichiwa. I am Kira Tanaka. Framing errors and noise dissipate when we examine the signals with patience.',
    gameplayPerk: 'Zen focus: Refills 1 heart upon completing 3 consecutive lessons without mistakes',
    studyTips: [
      'Bit stuffing inserts a 0 after five consecutive 1s to prevent data from being mistaken for a flag delimiter (01111110).',
      'CRC (Cyclic Redundancy Check) uses binary modulo-2 polynomial division to detect burst transmission errors.',
      'Hamming distance is the minimum number of bit substitutions needed to transform one valid codeword into another.'
    ]
  },
  {
    id: 'zoe-bennett',
    name: 'Zoe Bennett',
    title: 'Cloud Infrastructure Guru',
    archetype: 'Upbeat Tech Innovator',
    category: 'developer',
    networkLayer: 'Edge Caching, DNS & Cloud Fabrics',
    themeColor: '#2563EB',
    accentColor: '#3B82F6',
    gradient: 'from-blue-600 via-sky-500 to-indigo-500',
    badgeText: 'CLOUD PRO',
    avatarMood: 'Sunny Honey Bob, Wireless Tech Headset',
    voiceName: 'Freya',
    voiceDescription: 'Bright, enthusiastic, friendly, approachable Silicon Valley engineer',
    voiceStyleTag: 'Bright & Natural',
    voiceSettings: {
      stability: 0.5,
      similarity_boost: 0.75,
    },
    fallbackVoice: {
      pitch: 1.2,
      rate: 1.05,
    },
    learnBio: 'Brings modern Anycast routing, Content Delivery Networks (CDNs), and distributed DNS resolution to life.',
    playBio: 'Awards bonus daily streak shields and cloud caching perks for continuous daily learning.',
    catchphrase: 'Why store data in one place when you can scale it to the edge of the world?',
    defaultIntro: 'Hey there! Zoe Bennett here! Ready to spin up global network fabrics and conquer cloud computing together?',
    gameplayPerk: 'Edge Cache: Keeps your daily streak alive even if you miss a study day',
    studyTips: [
      'DNS (Domain Name System) translates human-readable hostnames into IP addresses via hierarchical tree queries.',
      'Anycast routing allows multiple physical servers to share the same IP address; routers steer users to the topologically nearest node.',
      'CDNs cache static assets at edge POPs close to end users to drastically minimize latency.'
    ]
  },
  {
    id: 'elena-rostova',
    name: 'Elena Rostova',
    title: 'Optical Physics Specialist',
    archetype: 'Refined Quantum & Fiber Physicist',
    category: 'optical',
    networkLayer: 'Physical Media & Optical DWDM',
    themeColor: '#7C3AED',
    accentColor: '#8B5CF6',
    gradient: 'from-violet-600 via-purple-500 to-indigo-400',
    badgeText: 'OPTICAL PHYSICIST',
    avatarMood: 'Silver-Lavender Hair, Lab Coat, Holographic Glasses',
    voiceName: 'Lily',
    voiceDescription: 'Velvety, poised, highly intellectual and scientific cadence',
    voiceStyleTag: 'Poised & Scholarly',
    voiceSettings: {
      stability: 0.65,
      similarity_boost: 0.8,
    },
    fallbackVoice: {
      pitch: 0.95,
      rate: 0.98,
    },
    learnBio: 'Pioneers high-speed optical wavelength division multiplexing (DWDM) and total internal reflection in fiber glass.',
    playBio: 'Powers up "Photon Boost" during speed challenges, doubling points earned on complex physical layer equations.',
    catchphrase: 'Light travels at 200,000 km per second in silica glass. Let us see if we can think even faster.',
    defaultIntro: 'Greetings, scholar. I am Elena Rostova. The fundamental beauty of networking lies in the photons carrying our thoughts.',
    gameplayPerk: 'Photon Boost: 2x score multiplier during timed practice lab drills',
    studyTips: [
      'Fiber optic cables transmit data using total internal reflection, requiring the core refractive index to exceed the cladding index.',
      'Single-mode fiber uses laser light for long distances with minimal modal dispersion; multi-mode uses LEDs for shorter distances.',
      'Attenuation is the loss of optical signal power as light propagates through the fiber.'
    ]
  },
  {
    id: 'tanya-okafor',
    name: 'Tanya Okafor',
    title: 'Distributed Systems Captain',
    archetype: 'Visionary Tech Pioneer',
    category: 'architect',
    networkLayer: 'High Availability & Load Balancers',
    themeColor: '#B45309',
    accentColor: '#D97706',
    gradient: 'from-amber-600 via-orange-600 to-rose-600',
    badgeText: 'SYSTEMS CAPTAIN',
    avatarMood: 'Braided Crown, Neon Tech Wristbands',
    voiceName: 'Matilda',
    voiceDescription: 'Dynamic, visionary, rhythmic, empowering and inspiring voice',
    voiceStyleTag: 'Empowering & Resonant',
    voiceSettings: {
      stability: 0.55,
      similarity_boost: 0.8,
    },
    fallbackVoice: {
      pitch: 1.0,
      rate: 1.02,
    },
    learnBio: 'Teaches resilient system design, round-robin load balancing, microservice mesh networks, and fault tolerance.',
    playBio: 'Boosts team leaderboard score and gives bonus XP when completing challenging scenario reviews.',
    catchphrase: 'Resilience under heavy load is what separates good networks from legendary ones!',
    defaultIntro: 'Salutations! I am Tanya Okafor. We are going to engineer distributed networks that never go down—no matter the traffic spike.',
    gameplayPerk: 'Load Balance: Distributes bonus XP evenly across all student stats',
    studyTips: [
      'Load balancers distribute incoming requests across redundant backend servers to prevent bottlenecks and ensure uptime.',
      'Health checks proactively remove failing server nodes from rotation before users experience connection errors.',
      'Consistent hashing minimizes key remapping when scaling distributed caches up or down.'
    ]
  },
  {
    id: 'hana-mori',
    name: 'Hana Mori',
    title: 'Cryptography & Cipher Prodigy',
    archetype: 'Adorable Genius Codebreaker',
    category: 'security',
    networkLayer: 'Public Key Infrastructure & TLS 1.3',
    themeColor: '#0891B2',
    accentColor: '#06B6D4',
    gradient: 'from-cyan-500 via-teal-400 to-emerald-400',
    badgeText: 'CIPHER PRODIGY',
    avatarMood: 'Cat-Ear Neon Headphones, Oversized Cyber Hoodie',
    voiceName: 'Mimi',
    voiceDescription: 'Playful, sweet, witty, clever and adorable tone',
    voiceStyleTag: 'Sweet & Clever',
    voiceSettings: {
      stability: 0.4,
      similarity_boost: 0.75,
    },
    fallbackVoice: {
      pitch: 1.4,
      rate: 1.1,
    },
    learnBio: 'Turns RSA modular arithmetic, Diffie-Hellman key exchanges, and TLS 1.3 cryptographic handshakes into fun puzzles.',
    playBio: 'Unlocks secret Easter-egg terminal themes and reveals cipher clues on hidden challenge stages.',
    catchphrase: 'Encrypted with 256 bits of pure genius! You cannot crack this without the private key!',
    defaultIntro: 'Yahoo! I am Hana Mori! Got any secret ciphers that need solving? Let us dive into public key magic together!',
    gameplayPerk: 'Key Exchange: Unlocks secret Easter-egg terminal themes and bonus bonus hints',
    studyTips: [
      'Asymmetric encryption uses a public key to encrypt and a mathematically linked private key to decrypt.',
      'Diffie-Hellman allows two parties to establish a shared secret over an insecure channel without transmitting the key.',
      'TLS 1.3 reduces the cryptographic handshake to just one round-trip time (1-RTT), dramatically speeding up secure connections.'
    ]
  },
  {
    id: 'luna-chen',
    name: 'Luna Chen',
    title: 'Zero-Trust Network Detective',
    archetype: 'Cool & Mysterious Cyber Detective',
    category: 'security',
    networkLayer: 'Deep Packet Inspection & Forensics',
    themeColor: '#4F46E5',
    accentColor: '#6366F1',
    gradient: 'from-indigo-600 via-purple-600 to-pink-500',
    badgeText: 'CYBER DETECTIVE',
    avatarMood: 'Violet Hair, High-Collar Cyber Trench Coat, Monocle',
    voiceName: 'Alice',
    voiceDescription: 'Cool, composed, magnetic, mysterious and perceptive voice',
    voiceStyleTag: 'Mysterious & Sharp',
    voiceSettings: {
      stability: 0.7,
      similarity_boost: 0.85,
    },
    fallbackVoice: {
      pitch: 0.98,
      rate: 0.95,
    },
    learnBio: 'Deep dives into raw hex packet captures, Wireshark dissecting, ARP poisoning, and tracing elusive digital footprints.',
    playBio: 'Provides detective hints that reveal exact hex offset locations during packet troubleshooting drills.',
    catchphrase: 'The packets never lie. Follow the hex trace and the truth reveals itself.',
    defaultIntro: 'Good day. I am Luna Chen. Every anomaly in the network leaves a digital footprint. Let us uncover the mystery.',
    gameplayPerk: 'Forensic Eye: Highlights critical header fields during packet simulator labs',
    studyTips: [
      'Wireshark displays network packets categorized by frame number, timestamp, source/dest IP, protocol, and payload info.',
      'ARP spoofing deceives a local switch by associating an attacker’s MAC address with the default gateway’s IP address.',
      'Packet payloads in unencrypted protocols (like HTTP, FTP, Telnet) can be read in plain text by anyone on the wire.'
    ]
  }
];

export const getCharacterById = (id?: string | null): CharacterProfile => {
  if (!id) return CHARACTERS[0];
  const found = CHARACTERS.find((c) => c.id === id);
  return found || CHARACTERS[0];
};
