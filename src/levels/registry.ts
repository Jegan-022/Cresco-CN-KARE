import { LevelDefinition } from './types';
import { level1Data } from './level-1';
import { level2Data } from './level-2';
import { level10Data } from './level-10';
import { level21Data } from './level-21';
import { LEVEL_ROUTES } from '../utils/levelRouting';
import { LessonDefinition, LessonPhase } from '../components/lesson/lessonTypes';
import syllabusData from '../data/syllabusUnits345.json';

// Static registry of fully customized modular levels
const customLevels: Record<string, LevelDefinition> = {
  'level1': level1Data,
  'level-1': level1Data,
  'u3_m01': level1Data,
  'level2': level2Data,
  'level-2': level2Data,
  'u3_m02': level2Data,
  'level10': level10Data,
  'level-10': level10Data,
  'level21': level21Data,
  'level-21': level21Data,
  'u5_m08': level21Data,
};

/**
 * Safe finder for level definitions that returns null for non-level identifiers
 */
export function findLevelDefinition(identifier: string | number): LevelDefinition | null {
  if (typeof identifier === 'number') {
    if (identifier >= 1 && identifier <= 21) {
      return getLevelDefinition(identifier);
    }
    return null;
  }
  const slug = identifier.toLowerCase().trim();
  if (customLevels[slug]) {
    return customLevels[slug];
  }
  const levelMatch = slug.match(/^level-?(\d+)$/i);
  if (levelMatch) {
    const lvl = parseInt(levelMatch[1], 10);
    if (lvl >= 1 && lvl <= 21) {
      return getLevelDefinition(lvl);
    }
  }
  return null;
}

/**
 * Standard helper to retrieve or generate structured level definition for any level 1 to 21
 */
export function getLevelDefinition(identifier: string | number): LevelDefinition {
  let slug = '';
  if (typeof identifier === 'number') {
    slug = `level${identifier}`;
  } else {
    slug = identifier.toLowerCase().trim();
  }

  // Check if we have an explicit custom level module
  if (customLevels[slug]) {
    return customLevels[slug];
  }

  // Extract level number
  const numMatch = slug.match(/level-?(\d+)/) || slug.match(/m0?(\d+)/);
  const levelNum = numMatch ? parseInt(numMatch[1], 10) : 1;

  // Derive unit number and metadata from LEVEL_ROUTES if available
  const route = LEVEL_ROUTES[levelNum];

  let unitNum = 3;
  let unitTitle = 'Unit 3: Network Layer';
  let totalLessonsInUnit = 8;
  let lessonInUnit = levelNum;

  if (levelNum > 8 && levelNum <= 15) {
    unitNum = 4;
    unitTitle = 'Unit 4: Transport Layer';
    totalLessonsInUnit = 7;
    lessonInUnit = levelNum - 8;
  } else if (levelNum > 15) {
    unitNum = 5;
    unitTitle = 'Unit 5: Application Layer';
    totalLessonsInUnit = 6;
    lessonInUnit = levelNum - 15;
  }

  const topicName = route ? route.title : `Level ${levelNum}: Advanced Networking Concepts`;
  const lessonId = route ? route.lessonId : `u${unitNum}_m0${lessonInUnit}`;

  return {
    id: levelNum,
    slug: `level-${levelNum}`,
    lessonId,
    unitNumber: unitNum,
    unitTitle,
    lessonNumber: lessonInUnit,
    totalLessonsInUnit,
    title: topicName,
    subtitle: `Explore core principles, architecture, interactive routing, and protocols for ${topicName}.`,
    description: `Comprehensive study of ${topicName} in ${unitTitle}.`,
    objectives: [
      `Understand foundational protocols and architecture of ${topicName}`,
      `Analyze packet headers and state synchronization rules`,
      `Evaluate network efficiency and performance trade-offs`,
      `Diagnose and troubleshoot common protocol misconfigurations`
    ],
    estimatedDuration: '5 min',
    mascotQuote: `Ready to explore ${topicName}!`,
    mascotTip: 'Interact with the nodes to understand the packet transmission path.',
    xpReward: 100 + levelNum * 5,
    prevLevelSlug: levelNum > 1 ? `level-${levelNum - 1}` : undefined,
    nextLevelSlug: levelNum < 21 ? `level-${levelNum + 1}` : undefined,
    completionState: {
      isCompleted: false,
      minScore: 70,
    },
    animatedLearning: {
      diagramType: unitNum === 4 ? 'tcp-handshake' : unitNum === 5 ? 'dns-pipeline' : 'routing-topology',
      animationTopicId: `level-${levelNum}-sim`,
      description: `Visualizing packet flow and protocol mechanics for ${topicName}`
    },

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
          question: `What is the primary role of ${topicName} in computer networking?`,
          options: [
            { id: 'A', text: `Facilitates reliable communication and packet exchange according to RFC specifications.`, isCorrect: true },
            { id: 'B', text: 'Modulates electrical radio signals across physical fiber cables exclusively.', isCorrect: false },
            { id: 'C', text: 'Renders graphic CSS styles in the client web browser.', isCorrect: false },
            { id: 'D', text: 'Disables all firewall security rules on the router.', isCorrect: false }
          ],
          explanation: `${topicName} provides core network functionality to ensure deterministic, scalable data delivery across the protocol stack.`
        },
        {
          id: 2,
          question: 'How do network layers ensure isolation between different protocol concerns?',
          options: [
            { id: 'A', text: 'Through encapsulation, where each layer adds its own header without altering upper-layer payload.', isCorrect: true },
            { id: 'B', text: 'By combining all headers into a single giant flat array.', isCorrect: false },
            { id: 'C', text: 'By encrypting all cables with the same password.', isCorrect: false },
            { id: 'D', text: 'Layers do not communicate at all.', isCorrect: false }
          ],
          explanation: 'Encapsulation allows each layer to add and parse its own control headers independently, enabling modular development.'
        }
      ]
    },

    summary: {
      keyConcepts: [
        `Role of ${topicName}`,
        'Protocol Encapsulation & Header Semantics',
        'Performance & Reliability Guarantees',
        'Network Layer State Transitions'
      ],
      importantPoints: [
        'Standardized via IETF RFC specifications',
        'Interoperable across heterogeneous client operating systems',
        'Provides deterministic metrics for latency and bandwidth utilization'
      ],
      realWorldAnalogy: `Like a well-coordinated transit system: ${topicName} ensures cargo reaches the correct terminal safely and reliably.`,
      commonUses: [
        'Enterprise LAN & WAN infrastructure',
        'Cloud microservice RPC communication',
        'Global web transactions'
      ],
      mindMap: {
        center: topicName,
        nodes: [
          { id: 'n1', label: 'Architecture & RFC Standards', category: 'primary' },
          { id: 'n2', label: 'Header Fields & Packet Structure', category: 'primary' },
          { id: 'n3', label: 'State Transitions & Timers', category: 'secondary' },
          { id: 'n4', label: 'Performance & Latency Optimization', category: 'accent' }
        ],
        edges: [
          { from: topicName, to: 'n1' },
          { from: topicName, to: 'n2' },
          { from: topicName, to: 'n3' },
          { from: topicName, to: 'n4' }
        ]
      }
    }
  };
}

/**
 * Adapter converting LevelDefinition into the existing LessonDefinition for GamifiedLessonView
 */
export function levelConfigToLessonDefinition(level: LevelDefinition): LessonDefinition {
  if (level.phases && level.phases.length > 0) {
    return {
      id: level.lessonId || `level-${level.id}`,
      unitNumber: (level.unitNumber || 3) as 3 | 4 | 5,
      unitName: level.unitTitle || `UNIT ${level.unitNumber || 3}`,
      lessonNumber: level.lessonNumber || level.id,
      totalLessonsInUnit: level.totalLessonsInUnit || 8,
      topicTitle: level.title,
      subtitle: level.subtitle || level.description || '',
      estimatedDuration: level.estimatedDuration || '5 min',
      masteryRating: 85,
      phases: level.phases,
      objectives: level.objectives,
      nextLessonId: level.nextLevelSlug,
      nextLessonTitle: 'Next Level',
    };
  }

  const overviewTab = level.concept.tabs.find(t => t.id === 'overview') || level.concept.tabs[0];
  const analogyTab = level.concept.tabs.find(t => t.id === 'analogy') || level.concept.tabs[1] || overviewTab;

  const q1 = level.quiz.questions[0] || {
    id: 1,
    question: `What is the core function of ${level.title}?`,
    options: [
      { id: 'A', text: 'Provides fundamental network and transport guarantees', isCorrect: true },
      { id: 'B', text: 'Physical layer modulation only', isCorrect: false },
    ],
    explanation: `${level.title} defines critical protocol behaviors across the network stack.`,
  };

  const q2 = level.quiz.questions[1] || q1;

  const phases: LessonPhase[] = [
    // 1. Intro
    {
      id: `${level.slug}-intro`,
      type: 'intro',
      title: level.title,
      subtitle: level.subtitle || level.description,
      byteQuote: level.mascotQuote || `Welcome to ${level.title}! Let's master these networking principles.`,
      bytePose: 'explaining',
    },
    // 2. Explain
    {
      id: `${level.slug}-explain`,
      type: 'explain',
      title: overviewTab?.title || 'Core Concepts & Theory',
      subtitle: level.subtitle || 'Foundational networking mechanics',
      byteQuote: level.mascotTip || 'Understand the core invariants before diving into packet simulation.',
      bytePose: 'thinking',
      conceptHeading: level.concept.heading || overviewTab?.title?.toUpperCase() || 'CORE CONCEPTS',
      conceptBody: level.concept.body || (overviewTab?.content ? overviewTab.content.join(' ') : 'Master the architectural model.'),
      highlightWords: level.concept.highlightWords || (overviewTab?.keyTakeaways || []).map(t => {
        const parts = t.split(':');
        return {
          word: parts[0]?.trim() || 'Core Rule',
          explanation: parts[1]?.trim() || t,
        };
      }),
    },
    // 3. Visualize
    {
      id: `${level.slug}-visualize`,
      type: 'visualize',
      title: level.interactive.title || 'Interactive Network Simulation',
      subtitle: level.interactive.description || 'Observe packet flow across simulated topologies.',
      byteQuote: level.mascotTip || 'Inspect the routing path and watch packets traverse intermediate hops.',
      bytePose: 'boss-mode',
      diagramType: (level.animatedLearning?.diagramType as any) || (level.unitNumber === 4 ? 'tcp-handshake' : level.unitNumber === 5 ? 'dns-pipeline' : 'routing-topology'),
    },
    // 4. Drill / Knowledge check
    {
      id: `${level.slug}-drill`,
      type: 'question',
      title: 'Knowledge Check Question',
      subtitle: 'Verify your grasp of the core concept.',
      byteQuote: 'Read the question carefully and pick the most accurate answer!',
      bytePose: 'thinking',
      questionText: q1.question,
      mcqOptions: q1.options.map(o => ({
        id: o.id,
        text: o.text,
        isCorrect: o.isCorrect,
      })),
      explanation: q1.explanation,
      xpReward: 30,
    },
    // 5. Scenario challenge
    {
      id: `${level.slug}-scenario`,
      type: 'scenario',
      title: 'Real-World Scenario Challenge',
      subtitle: analogyTab?.title || 'Apply theory to network operations',
      byteQuote: 'Think through real-world deployment challenges!',
      bytePose: 'thinking',
      questionText: q2.question,
      mcqOptions: q2.options.map(o => ({
        id: o.id,
        text: o.text,
        isCorrect: o.isCorrect,
      })),
      explanation: q2.explanation,
      xpReward: 35,
    },
    // 6. Summary / Completed
    {
      id: `${level.slug}-summary`,
      type: 'completed',
      title: 'Module Summary & Key Review',
      subtitle: level.summary?.realWorldAnalogy || 'Review the core takeaways before proceeding to the next level.',
      byteQuote: `Outstanding work! You have mastered ${level.title}!`,
      bytePose: 'celebrating',
    }
  ];

  return {
    id: level.lessonId || `level-${level.id}`,
    unitNumber: (level.unitNumber || 3) as 3 | 4 | 5,
    unitName: level.unitTitle || `UNIT ${level.unitNumber || 3}`,
    lessonNumber: level.lessonNumber || level.id,
    totalLessonsInUnit: level.totalLessonsInUnit || 8,
    topicTitle: level.title,
    subtitle: level.subtitle || level.description || '',
    estimatedDuration: level.estimatedDuration || '5 min',
    masteryRating: 85,
    phases,
    objectives: level.objectives,
    nextLessonId: level.nextLevelSlug,
    nextLessonTitle: 'Next Level',
  };
}
