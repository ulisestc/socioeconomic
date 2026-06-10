import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-consultant-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container dashboard-container animate-in">
      <header class="dashboard-header">
        <div>
          <h1>Panel de Consultor</h1>
          <p>Gestiona solicitantes y estudios socioeconómicos</p>
        </div>
        <div class="header-actions">
          <button class="primary" (click)="goToBuilder()">🛠️ Nuevo Formulario</button>
          <button class="outline" (click)="logout()">Cerrar Sesión</button>
        </div>
      </header>

      <!-- Tab Navigation -->
      <nav class="tab-nav">
        <button [class.active]="activeTab === 'studies'" (click)="activeTab = 'studies'">📊 Estudios</button>
        <button [class.active]="activeTab === 'applicants'" (click)="activeTab = 'applicants'">👥 Solicitantes</button>
        <button [class.active]="activeTab === 'templates'" (click)="activeTab = 'templates'">📋 Plantillas</button>
      </nav>

      <div class="tab-content mt-2">
        
        <!-- TAB 1: ESTUDIOS -->
        <div *ngIf="activeTab === 'studies'" class="grid">
          <aside class="sidebar">
            <div class="card sidebar-section">
              <h3>Asignar Nuevo Estudio</h3>
              <div class="form-group">
                <label>Seleccionar Solicitante</label>
                <select [(ngModel)]="targetApplicantId">
                  <option [value]="null">-- Buscar Solicitante --</option>
                  <option *ngFor="let a of applicants" [value]="a.id">
                    {{ a.first_name }} {{ a.last_name }}
                  </option>
                </select>

                <label>Seleccionar Plantilla</label>
                <select [(ngModel)]="selectedFormId">
                  <option [value]="null">-- Seleccionar Plantilla --</option>
                  <option *ngFor="let t of templates" [value]="t.id">{{ t.name }}</option>
                </select>

                <button class="primary w-full mt-1" (click)="assignForm()" [disabled]="!targetApplicantId || !selectedFormId || loading">
                  Asignar Estudio
                </button>
                <p *ngIf="assignStatus" class="local-status success">{{ assignStatus }}</p>
              </div>
            </div>
          </aside>

          <main class="main-content">
            <div class="card list-card">
              <div class="list-header">
                <h3>Estudios en Curso</h3>
                <button class="outline-mini" (click)="loadApplications()">🔄</button>
              </div>
              
              <div class="table-responsive">
                <table class="modern-table">
                  <thead>
                    <tr>
                      <th>Solicitante</th>
                      <th>Estado</th>
                      <th class="text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <ng-container *ngFor="let app of applications">
                      <tr>
                        <td>
                          <div class="user-info">
                            <strong>{{ app.applicant.first_name }} {{ app.applicant.last_name }}</strong>
                            <span>Folio #{{ app.id }} | {{ app.form_template.name }}</span>
                          </div>
                        </td>
                        <td>
                          <span class="badge" [ngClass]="app.status.toLowerCase()">{{ app.status }}</span>
                        </td>
                        <td class="text-right actions">
                          <button class="btn-outline-mini" title="Ver detalle" (click)="togglePreview(app.id)">👁️</button>
                          <button *ngIf="app.status === 'FILLED'" class="btn-success-mini" title="Aprobar" (click)="startReview(app.id, 'approve')">✓</button>
                          <button *ngIf="app.status === 'FILLED'" class="btn-danger-mini" title="Rechazar / pedir correcciones" (click)="startReview(app.id, 'reject')">✗</button>
                          <button class="btn-outline-mini" title="Previsualizar PDF" (click)="previewPdf(app.id)">🔍</button>
                          <button class="btn-outline-mini" title="Descargar PDF" (click)="exportPdf(app.id)">📄</button>
                        </td>
                      </tr>
                      <!-- Inline Preview -->
                      <tr *ngIf="previewId === app.id" class="preview-row">
                        <td colspan="3">
                          <div class="preview-content">
                            <header class="flex-between">
                              <h4>Detalle #{{ app.id }} - {{ app.form_template.name }}</h4>
                              <button class="btn-close" (click)="previewId = null">×</button>
                            </header>
                            
                            <div class="responses-grid">
                              <div *ngFor="let resp of app.responses" class="resp-item">
                                <label>{{ getLabel(app, resp.question_key) }}</label>
                                <p>{{ resp.answer }}</p>
                              </div>
                            </div>

                            <div *ngIf="app.attachments?.length > 0" class="attachments-preview">
                              <label>Evidencia</label>
                              <div class="img-grid">
                                <div *ngFor="let att of app.attachments" class="img-item">
                                  <a [href]="att.file" target="_blank">
                                    <img [src]="att.file">
                                  </a>
                                </div>
                              </div>
                            </div>

                            <div class="corroboration-upload">
                              <label class="btn-corroborate">
                                📷 Subir foto de corroboración (visita)
                                <input type="file" (change)="uploadCorroboration($event, app.id)" accept="image/*" style="display:none">
                              </label>
                              <span *ngIf="uploadingCorroboration === app.id" class="local-status">Subiendo...</span>
                            </div>

                            <div *ngIf="reviewingId === app.id" class="approve-form card mt-1">
                              <h4>{{ reviewAction === 'approve' ? 'Aprobar Estudio' : 'Rechazar / Pedir correcciones' }}</h4>
                              <textarea [(ngModel)]="verificationNotes" [placeholder]="reviewAction === 'approve' ? 'Notas de verificación...' : 'Indica qué debe corregir el solicitante...'"></textarea>
                              <div class="flex-end gap-1">
                                <button class="outline" (click)="reviewingId = null">Cancelar</button>
                                <button [class.primary]="reviewAction === 'approve'" [class.btn-reject-confirm]="reviewAction === 'reject'" (click)="submitReview(app.id)">
                                  {{ reviewAction === 'approve' ? 'Finalizar Aprobación' : 'Enviar Correcciones' }}
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </ng-container>
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>

        <!-- TAB 2: SOLICITANTES -->
        <div *ngIf="activeTab === 'applicants'" class="grid">
          <aside class="sidebar">
            <div class="card sidebar-section">
              <h3>{{ editingApplicant ? 'Editar' : 'Registrar' }} Solicitante</h3>
              <div class="form-group">
                <input [(ngModel)]="newApplicant.first_name" placeholder="Nombres">
                <input [(ngModel)]="newApplicant.last_name" placeholder="Apellidos">
                <input [(ngModel)]="newApplicant.email" placeholder="Correo electrónico">
                
                <div class="flex-gap mt-1">
                  <button class="primary w-full" (click)="saveApplicant()">
                    {{ editingApplicant ? 'Guardar Cambios' : 'Registrar' }}
                  </button>
                  <button *ngIf="editingApplicant" class="outline" (click)="cancelEditApplicant()">✕</button>
                </div>
              </div>
            </div>
          </aside>

          <main class="main-content">
            <div class="card list-card">
              <div class="list-header"><h3>Listado de Solicitantes</h3></div>
              <table class="modern-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th class="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let a of applicants">
                    <td><strong>{{ a.first_name }} {{ a.last_name }}</strong></td>
                    <td>{{ a.email }}</td>
                    <td class="text-right actions">
                      <button class="btn-outline-mini" (click)="editApplicant(a)">✏️</button>
                      <button class="btn-danger-mini" (click)="deleteApplicant(a.id)">🗑️</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </main>
        </div>

        <!-- TAB 3: PLANTILLAS -->
        <div *ngIf="activeTab === 'templates'" class="grid">
          <main class="main-content" style="grid-column: span 2;">
            <div class="card list-card">
              <div class="list-header"><h3>Plantillas de Formularios</h3></div>
              <table class="modern-table">
                <thead>
                  <tr>
                    <th>Nombre de Plantilla</th>
                    <th>Creada el</th>
                    <th class="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let t of templates">
                    <td><strong>{{ t.name }}</strong></td>
                    <td>{{ t.created_at | date:'short' }}</td>
                    <td class="text-right actions">
                      <button class="btn-danger-mini" (click)="deleteTemplate(t.id)">🗑️ Eliminar</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </main>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding-top: 1rem; }
    .dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .header-actions { display: flex; gap: 1rem; }
    
    .tab-nav { display: flex; gap: 0.5rem; border-bottom: 2px solid var(--border); margin-bottom: 1rem; }
    .tab-nav button { background: none; border: none; padding: 1rem 1.5rem; font-weight: 700; color: var(--text-light); cursor: pointer; border-bottom: 3px solid transparent; transition: all 0.2s; }
    .tab-nav button:hover { color: var(--primary); }
    .tab-nav button.active { color: var(--primary); border-bottom-color: var(--primary); }

    .grid { display: grid; grid-template-columns: 300px 1fr; gap: 2rem; }
    
    .sidebar-section h3 { font-size: 0.9rem; margin-top: 0; margin-bottom: 1rem; color: var(--primary); font-weight: 700; text-transform: uppercase; }
    .form-group label { display: block; font-size: 0.7rem; font-weight: 700; color: var(--text-light); margin-top: 0.75rem; margin-bottom: 0.25rem; }
    .form-group input { margin-bottom: 0.5rem; font-size: 0.9rem; }
    .mt-1 { margin-top: 1rem; }
    .mt-2 { margin-top: 2rem; }
    
    .list-card { padding: 0; overflow: hidden; border-radius: 12px; }
    .list-header { padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border-bottom: 1px solid var(--border); }
    .list-header h3 { margin: 0; font-size: 1rem; }
    
    .modern-table { width: 100%; border-collapse: collapse; }
    .modern-table th { background: #f1f5f9; padding: 0.75rem 1.5rem; text-align: left; font-size: 0.65rem; text-transform: uppercase; color: var(--text-light); }
    .modern-table td { padding: 1rem 1.5rem; border-top: 1px solid var(--border); }
    
    .user-info strong { display: block; color: var(--text); }
    .user-info span { font-size: 0.7rem; color: var(--text-light); }
    
    .badge { padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; }
    .badge.pending { background: #fef9c3; color: #854d0e; }
    .badge.filled { background: #dcfce7; color: #166534; }
    .badge.approved { background: #dbeafe; color: #1e40af; }
    .badge.rejected { background: #fee2e2; color: #991b1b; }
    
    .actions { display: flex; gap: 0.4rem; justify-content: flex-end; }
    .btn-outline-mini { background: #f1f5f9; border: 1px solid var(--border); padding: 0.4rem 0.6rem; border-radius: 6px; cursor: pointer; }
    .btn-success-mini { background: var(--success); color: white; border: none; padding: 0.4rem 0.6rem; border-radius: 6px; cursor: pointer; }
    .btn-danger-mini { background: #fee2e2; color: #ef4444; border: none; padding: 0.4rem 0.6rem; border-radius: 6px; cursor: pointer; }
    .corroboration-upload { margin-top: 1rem; display: flex; align-items: center; gap: 0.75rem; }
    .btn-corroborate { display: inline-block; background: #eff6ff; color: var(--primary); border: 1px dashed var(--primary); padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.8rem; }
    .btn-reject-confirm { background: var(--danger); color: white; }
    .local-status { font-size: 0.8rem; color: var(--text-light); }
    .local-status.success { color: var(--success); font-weight: 600; }
    
    .preview-row { background: #f8fafc; }
    .preview-content { padding: 1.5rem; background: white; border: 1px solid var(--border); margin: 0.5rem 1.5rem 1.5rem; border-radius: 8px; }
    .responses-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem; margin-top: 1rem; }
    .resp-item label { font-size: 0.65rem; color: var(--text-light); font-weight: 700; text-transform: uppercase; display: block; margin-bottom: 0.25rem; }
    .resp-item p { margin: 0; font-weight: 500; font-size: 0.85rem; word-break: break-word; white-space: pre-wrap; }
    
    .img-grid { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
    .img-item img { width: 80px; height: 80px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border); }

    .flex-gap { display: flex; gap: 0.5rem; }
    .w-full { width: 100%; }

    .animate-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class ConsultantDashboardComponent implements OnInit {
  activeTab = 'studies';
  
  // Applicant Management
  newApplicant = { email: '', first_name: '', last_name: '' };
  editingApplicant: any = null;
  applicants: any[] = [];
  
  // App State
  applications: any[] = [];
  templates: any[] = [];
  selectedFormId: number | null = null;
  targetApplicantId: number | null = null;
  
  loading = false;
  assignStatus = '';
  
  previewId: number | null = null;
  reviewingId: number | null = null;
  reviewAction: 'approve' | 'reject' = 'approve';
  verificationNotes = '';
  uploadingCorroboration: number | null = null;

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.loadInitialData();
  }

  loadInitialData() {
    this.loadApplications();
    this.api.getTemplates().subscribe(data => this.templates = data);
    this.api.getApplicants().subscribe(data => this.applicants = data);
  }

  loadApplications() {
    this.api.getApplications().subscribe(data => this.applications = data);
  }

  // Applicant Management
  saveApplicant() {
    if (this.editingApplicant) {
      this.api.updateApplicant(this.editingApplicant.id, this.newApplicant).subscribe(() => {
        this.cancelEditApplicant();
        this.api.getApplicants().subscribe(data => this.applicants = data);
      });
    } else {
      this.api.createApplicant(this.newApplicant).subscribe(() => {
        this.newApplicant = { email: '', first_name: '', last_name: '' };
        this.api.getApplicants().subscribe(data => this.applicants = data);
      });
    }
  }

  editApplicant(applicant: any) {
    this.editingApplicant = applicant;
    this.newApplicant = { ...applicant };
  }

  cancelEditApplicant() {
    this.editingApplicant = null;
    this.newApplicant = { email: '', first_name: '', last_name: '' };
  }

  deleteApplicant(id: number) {
    if (confirm('¿Estás seguro de eliminar este solicitante? Se borrarán sus estudios asociados.')) {
      this.api.deleteApplicant(id).subscribe(() => {
        this.api.getApplicants().subscribe(data => this.applicants = data);
        this.loadApplications();
      });
    }
  }

  // Template Management
  deleteTemplate(id: number) {
    if (confirm('¿Eliminar esta plantilla permanentemente?')) {
      this.api.deleteTemplate(id).subscribe(() => {
        this.api.getTemplates().subscribe(data => this.templates = data);
      });
    }
  }

  assignForm() {
    if (this.targetApplicantId && this.selectedFormId) {
      this.loading = true;
      this.api.assignForm(this.targetApplicantId, this.selectedFormId).subscribe({
        next: () => {
          this.assignStatus = '¡Asignado con éxito!';
          this.loadApplications();
          this.loading = false;
          setTimeout(() => this.assignStatus = '', 3000);
        },
        error: () => this.loading = false
      });
    }
  }

  togglePreview(id: number) {
    this.previewId = this.previewId === id ? null : id;
  }

  startReview(id: number, action: 'approve' | 'reject') {
    this.previewId = id;
    this.reviewingId = id;
    this.reviewAction = action;
    this.verificationNotes = '';
  }

  submitReview(id: number) {
    const req = this.reviewAction === 'approve'
      ? this.api.approveApplication(id, this.verificationNotes)
      : this.api.rejectApplication(id, this.verificationNotes);
    req.subscribe(() => {
      this.reviewingId = null;
      this.verificationNotes = '';
      this.loadApplications();
    });
  }

  uploadCorroboration(event: any, appId: number) {
    const file = event.target.files[0];
    if (!file) return;
    this.uploadingCorroboration = appId;
    this.api.uploadAttachment(appId, 'corroboracion_visita', file).subscribe({
      next: () => {
        this.uploadingCorroboration = null;
        this.loadApplications();
      },
      error: () => this.uploadingCorroboration = null
    });
  }

  getLabel(app: any, key: string): string {
    const structure = app.form_template?.structure;
    if (Array.isArray(structure)) {
      for (const section of structure) {
        for (const q of section.questions || []) {
          if (q.key === key) return q.label;
        }
      }
    }
    return key;
  }

  previewPdf(id: number) {
    this.api.exportPdf(id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    });
  }

  exportPdf(id: number) {
    this.api.exportPdf(id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Estudio_${id}.pdf`;
      a.click();
    });
  }

  goToBuilder() {
    this.router.navigate(['/builder']);
  }

  logout() {
    localStorage.clear();
    window.location.href = '/login';
  }
}
