import PublicLayout from '../components/layout/PublicLayout';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import EsimCardVisual from '../components/ui/EsimCardVisual';
import { PlusCircleIcon, PackageIcon, SignalIcon } from '../components/ui/Icons';
import LookupForm from '../features/publicLookup/LookupForm';
import UsageResultCard from '../features/publicLookup/UsageResultCard';
import { useLookupOrder } from '../features/publicLookup/useLookupOrder';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import './PublicLookupPage.css';

const HOW_IT_WORKS = [
  { Icon: PlusCircleIcon, title: 'Buy your eSIM', body: 'Order from connectkro like usual, over WhatsApp or Instagram.' },
  { Icon: PackageIcon, title: 'Get your Order ID', body: 'We send a short code (e.g. CK-7F3K9QM) along with your eSIM.' },
  { Icon: SignalIcon, title: 'Check anytime', body: 'Paste it above to see live data used and remaining — no account needed.' },
];

/**
 * src/pages/PublicLookupPage.jsx
 *
 * `/check-usage` — the customer-facing order lookup page. PublicLayout wrapping the
 * LookupForm; on submit, useLookupOrder().lookup runs and the result
 * (loading spinner / result card / inline error) renders below the form.
 */
export default function PublicLookupPage() {
  useDocumentTitle('Check your eSIM usage — connectkro.pk');

  const { status, data, errorMessage, lookup } = useLookupOrder();

  return (
    <PublicLayout>
      <div className="ck-public-lookup-page">
        <EsimCardVisual className="ck-public-lookup-page__visual ck-esim-visual--sm" />

        <LookupForm onSubmit={lookup} isSubmitting={status === 'loading'} />

        {status === 'loading' && (
          <div className="ck-public-lookup-page__loading">
            <Spinner label="Checking your order" />
          </div>
        )}

        {status === 'error' && <EmptyState icon="🔍" message={errorMessage} />}

        {status === 'success' && data && <UsageResultCard order={data} />}

        {status !== 'success' && (
          <div className="ck-public-lookup-page__how">
            {HOW_IT_WORKS.map(({ Icon, title, body }, index) => (
              <div key={title} className="ck-public-lookup-page__how-step">
                <span className="ck-public-lookup-page__how-icon">
                  <Icon width={18} height={18} />
                </span>
                <p className="ck-public-lookup-page__how-title">
                  {index + 1}. {title}
                </p>
                <p className="ck-public-lookup-page__how-body">{body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
