import React from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

export interface PipelineStage {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'upcoming';
}

const DEFAULT_STAGES: { id: string; label: string }[] = [
  { id: 'lead', label: 'Lead' },
  { id: 'customer', label: 'Customer' },
  { id: 'survey', label: 'Site Survey' },
  { id: 'quotation', label: 'Quotation' },
  { id: 'order', label: 'Order' },
  { id: 'project', label: 'Project' },
  { id: 'installation', label: 'Installation' },
  { id: 'invoice', label: 'Invoice' },
  { id: 'payment', label: 'Payment' },
];

export function PipelineStepper({ currentStageId }: { currentStageId?: string }) {
  // Find index of current stage
  const currentIdx = DEFAULT_STAGES.findIndex((s) => s.id === currentStageId?.toLowerCase()) || 0;

  return (
    <div className="w-full overflow-x-auto py-3 px-1">
      <div className="flex items-center min-w-max gap-1 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        {DEFAULT_STAGES.map((stage, idx) => {
          const isDone = idx < currentIdx;
          const isCurrent = idx === currentIdx;

          return (
            <React.Fragment key={stage.id}>
              <div
                className={clsx(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  isDone && 'bg-emerald-50 text-emerald-800 border border-emerald-200',
                  isCurrent && 'bg-navy-900 text-white shadow-sm ring-2 ring-amber-500/50',
                  !isDone && !isCurrent && 'bg-slate-50 text-slate-400 border border-slate-100'
                )}
              >
                <span
                  className={clsx(
                    'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                    isDone && 'bg-emerald-600 text-white',
                    isCurrent && 'bg-amber-500 text-navy-950 font-extrabold',
                    !isDone && !isCurrent && 'bg-slate-200 text-slate-500'
                  )}
                >
                  {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                </span>
                <span>{stage.label}</span>
              </div>
              {idx < DEFAULT_STAGES.length - 1 && (
                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
