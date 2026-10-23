import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message }]);
      setTimeout(() => removeToast(id), 2500); // 2.5 second baad khud chala jaye
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* toasts ka container */}
      <div className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-[100] flex flex-col gap-3 items-end pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="toast-in pointer-events-auto flex items-center gap-3 bg-ink text-white pl-4 pr-3 py-3 rounded-2xl shadow-2xl shadow-black/30 border border-white/10 max-w-sm w-full sm:w-auto"
          >
            <CheckCircle2 size={22} className="text-sage shrink-0" />
            <p className="text-sm flex-1 line-clamp-2">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              aria-label="Close"
              className="text-white/50 hover:text-white transition"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}