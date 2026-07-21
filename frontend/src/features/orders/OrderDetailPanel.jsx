import { useState } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import UsageMeter from '../../components/dataviz/UsageMeter';
import { useToast } from '../../components/ui/ToastProvider';
import { STATUS_LABELS, STATUS_TONE } from '../../utils/constants';
import { formatGb, clampPercent } from '../../utils/formatUsage';
import { formatExpiry, formatRelativeSync } from '../../utils/formatDate';
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONE } from './orderStatus';
import DeleteOrderDialog from './DeleteOrderDialog';
import './OrderDetailPanel.css';

const REFRESH_FALLBACK_ERROR = "Couldn't refresh usage — please try again.";

/**
 * UsageMeter only understands the three dataviz status tones
 * ('good' | 'warning' | 'critical'); STATUS_TONE also has 'neutral' (for the
 * live-usage status: 'unknown'), which is a valid Badge tone but not a valid
 * meter tone. Remapped the same way UsageResultCard does for its meter.
 */
function toMeterTone(badgeTone) {
  return badgeTone === 'good' || badgeTone === 'critical' ? badgeTone : 'warning';
}

/**
 * src/features/orders/OrderDetailPanel.jsx
 *
 * Full admin view of one order: identifying fields (incl. ICCID, which the
 * public lookup page never shows), a larger usage meter + stat block, and
 * the Edit/Delete/refresh-usage actions. Reuses the same formatting helpers
 * as UsageResultCard (formatGb/formatExpiry/formatRelativeSync) rather than
 * that component itself, since its copy ("Expires: …") is written for a
 * customer, not an admin.
 *
 * @param {{
 *   order: object,
 *   isRefreshing: boolean,
 *   onRefresh: () => Promise<object>,
 *   onDeleted: () => void,
 * }} props
 */
export default function OrderDetailPanel({ order, isRefreshing, onRefresh, onDeleted }) {
  const { showToast } = useToast();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const usageTone = STATUS_TONE[order.status] || STATUS_TONE.unknown;
  const usageLabel = STATUS_LABELS[order.status] || STATUS_LABELS.unknown;
  const orderStatusTone = ORDER_STATUS_TONE[order.orderStatus] || 'neutral';
  const orderStatusLabel = ORDER_STATUS_LABELS[order.orderStatus] || order.orderStatus;
  const percent = clampPercent(order.percentRemaining);

  async function handleRefresh() {
    try {
      await onRefresh();
      showToast('Usage refreshed.', 'success');
    } catch (err) {
      showToast(err?.response?.data?.message || REFRESH_FALLBACK_ERROR, 'error');
    }
  }

  return (
    <div className="ck-order-detail">
      <Card className="ck-order-detail__card">
        <div className="ck-order-detail__top">
          <div>
            <span className="mono ck-order-detail__order-id">{order.orderId}</span>
            <h2 className="ck-order-detail__destination">{order.destinationLabel}</h2>
            <p className="ck-order-detail__plan">{order.planLabel}</p>
          </div>
          <div className="ck-order-detail__badges">
            <Badge tone={usageTone} label={usageLabel} />
            <Badge tone={orderStatusTone} label={orderStatusLabel} />
          </div>
        </div>

        <div className="ck-order-detail__meter">
          <UsageMeter percentRemaining={percent} tone={toMeterTone(usageTone)} ariaLabel="Data remaining" />
        </div>

        <dl className="ck-order-detail__stats">
          <div className="ck-order-detail__stat">
            <dt>Used</dt>
            <dd>{formatGb(order.usedGb)}</dd>
          </div>
          <div className="ck-order-detail__stat">
            <dt>Remaining</dt>
            <dd>{formatGb(order.remainingGb)}</dd>
          </div>
          <div className="ck-order-detail__stat">
            <dt>Total</dt>
            <dd>{formatGb(order.totalGb)}</dd>
          </div>
        </dl>

        <div className="ck-order-detail__meta-row">
          <span>Expires: {formatExpiry(order.expiryAt)}</span>
          <span>{formatRelativeSync(order.lastSyncedAt)}</span>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="ck-order-detail__refresh"
        >
          {isRefreshing ? <Spinner size={16} label="Refreshing usage" /> : 'Refresh usage now'}
        </Button>
      </Card>

      <Card className="ck-order-detail__card">
        <h3 className="ck-order-detail__section-title">Order details</h3>

        <dl className="ck-order-detail__fields">
          <div>
            <dt>ICCID</dt>
            <dd className="mono">{order.iccid}</dd>
          </div>
          <div>
            <dt>Customer</dt>
            <dd>{order.customerName}</dd>
          </div>
          <div>
            <dt>Contact</dt>
            <dd>{order.customerContact}</dd>
          </div>
          <div>
            <dt>Notes</dt>
            <dd>{order.notes || '—'}</dd>
          </div>
        </dl>

        <div className="ck-order-detail__actions">
          <Button to={`/dashboard/orders/${order.id}/edit`} variant="mint" size="sm">
            Edit
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setDeleteOpen(true)}>
            Delete
          </Button>
        </div>
      </Card>

      <DeleteOrderDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        order={order}
        onDeleted={() => {
          setDeleteOpen(false);
          onDeleted?.();
        }}
      />
    </div>
  );
}
