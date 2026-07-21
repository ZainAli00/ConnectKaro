import { useState } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import './LookupForm.css';

const FORMAT_HINT = 'Order IDs usually start with "CK-" (e.g. CK-7F3K9QM) — double check yours if this looks different.';

/**
 * src/features/publicLookup/LookupForm.jsx
 *
 * Customer-facing entry point: a single Order ID field + submit inside a
 * Card. Purely presentational/controlled — calls onSubmit(orderId) and
 * lets the page own loading/error/result state via useLookupOrder.
 *
 * @param {{ onSubmit: (orderId: string) => void, isSubmitting?: boolean }} props
 */
export default function LookupForm({ onSubmit, isSubmitting = false }) {
  const [orderId, setOrderId] = useState('');

  const trimmed = orderId.trim();
  const showFormatHint = trimmed.length > 0 && !trimmed.toUpperCase().startsWith('CK-');

  function handleSubmit(event) {
    event.preventDefault();
    if (!trimmed) return;
    onSubmit?.(trimmed);
  }

  return (
    <Card className="ck-lookup-form__card">
      <div className="ck-lookup-form__heading">
        <h1 className="ck-lookup-form__title">Check your eSIM usage</h1>
        <p className="ck-lookup-form__subtitle">
          Enter the Order ID from your connectkro.pk confirmation to see your remaining data.
        </p>
      </div>

      <form className="ck-lookup-form" onSubmit={handleSubmit} noValidate>
        <Input
          label="Order ID"
          name="orderId"
          placeholder="e.g. CK-7F3K9QM"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck="false"
          value={orderId}
          onChange={(event) => setOrderId(event.target.value)}
          required
        />

        {showFormatHint && <p className="ck-lookup-form__hint">{FORMAT_HINT}</p>}

        <Button
          type="submit"
          variant="mint"
          size="lg"
          className="ck-lookup-form__submit"
          disabled={isSubmitting || !trimmed}
        >
          {isSubmitting ? 'Checking…' : 'Check usage'}
        </Button>
      </form>
    </Card>
  );
}
