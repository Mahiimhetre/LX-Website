import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { AUTH_ANIMATION_CONFIGS } from './authAnimationConfigs';

/**
 * Auth3DCanvas Component — Multi-Stage Cinematic Motion Engine
 * Executes true 5-stage timelines (START -> ACTION -> TRANSFORM -> SUCCESS -> END).
 * Checkmark is revealed ONLY during SUCCESS stage. Main sequence plays ONCE and stops.
 * Supports interactive timeline scrubbing, play/pause, step controls, and reduced motion.
 */
export const Auth3DCanvas = ({
  type = 'login',
  speedMultiplier = 1.0,
  autoReplay = false,
  isPaused = false,
  scrubProgress = null, // Manual scrubber override (0.0 to 1.0)
  isReducedMotion = false,
  onComplete = null,
  onProgressUpdate = null,
  className = '',
}) => {
  const mountRef = useRef(null);
  const [hasWebGLError, setHasWebGLError] = useState(false);

  const config = AUTH_ANIMATION_CONFIGS[type] || AUTH_ANIMATION_CONFIGS['login'];

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let scene, camera, renderer, animationFrameId;
    let mainGroup, objectMeshGroup, particleSystem, checkmarkMesh, ringWaveMesh, laserScanMesh;
    let pointLight, keyLight;

    const baseDuration = config.durationMs;
    let startTime = performance.now();
    let pausedTimeOffset = 0;
    let hasTriggeredComplete = false;

    let targetRotationX = 0;
    let targetRotationY = 0;
    let currentRotationX = 0;
    let currentRotationY = 0;

    const isTouchDevice =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0);

    const handleMouseMove = (e) => {
      if (isTouchDevice || isReducedMotion) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      targetRotationY = (x / (rect.width / 2)) * 0.25;
      targetRotationX = (-y / (rect.height / 2)) * 0.25;
    };

    const handleMouseLeave = () => {
      targetRotationX = 0;
      targetRotationY = 0;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    try {
      const width = container.clientWidth || 360;
      const height = container.clientHeight || 360;

      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(0, 0, 5.2);

      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.35;

      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      // Lighting System
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
      scene.add(ambientLight);

      keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
      keyLight.position.set(5, 6, 7);
      scene.add(keyLight);

      const accentColor = new THREE.Color(config.accentColor);
      const secondaryColor = new THREE.Color(config.secondaryColor);

      const rimLight = new THREE.DirectionalLight(secondaryColor, 3.0);
      rimLight.position.set(-6, -4, -3);
      scene.add(rimLight);

      pointLight = new THREE.PointLight(accentColor, 0, 12);
      pointLight.position.set(0, 0, 3);
      scene.add(pointLight);

      // Main Scene Hierarchy
      mainGroup = new THREE.Group();
      scene.add(mainGroup);

      objectMeshGroup = new THREE.Group();
      mainGroup.add(objectMeshGroup);

      // Glass & Metallic Materials
      const glassBaseMat = new THREE.MeshPhysicalMaterial({
        color: 0x0f172a,
        emissive: secondaryColor,
        emissiveIntensity: 0.2,
        metalness: 0.2,
        roughness: 0.15,
        transmission: 0.6,
        thickness: 1.2,
        transparent: true,
        opacity: 0.85,
        clearcoat: 1.0,
      });

      const chromeEdgeMat = new THREE.MeshStandardMaterial({
        color: accentColor,
        metalness: 0.95,
        roughness: 0.1,
        emissive: accentColor,
        emissiveIntensity: 0.3,
      });

      const glowCoreMat = new THREE.MeshBasicMaterial({
        color: accentColor,
        transparent: true,
        opacity: 0.85,
      });

      // 1. Build Base 3D Glass Circle Emblem Base
      const circleBaseGeo = new THREE.CylinderGeometry(1.25, 1.25, 0.2, 64);
      circleBaseGeo.rotateX(Math.PI / 2);
      const circleBaseMesh = new THREE.Mesh(circleBaseGeo, glassBaseMat);
      objectMeshGroup.add(circleBaseMesh);

      // Chrome Border Ring
      const borderRingGeo = new THREE.TorusGeometry(1.27, 0.06, 16, 64);
      const borderRingMesh = new THREE.Mesh(borderRingGeo, chromeEdgeMat);
      objectMeshGroup.add(borderRingMesh);

      // Vertical Laser Security Scan Bar
      const laserGeo = new THREE.BoxGeometry(2.4, 0.06, 0.06);
      const laserMat = new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0 });
      laserScanMesh = new THREE.Mesh(laserGeo, laserMat);
      laserScanMesh.position.z = 0.2;
      objectMeshGroup.add(laserScanMesh);

      // 2. Build State-Specific Center Emblem Inside Circle
      buildCircleEmblem(
        config.objectType,
        objectMeshGroup,
        glassBaseMat,
        chromeEdgeMat,
        glowCoreMat,
        accentColor,
        secondaryColor
      );

      // 3. Checkmark Mesh (Hidden initially at scale 0, revealed ONLY during SUCCESS stage)
      checkmarkMesh = createCheckmarkMesh(accentColor);
      checkmarkMesh.scale.set(0.001, 0.001, 0.001);
      mainGroup.add(checkmarkMesh);

      // 4. Confirmation Wave Pulse Ring Mesh
      const ringGeo = new THREE.RingGeometry(1.2, 1.3, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: accentColor,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      });
      ringWaveMesh = new THREE.Mesh(ringGeo, ringMat);
      ringWaveMesh.position.z = -0.1;
      mainGroup.add(ringWaveMesh);

      // 5. Ambient Particle System
      particleSystem = createParticleSystem(accentColor, secondaryColor);
      mainGroup.add(particleSystem);

      // Render & Animation Loop
      const animate = (time) => {
        animationFrameId = requestAnimationFrame(animate);

        let progress = 0;

        if (scrubProgress !== null && scrubProgress !== undefined) {
          // Scrubber manual timeline override (0.0 to 1.0)
          progress = Math.max(0, Math.min(1.0, scrubProgress));
        } else if (isPaused) {
          // Paused timeline state
          const elapsedMs = pausedTimeOffset * speedMultiplier;
          progress = Math.min(elapsedMs / baseDuration, 1.0);
        } else {
          // Live playback timeline
          const elapsedMs = (time - startTime) * speedMultiplier;
          pausedTimeOffset = (time - startTime);
          progress = Math.min(elapsedMs / baseDuration, 1.0);
        }

        if (onProgressUpdate) {
          onProgressUpdate(progress);
        }

        if (!isReducedMotion) {
          currentRotationX += (targetRotationX - currentRotationX) * 0.08;
          currentRotationY += (targetRotationY - currentRotationY) * 0.08;
          mainGroup.rotation.x = currentRotationX;
          mainGroup.rotation.y = currentRotationY;
        }

        // Multi-stage cinematic timeline controller
        animateMultiStageTimeline(
          config.objectType,
          progress,
          objectMeshGroup,
          checkmarkMesh,
          ringWaveMesh,
          laserScanMesh,
          pointLight,
          particleSystem,
          isReducedMotion
        );

        // Sequence Completion & Auto-Replay Logic (STOP main animation at 1.0)
        if (progress >= 1.0) {
          const idleTime = (time - (startTime + baseDuration / speedMultiplier)) * 0.001;

          // Extremely subtle 1px float after stopping
          if (!isReducedMotion && scrubProgress === null) {
            objectMeshGroup.position.y = Math.sin(idleTime * 1.5) * 0.03;
          }

          if (!hasTriggeredComplete) {
            hasTriggeredComplete = true;
            if (onComplete) onComplete();
          }

          if (autoReplay && idleTime > 0.8 && scrubProgress === null) {
            startTime = performance.now();
            hasTriggeredComplete = false;
          }
        }
      };

      animationFrameId = requestAnimationFrame(animate);

      const handleResize = () => {
        if (!container || !renderer || !camera) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);

        scene.traverse((child) => {
          if (child.isMesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((mat) => mat.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });

        if (renderer && renderer.domElement) {
          renderer.dispose();
          if (renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
          }
        }
      };
    } catch (err) {
      console.warn('WebGL Context init error, using CSS fallback', err);
      setHasWebGLError(true);
    }
  }, [type, speedMultiplier, autoReplay, isPaused, scrubProgress, isReducedMotion]);

  return (
    <div className={`relative w-full h-full flex items-center justify-center ${className}`}>
      {hasWebGLError ? (
        <CSS3DFallback config={config} isReducedMotion={isReducedMotion} scrubProgress={scrubProgress} />
      ) : (
        <div ref={mountRef} className="w-full h-full flex items-center justify-center cursor-pointer" />
      )}
    </div>
  );
};

/* =====================================================================
 * HELPER 1: BUILD STATE EMBLEM MESHES
 * ===================================================================== */
function buildCircleEmblem(type, group, glassMat, metalMat, glowMat, accentColor, secondaryColor) {
  const emblemGroup = new THREE.Group();
  emblemGroup.position.z = 0.15;
  group.add(emblemGroup);

  switch (type) {
    case 'shield-keyhole': {
      const shieldShape = new THREE.Shape();
      shieldShape.moveTo(0, 0.75);
      shieldShape.quadraticCurveTo(0.6, 0.7, 0.65, 0.1);
      shieldShape.quadraticCurveTo(0.6, -0.6, 0, -0.85);
      shieldShape.quadraticCurveTo(-0.6, -0.6, -0.65, 0.1);
      shieldShape.quadraticCurveTo(-0.6, 0.7, 0, 0.75);

      const shieldGeo = new THREE.ExtrudeGeometry(shieldShape, { depth: 0.15, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03 });
      shieldGeo.center();
      const shield = new THREE.Mesh(shieldGeo, metalMat);
      shield.name = 'shield';
      emblemGroup.add(shield);

      const keyholeCircleGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.08, 32);
      keyholeCircleGeo.rotateX(Math.PI / 2);
      const keyholeCircle = new THREE.Mesh(keyholeCircleGeo, glassMat);
      keyholeCircle.position.set(0, 0.08, 0.12);
      keyholeCircle.name = 'keyholeCircle';
      emblemGroup.add(keyholeCircle);

      const keyholeSlotGeo = new THREE.ConeGeometry(0.14, 0.3, 3);
      keyholeSlotGeo.rotateZ(Math.PI);
      const keyholeSlot = new THREE.Mesh(keyholeSlotGeo, glassMat);
      keyholeSlot.position.set(0, -0.08, 0.12);
      keyholeSlot.name = 'keyholeSlot';
      emblemGroup.add(keyholeSlot);
      break;
    }

    case 'profile-card':
    case 'identity-card':
    case 'profile-setup-card': {
      const cardLayerGroup = new THREE.Group();
      cardLayerGroup.name = 'cardLayerGroup';

      const avatarRingGeo = new THREE.TorusGeometry(0.35, 0.06, 16, 32);
      const avatarRing = new THREE.Mesh(avatarRingGeo, metalMat);
      avatarRing.position.y = 0.25;
      avatarRing.name = 'avatarRing';
      cardLayerGroup.add(avatarRing);

      const bodyGeo = new THREE.CylinderGeometry(0.45, 0.65, 0.35, 32, 1, false, 0, Math.PI);
      bodyGeo.rotateX(-Math.PI / 2);
      const bodyMesh = new THREE.Mesh(bodyGeo, metalMat);
      bodyMesh.position.y = -0.3;
      bodyMesh.name = 'bodyMesh';
      cardLayerGroup.add(bodyMesh);

      emblemGroup.add(cardLayerGroup);
      break;
    }

    case 'envelope-letter':
    case 'envelope-shield': {
      const envGeo = new THREE.BoxGeometry(1.3, 0.85, 0.15);
      const envMesh = new THREE.Mesh(envGeo, glassMat);
      emblemGroup.add(envMesh);

      const flapShape = new THREE.Shape();
      flapShape.moveTo(-0.65, 0);
      flapShape.lineTo(0.65, 0);
      flapShape.lineTo(0, -0.45);
      flapShape.closePath();

      const flapGeo = new THREE.ExtrudeGeometry(flapShape, { depth: 0.04, bevelEnabled: false });
      flapGeo.center();
      const flapMesh = new THREE.Mesh(flapGeo, metalMat);
      flapMesh.position.set(0, 0.42, 0.08);
      flapMesh.name = 'flap';
      emblemGroup.add(flapMesh);

      const letterGeo = new THREE.BoxGeometry(1.0, 0.65, 0.04);
      const letterMesh = new THREE.Mesh(letterGeo, metalMat);
      letterMesh.position.set(0, 0, 0.02);
      letterMesh.name = 'letter';
      emblemGroup.add(letterMesh);

      if (type === 'envelope-shield') {
        const sideShieldGeo = new THREE.OctahedronGeometry(0.35, 0);
        const sideShield = new THREE.Mesh(sideShieldGeo, metalMat);
        sideShield.position.set(1.4, 0, 0.1);
        sideShield.name = 'sideShield';
        emblemGroup.add(sideShield);
      }
      break;
    }

    case 'lock-key':
    case 'security-lock': {
      const lockBodyGeo = new THREE.BoxGeometry(0.85, 0.75, 0.25);
      const lockBody = new THREE.Mesh(lockBodyGeo, glassMat);
      lockBody.position.y = -0.15;
      emblemGroup.add(lockBody);

      const shackleGeo = new THREE.TorusGeometry(0.28, 0.06, 16, 32, Math.PI);
      const shackle = new THREE.Mesh(shackleGeo, metalMat);
      shackle.position.set(0, 0.22, 0);
      shackle.name = 'shackle';
      emblemGroup.add(shackle);

      if (type === 'lock-key') {
        const keyGroup = new THREE.Group();
        keyGroup.name = 'keyGroup';

        const keyHeadGeo = new THREE.TorusGeometry(0.14, 0.03, 16, 32);
        const keyHead = new THREE.Mesh(keyHeadGeo, metalMat);
        keyHead.position.set(-0.35, 0, 0);
        keyGroup.add(keyHead);

        const keyStemGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 16);
        keyStemGeo.rotateZ(Math.PI / 2);
        const keyStem = new THREE.Mesh(keyStemGeo, metalMat);
        keyStem.position.set(-0.1, 0, 0);
        keyGroup.add(keyStem);

        keyGroup.position.set(1.4, -0.15, 0.15);
        emblemGroup.add(keyGroup);
      }

      if (type === 'security-lock') {
        const secRingGeo = new THREE.TorusGeometry(0.6, 0.03, 16, 32);
        const secRing = new THREE.Mesh(secRingGeo, metalMat);
        secRing.name = 'secRing';
        emblemGroup.add(secRing);
      }
      break;
    }

    case 'dual-shield-lock': {
      const ring1Geo = new THREE.TorusGeometry(0.65, 0.04, 16, 48);
      const ring1 = new THREE.Mesh(ring1Geo, metalMat);
      ring1.name = 'outerRing';
      emblemGroup.add(ring1);

      const ring2Geo = new THREE.TorusGeometry(0.45, 0.04, 16, 48);
      const ring2 = new THREE.Mesh(ring2Geo, glassMat);
      ring2.name = 'innerRing';
      emblemGroup.add(ring2);

      const lockCoreGeo = new THREE.OctahedronGeometry(0.3, 0);
      const lockCore = new THREE.Mesh(lockCoreGeo, metalMat);
      lockCore.position.set(1.2, 0, 0);
      lockCore.name = 'lockCore';
      emblemGroup.add(lockCore);
      break;
    }

    case 'portal-door': {
      const doorGeo = new THREE.BoxGeometry(0.7, 1.1, 0.08);
      const doorMesh = new THREE.Mesh(doorGeo, metalMat);
      doorMesh.name = 'doorLeaf';
      emblemGroup.add(doorMesh);

      const orbGeo = new THREE.SphereGeometry(0.15, 32, 32);
      const orbMesh = new THREE.Mesh(orbGeo, glowMat);
      orbMesh.position.set(0, 0, 0.08);
      orbMesh.name = 'sessionOrb';
      emblemGroup.add(orbMesh);
      break;
    }

    case 'otp-device': {
      const digitGroup = new THREE.Group();
      digitGroup.name = 'digitGroup';
      for (let i = 0; i < 6; i++) {
        const dotGeo = new THREE.SphereGeometry(0.07, 16, 16);
        const dotMat = new THREE.MeshBasicMaterial({ color: 0x334155 });
        const dot = new THREE.Mesh(dotGeo, dotMat);
        dot.position.set(-0.55 + i * 0.22, 0, 0.08);
        digitGroup.add(dot);
      }
      emblemGroup.add(digitGroup);
      break;
    }

    case 'abstract-gem':
    default: {
      const gemGeo = new THREE.OctahedronGeometry(0.65, 1);
      const gemMesh = new THREE.Mesh(gemGeo, glassMat);
      gemMesh.name = 'gemMesh';
      emblemGroup.add(gemMesh);

      const gemRingGeo = new THREE.TorusGeometry(0.8, 0.03, 16, 48);
      const gemRing = new THREE.Mesh(gemRingGeo, metalMat);
      gemRing.rotation.x = Math.PI / 3;
      gemRing.name = 'gemRing';
      emblemGroup.add(gemRing);
      break;
    }
  }
}

function createCheckmarkMesh(color) {
  const checkShape = new THREE.Shape();
  checkShape.moveTo(-0.4, -0.05);
  checkShape.lineTo(-0.12, -0.35);
  checkShape.lineTo(0.4, 0.3);
  checkShape.lineTo(0.28, 0.4);
  checkShape.lineTo(-0.12, -0.18);
  checkShape.lineTo(-0.28, 0.05);
  checkShape.closePath();

  const checkGeo = new THREE.ExtrudeGeometry(checkShape, { depth: 0.12, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03 });
  checkGeo.center();

  const checkMat = new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 0.95,
    metalness: 0.95,
    roughness: 0.05,
  });

  const mesh = new THREE.Mesh(checkGeo, checkMat);
  mesh.position.z = 0.55;
  return mesh;
}

function createParticleSystem(primaryColor, secondaryColor) {
  const count = 60;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 4.2;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 4.2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 3.5;

    const lerpC = Math.random() > 0.5 ? primaryColor : secondaryColor;
    colors[i * 3] = lerpC.r;
    colors[i * 3 + 1] = lerpC.g;
    colors[i * 3 + 2] = lerpC.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.08,
    vertexColors: true,
    transparent: true,
    opacity: 0, // Hidden initially, bursts on SUCCESS
    blending: THREE.AdditiveBlending,
  });

  return new THREE.Points(geometry, material);
}

/* =====================================================================
 * MULTI-STAGE CINEMATIC TIMELINE CONTROLLER
 * Stages: START (0.0) -> ACTION (0.2) -> TRANSFORM (0.5) -> SUCCESS (0.7) -> END (1.0)
 * ===================================================================== */
function animateMultiStageTimeline(
  objectType,
  progress,
  meshGroup,
  checkmark,
  ringWave,
  laserScan,
  pointLight,
  particleSystem,
  isReducedMotion
) {
  // Get Child Meshes
  const flap = meshGroup.getObjectByName('flap');
  const letter = meshGroup.getObjectByName('letter');
  const keyGroup = meshGroup.getObjectByName('keyGroup');
  const shackle = meshGroup.getObjectByName('shackle');
  const doorLeaf = meshGroup.getObjectByName('doorLeaf');
  const sessionOrb = meshGroup.getObjectByName('sessionOrb');
  const digitGroup = meshGroup.getObjectByName('digitGroup');
  const outerRing = meshGroup.getObjectByName('outerRing');
  const innerRing = meshGroup.getObjectByName('innerRing');
  const sideShield = meshGroup.getObjectByName('sideShield');
  const lockCore = meshGroup.getObjectByName('lockCore');
  const secRing = meshGroup.getObjectByName('secRing');
  const cardLayerGroup = meshGroup.getObjectByName('cardLayerGroup');
  const keyholeCircle = meshGroup.getObjectByName('keyholeCircle');

  // STAGE 1: START (0.0s to 0.2s) — Dimmed, Incomplete, Closed
  if (progress < 0.25) {
    const startProgress = progress / 0.25;
    meshGroup.scale.set(0.7 + startProgress * 0.3, 0.7 + startProgress * 0.3, 0.7 + startProgress * 0.3);
    if (!isReducedMotion) meshGroup.rotation.y = (1.0 - startProgress) * 0.6;
    if (laserScan) laserScan.material.opacity = 0;
  } else {
    meshGroup.scale.set(1, 1, 1);
    meshGroup.rotation.y = 0;
  }

  // STAGE 2: ACTION (0.25s to 0.5s) — Primary Motion Sequence
  if (progress >= 0.2 && progress < 0.5) {
    const actProgress = (progress - 0.2) / 0.3;

    // Login Scan Pass
    if (laserScan) {
      laserScan.material.opacity = Math.sin(actProgress * Math.PI) * 0.9;
      laserScan.position.y = 1.0 - actProgress * 2.0;
    }

    // Email Sent Flap Opening
    if (flap) flap.rotation.x = Math.PI * actProgress;

    // Password Reset Key Approaching
    if (keyGroup) keyGroup.position.x = 1.4 - actProgress * 1.4;

    // Email Verified Shield Approaching
    if (sideShield) sideShield.position.x = 1.4 - actProgress * 1.4;

    // 2FA Lock Core Approaching
    if (lockCore) lockCore.position.x = 1.2 - actProgress * 1.2;

    // Logout Door Opening 75 deg
    if (doorLeaf) doorLeaf.rotation.y = -Math.PI * 0.42 * actProgress;

    // Password Changed Ring Rotating
    if (secRing) secRing.rotation.z = actProgress * Math.PI * 2;
  }

  // STAGE 3: TRANSFORMATION (0.5s to 0.7s) — Physical Change Occurs
  if (progress >= 0.5 && progress < 0.7) {
    const tfProgress = (progress - 0.5) / 0.2;

    // Key Turning & Lock Shackle Unlocking
    if (keyGroup && shackle) {
      keyGroup.rotation.z = Math.PI * 0.5 * tfProgress;
      shackle.position.y = 0.22 + tfProgress * 0.15;
    }

    // Email Letter Emerging & Rising
    if (letter) letter.position.y = tfProgress * 0.4;

    // Logout Session Orb Exiting
    if (sessionOrb) sessionOrb.position.z = 0.08 + tfProgress * 0.8;

    // Registration Card Layers Assembling
    if (cardLayerGroup) cardLayerGroup.position.z = (1.0 - tfProgress) * 0.4;

    // Login Keyhole Light Intensifying
    if (keyholeCircle) keyholeCircle.material.emissiveIntensity = 0.3 + tfProgress * 0.7;
  }

  // OTP Digits Sequential Illumination (Progress 0.2 to 0.7)
  if (digitGroup) {
    const illuminatedCount = Math.floor(progress * 7);
    digitGroup.children.forEach((child, i) => {
      if (i < illuminatedCount) {
        child.material.color.setHex(0x22d3ee);
      } else {
        child.material.color.setHex(0x334155);
      }
    });
  }

  // Dual Ring Rotation
  if (outerRing && innerRing && !isReducedMotion) {
    outerRing.rotation.z = progress * Math.PI * 2;
    innerRing.rotation.z = -progress * Math.PI * 2;
  }

  // STAGE 4: SUCCESS CONFIRMATION (0.7s to 0.95s) — Checkmark Reveal ONLY NOW!
  if (progress >= 0.65) {
    const checkProgress = Math.min((progress - 0.65) / 0.2, 1.0);
    const checkScale = isReducedMotion ? 1.0 : easeOutBack(checkProgress);
    checkmark.scale.set(checkScale, checkScale, checkScale);

    // Confirmation Wave & Radial Pulse Light
    if (progress >= 0.7 && progress <= 0.95) {
      const pulseProgress = (progress - 0.7) / 0.25;
      const ringScale = 1.0 + pulseProgress * 1.3;
      ringWave.scale.set(ringScale, ringScale, ringScale);
      ringWave.material.opacity = Math.max(0, 1.0 - pulseProgress);
      pointLight.intensity = (1.0 - pulseProgress) * 6.0;
      if (particleSystem) particleSystem.material.opacity = (1.0 - pulseProgress) * 0.9;
    } else {
      ringWave.material.opacity = 0;
      pointLight.intensity = 0;
      if (particleSystem) particleSystem.material.opacity = 0.15;
    }
  } else {
    // Hidden during START, ACTION, and TRANSFORM stages
    checkmark.scale.set(0.001, 0.001, 0.001);
    ringWave.material.opacity = 0;
    pointLight.intensity = 0;
    if (particleSystem) particleSystem.material.opacity = 0;
  }

  // STAGE 5: FINAL STATE SETTLE (0.95s to 1.0s+) — Close Flaps & Retract
  if (progress >= 0.85) {
    const closeProgress = Math.min((progress - 0.85) / 0.15, 1.0);
    if (flap && letter) {
      flap.rotation.x = Math.PI * (1.0 - closeProgress);
      letter.position.y = 0.4 * (1.0 - closeProgress);
    }
    if (doorLeaf) doorLeaf.rotation.y = -Math.PI * 0.42 * (1.0 - closeProgress);
  }
}

function easeOutBack(x) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

/* =====================================================================
 * VIVID CSS 3D FALLBACK
 * ===================================================================== */
const CSS3DFallback = ({ config, isReducedMotion, scrubProgress }) => {
  const progress = scrubProgress !== null && scrubProgress !== undefined ? scrubProgress : 1.0;
  const showCheckmark = progress >= 0.65;

  return (
    <div className="relative w-44 h-44 flex items-center justify-center">
      <div
        className={`relative w-36 h-36 rounded-full border-2 border-white/40 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-900 shadow-2xl flex items-center justify-center transition-all duration-500 ${
          isReducedMotion ? '' : 'animate-pulse'
        }`}
        style={{
          boxShadow: `0 0 50px ${config.accentColor}60`,
        }}
      >
        {showCheckmark ? (
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-2xl border-2 border-white/70 shadow-lg transition-all scale-100"
            style={{ backgroundColor: config.accentColor }}
          >
            ✓
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full border-2 border-white/30 border-t-white animate-spin" />
        )}
      </div>
    </div>
  );
};
