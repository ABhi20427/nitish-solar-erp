import React from 'react';
import { clsx } from 'clsx';

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl border border-slate-200 shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx('p-5 border-b border-slate-100 flex items-center justify-between', className)}>
      <div>
        <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx('p-5', className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('px-5 py-3.5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between', className)}>
      {children}
    </div>
  );
}
