import { useEffect, useState } from 'react';

/**
 * Physics Confidence Slider. Drives the global --confidence custom property
 * (0 = KNOWN, 1 = UNKNOWN) which the starfield, hero grid, and this panel read.
 * Text morphs from assertion -> inference -> open question. Touch + keyboard
 * friendly (native range input).
 */
const STATEMENTS = [
  {
    known: 'We know the interior structure of a neutron star.',
    inferred: 'We infer the interior structure from exterior observations.',
    unknown: 'We do not yet know what the deepest core is made of.',
  },
  {
    known: 'Matter is built from the particles in the Standard Model.',
    inferred: 'Matter may rearrange into exotic phases under extreme pressure.',
    unknown: 'There may be stable matter no laboratory has ever touched.',
  },
  {
    known: 'General relativity describes gravity completely.',
    inferred: 'General relativity holds in every regime we have tested.',
    unknown: 'It stops giving complete answers at singularities.',
  },
];

function phase(v: number): 'known' | 'inferred' | 'unknown' {
  if (v < 0.34) return 'known';
  if (v < 0.67) return 'inferred';
  return 'unknown';
}

const PHASE_META = {
  known: { label: 'KNOWN', color: '#4f9cff' },
  inferred: { label: 'INFERRED', color: '#34d3c0' },
  unknown: { label: 'UNKNOWN', color: '#ffb454' },
};

export default function ConfidenceSlider() {
  const [v, setV] = useState(0.5);

  useEffect(() => {
    document.documentElement.style.setProperty('--confidence', v.toString());
  }, [v]);

  const p = phase(v);
  const meta = PHASE_META[p];

  return (
    <div className="glass rounded-3xl p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-display text-xl font-semibold text-paper">Physics Confidence Slider</h3>
        <span
          className="rounded-full border px-3 py-1 font-mono text-xs tracking-widest"
          style={{ borderColor: `${meta.color}66`, color: meta.color, background: `${meta.color}14` }}
        >
          {meta.label}
        </span>
      </div>

      <div className="mb-6 space-y-3">
        {STATEMENTS.map((s, i) => (
          <p
            key={i}
            className="rounded-lg border border-line bg-white/[0.02] px-4 py-3 text-paper/90 transition-all duration-500"
            style={{ borderLeftColor: meta.color, borderLeftWidth: 3 }}
          >
            {s[p]}
          </p>
        ))}
      </div>

      <div className="relative">
        <div className="mb-2 flex justify-between font-mono text-xs text-muted">
          <span>KNOWN</span>
          <span>UNKNOWN</span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={v}
          onChange={(e) => setV(parseFloat(e.target.value))}
          aria-label="Physics confidence, from known to unknown"
          className="conf-range w-full"
          style={{ accentColor: meta.color }}
        />
        <p className="mt-4 text-sm text-muted">
          Slide toward <span style={{ color: '#4f9cff' }}>Known</span> for what we have measured.
          Slide toward <span style={{ color: '#ffb454' }}>Unknown</span> and the language, and the universe,
          gets more honest about what we are still working out.
        </p>
      </div>
    </div>
  );
}
