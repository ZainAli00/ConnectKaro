import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { formatExpiry } from '../../utils/formatDate';
import './RecentOrdersList.css';

/**
 * src/features/dashboard/RecentOrdersList.jsx
 *
 * The 5 most recent orders from GET /api/admin/stats, each linking through
 * to its detail page. Purely presentational — AdminDashboardPage supplies
 * the array via useStats().
 *
 * @param {{ orders: Array<{id:string,orderId:string,customerName:string,destinationLabel:string,planLabel:string,createdAt:string}> }} props
 */
export default function RecentOrdersList({ orders }) {
  const hasOrders = Array.isArray(orders) && orders.length > 0;

  return (
    <Card className="ck-recent-orders">
      <h3 className="ck-recent-orders__title">Recent orders</h3>

      {!hasOrders && (
        <EmptyState icon="🧾" message="No orders yet — create the first one to see it here." />
      )}

      {hasOrders && (
        <ul className="ck-recent-orders__list">
          {orders.map((order) => (
            <li key={order.id}>
              <Link to={`/dashboard/orders/${order.id}`} className="ck-recent-orders__row">
                <span className="mono ck-recent-orders__order-id">{order.orderId}</span>
                <span className="ck-recent-orders__customer">{order.customerName}</span>
                <span className="ck-recent-orders__meta">
                  {order.destinationLabel} · {order.planLabel}
                </span>
                <span className="ck-recent-orders__date">{formatExpiry(order.createdAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
