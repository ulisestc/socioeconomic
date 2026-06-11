import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export interface TubelightItem {
  name: string;
  value: string;
  icon?: any;
  badge?: number;
}

/**
 * Navegación tipo "tubelight" (adaptación del tubelight-navbar de 21st.dev).
 * Píldoras con un "foco" superior que ilumina la pestaña activa.
 */
@Component({
  selector: 'tubelight-nav',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="inline-flex items-center gap-1 rounded-full border border-border bg-card/70 p-1 shadow-sm backdrop-blur">
      <button *ngFor="let item of items" type="button"
              (click)="select(item.value)"
              class="relative cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-colors"
              [ngClass]="active === item.value ? 'text-primary' : 'text-muted-foreground hover:text-foreground'">
        <span class="relative z-10 inline-flex items-center gap-2">
          <lucide-icon *ngIf="item.icon" [img]="item.icon" [size]="16"></lucide-icon>
          <span>{{ item.name }}</span>
          <span *ngIf="item.badge"
                class="ml-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[0.65rem] font-bold text-primary-foreground">
            {{ item.badge > 99 ? '99+' : item.badge }}
          </span>
        </span>

        <!-- píldora activa + foco superior -->
        <span *ngIf="active === item.value"
              class="absolute inset-0 -z-0 rounded-full bg-accent/70">
          <span class="absolute -top-[7px] left-1/2 h-1 w-8 -translate-x-1/2 rounded-t-full bg-primary">
            <span class="absolute -left-2 -top-2 h-6 w-12 rounded-full bg-primary/25 blur-md"></span>
            <span class="absolute -top-1 h-6 w-8 rounded-full bg-primary/20 blur-md"></span>
          </span>
        </span>
      </button>
    </div>
  `,
})
export class TubelightNavComponent {
  @Input() items: TubelightItem[] = [];
  @Input() active = '';
  @Output() activeChange = new EventEmitter<string>();

  select(value: string) {
    this.active = value;
    this.activeChange.emit(value);
  }
}
