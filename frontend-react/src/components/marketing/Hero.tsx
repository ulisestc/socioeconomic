import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { ArrowUpRight, LogIn, LayoutDashboard } from 'lucide-react';

import { useAuth, panelPath } from '@/lib/auth';
import { Button } from '@/components/ui/button';

/**
 * Hero de la landing (adaptación del aero-hero-2 de 21st.dev con identidad CAPDIR).
 * Imagen de fondo + velo oscuro + eslogan, stat de 44 años y CTAs, con animación de entrada.
 */
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export function Hero() {
  const { user } = useAuth();
  return (
    <section id="inicio" className="relative flex min-h-[88vh] w-full items-end justify-center">
      {/* fondo con un leve zoom de entrada */}
      <motion.div
        className="absolute inset-0 h-full bg-cover bg-center"
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2084&auto=format&fit=crop)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />
      </motion.div>

      <div className="relative z-10 w-full max-w-7xl px-6 pb-20 pt-28 text-white md:px-8">
        <div className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
          <motion.div className="max-w-3xl space-y-6" variants={container} initial="hidden" animate="show">
            <motion.h1
              variants={item}
              className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl"
            >
              Con CAPDIR Consultores ¡Cumple los objetivos de tu empresa!
            </motion.h1>
            <motion.p variants={item} className="max-w-2xl text-lg font-light text-white/90">
              Cursos, consultoría, estudios socioeconómicos, cobranza, verificaciones y financiamiento.
              Trabajamos con personal calificado garantizando la calidad de cada tema.
            </motion.p>

            <motion.div variants={item} className="flex flex-wrap gap-3 pt-2">
              {user ? (
                <Button asChild size="lg" className="rounded-full">
                  <Link to={panelPath(user)}>
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Ir a mi panel
                  </Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="rounded-full">
                  <Link to="/login">
                    <LogIn className="mr-2 h-4 w-4" /> Iniciar sesión
                  </Link>
                </Button>
              )}
              <Button asChild size="lg" variant="outline" className="rounded-full border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                <a href="#servicios">
                  Conoce nuestros servicios
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </motion.div>
          </motion.div>

          {/* stat de experiencia */}
          <motion.div
            className="shrink-0 rounded-2xl border border-white/20 bg-white/10 px-8 py-6 backdrop-blur"
            initial={{ opacity: 0, y: 28, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="text-5xl font-extrabold leading-none text-white">44</div>
            <div className="mt-2 text-sm font-medium uppercase tracking-wide text-white/80">
              años de experiencia
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
