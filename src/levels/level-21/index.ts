import { LevelDefinition } from '../types';

export const level21Data: LevelDefinition = {
  id: 21,
  slug: 'level-21',
  lessonId: 'u5_m08',
  unitNumber: 5,
  unitTitle: 'Unit 5: Application Layer',
  lessonNumber: 7,
  totalLessonsInUnit: 7,
  title: 'TCP/IP Mastery & Internet Capstone',
  subtitle: 'Trace the complete journey of a packet through all 5 protocol layers from browser click to server response.',
  description: 'Final comprehensive challenge: Complete end-to-end packet journey through the full 5-layer internet protocol stack.',
  objectives: [
    'Synthesize the complete 5-layer Internet protocol stack from physical bits to application data',
    'Trace the journey of a web request: DNS lookup, ARP resolution, DHCP, TCP handshake, TLS, and HTTP GET',
    'Analyze router packet forwarding and NAT translation across the network boundary',
    'Troubleshoot end-to-end network latency, packet loss, and configuration anomalies'
  ],
  estimatedDuration: '8–10 min',
  mascotQuote: 'Congratulations on reaching the Capstone! Let us trace a single packet through the entire global Internet stack!',
  mascotTip: 'Inspect every layer header added during encapsulation and stripped during decapsulation!',
  xpReward: 300,
  prevLevelSlug: 'level-20',
  completionState: {
    isCompleted: false,
    minScore: 80,
    requiredBadge: 'TCP/IP Architect',
  },
  animatedLearning: {
    diagramType: 'dns-pipeline',
    animationTopicId: 'osi-encapsulation',
    description: 'Complete 5-layer encapsulation, routing, and decapsulation pipeline'
  },

  concept: {
    tabs: [
      {
        id: 'overview',
        label: 'Overview',
        title: 'The Full Internet Protocol Journey',
        content: [
          'What happens when you type https://www.google.com into your browser and press Enter? A symphony of protocols across all five layers coordinates within milliseconds to resolve addresses, establish security contexts, and exchange hypertext.',
          'Step 1 (Bootstrap & Addressing): DHCP leases local IP, gateway IP, and DNS resolver address. ARP resolves default gateway MAC address.',
          'Step 2 (Name Resolution): DNS queries resolve hostnames into IP addresses across root, TLD, and authoritative nameservers.',
          'Step 3 (Transport & Security): TCP 3-way handshake synchronizes sequence numbers on port 443; TLS 1.3 performs cryptographic key exchange.',
          'Step 4 (Application Exchange): HTTP/2 or HTTP/3 streams encrypted GET requests, and the web server returns the rendered response payload.'
        ],
        keyTakeaways: [
          'Every layer performs a distinct encapsulation contract',
          'Application Layer: HTTP/2, DNS (User Data)',
          'Transport Layer: TCP, UDP (Process-to-Process ports & reliability)',
          'Network Layer: IPv4, IPv6 (End-to-end host addressing & routing)',
          'Data Link Layer: Ethernet, Wi-Fi (Hop-to-hop MAC framing)'
        ],
        diagram: {
          type: 'architecture',
          source: 'Client Browser (Port 54321)',
          layer: '5-Layer TCP/IP Protocol Stack',
          destination: 'Cloud Web Server (Port 443)',
          caption: 'End-to-End Encapsulation, Transmission, and Decapsulation'
        }
      },
      {
        id: 'key-concepts',
        label: 'Key Concepts',
        title: 'Cross-Layer Encapsulation Mechanics',
        content: [
          'Encapsulation (Downward Data Flow): Application data gets wrapped in TCP segment headers (Port numbers, Sequence numbers), then IP packet headers (Source/Destination IP, TTL), then Ethernet frame headers (MAC addresses, CRC FCS).',
          'Decapsulation (Upward Data Flow): The receiver NIC verifies Ethernet CRC, strips the L2 frame, the OS kernel verifies IP checksum and decrements TTL, the TCP socket buffer reassembles the byte stream in order, and finally delivers raw HTTP payload to the application.',
          'NAT & Border Gateways: Network Address Translation rewrites private IP/port tuples to public IP/port tuples at the boundary router before packets enter the global BGP backbone.'
        ],
        keyTakeaways: [
          'PDU Names: Message (L5/L7) -> Segment (L4) -> Packet (L3) -> Frame (L2) -> Bits (L1)',
          'Each layer only interacts with its peer layer on the remote host or intermediate hop'
        ]
      },
      {
        id: 'analogy',
        label: 'Real World Analogy',
        title: 'The Diplomatic Courier Analogy',
        content: [
          'Writing an email to a foreign diplomat is the Application Layer (the confidential text).',
          'Placing the message into a certified serial-numbered diplomatic pouch is the Transport Layer (ensuring all pages arrive in order).',
          'Writing the embassy street address and country code on the envelope is the Network Layer (routing across continents).',
          'Handing the pouch to an airport courier with a specific boarding pass is the Data Link Layer (local transport between two gates).'
        ],
        keyTakeaways: [
          'Each envelope nests inside another envelope',
          'Couriers only read the outermost envelope needed for their hop'
        ]
      },
      {
        id: 'examples',
        label: 'Examples',
        title: 'End-to-End Diagnostic Tools',
        content: [
          'traceroute: Uses incrementing TTLs starting from 1 to elicit ICMP Time Exceeded messages from each intermediate Layer 3 router.',
          'dig / nslookup: Directly inspects DNS RR types (A, AAAA, CNAME, MX) across recursive nameservers.',
          'Wireshark / tcpdump: Captures live hex frames to inspect every bit from Ethernet preamble to TLS Application Data.'
        ],
        keyTakeaways: [
          'traceroute reveals the L3 topology path',
          'Wireshark visualizes the complete encapsulation hierarchy'
        ]
      },
      {
        id: 'notes',
        label: 'Quick Notes',
        title: 'Mastery Review Matrix',
        content: [
          'Physical: Cables, Fiber, RF (Bits).',
          'Data Link: Switch, Bridge, MAC, ARP, CSMA/CD, 1500 byte MTU (Frames).',
          'Network: Router, IP, ICMP, OSPF, BGP (Packets).',
          'Transport: TCP (reliable, streaming, port multiplexing), UDP (low-latency, datagram) (Segments).',
          'Application: HTTP, DNS, FTP, SMTP, SSH (Messages).'
        ],
        keyTakeaways: [
          'Layer 2 = MAC / Switch',
          'Layer 3 = IP / Router',
          'Layer 4 = Port / Transport',
          'Layer 5/7 = Protocol / App'
        ]
      }
    ]
  },

  interactive: {
    title: 'Full Stack Internet Packet Flow Simulator',
    description: 'Trigger a web transaction and watch the frame travel down the client stack, through the router, across the WAN, and up the server stack.',
    mascotTip: 'Trace the packet as it shifts from MAC to IP to Port to Application payload!',
    sourceCity: 'Client Browser',
    destinationCity: 'Web Server',
    defaultMessage: 'GET /index.html HTTP/2',
    path: ['Client Stack', 'Default Gateway (Router)', 'Core ISP Backbone', 'Cloud Edge Server'],
    hops: 3,
    totalTimeMs: 28,
    explanation: 'Application sends HTTP request. OS encapsulates into TCP SYN -> IP datagram -> Ethernet frame. Router strips L2, inspects destination IP, performs NAT, forwards over optical WAN link to server for TLS handshake.',
    routers: [
      { id: 'src', name: 'Client Browser', x: 12, y: 55, label: 'Host (192.168.1.5)', active: true },
      { id: 'r1', name: 'Edge Router', x: 38, y: 40, label: 'NAT Gateway', active: true },
      { id: 'r2', name: 'ISP BGP Core', x: 62, y: 35, label: 'Global Backbone', active: true },
      { id: 'dst', name: 'Web Server', x: 88, y: 52, label: 'Server (142.250.190.46)' }
    ]
  },

  quiz: {
    title: 'Internet Architecture Capstone Exam',
    subtitle: 'Comprehensive evaluation covering all core protocol layers and internetworking mechanics.',
    quickTips: [
      'Think through the chronological sequence of a network transaction',
      'Identify which layer is responsible for each address format (MAC vs IP vs Port)'
    ],
    questions: [
      {
        id: 1,
        question: 'When a user opens a web browser and types "https://example.com", which protocol is invoked FIRST before any TCP connection can start?',
        options: [
          { id: 'A', text: 'HTTP GET', isCorrect: false },
          { id: 'B', text: 'DNS (Domain Name System)', isCorrect: true },
          { id: 'C', text: 'TLS Handshake', isCorrect: false },
          { id: 'D', text: 'BGP Routing update', isCorrect: false }
        ],
        explanation: 'Before the client can contact the server, it must know the server IP address. The browser invokes DNS resolution to map "example.com" to an IP address.'
      },
      {
        id: 2,
        question: 'Which of the following correctly pairs each protocol data unit (PDU) with its protocol layer?',
        options: [
          { id: 'A', text: 'Frame: Layer 3, Packet: Layer 2, Segment: Layer 4', isCorrect: false },
          { id: 'B', text: 'Segment: Layer 4, Packet: Layer 3, Frame: Layer 2', isCorrect: true },
          { id: 'C', text: 'Message: Layer 2, Datagram: Layer 1, Bit: Layer 4', isCorrect: false },
          { id: 'D', text: 'Packet: Layer 4, Frame: Layer 3, Segment: Layer 2', isCorrect: false }
        ],
        explanation: 'Layer 4 Transport handles Segments; Layer 3 Network handles Packets (Datagrams); Layer 2 Data Link handles Frames; Layer 1 Physical handles Bits.'
      },
      {
        id: 3,
        question: 'When a router forwards an IP packet to the next hop on an Ethernet link, what fields are modified?',
        options: [
          { id: 'A', text: 'Source and Destination IP addresses are both swapped.', isCorrect: false },
          { id: 'B', text: 'TTL is decremented, IP checksum is recalculated, and source/destination MAC addresses are replaced.', isCorrect: true },
          { id: 'C', text: 'Only the TCP sequence number is modified.', isCorrect: false },
          { id: 'D', text: 'Nothing is changed in any header.', isCorrect: false }
        ],
        explanation: 'The router decrements IP TTL, recalculates the IP header checksum, and encapsulates the packet into a brand new Layer 2 Ethernet frame with its own MAC as source and the next hop MAC as destination.'
      },
      {
        id: 4,
        question: 'Why does TCP use Port numbers in addition to IP addresses?',
        options: [
          { id: 'A', text: 'To encrypt data against eavesdroppers.', isCorrect: false },
          { id: 'B', text: 'To multiplex communication between multiple software processes running on the same host.', isCorrect: true },
          { id: 'C', text: 'To determine physical link speeds.', isCorrect: false },
          { id: 'D', text: 'To prevent routing loops in WAN networks.', isCorrect: false }
        ],
        explanation: 'IP addresses deliver packets host-to-host; Port numbers multiplex communication process-to-process so multiple applications (browser, music player, game) can share the network simultaneously.'
      },
      {
        id: 5,
        question: 'How does traceroute identify the intermediate routers along an internet path?',
        options: [
          { id: 'A', text: 'By querying the central DNS server for the complete path.', isCorrect: false },
          { id: 'B', text: 'By sending packets with incrementing TTL values and recording the ICMP Time Exceeded responses.', isCorrect: true },
          { id: 'C', text: 'By scanning every IP address in the subnet.', isCorrect: false },
          { id: 'D', text: 'By embedding GPS coordinates into the TCP options field.', isCorrect: false }
        ],
        explanation: 'traceroute transmits packets with TTL=1, TTL=2, TTL=3... Each intermediate router decrements TTL to 0, drops the packet, and sends back an ICMP Time Exceeded message, revealing its IP address.'
      }
    ]
  },

  summary: {
    keyConcepts: [
      '5-Layer Stack: Physical, Data Link, Network, Transport, Application',
      'Encapsulation: Header addition on transmission, header removal on receipt',
      'Addressing: MAC (hop-to-hop), IP (host-to-host), Port (process-to-process)',
      'Diagnostics: DNS, ARP, ICMP, Wireshark, traceroute'
    ],
    importantPoints: [
      'Cross-layer coordination delivers seamless global internetworking',
      'Layer independence allows physical media to upgrade without breaking applications',
      'Security protocols (TLS, IPsec, 802.1X) operate at multiple layers for defense-in-depth'
    ],
    realWorldAnalogy: 'The global Internet is like international commerce: agreements, packaging standards, container ships, customs checkpoints, and local couriers all operate autonomously to transport goods worldwide.',
    commonUses: [
      'Global Web Browsing & Cloud Computing',
      'Voice over IP & Ultra-low Latency Streaming',
      'FinTech, E-Commerce, & IoT Sensor Networks'
    ],
    mindMap: {
      center: 'Internet Architecture',
      nodes: [
        { id: 'n1', label: 'Layer 5: Application (HTTP, DNS)', category: 'primary' },
        { id: 'n2', label: 'Layer 4: Transport (TCP, UDP, Ports)', category: 'primary' },
        { id: 'n3', label: 'Layer 3: Network (IP, Routers, BGP)', category: 'primary' },
        { id: 'n4', label: 'Layer 2: Data Link (MAC, Switches, ARP)', category: 'secondary' },
        { id: 'n5', label: 'Layer 1: Physical (Bits, Fiber, RF)', category: 'secondary' },
        { id: 'n6', label: 'Diagnostics (Wireshark, traceroute, ICMP)', category: 'accent' }
      ],
      edges: [
        { from: 'Internet Architecture', to: 'n1' },
        { from: 'Internet Architecture', to: 'n2' },
        { from: 'Internet Architecture', to: 'n3' },
        { from: 'Internet Architecture', to: 'n4' },
        { from: 'Internet Architecture', to: 'n5' },
        { from: 'Internet Architecture', to: 'n6' }
      ]
    }
  }
};
