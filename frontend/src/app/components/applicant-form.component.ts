import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LucideAngularModule, ShieldCheck, ArrowLeft, Save, Send, Image as ImageIcon,
  User, House, Wallet, MapPin, ClipboardList, CheckCircle2
} from 'lucide-angular';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { StudyCardComponent } from '../ui/study-card.component';
import { AccordionItemComponent } from '../ui/accordion-item.component';

@Component({
  selector: 'app-applicant-form',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, StudyCardComponent, AccordionItemComponent],
  template: `
    <div class="mx-auto max-w-3xl px-4 py-8 animate-in">

      <!-- 1. Aviso de privacidad -->
      <div *ngIf="user && !user.is_privacy_notice_accepted" class="ses-card p-8 text-center">
        <div class="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <lucide-icon [img]="ShieldIcon" [size]="28"></lucide-icon>
        </div>
        <h2 class="text-2xl font-bold tracking-tight text-foreground">Aviso de Privacidad</h2>
        <div class="my-5 max-h-72 overflow-y-auto rounded-xl border border-border bg-muted/40 p-5 text-left text-sm leading-relaxed text-muted-foreground"
             (scroll)="onPrivacyScroll($event)">
          <h4 class="mb-2 font-semibold text-foreground">AVISO DE PRIVACIDAD PARA EL PROCESO DE ESTUDIO SOCIOECONÓMICO</h4>
          <p class="mb-2">En cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, se informa que sus datos serán tratados para los fines de validación e investigación socioeconómica.</p>
          <p class="mb-2"><strong>Recolección de datos:</strong> Recabamos información personal, laboral, académica y financiera, incluyendo fotografías de su domicilio para fines de verificación.</p>
          <p class="mb-2"><strong>Finalidad:</strong> Evaluar la veracidad de la información proporcionada en su solicitud laboral o de crédito.</p>
          <p class="mb-2"><strong>Derechos ARCO:</strong> Usted puede ejercer sus derechos de Acceso, Rectificación, Cancelación y Oposición contactando a nuestro departamento de privacidad.</p>
          <p class="mb-2">Al continuar y aceptar este aviso, usted otorga su consentimiento expreso para que realicemos las investigaciones pertinentes.</p>
          <hr class="my-3 border-border">
          <p>Por favor, lea todo el aviso (haga scroll hasta abajo) para habilitar el botón de aceptación.</p>
        </div>

        <label *ngIf="privacyScrolled" class="mb-4 flex items-center justify-center gap-2 text-sm font-medium text-foreground">
          <input type="checkbox" [(ngModel)]="privacyAccepted" class="h-4 w-4 accent-[hsl(var(--primary))]">
          He leído y acepto el Aviso de Privacidad
        </label>
        <button class="ses-btn-primary w-full" (click)="acceptPrivacy()" [disabled]="!privacyAccepted">
          Acepto y deseo continuar
        </button>
      </div>

      <!-- 2. Lista unificada de estudios -->
      <div *ngIf="user?.is_privacy_notice_accepted && !selectedApplication">
        <header class="mb-6">
          <h1 class="text-3xl font-extrabold tracking-tight text-foreground">Mis Estudios</h1>
          <p class="mt-1 text-sm text-muted-foreground">Selecciona un estudio para completarlo o consultar su estatus.</p>
        </header>

        <div class="space-y-3">
          <study-card *ngFor="let app of studies"
                      [title]="app.form_template.name"
                      [subtitle]="subtitleFor(app)"
                      [status]="app.status"
                      [actionLabel]="actionFor(app)"
                      (action)="selectApp(app)"></study-card>

          <div *ngIf="studies.length === 0" class="ses-card flex flex-col items-center gap-2 p-12 text-center">
            <lucide-icon [img]="ClipboardIcon" [size]="32" class="text-muted-foreground/60"></lucide-icon>
            <p class="text-sm text-muted-foreground">Aún no tienes estudios asignados.</p>
          </div>
        </div>
      </div>

      <!-- 3. Llenar / corregir formulario -->
      <div *ngIf="selectedApplication && (selectedApplication.status === 'PENDING' || selectedApplication.status === 'REJECTED')">
        <button class="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline" (click)="selectedApplication = null">
          <lucide-icon [img]="ArrowLeftIcon" [size]="14"></lucide-icon> Volver
        </button>

        <div class="ses-card p-6 sm:p-8">
          <h1 class="text-2xl font-bold tracking-tight text-foreground">{{ selectedApplication.form_template.name }}</h1>
          <p class="mt-1 text-sm text-muted-foreground">Puedes guardar tu progreso y continuar más tarde.</p>

          <div *ngIf="selectedApplication.status === 'REJECTED'" class="mt-5 rounded-xl border border-destructive/20 bg-destructive/10 p-4">
            <p class="font-semibold text-destructive">⚠️ El entrevistador solicitó correcciones:</p>
            <p class="mt-1 whitespace-pre-wrap text-sm text-destructive/90">{{ selectedApplication.verification_notes || 'Revisa tu información y vuelve a enviarla.' }}</p>
          </div>

          <form (submit)="submitForm($event, false)" class="mt-6 space-y-3">
            <accordion-item *ngFor="let section of selectedApplication.form_template.structure; let i = index"
                            [title]="section.section"
                            [subtitle]="(section.questions?.length || 0) + ' campos'"
                            [icon]="iconFor(i)"
                            [complete]="sectionComplete(section)"
                            [open]="i === 0">
              <div class="space-y-4">
                <div *ngFor="let q of section.questions">
                  <label class="ses-label">{{ q.label }}<span *ngIf="q.required" class="text-destructive"> *</span></label>
                  <ng-container [ngSwitch]="q.type">
                    <label *ngSwitchCase="'file'" class="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-input bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground hover:border-primary">
                      <lucide-icon [img]="ImageIcon" [size]="16"></lucide-icon>
                      <span>{{ hasAttachment(q.key) ? 'Cambiar archivo' : 'Seleccionar archivo' }}</span>
                      <input type="file" (change)="onFileSelected($event, q.key)" accept="image/*" class="hidden">
                    </label>
                    <input *ngSwitchCase="'tel'" [(ngModel)]="responses[q.key]" [name]="q.key" type="tel"
                           class="ses-input" placeholder="10 dígitos" (input)="onPhoneInput($event, q.key)">
                    <input *ngSwitchCase="'number'" [(ngModel)]="responses[q.key]" [name]="q.key" type="number" class="ses-input">
                    <input *ngSwitchCase="'email'" [(ngModel)]="responses[q.key]" [name]="q.key" type="email" class="ses-input" placeholder="correo@ejemplo.com">
                    <input *ngSwitchCase="'date'" [(ngModel)]="responses[q.key]" [name]="q.key" type="date" class="ses-input">
                    <textarea *ngSwitchCase="'textarea'" [(ngModel)]="responses[q.key]" [name]="q.key" class="ses-input min-h-24"></textarea>

                    <div *ngSwitchCase="'radio'" class="space-y-2">
                      <label *ngFor="let opt of q.options" class="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                        <input type="radio" [name]="q.key" [value]="opt" [(ngModel)]="responses[q.key]" class="h-4 w-4 accent-[hsl(var(--primary))]">
                        {{ opt }}
                      </label>
                    </div>

                    <select *ngSwitchCase="'select'" [(ngModel)]="responses[q.key]" [name]="q.key" class="ses-input">
                      <option value="">Selecciona una opción...</option>
                      <option *ngFor="let opt of q.options" [value]="opt">{{ opt }}</option>
                    </select>

                    <div *ngSwitchCase="'checkbox'" class="space-y-2">
                      <label *ngFor="let opt of q.options" class="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                        <input type="checkbox" [checked]="isChecked(q.key, opt)" (change)="toggleCheckbox(q.key, opt, $event)" class="h-4 w-4 accent-[hsl(var(--primary))]">
                        {{ opt }}
                      </label>
                    </div>

                    <input *ngSwitchDefault [(ngModel)]="responses[q.key]" [name]="q.key" class="ses-input">
                  </ng-container>
                  <p *ngIf="q.type === 'file' && hasAttachment(q.key)" class="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[hsl(142_71%_30%)]">
                    <lucide-icon [img]="CheckIcon" [size]="14"></lucide-icon> Archivo cargado
                  </p>
                </div>
              </div>
            </accordion-item>

            <p *ngIf="successMsg" class="rounded-lg border border-success/20 bg-success/10 px-3 py-2 text-sm font-medium text-[hsl(142_71%_30%)]">{{ successMsg }}</p>
            <p *ngIf="errorMsg" class="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{{ errorMsg }}</p>

            <div class="flex flex-col gap-2 pt-2 sm:flex-row">
              <button type="button" class="ses-btn-outline flex-1" (click)="submitForm($event, true)" [disabled]="isSubmitting">
                <lucide-icon [img]="SaveIcon" [size]="16"></lucide-icon>
                {{ isSubmitting ? 'Guardando...' : 'Guardar Borrador' }}
              </button>
              <button type="submit" class="ses-btn-primary flex-1" [disabled]="isSubmitting">
                <lucide-icon [img]="SendIcon" [size]="16"></lucide-icon>
                {{ isSubmitting ? 'Enviando...' : 'Enviar Definitivo' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- 4. Estatus -->
      <div *ngIf="selectedApplication && (selectedApplication.status === 'FILLED' || selectedApplication.status === 'APPROVED')">
        <button class="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline" (click)="selectedApplication = null">
          <lucide-icon [img]="ArrowLeftIcon" [size]="14"></lucide-icon> Volver
        </button>

        <div class="ses-card p-8 text-center">
          <div class="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl"
               [ngClass]="selectedApplication.status === 'APPROVED' ? 'bg-primary/10 text-primary' : 'bg-success/15 text-success'">
            <lucide-icon [img]="CheckIcon" [size]="32"></lucide-icon>
          </div>
          <h2 class="text-2xl font-bold tracking-tight text-foreground">{{ selectedApplication.form_template.name }}</h2>
          <span class="ses-badge mt-2" [ngClass]="'ses-badge-' + selectedApplication.status.toLowerCase()">
            {{ selectedApplication.status === 'APPROVED' ? 'Aprobado' : 'En revisión' }}
          </span>

          <p class="mx-auto mt-4 max-w-md text-sm text-muted-foreground" *ngIf="selectedApplication.status === 'FILLED'">
            Tu información ha sido recibida y está en proceso de validación.
          </p>
          <p class="mx-auto mt-4 max-w-md text-sm text-muted-foreground" *ngIf="selectedApplication.status === 'APPROVED'">
            ¡Felicidades! Tu estudio fue aprobado y el expediente se envió a la institución.
          </p>

          <div class="mt-6 grid grid-cols-4 gap-2">
            <div class="rounded-lg bg-success/15 px-2 py-2 text-[0.7rem] font-semibold text-[hsl(142_71%_30%)]">Registro</div>
            <div class="rounded-lg bg-success/15 px-2 py-2 text-[0.7rem] font-semibold text-[hsl(142_71%_30%)]">Llenado</div>
            <div class="rounded-lg px-2 py-2 text-[0.7rem] font-semibold"
                 [ngClass]="selectedApplication.status === 'APPROVED' ? 'bg-success/15 text-[hsl(142_71%_30%)]' : 'border-2 border-primary bg-primary/5 text-primary'">Validación</div>
            <div class="rounded-lg px-2 py-2 text-[0.7rem] font-semibold"
                 [ngClass]="selectedApplication.status === 'APPROVED' ? 'border-2 border-primary bg-primary/5 text-primary' : 'bg-muted text-muted-foreground'">Finalizado</div>
          </div>
        </div>
      </div>

    </div>
  `,
})
export class ApplicantFormComponent implements OnInit {
  readonly ShieldIcon = ShieldCheck; readonly ArrowLeftIcon = ArrowLeft; readonly SaveIcon = Save;
  readonly SendIcon = Send; readonly ImageIcon = ImageIcon; readonly CheckIcon = CheckCircle2;
  readonly ClipboardIcon = ClipboardList;
  private sectionIcons = [User, House, Wallet, MapPin, ClipboardList];

  user: any;
  studies: any[] = [];
  selectedApplication: any = null;

  responses: any = {};
  isSubmitting = false;
  successMsg = '';
  errorMsg = '';
  privacyScrolled = false;
  privacyAccepted = false;

  constructor(private auth: AuthService, private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.auth.user$.subscribe(u => {
      this.user = u;
      if (this.user) {
        if (this.user.must_change_credentials) { this.router.navigate(['/configurar-acceso']); return; }
        this.loadApplications();
      }
    });
  }

  loadApplications() {
    this.api.getApplications().subscribe(apps => {
      const order: any = { PENDING: 0, REJECTED: 1, FILLED: 2, APPROVED: 3 };
      this.studies = [...apps].sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));
    });
  }

  subtitleFor(app: any): string {
    if (app.status === 'PENDING') return 'Asignado el ' + new Date(app.created_at).toLocaleDateString();
    if (app.status === 'REJECTED') return 'Requiere correcciones';
    if (app.status === 'FILLED') return 'En proceso de validación';
    return 'Expediente enviado';
  }
  actionFor(app: any): string {
    if (app.status === 'PENDING') return 'Llenar';
    if (app.status === 'REJECTED') return 'Corregir';
    return 'Ver estatus';
  }
  iconFor(i: number) { return this.sectionIcons[i % this.sectionIcons.length]; }

  isAnswered(q: any): boolean {
    if (q.type === 'file') return this.hasAttachment(q.key);
    if (q.type === 'checkbox') return Array.isArray(this.responses[q.key]) && this.responses[q.key].length > 0;
    return !!(this.responses[q.key] !== undefined && this.responses[q.key] !== null && String(this.responses[q.key]).trim());
  }

  sectionComplete(section: any): boolean {
    const qs = section.questions || [];
    if (qs.length === 0) return false;
    const required = qs.filter((q: any) => q.required);
    const toCheck = required.length ? required : qs;
    return toCheck.every((q: any) => this.isAnswered(q));
  }

  private allQuestions(): any[] {
    const out: any[] = [];
    (this.selectedApplication?.form_template?.structure || []).forEach((s: any) => (s.questions || []).forEach((q: any) => out.push(q)));
    return out;
  }

  // ---- casillas de verificación (respuesta = arreglo) ----
  isChecked(key: string, opt: string): boolean {
    return Array.isArray(this.responses[key]) && this.responses[key].includes(opt);
  }
  toggleCheckbox(key: string, opt: string, event: any) {
    if (!Array.isArray(this.responses[key])) this.responses[key] = [];
    const arr = this.responses[key] as string[];
    if (event.target.checked) { if (!arr.includes(opt)) arr.push(opt); }
    else { this.responses[key] = arr.filter(o => o !== opt); }
  }

  selectApp(app: any) {
    this.selectedApplication = app;
    this.responses = {};
    if (app.responses) app.responses.forEach((r: any) => this.responses[r.question_key] = r.answer);
  }

  onPrivacyScroll(event: any) {
    const el = event.target;
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 50) this.privacyScrolled = true;
  }

  acceptPrivacy() {
    if (this.privacyAccepted) {
      this.api.acceptPrivacy().subscribe(() => this.auth.getProfile().subscribe());
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
        this.selectedApplication.attachments.push(att);
      });
    }
  }

  hasAttachment(questionKey: string): boolean {
    return this.selectedApplication?.attachments?.some((a: any) => a.question_key === questionKey);
  }

  submitForm(e: Event, isDraft = false) {
    e.preventDefault();
    this.errorMsg = '';

    // Validar obligatorias solo al enviar definitivo (el borrador no exige)
    if (!isDraft) {
      const missing = this.allQuestions().filter(q => q.required && !this.isAnswered(q));
      if (missing.length) {
        this.errorMsg = 'Faltan campos obligatorios: ' + missing.map(q => q.label).join(', ');
        return;
      }
    }

    this.isSubmitting = true;
    const formattedResponses = Object.keys(this.responses).map(key => ({ key, value: this.responses[key] }));

    this.api.submitResponses(this.selectedApplication.id, formattedResponses, isDraft).subscribe({
      next: () => {
        this.successMsg = isDraft ? 'Progreso guardado correctamente' : '¡Información enviada con éxito!';
        setTimeout(() => {
          this.successMsg = '';
          if (!isDraft) { this.selectedApplication = null; this.loadApplications(); }
          this.isSubmitting = false;
        }, 1800);
      },
      error: () => { this.errorMsg = 'Error al procesar. Intenta de nuevo.'; this.isSubmitting = false; }
    });
  }

  logout() { localStorage.clear(); window.location.href = '/login'; }
}
