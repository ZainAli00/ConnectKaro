import { Link } from 'react-router-dom';
import './Logo.css';

/**
 * Small wordmark ("connect**kro**") matching connectkro.html's .logo
 * styling. Shared by PublicLayout and the admin Sidebar so both shells
 * render an identical brand mark.
 *
 * `external`: this app only owns /check-usage and /dashboard/* — the
 * marketing site at "/" is a separate static page (connectkro.html), not a
 * client-side route, so linking back to it needs a real <a> (full page
 * load), not a React Router <Link> (which would just hit the in-app 404).
 */
export default function Logo({ to = '/', external = false, className = '' }) {
  const classes = ['ck-logo', className].filter(Boolean).join(' ');
  if (external) {
    return (
      <a href={to} className={classes}>
        connect<b>kro</b>
      </a>
    );
  }
  return (
    <Link to={to} className={classes}>
      connect<b>kro</b>
    </Link>
  );
}
