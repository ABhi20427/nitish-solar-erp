import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | 'default'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'purple'
    | 'amber'
    | 'outline';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const baseStyles =
    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors';

  const variants = {
    default: 'bg-slate-100 text-slate-800 border border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    info: 'bg-sky-50 text-sky-700 border border-sky-200',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200',
    amber: 'bg-amber-500 text-white font-bold',
    outline: 'border border-slate-300 text-slate-700 bg-white',
  };

  return (
    <span className={clsx(baseStyles, variants[variant], className)}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  let variant: BadgeProps['variant'] = 'default';

  switch (status.toUpperCase()) {
    case 'NEW':
    case 'ISSUED':
      variant = 'info';
      break;
    case 'CONTACTED':
    case 'SURVEY_SCHEDULED':
    case 'IN_PROGRESS':
    case 'SENT':
    case 'STRUCTURE_MOUNTING':
    case 'ELECTRICAL_WIRING':
      variant = 'warning';
      break;
    case 'PROPOSAL_SENT':
    case 'NEGOTIATING':
    case 'PERMITTING':
      variant = 'purple';
      break;
    case 'WON':
    case 'APPROVED':
    case 'COMPLETED':
    case 'COMMISSIONED':
    case 'PAID':
      variant = 'success';
      break;
    case 'LOST':
    case 'REJECTED':
    case 'CANCELLED':
    case 'OVERDUE':
      variant = 'danger';
      break;
    case 'URGENT':
    case 'HIGH':
      variant = 'amber';
      break;
    default:
      variant = 'default';
  }

  const formattedLabel = status.replace(/_/g, ' ');

  return <Badge variant={variant}>{formattedLabel}</Badge>;
}
