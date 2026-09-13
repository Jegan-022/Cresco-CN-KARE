import React, { useState } from 'react';
import { useCharacter } from '../../context/CharacterContext';
import { CharacterId, CharacterProfile } from '../../data/characters';
import { CharacterAvatar } from './CharacterAvatar';
import { 
  X, 
  Sparkles, 
  Volume2, 
  Check, 
  Zap, 
  BookOpen, 
  Gamepad2, 
  Key, 
  RefreshCw, 
  ShieldCheck, 
  AlertCircle,
  ExternalLink,
  Flame
} from 'lucide-react';

interface CharacterHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CharacterHubModal: React.FC<CharacterHubModalProps> = ({ isOpen, onClose }) => {
  const {
    characters,
    activeCharacterId,
    setActiveCharacterId,
    speak,
    stopSpeaking,
    isSpeaking,
    currentSpokenText,
    elevenLabsApiKey,
    setElevenLabsApiKey,
    testElevenLabsApiKey,
    hasElevenLabsKey,
  } = useCharacter();

  const [activeTab, setActiveTab] = useState<'roster' | 'elevenlabs' | 'balance'>('roster');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'architect' | 'security' | 'developer' | 'routing' | 'optical'>('all');
  
  // ElevenLabs Key testing state
  const [apiKeyInput, setApiKeyInput] = useState(elevenLabsApiKey);
  const [testingKey, setTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ valid: boolean; message: string } | null>(null);
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredCharacters = characters.filter((c) => {
    if (selectedFilter === 'all') return true;
    return c.category === selectedFilter;
  });

  const handleTestVoice = async (char: CharacterProfile) => {
    if (isSpeaking && previewingVoiceId === char.id) {
      stopSpeaking();
      setPreviewingVoiceId(null);
      return;
    }
    setPreviewingVoiceId(char.id);
    await speak(char.defaultIntro, char.id, () => {
      setPreviewingVoiceId(null);
    });
  };

  const handleSelectCompanion = (id: CharacterId) => {
    setActiveCharacterId(id);
    const char = characters.find((c) => c.id === id);
    if (char) {
      speak(char.catchphrase, char.id);
    }
  };

  const handleSaveApiKey = async () => {
    setTestingKey(true);
    setTestResult(null);
    const result = await testElevenLabsApiKey(apiKeyInput.trim());
    setTestingKey(false);
    setTestResult(result);
    if (result.valid) {
      setElevenLabsApiKey(apiKeyInput.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-cyan-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header Bar */}
        <div className="px-6 py-4.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-transparent dark:from-[#111C33] dark:to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Cresco CN Character Studio & Voice Hub
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                  <Sparkles className="w-2.5 h-2.5" />
                  ELEVENLABS TTS
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                10 Animated Network Companions • Learn & Play Balance • Natural AI Voice Generation
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Character Hub"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher & Filters */}
        <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#0A101C] flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Main Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-800/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('roster')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'roster'
                  ? 'bg-white dark:bg-[#1A253C] text-blue-600 dark:text-cyan-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Choose Companion (10)</span>
            </button>

            <button
              onClick={() => setActiveTab('balance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'balance'
                  ? 'bg-white dark:bg-[#1A253C] text-blue-600 dark:text-cyan-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Learn & Play Balance</span>
            </button>

            <button
              onClick={() => setActiveTab('elevenlabs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'elevenlabs'
                  ? 'bg-white dark:bg-[#1A253C] text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>ElevenLabs API Setup</span>
              {hasElevenLabsKey && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
          </div>

          {/* Character Roster Category Filter (Only on Roster tab) */}
          {activeTab === 'roster' && (
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              {(['all', 'architect', 'security', 'developer', 'routing', 'optical'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-all cursor-pointer ${
                    selectedFilter === cat
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {cat === 'all' ? 'All Mentors' : cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: CHARACTER ROSTER (10 CHARACTERS) */}
          {activeTab === 'roster' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCharacters.map((char) => {
                const isSelected = char.id === activeCharacterId;
                const isVoicePlaying = isSpeaking && previewingVoiceId === char.id;

                return (
                  <div
                    key={char.id}
                    className={`relative rounded-2xl p-4 sm:p-5 border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-500/70 dark:border-blue-500 shadow-md ring-2 ring-blue-500/30'
                        : 'bg-white dark:bg-[#131C2E] border-slate-200 dark:border-slate-800 hover:border-blue-400/50 hover:shadow-md'
                    }`}
                  >
                    {/* Active Selected Badge */}
                    {isSelected && (
                      <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold font-mono shadow-xs">
                        <Check className="w-3 h-3" />
                        <span>EQUIPPED</span>
                      </div>
                    )}

                    {/* Top Row: Avatar & Identity */}
                    <div>
                      <div className="flex items-start gap-3.5">
                        <CharacterAvatar
                          characterId={char.id}
                          pose={isSelected ? 'celebrating' : 'idle'}
                          size="md"
                          isSpeaking={isVoicePlaying}
                        />
                        <div className="flex-1 min-w-0 pr-12">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {char.badgeText}
                            </span>
                            <span className="text-[9px] font-mono text-cyan-600 dark:text-cyan-400">
                              {char.networkLayer}
                            </span>
                          </div>
                          <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-1 leading-tight">
                            {char.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {char.title}
                          </p>
                        </div>
                      </div>

                      {/* Catchphrase Quote */}
                      <p className="text-xs italic text-slate-600 dark:text-slate-300 mt-3 pl-2.5 border-l-2 border-blue-500/50">
                        "{char.catchphrase}"
                      </p>

                      {/* Learn & Play Dual Details */}
                      <div className="mt-3.5 space-y-2 text-[11px]">
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 mb-0.5">
                            <BookOpen className="w-3 h-3" />
                            <span>LEARNING SPECIALTY</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            {char.learnBio}
                          </p>
                        </div>

                        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                          <div className="flex items-center gap-1 font-bold text-amber-700 dark:text-amber-400 mb-0.5">
                            <Gamepad2 className="w-3 h-3" />
                            <span>PLAY & GAME PERK</span>
                          </div>
                          <p className="text-amber-900 dark:text-amber-300 font-medium">
                            {char.gameplayPerk}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Controls: Voice Test & Equip Button */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleTestVoice(char)}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isVoicePlaying
                            ? 'bg-purple-600 text-white animate-pulse'
                            : 'bg-purple-500/15 hover:bg-purple-500/25 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                        }`}
                        title={`Audition ElevenLabs voice (${char.voiceName})`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{isVoicePlaying ? 'Playing...' : `Voice: ${char.voiceName}`}</span>
                      </button>

                      {isSelected ? (
                        <div className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">
                          Active Companion
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSelectCompanion(char.id)}
                          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs hover:scale-102"
                        >
                          Equip
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: LEARN & PLAY BALANCE OVERVIEW */}
          {activeTab === 'balance' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/30 text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                <h4 className="font-black text-sm mb-1 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>The Cresco CN Learn & Play Equilibrium</span>
                </h4>
                <p>
                  To make computer networks deeply intuitive and memorable, Cresco CN balances rigorous university syllabus theory (OSI architecture, subnetting, TCP/IP, cryptography) with playful gamification dynamics (speed runs, bug hunts, quiz shields, and animated companions).
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 font-mono text-[11px] border-b border-slate-200 dark:border-slate-800">
                      <th className="p-3">Character</th>
                      <th className="p-3">Network Layer</th>
                      <th className="p-3">Learning Focus (Theory)</th>
                      <th className="p-3">Play & Gameplay Bonus</th>
                      <th className="p-3">ElevenLabs Voice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {characters.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                        <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <CharacterAvatar characterId={c.id} size="xs" />
                          <span>{c.name}</span>
                        </td>
                        <td className="p-3 font-mono text-cyan-600 dark:text-cyan-400">{c.networkLayer}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-300 max-w-xs">{c.learnBio}</td>
                        <td className="p-3 text-amber-700 dark:text-amber-400 font-semibold">{c.gameplayPerk}</td>
                        <td className="p-3 font-mono text-purple-600 dark:text-purple-400">
                          {c.voiceName} ({c.elevenLabsVoiceId.slice(0, 6)}...)
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ELEVENLABS API SETUP */}
          {activeTab === 'elevenlabs' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="p-5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-500/30 space-y-3">
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-bold">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="text-base">ElevenLabs AI Voice Engine Integration</h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Cresco CN utilizes the official ElevenLabs Text-to-Speech API to synthesize natural, expressive character voices in real time. Each of our 10 network characters is mapped to a dedicated voice persona (e.g. Rachel, Adam, Bella, Elli, Antoni, Nicole, Domi, Sam, Glinda).
                </p>
                <div className="flex items-center gap-2 pt-1 text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Status:</span>
                  {hasElevenLabsKey ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                      <ShieldCheck className="w-4 h-4" />
                      ElevenLabs API Key Configured & Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold font-mono">
                      <AlertCircle className="w-4 h-4" />
                      Fallback Mode (Web Speech Synthesis Active)
                    </span>
                  )}
                </div>
              </div>

              {/* API Key Input Form */}
              <div className="bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    ElevenLabs API Key (xi-api-key)
                  </label>
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="e.g. sk_1234567890abcdef..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1A253C] border border-slate-300 dark:border-slate-700 focus:border-purple-500 rounded-xl text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                    Your key is saved locally in your browser session (<code className="text-purple-500">localStorage</code>) and never exposed to other students.
                  </p>
                </div>

                {testResult && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      testResult.valid
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                        : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-500/30'
                    }`}
                  >
                    {testResult.valid ? (
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSaveApiKey}
                    disabled={testingKey}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    {testingKey ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying with ElevenLabs...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verify & Save Key</span>
                      </>
                    )}
                  </button>

                  <a
                    href="https://elevenlabs.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    <span>Get a free key at elevenlabs.io</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0A101C] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <span>Active Companion: <strong className="text-slate-900 dark:text-white font-mono">{activeCharacterId}</strong></span>
          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
