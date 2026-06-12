import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ClipboardList, Users, FileText, RefreshCw, Eye, Check, X, Download, Search, Trash2, Pencil,
  Send, UserPlus, FileSearch, Inbox, Wrench, Camera, Layers, Clock, ShieldCheck, ShieldX,
} from 'lucide-react';

import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SearchSelect } from '@/components/ui/search-select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/dropzone';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { StatCard } from '@/components/app/StatCard';
import { ImageLightbox, type LightboxImage } from '@/components/app/ImageLightbox';
import { cn } from '@/lib/utils';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Por llenar',
  FILLED: 'Por corroborar',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
};
const BADGE: Record<string, string> = {
  PENDING: 'ses-badge-pending',
  FILLED: 'ses-badge-filled',
  APPROVED: 'ses-badge-approved',
  REJECTED: 'ses-badge-rejected',
};
const FILTERS = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Por llenar', value: 'PENDING' },
  { label: 'Por corroborar', value: 'FILLED' },
  { label: 'Aprobados', value: 'APPROVED' },
  { label: 'Rechazados', value: 'REJECTED' },
];

function labelForKey(app: any, key: string): string {
  const structure = app.form_template?.structure;
  if (Array.isArray(structure)) {
    for (const section of structure) {
      for (const q of section.questions || []) {
        if (q.key === key) return q.label;
      }
    }
  }
  return key;
}

export default function ConsultantDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('studies');

  const [applications, setApplications] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);

  const [studyFilter, setStudyFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const [targetApplicantId, setTargetApplicantId] = useState<number | string | null>(null);
  const [selectedFormId, setSelectedFormId] = useState<number | string | null>(null);
  const [assigning, setAssigning] = useState(false);

  const [detailId, setDetailId] = useState<number | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);

  const [newApplicant, setNewApplicant] = useState({ email: '', first_name: '', last_name: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ kind: 'applicant' | 'template'; id: number } | null>(null);

  const loadApplications = () => api.getApplications().then(setApplications);
  const loadApplicants = () => api.getApplicants().then(setApplicants);
  const loadTemplates = () => api.getTemplates().then(setTemplates);

  useEffect(() => {
    loadApplications();
    loadApplicants();
    loadTemplates();
  }, []);

  const detailApp = useMemo(() => applications.find((a) => a.id === detailId) ?? null, [applications, detailId]);

  const countByStatus = (value: string) =>
    value === 'ALL' ? applications.length : applications.filter((a) => a.status === value).length;

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return applications.filter((a) => {
      const okStatus = studyFilter === 'ALL' || a.status === studyFilter;
      const name = `${a.applicant?.first_name ?? ''} ${a.applicant?.last_name ?? ''}`.toLowerCase();
      const okTerm = !term || name.includes(term) || String(a.id).includes(term);
      return okStatus && okTerm;
    });
  }, [applications, studyFilter, searchTerm]);

  const applicantOptions = applicants.map((a) => ({ id: a.id, label: `${a.first_name} ${a.last_name}`.trim() || a.email }));
  const templateOptions = templates.map((t) => ({ id: t.id, label: t.name }));

  const assignForm = async () => {
    if (!targetApplicantId || !selectedFormId) return;
    setAssigning(true);
    try {
      await api.assignForm(Number(targetApplicantId), Number(selectedFormId));
      toast.success('¡Estudio asignado con éxito!');
      setTargetApplicantId(null);
      setSelectedFormId(null);
      loadApplications();
    } catch {
      toast.error('No se pudo asignar el estudio.');
    } finally {
      setAssigning(false);
    }
  };

  const openDetail = (id: number) => {
    setDetailId(id);
    setReviewAction(null);
    setNotes('');
  };
  const startReview = (id: number, action: 'approve' | 'reject') => {
    setDetailId(id);
    setReviewAction(action);
    setNotes('');
  };
  const submitReview = async () => {
    if (!detailId || !reviewAction) return;
    try {
      if (reviewAction === 'approve') await api.approveApplication(detailId, notes);
      else await api.rejectApplication(detailId, notes);
      toast.success(reviewAction === 'approve' ? 'Estudio aprobado.' : 'Correcciones enviadas al solicitante.');
      setReviewAction(null);
      setNotes('');
      await loadApplications();
    } catch {
      toast.error('No se pudo completar la acción.');
    }
  };

  const uploadCorroboration = async (files: File[]) => {
    if (!detailId || files.length === 0) return;
    setUploading(true);
    try {
      await api.uploadAttachment(detailId, 'corroboracion_visita', files[0]);
      await loadApplications();
      toast.success('Foto de corroboración subida.');
    } catch {
      toast.error('No se pudo subir la foto.');
    } finally {
      setUploading(false);
    }
  };

  const saveApplicant = async () => {
    try {
      if (editingId) {
        await api.updateApplicant(editingId, newApplicant);
        toast.success('Solicitante actualizado.');
      } else {
        await api.createApplicant(newApplicant);
        toast.success('Solicitante registrado.');
      }
      setNewApplicant({ email: '', first_name: '', last_name: '' });
      setEditingId(null);
      loadApplicants();
    } catch {
      toast.error('No se pudo guardar el solicitante.');
    }
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    try {
      if (confirmDelete.kind === 'applicant') {
        await api.deleteApplicant(confirmDelete.id);
        loadApplicants();
        loadApplications();
      } else {
        await api.deleteTemplate(confirmDelete.id);
        loadTemplates();
      }
      toast.success('Eliminado.');
    } catch {
      toast.error('No se pudo eliminar.');
    } finally {
      setConfirmDelete(null);
    }
  };

  const previewPdf = (id: number) =>
    api.exportPdf(id).then((blob) => window.open(window.URL.createObjectURL(blob), '_blank'));
  const downloadPdf = (id: number) =>
    api.exportPdf(id).then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Estudio_${id}.pdf`;
      a.click();
    });

  const evidences: LightboxImage[] = (detailApp?.attachments ?? []).map((att: any) => ({
    src: att.file,
    label: att.question_key === 'corroboracion_visita' ? 'Corroboración' : labelForKey(detailApp, att.question_key),
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Panel de Consultor</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gestiona solicitantes y estudios socioeconómicos.</p>
        </div>
        <Button onClick={() => navigate('/builder')}>
          <Wrench className="mr-2 h-4 w-4" /> Nuevo Formulario
        </Button>
      </header>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="studies"><ClipboardList className="h-4 w-4" /> Estudios</TabsTrigger>
          <TabsTrigger value="applicants"><Users className="h-4 w-4" /> Solicitantes</TabsTrigger>
          <TabsTrigger value="templates"><FileText className="h-4 w-4" /> Plantillas</TabsTrigger>
        </TabsList>

        {/* ===== ESTUDIOS ===== */}
        <TabsContent value="studies" className="space-y-6">
          {/* stat cards */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard icon={Layers} label="Total" value={countByStatus('ALL')} total={countByStatus('ALL') || 1} accentClassName="text-primary" />
            <StatCard icon={Clock} label="Por corroborar" value={countByStatus('FILLED')} total={countByStatus('ALL') || 1} accentClassName="text-foreground" />
            <StatCard icon={ShieldCheck} label="Aprobados" value={countByStatus('APPROVED')} total={countByStatus('ALL') || 1} accentClassName="text-success" />
            <StatCard icon={ShieldX} label="Rechazados" value={countByStatus('REJECTED')} total={countByStatus('ALL') || 1} accentClassName="text-destructive" />
          </div>

          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            {/* asignar */}
            <aside className="ses-card h-fit p-6">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-primary">Asignar Nuevo Estudio</h3>
              <label className="ses-label">Solicitante</label>
              <div className="mb-3">
                <SearchSelect items={applicantOptions} value={targetApplicantId} onChange={setTargetApplicantId} placeholder="Buscar solicitante..." />
              </div>
              <label className="ses-label">Plantilla</label>
              <div className="mb-4">
                <SearchSelect items={templateOptions} value={selectedFormId} onChange={setSelectedFormId} placeholder="Buscar plantilla..." />
              </div>
              <Button className="w-full" onClick={assignForm} disabled={!targetApplicantId || !selectedFormId || assigning}>
                <Send className="mr-2 h-4 w-4" /> Asignar Estudio
              </Button>
            </aside>

            {/* tabla */}
            <main className="ses-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-border bg-muted/40 px-5 py-4">
                <h3 className="font-semibold text-foreground">Estudios en Curso</h3>
                <Button variant="ghost" size="icon" onClick={loadApplications} title="Actualizar">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              {/* filtros */}
              <div className="flex flex-col gap-3 border-b border-border px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {FILTERS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setStudyFilter(f.value)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                        studyFilter === f.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent',
                      )}
                    >
                      {f.label}
                      <span className={cn('grid h-4 min-w-4 place-items-center rounded-full px-1 text-[0.6rem]', studyFilter === f.value ? 'bg-white/25' : 'bg-foreground/10')}>
                        {countByStatus(f.value)}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="relative w-full lg:w-64">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="ses-input pl-10" placeholder="Buscar por solicitante..." />
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
                  <Inbox className="h-8 w-8 text-muted-foreground/60" />
                  <p className="text-sm text-muted-foreground">No hay estudios en este filtro.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Solicitante</TableHead>
                      <TableHead>Folio</TableHead>
                      <TableHead>Plantilla</TableHead>
                      <TableHead>Estatus</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium text-foreground">
                          {app.applicant.first_name} {app.applicant.last_name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">#{app.id}</TableCell>
                        <TableCell className="text-muted-foreground">{app.form_template.name}</TableCell>
                        <TableCell>
                          <span className={cn('ses-badge', BADGE[app.status])}>{STATUS_LABEL[app.status]}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1.5">
                            <IconAction label="Ver detalle" onClick={() => openDetail(app.id)} icon={<Eye className="h-4 w-4" />} />
                            {app.status === 'FILLED' && (
                              <>
                                <IconAction label="Aprobar" onClick={() => startReview(app.id, 'approve')} icon={<Check className="h-4 w-4" />} variant="success" />
                                <IconAction label="Rechazar / pedir correcciones" onClick={() => startReview(app.id, 'reject')} icon={<X className="h-4 w-4" />} variant="danger" />
                              </>
                            )}
                            <IconAction label="Previsualizar PDF" onClick={() => previewPdf(app.id)} icon={<FileSearch className="h-4 w-4" />} />
                            <IconAction label="Descargar PDF" onClick={() => downloadPdf(app.id)} icon={<Download className="h-4 w-4" />} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </main>
          </div>
        </TabsContent>

        {/* ===== SOLICITANTES ===== */}
        <TabsContent value="applicants" className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="ses-card h-fit p-6">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-primary">
              {editingId ? 'Editar' : 'Registrar'} Solicitante
            </h3>
            <input className="ses-input mb-2" placeholder="Nombres" value={newApplicant.first_name} onChange={(e) => setNewApplicant((p) => ({ ...p, first_name: e.target.value }))} />
            <input className="ses-input mb-2" placeholder="Apellidos" value={newApplicant.last_name} onChange={(e) => setNewApplicant((p) => ({ ...p, last_name: e.target.value }))} />
            <input className="ses-input mb-4" placeholder="Correo electrónico" value={newApplicant.email} onChange={(e) => setNewApplicant((p) => ({ ...p, email: e.target.value }))} />
            <div className="flex gap-2">
              <Button className="flex-1" onClick={saveApplicant}>
                <UserPlus className="mr-2 h-4 w-4" /> {editingId ? 'Guardar Cambios' : 'Registrar'}
              </Button>
              {editingId && (
                <Button variant="outline" size="icon" onClick={() => { setEditingId(null); setNewApplicant({ email: '', first_name: '', last_name: '' }); }}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </aside>

          <main className="ses-card overflow-hidden">
            <div className="border-b border-border bg-muted/40 px-5 py-4">
              <h3 className="font-semibold text-foreground">Listado de Solicitantes</h3>
            </div>
            {applicants.length === 0 ? (
              <p className="px-5 py-12 text-center text-sm text-muted-foreground">Aún no hay solicitantes.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applicants.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium text-foreground">{a.first_name} {a.last_name}</TableCell>
                      <TableCell className="text-muted-foreground">{a.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1.5">
                          <IconAction label="Editar" icon={<Pencil className="h-4 w-4" />} onClick={() => { setEditingId(a.id); setNewApplicant({ email: a.email, first_name: a.first_name, last_name: a.last_name }); }} />
                          <IconAction label="Eliminar" icon={<Trash2 className="h-4 w-4" />} variant="danger" onClick={() => setConfirmDelete({ kind: 'applicant', id: a.id })} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </main>
        </TabsContent>

        {/* ===== PLANTILLAS ===== */}
        <TabsContent value="templates" className="ses-card overflow-hidden">
          <div className="border-b border-border bg-muted/40 px-5 py-4">
            <h3 className="font-semibold text-foreground">Plantillas de Formularios</h3>
          </div>
          {templates.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-muted-foreground">No hay plantillas.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Creada</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium text-foreground">
                      <span className="inline-flex items-center gap-2">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary"><FileText className="h-4 w-4" /></span>
                        {t.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{new Date(t.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <IconAction label="Eliminar" icon={<Trash2 className="h-4 w-4" />} variant="danger" onClick={() => setConfirmDelete({ kind: 'template', id: t.id })} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>

      {/* ===== DETALLE / REVISIÓN ===== */}
      <Dialog open={detailId !== null} onOpenChange={(o) => !o && (setDetailId(null), setReviewAction(null))}>
        <DialogContent className="max-w-3xl sm:max-w-3xl">
          {detailApp && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Detalle #{detailApp.id} — {detailApp.form_template.name}
                </DialogTitle>
              </DialogHeader>

              <div className="grid gap-4 sm:grid-cols-2">
                {detailApp.responses?.map((resp: any) => (
                  <div key={resp.question_key}>
                    <span className="ses-label">{labelForKey(detailApp, resp.question_key)}</span>
                    <p className="whitespace-pre-wrap break-words text-sm font-medium text-foreground">
                      {Array.isArray(resp.answer) ? resp.answer.join(', ') : resp.answer}
                    </p>
                  </div>
                ))}
              </div>

              {evidences.length > 0 && (
                <div>
                  <span className="ses-label">Evidencia</span>
                  <ImageLightbox images={evidences} />
                </div>
              )}

              {detailApp.status !== 'APPROVED' ? (
                <div>
                  <span className="ses-label">Foto de corroboración (visita)</span>
                  <Dropzone accept={{ 'image/*': [] }} maxFiles={1} disabled={uploading} onDrop={uploadCorroboration} onError={() => toast.error('Archivo no válido.')}>
                    <DropzoneEmptyState>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Camera className="h-4 w-4" /> {uploading ? 'Subiendo...' : 'Arrastra o haz clic para subir una foto de la visita'}
                      </div>
                    </DropzoneEmptyState>
                    <DropzoneContent />
                  </Dropzone>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Estudio aprobado: no se admiten más imágenes.</p>
              )}

              {reviewAction && (
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <h4 className="mb-2 font-semibold text-foreground">
                    {reviewAction === 'approve' ? 'Aprobar Estudio' : 'Rechazar / Pedir correcciones'}
                  </h4>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="ses-input min-h-24"
                    placeholder={reviewAction === 'approve' ? 'Notas de verificación...' : 'Indica qué debe corregir el solicitante...'}
                  />
                  <div className="mt-3 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setReviewAction(null)}>Cancelar</Button>
                    <Button variant={reviewAction === 'approve' ? 'default' : 'destructive'} onClick={submitReview}>
                      {reviewAction === 'approve' ? 'Finalizar Aprobación' : 'Enviar Correcciones'}
                    </Button>
                  </div>
                </div>
              )}

              {!reviewAction && detailApp.status === 'FILLED' && (
                <div className="flex justify-end gap-2">
                  <Button variant="destructive" onClick={() => setReviewAction('reject')}>
                    <X className="mr-2 h-4 w-4" /> Rechazar
                  </Button>
                  <Button onClick={() => setReviewAction('approve')}>
                    <Check className="mr-2 h-4 w-4" /> Aprobar
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== CONFIRMAR BORRADO ===== */}
      <AlertDialog open={confirmDelete !== null} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar {confirmDelete?.kind === 'applicant' ? 'solicitante' : 'plantilla'}?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDelete?.kind === 'applicant'
                ? 'Se borrarán también sus estudios asociados. Esta acción no se puede deshacer.'
                : 'Esta acción no se puede deshacer.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function IconAction({
  label,
  icon,
  onClick,
  variant = 'outline',
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'outline' | 'success' | 'danger';
}) {
  const cls =
    variant === 'success'
      ? 'border-transparent bg-success text-success-foreground hover:bg-success/90'
      : variant === 'danger'
        ? 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90'
        : 'border border-border bg-card hover:bg-accent';
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          className={cn('grid h-9 w-9 place-items-center rounded-lg transition-colors', cls)}
        >
          {icon}
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
