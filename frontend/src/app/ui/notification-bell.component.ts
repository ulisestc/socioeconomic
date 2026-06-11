import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Bell } from 'lucide-angular';
import { ApiService } from '../services/api.service';

interface Notif {
  id: number;
  applicant: string;
  template: string;
  when: string;
  unread: boolean;
}

/**
 * Campana de notificaciones para el consultor (adaptación del popover de 21st.dev).
 * Sin endpoint nuevo: deriva de getApplications() los estudios en estado FILLED
 * (enviados, pendientes de corroborar) y marca leídos en localStorage.
 */
@Component({
  selector: 'notification-bell',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="relative">
      <button type="button" (click)="toggle()" aria-label="Notificaciones"
              class="relative grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-accent">
        <lucide-icon [img]="BellIcon" [size]="18"></lucide-icon>
        <span *ngIf="unreadCount > 0"
              class="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-destructive px-1 text-[0.65rem] font-bold text-destructive-foreground">
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </button>

      <!-- backdrop para cerrar -->
      <div *ngIf="open" class="fixed inset-0 z-40" (click)="open = false"></div>

      <div *ngIf="open"
           class="absolute right-0 z-50 mt-2 w-80 origin-top-right rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg animate-in">
        <div class="flex items-baseline justify-between gap-4 px-3 py-2">
          <span class="text-sm font-semibold">Notificaciones</span>
          <button *ngIf="unreadCount > 0" (click)="markAllRead()"
                  class="text-xs font-medium text-primary hover:underline">Marcar todas como leídas</button>
        </div>
        <div class="my-1 h-px bg-border"></div>

        <div *ngFor="let n of notifs"
             (click)="markRead(n)"
             class="cursor-pointer rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent">
          <div class="relative flex items-start pe-4">
            <div class="flex-1 space-y-0.5">
              <p class="text-foreground/80">
                <span class="font-semibold text-foreground">{{ n.applicant }}</span>
                envió respuestas en
                <span class="font-semibold text-foreground">{{ n.template }}</span>
                (Folio #{{ n.id }}).
              </p>
              <p class="text-xs text-muted-foreground">{{ n.when }}</p>
            </div>
            <span *ngIf="n.unread" class="absolute end-0 top-1.5 h-2 w-2 rounded-full bg-primary"></span>
          </div>
        </div>

        <p *ngIf="notifs.length === 0" class="px-3 py-6 text-center text-sm text-muted-foreground">
          Sin estudios por revisar.
        </p>
      </div>
    </div>
  `,
})
export class NotificationBellComponent implements OnInit {
  readonly BellIcon = Bell;
  open = false;
  notifs: Notif[] = [];
  private readonly seenKey = 'ses_seen_notifications';

  /** Emite el id de la aplicación al hacer clic en una notificación (para abrirla). */
  @Output() openStudy = new EventEmitter<number>();

  constructor(private api: ApiService) {}

  ngOnInit() { this.reload(); }

  get unreadCount() { return this.notifs.filter(n => n.unread).length; }

  reload() {
    this.api.getApplications().subscribe((apps: any[]) => {
      const seen = this.getSeen();
      this.notifs = apps
        .filter(a => a.status === 'FILLED')
        .map(a => ({
          id: a.id,
          applicant: `${a.applicant?.first_name ?? ''} ${a.applicant?.last_name ?? ''}`.trim() || a.applicant?.username || 'Solicitante',
          template: a.form_template?.name ?? 'Estudio',
          when: this.relative(a.updated_at),
          unread: !seen.includes(a.id),
        }))
        .sort((x, y) => y.id - x.id);
    });
  }

  toggle() {
    this.open = !this.open;
    if (this.open) this.reload();
  }

  markRead(n: Notif) {
    if (n.unread) { n.unread = false; this.addSeen(n.id); }
    this.openStudy.emit(n.id);
    this.open = false;
  }

  markAllRead() {
    const ids = this.notifs.map(n => n.id);
    this.notifs.forEach(n => n.unread = false);
    const seen = Array.from(new Set([...this.getSeen(), ...ids]));
    localStorage.setItem(this.seenKey, JSON.stringify(seen));
  }

  private getSeen(): number[] {
    try { return JSON.parse(localStorage.getItem(this.seenKey) || '[]'); } catch { return []; }
  }
  private addSeen(id: number) {
    const seen = Array.from(new Set([...this.getSeen(), id]));
    localStorage.setItem(this.seenKey, JSON.stringify(seen));
  }

  private relative(iso?: string): string {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'hace un momento';
    if (m < 60) return `hace ${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `hace ${h} h`;
    const d = Math.floor(h / 24);
    return `hace ${d} d`;
  }
}
