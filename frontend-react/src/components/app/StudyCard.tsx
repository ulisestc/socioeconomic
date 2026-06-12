import { ArrowRight, FileText } from 'lucide-react';

import { cn } from '@/lib/utils';

type Status = 'PENDING' | 'FILLED' | 'APPROVED' | 'REJECTED';

const LABEL: Record<Status, string> = {
  PENDING: 'Por llenar',
  FILLED: 'En revisión',
  APPROVED: 'Aprobado',
  REJECTED: 'Por corregir',
};
const BADGE: Record<Status, string> = {
  PENDING: 'ses-badge-pending',
  FILLED: 'ses-badge-filled',
  APPROVED: 'ses-badge-approved',
  REJECTED: 'ses-badge-rejected',
};

interface StudyCardProps {
  title: string;
  subtitle: string;
  status: Status;
  actionLabel: string;
  onAction: () => void;
}

/** Tarjeta-fila de estudio (port de study-card.component.ts). */
export function StudyCard({ title, subtitle, status, actionLabel, onAction }: StudyCardProps) {
  return (
    <button
      type="button"
      onClick={onAction}
      className={cn(
        'group flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md',
        (status === 'REJECTED' || status === 'APPROVED') && 'border-l-4',
        status === 'REJECTED' && 'border-l-destructive',
        status === 'APPROVED' && 'border-l-primary',
      )}
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <FileText className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-foreground">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <span className={cn('ses-badge', BADGE[status])}>{LABEL[status]}</span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-90 group-hover:opacity-100">
          {actionLabel}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  );
}
