import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Logo de Capdir Consultores (public/logo.png).
 * El PNG tiene fondo blanco sólido: en superficies claras va directo;
 * sobre fondos oscuros usa `boxed` para mostrarlo en un contenedor blanco.
 */
@Component({
  selector: 'capdir-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <img src="/logo.png" alt="Capdir Consultores"
         class="w-auto object-contain select-none"
         [class.rounded-xl]="boxed"
         [class.bg-white]="boxed"
         [class.p-2]="boxed"
         [class.shadow-sm]="boxed"
         [style.height.px]="size" />
  `,
})
export class CapdirLogoComponent {
  /** Altura en px. */
  @Input() size = 40;
  /** Contenedor blanco redondeado (para fondos oscuros). */
  @Input() boxed = false;
}
