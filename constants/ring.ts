/**
 * Ring choreography tuning data.
 *
 * Pose keyframes, one per page, in page order:
 *   0 Hero, 1 Experience, 2 Projects, 3 Skills, 4 Community, 5 About,
 *   6 Quote, 7 Contact.
 * The camera descends from worldY 200 to -200 in equal steps per page, so each
 * pose's vertical position is a LIFT relative to its page's camera stop (the
 * hand-tuned absolute fits from BREAKPOINTS.md minus the old camera stops).
 * Depth / rotation / ring-offset poses are camera-independent and travel with
 * their content.
 */

export const RADIUSES = {
  ringS: 3,
  ringM: 6,
  ringL: 9,
};
export const BASE_RADIUS = RADIUSES.ringM;
export const RING_SCALES = {
  ringS: RADIUSES.ringS / BASE_RADIUS,
  ringM: 1,
  ringL: RADIUSES.ringL / BASE_RADIUS,
};
/** TorusGeometry args: radius, tube, radialSegments, tubularSegments */
export const RING_GEOMETRY_ARGS = [BASE_RADIUS, 0.15, 16, 100] as const;

/** How fast each ring spins around its own axis (divided by its radius). */
export const RING_SPIN_SPEED = 0.03;

/** Static shader-material config (uniform values set once at creation). */
export const RING_MATERIAL = {
  lightDir: [0, 0, 10] as const,
  baseOpacity: 1.0,
  fresnelColor: '#4361EE',
  baseColor1: '#4361EE',
  baseColor2: '#fff',
  fresnelPower: 3.5,
  fresnelStrength: 5.0,
  fresnelBias: 0.0,
};

// ---------------------------------------------------------------------------
// Responsive fits
// ---------------------------------------------------------------------------

/** Aspect-ratio knots tuned in BREAKPOINTS.md:
 *  iPhone 13 PM, iPhone SE, iPad Pro 11, MacBook Air. */
export const AR_KNOTS = [0.462, 0.562, 0.699, 1.64] as const;

/** Values sampled at AR_KNOTS, interpolated by fitByAR. */
export type ARFit = readonly [number, number, number, number];

/**
 * Piecewise-linear interpolation of `values` (sampled at AR_KNOTS) at aspect
 * ratio `ar`. Clamped at both ends so extreme viewports don't extrapolate.
 */
export function fitByAR(ar: number, values: ARFit): number {
  const xs = AR_KNOTS;
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

/**
 * Depth (local y → world -z) per page: how far the rings sit from the camera
 * plane, as an ARFit table or a formula of the aspect ratio.
 */
export const PAGE_DEPTHS: ReadonlyArray<ARFit | ((ar: number) => number)> = [
  [-62, -68, -77, -88], // Hero
  [-62, -68, -77, -86], // Experience
  [-62, -68, -77, -88], // Projects
  (ar) => Math.max(-85, -62 - 33 * ar), // Skills
  [-62, -68, -77, -88], // Community
  [-62, -68, -77, -88], // About
  [-62, -68, -77, -88], // Quote
  (ar) => -58 - 19 * ar, // Contact
];

/**
 * Vertical lift (local z → world y) per page, relative to the page's camera
 * stop. Derived from the old absolute BREAKPOINTS.md fits minus the old
 * camera stops.
 */
export const PAGE_LIFTS: ReadonlyArray<ARFit | ((ar: number) => number)> = [
  [15, 13, 13, 6], // Hero
  [15.14, 15.14, 10.14, 7.14], // Experience
  [15.29, 14.29, 11.29, 6.29], // Projects
  (ar) => Math.max(9, 18 - 13 * ar), // Skills
  [14.57, 8.57, 10.57, 6.57], // Community
  [15.71, 9.71, 9.71, 6.71], // About
  [11.86, 6.86, 5.86, 2.86], // Quote
  (ar) => 15 - 7 * ar, // Contact
];

/** Quote-page small-ring Z offset (responsive override of PAGE_OFFSETS_S[6]). */
export const QUOTE_S_OFFSET_Z: ARFit = [6.3, 5.3, 6.3, 8.3];

// ---------------------------------------------------------------------------
// Per-page pose tables (indexed by page)
// ---------------------------------------------------------------------------

/** X keyframes for the mid ring per page */
export const PAGE_X_POSITIONS = [0, 0, 0, 0, -10, 0, 0, 0];

/** Per-page X offsets from mid ring for S and L rings (Skills fans them out) */
export const PAGE_X_OFFSETS_S = [0, 0, 0, 0.5, 0, 0, 0, 0];
export const PAGE_X_OFFSETS_L = [0, 0, 0.8, 1.5, 0, 0, 0, 0];

/** Per-page vertical offsets from mid ring for S and L rings (0 = same height) */
export const PAGE_OFFSETS_S = [-2.5, 0, 0, -1, 0, 0.5, 8.3, 2];
export const PAGE_OFFSETS_L = [2.5, 0, 0.8, -1, 0, -1, 2, 4.0];

/** Per-page rotation angles [x, y, z] in radians for each ring */
export const PAGE_ROTATIONS_S: [number, number, number][] = [
  [0, 0, 0], // Hero
  [-1, 0, 0], // Experience
  [-0.4, -0.8, 0], // Projects
  [0, -0.4, 0], // Skills
  [-1.2, 0, 0], // Community
  [-0.2, 0.6, 0], // About
  [0.1, 0, 0], // Quote
  [0, 0, 0], // Contact
];
export const PAGE_ROTATIONS_M: [number, number, number][] = [
  [0, 0, 0], // Hero
  [0.2, 0, 0], // Experience
  [1.9, 0, 0], // Projects
  [1.1, 0, 0], // Skills
  [-1.2, 0, 0], // Community
  [0.1, -0.3, 0], // About
  [-0.1, 0, 0], // Quote
  [0, 0, 0], // Contact
];
export const PAGE_ROTATIONS_L: [number, number, number][] = [
  [0, 0, 0], // Hero
  [2, 0, 0], // Experience
  [0.6, 0.6, 0], // Projects
  [-0.6, -1, 0], // Skills
  [-1.2, 0, 0], // Community
  [-0.1, -0.1, 0], // About
  [-0.1, 0, 0], // Quote
  [0, 0, 0], // Contact
];

/**
 * Cursor parallax (hero page only): rings drift away from the cursor, each by
 * a different amount so the drift reads as depth. Units are world-space; the
 * rings group is rotated -π/2 about X, so local x = screen x, local z = screen y.
 */
export const PARALLAX_STRENGTH = {
  ringS: 1,
  ringM: 0.75,
  ringL: 0.375,
};
