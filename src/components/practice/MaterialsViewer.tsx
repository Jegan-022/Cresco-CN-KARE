import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Copy, 
  Check, 
  ExternalLink, 
  Download, 
  BookOpen, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface MaterialItem {
  id: string;
  unit: string;
  category: 'headers' | 'cidr' | 'protocols' | 'ports';
  title: string;
  summary: string;
  content: string;
  rfc?: string;
  tags: string[];
}

const MATERIALS_ITEMS: MaterialItem[] = [
  {
    id: 'mat-ipv4-ipv6',
    unit: 'Unit 3',
    category: 'headers',
    title: 'IPv4 vs IPv6 Protocol Header Architecture',
    rfc: 'RFC 791 / RFC 8200',
    tags: ['Headers', 'Bit Offsets', 'IPv4', 'IPv6', 'PMTUD'],
    summary: 'Side-by-side architectural specification of Layer 3 packet headers.',
    content: `================================================================================
IPV4 HEADER SPECIFICATION (RFC 791)
================================================================================
• Base Header Size: 20 Bytes (up to 60 Bytes with Options).
• 0                   1                   2                   3
  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |Version|  IHL  |Type of Service|          Total Length         |
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |         Identification        |Flags|      Fragment Offset    |
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |  Time to Live |    Protocol   |         Header Checksum       |
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |                       Source Address                          |
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |                    Destination Address                        |
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

KEY IPV4 FIELDS:
- Version: 4 (0100 binary).
- IHL (Internet Header Length): In 32-bit words (5 = 20 bytes).
- Fragment Offset: Measured in 8-byte blocks.
- TTL: Decremented by 1 at each router hop; packet discarded at 0.
- Protocol: 6 for TCP, 17 for UDP, 1 for ICMP, 89 for OSPF.

================================================================================
IPV6 HEADER SPECIFICATION (RFC 8200)
================================================================================
• Fixed Header Size: Exactly 40 Bytes (320 bits).
• 0                   1                   2                   3
  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |Version| Traffic Class |           Flow Label                  |
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |         Payload Length        |  Next Header  |   Hop Limit   |
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |                                                               |
 +                                                               +
 |                                                               |
 +                         Source Address                        +
 |                           (128 bits)                          |
 +                                                               +
 |                                                               |
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |                                                               |
 +                                                               +
 |                                                               |
 +                      Destination Address                      +
 |                           (128 bits)                          |
 +                                                               +
 |                                                               |
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

KEY DIFFERENCES:
1. No Checksum in IPv6: Layer 2 CRC and Layer 4 TCP/UDP checksums suffice.
2. No in-network fragmentation: Routers send ICMPv6 "Packet Too Big" if MTU exceeded.
3. Next Header: Points to next extension header (Hop-by-Hop, Routing, Fragment, Auth).`
  },
  {
    id: 'mat-cidr-matrix',
    unit: 'Unit 3',
    category: 'cidr',
    title: 'Classless Inter-Domain Routing (CIDR) Subnet Matrix',
    rfc: 'RFC 4632',
    tags: ['CIDR', 'Subnetting', 'VLSM', 'Masks', 'Host Count'],
    summary: 'Complete reference table of prefixes /8 through /30 with usable host formulas.',
    content: `================================================================================
CIDR SUBNETTING & VLSM MASTER REFERENCE TABLE
================================================================================
Prefix  Subnet Mask       Total IPs    Usable Hosts  Wildcard Mask    Common Usage
--------------------------------------------------------------------------------
/8      255.0.0.0         16,777,216   16,777,214    0.255.255.255    Legacy Class A
/16     255.255.0.0       65,536       65,534        0.0.255.255      Campus Core Network
/20     255.255.240.0     4,096        4,094         0.0.15.255       Department Subnet
/22     255.255.252.0     1,024        1,022         0.0.3.255        Building LAN
/24     255.255.255.0     256          254           0.0.0.255        Standard Subnet
/25     255.255.255.128   128          126           0.0.0.127        Medium Lab LAN
/26     255.255.255.192   64           62            0.0.0.63         Classroom Subnet
/27     255.255.255.224   32           30            0.0.0.31         Server DMZ
/28     255.255.255.240   16           14            0.0.0.15         Management Pod
/29     255.255.255.248   8            6             0.0.0.7          Router Redundancy (HSRP/VRRP)
/30     255.255.255.252   4            2             0.0.0.3          Point-to-Point WAN Link
/32     255.255.255.255   1            1 (Host)      0.0.0.0          Loopback / Host Route

FORMULAS:
- Number of Subnets = 2^(borrowed bits)
- Total Hosts = 2^(32 - prefix)
- Usable Hosts = 2^(32 - prefix) - 2 (Minus 1 for Network ID, 1 for Broadcast ID)`
  },
  {
    id: 'mat-tcp-state-machine',
    unit: 'Unit 4',
    category: 'protocols',
    title: 'TCP Connection State Machine & Lifecycle Invariants',
    rfc: 'RFC 793 / RFC 9293',
    tags: ['TCP', 'Handshake', 'TIME_WAIT', 'FIN', 'SYN'],
    summary: 'Finite state machine transitions for client and server connection management.',
    content: `================================================================================
TCP CONNECTION STATE TRANSITION SUMMARY
================================================================================
State           Trigger Event                       Action Taken
--------------------------------------------------------------------------------
CLOSED          Active Open (Client calls connect) Send SYN (Seq=x) -> SYN_SENT
CLOSED          Passive Open (Server calls listen) Wait for incoming -> LISTEN
LISTEN          Receive SYN                         Send SYN+ACK -> SYN_RCVD
SYN_SENT        Receive SYN+ACK                     Send ACK -> ESTABLISHED
SYN_RCVD        Receive ACK                         Transition to ESTABLISHED

CONNECTION TEARDOWN (4-WAY HANDSHAKE):
ESTABLISHED     Active Close (Client calls close)  Send FIN -> FIN_WAIT_1
FIN_WAIT_1      Receive ACK of FIN                  Transition to FIN_WAIT_2
FIN_WAIT_2      Receive FIN from Server             Send ACK -> TIME_WAIT
TIME_WAIT       Timer expires (2 * MSL)            Transition to CLOSED

SERVER TEARDOWN:
ESTABLISHED     Receive FIN from Client             Send ACK -> CLOSE_WAIT
CLOSE_WAIT      Passive Close (Server calls close) Send FIN -> LAST_ACK
LAST_ACK        Receive ACK of FIN                  Transition to CLOSED

WHY 2*MSL (Maximum Segment Lifetime in TIME_WAIT)?
1. Guarantees the final ACK is acknowledged or retransmitted before port reuse.
2. Prevents old duplicate segments from corrupting future connections.`
  },
  {
    id: 'mat-well-known-ports',
    unit: 'Unit 5',
    category: 'ports',
    title: 'Well-Known & Registered Network Port Directory',
    rfc: 'IANA Service Names',
    tags: ['Ports', 'DNS', 'HTTP', 'HTTPS', 'DHCP', 'SSH', 'BGP'],
    summary: 'Standard assigned Layer 4 port numbers for foundational Internet services.',
    content: `================================================================================
INTERNET ASSIGNED NUMBERS AUTHORITY (IANA) PORT DIRECTORY
================================================================================
Port    Protocol    Service / Description
--------------------------------------------------------------------------------
20/21   TCP         FTP (File Transfer Protocol - Data / Control)
22      TCP         SSH (Secure Shell - Encrypted remote terminal)
23      TCP         Telnet (Unencrypted plaintext remote terminal)
25      TCP         SMTP (Simple Mail Transfer Protocol - Mail delivery)
53      TCP/UDP     DNS (Domain Name System - UDP for queries, TCP for zone transfer)
67/68   UDP         DHCP (Dynamic Host Configuration Protocol - 67 Server, 68 Client)
69      UDP         TFTP (Trivial File Transfer Protocol)
80      TCP         HTTP (Hypertext Transfer Protocol)
110     TCP         POP3 (Post Office Protocol v3)
123     UDP         NTP (Network Time Protocol)
143     TCP         IMAP (Internet Message Access Protocol)
161/162 UDP         SNMP (Simple Network Management Protocol)
179     TCP         BGP (Border Gateway Protocol)
443     TCP/UDP     HTTPS (HTTP over TLS / HTTP/3 over QUIC)
587     TCP         SMTP Submission (Modern authenticated email send)
993     TCP         IMAPS (IMAP over TLS/SSL)
995     TCP         POP3S (POP3 over TLS/SSL)`
  }
];

export const MaterialsViewer: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'headers' | 'cidr' | 'protocols' | 'ports'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<MaterialItem | null>(null);

  const filtered = MATERIALS_ITEMS.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const handleCopy = (item: MaterialItem) => {
    soundFx.playClick();
    navigator.clipboard.writeText(item.content);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'All Materials' },
          { id: 'headers', label: 'Headers & Packets' },
          { id: 'cidr', label: 'CIDR & Subnetting' },
          { id: 'protocols', label: 'Protocols & State Machines' },
          { id: 'ports', label: 'Port Directory' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              soundFx.playClick();
              setSelectedCategory(tab.id as any);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-headline font-bold transition-all cursor-pointer ${
              selectedCategory === tab.id
                ? 'bg-primary text-white shadow-xs'
                : 'bg-surface-container hover:bg-surface-container-high text-slate-700 dark:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-[#111827] border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {item.unit} • {item.rfc || 'Standard'}
                </span>

                <button
                  onClick={() => handleCopy(item)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                  title="Copy full specification"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-1">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                {item.summary}
              </p>

              {/* Tag Pills */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {item.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                soundFx.playClick();
                setActiveItem(item);
              }}
              className="w-full py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Inspect Full Reference Sheet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Modal Inspector when a material is clicked */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#111827] border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-primary">
                  {activeItem.unit} • {activeItem.rfc}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {activeItem.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(activeItem)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {copiedId === activeItem.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  <span>{copiedId === activeItem.id ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={() => setActiveItem(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto my-4 bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed shadow-inner">
              {activeItem.content}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setActiveItem(null)}
                className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs cursor-pointer hover:bg-primary-container"
              >
                Close Reference
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
