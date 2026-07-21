import { NavLink } from 'react-router-dom';
import Logo from '../ui/Logo';
import { DashboardIcon, OrdersIcon, PlusCircleIcon } from '../ui/Icons';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', Icon: DashboardIcon, end: true },
  { to: '/dashboard/orders', label: 'Orders', Icon: OrdersIcon },
  { to: '/dashboard/orders/new', label: 'New Order', Icon: PlusCircleIcon },
];

/**
 * Admin nav. `open` controls the mobile drawer state (collapses below
 * ~880px — see AdminLayout for the toggle + backdrop). `onNavigate` closes
 * the drawer after a link is clicked on mobile.
 */
export default function Sidebar({ open = false, onNavigate }) {
  return (
    <aside className={['ck-sidebar', open ? 'ck-sidebar--open' : ''].filter(Boolean).join(' ')}>
      <div className="ck-sidebar__brand">
        <Logo to="/dashboard" />
      </div>
      <span className="ck-sidebar__section-label">Menu</span>
      <nav className="ck-sidebar__nav" aria-label="Admin navigation">
        {NAV_ITEMS.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              ['ck-sidebar__link', isActive ? 'ck-sidebar__link--active' : '']
                .filter(Boolean)
                .join(' ')
            }
          >
            <span className="ck-sidebar__icon">
              <Icon width={19} height={19} />
            </span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="ck-sidebar__spacer" />
      <div className="ck-sidebar__foot">connectkro.pk &middot; Admin</div>
    </aside>
  );
}
