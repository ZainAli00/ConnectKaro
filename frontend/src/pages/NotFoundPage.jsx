import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import './NotFoundPage.css';

/**
 * src/pages/NotFoundPage.jsx
 *
 * `*` — catch-all route. Deliberately not wrapped in PublicLayout/
 * AdminLayout (a lost visitor may not be authenticated, and the message is
 * the same either way): a standalone centered card with a link home.
 */
export default function NotFoundPage() {
  useDocumentTitle('Page not found — connectkro.pk');

  return (
    <div className="ck-not-found">
      <Logo to="/" external />
      <p className="ck-not-found__code">404</p>
      <p className="ck-not-found__message">We couldn&rsquo;t find that page.</p>
      <Button to="/" external variant="mint" size="md">
        Back to home
      </Button>
    </div>
  );
}
