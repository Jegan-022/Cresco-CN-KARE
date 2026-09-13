export interface Pedagogy {
  hook: string;
  analogy: string;
  concept: string;
}

export interface CourseModule {
  id: string;
  unitId: string;
  title: string;
  readingTime: string;
  pedagogy: Pedagogy;
  lessonIds: string[];
  activityIds: string[];
}

export interface CourseUnit {
  id: string;
  title: string;
  description: string;
  modules: CourseModule[];
}

export const UNIT_3_MODULES: CourseModule[] = [
  {
    id: 'mod-3-1',
    unitId: 'unit-3',
    title: 'Introduction to the Network Layer',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with Introduction?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of Introduction to the Network Layer.'
    },
    lessonIds: ['mod-3-1-l1', 'mod-3-1-l2'],
    activityIds: ['mod-3-1-a1', 'mod-3-1-a2']
  },
  {
    id: 'mod-3-2',
    unitId: 'unit-3',
    title: 'IPv4 Addressing Mechanics',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with IPv4?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of IPv4 Addressing Mechanics.'
    },
    lessonIds: ['mod-3-2-l1', 'mod-3-2-l2'],
    activityIds: ['mod-3-2-a1', 'mod-3-2-a2']
  },
  {
    id: 'mod-3-3',
    unitId: 'unit-3',
    title: 'Classful vs Classless Inter-Domain Routing (CIDR)',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with Classful?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of Classful vs Classless Inter-Domain Routing (CIDR).'
    },
    lessonIds: ['mod-3-3-l1', 'mod-3-3-l2'],
    activityIds: ['mod-3-3-a1', 'mod-3-3-a2']
  },
  {
    id: 'mod-3-4',
    unitId: 'unit-3',
    title: 'Subnetting Fundamentals',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with Subnetting?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of Subnetting Fundamentals.'
    },
    lessonIds: ['mod-3-4-l1', 'mod-3-4-l2'],
    activityIds: ['mod-3-4-a1', 'mod-3-4-a2']
  },
  {
    id: 'mod-3-5',
    unitId: 'unit-3',
    title: 'Variable Length Subnet Masking (VLSM)',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with Variable?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of Variable Length Subnet Masking (VLSM).'
    },
    lessonIds: ['mod-3-5-l1', 'mod-3-5-l2'],
    activityIds: ['mod-3-5-a1', 'mod-3-5-a2']
  },
  {
    id: 'mod-3-6',
    unitId: 'unit-3',
    title: 'IPv6 Architecture',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with IPv6?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of IPv6 Architecture.'
    },
    lessonIds: ['mod-3-6-l1', 'mod-3-6-l2'],
    activityIds: ['mod-3-6-a1', 'mod-3-6-a2']
  },
  {
    id: 'mod-3-7',
    unitId: 'unit-3',
    title: 'IPv6 Addressing & Autoconfiguration',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with IPv6?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of IPv6 Addressing & Autoconfiguration.'
    },
    lessonIds: ['mod-3-7-l1', 'mod-3-7-l2'],
    activityIds: ['mod-3-7-a1', 'mod-3-7-a2']
  },
  {
    id: 'mod-3-8',
    unitId: 'unit-3',
    title: 'Address Resolution Protocol (ARP)',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with Address?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of Address Resolution Protocol (ARP).'
    },
    lessonIds: ['mod-3-8-l1', 'mod-3-8-l2'],
    activityIds: ['mod-3-8-a1', 'mod-3-8-a2']
  },
  {
    id: 'mod-3-9',
    unitId: 'unit-3',
    title: 'Internet Control Message Protocol (ICMP)',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with Internet?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of Internet Control Message Protocol (ICMP).'
    },
    lessonIds: ['mod-3-9-l1', 'mod-3-9-l2'],
    activityIds: ['mod-3-9-a1', 'mod-3-9-a2']
  },
  {
    id: 'mod-3-10',
    unitId: 'unit-3',
    title: 'Network Address Translation (NAT)',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with Network?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of Network Address Translation (NAT).'
    },
    lessonIds: ['mod-3-10-l1', 'mod-3-10-l2'],
    activityIds: ['mod-3-10-a1', 'mod-3-10-a2']
  },
  {
    id: 'mod-3-11',
    unitId: 'unit-3',
    title: 'Routing Tables & Forwarding Decisions',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with Routing?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of Routing Tables & Forwarding Decisions.'
    },
    lessonIds: ['mod-3-11-l1', 'mod-3-11-l2'],
    activityIds: ['mod-3-11-a1', 'mod-3-11-a2']
  },
  {
    id: 'mod-3-12',
    unitId: 'unit-3',
    title: 'Static vs Dynamic Routing',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with Static?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of Static vs Dynamic Routing.'
    },
    lessonIds: ['mod-3-12-l1', 'mod-3-12-l2'],
    activityIds: ['mod-3-12-a1', 'mod-3-12-a2']
  },
  {
    id: 'mod-3-13',
    unitId: 'unit-3',
    title: 'Distance Vector Routing Concepts',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with Distance?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of Distance Vector Routing Concepts.'
    },
    lessonIds: ['mod-3-13-l1', 'mod-3-13-l2'],
    activityIds: ['mod-3-13-a1', 'mod-3-13-a2']
  },
  {
    id: 'mod-3-14',
    unitId: 'unit-3',
    title: 'Routing Information Protocol (RIP)',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with Routing?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of Routing Information Protocol (RIP).'
    },
    lessonIds: ['mod-3-14-l1', 'mod-3-14-l2'],
    activityIds: ['mod-3-14-a1', 'mod-3-14-a2']
  },
  {
    id: 'mod-3-15',
    unitId: 'unit-3',
    title: 'Link-State Routing Concepts',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with Link-State?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of Link-State Routing Concepts.'
    },
    lessonIds: ['mod-3-15-l1', 'mod-3-15-l2'],
    activityIds: ['mod-3-15-a1', 'mod-3-15-a2']
  },
  {
    id: 'mod-3-16',
    unitId: 'unit-3',
    title: 'Open Shortest Path First (OSPF) Basics',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with Open?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of Open Shortest Path First (OSPF) Basics.'
    },
    lessonIds: ['mod-3-16-l1', 'mod-3-16-l2'],
    activityIds: ['mod-3-16-a1', 'mod-3-16-a2']
  },
  {
    id: 'mod-3-17',
    unitId: 'unit-3',
    title: 'OSPF Areas and LSAs',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with OSPF?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of OSPF Areas and LSAs.'
    },
    lessonIds: ['mod-3-17-l1', 'mod-3-17-l2'],
    activityIds: ['mod-3-17-a1', 'mod-3-17-a2']
  },
  {
    id: 'mod-3-18',
    unitId: 'unit-3',
    title: 'Border Gateway Protocol (BGP) Overview',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with Border?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of Border Gateway Protocol (BGP) Overview.'
    },
    lessonIds: ['mod-3-18-l1', 'mod-3-18-l2'],
    activityIds: ['mod-3-18-a1', 'mod-3-18-a2']
  },
  {
    id: 'mod-3-19',
    unitId: 'unit-3',
    title: 'BGP Path Attributes',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with BGP?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of BGP Path Attributes.'
    },
    lessonIds: ['mod-3-19-l1', 'mod-3-19-l2'],
    activityIds: ['mod-3-19-a1', 'mod-3-19-a2']
  },
  {
    id: 'mod-3-20',
    unitId: 'unit-3',
    title: 'Multicast Routing Basics',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with Multicast?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of Multicast Routing Basics.'
    },
    lessonIds: ['mod-3-20-l1', 'mod-3-20-l2'],
    activityIds: ['mod-3-20-a1', 'mod-3-20-a2']
  }
];

export const UNIT_4_MODULES: CourseModule[] = [
  {
    id: 'mod-4-1',
    unitId: 'unit-4',
    title: 'Transport Layer Role & Multiplexing',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with Transport?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of Transport Layer Role & Multiplexing.'
    },
    lessonIds: ['mod-4-1-l1', 'mod-4-1-l2'],
    activityIds: ['mod-4-1-a1', 'mod-4-1-a2']
  },
  {
    id: 'mod-4-2',
    unitId: 'unit-4',
    title: 'Port Numbers and Sockets',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with Port?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of Port Numbers and Sockets.'
    },
    lessonIds: ['mod-4-2-l1', 'mod-4-2-l2'],
    activityIds: ['mod-4-2-a1', 'mod-4-2-a2']
  },
  {
    id: 'mod-4-3',
    unitId: 'unit-4',
    title: 'User Datagram Protocol (UDP)',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with User?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of User Datagram Protocol (UDP).'
    },
    lessonIds: ['mod-4-3-l1', 'mod-4-3-l2'],
    activityIds: ['mod-4-3-a1', 'mod-4-3-a2']
  },
  {
    id: 'mod-4-4',
    unitId: 'unit-4',
    title: 'UDP Applications and Checksums',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with UDP?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of UDP Applications and Checksums.'
    },
    lessonIds: ['mod-4-4-l1', 'mod-4-4-l2'],
    activityIds: ['mod-4-4-a1', 'mod-4-4-a2']
  },
  {
    id: 'mod-4-5',
    unitId: 'unit-4',
    title: 'Transmission Control Protocol (TCP) Overview',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with Transmission?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of Transmission Control Protocol (TCP) Overview.'
    },
    lessonIds: ['mod-4-5-l1', 'mod-4-5-l2'],
    activityIds: ['mod-4-5-a1', 'mod-4-5-a2']
  },
  {
    id: 'mod-4-6',
    unitId: 'unit-4',
    title: 'TCP Segment Structure',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with TCP?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of TCP Segment Structure.'
    },
    lessonIds: ['mod-4-6-l1', 'mod-4-6-l2'],
    activityIds: ['mod-4-6-a1', 'mod-4-6-a2']
  },
  {
    id: 'mod-4-7',
    unitId: 'unit-4',
    title: 'TCP Three-Way Handshake',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with TCP?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of TCP Three-Way Handshake.'
    },
    lessonIds: ['mod-4-7-l1', 'mod-4-7-l2'],
    activityIds: ['mod-4-7-a1', 'mod-4-7-a2']
  },
  {
    id: 'mod-4-8',
    unitId: 'unit-4',
    title: 'TCP Connection Teardown',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with TCP?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of TCP Connection Teardown.'
    },
    lessonIds: ['mod-4-8-l1', 'mod-4-8-l2'],
    activityIds: ['mod-4-8-a1', 'mod-4-8-a2']
  },
  {
    id: 'mod-4-9',
    unitId: 'unit-4',
    title: 'TCP State Transition Diagram',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with TCP?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of TCP State Transition Diagram.'
    },
    lessonIds: ['mod-4-9-l1', 'mod-4-9-l2'],
    activityIds: ['mod-4-9-a1', 'mod-4-9-a2']
  },
  {
    id: 'mod-4-10',
    unitId: 'unit-4',
    title: 'Sequence and Acknowledgment Numbers',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with Sequence?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of Sequence and Acknowledgment Numbers.'
    },
    lessonIds: ['mod-4-10-l1', 'mod-4-10-l2'],
    activityIds: ['mod-4-10-a1', 'mod-4-10-a2']
  },
  {
    id: 'mod-4-11',
    unitId: 'unit-4',
    title: 'TCP Sliding Window & Flow Control',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with TCP?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of TCP Sliding Window & Flow Control.'
    },
    lessonIds: ['mod-4-11-l1', 'mod-4-11-l2'],
    activityIds: ['mod-4-11-a1', 'mod-4-11-a2']
  },
  {
    id: 'mod-4-12',
    unitId: 'unit-4',
    title: 'TCP Congestion Control Principles',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with TCP?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of TCP Congestion Control Principles.'
    },
    lessonIds: ['mod-4-12-l1', 'mod-4-12-l2'],
    activityIds: ['mod-4-12-a1', 'mod-4-12-a2']
  },
  {
    id: 'mod-4-13',
    unitId: 'unit-4',
    title: 'Additive Increase Multiplicative Decrease (AIMD)',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with Additive?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of Additive Increase Multiplicative Decrease (AIMD).'
    },
    lessonIds: ['mod-4-13-l1', 'mod-4-13-l2'],
    activityIds: ['mod-4-13-a1', 'mod-4-13-a2']
  },
  {
    id: 'mod-4-14',
    unitId: 'unit-4',
    title: 'TCP Slow Start Phase',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with TCP?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of TCP Slow Start Phase.'
    },
    lessonIds: ['mod-4-14-l1', 'mod-4-14-l2'],
    activityIds: ['mod-4-14-a1', 'mod-4-14-a2']
  },
  {
    id: 'mod-4-15',
    unitId: 'unit-4',
    title: 'Fast Retransmit & Fast Recovery',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with Fast?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of Fast Retransmit & Fast Recovery.'
    },
    lessonIds: ['mod-4-15-l1', 'mod-4-15-l2'],
    activityIds: ['mod-4-15-a1', 'mod-4-15-a2']
  },
  {
    id: 'mod-4-16',
    unitId: 'unit-4',
    title: 'TCP Timers & Retransmission',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with TCP?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of TCP Timers & Retransmission.'
    },
    lessonIds: ['mod-4-16-l1', 'mod-4-16-l2'],
    activityIds: ['mod-4-16-a1', 'mod-4-16-a2']
  },
  {
    id: 'mod-4-17',
    unitId: 'unit-4',
    title: 'TCP vs UDP: Architectural Choices',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with TCP?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of TCP vs UDP: Architectural Choices.'
    },
    lessonIds: ['mod-4-17-l1', 'mod-4-17-l2'],
    activityIds: ['mod-4-17-a1', 'mod-4-17-a2']
  }
];

export const UNIT_5_MODULES: CourseModule[] = [
  {
    id: 'mod-5-1',
    unitId: 'unit-5',
    title: 'Application Layer Paradigms',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with Application?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of Application Layer Paradigms.'
    },
    lessonIds: ['mod-5-1-l1', 'mod-5-1-l2'],
    activityIds: ['mod-5-1-a1', 'mod-5-1-a2']
  },
  {
    id: 'mod-5-2',
    unitId: 'unit-5',
    title: 'Domain Name System (DNS) Hierarchy',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with Domain?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of Domain Name System (DNS) Hierarchy.'
    },
    lessonIds: ['mod-5-2-l1', 'mod-5-2-l2'],
    activityIds: ['mod-5-2-a1', 'mod-5-2-a2']
  },
  {
    id: 'mod-5-3',
    unitId: 'unit-5',
    title: 'DNS Record Types & Resolution',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with DNS?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of DNS Record Types & Resolution.'
    },
    lessonIds: ['mod-5-3-l1', 'mod-5-3-l2'],
    activityIds: ['mod-5-3-a1', 'mod-5-3-a2']
  },
  {
    id: 'mod-5-4',
    unitId: 'unit-5',
    title: 'Hypertext Transfer Protocol (HTTP) Basics',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with Hypertext?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of Hypertext Transfer Protocol (HTTP) Basics.'
    },
    lessonIds: ['mod-5-4-l1', 'mod-5-4-l2'],
    activityIds: ['mod-5-4-a1', 'mod-5-4-a2']
  },
  {
    id: 'mod-5-5',
    unitId: 'unit-5',
    title: 'HTTP/2 & Persistent Connections',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with HTTP/2?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of HTTP/2 & Persistent Connections.'
    },
    lessonIds: ['mod-5-5-l1', 'mod-5-5-l2'],
    activityIds: ['mod-5-5-a1', 'mod-5-5-a2']
  },
  {
    id: 'mod-5-6',
    unitId: 'unit-5',
    title: 'Secure Sockets Layer (TLS/HTTPS)',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with Secure?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of Secure Sockets Layer (TLS/HTTPS).'
    },
    lessonIds: ['mod-5-6-l1', 'mod-5-6-l2'],
    activityIds: ['mod-5-6-a1', 'mod-5-6-a2']
  },
  {
    id: 'mod-5-7',
    unitId: 'unit-5',
    title: 'Email Protocols (SMTP, POP3, IMAP)',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with Email?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of Email Protocols (SMTP, POP3, IMAP).'
    },
    lessonIds: ['mod-5-7-l1', 'mod-5-7-l2'],
    activityIds: ['mod-5-7-a1', 'mod-5-7-a2']
  },
  {
    id: 'mod-5-8',
    unitId: 'unit-5',
    title: 'Peer-to-Peer (P2P) Applications',
    readingTime: '15 min',
    pedagogy: {
      hook: 'Ever wondered what happens behind the scenes with Peer-to-Peer?',
      analogy: 'Think of this concept like a well-oiled logistics network routing packages worldwide.',
      concept: 'Master the core mechanics, packet structures, and technical specifications of Peer-to-Peer (P2P) Applications.'
    },
    lessonIds: ['mod-5-8-l1', 'mod-5-8-l2'],
    activityIds: ['mod-5-8-a1', 'mod-5-8-a2']
  }
];

export const CURRICULUM: CourseUnit[] = [
  {
    id: 'unit-3',
    title: 'Unit 3: The Network Layer',
    description: 'IP Addressing, Routing, and Subnetting.',
    modules: UNIT_3_MODULES
  },
  {
    id: 'unit-4',
    title: 'Unit 4: The Transport Layer',
    description: 'TCP/UDP, Multiplexing, and Congestion Control.',
    modules: UNIT_4_MODULES
  },
  {
    id: 'unit-5',
    title: 'Unit 5: The Application Layer',
    description: 'DNS, HTTP, Email, and Security Protocols.',
    modules: UNIT_5_MODULES
  }
];

export const NETQUEST_LOGO = "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=150&auto=format&fit=crop&q=80";
export const AVATAR_ALEX = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
export const AVATAR_PRIYA = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80";
export const AVATAR_MARCUS = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80";
export const AVATAR_ELENA = "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80";

export const NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Daily Streak Maintained',
    text: 'You logged in and studied Network Layer today. Streak is now active!',
    time: '10m ago',
    unread: true,
    type: 'streak'
  },
  {
    id: 'notif-2',
    title: 'New Lab Available',
    text: 'Interactive Packet Tracing Lab has been unlocked for Unit 3.',
    time: '1h ago',
    unread: true,
    type: 'assignment'
  },
  {
    id: 'notif-3',
    title: 'Leaderboard Update',
    text: 'Top students in CSE-A just updated. Check your rank!',
    time: '3h ago',
    unread: false,
    type: 'leaderboard'
  }
];

export const BLITZ_QUESTIONS = [
  {
    id: 'bq-1',
    protocol: 'IPv4 Header',
    title: 'Time to Live & Protocol Demux',
    hexDump: [
      '45 00 00 3c 1c 46 40 00',
      '40 06 b1 e6 c0 a8 01 64',
      'c0 a8 01 01 04 00 00 50'
    ],
    question: 'Examining byte 8 (value 0x40 = 64) and byte 9 (value 0x06), which transport layer protocol is encapsulated?',
    options: [
      'UDP (User Datagram Protocol)',
      'TCP (Transmission Control Protocol)',
      'ICMP (Internet Control Message Protocol)',
      'OSPF (Open Shortest Path First)'
    ],
    correctIndex: 1,
    explanation: 'Protocol field value 0x06 in the IPv4 header standard RFC 791 specifies TCP (protocol 6).'
  },
  {
    id: 'bq-2',
    protocol: 'TCP Flags',
    title: 'Three-Way Handshake SYN-ACK Identification',
    hexDump: [
      'e1 45 00 50 a2 11 04 52',
      '00 00 00 00 a0 12 72 10',
      'e6 32 00 00 02 04 05 b4'
    ],
    question: 'The flags byte at offset 13 reads 0x12 (binary 00010010). What TCP control flags are set?',
    options: [
      'SYN and FIN',
      'SYN and ACK',
      'RST and PSH',
      'ACK and URG'
    ],
    correctIndex: 1,
    explanation: '0x12 represents ACK (0x10) and SYN (0x02) bits set, characteristic of the second step of the TCP 3-way handshake.'
  },
  {
    id: 'bq-3',
    protocol: 'DNS Response',
    title: 'Resource Record Query Demultiplexing',
    hexDump: [
      '0a 24 81 80 00 01 00 01',
      '00 00 00 00 06 67 6f 6f',
      '67 6c 65 03 63 6f 6d 00'
    ],
    question: 'The QR flag in the DNS header (bit 15) is 1. What does this indicate?',
    options: [
      'Standard DNS Query from client',
      'DNS Server Response packet',
      'Authoritative Name Server truncation error',
      'Inverse DNS lookup request'
    ],
    correctIndex: 1,
    explanation: 'When QR flag bit is set to 1 in the DNS message header (0x8180), the packet is a response message.'
  }
];

