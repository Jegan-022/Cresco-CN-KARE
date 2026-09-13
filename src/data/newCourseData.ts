export const NEW_CURRICULUM = {
  "courseTitle": "Computer Networks: Units 3, 4 & 5",
  "courseDescription": "Gamified, pedagogical learning system for Network Layer, Transport Layer, and Application Layer.",
  "gamification": {
    "levels": [
      { "level": 1, "title": "Packet Novice", "xpRequired": 0, "badge": "🌱" },
      { "level": 2, "title": "Subnet Scout", "xpRequired": 150, "badge": "🔍" },
      { "level": 3, "title": "Router Ranger", "xpRequired": 400, "badge": "🧭" },
      { "level": 4, "title": "Transport Tactician", "xpRequired": 750, "badge": "⚡" },
      { "level": 5, "title": "TCP Commander", "xpRequired": 1200, "badge": "🛡️" },
      { "level": 6, "title": "Application Architect", "xpRequired": 1800, "badge": "🚀" },
      { "level": 7, "title": "Network Overlord", "xpRequired": 2500, "badge": "👑" }
    ],
    "badges": [
      { "id": "net_pioneer", "name": "First Packet", "description": "Complete your first lesson", "icon": "📦", "xp": 50 },
      { "id": "subnet_master", "name": "CIDR Samurai", "description": "Ace the subnetting quiz without mistakes", "icon": "⚔️", "xp": 100 },
      { "id": "reliable_handshake", "name": "Three-Way Handshake", "description": "Master TCP connection states", "icon": "🤝", "xp": 100 },
      { "id": "dns_resolver", "name": "Domain Whisperer", "description": "Complete all Application layer challenges", "icon": "🌐", "xp": 150 }
    ]
  },
  "units": [
    {
      "id": "unit_3",
      "title": "Unit 3: Network Layer",
      "icon": "🌐",
      "color": "#3B82F6",
      "summary": "Master logical addressing, routing algorithms, subnetting, and core internetwork protocols.",
      "modules": [
        {
          "id": "u3_m1",
          "title": "Network Layer: Need, Issues & Services",
          "xp": 50,
          "readTimeMinutes": 5,
          "pedagogy": {
            "hook": "Why does a letter sent across the world reach your doorstep, while Ethernet only talks to adjacent cables?",
            "analogy": "The postal logistics network: sorting hubs (routers), global zip codes (IP addresses), and parcel size limits (MTU).",
            "concept": "The Network layer (Layer 3) handles host-to-host communication across heterogeneous networks. Key issues include store-and-forward packet switching, connection-oriented vs connectionless services, routing, and handling congestion."
          },
          "keyTakeaways": [
            "Provides end-to-end host addressing and routing across diverse physical networks.",
            "Connectionless service sends datagrams independently (Internet model).",
            "Connection-oriented service uses virtual circuits with setup and teardown."
          ],
          "quiz": [
            {
              "id": "q_u3_1",
              "question": "What is the primary responsibility of the Network Layer?",
              "options": [
                "Node-to-node frame delivery",
                "Host-to-host packet delivery across different networks",
                "Process-to-process communication",
                "Bit synchronization on physical media"
              ],
              "correctIndex": 1,
              "explanation": "The Network Layer is responsible for host-to-host delivery across multiple inter-connected networks using logical addresses."
            }
          ]
        },
        {
          "id": "u3_m2",
          "title": "Routing Algorithms & Distance Vector vs Link State",
          "xp": 80,
          "readTimeMinutes": 8,
          "pedagogy": {
            "hook": "How does Google Maps compute your fastest route when traffic jams erupt in real-time?",
            "analogy": "Distance Vector is asking rumors from neighbors ('C is 2 blocks from me'). Link State is downloading the full satellite map and running shortest path calculations yourself.",
            "concept": "Routing algorithms determine the best path for packets. Distance Vector (Bellman-Ford) shares local routing tables with immediate neighbors, susceptible to the 'Count-to-Infinity' problem. Link State (Dijkstra) floods link states to all routers so every node builds a complete topology tree."
          },
          "keyTakeaways": [
            "Distance Vector: Bellman-Ford, local sharing, slow convergence, solved by Split Horizon and Poison Reverse.",
            "Link State: Dijkstra SPF, global flooding of link states, fast convergence, higher memory/CPU usage."
          ],
          "quiz": [
            {
              "id": "q_u3_2",
              "question": "Which algorithm is used by Link State routing protocols to calculate the shortest path?",
              "options": [
                "Bellman-Ford Algorithm",
                "Dijkstra's Algorithm",
                "Floyd-Warshall Algorithm",
                "Kruskal's Algorithm"
              ],
              "correctIndex": 1,
              "explanation": "Link State routing protocols (like OSPF) construct the shortest path tree using Dijkstra's algorithm."
            },
            {
              "id": "q_u3_3",
              "question": "What mechanism helps mitigate the Count-to-Infinity problem in Distance Vector routing?",
              "options": [
                "Split Horizon and Poison Reverse",
                "Parity check bits",
                "Checksum verification",
                "Hamming codes"
              ],
              "correctIndex": 0,
              "explanation": "Split Horizon prevents advertising a route back on the interface it was learned from; Poison reverse sets cost to infinity."
            }
          ]
        },
        {
          "id": "u3_m3",
          "title": "Quality of Service (QoS)",
          "xp": 60,
          "readTimeMinutes": 6,
          "pedagogy": {
            "hook": "Why does a 1-second delay ruin a Zoom call but go unnoticed when downloading an image?",
            "analogy": "Emergency vehicle lanes vs normal lanes on highways.",
            "concept": "QoS guarantees network performance metrics: Bandwidth, Delay (Latency), Jitter (delay variation), and Packet Loss. Models include Integrated Services (IntServ using RSVP for per-flow reservation) and Differentiated Services (DiffServ using DSCP bits for class-based priorities). Traffic shaping methods include Leaky Bucket and Token Bucket."
          },
          "keyTakeaways": [
            "Jitter is delay variation; critical for real-time audio and video.",
            "Leaky Bucket enforces a constant output rate.",
            "Token Bucket allows controlled bursts while capping average rate."
          ],
          "quiz": [
            {
              "id": "q_u3_4",
              "question": "Which traffic shaping algorithm allows bursty traffic up to a configured bucket capacity?",
              "options": [
                "Leaky Bucket",
                "Token Bucket",
                "FIFO Queue",
                "Weighted Fair Queuing only"
              ],
              "correctIndex": 1,
              "explanation": "Token bucket accumulates tokens over time, allowing bursts of packets whenever sufficient tokens exist."
            }
          ]
        },
        {
          "id": "u3_m4",
          "title": "IPv4 vs IPv6: Features, Addressing & Packet Formats",
          "xp": 90,
          "readTimeMinutes": 9,
          "pedagogy": {
            "hook": "Why did the world run out of IPv4 addresses and have to invent a 128-bit address space?",
            "analogy": "Upgrading 7-digit landline phone numbers to 10-digit mobile numbers with country codes.",
            "concept": "IPv4 is 32-bit (dotted-decimal, ~4.3 billion addresses) with a 20-60 byte header, header checksum, router fragmentation, and broadcast support. IPv6 is 128-bit (hexadecimal colon, 3.4x10^38 addresses) with a simplified 40-byte fixed header, no checksum, source-only fragmentation, built-in IPSec, and no broadcast (uses multicast & anycast)."
          },
          "keyTakeaways": [
            "IPv4: 32-bit, TTL, router fragmentation, broadcast.",
            "IPv6: 128-bit, Hop Limit, Next Header, SLAAC, multicast/anycast only."
          ],
          "quiz": [
            {
              "id": "q_u3_5",
              "question": "What is the fixed base header size of an IPv6 packet?",
              "options": ["20 bytes", "32 bytes", "40 bytes", "64 bytes"],
              "correctIndex": 2,
              "explanation": "IPv6 utilizes a streamlined, fixed base header size of exactly 40 bytes to accelerate router processing."
            },
            {
              "id": "q_u3_6",
              "question": "Which field in the IPv6 header performs the equivalent function of IPv4's Time To Live (TTL)?",
              "options": [
                "Flow Label",
                "Hop Limit",
                "Next Header",
                "Traffic Class"
              ],
              "correctIndex": 1,
              "explanation": "Hop Limit in IPv6 decrements at each forwarding router just like TTL in IPv4."
            }
          ]
        },
        {
          "id": "u3_m5",
          "title": "Subnetting, CIDR & VLSM",
          "xp": 100,
          "readTimeMinutes": 10,
          "pedagogy": {
            "hook": "How do you give 100 computers to Department A and 25 to Department B from the same pool without wasting 200 IPs?",
            "analogy": "Cutting a large pizza into slices of varying sizes depending on each person's appetite.",
            "concept": "Subnetting borrows host bits to create subnets. CIDR (Classless Inter-Domain Routing) replaces Class A/B/C with prefix notation (/n) allowing route aggregation (supernetting). VLSM (Variable Length Subnet Masking) permits subnets of different sizes within the same network address space."
          },
          "keyTakeaways": [
            "Number of subnets = 2^borrowed_bits; Usable hosts = 2^remaining_host_bits - 2.",
            "First address is Network ID; Last address is Broadcast address.",
            "Always allocate subnets from largest host requirement to smallest."
          ],
          "interactiveCalculator": {
            "type": "subnet_tester",
            "exampleIp": "192.168.10.0/26",
            "subnetMask": "255.255.255.192",
            "totalHosts": 64,
            "usableHosts": 62
          },
          "quiz": [
            {
              "id": "q_u3_7",
              "question": "A network with prefix /28 provides how many usable host addresses?",
              "options": ["16", "14", "30", "6"],
              "correctIndex": 1,
              "explanation": "Host bits = 32 - 28 = 4. Total IPs = 2^4 = 16. Usable hosts = 16 - 2 = 14 (subtracting network and broadcast IDs)."
            }
          ]
        },
        {
          "id": "u3_m6",
          "title": "Routing Protocols: RIP, OSPF & BGP",
          "xp": 80,
          "readTimeMinutes": 8,
          "pedagogy": {
            "hook": "Who decides how traffic crosses between Comcast, AT&T, and European telecom backbones?",
            "analogy": "RIP is taking the city bus (counting stops). OSPF is Google Maps inside your city. BGP is international air traffic control.",
            "concept": "RIP (Routing Information Protocol) is an IGP using Distance Vector, hop count metric (max 15), UDP 520. OSPF (Open Shortest Path First) is an IGP using Link State, cost metric based on bandwidth, Dijkstra SPF, IP protocol 89, hierarchical areas (Area 0 backbone). BGP (Border Gateway Protocol) is an EGP using Path Vector between Autonomous Systems (AS) over TCP port 179."
          },
          "keyTakeaways": [
            "RIP: max 15 hops, updates every 30s.",
            "OSPF: Dijkstra SPF, area hierarchy, bandwidth-based cost.",
            "BGP: Path Vector, AS-Path attribute, inter-domain internet routing."
          ],
          "quiz": [
            {
              "id": "q_u3_8",
              "question": "What is the maximum allowable hop count in RIP before a route is deemed unreachable?",
              "options": ["10", "15", "16", "255"],
              "correctIndex": 2,
              "explanation": "In RIP, 15 is the maximum valid hop count. A hop count of 16 indicates infinity / unreachable."
            },
            {
              "id": "q_u3_9",
              "question": "Which protocol runs over TCP port 179 and glues the global Internet Autonomous Systems together?",
              "options": ["RIP", "OSPF", "BGP", "IS-IS"],
              "correctIndex": 2,
              "explanation": "BGP (Border Gateway Protocol) establishes peering sessions over TCP port 179."
            }
          ]
        },
        {
          "id": "u3_m7",
          "title": "Network Helpers: DHCP, ARP, NAT & ICMP",
          "xp": 90,
          "readTimeMinutes": 9,
          "pedagogy": {
            "hook": "What invisible hand gives your phone an IP when you connect to cafe Wi-Fi, and how does your home router share one IP among 10 family devices?",
            "analogy": "DHCP is the hotel check-in clerk. ARP translates names to face recognition. NAT is the office receptionist with an extension line. ICMP is the return-to-sender delivery note.",
            "concept": "DHCP leases IPs dynamically via DORA (Discover, Offer, Request, Acknowledge). ARP maps 32-bit IP to 48-bit MAC address on a LAN. NAT (Network Address Translation/PAT) translates private RFC 1918 IPs into a public IP using ports. ICMP diagnostics handle ping (Echo Request/Reply) and traceroute (TTL Exceeded)."
          },
          "keyTakeaways": [
            "DHCP: DORA handshake on UDP 67/68.",
            "ARP: Broadcast request, unicast reply.",
            "NAT/PAT: Maps private sockets to public IP and distinct port numbers.",
            "ICMP: Layer 3 error reporting and diagnostic tool (Ping/Traceroute)."
          ],
          "quiz": [
            {
              "id": "q_u3_10",
              "question": "What is the correct 4-step sequence for dynamic IP assignment in DHCP?",
              "options": [
                "Discover, Order, Request, Accept",
                "Discover, Offer, Request, Acknowledge",
                "Dial, Offer, Route, Authorize",
                "Detect, Open, Receive, ACK"
              ],
              "correctIndex": 1,
              "explanation": "DHCP uses the DORA sequence: Discover (client broadcast), Offer (server response), Request (client selection), Acknowledge (server confirmation)."
            },
            {
              "id": "q_u3_11",
              "question": "What protocol is used by the 'ping' command to test network reachability?",
              "options": ["ARP", "ICMP", "IGMP", "DHCP"],
              "correctIndex": 1,
              "explanation": "Ping sends ICMP Type 8 (Echo Request) and listens for ICMP Type 0 (Echo Reply)."
            }
          ]
        }
      ]
    },
    {
      "id": "unit_4",
      "title": "Unit 4: Transport Layer",
      "icon": "🚛",
      "color": "#10B981",
      "summary": "Master process-to-process delivery, reliable data transfer protocols, UDP, and in-depth TCP internals.",
      "modules": [
        {
          "id": "u4_m1",
          "title": "Transport Layer Services & Port Addressing",
          "xp": 50,
          "readTimeMinutes": 5,
          "pedagogy": {
            "hook": "Your computer has only one IP address, so how does your browser know YouTube video packets don't belong to Spotify?",
            "analogy": "An apartment building address is the IP; the individual apartment unit number is the Port Number.",
            "concept": "The Transport Layer provides process-to-process communication using 16-bit Port numbers (0 to 65535). Sockets combine IP address and Port number. It performs multiplexing (at sender) and demultiplexing (at receiver)."
          },
          "keyTakeaways": [
            "Well-known ports: 0–1023 (HTTP 80, HTTPS 443, SSH 22).",
            "Registered ports: 1024–49151.",
            "Ephemeral/Dynamic ports: 49152–65535 for client sockets."
          ],
          "quiz": [
            {
              "id": "q_u4_1",
              "question": "What uniquely identifies a network endpoint connection at the Transport Layer?",
              "options": [
                "MAC Address and IP Address",
                "Socket (IP Address + Port Number)",
                "Host Name + URL",
                "Subnet Mask + Gateway"
              ],
              "correctIndex": 1,
              "explanation": "A socket pair (Source IP:Port + Destination IP:Port) uniquely identifies an end-to-end transport connection."
            }
          ]
        },
        {
          "id": "u4_m2",
          "title": "Reliable Protocols: Stop-and-Wait, Go-Back-N & Selective Repeat",
          "xp": 90,
          "readTimeMinutes": 9,
          "pedagogy": {
            "hook": "If you send 5 letters and letter 2 gets lost in the rain, do you resend all 5, or just letter 2?",
            "analogy": "Stop-and-Wait: texting one message and refusing to write again until read. Go-Back-N: reciting a poem, tripping on line 2, and restarting from line 2. Selective Repeat: replacing only the burned page in a book.",
            "concept": "Stop-and-Wait sends 1 packet and halts for ACK (low efficiency). Pipelined protocols allow multiple in-flight packets. Go-Back-N (GBN) uses cumulative ACKs; if packet k is lost, receiver discards out-of-order packets and sender retransmits window starting at k. Selective Repeat (SR) individually ACKs packets; receiver buffers out-of-order packets, sender retransmits only lost packets."
          },
          "keyTakeaways": [
            "Stop-and-Wait: Window size = 1, requires 1-bit sequence number.",
            "Go-Back-N: Sender window = N, Receiver window = 1, Min seq numbers = N + 1.",
            "Selective Repeat: Sender window = N, Receiver window = N, Min seq numbers = 2N."
          ],
          "quiz": [
            {
              "id": "q_u4_2",
              "question": "If sender window size in Selective Repeat is N=4, what is the minimum sequence number space required?",
              "options": ["4", "5", "8", "16"],
              "correctIndex": 2,
              "explanation": "Selective Repeat requires the sequence space to be at least 2 * N (2 * 4 = 8) to avoid ambiguity between consecutive window sequences."
            },
            {
              "id": "q_u4_3",
              "question": "What does a cumulative ACK of 5 mean in Go-Back-N?",
              "options": [
                "Only packet 5 was received",
                "All packets up to and including 5 have been received",
                "Packet 5 was lost and needs retransmission",
                "Sender can send 5 more packets"
              ],
              "correctIndex": 1,
              "explanation": "Cumulative ACK n confirms successful reception of all packets numbered up to and including n."
            }
          ]
        },
        {
          "id": "u4_m3",
          "title": "UDP: Datagrams, Services & Applications",
          "xp": 50,
          "readTimeMinutes": 5,
          "pedagogy": {
            "hook": "Why do competitive online games and VoIP choose UDP even though packets can disappear without warning?",
            "analogy": "Throwing paper airplanes across the room: fast, zero preparation, but no confirmation receipt.",
            "concept": "UDP (User Datagram Protocol) is a lightweight, connectionless, unreliable transport protocol. It preserves message boundaries (datagram-oriented) with an 8-byte fixed header (Source Port, Dest Port, Length, Checksum). It provides no handshake, flow control, or congestion control."
          },
          "keyTakeaways": [
            "Fixed 8-byte header.",
            "Minimal transmission delay; no connection state maintained.",
            "Ideal for real-time traffic (DNS, VoIP, gaming, live streaming)."
          ],
          "quiz": [
            {
              "id": "q_u4_4",
              "question": "What is the total size of a standard UDP header?",
              "options": ["8 bytes", "20 bytes", "32 bytes", "64 bytes"],
              "correctIndex": 0,
              "explanation": "The UDP header consists of four 16-bit fields, totaling 8 bytes."
            }
          ]
        },
        {
          "id": "u4_m4",
          "title": "TCP: Segment Format, 3-Way Handshake & Connection States",
          "xp": 90,
          "readTimeMinutes": 10,
          "pedagogy": {
            "hook": "How do two computers on opposite sides of the planet agree to establish trust and order before exchanging a single byte?",
            "analogy": "A radio pilot check: 'Tower, do you read me?' (SYN), 'Pilot, loud and clear, do you copy?' (SYN-ACK), 'Copy that, beginning takeoff' (ACK).",
            "concept": "TCP is connection-oriented, full-duplex, reliable byte-stream oriented. Header is 20-60 bytes. Connection establishment uses a 3-way handshake (SYN -> SYN+ACK -> ACK). Teardown uses a 4-way handshake (FIN -> ACK -> FIN -> ACK) with a TIME_WAIT state (2*MSL) to cleanly purge stray segments."
          },
          "keyTakeaways": [
            "Flags: SYN (Synchronize), ACK (Acknowledge), FIN (Terminate), RST (Reset), PSH (Push), URG (Urgent).",
            "Sequence numbers count bytes, not packets.",
            "TIME_WAIT prevents old duplicate packets from corrupting new connections."
          ],
          "quiz": [
            {
              "id": "q_u4_5",
              "question": "Which flag is set in the very first packet sent by a client initiating a TCP connection?",
              "options": ["ACK", "SYN", "FIN", "RST"],
              "correctIndex": 1,
              "explanation": "The client initiates connection establishment with a segment containing the SYN (Synchronize) flag set."
            },
            {
              "id": "q_u4_6",
              "question": "What is the primary purpose of the TIME_WAIT state in TCP?",
              "options": [
                "To buffer user data before sending",
                "To allow final ACK to reach remote host and drain lingering duplicate segments",
                "To compute round trip time",
                "To negotiate encryption keys"
              ],
              "correctIndex": 1,
              "explanation": "TIME_WAIT ensures the final ACK is reliably received and keeps the socket occupied so delayed old segments expire."
            }
          ]
        },
        {
          "id": "u4_m5",
          "title": "TCP Flow Control, Error Control & Congestion Control",
          "xp": 100,
          "readTimeMinutes": 12,
          "pedagogy": {
            "hook": "What is the difference between choking the person listening to you versus jamming the highway you are driving on?",
            "analogy": "Flow Control is not speaking faster than your friend can write. Congestion Control is not flooding the freeway during rush hour.",
            "concept": "Flow control prevents sender from overfilling the receiver buffer using the advertised Window Size (rwnd). Error control uses checksums, dynamic Retransmission Timeouts (RTO), and Fast Retransmit (triggered by 3 duplicate ACKs). Congestion control dynamically sizes cwnd using Slow Start (exponential increase), Congestion Avoidance (linear increase via AIMD), and Fast Recovery."
          },
          "keyTakeaways": [
            "Effective transmission window = min(rwnd, cwnd).",
            "Fast Retransmit triggers immediately upon 3 duplicate ACKs without waiting for timeout.",
            "AIMD: Additive Increase (+1 MSS / RTT), Multiplicative Decrease (cut cwnd in half)."
          ],
          "quiz": [
            {
              "id": "q_u4_7",
              "question": "How does TCP sender determine the maximum number of unacknowledged bytes it can transmit?",
              "options": [
                "Max(rwnd, cwnd)",
                "Min(rwnd, cwnd)",
                "Only based on MTU",
                "Fixed default of 64KB"
              ],
              "correctIndex": 1,
              "explanation": "The sender window is capped at the minimum of receiver buffer capacity (rwnd) and network capacity (cwnd)."
            },
            {
              "id": "q_u4_8",
              "question": "What event triggers TCP Fast Retransmit?",
              "options": [
                "Receipt of 1 duplicate ACK",
                "Receipt of 3 duplicate ACKs",
                "Expiration of the RTO timer",
                "A zero-window probe"
              ],
              "correctIndex": 1,
              "explanation": "Receipt of 3 duplicate ACKs (4 identical ACKs total) triggers immediate retransmission of the missing segment."
            }
          ]
        }
      ]
    },
    {
      "id": "unit_5",
      "title": "Unit 5: Application Layer",
      "icon": "📱",
      "color": "#EF4444",
      "summary": "Understand human-facing protocols: Web (HTTP), Files (FTP), Mail (SMTP/POP3/IMAP), Remote Access (Telnet/SSH), and Domain Name System (DNS).",
      "modules": [
        {
          "id": "u5_m1",
          "title": "WWW and HTTP / HTTPS",
          "xp": 60,
          "readTimeMinutes": 7,
          "pedagogy": {
            "hook": "What happens in the 300 milliseconds between tapping 'Search' and your screen rendering a webpage?",
            "analogy": "Ordering food at a counter: you hand the order ticket (GET /menu), the kitchen prepares it and responds with a tray and receipt (200 OK + HTML body).",
            "concept": "HTTP (HyperText Transfer Protocol) is a stateless client-server protocol over TCP port 80 (HTTPS on 443 with TLS). HTTP/1.0 used non-persistent connections; HTTP/1.1 added persistent connections (Keep-Alive) and pipelining. HTTP/2 introduced binary multiplexed frames over a single TCP stream. HTTP/3 uses UDP via QUIC."
          },
          "keyTakeaways": [
            "Stateless: Each request has no intrinsic recollection of prior requests (solved via cookies).",
            "Methods: GET (fetch), POST (submit), PUT (replace), DELETE (remove).",
            "Status codes: 2xx Success, 3xx Redirect, 4xx Client Error, 5xx Server Error."
          ],
          "quiz": [
            {
              "id": "q_u5_1",
              "question": "Which HTTP response code indicates that a requested resource was not found on the server?",
              "options": ["200 OK", "301 Moved Permanently", "404 Not Found", "500 Internal Server Error"],
              "correctIndex": 2,
              "explanation": "404 Not Found signifies that the origin server did not locate the requested URI."
            }
          ]
        },
        {
          "id": "u5_m2",
          "title": "FTP (File Transfer Protocol)",
          "xp": 50,
          "readTimeMinutes": 5,
          "pedagogy": {
            "hook": "Why does FTP require two separate telephone lines to download a single file?",
            "analogy": "The sales counter (Control connection) where you discuss prices, and the warehouse loading dock (Data connection) where the goods are loaded.",
            "concept": "FTP separates command control from data transfer using two parallel TCP connections: Control Connection (Port 21, persistent) for login and commands; Data Connection (Port 20 in Active mode, ephemeral in Passive mode) opened and closed for every individual file or directory listing."
          },
          "keyTakeaways": [
            "Port 21: Control channel (in-band commands, out-of-band data).",
            "Port 20: Data channel in Active FTP.",
            "Passive FTP (PASV) was designed so client firewalls don't block inbound server data connections."
          ],
          "quiz": [
            {
              "id": "q_u5_2",
              "question": "Which port does an FTP server listen on for client commands and login authentication?",
              "options": ["Port 20", "Port 21", "Port 22", "Port 23"],
              "correctIndex": 1,
              "explanation": "Port 21 handles the control connection for FTP commands and responses."
            }
          ]
        },
        {
          "id": "u5_m3",
          "title": "Email Protocols: SMTP, POP3 & IMAP",
          "xp": 70,
          "readTimeMinutes": 7,
          "pedagogy": {
            "hook": "Why can you send an email using one protocol, but you must use a completely different protocol to read your inbox?",
            "analogy": "SMTP is the postal courier truck dropping mail at your local post office. POP3 is picking up the box and taking it home. IMAP is reading your letters inside the post office while keeping them safe in your box.",
            "concept": "SMTP (Simple Mail Transfer Protocol, TCP port 25/587) is a push protocol used to send mail from client to server and between mail servers. POP3 (Post Office Protocol 3, port 110) downloads and deletes mail on server (single-device model). IMAP (Internet Message Access Protocol, port 143) keeps mail synced across multiple client devices on the central server."
          },
          "keyTakeaways": [
            "SMTP: Push protocol for sending email.",
            "POP3: Pull protocol; local download, usually deletes server copy.",
            "IMAP: Pull protocol; cloud synchronization across multiple devices."
          ],
          "quiz": [
            {
              "id": "q_u5_3",
              "question": "Which protocol is responsible for transferring email from sender's mail client to sender's mail server?",
              "options": ["POP3", "IMAP", "SMTP", "HTTP only"],
              "correctIndex": 2,
              "explanation": "SMTP (Simple Mail Transfer Protocol) is used to push/send emails to and between mail servers."
            }
          ]
        },
        {
          "id": "u5_m4",
          "title": "Remote Terminal: Telnet vs SSH",
          "xp": 50,
          "readTimeMinutes": 5,
          "pedagogy": {
            "hook": "What would happen if you logged into your university server using Telnet in a crowded cafe with Wireshark running?",
            "analogy": "Telnet is yelling your secret password across a cafeteria. SSH is speaking through an encrypted soundproof microphone.",
            "concept": "Telnet (TCP port 23) offers plain-text terminal emulation with zero encryption, leaving credentials vulnerable to packet sniffing. SSH (Secure Shell, TCP port 22) replaced Telnet by encrypting all traffic (passwords, keystrokes, output) using public key cryptography and symmetric ciphers."
          },
          "keyTakeaways": [
            "Telnet: Port 23, cleartext, legacy and insecure.",
            "SSH: Port 22, strongly encrypted, supports SFTP and secure port forwarding."
          ],
          "quiz": [
            {
              "id": "q_u5_4",
              "question": "What fundamental vulnerability makes Telnet unsafe for modern network administration?",
              "options": [
                "It only supports IPv6",
                "It transmits all authentication credentials and data in plaintext",
                "It uses UDP which drops connection randomly",
                "It cannot run on Linux servers"
              ],
              "correctIndex": 1,
              "explanation": "Telnet does not encrypt communication, meaning passwords and command outputs can be intercepted in plaintext."
            }
          ]
        },
        {
          "id": "u5_m5",
          "title": "DNS (Domain Name System)",
          "xp": 80,
          "readTimeMinutes": 8,
          "pedagogy": {
            "hook": "How does the world translate 3 billion human-friendly names like 'google.com' into numeric IP addresses in under 20 milliseconds?",
            "analogy": "The global phonebook lookup: Asking the librarian (Root), who points to the Country aisle (.com TLD), who points to Google's private bookshelf (Authoritative server).",
            "concept": "DNS operates primarily over UDP port 53 (TCP for zone transfers and queries >512B). It uses a hierarchical namespace: Root servers (.), Top-Level Domains (.com, .org, .edu), and Authoritative Name Servers. Common record types include A (IPv4), AAAA (IPv6), CNAME (canonical alias), MX (Mail Exchange), and PTR (reverse lookup)."
          },
          "keyTakeaways": [
            "Port 53 (primarily UDP).",
            "Hierarchy: Root Server -> TLD Server -> Authoritative DNS Server.",
            "Key Records: A (IPv4), AAAA (IPv6), CNAME (alias), MX (mail)."
          ],
          "quiz": [
            {
              "id": "q_u5_5",
              "question": "Which DNS record maps a domain name to its corresponding IPv4 address?",
              "options": ["AAAA Record", "A Record", "MX Record", "CNAME Record"],
              "correctIndex": 1,
              "explanation": "An 'A' (Address) record resolves a hostname to an IPv4 32-bit address. AAAA resolves to IPv6."
            }
          ]
        }
      ]
    }
  ],
  "quickReferenceFlashcards": [
    { "q": "What is the OSPF metric based on?", "a": "Cost = 10^8 / Bandwidth (bps)" },
    { "q": "Formula for usable hosts in a /27 subnet?", "a": "Host bits = 5. Usable = 2^5 - 2 = 30 hosts" },
    { "q": "What layer does ARP operate between?", "a": "Resolves Network Layer IP to Data Link Layer MAC" },
    { "q": "Minimum sequence number space for Go-Back-N with window N?", "a": "N + 1" },
    { "q": "Minimum sequence number space for Selective Repeat with window N?", "a": "2 * N" },
    { "q": "What are the 4 steps of DHCP IP assignment?", "a": "DORA: Discover, Offer, Request, Acknowledge" },
    { "q": "Default port numbers for HTTP, HTTPS, SSH, FTP control?", "a": "HTTP: 80, HTTPS: 443, SSH: 22, FTP Control: 21" },
    { "q": "What triggers Fast Retransmit in TCP?", "a": "Arrival of 3 duplicate ACKs (4 identical ACKs total)" }
  ]
};
