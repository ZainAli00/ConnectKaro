import { useNavigate } from 'react-router-dom';
import Logo from '../components/ui/Logo';
import ThemeToggle from '../components/ui/ThemeToggle';
import EsimCardVisual from '../components/ui/EsimCardVisual';
import LoginForm from '../features/auth/LoginForm';
import './AdminLoginPage.css';

/**
 * src/pages/AdminLoginPage.jsx
 *
 * /dashboard/login — a branded split panel rather than a bare centered card:
 * left panel carries the connectkro brand (dark gradient + a decorative
 * eSIM card, reusing the marketing site's visual language), right panel
 * holds the actual sign-in form. Collapses to a single column on mobile.
 */
export default function AdminLoginPage() {
  const navigate = useNavigate();

  return (
    <div className="ck-admin-login">
      <aside className="ck-admin-login__brand">
        <div className="ck-admin-login__glow" aria-hidden="true" />
        <div className="ck-admin-login__brand-in">
          <Logo to="/dashboard" className="ck-admin-login__logo" />

          <EsimCardVisual label="connectkro · admin" className="ck-admin-login__esim-card" />

          <div className="ck-admin-login__pitch">
            <h1>Run the whole fleet from one screen.</h1>
            <p>Create orders, watch live usage, and keep every customer's eSIM one Order ID away.</p>
          </div>
        </div>
      </aside>

      <main className="ck-admin-login__panel">
        <div className="ck-admin-login__panel-top">
          <ThemeToggle />
        </div>

        <div className="ck-admin-login__form-wrap">
          <div className="ck-admin-login__heading">
            <h2 className="ck-admin-login__title">Admin sign in</h2>
            <p className="ck-admin-login__subtitle">Manage orders and eSIM usage for connectkro.pk.</p>
          </div>
          <LoginForm onSuccess={() => navigate('/dashboard')} />
        </div>

        <p className="ck-admin-login__footnote">© {new Date().getFullYear()} connectkro.pk</p>
      </main>
    </div>
  );
}
