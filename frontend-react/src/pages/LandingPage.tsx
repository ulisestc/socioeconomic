import { Hero } from '@/components/marketing/Hero';
import { QuienesSomos } from '@/components/marketing/QuienesSomos';
import { Servicios } from '@/components/marketing/Servicios';
import { Contacto } from '@/components/marketing/Contacto';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

/**
 * Inicio: landing one-page con las 4 secciones (anclas usadas por la navbar).
 * Cada sección bajo el hero aparece con animación 3D al hacer scroll (ScrollReveal).
 */
export default function LandingPage() {
  return (
    <>
      <Hero />
      <ScrollReveal>
        <QuienesSomos />
      </ScrollReveal>
      <ScrollReveal>
        <Servicios />
      </ScrollReveal>
      <ScrollReveal>
        <Contacto />
      </ScrollReveal>
    </>
  );
}
