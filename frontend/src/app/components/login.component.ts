import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-wrapper animate-in">
      <div class="card auth-card" *ngIf="!showReset">
        <div class="auth-header">
          <h2>Bienvenido</h2>
          <p>Inicia sesión con tu nombre de usuario</p>
        </div>
        <form (submit)="onLogin()">
          <div class="field">
            <label>Usuario</label>
            <input [(ngModel)]="credentials.username" name="username" placeholder="Ingresa tu usuario" required>
          </div>
          <div class="field">
            <label>Contraseña</label>
            <div class="input-with-icon">
              <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="credentials.password" name="password" placeholder="••••••••" required>
              <button type="button" class="btn-icon" (click)="showPassword = !showPassword">
                {{ showPassword ? '👁️' : '🙈' }}
              </button>
            </div>
          </div>
          <button type="submit" class="primary w-full" [disabled]="loading">
            {{ loading ? 'Cargando...' : 'Iniciar Sesión' }}
          </button>
          
          <div class="auth-footer">
            <a href="javascript:void(0)" (click)="showReset = true">¿Olvidaste tus credenciales?</a>
          </div>
        </form>
        <p *ngIf="error" class="error-msg">{{ error }}</p>
      </div>

      <!-- Reset Credentials Form -->
      <div class="card auth-card" *ngIf="showReset">
        <div class="auth-header">
          <h2>Recuperar Credenciales</h2>
          <p>Ingresa tu correo para recibir tu usuario y una nueva contraseña temporal.</p>
        </div>
        <form (submit)="onResetPassword()">
          <div class="field">
            <label>Correo Electrónico</label>
            <input type="email" [(ngModel)]="resetEmail" name="resetEmail" placeholder="tu@correo.com" required>
          </div>
          <button type="submit" class="primary w-full" [disabled]="loading">
            {{ loading ? 'Enviando...' : 'Recuperar mis credenciales' }}
          </button>
          
          <div class="auth-footer">
            <a href="javascript:void(0)" (click)="showReset = false">← Volver al login</a>
          </div>
        </form>
        <p *ngIf="resetStatus" class="success-msg">{{ resetStatus }}</p>
        <p *ngIf="error" class="error-msg">{{ error }}</p>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper { min-height: 80vh; display: flex; align-items: center; justify-content: center; }
    .auth-card { width: 100%; max-width: 440px; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1); border-radius: 12px; }
    .auth-header { text-align: center; margin-bottom: 2rem; }
    .auth-header h2 { font-size: 1.875rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--primary); }
    .auth-header p { color: var(--text-light); font-size: 0.95rem; }
    .field { margin-bottom: 1.5rem; }
    .field label { display: block; font-size: 0.875rem; font-weight: 600; color: var(--text-light); margin-bottom: 0.5rem; }
    
    .input-with-icon { position: relative; }
    .input-with-icon input { padding-right: 2.5rem; }
    .btn-icon { position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 1.2rem; cursor: pointer; padding: 0.25rem; }

    .auth-footer { text-align: center; margin-top: 1.5rem; }
    .auth-footer a { color: var(--primary); font-size: 0.875rem; font-weight: 600; text-decoration: none; }
    .auth-footer a:hover { text-decoration: underline; }

    .error-msg { background: #fef2f2; color: #991b1b; padding: 0.75rem; border-radius: 6px; text-align: center; margin-top: 1rem; border: 1px solid #fee2e2; font-size: 0.85rem; font-weight: 600; }
    .success-msg { background: #f0fdf4; color: #166534; padding: 0.75rem; border-radius: 6px; text-align: center; margin-top: 1rem; border: 1px solid #dcfce7; font-size: 0.85rem; font-weight: 600; }
    .w-full { width: 100%; }

    .animate-in { animation: slideUp 0.4s ease-out; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class LoginComponent {
  credentials = { username: '', password: '' };
  error = '';
  loading = false;
  showPassword = false;
  showReset = false;
  resetEmail = '';
  resetStatus = '';

  constructor(private auth: AuthService, private api: ApiService, private router: Router) {}

  onLogin() {
    this.loading = true;
    this.error = '';
    this.auth.login(this.credentials).subscribe({
      next: () => {
        this.auth.getProfile().subscribe(user => {
          if (user.role === 'CONSULTANT') {
            this.router.navigate(['/consultant']);
          } else {
            this.router.navigate(['/applicant']);
          }
        });
      },
      error: () => {
        this.error = 'Credenciales inválidas. Verifica tu usuario y contraseña.';
        this.loading = false;
      }
    });
  }

  onResetPassword() {
    this.loading = true;
    this.error = '';
    this.resetStatus = '';
    this.api.resetPassword(this.resetEmail).subscribe({
      next: (res) => {
        this.resetStatus = '¡Listo! Si el correo existe, recibirás tu usuario y una nueva contraseña en breve.';
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
