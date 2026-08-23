import React, { useState } from 'react';
import { Auth3DCanvas } from './Auth3DCanvas';
import { AUTH_ANIMATION_CONFIGS } from './authAnimationConfigs';

/**
 * Production-ready SuccessAnimation Component Wrapper
 * Feature: Staggered UI Reveals (Title, Description, Continue Button)
 * Controls: Hidden during initial action -> revealed sequentially near completion.
 */
export const SuccessAnimation = ({
  type = 'login',
  speed = 1.0,
  autoReplay = false,
  isPaused = false,
  scrubProgress = null,
  isReducedMotion = false,
  onComplete = null,
  className = '',
}) => {
  const [currentProgress, setCurrentProgress] = useState(0);
  const config = AUTH_ANIMATION_CONFIGS[type] || AUTH_ANIMATION_CONFIGS['login'];

  const effectiveProgress = scrubProgress !== null && scrubProgress !== undefined ? scrubProgress : currentProgress;

  // Staggered Entrance Flags
  const showTitle = effectiveProgress >= 0.65;
  const showDescription = effectiveProgress >= 0.75;
  const showContinueButton = effectiveProgress >= 0.85;

  return (
    <div className={`flex flex-col items-center justify-center p-6 text-center space-y-5 ${className}`}>
      {/* 3D Canvas Stage Container */}
      <div className="w-48 h-48 sm:w-56 sm:h-56 relative flex items-center justify-center">
        <Auth3DCanvas
          type={type}
          speedMultiplier={speed}
          autoReplay={autoReplay}
          isPaused={isPaused}
          scrubProgress={scrubProgress}
          isReducedMotion={isReducedMotion}
          onComplete={onComplete}
          onProgressUpdate={(p) => setCurrentProgress(p)}
        />
      </div>

      {/* Staggered UI Title & Description */}
      <div className="space-y-1.5 max-w-sm min-h-[64px] flex flex-col items-center justify-center">
        <h3
          className={`text-xl font-display font-bold text-white tracking-tight transition-all duration-500 ease-out transform ${
            showTitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
          }`}
        >
          {config.title}
        </h3>
        
        <p
          className={`text-xs text-slate-400 leading-relaxed transition-all duration-500 delay-100 ease-out transform ${
            showDescription ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
          }`}
        >
          {config.description}
        </p>
      </div>

      {/* Staggered Continue Button (Enters near end at 0.85+ progress) */}
      <div className="w-full max-w-xs pt-1">
        <button
          disabled={!showContinueButton}
          onClick={() => onComplete && onComplete()}
          className={`w-full py-3 rounded-full bg-gradient-to-r from-indigo-500 via-purple-600 to-emerald-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all duration-500 ease-out transform ${
            showContinueButton
              ? 'opacity-100 translate-y-0 hover:scale-105 active:scale-95 cursor-pointer'
              : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          Continue →
        </button>
      </div>

      {/* Coming Soon Badge if applicable */}
      {config.isComingSoon && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
          <span>🔒</span>
          <span>Coming Soon / Not Currently Implemented</span>
        </div>
      )}
    </div>
  );
};
