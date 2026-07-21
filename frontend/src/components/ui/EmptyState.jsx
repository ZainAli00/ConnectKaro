import Button from './Button';
import './EmptyState.css';

export default function EmptyState({
  icon = '📭',
  message,
  actionLabel,
  onAction,
  actionTo,
}) {
  const showAction = Boolean(actionLabel && (onAction || actionTo));

  return (
    <div className="ck-empty">
      <div className="ck-empty__icon" aria-hidden="true">{icon}</div>
      <p className="ck-empty__message">{message}</p>
      {showAction && (
        <Button variant="mint" size="sm" onClick={onAction} to={actionTo}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
