import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import UsageMeter from '../../components/dataviz/UsageMeter';
import { STATUS_LABELS, STATUS_TONE } from '../../utils/constants';
import { formatGb, clampPercent } from '../../utils/formatUsage';
import { formatExpiry, formatRelativeSync } from '../../utils/formatDate';
import './UsageResultCard.css';

/**
 * UsageMeter only understands the three dataviz status tones
 * ('good' | 'warning' | 'critical'). STATUS_TONE also has a 'neutral' tone
 * (for status: 'unknown') which is a valid Badge tone but has no
 * --status-neutral token for the meter to draw from — so it's remapped to
 * 'warning' (a cautionary, not alarming, read) only for the meter's
 * fill/track colors. Badge itself still gets the real 'neutral' tone.
 */
function toMeterTone(badgeTone) {
  return badgeTone === 'good' || badgeTone === 'critical' ? badgeTone : 'warning';
}

/**
 * src/features/publicLookup/UsageResultCard.jsx
 *
 * Renders the scrubbed public lookup response shape:
 * { orderId, destinationLabel, planLabel, status, totalGb, usedGb,
 *   remainingGb, percentRemaining, expiryAt, lastSyncedAt }
 *
 * Deliberately never renders iccid/customerName/customerContact — those
 * fields don't exist on this response shape and must not be invented here.
 *
 * @param {{ order: object }} props
 */
export default function UsageResultCard({ order }) {
  const {
    destinationLabel,
    planLabel,
    status,
    totalGb,
    usedGb,
    remainingGb,
    percentRemaining,
    expiryAt,
    lastSyncedAt,
  } = order;

  const badgeTone = STATUS_TONE[status] || STATUS_TONE.unknown;
  const statusLabel = STATUS_LABELS[status] || STATUS_LABELS.unknown;
  const meterTone = toMeterTone(badgeTone);
  const percent = clampPercent(percentRemaining);

  return (
    <Card className="ck-usage-result">
      <div className="ck-usage-result__top">
        <Badge tone={badgeTone} label={statusLabel} />
        <span className="ck-usage-result__synced">{formatRelativeSync(lastSyncedAt)}</span>
      </div>

      <div className="ck-usage-result__heading">
        <h2 className="ck-usage-result__destination">{destinationLabel}</h2>
        <p className="ck-usage-result__plan">{planLabel}</p>
      </div>

      <UsageMeter percentRemaining={percent} tone={meterTone} ariaLabel="Data remaining" />

      <dl className="ck-usage-result__stats">
        <div className="ck-usage-result__stat">
          <dt>Used</dt>
          <dd>{formatGb(usedGb)}</dd>
        </div>
        <div className="ck-usage-result__stat">
          <dt>Remaining</dt>
          <dd>{formatGb(remainingGb)}</dd>
        </div>
        <div className="ck-usage-result__stat">
          <dt>Total</dt>
          <dd>{formatGb(totalGb)}</dd>
        </div>
      </dl>

      <p className="ck-usage-result__expiry">Expires: {formatExpiry(expiryAt)}</p>
    </Card>
  );
}
