import { LevelDefinition } from './types';
import { level1Data } from './level-1';
import { level2Data } from './level-2';
import syllabusData from '../data/syllabusUnits345.json';

// Static registry of fully customized modular levels
const customLevels: Record<string, LevelDefinition> = {
  'level-1': level1Data,
  'u3_m01': level1Data,
  'level-2': level2Data,
  'u3_m02': level2Data,
};

// Standard helper to generate structured level definition for any level 1 to 21
export function getLevelDefinition(identifier: string | number): LevelDefinition {
  let slug = '';
  if (typeof identifier === 'number') {
    slug = `level-${identifier}`;
  } else {
    slug = identifier.toLowerCase().trim();
  }

  // Check if we have an explicit custom level module
  if (customLevels[slug]) {
    return customLevels[slug];
  }

  // Extract level number
  const numMatch = slug.match(/level-(\d+)/) || slug.match(/m0?(\d+)/);
  const levelNum = numMatch ? parseInt(numMatch[1], 10) : 1;

  // Derive unit number
  let unitNum = 3;
  let unitTitle = 'Unit 3: Network Layer';
  let totalLessonsInUnit = 8;
  let lessonInUnit = levelNum;

  if (levelNum > 8 && levelNum <= 14) {
    unitNum = 4;
    unitTitle = 'Unit 4: Transport Layer';
    totalLessonsInUnit = 6;
    lessonInUnit = levelNum - 8;
  } else if (levelNum > 14) {
    unitNum = 5;
    unitTitle = 'Unit 5: Application Layer';
    totalLessonsInUnit = 7;
    lessonInUnit = levelNum - 14;
  }

  const topicName = `Lesson ${levelNum}: Advanced Networking Concepts`;

  return {
    id: levelNum,
    slug: `level-${levelNum}`,
    lessonId: `u${unitNum}_m0${lessonInUnit}`,
    unitNumber: unitNum,
    unitTitle,
    lessonNumber: lessonInUnit,
    totalLessonsInUnit,
    title: topicName,
    subtitle: `Explore core principles, architecture, interactive routing, and protocols for ${unitTitle}.`,
    estimatedDuration: '5 min',
    mascotQuote: `Ready to explore ${topicName}!`,
    mascotTip: 'Interact with the nodes to understand the packet transmission path.',
    xpReward: 100 + levelNum * 5,
    prevLevelSlug: levelNum > 1 ? `level-${levelNum - 1}` : undefined,
    nextLevelSlug: levelNum < 21 ? `level-${levelNum + 1}` : undefined,

    concept: {
      tabs: [
        {
          id: 'overview',
          label: 'Overview',
          title: `Introduction to ${topicName}`,
          content: [
            `This lesson covers foundational protocols and mechanisms in ${unitTitle}.`,
            'Gain a deep understanding of host-to-host and process-to-process communication, packet formats, and control algorithms.',
            'Follow the interactive modules to analyze packet flows and test your understanding.'
          ],
          keyTakeaways: [
            'Fundamental architecture of the protocol layer',
            'Packet framing, header fields, and addressing conventions',
            'Performance metrics: Throughput, Latency, and Jitter'
          ],
          diagram: {
            type: 'architecture',
            source: 'Client / Source Host',
            layer: unitTitle,
            destination: 'Server / Remote Host',
            caption: 'Layered communication pipeline'
          }
        },
        {
          id: 'key-concepts',
          label: 'Key Concepts',
          title: 'Core Mechanisms',
          content: [
            'Protocol specifications and standard RFC documentation.',
            'State machine transitions, timers, and error handling.',
            'Security and performance trade-offs in modern network stacks.'
          ],
          keyTakeaways: [
            'RFC standards define wire formats',
            'State machines handle connection lifecycles',
            'Error control ensures data integrity'
          ]
        },
        {
          id: 'analogy',
          label: 'Real World Analogy',
          title: 'Everyday Analogies',
          content: [
            'Consider how logistics and courier networks handle packages with barcodes, checkpoints, and tracking numbers.',
            'Intermediate transit stations ensure packages follow optimal routes even when individual transport lanes face delays.'
          ],
          keyTakeaways: [
            'Tracking Number = Packet Header Identifier',
            'Hub Inspection = Checksum & Routing Validation'
          ]
        },
        {
          id: 'examples',
          label: 'Examples',
          title: 'Practical Implementations',
          content: [
            'Wireshark packet captures of live network communications.',
            'Standard configuration examples on Cisco and Linux networking utilities.',
            'Debugging common connectivity and latency bottlenecks.'
          ],
          keyTakeaways: [
            'Wireshark reveals header fields in real-time',
            'traceroute and ping verify path reachability'
          ]
        },
        {
          id: 'notes',
          label: 'Quick Notes',
          title: 'Revision Cheat Sheet',
          content: [
            'Key acronyms and port allocations.',
            'Header size overhead and bandwidth calculations.',
            'Top interview and exam questions.'
          ],
          keyTakeaways: [
            'Memorize standard port numbers and header sizes',
            'Review timer and retransmission formulas'
          ]
        }
      ]
    },

    interactive: {
      title: `Interactive Simulation for ${topicName}`,
      description: 'Send test packets across the topology to visualize protocol handshakes and routing decisions.',
      mascotTip: 'Hit the send button to watch packets traverse intermediate nodes!',
      sourceCity: 'Node A',
      destinationCity: 'Node B',
      defaultMessage: 'Data Packet #1',
      path: ['Node A', 'Transit Router', 'Node B'],
      hops: 2,
      totalTimeMs: 34,
      explanation: 'Packet was successfully inspected, routed, and acknowledged across the simulated link.',
      routers: [
        { id: 'src', name: 'Node A', x: 15, y: 50, label: 'Origin A' },
        { id: 'r1', name: 'Gateway 1', x: 50, y: 40, label: 'Router GW1', active: true },
        { id: 'dst', name: 'Node B', x: 85, y: 50, label: 'Target B' }
      ]
    },

    quiz: {
      title: 'Practice Quiz',
      subtitle: 'Test your understanding with conceptual questions.',
      quickTips: [
        'Review the key concepts before attempting',
        'Check packet headers and layer responsibilities'
      ],
      questions: [
        {
          id: 1,
          question: `What is the primary responsibility of protocols operating within ${unitTitle}?`,
          options: [
            { id: 'A', text: 'Provide defined services and data delivery between communicating peers.', isCorrect: true },
            { id: 'B', text: 'Physically manufacture the fiber optic cables.', isCorrect: false },
            { id: 'C', text: 'Power down the computer when idle.', isCorrect: false },
            { id: 'D', text: 'Format text into bold and italics.', isCorrect: false }
          ],
          explanation: 'Each protocol layer encapsulates specific responsibilities to enable transparent communication between peer entities.'
        },
        {
          id: 2,
          question: 'Which metric measures the time elapsed for a data packet to travel from sender to receiver and back?',
          options: [
            { id: 'A', text: 'Round Trip Time (RTT)', isCorrect: true },
            { id: 'B', text: 'Bandwidth', isCorrect: false },
            { id: 'C', text: 'MTU', isCorrect: false },
            { id: 'D', text: 'MAC Address', isCorrect: false }
          ],
          explanation: 'Round Trip Time (RTT) is the duration from sending a request until the acknowledgement returns.'
        }
      ]
    },

    summary: {
      keyConcepts: [
        'Layered protocol stack architecture',
        'Header encapsulation and decapsulation',
        'State machine and error detection'
      ],
      importantPoints: [
        'Ensures predictable end-to-end communication',
        'Standardized via IETF RFC documentation',
        'Built for interoperability across diverse operating systems'
      ],
      realWorldAnalogy: 'Like international standards for postal envelopes ensuring mail travels across borders without friction.',
      commonUses: [
        'Web browsing (HTTP/HTTPS)',
        'Enterprise network backbones',
        'Distributed cloud microservices'
      ],
      mindMap: {
        center: topicName,
        nodes: [
          { id: 'c1', label: 'Protocol Headers & Framing', category: 'primary' },
          { id: 'c2', label: 'Error & Flow Control', category: 'secondary' },
          { id: 'c3', label: 'Layer Encapsulation', category: 'accent' },
          { id: 'c4', label: 'Real-world Deployment', category: 'secondary' }
        ],
        edges: [
          { from: topicName, to: 'c1' },
          { from: topicName, to: 'c2' },
          { from: topicName, to: 'c3' },
          { from: topicName, to: 'c4' }
        ]
      }
    }
  };
}

export function getAllLevels(): LevelDefinition[] {
  const levels: LevelDefinition[] = [];
  for (let i = 1; i <= 21; i++) {
    levels.push(getLevelDefinition(i));
  }
  return levels;
}
