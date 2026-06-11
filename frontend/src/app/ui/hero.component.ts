import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, FileCheck2, Camera, BarChart3, ShieldCheck } from 'lucide-angular';
import { AuroraBackgroundComponent } from './aurora-background.component';

/**
 * Hero de la landing/login (adaptación del hero-section-7 de 21st.dev).
 * "CAPDIR — estudios hechos fácilmente" con aurora detrás y elementos flotantes.
 */
@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, AuroraBackgroundComponent],
  template: `
    <aurora-background className="rounded-3xl">
      <section class="relative flex min-h-[42vh] flex-col items-center justify-center overflow-hidden px-6 py-16 text-center sm:py-20">
        <!-- iconos flotantes -->
        <div class="pointer-events-none absolute inset-0 hidden sm:block" aria-hidden="true">
          <div class="absolute left-[8%] top-[18%] grid h-14 w-14 place-items-center rounded-2xl border border-border bg-card/80 text-primary shadow-md animate-[float_6s_ease-in-out_infinite]">
            <lucide-icon [img]="FileCheckIcon" [size]="26"></lucide-icon>
          </div>
          <div class="absolute right-[10%] top-[14%] grid h-12 w-12 place-items-center rounded-2xl border border-border bg-card/80 text-primary shadow-md animate-[float_6s_ease-in-out_infinite] [animation-delay:0.8s]">
            <lucide-icon [img]="CameraIcon" [size]="22"></lucide-icon>
          </div>
          <div class="absolute bottom-[16%] left-[14%] grid h-12 w-12 place-items-center rounded-2xl border border-border bg-card/80 text-primary shadow-md animate-[float_6s_ease-in-out_infinite] [animation-delay:1.4s]">
            <lucide-icon [img]="ChartIcon" [size]="22"></lucide-icon>
          </div>
          <div class="absolute bottom-[20%] right-[12%] grid h-14 w-14 place-items-center rounded-2xl border border-border bg-card/80 text-primary shadow-md animate-[float_6s_ease-in-out_infinite] [animation-delay:0.4s]">
            <lucide-icon [img]="ShieldIcon" [size]="26"></lucide-icon>
          </div>
        </div>

        <span class="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <span class="h-1.5 w-1.5 rounded-full bg-primary"></span>
          CAPDIR · Capacitación Directiva
        </span>
        <h1 class="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl">
          Estudios <span class="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">hechos fácilmente</span>
        </h1>
        <p class="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
          El solicitante llena su estudio en línea, el entrevistador corrobora y aprueba,
          y el expediente se entrega en PDF. Sin papel, sin transcripciones manuales.
        </p>
      </section>
    </aurora-background>
  `,
})
export class HeroComponent {
  readonly FileCheckIcon = FileCheck2;
  readonly CameraIcon = Camera;
  readonly ChartIcon = BarChart3;
  readonly ShieldIcon = ShieldCheck;
}
