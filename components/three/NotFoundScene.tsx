'use client';

import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { animated, to, useSprings } from '@react-spring/three';
import { useControls } from 'leva';
import * as THREE from 'three';
import { sceneConfig } from '@/config';
import { usePrefersReducedMotion } from '@/hooks';
import {
  RADIUSES,
  RING_GEOMETRY_ARGS,
  RING_MATERIAL,
  RING_SPIN_SPEED,
} from '@/constants/ring';
import Particles from './Particles';
import ringVertexShader from '@/lib/shaders/ring.vert.glsl';
import ringFragmentShader from '@/lib/shaders/ring.frag.glsl';

const CAMERA_Z = 107.23;
// Depth plane the "zero" ring sits on (behind the particle field's far side).
const ZERO_Z = 60;
// Torus outer radius at scale 1 (ring radius + tube radius) — the slot's
// pixel size maps onto this to size the ring exactly like a digit.
const TORUS_OUTER = RING_GEOMETRY_ARGS[0] + RING_GEOMETRY_ARGS[1];

// Background rings: motion character (Leva drives positions/rotations).
// radius feeds the spin rate, like Ring.tsx (RING_SPIN_SPEED / radius).
const BG_RINGS = [
  { scale: 1.5, parallax: 1.0, radius: RADIUSES.ringL },
  { scale: 1.0, parallax: 1.0, radius: RADIUSES.ringM },
] as const;

const ROT_LIMITS = { min: -Math.PI, max: Math.PI, step: 0.01 };
// x/y are fractions of the visible frustum at the ring's depth (stay in
// frame on any aspect ratio); z is world-space depth toward the camera.
const FRAC_LIMITS = { min: -1.2, max: 1.2, step: 0.01 };

interface RingsProps {
  /** Empty span inside the 404 heading where the small ring renders as the "0". */
  slotRef: RefObject<HTMLSpanElement | null>;
}

function Rings({ slotRef }: RingsProps) {
  // Group carries the slot-fit position/scale; the animated.mesh inside
  // carries the entrance spring, so the two never fight over `scale`.
  const zeroRef = useRef<THREE.Group>(null);
  // Rotation lives on the inner mesh, UNDER the group's oval scale — so
  // rotZ spins the torus on its own axis (like the background rings)
  // instead of tumbling the squashed ellipse.
  const zeroMeshRef = useRef<THREE.Mesh>(null);
  const bgRefs = useRef<(THREE.Mesh | null)[]>([null, null]);
  const spinPhases = useRef([0, 0, 0]);
  const pointer = useRef({ x: 0, y: 0 });
  const slotRect = useRef<{
    cx: number;
    cy: number;
    w: number;
    h: number;
  } | null>(null);
  const { camera, size } = useThree();
  const reduceMotion = usePrefersReducedMotion();

  // Tuning controls — panel is gated by dev mode in NotFoundContent.
  const zeroCtl = useControls('404 Zero Ring', {
    offsetX: { value: 0, min: -30, max: 30, step: 0.1 },
    offsetY: { value: 0, min: -30, max: 30, step: 0.1 },
    offsetZ: { value: 15.0, min: -40, max: 40, step: 0.1 },
    rotX: { value: Math.PI, ...ROT_LIMITS },
    rotY: { value: 0, ...ROT_LIMITS },
    rotZ: { value: -0.04, ...ROT_LIMITS },
  });
  const ringLCtl = useControls('404 Ring L', {
    x: { value: -0.45, ...FRAC_LIMITS },
    y: { value: -0.06, ...FRAC_LIMITS },
    z: { value: 85, min: -50, max: 90, step: 0.5 },
    rotX: { value: 1.27, ...ROT_LIMITS },
    rotY: { value: -0.98, ...ROT_LIMITS },
    rotZ: { value: 0, ...ROT_LIMITS },
  });
  const ringMCtl = useControls('404 Ring M', {
    x: { value: 0.6, ...FRAC_LIMITS },
    y: { value: -0.06, ...FRAC_LIMITS },
    z: { value: 85, min: -50, max: 90, step: 0.5 },
    rotX: { value: 0.44, ...ROT_LIMITS },
    rotY: { value: 0.88, ...ROT_LIMITS },
    rotZ: { value: -0.04, ...ROT_LIMITS },
  });
  const bgCtls = [ringLCtl, ringMCtl];

  // Page-load entrance, same as Ring.tsx: rings bloom from scale 0 with the
  // heavy jelly preset on X/Z and a bouncier settle on Y. Index 0 is the
  // zero ring, 1..2 the background rings. Scale is the only transform the
  // frame loop doesn't drive, so the springs compose with the frame poses.
  const [entranceSprings] = useSprings(
    1 + BG_RINGS.length,
    () => ({
      from: { scale: 0, scaleY: 0 },
      to: { scale: 1, scaleY: 1 },
      config: (key) =>
        key === 'scale'
          ? { mass: 3.5, tension: 20, friction: 26 }
          : { tension: 120, friction: 14 },
      immediate: reduceMotion,
    }),
    [reduceMotion]
  );

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
  const geometry = useMemo(
    () => new THREE.TorusGeometry(...RING_GEOMETRY_ARGS),
    []
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  // Track the heading slot: on resize, and when the display font swaps in
  // (Andromeda loads async and reflows the h1).
  useEffect(() => {
    const measure = () => {
      const el = slotRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      slotRect.current = {
        cx: r.left + r.width / 2,
        cy: r.top + r.height / 2,
        w: r.width,
        h: r.height,
      };
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (slotRef.current) ro.observe(slotRef.current);
    window.addEventListener('resize', measure);
    document.fonts?.ready.then(measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [slotRef]);

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onPointerMove);
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, []);

  useFrame(() => {
    const persp = camera as THREE.PerspectiveCamera;
    const halfFov = THREE.MathUtils.degToRad(persp.fov) / 2;

    // The "zero": pin the small ring to the heading slot. Unproject the
    // slot's CSS-pixel rect onto the ring's depth plane.
    const zero = zeroRef.current;
    const rect = slotRect.current;
    if (zero) {
      if (rect) {
        // Unproject on the ring's ACTUAL plane (base + Z offset) so the ring
        // stays sized/pinned to the slot at any depth — offsetZ controls how
        // close it sits to the camera (perspective/thickness), not its size.
        const zeroZ = ZERO_Z + zeroCtl.offsetZ;
        const worldPerPx =
          (2 * (CAMERA_Z - zeroZ) * Math.tan(halfFov)) / size.height;
        zero.position.set(
          (rect.cx - size.width / 2) * worldPerPx + zeroCtl.offsetX,
          (size.height / 2 - rect.cy) * worldPerPx + zeroCtl.offsetY,
          zeroZ
        );
        const sx = (rect.w * worldPerPx) / (2 * TORUS_OUTER);
        const sy = (rect.h * worldPerPx) / (2 * TORUS_OUTER);
        zero.scale.set(sx, sy, (sx + sy) / 2);
      } else {
        zero.scale.setScalar(0);
      }
      spinPhases.current[0] += RING_SPIN_SPEED / RADIUSES.ringS;
      const zeroMesh = zeroMeshRef.current;
      if (zeroMesh) {
        zeroMesh.rotation.set(
          zeroCtl.rotX,
          zeroCtl.rotY,
          zeroCtl.rotZ + spinPhases.current[0]
        );
      }
    }

    // Background rings: frustum-fraction placement + cursor parallax + wobble.
    BG_RINGS.forEach((cfg, i) => {
      const mesh = bgRefs.current[i];
      if (!mesh) return;
      const ctl = bgCtls[i];
      const halfH = (CAMERA_Z - ctl.z) * Math.tan(halfFov);
      const halfW = halfH * (size.width / size.height);
      mesh.position.x = THREE.MathUtils.lerp(
        mesh.position.x,
        ctl.x * halfW - pointer.current.x * cfg.parallax,
        0.05
      );
      mesh.position.y = THREE.MathUtils.lerp(
        mesh.position.y,
        ctl.y * halfH + pointer.current.y * cfg.parallax,
        0.05
      );
      mesh.position.z = ctl.z;
      spinPhases.current[i + 1] += RING_SPIN_SPEED / cfg.radius;
      mesh.rotation.set(
        ctl.rotX,
        ctl.rotY,
        ctl.rotZ + spinPhases.current[i + 1]
      );
    });
  });

  const material = (
    <shaderMaterial
      vertexShader={ringVertexShader}
      fragmentShader={ringFragmentShader}
      blending={THREE.AdditiveBlending}
      side={THREE.FrontSide}
      depthWrite={false}
      transparent={true}
      uniforms={uniforms}
    />
  );

  return (
    <>
      <group ref={zeroRef} scale={0}>
        <animated.mesh
          ref={zeroMeshRef}
          scale={to(
            [entranceSprings[0].scale, entranceSprings[0].scaleY],
            (s, sy) => [s, sy, s] as [number, number, number]
          )}
        >
          <primitive object={geometry} attach="geometry" />
          {material}
        </animated.mesh>
      </group>
      {BG_RINGS.map((cfg, i) => (
        <animated.mesh
          key={i}
          ref={(el) => {
            bgRefs.current[i] = el;
          }}
          scale={to(
            [entranceSprings[i + 1].scale, entranceSprings[i + 1].scaleY],
            (s, sy) =>
              [s * cfg.scale, sy * cfg.scale, s * cfg.scale] as [
                number,
                number,
                number,
              ]
          )}
        >
          <primitive object={geometry} attach="geometry" />
          {material}
        </animated.mesh>
      ))}
    </>
  );
}

export default function NotFoundScene({ slotRef }: RingsProps) {
  return (
    <Canvas
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
      camera={{
        fov: sceneConfig.CAMERA_FOV,
        near: sceneConfig.CAMERA_NEAR,
        far: sceneConfig.CAMERA_FAR,
        position: [0, 0, CAMERA_Z],
      }}
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <Rings slotRef={slotRef} />
      <Particles />
    </Canvas>
  );
}
