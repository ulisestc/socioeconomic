import * as React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface SparkItem {
  id: string | number;
  imageSrc: string;
  title: string;
  description: string;
}

export interface SparksCarouselProps {
  title: string;
  subtitle: string;
  items: SparkItem[];
}

/**
 * Carrusel horizontal con scroll (adaptación del sparks-carousel de 21st.dev).
 * Tarjetas con imagen + título + descripción y botones de navegación.
 */
export const SparksCarousel = React.forwardRef<HTMLDivElement, SparksCarouselProps>(
  ({ title, subtitle, items }, ref) => {
    const carouselRef = React.useRef<HTMLDivElement>(null);
    const [isAtStart, setIsAtStart] = React.useState(true);
    const [isAtEnd, setIsAtEnd] = React.useState(false);

    const scroll = (direction: 'left' | 'right') => {
      if (carouselRef.current) {
        const { scrollLeft, clientWidth } = carouselRef.current;
        const scrollAmount = clientWidth * 0.8;
        const newScrollLeft = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
        carouselRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
      }
    };

    React.useEffect(() => {
      const checkScrollPosition = () => {
        if (carouselRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
          setIsAtStart(scrollLeft < 10);
          setIsAtEnd(scrollLeft + clientWidth >= scrollWidth - 10);
        }
      };

      const currentRef = carouselRef.current;
      if (currentRef) {
        checkScrollPosition();
        currentRef.addEventListener('scroll', checkScrollPosition);
      }
      window.addEventListener('resize', checkScrollPosition);

      return () => {
        if (currentRef) currentRef.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', checkScrollPosition);
      };
    }, [items]);

    return (
      <section ref={ref} className="w-full" aria-labelledby="sparks-title">
        <div className="container mx-auto px-4 md:px-6">
          {/* header */}
          <div className="mb-6">
            <h2 id="sparks-title" className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              {title}
            </h2>
            <p className="mt-1 text-muted-foreground">{subtitle}</p>
          </div>

          {/* carrusel */}
          <div className="relative">
            <div
              ref={carouselRef}
              className="scrollbar-hide flex w-full space-x-4 overflow-x-auto pb-4"
            >
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  className="group w-[300px] flex-shrink-0"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                >
                  <div className="h-full overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md">
                    <img
                      alt={item.title}
                      className="aspect-video w-full object-cover transition-transform group-hover:scale-105"
                      src={item.imageSrc}
                      loading="lazy"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold leading-tight text-card-foreground">{item.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {!isAtStart && (
              <button
                onClick={() => scroll('left')}
                className={cn(
                  'absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border bg-background/60 p-2 text-foreground shadow-md backdrop-blur-sm transition-opacity hover:bg-background/80',
                )}
                aria-label="Desplazar a la izquierda"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}
            {!isAtEnd && (
              <button
                onClick={() => scroll('right')}
                className={cn(
                  'absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border bg-background/60 p-2 text-foreground shadow-md backdrop-blur-sm transition-opacity hover:bg-background/80',
                )}
                aria-label="Desplazar a la derecha"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>
      </section>
    );
  },
);

SparksCarousel.displayName = 'SparksCarousel';
