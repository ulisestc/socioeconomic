import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-form-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container builder-container animate-in">
      <header class="builder-header">
        <div class="flex-center gap-1">
          <button class="btn-back" (click)="goBack()">←</button>
          <h1>Constructor de Formularios</h1>
        </div>
        <div class="header-actions">
          <button class="primary" (click)="saveTemplate()" [disabled]="!templateName || sections.length === 0">
            💾 Guardar Plantilla
          </button>
        </div>
      </header>

      <div class="builder-body">
        <div class="card settings-card">
          <label>Nombre del Formulario</label>
          <input [(ngModel)]="templateName" placeholder="Ej: Estudio Laboral Estándar">
        </div>

        <div *ngFor="let section of sections; let sIdx = index" class="card section-card">
          <div class="section-header">
            <input [(ngModel)]="section.section" class="section-title-input" placeholder="Nombre de la Sección">
            <button class="btn-remove" (click)="removeSection(sIdx)">Eliminar Sección</button>
          </div>

          <div class="questions-list">
            <div *ngFor="let q of section.questions; let qIdx = index" class="question-row">
              <div class="q-main">
                <input [(ngModel)]="q.label" placeholder="Texto de la pregunta" class="q-label">
                <select [(ngModel)]="q.type" class="q-type">
                  <option value="text">Texto Corto</option>
                  <option value="textarea">Texto Largo</option>
                  <option value="tel">Teléfono</option>
                  <option value="file">Imagen / Foto</option>
                  <option value="number">Número</option>
                </select>
              </div>
              <button class="btn-remove-mini" (click)="removeQuestion(sIdx, qIdx)">×</button>
            </div>
            <button class="btn-add-q" (click)="addQuestion(sIdx)">+ Añadir Pregunta</button>
          </div>
        </div>

        <button class="btn-add-section" (click)="addSection()">+ Añadir Nueva Sección</button>
      </div>

      <div class="status-alert success" *ngIf="successMsg">{{ successMsg }}</div>
      <div class="status-alert error" *ngIf="errorMsg">{{ errorMsg }}</div>
    </div>
  `,
  styles: [`
    .builder-container { padding-top: 2rem; padding-bottom: 5rem; max-width: 900px; }
    .builder-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .btn-back { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-light); }
    .header-actions { display: flex; gap: 1rem; align-items: center; }
    .settings-card { margin-bottom: 2rem; }
    .settings-card label { display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.85rem; color: var(--text-light); text-transform: uppercase; }
    .settings-card input { font-size: 1.1rem; font-weight: 600; border-color: var(--primary); }

    .section-card { margin-bottom: 2rem; border-left: 4px solid var(--primary); }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .section-title-input { border: none; background: transparent; font-size: 1.25rem; font-weight: 700; color: var(--primary); padding: 0.5rem 0; width: 70%; border-bottom: 2px solid transparent; }
    .section-title-input:focus { border-bottom-color: var(--primary); outline: none; }

    .question-row { display: flex; gap: 0.5rem; align-items: flex-start; margin-bottom: 1rem; padding: 0.75rem; background: #f8fafc; border-radius: 8px; }
    .q-main { flex: 1; display: flex; gap: 0.5rem; }
    .q-label { flex: 2; }
    .q-type { flex: 1; min-width: 120px; }

    .btn-add-q { width: 100%; padding: 0.5rem; background: white; border: 1px dashed var(--border); color: var(--primary); font-size: 0.85rem; border-radius: 6px; }
    .btn-add-section { width: 100%; padding: 1rem; background: #eff6ff; border: 2px dashed var(--primary); color: var(--primary); font-weight: 700; border-radius: 8px; cursor: pointer; }
    
    .btn-remove { background: #fee2e2; color: #ef4444; font-size: 0.75rem; font-weight: 600; padding: 0.4rem 0.8rem; border-radius: 4px; }
    .btn-remove-mini { background: #fee2e2; color: #ef4444; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; }

    .status-alert { position: fixed; bottom: 2rem; right: 2rem; padding: 1rem 2rem; border-radius: 8px; color: white; font-weight: 600; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
    .status-alert.success { background: var(--success); }
    .status-alert.error { background: #ef4444; }

    .animate-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class FormBuilderComponent implements OnInit {
  templateName = '';
  sections: any[] = [];
  successMsg = '';
  errorMsg = '';

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.addSection(); // Iniciar con una sección vacía
  }

  addSection() {
    this.sections.push({
      section: 'Nueva Sección',
      questions: [{ label: '', type: 'text' }]
    });
  }

  removeSection(index: number) {
    this.sections.splice(index, 1);
  }

  addQuestion(sIdx: number) {
    this.sections[sIdx].questions.push({ label: '', type: 'text' });
  }

  removeQuestion(sIdx: number, qIdx: number) {
    this.sections[sIdx].questions.splice(qIdx, 1);
  }

  saveTemplate() {
    // Generar claves únicas para cada pregunta basada en el label
    const processedSections = this.sections.map(sec => ({
      section: sec.section,
      questions: sec.questions.filter((q:any) => q.label.trim() !== '').map((q:any, i:number) => ({
        ...q,
        key: q.key || `q_${Math.random().toString(36).slice(2, 7)}`
      }))
    }));

    this.api.createTemplate({
      name: this.templateName,
      structure: processedSections
    }).subscribe({
      next: () => {
        this.showStatus('Plantilla guardada con éxito.', 'success');
        setTimeout(() => this.router.navigate(['/dashboard']), 1500);
      },
      error: () => this.showStatus('Error al guardar la plantilla.', 'error')
    });
  }

  showStatus(msg: string, type: 'success' | 'error') {
    if (type === 'success') this.successMsg = msg;
    else this.errorMsg = msg;
    setTimeout(() => { this.successMsg = ''; this.errorMsg = ''; }, 4000);
  }

  goBack() {
    this.router.navigate(['/consultant']);
  }
}
