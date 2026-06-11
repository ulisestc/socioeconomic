import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, ShieldCheck, Mail, Lock, Check, ArrowRight, Eye, EyeOff } from 'lucide-angular';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';

/**
 * Multi-step de primer inicio de sesión.
 * El solicitante confirma que su usuario será su correo y define su contraseña definitiva.
 * Backend: POST /applications/change_credentials/ (username := email, set_password, must_change=False).
 */
@Component({
  selector: 'app-credential-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="mx-auto flex max-w-lg flex-col px-4 py-10 animate-in">
      <!-- progreso -->
      <div class="mb-6 flex items-center gap-2">
        <div class="h-1.5 flex-1 rounded-full" [ngClass]="step >= 1 ? 'bg-primary' : 'bg-border'"></div>
        <div class="h-1.5 flex-1 rounded-full" [ngClass]="step >= 2 ? 'bg-primary' : 'bg-border'"></div>
      </div>

      <div class="ses-card p-8">
        <!-- PASO 1: bienvenida -->
        <div *ngIf="step === 1">
          <div class="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
            <lucide-icon [img]="ShieldIcon" [size]="24"></lucide-icon>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-foreground">Configura tu acceso</h1>
          <p class="mt-2 text-sm text-muted-foreground">
            Iniciaste con credenciales <strong>temporales</strong>. Para proteger tu información,
            configuremos tu acceso definitivo. A partir de ahora tu usuario será tu correo electrónico.
          </p>

          <div class="mt-6 rounded-xl border border-border bg-muted/40 p-4">
            <span class="ses-label">Tu nuevo usuario</span>
            <div class="flex items-center gap-2">
              <lucide-icon [img]="MailIcon" [size]="18" class="text-muted-foreground"></lucide-icon>
              <span class="font-semibold text-foreground">{{ user?.email || '—' }}</span>
            </div>
          </div>

          <button class="ses-btn-primary mt-6 w-full" (click)="step = 2" [disabled]="!user?.email">
            Continuar <lucide-icon [img]="ArrowRightIcon" [size]="16"></lucide-icon>
          </button>
        </div>

        <!-- PASO 2: contraseña -->
        <div *ngIf="step === 2">
          <div class="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
            <lucide-icon [img]="LockIcon" [size]="24"></lucide-icon>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-foreground">Crea tu contraseña</h1>
          <p class="mt-2 text-sm text-muted-foreground">Mínimo 8 caracteres. Guárdala bien: la usarás junto con tu correo.</p>

          <form (submit)="submit($event)" class="mt-6 space-y-4">
            <div>
              <label class="ses-label">Nueva contraseña</label>
              <div class="relative">
                <input [type]="show ? 'text' : 'password'" [(ngModel)]="password" name="password"
                       class="ses-input pr-10" placeholder="••••••••" autocomplete="new-password">
                <button type="button" (click)="show = !show"
                        class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <lucide-icon [img]="show ? EyeOffIcon : EyeIcon" [size]="18"></lucide-icon>
                </button>
              </div>
            </div>
            <div>
              <label class="ses-label">Confirmar contraseña</label>
              <input type="password" [(ngModel)]="confirm" name="confirm"
                     class="ses-input" placeholder="••••••••" autocomplete="new-password">
            </div>

            <p *ngIf="error" class="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
              {{ error }}
            </p>

            <div class="flex gap-2">
              <button type="button" class="ses-btn-outline" (click)="step = 1">Atrás</button>
              <button type="submit" class="ses-btn-primary flex-1" [disabled]="loading">
                <lucide-icon [img]="CheckIcon" [size]="16"></lucide-icon>
                {{ loading ? 'Guardando...' : 'Finalizar y entrar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class CredentialSetupComponent implements OnInit {
  readonly ShieldIcon = ShieldCheck;
  readonly MailIcon = Mail;
  readonly LockIcon = Lock;
  readonly CheckIcon = Check;
  readonly ArrowRightIcon = ArrowRight;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;

  step = 1;
  user: any = null;
  password = '';
  confirm = '';
  show = false;
  loading = false;
  error = '';

  constructor(private auth: AuthService, private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.auth.user$.subscribe(u => {
      this.user = u;
      // Si no hay sesión, al login. Si ya no requiere cambio, a su panel.
      if (!u) { this.router.navigate(['/login']); return; }
      if (!u.must_change_credentials) { this.router.navigate(['/applicant']); }
    });
  }

  submit(e: Event) {
    e.preventDefault();
    this.error = '';
    if (this.password.length < 8) { this.error = 'La contraseña debe tener al menos 8 caracteres.'; return; }
    if (this.password !== this.confirm) { this.error = 'Las contraseñas no coinciden.'; return; }

    this.loading = true;
    this.api.changeCredentials(this.password).subscribe({
      next: () => {
        this.auth.getProfile().subscribe(() => {
          this.loading = false;
          this.router.navigate(['/applicant']);
        });
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.error || 'No se pudo guardar. Intenta de nuevo.';
      }
    });
  }
}
