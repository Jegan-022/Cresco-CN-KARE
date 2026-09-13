export interface QuickCheckQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export type SimulatorType =
  | 'router-cli'
  | 'ipv4-header'
  | 'ipv6-format'
  | 'subnet-calc'
  | 'vlsm-calc'
  | 'dhcp-dora'
  | 'arp-table'
  | 'nat-trans'
  | 'icmp-ping'
  | 'dijkstra-graph'
  | 'distance-vector'
  | 'qos-compare'
  | 'internet-arch'
  | 'bgp-as'
  | 'tcp-handshake'
  | 'tcp-states'
  | 'tcp-sliding-window'
  | 'tcp-congestion'
  | 'udp-header'
  | 'protocols-compare'
  | 'dns-lookup'
  | 'http-builder'
  | 'email-smtp-imap'
  | 'ssh-telnet-compare'
  | 'generic-viewer';

export interface CurriculumModule {
  id: string;
  unitId: 'unit-3' | 'unit-4' | 'unit-5';
  unitTitle: string;
  moduleCode: string;
  title: string;
  duration: string;
  simulatorType: SimulatorType;
  whatIsIt: string;
  whyNeeded: string;
  howItWorks: string[];
  diagramText: string;
  diagramSvgType?: string;
  realWorldExample: string;
  keyPoints: string[];
  quickCheck: QuickCheckQuestion[];
  xpReward: number;
}

export interface UnitInfo {
  id: 'unit-3' | 'unit-4' | 'unit-5';
  unitCode: string;
  title: string;
  subtitle: string;
  description: string;
  moduleCount: number;
  unlockedByDefault: boolean;
  requiredUnitId?: 'unit-3' | 'unit-4';
  examWeight: string;
}


export const COURSE_UNITS: UnitInfo[] = [
  {
    id: 'unit-3',
    unitCode: 'UNIT 3',
    title: 'Network Layer',
    subtitle: 'Routing, IP Addressing, and Subnetting',
    description: 'Master logical addressing, routing algorithms, and core internetwork protocols.',
    moduleCount: 20,
    unlockedByDefault: true,
    examWeight: "30%"
  },
  {
    id: 'unit-4',
    unitCode: 'UNIT 4',
    title: 'Transport Layer',
    subtitle: 'TCP, UDP, and Reliable Data Transfer',
    description: 'Master process-to-process delivery, flow control, error control, and congestion control.',
    moduleCount: 17,
    unlockedByDefault: false,
    examWeight: "40%"
  },
  {
    id: 'unit-5',
    unitCode: 'UNIT 5',
    title: 'Application Layer',
    subtitle: 'HTTP, DNS, Email, and App Protocols',
    description: 'Understand human-facing protocols: Web, Files, Mail, Remote Access, and DNS.',
    moduleCount: 8,
    unlockedByDefault: false,
    examWeight: "30%"
  }
];

export const CURRICULUM_MODULES: CurriculumModule[] = [
  {
    "id": "unit-3-1",
    "unitId": "unit-3",
    "unitTitle": "Unit 3: Network Layer",
    "moduleCode": "3.1",
    "title": "Network Layer — Need, Issues & Services",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of Network Layer — Need, Issues & Services.",
    "whyNeeded": "Understanding Network Layer — Need, Issues & Services is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of Network Layer — Need, Issues & Services parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating Network Layer — Need, Issues & Services flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy Network Layer — Need, Issues & Services to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of Network Layer — Need, Issues & Services",
      "Core concept 2 of Network Layer — Need, Issues & Services",
      "Exam tip for Network Layer — Need, Issues & Services"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-3-1-1",
        "question": "What is the primary function of Network Layer — Need, Issues & Services?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes Network Layer — Need, Issues & Services."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-3-2",
    "unitId": "unit-3",
    "unitTitle": "Unit 3: Network Layer",
    "moduleCode": "3.2",
    "title": "Network Layer Architecture & Packet Forwarding",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of Network Layer Architecture & Packet Forwarding.",
    "whyNeeded": "Understanding Network Layer Architecture & Packet Forwarding is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of Network Layer Architecture & Packet Forwarding parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating Network Layer Architecture & Packet Forwarding flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy Network Layer Architecture & Packet Forwarding to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of Network Layer Architecture & Packet Forwarding",
      "Core concept 2 of Network Layer Architecture & Packet Forwarding",
      "Exam tip for Network Layer Architecture & Packet Forwarding"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-3-2-1",
        "question": "What is the primary function of Network Layer Architecture & Packet Forwarding?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes Network Layer Architecture & Packet Forwarding."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-3-3",
    "unitId": "unit-3",
    "unitTitle": "Unit 3: Network Layer",
    "moduleCode": "3.3",
    "title": "Routing Algorithms — Fundamentals",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of Routing Algorithms — Fundamentals.",
    "whyNeeded": "Understanding Routing Algorithms — Fundamentals is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of Routing Algorithms — Fundamentals parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating Routing Algorithms — Fundamentals flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy Routing Algorithms — Fundamentals to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of Routing Algorithms — Fundamentals",
      "Core concept 2 of Routing Algorithms — Fundamentals",
      "Exam tip for Routing Algorithms — Fundamentals"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-3-3-1",
        "question": "What is the primary function of Routing Algorithms — Fundamentals?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes Routing Algorithms — Fundamentals."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-3-4",
    "unitId": "unit-3",
    "unitTitle": "Unit 3: Network Layer",
    "moduleCode": "3.4",
    "title": "Distance Vector Routing",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of Distance Vector Routing.",
    "whyNeeded": "Understanding Distance Vector Routing is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of Distance Vector Routing parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating Distance Vector Routing flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy Distance Vector Routing to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of Distance Vector Routing",
      "Core concept 2 of Distance Vector Routing",
      "Exam tip for Distance Vector Routing"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-3-4-1",
        "question": "What is the primary function of Distance Vector Routing?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes Distance Vector Routing."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-3-5",
    "unitId": "unit-3",
    "unitTitle": "Unit 3: Network Layer",
    "moduleCode": "3.5",
    "title": "Link State Routing",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of Link State Routing.",
    "whyNeeded": "Understanding Link State Routing is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of Link State Routing parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating Link State Routing flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy Link State Routing to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of Link State Routing",
      "Core concept 2 of Link State Routing",
      "Exam tip for Link State Routing"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-3-5-1",
        "question": "What is the primary function of Link State Routing?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes Link State Routing."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-3-6",
    "unitId": "unit-3",
    "unitTitle": "Unit 3: Network Layer",
    "moduleCode": "3.6",
    "title": "Distance Vector vs Link State",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of Distance Vector vs Link State.",
    "whyNeeded": "Understanding Distance Vector vs Link State is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of Distance Vector vs Link State parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating Distance Vector vs Link State flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy Distance Vector vs Link State to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of Distance Vector vs Link State",
      "Core concept 2 of Distance Vector vs Link State",
      "Exam tip for Distance Vector vs Link State"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-3-6-1",
        "question": "What is the primary function of Distance Vector vs Link State?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes Distance Vector vs Link State."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-3-7",
    "unitId": "unit-3",
    "unitTitle": "Unit 3: Network Layer",
    "moduleCode": "3.7",
    "title": "Quality of Service — QoS",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of Quality of Service — QoS.",
    "whyNeeded": "Understanding Quality of Service — QoS is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of Quality of Service — QoS parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating Quality of Service — QoS flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy Quality of Service — QoS to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of Quality of Service — QoS",
      "Core concept 2 of Quality of Service — QoS",
      "Exam tip for Quality of Service — QoS"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-3-7-1",
        "question": "What is the primary function of Quality of Service — QoS?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes Quality of Service — QoS."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-3-8",
    "unitId": "unit-3",
    "unitTitle": "Unit 3: Network Layer",
    "moduleCode": "3.8",
    "title": "IPv4 Features & Addressing",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of IPv4 Features & Addressing.",
    "whyNeeded": "Understanding IPv4 Features & Addressing is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of IPv4 Features & Addressing parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating IPv4 Features & Addressing flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy IPv4 Features & Addressing to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of IPv4 Features & Addressing",
      "Core concept 2 of IPv4 Features & Addressing",
      "Exam tip for IPv4 Features & Addressing"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-3-8-1",
        "question": "What is the primary function of IPv4 Features & Addressing?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes IPv4 Features & Addressing."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-3-9",
    "unitId": "unit-3",
    "unitTitle": "Unit 3: Network Layer",
    "moduleCode": "3.9",
    "title": "IPv4 Packet Format",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of IPv4 Packet Format.",
    "whyNeeded": "Understanding IPv4 Packet Format is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of IPv4 Packet Format parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating IPv4 Packet Format flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy IPv4 Packet Format to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of IPv4 Packet Format",
      "Core concept 2 of IPv4 Packet Format",
      "Exam tip for IPv4 Packet Format"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-3-9-1",
        "question": "What is the primary function of IPv4 Packet Format?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes IPv4 Packet Format."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-3-10",
    "unitId": "unit-3",
    "unitTitle": "Unit 3: Network Layer",
    "moduleCode": "3.10",
    "title": "IPv6 Features & Addressing",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of IPv6 Features & Addressing.",
    "whyNeeded": "Understanding IPv6 Features & Addressing is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of IPv6 Features & Addressing parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating IPv6 Features & Addressing flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy IPv6 Features & Addressing to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of IPv6 Features & Addressing",
      "Core concept 2 of IPv6 Features & Addressing",
      "Exam tip for IPv6 Features & Addressing"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-3-10-1",
        "question": "What is the primary function of IPv6 Features & Addressing?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes IPv6 Features & Addressing."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-3-11",
    "unitId": "unit-3",
    "unitTitle": "Unit 3: Network Layer",
    "moduleCode": "3.11",
    "title": "IPv6 Packet Format",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of IPv6 Packet Format.",
    "whyNeeded": "Understanding IPv6 Packet Format is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of IPv6 Packet Format parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating IPv6 Packet Format flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy IPv6 Packet Format to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of IPv6 Packet Format",
      "Core concept 2 of IPv6 Packet Format",
      "Exam tip for IPv6 Packet Format"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-3-11-1",
        "question": "What is the primary function of IPv6 Packet Format?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes IPv6 Packet Format."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-3-12",
    "unitId": "unit-3",
    "unitTitle": "Unit 3: Network Layer",
    "moduleCode": "3.12",
    "title": "Network Addressing & Address Classes",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of Network Addressing & Address Classes.",
    "whyNeeded": "Understanding Network Addressing & Address Classes is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of Network Addressing & Address Classes parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating Network Addressing & Address Classes flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy Network Addressing & Address Classes to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of Network Addressing & Address Classes",
      "Core concept 2 of Network Addressing & Address Classes",
      "Exam tip for Network Addressing & Address Classes"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-3-12-1",
        "question": "What is the primary function of Network Addressing & Address Classes?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes Network Addressing & Address Classes."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-3-13",
    "unitId": "unit-3",
    "unitTitle": "Unit 3: Network Layer",
    "moduleCode": "3.13",
    "title": "Router Configuration Fundamentals",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of Router Configuration Fundamentals.",
    "whyNeeded": "Understanding Router Configuration Fundamentals is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of Router Configuration Fundamentals parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating Router Configuration Fundamentals flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy Router Configuration Fundamentals to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of Router Configuration Fundamentals",
      "Core concept 2 of Router Configuration Fundamentals",
      "Exam tip for Router Configuration Fundamentals"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-3-13-1",
        "question": "What is the primary function of Router Configuration Fundamentals?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes Router Configuration Fundamentals."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-3-14",
    "unitId": "unit-3",
    "unitTitle": "Unit 3: Network Layer",
    "moduleCode": "3.14",
    "title": "RIP",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of RIP.",
    "whyNeeded": "Understanding RIP is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of RIP parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating RIP flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy RIP to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of RIP",
      "Core concept 2 of RIP",
      "Exam tip for RIP"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-3-14-1",
        "question": "What is the primary function of RIP?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes RIP."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-3-15",
    "unitId": "unit-3",
    "unitTitle": "Unit 3: Network Layer",
    "moduleCode": "3.15",
    "title": "OSPF",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of OSPF.",
    "whyNeeded": "Understanding OSPF is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of OSPF parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating OSPF flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy OSPF to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of OSPF",
      "Core concept 2 of OSPF",
      "Exam tip for OSPF"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-3-15-1",
        "question": "What is the primary function of OSPF?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes OSPF."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-3-16",
    "unitId": "unit-3",
    "unitTitle": "Unit 3: Network Layer",
    "moduleCode": "3.16",
    "title": "BGP",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of BGP.",
    "whyNeeded": "Understanding BGP is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of BGP parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating BGP flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy BGP to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of BGP",
      "Core concept 2 of BGP",
      "Exam tip for BGP"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-3-16-1",
        "question": "What is the primary function of BGP?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes BGP."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-3-17",
    "unitId": "unit-3",
    "unitTitle": "Unit 3: Network Layer",
    "moduleCode": "3.17",
    "title": "Subnetting",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of Subnetting.",
    "whyNeeded": "Understanding Subnetting is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of Subnetting parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating Subnetting flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy Subnetting to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of Subnetting",
      "Core concept 2 of Subnetting",
      "Exam tip for Subnetting"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-3-17-1",
        "question": "What is the primary function of Subnetting?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes Subnetting."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-3-18",
    "unitId": "unit-3",
    "unitTitle": "Unit 3: Network Layer",
    "moduleCode": "3.18",
    "title": "CIDR & VLSM",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of CIDR & VLSM.",
    "whyNeeded": "Understanding CIDR & VLSM is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of CIDR & VLSM parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating CIDR & VLSM flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy CIDR & VLSM to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of CIDR & VLSM",
      "Core concept 2 of CIDR & VLSM",
      "Exam tip for CIDR & VLSM"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-3-18-1",
        "question": "What is the primary function of CIDR & VLSM?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes CIDR & VLSM."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-3-19",
    "unitId": "unit-3",
    "unitTitle": "Unit 3: Network Layer",
    "moduleCode": "3.19",
    "title": "DHCP, ARP & NAT",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of DHCP, ARP & NAT.",
    "whyNeeded": "Understanding DHCP, ARP & NAT is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of DHCP, ARP & NAT parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating DHCP, ARP & NAT flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy DHCP, ARP & NAT to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of DHCP, ARP & NAT",
      "Core concept 2 of DHCP, ARP & NAT",
      "Exam tip for DHCP, ARP & NAT"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-3-19-1",
        "question": "What is the primary function of DHCP, ARP & NAT?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes DHCP, ARP & NAT."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-3-20",
    "unitId": "unit-3",
    "unitTitle": "Unit 3: Network Layer",
    "moduleCode": "3.20",
    "title": "ICMP & Network Diagnostics",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of ICMP & Network Diagnostics.",
    "whyNeeded": "Understanding ICMP & Network Diagnostics is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of ICMP & Network Diagnostics parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating ICMP & Network Diagnostics flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy ICMP & Network Diagnostics to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of ICMP & Network Diagnostics",
      "Core concept 2 of ICMP & Network Diagnostics",
      "Exam tip for ICMP & Network Diagnostics"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-3-20-1",
        "question": "What is the primary function of ICMP & Network Diagnostics?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes ICMP & Network Diagnostics."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-4-1",
    "unitId": "unit-4",
    "unitTitle": "Unit 4: Transport Layer",
    "moduleCode": "4.1",
    "title": "Transport Layer Introduction & Services",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of Transport Layer Introduction & Services.",
    "whyNeeded": "Understanding Transport Layer Introduction & Services is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of Transport Layer Introduction & Services parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating Transport Layer Introduction & Services flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy Transport Layer Introduction & Services to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of Transport Layer Introduction & Services",
      "Core concept 2 of Transport Layer Introduction & Services",
      "Exam tip for Transport Layer Introduction & Services"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-4-1-1",
        "question": "What is the primary function of Transport Layer Introduction & Services?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes Transport Layer Introduction & Services."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-4-2",
    "unitId": "unit-4",
    "unitTitle": "Unit 4: Transport Layer",
    "moduleCode": "4.2",
    "title": "Process-to-Process Communication & Port Numbers",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of Process-to-Process Communication & Port Numbers.",
    "whyNeeded": "Understanding Process-to-Process Communication & Port Numbers is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of Process-to-Process Communication & Port Numbers parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating Process-to-Process Communication & Port Numbers flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy Process-to-Process Communication & Port Numbers to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of Process-to-Process Communication & Port Numbers",
      "Core concept 2 of Process-to-Process Communication & Port Numbers",
      "Exam tip for Process-to-Process Communication & Port Numbers"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-4-2-1",
        "question": "What is the primary function of Process-to-Process Communication & Port Numbers?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes Process-to-Process Communication & Port Numbers."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-4-3",
    "unitId": "unit-4",
    "unitTitle": "Unit 4: Transport Layer",
    "moduleCode": "4.3",
    "title": "Connectionless vs Connection-Oriented Protocols",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of Connectionless vs Connection-Oriented Protocols.",
    "whyNeeded": "Understanding Connectionless vs Connection-Oriented Protocols is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of Connectionless vs Connection-Oriented Protocols parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating Connectionless vs Connection-Oriented Protocols flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy Connectionless vs Connection-Oriented Protocols to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of Connectionless vs Connection-Oriented Protocols",
      "Core concept 2 of Connectionless vs Connection-Oriented Protocols",
      "Exam tip for Connectionless vs Connection-Oriented Protocols"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-4-3-1",
        "question": "What is the primary function of Connectionless vs Connection-Oriented Protocols?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes Connectionless vs Connection-Oriented Protocols."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-4-4",
    "unitId": "unit-4",
    "unitTitle": "Unit 4: Transport Layer",
    "moduleCode": "4.4",
    "title": "Simple Protocol",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of Simple Protocol.",
    "whyNeeded": "Understanding Simple Protocol is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of Simple Protocol parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating Simple Protocol flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy Simple Protocol to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of Simple Protocol",
      "Core concept 2 of Simple Protocol",
      "Exam tip for Simple Protocol"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-4-4-1",
        "question": "What is the primary function of Simple Protocol?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes Simple Protocol."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-4-5",
    "unitId": "unit-4",
    "unitTitle": "Unit 4: Transport Layer",
    "moduleCode": "4.5",
    "title": "Stop-and-Wait Protocol",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of Stop-and-Wait Protocol.",
    "whyNeeded": "Understanding Stop-and-Wait Protocol is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of Stop-and-Wait Protocol parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating Stop-and-Wait Protocol flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy Stop-and-Wait Protocol to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of Stop-and-Wait Protocol",
      "Core concept 2 of Stop-and-Wait Protocol",
      "Exam tip for Stop-and-Wait Protocol"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-4-5-1",
        "question": "What is the primary function of Stop-and-Wait Protocol?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes Stop-and-Wait Protocol."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-4-6",
    "unitId": "unit-4",
    "unitTitle": "Unit 4: Transport Layer",
    "moduleCode": "4.6",
    "title": "Go-Back-N",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of Go-Back-N.",
    "whyNeeded": "Understanding Go-Back-N is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of Go-Back-N parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating Go-Back-N flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy Go-Back-N to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of Go-Back-N",
      "Core concept 2 of Go-Back-N",
      "Exam tip for Go-Back-N"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-4-6-1",
        "question": "What is the primary function of Go-Back-N?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes Go-Back-N."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-4-7",
    "unitId": "unit-4",
    "unitTitle": "Unit 4: Transport Layer",
    "moduleCode": "4.7",
    "title": "Selective Repeat",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of Selective Repeat.",
    "whyNeeded": "Understanding Selective Repeat is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of Selective Repeat parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating Selective Repeat flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy Selective Repeat to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of Selective Repeat",
      "Core concept 2 of Selective Repeat",
      "Exam tip for Selective Repeat"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-4-7-1",
        "question": "What is the primary function of Selective Repeat?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes Selective Repeat."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-4-8",
    "unitId": "unit-4",
    "unitTitle": "Unit 4: Transport Layer",
    "moduleCode": "4.8",
    "title": "Reliable Data Transfer Comparison",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of Reliable Data Transfer Comparison.",
    "whyNeeded": "Understanding Reliable Data Transfer Comparison is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of Reliable Data Transfer Comparison parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating Reliable Data Transfer Comparison flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy Reliable Data Transfer Comparison to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of Reliable Data Transfer Comparison",
      "Core concept 2 of Reliable Data Transfer Comparison",
      "Exam tip for Reliable Data Transfer Comparison"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-4-8-1",
        "question": "What is the primary function of Reliable Data Transfer Comparison?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes Reliable Data Transfer Comparison."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-4-9",
    "unitId": "unit-4",
    "unitTitle": "Unit 4: Transport Layer",
    "moduleCode": "4.9",
    "title": "UDP Introduction & User Datagram",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of UDP Introduction & User Datagram.",
    "whyNeeded": "Understanding UDP Introduction & User Datagram is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of UDP Introduction & User Datagram parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating UDP Introduction & User Datagram flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy UDP Introduction & User Datagram to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of UDP Introduction & User Datagram",
      "Core concept 2 of UDP Introduction & User Datagram",
      "Exam tip for UDP Introduction & User Datagram"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-4-9-1",
        "question": "What is the primary function of UDP Introduction & User Datagram?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes UDP Introduction & User Datagram."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-4-10",
    "unitId": "unit-4",
    "unitTitle": "Unit 4: Transport Layer",
    "moduleCode": "4.10",
    "title": "UDP Services",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of UDP Services.",
    "whyNeeded": "Understanding UDP Services is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of UDP Services parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating UDP Services flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy UDP Services to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of UDP Services",
      "Core concept 2 of UDP Services",
      "Exam tip for UDP Services"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-4-10-1",
        "question": "What is the primary function of UDP Services?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes UDP Services."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-4-11",
    "unitId": "unit-4",
    "unitTitle": "Unit 4: Transport Layer",
    "moduleCode": "4.11",
    "title": "UDP Applications",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of UDP Applications.",
    "whyNeeded": "Understanding UDP Applications is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of UDP Applications parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating UDP Applications flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy UDP Applications to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of UDP Applications",
      "Core concept 2 of UDP Applications",
      "Exam tip for UDP Applications"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-4-11-1",
        "question": "What is the primary function of UDP Applications?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes UDP Applications."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-4-12",
    "unitId": "unit-4",
    "unitTitle": "Unit 4: Transport Layer",
    "moduleCode": "4.12",
    "title": "TCP Introduction & Features",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of TCP Introduction & Features.",
    "whyNeeded": "Understanding TCP Introduction & Features is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of TCP Introduction & Features parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating TCP Introduction & Features flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy TCP Introduction & Features to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of TCP Introduction & Features",
      "Core concept 2 of TCP Introduction & Features",
      "Exam tip for TCP Introduction & Features"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-4-12-1",
        "question": "What is the primary function of TCP Introduction & Features?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes TCP Introduction & Features."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-4-13",
    "unitId": "unit-4",
    "unitTitle": "Unit 4: Transport Layer",
    "moduleCode": "4.13",
    "title": "TCP Segment Format",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of TCP Segment Format.",
    "whyNeeded": "Understanding TCP Segment Format is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of TCP Segment Format parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating TCP Segment Format flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy TCP Segment Format to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of TCP Segment Format",
      "Core concept 2 of TCP Segment Format",
      "Exam tip for TCP Segment Format"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-4-13-1",
        "question": "What is the primary function of TCP Segment Format?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes TCP Segment Format."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-4-14",
    "unitId": "unit-4",
    "unitTitle": "Unit 4: Transport Layer",
    "moduleCode": "4.14",
    "title": "TCP Connection & Three-Way Handshake",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of TCP Connection & Three-Way Handshake.",
    "whyNeeded": "Understanding TCP Connection & Three-Way Handshake is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of TCP Connection & Three-Way Handshake parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating TCP Connection & Three-Way Handshake flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy TCP Connection & Three-Way Handshake to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of TCP Connection & Three-Way Handshake",
      "Core concept 2 of TCP Connection & Three-Way Handshake",
      "Exam tip for TCP Connection & Three-Way Handshake"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-4-14-1",
        "question": "What is the primary function of TCP Connection & Three-Way Handshake?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes TCP Connection & Three-Way Handshake."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-4-15",
    "unitId": "unit-4",
    "unitTitle": "Unit 4: Transport Layer",
    "moduleCode": "4.15",
    "title": "TCP State Transition Diagram",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of TCP State Transition Diagram.",
    "whyNeeded": "Understanding TCP State Transition Diagram is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of TCP State Transition Diagram parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating TCP State Transition Diagram flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy TCP State Transition Diagram to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of TCP State Transition Diagram",
      "Core concept 2 of TCP State Transition Diagram",
      "Exam tip for TCP State Transition Diagram"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-4-15-1",
        "question": "What is the primary function of TCP State Transition Diagram?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes TCP State Transition Diagram."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-4-16",
    "unitId": "unit-4",
    "unitTitle": "Unit 4: Transport Layer",
    "moduleCode": "4.16",
    "title": "TCP Windows, Flow Control & Error Control",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of TCP Windows, Flow Control & Error Control.",
    "whyNeeded": "Understanding TCP Windows, Flow Control & Error Control is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of TCP Windows, Flow Control & Error Control parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating TCP Windows, Flow Control & Error Control flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy TCP Windows, Flow Control & Error Control to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of TCP Windows, Flow Control & Error Control",
      "Core concept 2 of TCP Windows, Flow Control & Error Control",
      "Exam tip for TCP Windows, Flow Control & Error Control"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-4-16-1",
        "question": "What is the primary function of TCP Windows, Flow Control & Error Control?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes TCP Windows, Flow Control & Error Control."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-4-17",
    "unitId": "unit-4",
    "unitTitle": "Unit 4: Transport Layer",
    "moduleCode": "4.17",
    "title": "TCP Congestion Control",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of TCP Congestion Control.",
    "whyNeeded": "Understanding TCP Congestion Control is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of TCP Congestion Control parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating TCP Congestion Control flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy TCP Congestion Control to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of TCP Congestion Control",
      "Core concept 2 of TCP Congestion Control",
      "Exam tip for TCP Congestion Control"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-4-17-1",
        "question": "What is the primary function of TCP Congestion Control?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes TCP Congestion Control."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-5-1",
    "unitId": "unit-5",
    "unitTitle": "Unit 5: Application Layer",
    "moduleCode": "5.1",
    "title": "WWW Fundamentals",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of WWW Fundamentals.",
    "whyNeeded": "Understanding WWW Fundamentals is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of WWW Fundamentals parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating WWW Fundamentals flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy WWW Fundamentals to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of WWW Fundamentals",
      "Core concept 2 of WWW Fundamentals",
      "Exam tip for WWW Fundamentals"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-5-1-1",
        "question": "What is the primary function of WWW Fundamentals?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes WWW Fundamentals."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-5-2",
    "unitId": "unit-5",
    "unitTitle": "Unit 5: Application Layer",
    "moduleCode": "5.2",
    "title": "HTTP & HTTPS",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of HTTP & HTTPS.",
    "whyNeeded": "Understanding HTTP & HTTPS is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of HTTP & HTTPS parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating HTTP & HTTPS flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy HTTP & HTTPS to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of HTTP & HTTPS",
      "Core concept 2 of HTTP & HTTPS",
      "Exam tip for HTTP & HTTPS"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-5-2-1",
        "question": "What is the primary function of HTTP & HTTPS?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes HTTP & HTTPS."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-5-3",
    "unitId": "unit-5",
    "unitTitle": "Unit 5: Application Layer",
    "moduleCode": "5.3",
    "title": "FTP",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of FTP.",
    "whyNeeded": "Understanding FTP is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of FTP parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating FTP flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy FTP to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of FTP",
      "Core concept 2 of FTP",
      "Exam tip for FTP"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-5-3-1",
        "question": "What is the primary function of FTP?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes FTP."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-5-4",
    "unitId": "unit-5",
    "unitTitle": "Unit 5: Application Layer",
    "moduleCode": "5.4",
    "title": "Email Architecture",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of Email Architecture.",
    "whyNeeded": "Understanding Email Architecture is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of Email Architecture parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating Email Architecture flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy Email Architecture to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of Email Architecture",
      "Core concept 2 of Email Architecture",
      "Exam tip for Email Architecture"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-5-4-1",
        "question": "What is the primary function of Email Architecture?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes Email Architecture."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-5-5",
    "unitId": "unit-5",
    "unitTitle": "Unit 5: Application Layer",
    "moduleCode": "5.5",
    "title": "SMTP, POP3 & IMAP",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of SMTP, POP3 & IMAP.",
    "whyNeeded": "Understanding SMTP, POP3 & IMAP is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of SMTP, POP3 & IMAP parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating SMTP, POP3 & IMAP flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy SMTP, POP3 & IMAP to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of SMTP, POP3 & IMAP",
      "Core concept 2 of SMTP, POP3 & IMAP",
      "Exam tip for SMTP, POP3 & IMAP"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-5-5-1",
        "question": "What is the primary function of SMTP, POP3 & IMAP?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes SMTP, POP3 & IMAP."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-5-6",
    "unitId": "unit-5",
    "unitTitle": "Unit 5: Application Layer",
    "moduleCode": "5.6",
    "title": "Telnet",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of Telnet.",
    "whyNeeded": "Understanding Telnet is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of Telnet parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating Telnet flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy Telnet to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of Telnet",
      "Core concept 2 of Telnet",
      "Exam tip for Telnet"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-5-6-1",
        "question": "What is the primary function of Telnet?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes Telnet."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-5-7",
    "unitId": "unit-5",
    "unitTitle": "Unit 5: Application Layer",
    "moduleCode": "5.7",
    "title": "SSH",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of SSH.",
    "whyNeeded": "Understanding SSH is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of SSH parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating SSH flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy SSH to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of SSH",
      "Core concept 2 of SSH",
      "Exam tip for SSH"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-5-7-1",
        "question": "What is the primary function of SSH?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes SSH."
      }
    ],
    "xpReward": 50
  },
  {
    "id": "unit-5-8",
    "unitId": "unit-5",
    "unitTitle": "Unit 5: Application Layer",
    "moduleCode": "5.8",
    "title": "DNS",
    "duration": "10 mins",
    "simulatorType": "generic-viewer",
    "whatIsIt": "Detailed technical overview of DNS.",
    "whyNeeded": "Understanding DNS is crucial for designing and troubleshooting robust computer networks.",
    "howItWorks": [
      "Step 1: Initialization of DNS parameters.",
      "Step 2: Execution of core algorithms.",
      "Step 3: Packet transmission and verification."
    ],
    "diagramText": "Diagram illustrating DNS flow.",
    "diagramSvgType": "network-generic",
    "realWorldExample": "Enterprise networks deploy DNS to ensure reliable communication.",
    "keyPoints": [
      "Core concept 1 of DNS",
      "Core concept 2 of DNS",
      "Exam tip for DNS"
    ],
    "quickCheck": [
      {
        "id": "qc-unit-5-8-1",
        "question": "What is the primary function of DNS?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctIndex": 0,
        "explanation": "Option A correctly describes DNS."
      }
    ],
    "xpReward": 50
  }
];

export const ALL_UNITS = COURSE_UNITS;
export const UNIT_3_MODULES = CURRICULUM_MODULES.filter(m => m.unitId === 'unit-3');
export const UNIT_4_MODULES = CURRICULUM_MODULES.filter(m => m.unitId === 'unit-4');
export const UNIT_5_MODULES = CURRICULUM_MODULES.filter(m => m.unitId === 'unit-5');
