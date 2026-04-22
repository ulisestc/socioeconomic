import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-consultant-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container dashboard-container">
      <header class="dashboard-header">
        <div>
          <h1>Panel de Consultor</h1>
          <p>Gestiona plantillas y estudios socioeconómicos</p>
        </div>
        <button class="outline" (click)="logout()">Cerrar Sesión</button>
      </header>

      <div class="grid">
        <!-- Sidebar: Constructor de Formularios -->
        <aside class="card sidebar">
          <div class="sidebar-section">
            <h3>1. Crear Formulario</h3>
            <div class="form-group">
              <label>Nombre del Formulario</label>
              <input [(ngModel)]="templateName" placeholder="Ej: Estudio de Crédito Hipotecario">
              
              <div class="questions-builder">
                <label>Preguntas del Formulario</label>
                <div *ngFor="let q of questions; let i = index" class="question-row">
                  <input [(ngModel)]="questions[i].label" [placeholder]="'Pregunta ' + (i+1)">
                  <button class="btn-remove" (click)="removeQuestion(i)" title="Eliminar">×</button>
                </div>
                
                <button class="btn-add" (click)="addQuestion()">+ Añadir Pregunta</button>
              </div>
              
              <button class="primary w-full" (click)="saveTemplate()" [disabled]="!templateName || questions.length === 0">
                Guardar Formulario
              </button>
            </div>
          </div>
          
          <hr class="separator">
          
          <div class="sidebar-section">
            <h3>2. Registrar Solicitante</h3>
            <div class="form-group">
              <input [(ngModel)]="newApplicant.username" placeholder="Nombre de usuario">
              <input [(ngModel)]="newApplicant.email" placeholder="Correo electrónico">
              <input [(ngModel)]="newApplicant.password" placeholder="Contraseña temporal">
              <button class="primary w-full" (click)="createApplicant()">Registrar Solicitante</button>
            </div>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
          <div class="card toolbar">
            <h3>3. Asignar a Solicitante</h3>
            <div class="flex-toolbar">
              <select [(ngModel)]="selectedFormId">
                <option [value]="null">Seleccionar Formulario...</option>
                <option *ngFor="let t of templates" [value]="t.id">{{ t.name }}</option>
              </select>
              <input type="number" [(ngModel)]="targetApplicantId" placeholder="ID del Solicitante">
              <button class="primary" (click)="assignForm()">Asignar Formulario</button>
            </div>
          </div>

          <div class="card list-card">
            <div class="list-header">
              <h3>Estudios en Curso</h3>
              <button class="outline" (click)="loadApplications()">Actualizar</button>
            </div>
            
            <div class="table-responsive">
              <table class="modern-table">
                <thead>
                  <tr>
                    <th>Solicitante</th>
                    <th>Estado</th>
                    <th>ID</th>
                    <th class="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let app of applications">
                    <td>
                      <div class="user-info">
                        <strong>{{ app.applicant.username }}</strong>
                        <span>{{ app.applicant.email }}</span>
                      </div>
                    </td>
                    <td>
                      <span class="badge" [ngClass]="app.status.toLowerCase()">
                        {{ app.status }}
                      </span>
                    </td>
                    <td>#{{ app.id }}</td>
                    <td class="text-right actions">
                      <button *ngIf="app.status === 'FILLED'" class="btn-success" (click)="approve(app.id)">✓ Aprobar</button>
                      <button class="btn-outline" (click)="exportPdf(app.id)">📄 PDF</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding-top: 2rem; }
    .dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    
    .grid { display: grid; grid-template-columns: 350px 1fr; gap: 2rem; }
    
    .sidebar h3 { font-size: 1.1rem; margin-top: 0; margin-bottom: 1.5rem; color: var(--primary); font-weight: 700; }
    .form-group label { display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-light); margin-top: 1rem; margin-bottom: 0.5rem; }
    
    /* Questions Builder */
    .questions-builder { background: #f1f5f9; padding: 1rem; border-radius: 8px; margin: 1rem 0; }
    .question-row { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
    .question-row input { margin-top: 0; }
    .btn-remove { background: #fee2e2; color: #ef4444; padding: 0 0.75rem; border-radius: 6px; font-weight: bold; }
    .btn-add { background: white; border: 1px dashed var(--primary); color: var(--primary); width: 100%; margin-top: 0.5rem; padding: 0.5rem; font-size: 0.9rem; }
    .btn-add:hover { background: #eff6ff; }
    
    .separator { margin: 2rem 0; border: 0; border-top: 1px solid var(--border); }
    
    .flex-toolbar { display: flex; gap: 1rem; }
    .flex-toolbar select, .flex-toolbar input { flex: 1; }
    
    .list-card { margin-top: 2rem; padding: 0; overflow: hidden; }
    .list-header { padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); }
    
    .modern-table { width: 100%; border-collapse: collapse; }
    .modern-table th { background: #f8fafc; padding: 1rem 1.5rem; text-align: left; font-size: 0.75rem; text-transform: uppercase; color: var(--text-light); }
    .modern-table td { padding: 1.25rem 1.5rem; border-top: 1px solid var(--border); }
    
    .badge { padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
    .badge.pending { background: #fef9c3; color: #854d0e; }
    .badge.filled { background: #dcfce7; color: #166534; }
    .badge.approved { background: #dbeafe; color: #1e40af; }
    
    .actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
    .btn-success { background: var(--success); color: white; padding: 0.5rem 0.75rem; border-radius: 6px; }
    .btn-outline { background: white; border: 1px solid var(--border); padding: 0.5rem 0.75rem; border-radius: 6px; }
    .outline { background: transparent; border: 1px solid var(--border); color: var(--text); }
    .w-full { width: 100%; margin-top: 1rem; }
    .text-right { text-align: right; }
    .user-info span { font-size: 0.85rem; color: var(--text-light); display: block; }
  `]
})
export class ConsultantDashboardComponent implements OnInit {
  // Form Builder
  templateName = '';
  questions: { label: string }[] = [{ label: '' }];
  
  // Applicant Management
  newApplicant = { username: '', email: '', password: '' };
  
  // App State
  applications: any[] = [];
  templates: any[] = [];
  selectedFormId: number | null = null;
  targetApplicantId: number | null = null;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadApplications();
    this.api.getTemplates().subscribe(data => this.templates = data);
  }

  loadApplications() {
    this.api.getApplications().subscribe(data => this.applications = data);
  }

  // Visual Form Builder Logic
  addQuestion() {
    this.questions.push({ label: '' });
  }

  removeQuestion(index: number) {
    this.questions.splice(index, 1);
  }

  saveTemplate() {
    // Transformamos el array visual a la estructura JSON interna automáticamente
    const structure = {
      questions: this.questions
        .filter(q => q.label.trim() !== '')
        .map((q, i) => ({
          key: `question_${i + 1}`,
          label: q.label
        }))
    };

    this.api.createTemplate({ name: this.templateName, structure }).subscribe(() => {
      alert('¡Formulario guardado con éxito!');
      this.api.getTemplates().subscribe(data => this.templates = data);
      this.templateName = '';
      this.questions = [{ label: '' }];
    });
  }

  createApplicant() {
    this.api.createApplicant(this.newApplicant).subscribe((user: any) => {
      alert(`Solicitante registrado (ID: ${user.id}). El sistema le ha enviado sus claves por correo.`);
      this.targetApplicantId = user.id;
      this.newApplicant = { username: '', email: '', password: '' };
      this.loadApplications();
    });
  }

  assignForm() {
    if (this.targetApplicantId && this.selectedFormId) {
      this.api.assignForm(this.targetApplicantId, this.selectedFormId).subscribe(() => {
        alert('Formulario asignado al solicitante');
        this.loadApplications();
      });
    }
  }

  approve(id: number) {
    const notes = prompt('Observaciones finales del consultor (se incluirán en el PDF):');
    if (notes !== null) {
      this.api.approveApplication(id, notes).subscribe(() => {
        alert('Estudio aprobado exitosamente');
        this.loadApplications();
      });
    }
  }

  exportPdf(id: number) {
    this.api.exportPdf(id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Estudio_Socioeconomico_${id}.pdf`;
      a.click();
    });
  }

  logout() {
    localStorage.clear();
    window.location.href = '/login';
  }
}
