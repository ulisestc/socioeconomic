import { Link, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown } from 'lucide-react';

import { useAuth, panelPath } from '@/lib/auth';
import { CapdirLogo } from '@/components/CapdirLogo';
import { NotificationBell } from '@/components/app/NotificationBell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (!parts[0]) return '?';
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

/**
 * Shell de la app autenticada (port de app-header.component.ts).
 * Header fijo: logo + (campana del consultor) + menú de usuario con "Salir".
 * Guard ligero: sin sesión → /login.
 */
export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return <Navigate to="/login" replace />;

  const displayName = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || user.username;
  const roleLabel = user.role === 'CONSULTANT' ? 'Consultor' : 'Solicitante';

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to={panelPath(user)} className="shrink-0">
            <CapdirLogo size={48} />
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {user.role === 'CONSULTANT' && <NotificationBell />}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1.5 shadow-sm transition-colors hover:bg-accent sm:px-3"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {initialsOf(displayName)}
                  </span>
                  <span className="hidden leading-tight sm:block">
                    <span className="block text-xs font-semibold text-foreground">{displayName}</span>
                    <span className="block text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
                      {roleLabel}
                    </span>
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4" /> Salir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
