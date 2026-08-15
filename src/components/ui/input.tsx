import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        {label && (
          <label className="block text-xs font-semibold text-slate-700">
            {label} {props.required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={clsx(
              'w-full py-2 text-xs border rounded-xl bg-white text-navy-900 placeholder:text-slate-400 transition-all outline-none',
              icon ? 'pl-9 pr-3' : 'px-3',
              error
                ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                : 'border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-[10px] font-semibold text-rose-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
