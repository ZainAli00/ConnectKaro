import { clampPercent } from '../../utils/formatUsage';
import './UsageMeter.css';

const VALID_TONES = new Set(['good', 'warning', 'critical']);

/**
 * src/components/dataviz/UsageMeter.jsx
 *
 * A linear "same-ramp" usage meter — per the project's dataviz skill this is
 * a single horizontal, fully-rounded bar (NOT a ring, NOT a pie/donut).
 * Track = a lighter step of the same hue as the fill (--status-{tone}-soft
 * vs --status-{tone}), so state reads across the whole bar rather than a
 * fixed gray track. Single value/series, so no legend.
 *
 * `tone` is computed entirely by the caller (see UsageResultCard) — this
 * component has no domain/status knowledge, only the three dataviz tones,
 * so it stays a dumb, reusable presentational piece.
 *
 * The numeric value label is rendered here, beside the bar, in normal
 * text-ink color (never tinted with the status hue) — identity comes from
 * the colored bar, not colored text.
 *
 * @param {{
 *   percentRemaining: number,
 *   tone?: 'good' | 'warning' | 'critical',
 *   ariaLabel?: string,
 * }} props
 */
export default function UsageMeter({ percentRemaining, tone = 'good', ariaLabel }) {
  const safeTone = VALID_TONES.has(tone) ? tone : 'good';
  const percent = clampPercent(percentRemaining);

  return (
    <div className="ck-usage-meter">
      <div
        className={`ck-usage-meter__track ck-usage-meter__track--${safeTone}`}
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel}
      >
        <div className="ck-usage-meter__fill" style={{ width: `${percent}%` }} />
      </div>
      <span className="ck-usage-meter__value" aria-hidden="true">
        {percent}%
      </span>
    </div>
  );
}
