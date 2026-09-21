# Funcionalidades de Admin por Perfil / Rol

## Resumen de Roles

| Rol | Descripción | Acceso a Admin |
|-----|-------------|----------------|
| **superadmin** | Acceso total al sistema, gestión de roles, configuración global, todo el CRM | Completo |
| **admin** | Gestión completa de contenidos, clientes, equipo, budgets. Sin configuración global | Completo (excepto Configuración) |
| **moderator** | Contenidos (blog, testimonios, FAQs, multimedia, SEO), colaboración en tareas y chat | Parcial |
| **empleado** | Tareas asignadas, chat, agenda, documentos, contactos. Sin gestión de usuarios | Básico |
| **user** | Solo lectura básica: tareas propias, chat | Mínimo |

---

## Detalle de Permisos por Sección de Admin

### 1. Dashboard (`/admin`)
- **Permiso requerido**: `tasks.read`
- **Roles**: superadmin, admin, moderator, empleado, user
- **Funcionalidad**: Vista general con métricas, tareas recientes, actividad

### 2. Tareas (`/admin/tareas`)
- **Permiso requerido**: `tasks.read` / `tasks.write`
- **Roles**: superadmin, admin, moderator, empleado
- **Funcionalidad**:
  - Listado de tareas con filtros
  - Crear/editar/eliminar tareas (write)
  - Asignar tareas a usuarios
  - Cambiar estado, prioridad, fechas

### 3. Contenidos (`/admin/contenidos`)
#### 3.1 Blog (`/admin/contenidos/blog`)
- **Permiso requerido**: `contents.manage`
- **Roles**: superadmin, admin, moderator
- **Funcionalidad**:
  - CRUD completo de posts
  - Publicar/despublicar
  - SEO (title, description)
  - Categorías, imagen destacada
  - Editor rico (TipTap)

#### 3.2 Testimonios (`/admin/contenidos/testimonios`)
- **Permiso requerido**: `contents.manage`
- **Roles**: superadmin, admin, moderator
- **Funcionalidad**:
  - CRUD de testimonios
  - Nombre, cargo, empresa, contenido, rating
  - Orden de visualización
  - Publicar/despublicar

#### 3.3 Casos Reales (`/admin/contenidos/casos`)
- **Permiso requerido**: `contents.manage`
- **Roles**: superadmin, admin, moderator
- **Funcionalidad**:
  - CRUD de casos reales
  - Nombre, descripción, logo, URL
  - Cliente vinculado (opcional)
  - **Servicios relacionados** (checkboxes multi-servicio)
  - Orden de visualización
  - Publicar/despublicar
  - **Los casos aparecen en la home y páginas de servicio según el servicio seleccionado**

#### 3.4 FAQs (`/admin/contenidos/faqs`)
- **Permiso requerido**: `contents.manage`
- **Roles**: superadmin, admin, moderator
- **Funcionalidad**:
  - CRUD de FAQs por categoría
  - Pregunta, respuesta, orden
  - Publicar/despublicar
  - Se muestran en páginas de servicio según categoría

#### 3.5 Multimedia (`/admin/contenidos/multimedia`)
- **Permiso requerido**: `media.manage`
- **Roles**: superadmin, admin, moderator
- **Funcionalidad**:
  - Biblioteca de archivos
  - Subir/eliminar imágenes, documentos
  - Organización por carpetas

#### 3.6 SEO (`/admin/contenidos/seo`)
- **Permiso requerido**: `seo.read`
- **Roles**: superadmin, admin, moderator
- **Funcionalidad**:
  - Dashboard de métricas SEO
  - Sitemap, robots.txt
  - Análisis de indexación

### 4. Agenda (`/admin/agenda`)
- **Permiso requerido**: `agenda.read`
- **Roles**: superadmin, admin, moderator, empleado
- **Funcionalidad**:
  - Calendario de reuniones
  - Integración Google Calendar
  - Gestión de citas

### 5. Contactos (`/admin/contactos`)
- **Permiso requerido**: `contacts.read`
- **Roles**: superadmin, admin, moderator, empleado, user
- **Funcionalidad**:
  - Bandeja de envíos de formulario de contacto
  - Ver detalles, estado, reenviar

### 6. Clientes (`/admin/clientes`)
#### 6.1 Listado (`/admin/clientes`)
- **Permiso requerido**: `clients.read`
- **Roles**: superadmin, admin, moderator, empleado
- **Funcionalidad**:
  - CRUD de clientes
  - Nombre, empresa, email, teléfono, WhatsApp
  - Estado, notas
  - **Portal habilitado** (toggle)

#### 6.2 Presupuestos (`/admin/presupuestos`)
- **Permiso requerido**: `budgets.manage`
- **Roles**: superadmin, admin
- **Funcionalidad**:
  - Listado y editor de presupuestos
  - Items, costos, mantenimiento
  - Estados: borrador, enviado, aceptado, rechazado
  - Generar PDF

#### 6.3 Cotizador (`/admin/cotizador`)
- **Permiso requerido**: `budgets.manage`
- **Roles**: superadmin, admin
- **Funcionalidad**:
  - Calculador interactivo de presupuestos
  - Configuración de precios base

#### 6.4 Documentos (`/admin/clientes/documentos`)
- **Permiso requerido**: `docs.read`
- **Roles**: superadmin, admin, moderator, empleado
- **Funcionalidad**:
  - Gestión de documentos por cliente
  - Subir, descargar, eliminar

#### 6.5 Invitaciones (`/admin/clientes/invitaciones`)
- **Permiso requerido**: `clients.invite`
- **Roles**: superadmin, admin
- **Funcionalidad**:
  - Enviar invitaciones al portal de clientes
  - Token de acceso único
  - Reenviar, revocar

#### 6.6 Portal (`/admin/clientes/portal`)
- **Permiso requerido**: `clients.invite`
- **Roles**: superadmin, admin
- **Funcionalidad**:
  - Configurar URL base del portal
  - Requerir autenticación
  - Expiración de sesión

### 7. Equipo (`/admin/equipo`)
#### 7.1 Directorio (`/admin/equipo`)
- **Permiso requerido**: `team.manage`
- **Roles**: superadmin, admin
- **Funcionalidad**:
  - Listado de miembros del equipo
  - Ver perfil, rol, estado activo/inactivo
  - Editar datos básicos

#### 7.2 Roles (`/admin/equipo/roles`)
- **Permiso requerido**: `team.manage`
- **Roles**: superadmin, admin
- **Funcionalidad**:
  - Ver asignaciones de roles (usuario + rol)
  - **Asignar nuevo rol** a usuario existente
  - **Editar rol** de usuario (cambiar rol)
  - **Eliminar rol** de usuario
  - Búsqueda por email, nombre, rol
  - Jerarquía visual de roles

#### 7.3 Invitaciones (`/admin/equipo/invitaciones`)
- **Permiso requerido**: `team.manage`
- **Roles**: superadmin, admin
- **Funcionalidad**:
  - Invitar nuevos miembros por email
  - Seleccionar rol inicial
  - Token de invitación, expiración
  - Reenviar, cancelar

#### 7.4 Organigrama (`/admin/equipo/organigrama`)
- **Permiso requerido**: `team.manage`
- **Roles**: superadmin, admin
- **Funcionalidad**:
  - Visualización jerárquica del equipo
  - Manager → Reportes directos

### 8. Chat Equipo (`/admin/chat`)
- **Permiso requerido**: `chat.read` / `chat.write`
- **Roles**: superadmin, admin, moderator, empleado, user
- **Funcionalidad**:
  - **Canales**: crear, editar, eliminar
  - **Miembros**: agregar/quitar usuarios a canales
  - Mensajería en tiempo real
  - Canal por defecto (general)

### 9. Conocimiento (`/admin/conocimiento`)
#### 9.1 Documentos (`/admin/conocimiento/documentos`)
- **Permiso requerido**: `docs.read`
- **Roles**: superadmin, admin, moderator, empleado
- **Funcionalidad**:
  - Drive interno de documentación
  - CRUD de documentos (título, slug, categoría, contenido)
  - Publicar/despublicar
  - Orden por categoría
  - **Se publican automáticamente en `/knowledge`**

#### 9.2 Ayuda (`/admin/conocimiento/ayuda`)
- **Permiso requerido**: `help.manage`
- **Roles**: superadmin, admin
- **Funcionalidad**:
  - Gestión de artículos de ayuda
  - Categorías, orden
  - Público en portal editorial

#### 9.3 Portal Editorial (`/admin/conocimiento/portal`)
- **Permiso requerido**: `help.manage`
- **Roles**: superadmin, admin
- **Funcionalidad**:
  - Configurar URL pública del portal
  - Requerir autenticación (Supabase Auth)
  - Permitir búsqueda pública
  - Expiración de sesión (días)
  - Vista previa en vivo

### 10. Configuración (`/admin/configuracion`)
- **Permiso requerido**: `settings.manage`
- **Roles**: superadmin, admin
- **Funcionalidad**:
  - Configuración global del CRM
  - Solo superadmin y admin ven esta sección

---

## Matriz de Acceso Rápida

| Sección | superadmin | admin | moderator | empleado | user |
|---------|:----------:|:-----:|:---------:|:--------:|:----:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Tareas | ✅ | ✅ | ✅ | ✅ | 👁️ |
| Blog | ✅ | ✅ | ✅ | ❌ | ❌ |
| Testimonios | ✅ | ✅ | ✅ | ❌ | ❌ |
| Casos Reales | ✅ | ✅ | ✅ | ❌ | ❌ |
| FAQs | ✅ | ✅ | ✅ | ❌ | ❌ |
| Multimedia | ✅ | ✅ | ✅ | ❌ | ❌ |
| SEO | ✅ | ✅ | ✅ | ❌ | ❌ |
| Agenda | ✅ | ✅ | ✅ | ✅ | ❌ |
| Contactos | ✅ | ✅ | ✅ | ✅ | ✅ |
| Clientes (Listado) | ✅ | ✅ | ✅ | ✅ | ❌ |
| Presupuestos | ✅ | ✅ | ❌ | ❌ | ❌ |
| Cotizador | ✅ | ✅ | ❌ | ❌ | ❌ |
| Documentos Cliente | ✅ | ✅ | ✅ | ✅ | ❌ |
| Invitaciones Cliente | ✅ | ✅ | ❌ | ❌ | ❌ |
| Portal Cliente | ✅ | ✅ | ❌ | ❌ | ❌ |
| Directorio Equipo | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Roles Equipo** | ✅ | ✅ | ❌ | ❌ | ❌ |
| Invitaciones Equipo | ✅ | ✅ | ❌ | ❌ | ❌ |
| Organigrama | ✅ | ✅ | ❌ | ❌ | ❌ |
| Chat Equipo | ✅ | ✅ | ✅ | ✅ | ✅ |
| Documentos Conocimiento | ✅ | ✅ | ✅ | ✅ | ❌ |
| Ayuda | ✅ | ✅ | ❌ | ❌ | ❌ |
| Portal Editorial | ✅ | ✅ | ❌ | ❌ | ❌ |
| Configuración | ✅ | ✅ | ❌ | ❌ | ❌ |

**Leyenda**: ✅ = Acceso completo (CRUD), 👁️ = Solo lectura, ❌ = Sin acceso

---

## Rutas Públicas Relacionadas

| Ruta | Descripción | Fuente de Datos |
|------|-------------|-----------------|
| `/knowledge` | Portal editorial público | `help_docs` (published=true) |
| `/knowledge/:slug` | Artículo individual | `help_docs` |
| `/portal` | Portal de clientes | `clients`, `budgets`, `documents` |
| `/portal/:token` | Acceso por invitación | `client_invites` |
| `/servicios/:slug` | Página de servicio | `real_cases` filtrados por servicio |
| `/` (Home) | Casos destacados | `real_cases` (servicio=desarrollo-web) |

---

## Notas Importantes

1. **Casos Reales**: Los casos creados en `/admin/contenidos/casos` aparecen automáticamente en:
   - Home page (filtrados por servicio "desarrollo-web")
   - Páginas de servicio correspondientes (filtrados por slug de servicio)
   - Deben tener `published=true` y al menos un servicio seleccionado

2. **Portal Editorial**: Los documentos de `/admin/conocimiento/documentos` con `published=true` aparecen automáticamente en `/knowledge`

3. **Portal de Clientes**: Requiere invitación (`client_invites`) o login. Muestra presupuestos, documentos y estado general del cliente.

4. **Roles**: Un usuario puede tener múltiples roles. El sistema usa el más alto (superadmin > admin > moderator > empleado > user)

5. **Superadmin actual**: `arielodassotec@gmail.com` (asignado via migración `20260922130000_assign_superadmin.sql`)

---

## Migraciones Relevantes

| Archivo | Descripción |
|---------|-------------|
| `20260918120000_crm_rbac.sql` | RBAC base (roles, permisos, funciones) |
| `20260918121000_crm_seeds.sql` | Seeds de permisos y superadmin inicial |
| `20260922120000_real_cases.sql` | Tabla `real_cases` |
| `20260922130000_assign_superadmin.sql` | Asignar superadmin a arielodassotec@gmail.com |
| `20260922140000_real_cases_seed.sql` | Seed de 15 casos reales para home/servicios |