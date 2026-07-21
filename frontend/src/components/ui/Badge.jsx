import './Badge.css';

const TONE_CLASS = {
  good: 'ck-badge--good',
  warning: 'ck-badge--warning',
  critical: 'ck-badge--critical',
  neutral: 'ck-badge--neutral',
};

/**
 * Small status pill. Status is always paired with visible text (the
 * required `label` prop) — never color-only — per accessibility practice.
 */
export default function Badge({ tone = 'neutral', label, className = '', ...rest }) {
  return (
    <span
      className={['ck-badge', TONE_CLASS[tone] || TONE_CLASS.neutral, className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {label}
    </span>
  );
}
