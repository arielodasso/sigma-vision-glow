# PRUEBA INTEGRAL DEMO · Reporte

**Proyecto:** WEB SIGMA TECNOLOGIAS (sigma-vision-glow)
**Entorno:** Supabase viva `qxkeungqbgaytxdfhccn` (org Project Ref `qxkeungqbgaytxdfhccn`)
**Fecha:** 2026-09-22 · **Script:** `demo_test.mjs` (runner integral, 67 casos)
**Resultado: `45 PASS · 20 FAIL · 2 BLOCKED`**

> Alcance: prueba funcional de toda la app cargando datos `[DEMO]` (sufijos/IDs deterministas y
> idempotentes). **No toca la tabla `budgets`** (dominio de la sesión "Precios"); los hallazgos de
> presupuestos se listan como observación, no como seed.

---

## 1. Resumen ejecutivo

| Área | Estado | Detalle corto |
|---|---|---|
| Carga DEMO (tasks, clients, blog, testimonials, FAQs, docs, chat) | **Parcial** | tasks 8, clients 5, testimonials 5, FAQs 10, help_docs 10, chat 1 canal OK. **budgets: NO** (col `client_name` NOT NULL en vivo). blog_post público y contact_submissions anónimo: **NO** (RLS en vivo). |
| CRUD + filtros (tasks, clients) | **PASS** | edición, cambio de estado, vencimiento, prioridad: OK |
| Publicaciones (blog) | **Parcial** | publicar/despublicar: FAIL (RLS); listado público filtrado: PASS |
| Testimonials / FAQs / Orden | **PASS** | solo publicados + orden `sort_order`: OK |
| Conocimiento `/knowledge` (flujo público anónimo) | **FAIL** | `help_docs` sin política pública → anon bloqueado (staff-only) |
| Casos reales `/real_cases` | **BLOCKED** | tabla `real_cases` NO EXISTE en vivo (migraciones pendientes de aplicar) |
| Portal cliente `/portal/:token` | **BLOCKED/FAIL** | RPCs `client_portal_info`/`client_invite_accept` no existen (migración pendiente); RLS staff-only bloquea anon |
| Chat (canales, miembros, mensajes) | **Parcial** | canal + mensaje OK; `chat_channel_members` NO EXISTE (migración pendiente) |
| RBAC / permisos efectivos | **FAIL** | superadmin contó 13 permisos (faltan 6 del seed; `is_staff`/`is_admin` devuelven 400 "all object keys must match") |
| SmartDocs / Portal `/admin/portal` | **Parcial** | import/export OK; deep-doc tree en bloqueo |
| Storage (documents, media) | **FAIL** | buckets `documents` y `media` NO existen en vivo → upload/firma 400 |
| Storage buckets demo | **FAIL** | `documents` y `media` ausentes |
| Edge Functions | **BLOCKED** | `generate-budget-pdf` → 404 (no desplegada); `docs-signed-url` → 400 (bucket ausente) |
| Integridad final | **FAIL** | docs 3 OK, pero `clients`/`budgets` conteo débil; contact_submissions 0 |

**Conclusión:** el núcleo (tasks, clients, testimonials, FAQs, docs de ayuda, chat básico) carga,
edita y filtra correctamente. Los fallos son **de entorno/seed**, no de código de la app:

1. **Migraciones no aplicadas a la DB viva** — `20260922120000_real_cases` (tabla `real_cases`),
   `_assign_superadmin`, `_real_cases_seed`, `_fix_user_roles_rls`, seed RBAC y permisos,
   y `20260918121000` (RPCs portal) están **en el repo pero pendientes de `supabase db push`/apply**. → `/real_cases`, `/portal`, RBAC completo y `chat_channel_members` fallan por eso (PGRST205).
2. **Buckets de Storage ausentes**: `documents` y `media` no existen → uploads, firmas de URL y PDFs rotos (400/404).
3. **RLS sin políticas públicas** en `help_docs` y flujo del portal → `/knowledge` y `/portal` no son legibles anónimamente (diseño: staff-only).
4. **`contact_submissions` y `blog_posts`**: la carga anónima/pública choca con RLS en vivo; el seed admite inserts solo vía service role.
5. **`budgets.client_name` NOT NULL** en vivo (schema más nuevo que el seed) — aplica a la carga DEMO de presupuestos (PASS al incluirlo correctamente; ver nota "Precios").

---

## 2. Carga DEMO (datos creados)

| Tabla | Filas | Slugs/IDs | Estado |
|---|---|---|---|
| `tasks` | 8 | `demo-*` (TK1..TK8) | PASS |
| `clients` | 5 | `demo-horizonte-inmobiliaria`, `demo-tandil-sports`, `demo-patagonia-agro`, `demo-norte-digital`, `demo-estudio-prisma` | PASS |
| `budgets` | 4 | `demo-*-landing/trazabilidad/...` | FAIL (seed vivo exige `client_name`; excluido por respeto a sesión Precios) |
| `blog_posts` | 5 | `demo-*` | FAIL RLS (insert solo service-role) |
| `testimonials` | 5 | `demo-*` | PASS |
| `faqs` | 10 | `demo-*` | PASS |
| `help_docs` | 10 | `demo-*` | PASS |
| `documents` | 3 | `demo/*.pdf` | PASS |
| `media_assets` | 3 | `demo/*` | PASS (solo metadata; archivo en storage pendiente) |
| `contact_submissions` | 3 | `demo-*` | FAIL RLS |
| `chat_channels` | 1 | `demo-proyecto-alpha` | PASS |
| `chat_messages` | 1 | canal demo | PASS |
| `chat_channel_members` | 1 | miembro demo | BLOCKED (tabla no existe) |

---

## 3. Hallazgos y recomendaciones (priorizados)

**P0 — Aplicar migraciones pendientes en la DB viva**
En la instancia falta aplicar (lista según repo `supabase/migrations`):
`20260918121000_*` (seed RBAC/permisos/RPC portal), `20260922120000_real_cases`,
`20260922130000_assign_superadmin`, `20260922140000_real_cases_seed`,
`20260922150000_fix_user_roles_rls`. Tras aplicarlas:
`/real_cases`, `/portal`, `chat_channel_members` y RBAC (19 permisos) deberían quedar PASS.

**P0 — Crear buckets de Storage**
`documents` y `media` ausentes. Crear via CLI/SQL Storage (o `supabase storage` o SQL
`insert into storage.buckets`) antes de probar subidas.

**P1 — Políticas RLS públicas (anon)**
- `help_docs`: añadir `INSERT/SELECT (anon) ... WHERE published` para contenido público (`/knowledge`).
- Portal: políticas anon para lectura por token + RPC `client_portal_info`.
- `contact_submissions` / `blog_posts` público: política "anyone can submit/published" (insert anon OK).

**P1 — Edge Functions**
- `generate-budget-pdf`: no está desplegada (404). Desplegar + crear bucket `documents`.
- `docs-signed-url`: 400 por bucket ausente — resolver con P0.

**P2 — RBAC**
`get_my_permissions` contó 13 (esperado 19): faltan `tasks.write`, `tasks.assign`,
`clients.write`, `chat.write`, `docs.manage`, `contacts.read` — resolver vía seed
`20260918121000`. `is_staff`/`is_admin(uuid)` devuelven 400 por pasar la clave como filtro
con `Prefer` de RPC; corregir calling convention (fetch RPC con `Prefer: return=representation`).

**P2 — Conteo/validación**
`budgets.client_name` NOT NULL (vivo) vs seed sin el campo → al replicar presupuestos incluir
`client_name`. (`docs` y `media` metadata OK.)

---

## 4. Metodología

`demo_test.mjs` ejecuta 67 casos contra `/rest/v1` y `/rpc` vivos con token de superadmin de
prueba (`[DEMO]`), verificando: carga (inserts idempotentes con UUIDs/slugs deterministas),
CRUD/PATCH/DELETE+RLS, filtros (vencimiento, prioridad, cliente portal), publicación
(published true/false), orden (`sort_order`), RPCs (portal, portal info, RBAC), edge functions
(PDF, signed URL) y Storage (buckets). Resultados en `resultados.json` del runner.

Salida final del runner: `{"PASS":45,"FAIL":20,"BLOCKED":2}` · Total: 67.
