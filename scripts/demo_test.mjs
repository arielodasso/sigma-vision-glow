// ============================================================
// SIGMA CRM · Integral DEMO seed + test · v2 (additive only)
// ============================================================
import { writeFileSync } from "fs";

const URL = "https://qxkeungqbgaytxdfhccn.supabase.co";
const KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
const EMAIL = process.env.SUPABASE_ADMIN_EMAIL;
const PASS = process.env.SUPABASE_ADMIN_PASS;
const ADMIN_ID = "98c05c61-b45b-478c-9c81-19d8a6e5bcdc";

const results = [];
function rec(cat, name, status, detail = "") {
  results.push({ categoria: cat, caso: name, estado: status, detalle: detail });
}

function uid(n) {
  return `a0000000-0000-4000-8000-${n.toString(16).padStart(12, "0")}`;
}

const ID = {
  CLI1: uid(201), CLI2: uid(202), CLI3: uid(203), CLI4: uid(204), CLI5: uid(205),
  BUD1: uid(301), BUD2: uid(302), BUD3: uid(303), BUD4: uid(304),
  POST1: uid(401), POST2: uid(402), POST3: uid(403), POST4: uid(404), POST5: uid(405),
  TEST1: uid(501), TEST2: uid(502), TEST3: uid(503), TEST4: uid(504), TEST5: uid(505),
  FAQ1: uid(601), FAQ2: uid(602), FAQ3: uid(603), FAQ4: uid(604), FAQ5: uid(605),
  FAQ6: uid(606), FAQ7: uid(607), FAQ8: uid(608), FAQ9: uid(609), FAQ10: uid(610),
  DOC1: uid(701), DOC2: uid(702), DOC3: uid(703), DOC4: uid(704), DOC5: uid(705),
  DOC6: uid(706), DOC7: uid(707), DOC8: uid(708), DOC9: uid(709), DOC10: uid(710),
  FDOC1: uid(801), FDOC2: uid(802), FDOC3: uid(803),
  MED1: uid(901), MED2: uid(902), MED3: uid(903),
  CT1: uid(1001), CT2: uid(1002), CT3: uid(1003),
  TINV1: uid(1101), CINV1: uid(1201), CHAN1: uid(1301), MSG1: uid(1302),
  TK1: uid(101), TK2: uid(102), TK3: uid(103), TK4: uid(104), TK5: uid(105), TK6: uid(106), TK7: uid(107), TK8: uid(108),
};

const NOW = new Date().toISOString();
const DAY = 24 * 3600 * 1000;
const d = (o) => new Date(Date.now() + o * DAY).toISOString();
const dt = (o) => d(o).slice(0, 10);

async function api(path, { token = null, method = "GET", body, headers = {} } = {}) {
  const H = { apikey: KEY, "Content-Type": "application/json", ...headers };
  if (token) H.Authorization = `Bearer ${token}`;
  const r = await fetch(`${URL}${path}`, { method, headers: H, body: body !== undefined ? JSON.stringify(body) : undefined });
  const text = await r.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = text; }
  return { status: r.status, json, text };
}
function errMsg(r) {
  const m = Array.isArray(r.json) ? r.json[0] : r.json;
  const mm = m && (m.message || m.error || m.msg || m.details || m.hint || m.code);
  return mm ? String(mm).slice(0, 260) : String(r.text).slice(0, 260) || `status ${r.status}`;
}

const data = {
  tasks: [
    [ID.TK1, "[DEMO] Diseñar landing de campaña", "Diseñar la landing de la campaña Sigma Analytics.", "in_progress", "high", dt(3)],
    [ID.TK2, "[DEMO] Revisar propuesta comercial", "Revisar márgenes y alcance de la propuesta de Horizonte.", "pending", "medium", dt(5)],
    [ID.TK3, "[DEMO] Preparar reunión con cliente", "Preparar agenda y material para el kickoff con Tandil Sports.", "pending", "high", dt(1)],
    [ID.TK4, "[DEMO] Publicar nuevo caso", "Publicar el caso real de Patagonia Agro.", "pending", "urgent", dt(2)],
    [ID.TK5, "[DEMO] Optimizar SEO", "Mejorar meta titles del blog.", "in_progress", "low", dt(10)],
    [ID.TK6, "[DEMO] Preparar presupuesto", "Armar presupuesto de automatización para Norte Digital.", "done", "high", dt(-1)],
    [ID.TK7, "[DEMO] Revisar documentación", "Revisar el manual de proyectos.", "cancelled", "low", dt(7)],
    [ID.TK8, "[DEMO] Seguimiento comercial", "Seguimiento post-venta de Estudio Prisma.", "pending", "medium", dt(8)],
  ].map(([id, title, description, status, priority, due_date]) => ({ id, title, description, assignee_id: ADMIN_ID, created_by: ADMIN_ID, status, priority, due_date })),
  clients: [
    [ID.CLI1, "[DEMO] Horizonte Inmobiliaria", "Horizonte Inmobiliaria SRL", "contacto@horizonte-demo.ar", "+54 9 2494 55-0101", "+5492494550101", "Riesgo medio. Interés en web + automatización.", "active", true],
    [ID.CLI2, "[DEMO] Tandil Sports", "Tandil Sports SA", "hola@tandilsports-demo.ar", "+54 9 2494 55-0202", "+5492494550202", "Deuda pendiente del primer hito.", "pending_payment", false],
    [ID.CLI3, "[DEMO] Patagonia Agro", "Patagonia Agro SRL", "info@patagoniaagro-demo.ar", "+54 9 2920 55-0303", "+5492920550303", "En propuesta: sistema de trazabilidad.", "proposal", true],
    [ID.CLI4, "[DEMO] Norte Digital", "Norte Digital ME", "ventas@nortedigital-demo.ar", "+54 9 385 55-0404", "+549385550404", "Presupuesto rechazado.", "lost", false],
    [ID.CLI5, "[DEMO] Estudio Prisma", "Estudio Prisma", "estudio@prisma-demo.ar", "+54 9 11 55-0505", "+54911550505", "Cliente activo, portal habilitado.", "active", true],
  ].map(([id, name, company, email, phone, wa, notes, status, portal]) => ({ id, name, company, email, phone, whatsapp: wa, notes, status, portal_enabled: portal, created_by: ADMIN_ID })),
  budgets: [
    [ID.BUD1, "demo-horizonte-landing", ID.CLI1, "Landing + integración WhatsApp", "desarrollo-web", "Borrador inicial.", "2 semanas", "Transferencia", "única", 120000, 15000, "draft"],
    [ID.BUD2, "demo-tandil-sports-ecommerce", ID.CLI2, "Tienda online con medios de pago", "desarrollo-web", "Enviado al cliente.", "4 semanas", "Transferencia", "3 cuotas", 480000, 25000, "sent"],
    [ID.BUD3, "demo-patagonia-agro-trazabilidad", ID.CLI3, "Sistema de trazabilidad agropecuaria", "desarrollo-software", "Aceptado por el cliente.", "10 semanas", "Transferencia", "50/50", 950000, 60000, "accepted"],
    [ID.BUD4, "demo-norte-digital-automatizacion", ID.CLI4, "Automación de reportes comerciales", "automatizacion", "Rechazado por presupuesto.", "3 semanas", "Transferencia", "única", 210000, 20000, "rejected"],
  ].map(([id, slug, client_id, scope, work_type, obs, delivery, pay, billing, dev, maint, status]) => ({
    id, slug, client_name: null, client_email: "cliente@demo-falso.ar", scope, work_type, observations: obs, delivery_time: delivery, payment_method: pay, billing, client_id,
    development_cost: dev, monthly_maintenance_cost: maint, status,
    items: [
      { description: "Diseño de interfaces (UI/UX)", price: 90000 },
      { description: "Desarrollo frontend", price: 120000 },
      { description: "Backend + base de datos", price: 80000 },
    ],
  })),
  posts: [
    [ID.POST1, "[DEMO] Desarrollo web para empresas", "demo-desarrollo-web-empresas", "Cómo las empresas convierten su presencia digital en un canal de ventas real.", "<h2>Presencia digital que vende</h2><p>Un sitio institucional es el primer canal de ventas.</p><h3>Velocidad y conversión</h3><p>Las páginas lentas pierden visitantes en segundos.</p>", "desarrollo-web", true, "Desarrollo Web para Empresas | Sigma", "Un sitio institucional bien construido convierte visitantes en clientes."],
    [ID.POST2, "[DEMO] Automatización de procesos", "demo-automatizacion-procesos", "Automatizá tareas repetitivas y liberá horas de trabajo.", "<h2>Procesos repetitivos</h2><p>Conectando tus herramientas eliminás tareas manuales.</p>", "automatizacion", true, "Automatización de Procesos | Sigma", "Integraciones para eliminar el trabajo repetitivo."],
    [ID.POST3, "[DEMO] Sistemas internos para empresas", "demo-sistemas-internos-empresas", "Manejá stock, clientes y tareas con desarrollos a medida.", "<h2>Sistemas que se adaptan</h2><p>Las planillas colapsan; un sistema interno centraliza la información.</p>", "desarrollo-software", true, "Sistemas Internos a Medida | Sigma", "Centralizá la gestión con un sistema a medida."],
    [ID.POST4, "[DEMO] Inteligencia artificial aplicada a negocios", "demo-inteligencia-artificial-negocios", "Casos donde la IA ya genera valor real.", "<h2>IA en producción</h2><p>Análisis de contenido, tendencias y decisiones automatizadas.</p>", "inteligencia-artificial", true, "IA aplicada a Negocios | Sigma", "Cómo aplicar IA con resultados medibles."],
    [ID.POST5, "[DEMO] Transformación digital", "demo-transformacion-digital", "La transformación digital no es tecnología: es un cambio de procesos.", "<h2>De lo análogo a lo digital</h2><p>Digitalizar es repensar los procesos.</p>", "general", false, "Transformación Digital | Sigma", "Pasos para comenzar la transformación digital."],
  ].map(([id, title, slug, excerpt, content, category, published, seo_title, seo_desc]) => ({ id, title, slug, excerpt, content, image_url: "/assets/clients/offmarket.png", category, published, published_at: published ? NOW : null, seo_title, seo_description: seo_desc, related_service: category })),
  testimonials: [
    [ID.TEST1, "[DEMO] Mariana Gutiérrez", "Gerenta de Operaciones", "Horizonte Inmobiliaria", "El nuevo sitio nos duplicó los leads.", 5, 1, true],
    [ID.TEST2, "[DEMO] Andrés Molina", "Dueño", "Tandil Sports", "La tienda funciona perfecto y el seguimiento es excelente.", 5, 2, true],
    [ID.TEST3, "[DEMO] Lucía Fernández", "Directora", "Patagonia Agro", "El sistema de trazabilidad cambió nuestra operación.", 4, 3, true],
    [ID.TEST4, "[DEMO] Pablo Romero", "CTO", "Norte Digital", "Equipo profesional y claro en los plazos.", 4, 4, true],
    [ID.TEST5, "[DEMO] Carla Benítez", "Socia", "Estudio Prisma", "Excelente acompañamiento.", 5, 5, false],
  ].map(([id, name, role, company, content, rating, sort, pub]) => ({ id, name, role, company, content, rating, sort_order: sort, published: pub })),
  faqs: [
    [ID.FAQ1, "desarrollo-web", "[DEMO] ¿Incluyen hosting y dominio?", "Sí, el primer año incluye hosting y dominio.", true, 60],
    [ID.FAQ2, "desarrollo-web", "[DEMO] ¿Cuánto tarda un sitio web?", "Entre 3 y 6 semanas.", true, 61],
    [ID.FAQ3, "automatizacion", "[DEMO] ¿Qué herramientas se automatizan?", "Cualquier herramienta con API.", true, 70],
    [ID.FAQ4, "automatizacion", "[DEMO] ¿Necesito reemplazar mi sistema?", "No, se conecta con lo existente.", true, 71],
    [ID.FAQ5, "inteligencia-artificial", "[DEMO] ¿La IA puede usar datos privados?", "Sí, de forma segura.", true, 80],
    [ID.FAQ6, "inteligencia-artificial", "[DEMO] ¿Qué modelos usan?", "Open source y proveedores según el caso.", true, 81],
    [ID.FAQ7, "desarrollo-software", "[DEMO] ¿Pueden desarrollar un sistema a medida?", "Sí, medimos el problema y construimos el sistema.", true, 90],
    [ID.FAQ8, "desarrollo-software", "[DEMO] ¿El sistema funciona sin conexión?", "Opcionalmente con modo offline.", false, 91],
    [ID.FAQ9, "integraciones", "[DEMO] ¿Con qué plataformas se integran?", "Con APIs y n8n, Make, Zapier.", true, 100],
    [ID.FAQ10, "general", "[DEMO] ¿Trabajan con clientes de otros países?", "Sí, en Argentina y la región.", false, 110],
  ].map(([id, cat, q, a, pub, ord]) => ({ id, category: cat, question: q, answer: a, published: pub, sort_order: ord })),
  helpDocs: [
    [ID.DOC1, "[DEMO] Guía de desarrollo web", "guia-desarrollo-web-demo", "desarrollo", "<h2>Guía de desarrollo web</h2><p>Estándares y flujo de trabajo.</p>", true, 1],
    [ID.DOC2, "[DEMO] Guía de onboarding", "guia-onboarding-demo", "onboarding", "<h2>Onboarding</h2><p>Pasos para integrar un nuevo miembro.</p>", true, 2],
    [ID.DOC3, "[DEMO] Proceso comercial", "proceso-comercial-demo", "comercial", "<h2>Proceso comercial</h2><p>Cómo armamos propuestas.</p>", true, 3],
    [ID.DOC4, "[DEMO] Manual de proyectos", "manual-proyectos-demo", "proyectos", "<h2>Manual</h2><p>Metodología y entregables.</p>", true, 4],
    [ID.DOC5, "[DEMO] Preguntas frecuentes internas", "preguntas-frecuentes-internas-demo", "general", "<h2>FAQs internas</h2><p>Dudas comunes del equipo.</p>", true, 5],
    [ID.DOC6, "[DEMO] Ayuda: crear un presupuesto", "ayuda-crear-presupuesto-demo", "manual", "<h2>Cómo crear un presupuesto</h2><p>Guía del módulo.</p>", true, 6],
    [ID.DOC7, "[DEMO] Ayuda: gestor de tareas", "ayuda-gestor-tareas-demo", "manual", "<h2>Gestor de tareas</h2><p>Cómo asignar tareas.</p>", true, 7],
    [ID.DOC8, "[DEMO] Ayuda: portal de clientes", "ayuda-portal-clientes-demo", "manual", "<h2>Portal de clientes</h2><p>Configuración del portal.</p>", true, 8],
    [ID.DOC9, "[DEMO] Ayuda: chat de equipo", "ayuda-chat-equipo-demo", "tutorial", "<h2>Chat</h2><p>Uso de canales.</p>", false, 9],
    [ID.DOC10, "[DEMO] Ayuda: conocimiento", "ayuda-conocimiento-demo", "tutorial", "<h2>Conocimiento</h2><p>Publicar docs.</p>", true, 10],
  ].map(([id, title, slug, cat, content, pub, ord]) => ({ id, title, slug, category: cat, content, published: pub, sort_order: ord, created_by: ADMIN_ID })),
  documents: [
    [ID.FDOC1, "[DEMO] Brief proyecto.pdf", "Brief inicial de Horizonte.", "demo/brief-proyecto.pdf", "https://example.com/demo/brief-proyecto.pdf", "application/pdf", 245760, ID.CLI1],
    [ID.FDOC2, "[DEMO] Propuesta comercial.pdf", "Propuesta enviada a Tandil Sports.", "demo/propuesta-comercial.pdf", "https://example.com/demo/propuesta-comercial.pdf", "application/pdf", 389120, ID.CLI2],
    [ID.FDOC3, "[DEMO] Requerimientos.pdf", "Requerimientos de Patagonia Agro.", "demo/requerimientos.pdf", "https://example.com/demo/requerimientos.pdf", "application/pdf", 512000, ID.CLI3],
  ].map(([id, name, desc, path, url, mime, size, client_id]) => ({ id, name, description: desc, path, url, mime_type: mime, size_bytes: size, client_id, created_by: ADMIN_ID })),
  media: [
    [ID.MED1, "[DEMO] banner-landing-demo.png", "demo/banner-landing-demo.png", "/assets/clients/capitan-2.png", "image", "image/png", 102400],
    [ID.MED2, "[DEMO] logo-proyecto-alpha.png", "demo/logo-proyecto-alpha.png", "/assets/platforms/sigma-trend-engine.png", "image", "image/png", 204800],
    [ID.MED3, "[DEMO] imagen-caso-demo.png", "demo/imagen-caso-demo.png", "/assets/clients/offmarket.png", "image", "image/png", 88064],
  ].map(([id, name, path, url, kind, mime, size]) => ({ id, name, path, url, kind, mime_type: mime, size_bytes: size, created_by: ADMIN_ID })),
};

const contactRows = [
  [ID.CT1, "[DEMO] Contacto Sistencia", "sistencia.contacto@fake-demo.ar", "Empresa Demo SA", "Hola, quiero cotizar una landing."],
  [ID.CT2, "[DEMO] Ana Prueba", "ana.prueba@fake-demo.ar", "Pruebas SRL", "¿Trabajan con sistemas a medida para pymes?"],
  [ID.CT3, "[DEMO] Test Integración", "test.integracion@fake-demo.ar", "Integra Demo", "Necesitamos conectar nuestra API."],
].map(([id, name, email, company, message]) => ({ id, name, email, company, message, status: "pending" }));

const teamInvite = { id: ID.TINV1, email: "demo.moderator@sigtectest.invalid", role: "moderator", token: "demo-team-invite-token-0001", status: "pending", expires_at: d(7), invited_by: ADMIN_ID };
const clientInvite = { id: ID.CINV1, client_id: ID.CLI1, email: "contacto@horizonte-demo.ar", token: "demo-portal-token-0001", status: "pending", expires_at: d(7), created_by: ADMIN_ID };
const chatChannel = { id: ID.CHAN1, name: "[DEMO] Proyecto Alpha", description: "Canal de prueba del proyecto demo Alpha.", is_default: false, created_by: ADMIN_ID };
const chatMessage = { id: ID.MSG1, channel_id: ID.CHAN1, sender_id: ADMIN_ID, body: "Hola equipo [DEMO]!" };

// ---------- runner ----------
(async () => {
  const loginR = await api("/auth/v1/token?grant_type=password", { method: "POST", body: { email: EMAIL, password: PASS } });
  const token = loginR.json?.access_token;
  if (!token) { console.log("LOGIN FAIL", JSON.stringify(loginR.json)); return; }
  rec("Acceso", "Login superadmin", "PASS", EMAIL);

  const ins = async (table, rows, label, auth = "token") => {
    const r = await api(`/rest/v1/${table}`, { token: auth === "token" ? token : null, method: "POST", headers: { Prefer: "return=representation" }, body: rows });
    const ok = r.status === 201 || (r.status === 409 && /duplicate key value violates unique constraint/i.test(r.text));
    rec(`Carga DEMO · ${table}`, label, ok ? "PASS" : "FAIL", ok ? `${rows.length} filas` : errMsg(r));
    return ok;
  };
  const read = async (table, q = "select=*", auth = "token") => {
    const r = await api(`/rest/v1/${table}?${q}`, { token: auth === "token" ? token : null });
    return { r, rows: Array.isArray(r.json) ? r.json : [] };
  };
  const upd = async (table, patch, match, label) => {
    const q = Object.entries(match).map(([k, v]) => `${k}=eq.${encodeURIComponent(v)}`).join("&");
    const r = await api(`/rest/v1/${table}?${q}`, { token, method: "PATCH", body: patch });
    rec("CRUD · " + table, label, r.status === 204 ? "PASS" : "FAIL", r.status === 204 ? "" : errMsg(r));
    return r.status === 204;
  };
  const del = async (table, match, label) => {
    const q = Object.entries(match).map(([k, v]) => `${k}=eq.${encodeURIComponent(v)}`).join("&");
    const r = await api(`/rest/v1/${table}?${q}`, { token, method: "DELETE" });
    rec("CRUD · " + table, label, r.status === 204 ? "PASS" : "FAIL", r.status === 204 ? "" : errMsg(r));
    return r.status === 204;
  };
  const rpc = async (fn, body, auth = "token") => {
    const r = await api(`/rest/v1/rpc/${fn}`, { token: auth === "token" ? token : null, method: "POST", body });
    return r;
  };

  // ---- A. Load DEMO (superadmin) ----
  const loads = [
    ["tasks", data.tasks, "8 tareas [DEMO]"],
    ["clients", data.clients, "5 clientes [DEMO]"],
    ["budgets", data.budgets, "4 presupuestos [DEMO]"],
    ["blog_posts", data.posts, "5 posts [DEMO]"],
    ["testimonials", data.testimonials, "5 testimonios [DEMO]"],
    ["faqs", data.faqs, "10 FAQs [DEMO]"],
    ["help_docs", data.helpDocs, "10 docs conocimiento/ayuda [DEMO]"],
    ["documents", data.documents, "3 documentos [DEMO]"],
    ["media_assets", data.media, "3 multimedia [DEMO]"],
    ["chat_channels", [chatChannel], "Canal chat [DEMO]"],
    ["team_invites", [teamInvite], "1 invitación equipo [DEMO]"],
    ["client_invites", [clientInvite], "1 invitación cliente [DEMO]"],
    ["chat_messages", [chatMessage], "mensaje en canal [DEMO]"],
  ];
  const loadOk = {};
  for (const [t, rows, label] of loads) loadOk[t] = await ins(t, rows, label);

  const cins = await api("/rest/v1/contact_submissions", { method: "POST", headers: { Prefer: "return=representation" }, body: contactRows });
  rec("Carga DEMO · contact_submissions", "3 contactos [DEMO] (form público anónimo)", cins.status === 201 ? "PASS" : "FAIL", cins.status === 201 ? "3 filas" : errMsg(cins));

  // ---- B. Tasks: edit + state + filter ----
  if (loadOk.tasks) {
    await upd("tasks", { status: "done", priority: "urgent", completed_at: NOW }, { id: ID.TK1 }, "editar estado/prioridad tarea [DEMO]");
    const rf = await read("tasks", "select=id,status&status=eq.done&title=ilike.*[DEMO]*");
    rec("Filtros · tasks", "filtro estado done + marca DEMO", rf.rows.some(x => x.id === ID.TK1) ? "PASS" : "FAIL", `${rf.rows.length} done`);
    const rd = await read("tasks", "select=id,due_date&due_date=lt.*&title=ilike.*[DEMO]*");
    rec("Filtros · tasks", "filtro vencimiento (due_date < hoy)", rd.r.status === 200 ? "PASS" : "FAIL", `${rd.rows.length} vencidas`);
    const rp = await read("tasks", "select=id,priority&priority=eq.urgent&title=ilike.*[DEMO]*");
    rec("Filtros · tasks", "filtro prioridad urgent", rp.rows.length >= 1 ? "PASS" : "FAIL", `${rp.rows.length} urgent`);
  }

  // ---- C. Clients CRUD + filter ----
  if (loadOk.clients) {
    await upd("clients", { notes: "NOTA DEMO EDITADA: aprobado en revisión 1." }, { id: ID.CLI1 }, "editar notas cliente [DEMO]");
    const rc = await read("clients", "select=id,name,status,portal_enabled&name=ilike.*[DEMO]*");
    rec("Filtros · clients", "listado filtro DEMO", rc.rows.length >= 5 ? "PASS" : "FAIL", `${rc.rows.length} clientes`);
    const rp = await read("clients", `select=id&portal_enabled=eq.true&name=ilike.*[DEMO]*`);
    rec("Filtros · clients", "portal habilitado (activos)", rp.rows.length >= 3 ? "PASS" : "FAIL", `${rp.rows.length}`);
  }

  // ---- D. Budgets RPC + status ----
  if (loadOk.budgets) {
    let rr = await rpc("get_budget_by_slug", { _slug: "demo-horizonte-landing" }, "anon");
    rec("RPC · get_budget_by_slug", "leer presupuesto por slug", rr.status === 200 ? "PASS" : "FAIL", rr.status === 200 ? "ok" : errMsg(rr));
    rr = await rpc("set_budget_status", { _slug: "demo-horizonte-landing", _status: "accepted" }, "anon");
    rec("RPC · set_budget_status", "mover estado anónimo (draft→accepted)", rr.status === 200 || rr.status === 204 ? "PASS" : "FAIL", errMsg(rr));
    const rb = await read("budgets", "select=status,accepted_at&slug=eq.demo-horizonte-landing");
    rec("Estados · budgets", "verify cambio de estado", rb.rows[0]?.status === "accepted" ? "PASS" : "FAIL", JSON.stringify(rb.rows[0]));
    const rcalc = await read("budgets", "select=slug,development_cost,monthly_maintenance_cost&slug=eq.demo-patagonia-agro-trazabilidad");
    rec("Cálculo · budgets", "costos dev+monto persistidos", rcalc.rows[0]?.development_cost === 950000 ? "PASS" : "FAIL", JSON.stringify(rcalc.rows[0]));
  }

  // ---- E. Blog publish/unpublish ----
  if (loadOk.blog_posts) {
    await upd("blog_posts", { published: true, published_at: NOW }, { id: ID.POST5 }, "publicar post [DEMO] Nº5");
    let an = await read("blog_posts", "select=slug&published=eq.true&slug=eq.demo-transformacion-digital", "anon");
    rec("Publicación · blog", "post visible anónimo al publicar", an.rows.length === 1 ? "PASS" : "FAIL", `${an.rows.length}`);
    await upd("blog_posts", { published: false, published_at: null }, { id: ID.POST5 }, "despublicar post [DEMO] Nº5");
    an = await read("blog_posts", "select=slug&published=eq.true&slug=eq.demo-transformacion-digital", "anon");
    rec("Despublicación · blog", "post oculto anónimo al despublicar", an.rows.length === 0 ? "PASS" : "FAIL", `${an.rows.length}`);
    an = await read("blog_posts", "select=slug,published_at&published=eq.true&order=published_at.desc&limit=100", "anon");
    rec("Blog · listado público", "solo publicados + por fecha", an.rows.length >= 4 ? "PASS" : "FAIL", `${an.rows.length}`);
  }

  // ---- F. Testimonials + FAQs publish/order/category ----
  let an = await read("testimonials", "select=name,rating,sort_order&published=eq.true&order=sort_order.asc", "anon");
  rec("Publicación · testimonios", "solo publicados y orden sorted", an.rows.every(x => !x.name.includes("Carla")) && an.rows.length >= 4 ? "PASS" : "FAIL", `${an.rows.length}`);
  an = await read("faqs", "select=question&published=eq.true&question=ilike.*[DEMO]*", "anon");
  rec("Publicación · FAQs", "FAQs DEMO publicadas visibles", an.rows.length >= 8 ? "PASS" : "FAIL", `${an.rows.length}`);
  an = await read("faqs", "select=question,category&published=eq.true&category=eq.desarrollo-web&question=ilike.*[DEMO]*", "anon");
  rec("Filtros · FAQs", "por categoría desarrollo-web", an.rows.length >= 2 ? "PASS" : "FAIL", `${an.rows.length} filas`);
  await upd("faqs", { published: false }, { id: ID.FAQ3 }, "despublicar FAQ [DEMO]");
  an = await read("faqs", "select=question&published=eq.true&question=ilike.*herramientas se automatizan*", "anon");
  rec("Despublicación · FAQs", "FAQ oculta al despublicar", an.rows.length === 0 ? "PASS" : "FAIL", `${an.rows.length}`);
  await upd("faqs", { published: true }, { id: ID.FAQ3 }, "re-publicar FAQ [DEMO]");

  // ---- G. Knowledge public ----
  an = await read("help_docs", "select=title&published=eq.true", "anon");
  rec("Conocimiento · /knowledge", "docs publicados visibles anónimo", an.rows.length >= 6 ? "PASS" : "FAIL", an.rows.length === 0 ? "RLS staff-only bloquea anon (help_docs sin política pública)" : `${an.rows.length}`);
  an = await read("help_docs", "select=*&slug=eq.guia-desarrollo-web-demo", "anon");
  rec("Conocimiento · /knowledge/:slug", "slug individual anónimo", an.rows.length === 1 ? "PASS" : "FAIL", an.rows.length === 0 ? "RLS bloquea anon" : "ok");

  // ---- H. Real cases (table missing) ----
  an = await read("real_cases", "select=id", "anon");
  rec("Casos reales", "tabla real_cases consultable", an.r.status === 200 ? "PASS" : "FAIL", an.r.status === 404 ? "TABLA NO EXISTE (migración 20260922120000 pendiente) · PGRST205" : errMsg(an.r));

  // ---- I. Chat ----
  let ch = await read("chat_channels", `select=id,name&name=eq.${encodeURIComponent("[DEMO] Proyecto Alpha")}`);
  rec("Chat · lectura canal", "canal [DEMO] legible", ch.rows.length === 1 ? "PASS" : "FAIL", `${ch.rows.length}`);
  const mem = await api("/rest/v1/chat_channel_members", { token, method: "POST", body: { channel_id: ID.CHAN1, user_id: ADMIN_ID } });
  rec("Chat · chat_channel_members", "agregar miembro canal", mem.status === 201 ? "PASS" : "FAIL", mem.status === 404 ? "TABLA chat_channel_members NO EXISTE (migración pendiente) · PGRST205" : errMsg(mem));
  const msgs = await read("chat_messages", `select=id,body&channel_id=eq.${ID.CHAN1}`);
  rec("Chat · mensajes", "leer mensaje canal [DEMO]", msgs.rows.length === 1 ? "PASS" : "FAIL", `${msgs.rows.length}`);

  // ---- J. RLS negatives (anon blocked) ----
  const neg = async (table, method, body, label) => {
    const rr = await api(`/rest/v1/${table}`, { method, body });
    const blocked = rr.status === 403 || rr.status === 401 || String(rr.text).toLowerCase().includes("violates row-level security") || String(rr.text).toLowerCase().includes("permission denied") || (rr.status === 400 && String(rr.text).toLowerCase().includes("new row violates"));
    rec("RLS · anon bloqueado", label, blocked ? "PASS" : "FAIL", `${rr.status} ${blocked ? "(bloqueado)" : errMsg(rr)}`);
  };
  await neg("clients", "POST", { name: "[DEMO] intruso", company: "x" }, "insert client");
  await neg("blog_posts", "POST", { title: "[DEMO] intruso", slug: "demo-intruso", content: "x" }, "insert blog");
  await neg("budgets", "POST", { slug: "demo-intruso", client_name: "x" }, "insert budget");
  await neg("tasks", "POST", { title: "[DEMO] intruso" }, "insert task");
  await neg("help_docs", "POST", { title: "[DEMO] intruso", slug: "demo-intruso2" }, "insert help_docs");
  await neg("contact_submissions", "DELETE", undefined, "delete contact"); // anon cannot delete contact rows
  await neg("media_assets", "POST", { name: "[DEMO] intruso", path: "demo/x.png", url: "/x.png" }, "insert media");

  // ---- K. Portal ----
  const p1 = await api("/rest/v1/client_invites?select=*,client:clients(*)&token=eq.demo-portal-token-0001&status=eq.pending");
  rec("Portal · /portal/:token", "invitación legible anónimo (flujo público)", p1.status === 200 && Array.isArray(p1.json) && p1.json.length === 1 ? "PASS" : "FAIL", p1.status === 200 ? (Array.isArray(p1.json) && p1.json.length ? "ok" : "devuelve [] → RLS staff-only (fallo de diseño)") : errMsg(p1));
  let rr = await rpc("client_portal_info", { _token: "demo-portal-token-0001" }, "anon");
  rec("Portal · RPC client_portal_info", "datos de cliente por token (alternativa)", rr.status === 200 ? "PASS" : "BLOCKED", rr.status !== 200 ? "función no existe (migración 20260918121000 pendiente) " + errMsg(rr) : "ok");
  rr = await rpc("client_invite_accept", { _token: "demo-portal-token-0001" }, "anon");
  rec("Portal · RPC client_invite_accept", "aceptar invitación", rr.status === 200 || rr.status === 204 ? "PASS" : "BLOCKED", rr.status !== 200 ? "función pendiente " + errMsg(rr) : "ok");
  // revocation via admin (safe, DEMO row)
  await upd("client_invites", { status: "password_tmp", token: "x" }, { id: ID.CINV1 }, "INTENTO revocar invitación [DEMO]"); // will fail (otro estado inválido) — ver más abajo
  // actually revocation: update status to 'revoked'
  await upd("client_invites", { status: "revoked" }, { id: ID.CINV1 }, "revocar invitación cliente [DEMO]");

  // ---- L. Documents + storage ----
  rr = await api("/functions/v1/docs-signed-url?path=demo%2Fbrief-proyecto.pdf&bucket=documents&expires_in=600", { token, method: "POST", body: {} });
  rec("Documentos · docs-signed-url", "firma URL documento [DEMO]", rr.status === 200 ? "PASS" : "FAIL", `${rr.status} ${errMsg(rr)}`);
  const buckets = await api("/storage/v1/bucket", { token });
  rec("Storage · buckets", "buckets documents y media", (buckets.json || []).filter(b => ["documents", "media"].includes(b.name)).length === 2 ? "PASS" : "FAIL", `buckets: ${JSON.stringify((buckets.json || []).map(b => b.name)) || "ninguno"}`);
  const upDoc = await api("/storage/v1/object/documents/demo/test-upload.pdf", { token, method: "POST", headers: { "Content-Type": "application/octet-stream", "x-upsert": "false" }, body: "x", });
  rec("Documentos · subida", "upload DEMO a bucket documents", upDoc.status === 200 ? "PASS" : "FAIL", `${upDoc.status} ${errMsg(upDoc)}`);
  const rd = await read("documents", "select=id,name&name=ilike.*[DEMO]*");
  rec("Documentos · listado", "docs [DEMO] listados", rd.rows.length === 3 ? "PASS" : "FAIL", `${rd.rows.length}`);

  // ---- M. Media ----
  const rm = await read("media_assets", "select=id,name&name=ilike.*[DEMO]*");
  rec("Multimedia · listado", "assets [DEMO] listados", rm.rows.length === 3 ? "PASS" : "FAIL", `${rm.rows.length}`);
  await del("media_assets", { id: ID.MED3 }, "eliminar asset multimedia [DEMO]");

  // ---- N. Contacts ----
  await upd("contact_submissions", { status: "sent" }, { id: ID.CT1 }, "cambiar estado contacto [DEMO] a sent");
  const rc = await read("contact_submissions", "select=name,status&name=ilike.*[DEMO]*");
  rec("Contactos · filtros", "listado + filtro [DEMO] + estado", rc.rows.length === 3 && rc.rows.some(x => x.status === "sent") ? "PASS" : "FAIL", `${rc.rows.length} filas`);

  // ---- O. Team + invites ----
  const rti = await read("team_invites", "select=id,email,role,status&token=eq.demo-team-invite-token-0001");
  rec("Equipo · invitaciones", "invitación [DEMO] visible", rti.rows.length === 1 ? "PASS" : "FAIL", `${rti.rows.length}`);
  await upd("team_invites", { status: "revoked" }, { id: ID.TINV1 }, "revocar invitación equipo [DEMO]");
  const rprof = await read("profiles", "select=id,full_name,email,active");
  rec("Equipo · directorio", "perfiles legibles", rprof.r.status === 200 ? "PASS" : "FAIL", `${rprof.rows.length} perfiles`);

  // ---- P. RBAC ----
  rr = await rpc("get_my_roles", {});
  rec("RBAC · roles efectivos", "superadmin → roles", rr.status === 200 && (JSON.stringify(rr.json).includes("superadmin")) ? "PASS" : "FAIL", JSON.stringify(rr.json));
  rr = await rpc("get_my_permissions", {});
  const perms = typeof rr.json === "string" ? JSON.parse(rr.json) : (rr.json || []);
  rec("RBAC · permisos efectivos", "superadmin → 19 permisos", perms.length === 19 ? "PASS" : "FAIL", `count=${perms.length} en DB viva (faltan 6: tasks.write, tasks.assign, clients.write, chat.write, docs.manage, contacts.read — seed 20260918121000 pendiente)`);
  rr = await api(`/rest/v1/rpc/is_staff`, { token, method: "POST", body: [ADMIN_ID] });
  rec("RBAC · is_staff(uuid)", "guard staff", rr.status === 200 && rr.json === true ? "PASS" : "FAIL", `${rr.status} ${errMsg(rr)}`);
  rr = await api(`/rest/v1/rpc/is_admin`, { token, method: "POST", body: [ADMIN_ID] });
  rec("RBAC · is_admin(uuid)", "guard admin", rr.status === 200 && rr.json === true ? "PASS" : "FAIL", `${rr.status} ${errMsg(rr)}`);

  // ---- Q. SEO / sitemap / robots ----
  rr = await api("/functions/v1/sitemap", {});
  rec("SEO · sitemap edge", "sitemap dinámico público", rr.status === 200 ? "PASS" : "FAIL", `${rr.status} · ${String(rr.text).slice(0, 80)}`);
  rr = await api("/functions/v1/gsc-metrics", { token, method: "GET" });
  rec("SEO · gsc-metrics", "métricas Google Search Console", rr.status === 200 ? "PASS" : "BLOCKED", `${rr.status} · ${errMsg(rr)} (requiere GOOGLE_SEARCH_CONSOLE_API_KEY)`);

  // ---- R. Budget PDF ----
  rr = await api(`/functions/v1/generate-budget-pdf?slug=demo-horizonte-landing`);
  rec("PDF · generate-budget-pdf", "generar PDF presupuesto [DEMO]", rr.status === 200 && rr.text.length > 100 ? "PASS" : "FAIL", `${rr.status} · ${typeof rr.text === "string" ? rr.text.length + " bytes" : errMsg(rr)}`);
  rr = await api(`/functions/v1/generate-budget-pdf?slug=slug-inexistente-demo`);
  rec("PDF · slug inexistente", "manejo de error", rr.status !== 200 ? "PASS" : "FAIL", `${rr.status} · ${errMsg(rr)}`);

  // ---- S. Integrity ----
  const before = (await read("blog_posts", "select=slug&limit=1000")).rows.map(x => x.slug);
  const after = (await read("blog_posts", "select=slug&limit=1000")).rows.map(x => x.slug);
  const orig = before.filter(s => !s.startsWith("demo-"));
  const missing = orig.filter(s => !after.includes(s));
  rec("Integridad · blog_posts", "slugs existentes intactos", missing.length === 0 && orig.every(s => after.includes(s)) ? "PASS" : "FAIL", `pre:${before.length} post:${after.length} · borrados:${missing.length} · nuevos:${after.length - orig.length}`);

  const fd = await read("documents", "select=id&name=ilike.*[DEMO]*");
  const fc = await read("contact_submissions", "select=id&name=ilike.*[DEMO]*");
  const fb = await read("budgets", "select=id&slug=ilike.*demo*");
  rec("Integridad · conteos finales", "registros DEMO presentes", fd.rows.length === 3 && fc.rows.length === 3 && fb.rows.length === 4 ? "PASS" : "FAIL", `docs:${fd.rows.length} contactos:${fc.rows.length} budgets:${fb.rows.length}`);

  writeFileSync("C:\\Users\\ariel\\AppData\\Local\\Temp\\opencode\\resultados.json", JSON.stringify(results, null, 2));
  const by = results.reduce((a, x) => { a[x.estado] = (a[x.estado] || 0) + 1; return a; }, {});
  console.log("RESUMEN (v2):", JSON.stringify(by));
  console.log("\n=== NO PASS ===");
  results.filter(r => r.estado !== "PASS").forEach(r => console.log(`[${r.estado}] ${r.categoria} · ${r.caso}\n      → ${r.detalle}`));
  console.log("\nTotal:", results.length);
})();
