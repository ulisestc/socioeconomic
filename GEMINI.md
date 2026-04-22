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
  3. Solicitante: Rol temporal que recibe credenciales por correo, acepta privacidad y llena su estudio.# Proyecto: Sistema de Estudios Socioeconómicos (SES)

## Estado de la Sesión Actual
Se ha implementado el MVP (Producto Mínimo Viable) completamente funcional y dockerizado. El sistema permite la gestión integral de estudios desde la creación de plantillas hasta la aprobación final y exportación a PDF.

### Logros de esta Sesión:
- **Infraestructura:** Configuración de Docker (Django, Angular 21, MySQL, smtp4dev).
- **Backend (Django REST Framework):**
    - Modelo de usuario personalizado con roles (Consultor/Solicitante).
    - Constructor de APIs para gestión de plantillas, aplicaciones y respuestas.
    - Sistema de generación de PDF profesional con WeasyPrint.
    - Notificaciones automáticas por correo para credenciales y aprobación.
    - Registro completo en el Admin de Django con seguridad de campos privados.
- **Frontend (Angular 21):**
    - UX/UI moderna y responsiva con CSS puro.
    - **Constructor Visual de Formularios:** Permite a usuarios no técnicos crear plantillas sin usar JSON.
    - Panel de control para consultores con gestión de estados (Pendiente, Llenado, Aprobado).
    - Flujo de solicitante con aceptación de aviso de privacidad y llenado dinámico.
- **Seguridad:** Notas de verificación privadas (solo visibles para consultores mediante lógica de serialización).

---

## Roadmap / Pendientes Próximos:

### 1. Tipos de Preguntas Enriquecidos
- [ ] Implementar soporte para subida de **fotos** (evidencia).
- [ ] Agregar validaciones para campos específicos: **teléfonos, direcciones, ocupaciones**.
- [ ] *Nota:* Pendiente recibir formato oficial para mapear la estructura exacta.

### 2. Aviso de Privacidad y Cumplimiento
- [ ] Funcionalidad para **abrir y leer** el Aviso de Privacidad completo antes de aceptar.
- [ ] Registro de auditoría: Almacenar y mostrar la **IP** y el **Timestamp** exacto de la aceptación en el Admin de Django.

### 3. Gestión de Usuarios Optimizada
- [ ] **Generador automático** de usuarios y contraseñas aleatorias para entrevistados.
- [ ] Ampliar perfiles de entrevistados con campos obligatorios de **Nombres y Apellidos**.

### 4. Mejora en la Revisión de Datos
- [ ] Implementar vista previa de **respuestas del solicitante** directamente en el dashboard del consultor (sin necesidad de exportar a PDF para revisión previa).

---

## Notas Técnicas
- **Frontend:** Angular 21 (Standalone Components), Node 22.
- **Backend:** Django 5.x, Python 3.11-slim-bookworm.
- **DB:** MySQL 8.0.
- **Mail:** smtp4dev capturando en puerto 25 (SMTP) y 5000 (Web UI).
