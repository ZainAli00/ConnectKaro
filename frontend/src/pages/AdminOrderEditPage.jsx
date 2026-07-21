import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { OrdersIcon } from '../components/ui/Icons';
import OrderForm from '../features/orders/OrderForm';
import { useOrder } from '../features/orders/useOrders';
import { useAuth } from '../features/auth/useAuth';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import './AdminOrderEditPage.css';

/**
 * src/pages/AdminOrderEditPage.jsx
 *
 * `/dashboard/orders/:id/edit` — OrderForm in edit mode, pre-filled from
 * useOrder(id). ICCID stays read-only inside OrderForm (immutable after
 * creation); on a successful save, navigates back to the detail page.
 */
export default function AdminOrderEditPage() {
  const { id } = useParams();
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const { order, isLoading, error, updateOrder } = useOrder(id);

  useDocumentTitle(
    order ? `Edit ${order.orderId} — connectkro.pk Admin` : 'Edit order — connectkro.pk Admin',
  );

  async function handleLogout() {
    await logout();
    navigate('/dashboard/login');
  }

  return (
    <AdminLayout title="Edit order" adminEmail={admin?.email} onLogout={handleLogout}>
      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <Spinner label="Loading order" />
        </div>
      )}

      {!isLoading && (error || !order) && (
        <EmptyState
          icon="🔍"
          message={error || 'Order not found.'}
          actionLabel="Back to orders"
          actionTo="/dashboard/orders"
        />
      )}

      {!isLoading && order && (
        <div className="ck-order-edit">
          <Card className="ck-order-edit__card">
            <div className="ck-order-edit__heading">
              <span className="ck-order-edit__heading-icon">
                <OrdersIcon width={20} height={20} />
              </span>
              <div>
                <h2 className="ck-order-edit__heading-title">Edit order</h2>
                <p className="ck-order-edit__heading-subtitle mono">{order.orderId}</p>
              </div>
            </div>
            <OrderForm
              mode="edit"
              initialValues={order}
              onSubmit={updateOrder}
              onSuccess={() => navigate(`/dashboard/orders/${order.id}`)}
            />
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
