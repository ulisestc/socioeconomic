import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, Check, ArrowRight, Eye, EyeOff } from 'lucide-react';

import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/ios-spinner';

/**
 * Multi-step de primer inicio de sesión (port de credential-setup.component.ts).
 * El solicitante confirma que su usuario será su correo y define su contraseña definitiva.
 */
export default function CredentialSetup() {
  const { user, getProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!user.must_change_credentials) navigate('/applicant');
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      await api.changeCredentials(password);
      await getProfile();
      navigate('/applicant');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'No se pudo guardar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-10">
      {/* progreso */}
      <div className="mb-6 flex items-center gap-2">
        <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-border'}`} />
        <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-border'}`} />
      </div>

      <div className="ses-card p-8">
        {step === 1 ? (
          <div>
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Configura tu acceso</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Iniciaste con credenciales <strong>temporales</strong>. Para proteger tu información,
              configuremos tu acceso definitivo. A partir de ahora tu usuario será tu correo electrónico.
            </p>

            <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4">
              <span className="ses-label">Tu nuevo usuario</span>
              <div className="flex items-center gap-2">
                <Mail className="h-[18px] w-[18px] text-muted-foreground" />
                <span className="font-semibold text-foreground">{user?.email || '—'}</span>
              </div>
            </div>

            <Button className="mt-6 w-full" onClick={() => setStep(2)} disabled={!user?.email}>
              Continuar <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div>
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Crea tu contraseña</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Mínimo 8 caracteres. Guárdala bien: la usarás junto con tu correo.
            </p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label className="ses-label">Nueva contraseña</label>
                <div className="relative">
                  <input
                    type={show ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="ses-input pr-10"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="ses-label">Confirmar contraseña</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="ses-input"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                  {error}
                </p>
              )}

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Atrás
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? <Spinner className="mr-2" /> : <Check className="mr-2 h-4 w-4" />}
                  {loading ? 'Guardando...' : 'Finalizar y entrar'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
