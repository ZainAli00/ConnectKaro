import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import StatsCards from '../features/dashboard/StatsCards';
import RecentOrdersList from '../features/dashboard/RecentOrdersList';
import DestinationBarChart from '../components/dataviz/DestinationBarChart';
import { useStats } from '../features/dashboard/useStats';
import { useAuth } from '../features/auth/useAuth';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import './AdminDashboardPage.css';

/**
 * src/pages/AdminDashboardPage.jsx
 *
 * `/dashboard` — the admin home. Wires useStats() into StatsCards +
 * RecentOrdersList inside AdminLayout.
 */
export default function AdminDashboardPage() {
  useDocumentTitle('Dashboard — connectkro.pk Admin');

  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const { stats, isLoading, error } = useStats();

  async function handleLogout() {
    await logout();
    navigate('/dashboard/login');
  }

  return (
    <AdminLayout title="Dashboard" adminEmail={admin?.email} onLogout={handleLogout}>
      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <Spinner label="Loading dashboard" />
        </div>
      )}

      {!isLoading && error && <EmptyState icon="⚠️" message={error} />}

      {!isLoading && !error && (
        <div className="ck-admin-dashboard">
          <StatsCards stats={stats} />
          <div className="ck-admin-dashboard__grid">
            <DestinationBarChart data={stats?.ordersByDestination} />
            <RecentOrdersList orders={stats?.recentOrders} />
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
