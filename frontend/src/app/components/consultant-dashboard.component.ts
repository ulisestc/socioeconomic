import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LucideAngularModule, ClipboardList, Users, FileText, Plus, RefreshCw, Eye, Check, X,
  Download, Search, Trash2, Pencil, Camera, Wrench, Send, UserPlus, FileSearch, Inbox
} from 'lucide-angular';
import { ApiService } from '../services/api.service';
import { TubelightNavComponent, TubelightItem } from '../ui/tubelight-nav.component';
import { SearchSelectComponent, SearchOption } from '../ui/search-select.component';

@Component({
  selector: 'app-consultant-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, TubelightNavComponent, SearchSelectComponent],
  template: `
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 animate-in">
      <!-- encabezado -->
      <header class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="text-3xl font-extrabold tracking-tight text-foreground">Panel de Consultor</h1>
          <p class="mt-1 text-sm text-muted-foreground">Gestiona solicitantes y estudios socioeconómicos.</p>
        </div>
        <button class="ses-btn-primary self-start sm:self-auto" (click)="goToBuilder()">
          <lucide-icon [img]="WrenchIcon" [size]="16"></lucide-icon> Nuevo Formulario
        </button>
      </header>

      <!-- tabs tubelight -->
      <div class="mb-8 flex justify-center sm:justify-start">
        <tubelight-nav [items]="tabs" [active]="activeTab" (activeChange)="activeTab = $event"></tubelight-nav>
      </div>

      <!-- ===== ESTUDIOS ===== -->
      <div *ngIf="activeTab === 'studies'" class="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside class="ses-card h-fit p-6">
          <h3 class="mb-4 text-sm font-bold uppercase tracking-wide text-primary">Asignar Nuevo Estudio</h3>
          <label class="ses-label">Solicitante</label>
          <div class="mb-3">
            <search-select [items]="applicantOptions" placeholder="Buscar solicitante..."
                           (selected)="targetApplicantId = $event"></search-select>
          </div>
          <label class="ses-label">Plantilla</label>
          <div class="mb-4">
            <search-select [items]="templateOptions" placeholder="Buscar plantilla..."
                           (selected)="selectedFormId = $event"></search-select>
          </div>
          <button class="ses-btn-primary w-full" (click)="assignForm()"
                  [disabled]="!targetApplicantId || !selectedFormId || loading">
            <lucide-icon [img]="SendIcon" [size]="16"></lucide-icon> Asignar Estudio
          </button>
          <p *ngIf="assignStatus" class="mt-3 text-sm font-semibold text-[hsl(142_71%_30%)]">{{ assignStatus }}</p>
        </aside>

        <main class="ses-card overflow-hidden">
          <div class="flex items-center justify-between border-b border-border bg-muted/40 px-5 py-4">
            <h3 class="font-semibold text-foreground">Estudios en Curso</h3>
            <button class="ses-btn-ghost !px-2 !py-2" (click)="loadApplications()" title="Actualizar">
              <lucide-icon [img]="RefreshIcon" [size]="16"></lucide-icon>
            </button>
          </div>

          <!-- filtros -->
          <div class="flex flex-col gap-3 border-b border-border px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex flex-wrap gap-1.5">
              <button *ngFor="let f of filters" (click)="studyFilter = f.value"
                      class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
                      [ngClass]="studyFilter === f.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'">
                {{ f.label }}
                <span class="grid h-4 min-w-4 place-items-center rounded-full px-1 text-[0.6rem]"
                      [ngClass]="studyFilter === f.value ? 'bg-white/25' : 'bg-foreground/10'">{{ countByStatus(f.value) }}</span>
              </button>
            </div>
            <div class="relative w-full lg:w-64">
              <lucide-icon [img]="SearchIcon" [size]="16" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></lucide-icon>
              <input [(ngModel)]="searchTerm" class="ses-input pl-10" placeholder="Buscar por solicitante...">
            </div>
          </div>

          <!-- lista -->
          <div class="divide-y divide-border">
            <div *ngFor="let app of filteredApplications()" class="px-5 py-4">
              <div class="flex flex-wrap items-center gap-3">
                <div class="min-w-0 flex-1">
                  <p class="font-semibold text-foreground">{{ app.applicant.first_name }} {{ app.applicant.last_name }}</p>
                  <p class="text-xs text-muted-foreground">Folio #{{ app.id }} · {{ app.form_template.name }}</p>
                </div>
                <span class="ses-badge" [ngClass]="'ses-badge-' + app.status.toLowerCase()">{{ statusLabel(app.status) }}</span>
                <div class="flex items-center gap-1.5">
                  <button class="ses-btn-outline !px-2.5 !py-2" title="Ver detalle" (click)="togglePreview(app.id)">
                    <lucide-icon [img]="EyeIcon" [size]="16"></lucide-icon>
                  </button>
                  <button *ngIf="app.status === 'FILLED'" class="ses-btn-success !px-2.5 !py-2" title="Aprobar" (click)="startReview(app.id, 'approve')">
                    <lucide-icon [img]="CheckIcon" [size]="16"></lucide-icon>
                  </button>
                  <button *ngIf="app.status === 'FILLED'" class="ses-btn-danger !px-2.5 !py-2" title="Rechazar / pedir correcciones" (click)="startReview(app.id, 'reject')">
                    <lucide-icon [img]="XIcon" [size]="16"></lucide-icon>
                  </button>
                  <button class="ses-btn-outline !px-2.5 !py-2" title="Previsualizar PDF" (click)="previewPdf(app.id)">
                    <lucide-icon [img]="FileSearchIcon" [size]="16"></lucide-icon>
                  </button>
                  <button class="ses-btn-outline !px-2.5 !py-2" title="Descargar PDF" (click)="exportPdf(app.id)">
                    <lucide-icon [img]="DownloadIcon" [size]="16"></lucide-icon>
                  </button>
                </div>
              </div>

              <!-- detalle expandible -->
              <div *ngIf="previewId === app.id" class="mt-4 rounded-xl border border-border bg-muted/30 p-5">
                <div class="mb-3 flex items-center justify-between">
                  <h4 class="font-semibold text-foreground">Detalle #{{ app.id }} — {{ app.form_template.name }}</h4>
                  <button class="text-muted-foreground hover:text-foreground" (click)="previewId = null">
                    <lucide-icon [img]="XIcon" [size]="18"></lucide-icon>
                  </button>
                </div>

                <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div *ngFor="let resp of app.responses">
                    <span class="ses-label">{{ getLabel(app, resp.question_key) }}</span>
                    <p class="whitespace-pre-wrap break-words text-sm font-medium text-foreground">{{ resp.answer }}</p>
                  </div>
                </div>

                <div *ngIf="app.attachments?.length > 0" class="mt-4">
                  <span class="ses-label">Evidencia</span>
                  <div class="flex flex-wrap gap-2">
                    <a *ngFor="let att of app.attachments" [href]="att.file" target="_blank">
                      <img [src]="att.file" class="h-20 w-20 rounded-lg border border-border object-cover">
                    </a>
                  </div>
                </div>

                <div class="mt-4" *ngIf="app.status !== 'APPROVED'">
                  <label class="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-primary bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10">
                    <lucide-icon [img]="CameraIcon" [size]="16"></lucide-icon>
                    Subir foto de corroboración (visita)
                    <input type="file" (change)="uploadCorroboration($event, app.id)" accept="image/*" class="hidden">
                  </label>
                  <span *ngIf="uploadingCorroboration === app.id" class="ml-2 text-sm text-muted-foreground">Subiendo...</span>
                </div>
                <p *ngIf="app.status === 'APPROVED'" class="mt-4 text-sm text-muted-foreground">
                  Estudio aprobado: no se admiten más imágenes.
                </p>

                <div *ngIf="reviewingId === app.id" class="mt-4 rounded-xl border border-border bg-card p-4">
                  <h4 class="mb-2 font-semibold text-foreground">
                    {{ reviewAction === 'approve' ? 'Aprobar Estudio' : 'Rechazar / Pedir correcciones' }}
                  </h4>
                  <textarea [(ngModel)]="verificationNotes" class="ses-input min-h-24"
                            [placeholder]="reviewAction === 'approve' ? 'Notas de verificación...' : 'Indica qué debe corregir el solicitante...'"></textarea>
                  <div class="mt-3 flex justify-end gap-2">
                    <button class="ses-btn-outline" (click)="reviewingId = null">Cancelar</button>
                    <button [class]="reviewAction === 'approve' ? 'ses-btn-primary' : 'ses-btn-danger'" (click)="submitReview(app.id)">
                      {{ reviewAction === 'approve' ? 'Finalizar Aprobación' : 'Enviar Correcciones' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="filteredApplications().length === 0" class="flex flex-col items-center gap-2 px-5 py-12 text-center">
              <lucide-icon [img]="InboxIcon" [size]="32" class="text-muted-foreground/60"></lucide-icon>
              <p class="text-sm text-muted-foreground">No hay estudios en este filtro.</p>
            </div>
          </div>
        </main>
      </div>

      <!-- ===== SOLICITANTES ===== -->
      <div *ngIf="activeTab === 'applicants'" class="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside class="ses-card h-fit p-6">
          <h3 class="mb-4 text-sm font-bold uppercase tracking-wide text-primary">
            {{ editingApplicant ? 'Editar' : 'Registrar' }} Solicitante
          </h3>
          <input [(ngModel)]="newApplicant.first_name" class="ses-input mb-2" placeholder="Nombres">
          <input [(ngModel)]="newApplicant.last_name" class="ses-input mb-2" placeholder="Apellidos">
          <input [(ngModel)]="newApplicant.email" class="ses-input mb-4" placeholder="Correo electrónico">
          <div class="flex gap-2">
            <button class="ses-btn-primary flex-1" (click)="saveApplicant()">
              <lucide-icon [img]="UserPlusIcon" [size]="16"></lucide-icon>
              {{ editingApplicant ? 'Guardar Cambios' : 'Registrar' }}
            </button>
            <button *ngIf="editingApplicant" class="ses-btn-outline" (click)="cancelEditApplicant()">
              <lucide-icon [img]="XIcon" [size]="16"></lucide-icon>
            </button>
          </div>
        </aside>

        <main class="ses-card overflow-hidden">
          <div class="border-b border-border bg-muted/40 px-5 py-4"><h3 class="font-semibold text-foreground">Listado de Solicitantes</h3></div>
          <div class="divide-y divide-border">
            <div *ngFor="let a of applicants" class="flex items-center gap-3 px-5 py-4">
              <div class="min-w-0 flex-1">
                <p class="font-semibold text-foreground">{{ a.first_name }} {{ a.last_name }}</p>
                <p class="truncate text-xs text-muted-foreground">{{ a.email }}</p>
              </div>
              <button class="ses-btn-outline !px-2.5 !py-2" (click)="editApplicant(a)" title="Editar">
                <lucide-icon [img]="PencilIcon" [size]="16"></lucide-icon>
              </button>
              <button class="ses-btn-danger !px-2.5 !py-2" (click)="deleteApplicant(a.id)" title="Eliminar">
                <lucide-icon [img]="TrashIcon" [size]="16"></lucide-icon>
              </button>
            </div>
            <p *ngIf="applicants.length === 0" class="px-5 py-12 text-center text-sm text-muted-foreground">Aún no hay solicitantes.</p>
          </div>
        </main>
      </div>

      <!-- ===== PLANTILLAS ===== -->
      <div *ngIf="activeTab === 'templates'" class="ses-card overflow-hidden">
        <div class="border-b border-border bg-muted/40 px-5 py-4"><h3 class="font-semibold text-foreground">Plantillas de Formularios</h3></div>
        <div class="divide-y divide-border">
          <div *ngFor="let t of templates" class="flex items-center gap-3 px-5 py-4">
            <span class="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
              <lucide-icon [img]="FileTextIcon" [size]="18"></lucide-icon>
            </span>
            <div class="min-w-0 flex-1">
              <p class="font-semibold text-foreground">{{ t.name }}</p>
              <p class="text-xs text-muted-foreground">Creada el {{ t.created_at | date:'short' }}</p>
            </div>
            <button class="ses-btn-danger !px-3 !py-2" (click)="deleteTemplate(t.id)">
              <lucide-icon [img]="TrashIcon" [size]="16"></lucide-icon> Eliminar
            </button>
          </div>
          <p *ngIf="templates.length === 0" class="px-5 py-12 text-center text-sm text-muted-foreground">No hay plantillas.</p>
        </div>
      </div>
    </div>
  `,
})
export class ConsultantDashboardComponent implements OnInit {
  // iconos
  readonly WrenchIcon = Wrench; readonly RefreshIcon = RefreshCw; readonly EyeIcon = Eye;
  readonly CheckIcon = Check; readonly XIcon = X; readonly DownloadIcon = Download;
  readonly SearchIcon = Search; readonly TrashIcon = Trash2; readonly PencilIcon = Pencil;
  readonly CameraIcon = Camera; readonly SendIcon = Send; readonly UserPlusIcon = UserPlus;
  readonly FileSearchIcon = FileSearch; readonly FileTextIcon = FileText; readonly InboxIcon = Inbox;

  activeTab = 'studies';
  tabs: TubelightItem[] = [
    { name: 'Estudios', value: 'studies', icon: ClipboardList },
    { name: 'Solicitantes', value: 'applicants', icon: Users },
    { name: 'Plantillas', value: 'templates', icon: FileText },
  ];

  // filtros de estudios
  studyFilter = 'ALL';
  searchTerm = '';
  filters = [
    { label: 'Todos', value: 'ALL' },
    { label: 'Por llenar', value: 'PENDING' },
    { label: 'Por corroborar', value: 'FILLED' },
    { label: 'Aprobados', value: 'APPROVED' },
    { label: 'Rechazados', value: 'REJECTED' },
  ];

  newApplicant = { email: '', first_name: '', last_name: '' };
  editingApplicant: any = null;
  applicants: any[] = [];

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

  ngOnInit() { this.loadInitialData(); }

  loadInitialData() {
    this.loadApplications();
    this.api.getTemplates().subscribe(data => this.templates = data);
    this.api.getApplicants().subscribe(data => this.applicants = data);
  }

  loadApplications() {
    this.api.getApplications().subscribe(data => this.applications = data);
  }

  // ---- opciones de búsqueda al asignar ----
  get applicantOptions(): SearchOption[] {
    return this.applicants.map(a => ({ id: a.id, label: `${a.first_name} ${a.last_name}`.trim() || a.email }));
  }
  get templateOptions(): SearchOption[] {
    return this.templates.map(t => ({ id: t.id, label: t.name }));
  }

  // ---- filtros ----
  countByStatus(value: string): number {
    if (value === 'ALL') return this.applications.length;
    return this.applications.filter(a => a.status === value).length;
  }
  filteredApplications(): any[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.applications.filter(a => {
      const okStatus = this.studyFilter === 'ALL' || a.status === this.studyFilter;
      const name = `${a.applicant?.first_name ?? ''} ${a.applicant?.last_name ?? ''}`.toLowerCase();
      const okTerm = !term || name.includes(term) || String(a.id).includes(term);
      return okStatus && okTerm;
    });
  }
  statusLabel(status: string): string {
    return ({ PENDING: 'Por llenar', FILLED: 'Por corroborar', APPROVED: 'Aprobado', REJECTED: 'Rechazado' } as any)[status] || status;
  }

  // ---- solicitantes ----
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
  editApplicant(applicant: any) { this.editingApplicant = applicant; this.newApplicant = { ...applicant }; }
  cancelEditApplicant() { this.editingApplicant = null; this.newApplicant = { email: '', first_name: '', last_name: '' }; }
  deleteApplicant(id: number) {
    if (confirm('¿Eliminar este solicitante? Se borrarán sus estudios asociados.')) {
      this.api.deleteApplicant(id).subscribe(() => {
        this.api.getApplicants().subscribe(data => this.applicants = data);
        this.loadApplications();
      });
    }
  }

  // ---- plantillas ----
  deleteTemplate(id: number) {
    if (confirm('¿Eliminar esta plantilla permanentemente?')) {
      this.api.deleteTemplate(id).subscribe(() => this.api.getTemplates().subscribe(data => this.templates = data));
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

  togglePreview(id: number) { this.previewId = this.previewId === id ? null : id; }

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
      next: () => { this.uploadingCorroboration = null; this.loadApplications(); },
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
    this.api.exportPdf(id).subscribe(blob => window.open(window.URL.createObjectURL(blob), '_blank'));
  }
  exportPdf(id: number) {
    this.api.exportPdf(id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `Estudio_${id}.pdf`; a.click();
    });
  }

  goToBuilder() { this.router.navigate(['/builder']); }
  logout() { localStorage.clear(); window.location.href = '/login'; }
}
