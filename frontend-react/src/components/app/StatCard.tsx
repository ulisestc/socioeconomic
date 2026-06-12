import type { LucideIcon } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  total: number;
  /** Clases de color para el icono/segmentos (ej. 'text-primary'). */
  accentClassName?: string;
  segments?: number;
}

/**
 * Tarjeta de estadística (look de statistics-card-13 reproducido con nuestro Card):
 * icono + etiqueta, número grande y barra segmentada proporcional al total.
 */
export function StatCard({
  icon: Icon,
  label,
  value,
  total,
  accentClassName = 'text-primary',
  segments = 16,
}: StatCardProps) {
  const ratio = total > 0 ? value / total : 0;
  const filled = Math.round(ratio * segments);

  return (
    <Card className="rounded-xl">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <Icon className={cn('h-4 w-4', accentClassName)} />
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
        </div>

        <div className="text-3xl font-extrabold leading-none text-foreground">{value}</div>

        {/* barra segmentada */}
        <div className="flex gap-1">
          {Array.from({ length: segments }).map((_, i) => (
            <span
              key={i}
              className={cn(
                'inline-block h-3 flex-1 rounded-sm border transition-colors',
                i < filled ? cn('border-current bg-current', accentClassName) : 'border-muted bg-muted',
              )}
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {value}/{total}
          </span>
          <span className="font-semibold text-foreground">{Math.round(ratio * 100)}%</span>
        </div>
      </CardContent>
    </Card>
  );
}
