import { ModularLesson, LessonUnitItem } from './lessonModel';
import { lessonU3M01 } from './unit3/u3_m01_need_and_issues';
import syllabusData from '../syllabusUnits345.json';

// Explicit modular lesson files registered here
// To edit or add a new lesson file, just add it here!
const LESSON_MODULES: Record<string, ModularLesson> = {
  'u3_m01': lessonU3M01,
  'u3_m1': lessonU3M01,
  'sec-3-les-1': lessonU3M01,
};

// Unit curriculum lessons for the left sidebar
export const UNIT_LESSON_LIST: Record<string, LessonUnitItem[]> = {
  'unit_3': [
    { id: 'u3_m01', number: 1, title: 'Need and Issues' },
    { id: 'u3_m02', number: 2, title: 'Routing Algorithms' },
    { id: 'u3_m03', number: 3, title: 'Datagram Network' },
    { id: 'u3_m04', number: 4, title: 'Virtual Circuit Network' },
    { id: 'u3_m05', number: 5, title: 'Congestion Control' },
    { id: 'u3_m06', number: 6, title: 'IPv4 & IPv6 Addressing' },
    { id: 'u3_m07', number: 7, title: 'Subnetting & CIDR' },
    { id: 'u3_m08', number: 8, title: 'Summary & Review' }
  ],
  'unit_4': [
    { id: 'u4_m01', number: 1, title: 'Transport Layer Services' },
    { id: 'u4_m02', number: 2, title: 'UDP Protocol & Checksum' },
    { id: 'u4_m03', number: 3, title: 'TCP Segment & 3-Way Handshake' },
    { id: 'u4_m04', number: 4, title: 'TCP Flow Control & Sliding Window' },
    { id: 'u4_m05', number: 5, title: 'TCP Congestion Control (AIMD)' },
    { id: 'u4_m06', number: 6, title: 'SCTP & Advanced Transport' },
    { id: 'u4_m07', number: 7, title: 'Summary & Practice' }
  ],
  'unit_5': [
    { id: 'u5_m01', number: 1, title: 'Application Layer Paradigms' },
    { id: 'u5_m02', number: 2, title: 'DNS Architecture & Hierarchy' },
    { id: 'u5_m03', number: 3, title: 'HTTP/1.1 vs HTTP/2 vs HTTP/3' },
    { id: 'u5_m04', number: 4, title: 'Email Protocols (SMTP, IMAP, POP3)' },
    { id: 'u5_m05', number: 5, title: 'DHCP 4-Step DORA Process' },
    { id: 'u5_m06', number: 6, title: 'Network Security & SSL/TLS' }
  ]
};

/**
 * Retrieve modular lesson data by its lessonId.
 * Falls back cleanly to syllabus data so all 21 levels look beautiful!
 */
export function getModularLessonById(lessonId: string): ModularLesson {
  // Direct match in registered modular lessons
  if (LESSON_MODULES[lessonId]) {
    return LESSON_MODULES[lessonId];
  }

  // Derive unit number and module index
  const isU3 = lessonId.includes('u3') || lessonId.includes('sec-3');
  const isU4 = lessonId.includes('u4') || lessonId.includes('sec-4');
  const unitNumber = isU3 ? 3 : isU4 ? 4 : 5;
  const unitId = `unit_${unitNumber}`;
  const unitName = unitNumber === 3 ? 'Unit 3: Network Layer' : unitNumber === 4 ? 'Unit 4: Transport Layer' : 'Unit 5: Application Layer';

  // Search syllabus data for matching module title/content
  let syllabusModule: any = null;
  const syllabusUnit = (syllabusData.units as any[]).find((u) => u.id === unitId);
  if (syllabusUnit && syllabusUnit.modules) {
    syllabusModule = syllabusUnit.modules.find((m: any) => m.id === lessonId || lessonId.includes(m.id)) || syllabusUnit.modules[0];
  }

  const topicTitle = syllabusModule?.title || `Lesson ${lessonId.toUpperCase()}`;
  const pedagogyHook = syllabusModule?.pedagogy?.hook || 'Why is this networking concept vital to modern internet infrastructure?';
  const pedagogyConcept = syllabusModule?.pedagogy?.concept || 'Understand host-to-host packet delivery, routing algorithms, and core design issues across modern computer networks.';
  const takeaways = syllabusModule?.keyTakeaways || [
    'Provides fundamental protocol mechanisms for scalable network transmission',
    'Ensures high-throughput and low-latency packet delivery',
    'Mitigates transmission loss and connection dropouts',
    'Follows standardized RFC internet specifications'
  ];

  // Dynamic fallback constructed to ensure no blank screens ever
  return {
    id: lessonId,
    unitId,
    unitName,
    unitNumber: unitNumber as 3 | 4 | 5,
    lessonNumber: 1,
    totalLessonsInUnit: UNIT_LESSON_LIST[unitId]?.length || 8,
    title: topicTitle,
    subtitle: pedagogyConcept,
    estimatedDuration: '4–6 min',
    xpReward: 50,
    octoConceptSpeech: `Let's master ${topicTitle} step-by-step! 🎓`,
    octoSimulationSpeech: 'Interact with the network simulation to see it in action!',
    octoQuizSpeech: 'Amazing! You got it right! 🌟',
    octoSummarySpeech: 'Great Job! You have completed this lesson! 🎓',

    concept: {
      overview: {
        heading: `What is ${topicTitle}?`,
        body: pedagogyConcept,
        sourceLabel: 'Source Node',
        destinationLabel: 'Destination Node',
        layerLabel: `${unitName} Service`,
        takeaways
      },
      keyConcepts: {
        heading: 'Core Architecture Principles',
        points: [
          {
            title: 'End-to-End Delivery',
            description: pedagogyConcept,
            badge: `Unit ${unitNumber}`
          },
          {
            title: 'Standardized Protocol Design',
            description: 'Operates in accordance with IETF RFC guidelines for universal cross-platform interoperability.',
            badge: 'Standard'
          },
          {
            title: 'Error Handling & Congestion Management',
            description: 'Actively monitors queue capacity and drops/retries packets to avoid network collapse.',
            badge: 'Reliability'
          }
        ]
      },
      analogy: {
        heading: 'Real-World Everyday Analogy',
        story: syllabusModule?.pedagogy?.analogy || 'Like postal distribution hubs organizing parcels by destination postal code and dispatching via the most efficient transport routes.',
        comparison: [
          { realWorld: 'Postal package tracking ID', networking: 'Packet Header Sequence Number' },
          { realWorld: 'City sorting station', networking: 'Network Gateway / Core Router' },
          { realWorld: 'Express delivery highway lane', networking: 'High-bandwidth Fiber Trunk Link' }
        ]
      },
      examples: {
        heading: 'Practical Everyday Examples',
        items: [
          {
            title: 'High-Speed Streaming',
            scenario: 'Streaming ultra-HD 4K media content without buffering.',
            howItWorks: 'Packets are routed dynamically to edge caching nodes closest to the consumer.'
          },
          {
            title: 'Cloud Database Synchronization',
            scenario: 'Replicating data across multi-region server clusters.',
            howItWorks: 'Packets utilize lowest-latency transit lines to achieve sub-50ms synchronization.'
          }
        ]
      },
      quickNotes: [
        `Key PDU at Layer ${unitNumber}: Packets / Segments / Messages`,
        'Hierarchical addressing enables global scalability',
        'Stateful vs Stateless trade-offs determine throughput vs overhead'
      ]
    },

    simulation: {
      title: `Interactive ${topicTitle} Simulation`,
      subtitle: 'Send test packets through the topology and monitor transit routes, hops, and delay.',
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
          title: 'Encapsulation',
          description: 'Sender packages payload and computes checksum integrity header.'
        },
        {
          step: 2,
          title: 'Hop-by-Hop Forwarding',
          description: 'Routers inspect destination header and select the lowest cost link.'
        },
        {
          step: 3,
          title: 'Acknowledgment & Completion',
          description: 'Destination consumes packet and verifies integrity checksum.'
        }
      ],
      explorePrompts: [
        'Observe how different speeds (1x, 2x, 4x) change the animation pacing.',
        'Watch the route hops increment along the active transmission path.'
      ]
    },

    quiz: {
      title: 'Practice Quiz',
      subtitle: `Test your understanding of ${topicTitle}.`,
      questions: (syllabusModule?.quiz && syllabusModule.quiz.length > 0)
        ? syllabusModule.quiz.map((q: any, idx: number) => ({
            id: q.id || `q_${idx}`,
            question: q.question,
            options: (q.options || []).map((opt: string, optIdx: number) => ({
              id: (['A', 'B', 'C', 'D'][optIdx] || 'A') as 'A' | 'B' | 'C' | 'D',
              text: opt
            })),
            correctOptionId: (['A', 'B', 'C', 'D'][q.correctIndex ?? 0] || 'A') as 'A' | 'B' | 'C' | 'D',
            explanation: q.explanation || 'Correct answer matches fundamental networking principles.'
          }))
        : [
            {
              id: 'q1',
              question: pedagogyHook,
              options: [
                { id: 'A', text: 'Because Layer 3 provides logical addressing and multi-hop forwarding.' },
                { id: 'B', text: 'Because cables transmit faster than IP.' },
                { id: 'C', text: 'Because MAC addresses work across the world.' },
                { id: 'D', text: 'Because Wi-Fi has unlimited wireless range.' }
              ],
              correctOptionId: 'A',
              explanation: 'Layer 3 uses logical IP addressing and routing to route data across heterogeneous physical networks globally.'
            }
          ],
      quickTips: [
        'Read each option carefully before answering.',
        'Recall the core role of logical addressing and packet forwarding.'
      ]
    },

    summary: {
      keyConcepts: [
        `Core function of ${topicTitle}`,
        'End-to-end addressing and multi-hop delivery',
        'Protocol headers and verification',
        'Congestion and error recovery'
      ],
      importantPoints: [
        'Connects multiple heterogeneous networks seamlessly',
        'Uses standard packet formats for high interoperability',
        'Calculates lowest cost routes dynamically',
        'Guarantees protocol compliance'
      ],
      realWorldAnalogy: syllabusModule?.pedagogy?.analogy || 'Like postal logistics sorting mail parcels across international hubs.',
      commonUses: [
        'Web browsing & cloud API consumption',
        'High-definition video streaming',
        'Online interactive gaming',
        'Enterprise remote workplace networks'
      ],
      mindMapCenter: topicTitle,
      mindMapBranches: [
        { id: 'b1', title: 'Addressing & Identity', color: '#3157D5' },
        { id: 'b2', title: 'Routing & Path Selection', color: '#10B981' },
        { id: 'b3', title: 'Forwarding Engine', color: '#8B5CF6' },
        { id: 'b4', title: 'Quality of Service (QoS)', color: '#F59E0B' },
        { id: 'b5', title: 'Error & Congestion Control', color: '#EC4899' },
        { id: 'b6', title: 'Hardware Offloading', color: '#06B6D4' }
      ]
    }
  };
}
