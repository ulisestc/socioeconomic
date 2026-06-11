import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, LogOut, Menu, X } from 'lucide-angular';
import { AuthService } from '../services/auth.service';
import { CapdirLogoComponent } from './capdir-logo.component';
import { NotificationBellComponent } from './notification-bell.component';

/**
 * Header fijo global con logo CAPDIR (adaptación del simple-header de 21st.dev).
 * Muestra datos de usuario, campana (solo consultor) y cerrar sesión.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, CapdirLogoComponent, NotificationBellComponent],
  template: `
    <header class="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <nav class="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <a [routerLink]="homeLink" class="shrink-0">
          <capdir-logo></capdir-logo>
        </a>

        <!-- usuario autenticado -->
        <div *ngIf="user" class="flex items-center gap-2 sm:gap-3">
          <notification-bell *ngIf="user.role === 'CONSULTANT'"></notification-bell>

          <div class="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 shadow-sm sm:flex">
            <span class="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {{ initials }}
            </span>
            <div class="leading-tight">
              <p class="text-xs font-semibold text-foreground">{{ displayName }}</p>
              <p class="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">{{ roleLabel }}</p>
            </div>
          </div>

          <button (click)="logout()" class="ses-btn-outline !px-3 !py-2" title="Cerrar sesión">
            <lucide-icon [img]="LogOutIcon" [size]="16"></lucide-icon>
            <span class="hidden sm:inline">Salir</span>
          </button>
        </div>

        <!-- visitante (login / landing) -->
        <div *ngIf="!user" class="hidden items-center text-sm font-medium text-muted-foreground sm:block">
          Plataforma de estudios socioeconómicos
        </div>
      </nav>
    </header>
    <!-- espaciador para el header fijo -->
    <div class="h-16"></div>
  `,
})
export class AppHeaderComponent implements OnInit {
  readonly LogOutIcon = LogOut;
  readonly MenuIcon = Menu;
  readonly XIcon = X;
  user: any = null;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.auth.user$.subscribe(u => this.user = u);
  }

  get homeLink() {
    if (!this.user) return '/login';
    return this.user.role === 'CONSULTANT' ? '/consultant' : '/applicant';
  }
  get displayName() {
    if (!this.user) return '';
    const n = `${this.user.first_name ?? ''} ${this.user.last_name ?? ''}`.trim();
    return n || this.user.username;
  }
  get initials() {
    const n = this.displayName.trim();
    if (!n) return '?';
    const parts = n.split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
  }
  get roleLabel() {
    return this.user?.role === 'CONSULTANT' ? 'Consultor' : 'Solicitante';
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
