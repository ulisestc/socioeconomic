import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Wordmark de CAPDIR (Capacitación Directiva).
 * Monograma cuadrado azul + wordmark. `light` para fondos oscuros.
 * Si más adelante hay un logo real, puede sustituirse este componente
 * por una <img src="/logo.svg"> (slot reservado en public/).
 */
@Component({
  selector: 'capdir-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="inline-flex items-center gap-2.5 select-none" [class.cursor-pointer]="true">
      <span class="relative grid place-items-center rounded-xl shadow-sm"
            [class.h-9]="!large" [class.w-9]="!large"
            [class.h-11]="large" [class.w-11]="large"
            style="background-image: linear-gradient(135deg, hsl(221 83% 56%), hsl(231 75% 48%));">
        <svg viewBox="0 0 24 24" fill="none" [attr.width]="large ? 24 : 20" [attr.height]="large ? 24 : 20"
             stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <!-- barras tipo "estudio / reporte" -->
          <path d="M5 19V11" /><path d="M12 19V5" /><path d="M19 19v-6" />
          <path d="M3.5 19h17" opacity="0.85" />
        </svg>
      </span>
      <span class="flex flex-col leading-none" *ngIf="!markOnly">
        <span class="font-extrabold tracking-tight"
              [class.text-lg]="!large" [class.text-2xl]="large"
              [ngClass]="light ? 'text-white' : 'text-foreground'">CAPDIR</span>
        <span class="text-[0.6rem] font-semibold uppercase tracking-[0.18em]"
              [ngClass]="light ? 'text-white/60' : 'text-muted-foreground'">Estudios Socioeconómicos</span>
      </span>
    </span>
  `,
})
export class CapdirLogoComponent {
  @Input() light = false;
  @Input() large = false;
  @Input() markOnly = false;
}
