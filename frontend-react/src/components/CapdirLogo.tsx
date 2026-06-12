import { cn } from '@/lib/utils';

interface CapdirLogoProps {
  /** Altura en px. */
  size?: number;
  /** Contenedor blanco redondeado (para fondos oscuros). */
  boxed?: boolean;
  className?: string;
}

/**
 * Logo de Capdir Consultores. Por defecto usa el PNG sin fondo (`logo_no_bg.png`),
 * ideal para superficies claras. Sobre fondos oscuros usar `boxed` (caja blanca).
 */
export function CapdirLogo({ size = 40, boxed = false, className }: CapdirLogoProps) {
  return (
    <img
      src="/logo_no_bg.png"
      alt="Capdir Consultores"
      style={{ height: size }}
      className={cn('w-auto select-none object-contain', boxed && 'rounded-xl bg-white p-2 shadow-sm', className)}
    />
  );
}
