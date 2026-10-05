import { ModularLesson } from '../lessonModel';

export const lessonU3M01: ModularLesson = {
  id: 'u3_m01',
  unitId: 'unit_3',
  unitName: 'Unit 3: Network Layer',
  unitNumber: 3,
  lessonNumber: 1,
  totalLessonsInUnit: 8,
  title: 'Network Layer — Need and Issues',
  subtitle: 'Understand why the network layer is required, what services it provides, and the key design challenges it addresses.',
  estimatedDuration: '4–5 min',
  xpReward: 50,
  octoConceptSpeech: "Let's understand why the Network Layer exists! 🎓",
  octoSimulationSpeech: 'Drag and send a message to see how routing works!',
  octoQuizSpeech: 'Amazing! You got it right! 🌟',
  octoSummarySpeech: 'Great Job! You have completed this lesson! 🎓',

  // 1. CONCEPT LEARNING PAGE
  concept: {
    overview: {
      heading: 'What is Network Layer?',
      body: 'The Network Layer is the third layer in the OSI model. It is responsible for logical addressing, routing, and forwarding data packets from source to destination across multiple networks.',
      sourceLabel: 'Source (Host)',
      destinationLabel: 'Destination (Host)',
      layerLabel: 'Network Layer (Routing & Forwarding)',
      takeaways: [
        'Provides logical addressing (IP addressing) for global host identification',
        'Determines the best path for data using shortest-path routing algorithms',
        'Handles packet forwarding across heterogeneous networks and topologies',
        'Deals with core challenges: routing loops, packet fragmentation, congestion, and QoS'
      ]
    },
    keyConcepts: {
      heading: 'Core Network Layer Mechanisms',
      points: [
        {
          title: 'Host-to-Host Delivery',
          description: 'Unlike Data Link Layer (hop-to-hop between adjacent network interfaces), Layer 3 delivers packets end-to-end between any two devices across the entire globe.',
          badge: 'Layer 3'
        },
        {
          title: 'Store-and-Forward Switching',
          description: 'Intermediate routers receive the full packet, verify its integrity via checksum, parse the destination IP, and queue it for transmission onto the optimal outgoing link.',
          badge: 'Routers'
        },
        {
          title: 'Connectionless (Datagram) vs Virtual Circuits',
          description: 'The Internet relies on connectionless datagrams where each packet is routed independently without prior setup. Virtual circuits (like ATM/X.25) establish a pre-defined path before data transfer.',
          badge: 'Architecture'
        }
      ]
    },
    analogy: {
      heading: 'The Global Postal Logistics Analogy',
      story: 'Imagine writing a physical postal letter from Chennai to a friend in Mumbai. You do not lay a private copper wire between the two homes. Instead, you write a standardized Postal ZIP Code (IP Address). Local postal vans (Data Link frames) carry the letter to the city hub (Default Gateway). Regional sorting centers (Core Routers) inspect the zip code and choose the fastest highway or air route. If a storm closes one highway, sorting centers dynamically redirect your letter through another city.',
      comparison: [
        { realWorld: 'Postal Street Address & Zip Code', networking: 'IP Address (Logical Addressing)' },
        { realWorld: 'Local postal courier / delivery van', networking: 'Ethernet Frame / Wi-Fi (Data Link Layer)' },
        { realWorld: 'Regional sorting hubs choosing routes', networking: 'Intermediate IP Routers & Routing Tables' },
        { realWorld: 'Mail carrier delivering parcel to your door', networking: 'Final Hop MAC Resolution (ARP)' }
      ]
    },
    examples: {
      heading: 'Real-World Network Scenarios',
      items: [
        {
          title: 'Web Browsing to Google / YouTube',
          scenario: 'Your laptop sends an HTTP GET request to a Google CDN server located 800 miles away.',
          howItWorks: 'Your Wi-Fi network hands the packet to your home router. The Network Layer encapsulates it in an IPv4/IPv6 packet with your public IP as Source and Google’s IP as Destination. 12 intermediate ISP routers forward it seamlessly.'
        },
        {
          title: 'Bypassing Fiber Cable Cut',
          scenario: 'An undersea submarine cable between Chennai and Singapore is severed by an anchor.',
          howItWorks: 'BGP and OSPF routing protocols automatically detect the link failure within seconds and recalculate alternate paths through Mumbai and the Middle East without terminating active connections.'
        }
      ]
    },
    quickNotes: [
      'Layer 3 works with packets (PDU), while Layer 2 works with frames.',
      'Key design issues: Routing, Addressing, Packet Fragmentation (MTU), Congestion Control.',
      'Connectionless service requires no setup handshake and is fault-tolerant.',
      'Default Gateway is the first router your device contacts to leave the local subnet.'
    ]
  },

  // 2. INTERACTIVE LEARNING PAGE (Simulation Chennai -> Mumbai)
  simulation: {
    title: 'See How the Network Layer Works!',
    subtitle: 'Send a message from one city to another and see how the network layer finds the best route across multiple networks.',
    octoSpeech: 'Drag and send a message to see how routing works!',
    sourceCity: 'Chennai',
    destinationCity: 'Mumbai',
    sourceIp: '192.168.1.10',
    destinationIp: '172.16.0.42',
    nodes: [
      { id: 'src', label: 'Source (Chennai)', sublabel: '192.168.1.10', type: 'host', x: 8, y: 55 },
      { id: 'r1', label: 'Router R1 (Gateway)', sublabel: '10.0.1.1', type: 'gateway', x: 28, y: 35 },
      { id: 'r2', label: 'Router R2 (Core Hub)', sublabel: '10.0.2.1', type: 'router', x: 48, y: 65 },
      { id: 'r3', label: 'Router R3 (Alternate)', sublabel: '10.0.3.1', type: 'router', x: 50, y: 20 },
      { id: 'r4', label: 'Router R4 (Metro)', sublabel: '10.0.4.1', type: 'router', x: 74, y: 40 },
      { id: 'dst', label: 'Destination (Mumbai)', sublabel: '172.16.0.42', type: 'host', x: 92, y: 55 }
    ],
    links: [
      { from: 'src', to: 'r1', label: '1 ms' },
      { from: 'r1', to: 'r2', label: '14 ms' },
      { from: 'r1', to: 'r3', label: '22 ms' },
      { from: 'r2', to: 'r4', label: '18 ms' },
      { from: 'r3', to: 'r4', label: '26 ms' },
      { from: 'r4', to: 'dst', label: '2 ms' }
    ],
    bestPath: ['src', 'r1', 'r2', 'r4', 'dst'],
    hops: 3,
    totalTimeMs: 48,
    visualExplanationSteps: [
      {
        step: 1,
        title: 'Packet Creation & Encapsulation',
        description: 'Host in Chennai creates an IP packet with destination address 172.16.0.42 and delivers it to default gateway R1.'
      },
      {
        step: 2,
        title: 'Route Lookup & Forwarding',
        description: 'R1 queries its routing table. Path through R2 has lower latency (14ms) than R3 (22ms), so packet is routed to R2.'
      },
      {
        step: 3,
        title: 'Transit Core Routing',
        description: 'R2 reads the destination IP header, decrements the TTL (Time To Live), and pushes the packet to R4.'
      },
      {
        step: 4,
        title: 'Final Delivery to Destination',
        description: 'R4 receives the datagram, resolves destination host via ARP, and completes delivery in Mumbai with 0 packet loss.'
      }
    ],
    explorePrompts: [
      'Try typing custom messages and adjust the transmission speed (1x, 2x, 4x).',
      'Notice how the Time To Live (TTL) decreases by 1 at every router hop to prevent eternal loops.',
      'Check the Route Information card to verify total latency and hop count.'
    ]
  },

  // 3. QUIZ PAGE (Carefully curated questions matching Image 1)
  quiz: {
    title: 'Practice Quiz',
    subtitle: 'Test your understanding with carefully curated questions.',
    questions: [
      {
        id: 'q1',
        question: 'Why does a letter sent across the world reach your doorstep, while Ethernet only talks to adjacent cables?',
        options: [
          { id: 'A', text: 'Because the network layer provides logical addressing and routing across multiple networks.' },
          { id: 'B', text: 'Because physical layer is faster than network layer.' },
          { id: 'C', text: 'Because Ethernet uses IP addressing.' },
          { id: 'D', text: 'Because the transport layer handles routing.' }
        ],
        correctOptionId: 'A',
        explanation: 'The network layer provides logical addressing (IP) and routing algorithms, allowing data packets to travel across multiple interconnected networks to reach any global destination.',
        hint: 'Think of how ZIP codes enable global delivery while Ethernet MAC addresses only work on a single wire.'
      },
      {
        id: 'q2',
        question: 'In the Internet datagram model, how do intermediate routers treat individual packets of the same message?',
        options: [
          { id: 'A', text: 'They reserve a dedicated circuit before any packet can be forwarded.' },
          { id: 'B', text: 'Each packet is treated independently and may take completely different paths.' },
          { id: 'C', text: 'All packets are buffered at the first router until the whole message arrives.' },
          { id: 'D', text: 'Packets are dropped if they do not arrive strictly in order.' }
        ],
        correctOptionId: 'B',
        explanation: 'In connectionless datagram switching, each packet contains full destination info and is routed independently, meaning packets can take diverse paths based on live link traffic.',
        hint: 'Connectionless means no pre-fixed telephone circuit is required.'
      },
      {
        id: 'q3',
        question: 'What happens to an IP packet if its Time To Live (TTL) counter reaches 0 before reaching the destination?',
        options: [
          { id: 'A', text: 'It is converted into a broadcast packet.' },
          { id: 'B', text: 'It is stored permanently in router flash memory.' },
          { id: 'C', text: 'The router discards it and sends an ICMP Time Exceeded message to the sender.' },
          { id: 'D', text: 'The router speeds up the transmission clock to 4x.' }
        ],
        correctOptionId: 'C',
        explanation: 'The TTL field is decremented at every router hop. When it reaches 0, the packet is safely dropped and an ICMP Time Exceeded notification is returned, preventing endless routing loops.',
        hint: 'TTL protects the Internet from zombie packets looping forever.'
      },
      {
        id: 'q4',
        question: 'Which of the following is NOT a primary responsibility of the Network Layer (Layer 3)?',
        options: [
          { id: 'A', text: 'Host-to-host logical addressing' },
          { id: 'B', text: 'Dynamic path determination and routing' },
          { id: 'C', text: 'Modulating electromagnetic signals onto copper physical pins' },
          { id: 'D', text: 'Handling packet fragmentation when MTU is exceeded' }
        ],
        correctOptionId: 'C',
        explanation: 'Modulating bits and voltages onto physical pins is the duty of Layer 1 (Physical Layer), not Layer 3.',
        hint: 'Physical signaling happens at Layer 1.'
      },
      {
        id: 'q5',
        question: 'What is the key advantage of store-and-forward packet switching over traditional circuit switching?',
        options: [
          { id: 'A', text: 'More efficient bandwidth utilization through statistical multiplexing' },
          { id: 'B', text: 'Zero latency guaranteed under all loads' },
          { id: 'C', text: 'Requires no router memory or buffers' },
          { id: 'D', text: 'No IP addresses are required' }
        ],
        correctOptionId: 'A',
        explanation: 'Packet switching uses statistical multiplexing to dynamically share link capacity among thousands of simultaneous active users, maximizing bandwidth utilization.',
        hint: 'Think of how packet switching shares links on demand rather than reserving idle wires.'
      }
    ],
    quickTips: [
      'Read the question carefully before picking.',
      'Eliminate obviously wrong options first.',
      'Think with real-world examples (postal sorting, road traffic).'
    ]
  },

  // 4. SUMMARY PAGE
  summary: {
    keyConcepts: [
      'Role of Network Layer in OSI 7-layer model',
      'Host-to-Host logical addressing (IPv4/IPv6)',
      'Dynamic routing and store-and-forward forwarding',
      'Key design issues: Congestion, MTU, Reliability'
    ],
    importantPoints: [
      'Connects multiple heterogeneous networks seamlessly',
      'Uses hierarchical IP addressing to scale globally',
      'Finds best path for data using routing algorithms',
      'Handles congestion through active queue management'
    ],
    realWorldAnalogy: 'Like a global postal logistics system that finds the best flight and truck routes for your parcel across different countries and sorting hubs.',
    commonUses: [
      'Global Internet communication',
      'Low-latency video streaming (YouTube / Netflix)',
      'Real-time multiplayer online gaming',
      'Enterprise multi-region cloud services (AWS / GCP / Azure)'
    ],
    mindMapCenter: 'Network Layer',
    mindMapBranches: [
      { id: 'b1', title: 'Logical Addressing (IP Address)', color: '#3157D5' },
      { id: 'b2', title: 'Routing & Forwarding', color: '#10B981' },
      { id: 'b3', title: 'Connectionless Service (Datagram)', color: '#8B5CF6' },
      { id: 'b4', title: 'Inter-network Communication', color: '#F59E0B' },
      { id: 'b5', title: 'Key Design Issues (MTU, Routing)', color: '#EC4899' },
      { id: 'b6', title: 'Handles Congestion', color: '#06B6D4' }
    ]
  },

  nextLessonId: 'u3_m02',
  nextLessonTitle: 'Routing Algorithms (Distance Vector & Link State)'
};
