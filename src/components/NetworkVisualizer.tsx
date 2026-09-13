import React, { useState } from 'react';
import { 
  NetworkHeroVisualizer, 
  RoutingGraphVisualizer, 
  TCPHandshakeSimulator, 
  TCPCongestionSimulator, 
} from './simulators/InteractiveSimulatorsSuite';
import { 
  RouterCLISimulator, 
  SubnetCalculatorSimulator, 
  HTTPBuilderSimulator, 
  SSHTelnetSimulator, 
  DNSLookupSimulator 
} from './simulators/ModuleSimulators';
import {
  QoSTrafficVisualizer,
  IPv4IPv6Visualizer,
  NetworkHelpersHub,
  PortAddressingVisualizer,
  ReliableProtocolsVisualizer,
  UDPDatagramVisualizer,
  FTPSimulator,
  EmailProtocolsVisualizer
} from './simulators/NewCurriculumSimulators';
import { 
  Sparkles, CheckCircle2, Zap 
} from 'lucide-react';

interface NetworkVisualizerProps {
  moduleId: string;
  mode?: 'visualization' | 'activity';
  customTitle?: string;
  description?: string;
  onActivityComplete?: () => void;
  isActivityCompleted?: boolean;
}

export const NetworkVisualizer: React.FC<NetworkVisualizerProps> = ({ 
  moduleId, 
  mode = 'visualization',
  customTitle,
  description,
  onActivityComplete,
  isActivityCompleted = false
}) => {
  const [completedLocally, setCompletedLocally] = useState(isActivityCompleted);

  const handleMarkDone = () => {
    setCompletedLocally(true);
    if (onActivityComplete) {
      onActivityComplete();
    }
  };

  // Normalize moduleId to handle u3_m1, u3_m01, mod-3-1
  const normId = moduleId
    .replace('mod-', 'u')
    .replace('-', '_m')
    .replace('_m0', '_m');

  // Determine the exact topic-specific simulator component
  const renderSimulatorComponent = () => {
    // -------------------------------------------------------------
    // UNIT 3: NETWORK LAYER (7 Modules)
    // -------------------------------------------------------------
    if (normId === 'u3_m1') {
      return <NetworkHeroVisualizer />;
    }
    if (normId === 'u3_m2') {
      return <RoutingGraphVisualizer />;
    }
    if (normId === 'u3_m3') {
      return <QoSTrafficVisualizer />;
    }
    if (normId === 'u3_m4') {
      return <IPv4IPv6Visualizer />;
    }
    if (normId === 'u3_m5') {
      return <SubnetCalculatorSimulator />;
    }
    if (normId === 'u3_m6') {
      return <RouterCLISimulator />;
    }
    if (normId === 'u3_m7') {
      return <NetworkHelpersHub />;
    }

    // -------------------------------------------------------------
    // UNIT 4: TRANSPORT LAYER (5 Modules)
    // -------------------------------------------------------------
    if (normId === 'u4_m1') {
      return <PortAddressingVisualizer />;
    }
    if (normId === 'u4_m2') {
      return <ReliableProtocolsVisualizer />;
    }
    if (normId === 'u4_m3') {
      return <UDPDatagramVisualizer />;
    }
    if (normId === 'u4_m4') {
      return <TCPHandshakeSimulator />;
    }
    if (normId === 'u4_m5') {
      return <TCPCongestionSimulator />;
    }

    // -------------------------------------------------------------
    // UNIT 5: APPLICATION LAYER (5 Modules)
    // -------------------------------------------------------------
    if (normId === 'u5_m1') {
      return <HTTPBuilderSimulator />;
    }
    if (normId === 'u5_m2') {
      return <FTPSimulator />;
    }
    if (normId === 'u5_m3') {
      return <EmailProtocolsVisualizer />;
    }
    if (normId === 'u5_m4') {
      return <SSHTelnetSimulator />;
    }
    if (normId === 'u5_m5') {
      return <DNSLookupSimulator />;
    }

    // Default fallback
    return <NetworkHeroVisualizer />;
  };

  return (
    <div className="w-full space-y-4">
      {/* Title & Description Header */}
      {(customTitle || description) && (
        <div className="bg-slate-50 dark:bg-[#171B24] border border-slate-200 dark:border-[#252B36] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
              mode === 'activity' 
                ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30' 
                : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30'
            }`}>
              {mode === 'activity' ? 'Interactive Activity (+20 XP)' : 'Visual Model'}
            </span>
            {customTitle && (
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {customTitle}
              </h4>
            )}
          </div>
          {description && (
            <p className="text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Simulator Widget */}
      <div className="w-full rounded-2xl overflow-hidden">
        {renderSimulatorComponent()}
      </div>

      {/* Interactive Activity Completion Action Bar */}
      {mode === 'activity' && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-[#171B24] border border-slate-200 dark:border-[#252B36] rounded-xl">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-[#94A3B8]">
            <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
            <span>Interact with the controls above to explore the networking mechanism.</span>
          </div>
          <button
            onClick={handleMarkDone}
            disabled={completedLocally || isActivityCompleted}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              completedLocally || isActivityCompleted
                ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 cursor-default'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-extrabold shadow-sm'
            }`}
          >
            {completedLocally || isActivityCompleted ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <span>Activity Completed (+20 XP)</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                <span>Mark Activity Complete (+20 XP)</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
