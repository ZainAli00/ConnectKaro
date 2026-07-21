import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './AdminLayout.css';

/**
 * Composes Sidebar + Topbar + a content area. Fully responsive: below
 * ~880px the sidebar becomes a fixed drawer toggled by Topbar's hamburger,
 * with a backdrop that closes it on click.
 */
export default function AdminLayout({ title, adminEmail, onLogout, children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="ck-admin-layout">
      <Sidebar open={drawerOpen} onNavigate={() => setDrawerOpen(false)} />

      {drawerOpen && (
        <div
          className="ck-admin-layout__backdrop"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="ck-admin-layout__main">
        <Topbar
          title={title}
          adminEmail={adminEmail}
          onLogout={onLogout}
          onMenuClick={() => setDrawerOpen((prev) => !prev)}
        />
        <div className="ck-admin-layout__content">{children}</div>
      </div>
    </div>
  );
}
