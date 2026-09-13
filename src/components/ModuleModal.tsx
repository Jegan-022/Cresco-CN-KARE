import React, { useState } from 'react';
import { soundFx } from '../utils/audio';
import { GooeyButton } from './ui/GooeyButton';

interface ModuleModalProps {
  onClose: () => void;
  onCompleteModule: (xp: number) => void;
  onOpenLab: () => void;
}

interface LayerInfo {
  layerNum: number;
  name: string;
  pdu: string;
  headerContent: string;
  description: string;
  color: string;
  status: 'pending' | 'active' | 'encapsulated';
}

export const ModuleModal: React.FC<ModuleModalProps> = ({
  onClose,
  onCompleteModule,
  onOpenLab,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(3); // Starts at Stage 3
  const [completed, setCompleted] = useState(false);

  const layers: LayerInfo[] = [
    {
      layerNum: 7,
      name: 'Application Layer',
      pdu: 'Data',
      headerContent: 'HTTP/1.1 GET /api/v1/topology Host: cresco.edu User-Agent: Cresco-Client',
      description: 'Generates user application payloads and protocol messages.',
      color: '#632ecd',
      status: currentStep >= 1 ? 'encapsulated' : 'pending',
    },
    {
      layerNum: 6,
      name: 'Presentation Layer',
      pdu: 'Data',
      headerContent: 'MIME-Type: application/json; Charset: UTF-8; Compression: none',
      description: 'Translates data syntax, handles character encoding and TLS cryptographic formatting.',
      color: '#7d4ce7',
      status: currentStep >= 2 ? 'encapsulated' : 'pending',
    },
    {
      layerNum: 5,
      name: 'Session Layer',
      pdu: 'Data',
      headerContent: 'Session-ID: 0x9AF8-3B21; Dialog: Full-Duplex Token; Checkpoint: Sync-01',
      description: 'Establishes, maintains, and synchronizes conversations between endpoints.',
      color: '#004ac6',
      status: currentStep >= 3 ? 'encapsulated' : 'pending',
    },
    {
      layerNum: 4,
      name: 'Transport Layer',
      pdu: 'Segment',
      headerContent: 'TCP [Src Port: 54210, Dst Port: 443, Seq: 1042, Ack: 0, Flags: SYN, Win: 65535]',
      description: 'Provides end-to-end reliability, segment reassembly, flow control, and port multiplexing.',
      color: '#2563eb',
      status: currentStep >= 4 ? 'encapsulated' : currentStep === 3 ? 'active' : 'pending',
    },
    {
      layerNum: 3,
      name: 'Network Layer',
      pdu: 'Packet / Datagram',
      headerContent: 'IPv4 [Src IP: 10.0.0.42, Dst IP: 172.16.4.1, TTL: 64, Protocol: 6 (TCP), Checksum: 0xB1E6]',
      description: 'Handles logical addressing (IP), routing decisions across autonomous systems, and path selection.',
      color: '#00687a',
      status: currentStep >= 5 ? 'encapsulated' : currentStep === 4 ? 'active' : 'pending',
    },
    {
      layerNum: 2,
      name: 'Data Link Layer',
      pdu: 'Frame',
      headerContent: 'Ethernet II [Dst MAC: 00:1A:2B:3C:4D:01, Src MAC: 52:54:00:12:34:56, EtherType: 0x0800] + FCS/CRC',
      description: 'Physical hop-to-hop transfer, MAC framing, collision domain arbitration, and error checking.',
      color: '#57dffe',
      status: currentStep >= 6 ? 'encapsulated' : currentStep === 5 ? 'active' : 'pending',
    },
    {
      layerNum: 1,
      name: 'Physical Layer',
      pdu: 'Bits',
      headerContent: '01001000 01100101 01111000 00100000 01000100 01110101 01101101 01110000 (1000BASE-T Manchester Encoding)',
      description: 'Transmits raw electrical, optical, or radio frequencies over the physical transmission medium.',
      color: '#acedff',
      status: currentStep >= 7 ? 'encapsulated' : currentStep === 6 ? 'active' : 'pending',
    },
  ];

  const handleNextStep = () => {
    soundFx.playClick();
    if (currentStep < 7) {
      setCurrentStep(prev => prev + 1);
      soundFx.playPacketHop();
    } else {
      setCompleted(true);
      soundFx.playSuccess();
    }
  };

  const handleFinish = () => {
    onCompleteModule(50);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#131b2e]/60  animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#dae2fd] overflow-hidden">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-6 bg-[#f2f3ff] border-b border-[#dae2fd] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#004ac6] text-white flex items-center justify-center font-bold">
              <span className="material-symbols-outlined">layers</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold text-[#004ac6] uppercase">
                  ACTIVE LAB // MODULE 3
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#eaedff] text-[#131b2e] font-mono text-[10px] font-bold">
                  STAGE {currentStep}/7
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#131b2e]">
                OSI 7-Layer Architecture: Encapsulation Pipeline
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#434655] hover:bg-[#eaedff] transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Main Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Progress overview strip */}
          <div className="p-4 rounded-xl bg-[#faf8ff] border border-[#dae2fd]">
            <div className="flex justify-between items-center text-xs font-mono text-[#434655] mb-2">
              <span className="font-bold text-[#131b2e]">PDU ENCAPSULATION PROGRESS</span>
              <span className="text-[#004ac6] font-bold">
                {currentStep === 7 ? 'FRAME READY FOR TRANSMISSION' : `ENCAPSULATING LAYER ${8 - currentStep}`}
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1.5 h-3 rounded-full overflow-hidden bg-[#eaedff]">
              {Array.from({ length: 7 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`transition-all transform-gpu duration-500 rounded-sm ${
                    idx < currentStep
                      ? 'bg-[#004ac6]'
                      : idx === currentStep
                      ? 'bg-[#57dffe] animate-pulse'
                      : 'bg-[#dae2fd]'
                  }`}
                ></div>
              ))}
            </div>
          </div>

          {/* Interactive Layer Visualizer */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left: Stack of 7 Layers */}
            <div className="md:col-span-5 space-y-2">
              <h4 className="text-xs font-bold text-[#131b2e] uppercase font-mono tracking-wider">
                OSI Stack (Top to Bottom)
              </h4>
              <div className="space-y-1.5">
                {layers.map((layer, idx) => {
                  const isCurrent = idx === currentStep - 1;
                  const isDone = idx < currentStep;

                  return (
                    <div
                      key={layer.layerNum}
                      className={`p-2.5 rounded-xl border transition-all transform-gpu text-xs flex items-center justify-between ${
                        isCurrent
                          ? 'bg-[#e2e7ff] border-[#004ac6] shadow-md scale-[1.02]'
                          : isDone
                          ? 'bg-[#f2f3ff] border-[#dae2fd] text-[#131b2e]'
                          : 'bg-[#faf8ff] border-gray-200 opacity-60 text-[#737686]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                            isDone ? 'bg-[#004ac6] text-white' : 'bg-[#dae2fd] text-[#434655]'
                          }`}
                        >
                          L{layer.layerNum}
                        </span>
                        <div>
                          <p className="font-bold leading-tight">{layer.name}</p>
                          <span className="font-mono text-[10px] text-[#434655]">
                            PDU: {layer.pdu}
                          </span>
                        </div>
                      </div>

                      {isDone && (
                        <span className="material-symbols-outlined text-sm text-[#00687a] fill-1">
                          check_circle
                        </span>
                      )}
                      {isCurrent && (
                        <span className="w-2 h-2 rounded-full bg-[#004ac6] animate-ping"></span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Live Packet Frame Inspector */}
            <div className="md:col-span-7 flex flex-col justify-between bg-[#283044] text-[#eef0ff] p-5 rounded-2xl shadow-inner font-mono text-xs">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#434655]">
                  <span className="text-[#57dffe] font-bold">FRAME BUFFER INSPECTOR</span>
                  <span className="text-[11px] text-[#dae2fd]/70">MTU: 1500 BYTES</span>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <span className="text-[#dae2fd]/60 text-[10px] uppercase">Active Target Layer:</span>
                    <p className="text-[#57dffe] font-bold text-sm">
                      L{layers[currentStep - 1]?.layerNum}: {layers[currentStep - 1]?.name}
                    </p>
                    <p className="text-[11px] text-[#dae2fd] mt-1 font-sans">
                      {layers[currentStep - 1]?.description}
                    </p>
                  </div>

                  <div className="p-3 bg-[#131b2e] rounded-xl border border-[#434655]">
                    <div className="text-[10px] text-[#dae2fd]/60 uppercase mb-1">Encapsulated Header / Payload:</div>
                    <div className="text-[#acedff] break-all leading-relaxed">
                      {layers[currentStep - 1]?.headerContent}
                    </div>
                  </div>

                  {/* Visual nested packet boxes */}
                  <div className="mt-3 p-3 bg-[#131b2e]/60 rounded-xl border border-[#434655]/50">
                    <div className="text-[10px] text-[#dae2fd]/60 mb-1">Encapsulation Nesting Diagram:</div>
                    <div className="p-2 border border-[#57dffe] rounded bg-[#004ac6]/20 text-[11px]">
                      [Ethernet Header]
                      <div className="p-1.5 border border-[#acedff] rounded bg-[#00687a]/30 my-1">
                        [IP Header: 10.0.0.42 → 172.16.4.1]
                        <div className="p-1 border border-[#b4c5ff] rounded bg-[#2563eb]/30 my-1">
                          [TCP Segment: Port 54210 → 443]
                          <div className="p-1 bg-[#632ecd]/40 rounded text-center text-white text-[10px]">
                            [Payload: GET /api/v1/topology HTTP/1.1]
                          </div>
                        </div>
                      </div>
                      [FCS Trailer Checksum: 0x9B41]
                    </div>
                  </div>
                </div>
              </div>

              {/* Action trigger button */}
              <div className="mt-6 pt-3 border-t border-[#434655] flex items-center justify-between">
                <span className="text-[11px] text-[#dae2fd]/70">
                  {currentStep < 7 ? `${7 - currentStep} layer headers remaining` : 'All 7 layers encapsulated!'}
                </span>
                {currentStep < 7 ? (
                  <GooeyButton
                    onClick={handleNextStep}
                    variant="cyan"
                    size="sm"
                  >
                    <span>Encapsulate Next Layer</span>
                    <span className="material-symbols-outlined text-sm">arrow_downward</span>
                  </GooeyButton>
                ) : (
                  <GooeyButton
                    onClick={handleFinish}
                    variant="cyan"
                  >
                    <span className="material-symbols-outlined text-sm fill-1">check_circle</span>
                    <span>Complete Module (+50 XP)</span>
                  </GooeyButton>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-4 bg-[#f2f3ff] border-t border-[#dae2fd] flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenLab();
            }}
            className="px-3 py-2 rounded-lg bg-white text-[#131b2e] text-xs font-semibold border border-[#dae2fd] hover:bg-[#eaedff] flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">terminal</span>
            <span>Switch to Packet Tracer Sandbox</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-[#434655] hover:bg-[#eaedff]"
            >
              Exit Lesson
            </button>
            {completed && (
              <GooeyButton
                onClick={handleFinish}
                variant="cyan"
                size="sm"
              >
                <span>Claim +50 XP</span>
              </GooeyButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
