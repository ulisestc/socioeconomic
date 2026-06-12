import { Link } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';

import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';

/**
 * Placeholder temporal para las páginas funcionales que se portarán en la Fase 2
 * (panel del consultor, formulario del solicitante, constructor, configurar-acceso).
 */
export default function Placeholder({ title }: { title: string }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/40 px-6 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Construction className="h-8 w-8" />
      </span>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Esta sección se migrará en la <strong>Fase 2</strong> del refactor a React.
        {user && (
          <>
            {' '}
            Sesión activa como <strong>{user.first_name || user.username}</strong> ({user.role}).
          </>
        )}
      </p>
      <div className="flex gap-2">
        <Button asChild variant="outline">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Inicio
          </Link>
        </Button>
        {user && (
          <Button variant="outline" onClick={logout}>
            Cerrar sesión
          </Button>
        )}
      </div>
    </div>
  );
}
