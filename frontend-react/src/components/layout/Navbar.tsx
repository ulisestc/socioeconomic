import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, LogIn, LayoutDashboard, LogOut } from 'lucide-react';

import { useAuth, panelPath } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { CapdirLogo } from '@/components/CapdirLogo';

const menu = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Quiénes Somos', href: '#quienes-somos' },
  { label: 'Nuestros Servicios', href: '#servicios' },
  { label: 'Contacto', href: '#contacto' },
];

/**
 * Navbar del sitio de marketing (adaptación del navbar1 de 21st.dev).
 * Anclas a las 4 secciones + acceso. Si hay sesión activa muestra "Mi panel" / "Salir"
 * en vez de "Iniciar sesión" (igual que el header de Angular). Versión móvil con Sheet.
 */
export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* logo */}
        <a href="#inicio" className="flex shrink-0 items-center gap-2" aria-label="CAPDIR Consultores">
          <CapdirLogo size={52} />
        </a>

        {/* desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {menu.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* desktop auth */}
        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              <Button asChild size="sm">
                <Link to={panelPath(user)}>
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Mi panel
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" /> Salir
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link to="/login">
                <LogIn className="mr-2 h-4 w-4" /> Iniciar sesión
              </Link>
            </Button>
          )}
        </div>

        {/* mobile */}
        <div className="lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Abrir menú">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>
                  <CapdirLogo size={52} />
                </SheetTitle>
              </SheetHeader>
              <div className="mt-8 flex flex-col gap-2">
                {menu.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <a
                      href={item.href}
                      className="rounded-md px-3 py-2 text-base font-medium text-foreground transition-colors hover:bg-accent"
                    >
                      {item.label}
                    </a>
                  </SheetClose>
                ))}

                {user ? (
                  <>
                    <Button asChild className="mt-4">
                      <Link to={panelPath(user)} onClick={() => setOpen(false)}>
                        <LayoutDashboard className="mr-2 h-4 w-4" /> Mi panel
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setOpen(false);
                        logout();
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Salir
                    </Button>
                  </>
                ) : (
                  <Button asChild className="mt-4">
                    <Link to="/login" onClick={() => setOpen(false)}>
                      <LogIn className="mr-2 h-4 w-4" /> Iniciar sesión
                    </Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
