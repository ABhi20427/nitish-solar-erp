'use client';

import React from 'react';
import { ToastMessage } from '@/hooks/use-toast';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { clsx } from 'clsx';

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}) {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
          error: <XCircle className="w-5 h-5 text-rose-600 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
          info: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
        };

        const bg = {
          success: 'bg-emerald-50 border-emerald-200 text-emerald-950',
          error: 'bg-rose-50 border-rose-200 text-rose-950',
          warning: 'bg-amber-50 border-amber-200 text-amber-950',
          info: 'bg-sky-50 border-sky-200 text-sky-950',
        };

        return (
          <div
            key={toast.id}
            className={clsx(
              'p-4 rounded-xl border shadow-xl flex items-start gap-3 text-xs animate-fade-in',
              bg[toast.type]
            )}
          >
            {icons[toast.type]}
            <div className="flex-1 space-y-0.5">
              <h5 className="font-bold">{toast.title}</h5>
              {toast.description && <p className="opacity-80">{toast.description}</p>}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded hover:bg-black/5 text-slate-500"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
