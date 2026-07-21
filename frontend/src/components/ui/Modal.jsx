import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

/**
 * Minimal accessible dialog. Focus trapping is not implemented (not
 * required for MVP) but it does support Escape-to-close, backdrop-click
 * to close, and moves focus into the dialog on open.
 */
export default function Modal({ open, onClose, title, children, footer }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    document.addEventListener('keydown', handleKeyDown);
    dialogRef.current?.focus();

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="ck-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        className="ck-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={dialogRef}
      >
        {title && (
          <div className="ck-modal__header">
            <h3 className="ck-modal__title">{title}</h3>
            <button
              type="button"
              className="ck-modal__close"
              onClick={onClose}
              aria-label="Close dialog"
            >
              ✕
            </button>
          </div>
        )}
        <div className="ck-modal__body">{children}</div>
        {footer && <div className="ck-modal__footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
