import { useEffect, useRef } from 'react';

/**
 * Lightweight canvas starfield + drifting particle field. Fixed, behind all
 * content. Cheap on purpose: a few hundred points, no WebGL, capped DPR.
 * Honors prefers-reduced-motion (renders a single static frame) and reads the
 * global --confidence custom property so the field deepens toward UNKNOWN.
 */
export default function StarfieldBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;

    type Star = { x: number; y: number; z: number; r: number; tw: number };
    let stars: Star[] = [];

    const STAR_COUNT = () => {
      const area = (window.innerWidth * window.innerHeight) / 1000;
      return Math.min(420, Math.max(120, Math.floor(area / 4)));
    };

    function seed() {
      const n = STAR_COUNT();
      stars = Array.from({ length: n }, () => ({
        x: Math.random(),
        y: Math.random(),
        z: Math.random(),
        r: Math.random() * 1.3 + 0.2,
        tw: Math.random() * Math.PI * 2,
      }));
    }

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function confidence(): number {
      const v = getComputedStyle(document.documentElement).getPropertyValue('--confidence');
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : 0.5;
    }

    function draw(t: number) {
      const conf = confidence();
      ctx.clearRect(0, 0, w, h);

      // Deepening vignette toward UNKNOWN
      const grd = ctx.createRadialGradient(w / 2, h * 0.4, 0, w / 2, h * 0.4, Math.max(w, h));
      grd.addColorStop(0, `rgba(10,16,32,${0.0 + conf * 0.15})`);
      grd.addColorStop(1, `rgba(2,3,8,${0.55 + conf * 0.35})`);
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);

      for (const s of stars) {
        const drift = reduced ? 0 : (t * 0.000004 * (0.3 + s.z));
        const px = ((s.x + drift) % 1) * w;
        const py = s.y * h;
        const twinkle = reduced ? 0.7 : 0.55 + 0.45 * Math.sin(t * 0.001 * (0.5 + s.z) + s.tw);
        const alpha = (0.25 + s.z * 0.6) * twinkle * (1 - conf * 0.25);
        // bluer toward known, violet toward unknown
        const g = 156 + conf * 20;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${120 + conf * 30},${g},255,${alpha})`;
        ctx.arc(px, py, s.r * (0.8 + s.z), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function loop(t: number) {
      draw(t);
      raf = requestAnimationFrame(loop);
    }

    resize();
    seed();
    if (reduced) {
      draw(0);
    } else {
      raf = requestAnimationFrame(loop);
    }

    const onResize = () => {
      resize();
      seed();
      if (reduced) draw(0);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  );
}
