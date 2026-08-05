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

// Hero: iPhone SE(0.56→-70), 13 PM(0.46→-67), iPad Pro(0.70→-78), MacBook(1.64→-88)
function getHeroDepth(w: number, h: number): number {
  return -62 - 16 * (w / h);
}
// About: 13 PM(0.46→-63), SE(0.56→-70), iPad Pro(0.70→-77), MacBook(1.64→-88)
function getAboutDepth(w: number, h: number): number {
  return -60 - 17 * (w / h);
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

// Hero: was clamp(222.5 - 0.011w, 206, 220) with camera at 200.
function getHeroLift(w: number): number {
  return THREE.MathUtils.clamp(22.5 - 0.011 * w, 6, 20);
}
// About: was 138 - 7ar with camera at 120.
function getAboutLift(w: number, h: number): number {
  return 18 - 7 * (w / h);
}
// Skills: was max(49, 58 - 13ar) with camera at 40.
function getSkillsLift(w: number, h: number): number {
  return Math.max(9, 18 - 13 * (w / h));
}
// Contact: was -185 - 7ar with camera at -200.
function getContactLift(w: number, h: number): number {
  return 15 - 7 * (w / h);
}
// Constant lifts (were -36 / -118 against cameras at -40 / -120).
const PROJECTS_LIFT = 4;
const EXPERIENCE_LIFT = 2;
const COMMUNITY_LIFT = 4;
const QUOTE_LIFT = 2;

// X keyframes for the mid ring per page
const PAGE_X_POSITIONS = [0, 0, 0, 0, 0, 0, 0, 0];

// Per-page X offsets from mid ring for S and L rings (Skills fans them out)
const PAGE_X_OFFSETS_S = [0, 0, 0, 0.5, 0, 0, 0, 0];
const PAGE_X_OFFSETS_L = [0, 0, 0, 1.5, 0, 0, 0, 0];

// Per-page vertical offsets from mid ring for S and L rings (0 = same height)
const PAGE_OFFSETS_S = [-2.5, -2.5, -2.5, -1, -2, 0.5, 1.0, 2];
const PAGE_OFFSETS_L = [2.5, 2.5, 2.5, -1, 3, 1.0, 2.0, 4.0];

// Per-page rotation angles [x, y, z] in radians for each ring
const PAGE_ROTATIONS_S: [number, number, number][] = [
  [0, 0, 0], // Hero
  [0, Math.PI / 2, 0], // Experience
  [Math.PI / 3, Math.PI / 4, 0], // Projects
  [0, -0.4, 0], // Skills
  [1.0, 0.3, 0], // Community
  [0.5, 0.4, 0], // About
  [0.55, -0.35, 0], // Quote
  [0, 0, 0], // Contact
];
const PAGE_ROTATIONS_M: [number, number, number][] = [
  [0, 0, 0], // Hero
  [Math.PI / 6, Math.PI / 6, 0], // Experience
  [Math.PI / 4, 0, 0], // Projects
  [1.1, 0, 0], // Skills
  [0.9, -0.25, 0], // Community
  [0.4, -0.4, 0], // About
  [0.5, 0.25, 0], // Quote
  [0, 0, 0], // Contact
];
const PAGE_ROTATIONS_L: [number, number, number][] = [
  [0, 0, 0], // Hero
  [-Math.PI / 4, 0, 0], // Experience
  [Math.PI / 6, -Math.PI / 4, 0], // Projects
  [-0.6, -1, 0], // Skills
  [1.05, 0.15, 0], // Community
  [0.5, 0, 0], // About
  [0.55, -0.1, 0], // Quote
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

    // Depth per page (Projects / Experience / Quote sit on fractions of the
    // hero → contact depth span, from the old evenly-spaced tuning).
    const heroDepth = getHeroDepth(w, h);
    const contactDepth = getContactDepth(w, h);
    const spanDepth = (f: number) => heroDepth + (contactDepth - heroDepth) * f;
    const midPageY = [
      heroDepth,
      spanDepth(0.8), // Experience
      spanDepth(0.6), // Projects
      getSkillsDepth(w, h),
      spanDepth(0.7), // Community
      getAboutDepth(w, h),
      spanDepth(0.8), // Quote
      contactDepth,
    ];

    // Vertical per page: camera stop + content's lift.
    const lifts = [
      getHeroLift(w),
      EXPERIENCE_LIFT,
      PROJECTS_LIFT,
      getSkillsLift(w, h),
      COMMUNITY_LIFT,
      getAboutLift(w, h),
      QUOTE_LIFT,
      getContactLift(w, h),
    ];
    const midPageZ = CAMERA_STOPS.map((cam, i) => cam + lifts[i]);

    const midPageX = [...PAGE_X_POSITIONS];
    const midTargetX = interpolate(midPageX, scrollProgress);
    const midTargetY = interpolate(midPageY, scrollProgress);
    const midTargetZ = interpolate(midPageZ, scrollProgress);

    const sXOffset = interpolate(PAGE_X_OFFSETS_S, scrollProgress);
    const sYOffset = 0;
    const sOffset = interpolate(PAGE_OFFSETS_S, scrollProgress);
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
