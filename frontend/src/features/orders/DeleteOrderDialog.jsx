import { useState } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/ToastProvider';
import { remove as removeOrder } from '../../services/orderService';

const FALLBACK_ERROR = "Couldn't delete this order — please try again.";

/**
 * src/features/orders/DeleteOrderDialog.jsx
 *
 * Confirms a soft-delete before calling orderService.remove(id) directly —
 * self-contained the same way LoginForm.jsx owns its own auth mutation,
 * rather than routing through useOrders.js. Always names the order's
 * customer and Order ID in the confirmation copy so an admin can't
 * misclick their way into deleting the wrong one.
 *
 * @param {{ open: boolean, onClose: () => void, order: object, onDeleted: () => void }} props
 */
export default function DeleteOrderDialog({ open, onClose, order, onDeleted }) {
  const { showToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!order) return null;

  async function handleConfirm() {
    setIsDeleting(true);
    try {
      await removeOrder(order.id);
      showToast('Order deleted.', 'success');
      onDeleted?.();
    } catch (err) {
      showToast(err?.response?.data?.message || FALLBACK_ERROR, 'error');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete this order?"
      footer={
        <>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button type="button" variant="gold" size="sm" onClick={handleConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting…' : 'Delete order'}
          </Button>
        </>
      }
    >
      <p>
        This removes <strong>{order.customerName}</strong>&rsquo;s order{' '}
        <span className="mono">{order.orderId}</span> from the active list. This can&rsquo;t be
        undone from the admin UI.
      </p>
    </Modal>
  );
}
