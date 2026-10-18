import { LevelDefinition } from '../types';

export const level10Data: LevelDefinition = {
  id: 10,
  slug: 'level-10',
  lessonId: 'u4_m05',
  unitNumber: 4,
  unitTitle: 'Unit 4: Transport Layer',
  lessonNumber: 2,
  totalLessonsInUnit: 7,
  title: 'Transport Protocols: ARQ Challenge',
  subtitle: 'Master Stop-and-Wait, Go-Back-N, and Selective Repeat sliding window protocols.',
  description: 'BOSS BATTLE: Simple protocol, Stop-and-Wait, Go-Back-N, and Selective Repeat sliding window protocols!',
  objectives: [
    'Master Stop-and-Wait, Go-Back-N, and Selective Repeat sliding window ARQ mechanisms',
    'Analyze window sizes, sequence numbers, and buffer requirements at sender and receiver',
    'Calculate link utilization under high Bandwidth-Delay Product (BDP)',
    'Handle cumulative acknowledgments, timeout retransmissions, and duplicate ACKs'
  ],
  estimatedDuration: '6–8 min',
  mascotQuote: 'Get ready for the ARQ Challenge! Can you slide your transmission window without dropping frames?',
  mascotTip: 'Watch how Go-Back-N resends all unacknowledged packets from the lost frame!',
  xpReward: 250,
  prevLevelSlug: 'level-9',
  nextLevelSlug: 'level-11',
  completionState: {
    isCompleted: false,
    minScore: 70,
  },
  animatedLearning: {
    diagramType: 'tcp-handshake',
    animationTopicId: 'sliding-window',
    description: 'Sliding window transmission with cumulative ACKs and timeout retransmissions'
  },

  concept: {
    tabs: [
      {
        id: 'overview',
        label: 'Overview',
        title: 'Automatic Repeat reQuest (ARQ) Protocols',
        content: [
          'Automatic Repeat reQuest (ARQ) protocols provide reliable, in-order byte streaming over unreliable lower-layer channels prone to packet corruption, reordering, and loss.',
          'In basic Stop-and-Wait, the sender transmits a single frame and stalls completely until receiving an ACK from the receiver. While simple, Stop-and-Wait has terrible channel utilization on high Bandwidth-Delay Product (BDP) links.',
          'Pipelined sliding window protocols (Go-Back-N and Selective Repeat) keep the pipe full by permitting the sender to transmit multiple unacknowledged frames within an allowable window size W.'
        ],
        keyTakeaways: [
          'Stop-and-Wait utilization: U = 1 / (1 + 2a), where a = PropagationDelay / TransmissionTime',
          'Pipelining allows up to W frames in flight simultaneously',
          'Sliding window balances sender throughput against receiver buffer capacity'
        ],
        diagram: {
          type: 'architecture',
          source: 'Sender Host A',
          layer: 'Sliding Window ARQ (GBN / Selective Repeat)',
          destination: 'Receiver Host B',
          caption: 'Pipelined frame transmission across round-trip time (RTT)'
        }
      },
      {
        id: 'key-concepts',
        label: 'Key Concepts',
        title: 'Go-Back-N vs Selective Repeat',
        content: [
          'Go-Back-N (GBN): The receiver maintains an expected sequence number and accepts only strictly in-order packets. It discards out-of-order packets and sends cumulative ACKs. If a timer expires, the sender retransmits ALL unacknowledged packets starting from the lost frame.',
          'Selective Repeat (SR): The receiver has a buffer of size W_R and individually acknowledges each correctly received packet, even if received out of order. The sender retransmits ONLY the specific timed-out packet.',
          'Sequence Number Constraint: To avoid duplicate packet misinterpretation, GBN requires MaxWindowSize <= 2^m - 1, whereas Selective Repeat requires MaxWindowSize <= 2^(m - 1), where m is sequence bit length.'
        ],
        keyTakeaways: [
          'GBN: Receiver buffer = 1; Sender retransmits all packets in window on loss',
          'Selective Repeat: Receiver buffer = W; Sender retransmits only lost packets',
          'For Selective Repeat, W_sender + W_receiver <= 2^m'
        ]
      },
      {
        id: 'analogy',
        label: 'Real World Analogy',
        title: 'The Manufacturing Assembly Line Analogy',
        content: [
          'Stop-and-Wait is like ordering one custom tool from an overseas factory, waiting 3 weeks for delivery, testing it, and only then ordering the second tool.',
          'Go-Back-N is like sending 10 parts down a conveyor belt. If part #3 is scratched, the inspection station throws away parts #3, #4, #5... and orders the manufacturer to rebuild everything starting from part #3.',
          'Selective Repeat is like inspecting parts individually: part #3 is re-ordered, while parts #4 and #5 are kept on the sorting shelf waiting for part #3 to arrive.'
        ],
        keyTakeaways: [
          'Stop-and-Wait: Inefficient, long idle time',
          'Go-Back-N: Simple receiver, wasted bandwidth on retransmission',
          'Selective Repeat: Maximum efficiency, requires receiver memory buffers'
        ]
      },
      {
        id: 'examples',
        label: 'Examples',
        title: 'Protocol Implementations',
        content: [
          'TCP Sliding Window: TCP uses a byte-oriented sliding window with cumulative acknowledgments and Selective Acknowledgment (SACK, RFC 2018).',
          'High Bandwidth-Delay Links: Satellite links with 500ms RTT require window scale options (RFC 7323) to achieve multi-megabit speeds.',
          'Fast Retransmit: In modern TCP, receiving 3 duplicate ACKs triggers immediate retransmission without waiting for the full retransmission timer (RTO) to expire.'
        ],
        keyTakeaways: [
          'TCP combines elements of both GBN (cumulative ACK) and SR (SACK option)',
          'Window size determines maximum unacknowledged bytes in flight'
        ]
      },
      {
        id: 'notes',
        label: 'Quick Notes',
        title: 'Exam Formula Cheat Sheet',
        content: [
          'Efficiency of Stop-and-Wait: eta = T_tx / (T_tx + 2 * T_prop).',
          'Efficiency of Pipelined Sliding Window: eta = min(1, W * T_tx / (T_tx + 2 * T_prop)).',
          'GBN sequence bits: m bits -> Max sender window = 2^m - 1.',
          'Selective Repeat sequence bits: m bits -> Max window = 2^(m - 1).'
        ],
        keyTakeaways: [
          'Memorize window constraint: W_SR <= 2^(m-1)',
          'Bandwidth-Delay Product = Bandwidth * Round-Trip Time'
        ]
      }
    ]
  },

  interactive: {
    title: 'Sliding Window ARQ Simulator',
    description: 'Observe pipelined packet transmissions and test how packet drops affect cumulative vs selective acknowledgments.',
    mascotTip: 'Drop a packet mid-transit to see how Go-Back-N retransmits the entire window!',
    sourceCity: 'Sender Terminal',
    destinationCity: 'Receiver Buffer',
    defaultMessage: 'Data Frames [0, 1, 2, 3]',
    path: ['Sender Queue', 'Sliding Window (W=4)', 'Transit Channel', 'Receiver Buffer'],
    hops: 3,
    totalTimeMs: 65,
    explanation: 'Frames 0, 1, 2, and 3 are transmitted in pipeline. When ACK 0 and ACK 1 return, the window slides forward to transmit frames 4 and 5.',
    routers: [
      { id: 'src', name: 'Sender Queue', x: 15, y: 50, label: 'Sender (W=4)', active: true },
      { id: 'win', name: 'Window Frame', x: 40, y: 40, label: 'Window [0..3]', active: true },
      { id: 'link', name: 'Channel Pipeline', x: 65, y: 55, label: 'In-Flight Packets', active: true },
      { id: 'dst', name: 'Receiver Buffer', x: 88, y: 50, label: 'Receiver Queue' }
    ]
  },

  quiz: {
    title: 'ARQ Boss Challenge Quiz',
    subtitle: 'Verify your mastery of sliding window protocols and window calculations.',
    quickTips: [
      'Remember the sequence number constraint for Selective Repeat vs GBN',
      'Pay close attention to whether ACKs are cumulative or individual'
    ],
    questions: [
      {
        id: 1,
        question: 'If a 4-bit sequence number (m=4) is used in Selective Repeat ARQ, what is the maximum sender window size?',
        options: [
          { id: 'A', text: '16', isCorrect: false },
          { id: 'B', text: '15', isCorrect: false },
          { id: 'C', text: '8', isCorrect: true },
          { id: 'D', text: '4', isCorrect: false }
        ],
        explanation: 'In Selective Repeat, the maximum window size is 2^(m - 1). For m = 4 bits, Max Window = 2^(4 - 1) = 2^3 = 8 to prevent overlap between new and retransmitted frames.'
      },
      {
        id: 2,
        question: 'In Go-Back-N ARQ, if frames 0, 1, 2, 3 are sent and frame 1 is lost in transit, what will the receiver do upon receiving frame 2?',
        options: [
          { id: 'A', text: 'Buffer frame 2 and ask for retransmission of frame 1 only.', isCorrect: false },
          { id: 'B', text: 'Discard frame 2 and re-send an ACK for frame 0.', isCorrect: true },
          { id: 'C', text: 'Acknowledge frame 2 immediately.', isCorrect: false },
          { id: 'D', text: 'Drop all frames and reset the connection.', isCorrect: false }
        ],
        explanation: 'The Go-Back-N receiver only accepts in-order frames (receiver window = 1). When out-of-order frame 2 arrives, it is discarded, and the receiver re-sends cumulative ACK 0.'
      },
      {
        id: 3,
        question: 'What is the primary disadvantage of the Stop-and-Wait protocol on a satellite communication link?',
        options: [
          { id: 'A', text: 'Packets cannot be checked for checksum errors.', isCorrect: false },
          { id: 'B', text: 'The sender spends most of its time idle waiting for ACKs across the large RTT.', isCorrect: true },
          { id: 'C', text: 'It requires enormous memory buffers at the receiver.', isCorrect: false },
          { id: 'D', text: 'It causes network congestion collapse.', isCorrect: false }
        ],
        explanation: 'Satellite links have large propagation delays (high BDP). Stopping and waiting for each packet yields extremely low channel utilization (often < 1%).'
      },
      {
        id: 4,
        question: 'What happens when a TCP receiver receives 3 duplicate ACKs for the same sequence number?',
        options: [
          { id: 'A', text: 'It triggers Fast Retransmit without waiting for the RTO timer to expire.', isCorrect: true },
          { id: 'B', text: 'It closes the socket connection immediately.', isCorrect: false },
          { id: 'C', text: 'It increases the congestion window exponentially.', isCorrect: false },
          { id: 'D', text: 'It ignores the duplicate ACKs.', isCorrect: false }
        ],
        explanation: 'Fast Retransmit interprets 3 duplicate ACKs as a strong signal that a specific segment was lost while subsequent segments arrived, triggering immediate retransmission.'
      },
      {
        id: 5,
        question: 'How does Selective Repeat differ from Go-Back-N at the receiver side?',
        options: [
          { id: 'A', text: 'Selective Repeat receiver does not send acknowledgments.', isCorrect: false },
          { id: 'B', text: 'Selective Repeat buffers out-of-order frames and sends individual acknowledgments.', isCorrect: true },
          { id: 'C', text: 'Selective Repeat does not require sequence numbers.', isCorrect: false },
          { id: 'D', text: 'Selective Repeat uses smaller sequence numbers.', isCorrect: false }
        ],
        explanation: 'Selective Repeat maintains a receive window greater than 1, buffering valid out-of-order frames and acknowledging each one independently.'
      }
    ]
  },

  summary: {
    keyConcepts: [
      'Stop-and-Wait: Simple but inefficient on high BDP links',
      'Go-Back-N: Receiver buffer = 1, cumulative ACKs, retransmits entire window on loss',
      'Selective Repeat: Receiver buffer = W, individual ACKs, retransmits only lost packets',
      'Window Constraints: GBN W <= 2^m - 1; SR W <= 2^(m - 1)'
    ],
    importantPoints: [
      'Pipelining keeps transmission pipeline fully utilized',
      'Bandwidth-Delay Product dictates required window size',
      'Modern TCP uses Selective Acknowledgment (SACK) for high performance'
    ],
    realWorldAnalogy: 'Like managing a delivery fleet: instead of dispatching one vehicle and waiting for it to return before dispatching the next, dispatch a continuous convoy and only re-route the vehicle that experienced a flat tire.',
    commonUses: [
      'TCP Reliable Data Transfer',
      'Satellite and Deep-Space Communication Links',
      'Data Link Layer HDLC / SDLC framing'
    ],
    mindMap: {
      center: 'ARQ Protocols',
      nodes: [
        { id: 'n1', label: 'Stop-and-Wait (W=1)', category: 'primary' },
        { id: 'n2', label: 'Go-Back-N (Cumulative ACK)', category: 'primary' },
        { id: 'n3', label: 'Selective Repeat (Individual ACK)', category: 'primary' },
        { id: 'n4', label: 'Window Constraint: 2^(m-1)', category: 'secondary' },
        { id: 'n5', label: 'Fast Retransmit (3 Dup ACKs)', category: 'accent' },
        { id: 'n6', label: 'High BDP Link Utilization', category: 'accent' }
      ],
      edges: [
        { from: 'ARQ Protocols', to: 'n1' },
        { from: 'ARQ Protocols', to: 'n2' },
        { from: 'ARQ Protocols', to: 'n3' },
        { from: 'ARQ Protocols', to: 'n4' },
        { from: 'ARQ Protocols', to: 'n5' },
        { from: 'ARQ Protocols', to: 'n6' }
      ]
    }
  }
};
