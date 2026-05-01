# Contexto del Proyecto: MVP Estudios Socioeconómicos

## Rol del Agente
Eres un Desarrollador Full-Stack Senior Autónomo. Tu objetivo es escribir código funcional listo para producción a la máxima velocidad.

## Reglas Estrictas de Interacción (Modo Rápido)
1. **CERO TUTORÍA:** No generes pseudocódigo, no expliques conceptos de programación, omite introducciones.
2. **ENTREGABLES:** Responde únicamente con código estructurado, comandos de terminal o configuraciones.

## Stack Tecnológico Obligatorio
* **Backend:** Django, Django REST Framework, SimpleJWT.
* **Frontend:** Angular.
* **Base de Datos:** MySQL.
* **Infraestructura:** Docker, Docker Compose y smtp4dev (para correos locales).

## Reglas de Arquitectura y Seguridad
* **Variables de Entorno:** Prohibido hardcodear credenciales. Usar `.env` estrictamente.
* **Privacidad de Datos (PII):** Toda aceptación de Aviso de Privacidad debe registrar timestamp e IP.
* **Roles de Usuario:**
  1. Admin Maestro: Acceso global.
  2. Consultor: Crea cuentas, asocia solicitantes a formularios, revisa y aprueba/rechaza presencialmente.
  3. Solicitante: Rol temporal que recibe credenciales por correo, acepta privacidad y llena su estudio.

# Proyecto: Sistema de Estudios Socioeconómicos (SES)

## Estado de la Sesión Actual
Se ha evolucionado el MVP con un motor dinámico de formularios, soporte multimedia y mejoras profundas de UX/Flujo. El sistema ya no depende de estructuras fijas y permite migrar formatos físicos (Excel) automáticamente.

### Logros de esta Sesión:
- **Importador de Excel (Dinámico):** Endpoint que lee archivos `.xls` reales, extrae etiquetas de celdas específicas y genera la estructura base para el constructor.
- **Constructor de Formularios Pro:** Nueva vista independiente (`/builder`) que permite previsualizar importaciones, añadir secciones, y definir tipos de campo (Foto, Tel, Textarea, etc.).
- **Gestión de Usuarios Automatizada:** 
    - Generación automática de `username` (inicial + apellido + random).
    - Eliminación de fricción: el consultor solo ingresa Nombre, Apellido y Email.
    - Envío de correo diferido: las credenciales se envían SÓLO cuando se asigna el primer estudio.
- **Soporte Multimedia:** Modelo `Attachment` vinculado a preguntas, almacenamiento en `media/` y limpieza automática con `django-cleanup`.
- **Cumplimiento y Privacidad:**
    - Auditoría completa (IP/Timestamp) de aceptación de aviso.
    - Bloqueo de avance hasta lectura completa (scroll) y aceptación global.
- **Mejoras de UX:**
    - Recuperación de credenciales (Usuario + Pass temporal) vía email.
    - Visibilidad de contraseña (ojo) en Login.
    - Dashboard de solicitante con gestión de múltiples estudios (Pendientes vs Completados).
    - Alertas contextuales cerca de botones de acción.
    - Previsualización de respuestas y fotos directamente en la tabla del consultor.

---

## Roadmap / Pendientes Próximos:

### 1. Mejoras de Validación y Tipado
- [ ] Implementar validaciones de lado del servidor para campos específicos (Regex para teléfonos, longitud de campos).
- [ ] Agregar soporte para tablas dinámicas (ej: Tabla de empleos previos) dentro del JSON de respuestas.

### 2. PDF y Reportes
- [ ] Refinar el `pdf_template.html` para que agrupe las respuestas por las nuevas Secciones definidas en el constructor.
- [ ] Incluir las fotos de evidencia subidas dentro del PDF final.

### 3. Seguridad Adicional
- [ ] Implementar expiración de sesiones y refresco de tokens (JWT Refresh).
- [ ] Agregar cifrado adicional para campos extremadamente sensibles si fuera necesario.

---

## Notas Técnicas
- **Frontend:** Angular 21 (Standalone), Node 22.
- **Backend:** Django 5.x, Python 3.11-slim. Dependencias clave: `xlrd` (Excel), `django-cleanup` (Media), `weasyprint` (PDF).
- **Auth:** Login por `username` (generado). El consultor accede a `/consultant`, el solicitante a `/applicant`.
- **Rutas:** `/login`, `/consultant`, `/applicant`, `/builder`.
- **Mail:** smtp4dev (Puerto 25/5000).
