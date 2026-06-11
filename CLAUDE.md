# CLAUDE.md — Sistema de Estudios Socioeconómicos (SES)

Guía para próximas sesiones. Código, UI y comentarios en **español**.

## Qué es
App que digitaliza el flujo de estudios socioeconómicos (antes papel → Excel manual).
Flujo del producto: **el solicitante llena su estudio en línea** (con fotos/documentos) → **el entrevistador/consultor corrobora** (revisa respuestas y fotos, puede subir sus propias fotos de la visita) y **aprueba o regresa con comentarios** → se genera un **PDF** que se manda a la entidad (banco/escuela).

## Stack
- **Backend:** Django 5 + DRF + SimpleJWT · MySQL 8 (PyMySQL) · WeasyPrint (PDF) · django-cleanup · Pillow (vía WeasyPrint).
- **Frontend:** Angular 21 standalone (Node 22) + **Tailwind v4** (`@tailwindcss/postcss` vía `.postcssrc.json`) con **tokens estilo shadcn** (HSL en `src/styles.css`, `@theme inline`) + **lucide-angular** (iconos vía `[img]`) + `clsx`/`tailwind-merge` (`cn()` en `src/app/lib/utils.ts`). Color primario azul `#2563eb` = `--primary`.
- **Infra:** Docker Compose → `db` (MySQL), `mail` (smtp4dev), `backend`, `frontend`.

### UI / componentes (rediseño CAPDIR)
- `src/app/ui/` = equivalente al `/components/ui` de shadcn: `capdir-logo`, `aurora-background`, `app-header` (fijo, logo + campana de notificaciones del consultor), `app-footer`, `hero` (landing del login), `tubelight-nav` (tabs del consultor), `notification-bell` (deriva de `getApplications()` los `FILLED`, marca leídos en `localStorage`), `accordion-item` (form del solicitante), `study-card` (lista unificada del solicitante: una card con estatus a la derecha).
- Shell global: `app.ts` monta `<app-header>` + `<router-outlet>` + `<app-footer>`.
- **Clases reutilizables** en `styles.css` (`@layer components`): `.ses-card`, `.ses-input`, `.ses-label`, `.ses-btn-primary/outline/ghost/danger/success`, `.ses-badge-pending/filled/approved/rejected`. Úsalas antes de reinventar estilos. Ojo: `@apply` no acepta clases propias entre sí.
- ⚠️ `node_modules` del front vive en un **volumen Docker** (`frontend_node_modules`); el `node_modules` local es root/vacío. Instala deps **dentro del contenedor**: `docker compose exec frontend npm install ...`. Build/verify: `docker compose exec frontend npx ng build`.

## Cómo correr (local)
```bash
docker compose up --build
```
- Front: http://localhost:4200 · API: http://localhost:8000/api · Correos (smtp4dev): http://localhost:5000
- Login seed del consultor: **`consultant` / `password123`**
- `backend/start.sh` (es el `CMD` de la imagen) **migra y siembra solo**. El backend espera al healthcheck de MySQL antes de arrancar.
- ⚠️ **No** vuelvas a poner `command:` en el servicio `backend` del compose: sobrescribe `start.sh` y entonces no migra ni siembra (bug que ya se corrigió).

## Roles y rutas
- **CONSULTANT (entrevistador):** `/consultant`, `/builder`. Crea solicitantes, arma formularios (manual), asigna estudios, revisa/aprueba/**rechaza**, sube **fotos de corroboración**, previsualiza/exporta PDF.
- **APPLICANT (solicitante):** `/applicant`. Recibe credenciales **temporales** por correo, en su **primer login** pasa por el multi-step `/configurar-acceso` (cambia usuario→correo + contraseña), acepta aviso de privacidad, llena el formulario (fotos + borrador), ve estatus y **corrige si lo rechazan**.
- Sin guards de ruta (la API sí está protegida por JWT). Login decide a dónde va según `role` y `must_change_credentials`.

## Primer login / credenciales temporales
- `User.must_change_credentials` (default `False`; `True` al crear solicitante y al recuperar contraseña). El serializer `me` lo expone.
- Acción DRF `change_credentials` (`IsApplicant`): fija `username = email`, `set_password`, `must_change_credentials=False`. El JWT vigente sigue válido (identifica por id). Front: `api.changeCredentials()` desde `credential-setup.component`.
- Los correos de `assign_form` (primer envío) y `reset_password` dejan claro que las claves son **temporales** y que en el primer login el usuario será su **correo**.
- Tras el cambio, el login es con **correo** + nueva contraseña (el username autogenerado deja de servir).

## Modelos (`backend/api/models.py`)
`User` (role, campos de privacidad + IP/timestamp, temp_password, **must_change_credentials**) · `FormTemplate(structure JSON)` · `Application(status: PENDING/FILLED/APPROVED/REJECTED, verification_notes)` · `Response(question_key, answer JSON)` · `Attachment(question_key, file ImageField)`.

## Formato de `structure` (CRÍTICO — del que depende todo)
Lista de secciones; lo consumen `seed.py`, el builder, `applicant-form` y `export_pdf`:
```json
[{"section": "Datos Personales",
  "questions": [{"key": "full_name", "label": "Nombre Completo", "type": "text"}]}]
```
- `key` único por pregunta. `type` ∈ `text | textarea | tel | number | file` (`file` = foto).

## PDF (`export_pdf` + `templates/pdf_template.html`)
- WeasyPrint agrupa por secciones. Fotos del solicitante por su `key`; las del entrevistador usan `question_key='corroboracion_visita'` (cualquier key fuera de la estructura) → sección **"Evidencia de Corroboración"**.
- `/media` se sirve **siempre** (`core/urls.py`), incluso con `DEBUG=False`, para que WeasyPrint cargue las imágenes.
- El serializer ya devuelve la **URL absoluta** del attachment → **no** concatenar host en el frontend.
- Dos botones en el panel: 🔍 previsualizar (abre en pestaña) y 📄 descargar.

## Email
smtp4dev (local, no real). Las credenciales del solicitante se envían al **asignar su primer estudio**. Los links usan `FRONTEND_URL`.

## Despliegue (Railway — lo hace el usuario)
- **Front:** `apiUrl` en `src/environments/environment.ts` (dev) y `environment.prod.ts` (prod, vía `fileReplacements` en `angular.json`). Apuntar el prod al backend de Railway.
- **Backend (env):** `SECRET_KEY` (nuevo), `DEBUG=False`, `ALLOWED_HOSTS`, `DATABASE_URL` (MySQL de Railway), `FRONTEND_URL`, `CORS_ALLOWED_ORIGINS`.
- Caveats: FS efímero (los archivos subidos se pierden en cada redeploy); `smtp4dev` tendría que ser un servicio aparte o no llegan correos.

## Decisiones y gotchas
- **Importador de Excel ELIMINADO** (inservible con archivos reales, estaba atado a coordenadas fijas). El constructor de formularios es manual.
- MySQL 8 abre el puerto durante su init temporal antes de estar listo → el backend depende del **healthcheck** y `start.sh` reintenta `migrate`.
- El `seed` solo crea "Estudio Básico" **si no existe** (no actualiza). Si cambias su estructura, recrea el volumen (`docker compose down -v`) o borra la plantilla.
- PII: toda aceptación del aviso de privacidad registra **IP + timestamp** (mantener).

## Cómo verificar rápido
Recorrido: login consultor → crear/asignar solicitante → leer credenciales en smtp4dev → entrar como solicitante (incógnito) → aceptar privacidad + llenar + subir foto → enviar → como consultor: revisar, subir foto de corroboración, rechazar (o aprobar) → **Previsualizar/Descargar PDF** (debe traer secciones + fotos). Para producción: `cd frontend && npm run build`.

## Roadmap / pendientes posibles
- Validaciones server-side (regex teléfono, longitudes) y tablas dinámicas (p. ej. empleos previos) en el JSON de respuestas.
- JWT refresh / expiración de sesión; guards de ruta en el front.
- Refinar el PDF por secciones definidas en el builder.
