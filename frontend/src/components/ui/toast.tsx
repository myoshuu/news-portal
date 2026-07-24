import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, XCircle, Info, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "primary";
  icon?: React.ReactNode;
  onConfirm: () => void | Promise<void>;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (type: ToastType, title: string, description?: string, duration?: number) => void;
  removeToast: (id: string) => void;
  showConfirm: (options: ConfirmOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

type ToastListener = (type: ToastType, title: string, description?: string) => void;
type ConfirmListener = (options: ConfirmOptions) => void;

let toastListener: ToastListener | null = null;
let confirmListener: ConfirmListener | null = null;

export const toast = {
  success: (title: string, description?: string) => {
    if (toastListener) toastListener("success", title, description);
  },
  error: (title: string, description?: string) => {
    if (toastListener) toastListener("error", title, description);
  },
  warning: (title: string, description?: string) => {
    if (toastListener) toastListener("warning", title, description);
  },
  info: (title: string, description?: string) => {
    if (toastListener) toastListener("info", title, description);
  },
  confirm: (options: ConfirmOptions) => {
    if (confirmListener) confirmListener(options);
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmModal, setConfirmModal] = useState<(ConfirmOptions & { id: string }) | null>(null);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, title: string, description?: string, duration = 3500) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev.slice(-4), { id, type, title, description, duration }]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const showConfirm = useCallback((options: ConfirmOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    setConfirmModal({ ...options, id });
  }, []);

  React.useEffect(() => {
    toastListener = addToast;
    confirmListener = showConfirm;
    return () => {
      toastListener = null;
      confirmListener = null;
    };
  }, [addToast, showConfirm]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, showConfirm }}>
      {children}

      {/* FLOATING TOAST NOTIFICATIONS */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((item) => {
          const icons = {
            success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />,
            error: <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />,
            info: <Info className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />,
          };

          const borderColors = {
            success: "border-emerald-500/30 dark:border-emerald-500/20",
            error: "border-rose-500/30 dark:border-rose-500/20",
            warning: "border-amber-500/30 dark:border-amber-500/20",
            info: "border-sky-500/30 dark:border-sky-500/20",
          };

          return (
            <div
              key={item.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-card/95 backdrop-blur-md border shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${borderColors[item.type]}`}
            >
              {icons[item.type]}
              <div className="flex-1 space-y-0.5 pr-1">
                <p className="text-sm font-semibold text-foreground leading-snug">{item.title}</p>
                {item.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(item.id)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* THEMED CONFIRMATION MODAL DIALOG */}
      {confirmModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl shrink-0 ${confirmModal.variant === "destructive" ? "bg-destructive/10 text-destructive border border-destructive/20" : "bg-primary/10 text-primary border border-primary/20"}`}>
                {confirmModal.icon || <AlertTriangle className="w-6 h-6" />}
              </div>
              <div className="space-y-1 flex-1">
                <h4 className="font-extrabold text-xl text-foreground tracking-tight">{confirmModal.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed font-normal">
                  {confirmModal.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/40">
              <Button
                variant="outline"
                onClick={() => setConfirmModal(null)}
                className="rounded-full px-5 h-9 text-xs font-semibold hover:bg-muted"
              >
                {confirmModal.cancelText || "Batal"}
              </Button>
              <Button
                variant={confirmModal.variant === "destructive" ? "destructive" : "default"}
                onClick={async () => {
                  const cb = confirmModal.onConfirm;
                  setConfirmModal(null);
                  await cb();
                }}
                className="rounded-full px-5 h-9 text-xs font-semibold shadow-sm"
              >
                {confirmModal.confirmText || "Ya, Lanjutkan"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
