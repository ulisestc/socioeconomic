import { Footer } from '@/components/ui/footer';
import { CapdirLogo } from '@/components/CapdirLogo';

/**
 * Footer del sitio de marketing (adaptación del footer de 21st.dev).
 */
export function SiteFooter() {
  return (
    <Footer
      logo={<CapdirLogo size={72} />}
      brandName="CAPDIR Consultores"
      mainLinks={[
        { href: '#inicio', label: 'Inicio' },
        { href: '#quienes-somos', label: 'Quiénes Somos' },
        { href: '#servicios', label: 'Nuestros Servicios' },
        { href: '#contacto', label: 'Contacto' },
      ]}
      legalLinks={[{ href: '#contacto', label: 'Aviso de Privacidad' }]}
      copyright={{
        text: `© ${new Date().getFullYear()} CAPDIR Consultores`,
        license: 'Todos los derechos reservados.',
      }}
    />
  );
}
