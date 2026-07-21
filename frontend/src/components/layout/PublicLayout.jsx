import Logo from '../ui/Logo';
import ThemeToggle from '../ui/ThemeToggle';
import './PublicLayout.css';

/**
 * Minimal centered shell for customer-facing pages: wordmark + theme
 * toggle up top, children centered in the page, a small footer.
 */
export default function PublicLayout({ children }) {
  return (
    <div className="ck-public-layout">
      <div className="ck-public-layout__glow" aria-hidden="true" />
      <div className="ck-public-layout__dots" aria-hidden="true" />

      <header className="ck-public-layout__header">
        <div className="wrap ck-public-layout__header-in">
          <Logo to="/" external />
          <ThemeToggle />
        </div>
      </header>

      <main className="ck-public-layout__main">
        <div className="wrap ck-public-layout__content">{children}</div>
      </main>

      <footer className="ck-public-layout__footer">
        <div className="wrap ck-public-layout__footer-in">
          <span>© {new Date().getFullYear()} connectkro.pk</span>
          <span>Instant eSIM data, delivered in minutes.</span>
        </div>
      </footer>
    </div>
  );
}
