import { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Check, AlertCircle } from 'lucide-react';

const ToastContext = createContext();

// Module-level counter, not state — a toast's id never needs to trigger a
// re-render on its own, it just needs to be unique.
let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  // type: 'success' | 'error'. Auto-dismisses after 3s; tapping it dismisses early.
  const showToast = useCallback((message, type = 'success') => {
    const id = ++idCounter;
    setToasts((current) => [...current, { id, message, type }]);
    setTimeout(() => dismissToast(id), 3000);
  }, [dismissToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {createPortal(
        <div className="fixed top-5 inset-x-0 z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none">
          {toasts.map((t) => (
            <div
              key={t.id}
              onClick={() => dismissToast(t.id)}
              className={`toast-slide-down pointer-events-auto flex items-center gap-2 w-full sm:w-auto max-w-sm border rounded-lg px-4 py-3 shadow-lg cursor-pointer bg-[#1A1A1A] ${
                t.type === 'error' ? 'border-red-500/50' : 'border-[#C6FF3D]/50'
              }`}
            >
              {t.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              ) : (
                <Check className="w-4 h-4 text-[#C6FF3D] shrink-0" />
              )}
              <span className="text-sm font-medium text-[#F5F5F0]">{t.message}</span>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}