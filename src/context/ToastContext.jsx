import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback((message, type = 'info', placement = 'global') => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, message, type, placement }]);
    window.setTimeout(() => remove(id), placement === 'cart' ? 2200 : 4200);
  }, [remove]);

  const value = useMemo(
    () => ({
      success: (message) => push(message, 'success'),
      error: (message) => push(message, 'error'),
      info: (message) => push(message, 'info'),
      cart: (message) => push(message, 'success', 'cart'),
      cartToasts: toasts.filter((toast) => toast.placement === 'cart'),
    }),
    [push, toasts]
  );

  const globalToasts = toasts.filter((toast) => toast.placement !== 'cart');

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[80] flex w-[min(92vw,360px)] flex-col gap-2">
        {globalToasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`rounded-xl px-4 py-3 text-sm shadow-lg ${
              toast.type === 'error'
                ? 'bg-red-700 text-white'
                : toast.type === 'success'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-stone-900 text-white'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function CartToastSlot() {
  const { cartToasts } = useToast();
  if (cartToasts.length === 0) return null;

  return (
    <div className="pointer-events-none absolute right-0 top-[calc(100%+0.4rem)] z-[90] w-52">
      {cartToasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="cart-toast relative rounded-2xl bg-ink px-3 py-2 text-xs font-medium text-white shadow-xl"
        >
          <span className="absolute -top-1.5 right-4 h-3 w-3 rotate-45 bg-ink" />
          {toast.message}
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
