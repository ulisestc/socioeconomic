import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-applicant-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container form-wrapper">
      <!-- 1. Aceptar Aviso de Privacidad -->
      <div *ngIf="!user?.is_privacy_notice_accepted" class="card privacy-card animate-in">
        <div class="icon-shield">🛡️</div>
        <h2>Aviso de Privacidad</h2>
        <div class="privacy-content">
          <p>Para continuar con su estudio socioeconómico, es necesario que acepte el tratamiento de sus datos personales.</p>
          <p>Sus datos serán utilizados exclusivamente para la verificación de información solicitada por la institución correspondiente y no serán compartidos con terceros sin su consentimiento explícito.</p>
        </div>
        <div class="privacy-actions">
          <button class="primary w-full" (click)="acceptPrivacy()">Acepto y deseo continuar</button>
        </div>
      </div>

      <!-- 2. Rellenar Formulario -->
      <div *ngIf="user?.is_privacy_notice_accepted && application && application.status === 'PENDING'" class="card form-card animate-in">
        <header class="form-header">
          <h1>{{ application.form_template.name }}</h1>
          <p>Por favor, complete todos los campos requeridos con información verídica.</p>
        </header>

        <form (submit)="submitForm()" class="dynamic-form">
          <div *ngFor="let q of application.form_template.structure.questions" class="field">
            <label>{{ q.label }}</label>
            <input [(ngModel)]="responses[q.key]" [name]="q.key" required>
          </div>
          
          <div class="form-footer">
            <button type="submit" class="primary">Enviar Información</button>
          </div>
        </form>
      </div>

      <!-- 3. Pantalla de Éxito / Estatus Final -->
      <div *ngIf="application && (application.status === 'FILLED' || application.status === 'APPROVED')" class="card status-card animate-in">
        <div class="icon-check" [style.color]="application.status === 'APPROVED' ? 'var(--primary)' : 'var(--success)'">
          {{ application.status === 'APPROVED' ? '🎓' : '✅' }}
        </div>
        
        <h2 *ngIf="application.status === 'FILLED'">¡Información Recibida!</h2>
        <h2 *ngIf="application.status === 'APPROVED'">¡Estudio Aprobado!</h2>
        
        <p *ngIf="application.status === 'FILLED'">
          Tu formulario ha sido enviado correctamente y se encuentra en etapa de revisión por parte de nuestros consultores.
        </p>
        <p *ngIf="application.status === 'APPROVED'">
          Felicidades. Tu estudio ha sido verificado con éxito y el expediente ha sido enviado a la institución correspondiente.
        </p>

        <div class="status-steps">
          <div class="step complete">1. Registro</div>
          <div class="step complete">2. Llenado</div>
          <div [class]="application.status === 'APPROVED' ? 'step complete' : 'step active'">3. Verificación</div>
          <div [class]="application.status === 'APPROVED' ? 'step active' : 'step'">4. Finalizado</div>
        </div>

        <button class="outline" (click)="logout()">Cerrar Sesión</button>
      </div>
      
      <div *ngIf="!application && user?.is_privacy_notice_accepted" class="card">
        <p>No tienes formularios pendientes en este momento.</p>
        <button class="outline" (click)="logout()">Cerrar Sesión</button>
      </div>
    </div>
  `,
  styles: [`
    .form-wrapper { max-width: 700px; padding-top: 4rem; padding-bottom: 4rem; }
    
    .animate-in { animation: slideUp 0.4s ease-out; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

    .privacy-card { text-align: center; }
    .icon-shield { font-size: 3rem; margin-bottom: 1rem; }
    .privacy-content { text-align: left; margin: 1.5rem 0; color: var(--text-light); }
    
    .form-header { margin-bottom: 2.5rem; border-bottom: 1px solid var(--border); padding-bottom: 1.5rem; }
    .form-header h1 { margin: 0; font-size: 1.75rem; color: var(--primary); }
    
    .field { margin-bottom: 1.5rem; }
    .field label { font-weight: 600; font-size: 0.95rem; color: var(--text); }
    
    .form-footer { margin-top: 2rem; display: flex; justify-content: flex-end; }
    
    .status-card { text-align: center; }
    .icon-check { font-size: 4rem; margin-bottom: 1rem; line-height: 1; }
    .status-steps { margin: 2rem 0; display: flex; justify-content: space-between; gap: 0.5rem; }
    .step { flex: 1; font-size: 0.75rem; padding: 0.5rem; background: var(--bg); border-radius: 4px; color: var(--text-light); }
    .step.complete { background: #dcfce7; color: #166534; font-weight: 600; }
    .step.active { border: 2px solid var(--primary); color: var(--primary); font-weight: 700; background: #eff6ff; }
    
    .approval-note { background: #f8fafc; text-align: left; padding: 1rem; margin-bottom: 2rem; font-size: 0.9rem; border-left: 4px solid var(--primary); }
    .approval-note strong { display: block; margin-bottom: 0.25rem; }
    
    .w-full { width: 100%; }
    .outline { background: transparent; border: 1px solid var(--border); color: var(--text); margin-top: 1rem; }
  `]
})
export class ApplicantFormComponent implements OnInit {
  user: any;
  application: any;
  responses: any = {};

  constructor(private auth: AuthService, private api: ApiService) {}

  ngOnInit() {
    this.auth.user$.subscribe(u => {
      this.user = u;
      if (this.user) {
        this.api.getApplications().subscribe(apps => {
          if (apps.length > 0) {
            this.application = apps[0];
          }
        });
      }
    });
  }

  acceptPrivacy() {
    if (this.application) {
      this.api.acceptPrivacy(this.application.id).subscribe(() => {
        this.auth.getProfile().subscribe();
      });
    }
  }

  submitForm() {
    if (!confirm('¿Estás seguro de que deseas enviar el formulario? No podrás realizar cambios después.')) return;

    const formattedResponses = Object.keys(this.responses).map(key => ({
      key, value: this.responses[key]
    }));
    
    this.api.submitResponses(this.application.id, formattedResponses).subscribe(() => {
      alert('Información enviada con éxito.');
      window.location.reload();
    });
  }

  logout() {
    localStorage.clear();
    window.location.href = '/login';
  }
}
