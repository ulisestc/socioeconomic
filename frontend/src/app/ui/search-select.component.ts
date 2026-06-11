import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Check, X } from 'lucide-angular';

export interface SearchOption { id: any; label: string; }

/**
 * Combobox con búsqueda (para asignar estudios: solicitante / plantilla).
 * Filtra una lista mientras escribes y permite seleccionar.
 */
@Component({
  selector: 'search-select',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="relative">
      <div class="relative">
        <lucide-icon [img]="SearchIcon" [size]="16"
                     class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></lucide-icon>
        <input class="ses-input pl-10 pr-9" [placeholder]="placeholder"
               [(ngModel)]="query" (focus)="open = true" (input)="open = true; selectedId = null">
        <button *ngIf="query" type="button" (click)="clear()"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
          <lucide-icon [img]="XIcon" [size]="16"></lucide-icon>
        </button>
      </div>

      <div *ngIf="open" class="fixed inset-0 z-30" (click)="open = false"></div>

      <div *ngIf="open"
           class="absolute z-40 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-lg">
        <button *ngFor="let opt of filtered()" type="button" (click)="pick(opt)"
                class="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-accent">
          <span class="truncate">{{ opt.label }}</span>
          <lucide-icon *ngIf="selectedId === opt.id" [img]="CheckIcon" [size]="14" class="text-foreground"></lucide-icon>
        </button>
        <p *ngIf="filtered().length === 0" class="px-3 py-4 text-center text-sm text-muted-foreground">Sin resultados.</p>
      </div>
    </div>
  `,
})
export class SearchSelectComponent {
  readonly SearchIcon = Search;
  readonly CheckIcon = Check;
  readonly XIcon = X;

  @Input() items: SearchOption[] = [];
  @Input() placeholder = 'Buscar...';
  @Output() selected = new EventEmitter<any>();

  query = '';
  open = false;
  selectedId: any = null;

  filtered(): SearchOption[] {
    const q = this.query.trim().toLowerCase();
    // Si el texto coincide exactamente con la selección, muestra todo (para volver a elegir)
    if (!q || (this.selectedId !== null)) return this.items;
    return this.items.filter(o => o.label.toLowerCase().includes(q));
  }

  pick(opt: SearchOption) {
    this.selectedId = opt.id;
    this.query = opt.label;
    this.open = false;
    this.selected.emit(opt.id);
  }

  clear() {
    this.query = '';
    this.selectedId = null;
    this.open = true;
    this.selected.emit(null);
  }
}
