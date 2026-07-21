import { createContext, useCallback, useContext, useRef, useState } from 'react';
import './Toast.css';

const ToastContext = createContext({ showToast: () => {} });

let idCounter = 0;

/**
 * Fixed-position toast stack + context. Co-locates the provider and the
 * useToast() hook in one file (same pattern allowed for ThemeProvider).
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timeouts = useRef({});

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    clearTimeout(timeouts.current[id]);
    delete timeouts.current[id];
  }, []);

  const showToast = useCallback(
    (message, type = 'info', duration = 4000) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type }]);
      timeouts.current[id] = setTimeout(() => removeToast(id), duration);
      return id;
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="ck-toast-stack" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`ck-toast ck-toast--${toast.type}`}>
            <span>{toast.message}</span>
            <button
              type="button"
              className="ck-toast__close"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
