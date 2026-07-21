import './EsimCardVisual.css';

/**
 * src/components/ui/EsimCardVisual.jsx
 *
 * Purely decorative, ANIMATED eSIM-card graphic, echoing connectkro.html's
 * `.esim-card` (same gradient/chip/signal-bar treatment, sheen sweep and
 * signal-bar pulse) so admin login and the public lookup page carry the
 * same living brand visual, not a static form on an empty page. A second,
 * dimmer card peeks out behind it for depth ("a stack of lines"). Every
 * animation respects prefers-reduced-motion (see the CSS). `aria-hidden` —
 * this never carries real ICCID/customer data.
 *
 * @param {{ label?: string, className?: string }} props
 */
export default function EsimCardVisual({ label = 'connectkro · esim', className = '' }) {
  return (
    <div className={['ck-esim-stack', className].filter(Boolean).join(' ')} aria-hidden="true">
      <span className="ck-esim-stack__shadow" />
      <div className="ck-esim-visual">
        <span className="ck-esim-visual__chip" />
        <span className="ck-esim-visual__signal">
          <i /><i /><i /><i />
        </span>
        <p className="ck-esim-visual__name">{label}</p>
        <p className="ck-esim-visual__id mono">eSIM · 8923 01•• •••• 4471</p>
      </div>
    </div>
  );
}
