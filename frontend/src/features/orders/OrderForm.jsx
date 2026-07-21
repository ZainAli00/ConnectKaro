import { useEffect, useState } from 'react';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/ToastProvider';
import { ORDER_STATUS_OPTIONS } from './orderStatus';
import { useDestinations } from './useDestinations';
import './OrderForm.css';

const FALLBACK_ERROR = "We couldn't reach connectkro.pk. Please check your connection and try again.";

function emptyFields(initialValues) {
  return {
    iccid: initialValues?.iccid || '',
    customerName: initialValues?.customerName || '',
    customerContact: initialValues?.customerContact || '',
    destinationCode: initialValues?.destinationCode || '',
    planLabel: initialValues?.planLabel || '',
    notes: initialValues?.notes || '',
    orderStatus: initialValues?.orderStatus || 'ACTIVE',
  };
}

/**
 * src/features/orders/OrderForm.jsx
 *
 * Shared create/edit form. `mode` controls: whether ICCID is editable,
 * whether the Order Status field appears, and what happens after a
 * successful submit (create shows a copyable Order ID; edit calls
 * `onSuccess`). The actual mutation is injected via `onSubmit` — the pages
 * pass down useOrders.js's createOrder/updateOrder — so this component
 * never imports orderService directly.
 *
 * @param {{
 *   mode: 'create' | 'edit',
 *   initialValues?: object,
 *   onSubmit: (payload: object) => Promise<object>,
 *   onSuccess?: (order: object) => void,
 * }} props
 */
export default function OrderForm({ mode = 'create', initialValues, onSubmit, onSuccess }) {
  const { showToast } = useToast();
  const { destinations } = useDestinations();

  const [fields, setFields] = useState(() => emptyFields(initialValues));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [copied, setCopied] = useState(false);

  // Re-syncs when a genuinely different order loads (edit mode fetches
  // asynchronously) — keyed on id so it never fires mid-edit on the admin's
  // own field changes.
  useEffect(() => {
    if (initialValues) setFields(emptyFields(initialValues));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues?.id]);

  function setField(name, value) {
    setFields((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const next = {};
    if (mode === 'create' && !fields.iccid.trim()) next.iccid = 'ICCID is required.';
    if (!fields.customerName.trim()) next.customerName = 'Customer name is required.';
    if (!fields.customerContact.trim()) next.customerContact = 'Customer contact is required.';
    if (!fields.destinationCode) next.destinationCode = 'Select a destination.';
    if (!fields.planLabel.trim()) next.planLabel = 'Plan label is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    const payload =
      mode === 'create'
        ? {
            iccid: fields.iccid.trim(),
            customerName: fields.customerName.trim(),
            customerContact: fields.customerContact.trim(),
            destinationCode: fields.destinationCode,
            planLabel: fields.planLabel.trim(),
            notes: fields.notes.trim() || undefined,
          }
        : {
            customerName: fields.customerName.trim(),
            customerContact: fields.customerContact.trim(),
            destinationCode: fields.destinationCode,
            planLabel: fields.planLabel.trim(),
            notes: fields.notes.trim() || undefined,
            status: fields.orderStatus,
          };

    setIsSubmitting(true);
    try {
      const result = await onSubmit(payload);
      if (mode === 'create') {
        setCreatedOrder(result);
        showToast('Order created.', 'success');
      } else {
        showToast('Order updated.', 'success');
        onSuccess?.(result);
      }
    } catch (err) {
      const message = err?.response?.data?.message || FALLBACK_ERROR;
      setSubmitError(message);
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(createdOrder.orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      showToast('Could not copy automatically — please copy it manually.', 'error');
    }
  }

  function handleCreateAnother() {
    setCreatedOrder(null);
    setFields(emptyFields());
    setErrors({});
  }

  if (mode === 'create' && createdOrder) {
    return (
      <div className="ck-order-form__success">
        <p className="ck-order-form__success-label">Order created — give this ID to the customer</p>
        <div className="ck-order-form__order-id-row">
          <span className="mono ck-order-form__order-id">{createdOrder.orderId}</span>
          <Button type="button" variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? 'Copied ✓' : 'Copy'}
          </Button>
        </div>
        <div className="ck-order-form__success-actions">
          <Button to={`/dashboard/orders/${createdOrder.id}`} variant="mint" size="sm">
            View order
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={handleCreateAnother}>
            + Create another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form className="ck-order-form" onSubmit={handleSubmit} noValidate>
      {submitError && (
        <p className="ck-order-form__error" role="alert">
          {submitError}
        </p>
      )}

      <Input
        label="ICCID"
        name="iccid"
        value={fields.iccid}
        onChange={(event) => setField('iccid', event.target.value)}
        error={errors.iccid}
        disabled={mode === 'edit'}
        className="mono"
        placeholder="89xxxxxxxxxxxxxxxxx"
      />

      <div className="ck-order-form__grid">
        <Input
          label="Customer Name"
          name="customerName"
          value={fields.customerName}
          onChange={(event) => setField('customerName', event.target.value)}
          error={errors.customerName}
        />

        <Input
          label="Customer Contact"
          name="customerContact"
          placeholder="Phone or WhatsApp number"
          value={fields.customerContact}
          onChange={(event) => setField('customerContact', event.target.value)}
          error={errors.customerContact}
        />
      </div>

      <div className="ck-order-form__grid">
        <Select
          label="Destination"
          name="destinationCode"
          value={fields.destinationCode}
          onChange={(event) => setField('destinationCode', event.target.value)}
          error={errors.destinationCode}
        >
          <option value="">Select a destination…</option>
          {destinations.map((destination) => (
            <option key={destination.code} value={destination.code}>
              {destination.flag} {destination.label}
            </option>
          ))}
        </Select>

        <Input
          label="Plan Label"
          name="planLabel"
          placeholder="e.g. 5GB / 30 days"
          value={fields.planLabel}
          onChange={(event) => setField('planLabel', event.target.value)}
          error={errors.planLabel}
        />
      </div>

      <div className="ck-field">
        <label className="ck-field__label" htmlFor="notes">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          className="ck-field__control ck-order-form__textarea"
          rows={4}
          value={fields.notes}
          onChange={(event) => setField('notes', event.target.value)}
          placeholder="Internal notes — never shown to the customer"
        />
      </div>

      {mode === 'edit' && (
        <Select
          label="Order Status"
          name="orderStatus"
          value={fields.orderStatus}
          onChange={(event) => setField('orderStatus', event.target.value)}
        >
          {ORDER_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      )}

      <Button type="submit" variant="mint" disabled={isSubmitting} className="ck-order-form__submit">
        {isSubmitting ? 'Saving…' : mode === 'create' ? 'Create order' : 'Save changes'}
      </Button>
    </form>
  );
}
