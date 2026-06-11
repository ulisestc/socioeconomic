import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CapdirLogoComponent } from './capdir-logo.component';

/**
 * Footer global (adaptación del footer de 21st.dev, sin redes/Next).
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, CapdirLogoComponent],
  template: `
    <footer class="mt-16 border-t border-border bg-muted/40">
      <div class="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 py-10 text-center">
        <capdir-logo [size]="64"></capdir-logo>
        <p class="max-w-md text-sm text-muted-foreground">
          Digitalizamos el proceso de estudios socioeconómicos: del papel al expediente,
          con seriedad y trazabilidad.
        </p>
        <p class="text-xs text-muted-foreground/80">
          &copy; {{ year }} Capdir Consultores. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  `,
})
export class AppFooterComponent {
  year = new Date().getFullYear();
}
