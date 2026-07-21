import { Link } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import UsageMeter from '../../components/dataviz/UsageMeter';
import { STATUS_LABELS, STATUS_TONE } from '../../utils/constants';
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONE } from './orderStatus';

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
 * src/features/orders/OrderTableRow.jsx
 *
 * One row of the admin orders table. Presentational only — all data comes
 * from the `order` prop (see the admin order shape in useOrders.js/
 * orderService.js callers).
 *
 * @param {{ order: object, striped?: boolean }} props
 */
export default function OrderTableRow({ order, striped = false }) {
  const usageTone = STATUS_TONE[order.status] || STATUS_TONE.unknown;
  const usageLabel = STATUS_LABELS[order.status] || STATUS_LABELS.unknown;
  const orderStatusTone = ORDER_STATUS_TONE[order.orderStatus] || 'neutral';
  const orderStatusLabel = ORDER_STATUS_LABELS[order.orderStatus] || order.orderStatus;

  return (
    <tr className={['ck-order-row', striped ? 'ck-order-row--striped' : ''].filter(Boolean).join(' ')}>
      <td data-label="Order ID">
        <span className="mono ck-order-row__order-id">{order.orderId}</span>
      </td>
      <td data-label="Customer">{order.customerName}</td>
      <td data-label="Destination">{order.destinationLabel}</td>
      <td data-label="Plan">{order.planLabel}</td>
      <td data-label="Usage" className="ck-order-row__usage-cell">
        <UsageMeter
          percentRemaining={order.percentRemaining}
          tone={toMeterTone(usageTone)}
          ariaLabel={`Data remaining for ${order.orderId}`}
        />
      </td>
      <td data-label="Live status">
        <Badge tone={usageTone} label={usageLabel} />
      </td>
      <td data-label="Order status">
        <Badge tone={orderStatusTone} label={orderStatusLabel} />
      </td>
      <td data-label="" className="ck-order-row__actions">
        <Link to={`/dashboard/orders/${order.id}`} className="ck-order-row__view">
          View
        </Link>
      </td>
    </tr>
  );
}
