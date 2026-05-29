import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

export interface Station {
  order: number;
  title: string;
  id: string;
  themeColor: string;
  heroImage?: string;
  status: string;
  question: string;
  known: string;
  unknown: string;
  continueLabel: string;
}

/**
 * Observatory Mode: an immersive, full-screen guided descent through the
 * mysteries, one station at a time. Driven entirely by article `station:`
 * blocks, so new articles add stations for free.
 *
 * Accessible: focus-trapped dialog, Esc to exit, ←/→/Space to navigate,
 * body scroll locked while open, reduced-motion aware.
 */
export default function ObservatoryMode({ stations }: { stations: Station[] }) {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const reduced = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);

  const total = stations.length;
  const station = stations[i];
  const atEnd = i >= total - 1;

  const go = useCallback(
    (delta: number) => {
      setDir(delta);
      setI((prev) => Math.min(Math.max(prev + delta, 0), total - 1));
    },
    [total],
  );

  const close = useCallback(() => setOpen(false), []);
  const start = useCallback(() => {
    setI(0);
    setDir(1);
    setOpen(true);
  }, []);

  // Body scroll lock + keyboard controls while open
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        go(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, go, close]);

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: reduced ? 0 : d * 60 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: reduced ? 0 : d * -60 }),
  };

  return (
    <>
      {/* Trigger */}
      <button
        onClick={start}
        className="group inline-flex items-center gap-3 rounded-xl px-6 py-3 font-display font-semibold text-void transition-transform hover:scale-[1.03]"
        style={{ background: 'linear-gradient(90deg,#4f9cff,#7c5cff)' }}
      >
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-void/80" />
        Enter Observatory Mode
      </button>

      <AnimatePresence>
        {open && station && (
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Observatory Mode"
            tabIndex={-1}
            className="fixed inset-0 z-[100] flex flex-col bg-[#020308]/97 outline-none backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.4 }}
          >
            {/* Top bar: progress path + close */}
            <div className="flex items-center gap-4 px-5 py-4 md:px-10">
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
                Observatory
              </span>
              <ol className="flex flex-1 items-center gap-1.5" aria-hidden="true">
                {stations.map((s, idx) => (
                  <li key={s.id} className="flex-1">
                    <button
                      onClick={() => {
                        setDir(idx > i ? 1 : -1);
                        setI(idx);
                      }}
                      className="block h-1 w-full rounded-full transition-all"
                      style={{
                        background:
                          idx === i ? s.themeColor : idx < i ? `${s.themeColor}77` : 'rgba(255,255,255,0.12)',
                      }}
                      title={`Station ${String(s.order).padStart(2, '0')}`}
                      tabIndex={-1}
                    />
                  </li>
                ))}
              </ol>
              <button
                onClick={close}
                className="rounded-lg border border-line px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-paper hover:text-paper"
              >
                Exit ✕
              </button>
            </div>

            {/* Station */}
            <div className="relative flex flex-1 items-center overflow-y-auto">
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={station.id}
                  custom={dir}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: reduced ? 0 : 0.4, ease: [0.2, 0.8, 0.2, 1] }}
                  className="container-edge grid w-full gap-10 py-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center"
                >
                  {/* Left: question + known/unknown */}
                  <div>
                    <p
                      className="font-mono text-sm uppercase tracking-[0.3em]"
                      style={{ color: station.themeColor }}
                    >
                      Station {String(station.order).padStart(2, '0')} · {String(total).padStart(2, '0')}
                    </p>
                    <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-paper text-glow sm:text-4xl lg:text-5xl">
                      {station.question}
                    </h2>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                      <div className="glass rounded-2xl p-5" style={{ borderColor: `${station.themeColor}44` }}>
                        <p className="font-mono text-xs uppercase tracking-widest text-neutron">Known</p>
                        <p className="mt-2 text-sm text-paper/90">{station.known}</p>
                      </div>
                      <div className="glass rounded-2xl p-5" style={{ borderColor: '#ffb45444' }}>
                        <p className="font-mono text-xs uppercase tracking-widest text-amber">Unknown</p>
                        <p className="mt-2 text-sm text-paper/90">{station.unknown}</p>
                      </div>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center gap-4">
                      {!atEnd ? (
                        <button
                          onClick={() => go(1)}
                          className="rounded-xl px-6 py-3 font-display font-semibold text-void transition-transform hover:scale-[1.03]"
                          style={{ background: station.themeColor }}
                        >
                          {station.continueLabel} →
                        </button>
                      ) : (
                        <button
                          onClick={close}
                          className="rounded-xl bg-neutron px-6 py-3 font-display font-semibold text-void transition-transform hover:scale-[1.03]"
                        >
                          Surface from the Observatory
                        </button>
                      )}
                      <a
                        href={`/articles/${station.id}`}
                        className="rounded-xl border border-line px-5 py-3 text-sm font-semibold text-paper transition-colors hover:border-neutron hover:text-neutron"
                      >
                        {station.status === 'published' ? 'Open the full field note' : 'Field report pending'}
                      </a>
                      {i > 0 && (
                        <button onClick={() => go(-1)} className="font-mono text-xs text-muted hover:text-paper">
                          ← back
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right: visual */}
                  <div className="relative">
                    <div
                      className="img-slot aspect-[4/3] w-full overflow-hidden rounded-2xl"
                      style={{ ['--theme' as string]: station.themeColor }}
                    >
                      {station.heroImage ? (
                        <img src={station.heroImage} alt={station.title} className="!object-contain" />
                      ) : (
                        <div className="station-orb" style={{ ['--theme' as string]: station.themeColor }} />
                      )}
                    </div>
                    <p className="mt-3 text-center font-display text-sm text-muted">{station.title}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .station-orb {
          width: 46%;
          aspect-ratio: 1;
          border-radius: 50%;
          background: radial-gradient(circle at 40% 35%, #fff, var(--theme) 55%, #04060d 90%);
          box-shadow: 0 0 60px 10px var(--theme);
          opacity: 0.85;
        }
        .img-slot img.\\!object-contain { object-fit: contain; }
      `}</style>
    </>
  );
}
