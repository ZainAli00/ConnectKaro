import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import Card from '../components/ui/Card';
import { PlusCircleIcon, PackageIcon, SignalIcon, ChevronRightIcon } from '../components/ui/Icons';
import OrderForm from '../features/orders/OrderForm';
import { useCreateOrder } from '../features/orders/useOrders';
import { useAuth } from '../features/auth/useAuth';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import './AdminNewOrderPage.css';

const STEPS = [
  {
    Icon: PlusCircleIcon,
    title: 'You provision the eSIM',
    body: 'Generate the line in your eSIM supplier account first, and grab its ICCID.',
  },
  {
    Icon: PackageIcon,
    title: 'Fill in the details here',
    body: 'ICCID, customer, destination and plan — connectkro generates a fresh Order ID automatically.',
  },
  {
    Icon: SignalIcon,
    title: 'Hand the Order ID to the customer',
    body: 'They paste it into the public usage checker any time — no ICCID or account needed on their end.',
  },
];

/**
 * src/pages/AdminNewOrderPage.jsx
 *
 * `/dashboard/orders/new` — OrderForm in create mode, centered alongside a
 * "what happens next" explainer panel. On success, OrderForm itself shows
 * the server-generated Order ID (copyable) — this page just supplies the
 * createOrder mutation.
 */
export default function AdminNewOrderPage() {
  useDocumentTitle('New Order — connectkro.pk Admin');

  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const { createOrder } = useCreateOrder();

  async function handleLogout() {
    await logout();
    navigate('/dashboard/login');
  }

  return (
    <AdminLayout title="New Order" adminEmail={admin?.email} onLogout={handleLogout}>
      <div className="ck-new-order">
        <Card className="ck-new-order__card">
          <div className="ck-new-order__heading">
            <span className="ck-new-order__heading-icon">
              <PlusCircleIcon width={22} height={22} />
            </span>
            <div>
              <h2 className="ck-new-order__heading-title">Order details</h2>
              <p className="ck-new-order__heading-subtitle">
                Link a provisioned eSIM to a customer and generate their Order ID.
              </p>
            </div>
          </div>
          <OrderForm mode="create" onSubmit={createOrder} />
        </Card>

        <Card className="ck-new-order__steps">
          <h3 className="ck-new-order__steps-title">What happens next</h3>
          <ol className="ck-new-order__steps-list">
            {STEPS.map(({ Icon, title, body }, index) => (
              <li key={title} className="ck-new-order__step">
                <span className="ck-new-order__step-icon">
                  <Icon width={18} height={18} />
                </span>
                <div>
                  <p className="ck-new-order__step-title">
                    {index + 1}. {title}
                  </p>
                  <p className="ck-new-order__step-body">{body}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link className="ck-new-order__steps-link" to="/dashboard/orders">
            View all orders <ChevronRightIcon width={15} height={15} />
          </Link>
        </Card>
      </div>
    </AdminLayout>
  );
}
