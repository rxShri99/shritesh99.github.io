'use client';

import { useEffect, useRef } from 'react';
import { useControls } from 'leva';

const CIRCLE_SIZE = 50;
const CIRCLE_LERP = 0.18;

// Comet: a bright head hugging the pointer, dropping a tail of tiny glowing
// dust along its path — dense at the head, dispersing and fading with age.
const COMET_LERP = 0.35;
const MAX_PARTICLES = 1600;
// Site palette, white-heavy with a cyan accent like the reference.
const COMET_COLORS = ['#ffffff', '#ffffff', '#c9d4ff', '#9db1ff', '#8be9ff'];

interface CometParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  ttl: number;
  r: number;
  color: string;
  phase: number;
  twinkle: number;
}

/**
 * Custom cursor. Modes toggled from the Leva "Cursor" folder:
 * - comet (default): a glowing head that trails comet dust — tiny
 *   twinkling particles dropped along the pointer's path that scatter
 *   and fade like a shooting star.
 * - circle (`comet` off): the normal exclusion/blur circle.
 * Only activates for fine pointers; the native cursor is hidden via the
 * `custom-cursor` body class while active.
 */
export default function Cursor() {
  const circleRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { enabled, comet } = useControls('Cursor', {
    enabled: { value: true },
    comet: { value: true },
  });

  useEffect(() => {
    if (!enabled) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const circleNode = comet ? null : circleRef.current;
    const canvas = comet ? canvasRef.current : null;
    const ctx = canvas?.getContext('2d') ?? null;
    if (comet ? !ctx : !circleNode) return;

    const lerp = comet ? COMET_LERP : CIRCLE_LERP;
    const target = { x: -100, y: -100 };
    const pos = { x: -100, y: -100 };
    let raf = 0;
    let seen = false;

    let dpr = 1;
    const resize = () => {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    resize();
    if (canvas) window.addEventListener('resize', resize);
    const particles: CometParticle[] = [];
    let last = performance.now();

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!seen) {
        // Snap to the first position so it doesn't fly in from a corner.
        seen = true;
        pos.x = target.x;
        pos.y = target.y;
        if (circleNode) circleNode.style.opacity = '1';
      }
    };
    const onLeave = () => {
      seen = false;
      if (circleNode) circleNode.style.opacity = '0';
    };

    const tick = (now: number) => {
      const t = now / 1000;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const prevX = pos.x;
      const prevY = pos.y;
      pos.x += (target.x - pos.x) * lerp;
      pos.y += (target.y - pos.y) * lerp;

      if (!comet) {
        circleNode!.style.transform = `translate3d(${
          pos.x - CIRCLE_SIZE / 2
        }px, ${pos.y - CIRCLE_SIZE / 2}px, 0)`;
        raf = requestAnimationFrame(tick);
        return;
      }

      // Emit dust along the path segment covered this frame, so fast sweeps
      // leave a continuous tail. A trickle keeps the head shimmering at rest.
      if (seen) {
        const dx = pos.x - prevX;
        const dy = pos.y - prevY;
        const dist = Math.hypot(dx, dy);
        const count = Math.min(70, Math.round(dist * 3 + 1));
        for (let i = 0; i < count; i++) {
          const f = Math.random();
          particles.push({
            x: prevX + dx * f + (Math.random() - 0.5) * 3,
            y: prevY + dy * f + (Math.random() - 0.5) * 3,
            vx: (Math.random() - 0.5) * 65,
            vy: (Math.random() - 0.5) * 65,
            age: 0,
            ttl: 0.5 + Math.random() * 1.1,
            r: 0.5 + Math.random() * 1.3,
            color:
              COMET_COLORS[Math.floor(Math.random() * COMET_COLORS.length)],
            phase: Math.random() * Math.PI * 2,
            twinkle: 4 + Math.random() * 8,
          });
        }
        if (particles.length > MAX_PARTICLES) {
          particles.splice(0, particles.length - MAX_PARTICLES);
        }
      }

      const c = ctx!;
      c.clearRect(0, 0, canvas!.width, canvas!.height);
      c.save();
      c.scale(dpr, dpr);
      c.globalCompositeOperation = 'lighter';

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.age += dt;
        if (p.age >= p.ttl) {
          particles.splice(i, 1);
          continue;
        }
        // Gentle dispersal with a touch of drag — the old tail spreads out.
        const drag = 1 - 0.4 * dt;
        p.vx *= drag;
        p.vy *= drag;
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        const f = 1 - p.age / p.ttl;
        const sparkle = 0.7 + 0.3 * Math.sin(t * p.twinkle + p.phase);
        c.globalAlpha = f * f * sparkle;
        c.fillStyle = p.color;
        c.beginPath();
        c.arc(p.x, p.y, p.r * (0.5 + 0.5 * f), 0, Math.PI * 2);
        c.fill();
      }

      // Comet head: soft blue glow around a white-hot core, gently pulsing.
      if (seen) {
        const pulse = 1 + Math.sin(t * 3) * 0.08;
        c.globalAlpha = 1;
        const glow = c.createRadialGradient(
          pos.x,
          pos.y,
          0,
          pos.x,
          pos.y,
          16 * pulse
        );
        glow.addColorStop(0, 'rgba(155, 177, 255, 0.5)');
        glow.addColorStop(0.5, 'rgba(125, 155, 255, 0.18)');
        glow.addColorStop(1, 'rgba(125, 155, 255, 0)');
        c.fillStyle = glow;
        c.beginPath();
        c.arc(pos.x, pos.y, 16 * pulse, 0, Math.PI * 2);
        c.fill();

        const core = c.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 4);
        core.addColorStop(0, 'rgba(255, 255, 255, 1)');
        core.addColorStop(0.6, 'rgba(255, 255, 255, 0.8)');
        core.addColorStop(1, 'rgba(255, 255, 255, 0)');
        c.fillStyle = core;
        c.beginPath();
        c.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
        c.fill();
      }
      c.restore();

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener('pointermove', onMove);
    document.documentElement.addEventListener('pointerleave', onLeave);
    document.body.classList.add('custom-cursor');

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      if (canvas) window.removeEventListener('resize', resize);
      document.body.classList.remove('custom-cursor');
    };
  }, [enabled, comet]);

  if (!enabled) return null;

  if (!comet) {
    return (
      <div
        ref={circleRef}
        aria-hidden
        className="fixed top-0 left-0 z-[99999] pointer-events-none rounded-full bg-white mix-blend-exclusion backdrop-blur-[6px] blur-[20px] opacity-0 transition-opacity duration-200"
        style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="fixed inset-0 z-[99999] pointer-events-none w-full h-full"
    />
  );
}
