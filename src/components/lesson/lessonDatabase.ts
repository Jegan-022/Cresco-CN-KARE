import { LessonDefinition } from './lessonTypes';

export const LESSONS_DATABASE: Record<string, LessonDefinition> = {
  // =========================================================================
  // UNIT III · LESSON 1: NETWORK LAYER — NEED AND ISSUES
  // =========================================================================
  'u3_m01': {
    id: 'u3_m01',
    unitNumber: 3,
    unitName: 'NETWORK LAYER',
    lessonNumber: 1,
    totalLessonsInUnit: 8,
    topicTitle: 'Network Layer – Need and Issues',
    subtitle: 'Store-and-forward packet switching, connection-oriented vs connectionless services.',
    estimatedDuration: '4–5 min',
    masteryRating: 85,
    nextLessonId: 'u3_m02',
    nextLessonTitle: 'Routing Algorithms (Distance Vector & Link State)',
    phases: [
      {
        id: 'net-intro',
        type: 'intro',
        title: 'Network Layer — Need & Issues',
        subtitle: 'Understand why networks require Layer 3 to route packets across multiple hops.',
        byteQuote: 'Why does a letter sent across the world reach your doorstep, while Ethernet only talks to adjacent cables?',
        bytePose: 'explaining',
      },
      {
        id: 'net-concept',
        type: 'explain',
        title: 'WHAT IS THE NETWORK LAYER?',
        subtitle: 'Host-to-Host Packet Delivery & Design Issues',
        byteQuote: 'The Network Layer moves packets end-to-end across multiple interconnected networks.',
        bytePose: 'thinking',
        conceptHeading: 'CORE NETWORK LAYER ROLE',
        conceptBody: 'The Network Layer oversees packet delivery from source host to destination host across intermediate routers using store-and-forward packet switching. Key issues include routing, congestion control, addressing, and quality of service.',
        highlightWords: [
          { word: 'HOST-TO-HOST', explanation: 'Unlike Link Layer which is hop-to-hop, Network Layer provides logical communication between end hosts.' },
          { word: 'STORE-AND-FORWARD', explanation: 'Routers buffer the entire packet, verify the checksum, and inspect destination IP before forwarding.' },
          { word: 'SERVICES', explanation: 'Can be Connectionless (datagrams routed independently like postal service) or Connection-Oriented (virtual circuits).' }
        ]
      },
      {
        id: 'net-scenario',
        type: 'scenario',
        title: 'SCENARIO QUESTION',
        subtitle: 'Connectionless vs Connection-Oriented Services',
        byteQuote: 'Compare how the Internet datagram model handles packet routing.',
        bytePose: 'thinking',
        questionText: 'In the Internet model (connectionless datagram service), how are individual packets handled by intermediate routers?',
        mcqOptions: [
          { id: 'A', text: 'All packets must follow a pre-established physical circuit', sublabel: 'Circuit switching' },
          { id: 'B', text: 'Each packet is routed independently based on destination IP address', sublabel: 'Datagram packet switching', isCorrect: true },
          { id: 'C', text: 'Packets are held until all packets of the message arrive at the first router', sublabel: 'Message switching' }
        ],
        explanation: 'In connectionless IP networking, each packet contains the full destination address and is forwarded independently by routers along potentially different paths.',
        hint: 'Think of how letters in the mail are sent independently through sorting hubs!',
        xpReward: 20
      },
      {
        id: 'net-matching',
        type: 'matching',
        title: 'MATCHING QUESTION',
        subtitle: 'Match Network Layer core concepts to their definitions',
        byteQuote: 'Connect each networking term to its correct operational definition.',
        bytePose: 'thinking',
        matchingPairs: [
          { id: 'm1', left: 'Routing', right: 'Global path determination across network' },
          { id: 'm2', left: 'Forwarding', right: 'Local transfer of packet from input to output' },
          { id: 'm3', left: 'Datagram', right: 'Independent connectionless packet' },
          { id: 'm4', left: 'Virtual Circuit', right: 'Connection setup, transfer, and teardown' }
        ],
        xpReward: 20
      }
    ]
  },

  // =========================================================================
  // UNIT IV · LESSON 3: TCP (Transmission Control Protocol)
  // =========================================================================
  'u4_m05': {
    id: 'u4_m05',
    unitNumber: 4,
    unitName: 'TRANSPORT LAYER',
    lessonNumber: 3,
    totalLessonsInUnit: 5,
    topicTitle: 'TCP & UDP',
    subtitle: 'How does the Internet make sure your data arrives safely?',
    estimatedDuration: '4–6 min',
    masteryRating: 75,
    nextLessonId: 'u4_m06',
    nextLessonTitle: 'UDP & Streaming Protocols',
    phases: [
      // 1. INTRO
      {
        id: 'tcp-intro',
        type: 'intro',
        title: 'TCP — Transmission Control Protocol',
        subtitle: 'Learn how transport protocols deliver data reliably across the Internet.',
        byteQuote: "Let's follow a packet across the network and see what happens.",
        bytePose: 'explaining',
      },

      // 2. EXPLAIN / CONCEPT SCREEN (Section 9)
      {
        id: 'tcp-concept',
        type: 'explain',
        title: 'WHAT IS TCP?',
        subtitle: 'Connection, Reliability & Ordered Byte Streams',
        byteQuote: 'TCP ensures every byte sent by an application arrives in exact order with zero lost data.',
        bytePose: 'thinking',
        conceptHeading: 'CORE TRANSPORT PRINCIPLE',
        conceptBody: 'TCP is a connection-oriented transport protocol that provides reliable delivery of data.',
        highlightWords: [
          {
            word: 'CONNECTION',
            explanation: 'A full logical connection is negotiated via the 3-way handshake (SYN, SYN-ACK, ACK) before data transfer begins.'
          },
          {
            word: 'RELIABILITY',
            explanation: 'Every lost or corrupted packet is tracked with sequence numbers and automatically retransmitted until acknowledged.'
          },
          {
            word: 'DELIVERY',
            explanation: 'TCP delivers bytes in the exact intended sequence to the destination application socket on the server.'
          }
        ],
      },

      // 3. VISUALIZE: PACKET FLOW (Section 10)
      {
        id: 'tcp-visualize',
        type: 'visualize',
        title: 'NETWORK VISUALIZATION',
        subtitle: 'Client ➔ Packet ➔ Router ➔ Server Traversal',
        byteQuote: 'Watch the packet traverse from your client browser to the destination web server.',
        bytePose: 'explaining',
        diagramType: 'packet-flow',
      },

      // 4. INTERACTIVE 3-WAY HANDSHAKE (Section 11)
      {
        id: 'tcp-handshake',
        type: 'interact',
        title: 'INTERACTIVE TCP 3-WAY HANDSHAKE',
        subtitle: 'Click each flag sequence to establish a verified connection',
        byteQuote: 'Click SYN to initiate the handshake, then watch the server respond with SYN-ACK!',
        bytePose: 'explaining',
        diagramType: 'tcp-handshake',
      },

      // 5. QUESTION (Section 12)
      {
        id: 'tcp-question-syn',
        type: 'question',
        title: 'HANDSHAKE VERIFICATION',
        subtitle: 'Test your understanding of connection negotiation',
        byteQuote: 'What control message does the server return immediately after receiving SYN?',
        bytePose: 'thinking',
        questionText: 'What happens after the client sends SYN during connection establishment?',
        mcqOptions: [
          { id: 'A', text: 'FIN', sublabel: 'Connection Termination Flag' },
          { id: 'B', text: 'SYN-ACK', sublabel: 'Synchronize & Acknowledge Packet', isCorrect: true },
          { id: 'C', text: 'DNS', sublabel: 'Domain Name Query' },
          { id: 'D', text: 'HTTP', sublabel: 'Application Layer Payload' },
        ],
        explanation: 'The server returns SYN-ACK (SYN=1, ACK=1) to acknowledge the client sequence number while proposing its own initial sequence number.',
        hint: 'Think about which response both acknowledges the client SYN and starts server synchronization.',
        xpReward: 10,
      },

      // 6. ORDERING QUESTION (Section 22)
      {
        id: 'tcp-order',
        type: 'ordering',
        title: 'ORDERING QUESTION',
        subtitle: 'Arrange the TCP handshake in sequential order',
        byteQuote: 'Can you arrange the three handshake messages from first to last?',
        bytePose: 'thinking',
        questionText: 'Arrange the TCP 3-way handshake in the exact sequence it occurs:',
        orderingItems: [
          { id: 'item-syn', label: 'SYN (Client proposes initial sequence number)', correctPosition: 0 },
          { id: 'item-synack', label: 'SYN-ACK (Server acknowledges and synchronizes)', correctPosition: 1 },
          { id: 'item-ack', label: 'ACK (Client confirms connection established)', correctPosition: 2 },
        ],
        explanation: 'The 3-way handshake always proceeds: SYN ➔ SYN-ACK ➔ ACK before data transfer starts.',
        xpReward: 15,
      },

      // 7. FILL IN THE BLANK (Section 21)
      {
        id: 'tcp-fillin',
        type: 'fill-in',
        title: 'FILL-IN THE BLANK',
        subtitle: 'Recall the core networking terminology',
        byteQuote: 'Type the missing networking keyword to complete the sentence.',
        bytePose: 'thinking',
        questionText: 'TCP uses a three-way ______ to establish a connection before transmitting data.',
        fillInCorrectAnswer: 'handshake',
        fillInHint: 'Starts with "h", refers to a greeting or negotiation ritual.',
        explanation: 'TCP uses a three-way handshake (SYN, SYN-ACK, ACK) to synchronize sequence numbers and verify both endpoints.',
        xpReward: 10,
      },

      // 8. MINI CHALLENGE / INCIDENT (Section 41)
      {
        id: 'tcp-mini-challenge',
        type: 'scenario',
        title: 'MINI CHALLENGE: NETWORK INCIDENT',
        subtitle: 'Troubleshoot a real-world transport failure',
        byteQuote: 'A client receives RST (Reset) packets immediately after sending SYN. What does this mean?',
        bytePose: 'thinking',
        questionText: 'A client attempting to connect to 192.168.1.10 on Port 443 receives a TCP packet with RST=1 set. What is the most likely cause?',
        mcqOptions: [
          { id: 'A', text: 'The target server is powered off completely', sublabel: 'Hardware blackout' },
          { id: 'B', text: 'No web server process is actively listening on Port 443', sublabel: 'Port closed on host', isCorrect: true },
          { id: 'C', text: 'The DNS root servers are unreachable', sublabel: 'Layer 5 resolution error' },
          { id: 'D', text: 'The client Ethernet cable is unplugged', sublabel: 'Physical layer failure' },
        ],
        explanation: 'When a host receives a SYN for a closed port, its TCP stack returns RST (Reset) to reject the invalid connection attempt.',
        hint: 'RST means the destination host is reachable, but refuses the connection on that port.',
        xpReward: 25,
      },
    ]
  },

  // =========================================================================
  // UNIT IV · LESSON 4: UDP (User Datagram Protocol)
  // =========================================================================
  'u4_m06': {
    id: 'u4_m06',
    unitNumber: 4,
    unitName: 'TRANSPORT LAYER',
    lessonNumber: 4,
    totalLessonsInUnit: 5,
    topicTitle: 'UDP & Streaming Protocols',
    subtitle: 'Connectionless, low-overhead transport for real-time applications.',
    estimatedDuration: '3–5 min',
    masteryRating: 60,
    nextLessonId: 'u4_m08',
    nextLessonTitle: 'Transport-Level Security (SSL & TLS)',
    phases: [
      {
        id: 'udp-intro',
        type: 'intro',
        title: 'UDP — User Datagram Protocol',
        subtitle: 'Understand connectionless datagram transport without handshake overhead.',
        byteQuote: 'UDP sends data without waiting to establish a connection first.',
        bytePose: 'explaining',
      },
      {
        id: 'udp-concept',
        type: 'explain',
        title: 'HOW UDP WORKS',
        subtitle: 'Fire-and-forget datagram streaming',
        byteQuote: 'Unlike TCP, UDP has no 3-way handshake and sends packets with zero retransmission delay.',
        bytePose: 'explaining',
        conceptHeading: 'CONNECTIONLESS TRANSPORT',
        conceptBody: 'UDP sends data without establishing a connection first. Packets are dispatched independently with minimal 8-byte header overhead.',
        highlightWords: [
          { word: 'CONNECTIONLESS', explanation: 'No initial handshake or connection teardown required before sending bytes.' },
          { word: 'LOW OVERHEAD', explanation: 'Fixed 8-byte header compared to TCP 20-byte minimum header.' },
          { word: 'ZERO LATENCY', explanation: 'Transmits packets immediately without waiting for cumulative ACKs.' }
        ]
      },
      {
        id: 'udp-comparison',
        type: 'interact',
        title: 'TCP VS UDP INTERACTIVE COMPARISON',
        subtitle: 'Click each property to compare the trade-offs (Section 14)',
        byteQuote: 'Tap through each protocol trait to see when to choose TCP versus UDP.',
        bytePose: 'explaining',
        diagramType: 'tcp-vs-udp',
      },
      {
        id: 'udp-scenario',
        type: 'scenario',
        title: 'SCENARIO QUESTION (Section 15)',
        subtitle: 'Live video streaming requirements',
        byteQuote: 'Which protocol should we use when speed matters more than retransmitting late packets?',
        bytePose: 'thinking',
        questionText: 'You are streaming a live football match to 500,000 users. Which protocol is generally more suitable when low latency is critical?',
        mcqOptions: [
          { id: 'A', text: 'TCP', sublabel: 'Guaranteed delivery with retransmissions' },
          { id: 'B', text: 'UDP', sublabel: 'Low latency, drops late packets without freezing', isCorrect: true },
        ],
        explanation: 'Live video and VoIP prioritize real-time delivery over retransmissions. Dropping occasional frames is preferable to buffering/stalling.',
        hint: 'Late packets in a live sports match are useless because the playback timestamp has already passed!',
        xpReward: 20,
      },
      {
        id: 'udp-matching',
        type: 'matching',
        title: 'MATCHING QUESTION (Section 20)',
        subtitle: 'Match each protocol to its fundamental architectural property',
        byteQuote: 'Drag or tap to match the protocol to its corresponding description.',
        bytePose: 'thinking',
        matchingPairs: [
          { id: 'm1', left: 'TCP', right: 'Reliable, ordered delivery' },
          { id: 'm2', left: 'UDP', right: 'Connectionless datagrams' },
          { id: 'm3', left: 'DNS', right: 'Domain name resolution' },
          { id: 'm4', left: 'HTTP', right: 'Web application communication' },
        ],
        xpReward: 20,
      },
    ]
  },

  // =========================================================================
  // UNIT III · LESSON 2: ROUTING ALGORITHMS (Section 23, 25)
  // =========================================================================
  'u3_m02': {
    id: 'u3_m02',
    unitNumber: 3,
    unitName: 'NETWORK LAYER',
    lessonNumber: 2,
    totalLessonsInUnit: 10,
    topicTitle: 'Routing Algorithms',
    subtitle: 'Shortest path routing, distance vector, and Dijkstra link-state algorithms.',
    estimatedDuration: '4–6 min',
    masteryRating: 82,
    nextLessonId: 'u3_m03',
    nextLessonTitle: 'Congestion Control Algorithms',
    phases: [
      {
        id: 'routing-intro',
        type: 'intro',
        title: 'Routing Algorithms & Topologies',
        subtitle: 'Find the optimal path for packets across autonomous internetworks.',
        byteQuote: 'Every router must calculate the most efficient path before forwarding packets.',
        bytePose: 'explaining',
      },
      {
        id: 'routing-concept',
        type: 'explain',
        title: 'DISTANCE VECTOR VS LINK STATE',
        subtitle: 'Global link state knowledge vs neighbor distance vectors',
        byteQuote: 'Dijkstra builds a complete map of the entire autonomous system, while Bellman-Ford exchanges tables with neighbors.',
        bytePose: 'thinking',
        conceptHeading: 'ROUTING METRIC PRINCIPLES',
        conceptBody: 'Routing algorithms calculate minimum cost paths based on bandwidth, hop count, and delay metrics.',
        highlightWords: [
          { word: 'LINK-STATE', explanation: 'Routers flood direct link metrics (LSAs) so all nodes build an identical topology graph (OSPF).' },
          { word: 'DISTANCE-VECTOR', explanation: 'Routers periodically share complete routing tables with immediate neighbors (RIP).' },
          { word: 'SPF ALGORITHM', explanation: 'Dijkstra Shortest Path First algorithm computes the lowest cumulative cost tree.' }
        ]
      },
      {
        id: 'routing-topology',
        type: 'topology',
        title: 'NETWORK TOPOLOGY QUESTION (Section 23, 33)',
        subtitle: 'Calculate and select the shortest path route',
        byteQuote: 'Which route should the packet take from PC A to Server with minimum metric cost?',
        bytePose: 'thinking',
        diagramType: 'routing-topology',
        questionText: 'Select the optimal path for the packet from PC A to Server:',
        mcqOptions: [
          { id: 'A', text: 'Route 1: via R1 ➔ R2', sublabel: 'Cost: 10ms delay', isCorrect: true },
          { id: 'B', text: 'Route 2: via R3 ➔ R4', sublabel: 'Cost: 45ms delay' },
        ],
        explanation: 'Route 1 (via R1 ➔ R2) has a lower cumulative cost of 10ms, which Dijkstra algorithm selects over the 45ms alternative.',
        hint: 'Compare the aggregate link delay along both router chains.',
        xpReward: 25,
      },
      {
        id: 'save-packet-game',
        type: 'packet-challenge',
        title: 'SAVE THE PACKET CHALLENGE (Section 24)',
        subtitle: 'Reroute the packet around a severed network link',
        byteQuote: 'Link R1-R2 is severed! Choose the alternate route before the countdown expires.',
        bytePose: 'boss-mode',
        diagramType: 'save-the-packet',
        xpReward: 25,
      }
    ]
  },

  // =========================================================================
  // UNIT III · LESSON 3: CONGESTION CONTROL (Section 26)
  // =========================================================================
  'u3_m03': {
    id: 'u3_m03',
    unitNumber: 3,
    unitName: 'NETWORK LAYER',
    lessonNumber: 3,
    totalLessonsInUnit: 10,
    topicTitle: 'Congestion Control Algorithms',
    subtitle: 'Preventing queue collapses, bufferbloat, and packet drops.',
    estimatedDuration: '3–5 min',
    masteryRating: 40,
    nextLessonId: 'u3_m04',
    nextLessonTitle: 'Quality of Service (QoS)',
    phases: [
      {
        id: 'congestion-intro',
        type: 'intro',
        title: 'Congestion Control & Traffic Flow',
        subtitle: 'Learn how networks prevent intermediate router queue overflows.',
        byteQuote: 'When traffic exceeds link capacity, router queues fill up and packets get dropped!',
        bytePose: 'explaining',
      },
      {
        id: 'congestion-sim',
        type: 'interact',
        title: 'INTERACTIVE CONGESTION SIMULATOR (Section 26)',
        subtitle: 'Adjust the transmission rate to balance throughput and packet loss',
        byteQuote: 'Slide the transmission slider. Keep the queue green to avoid packet drops!',
        bytePose: 'thinking',
        diagramType: 'congestion',
      },
      {
        id: 'congestion-q',
        type: 'question',
        title: 'CONGESTION AVOIDANCE MECHANICS',
        subtitle: 'TCP AIMD rate adjustment',
        byteQuote: 'What does TCP do when it detects packet loss via a timeout?',
        bytePose: 'thinking',
        questionText: 'In Additive Increase Multiplicative Decrease (AIMD), what occurs when packet loss is detected?',
        mcqOptions: [
          { id: 'A', text: 'Congestion window doubles exponentially' },
          { id: 'B', text: 'Congestion window is halved immediately to ease network load', isCorrect: true },
          { id: 'C', text: 'Packet transmission switches to UDP permanently' },
          { id: 'D', text: 'The router restarts its routing table' },
        ],
        explanation: 'Under AIMD, TCP cuts its congestion window (cwnd) in half upon detecting loss, providing rapid relief to congested queues.',
        xpReward: 15,
      }
    ]
  },

  // =========================================================================
  // UNIT V · LESSON 2: DNS (Domain Name System - Section 34)
  // =========================================================================
  'u5_m02': {
    id: 'u5_m02',
    unitNumber: 5,
    unitName: 'APPLICATION LAYER',
    lessonNumber: 2,
    totalLessonsInUnit: 10,
    topicTitle: 'DNS (Domain Name System)',
    subtitle: 'Hierarchical, distributed name resolution across the global Internet.',
    estimatedDuration: '4–6 min',
    masteryRating: 88,
    nextLessonId: 'u5_m05',
    nextLessonTitle: 'HTTP & REST Architectures',
    phases: [
      {
        id: 'dns-intro',
        type: 'intro',
        title: 'DNS — Domain Name System',
        subtitle: 'How does the Internet translate domain names into IP addresses?',
        byteQuote: "Humans remember names like cresco.edu. Routers only speak IP addresses like 93.184.216.34!",
        bytePose: 'explaining',
      },
      {
        id: 'dns-pipeline',
        type: 'interact',
        title: 'INTERACTIVE DNS RESOLUTION PIPELINE (Section 34)',
        subtitle: 'Click each stage to trace the query from Browser to Web Server',
        byteQuote: 'Click through each stage to see how a recursive query finds the authoritative IP.',
        bytePose: 'explaining',
        diagramType: 'dns-pipeline',
      },
      {
        id: 'dns-q',
        type: 'question',
        title: 'DNS RECORD IDENTIFICATION',
        subtitle: 'RFC 1035 Standard Resource Records',
        byteQuote: 'Which DNS record type maps a domain name directly to an IPv4 address?',
        bytePose: 'thinking',
        questionText: 'Which DNS Resource Record type maps a fully qualified domain name to a 32-bit IPv4 address?',
        mcqOptions: [
          { id: 'A', text: 'A Record', sublabel: 'Address Record', isCorrect: true },
          { id: 'B', text: 'AAAA Record', sublabel: 'IPv6 128-bit Record' },
          { id: 'C', text: 'MX Record', sublabel: 'Mail Exchange Record' },
          { id: 'D', text: 'CNAME Record', sublabel: 'Canonical Name Alias' },
        ],
        explanation: 'An A record maps a hostname directly to its IPv4 address. An AAAA record maps to an IPv6 address.',
        hint: 'Single letter "A" stands for IPv4 Address.',
        xpReward: 15,
      }
    ]
  },

  // =========================================================================
  // UNIT V · LESSON 8: DHCP (Dynamic Host Configuration Protocol - Section 39)
  // =========================================================================
  'u5_m08': {
    id: 'u5_m08',
    unitNumber: 5,
    unitName: 'APPLICATION LAYER',
    lessonNumber: 8,
    totalLessonsInUnit: 10,
    topicTitle: 'DHCP Dynamic Host Configuration',
    subtitle: 'Automated IP address, subnet mask, and default gateway configuration.',
    estimatedDuration: '3–5 min',
    masteryRating: 70,
    nextLessonId: 'u5_m10',
    nextLessonTitle: 'Web Security & OWASP Top 10',
    phases: [
      {
        id: 'dhcp-intro',
        type: 'intro',
        title: 'DHCP — Dynamic Host Configuration',
        subtitle: 'How devices automatically join any local network with zero configuration.',
        byteQuote: "When your phone connects to Wi-Fi, it asks DHCP for an IP address using DORA!",
        bytePose: 'explaining',
      },
      {
        id: 'dhcp-dora',
        type: 'interact',
        title: 'DHCP DORA 4-STAGE MESSAGE EXCHANGE (Section 39)',
        subtitle: 'Discover ➔ Offer ➔ Request ➔ Acknowledge',
        byteQuote: 'Follow the 4-step exchange between the client device and the DHCP server.',
        bytePose: 'explaining',
        diagramType: 'dhcp-dora',
      },
      {
        id: 'dhcp-order',
        type: 'ordering',
        title: 'DHCP MESSAGE SEQUENCING',
        subtitle: 'Arrange the four DHCP messages in correct order',
        byteQuote: 'Remember the acronym D-O-R-A: Discover, Offer, Request, Acknowledge!',
        bytePose: 'thinking',
        questionText: 'Arrange the DHCP configuration messages in the exact order they are exchanged:',
        orderingItems: [
          { id: 'dhcp-d', label: '1. DHCP DISCOVER (Client broadcast looking for servers)', correctPosition: 0 },
          { id: 'dhcp-o', label: '2. DHCP OFFER (Server unicast/broadcast proposing IP)', correctPosition: 1 },
          { id: 'dhcp-r', label: '3. DHCP REQUEST (Client requests proposed IP address)', correctPosition: 2 },
          { id: 'dhcp-a', label: '4. DHCP ACK (Server confirms lease assignment)', correctPosition: 3 },
        ],
        explanation: 'DHCP operates via DORA: Discover (client), Offer (server), Request (client), Acknowledge (server).',
        xpReward: 20,
      }
    ]
  }
};

// Fallback generator for any syllabus module ID
export const getLessonById = (lessonId: string): LessonDefinition => {
  const normalizedId = lessonId === 'u3_m1' ? 'u3_m01' : lessonId === 'u4_m5' ? 'u4_m05' : lessonId === 'u5_m2' ? 'u5_m02' : lessonId;
  if (LESSONS_DATABASE[normalizedId]) {
    return LESSONS_DATABASE[normalizedId];
  }
  if (LESSONS_DATABASE[lessonId]) {
    return LESSONS_DATABASE[lessonId];
  }

  // Smart fallback mapped by Unit
  if (lessonId.startsWith('u3_')) {
    return {
      ...LESSONS_DATABASE['u3_m02'],
      id: lessonId,
      lessonNumber: parseInt(lessonId.replace(/\D/g, ''), 10) || 1,
    };
  } else if (lessonId.startsWith('u5_')) {
    return {
      ...LESSONS_DATABASE['u5_m02'],
      id: lessonId,
      lessonNumber: parseInt(lessonId.replace(/\D/g, ''), 10) || 1,
    };
  }

  // Default to TCP
  return LESSONS_DATABASE['u4_m05'];
};
