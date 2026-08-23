import React, { useState } from 'react';
import { AUTH_ANIMATION_CONFIGS, ANIMATION_STATE_KEYS } from '../components/auth-3d/authAnimationConfigs';
import { Auth3DCanvas } from '../components/auth-3d/Auth3DCanvas';

export default function AuthAnimationPreview() {
  const [selectedState, setSelectedState] = useState('login');
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [autoReplay, setAutoReplay] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [scrubProgress, setScrubProgress] = useState(null); // Null when playing live, 0.0 to 1.0 when scrubbed
  const [currentProgress, setCurrentProgress] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [replayTrigger, setReplayTrigger] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);

  const currentConfig = AUTH_ANIMATION_CONFIGS[selectedState];
  const activeStages = currentConfig.stages || [];

  const activeStates = ANIMATION_STATE_KEYS.filter(
    (key) => AUTH_ANIMATION_CONFIGS[key].category === 'ACTIVE'
  );
  const comingSoonStates = ANIMATION_STATE_KEYS.filter(
    (key) => AUTH_ANIMATION_CONFIGS[key].category === 'COMING_SOON'
  );

  const effectiveProgress = scrubProgress !== null ? scrubProgress : currentProgress;
  const currentElapsedSec = ((currentConfig.durationMs / 1000) * effectiveProgress).toFixed(2);

  // Active Stage Name Finder
  let activeStageObj = activeStages[0];
  for (let i = activeStages.length - 1; i >= 0; i--) {
    if (effectiveProgress >= activeStages[i].time / (currentConfig.durationMs / 1000)) {
      activeStageObj = activeStages[i];
      break;
    }
  }

  const handleReplay = () => {
    setScrubProgress(null);
    setIsPaused(false);
    setReplayTrigger((prev) => prev + 1);
  };

  const handleStepPrev = () => {
    setIsPaused(true);
    const prevProgress = Math.max(0, effectiveProgress - 0.2);
    setScrubProgress(prevProgress);
  };

  const handleStepNext = () => {
    setIsPaused(true);
    const nextProgress = Math.min(1.0, effectiveProgress + 0.2);
    setScrubProgress(nextProgress);
  };

  const handleSliderChange = (e) => {
    setIsPaused(true);
    setScrubProgress(parseFloat(e.target.value));
  };

  const codeSnippet = `<SuccessAnimation
  type="${currentConfig.id}"
  speed={${speedMultiplier}}
  onComplete={() => console.log('Action Completed')}
/>`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Staggered UI Entrance Flags
  const showTitle = effectiveProgress >= 0.65;
  const showDescription = effectiveProgress >= 0.75;
  const showContinueBtn = effectiveProgress >= 0.85;

  return (
    <div className="min-h-screen bg-[#08080a] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden relative">
      {/* Ambient Glow Blobs */}
      <div className="fixed top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[550px] h-[550px] bg-emerald-600/15 blur-[140px] rounded-full pointer-events-none z-0" />

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        
        {/* TOP HEADER */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-2xl shadow-2xl">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-display font-bold tracking-tight text-white">
                  LocatorX Multi-Stage 3D Auth Lab
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                  Timeline Debugger
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cinematic 5-Stage Motion Sequences (Start → Action → Transform → Success → End).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setIsReducedMotion(!isReducedMotion)}
              className={`px-3.5 py-2 rounded-full text-xs font-semibold border transition-all active:scale-95 flex items-center gap-2 ${
                isReducedMotion
                  ? 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              <span>{isReducedMotion ? '⚠️ Reduced Motion ON' : '✨ Motion Full'}</span>
            </button>
          </div>
        </header>

        {/* MAIN PLAYGROUND GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR: STATE SELECTION */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* ACTIVE STATES */}
            <div className="p-5 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-2xl space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  AUTHENTICATION ({activeStates.length})
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>

              <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                {activeStates.map((key) => {
                  const state = AUTH_ANIMATION_CONFIGS[key];
                  const isActive = selectedState === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedState(key);
                        setScrubProgress(null);
                        setIsPaused(false);
                      }}
                      className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between group ${
                        isActive
                          ? 'bg-indigo-600/20 border-indigo-400/60 text-white shadow-lg shadow-indigo-500/20'
                          : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>✓</span>
                          <span className="text-xs font-semibold">{state.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate max-w-[200px] pl-5">
                          {state.actionFeel}
                        </p>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                        {(state.durationMs / 1000).toFixed(1)}s
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* COMING SOON STATES */}
            <div className="p-5 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-2xl space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                  COMING SOON ({comingSoonStates.length})
                </span>
                <span className="text-[10px] text-amber-300 font-mono">Not Implemented</span>
              </div>

              <div className="space-y-1.5">
                {comingSoonStates.map((key) => {
                  const state = AUTH_ANIMATION_CONFIGS[key];
                  const isActive = selectedState === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedState(key);
                        setScrubProgress(null);
                        setIsPaused(false);
                      }}
                      className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between group ${
                        isActive
                          ? 'bg-amber-500/20 border-amber-400/60 text-white shadow-lg shadow-amber-500/20'
                          : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs">🔒</span>
                          <span className="text-xs font-semibold">{state.title}</span>
                        </div>
                        <p className="text-[11px] text-amber-400/80 truncate max-w-[200px] pl-5">
                          {state.actionFeel}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                        Preview
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </aside>

          {/* RIGHT CENTER STAGE & TIMELINE DEBUGGER */}
          <main className="lg:col-span-8 space-y-6">
            
            {/* CONTROLS & SCRUBBER TOOLBAR */}
            <div className="p-5 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-2xl space-y-4">
              
              {/* Top Row: Playback Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {/* Replay */}
                  <button
                    onClick={handleReplay}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg shadow-indigo-500/30 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <span>▶️ Replay</span>
                  </button>

                  {/* Play / Pause Toggle */}
                  <button
                    onClick={() => {
                      if (scrubProgress !== null) setScrubProgress(null);
                      setIsPaused(!isPaused);
                    }}
                    className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition-all"
                  >
                    {isPaused ? '▶️ Play' : '⏸️ Pause'}
                  </button>

                  {/* Step Back / Step Forward */}
                  <button
                    onClick={handleStepPrev}
                    className="px-2.5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono border border-white/5"
                    title="Step Back 20%"
                  >
                    ⏮️ -0.2s
                  </button>
                  <button
                    onClick={handleStepNext}
                    className="px-2.5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono border border-white/5"
                    title="Step Forward 20%"
                  >
                    ⏭️ +0.2s
                  </button>

                  {/* Auto Replay Toggle */}
                  <button
                    onClick={() => setAutoReplay(!autoReplay)}
                    className={`px-3 py-2 rounded-full text-xs font-semibold border transition-all flex items-center gap-2 active:scale-95 ${
                      autoReplay
                        ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <span>Auto Replay: {autoReplay ? 'ON' : 'OFF'}</span>
                  </button>
                </div>

                {/* Speed Selector & Duration */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-black/40 p-1 rounded-full border border-white/10 text-[11px] font-mono">
                    {[0.5, 0.75, 1.0, 1.25, 1.5].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => setSpeedMultiplier(spd)}
                        className={`px-2.5 py-0.5 rounded-full transition-all ${
                          speedMultiplier === spd
                            ? 'bg-indigo-600 text-white font-bold shadow-md'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {spd}×
                      </button>
                    ))}
                  </div>

                  <div className="px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 font-mono text-xs flex items-center gap-2">
                    <span>{currentElapsedSec}s / {(currentConfig.durationMs / 1000).toFixed(1)}s</span>
                  </div>
                </div>
              </div>

              {/* TIMELINE SCRUBBER SLIDER & STAGE MARKERS */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1.5 text-indigo-300">
                    <span>Active Stage:</span>
                    <span className="font-bold text-white uppercase px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-400/30">
                      {activeStageObj?.name} — {activeStageObj?.label}
                    </span>
                  </span>
                  <span>Scrubber: {(effectiveProgress * 100).toFixed(0)}%</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={effectiveProgress}
                  onChange={handleSliderChange}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
                />

                {/* 5 Visual Stage Node Indicators */}
                <div className="flex items-center justify-between pt-1 px-1">
                  {activeStages.map((stage, idx) => {
                    const stageRatio = stage.time / (currentConfig.durationMs / 1000);
                    const isPassed = effectiveProgress >= stageRatio;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setIsPaused(true);
                          setScrubProgress(stageRatio);
                        }}
                        className={`flex flex-col items-center cursor-pointer group transition-all ${
                          isPassed ? 'text-emerald-400' : 'text-slate-600'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full border-2 transition-all ${
                          isPassed ? 'bg-emerald-400 border-emerald-300 shadow-md shadow-emerald-500/50 scale-110' : 'bg-slate-800 border-slate-600'
                        }`} />
                        <span className="text-[10px] font-mono font-bold mt-1 uppercase">{stage.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* 3D STAGE CARD STAGE */}
            <div className="relative w-full h-[470px] rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-3xl flex flex-col items-center justify-center p-8 overflow-hidden shadow-2xl">
              
              <div className="relative z-10 w-full max-w-md p-8 rounded-3xl bg-slate-950/85 border border-white/10 shadow-2xl flex flex-col items-center justify-center text-center space-y-6">
                
                {/* 3D Canvas Injection Zone */}
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <Auth3DCanvas
                    key={`${selectedState}-${speedMultiplier}-${autoReplay}-${isReducedMotion}-${replayTrigger}`}
                    type={selectedState}
                    speedMultiplier={speedMultiplier}
                    autoReplay={autoReplay}
                    isPaused={isPaused}
                    scrubProgress={scrubProgress}
                    isReducedMotion={isReducedMotion}
                    onProgressUpdate={(p) => setCurrentProgress(p)}
                  />
                </div>

                {/* Staggered Text Reveal */}
                <div className="space-y-2 min-h-[58px] flex flex-col items-center justify-center">
                  <h2
                    className={`text-2xl font-bold font-display text-white tracking-tight transition-all duration-500 ease-out transform ${
                      showTitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
                    }`}
                  >
                    {currentConfig.title}
                  </h2>
                  <p
                    className={`text-xs text-slate-400 leading-relaxed max-w-xs mx-auto transition-all duration-500 delay-100 ease-out transform ${
                      showDescription ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
                    }`}
                  >
                    {currentConfig.description}
                  </p>
                </div>

                {/* Staggered Continue Button */}
                <button
                  disabled={!showContinueBtn}
                  className={`w-full py-3 rounded-full bg-gradient-to-r from-indigo-500 via-purple-600 to-emerald-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all duration-500 ease-out transform ${
                    showContinueBtn
                      ? 'opacity-100 translate-y-0 hover:scale-105 active:scale-95 cursor-pointer'
                      : 'opacity-0 translate-y-4 pointer-events-none'
                  }`}
                >
                  Continue →
                </button>
              </div>

              {/* Status Badge overlay */}
              {currentConfig.isComingSoon && (
                <div className="absolute top-6 right-6 z-20 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-mono text-xs flex items-center gap-1.5 shadow-lg">
                  <span>🔒</span>
                  <span>Coming Soon / Not Currently Implemented</span>
                </div>
              )}
            </div>

            {/* SPECS & KEYFRAME BREAKDOWN */}
            <div className="p-6 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    5-Stage Timeline Breakdown & Integration Code
                  </h3>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition-all active:scale-95"
                >
                  {copiedCode ? 'Copied ✓' : 'Copy React Code'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 5-Stage Breakdown */}
                <div className="space-y-2 p-4 rounded-2xl bg-black/50 border border-white/5">
                  <span className="text-[11px] font-mono text-indigo-300 uppercase tracking-wider block mb-2">
                    5 Motion Stages
                  </span>
                  <div className="space-y-2 font-mono text-[11px] text-slate-300">
                    {activeStages.map((st, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold w-20 uppercase">{st.name}</span>
                        <span className="text-slate-500">({st.time.toFixed(1)}s)</span>
                        <span className="text-slate-400">• {st.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Production Code Snippet */}
                <div className="space-y-2 p-4 rounded-2xl bg-black/50 border border-white/5">
                  <span className="text-[11px] font-mono text-emerald-300 uppercase tracking-wider block mb-2">
                    Production Component Usage API
                  </span>
                  <pre className="font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                    {codeSnippet}
                  </pre>
                </div>

              </div>
            </div>

          </main>

        </div>

      </div>
    </div>
  );
}
