import { SparksCarousel, type SparkItem } from '@/components/ui/sparks-carousel';

const img = (id: string) => `https://images.unsplash.com/photo-${id}?q=80&w=600&auto=format&fit=crop`;

const servicios: SparkItem[] = [
  {
    id: 'cursos',
    title: 'Cursos',
    description: 'Capacitación contable, fiscal y de desarrollo humano para tu equipo y tu empresa.',
    imageSrc: img('1524178232363-1fb2b075b655'),
  },
  {
    id: 'consultoria',
    title: 'Consultoría',
    description: 'Personal calificado que garantiza la calidad y seriedad de cada tema que atendemos.',
    imageSrc: img('1600880292203-757bb62b4baf'),
  },
  {
    id: 'estudios',
    title: 'Estudios Socioeconómicos',
    description: 'Para créditos hipotecarios, automotrices, laborales, becas y financiamiento en general.',
    imageSrc: img('1554224155-6726b3ff858f'),
  },
  {
    id: 'cobranza',
    title: 'Cobranza Extrajudicial',
    description: 'Recuperación de cartera en los estados de Puebla y Tlaxcala.',
    imageSrc: img('1450101499163-c8848c66ca85'),
  },
  {
    id: 'verificaciones',
    title: 'Verificaciones',
    description: 'Verificaciones en el Registro Público de la Propiedad y del Comercio.',
    imageSrc: img('1551288049-bebda4e38f71'),
  },
  {
    id: 'financiamiento',
    title: 'Financiamiento',
    description: 'Te ayudamos a obtener un crédito acorde a tus necesidades.',
    imageSrc: img('1579621970563-ebec7560ff3e'),
  },
];

/**
 * Sección "Nuestros Servicios" con carrusel horizontal (sparks-carousel de 21st.dev).
 */
export function Servicios() {
  return (
    <section id="servicios" className="py-20 sm:py-28">
      <SparksCarousel
        title="Nuestros Servicios"
        subtitle="Soluciones integrales para acompañarte en cada objetivo de tu empresa."
        items={servicios}
      />
    </section>
  );
}
