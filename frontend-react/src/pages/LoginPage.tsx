import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, ArrowLeft, Home } from 'lucide-react';

import { useAuth, panelPath } from '@/lib/auth';
import { api } from '@/lib/api';
import { CapdirLogo } from '@/components/CapdirLogo';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/ios-spinner';

const inputClass =
  'w-full mt-2 px-3 py-2 bg-transparent text-foreground outline-none border border-input focus:border-primary shadow-sm rounded-lg transition-colors';

/**
 * Login (adaptación del login-with-listed-provider de 21st.dev, sin registro ni proveedores sociales).
 * Conserva el flujo de login + recuperación de credenciales del frontend Angular.
 * Muestra un spinner con fade al entrar a la pantalla.
 */
export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Splash con fade entre el botón "Iniciar sesión" y la pantalla de login.
  const [entering, setEntering] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setEntering(false), 400);
    return () => clearTimeout(t);
  }, []);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState('');

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const u = await login({ username, password });
      navigate(panelPath(u));
    } catch {
      setError('Credenciales inválidas. Verifica tu usuario y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const onReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResetStatus('');
    try {
      await api.resetPassword(resetEmail);
      setResetStatus('¡Listo! Si el correo existe, recibirás tu usuario y una contraseña temporal en breve.');
      setTimeout(() => setShowReset(false), 4000);
    } catch {
      setError('Ocurrió un error al procesar tu solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center px-4">
      {/* splash de transición con fade */}
      <AnimatePresence>
        {entering && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 grid place-items-center bg-background text-primary"
          >
            <Spinner size="lg" />
          </motion.div>
        )}
      </AnimatePresence>

      <Link
        to="/"
        className="absolute left-4 top-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
      >
        <Home className="h-4 w-4" /> Inicio
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: entering ? 0 : 1, y: entering ? 12 : 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm space-y-8 text-muted-foreground"
      >
        {/* logo */}
        <div className="text-center">
          <Link to="/" className="inline-block">
            <CapdirLogo size={96} className="mx-auto" />
          </Link>
        </div>

        {user ? (
          /* sesión ya iniciada */
          <div className="space-y-5 text-center">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground sm:text-3xl">Ya tienes una sesión activa</h3>
              <p>
                Iniciaste sesión como{' '}
                <strong className="text-foreground">{user.first_name || user.username}</strong>.
              </p>
            </div>
            <Button asChild className="w-full">
              <Link to={panelPath(user)}>
                Ir a mi panel <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : !showReset ? (
          /* LOGIN */
          <>
            <div className="space-y-2 text-center">
              <h3 className="text-2xl font-bold text-foreground sm:text-3xl">Inicia sesión</h3>
              <p>Accede con tu usuario y contraseña.</p>
            </div>

            <form onSubmit={onLogin} className="space-y-4">
              <div>
                <label className="font-medium text-foreground">Usuario o correo</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={inputClass}
                  placeholder="Tu usuario o correo"
                />
              </div>
              <div>
                <label className="font-medium text-foreground">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClass} pr-10`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner className="mr-2" /> Cargando...
                  </>
                ) : (
                  'Iniciar sesión'
                )}
              </Button>

              {error && (
                <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-center text-sm font-medium text-destructive">
                  {error}
                </p>
              )}
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowReset(true)}
                className="font-medium text-primary hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </>
        ) : (
          /* RESET */
          <>
            <div className="space-y-2 text-center">
              <h3 className="text-2xl font-bold text-foreground sm:text-3xl">Recuperar acceso</h3>
              <p>Te enviaremos tu usuario y una contraseña temporal.</p>
            </div>

            <form onSubmit={onReset} className="space-y-4">
              <div>
                <label className="font-medium text-foreground">Correo electrónico</label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className={inputClass}
                  placeholder="tu@correo.com"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner className="mr-2" /> Enviando...
                  </>
                ) : (
                  'Recuperar mis credenciales'
                )}
              </Button>

              {resetStatus && (
                <p className="rounded-lg border border-success/20 bg-success/10 px-3 py-2 text-center text-sm font-medium text-[hsl(142_71%_30%)]">
                  {resetStatus}
                </p>
              )}
              {error && (
                <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-center text-sm font-medium text-destructive">
                  {error}
                </p>
              )}
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowReset(false)}
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Volver al login
              </button>
            </div>
          </>
        )}
      </motion.div>
    </main>
  );
}
