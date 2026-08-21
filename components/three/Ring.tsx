'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { animated, to, useSpring, useSprings } from '@react-spring/three';
import * as THREE from 'three';
import { useEffect, useMemo, useRef } from 'react';
import { PAGE_HEIGHTS_VH } from '@/constants';
import { usePrefersReducedMotion } from '@/hooks';
import {
  type ARFit,
  PAGE_DEPTHS,
  PAGE_LIFTS,
  PAGE_OFFSETS_L,
  PAGE_OFFSETS_S,
  PAGE_ROTATIONS_L,
  PAGE_ROTATIONS_M,
  PAGE_ROTATIONS_S,
  PAGE_X_OFFSETS_L,
  PAGE_X_OFFSETS_S,
  PAGE_X_POSITIONS,
  PARALLAX_STRENGTH,
  QUOTE_S_OFFSET_Z,
  RADIUSES,
  RING_GEOMETRY_ARGS,
  RING_MATERIAL,
  RING_SCALES,
  RING_SPIN_SPEED,
  fitByAR,
} from '@/constants/ring';
import { interpolateKeyframes as interpolate } from '@/lib/utils/three';
import ringVertexShader from '@/lib/shaders/ring.vert.glsl';
import ringFragmentShader from '@/lib/shaders/ring.frag.glsl';

interface RingProps {
  scrollProgress: number;
  /** Entrance springs wait for this (the page loader's hand-off). */
  entranceReady?: boolean;
}

const NUM_PAGES = PAGE_HEIGHTS_VH.length;
// Camera worldY at each page's keyframe.
const CAMERA_STOPS = Array.from(
  { length: NUM_PAGES },
  (_, i) => 200 - (400 * i) / (NUM_PAGES - 1)
);

/** Resolve an ARFit table or formula at the given aspect ratio. */
function resolveFit(fit: ARFit | ((ar: number) => number), ar: number): number {
  return typeof fit === 'function' ? fit(ar) : fitByAR(ar, fit);
}

/** Split a per-page [x, y, z] rotation table into per-axis keyframe tracks. */
function axisTracks(rotations: [number, number, number][]) {
  return [0, 1, 2].map((axis) => rotations.map((r) => r[axis]));
}

// Static per-ring config; frame targets index into this by ring order S, M, L.
const RING_CONFIGS = [
  {
    key: 'S',
    radius: RADIUSES.ringS,
    scale: RING_SCALES.ringS,
    rotationTracks: axisTracks(PAGE_ROTATIONS_S),
    parallax: PARALLAX_STRENGTH.ringS,
    initialZ: PAGE_OFFSETS_S[0],
  },
  {
    key: 'M',
    radius: RADIUSES.ringM,
    scale: RING_SCALES.ringM,
    rotationTracks: axisTracks(PAGE_ROTATIONS_M),
    parallax: PARALLAX_STRENGTH.ringM,
    initialZ: 0,
  },
  {
    key: 'L',
    radius: RADIUSES.ringL,
    scale: RING_SCALES.ringL,
    rotationTracks: axisTracks(PAGE_ROTATIONS_L),
    parallax: PARALLAX_STRENGTH.ringL,
    initialZ: PAGE_OFFSETS_L[0],
  },
];

// Netflix-ident entrance. The beats that sell it: the rings CUT in oversized
// (no ease-in — the eye must not see them arrive), slam down to size, punch a
// hair past it, then go dead still. Staggering the three landings turns one
// mushy pop into "ta-ta-DUM", and the glow spring flashes the shared material
// as the largest ring lands.
const TUDUM = {
  /** Scale the rings cut in at, before the slam. */
  start: 2.4,
  /** Punched past the target so the stop reads as an impact, not a stop. */
  punch: 0.94,
  /** In-plane squash on impact — the squash half of squash-and-stretch. */
  squash: 0.86,
  /** Hard attack. */
  slam: { mass: 1, tension: 700, friction: 30 },
  /** Tight recovery: no floaty wobble after the hit. */
  settle: { mass: 1, tension: 260, friction: 22 },
  /** ms between landings, small ring first, large ring last. */
  stagger: 70,
  /** ms a slam takes to reach the target — used to time the flash. */
  impact: 100,
  /** Peak brightness multiplier on impact (additive blend). */
  flash: 2.2,
};

const Ring = ({ scrollProgress, entranceReady = true }: RingProps) => {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([null, null, null]);
  const spinPhases = useRef([0, 0, 0]);
  const hasInitialized = useRef(false);
  const pointer = useRef({ x: 0, y: 0 });
  const { size } = useThree();
  const reduceMotion = usePrefersReducedMotion();

  // Page-load entrance. Scale is the only transform the frame loop doesn't
  // drive, so these springs compose with the scroll poses. The chain re-asserts
  // the oversized pose immediately on each run because `from` only applies at
  // mount — without it the rings would grow out of 0 instead of slamming in.
  const [entranceSprings] = useSprings(
    RING_CONFIGS.length,
    (i) => ({
      from: { scale: TUDUM.start, scaleY: TUDUM.start },
      // Holds at 0 until the page loader hands off, then slams.
      to: entranceReady
        ? async (next: (props: object) => Promise<void>) => {
            await next({
              scale: TUDUM.start,
              scaleY: TUDUM.start,
              immediate: true,
            });
            await next({
              scale: TUDUM.punch,
              scaleY: TUDUM.squash,
              config: TUDUM.slam,
            });
            await next({ scale: 1, scaleY: 1, config: TUDUM.settle });
          }
        : { scale: 0, scaleY: 0, immediate: true },
      delay: i * TUDUM.stagger,
      immediate: reduceMotion,
    }),
    [reduceMotion, entranceReady]
  );

  // Impact flash, timed to the last ring landing. One spring for the whole
  // trio: the flash should read as a single hit, not three.
  const [{ glow }] = useSpring(
    () => ({
      from: { glow: 1 },
      to: entranceReady
        ? async (next: (props: object) => Promise<void>) => {
            await next({
              glow: TUDUM.flash,
              config: { tension: 900, friction: 18 },
            });
            await next({ glow: 1, config: { tension: 60, friction: 26 } });
          }
        : { glow: 1 },
      delay: TUDUM.stagger * (RING_CONFIGS.length - 1) + TUDUM.impact,
      immediate: reduceMotion,
    }),
    [reduceMotion, entranceReady]
  );

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

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uLightDir: {
        value: new THREE.Vector3(...RING_MATERIAL.lightDir).normalize(),
      },
      uBaseOpacity: { value: RING_MATERIAL.baseOpacity },
      uFresnelColor: { value: new THREE.Color(RING_MATERIAL.fresnelColor) },
      uBaseColor1: { value: new THREE.Color(RING_MATERIAL.baseColor1) },
      uBaseColor2: { value: new THREE.Color(RING_MATERIAL.baseColor2) },
      uFresnelPower: { value: RING_MATERIAL.fresnelPower },
      uFresnelStrength: { value: RING_MATERIAL.fresnelStrength },
      uFresnelBias: { value: RING_MATERIAL.fresnelBias },
    }),
    []
  );
  const sharedRingGeometry = useMemo(
    () => new THREE.TorusGeometry(...RING_GEOMETRY_ARGS),
    []
  );

  useEffect(() => {
    return () => {
      sharedRingGeometry.dispose();
    };
  }, [sharedRingGeometry]);

  useFrame(() => {
    const ar = size.width / size.height;
    const progress = scrollProgress;

    // Additive blending means alpha above 1 reads as brightness, so the glow
    // spring can flash the rings on impact without touching their colour.
    const flashOpacity = RING_MATERIAL.baseOpacity * glow.get();

    // Mid-ring targets: depth per page, vertical = camera stop + lift.
    const midPageY = PAGE_DEPTHS.map((fit) => resolveFit(fit, ar));
    const midPageZ = CAMERA_STOPS.map(
      (cam, i) => cam + resolveFit(PAGE_LIFTS[i], ar)
    );
    const midX = interpolate(PAGE_X_POSITIONS, progress);
    const midY = interpolate(midPageY, progress);
    const midZ = interpolate(midPageZ, progress);

    // S/L offsets from the mid ring (the quote-page S offset is responsive).
    const sZOffsets = [...PAGE_OFFSETS_S];
    sZOffsets[6] = fitByAR(ar, QUOTE_S_OFFSET_Z);
    const ringOffsets = [
      {
        x: interpolate(PAGE_X_OFFSETS_S, progress),
        z: interpolate(sZOffsets, progress),
      },
      { x: 0, z: 0 },
      {
        x: interpolate(PAGE_X_OFFSETS_L, progress),
        z: interpolate(PAGE_OFFSETS_L, progress),
      },
    ];

    // Cursor parallax, hero page only: fades out as the hero scrolls away
    // (scrollProgress 0 → 1/(N-1)). Rings drift opposite the cursor; the
    // position lerp below gives the drift its easing.
    const parallaxFade = Math.max(0, 1 - progress * (NUM_PAGES - 1));
    const parallaxX = -pointer.current.x * parallaxFade;
    const parallaxY = pointer.current.y * parallaxFade;

    // Snap to targets on first frame so rings don't lerp in from the origin
    const t = hasInitialized.current ? 0.1 : 1;
    hasInitialized.current = true;

    RING_CONFIGS.forEach((config, i) => {
      const mesh = meshRefs.current[i];
      if (!mesh) return;

      (mesh.material as THREE.ShaderMaterial).uniforms.uBaseOpacity.value =
        flashOpacity;

      mesh.position.x = THREE.MathUtils.lerp(
        mesh.position.x,
        midX + ringOffsets[i].x + parallaxX * config.parallax,
        t
      );
      mesh.position.z = THREE.MathUtils.lerp(
        mesh.position.z,
        midZ + ringOffsets[i].z + parallaxY * config.parallax,
        t
      );
      mesh.position.y = midY;

      spinPhases.current[i] += RING_SPIN_SPEED / config.radius;
      const [rotX, rotY, rotZ] = config.rotationTracks;
      mesh.rotation.x = THREE.MathUtils.lerp(
        mesh.rotation.x,
        interpolate(rotX, progress),
        0.05
      );
      mesh.rotation.y = THREE.MathUtils.lerp(
        mesh.rotation.y,
        interpolate(rotY, progress),
        0.05
      );
      mesh.rotation.z = interpolate(rotZ, progress) + spinPhases.current[i];
    });
  });

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      {RING_CONFIGS.map((config, i) => (
        <animated.mesh
          key={config.key}
          ref={(el) => {
            meshRefs.current[i] = el;
          }}
          scale={to(
            [entranceSprings[i].scale, entranceSprings[i].scaleY],
            (s, sy) =>
              [s * config.scale, sy * config.scale, s * config.scale] as [
                number,
                number,
                number,
              ]
          )}
          position={[PAGE_X_POSITIONS[0], 0, config.initialZ]}
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
        </animated.mesh>
      ))}
    </group>
  );
};

export default Ring;
