'use client';

import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useEffect, useMemo, useRef } from 'react';
import { PAGE_HEIGHTS_VH } from '@/constants';
import ringVertexShader from '@/lib/shaders/ring.vert.glsl';
import ringFragmentShader from '@/lib/shaders/ring.frag.glsl';

const RADIUSES = {
  ringS: 3,
  ringM: 6,
  ringL: 9,
};
const BASE_RADIUS = RADIUSES.ringM;
const RING_SCALES = {
  ringS: RADIUSES.ringS / BASE_RADIUS,
  ringM: 1,
  ringL: RADIUSES.ringL / BASE_RADIUS,
};

interface RingProps {
  currentPage: number;
  scrollProgress: number;
}

// ---------------------------------------------------------------------------
// Pose keyframes, one per page, in page order:
//   0 Hero, 1 Experience, 2 Projects, 3 Skills, 4 Community, 5 About,
//   6 Quote, 7 Contact.
// The camera descends from worldY 200 to -200 in equal steps per page, so each
// pose's vertical position is a LIFT relative to its page's camera stop (the
// hand-tuned absolute fits from BREAKPOINTS.md minus the old camera stops).
// Depth / rotation / ring-offset poses are camera-independent and travel with
// their content.
// ---------------------------------------------------------------------------

const NUM_PAGES = PAGE_HEIGHTS_VH.length;
// Camera worldY at each page's keyframe.
const CAMERA_STOPS = Array.from(
  { length: NUM_PAGES },
  (_, i) => 200 - (400 * i) / (NUM_PAGES - 1)
);

// Depth (local y → world -z): how far the rings sit from the camera plane.
// Responsive fits (ar = w/h) from BREAKPOINTS.md tuning.

// Aspect-ratio breakpoints tuned in BREAKPOINTS.md — every page shares them.
const HERO_AR = [0.462, 0.562, 0.699, 1.64] as const;

/**
 * Piecewise-linear interpolation of `values` (same length as `HERO_AR`) at
 * aspect ratio `ar`. Values below the first knot / above the last knot are
 * clamped so extreme viewports don't extrapolate wildly.
 */
function fitByAR(ar: number, values: readonly [number, number, number, number]): number {
  const xs = HERO_AR;
  if (ar <= xs[0]) return values[0];
  if (ar >= xs[xs.length - 1]) return values[values.length - 1];
  for (let i = 0; i < xs.length - 1; i++) {
    if (ar <= xs[i + 1]) {
      const t = (ar - xs[i]) / (xs[i + 1] - xs[i]);
      return values[i] + (values[i + 1] - values[i]) * t;
    }
  }
  return values[values.length - 1];
}

// Hero depth from BREAKPOINTS.md: 13 PM(0.46→-62), SE(0.56→-68), iPad Pro(0.70→-77), MacBook(1.64→-88)
function getHeroDepth(w: number, h: number): number {
  return fitByAR(w / h, [-62, -68, -77, -88]);
}
// Experience depth from BREAKPOINTS.md: 13 PM(0.46→-62), SE(0.56→-68), iPad Pro(0.70→-77), MacBook(1.64→-86)
function getExperienceDepth(w: number, h: number): number {
  return fitByAR(w / h, [-62, -68, -77, -86]);
}
// Projects depth from BREAKPOINTS.md: 13 PM(0.46→-62), SE(0.56→-68), iPad Pro(0.70→-77), MacBook(1.64→-88)
function getProjectsDepth(w: number, h: number): number {
  return fitByAR(w / h, [-62, -68, -77, -88]);
}
// Community depth from BREAKPOINTS.md: 13 PM(0.46→-62), SE(0.56→-68), iPad Pro(0.70→-77), MacBook(1.64→-88)
function getCommunityDepth(w: number, h: number): number {
  return fitByAR(w / h, [-62, -68, -77, -88]);
}
// About depth from BREAKPOINTS.md: 13 PM(0.46→-62), SE(0.56→-68), iPad Pro(0.70→-77), MacBook(1.64→-88)
function getAboutDepth(w: number, h: number): number {
  return fitByAR(w / h, [-62, -68, -77, -88]);
}
// Quote depth from BREAKPOINTS.md: 13 PM(0.46→-62), SE(0.56→-68), iPad Pro(0.70→-77), MacBook(1.64→-88)
function getQuoteDepth(w: number, h: number): number {
  return fitByAR(w / h, [-62, -68, -77, -88]);
}
// Skills: 13 PM(0.46→-77), SE(0.56→-81), iPad Pro(0.70→-85), MacBook(1.64→-85)
function getSkillsDepth(w: number, h: number): number {
  return Math.max(-85, -62 - 33 * (w / h));
}
// Contact: 13 PM(0.46→-61), SE(0.56→-71), iPad Pro(0.70→-76), MacBook(1.64→-88)
function getContactDepth(w: number, h: number): number {
  return -58 - 19 * (w / h);
}

// Vertical lift (local z → world y) above/below the page's camera stop.
// Derived from the old absolute fits minus the old camera stops.

// Hero lift from BREAKPOINTS.md (z − 200): 13 PM(0.46→15), SE(0.56→13), iPad Pro(0.70→13), MacBook(1.64→6)
function getHeroLift(w: number, h: number): number {
  return fitByAR(w / h, [15, 13, 13, 6]);
}
// Experience lift from BREAKPOINTS.md (z − CAMERA_STOPS[1] ≈ 142.86):
// 13 PM(0.46→15.14), SE(0.56→15.14), iPad Pro(0.70→10.14), MacBook(1.64→7.14)
function getExperienceLift(w: number, h: number): number {
  return fitByAR(w / h, [15.14, 15.14, 10.14, 7.14]);
}
// Projects lift from BREAKPOINTS.md (z − CAMERA_STOPS[2] ≈ 85.71):
// 13 PM(0.46→15.29), SE(0.56→14.29), iPad Pro(0.70→11.29), MacBook(1.64→6.29)
function getProjectsLift(w: number, h: number): number {
  return fitByAR(w / h, [15.29, 14.29, 11.29, 6.29]);
}
// Community lift from BREAKPOINTS.md (z − CAMERA_STOPS[4] ≈ -28.57):
// 13 PM(0.46→14.57), SE(0.56→8.57), iPad Pro(0.70→10.57), MacBook(1.64→6.57)
function getCommunityLift(w: number, h: number): number {
  return fitByAR(w / h, [14.57, 8.57, 10.57, 6.57]);
}
// About lift from BREAKPOINTS.md (z − CAMERA_STOPS[5] ≈ -85.71):
// 13 PM(0.46→15.71), SE(0.56→9.71), iPad Pro(0.70→9.71), MacBook(1.64→6.71)
function getAboutLift(w: number, h: number): number {
  return fitByAR(w / h, [15.71, 9.71, 9.71, 6.71]);
}
// Quote lift from BREAKPOINTS.md (z − CAMERA_STOPS[6] ≈ -142.86):
// 13 PM(0.46→11.86), SE(0.56→6.86), iPad Pro(0.70→5.86), MacBook(1.64→2.86)
function getQuoteLift(w: number, h: number): number {
  return fitByAR(w / h, [11.86, 6.86, 5.86, 2.86]);
}
// Quote small-ring Z offset from BREAKPOINTS.md:
// 13 PM(0.46→6.3), SE(0.56→5.3), iPad Pro(0.70→6.3), MacBook(1.64→8.3)
function getQuoteSOffsetZ(w: number, h: number): number {
  return fitByAR(w / h, [6.3, 5.3, 6.3, 8.3]);
}
// Skills: was max(49, 58 - 13ar) with camera at 40.
function getSkillsLift(w: number, h: number): number {
  return Math.max(9, 18 - 13 * (w / h));
}
// Contact: was -185 - 7ar with camera at -200.
function getContactLift(w: number, h: number): number {
  return 15 - 7 * (w / h);
}

// X keyframes for the mid ring per page
const PAGE_X_POSITIONS = [0, 0, 0, 0, -10, 0, 0, 0];

// Per-page X offsets from mid ring for S and L rings (Skills fans them out)
const PAGE_X_OFFSETS_S = [0, 0, 0, 0.5, 0, 0, 0, 0];
const PAGE_X_OFFSETS_L = [0, 0, 0.8, 1.5, 0, 0, 0, 0];

// Per-page vertical offsets from mid ring for S and L rings (0 = same height)
const PAGE_OFFSETS_S = [-2.5, 0, 0, -1, 0, 0.5, 8.3, 2];
const PAGE_OFFSETS_L = [2.5, 0, 0.8, -1, 0, -1, 2, 4.0];

// Per-page rotation angles [x, y, z] in radians for each ring
const PAGE_ROTATIONS_S: [number, number, number][] = [
  [0, 0, 0], // Hero
  [-1, 0, 0], // Experience
  [-0.4, -0.8, 0], // Projects
  [0, -0.4, 0], // Skills
  [-1.2, 0, 0], // Community
  [-0.2, 0.6, 0], // About
  [0.1, 0, 0], // Quote
  [0, 0, 0], // Contact
];
const PAGE_ROTATIONS_M: [number, number, number][] = [
  [0, 0, 0], // Hero
  [0.2, 0, 0], // Experience
  [1.9, 0, 0], // Projects
  [1.1, 0, 0], // Skills
  [-1.2, 0, 0], // Community
  [0.1, -0.3, 0], // About
  [-0.1, 0, 0], // Quote
  [0, 0, 0], // Contact
];
const PAGE_ROTATIONS_L: [number, number, number][] = [
  [0, 0, 0], // Hero
  [2, 0, 0], // Experience
  [0.6, 0.6, 0], // Projects
  [-0.6, -1, 0], // Skills
  [-1.2, 0, 0], // Community
  [-0.1, -0.1, 0], // About
  [-0.1, 0, 0], // Quote
  [0, 0, 0], // Contact
];

// Cursor parallax (page 1 only): rings drift away from the cursor, each by a
// different amount so the drift reads as depth. Units are world-space; the
// rings group is rotated -π/2 about X, so local x = screen x, local z = screen y.
const PARALLAX_STRENGTH = {
  ringS: 1,
  ringM: 0.75,
  ringL: 0.375,
};

function interpolate(keyframes: number[], progress: number): number {
  const scaled = progress * (keyframes.length - 1);
  const idx = Math.floor(scaled);
  const t = scaled - idx;
  const from = keyframes[Math.min(idx, keyframes.length - 1)];
  const to = keyframes[Math.min(idx + 1, keyframes.length - 1)];
  return from + (to - from) * t;
}

const Ring = ({ currentPage, scrollProgress }: RingProps) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const ringSRef = useRef<THREE.Mesh>(null);
  const ringMRef = useRef<THREE.Mesh>(null);
  const ringLRef = useRef<THREE.Mesh>(null);
  const ringsGroupRef = useRef<THREE.Group>(null);
  const hasInitialized = useRef(false);
  const spinPhaseS = useRef(0);
  const spinPhaseM = useRef(0);
  const spinPhaseL = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const { size } = useThree();

  // Listen on window: the page sections sit above the canvas with
  // pointer-events-auto, so the canvas itself rarely receives pointer events.
  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onPointerMove);
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, []);

  const RING_MATERIAL = {
    lightX: 0,
    lightY: 0,
    lightZ: 10,
    baseOpacity: 1.0,
    fresnelColor: '#4361EE',
    baseColor1: '#4361EE',
    baseColor2: '#fff',
    fresnelPower: 3.5,
    fresnelStrength: 5.0,
    fresnelBias: 0.0,
    rotationSpeed: 0.03,
  };

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uLightDir: { value: new THREE.Vector3(0, 1, 0) },
      uBaseOpacity: { value: 1.0 },
      uFresnelColor: { value: new THREE.Color('#4361EE') },
      uBaseColor1: { value: new THREE.Color('#4361EE') },
      uBaseColor2: { value: new THREE.Color('#fff') },
      uFresnelPower: { value: 3.5 },
      uFresnelStrength: { value: 5.0 },
      uFresnelBias: { value: 0.0 },
    }),
    []
  );
  const sharedRingGeometry = useMemo(
    () => new THREE.TorusGeometry(BASE_RADIUS, 0.15, 16, 100),
    []
  );

  useEffect(() => {
    return () => {
      sharedRingGeometry.dispose();
    };
  }, [sharedRingGeometry]);

  useFrame(() => {
    const { width: w, height: h } = size;

    const heroDepth = getHeroDepth(w, h);
    const contactDepth = getContactDepth(w, h);
    const midPageY = [
      heroDepth,
      getExperienceDepth(w, h),
      getProjectsDepth(w, h),
      getSkillsDepth(w, h),
      getCommunityDepth(w, h),
      getAboutDepth(w, h),
      getQuoteDepth(w, h),
      contactDepth,
    ];

    // Vertical per page: camera stop + content's lift.
    const lifts = [
      getHeroLift(w, h),
      getExperienceLift(w, h),
      getProjectsLift(w, h),
      getSkillsLift(w, h),
      getCommunityLift(w, h),
      getAboutLift(w, h),
      getQuoteLift(w, h),
      getContactLift(w, h),
    ];
    const midPageZ = CAMERA_STOPS.map((cam, i) => cam + lifts[i]);

    const midPageX = [...PAGE_X_POSITIONS];
    const midTargetX = interpolate(midPageX, scrollProgress);
    const midTargetY = interpolate(midPageY, scrollProgress);
    const midTargetZ = interpolate(midPageZ, scrollProgress);

    const sZOffsets = [...PAGE_OFFSETS_S];
    sZOffsets[6] = getQuoteSOffsetZ(w, h);

    const sXOffset = interpolate(PAGE_X_OFFSETS_S, scrollProgress);
    const sYOffset = 0;
    const sOffset = interpolate(sZOffsets, scrollProgress);
    const lXOffset = interpolate(PAGE_X_OFFSETS_L, scrollProgress);
    const lYOffset = 0;
    const lOffset = interpolate(PAGE_OFFSETS_L, scrollProgress);

    // Cursor parallax, hero page only: fades out as the hero scrolls away
    // (scrollProgress 0 → 1/(N-1)). Rings drift opposite the cursor; the
    // position lerp below gives the drift its easing.
    const parallaxFade = Math.max(0, 1 - scrollProgress * (NUM_PAGES - 1));
    const parallaxX = -pointer.current.x * parallaxFade;
    const parallaxY = pointer.current.y * parallaxFade;

    // Snap to targets on first frame so rings don't lerp in from the origin
    const t = hasInitialized.current ? 0.1 : 1;
    hasInitialized.current = true;

    if (ringMRef.current) {
      ringMRef.current.position.x = THREE.MathUtils.lerp(
        ringMRef.current.position.x,
        midTargetX + parallaxX * PARALLAX_STRENGTH.ringM,
        t
      );
      ringMRef.current.position.z = THREE.MathUtils.lerp(
        ringMRef.current.position.z,
        midTargetZ + parallaxY * PARALLAX_STRENGTH.ringM,
        t
      );
      ringMRef.current.position.y = midTargetY;
    }
    if (ringSRef.current) {
      ringSRef.current.position.x = THREE.MathUtils.lerp(
        ringSRef.current.position.x,
        midTargetX + sXOffset + parallaxX * PARALLAX_STRENGTH.ringS,
        t
      );
      ringSRef.current.position.z = THREE.MathUtils.lerp(
        ringSRef.current.position.z,
        midTargetZ + sOffset + parallaxY * PARALLAX_STRENGTH.ringS,
        t
      );
      ringSRef.current.position.y = midTargetY + sYOffset;
    }
    if (ringLRef.current) {
      ringLRef.current.position.x = THREE.MathUtils.lerp(
        ringLRef.current.position.x,
        midTargetX + lXOffset + parallaxX * PARALLAX_STRENGTH.ringL,
        t
      );
      ringLRef.current.position.z = THREE.MathUtils.lerp(
        ringLRef.current.position.z,
        midTargetZ + lOffset + parallaxY * PARALLAX_STRENGTH.ringL,
        t
      );
      ringLRef.current.position.y = midTargetY + lYOffset;
    }

    if (ringSRef.current) {
      spinPhaseS.current += RING_MATERIAL.rotationSpeed / RADIUSES.ringS;
      const sTargetX = interpolate(
        PAGE_ROTATIONS_S.map((r) => r[0]),
        scrollProgress
      );
      const sTargetY = interpolate(
        PAGE_ROTATIONS_S.map((r) => r[1]),
        scrollProgress
      );
      const sTargetRotZ = interpolate(
        PAGE_ROTATIONS_S.map((r) => r[2]),
        scrollProgress
      );
      ringSRef.current.rotation.x = THREE.MathUtils.lerp(
        ringSRef.current.rotation.x,
        sTargetX,
        0.05
      );
      ringSRef.current.rotation.y = THREE.MathUtils.lerp(
        ringSRef.current.rotation.y,
        sTargetY,
        0.05
      );
      ringSRef.current.rotation.z = sTargetRotZ + spinPhaseS.current;
    }
    if (ringMRef.current) {
      spinPhaseM.current += RING_MATERIAL.rotationSpeed / RADIUSES.ringM;
      const mTargetX = interpolate(
        PAGE_ROTATIONS_M.map((r) => r[0]),
        scrollProgress
      );
      const mTargetY = interpolate(
        PAGE_ROTATIONS_M.map((r) => r[1]),
        scrollProgress
      );
      const mTargetRotZ = interpolate(
        PAGE_ROTATIONS_M.map((r) => r[2]),
        scrollProgress
      );
      ringMRef.current.rotation.x = THREE.MathUtils.lerp(
        ringMRef.current.rotation.x,
        mTargetX,
        0.05
      );
      ringMRef.current.rotation.y = THREE.MathUtils.lerp(
        ringMRef.current.rotation.y,
        mTargetY,
        0.05
      );
      ringMRef.current.rotation.z = mTargetRotZ + spinPhaseM.current;
    }
    if (ringLRef.current) {
      spinPhaseL.current += RING_MATERIAL.rotationSpeed / RADIUSES.ringL;
      const lTargetX = interpolate(
        PAGE_ROTATIONS_L.map((r) => r[0]),
        scrollProgress
      );
      const lTargetY = interpolate(
        PAGE_ROTATIONS_L.map((r) => r[1]),
        scrollProgress
      );
      const lTargetRotZ = interpolate(
        PAGE_ROTATIONS_L.map((r) => r[2]),
        scrollProgress
      );
      ringLRef.current.rotation.x = THREE.MathUtils.lerp(
        ringLRef.current.rotation.x,
        lTargetX,
        0.05
      );
      ringLRef.current.rotation.y = THREE.MathUtils.lerp(
        ringLRef.current.rotation.y,
        lTargetY,
        0.05
      );
      ringLRef.current.rotation.z = lTargetRotZ + spinPhaseL.current;
    }

    if (materialRef.current) {
      materialRef.current.uniforms.uLightDir.value
        .set(RING_MATERIAL.lightX, RING_MATERIAL.lightY, RING_MATERIAL.lightZ)
        .normalize();
      materialRef.current.uniforms.uBaseOpacity.value =
        RING_MATERIAL.baseOpacity;
      materialRef.current.uniforms.uFresnelPower.value =
        RING_MATERIAL.fresnelPower;
      materialRef.current.uniforms.uFresnelStrength.value =
        RING_MATERIAL.fresnelStrength;
      materialRef.current.uniforms.uFresnelBias.value =
        RING_MATERIAL.fresnelBias;
      materialRef.current.uniforms.uFresnelColor.value.set(
        RING_MATERIAL.fresnelColor
      );
      materialRef.current.uniforms.uBaseColor1.value.set(
        RING_MATERIAL.baseColor1
      );
      materialRef.current.uniforms.uBaseColor2.value.set(
        RING_MATERIAL.baseColor2
      );
    }
  });
  return (
    <>
      <group ref={ringsGroupRef} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh
          ref={ringSRef}
          scale={[RING_SCALES.ringS, RING_SCALES.ringS, RING_SCALES.ringS]}
          position={[PAGE_X_POSITIONS[0], 0, PAGE_OFFSETS_S[0]]}
        >
          <primitive object={sharedRingGeometry} attach="geometry" />
          <shaderMaterial
            ref={materialRef}
            vertexShader={ringVertexShader}
            fragmentShader={ringFragmentShader}
            blending={THREE.AdditiveBlending}
            side={THREE.FrontSide}
            depthWrite={false}
            transparent={true}
            uniforms={uniforms}
          />
        </mesh>
        <mesh
          ref={ringMRef}
          scale={[RING_SCALES.ringM, RING_SCALES.ringM, RING_SCALES.ringM]}
          position={[PAGE_X_POSITIONS[0], 0, 0]}
        >
          <primitive object={sharedRingGeometry} attach="geometry" />
          <shaderMaterial
            vertexShader={ringVertexShader}
            fragmentShader={ringFragmentShader}
            blending={THREE.AdditiveBlending}
            side={THREE.FrontSide}
            depthWrite={false}
            transparent={true}
            uniforms={uniforms}
          />
        </mesh>
        <mesh
          ref={ringLRef}
          scale={[RING_SCALES.ringL, RING_SCALES.ringL, RING_SCALES.ringL]}
          position={[PAGE_X_POSITIONS[0], 0, PAGE_OFFSETS_L[0]]}
        >
          <primitive object={sharedRingGeometry} attach="geometry" />
          <shaderMaterial
            vertexShader={ringVertexShader}
            fragmentShader={ringFragmentShader}
            blending={THREE.AdditiveBlending}
            side={THREE.FrontSide}
            depthWrite={false}
            transparent={true}
            uniforms={uniforms}
          />
        </mesh>
      </group>
    </>
  );
};

export default Ring;
