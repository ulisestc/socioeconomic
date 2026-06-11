import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, User, Lock, Eye, EyeOff, ArrowLeft, ArrowRight, Mail, CheckCircle2 } from 'lucide-angular';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { HeroComponent } from '../ui/hero.component';
import { CapdirLogoComponent } from '../ui/capdir-logo.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, HeroComponent, CapdirLogoComponent],
  template: `
    <div class="mx-auto max-w-7xl px-4 py-8 animate-in">
      <app-hero class="mb-10 block"></app-hero>

      <div class="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
        <div class="grid md:grid-cols-2">
          <!-- panel de marca -->
          <div class="relative hidden flex-col justify-between overflow-hidden p-10 text-white md:flex"
               style="background-image: linear-gradient(150deg, hsl(231 75% 26%), hsl(221 83% 42%));">
            <div class="pointer-events-none absolute -right-10 top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl animate-[float_7s_ease-in-out_infinite]"></div>
            <div class="pointer-events-none absolute -bottom-10 -left-6 h-56 w-56 rounded-full bg-indigo-300/20 blur-3xl animate-[float_9s_ease-in-out_infinite]"></div>

            <capdir-logo [light]="true" [large]="true"></capdir-logo>

            <div class="relative">
              <h2 class="text-2xl font-bold leading-tight tracking-tight">
                Estudios socioeconómicos con seriedad y trazabilidad.
              </h2>
              <ul class="mt-5 space-y-2.5 text-sm text-white/80">
                <li class="flex items-center gap-2"><lucide-icon [img]="CheckIcon" [size]="16"></lucide-icon> Llenado en línea por el solicitante</li>
                <li class="flex items-center gap-2"><lucide-icon [img]="CheckIcon" [size]="16"></lucide-icon> Corroboración con evidencia fotográfica</li>
                <li class="flex items-center gap-2"><lucide-icon [img]="CheckIcon" [size]="16"></lucide-icon> Expediente final en PDF</li>
              </ul>
            </div>

            <p class="relative text-xs text-white/50">CAPDIR · Capacitación Directiva</p>
          </div>

          <!-- formulario -->
          <div class="p-8 md:p-10">
            <!-- LOGIN -->
            <div *ngIf="!showReset">
              <div class="mb-6 grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <lucide-icon [img]="UserIcon" [size]="24"></lucide-icon>
              </div>
              <h2 class="text-2xl font-bold tracking-tight text-foreground">Inicia sesión</h2>
              <p class="mt-1 text-sm text-muted-foreground">Accede con tu usuario y contraseña.</p>

              <form (submit)="onLogin($event)" class="mt-6 space-y-4">
                <div>
                  <label class="ses-label">Usuario</label>
                  <input [(ngModel)]="credentials.username" name="username" class="ses-input"
                         placeholder="Tu usuario o correo" required>
                </div>
                <div>
                  <label class="ses-label">Contraseña</label>
                  <div class="relative">
                    <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="credentials.password"
                           name="password" class="ses-input pr-10" placeholder="••••••••" required>
                    <button type="button" (click)="showPassword = !showPassword"
                            class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <lucide-icon [img]="showPassword ? EyeOffIcon : EyeIcon" [size]="18"></lucide-icon>
                    </button>
                  </div>
                </div>

                <button type="submit" class="ses-btn-primary w-full" [disabled]="loading">
                  {{ loading ? 'Cargando...' : 'Iniciar sesión' }}
                  <lucide-icon *ngIf="!loading" [img]="ArrowRightIcon" [size]="16"></lucide-icon>
                </button>

                <p *ngIf="error" class="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-center text-sm font-medium text-destructive">
                  {{ error }}
                </p>

                <div class="text-center">
                  <button type="button" (click)="showReset = true" class="text-sm font-semibold text-primary hover:underline">
                    ¿Olvidaste tus credenciales?
                  </button>
                </div>
              </form>
            </div>

            <!-- RESET -->
            <div *ngIf="showReset">
              <div class="mb-6 grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <lucide-icon [img]="MailIcon" [size]="24"></lucide-icon>
              </div>
              <h2 class="text-2xl font-bold tracking-tight text-foreground">Recuperar acceso</h2>
              <p class="mt-1 text-sm text-muted-foreground">Te enviaremos tu usuario y una contraseña temporal.</p>

              <form (submit)="onResetPassword($event)" class="mt-6 space-y-4">
                <div>
                  <label class="ses-label">Correo electrónico</label>
                  <input type="email" [(ngModel)]="resetEmail" name="resetEmail" class="ses-input"
                         placeholder="tu@correo.com" required>
                </div>
                <button type="submit" class="ses-btn-primary w-full" [disabled]="loading">
                  {{ loading ? 'Enviando...' : 'Recuperar mis credenciales' }}
                </button>

                <p *ngIf="resetStatus" class="rounded-lg border border-success/20 bg-success/10 px-3 py-2 text-center text-sm font-medium text-[hsl(142_71%_30%)]">
                  {{ resetStatus }}
                </p>
                <p *ngIf="error" class="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-center text-sm font-medium text-destructive">
                  {{ error }}
                </p>

                <div class="text-center">
                  <button type="button" (click)="showReset = false"
                          class="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                    <lucide-icon [img]="ArrowLeftIcon" [size]="14"></lucide-icon> Volver al login
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  readonly UserIcon = User;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;
  readonly ArrowLeftIcon = ArrowLeft;
  readonly ArrowRightIcon = ArrowRight;
  readonly MailIcon = Mail;
  readonly CheckIcon = CheckCircle2;

  credentials = { username: '', password: '' };
  error = '';
  loading = false;
  showPassword = false;
  showReset = false;
  resetEmail = '';
  resetStatus = '';

  constructor(private auth: AuthService, private api: ApiService, private router: Router) {}

  onLogin(e: Event) {
    e.preventDefault();
    this.loading = true;
    this.error = '';
    this.auth.login(this.credentials).subscribe({
      next: (user) => {
        this.loading = false;
        if (user?.must_change_credentials) {
          this.router.navigate(['/configurar-acceso']);
        } else if (user?.role === 'CONSULTANT') {
          this.router.navigate(['/consultant']);
        } else {
          this.router.navigate(['/applicant']);
        }
      },
      error: () => {
        this.error = 'Credenciales inválidas. Verifica tu usuario y contraseña.';
        this.loading = false;
      }
    });
  }

  onResetPassword(e: Event) {
    e.preventDefault();
    this.loading = true;
    this.error = '';
    this.resetStatus = '';
    this.api.resetPassword(this.resetEmail).subscribe({
      next: () => {
        this.resetStatus = '¡Listo! Si el correo existe, recibirás tu usuario y una contraseña temporal en breve.';
        this.loading = false;
        setTimeout(() => this.showReset = false, 4000);
      },
      error: () => {
        this.error = 'Ocurrió un error al procesar tu solicitud.';
        this.loading = false;
      }
    });
  }
}
