import { useState, useCallback } from "react";

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

interface LevelNode {
  id: number;
  label: string;
  area: string;
  status: NodeStatus;
  xp: number;
  description: string;
  lessons: number;
  completedLessons: number;
  left: number;
  top: number;
}

const NODES: LevelNode[] = [
  { id: 1, label: "1", area: "LAN Village", status: "completed", xp: 100, description: "Learn the basics of Local Area Networks and how devices communicate.", lessons: 5, completedLessons: 5, left: 130, top: 470 },
  { id: 2, label: "2", area: "LAN Village", status: "completed", xp: 120, description: "Explore IP addressing, subnets, and MAC addresses in a LAN environment.", lessons: 6, completedLessons: 6, left: 210, top: 490 },
  { id: 3, label: "3", area: "LAN Village", status: "completed", xp: 110, description: "Master switching fundamentals and VLANs.", lessons: 5, completedLessons: 5, left: 250, top: 410 },
  { id: 4, label: "4", area: "LAN Village", status: "completed", xp: 130, description: "Understand ARP, DHCP, and network troubleshooting.", lessons: 6, completedLessons: 6, left: 210, top: 310 },
  { id: 5, label: "5", area: "LAN Village", status: "completed", xp: 140, description: "Bridge your LAN knowledge with routing principles.", lessons: 7, completedLessons: 7, left: 300, top: 270 },
  { id: 6, label: "6", area: "Routing Mountains", status: "completed", xp: 150, description: "Conquer static and dynamic routing protocols.", lessons: 8, completedLessons: 8, left: 300, top: 180 },
  { id: 7, label: "7", area: "Routing Mountains", status: "completed", xp: 160, description: "Master OSPF, EIGRP, and BGP routing protocols.", lessons: 8, completedLessons: 8, left: 380, top: 220 },
  { id: 8, label: "8", area: "Security Fortress", status: "current", xp: 0, description: "Dive into network security fundamentals — firewalls, ACLs, and intrusion detection systems.", lessons: 10, completedLessons: 3, left: 440, top: 340 },
  { id: 9, label: "9", area: "Seaside Village", status: "in-progress", xp: 0, description: "Explore NAT, PAT, and network address translation in real-world scenarios.", lessons: 6, completedLessons: 1, left: 550, top: 390 },
  { id: 10, label: "10", area: "Seaside Village", status: "in-progress", xp: 0, description: "BOSS BATTLE: Defeat the network configuration challenge!", lessons: 1, completedLessons: 0, left: 650, top: 340 },
  { id: 11, label: "11", area: "Seaside Village", status: "in-progress", xp: 0, description: "Practice port management and traffic shaping techniques.", lessons: 5, completedLessons: 0, left: 580, top: 470 },
  { id: 12, label: "12", area: "Wireless Woods", status: "locked", xp: 0, description: "Unlock to explore wireless networking standards and protocols.", lessons: 8, completedLessons: 0, left: 760, top: 380 },
  { id: 13, label: "13", area: "Wireless Woods", status: "locked", xp: 0, description: "Unlock to master Wi-Fi security and enterprise wireless setups.", lessons: 7, completedLessons: 0, left: 790, top: 290 },
  { id: 14, label: "14", area: "Wireless Woods", status: "locked", xp: 0, description: "Unlock to learn about Bluetooth, Zigbee, and IoT networking.", lessons: 6, completedLessons: 0, left: 890, top: 260 },
  { id: 15, label: "15", area: "Wireless Woods", status: "locked", xp: 0, description: "Unlock to study antenna theory and RF propagation.", lessons: 5, completedLessons: 0, left: 910, top: 360 },
  { id: 16, label: "16", area: "Internet Ocean", status: "locked", xp: 0, description: "Unlock to navigate internet protocols and BGP routing.", lessons: 9, completedLessons: 0, left: 970, top: 480 },
  { id: 17, label: "17", area: "Internet Ocean", status: "locked", xp: 0, description: "Unlock to master DNS, HTTP/S, and application layer protocols.", lessons: 8, completedLessons: 0, left: 1090, top: 470 },
  { id: 18, label: "18", area: "Internet Ocean", status: "locked", xp: 0, description: "Unlock to explore CDNs, load balancers, and cloud networking.", lessons: 7, completedLessons: 0, left: 1180, top: 420 },
  { id: 19, label: "19", area: "Mountain Trail", status: "locked", xp: 0, description: "Unlock to study advanced routing and MPLS.", lessons: 8, completedLessons: 0, left: 1210, top: 310 },
  { id: 20, label: "20", area: "Mountain Trail", status: "locked", xp: 0, description: "Unlock to master VPN technologies and tunneling protocols.", lessons: 9, completedLessons: 0, left: 1250, top: 230 },
  { id: 21, label: "21", area: "Lighthouse Point", status: "locked", xp: 0, description: "Final challenge: TCP/IP mastery and network architecture design.", lessons: 12, completedLessons: 0, left: 1330, top: 150 },
];

const totalXP = NODES.filter(n => n.status === "completed").reduce((s, n) => s + n.xp, 0);
const totalCompleted = NODES.filter(n => n.status === "completed").length;

function NodeDot({ node, onClick }: { node: LevelNode; onClick: (n: LevelNode) => void }) {
  const isCompleted = node.status === "completed";
  const isCurrent = node.status === "current";
  const isInProgress = node.status === "in-progress";
  const isLocked = node.status === "locked";

  let bg = "";
  let border = "";
  let textColor = "text-white";
  let shadow = "drop-shadow-[0px_4px_0px_rgba(0,0,0,0.25)]";

  if (isCompleted) { bg = "bg-[#4cd15b]"; border = "border-[#1e3a1e]"; }
  else if (isCurrent) { bg = "bg-[#ffc229]"; border = "border-[#5c4600]"; textColor = "text-[#0a1428]"; shadow = ""; }
  else if (isInProgress) {
    if (node.id === 10) { bg = "bg-[#9d4edd]"; border = "border-[#4c1d95]"; }
    else { bg = "bg-[#ff8e25]"; border = "border-[#7c2d12]"; }
  }
  else { bg = "bg-[#94a3b8]"; border = "border-[#475569]"; }

  return (
    <div
      className={`absolute flex items-center justify-center rounded-[18px] size-[36px] border-3 border-solid ${bg} ${border} ${shadow} cursor-pointer transition-transform hover:scale-110 active:scale-95 select-none ${isCurrent ? "node-current" : ""}`}
      style={{ left: node.left, top: node.top }}
      onClick={() => !isLocked && onClick(node)}
      title={isLocked ? "Complete previous levels to unlock" : node.area}
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
        <div className="absolute -translate-x-1/2 left-1/2 top-[38px] bg-[#ffc229] border border-[#0a1428] border-solid flex items-center px-[6px] py-[2px] rounded-[4px]">
          <p className="font-['Sora:ExtraBold'] font-extrabold text-[#0a1428] text-[8px] whitespace-nowrap leading-none">
            LEVEL {node.id}
          </p>
        </div>
      )}
    </div>
  );
}

function NodeModal({ node, onClose, onPlay }: { node: LevelNode; onClose: () => void; onPlay: (n: LevelNode) => void }) {
  const isLocked = node.status === "locked";
  const isCompleted = node.status === "completed";
  const progress = Math.round((node.completedLessons / node.lessons) * 100);

  const statusColor = isCompleted
    ? "text-[#4cd15b]"
    : node.status === "current"
    ? "text-[#ffc229]"
    : node.status === "in-progress"
    ? "text-[#ff8e25]"
    : "text-[#94a3b8]";

  const statusLabel = isCompleted ? "✓ Completed" : node.status === "current" ? "⚡ Current Level" : node.status === "in-progress" ? "▶ In Progress" : "🔒 Locked";

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-[2px]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-appear bg-[#fdf0d5] border-3 border-[#0a1428] border-solid rounded-[16px] w-[340px] shadow-[0px_8px_0px_rgba(0,0,0,0.3)] overflow-hidden">
        {/* Header */}
        <div className={`px-5 pt-5 pb-4 ${isCompleted ? "bg-[#4cd15b]/20" : node.status === "current" ? "bg-[#ffc229]/20" : node.status === "in-progress" ? "bg-[#ff8e25]/20" : "bg-[#94a3b8]/20"}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="font-['Sora:ExtraBold'] font-extrabold text-[22px] text-[#0a1428] leading-tight">
                Level {node.id}
              </p>
              <p className="font-['Inter:Bold'] font-bold text-[12px] text-[#0a1428]/60 uppercase tracking-wider mt-0.5">
                {node.area}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`font-['Sora:ExtraBold'] font-extrabold text-[11px] ${statusColor}`}>
                {statusLabel}
              </span>
              {isCompleted && (
                <span className="font-['Inter:Bold'] font-bold text-[11px] text-[#0a1428]/60">
                  +{node.xp} XP earned
                </span>
              )}
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
              <span className="font-['Sora:ExtraBold'] font-extrabold text-[10px] text-[#0a1428]/60 uppercase tracking-wider">Progress</span>
              <span className="font-['Sora:ExtraBold'] font-extrabold text-[10px] text-[#0a1428]">{node.completedLessons}/{node.lessons} lessons</span>
            </div>
            <div className="h-[10px] bg-[#0a1428]/10 rounded-full overflow-hidden border border-[#0a1428]/20">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progress}%`,
                  background: isCompleted ? "#4cd15b" : node.status === "current" ? "#ffc229" : node.status === "in-progress" ? "#ff8e25" : "#94a3b8"
                }}
              />
            </div>
          </div>

          {/* Stars */}
          {isCompleted && (
            <div className="flex gap-1 items-center">
              {[1, 2, 3].map(i => (
                <img key={i} alt="star" className="size-[18px] star-spin" src={imgStar} style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
              <span className="font-['Sora:ExtraBold'] font-extrabold text-[11px] text-[#0a1428]/60 ml-1">Perfect score!</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-[10px] bg-[#0a1428]/10 border-2 border-[#0a1428]/20 border-solid font-['Sora:ExtraBold'] font-extrabold text-[13px] text-[#0a1428] cursor-pointer hover:bg-[#0a1428]/20 transition-colors active:scale-95"
          >
            Close
          </button>
          {!isLocked && (
            <button
              onClick={() => onPlay(node)}
              className={`flex-[2] py-2 rounded-[10px] border-3 border-solid font-['Sora:ExtraBold'] font-extrabold text-[13px] cursor-pointer transition-all active:scale-95 shadow-[0px_4px_0px_rgba(0,0,0,0.2)] hover:shadow-[0px_2px_0px_rgba(0,0,0,0.2)] hover:translate-y-[2px]
                ${isCompleted
                  ? "bg-[#4cd15b] border-[#1e3a1e] text-white hover:bg-[#3cba4b]"
                  : node.status === "current"
                  ? "bg-[#ffc229] border-[#5c4600] text-[#0a1428] hover:bg-[#ffb800]"
                  : "bg-[#ff8e25] border-[#7c2d12] text-white hover:bg-[#f07d14]"
                }`}
            >
              {isCompleted ? "Play Again" : node.status === "current" ? "Continue →" : "Start →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function HUD() {
  const levelProgress = Math.round((totalXP / 1500) * 100);
  return (
    <div className="absolute top-[14px] right-[14px] z-10 bg-[#0a1428]/80 backdrop-blur-sm border-2 border-[#ffc229]/40 border-solid rounded-[14px] px-4 py-3 flex flex-col gap-2 min-w-[160px]">
      <div className="flex items-center gap-2">
        <div className="size-[32px] rounded-full bg-[#ffc229] border-2 border-[#0a1428] border-solid flex items-center justify-center">
          <span className="font-['Sora:ExtraBold'] font-extrabold text-[12px] text-[#0a1428]">8</span>
        </div>
        <div>
          <p className="font-['Sora:ExtraBold'] font-extrabold text-[11px] text-white/60 uppercase tracking-wider leading-none">Level</p>
          <p className="font-['Sora:ExtraBold'] font-extrabold text-[14px] text-white leading-tight">Navigator</p>
        </div>
      </div>
      <div>
        <div className="flex justify-between mb-1">
          <span className="font-['Inter:Bold'] font-bold text-[9px] text-white/50 uppercase">XP</span>
          <span className="font-['Inter:Bold'] font-bold text-[9px] text-[#ffc229]">{totalXP}/1500</span>
        </div>
        <div className="h-[6px] bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-[#ffc229] rounded-full" style={{ width: `${levelProgress}%` }} />
        </div>
      </div>
      <div className="flex justify-between pt-1 border-t border-white/10">
        <div className="text-center">
          <p className="font-['Sora:ExtraBold'] font-extrabold text-[16px] text-[#4cd15b] leading-none">{totalCompleted}</p>
          <p className="font-['Inter:Bold'] font-bold text-[8px] text-white/40 uppercase">Done</p>
        </div>
        <div className="text-center">
          <p className="font-['Sora:ExtraBold'] font-extrabold text-[16px] text-[#ffc229] leading-none">{21 - totalCompleted}</p>
          <p className="font-['Inter:Bold'] font-bold text-[8px] text-white/40 uppercase">Left</p>
        </div>
        <div className="text-center">
          <p className="font-['Sora:ExtraBold'] font-extrabold text-[16px] text-white leading-none">21</p>
          <p className="font-['Inter:Bold'] font-bold text-[8px] text-white/40 uppercase">Total</p>
        </div>
      </div>
    </div>
  );
}

function ToastNotification({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] modal-appear">
      <div className="bg-[#0a1428] border-2 border-[#ffc229] border-solid rounded-[12px] px-6 py-3 flex items-center gap-3 shadow-[0px_8px_24px_rgba(0,0,0,0.4)]">
        <img alt="star" className="size-[20px]" src={imgStar} />
        <p className="font-['Sora:ExtraBold'] font-extrabold text-white text-[14px]">{message}</p>
        <button onClick={onClose} className="text-white/50 hover:text-white text-[16px] cursor-pointer ml-2">×</button>
      </div>
    </div>
  );
}

export default function App() {
  const [selectedNode, setSelectedNode] = useState<LevelNode | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const handlePlay = useCallback((node: LevelNode) => {
    setSelectedNode(null);
    const msgs = {
      completed: `Replaying Level ${node.id} — ${node.area}!`,
      current: `Continuing Level ${node.id} — Good luck, Navigator!`,
      "in-progress": `Starting Level ${node.id} — Let's go!`,
      locked: "",
    };
    const msg = msgs[node.status];
    if (msg) {
      setToast(msg);
      setTimeout(() => setToast(null), 3000);
    }
  }, []);

  return (
    <div className="w-full min-h-[100dvh] bg-[#5ba8d4] flex flex-col">
      {/* Top title bar for narrow viewports */}
      <div className="flex-shrink-0 md:hidden flex items-center justify-center py-3 bg-[#0a1428]/60">
        <p className="font-['Sora:ExtraBold'] font-extrabold text-[#ffc229] text-[22px] text-shadow-[0px_2px_0px_black]">
          CRESCO ISLAND
        </p>
      </div>

      {/* Map scroll area */}
      <div className="flex-1 map-scroll relative">
        {/* Fixed HUD overlay */}
        <HUD />

        {/* Archipelago Adventures label */}
        <div className="absolute top-[60px] left-[20px] z-10 pointer-events-none">
          <p className="font-['Sora:ExtraBold'] font-extrabold text-white text-[16px] leading-tight text-shadow-[0px_2px_0px_rgba(0,0,0,0.5)] uppercase">
            ARCHIPELAGO<br />ADVENTURES
          </p>
        </div>

        {/* Map canvas - fixed 1440×620 coordinate space */}
        <div className="relative" style={{ width: 1440, height: 620, minHeight: 620 }}>
          {/* Background map image */}
          <img alt="Cresco Island map" className="absolute inset-0 w-full h-full object-cover pointer-events-none" src={imgMapCanvas} />

          {/* Ambient clouds */}
          <div className="absolute bg-white blur-[4px] h-[40px] left-[80px] opacity-60 rounded-[999px] top-[40px] w-[180px] cloud-drift pointer-events-none" />
          <div className="absolute bg-white blur-[4px] h-[50px] left-[1100px] opacity-70 rounded-[999px] top-[80px] w-[220px] cloud-drift pointer-events-none" style={{ animationDelay: "2s" }} />
          <div className="absolute bg-white blur-[4px] h-[30px] left-[500px] opacity-50 rounded-[999px] top-[520px] w-[140px] cloud-drift pointer-events-none" style={{ animationDelay: "4s" }} />

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

          {/* All level nodes */}
          {NODES.map(node => (
            <NodeDot key={node.id} node={node} onClick={setSelectedNode} />
          ))}

          {/* START button */}
          <div className="absolute bg-[#ffc229] border-3 border-[#0a1428] border-solid drop-shadow-[0px_4px_0px_rgba(0,0,0,0.2)] flex flex-col items-start left-[40px] px-[16px] py-[8px] rounded-[12px] top-[540px] cursor-pointer hover:scale-105 active:scale-95 transition-transform select-none"
            onClick={() => {
              const startNode = NODES[0];
              setSelectedNode(startNode);
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
            <p className="font-['Sora:ExtraBold'] font-extrabold text-[#0a1428] text-[11px] uppercase whitespace-nowrap leading-tight">1. LAN Village</p>
          </div>
          <div className="absolute bg-[#fdf0d5] border-2 border-[#0a1428] border-solid drop-shadow-[0px_4px_0px_rgba(0,0,0,0.2)] flex items-start left-[310px] px-[12px] py-[4px] rounded-[8px] top-[130px]">
            <p className="font-['Sora:ExtraBold'] font-extrabold text-[#0a1428] text-[11px] uppercase whitespace-nowrap leading-tight">2. Routing Mountains</p>
          </div>
          <div className="absolute bg-[#fdf0d5] border-2 border-[#0a1428] border-solid drop-shadow-[0px_4px_0px_rgba(0,0,0,0.2)] flex items-start left-[510px] px-[12px] py-[4px] rounded-[8px] top-[220px]">
            <p className="font-['Sora:ExtraBold'] font-extrabold text-[#0a1428] text-[11px] uppercase whitespace-nowrap leading-tight">3. Security Fortress</p>
          </div>
          <div className="absolute bg-[#fdf0d5] border-2 border-[#0a1428] border-solid drop-shadow-[0px_4px_0px_rgba(0,0,0,0.2)] flex items-start left-[790px] px-[12px] py-[4px] rounded-[8px] top-[230px]">
            <p className="font-['Sora:ExtraBold'] font-extrabold text-[#0a1428] text-[11px] uppercase whitespace-nowrap leading-tight">4. Wireless Woods</p>
          </div>
          <div className="absolute bg-[#fdf0d5] border-2 border-[#0a1428] border-solid drop-shadow-[0px_4px_0px_rgba(0,0,0,0.2)] flex items-start left-[1010px] px-[12px] py-[4px] rounded-[8px] top-[530px]">
            <p className="font-['Sora:ExtraBold'] font-extrabold text-[#0a1428] text-[11px] uppercase whitespace-nowrap leading-tight">5. Internet Ocean</p>
          </div>
          <div className="absolute bg-[#fdf0d5] border-2 border-[#0a1428] border-solid drop-shadow-[0px_4px_0px_rgba(0,0,0,0.2)] flex items-start left-[1260px] px-[12px] py-[4px] rounded-[8px] top-[110px]">
            <p className="font-['Sora:ExtraBold'] font-extrabold text-[#0a1428] text-[11px] uppercase whitespace-pre leading-tight">{`6.TCP/IP  END`}</p>
          </div>

          {/* Hero title */}
          <div className="absolute flex flex-col items-center left-1/2 -translate-x-1/2 top-[24px]">
            <p className="font-['Sora:ExtraBold'] font-extrabold text-[#ffc229] text-[36px] text-center leading-none whitespace-pre" style={{ textShadow: "0px 3px 0px black" }}>
              {`CRESCO  ISLAND`}
            </p>
          </div>

          {/* GW-1 radio tower */}
          <div className="absolute flex flex-col gap-[2px] items-center left-[340px] top-[110px] pointer-events-none">
            <div className="relative shrink-0 size-[24px]">
              <img alt="radio tower" className="absolute block inset-0 max-w-none size-full" src={imgRadioTower} />
            </div>
            <p className="font-['Inter:Bold'] font-bold text-[9px] text-white whitespace-nowrap leading-none">GW-1</p>
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
          <div className="absolute flex flex-col items-center" style={{ left: 630, top: 260 }}>
            <div className="bg-white/90 border-2 border-[#0a1428] border-solid rounded-[6px] px-[8px] py-[2px] pointer-events-none">
              <p className="font-['Sora:ExtraBold'] font-extrabold text-[#0a1428] text-[9px] uppercase leading-tight whitespace-nowrap">CURRENT LOCATION</p>
            </div>
            <div className="w-[2px] h-[44px] bg-[#0a1428]/40" />
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

      {/* Toast */}
      {toast && (
        <ToastNotification message={toast} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
