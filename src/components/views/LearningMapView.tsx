import React, { useState, useCallback, useMemo } from "react";
import { NavTab } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { soundFx } from "../../utils/soundEffects";

interface LearningMapViewProps {
  onSelectLesson?: (lessonId: string, sectionId: number) => void;
  onNavigate?: (tab: NavTab) => void;
}

const assetPathPrefix = "/assets";
const imgMapCanvas = `${assetPathPrefix}/9b25e.png`;
const imgPathConnector = `${assetPathPrefix}/cbc61.svg`;
const imgPathConnector1 = `${assetPathPrefix}/d15da.svg`;
const imgPathConnector2 = `${assetPathPrefix}/56dd6.svg`;
const imgPathConnector3 = `${assetPathPrefix}/befe9.svg`;
const imgPathConnector4 = `${assetPathPrefix}/d4d9d.svg`;
const imgPathConnector5 = `${assetPathPrefix}/b848f.svg`;
const imgPathConnector6 = `${assetPathPrefix}/14497.svg`;
const imgPathConnector7 = `${assetPathPrefix}/a9552.svg`;
const imgPathConnector8 = `${assetPathPrefix}/ae707.svg`;
const imgPathConnector9 = `${assetPathPrefix}/5ff1f.svg`;
const imgPathConnector10 = `${assetPathPrefix}/5bfed.svg`;
const imgPathConnector11 = `${assetPathPrefix}/a3c2d.svg`;
const imgPathConnector12 = `${assetPathPrefix}/ca5b2.svg`;
const imgPathConnector13 = `${assetPathPrefix}/aa3f4.svg`;
const imgPathConnector14 = `${assetPathPrefix}/99255.svg`;
const imgPathConnector15 = `${assetPathPrefix}/4c5c5.svg`;
const imgPathConnector16 = `${assetPathPrefix}/2e806.svg`;
const imgPathConnector17 = `${assetPathPrefix}/db270.svg`;
const imgPathConnector18 = `${assetPathPrefix}/8e00a.svg`;
const imgStar = `${assetPathPrefix}/2fc2c.svg`;
const imgLockKeyhole = `${assetPathPrefix}/725fc.svg`;
const imgRadioTower = `${assetPathPrefix}/791c4.svg`;
const imgShieldCheck = `${assetPathPrefix}/0a485.svg`;
const imgCircleX = `${assetPathPrefix}/2add4.svg`;

type NodeStatus = "completed" | "current" | "in-progress" | "locked";

interface LevelNodeConfig {
  id: number;
  label: string;
  area: string;
  title: string;
  description: string;
  lessonId: string;
  unitIndex: number;
  xp: number;
  lessons: number;
  left: number;
  top: number;
}

interface LevelNode extends LevelNodeConfig {
  status: NodeStatus;
  completedLessons: number;
}

// 21 Island Pathway Levels mapped cleanly across Units 3, 4, and 5 Curriculum
const LEVEL_CONFIGS: LevelNodeConfig[] = [
  // ==========================================
  // UNIT 3: NETWORK LAYER (Levels 1 - 8)
  // ==========================================
  {
    id: 1,
    label: "1",
    area: "LAN Village",
    title: "Network Layer: Need & Issues",
    description: "Store-and-forward packet switching, connectionless datagram vs virtual circuit services, and Layer 3 design issues.",
    lessonId: "u3_m01",
    unitIndex: 0,
    xp: 100,
    lessons: 4,
    left: 130,
    top: 470,
  },
  {
    id: 2,
    label: "2",
    area: "LAN Village",
    title: "Routing Algorithms",
    description: "Shortest path routing, graph traversal, Distance Vector vs Link State principles, and network metrics.",
    lessonId: "u3_m02",
    unitIndex: 0,
    xp: 120,
    lessons: 5,
    left: 210,
    top: 490,
  },
  {
    id: 3,
    label: "3",
    area: "LAN Village",
    title: "Quality of Service (QoS)",
    description: "Traffic shaping, policing, Leaky Bucket and Token Bucket rate control algorithms, jitter, and delay guarantees.",
    lessonId: "u3_m03",
    unitIndex: 0,
    xp: 110,
    lessons: 5,
    left: 250,
    top: 410,
  },
  {
    id: 4,
    label: "4",
    area: "LAN Village",
    title: "IPv4 & IPv6 Packet Formats",
    description: "IPv4 20-byte vs IPv6 40-byte fixed headers, extension headers, Path MTU discovery, and traffic classification.",
    lessonId: "u3_m05",
    unitIndex: 0,
    xp: 130,
    lessons: 6,
    left: 210,
    top: 310,
  },
  {
    id: 5,
    label: "5",
    area: "LAN Village",
    title: "Addressing & Router Configuration",
    description: "Logical IPv4/IPv6 address structures, Cisco router console setup, interface configurations, and MOTD banners.",
    lessonId: "u3_m06",
    unitIndex: 0,
    xp: 140,
    lessons: 7,
    left: 300,
    top: 270,
  },
  {
    id: 6,
    label: "6",
    area: "Routing Mountains",
    title: "Distance Vector Routing & RIP",
    description: "Routing Information Protocol, Bellman-Ford equation, 30-second periodic updates, hop counts, and split horizon.",
    lessonId: "u3_m02",
    unitIndex: 0,
    xp: 150,
    lessons: 8,
    left: 300,
    top: 180,
  },
  {
    id: 7,
    label: "7",
    area: "Routing Mountains",
    title: "Link State Routing, OSPF & BGP",
    description: "Dijkstra algorithm, Autonomous Systems, OSPF area hierarchies, Link State Advertisements, and BGP inter-AS routing.",
    lessonId: "u3_m07",
    unitIndex: 0,
    xp: 160,
    lessons: 8,
    left: 380,
    top: 220,
  },
  {
    id: 8,
    label: "8",
    area: "Security Fortress",
    title: "Subnetting, CIDR, VLSM & Protocols",
    description: "Classless Inter-Domain Routing, Variable Length Subnet Masks, DHCP DORA exchange, ARP, NAT & ICMP error reporting.",
    lessonId: "u3_m08",
    unitIndex: 0,
    xp: 180,
    lessons: 10,
    left: 440,
    top: 340,
  },

  // ==========================================
  // UNIT 4: TRANSPORT LAYER (Levels 9 - 15)
  // ==========================================
  {
    id: 9,
    label: "9",
    area: "Seaside Village",
    title: "Transport Layer Services",
    description: "Process-to-process delivery, port multiplexing, socket addresses, and connectionless vs connection-oriented transport.",
    lessonId: "u4_m05",
    unitIndex: 1,
    xp: 120,
    lessons: 6,
    left: 550,
    top: 390,
  },
  {
    id: 10,
    label: "10",
    area: "Seaside Village",
    title: "Transport Protocols: ARQ Challenge",
    description: "BOSS BATTLE: Simple protocol, Stop-and-Wait, Go-Back-N, and Selective Repeat sliding window protocols!",
    lessonId: "u4_m05",
    unitIndex: 1,
    xp: 250,
    lessons: 1,
    left: 650,
    top: 340,
  },
  {
    id: 11,
    label: "11",
    area: "Seaside Village",
    title: "User Datagram Protocol (UDP)",
    description: "Connectionless datagram service, minimal 8-byte header, lightweight checksum, real-time multimedia streaming, and DNS.",
    lessonId: "u4_m06",
    unitIndex: 1,
    xp: 130,
    lessons: 5,
    left: 580,
    top: 470,
  },
  {
    id: 12,
    label: "12",
    area: "Wireless Woods",
    title: "TCP Services & Segment Structure",
    description: "Transmission Control Protocol features, byte streaming, sequence numbers, checksum validation, and header fields.",
    lessonId: "u4_m05",
    unitIndex: 1,
    xp: 140,
    lessons: 8,
    left: 760,
    top: 380,
  },
  {
    id: 13,
    label: "13",
    area: "Wireless Woods",
    title: "TCP Connection: 3-Way Handshake",
    description: "Active open negotiation (SYN, SYN-ACK, ACK), full-duplex synchronization, initial sequence numbers, and teardown.",
    lessonId: "u4_m05",
    unitIndex: 1,
    xp: 150,
    lessons: 7,
    left: 790,
    top: 290,
  },
  {
    id: 14,
    label: "14",
    area: "Wireless Woods",
    title: "TCP State Transition Diagram",
    description: "Finite state machine tracking (LISTEN, ESTABLISHED, FIN_WAIT, TIME_WAIT) and receive buffer sliding windows.",
    lessonId: "u4_m05",
    unitIndex: 1,
    xp: 160,
    lessons: 6,
    left: 890,
    top: 260,
  },
  {
    id: 15,
    label: "15",
    area: "Wireless Woods",
    title: "TCP Flow, Error & Congestion Control",
    description: "Fast retransmit heuristics, duplicate ACKs, RTO calculation, and AIMD Slow Start / Congestion Avoidance algorithms.",
    lessonId: "u4_m05",
    unitIndex: 1,
    xp: 180,
    lessons: 8,
    left: 910,
    top: 360,
  },

  // ==========================================
  // UNIT 5: APPLICATION LAYER (Levels 16 - 21)
  // ==========================================
  {
    id: 16,
    label: "16",
    area: "Internet Ocean",
    title: "Domain Name System (DNS)",
    description: "Distributed hierarchical namespace (Root, TLD, Authoritative), recursive resolvers, and resource record types (A, MX, CNAME).",
    lessonId: "u5_m02",
    unitIndex: 2,
    xp: 140,
    lessons: 9,
    left: 970,
    top: 480,
  },
  {
    id: 17,
    label: "17",
    area: "Internet Ocean",
    title: "World Wide Web & HTTP / HTTPS",
    description: "Client-server web transactions, HTTP request methods, response status codes, proxy caching, and TLS encryption.",
    lessonId: "u5_m02",
    unitIndex: 2,
    xp: 150,
    lessons: 8,
    left: 1090,
    top: 470,
  },
  {
    id: 18,
    label: "18",
    area: "Internet Ocean",
    title: "File Transfer Protocol (FTP)",
    description: "Dual-channel architecture: Control channel (Port 21) vs Data channel (Port 20), active and passive connection modes.",
    lessonId: "u5_m02",
    unitIndex: 2,
    xp: 140,
    lessons: 7,
    left: 1180,
    top: 420,
  },
  {
    id: 19,
    label: "19",
    area: "Mountain Trail",
    title: "Email Protocols: SMTP, POP3 & IMAP",
    description: "Electronic mail transfer via SMTP (Port 25/587) and mailbox retrieval/synchronization via POP3 (Port 110) and IMAP (Port 143).",
    lessonId: "u5_m02",
    unitIndex: 2,
    xp: 150,
    lessons: 8,
    left: 1210,
    top: 310,
  },
  {
    id: 20,
    label: "20",
    area: "Mountain Trail",
    title: "Remote Terminal: Telnet vs SSH",
    description: "Network Virtual Terminal vulnerabilities on port 23 versus cryptographic SSH-2 tunneling on port 22.",
    lessonId: "u5_m08",
    unitIndex: 2,
    xp: 160,
    lessons: 9,
    left: 1250,
    top: 230,
  },
  {
    id: 21,
    label: "21",
    area: "Lighthouse Point",
    title: "TCP/IP Mastery & Internet Capstone",
    description: "Final comprehensive challenge: Complete end-to-end packet journey through the full 5-layer internet protocol stack.",
    lessonId: "u5_m08",
    unitIndex: 2,
    xp: 300,
    lessons: 12,
    left: 1330,
    top: 150,
  },
];

function NodeDot({ node, onClick }: { node: LevelNode; onClick: (n: LevelNode) => void }) {
  const isCompleted = node.status === "completed";
  const isCurrent = node.status === "current";
  const isInProgress = node.status === "in-progress";
  const isLocked = node.status === "locked";

  let bg = "";
  let border = "";
  let textColor = "text-white";
  let shadow = "drop-shadow-[0px_4px_0px_rgba(0,0,0,0.25)]";

  if (isCompleted) {
    bg = "bg-[#4cd15b]";
    border = "border-[#1e3a1e]";
  } else if (isCurrent) {
    bg = "bg-[#ffc229]";
    border = "border-[#5c4600]";
    textColor = "text-[#0a1428]";
    shadow = "";
  } else if (isInProgress) {
    if (node.id === 10) {
      bg = "bg-[#9d4edd]";
      border = "border-[#4c1d95]";
    } else {
      bg = "bg-[#ff8e25]";
      border = "border-[#7c2d12]";
    }
  } else {
    bg = "bg-[#94a3b8]";
    border = "border-[#475569]";
  }

  return (
    <div
      className={`absolute flex items-center justify-center rounded-[18px] size-[36px] border-3 border-solid ${bg} ${border} ${shadow} cursor-pointer transition-transform hover:scale-110 active:scale-95 select-none ${
        isCurrent ? "node-current" : ""
      }`}
      style={{ left: node.left, top: node.top }}
      onClick={() => !isLocked && onClick(node)}
      title={isLocked ? `Level ${node.id} — Complete previous levels to unlock` : `Level ${node.id}: ${node.title} (${node.area})`}
    >
      {isLocked ? (
        <div className="flex items-center justify-center size-full">
          <img alt="locked" className="block size-[10px]" src={imgLockKeyhole} />
        </div>
      ) : (
        <p className={`font-['Sora:ExtraBold'] font-extrabold text-[14px] leading-none ${textColor}`}>
          {node.label}
        </p>
      )}

      {/* Star for completed */}
      {isCompleted && (
        <div className="absolute flex items-center justify-center size-[16px] left-[7px] top-[-19px]">
          <img alt="star" className="block size-[12px]" src={imgStar} />
        </div>
      )}

      {/* Level badge for current */}
      {isCurrent && (
        <div className="absolute -translate-x-1/2 left-1/2 top-[38px] bg-[#ffc229] border border-[#0a1428] border-solid flex items-center px-[6px] py-[2px] rounded-[4px] shadow-sm z-20">
          <p className="font-['Sora:ExtraBold'] font-extrabold text-[#0a1428] text-[8px] whitespace-nowrap leading-none">
            LEVEL {node.id}
          </p>
        </div>
      )}
    </div>
  );
}

function NodeModal({
  node,
  onClose,
  onPlay,
}: {
  node: LevelNode;
  onClose: () => void;
  onPlay: (n: LevelNode) => void;
}) {
  const isLocked = node.status === "locked";
  const isCompleted = node.status === "completed";
  const progress = Math.min(100, Math.round((node.completedLessons / node.lessons) * 100));

  const statusColor = isCompleted
    ? "text-[#4cd15b]"
    : node.status === "current"
    ? "text-[#ffc229]"
    : node.status === "in-progress"
    ? "text-[#ff8e25]"
    : "text-[#94a3b8]";

  const statusLabel = isCompleted
    ? "✓ Completed"
    : node.status === "current"
    ? "⚡ Current Level"
    : node.status === "in-progress"
    ? "▶ In Progress"
    : "🔒 Locked";

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-[2px]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-appear bg-[#fdf0d5] border-3 border-[#0a1428] border-solid rounded-[16px] w-[360px] max-w-[90vw] shadow-[0px_8px_0px_rgba(0,0,0,0.3)] overflow-hidden">
        {/* Header */}
        <div
          className={`px-5 pt-5 pb-4 ${
            isCompleted
              ? "bg-[#4cd15b]/20"
              : node.status === "current"
              ? "bg-[#ffc229]/20"
              : node.status === "in-progress"
              ? "bg-[#ff8e25]/20"
              : "bg-[#94a3b8]/20"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-['Sora:ExtraBold'] font-extrabold text-[20px] text-[#0a1428] leading-tight">
                Level {node.id}: {node.title}
              </p>
              <p className="font-['Inter:Bold'] font-bold text-[11px] text-[#0a1428]/60 uppercase tracking-wider mt-0.5">
                {node.area}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className={`font-['Sora:ExtraBold'] font-extrabold text-[11px] ${statusColor}`}>
                {statusLabel}
              </span>
              <span className="font-['Inter:Bold'] font-bold text-[11px] text-[#0a1428]/70">
                +{node.xp} XP
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          <p className="font-['Inter:Bold'] font-bold text-[13px] text-[#0a1428]/80 leading-snug">
            {node.description}
          </p>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-['Sora:ExtraBold'] font-extrabold text-[10px] text-[#0a1428]/60 uppercase tracking-wider">
                Progress
              </span>
              <span className="font-['Sora:ExtraBold'] font-extrabold text-[10px] text-[#0a1428]">
                {node.completedLessons}/{node.lessons} lessons
              </span>
            </div>
            <div className="h-[10px] bg-[#0a1428]/10 rounded-full overflow-hidden border border-[#0a1428]/20">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progress}%`,
                  background: isCompleted
                    ? "#4cd15b"
                    : node.status === "current"
                    ? "#ffc229"
                    : node.status === "in-progress"
                    ? "#ff8e25"
                    : "#94a3b8",
                }}
              />
            </div>
          </div>

          {/* Stars */}
          {isCompleted && (
            <div className="flex gap-1 items-center">
              {[1, 2, 3].map((i) => (
                <img
                  key={i}
                  alt="star"
                  className="size-[18px] star-spin"
                  src={imgStar}
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
              <span className="font-['Sora:ExtraBold'] font-extrabold text-[11px] text-[#0a1428]/60 ml-1">
                Completed!
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-[10px] bg-[#0a1428]/10 border-2 border-[#0a1428]/20 border-solid font-['Sora:ExtraBold'] font-extrabold text-[13px] text-[#0a1428] cursor-pointer hover:bg-[#0a1428]/20 transition-colors active:scale-95"
          >
            Close
          </button>
          {!isLocked && (
            <button
              onClick={() => onPlay(node)}
              className={`flex-[2] py-2.5 rounded-[10px] border-3 border-solid font-['Sora:ExtraBold'] font-extrabold text-[13px] cursor-pointer transition-all active:scale-95 shadow-[0px_4px_0px_rgba(0,0,0,0.2)] hover:shadow-[0px_2px_0px_rgba(0,0,0,0.2)] hover:translate-y-[2px]
                ${
                  isCompleted
                    ? "bg-[#4cd15b] border-[#1e3a1e] text-white hover:bg-[#3cba4b]"
                    : node.status === "current"
                    ? "bg-[#ffc229] border-[#5c4600] text-[#0a1428] hover:bg-[#ffb800]"
                    : "bg-[#ff8e25] border-[#7c2d12] text-white hover:bg-[#f07d14]"
                }`}
            >
              {isCompleted ? "Play Again" : node.status === "current" ? "Start Lesson →" : "Start →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function HUD({
  userXp,
  completedCount,
  currentLevelNumber,
}: {
  userXp: number;
  completedCount: number;
  currentLevelNumber: number;
}) {
  const targetXp = 1500;
  const levelProgress = Math.min(100, Math.round((userXp / targetXp) * 100));

  const rankTitle =
    currentLevelNumber <= 2
      ? "Novice"
      : currentLevelNumber <= 4
      ? "Scout"
      : currentLevelNumber <= 7
      ? "Ranger"
      : currentLevelNumber <= 11
      ? "Navigator"
      : currentLevelNumber <= 16
      ? "Commander"
      : currentLevelNumber <= 20
      ? "Architect"
      : "Overlord";

  return (
    <div className="absolute top-[14px] right-[14px] z-10 bg-[#0a1428]/80 backdrop-blur-sm border-2 border-[#ffc229]/40 border-solid rounded-[14px] px-4 py-3 flex flex-col gap-2 min-w-[160px]">
      <div className="flex items-center gap-2">
        <div className="size-[32px] rounded-full bg-[#ffc229] border-2 border-[#0a1428] border-solid flex items-center justify-center">
          <span className="font-['Sora:ExtraBold'] font-extrabold text-[12px] text-[#0a1428]">
            {currentLevelNumber}
          </span>
        </div>
        <div>
          <p className="font-['Sora:ExtraBold'] font-extrabold text-[11px] text-white/60 uppercase tracking-wider leading-none">
            Level
          </p>
          <p className="font-['Sora:ExtraBold'] font-extrabold text-[14px] text-white leading-tight">
            {rankTitle}
          </p>
        </div>
      </div>
      <div>
        <div className="flex justify-between mb-1">
          <span className="font-['Inter:Bold'] font-bold text-[9px] text-white/50 uppercase">XP</span>
          <span className="font-['Inter:Bold'] font-bold text-[9px] text-[#ffc229]">
            {userXp}/{targetXp}
          </span>
        </div>
        <div className="h-[6px] bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-[#ffc229] rounded-full transition-all duration-500" style={{ width: `${levelProgress}%` }} />
        </div>
      </div>
      <div className="flex justify-between pt-1 border-t border-white/10">
        <div className="text-center">
          <p className="font-['Sora:ExtraBold'] font-extrabold text-[16px] text-[#4cd15b] leading-none">
            {completedCount}
          </p>
          <p className="font-['Inter:Bold'] font-bold text-[8px] text-white/40 uppercase">Done</p>
        </div>
        <div className="text-center">
          <p className="font-['Sora:ExtraBold'] font-extrabold text-[16px] text-[#ffc229] leading-none">
            {Math.max(0, 21 - completedCount)}
          </p>
          <p className="font-['Inter:Bold'] font-bold text-[8px] text-white/40 uppercase">Left</p>
        </div>
        <div className="text-center">
          <p className="font-['Sora:ExtraBold'] font-extrabold text-[16px] text-white leading-none">
            21
          </p>
          <p className="font-['Inter:Bold'] font-bold text-[8px] text-white/40 uppercase">Total</p>
        </div>
      </div>
    </div>
  );
}

export const LearningMapView: React.FC<LearningMapViewProps> = ({
  onSelectLesson,
  onNavigate,
}) => {
  const { userProfile } = useAuth();
  const [selectedNode, setSelectedNode] = useState<LevelNode | null>(null);

  // Derive student's live progression from Firebase userProfile
  const completedList = useMemo(() => userProfile?.completedModules || [], [userProfile?.completedModules]);
  const userXp = useMemo(() => userProfile?.totalXP || userProfile?.xp || 0, [userProfile?.totalXP, userProfile?.xp]);

  // Helper to check whether a level node is completed
  const isLevelCompleted = useCallback(
    (cfg: LevelNodeConfig) => {
      if (completedList.includes(cfg.lessonId)) return true;
      if (completedList.includes(`level_${cfg.id}`) || completedList.includes(`lvl_${cfg.id}`)) return true;
      if (cfg.id === 1 && (completedList.includes("u3_m1") || completedList.includes("u3_m01"))) return true;
      return false;
    },
    [completedList]
  );

  // Compute live node states (completed, current, in-progress, locked)
  const nodes: LevelNode[] = useMemo(() => {
    // Find the first uncompleted level index
    let firstUncompletedIdx = LEVEL_CONFIGS.findIndex((cfg) => !isLevelCompleted(cfg));
    if (firstUncompletedIdx === -1) {
      firstUncompletedIdx = 999; // All completed!
    }

    return LEVEL_CONFIGS.map((cfg, index) => {
      const completed = isLevelCompleted(cfg);
      let status: NodeStatus = "locked";

      if (completed) {
        status = "completed";
      } else if (index === firstUncompletedIdx) {
        status = cfg.id === 10 ? "in-progress" : "current";
      } else if (index < firstUncompletedIdx) {
        status = "completed";
      } else {
        status = "locked";
      }

      const completedLessons = completed ? cfg.lessons : status === "current" ? 1 : 0;

      return {
        ...cfg,
        status,
        completedLessons,
      };
    });
  }, [isLevelCompleted]);

  const completedCount = useMemo(() => nodes.filter((n) => n.status === "completed").length, [nodes]);
  const currentLevelNumber = useMemo(() => {
    const currentNode = nodes.find((n) => n.status === "current" || n.status === "in-progress");
    return currentNode ? currentNode.id : Math.min(21, completedCount + 1);
  }, [nodes, completedCount]);

  // Handle Play Action: launch actual interactive lesson player
  const handlePlay = useCallback(
    (node: LevelNode) => {
      setSelectedNode(null);
      soundFx.playClick();

      // Boss battle level routes to challenges if navigated
      if (node.id === 10 && onNavigate) {
        onNavigate("boss-challenge");
        return;
      }

      // Launch full gamified lesson view
      if (onSelectLesson) {
        onSelectLesson(node.lessonId, node.unitIndex);
      }
    },
    [onSelectLesson, onNavigate]
  );

  return (
    <div className="w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border-2 border-[#0a1428]/30 bg-[#5ba8d4] flex flex-col relative min-h-[660px] h-[calc(100vh-140px)]">
      {/* Top title bar for narrow viewports */}
      <div className="flex-shrink-0 md:hidden flex items-center justify-center py-3 bg-[#0a1428]/60">
        <p
          className="font-['Sora:ExtraBold'] font-extrabold text-[#ffc229] text-[22px]"
          style={{ textShadow: "0px 2px 0px black" }}
        >
          CRESCO ISLAND
        </p>
      </div>

      {/* Map scroll area */}
      <div className="flex-1 map-scroll relative overflow-auto">
        {/* Fixed HUD overlay */}
        <HUD
          userXp={userXp}
          completedCount={completedCount}
          currentLevelNumber={currentLevelNumber}
        />

        {/* Archipelago Adventures label */}
        <div className="absolute top-[60px] left-[20px] z-10 pointer-events-none">
          <p
            className="font-['Sora:ExtraBold'] font-extrabold text-white text-[16px] leading-tight uppercase"
            style={{ textShadow: "0px 2px 0px rgba(0,0,0,0.5)" }}
          >
            ARCHIPELAGO
            <br />
            ADVENTURES
          </p>
        </div>

        {/* Map canvas - fixed 1440×620 coordinate space */}
        <div className="relative" style={{ width: 1440, height: 620, minHeight: 620 }}>
          {/* Background map image */}
          <img
            alt="Cresco Island map"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            src={imgMapCanvas}
          />

          {/* Ambient clouds */}
          <div className="absolute bg-white blur-[4px] h-[40px] left-[80px] opacity-60 rounded-[999px] top-[40px] w-[180px] cloud-drift pointer-events-none" />
          <div
            className="absolute bg-white blur-[4px] h-[50px] left-[1100px] opacity-70 rounded-[999px] top-[80px] w-[220px] cloud-drift pointer-events-none"
            style={{ animationDelay: "2s" }}
          />
          <div
            className="absolute bg-white blur-[4px] h-[30px] left-[500px] opacity-50 rounded-[999px] top-[520px] w-[140px] cloud-drift pointer-events-none"
            style={{ animationDelay: "4s" }}
          />

          {/* Path connectors */}
          <div className="absolute flex h-[20.005px] items-center justify-center left-[148px] top-[488px] w-[79.997px] pointer-events-none">
            <div className="flex-none rotate-[14.04deg]">
              <div className="h-0 relative w-[82.46px]">
                <div className="absolute inset-[-12px_-7.28%_-6px_-7.28%]">
                  <img alt="" className="block max-w-none size-full" src={imgPathConnector} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[79.994px] items-center justify-center left-[228px] top-[428.01px] w-[40.006px] pointer-events-none">
            <div className="flex-none rotate-[-63.43deg]">
              <div className="h-0 relative w-[89.44px]">
                <div className="absolute inset-[-12px_-6.71%_-6px_-6.71%]">
                  <img alt="" className="block max-w-none size-full" src={imgPathConnector1} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[99.998px] items-center justify-center left-[228px] top-[328px] w-[39.996px] pointer-events-none">
            <div className="flex-none rotate-[-111.8deg]">
              <div className="h-0 relative w-[107.7px]">
                <div className="absolute inset-[-12px_-5.57%_-6px_-5.57%]">
                  <img alt="" className="block max-w-none size-full" src={imgPathConnector2} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[39.997px] items-center justify-center left-[228px] top-[288px] w-[90.003px] pointer-events-none">
            <div className="flex-none rotate-[-23.96deg]">
              <div className="h-0 relative w-[98.49px]">
                <div className="absolute inset-[-12px_-6.09%_-6px_-6.09%]">
                  <img alt="" className="block max-w-none size-full" src={imgPathConnector3} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[90px] items-center justify-center left-[318px] top-[198px] w-0 pointer-events-none">
            <div className="-rotate-90 flex-none">
              <div className="h-0 relative w-[90px]">
                <div className="absolute inset-[-12px_-6.67%_-6px_-6.67%]">
                  <img alt="" className="block max-w-none size-full" src={imgPathConnector4} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[40.006px] items-center justify-center left-[318px] top-[198px] w-[79.994px] pointer-events-none">
            <div className="flex-none rotate-[26.57deg]">
              <div className="h-0 relative w-[89.44px]">
                <div className="absolute inset-[-12px_-6.71%_-6px_-6.71%]">
                  <img alt="" className="block max-w-none size-full" src={imgPathConnector5} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[120.027px] items-center justify-center left-[398px] top-[238px] w-[60.026px] pointer-events-none">
            <div className="flex-none rotate-[63.43deg]">
              <div className="h-0 relative w-[134.2px]">
                <div className="absolute inset-[-6px_0_0_0]">
                  <img alt="" className="block max-w-none size-full" src={imgPathConnector6} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[49.98px] items-center justify-center left-[458px] top-[358px] w-[109.976px] pointer-events-none">
            <div className="flex-none rotate-[24.44deg]">
              <div className="h-0 relative w-[120.8px]">
                <div className="absolute inset-[-6px_0_0_0]">
                  <img alt="" className="block max-w-none size-full" src={imgPathConnector7} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[50.007px] items-center justify-center left-[568px] top-[357.99px] w-[99.993px] pointer-events-none">
            <div className="flex-none rotate-[-26.57deg]">
              <div className="h-0 relative w-[111.8px]">
                <div className="absolute inset-[-6px_0_0_0]">
                  <img alt="" className="block max-w-none size-full" src={imgPathConnector8} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[129.958px] items-center justify-center left-[598.02px] top-[358px] w-[69.975px] pointer-events-none">
            <div className="flex-none rotate-[118.3deg]">
              <div className="h-0 relative w-[147.6px]">
                <div className="absolute inset-[-6px_0_0_0]">
                  <img alt="" className="block max-w-none size-full" src={imgPathConnector9} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[89.995px] items-center justify-center left-[598px] top-[398.01px] w-[179.951px] pointer-events-none">
            <div className="flex-none rotate-[-26.57deg]">
              <div className="h-0 relative w-[201.2px]">
                <div className="absolute inset-[-6px_0_0_0]">
                  <img alt="" className="block max-w-none size-full" src={imgPathConnector10} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[90.004px] items-center justify-center left-[778px] top-[308px] w-[29.993px] pointer-events-none">
            <div className="flex-none rotate-[-71.57deg]">
              <div className="h-0 relative w-[94.87px]">
                <div className="absolute inset-[-6px_0_0_0]">
                  <img alt="" className="block max-w-none size-full" src={imgPathConnector11} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[30px] items-center justify-center left-[808px] top-[278px] w-[99.997px] pointer-events-none">
            <div className="flex-none rotate-[-16.7deg]">
              <div className="h-0 relative w-[104.4px]">
                <div className="absolute inset-[-6px_0_0_0]">
                  <img alt="" className="block max-w-none size-full" src={imgPathConnector12} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[100.019px] items-center justify-center left-[908px] top-[278px] w-[20.004px] pointer-events-none">
            <div className="flex-none rotate-[78.69deg]">
              <div className="h-0 relative w-[102px]">
                <div className="absolute inset-[-6px_0_0_0]">
                  <img alt="" className="block max-w-none size-full" src={imgPathConnector13} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[120.027px] items-center justify-center left-[928px] top-[378px] w-[60.026px] pointer-events-none">
            <div className="flex-none rotate-[63.43deg]">
              <div className="h-0 relative w-[134.2px]">
                <div className="absolute inset-[-6px_0_0_0]">
                  <img alt="" className="block max-w-none size-full" src={imgPathConnector6} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[9.991px] items-center justify-center left-[988px] top-[488.01px] w-[119.985px] pointer-events-none">
            <div className="flex-none rotate-[-4.76deg]">
              <div className="h-0 relative w-[120.4px]">
                <div className="absolute inset-[-6px_0_0_0]">
                  <img alt="" className="block max-w-none size-full" src={imgPathConnector14} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[50.014px] items-center justify-center left-[1108px] top-[437.99px] w-[90.042px] pointer-events-none">
            <div className="flex-none rotate-[-29.05deg]">
              <div className="h-0 relative w-[103px]">
                <div className="absolute inset-[-6px_0_0_0]">
                  <img alt="" className="block max-w-none size-full" src={imgPathConnector15} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[109.981px] items-center justify-center left-[1198px] top-[328.02px] w-[30.005px] pointer-events-none">
            <div className="flex-none rotate-[-74.74deg]">
              <div className="h-0 relative w-[114px]">
                <div className="absolute inset-[-6px_0_0_0]">
                  <img alt="" className="block max-w-none size-full" src={imgPathConnector16} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[79.994px] items-center justify-center left-[1228px] top-[248.01px] w-[40.006px] pointer-events-none">
            <div className="flex-none rotate-[-63.43deg]">
              <div className="h-0 relative w-[89.44px]">
                <div className="absolute inset-[-6px_0_0_0]">
                  <img alt="" className="block max-w-none size-full" src={imgPathConnector17} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex items-center justify-center left-[1268px] size-[79.974px] top-[168.03px] pointer-events-none">
            <div className="-rotate-45 flex-none">
              <div className="h-0 relative w-[113.1px]">
                <div className="absolute inset-[-6px_0_0_0]">
                  <img alt="" className="block max-w-none size-full" src={imgPathConnector18} />
                </div>
              </div>
            </div>
          </div>

          {/* All 21 dynamically-connected level nodes */}
          {nodes.map((node) => (
            <NodeDot key={node.id} node={node} onClick={setSelectedNode} />
          ))}

          {/* START button - activates current or Level 1 node */}
          <div
            className="absolute bg-[#ffc229] border-3 border-[#0a1428] border-solid drop-shadow-[0px_4px_0px_rgba(0,0,0,0.2)] flex flex-col items-start left-[40px] px-[16px] py-[8px] rounded-[12px] top-[540px] cursor-pointer hover:scale-105 active:scale-95 transition-transform select-none"
            onClick={() => {
              const targetNode = nodes.find((n) => n.status === "current" || n.status === "in-progress") || nodes[0];
              setSelectedNode(targetNode);
            }}
          >
            <p className="font-['Sora:ExtraBold'] font-extrabold text-[#0a1428] text-[12px] whitespace-nowrap leading-none">
              START
            </p>
          </div>

          {/* CRESCO ISLAND banner */}
          <div className="absolute bg-[#fdf0d5] border-2 border-[#0a1428] border-solid drop-shadow-[0px_4px_0px_rgba(0,0,0,0.2)] flex flex-col items-start left-[30px] px-[12px] py-[4px] rounded-[8px] top-[600px]">
            <p className="font-['Sora:ExtraBold'] font-extrabold text-[#0a1428] text-[11px] uppercase whitespace-nowrap leading-tight">
              CRESCO ISLAND
            </p>
          </div>

          {/* Area banners */}
          <div className="absolute bg-[#fdf0d5] border-2 border-[#0a1428] border-solid drop-shadow-[0px_4px_0px_rgba(0,0,0,0.2)] flex items-start left-[150px] px-[12px] py-[4px] rounded-[8px] top-[270px]">
            <p className="font-['Sora:ExtraBold'] font-extrabold text-[#0a1428] text-[11px] uppercase whitespace-nowrap leading-tight">
              1. LAN Village
            </p>
          </div>
          <div className="absolute bg-[#fdf0d5] border-2 border-[#0a1428] border-solid drop-shadow-[0px_4px_0px_rgba(0,0,0,0.2)] flex items-start left-[310px] px-[12px] py-[4px] rounded-[8px] top-[130px]">
            <p className="font-['Sora:ExtraBold'] font-extrabold text-[#0a1428] text-[11px] uppercase whitespace-nowrap leading-tight">
              2. Routing Mountains
            </p>
          </div>
          <div className="absolute bg-[#fdf0d5] border-2 border-[#0a1428] border-solid drop-shadow-[0px_4px_0px_rgba(0,0,0,0.2)] flex items-start left-[510px] px-[12px] py-[4px] rounded-[8px] top-[220px]">
            <p className="font-['Sora:ExtraBold'] font-extrabold text-[#0a1428] text-[11px] uppercase whitespace-nowrap leading-tight">
              3. Security Fortress
            </p>
          </div>
          <div className="absolute bg-[#fdf0d5] border-2 border-[#0a1428] border-solid drop-shadow-[0px_4px_0px_rgba(0,0,0,0.2)] flex items-start left-[790px] px-[12px] py-[4px] rounded-[8px] top-[230px]">
            <p className="font-['Sora:ExtraBold'] font-extrabold text-[#0a1428] text-[11px] uppercase whitespace-nowrap leading-tight">
              4. Wireless Woods
            </p>
          </div>
          <div className="absolute bg-[#fdf0d5] border-2 border-[#0a1428] border-solid drop-shadow-[0px_4px_0px_rgba(0,0,0,0.2)] flex items-start left-[1010px] px-[12px] py-[4px] rounded-[8px] top-[530px]">
            <p className="font-['Sora:ExtraBold'] font-extrabold text-[#0a1428] text-[11px] uppercase whitespace-nowrap leading-tight">
              5. Internet Ocean
            </p>
          </div>
          <div className="absolute bg-[#fdf0d5] border-2 border-[#0a1428] border-solid drop-shadow-[0px_4px_0px_rgba(0,0,0,0.2)] flex items-start left-[1260px] px-[12px] py-[4px] rounded-[8px] top-[110px]">
            <p className="font-['Sora:ExtraBold'] font-extrabold text-[#0a1428] text-[11px] uppercase whitespace-pre leading-tight">
              {`6.TCP/IP  END`}
            </p>
          </div>

          {/* Hero title */}
          <div className="absolute flex flex-col items-center left-1/2 -translate-x-1/2 top-[24px]">
            <p
              className="font-['Sora:ExtraBold'] font-extrabold text-[#ffc229] text-[36px] text-center leading-none whitespace-pre"
              style={{ textShadow: "0px 3px 0px black" }}
            >
              {`CRESCO  ISLAND`}
            </p>
          </div>

          {/* GW-1 radio tower */}
          <div className="absolute flex flex-col gap-[2px] items-center left-[340px] top-[110px] pointer-events-none">
            <div className="relative shrink-0 size-[24px]">
              <img alt="radio tower" className="absolute block inset-0 max-w-none size-full" src={imgRadioTower} />
            </div>
            <p className="font-['Inter:Bold'] font-bold text-[9px] text-white whitespace-nowrap leading-none">
              GW-1
            </p>
          </div>

          {/* Shield check at Security Fortress */}
          <div className="absolute bg-[#fdf0d5] border-2 border-[#0a1428] border-solid flex items-start left-[530px] p-[6px] rounded-[6px] top-[260px] pointer-events-none">
            <div className="relative shrink-0 size-[14px]">
              <img alt="shield" className="absolute block inset-0 max-w-none size-full" src={imgShieldCheck} />
            </div>
          </div>

          {/* Circle X at Internet Ocean */}
          <div className="absolute flex flex-col items-center left-[1080px] top-[390px] pointer-events-none">
            <div className="relative shrink-0 size-[32px]">
              <img alt="circle x" className="absolute block inset-0 max-w-none size-full" src={imgCircleX} />
            </div>
          </div>

          {/* Current Location marker */}
          <div
            className="absolute flex flex-col items-center transition-all duration-700"
            style={{
              left: (nodes.find((n) => n.status === "current" || n.status === "in-progress") || nodes[0]).left - 20,
              top: Math.max(10, (nodes.find((n) => n.status === "current" || n.status === "in-progress") || nodes[0]).top - 50),
            }}
          >
            <div className="bg-white/95 border-2 border-[#0a1428] border-solid rounded-[6px] px-[8px] py-[2px] shadow-md pointer-events-none">
              <p className="font-['Sora:ExtraBold'] font-extrabold text-[#0a1428] text-[9px] uppercase leading-tight whitespace-nowrap">
                CURRENT LOCATION
              </p>
            </div>
            <div className="w-[2px] h-[34px] bg-[#0a1428]/60" />
          </div>

          {/* Legend */}
          <div className="absolute bottom-[14px] right-[14px] bg-[#0a1428]/80 backdrop-blur-sm border border-white/10 rounded-[10px] px-3 py-2 flex flex-col gap-1">
            {[
              { color: "#4cd15b", label: "Completed" },
              { color: "#ffc229", label: "Current" },
              { color: "#ff8e25", label: "In Progress" },
              { color: "#9d4edd", label: "Boss Battle" },
              { color: "#94a3b8", label: "Locked" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="size-[10px] rounded-full" style={{ backgroundColor: color }} />
                <span className="font-['Inter:Bold'] font-bold text-[9px] text-white/70">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Node detail modal */}
      {selectedNode && (
        <NodeModal
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onPlay={handlePlay}
        />
      )}
    </div>
  );
};
