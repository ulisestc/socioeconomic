import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';

import { api } from '@/lib/api';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Notif {
  id: number;
  applicant: string;
  template: string;
  when: string;
  unread: boolean;
}

const SEEN_KEY = 'ses_seen_notifications';

const getSeen = (): number[] => {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) || '[]');
  } catch {
    return [];
  }
};

const relative = (iso?: string): string => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'hace un momento';
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} d`;
};

/**
 * Campana de notificaciones del consultor (port de notification-bell.component.ts).
 * Deriva los estudios en estado FILLED de getApplications(); leídos en localStorage.
 */
export function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);

  const reload = () => {
    api.getApplications().then((apps: any[]) => {
      const seen = getSeen();
      setNotifs(
        apps
          .filter((a) => a.status === 'FILLED')
          .map((a) => ({
            id: a.id,
            applicant:
              `${a.applicant?.first_name ?? ''} ${a.applicant?.last_name ?? ''}`.trim() ||
              a.applicant?.username ||
              'Solicitante',
            template: a.form_template?.name ?? 'Estudio',
            when: relative(a.updated_at),
            unread: !seen.includes(a.id),
          }))
          .sort((x, y) => y.id - x.id),
      );
    });
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unreadCount = notifs.filter((n) => n.unread).length;

  const addSeen = (id: number) => {
    const seen = Array.from(new Set([...getSeen(), id]));
    localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
  };

  const markRead = (n: Notif) => {
    if (n.unread) {
      setNotifs((prev) => prev.map((x) => (x.id === n.id ? { ...x, unread: false } : x)));
      addSeen(n.id);
    }
    setOpen(false);
    navigate('/consultant');
  };

  const markAllRead = () => {
    const ids = notifs.map((n) => n.id);
    setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));
    localStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(new Set([...getSeen(), ...ids]))));
  };

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) reload();
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Notificaciones"
          className="relative grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-accent"
        >
          <Bell className="h-[18px] w-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-destructive px-1 text-[0.65rem] font-bold text-destructive-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-1">
        <div className="flex items-baseline justify-between gap-4 px-3 py-2">
          <span className="text-sm font-semibold">Notificaciones</span>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs font-medium text-primary hover:underline">
              Marcar todas como leídas
            </button>
          )}
        </div>
        <div className="my-1 h-px bg-border" />
        {notifs.map((n) => (
          <button
            key={n.id}
            onClick={() => markRead(n)}
            className="block w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
          >
            <div className="relative flex items-start pe-4">
              <div className="flex-1 space-y-0.5">
                <p className="text-foreground/80">
                  <span className="font-semibold text-foreground">{n.applicant}</span> envió respuestas en{' '}
                  <span className="font-semibold text-foreground">{n.template}</span> (Folio #{n.id}).
                </p>
                <p className="text-xs text-muted-foreground">{n.when}</p>
              </div>
              {n.unread && <span className="absolute end-0 top-1.5 h-2 w-2 rounded-full bg-primary" />}
            </div>
          </button>
        ))}
        {notifs.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">Sin estudios por revisar.</p>
        )}
      </PopoverContent>
    </Popover>
  );
}
