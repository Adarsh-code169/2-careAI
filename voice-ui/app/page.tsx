"use client";

import { useVoiceAgent } from '@/hooks/useVoiceAgent';
import Avatar from '@/components/Avatar';
import MetricsPanel from '@/components/MetricsPanel';
import TranscriptPanel from '@/components/TranscriptPanel';
import MobileMetricsToggle from '@/components/MobileMetricsToggle';
import MobileTranscriptToggle from '@/components/MobileTranscriptToggle';
import { motion } from 'framer-motion';

export default function Home() {
  const { state, transcript, metrics, activateAudio } = useVoiceAgent();

  return (
    <main
      onClick={activateAudio}
      className="h-screen w-full bg-[#0a0a0b] text-white overflow-hidden font-sans selection:bg-orange-500/30 cursor-pointer relative"
    >
      {/* Header Status - Fixed at top */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 lg:top-10">
        <div className="flex items-center space-x-2 lg:space-x-3 bg-white/5 px-3 py-1.5 lg:px-4 lg:py-1.5 rounded-full border border-white/10 backdrop-blur-xl shadow-2xl">
          <div className={`w-2 h-2 rounded-full animate-pulse
            ${state === 'idle' ? 'bg-slate-400' :
              state === 'listening' ? 'bg-orange-500' :
                state === 'thinking' ? 'bg-pink-500' :
                  'bg-amber-500'}`}
          />
          <span className="text-[9px] lg:text-[10px] uppercase font-bold tracking-[0.15em] lg:tracking-[0.2em] text-slate-300 whitespace-nowrap">
            Assistant: {state}
          </span>
        </div>
      </div>

      {/* Control Buttons - Mobile Only (avoid overlap with header) */}
      <div className="lg:hidden absolute top-14 right-4 z-30 flex flex-col gap-2">
        <MobileTranscriptToggle messages={transcript} />
        <MobileMetricsToggle metrics={metrics} />
      </div>

      <div className="h-full flex flex-col lg:flex-row">
        {/* Sidebar Metrics (Desktop) */}
        <aside className="hidden lg:block w-[300px] flex-shrink-0 relative z-20">
          <MetricsPanel metrics={metrics} />
        </aside>

        {/* Central Avatar */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          {/* Welcome Hero (idle only) */}
          {state === 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute top-16 lg:top-24 left-1/2 -translate-x-1/2 w-full text-center px-4 pointer-events-none z-20"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-400 via-pink-400 to-amber-300 bg-clip-text text-transparent tracking-tight">
                Voice Agent
              </h1>
              <p className="mt-2 text-xs sm:text-sm lg:text-base text-slate-400 font-medium tracking-wide">
                Talk naturally with AI — real-time, interruptible, intelligent.
              </p>
            </motion.div>
          )}

          <Avatar state={state} />

          {/* Footer Guidance */}
          <div className="absolute bottom-6 lg:bottom-14 left-1/2 -translate-x-1/2 w-full text-center px-4 z-30">
            {state === 'idle' ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 lg:px-6 lg:py-3 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-orange-500/30 ring-1 ring-white/10 animate-pulse cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                Tap anywhere to start talking
              </motion.div>
            ) : (
              <motion.p
                animate={{ opacity: 0.4 }}
                className="text-[9px] lg:text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] lg:tracking-[0.25em]"
              >
                {state === 'listening' ? 'Listening...' :
                  state === 'thinking' ? 'Thinking...' :
                    'Speaking...'}
              </motion.p>
            )}
          </div>
        </div>

        {/* Sidebar Transcript (Desktop) */}
        <aside className="hidden lg:block w-[400px] flex-shrink-0 relative z-20 border-l border-white/10 bg-slate-900/50">
          <TranscriptPanel messages={transcript} />
        </aside>
      </div>
    </main>
  );
}
