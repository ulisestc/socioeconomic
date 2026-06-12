import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export interface LightboxImage {
  src: string;
  label?: string;
}

interface ImageLightboxProps {
  images: LightboxImage[];
  className?: string;
  thumbClassName?: string;
}

/**
 * Visor de evidencias construido sobre el Dialog (originui).
 * Muestra miniaturas; al hacer clic abre la imagen en grande con anterior/siguiente.
 */
export function ImageLightbox({ images, className, thumbClassName }: ImageLightboxProps) {
  const [index, setIndex] = useState<number | null>(null);
  const open = index !== null;
  const current = index !== null ? images[index] : null;

  const go = (dir: -1 | 1) => {
    if (index === null) return;
    setIndex((index + dir + images.length) % images.length);
  };

  if (images.length === 0) return null;

  return (
    <>
      <div className={cn('flex flex-wrap gap-2', className)}>
        {images.map((img, i) => (
          <button
            key={img.src + i}
            type="button"
            onClick={() => setIndex(i)}
            className={cn(
              'overflow-hidden rounded-lg border border-border transition hover:ring-2 hover:ring-ring',
              thumbClassName,
            )}
          >
            <img src={img.src} alt={img.label ?? `Evidencia ${i + 1}`} className="h-20 w-20 object-cover" />
          </button>
        ))}
      </div>

      <Dialog open={open} onOpenChange={(o) => !o && setIndex(null)}>
        <DialogContent className="max-w-3xl gap-2 sm:max-w-3xl">
          <DialogTitle className="text-sm font-medium text-muted-foreground">
            {current?.label ?? 'Evidencia'}{' '}
            {images.length > 1 && index !== null && (
              <span className="text-xs">
                ({index + 1}/{images.length})
              </span>
            )}
          </DialogTitle>
          <div className="relative flex items-center justify-center">
            {current && (
              <img
                src={current.src}
                alt={current.label ?? 'Evidencia'}
                className="max-h-[70vh] w-auto rounded-lg object-contain"
              />
            )}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border bg-background/70 text-foreground shadow backdrop-blur hover:bg-background"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border bg-background/70 text-foreground shadow backdrop-blur hover:bg-background"
                  aria-label="Siguiente"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
