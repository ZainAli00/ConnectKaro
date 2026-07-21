import Button from '../ui/Button';
import ThemeToggle from '../ui/ThemeToggle';
import './Topbar.css';

/**
 * Admin topbar: hamburger (mobile only, toggles the Sidebar drawer via
 * onMenuClick) + page title slot + theme toggle + admin email + logout.
 */
export default function Topbar({ title, adminEmail, onLogout, onMenuClick }) {
  return (
    <header className="ck-topbar">
      <div className="ck-topbar__left">
        <button
          type="button"
          className="ck-topbar__menu-btn"
          onClick={onMenuClick}
          aria-label="Toggle navigation menu"
        >
          <span />
          <span />
          <span />
        </button>
        <h1 className="ck-topbar__title">{title}</h1>
      </div>
      <div className="ck-topbar__right">
        {adminEmail && <span className="ck-topbar__email mono">{adminEmail}</span>}
        <ThemeToggle />
        <Button variant="ghost" size="sm" onClick={onLogout}>
          Log out
        </Button>
      </div>
    </header>
  );
}
