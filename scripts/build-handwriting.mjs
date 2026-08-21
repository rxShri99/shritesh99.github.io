/**
 * Generates single-stroke handwriting path data for the site.
 *
 * Source: Mistral SingleLine (https://github.com/isdat-type/Mistral-SingleLine),
 * SIL Open Font License 1.1. Its UFO sources are *open* contours — real
 * centrelines rather than glyph outlines — which is what lets us animate
 * stroke-dashoffset and have it read as a pen writing, the way Apple's "hello"
 * ident does. An ordinary font would only give us outlines to trace around.
 *
 * Usage: node scripts/build-handwriting.mjs "@rxShri99"
 * Writes data/handwriting.ts. Needs network access to fetch the glyphs.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const UFO =
  'https://raw.githubusercontent.com/isdat-type/Mistral-SingleLine/main/sources/Mistral_SingleLine.ufo';
const TEXT = process.argv[2] ?? '@rxShri99';
const OUT = path.join(process.cwd(), 'data', 'handwriting.ts');

// From the source's fontinfo.plist.
const ASCENDER = 650;
const DESCENDER = -350;
const X_HEIGHT = 300;
// Strokes shorter than this are join artefacts in the source; they'd get a
// zero-length dash and a wasted animation slot.
const MIN_STROKE_LENGTH = 6;

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  return res.text();
}

/** UFO contents.plist maps a glyph name to its .glif filename. */
function parseContents(plist) {
  const map = new Map();
  const re = /<key>([^<]+)<\/key>\s*<string>([^<]+)<\/string>/g;
  for (const [, name, file] of plist.matchAll(re)) map.set(name, file);
  return map;
}

/** Character to UFO glyph name. */
function glyphName(char) {
  const named = {
    '@': 'at',
    '0': 'zero',
    1: 'one',
    2: 'two',
    3: 'three',
    4: 'four',
    5: 'five',
    6: 'six',
    7: 'seven',
    8: 'eight',
    9: 'nine',
    '.': 'period',
    '-': 'hyphen',
    _: 'underscore',
  };
  if (named[char]) return named[char];
  return char;
}

/**
 * Parse a .glif into { advance, contours }. In UFO point lists an untyped
 * point is an off-curve control, `curve` closes a cubic with the two controls
 * before it, `line` is a straight segment, and an open contour starts on
 * `move`.
 */
function parseGlif(xml) {
  const advance = Number(/<advance width="([-\d.]+)"/.exec(xml)?.[1] ?? 0);
  const contours = [];

  for (const [, body] of xml.matchAll(/<contour>([\s\S]*?)<\/contour>/g)) {
    const points = [];
    for (const [, attrs] of body.matchAll(/<point([^/>]*)\/>/g)) {
      points.push({
        x: Number(/x="([-\d.]+)"/.exec(attrs)?.[1]),
        y: Number(/y="([-\d.]+)"/.exec(attrs)?.[1]),
        type: /type="([a-z]+)"/.exec(attrs)?.[1] ?? 'offcurve',
      });
    }
    if (points.length > 1) contours.push(points);
  }

  return { advance, contours };
}

/** Contour points to segments: { type: 'line' | 'curve', ...coords }. */
function toSegments(points) {
  const segments = [];
  let pending = [];
  let current = { x: points[0].x, y: points[0].y };

  for (const point of points.slice(1)) {
    if (point.type === 'offcurve') {
      pending.push(point);
      continue;
    }
    if (point.type === 'curve' && pending.length === 2) {
      segments.push({
        type: 'curve',
        c1: pending[0],
        c2: pending[1],
        to: point,
        from: current,
      });
    } else {
      segments.push({ type: 'line', to: point, from: current });
    }
    current = { x: point.x, y: point.y };
    pending = [];
  }

  return segments;
}

function cubicPoint(t, p0, c1, c2, p1) {
  const u = 1 - t;
  return {
    x: u ** 3 * p0.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t ** 3 * p1.x,
    y: u ** 3 * p0.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t ** 3 * p1.y,
  };
}

/** Approximate length, used only to give each stroke a duration share. */
function segmentsLength(segments) {
  let total = 0;
  for (const seg of segments) {
    if (seg.type === 'line') {
      total += Math.hypot(seg.to.x - seg.from.x, seg.to.y - seg.from.y);
      continue;
    }
    let prev = seg.from;
    for (let i = 1; i <= 16; i++) {
      const point = cubicPoint(i / 16, seg.from, seg.c1, seg.c2, seg.to);
      total += Math.hypot(point.x - prev.x, point.y - prev.y);
      prev = point;
    }
  }
  return total;
}

const round = (n) => Math.round(n * 10) / 10;

function toPathData(points, offsetX) {
  // UFO is y-up, SVG is y-down.
  const fx = (x) => round(x + offsetX);
  const fy = (y) => round(ASCENDER - y);
  const segments = toSegments(points);

  let d = `M${fx(points[0].x)} ${fy(points[0].y)}`;
  for (const seg of segments) {
    d +=
      seg.type === 'curve'
        ? `C${fx(seg.c1.x)} ${fy(seg.c1.y)} ${fx(seg.c2.x)} ${fy(seg.c2.y)} ${fx(seg.to.x)} ${fy(seg.to.y)}`
        : `L${fx(seg.to.x)} ${fy(seg.to.y)}`;
  }
  return { d, length: segmentsLength(segments) };
}

const contents = parseContents(await fetchText(`${UFO}/glyphs/contents.plist`));
const strokes = [];
let penX = 0;

for (const char of TEXT) {
  const name = glyphName(char);
  const file = contents.get(name);
  if (!file) throw new Error(`No glyph for "${char}" (looked for "${name}")`);

  const { advance, contours } = parseGlif(
    await fetchText(`${UFO}/glyphs/${encodeURIComponent(file)}`)
  );

  // Accents live above the x-height and are stored first in the source; a hand
  // writes the body and then dots it, so push them to the end of the glyph.
  const isAccent = (points) => Math.min(...points.map((p) => p.y)) > X_HEIGHT;
  const ordered = [
    ...contours.filter((c) => !isAccent(c)),
    ...contours.filter(isAccent),
  ];

  for (const contour of ordered) {
    const stroke = toPathData(contour, penX);
    if (stroke.length >= MIN_STROKE_LENGTH) strokes.push(stroke);
  }
  penX += advance;
}

const PAD = 60; // room for the stroke's round caps
const viewBox = [
  -PAD,
  -PAD,
  round(penX + PAD * 2),
  round(ASCENDER - DESCENDER + PAD * 2),
].join(' ');

const totalLength = strokes.reduce((sum, s) => sum + s.length, 0);

const file = `// GENERATED by scripts/build-handwriting.mjs — do not edit by hand.
//
// Single-stroke centrelines derived from Mistral SingleLine
// (https://github.com/isdat-type/Mistral-SingleLine), SIL Open Font License
// 1.1. Open contours, so animating stroke-dashoffset draws them the way they
// would be written rather than tracing around a glyph outline.

export interface HandwritingStroke {
  /** SVG path data for one pen-down stroke. */
  d: string;
  /** Share of the whole word's ink, 0-1. Used to time each stroke. */
  share: number;
}

export interface Handwriting {
  text: string;
  viewBox: string;
  strokes: HandwritingStroke[];
}

export const handwrittenHandle: Handwriting = {
  text: ${JSON.stringify(TEXT)},
  viewBox: '${viewBox}',
  strokes: [
${strokes
  .map(
    (s) =>
      `    { d: '${s.d}', share: ${Math.round((s.length / totalLength) * 10000) / 10000} },`
  )
  .join('\n')}
  ],
};
`;

mkdirSync(path.dirname(OUT), { recursive: true });
writeFileSync(OUT, file);
console.log(
  `${TEXT} → ${strokes.length} strokes, viewBox "${viewBox}", written to ${path.relative(process.cwd(), OUT)}`
);
