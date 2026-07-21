import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import OrderFilters from '../features/orders/OrderFilters';
import OrderTable from '../features/orders/OrderTable';
import { useOrderList } from '../features/orders/useOrders';
import { useAuth } from '../features/auth/useAuth';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import './AdminOrdersPage.css';

/**
 * src/pages/AdminOrdersPage.jsx
 *
 * `/dashboard/orders` — search/filter/paginate every order. Hosts OrderFilters
 * + OrderTable + a "+ New Order" button linking to /dashboard/orders/new.
 */
export default function AdminOrdersPage() {
  useDocumentTitle('Orders — connectkro.pk Admin');

  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const { items, meta, isLoading, error, setFilters, setPage } = useOrderList();

  async function handleLogout() {
    await logout();
    navigate('/dashboard/login');
  }

  return (
    <AdminLayout title="Orders" adminEmail={admin?.email} onLogout={handleLogout}>
      <div className="ck-admin-orders">
        <div className="ck-admin-orders__header">
          <OrderFilters onChange={setFilters} />
          <Button to="/dashboard/orders/new" variant="mint" size="sm" className="ck-admin-orders__new-btn">
            + New Order
          </Button>
        </div>

        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <Spinner label="Loading orders" />
          </div>
        )}

        {!isLoading && error && <EmptyState icon="⚠️" message={error} />}

        {!isLoading && !error && (
          <OrderTable items={items} meta={meta} onPageChange={setPage} />
        )}
      </div>
    </AdminLayout>
  );
}
