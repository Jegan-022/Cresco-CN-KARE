import { LevelDefinition } from '../types';

export const level1Data: LevelDefinition = {
  id: 1,
  slug: 'level-1',
  lessonId: 'u3_m01',
  unitNumber: 3,
  unitTitle: 'Unit 3: Network Layer',
  lessonNumber: 1,
  totalLessonsInUnit: 8,
  title: 'Network Layer — Need and Issues',
  subtitle: 'Understand why the network layer is required, what services it provides, and the key design challenges it addresses.',
  description: 'Store-and-forward packet switching, connectionless datagram vs virtual circuit services, and Layer 3 design issues.',
  objectives: [
    'Understand why multi-hop networks require Layer 3 host-to-host routing',
    'Contrast connectionless datagram packet switching with virtual circuits',
    'Examine store-and-forward packet processing and router forwarding tables',
    'Analyze primary network layer design challenges: routing, congestion, and QoS'
  ],
  estimatedDuration: '4–5 min',
  mascotQuote: "Let's understand why the Network Layer exists!",
  mascotTip: "Drag and send a message to see how routing works!",
  xpReward: 100,
  nextLevelSlug: 'level-2',
  completionState: {
    isCompleted: false,
    minScore: 70,
  },
  animatedLearning: {
    diagramType: 'routing-topology',
    animationTopicId: 'store-and-forward',
    description: 'Visualizing packet buffering, routing table lookup, and forwarding across router hops.'
  },

  concept: {
    tabs: [
      {
        id: 'overview',
        label: 'Overview',
        title: 'What is Network Layer?',
        content: [
          'The Network Layer is the third layer in the OSI model (Layer 3). It is responsible for logical addressing, routing, and forwarding data packets from source to destination host across multiple interconnected networks.',
          'Unlike the Data Link layer which only handles hop-to-hop frame delivery between machines on the same physical link or switch, the Network layer ensures end-to-end packet delivery across the entire Internet.',
          'It provides two primary service models: Connectionless Datagram Service (used by IPv4 and IPv6) and Connection-Oriented Virtual-Circuit Service.'
        ],
        keyTakeaways: [
          'Provides logical addressing (IP addressing)',
          'Determines the best path for data (Routing)',
          'Handles packet forwarding across multiple networks',
          'Deals with issues like routing, congestion, and reliability'
        ],
        diagram: {
          type: 'architecture',
          source: 'Source (Host A)',
          layer: 'Network Layer (Routing & Forwarding)',
          destination: 'Destination (Host B)',
          caption: 'End-to-End Packet Delivery across Intermediate Networks'
        }
      },
      {
        id: 'key-concepts',
        label: 'Key Concepts',
        title: 'Core Functions & Design Challenges',
        content: [
          'Store-and-Forward Packet Switching: Routers receive complete packets, verify checksum integrity, consult their routing table, and forward to the next hop.',
          'Routing vs Forwarding: Routing is the process of discovering and updating network-wide paths using routing protocols (OSPF, BGP). Forwarding is moving a packet from an input port to the appropriate output port in a router.',
          'Key Design Issues: Handling heterogeneity across diverse networks, preventing congestion collapse, ensuring Quality of Service (QoS), and IP address exhaustion.'
        ],
        keyTakeaways: [
          'Routing creates the routing table; Forwarding executes the decision',
          'Store-and-forward buffers entire packets before forwarding',
          'Packets can be routed via different paths in datagram networks'
        ]
      },
      {
        id: 'analogy',
        label: 'Real World Analogy',
        title: 'The Global Postal Service Analogy',
        content: [
          'Think of the Network Layer as the International Postal Service. When you drop a letter in a mailbox with a destination address (Country, City, Pin Code), you do not need to build a direct wire to that house.',
          'Sorting hubs (routers) look at the postal code (IP address) and forward the letter to the next sorting hub along the optimal delivery path until it reaches the local postman (Data Link layer) for physical handover.'
        ],
        keyTakeaways: [
          'IP Address = Global Postal Address (ZIP / PIN code)',
          'Routers = Postal Sorting Centers & Transport Hubs',
          'Data Link Layer = Local Mail Delivery Truck'
        ]
      },
      {
        id: 'examples',
        label: 'Examples',
        title: 'Real-World Protocol Examples',
        content: [
          'Internet Protocol (IPv4 & IPv6): The foundation of all Internet communications, assigning 32-bit (IPv4) or 128-bit (IPv6) global addresses.',
          'ICMP (Internet Control Message Protocol): Diagnostics and error reporting (ping, traceroute).',
          'Routing Protocols: OSPF (Open Shortest Path First), BGP (Border Gateway Protocol), and RIP (Routing Information Protocol).'
        ],
        keyTakeaways: [
          'IPv4/IPv6 are the heart of Layer 3',
          'BGP connects autonomous systems across the global Internet',
          'Traceroute reveals intermediate Layer 3 hops'
        ]
      },
      {
        id: 'notes',
        label: 'Quick Notes',
        title: 'Exam & Interview Cheat Sheet',
        content: [
          'PDU (Protocol Data Unit): Packet (or Datagram).',
          'Hardware Device: Router (operates at Layer 3).',
          'MTU (Maximum Transmission Unit): Maximum packet size a network link can transmit without fragmentation.',
          'TTL (Time to Live): Hop counter in IP header decremented by each router to eliminate routing loops.'
        ],
        keyTakeaways: [
          'PDU name: Packet',
          'Device: Router / Layer 3 Switch',
          'TTL prevents packets from circulating forever'
        ]
      }
    ]
  },

  interactive: {
    title: 'See How the Network Layer Works!',
    description: 'Send a message from one city to another and see how the network layer finds the best route across multiple networks.',
    mascotTip: 'Drag and send a message to see how routing works!',
    sourceCity: 'Chennai',
    destinationCity: 'Mumbai',
    defaultMessage: 'Hello!',
    path: ['Source (Chennai)', 'R1 (Edge Router)', 'R2 (Core Router)', 'R4 (Gateway)', 'Destination (Mumbai)'],
    hops: 3,
    totalTimeMs: 48,
    explanation: 'The source host encapsulates data into an IP datagram with destination IP. Router R1 inspects destination IP, consults its forwarding table, and passes it to core router R2. R2 routes it through gateway R4 to deliver safely to Mumbai.',
    routers: [
      { id: 'src', name: 'Source (Chennai)', x: 12, y: 55, label: 'Host Chennai' },
      { id: 'r1', name: 'R1 (Edge Router)', x: 32, y: 40, label: 'Router R1', active: true },
      { id: 'r2', name: 'R2 (Core Hub)', x: 52, y: 35, label: 'Router R2', active: true },
      { id: 'r3', name: 'R3 (Alt Path)', x: 50, y: 70, label: 'Router R3 (Standby)' },
      { id: 'r4', name: 'R4 (Gateway)', x: 74, y: 42, label: 'Router R4', active: true },
      { id: 'dst', name: 'Destination (Mumbai)', x: 90, y: 55, label: 'Host Mumbai' }
    ]
  },

  quiz: {
    title: 'Practice Quiz',
    subtitle: 'Test your understanding with carefully curated questions.',
    quickTips: [
      'Read the question carefully',
      'Eliminate wrong options',
      'Think with real-world examples'
    ],
    questions: [
      {
        id: 1,
        question: 'Why does a letter sent across the world reach your doorstep, while Ethernet only talks to adjacent cables?',
        options: [
          { id: 'A', text: 'Because the network layer provides logical addressing and routing across multiple networks.', isCorrect: true },
          { id: 'B', text: 'Because physical layer is faster than network layer.', isCorrect: false },
          { id: 'C', text: 'Because Ethernet uses IP addressing directly.', isCorrect: false },
          { id: 'D', text: 'Because the transport layer handles physical routing.', isCorrect: false }
        ],
        explanation: 'The network layer provides logical addressing (IP) and routing, allowing data packets to travel across disparate interconnected networks to reach the destination host.'
      },
      {
        id: 2,
        question: 'What is the primary difference between Routing and Forwarding in the Network Layer?',
        options: [
          { id: 'A', text: 'Routing determines the network-wide path; Forwarding transfers packets from input to output port.', isCorrect: true },
          { id: 'B', text: 'Forwarding is done by software; Routing is done exclusively by physical cables.', isCorrect: false },
          { id: 'C', text: 'Routing is connection-oriented; Forwarding is connectionless.', isCorrect: false },
          { id: 'D', text: 'There is no difference; they are identical terms.', isCorrect: false }
        ],
        explanation: 'Routing operates on the control plane to compute the best paths and build tables; Forwarding operates on the data plane to transfer packets between ports.'
      },
      {
        id: 3,
        question: 'In a connectionless datagram network, what information must every packet header contain?',
        options: [
          { id: 'A', text: 'Only a virtual circuit identifier (VCI).', isCorrect: false },
          { id: 'B', text: 'The full destination IP address and source IP address.', isCorrect: true },
          { id: 'C', text: 'The MAC address of the destination host only.', isCorrect: false },
          { id: 'D', text: 'No address is needed after the connection is established.', isCorrect: false }
        ],
        explanation: 'In connectionless IP networking, each packet is routed independently by intermediate routers, so every packet must contain the full destination IP address.'
      },
      {
        id: 4,
        question: 'What happens to the TTL (Time to Live) field in an IPv4 packet when it passes through a router?',
        options: [
          { id: 'A', text: 'It is increased by 1 to reward the packet.', isCorrect: false },
          { id: 'B', text: 'It is decremented by 1; if it hits 0, the packet is dropped.', isCorrect: true },
          { id: 'C', text: 'It remains unchanged throughout the journey.', isCorrect: false },
          { id: 'D', text: 'It is replaced with the router MAC address.', isCorrect: false }
        ],
        explanation: 'Routers decrement TTL by at least 1 at each hop. If TTL reaches 0, the packet is discarded and an ICMP Time Exceeded message is returned, preventing endless looping.'
      },
      {
        id: 5,
        question: 'Which of the following is considered a primary design challenge of the Network Layer?',
        options: [
          { id: 'A', text: 'Congestion control and traffic management.', isCorrect: false },
          { id: 'B', text: 'Quality of Service (QoS) guarantees.', isCorrect: false },
          { id: 'C', text: 'Interconnecting heterogeneous networks (differing MTUs, protocols).', isCorrect: false },
          { id: 'D', text: 'All of the above.', isCorrect: true }
        ],
        explanation: 'The Network Layer must solve internetworking across heterogeneous networks, prevent congestion collapse, compute optimal routes, and deliver predictable QoS.'
      }
    ]
  },

  summary: {
    keyConcepts: [
      'Role of Network Layer (Host-to-host delivery)',
      'Logical Addressing (Global IP Addressing)',
      'Routing vs Forwarding execution',
      'Key Design issues & Heterogeneity'
    ],
    importantPoints: [
      'Connects multiple autonomous networks',
      'Uses hierarchical IP addressing',
      'Finds best path for data using dynamic metrics',
      'Handles congestion and packet fragmentation'
    ],
    realWorldAnalogy: 'Like a global postal system that finds the best route for your letter across different cities and transport modes without needing a direct physical line.',
    commonUses: [
      'Internet communication & web browsing',
      'Video streaming & real-time calls',
      'Online multiplayer gaming',
      'Cloud compute & global API routing'
    ],
    mindMap: {
      center: 'Network Layer',
      nodes: [
        { id: 'n1', label: 'Logical Addressing (IP Address)', category: 'primary' },
        { id: 'n2', label: 'Routing & Forwarding', category: 'primary' },
        { id: 'n3', label: 'Connectionless Service (Datagram)', category: 'secondary' },
        { id: 'n4', label: 'Inter-network Communication', category: 'secondary' },
        { id: 'n5', label: 'Key Design Issues (Routing, Congestion, Reliability)', category: 'accent' },
        { id: 'n6', label: 'Handles Congestion & QoS', category: 'accent' }
      ],
      edges: [
        { from: 'Network Layer', to: 'n1' },
        { from: 'Network Layer', to: 'n2' },
        { from: 'Network Layer', to: 'n3' },
        { from: 'Network Layer', to: 'n4' },
        { from: 'Network Layer', to: 'n5' },
        { from: 'Network Layer', to: 'n6' }
      ]
    }
  }
};
