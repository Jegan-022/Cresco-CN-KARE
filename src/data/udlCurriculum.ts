/**
 * CRESCO Production — Universal Design for Learning (UDL) Curriculum Bank
 *
 * Course: CS-4200 (Computer Networks)
 * Module A: IPv4 Addressing & Subnetting (Network Layer)
 * Module B: TCP & UDP Architecture (Transport Layer)
 *
 * Framework Dimensions:
 * 1. Multiple Means of Representation (visuals, formulas, tables, packet maps, audio transcripts)
 * 2. Multiple Means of Engagement (interactive simulations, progressive hints, role-play, challenges)
 * 3. Multiple Means of Action & Expression (math input, diagrams, interactive calculators, scenario analysis)
 */

export interface UdlSubnetProblem {
  id: string;
  title: string;
  networkAddress: string;
  originalPrefix: number;
  subnetsNeeded: number;
  borrowedBits: number;
  newPrefix: number;
  subnetMask: string;
  blockSize: number;
  usableHostsPerSubnet: number;
  subnets: {
    subnetIndex: number;
    subnetName: string;
    networkId: string;
    firstUsableHost: string;
    lastUsableHost: string;
    broadcastAddress: string;
    cidr: string;
  }[];
  stepByStepRationale: string[];
}

export const UDL_SUBNET_PROBLEM_A: UdlSubnetProblem = {
  id: 'udl_sub_192_168_10',
  title: 'Challenge A: Divide 192.168.10.0/24 into 4 Equal Subnets',
  networkAddress: '192.168.10.0',
  originalPrefix: 24,
  subnetsNeeded: 4,
  borrowedBits: 2,
  newPrefix: 26,
  subnetMask: '255.255.255.192',
  blockSize: 64,
  usableHostsPerSubnet: 62,
  subnets: [
    {
      subnetIndex: 1,
      subnetName: 'Subnet 1 (Engineering)',
      networkId: '192.168.10.0',
      firstUsableHost: '192.168.10.1',
      lastUsableHost: '192.168.10.62',
      broadcastAddress: '192.168.10.63',
      cidr: '192.168.10.0/26'
    },
    {
      subnetIndex: 2,
      subnetName: 'Subnet 2 (Sciences)',
      networkId: '192.168.10.64',
      firstUsableHost: '192.168.10.65',
      lastUsableHost: '192.168.10.126',
      broadcastAddress: '192.168.10.127',
      cidr: '192.168.10.64/26'
    },
    {
      subnetIndex: 3,
      subnetName: 'Subnet 3 (Admin & Labs)',
      networkId: '192.168.10.128',
      firstUsableHost: '192.168.10.129',
      lastUsableHost: '192.168.10.190',
      broadcastAddress: '192.168.10.191',
      cidr: '192.168.10.128/26'
    },
    {
      subnetIndex: 4,
      subnetName: 'Subnet 4 (Servers & DMZ)',
      networkId: '192.168.10.192',
      firstUsableHost: '192.168.10.193',
      lastUsableHost: '192.168.10.254',
      broadcastAddress: '192.168.10.255',
      cidr: '192.168.10.192/26'
    }
  ],
  stepByStepRationale: [
    'Step 1: Determine bits to borrow. To create 4 subnets, solve 2^n >= 4. n = 2 bits.',
    'Step 2: Calculate new prefix length. Original /24 + 2 borrowed bits = /26.',
    'Step 3: Construct subnet mask. 26 consecutive 1s = 11111111.11111111.11111111.11000000 = 255.255.255.192.',
    'Step 4: Find block size (increment). Magic number = 256 - 192 = 64 (or 2^(8 - 2) = 64).',
    'Step 5: Calculate usable host count. Remaining host bits = 32 - 26 = 6 bits. Usable hosts = 2^6 - 2 = 64 - 2 = 62 hosts.',
    'Step 6: Enumerate subnet ranges starting at .0, incrementing by 64 (.0, .64, .128, .192).'
  ]
};

export const UDL_SUBNET_PROBLEM_B: UdlSubnetProblem = {
  id: 'udl_sub_172_16_0',
  title: 'Challenge B: Divide 172.16.0.0/20 into 8 Equal Subnets',
  networkAddress: '172.16.0.0',
  originalPrefix: 20,
  subnetsNeeded: 8,
  borrowedBits: 3,
  newPrefix: 23,
  subnetMask: '255.255.254.0',
  blockSize: 2, // increment in 3rd octet
  usableHostsPerSubnet: 510,
  subnets: [
    {
      subnetIndex: 1,
      subnetName: 'Subnet 1',
      networkId: '172.16.0.0',
      firstUsableHost: '172.16.0.1',
      lastUsableHost: '172.16.1.254',
      broadcastAddress: '172.16.1.255',
      cidr: '172.16.0.0/23'
    },
    {
      subnetIndex: 2,
      subnetName: 'Subnet 2',
      networkId: '172.16.2.0',
      firstUsableHost: '172.16.2.1',
      lastUsableHost: '172.16.3.254',
      broadcastAddress: '172.16.3.255',
      cidr: '172.16.2.0/23'
    },
    {
      subnetIndex: 3,
      subnetName: 'Subnet 3',
      networkId: '172.16.4.0',
      firstUsableHost: '172.16.4.1',
      lastUsableHost: '172.16.5.254',
      broadcastAddress: '172.16.5.255',
      cidr: '172.16.4.0/23'
    },
    {
      subnetIndex: 4,
      subnetName: 'Subnet 4',
      networkId: '172.16.6.0',
      firstUsableHost: '172.16.6.1',
      lastUsableHost: '172.16.7.254',
      broadcastAddress: '172.16.7.255',
      cidr: '172.16.6.0/23'
    },
    {
      subnetIndex: 5,
      subnetName: 'Subnet 5',
      networkId: '172.16.8.0',
      firstUsableHost: '172.16.8.1',
      lastUsableHost: '172.16.9.254',
      broadcastAddress: '172.16.9.255',
      cidr: '172.16.8.0/23'
    },
    {
      subnetIndex: 6,
      subnetName: 'Subnet 6',
      networkId: '172.16.10.0',
      firstUsableHost: '172.16.10.1',
      lastUsableHost: '172.16.11.254',
      broadcastAddress: '172.16.11.255',
      cidr: '172.16.10.0/23'
    },
    {
      subnetIndex: 7,
      subnetName: 'Subnet 7',
      networkId: '172.16.12.0',
      firstUsableHost: '172.16.12.1',
      lastUsableHost: '172.16.13.254',
      broadcastAddress: '172.16.13.255',
      cidr: '172.16.12.0/23'
    },
    {
      subnetIndex: 8,
      subnetName: 'Subnet 8',
      networkId: '172.16.14.0',
      firstUsableHost: '172.16.14.1',
      lastUsableHost: '172.16.15.254',
      broadcastAddress: '172.16.15.255',
      cidr: '172.16.14.0/23'
    }
  ],
  stepByStepRationale: [
    'Step 1: Determine bits to borrow. To create 8 subnets, solve 2^n >= 8. n = 3 bits.',
    'Step 2: Calculate new prefix length. Original /20 + 3 borrowed bits = /23.',
    'Step 3: Construct subnet mask. /23 has 23 ones = 11111111.11111111.11111110.00000000 = 255.255.254.0.',
    'Step 4: Find block size. In the 3rd octet, increment = 256 - 254 = 2.',
    'Step 5: Calculate usable host count. Remaining host bits = 32 - 23 = 9 bits. Usable hosts = 2^9 - 2 = 512 - 2 = 510 hosts.',
    'Step 6: Enumerate ranges: 172.16.0.0, 172.16.2.0, 172.16.4.0 ... 172.16.14.0.'
  ]
};

export interface UdlTcpVsUdpScenario {
  id: string;
  application: string;
  description: string;
  correctProtocol: 'TCP' | 'UDP';
  rationale: string;
  trafficCharacteristics: string;
}

export const UDL_TCP_VS_UDP_SCENARIOS: UdlTcpVsUdpScenario[] = [
  {
    id: 'scen_web',
    application: 'Web Browsing (HTTP/1.1 & HTTPS)',
    description: 'Loading interactive web pages, HTML documents, stylesheets, and critical application scripts.',
    correctProtocol: 'TCP',
    rationale: 'Text, scripts, and stylesheet files cannot tolerate lost or corrupted bytes; full reliable in-order byte stream delivery is required.',
    trafficCharacteristics: 'Reliable, connection-oriented, ordered byte-stream.'
  },
  {
    id: 'scen_fps',
    application: 'Multiplayer First-Person Shooter (FPS) Movement',
    description: 'Broadcasting 60-120 Hz real-time player position vectors, yaw, pitch, and velocity.',
    correctProtocol: 'UDP',
    rationale: 'Position telemetry must have lowest latency possible (<20ms). A dropped position packet from 100ms ago is obsolete; retransmitting it causes jitter.',
    trafficCharacteristics: 'Low latency, unordered datagrams, zero retransmission overhead.'
  },
  {
    id: 'scen_sftp',
    application: 'Secure Banking File Transfer (SFTP / FTPS)',
    description: 'Transferring encrypted multi-gigabyte transaction archives and database backups.',
    correctProtocol: 'TCP',
    rationale: 'Requires absolute bit-level integrity, flow control to prevent buffer overflows, and retransmission of lost segments.',
    trafficCharacteristics: 'Reliable, congestion-controlled, checksum verified.'
  },
  {
    id: 'scen_dns',
    application: 'Domain Name System (DNS) Standard Resolution',
    description: 'Translating human-readable hostnames (e.g. klu.ac.in) to IPv4/IPv6 addresses.',
    correctProtocol: 'UDP',
    rationale: 'Small query and response fits into a single datagram (<512 bytes). Connecting via TCP 3-way handshake would double resolution latency.',
    trafficCharacteristics: 'Stateless, single round-trip query/response.'
  },
  {
    id: 'scen_dash',
    application: 'Adaptive Video On-Demand Streaming (Netflix/YouTube DASH)',
    description: 'Streaming high-definition video chunks pre-buffered by the video player client.',
    correctProtocol: 'TCP',
    rationale: 'Video chunks are pre-buffered several seconds in advance over HTTP/TCP, requiring complete segment arrival to avoid video artifact corruption.',
    trafficCharacteristics: 'Buffered throughput-oriented, reliable transmission.'
  },
  {
    id: 'scen_voip',
    application: 'Live Interactive Voice Call (VoIP / Discord Voice)',
    description: 'Real-time two-way voice conversation between students in a live seminar.',
    correctProtocol: 'UDP',
    rationale: 'Human ear tolerates minor packet drops with packet loss concealment (PLC), but cannot tolerate 300ms TCP retransmission buffering delays.',
    trafficCharacteristics: 'Real-time interactive, delay-sensitive.'
  }
];

export interface UdlTcpTroubleshootingScenario {
  id: string;
  title: string;
  symptom: string;
  packetTraceObservation: string;
  rootCause: string;
  tcpMechanism: string;
  recommendedSolution: string;
  pedagogicalExplanation: string;
}

export const UDL_TCP_TROUBLESHOOTING_SCENARIOS: UdlTcpTroubleshootingScenario[] = [
  {
    id: 'ts_conn_fail',
    title: 'Scenario 1: Connection Establishment Failure (SYN with RST response)',
    symptom: 'Client web browser immediately displays "Connection Refused (ECONNREFUSED)" when browsing to 192.168.10.50:8080.',
    packetTraceObservation: 'Frame 1: Client -> Server [SYN] Seq=0. Frame 2: Server -> Client [RST, ACK] Seq=0 Ack=1.',
    rootCause: 'No listening process on destination port 8080. Operating system kernel immediately rejects connection.',
    tcpMechanism: 'TCP RST (Reset) flag sent when an incoming SYN targets an inactive port without an active socket in LISTEN state.',
    recommendedSolution: 'Verify the web server daemon is active and bound to 0.0.0.0:8080 using `netstat -tlpn` or `ss -tulpn`.',
    pedagogicalExplanation: 'Unlike a network drop or firewall drop (which produces timeouts), an immediate RST means the IP address is reachable, but the transport port is closed.'
  },
  {
    id: 'ts_slow_transfer',
    title: 'Scenario 2: Slow File Transfer over High-Bandwidth Link',
    symptom: '1 Gbps campus fiber link only achieves 2.4 MB/s transfer speed between host A and host B across WAN.',
    packetTraceObservation: 'Receiver Window (rwnd) advertised in TCP header remains clamped at 64 KB (65,535 bytes). Round Trip Time (RTT) is 40 ms.',
    rootCause: 'Bandwidth-Delay Product (BDP) starvation. TCP Window Scale option (RFC 1323) is disabled or unsupported.',
    tcpMechanism: 'TCP Sliding Window Flow Control: Maximum throughput = Window Size / RTT. 64 KB / 0.040s = 1.6 MB/s ceiling.',
    recommendedSolution: 'Enable TCP Window Scaling (`net.ipv4.tcp_window_scaling = 1`) on both endpoints to expand window size beyond 64KB.',
    pedagogicalExplanation: 'When BDP exceeds 64 KB, the sender spends the majority of each RTT idling while waiting for acknowledgements before it can dispatch new bytes.'
  },
  {
    id: 'ts_retransmit_loop',
    title: 'Scenario 3: High Retransmission Rate & Dup ACKs',
    symptom: 'Students experience frequent video buffering and packet retransmission storms.',
    packetTraceObservation: 'Sender dispatches Segments 1000..5000. Receiver sends 3 duplicate ACKs acknowledging byte 2001. Sender triggers Fast Retransmit.',
    rootCause: 'Physical layer packet loss or noisy wireless interference dropping Segment 2001.',
    tcpMechanism: 'Fast Retransmit & Fast Recovery (RFC 5681): 3 duplicate ACKs indicate an out-of-order gap without waiting for RTO timeout.',
    recommendedSolution: 'Investigate access point SNR levels or physical link CRC errors; check switch port error counters.',
    pedagogicalExplanation: 'TCP treats all packet drops as signs of congestion, unnecessarily halving cwnd and throttle speeds even when loss is caused by wireless noise.'
  },
  {
    id: 'ts_congestion_collapse',
    title: 'Scenario 4: Heavy Traffic Queue Buildup & Soaring Latency',
    symptom: 'Ping latency increases from 8 ms to 450 ms whenever a student initiates a download.',
    packetTraceObservation: 'RTT spikes dramatically before packets start dropping; sender cwnd oscillates erratically between 64 and 1.',
    rootCause: 'Bufferbloat: oversized FIFO router buffers queuing hundreds of packets without dropping them early.',
    tcpMechanism: 'TCP Congestion Avoidance and Random Early Detection (RED) / CoDel Active Queue Management.',
    recommendedSolution: 'Deploy FQ-CoDel or CAKE active queue management on the gateway router to prevent deep buffer queues.',
    pedagogicalExplanation: 'Deep buffers delay packet drops so long that TCP congestion control cannot react in time, destroying interactive responsiveness.'
  },
  {
    id: 'ts_unexpected_termination',
    title: 'Scenario 5: Abrupt Connection Drop During Idle Periods',
    symptom: 'SSH sessions and long-lived database connections disconnect silently after exactly 5 minutes of inactivity.',
    packetTraceObservation: 'No FIN exchange observed. Next packet sent receives an immediate RST from intermediate gateway.',
    rootCause: 'Stateful NAT firewall table timeout. The intermediate firewall purged the translation entry after 300 seconds of idle traffic.',
    tcpMechanism: 'TCP Keepalive probes (RFC 1122): empty ACK packets sent periodically to keep stateful firewall session tables active.',
    recommendedSolution: 'Configure TCP Keepalive (`ClientAliveInterval 60` in sshd, or TCP_KEEPALIVE in socket applications).',
    pedagogicalExplanation: 'Intermediate stateful devices maintain connection state in RAM; if no packets flow, tables expire and subsequent packets are dropped or reset.'
  }
];

export interface UdlEducationalPacketFrame {
  frameNumber: number;
  timeOffset: string;
  sourceIp: string;
  destinationIp: string;
  sourcePort: number;
  destinationPort: number;
  flags: string[];
  seqNumber: number;
  ackNumber: number;
  windowSize: number;
  lengthBytes: number;
  info: string;
  pedagogicalNotes: string;
}

export const UDL_EDUCATIONAL_PACKET_TRACE: UdlEducationalPacketFrame[] = [
  {
    frameNumber: 1,
    timeOffset: '0.000000',
    sourceIp: '192.168.10.45',
    destinationIp: '10.0.0.1',
    sourcePort: 51234,
    destinationPort: 443,
    flags: ['SYN'],
    seqNumber: 1000,
    ackNumber: 0,
    windowSize: 64240,
    lengthBytes: 0,
    info: '51234 → 443 [SYN] Seq=0 (raw 1000) Win=64240 MSS=1460 SACK_PERM=1 WS=128',
    pedagogicalNotes: 'Client begins 3-way handshake. Advertises Initial Sequence Number (ISN=1000) and Maximum Segment Size (MSS=1460).'
  },
  {
    frameNumber: 2,
    timeOffset: '0.018420',
    sourceIp: '10.0.0.1',
    destinationIp: '192.168.10.45',
    sourcePort: 443,
    destinationPort: 51234,
    flags: ['SYN', 'ACK'],
    seqNumber: 5000,
    ackNumber: 1001,
    windowSize: 65535,
    lengthBytes: 0,
    info: '443 → 51234 [SYN, ACK] Seq=0 (raw 5000) Ack=1 (raw 1001) Win=65535 MSS=1460 SACK_PERM=1',
    pedagogicalNotes: 'Server accepts connection. Acknowledges client ISN+1 (1001) and synchronizes its own sequence number (ISN=5000).'
  },
  {
    frameNumber: 3,
    timeOffset: '0.018510',
    sourceIp: '192.168.10.45',
    destinationIp: '10.0.0.1',
    sourcePort: 51234,
    destinationPort: 443,
    flags: ['ACK'],
    seqNumber: 1001,
    ackNumber: 5001,
    windowSize: 64240,
    lengthBytes: 0,
    info: '51234 → 443 [ACK] Seq=1 (raw 1001) Ack=1 (raw 5001) Win=64240',
    pedagogicalNotes: 'Handshake completed. Both endpoints transition to ESTABLISHED state. Sockets ready for application payload.'
  },
  {
    frameNumber: 4,
    timeOffset: '0.024100',
    sourceIp: '192.168.10.45',
    destinationIp: '10.0.0.1',
    sourcePort: 51234,
    destinationPort: 443,
    flags: ['PSH', 'ACK'],
    seqNumber: 1001,
    ackNumber: 5001,
    windowSize: 64240,
    lengthBytes: 517,
    info: '51234 → 443 [PSH, ACK] Seq=1 Ack=1 Len=517 (TLS Client Hello)',
    pedagogicalNotes: 'Client sends 517 bytes of TLS application data. Seq=1001; next expected sequence byte from client will be 1001 + 517 = 1518.'
  },
  {
    frameNumber: 5,
    timeOffset: '0.042810',
    sourceIp: '10.0.0.1',
    destinationIp: '192.168.10.45',
    sourcePort: 443,
    destinationPort: 51234,
    flags: ['ACK'],
    seqNumber: 5001,
    ackNumber: 1518,
    windowSize: 65018,
    lengthBytes: 0,
    info: '443 → 51234 [ACK] Seq=1 Ack=518 (raw 1518) Win=65018',
    pedagogicalNotes: 'Server acknowledges receipt of all 517 bytes. Ack=1518 confirms bytes 1001..1517 received intact.'
  },
  {
    frameNumber: 6,
    timeOffset: '0.120500',
    sourceIp: '192.168.10.45',
    destinationIp: '10.0.0.1',
    sourcePort: 51234,
    destinationPort: 443,
    flags: ['FIN', 'ACK'],
    seqNumber: 1518,
    ackNumber: 5001,
    windowSize: 64240,
    lengthBytes: 0,
    info: '51234 → 443 [FIN, ACK] Seq=1518 Ack=5001',
    pedagogicalNotes: 'Client initiates connection teardown. Transitions to FIN_WAIT_1 state.'
  },
  {
    frameNumber: 7,
    timeOffset: '0.138900',
    sourceIp: '10.0.0.1',
    destinationIp: '192.168.10.45',
    sourcePort: 443,
    destinationPort: 51234,
    flags: ['ACK'],
    seqNumber: 5001,
    ackNumber: 1519,
    windowSize: 65535,
    lengthBytes: 0,
    info: '443 → 51234 [ACK] Seq=5001 Ack=1519',
    pedagogicalNotes: 'Server acknowledges client FIN. Client enters FIN_WAIT_2; server enters CLOSE_WAIT.'
  },
  {
    frameNumber: 8,
    timeOffset: '0.141200',
    sourceIp: '10.0.0.1',
    destinationIp: '192.168.10.45',
    sourcePort: 443,
    destinationPort: 51234,
    flags: ['FIN', 'ACK'],
    seqNumber: 5001,
    ackNumber: 1519,
    windowSize: 65535,
    lengthBytes: 0,
    info: '443 → 51234 [FIN, ACK] Seq=5001 Ack=1519',
    pedagogicalNotes: 'Server finishes its data and closes its half. Client responds with final ACK and enters TIME_WAIT (2MSL).'
  }
];

export const UDL_TCP_STATES = [
  { id: 'LISTEN', name: 'LISTEN', side: 'server', description: 'Waiting for connection request on bound local port.' },
  { id: 'SYN_SENT', name: 'SYN_SENT', side: 'client', description: 'Client sent SYN, waiting for matching SYN-ACK.' },
  { id: 'SYN_RCVD', name: 'SYN_RCVD', side: 'server', description: 'Server sent SYN-ACK after receiving client SYN, waiting for ACK.' },
  { id: 'ESTABLISHED', name: 'ESTABLISHED', side: 'both', description: 'Open connection; data transfer can proceed in both directions.' },
  { id: 'FIN_WAIT_1', name: 'FIN_WAIT_1', side: 'active_close', description: 'Application initiated close, sent FIN, waiting for ACK or FIN.' },
  { id: 'FIN_WAIT_2', name: 'FIN_WAIT_2', side: 'active_close', description: 'Received ACK for our FIN, waiting for remote endpoint FIN.' },
  { id: 'CLOSE_WAIT', name: 'CLOSE_WAIT', side: 'passive_close', description: 'Received remote FIN, sent ACK, waiting for local app close.' },
  { id: 'CLOSING', name: 'CLOSING', side: 'simultaneous', description: 'Both sides sent FIN simultaneously, waiting for final ACK.' },
  { id: 'LAST_ACK', name: 'LAST_ACK', side: 'passive_close', description: 'Sent local FIN after CLOSE_WAIT, waiting for final ACK.' },
  { id: 'TIME_WAIT', name: 'TIME_WAIT', side: 'active_close', description: 'Waiting 2MSL to ensure remote endpoint received final ACK.' },
  { id: 'CLOSED', name: 'CLOSED', side: 'both', description: 'Fictional starting and ending state. No active socket connection.' }
];
