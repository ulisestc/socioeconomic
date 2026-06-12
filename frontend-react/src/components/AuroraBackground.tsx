import { cn } from '@/lib/utils';

interface AuroraBackgroundProps {
  className?: string;
  showRadialGradient?: boolean;
  children?: React.ReactNode;
}

/**
 * Fondo "aurora" animado (port del aurora-background del frontend Angular).
 * Gradientes azules/índigo desenfocados que se desplazan lentamente.
 */
export function AuroraBackground({
  className,
  showRadialGradient = true,
  children,
}: AuroraBackgroundProps) {
  const auroraGradient =
    'repeating-linear-gradient(100deg, #3b82f6 10%, #a5b4fc 15%, #93c5fd 20%, #ddd6fe 25%, #60a5fa 30%)';
  const radialMask = 'radial-gradient(ellipse at 100% 0%, black 10%, transparent 70%)';

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <div
        className="animate-aurora pointer-events-none absolute -inset-[12px] opacity-60 blur-[12px] will-change-transform"
        style={{
          backgroundImage: auroraGradient,
          backgroundSize: '300% 200%',
          backgroundPosition: '50% 50%, 50% 50%',
          maskImage: showRadialGradient ? radialMask : undefined,
          WebkitMaskImage: showRadialGradient ? radialMask : undefined,
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/40 via-background/10 to-background/70" />
      <div className="relative">{children}</div>
    </div>
  );
}
