import { Routes, Route } from 'react-router-dom';
import PublicLookupPage from './pages/PublicLookupPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminNewOrderPage from './pages/AdminNewOrderPage';
import AdminOrderDetailPage from './pages/AdminOrderDetailPage';
import AdminOrderEditPage from './pages/AdminOrderEditPage';
import NotFoundPage from './pages/NotFoundPage';
import RequireAdmin from './features/auth/RequireAdmin';

/**
 * src/App.jsx
 *
 * Top-level route table. This SPA owns only /check-usage and /dashboard/* —
 * "/" itself is the separate static marketing site (connectkro.html),
 * served directly by the backend, not by this app (see backend/src/app.js).
 * All three live under the same domain/origin in production.
 *
 * Everything under `/dashboard` (except `/dashboard/login`) is nested
 * inside a layout route guarded by <RequireAdmin />, which renders an
 * <Outlet /> once an authenticated session is confirmed, or redirects to
 * /dashboard/login otherwise.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/check-usage" element={<PublicLookupPage />} />
      <Route path="/dashboard/login" element={<AdminLoginPage />} />

      <Route path="/dashboard" element={<RequireAdmin />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="orders/new" element={<AdminNewOrderPage />} />
        <Route path="orders/:id" element={<AdminOrderDetailPage />} />
        <Route path="orders/:id/edit" element={<AdminOrderEditPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
