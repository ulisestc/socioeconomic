import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { ShieldCheck, ArrowLeft, ArrowRight, Save, Send, ClipboardList, CheckCircle2, Image as ImageIcon, Check } from 'lucide-react';

import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/ios-spinner';
import { StudyCard } from '@/components/app/StudyCard';
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/dropzone';

const STATUS_ORDER: Record<string, number> = { PENDING: 0, REJECTED: 1, FILLED: 2, APPROVED: 3 };

const PRIVACY_TEXT = [
  'En cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, se informa que sus datos serán tratados para los fines de validación e investigación socioeconómica.',
  'Recolección de datos: Recabamos información personal, laboral, académica y financiera, incluyendo fotografías de su domicilio para fines de verificación.',
  'Finalidad: Evaluar la veracidad de la información proporcionada en su solicitud laboral o de crédito.',
  'Derechos ARCO: Usted puede ejercer sus derechos de Acceso, Rectificación, Cancelación y Oposición contactando a nuestro departamento de privacidad.',
  'Al continuar y aceptar este aviso, usted otorga su consentimiento expreso para que realicemos las investigaciones pertinentes.',
];

export default function ApplicantForm() {
  const { user, getProfile } = useAuth();
  const navigate = useNavigate();

  const [studies, setStudies] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [privacyScrolled, setPrivacyScrolled] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const loadApplications = () =>
    api.getApplications().then((apps: any[]) => {
      setStudies([...apps].sort((a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9)));
    });

  useEffect(() => {
    if (!user) return;
    if (user.must_change_credentials) {
      navigate('/configurar-acceso');
      return;
    }
    loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ---------- helpers ----------
  const sections: any[] = selected?.form_template?.structure ?? [];
  const allQuestions = (): any[] => sections.flatMap((s) => s.questions || []);

  const hasAttachment = (key: string) => attachments.some((a) => a.question_key === key);

  const isAnswered = (q: any): boolean => {
    if (q.type === 'file') return hasAttachment(q.key);
    if (q.type === 'checkbox') return Array.isArray(responses[q.key]) && responses[q.key].length > 0;
    const v = responses[q.key];
    return !!(v !== undefined && v !== null && String(v).trim());
  };

  const subtitleFor = (app: any) => {
    if (app.status === 'PENDING') return 'Asignado el ' + new Date(app.created_at).toLocaleDateString();
    if (app.status === 'REJECTED') return 'Requiere correcciones';
    if (app.status === 'FILLED') return 'En proceso de validación';
    return 'Expediente enviado';
  };
  const actionFor = (app: any) =>
    app.status === 'PENDING' ? 'Llenar' : app.status === 'REJECTED' ? 'Corregir' : 'Ver estatus';

  const selectApp = (app: any) => {
    setSelected(app);
    setAttachments(app.attachments ?? []);
    const init: Record<string, any> = {};
    (app.responses ?? []).forEach((r: any) => (init[r.question_key] = r.answer));
    setResponses(init);
    setStep(0);
    setErrorMsg('');
  };

  const closeApp = () => {
    setSelected(null);
    loadApplications();
  };

  // ---------- privacidad ----------
  const onPrivacyScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 50) setPrivacyScrolled(true);
  };
  const acceptPrivacy = async () => {
    if (!privacyAccepted) return;
    await api.acceptPrivacy();
    await getProfile();
  };

  // ---------- campos ----------
  const setValue = (key: string, value: any) => setResponses((p) => ({ ...p, [key]: value }));

  const onPhoneInput = (key: string, value: string) => setValue(key, value.replace(/\D/g, '').substring(0, 10));

  const toggleCheckbox = (key: string, opt: string, checked: boolean) => {
    setResponses((p) => {
      const arr: string[] = Array.isArray(p[key]) ? [...p[key]] : [];
      if (checked) {
        if (!arr.includes(opt)) arr.push(opt);
      } else {
        return { ...p, [key]: arr.filter((o) => o !== opt) };
      }
      return { ...p, [key]: arr };
    });
  };

  const onUpload = async (key: string, files: File[]) => {
    if (!selected || files.length === 0) return;
    try {
      const att = await api.uploadAttachment(selected.id, key, files[0]);
      setAttachments((prev) => [...prev.filter((a) => a.question_key !== key), att]);
    } catch {
      toast.error('No se pudo subir el archivo.');
    }
  };

  const submitForm = async (isDraft: boolean) => {
    setErrorMsg('');
    if (!isDraft) {
      const missing = allQuestions().filter((q) => q.required && !isAnswered(q));
      if (missing.length) {
        setErrorMsg('Faltan campos obligatorios: ' + missing.map((q) => q.label).join(', '));
        return;
      }
    }
    setSubmitting(true);
    const formatted = Object.keys(responses).map((key) => ({ key, value: responses[key] }));
    try {
      await api.submitResponses(selected.id, formatted, isDraft);
      toast.success(isDraft ? 'Progreso guardado correctamente.' : '¡Información enviada con éxito!');
      if (!isDraft) closeApp();
    } catch {
      toast.error('Error al procesar. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- render ----------
  if (!user) return null;

  // 1. aviso de privacidad
  if (!user.is_privacy_notice_accepted) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="ses-card p-8 text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Aviso de Privacidad</h2>
          <div
            onScroll={onPrivacyScroll}
            className="my-5 max-h-72 overflow-y-auto rounded-xl border border-border bg-muted/40 p-5 text-left text-sm leading-relaxed text-muted-foreground"
          >
            <h4 className="mb-2 font-semibold text-foreground">
              AVISO DE PRIVACIDAD PARA EL PROCESO DE ESTUDIO SOCIOECONÓMICO
            </h4>
            {PRIVACY_TEXT.map((p, i) => (
              <p key={i} className="mb-2">{p}</p>
            ))}
            <hr className="my-3 border-border" />
            <p>Por favor, lea todo el aviso (haga scroll hasta abajo) para habilitar el botón de aceptación.</p>
          </div>

          {privacyScrolled && (
            <label className="mb-4 flex items-center justify-center gap-2 text-sm font-medium text-foreground">
              <input type="checkbox" checked={privacyAccepted} onChange={(e) => setPrivacyAccepted(e.target.checked)} className="h-4 w-4 accent-[hsl(var(--primary))]" />
              He leído y acepto el Aviso de Privacidad
            </label>
          )}
          <Button className="w-full" onClick={acceptPrivacy} disabled={!privacyAccepted}>
            Acepto y deseo continuar
          </Button>
        </div>
      </div>
    );
  }

  // 2. lista de estudios
  if (!selected) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Mis Estudios</h1>
          <p className="mt-1 text-sm text-muted-foreground">Selecciona un estudio para completarlo o consultar su estatus.</p>
        </header>
        <div className="space-y-3">
          {studies.map((app) => (
            <StudyCard
              key={app.id}
              title={app.form_template.name}
              subtitle={subtitleFor(app)}
              status={app.status}
              actionLabel={actionFor(app)}
              onAction={() => selectApp(app)}
            />
          ))}
          {studies.length === 0 && (
            <div className="ses-card flex flex-col items-center gap-2 p-12 text-center">
              <ClipboardList className="h-8 w-8 text-muted-foreground/60" />
              <p className="text-sm text-muted-foreground">Aún no tienes estudios asignados.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 4. estatus (FILLED / APPROVED)
  if (selected.status === 'FILLED' || selected.status === 'APPROVED') {
    const approved = selected.status === 'APPROVED';
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <BackButton onClick={closeApp} />
        <div className="ses-card p-8 text-center">
          <div className={cnStatus(approved)}>
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">{selected.form_template.name}</h2>
          <span className={`ses-badge mt-2 ${approved ? 'ses-badge-approved' : 'ses-badge-filled'}`}>
            {approved ? 'Aprobado' : 'En revisión'}
          </span>
          <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
            {approved
              ? '¡Felicidades! Tu estudio fue aprobado y el expediente se envió a la institución.'
              : 'Tu información ha sido recibida y está en proceso de validación.'}
          </p>
        </div>
      </div>
    );
  }

  // 3. llenar / corregir (PENDING / REJECTED) — multi-step
  const currentSection = sections[step];
  const progress = sections.length ? ((step + 1) / sections.length) * 100 : 0;
  const isLast = step === sections.length - 1;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <BackButton onClick={() => setSelected(null)} />

      <div className="ses-card p-6 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{selected.form_template.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Puedes guardar tu progreso y continuar más tarde.</p>

        {selected.status === 'REJECTED' && (
          <div className="mt-5 rounded-xl border border-destructive/20 bg-destructive/10 p-4">
            <p className="font-semibold text-destructive">⚠️ El entrevistador solicitó correcciones:</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-destructive/90">
              {selected.verification_notes || 'Revisa tu información y vuelve a enviarla.'}
            </p>
          </div>
        )}

        {/* progreso de pasos */}
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>{currentSection?.section}</span>
            <span>Paso {step + 1} de {sections.length}</span>
          </div>
          <Progress value={progress} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="mt-6 space-y-4"
          >
            {(currentSection?.questions ?? []).map((q: any) => (
              <Field
                key={q.key}
                q={q}
                value={responses[q.key]}
                hasFile={hasAttachment(q.key)}
                onChange={(v) => setValue(q.key, v)}
                onPhone={(v) => onPhoneInput(q.key, v)}
                onToggleCheckbox={(opt, checked) => toggleCheckbox(q.key, opt, checked)}
                onUpload={(files) => onUpload(q.key, files)}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {errorMsg && (
          <p className="mt-4 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
            {errorMsg}
          </p>
        )}

        {/* navegación */}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Atrás
          </Button>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => submitForm(true)} disabled={submitting}>
              {submitting ? <Spinner className="mr-2" /> : <Save className="mr-2 h-4 w-4" />} Guardar Borrador
            </Button>
            {isLast ? (
              <Button onClick={() => submitForm(false)} disabled={submitting}>
                {submitting ? <Spinner className="mr-2" /> : <Send className="mr-2 h-4 w-4" />} Enviar Definitivo
              </Button>
            ) : (
              <Button onClick={() => setStep((s) => Math.min(sections.length - 1, s + 1))}>
                Siguiente <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function cnStatus(approved: boolean) {
  return `mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl ${approved ? 'bg-primary/10 text-primary' : 'bg-success/15 text-success'}`;
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
      <ArrowLeft className="h-3.5 w-3.5" /> Volver
    </button>
  );
}

interface FieldProps {
  q: any;
  value: any;
  hasFile: boolean;
  onChange: (v: any) => void;
  onPhone: (v: string) => void;
  onToggleCheckbox: (opt: string, checked: boolean) => void;
  onUpload: (files: File[]) => void;
}

function Field({ q, value, hasFile, onChange, onPhone, onToggleCheckbox, onUpload }: FieldProps) {
  return (
    <div>
      <label className="ses-label">
        {q.label}
        {q.required && <span className="text-destructive"> *</span>}
      </label>

      {q.type === 'file' ? (
        <>
          <Dropzone accept={{ 'image/*': [] }} maxFiles={1} onDrop={onUpload}>
            <DropzoneEmptyState>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ImageIcon className="h-4 w-4" /> {hasFile ? 'Cambiar archivo' : 'Seleccionar archivo'}
              </div>
            </DropzoneEmptyState>
            <DropzoneContent />
          </Dropzone>
          {hasFile && (
            <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[hsl(142_71%_30%)]">
              <Check className="h-3.5 w-3.5" /> Archivo cargado
            </p>
          )}
        </>
      ) : q.type === 'textarea' ? (
        <textarea className="ses-input min-h-24" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
      ) : q.type === 'tel' ? (
        <input type="tel" className="ses-input" placeholder="10 dígitos" value={value ?? ''} onChange={(e) => onPhone(e.target.value)} />
      ) : q.type === 'number' ? (
        <input type="number" className="ses-input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
      ) : q.type === 'email' ? (
        <input type="email" className="ses-input" placeholder="correo@ejemplo.com" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
      ) : q.type === 'date' ? (
        <input type="date" className="ses-input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
      ) : q.type === 'radio' ? (
        <div className="space-y-2">
          {(q.options ?? []).map((opt: string) => (
            <label key={opt} className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <input type="radio" name={q.key} value={opt} checked={value === opt} onChange={() => onChange(opt)} className="h-4 w-4 accent-[hsl(var(--primary))]" />
              {opt}
            </label>
          ))}
        </div>
      ) : q.type === 'select' ? (
        <select className="ses-input" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">Selecciona una opción...</option>
          {(q.options ?? []).map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : q.type === 'checkbox' ? (
        <div className="space-y-2">
          {(q.options ?? []).map((opt: string) => (
            <label key={opt} className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={Array.isArray(value) && value.includes(opt)}
                onChange={(e) => onToggleCheckbox(opt, e.target.checked)}
                className="h-4 w-4 accent-[hsl(var(--primary))]"
              />
              {opt}
            </label>
          ))}
        </div>
      ) : (
        <input className="ses-input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}
