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

  // Aurora multicolor (azul/índigo/violeta) como el snippet original.
  auroraGradient =
    'repeating-linear-gradient(100deg, #3b82f6 10%, #a5b4fc 15%, #93c5fd 20%, #ddd6fe 25%, #60a5fa 30%)';
  radialMask = 'radial-gradient(ellipse at 100% 0%, black 10%, transparent 70%)';
}
