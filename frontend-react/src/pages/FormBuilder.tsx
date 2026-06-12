import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Save, Trash2, X } from 'lucide-react';

import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface Question {
  key?: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
}
interface Section {
  section: string;
  questions: Question[];
}

const needsOptions = (type: string) => ['radio', 'select', 'checkbox'].includes(type);

/**
 * Constructor de formularios (port de form-builder.component.ts).
 */
export default function FormBuilder() {
  const navigate = useNavigate();
  const [templateName, setTemplateName] = useState('');
  const [sections, setSections] = useState<Section[]>([
    { section: 'Nueva Sección', questions: [{ label: '', type: 'text', required: false }] },
  ]);

  // Helpers inmutables sobre el estado anidado.
  const update = (fn: (draft: Section[]) => void) => {
    setSections((prev) => {
      const copy: Section[] = JSON.parse(JSON.stringify(prev));
      fn(copy);
      return copy;
    });
  };

  const addSection = () =>
    setSections((prev) => [...prev, { section: 'Nueva Sección', questions: [{ label: '', type: 'text', required: false }] }]);
  const removeSection = (i: number) => setSections((prev) => prev.filter((_, idx) => idx !== i));
  const addQuestion = (s: number) => update((d) => d[s].questions.push({ label: '', type: 'text', required: false }));
  const removeQuestion = (s: number, q: number) => update((d) => d[s].questions.splice(q, 1));

  const onTypeChange = (s: number, q: number, type: string) =>
    update((d) => {
      const question = d[s].questions[q];
      question.type = type;
      if (needsOptions(type) && (!question.options || question.options.length === 0)) {
        question.options = ['', ''];
      }
    });

  const addOption = (s: number, q: number) => update((d) => (d[s].questions[q].options ??= []).push(''));
  const removeOption = (s: number, q: number, o: number) => update((d) => d[s].questions[q].options!.splice(o, 1));

  const saveTemplate = async () => {
    const processed = sections.map((sec) => ({
      section: sec.section,
      questions: sec.questions
        .filter((q) => q.label.trim() !== '')
        .map((q) => {
          const base: Question = {
            key: q.key || `q_${Math.random().toString(36).slice(2, 7)}`,
            label: q.label,
            type: q.type,
            required: !!q.required,
          };
          if (needsOptions(q.type)) {
            base.options = (q.options || []).map((o) => (o || '').trim()).filter((o) => o !== '');
          }
          return base;
        }),
    }));

    try {
      await api.createTemplate({ name: templateName, structure: processed });
      toast.success('Plantilla guardada con éxito.');
      setTimeout(() => navigate('/consultant'), 1200);
    } catch {
      toast.error('Error al guardar la plantilla.');
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate('/consultant')}>
            <ArrowLeft className="h-[18px] w-[18px]" />
          </Button>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Constructor de Formularios</h1>
        </div>
        <Button onClick={saveTemplate} disabled={!templateName || sections.length === 0}>
          <Save className="mr-2 h-4 w-4" /> Guardar Plantilla
        </Button>
      </header>

      <div className="ses-card mb-6 p-6">
        <label className="ses-label">Nombre del Formulario</label>
        <input
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          className="ses-input text-lg font-semibold"
          placeholder="Ej: Estudio Laboral Estándar"
        />
      </div>

      {sections.map((section, sIdx) => (
        <div key={sIdx} className="ses-card mb-6 border-l-4 border-l-primary p-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            <input
              value={section.section}
              onChange={(e) => update((d) => (d[sIdx].section = e.target.value))}
              className="w-2/3 border-0 border-b-2 border-transparent bg-transparent px-0 py-1 text-xl font-bold text-primary focus:border-primary focus:outline-none"
              placeholder="Nombre de la Sección"
            />
            <Button variant="destructive" size="sm" onClick={() => removeSection(sIdx)}>
              <Trash2 className="mr-1 h-3.5 w-3.5" /> Eliminar Sección
            </Button>
          </div>

          <div className="space-y-3">
            {section.questions.map((q, qIdx) => (
              <div key={qIdx} className="space-y-3 rounded-lg bg-muted/40 p-3">
                <div className="flex items-start gap-2">
                  <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                    <input
                      value={q.label}
                      onChange={(e) => update((d) => (d[sIdx].questions[qIdx].label = e.target.value))}
                      className="ses-input flex-[2]"
                      placeholder="Texto de la pregunta"
                    />
                    <select
                      value={q.type}
                      onChange={(e) => onTypeChange(sIdx, qIdx, e.target.value)}
                      className="ses-input sm:w-52"
                    >
                      <option value="text">Texto corto</option>
                      <option value="textarea">Texto largo (párrafo)</option>
                      <option value="number">Número</option>
                      <option value="tel">Teléfono</option>
                      <option value="email">Correo electrónico</option>
                      <option value="date">Fecha</option>
                      <option value="file">Imagen / Archivo</option>
                      <option value="radio">Opción múltiple</option>
                      <option value="select">Lista desplegable</option>
                      <option value="checkbox">Casillas de verificación</option>
                    </select>
                  </div>
                  <button
                    onClick={() => removeQuestion(sIdx, qIdx)}
                    title="Eliminar pregunta"
                    className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {needsOptions(q.type) && (
                  <div className="space-y-2 border-t border-border pt-3">
                    <p className="ses-label !mb-0">Opciones</p>
                    {(q.options || []).map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-2">
                        <span className="w-4 text-right text-xs text-muted-foreground">{oIdx + 1}.</span>
                        <input
                          value={opt}
                          onChange={(e) => update((d) => (d[sIdx].questions[qIdx].options![oIdx] = e.target.value))}
                          className="ses-input"
                          placeholder="Texto de la opción"
                        />
                        <button
                          onClick={() => removeOption(sIdx, qIdx, oIdx)}
                          disabled={(q.options?.length ?? 0) <= 1}
                          className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 disabled:opacity-40"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => addOption(sIdx, qIdx)} className="text-sm font-semibold text-primary hover:underline">
                      + Añadir opción
                    </button>
                  </div>
                )}

                <label className="flex w-fit items-center gap-2 text-xs font-medium text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={q.required}
                    onChange={(e) => update((d) => (d[sIdx].questions[qIdx].required = e.target.checked))}
                    className="h-4 w-4 accent-[hsl(var(--primary))]"
                  />
                  Respuesta obligatoria
                </label>
              </div>
            ))}
            <button
              onClick={() => addQuestion(sIdx)}
              className="w-full rounded-lg border border-dashed border-border py-2 text-sm font-semibold text-primary hover:bg-accent"
            >
              + Añadir Pregunta
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={addSection}
        className="w-full rounded-xl border-2 border-dashed border-primary bg-primary/5 py-4 font-bold text-primary hover:bg-primary/10"
      >
        + Añadir Nueva Sección
      </button>
    </div>
  );
}
