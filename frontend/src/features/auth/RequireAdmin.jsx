import { Navigate, Outlet } from 'react-router-dom';
import Spinner from '../../components/ui/Spinner';
import { useAuth } from './useAuth';

/**
 * Route guard for everything under /dashboard (except /dashboard/login). Usable
 * either wrapping a single element (`<RequireAdmin><AdminPage /></RequireAdmin>`)
 * or as a layout route (`<Route element={<RequireAdmin />}>...children...</Route>`,
 * in which case it renders an <Outlet />).
 */
export default function RequireAdmin({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <Spinner size={32} label="Checking session" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/dashboard/login" replace />;
  }

  return children ?? <Outlet />;
}
