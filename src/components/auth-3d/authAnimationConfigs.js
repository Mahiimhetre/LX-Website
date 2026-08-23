/**
 * Central Configuration for Multi-Stage Cinematic 3D Authentication Success Animations
 * Defines 5 explicit stages for each animation (START -> ACTION -> TRANSFORM -> SUCCESS -> END),
 * target durations, color accents, and staggered UI reveal keyframe timings.
 */

export const AUTH_ANIMATION_CONFIGS = {
  'login': {
    id: 'login',
    title: 'Welcome Back',
    description: 'You have been successfully authenticated.',
    durationMs: 2000, // 2.0s target
    accentColor: '#10b981',
    secondaryColor: '#6366f1',
    category: 'ACTIVE',
    objectType: 'shield-keyhole',
    actionFeel: 'Fast + Confident + Secure',
    stages: [
      { time: 0.0, name: 'START', label: 'Dimmed Closed Shield' },
      { time: 0.4, name: 'ACTION', label: 'Vertical Security Scan' },
      { time: 0.9, name: 'TRANSFORM', label: 'Lock Authenticated' },
      { time: 1.4, name: 'SUCCESS', label: 'Checkmark Draw & Wave' },
      { time: 1.9, name: 'END', label: 'Final Secure Settle' },
    ],
  },

  'registration': {
    id: 'registration',
    title: 'Account Created',
    description: 'Your account has been created successfully.',
    durationMs: 2500, // 2.5s target
    accentColor: '#10b981',
    secondaryColor: '#0ea5e9',
    category: 'ACTIVE',
    objectType: 'profile-card',
    actionFeel: 'Rewarding + Celebratory',
    stages: [
      { time: 0.0, name: 'START', label: 'Incomplete Card Base' },
      { time: 0.5, name: 'ACTION', label: 'Layers & Avatar Assemble' },
      { time: 1.1, name: 'TRANSFORM', label: 'Profile Lines Complete' },
      { time: 1.7, name: 'SUCCESS', label: 'Checkmark Draw & Ring Pulse' },
      { time: 2.3, name: 'END', label: 'Complete Card Settle' },
    ],
  },

  'account-created': {
    id: 'account-created',
    title: 'Account Created',
    description: 'Your account is ready to use.',
    durationMs: 2200, // 2.2s target
    accentColor: '#34d399',
    secondaryColor: '#818cf8',
    category: 'ACTIVE',
    objectType: 'identity-card',
    actionFeel: 'Clean + Fast Confirmation',
    stages: [
      { time: 0.0, name: 'START', label: 'Blank ID Badge Enters' },
      { time: 0.5, name: 'ACTION', label: 'Hologram Stripe Sweeps' },
      { time: 1.0, name: 'TRANSFORM', label: 'Glowing Border Activates' },
      { time: 1.5, name: 'SUCCESS', label: 'Checkmark Snaps & Pulse' },
      { time: 2.0, name: 'END', label: 'Clean Badge Settle' },
    ],
  },

  'email-sent': {
    id: 'email-sent',
    title: 'Email Sent',
    description: "We've sent a verification email to your inbox.",
    durationMs: 1800, // 1.8s target (Fast)
    accentColor: '#38bdf8',
    secondaryColor: '#6366f1',
    category: 'ACTIVE',
    objectType: 'envelope-letter',
    actionFeel: 'Fast + Instant Communication',
    stages: [
      { time: 0.0, name: 'START', label: 'Closed Glass Envelope' },
      { time: 0.3, name: 'ACTION', label: 'Envelope Flap Opens' },
      { time: 0.7, name: 'TRANSFORM', label: 'Letter Card Emerges & Rises' },
      { time: 1.2, name: 'SUCCESS', label: 'Checkmark Seals on Letter' },
      { time: 1.6, name: 'END', label: 'Letter Retracts & Flap Closes' },
    ],
  },

  'email-verified': {
    id: 'email-verified',
    title: 'Email Verified',
    description: 'Your email address has been successfully verified.',
    durationMs: 2200, // 2.2s target
    accentColor: '#10b981',
    secondaryColor: '#06b6d4',
    category: 'ACTIVE',
    objectType: 'envelope-shield',
    actionFeel: 'Verification Lock-in',
    stages: [
      { time: 0.0, name: 'START', label: 'Envelope & External Shield' },
      { time: 0.5, name: 'ACTION', label: 'Shield Approaches Envelope' },
      { time: 1.0, name: 'TRANSFORM', label: 'Shield Locks & Scan Travels' },
      { time: 1.5, name: 'SUCCESS', label: 'Checkmark Draw & Wave' },
      { time: 2.0, name: 'END', label: 'Unified Verified Object' },
    ],
  },

  'password-reset': {
    id: 'password-reset',
    title: 'Password Reset',
    description: 'Your password has been successfully updated.',
    durationMs: 2200, // 2.2s target
    accentColor: '#f59e0b',
    secondaryColor: '#10b981',
    category: 'ACTIVE',
    objectType: 'lock-key',
    actionFeel: 'Security + Completion Story',
    stages: [
      { time: 0.0, name: 'START', label: 'Locked Padlock Appears' },
      { time: 0.5, name: 'ACTION', label: 'Key Enters Keyhole' },
      { time: 0.9, name: 'TRANSFORM', label: 'Key Turns 90° & Lock Opens' },
      { time: 1.4, name: 'SUCCESS', label: 'Lock Resecures & Checkmark' },
      { time: 2.0, name: 'END', label: 'Final Secure Lock Settle' },
    ],
  },

  'password-changed': {
    id: 'password-changed',
    title: 'Password Changed',
    description: 'Your password has been updated successfully.',
    durationMs: 1800, // 1.8s target
    accentColor: '#818cf8',
    secondaryColor: '#10b981',
    category: 'ACTIVE',
    objectType: 'security-lock',
    actionFeel: 'Quick Security Confirmation',
    stages: [
      { time: 0.0, name: 'START', label: 'Locked Security Core' },
      { time: 0.4, name: 'ACTION', label: 'Security Ring Rotates' },
      { time: 0.8, name: 'TRANSFORM', label: 'Lock Resecures' },
      { time: 1.3, name: 'SUCCESS', label: 'Checkmark & Pulse' },
      { time: 1.7, name: 'END', label: 'Final Secure Lock' },
    ],
  },

  'two-factor': {
    id: 'two-factor',
    title: 'Authentication Complete',
    description: 'Two-factor authentication was completed successfully.',
    durationMs: 2200, // 2.2s target
    accentColor: '#a855f7',
    secondaryColor: '#10b981',
    category: 'ACTIVE',
    objectType: 'dual-shield-lock',
    actionFeel: 'Security Verification',
    stages: [
      { time: 0.0, name: 'START', label: 'Shield & Lock Separated' },
      { time: 0.5, name: 'ACTION', label: 'Lock Moves & Ring Fills' },
      { time: 1.1, name: 'TRANSFORM', label: 'Shield Locks Element' },
      { time: 1.6, name: 'SUCCESS', label: '360° Ring Complete & Checkmark' },
      { time: 2.0, name: 'END', label: 'Unified 2FA Shield' },
    ],
  },

  'logout': {
    id: 'logout',
    title: 'Logged Out',
    description: 'You have been successfully logged out.',
    durationMs: 1500, // 1.5s target (Fastest & Non-celebratory)
    accentColor: '#94a3b8',
    secondaryColor: '#6366f1',
    category: 'ACTIVE',
    objectType: 'portal-door',
    actionFeel: 'Clean + Fast + Professional',
    stages: [
      { time: 0.0, name: 'START', label: 'Session Key Orb in Portal' },
      { time: 0.3, name: 'ACTION', label: 'Portal Door Opens 75°' },
      { time: 0.7, name: 'TRANSFORM', label: 'Session Orb Exits Portal' },
      { time: 1.1, name: 'SUCCESS', label: 'Door Closes & Soft Fade' },
      { time: 1.4, name: 'END', label: 'Clean Empty Portal' },
    ],
  },

  'generic-success': {
    id: 'generic-success',
    title: 'Success',
    description: 'The action was completed successfully.',
    durationMs: 1800, // 1.8s target
    accentColor: '#10b981',
    secondaryColor: '#3b82f6',
    category: 'ACTIVE',
    objectType: 'abstract-gem',
    actionFeel: 'Minimal Confirmation',
    stages: [
      { time: 0.0, name: 'START', label: 'Abstract Glass Gem Enters' },
      { time: 0.5, name: 'ACTION', label: 'Confirmation Ring Expands' },
      { time: 1.0, name: 'TRANSFORM', label: 'Gem Illuminates Emerald' },
      { time: 1.4, name: 'SUCCESS', label: 'Checkmark Reveals' },
      { time: 1.7, name: 'END', label: 'Clean Gem Settle' },
    ],
  },

  'otp-verified': {
    id: 'otp-verified',
    title: 'OTP Verified',
    description: 'One-time passcode verified successfully.',
    durationMs: 1800, // 1.8s target
    accentColor: '#06b6d4',
    secondaryColor: '#f59e0b',
    category: 'COMING_SOON',
    objectType: 'otp-device',
    actionFeel: 'Quick Verification (Preview Concept)',
    isComingSoon: true,
    stages: [
      { time: 0.0, name: 'START', label: '6 Inactive Dark OTP Dots' },
      { time: 0.4, name: 'ACTION', label: 'Sequential Dot Illumination' },
      { time: 1.0, name: 'TRANSFORM', label: 'Final Digit Activates & Ring Locks' },
      { time: 1.4, name: 'SUCCESS', label: 'Checkmark Appears' },
      { time: 1.7, name: 'END', label: 'Verified Token Device' },
    ],
  },

  'profile-complete': {
    id: 'profile-complete',
    title: 'Profile Complete',
    description: 'Your profile setup is 100% complete.',
    durationMs: 2500, // 2.5s target
    accentColor: '#8b5cf6',
    secondaryColor: '#10b981',
    category: 'COMING_SOON',
    objectType: 'profile-setup-card',
    actionFeel: 'Completion Reward (Preview Concept)',
    isComingSoon: true,
    stages: [
      { time: 0.0, name: 'START', label: 'Incomplete Card Base' },
      { time: 0.6, name: 'ACTION', label: 'Avatar & Skill Nodes Assemble' },
      { time: 1.2, name: 'TRANSFORM', label: '100% Complete State' },
      { time: 1.7, name: 'SUCCESS', label: 'Checkmark & Radiance Wave' },
      { time: 2.3, name: 'END', label: 'Completed Profile Settle' },
    ],
  },
};

export const ANIMATION_STATE_KEYS = Object.keys(AUTH_ANIMATION_CONFIGS);
