import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-wrapper">
      <div class="card auth-card">
        <div class="auth-header">
          <h2>Bienvenido</h2>
          <p>Inicia sesión para acceder a tus estudios socioeconomicos</p>
        </div>
        <form (submit)="onLogin()">
          <div class="field">
            <label>Usuario</label>
            <input [(ngModel)]="credentials.username" name="username" placeholder="Ingresa tu usuario" required>
          </div>
          <div class="field">
            <label>Contraseña</label>
            <input type="password" [(ngModel)]="credentials.password" name="password" placeholder="••••••••" required>
          </div>
          <button type="submit" class="primary w-full" [disabled]="loading">
            {{ loading ? 'Cargando...' : 'Iniciar Sesión' }}
          </button>
        </form>
        <p *ngIf="error" class="error-msg">{{ error }}</p>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper { 
      min-height: 80vh; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
    }
    .auth-card { width: 100%; max-width: 440px; }
    .auth-header { text-align: center; margin-bottom: 2rem; }
    .auth-header h2 { font-size: 1.875rem; font-weight: 700; margin-bottom: 0.5rem; }
    .auth-header p { color: var(--text-light); }
    .field { margin-bottom: 1.5rem; }
    label { font-size: 0.875rem; font-weight: 600; color: var(--text-light); }
    .w-full { width: 100%; }
    .error-msg { 
      background: #fef2f2; color: var(--danger); 
      padding: 0.75rem; border-radius: 6px; 
      text-align: center; margin-top: 1rem;
      border: 1px solid #fee2e2;
    }
  `]
})
export class LoginComponent {
  credentials = { username: '', password: '' };
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

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
        this.error = 'Credenciales inválidas. Intenta de nuevo.';
        this.loading = false;
      }
    });
  }
}
