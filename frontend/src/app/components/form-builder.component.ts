import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Save, Plus, Trash2, X } from 'lucide-angular';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-form-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="mx-auto max-w-3xl px-4 py-8 animate-in">
      <header class="mb-6 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button class="ses-btn-outline !px-2.5 !py-2" (click)="goBack()">
            <lucide-icon [img]="ArrowLeftIcon" [size]="18"></lucide-icon>
          </button>
          <h1 class="text-2xl font-extrabold tracking-tight text-foreground">Constructor de Formularios</h1>
        </div>
        <button class="ses-btn-primary" (click)="saveTemplate()" [disabled]="!templateName || sections.length === 0">
          <lucide-icon [img]="SaveIcon" [size]="16"></lucide-icon> Guardar Plantilla
        </button>
      </header>

      <div class="ses-card mb-6 p-6">
        <label class="ses-label">Nombre del Formulario</label>
        <input [(ngModel)]="templateName" class="ses-input text-lg font-semibold" placeholder="Ej: Estudio Laboral Estándar">
      </div>

      <div *ngFor="let section of sections; let sIdx = index" class="ses-card mb-6 border-l-4 border-l-primary p-6">
        <div class="mb-4 flex items-center justify-between gap-2">
          <input [(ngModel)]="section.section"
                 class="w-2/3 border-0 border-b-2 border-transparent bg-transparent px-0 py-1 text-xl font-bold text-primary focus:border-primary focus:outline-none"
                 placeholder="Nombre de la Sección">
          <button class="ses-btn-danger !px-3 !py-1.5 text-xs" (click)="removeSection(sIdx)">
            <lucide-icon [img]="TrashIcon" [size]="14"></lucide-icon> Eliminar Sección
          </button>
        </div>

        <div class="space-y-3">
          <div *ngFor="let q of section.questions; let qIdx = index"
               class="space-y-3 rounded-lg bg-muted/40 p-3">
            <div class="flex items-start gap-2">
              <div class="flex flex-1 flex-col gap-2 sm:flex-row">
                <input [(ngModel)]="q.label" class="ses-input flex-[2]" placeholder="Texto de la pregunta">
                <select [(ngModel)]="q.type" (ngModelChange)="onTypeChange(q)" class="ses-input sm:w-52">
                  <option value="text">Texto corto</option>
                  <option value="textarea">Texto largo (párrafo)</option>
                  <option value="number">Número</option>
                  <option value="tel">Teléfono</option>
                  <option value="email">Correo electrónico</option>
                  <option value="date">Fecha</option>
                  <option value="file">Imagen / Archivo</option>
                  <option value="radio">Opción múltiple</option>
                  <option value="select">Lista desplegable</option>
                  <option value="checkbox">Casillas de verificación</option>
                </select>
              </div>
              <button class="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20"
                      (click)="removeQuestion(sIdx, qIdx)" title="Eliminar pregunta">
                <lucide-icon [img]="XIcon" [size]="14"></lucide-icon>
              </button>
            </div>

            <!-- editor de opciones (radio / select / checkbox) -->
            <div *ngIf="needsOptions(q.type)" class="space-y-2 border-t border-border pt-3">
              <p class="ses-label !mb-0">Opciones</p>
              <div *ngFor="let opt of q.options; let oIdx = index; trackBy: trackByIndex" class="flex items-center gap-2">
                <span class="text-xs text-muted-foreground w-4 text-right">{{ oIdx + 1 }}.</span>
                <input [(ngModel)]="q.options[oIdx]" class="ses-input" placeholder="Texto de la opción">
                <button class="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20"
                        (click)="removeOption(q, oIdx)" [disabled]="q.options.length <= 1">
                  <lucide-icon [img]="XIcon" [size]="14"></lucide-icon>
                </button>
              </div>
              <button class="text-sm font-semibold text-primary hover:underline" (click)="addOption(q)">+ Añadir opción</button>
            </div>

            <label class="flex w-fit items-center gap-2 text-xs font-medium text-muted-foreground">
              <input type="checkbox" [(ngModel)]="q.required" class="h-4 w-4 accent-[hsl(var(--primary))]">
              Respuesta obligatoria
            </label>
          </div>
          <button class="w-full rounded-lg border border-dashed border-border py-2 text-sm font-semibold text-primary hover:bg-accent" (click)="addQuestion(sIdx)">
            + Añadir Pregunta
          </button>
        </div>
      </div>

      <button class="w-full rounded-xl border-2 border-dashed border-primary bg-primary/5 py-4 font-bold text-primary hover:bg-primary/10" (click)="addSection()">
        + Añadir Nueva Sección
      </button>

      <div *ngIf="successMsg" class="fixed bottom-8 right-8 rounded-xl bg-success px-6 py-3 font-semibold text-success-foreground shadow-lg">{{ successMsg }}</div>
      <div *ngIf="errorMsg" class="fixed bottom-8 right-8 rounded-xl bg-destructive px-6 py-3 font-semibold text-destructive-foreground shadow-lg">{{ errorMsg }}</div>
    </div>
  `,
})
export class FormBuilderComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft; readonly SaveIcon = Save; readonly PlusIcon = Plus;
  readonly TrashIcon = Trash2; readonly XIcon = X;

  templateName = '';
  sections: any[] = [];
  successMsg = '';
  errorMsg = '';

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() { this.addSection(); }

  addSection() { this.sections.push({ section: 'Nueva Sección', questions: [{ label: '', type: 'text', required: false }] }); }
  removeSection(index: number) { this.sections.splice(index, 1); }
  addQuestion(sIdx: number) { this.sections[sIdx].questions.push({ label: '', type: 'text', required: false }); }
  removeQuestion(sIdx: number, qIdx: number) { this.sections[sIdx].questions.splice(qIdx, 1); }

  trackByIndex(i: number) { return i; }

  // Tipos que requieren lista de opciones
  needsOptions(type: string): boolean { return ['radio', 'select', 'checkbox'].includes(type); }

  onTypeChange(q: any) {
    if (this.needsOptions(q.type)) {
      if (!q.options || q.options.length === 0) q.options = ['', ''];
    }
  }
  addOption(q: any) { (q.options = q.options || []).push(''); }
  removeOption(q: any, oIdx: number) { q.options.splice(oIdx, 1); }

  saveTemplate() {
    const processedSections = this.sections.map(sec => ({
      section: sec.section,
      questions: sec.questions.filter((q: any) => q.label.trim() !== '').map((q: any) => {
        const base: any = {
          key: q.key || `q_${Math.random().toString(36).slice(2, 7)}`,
          label: q.label,
          type: q.type,
          required: !!q.required,
        };
        if (this.needsOptions(q.type)) {
          base.options = (q.options || []).map((o: string) => (o || '').trim()).filter((o: string) => o !== '');
        }
        return base;
      })
    }));

    this.api.createTemplate({ name: this.templateName, structure: processedSections }).subscribe({
      next: () => {
        this.showStatus('Plantilla guardada con éxito.', 'success');
        setTimeout(() => this.router.navigate(['/consultant']), 1500);
      },
      error: () => this.showStatus('Error al guardar la plantilla.', 'error')
    });
  }

  showStatus(msg: string, type: 'success' | 'error') {
    if (type === 'success') this.successMsg = msg; else this.errorMsg = msg;
    setTimeout(() => { this.successMsg = ''; this.errorMsg = ''; }, 4000);
  }

  goBack() { this.router.navigate(['/consultant']); }
}
