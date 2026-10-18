import { LevelDefinition } from '../types';

export const level2Data: LevelDefinition = {
  id: 2,
  slug: 'level-2',
  lessonId: 'u3_m02',
  unitNumber: 3,
  unitTitle: 'Unit 3: Network Layer',
  lessonNumber: 2,
  totalLessonsInUnit: 8,
  title: 'Routing Algorithms — Shortest Path & Link State',
  subtitle: 'Master graph representation of networks, Dijkstra shortest path, Distance Vector (Bellman-Ford), and Link State algorithms.',
  description: 'Shortest path routing, graph traversal, Distance Vector vs Link State principles, and network metrics.',
  objectives: [
    'Model network topologies mathematically as weighted graphs G=(V,E)',
    'Compute least-cost paths using Dijkstra algorithm',
    'Examine Distance Vector routing and the count-to-infinity problem',
    'Understand Link State flooding and OSPF area convergence'
  ],
  estimatedDuration: '5–6 min',
  mascotQuote: 'Let us see how routers find the fastest path through complex networks!',
  mascotTip: 'Watch how distance vectors converge across neighboring nodes!',
  xpReward: 120,
  prevLevelSlug: 'level-1',
  nextLevelSlug: 'level-3',
  completionState: {
    isCompleted: false,
    minScore: 70,
  },
  animatedLearning: {
    diagramType: 'routing-topology',
    animationTopicId: 'dijkstra-convergence',
    description: 'Dynamic graph traversal showing shortest path discovery from source to destination.'
  },

  concept: {
    tabs: [
      {
        id: 'overview',
        label: 'Overview',
        title: 'What is a Routing Algorithm?',
        content: [
          'A routing algorithm is the logic within network routers that determines the optimal path for packets from a source host to a destination host across a complex mesh of intermediate networks.',
          'Networks are mathematically modeled as weighted graphs G = (V, E), where vertices (V) represent routers and edges (E) represent physical communication links with associated costs (propagation delay, bandwidth, or hop count).',
          'Two major classes of interior gateway routing algorithms dominate computer networking: Distance Vector Routing (Bellman-Ford) and Link State Routing (Dijkstra).'
        ],
        keyTakeaways: [
          'Graph G=(V,E) models routers as vertices and links as edges',
          'Link costs can be bandwidth, financial cost, delay, or hop count',
          'Primary goal: Find the least-cost path without routing loops'
        ],
        diagram: {
          type: 'architecture',
          source: 'Router Node A',
          layer: 'Shortest Path Graph Traversal (Dijkstra / Bellman-Ford)',
          destination: 'Router Node F',
          caption: 'Computing Least Cost Tree from Node A to all network destinations'
        }
      },
      {
        id: 'key-concepts',
        label: 'Key Concepts',
        title: 'Link State vs Distance Vector',
        content: [
          'Distance Vector (DV): Each router shares its entire distance table only with its immediate physical neighbors periodically (e.g. RIP). Known as "Tell your neighbors about the whole world".',
          'Link State (LS): Each router floods the state of its local links to every router in the entire network (e.g. OSPF). Every node builds an identical topology map and independently executes Dijkstra’s algorithm. Known as "Tell the whole world about your neighbors".',
          'Count-to-Infinity Problem: A classic weakness in Distance Vector where link failures propagate slowly; mitigated using Split Horizon and Poison Reverse.'
        ],
        keyTakeaways: [
          'Link State floods locally-known links globally (OSPF)',
          'Distance Vector shares global knowledge locally (RIP)',
          'Link State converges much faster and avoids count-to-infinity'
        ]
      },
      {
        id: 'analogy',
        label: 'Real World Analogy',
        title: 'GPS Navigation vs Word of Mouth',
        content: [
          'Link State is like Google Maps GPS navigation: every phone downloads the complete global city roadmap and calculates the shortest driving path in memory.',
          'Distance Vector is like driving without a map and asking gas station attendants along the highway: "Which direction to City X and how many miles?"'
        ],
        keyTakeaways: [
          'Link State = Global GPS Satellite Map',
          'Distance Vector = Asking gas attendants for directions'
        ]
      },
      {
        id: 'examples',
        label: 'Examples',
        title: 'Industry Protocols in Production',
        content: [
          'OSPF (Open Shortest Path First): The ubiquitous enterprise interior gateway protocol using Link State routing.',
          'IS-IS (Intermediate System to Intermediate System): High-speed backbone carrier Link State protocol.',
          'BGP (Border Gateway Protocol): The Path Vector protocol that runs the global backbone of the Internet between Autonomous Systems.'
        ],
        keyTakeaways: [
          'OSPF powers corporate and university campus networks',
          'BGP prevents loops using AS Path lists'
        ]
      },
      {
        id: 'notes',
        label: 'Quick Notes',
        title: 'Formulas & Complexity Cheat Sheet',
        content: [
          'Dijkstra Time Complexity: O(|V|^2) without min-heap, O((|V| + |E|) log |V|) with min-heap priority queue.',
          'Bellman-Ford Formula: D_x(y) = min_v { c(x,v) + D_v(y) } for all neighbor nodes v.',
          'Convergence: Time required for all routers to reach unanimous agreement on topology.'
        ],
        keyTakeaways: [
          'Dijkstra computes Single Source Shortest Path',
          'Bellman-Ford equation powers Distance Vector updates'
        ]
      }
    ]
  },

  interactive: {
    title: 'Simulate Shortest Path Traversal!',
    description: 'Compare route costs between multiple paths and see how Dijkstra algorithm chooses the optimal branch.',
    mascotTip: 'Switch link states and watch the route recalculate in real-time!',
    sourceCity: 'Host Alpha',
    destinationCity: 'Host Omega',
    defaultMessage: 'Routing Packet #101',
    path: ['Alpha', 'R1 (Fast Fiber)', 'R3 (Core Switch)', 'Omega'],
    hops: 2,
    totalTimeMs: 22,
    explanation: 'Although Path A-R2-R4-Omega has 3 hops, its link cost is 50. Path A-R1-R3-Omega has 2 hops with link cost 12. The router selects the least-cost path.',
    routers: [
      { id: 'src', name: 'Alpha', x: 10, y: 50, label: 'Origin Alpha' },
      { id: 'r1', name: 'R1 (Fiber 10Gbps)', x: 35, y: 30, label: 'Fast Path', active: true },
      { id: 'r2', name: 'R2 (Copper 100Mbps)', x: 35, y: 70, label: 'High Congestion' },
      { id: 'r3', name: 'R3 (Core Node)', x: 65, y: 30, label: 'Core Router', active: true },
      { id: 'r4', name: 'R4 (Edge Switch)', x: 65, y: 70, label: 'Backup Switch' },
      { id: 'dst', name: 'Omega', x: 90, y: 50, label: 'Destination Omega' }
    ]
  },

  quiz: {
    title: 'Routing Algorithms Quiz',
    subtitle: 'Verify your command over Dijkstra and Bellman-Ford algorithms.',
    quickTips: [
      'Remember Dijkstra requires non-negative edge weights',
      'Split Horizon helps prevent two-node routing loops'
    ],
    questions: [
      {
        id: 1,
        question: 'Which routing protocol algorithm is characterized by "tell the whole world about your immediate neighbors"?',
        options: [
          { id: 'A', text: 'Link State Routing (Dijkstra / OSPF)', isCorrect: true },
          { id: 'B', text: 'Distance Vector Routing (Bellman-Ford / RIP)', isCorrect: false },
          { id: 'C', text: 'Flooding Algorithm', isCorrect: false },
          { id: 'D', text: 'Random Walk Routing', isCorrect: false }
        ],
        explanation: 'In Link State routing, every node disseminates link state advertisements (LSAs) containing the status of its direct links to every other router in the network.'
      },
      {
        id: 2,
        question: 'What is the primary objective of the "Split Horizon with Poison Reverse" technique in Distance Vector routing?',
        options: [
          { id: 'A', text: 'To encrypt routing updates against eavesdropping.', isCorrect: false },
          { id: 'B', text: 'To prevent two-node routing loops and mitigate the Count-to-Infinity problem.', isCorrect: true },
          { id: 'C', text: 'To increase the MTU size of Ethernet frames.', isCorrect: false },
          { id: 'D', text: 'To convert IPv4 packets into IPv6 headers.', isCorrect: false }
        ],
        explanation: 'Split Horizon states that a router should not advertise a route back out the same interface it learned it from, preventing circular false routing claims.'
      },
      {
        id: 3,
        question: 'What mathematical condition is required for Dijkstra’s algorithm to guarantee the optimal shortest path?',
        options: [
          { id: 'A', text: 'All link costs must be strictly non-negative (cost >= 0).', isCorrect: true },
          { id: 'B', text: 'The graph must be a linear tree with no branches.', isCorrect: false },
          { id: 'C', text: 'The number of vertices must be a prime number.', isCorrect: false },
          { id: 'D', text: 'All link capacities must be identical.', isCorrect: false }
        ],
        explanation: 'Dijkstra’s algorithm assumes greedy non-decreasing path costs; negative weights can violate greedy step choices and require Bellman-Ford instead.'
      }
    ]
  },

  summary: {
    keyConcepts: [
      'Graph model G=(V,E) for routing paths',
      'Dijkstra Shortest Path Single Source algorithm',
      'Link State flooding and global topology databases',
      'Distance Vector Bellman-Ford iterative equation'
    ],
    importantPoints: [
      'Link state protocols converge rapidly without loop penalties',
      'Distance Vector exchanges only require local neighbor communication',
      'Count-to-infinity solved via poisoned routes and hold-down timers'
    ],
    realWorldAnalogy: 'Like modern satellite navigation that monitors live traffic feeds versus asking locals at each crossroad.',
    commonUses: [
      'Enterprise network backbones (OSPF)',
      'Internet Service Provider transit cores (IS-IS)',
      'Autonomous system routing tables'
    ],
    mindMap: {
      center: 'Routing Algorithms',
      nodes: [
        { id: 'm1', label: 'Graph Representation G=(V,E)', category: 'primary' },
        { id: 'm2', label: 'Dijkstra (Link State)', category: 'primary' },
        { id: 'm3', label: 'Bellman-Ford (Distance Vector)', category: 'secondary' },
        { id: 'm4', label: 'Count-to-Infinity & Poison Reverse', category: 'accent' },
        { id: 'm5', label: 'Interior vs Exterior Gateways', category: 'secondary' }
      ],
      edges: [
        { from: 'Routing Algorithms', to: 'm1' },
        { from: 'Routing Algorithms', to: 'm2' },
        { from: 'Routing Algorithms', to: 'm3' },
        { from: 'Routing Algorithms', to: 'm4' },
        { from: 'Routing Algorithms', to: 'm5' }
      ]
    }
  }
};
