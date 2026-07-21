import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import OrderTableRow from './OrderTableRow';
import './OrderTable.css';

const COLUMNS = ['Order ID', 'Customer', 'Destination', 'Plan', 'Usage', 'Live status', 'Order status', ''];

/**
 * src/features/orders/OrderTable.jsx
 *
 * Renders the admin order list as a table on wide viewports and a stacked
 * card list below ~720px (see OrderTable.css — pure CSS via each cell's
 * data-label attribute, no separate mobile markup). Falls back to
 * ui/EmptyState when there are no results, and offers basic prev/next
 * pagination driven off `meta`.
 *
 * @param {{
 *   items: Array<object>,
 *   meta: { total: number, page: number, pageSize: number },
 *   onPageChange: (page: number) => void,
 * }} props
 */
export default function OrderTable({ items, meta, onPageChange }) {
  const { total = 0, page = 1, pageSize = 20 } = meta || {};
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  if (!items || items.length === 0) {
    return (
      <EmptyState
        icon="🧾"
        message="No orders match these filters yet."
        actionLabel="+ New Order"
        actionTo="/dashboard/orders/new"
      />
    );
  }

  return (
    <div className="ck-order-table">
      <Card className="ck-order-table__card">
        <div className="ck-order-table__scroll">
          <table className="ck-order-table__table">
            <thead>
              <tr>
                {COLUMNS.map((column) => (
                  <th key={column || 'actions'}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((order, index) => (
                <OrderTableRow key={order.id} order={order} striped={index % 2 === 1} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="ck-order-table__pagination">
        <span className="ck-order-table__count">
          {total} order{total === 1 ? '' : 's'} — page {page} of {totalPages}
        </span>
        <div className="ck-order-table__pager-btns">
          <Button
            variant="ghost"
            size="sm"
            disabled={!hasPrev}
            onClick={() => onPageChange?.(page - 1)}
          >
            ← Prev
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!hasNext}
            onClick={() => onPageChange?.(page + 1)}
          >
            Next →
          </Button>
        </div>
      </div>
    </div>
  );
}
