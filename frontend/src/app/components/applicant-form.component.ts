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
    <div class="container form-wrapper animate-in">
      
      <!-- 1. Aceptar Aviso de Privacidad (Global) -->
      <div *ngIf="user && !user.is_privacy_notice_accepted" class="card privacy-card">
        <div class="icon-shield">🛡️</div>
        <h2>Aviso de Privacidad</h2>
        <div class="privacy-scroll-container" (scroll)="onPrivacyScroll($event)">
          <h4>AVISO DE PRIVACIDAD PARA EL PROCESO DE ESTUDIO SOCIOECONÓMICO</h4>
          <p>En cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, se informa que sus datos serán tratados para los fines de validación e investigación socioeconómica.</p>
          <p><strong>Recolección de datos:</strong> Recabamos información personal, laboral, académica y financiera, incluyendo fotografías de su domicilio para fines de verificación.</p>
          <p><strong>Finalidad:</strong> Evaluar la veracidad de la información proporcionada en su solicitud laboral o de crédito.</p>
          <p><strong>Derechos ARCO:</strong> Usted puede ejercer sus derechos de Acceso, Rectificación, Cancelación y Oposición contactando a nuestro departamento de privacidad.</p>
          <p>Al continuar y aceptar este aviso, usted otorga su consentimiento expreso para que realicemos las investigaciones pertinentes.</p>
          <hr>
          <p>Por favor, lea todo el aviso (haga scroll hasta abajo) para habilitar el botón de aceptación.</p>
        </div>
        
        <div class="privacy-checkbox-area" *ngIf="privacyScrolled">
          <label class="checkbox-container">
            <input type="checkbox" [(ngModel)]="privacyAccepted">
            He leído y acepto el Aviso de Privacidad
          </label>
        </div>

        <div class="privacy-actions">
          <button class="primary w-full" (click)="acceptPrivacy()" [disabled]="!privacyAccepted">
            Acepto y deseo continuar
          </button>
        </div>
      </div>

      <!-- 2. Dashboard del Solicitante: Selección de Formulario -->
      <div *ngIf="user?.is_privacy_notice_accepted && !selectedApplication" class="applicant-dashboard">
        <header class="flex-between mb-2">
          <div>
            <h1>Mis Estudios</h1>
            <p>Selecciona un formulario para completar o consultar.</p>
          </div>
          <button class="outline" (click)="logout()">Cerrar Sesión</button>
        </header>

        <div class="grid">
          <div class="card list-card">
            <h3>Pendientes / Por corregir</h3>
            <div *ngFor="let app of pendingApps" class="app-item" [class.rejected-item]="app.status === 'REJECTED'" (click)="selectApp(app)">
              <div class="app-info">
                <strong>{{ app.form_template.name }}</strong>
                <span *ngIf="app.status === 'PENDING'">Asignado el: {{ app.created_at | date:'shortDate' }}</span>
                <span *ngIf="app.status === 'REJECTED'" class="badge rejected">Requiere correcciones</span>
              </div>
              <div class="app-action">{{ app.status === 'REJECTED' ? 'Corregir →' : 'Llenar →' }}</div>
            </div>
            <p *ngIf="pendingApps.length === 0" class="empty-msg">No tienes estudios pendientes.</p>
          </div>

          <div class="card list-card">
            <h3>Completados y Aprobados</h3>
            <div *ngFor="let app of completedApps" class="app-item completed" (click)="selectApp(app)">
              <div class="app-info">
                <strong>{{ app.form_template.name }}</strong>
                <span class="badge" [ngClass]="app.status.toLowerCase()">{{ app.status }}</span>
              </div>
              <div class="app-action">Ver Estatus</div>
            </div>
            <p *ngIf="completedApps.length === 0" class="empty-msg">No hay estudios completados aún.</p>
          </div>
        </div>
      </div>

      <!-- 3. Rellenar Formulario Seleccionado -->
      <div *ngIf="selectedApplication && (selectedApplication.status === 'PENDING' || selectedApplication.status === 'REJECTED')" class="card form-card">
        <header class="form-header">
          <button class="btn-back" (click)="selectedApplication = null">← Volver</button>
          <h1>{{ selectedApplication.form_template.name }}</h1>
          <p>Puedes guardar tu progreso y continuar más tarde.</p>
        </header>

        <div *ngIf="selectedApplication.status === 'REJECTED'" class="reject-banner">
          <strong>⚠️ El entrevistador solicitó correcciones:</strong>
          <p>{{ selectedApplication.verification_notes || 'Revisa tu información y vuelve a enviarla.' }}</p>
        </div>

        <form (submit)="submitForm(false)" class="dynamic-form">
          <div *ngFor="let section of selectedApplication.form_template.structure" class="form-section">
            <h3 class="section-title">{{ section.section }}</h3>
            <div *ngFor="let q of section.questions" class="field">
              <label>{{ q.label }}</label>
              <ng-container [ngSwitch]="q.type">
                <input *ngSwitchCase="'file'" type="file" (change)="onFileSelected($event, q.key)" accept="image/*">
                <input *ngSwitchCase="'tel'" [(ngModel)]="responses[q.key]" [name]="q.key" type="tel" 
                       placeholder="10 dígitos" (input)="onPhoneInput($event, q.key)">
                <textarea *ngSwitchCase="'textarea'" [(ngModel)]="responses[q.key]" [name]="q.key"></textarea>
                <input *ngSwitchDefault [(ngModel)]="responses[q.key]" [name]="q.key">
              </ng-container>

              <p *ngIf="hasAttachment(q.key)" class="file-info">✓ Archivo cargado</p>
            </div>
          </div>
          
          <div class="status-msg success" *ngIf="successMsg">{{ successMsg }}</div>
          <div class="status-msg error" *ngIf="errorMsg">{{ errorMsg }}</div>

          <div class="form-footer flex-gap">
            <button type="button" class="outline" (click)="submitForm(true)" [disabled]="isSubmitting">
              {{ isSubmitting ? 'Guardando...' : 'Guardar Borrador' }}
            </button>
            <button type="submit" class="primary" [disabled]="isSubmitting">
              {{ isSubmitting ? 'Enviando...' : 'Enviar Definitivo' }}
            </button>
          </div>
        </form>
      </div>

      <!-- 4. Estatus de Formulario Seleccionado (Llenado/Aprobado) -->
      <div *ngIf="selectedApplication && (selectedApplication.status === 'FILLED' || selectedApplication.status === 'APPROVED')" class="card status-card">
        <button class="btn-back" (click)="selectedApplication = null">← Volver</button>
        <div class="icon-check" [style.color]="selectedApplication.status === 'APPROVED' ? 'var(--primary)' : 'var(--success)'">
          {{ selectedApplication.status === 'APPROVED' ? '🎓' : '✅' }}
        </div>
        
        <h2>{{ selectedApplication.form_template.name }}</h2>
        <span class="badge big" [ngClass]="selectedApplication.status.toLowerCase()">{{ selectedApplication.status }}</span>
        
        <p class="mt-2" *ngIf="selectedApplication.status === 'FILLED'">
          Tu información ha sido recibida y está en proceso de validación.
        </p>
        <p class="mt-2" *ngIf="selectedApplication.status === 'APPROVED'">
          Felicidades. Tu estudio ha sido aprobado y el expediente ha sido enviado a la institución.
        </p>

        <div class="status-steps">
          <div class="step complete">Registro</div>
          <div class="step complete">Llenado</div>
          <div [class]="selectedApplication.status === 'APPROVED' ? 'step complete' : 'step active'">Validación</div>
          <div [class]="selectedApplication.status === 'APPROVED' ? 'step active' : 'step'">Finalizado</div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .form-wrapper { max-width: 800px; padding-top: 3rem; padding-bottom: 4rem; }
    
    .privacy-card { text-align: center; }
    .icon-shield { font-size: 3rem; margin-bottom: 1rem; }
    .privacy-scroll-container { text-align: left; margin: 1.5rem 0; padding: 1.5rem; background: #f8fafc; border: 1px solid var(--border); border-radius: 8px; max-height: 300px; overflow-y: auto; font-size: 0.9rem; line-height: 1.6; }
    
    .applicant-dashboard .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 1.5rem; }
    .list-card h3 { font-size: 1rem; color: var(--primary); margin-bottom: 1rem; }
    .app-item { padding: 1rem; border: 1px solid var(--border); border-radius: 8px; margin-bottom: 0.75rem; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s; background: white; }
    .app-item:hover { border-color: var(--primary); transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .app-item.completed { border-left: 4px solid var(--success); }
    .app-info strong { display: block; margin-bottom: 0.25rem; }
    .app-info span { font-size: 0.75rem; color: var(--text-light); }
    .app-action { font-size: 0.85rem; font-weight: 700; color: var(--primary); }
    .empty-msg { font-size: 0.85rem; color: var(--text-light); font-style: italic; }

    .form-header { position: relative; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border); margin-bottom: 2rem; }
    .btn-back { background: none; border: none; color: var(--primary); font-weight: 700; cursor: pointer; padding: 0; margin-bottom: 1rem; display: block; }
    
    .form-section { margin-bottom: 2.5rem; }
    .section-title { font-size: 1.1rem; color: var(--primary); border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; margin-bottom: 1.5rem; }
    
    .field { margin-bottom: 1.5rem; }
    .field label { font-weight: 700; font-size: 0.9rem; color: var(--text); display: block; margin-bottom: 0.5rem; }
    .file-info { font-size: 0.8rem; color: var(--success); margin-top: 0.25rem; font-weight: 600; }
    
    .status-card { text-align: center; }
    .icon-check { font-size: 4rem; margin-bottom: 1rem; line-height: 1; }
    .badge { padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; display: inline-block; }
    .badge.filled { background: #dcfce7; color: #166534; }
    .badge.approved { background: #dbeafe; color: #1e40af; }
    .badge.rejected { background: #fee2e2; color: #991b1b; }
    .badge.big { font-size: 1rem; padding: 0.4rem 1.2rem; }
    .reject-banner { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 1rem 1.25rem; border-radius: 8px; margin-bottom: 2rem; }
    .reject-banner p { margin: 0.4rem 0 0; font-weight: 500; white-space: pre-wrap; }
    .rejected-item { border-left: 4px solid var(--danger); }
    .status-steps { margin: 2.5rem 0; display: flex; justify-content: space-between; gap: 0.5rem; }
    .step { flex: 1; font-size: 0.7rem; padding: 0.6rem; background: #f1f5f9; border-radius: 4px; color: var(--text-light); font-weight: 600; }
    .step.complete { background: #dcfce7; color: #166534; }
    .step.active { border: 2px solid var(--primary); color: var(--primary); background: #eff6ff; }
    
    .mb-2 { margin-bottom: 2rem; }
    .mt-2 { margin-top: 2rem; }
    .w-full { width: 100%; }
    .flex-gap { display: flex; gap: 1rem; }

    .animate-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ApplicantFormComponent implements OnInit {
  user: any;
  pendingApps: any[] = [];
  completedApps: any[] = [];
  selectedApplication: any = null;
  
  responses: any = {};
  isSubmitting = false;
  successMsg = '';
  errorMsg = '';
  privacyScrolled = false;
  privacyAccepted = false;

  constructor(private auth: AuthService, private api: ApiService) {}

  ngOnInit() {
    this.auth.user$.subscribe(u => {
      this.user = u;
      if (this.user) {
        this.loadApplications();
      }
    });
  }

  loadApplications() {
    this.api.getApplications().subscribe(apps => {
      this.pendingApps = apps.filter((a:any) => a.status === 'PENDING' || a.status === 'REJECTED');
      this.completedApps = apps.filter((a:any) => a.status === 'FILLED' || a.status === 'APPROVED');
    });
  }

  selectApp(app: any) {
    this.selectedApplication = app;
    this.responses = {}; 
    // Pre-poblar respuestas existentes
    if (app.responses) {
      app.responses.forEach((r: any) => {
        this.responses[r.question_key] = r.answer;
      });
    }
  }

  onPrivacyScroll(event: any) {
    const element = event.target;
    if (element.scrollHeight - element.scrollTop <= element.clientHeight + 50) {
      this.privacyScrolled = true;
    }
  }

  acceptPrivacy() {
    if (this.privacyAccepted) {
      this.api.acceptPrivacy().subscribe(() => {
        // Forzar actualización de datos de usuario en AuthService
        this.auth.getProfile().subscribe(() => {
          // El estado de this.user cambiará y el *ngIf ocultará la card
        });
      });
    }
  }

  onPhoneInput(event: any, key: string) {
    const input = event.target as HTMLInputElement;
    const sanitized = input.value.replace(/\D/g, '').substring(0, 10);
    this.responses[key] = sanitized;
    input.value = sanitized;
  }

  onFileSelected(event: any, questionKey: string) {
    const file = event.target.files[0];
    if (file && this.selectedApplication) {
      this.api.uploadAttachment(this.selectedApplication.id, questionKey, file).subscribe(att => {
        // No necesitamos guardar el path en responses, solo marcar que existe
        this.selectedApplication.attachments.push(att);
      });
    }
  }

  hasAttachment(questionKey: string): boolean {
    return this.selectedApplication?.attachments?.some((a: any) => a.question_key === questionKey);
  }

  submitForm(isDraft: boolean = false) {
    this.isSubmitting = true;
    const formattedResponses = Object.keys(this.responses).map(key => ({
      key, value: this.responses[key]
    }));
    
    this.api.submitResponses(this.selectedApplication.id, formattedResponses, isDraft).subscribe({
      next: () => {
        this.successMsg = isDraft ? 'Progreso guardado correctamente' : '¡Información enviada con éxito!';
        setTimeout(() => {
          this.successMsg = '';
          if (!isDraft) {
            this.selectedApplication = null;
            this.loadApplications();
          }
          this.isSubmitting = false;
        }, 2000);
      },
      error: () => {
        this.errorMsg = 'Error al procesar. Intenta de nuevo.';
        this.isSubmitting = false;
      }
    });
  }

  logout() {
    localStorage.clear();
    window.location.href = '/login';
  }
}
