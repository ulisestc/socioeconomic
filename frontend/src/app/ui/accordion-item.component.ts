import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronDown, Check } from 'lucide-angular';

/**
 * Sección colapsable (adaptación del accordion de 21st.dev).
 * Icono + título + check de completado + chevron que rota.
 * Anima la altura con el truco grid-rows-[0fr] -> [1fr].
 */
@Component({
  selector: 'accordion-item',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="overflow-hidden rounded-xl border border-border bg-card transition-shadow"
         [class.shadow-sm]="open">
      <button type="button" (click)="open = !open"
              class="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-accent/40">
        <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
              [ngClass]="complete ? 'bg-success/15 text-success' : 'bg-primary/10 text-primary'">
          <lucide-icon *ngIf="!complete && icon" [img]="icon" [size]="18"></lucide-icon>
          <lucide-icon *ngIf="complete" [img]="CheckIcon" [size]="18"></lucide-icon>
        </span>
        <span class="flex-1">
          <span class="block font-semibold text-foreground">{{ title }}</span>
          <span class="block text-xs text-muted-foreground">{{ complete ? 'Completa' : subtitle }}</span>
        </span>
        <lucide-icon [img]="ChevronDownIcon" [size]="18"
                     class="shrink-0 text-muted-foreground transition-transform duration-300"
                     [class.rotate-180]="open"></lucide-icon>
      </button>

      <div class="grid transition-[grid-template-rows] duration-300 ease-out"
           [style.gridTemplateRows]="open ? '1fr' : '0fr'">
        <div class="overflow-hidden">
          <div class="border-t border-border px-4 py-4">
            <ng-content></ng-content>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AccordionItemComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon: any;
  @Input() complete = false;
  @Input() open = false;

  readonly ChevronDownIcon = ChevronDown;
  readonly CheckIcon = Check;
}
