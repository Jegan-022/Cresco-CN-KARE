import React, { useState } from 'react';
import { soundFx } from '../utils/audio';

interface FooterProps {
  onOpenReference?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenReference }) => {
  const [showModal, setShowModal] = useState<string | null>(null);

  return (
    <>
      <footer className="w-full bg-[#f2f3ff] border-t border-[#dae2fd]/60 py-8 mt-12">
        <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[#434655] text-[12px]">
          <div className="flex items-center gap-4 flex-wrap justify-center md:justify-start">
            <span className="font-mono text-[11px] font-semibold text-[#004ac6]">
              CRESCO CN OS // v2.4.0
            </span>
            <span className="hidden sm:inline">•</span>
            <span>Interactive Network Architecture Simulator</span>
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px] flex-wrap justify-center">
            <button
              onClick={() => {
                soundFx.playClick();
                setShowModal('osi');
                if (onOpenReference) onOpenReference();
              }}
              className="hover:text-[#004ac6] transition-colors cursor-pointer"
            >
              OSI Protocol Reference
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setShowModal('socket');
              }}
              className="hover:text-[#004ac6] transition-colors cursor-pointer"
            >
              Socket Sandboxes
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setShowModal('integrity');
              }}
              className="hover:text-[#004ac6] transition-colors cursor-pointer"
            >
              Academic Integrity
            </button>
            <span className="text-[#c3c6d7]">•</span>
            <span>© 2025 Cresco CN Labs</span>
          </div>
        </div>
      </footer>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131b2e]/50  animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#dae2fd] relative">
            <button
              onClick={() => setShowModal(null)}
              className="absolute top-4 right-4 text-[#737686] hover:text-[#131b2e]"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {showModal === 'osi' && (
              <div>
                <h3 className="text-lg font-bold text-[#131b2e]">OSI 7-Layer Protocol Quick Reference</h3>
                <p className="text-xs text-[#434655] mt-1 mb-4">ISO/IEC 7498-1 Standard reference mapping</p>
                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded-lg bg-[#eaedff] flex justify-between font-mono">
                    <span className="font-bold text-[#004ac6]">L7 Application</span>
                    <span>HTTP/3, DNS, SSH, TLS 1.3, SNMP</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#eaedff] flex justify-between font-mono">
                    <span className="font-bold text-[#004ac6]">L6 Presentation</span>
                    <span>ASN.1, JSON, ASCII, EBCDIC</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#eaedff] flex justify-between font-mono">
                    <span className="font-bold text-[#004ac6]">L5 Session</span>
                    <span>RPC, NetBIOS, Sockets API</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#eaedff] flex justify-between font-mono">
                    <span className="font-bold text-[#004ac6]">L4 Transport</span>
                    <span>TCP, UDP, QUIC, SCTP</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#eaedff] flex justify-between font-mono">
                    <span className="font-bold text-[#004ac6]">L3 Network</span>
                    <span>IPv4, IPv6, ICMP, BGP, OSPF</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#eaedff] flex justify-between font-mono">
                    <span className="font-bold text-[#004ac6]">L2 Data Link</span>
                    <span>Ethernet (802.3), Wi-Fi (802.11), PPP</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#eaedff] flex justify-between font-mono">
                    <span className="font-bold text-[#004ac6]">L1 Physical</span>
                    <span>1000BASE-T, Optical Fiber, Modulation</span>
                  </div>
                </div>
              </div>
            )}

            {showModal === 'socket' && (
              <div>
                <h3 className="text-lg font-bold text-[#131b2e]">Socket Sandbox Architecture</h3>
                <p className="text-xs text-[#434655] mt-2 leading-relaxed">
                  Cresco CN provides isolated, WebAssembly-driven virtual network network namespaces. Packets generated in the Quick Lab Terminal or Packet Tracer simulator interact with deterministic virtual switches, virtual routers, and realistic latency injectors.
                </p>
                <div className="mt-4 p-3 rounded-xl bg-[#283044] text-[#acedff] font-mono text-xs">
                  $ ip netns add student_lab<br/>
                  $ ip link add veth0 type veth peer name veth1<br/>
                  $ sysctl -w net.ipv4.ip_forward=1
                </div>
              </div>
            )}

            {showModal === 'integrity' && (
              <div>
                <h3 className="text-lg font-bold text-[#131b2e]">Academic Integrity Policy</h3>
                <p className="text-xs text-[#434655] mt-2 leading-relaxed">
                  All packet traces, subnetting drills, and CLI terminal completions are cryptographically hashed and correlated with your student session ID (Alex Chen - 0x4B3-NET301). Collaboration is encouraged in the Live Classroom, but exam deliverables must represent individual mastery.
                </p>
              </div>
            )}

            <button
              onClick={() => setShowModal(null)}
              className="mt-5 w-full py-2 rounded-xl bg-[#004ac6] text-white text-xs font-bold shadow hover:bg-[#003ea8]"
            >
              Close Reference
            </button>
          </div>
        </div>
      )}
    </>
  );
};
