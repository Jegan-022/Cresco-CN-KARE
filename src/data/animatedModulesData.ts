export interface AnimatedModuleMetadata {
  id: number;
  title: string;
  unit: string;
  description: string;
  url: string;
  available: boolean;
  tag: string;
}

export const ANIMATED_MODULES: AnimatedModuleMetadata[] = [
  {
    id: 1,
    title: 'Transport Layer Need and Issues',
    unit: 'Unit 4 · Transport Layer',
    description: 'Multiplexing, port addressing, segmentation, reassembly, loss recovery, and flow control simulation.',
    url: '/animated_learn_1',
    available: true,
    tag: 'Interactive SIM'
  },
  {
    id: 2,
    title: 'Transport Service',
    unit: 'Unit 4 · Transport Layer',
    description: 'Transport service primitives, socket interfaces, and end-to-end quality of service (QoS) guarantees.',
    url: '/animated_learn_2',
    available: true,
    tag: 'Interactive SIM'
  },
  {
    id: 3,
    title: 'Elements of Transport Protocols',
    unit: 'Unit 4 · Transport Layer',
    description: 'Addressing, connection establishment, release, flow control, buffering, and multiplexing fundamentals.',
    url: '/animated_learn_3',
    available: true,
    tag: 'Interactive SIM'
  },
  {
    id: 4,
    title: 'Simple Transport Protocol',
    unit: 'Unit 4 · Transport Layer',
    description: 'Stop-and-wait, sequence numbers, timer management, and positive acknowledgment mechanisms.',
    url: '/animated_learn_4',
    available: true,
    tag: 'Interactive SIM'
  },
  {
    id: 5,
    title: 'TCP (Transmission Control Protocol)',
    unit: 'Unit 4 · Transport Layer',
    description: 'TCP 3-way handshake, sliding window, cumulative ACKs, and graceful 4-way termination.',
    url: '/animated_learn_5',
    available: true,
    tag: 'Interactive SIM'
  },
  {
    id: 6,
    title: 'UDP (User Datagram Protocol)',
    unit: 'Unit 4 · Transport Layer',
    description: 'Connectionless datagram delivery, low-latency streaming, and lightweight 8-byte header mechanics.',
    url: '/animated_learn_6',
    available: true,
    tag: 'Interactive SIM'
  },
  {
    id: 7,
    title: 'Transport-Level Security',
    unit: 'Unit 4 · Transport Layer',
    description: 'End-to-end cryptographic protection, confidentiality, integrity, and replay attack defense.',
    url: '/animated_learn_7',
    available: true,
    tag: 'Interactive SIM'
  },
  {
    id: 8,
    title: 'Secure Sockets Layer (SSL)',
    unit: 'Unit 4 · Transport Layer',
    description: 'Record layer framing, handshake negotiation, cipher suites, and session resumption.',
    url: '/animated_learn_8',
    available: true,
    tag: 'Interactive SIM'
  },
  {
    id: 9,
    title: 'Transport Layer Security (TLS)',
    unit: 'Unit 4 · Transport Layer',
    description: 'TLS 1.2/1.3 cryptographic key exchange, ECDHE, forward secrecy, and certificate chains.',
    url: '/animated_learn_9',
    available: true,
    tag: 'Interactive SIM'
  },
  {
    id: 10,
    title: 'Secure Shell (SSH)',
    unit: 'Unit 4 · Transport Layer',
    description: 'SSH transport protocol, host key verification, user authentication, and encrypted tunneling.',
    url: '/animated_learn_10',
    available: true,
    tag: 'Interactive SIM'
  },
  {
    id: 11,
    title: 'Network Layer Need and Issues',
    unit: 'Unit 3 · Network Layer',
    description: 'Virtual circuits vs datagram subnets, store-and-forward packet switching, and host routing.',
    url: '/animated_learn_11',
    available: true,
    tag: 'Interactive SIM'
  },
  {
    id: 12,
    title: 'Routing Algorithms',
    unit: 'Unit 3 · Network Layer',
    description: 'Shortest path (Dijkstra), Distance Vector (Bellman-Ford), and Link State routing protocols.',
    url: '/animated_learn_12',
    available: true,
    tag: 'Interactive SIM'
  },
  {
    id: 13,
    title: 'Congestion Control',
    unit: 'Unit 3 · Network Layer',
    description: 'Traffic policing, token bucket, choke packets, random early detection (RED), and highway traffic lab.',
    url: '/animated_learn_13',
    available: true,
    tag: 'Interactive SIM'
  },
  {
    id: 14,
    title: 'Network Layer in Internet',
    unit: 'Unit 3 · Network Layer',
    description: 'Global internet map, IPv4/IPv6 packet format, fragmentation and reassembly, and packet journey.',
    url: '/animated_learn_14',
    available: true,
    tag: 'Interactive SIM'
  },
  {
    id: 15,
    title: 'Network Addressing',
    unit: 'Unit 3 · Network Layer',
    description: 'Postal address city analogy, classful vs CIDR subnetting, netmasks, and IP addressing lab.',
    url: '/animated_learn_15',
    available: true,
    tag: 'Interactive SIM'
  },
  {
    id: 16,
    title: 'Router Configuration',
    unit: 'Unit 3 · Network Layer',
    description: 'Network command center, routing tables, longest prefix match, default gateways, and router lab.',
    url: '/animated_learn_16',
    available: true,
    tag: 'Interactive SIM'
  },
  {
    id: 17,
    title: 'Address Resolution Protocol (ARP)',
    unit: 'Unit 3 · Network Layer',
    description: 'Local network broadcast, IP-to-MAC resolution, cache tables, and ARP request/reply simulation.',
    url: '/animated_learn_17',
    available: true,
    tag: 'Interactive SIM'
  },
  {
    id: 18,
    title: 'Reverse ARP (RARP)',
    unit: 'Unit 3 · Network Layer',
    description: 'Diskless workstation bootstrap, MAC-to-IP lookup, and RARP server query mechanics.',
    url: '/animated_learn_18',
    available: true,
    tag: 'Interactive SIM'
  },
  {
    id: 19,
    title: 'Network Access Control (NAC)',
    unit: 'Unit 3 · Network Layer',
    description: 'Pre-admission compliance checks, endpoint posture assessment, and dynamic quarantine VLANs.',
    url: '/animated_learn_19',
    available: true,
    tag: 'Interactive SIM'
  },
  {
    id: 20,
    title: 'Extensible Authentication Protocol (EAP)',
    unit: 'Unit 3 · Network Layer',
    description: 'EAP-TLS, EAP-PEAP, peer-authenticator-server message exchanges, and mutual authentication.',
    url: '/animated_learn_20',
    available: true,
    tag: 'Interactive SIM'
  },
  {
    id: 21,
    title: 'IEEE 802.1X Port-Based Network Access',
    unit: 'Unit 3 · Network Layer',
    description: 'Supplicant, authenticator, and authentication server roles with controlled port transitions.',
    url: '/animated_learn_21',
    available: true,
    tag: 'Interactive SIM'
  },
  {
    id: 22,
    title: 'Domain Name System (DNS)',
    unit: 'Unit 5 · Application Layer',
    description: 'Hierarchical namespace, iterative vs recursive queries, root servers, and DNS resolution journeys.',
    url: '/animated_learn_22',
    available: false,
    tag: 'Coming Soon'
  },
  {
    id: 23,
    title: 'HTTP & HTTPS Web Protocols',
    unit: 'Unit 5 · Application Layer',
    description: 'Stateless request/response cycle, persistent HTTP/2 & HTTP/3 streams, and TLS negotiation.',
    url: '/animated_learn_23',
    available: false,
    tag: 'Coming Soon'
  },
  {
    id: 24,
    title: 'File Transfer Protocol (FTP)',
    unit: 'Unit 5 · Application Layer',
    description: 'Active vs passive mode, dual-channel control (port 21) and data (port 20) connection mechanics.',
    url: '/animated_learn_24',
    available: false,
    tag: 'Coming Soon'
  },
  {
    id: 25,
    title: 'Electronic Mail (SMTP, POP3, IMAP)',
    unit: 'Unit 5 · Application Layer',
    description: 'Store-and-forward mail transfer, message envelopes, MIME headers, and client mailbox sync.',
    url: '/animated_learn_25',
    available: false,
    tag: 'Coming Soon'
  },
  {
    id: 26,
    title: 'Dynamic Host Configuration (DHCP)',
    unit: 'Unit 5 · Application Layer',
    description: 'DORA exchange (Discover, Offer, Request, Acknowledge), lease renewal, and subnet assignment.',
    url: '/animated_learn_26',
    available: false,
    tag: 'Coming Soon'
  },
  {
    id: 27,
    title: 'Simple Network Management (SNMP)',
    unit: 'Unit 5 · Application Layer',
    description: 'Management Information Base (MIB), SMI syntax, trap notifications, and managed agent polling.',
    url: '/animated_learn_27',
    available: false,
    tag: 'Coming Soon'
  },
  {
    id: 28,
    title: 'Public Key Cryptography & PKI',
    unit: 'Unit 5 · Security & Systems',
    description: 'Asymmetric encryption, X.509 digital certificates, certificate authorities, and digital signatures.',
    url: '/animated_learn_28',
    available: false,
    tag: 'Coming Soon'
  },
  {
    id: 29,
    title: 'Firewalls & Packet Filters',
    unit: 'Unit 5 · Security & Systems',
    description: 'Stateful packet inspection, stateless ACLs, DMZ zone isolation, and proxy application gateways.',
    url: '/animated_learn_29',
    available: false,
    tag: 'Coming Soon'
  },
  {
    id: 30,
    title: 'Software-Defined Networking (SDN)',
    unit: 'Unit 5 · Advanced Systems',
    description: 'Control plane and data plane decoupling, OpenFlow protocol tables, and controller architecture.',
    url: '/animated_learn_30',
    available: false,
    tag: 'Coming Soon'
  }
];
