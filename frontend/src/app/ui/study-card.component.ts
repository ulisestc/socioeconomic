import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ArrowRight, FileText } from 'lucide-angular';

type Status = 'PENDING' | 'FILLED' | 'APPROVED' | 'REJECTED';

/**
 * Tarjeta-fila de estudio (adaptación del flight-card de 21st.dev):
 * info a la izquierda, estatus + acción a la derecha. Una sola card.
 */
@Component({
  selector: 'study-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <button type="button" (click)="action.emit()"
            class="group flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            [class.border-l-4]="status === 'REJECTED' || status === 'APPROVED'"
            [ngClass]="{
              'border-l-destructive': status === 'REJECTED',
              'border-l-primary': status === 'APPROVED'
            }">
      <span class="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <lucide-icon [img]="FileTextIcon" [size]="20"></lucide-icon>
      </span>

      <div class="min-w-0 flex-1">
        <p class="truncate font-semibold text-foreground">{{ title }}</p>
        <p class="truncate text-xs text-muted-foreground">{{ subtitle }}</p>
      </div>

      <div class="flex flex-col items-end gap-1.5">
        <span class="ses-badge" [ngClass]="badgeClass">{{ statusLabel }}</span>
        <span class="inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-90 group-hover:opacity-100">
          {{ actionLabel }}
          <lucide-icon [img]="ArrowRightIcon" [size]="14"
                       class="transition-transform group-hover:translate-x-0.5"></lucide-icon>
        </span>
      </div>
    </button>
  `,
})
export class StudyCardComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() status: Status = 'PENDING';
  @Input() actionLabel = 'Abrir';
  @Output() action = new EventEmitter<void>();

  readonly ArrowRightIcon = ArrowRight;
  readonly FileTextIcon = FileText;

  private labels: Record<Status, string> = {
    PENDING: 'Por llenar',
    FILLED: 'En revisión',
    APPROVED: 'Aprobado',
    REJECTED: 'Por corregir',
  };
  private badges: Record<Status, string> = {
    PENDING: 'ses-badge-pending',
    FILLED: 'ses-badge-filled',
    APPROVED: 'ses-badge-approved',
    REJECTED: 'ses-badge-rejected',
  };

  get statusLabel() { return this.labels[this.status] ?? this.status; }
  get badgeClass() { return this.badges[this.status] ?? 'ses-badge-pending'; }
}
