import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import OrderDetailPanel from '../features/orders/OrderDetailPanel';
import { useOrder } from '../features/orders/useOrders';
import { useAuth } from '../features/auth/useAuth';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

/**
 * src/pages/AdminOrderDetailPage.jsx
 *
 * `/dashboard/orders/:id` — full order detail, incl. ICCID and a "Refresh usage
 * now" action. Resolves the `id` route param via useParams and hands
 * everything else to useOrder(id) + OrderDetailPanel.
 */
export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const { order, isLoading, error, isRefreshing, refreshUsage } = useOrder(id);

  useDocumentTitle(
    order ? `${order.orderId} — connectkro.pk Admin` : 'Order — connectkro.pk Admin',
  );

  async function handleLogout() {
    await logout();
    navigate('/dashboard/login');
  }

  return (
    <AdminLayout title="Order detail" adminEmail={admin?.email} onLogout={handleLogout}>
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
        <OrderDetailPanel
          order={order}
          isRefreshing={isRefreshing}
          onRefresh={refreshUsage}
          onDeleted={() => navigate('/dashboard/orders')}
        />
      )}
    </AdminLayout>
  );
}
