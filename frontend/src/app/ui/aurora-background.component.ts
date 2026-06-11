import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Fondo "aurora" animado (adaptación del aurora-background de 21st.dev a Angular/CSS).
 * Gradientes azules/índigo desenfocados que se desplazan lentamente.
 * Proyecta su contenido encima.
 */
@Component({
  selector: 'aurora-background',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative overflow-hidden" [class]="className">
      <!-- capa aurora -->
      <div class="pointer-events-none absolute -inset-[12px] opacity-60 blur-[12px] will-change-transform animate-[aurora_60s_linear_infinite]"
           [style.background-image]="auroraGradient"
           style="background-size: 300% 200%; background-position: 50% 50%, 50% 50%;"
           [style.maskImage]="showRadialGradient ? radialMask : null"
           [style.webkitMaskImage]="showRadialGradient ? radialMask : null"></div>
      <!-- velo para legibilidad -->
      <div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/40 via-background/10 to-background/70"></div>
      <div class="relative">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class AuroraBackgroundComponent {
  @Input() className = '';
  @Input() showRadialGradient = true;

  auroraGradient =
    'repeating-linear-gradient(100deg, hsl(221 83% 60%) 10%, hsl(231 70% 70%) 15%, hsl(210 90% 75%) 20%, hsl(250 80% 80%) 25%, hsl(221 83% 65%) 30%)';
  radialMask = 'radial-gradient(ellipse at 100% 0%, black 10%, transparent 70%)';
}
