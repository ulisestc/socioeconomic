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
               class="flex items-start gap-2 rounded-lg bg-muted/40 p-3">
            <div class="flex flex-1 flex-col gap-2 sm:flex-row">
              <input [(ngModel)]="q.label" class="ses-input flex-[2]" placeholder="Texto de la pregunta">
              <select [(ngModel)]="q.type" class="ses-input sm:w-44">
                <option value="text">Texto Corto</option>
                <option value="textarea">Texto Largo</option>
                <option value="tel">Teléfono</option>
                <option value="file">Imagen / Foto</option>
                <option value="number">Número</option>
              </select>
            </div>
            <button class="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20"
                    (click)="removeQuestion(sIdx, qIdx)">
              <lucide-icon [img]="XIcon" [size]="14"></lucide-icon>
            </button>
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

  addSection() { this.sections.push({ section: 'Nueva Sección', questions: [{ label: '', type: 'text' }] }); }
  removeSection(index: number) { this.sections.splice(index, 1); }
  addQuestion(sIdx: number) { this.sections[sIdx].questions.push({ label: '', type: 'text' }); }
  removeQuestion(sIdx: number, qIdx: number) { this.sections[sIdx].questions.splice(qIdx, 1); }

  saveTemplate() {
    const processedSections = this.sections.map(sec => ({
      section: sec.section,
      questions: sec.questions.filter((q: any) => q.label.trim() !== '').map((q: any) => ({
        ...q,
        key: q.key || `q_${Math.random().toString(36).slice(2, 7)}`
      }))
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
