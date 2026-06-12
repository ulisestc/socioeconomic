import { useRef, type ReactNode } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

import { cn } from '@/lib/utils';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
}

/**
 * Reveal 3D al hacer scroll (adaptación de la técnica de container-scroll-animation de 21st.dev).
 * Cada bloque entra con una leve inclinación (rotateX), escala y fade conforme aparece en pantalla,
 * para dar una sensación premium y seria. Respeta `prefers-reduced-motion`.
 */
export function ScrollReveal({ children, className }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // El progreso va de 0 (borde superior del bloque entrando por abajo) a 1 (llega al centro).
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'start center'],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [80, 0]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [10, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.96, 1]);

  if (reduceMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={cn('[perspective:1200px]', className)}>
      <motion.div style={{ opacity, y, rotateX, scale, transformOrigin: 'center top', willChange: 'transform' }}>
        {children}
      </motion.div>
    </div>
  );
}
