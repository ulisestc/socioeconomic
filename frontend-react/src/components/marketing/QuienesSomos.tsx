import { Check } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

const ventajas = [
  {
    title: '44 años de experiencia',
    description: 'Cuatro décadas acompañando a empresas y personas a cumplir sus objetivos.',
  },
  {
    title: 'Personal calificado',
    description: 'Un equipo capacitado que garantiza la calidad y seriedad de cada tema.',
  },
  {
    title: 'Cobertura regional',
    description: 'Operamos en los estados de Puebla y Tlaxcala con cercanía y rapidez.',
  },
  {
    title: 'Servicios integrales',
    description: 'Cursos, consultoría, estudios, cobranza, verificaciones y financiamiento.',
  },
  {
    title: 'Confianza y trazabilidad',
    description: 'Procesos verificables y manejo responsable de tu información.',
  },
  {
    title: 'Atención cercana',
    description: 'Te asesoramos en cada paso para que tomes mejores decisiones.',
  },
];

/**
 * Sección "Quiénes Somos" (adaptación del feature-with-advantages de 21st.dev).
 */
export function QuienesSomos() {
  return (
    <section id="quienes-somos" className="w-full bg-muted/40 py-20 lg:py-32">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-start gap-4">
          <Badge>Quiénes Somos</Badge>
          <div className="flex flex-col gap-2">
            <h2 className="max-w-xl text-3xl font-semibold tracking-tighter md:text-5xl">
              Consultoría profesional que cumple los objetivos de tu empresa
            </h2>
            <p className="max-w-xl text-lg leading-relaxed tracking-tight text-muted-foreground">
              En CAPDIR Consultores combinamos experiencia, personal calificado y procesos serios para ofrecer
              soluciones a la medida de empresas y personas.
            </p>
          </div>

          <div className="flex w-full flex-col gap-10 pt-12">
            <div className="grid grid-cols-1 items-start gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {ventajas.map((v) => (
                <div key={v.title} className="flex flex-row items-start gap-4">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  <div className="flex flex-col gap-1">
                    <p className="font-medium text-foreground">{v.title}</p>
                    <p className="text-sm text-muted-foreground">{v.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
