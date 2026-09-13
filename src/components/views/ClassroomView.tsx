import React, { useState } from 'react';
import { AVATAR_PRIYA, AVATAR_MARCUS, AVATAR_ELENA, AVATAR_ALEX } from '../../data/courseData';
import { soundFx } from '../../utils/audio';

export const ClassroomView: React.FC = () => {
  const [chatMessage, setChatMessage] = useState('');
  const [pollSelected, setPollSelected] = useState<number | null>(null);
  const [messages, setMessages] = useState([
    { user: 'Course Instructor', text: 'Welcome everyone! Today we examine BGP path-vector routing and autonomous system peering.', time: '10:02 AM', isInstructor: true },
    { user: 'Student #2300030041', text: 'In eBGP does the AS_PATH attribute always prepend before the external hop?', time: '10:04 AM' },
    { user: 'Student #2300030089', text: 'Yes, because loop prevention discards any announcement containing its own AS number.', time: '10:05 AM' },
    { user: 'Student #2300030112', text: 'Check the sandbox routing table on edge-rtr-04 for live convergence.', time: '10:06 AM' },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    soundFx.playClick();
    setMessages(prev => [
      ...prev,
      { user: 'You', text: chatMessage, time: 'Just now' }
    ]);
    setChatMessage('');
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 py-6 animate-in fade-in space-y-6">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#dae2fd]/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a] animate-ping"></span>
            <span className="font-mono text-xs font-bold text-[#ba1a1a] uppercase">LIVE CLASSROOM STREAM</span>
            <span className="px-2 py-0.5 rounded-full bg-[#eaedff] text-[#131b2e] font-mono text-[10px] font-bold">
              34 Students Online
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-[#131b2e] mt-1">
            CS-4200: Advanced Network Architectures (Lecture 14)
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#434655] font-mono">Audio Stream: 320 kbps Opus</span>
          <span className="px-3 py-1 rounded-lg bg-[#acedff] text-[#001f26] font-mono text-xs font-bold">HD 1080p</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Stream / Whiteboard */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-[#283044] rounded-2xl p-6 text-white min-h-[380px] flex flex-col justify-between shadow-md relative overflow-hidden border border-[#434655]">
            <div className="flex justify-between items-center border-b border-[#434655] pb-3 text-xs font-mono">
              <span className="text-[#57dffe] font-bold">INTERACTIVE WHITEBOARD // SLIDE 24 OF 42</span>
              <span className="text-[#dae2fd]/70">TOPIC: BGP ATTRIBUTE CONVERGENCE</span>
            </div>

            {/* Diagram */}
            <div className="my-6 p-4 bg-[#131b2e] rounded-xl border border-[#434655] flex flex-col items-center justify-center space-y-4">
              <div className="flex items-center gap-8 flex-wrap justify-center font-mono text-xs">
                <div className="p-3 bg-[#004ac6]/30 border border-[#004ac6] rounded-xl text-center">
                  <p className="font-bold text-[#acedff]">AS 65001</p>
                  <p className="text-[10px] text-[#dae2fd]">Campus LAN</p>
                  <p className="text-[9px] text-[#57dffe] mt-1">Prefix: 10.0.0.0/16</p>
                </div>

                <div className="flex flex-col items-center text-[#57dffe]">
                  <span className="text-[10px]">eBGP Peering</span>
                  <span className="material-symbols-outlined">sync_alt</span>
                  <span className="text-[9px]">TCP Port 179</span>
                </div>

                <div className="p-3 bg-[#00687a]/30 border border-[#00687a] rounded-xl text-center">
                  <p className="font-bold text-[#acedff]">AS 65002</p>
                  <p className="text-[10px] text-[#dae2fd]">Tier 1 Transit ISP</p>
                  <p className="text-[9px] text-[#57dffe] mt-1">Prefix: 172.16.0.0/12</p>
                </div>
              </div>
              <p className="text-xs text-[#dae2fd] text-center font-sans max-w-lg">
                "When routes are exported via BGP, the Autonomous System path (AS_PATH) prevents routing loops across multi-homed ISP connections."
              </p>
            </div>

            {/* In-Class Quick Poll */}
            <div className="bg-[#131b2e]/80 p-4 rounded-xl border border-[#434655] space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#57dffe] font-bold">PROFESSOR POLL: Which BGP attribute is non-transitive?</span>
                <span className="text-[#dae2fd]/70">Votes: 29/34</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                {[
                  { id: 0, label: 'A) AS_PATH', percent: 12 },
                  { id: 1, label: 'B) NEXT_HOP', percent: 18 },
                  { id: 2, label: 'C) Multi-Exit Discriminator (MED)', percent: 64, correct: true },
                  { id: 3, label: 'D) Local Preference', percent: 6 },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      soundFx.playClick();
                      setPollSelected(item.id);
                    }}
                    className={`p-2 rounded-lg border text-left flex justify-between items-center transition-all transform-gpu ${
                      pollSelected === item.id
                        ? 'bg-[#004ac6] border-[#57dffe] text-white'
                        : 'bg-[#283044] border-[#434655] text-[#dae2fd] hover:bg-[#334155]'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="font-mono font-bold">{item.percent}%</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Classroom Peer Chat */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl shadow-sm border border-[#dae2fd]/60 flex flex-col justify-between h-[500px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
              <h3 className="font-bold text-sm text-[#131b2e]">Live Student Discussion</h3>
              <span className="font-mono text-xs text-[#00687a]">CS-4200 Chat</span>
            </div>

            <div className="mt-3 space-y-3 max-h-80 overflow-y-auto pr-1">
              {messages.map((m, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex items-baseline justify-between mb-0.5">
                    <span className={`font-bold ${m.isInstructor ? 'text-[#004ac6]' : 'text-[#131b2e]'}`}>
                      {m.user}
                    </span>
                    <span className="text-[10px] text-[#737686]">{m.time}</span>
                  </div>
                  <p className="text-[#434655] leading-snug">{m.text}</p>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSendMessage} className="mt-3 flex gap-2 pt-3 border-t border-[#eaedff]">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask a question in class..."
              className="flex-1 bg-[#f2f3ff] border border-[#dae2fd] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#004ac6]"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-xl bg-[#004ac6] text-white text-xs font-bold hover:bg-[#003ea8]"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
