export interface ServiceData {
  slug: string;
  icon: "globe" | "workflow" | "cloud" | "code" | "brain" | "plug";
  name: string;
  category: string;
  title: string;
  tagline: string;
  hero: string;
  problem: string[];
  includes: string[];
  audience: string[];
  howWeWork: { title: string; description: string }[];
  cases: { name: string; description: string; url?: string }[];
  faqs: { q: string; a: string }[];
  includesNote: string;
  processNote: string;
  casesNote: string;
  metaTitle: string;
  metaDescription: string;
}

const BASE_TOTAL = "Menos promesas. Más soluciones.";
const CTA = "Agendá una reunión sin compromiso y definamos el alcance de tu proyecto.";

export const services: ServiceData[] = [
  {
    slug: "desarrollo-web",
    icon: "globe",
    name: "Desarrollo web",
    category: "Desarrollo web",
    title: "Desarrollo web a medida",
    tagline: "Sitios web diseñados para comunicar mejor, generar oportunidades y convertir visitas en clientes.",
    hero:
      "Diseñamos y desarrollamos sitios web profesionales adaptados a tu marca, negocio y objetivos. Desde sitios institucionales y landing pages hasta experiencias digitales con contenido dinámico y administración propia.",
    problem: [
      "Tu sitio quedó desactualizado o no representa lo que ofrecés.",
      "Recibís visitas pero no generan consultas.",
      "Dependés de terceros para actualizar contenido.",
      "Tu presencia digital no se diferencia de la competencia.",
    ],
    includes: [
      "Diseño UI/UX orientado a objetivos.",
      "Desarrollo responsive y optimizado.",
      "SEO técnico y estructura preparada para buscadores.",
      "CMS o panel de administración cuando el proyecto lo requiere.",
      "Integración con formularios, WhatsApp, Analytics y otras herramientas.",
      "Publicación, configuración y acompañamiento inicial.",
    ],
    audience: [
      "Negocios que necesitan una web que genere consultas y no solo \"exista\".",
      "Empresas cuyo sitio quedó viejo o no representa lo que hacen.",
      "Organizaciones que quieren publicar contenido sin depender de un técnico.",
      "Marcas que no se diferencian de la competencia en digital.",
    ],
    howWeWork: [
      { title: "Reunión de relevamiento", description: "Entendemos tu negocio, tu público y el objetivo real del sitio." },
      { title: "Arquitectura y diseño", description: "Definimos estructura, contenido y una interfaz orientada a conversión." },
      { title: "Desarrollo por etapas", description: "Construimos el sitio con entregas parciales para validar en el camino." },
      { title: "Lanzamiento y soporte", description: "Publicamos, monitoreamos y acompañamos el crecimiento." },
    ],
    cases: [
      { name: "Capitán Deportes", description: "Sitio web para la marca Capitán Deportes, con foco en presencia digital y captación de clientes.", url: "https://capitandeportes.com/" },
      { name: "OffMarket", description: "Sitio corporativo para el ecosistema tech argentino.", url: "https://www.offmarket.com.ar/" },
      { name: "Justa", description: "Sitio institucional para agencia creativa.", url: "https://justaagencia.com/" },
    ],
    faqs: [
      { q: "¿Cuánto tarda un desarrollo web a medida?", a: "Depende del alcance. Una landing optimizada se entrega en 1 a 3 semanas; un sitio con panel de administración suele llevar de 4 a 8 semanas. En la reunión inicial definimos un plazo concreto." },
      { q: "¿Incluyen diseño o solo desarrollo?", a: "Cubrimos diseño con propósito, desarrollo y puesta en producción. Interfaces orientadas a negocio, usabilidad y conversión." },
      { q: "¿Puedo actualizar el contenido yo mismo?", a: "Sí. En muchos proyectos integramos un panel de administración para que edites contenido sin depender de un equipo técnico." },
    ],
    includesNote: "Lo que entra en un proyecto de desarrollo web.",
    processNote: "Un proceso enfocado a que el sitio se entregue en tiempo y forma.",
    casesNote: "Sitios reales para marcas y empresas que ya operan.",
    metaTitle: "Desarrollo web a medida | Sigma Tecnologías",
    metaDescription: "Sitios web a medida para comunicar mejor, generar oportunidades y convertir visitas en clientes. Desarrollo web en Tandil, Buenos Aires, Argentina.",
  },
  {
    slug: "desarrollo-software",
    icon: "code",
    name: "Desarrollo de software",
    category: "Desarrollo de software",
    title: "Software y sistemas a medida",
    tagline: "Digitalizamos procesos internos con sistemas diseñados alrededor de cómo trabaja tu negocio.",
    hero:
      "Desarrollamos sistemas web, paneles de administración y herramientas internas para centralizar información, automatizar operaciones y reemplazar procesos manuales.",
    problem: [
      "Tu equipo trabaja con planillas, mails y documentos dispersos.",
      "No existe un lugar central para gestionar la información.",
      "Las herramientas que usás no se adaptan a tu proceso.",
      "Las tareas manuales generan errores y pérdida de tiempo.",
    ],
    includes: [
      "Relevamiento y modelado del proceso.",
      "Base de datos y lógica de negocio.",
      "Paneles de administración.",
      "Usuarios, roles y permisos.",
      "Gestión y visualización de datos.",
      "Integraciones con sistemas existentes.",
      "Evolución y mantenimiento.",
    ],
    audience: [
      "Equipos que todavía operan con planillas, mails y archivos dispersos.",
      "Empresas que necesitan un panel central para gestionar su operación.",
      "Negocios cuyas herramientas no se adaptan a su proceso real.",
      "Organizaciones que quieren eliminar errores y tareas manuales repetitivas.",
    ],
    howWeWork: [
      { title: "Diagnóstico", description: "Relevamos tu proceso real y definimos el sistema alrededor de él." },
      { title: "Diseño y arquitectura", description: "Modelamos datos, flujos y permisos antes de escribir código." },
      { title: "Construcción iterativa", description: "Entregamos módulos funcionales para validar en producción gradual." },
      { title: "Operación", description: "Publicamos, mantenemos y seguimos evolucionando el sistema." },
    ],
    cases: [
      { name: "Faztred", description: "Sistema digital con lógica de backend y datos estructurados.", url: "https://faztred.com.ar/" },
      { name: "Solcitos", description: "Sistema a medida para centralizar la información y digitalizar la gestión diaria." },
    ],
    faqs: [
      { q: "¿Desarrollan sistemas a medida sobre mi proceso?", a: "Sí. Analizamos tu operación y construimos el sistema alrededor de tus procesos reales, no al revés." },
      { q: "¿Incluyen panel de administración?", a: "En general sí. La mayoría de los sistemas incluyen paneles para gestionar usuarios, contenido y operación diaria." },
    ],
    includesNote: "Lo que normalmente incluye un proyecto de sistema a medida.",
    processNote: "Trabajamos sobre tu proceso real, no sobre un modelo teórico.",
    casesNote: "Sistemas que ya están operando en producción.",
    metaTitle: "Software y sistemas a medida | Sigma Tecnologías",
    metaDescription: "Digitalizamos procesos internos con sistemas a medida: paneles de administración, gestión de datos y reemplazo de procesos manuales. Desarrollo de software en Tandil, Argentina.",
  },
  {
    slug: "desarrollo-saas",
    icon: "cloud",
    name: "SaaS y plataformas",
    category: "SaaS y plataformas",
    title: "SaaS y plataformas digitales",
    tagline: "Convertimos ideas de productos digitales en plataformas reales, utilizables y preparadas para crecer.",
    hero:
      "Diseñamos y desarrollamos productos digitales con usuarios, funcionalidades, administración y modelo de negocio propios. Desde un MVP para validar una idea hasta una plataforma en evolución.",
    problem: [
      "Tenés una idea pero no un equipo técnico para desarrollarla.",
      "Necesitás validar el producto antes de hacer una gran inversión.",
      "Querés transformar un proceso o servicio en un producto digital.",
      "Tu plataforma necesita evolucionar con usuarios reales.",
    ],
    includes: [
      "Definición de alcance y MVP.",
      "Arquitectura del producto.",
      "Experiencia de usuario.",
      "Usuarios, roles y permisos.",
      "Panel de administración.",
      "Integraciones y pagos cuando corresponda.",
      "Analytics y métricas de producto.",
      "Evolución y nuevas funcionalidades.",
    ],
    audience: [
      "Emprendedores con una idea de producto digital sin equipo técnico.",
      "Empresas que quieren transformar un servicio o proceso en una plataforma.",
      "Negocios que necesitan validar una idea antes de invertir fuerte.",
      "Productos que ya tienen usuarios y necesitan evolucionar.",
    ],
    howWeWork: [
      { title: "Idea y alcance", description: "Definimos el problema, el usuario y el modelo de negocio antes de construir." },
      { title: "MVP", description: "Construimos una versión mínima viable rápida para validar con usuarios reales." },
      { title: "Iteración", description: "Agregamos módulos según aprendizaje real de uso." },
      { title: "Escala", description: "Optimizamos, lanzamos y acompañamos el crecimiento." },
    ],
    cases: [
      { name: "Sigma Analytics", description: "Plataforma de analítica de rendimiento para fútbol, con usuarios, datos y reportes inteligentes." },
    ],
    faqs: [
      { q: "¿Pueden construir un SaaS desde cero?", a: "Sí. Diseñamos, desarrollamos y lanzamos productos digitales con usuarios, administración y modelo de negocio propios, desde el MVP hasta la evolución." },
      { q: "¿La plataforma queda nuestra al terminar?", a: "Las condiciones de propiedad, código y operación se definen por contrato en cada proyecto. Lo conversamos con transparencia en la propuesta." },
      { q: "¿Cómo se factura?", a: "Cada proyecto define su esquema: desarrollo inicial y mantenimiento mensual opcional. Se detalla en la propuesta sin costos ocultos." },
    ],
    includesNote: "Lo que lleva un producto desde la idea hasta las primeras versiones.",
    processNote: "Del problema a un producto usable, con decisiones tomadas sobre datos.",
    casesNote: "Productos digitales con usuarios reales y modelo de negocio propio.",
    metaTitle: "SaaS y plataformas digitales | Sigma Tecnologías",
    metaDescription: "Convertimos ideas de productos digitales en plataformas reales: SaaS, MVPs y productos multiusuario. Desarrollo de SaaS en Tandil, Argentina.",
  },
  {
    slug: "automatizacion",
    icon: "workflow",
    name: "Automatización",
    category: "Automatización",
    title: "Automatización de procesos",
    tagline: "Automatizamos tareas repetitivas para que tu equipo dedique tiempo a lo que realmente importa.",
    hero:
      "Diseñamos flujos que conectan herramientas, procesan información y ejecutan tareas automáticamente. Utilizamos n8n, Make, APIs y otras tecnologías según el proceso.",
    problem: [
      "Tu equipo copia y pega información entre herramientas.",
      "Hay tareas repetitivas que consumen horas.",
      "Los procesos dependen de que alguien recuerde ejecutarlos.",
      "Los errores manuales afectan la operación.",
    ],
    includes: [
      "Relevamiento y análisis del proceso.",
      "Diseño del flujo automatizado.",
      "Automatizaciones con n8n, Make y APIs.",
      "Notificaciones y reportes automáticos.",
      "Manejo de errores.",
      "Monitoreo y mantenimiento.",
      "Documentación del flujo.",
    ],
    audience: [
      "PyMEs que pierden horas en tareas repetitivas.",
      "Equipos que copian y pegan datos entre herramientas.",
      "Agencias que procesan mucho contenido o reportes a mano.",
      "Negocios cuyos procesos dependen de que alguien se acuerde de ejecutarlos.",
    ],
    howWeWork: [
      { title: "Relevamiento", description: "Entendemos el proceso, las herramientas y el objetivo de eficiencia." },
      { title: "Maquetado del flujo", description: "Diseñamos la automatización antes de conectar nada." },
      { title: "Implementación y pruebas", description: "Construimos con testeo en entornos seguros." },
      { title: "Puesta en marcha", description: "Activamos, monitoreamos y medimos resultados." },
    ],
    cases: [
      { name: "Sigma Trend Engine", description: "Procesa datos de múltiples plataformas y genera documentos estratégicos de forma automática." },
      { name: "Precios Tandil", description: "Automatización de relevamiento y publicación de precios para el mercado local.", url: "https://preciostandil.vercel.app/" },
    ],
    faqs: [
      { q: "¿Qué tipo de procesos se pueden automatizar?", a: "Tareas repetitivas, integraciones entre herramientas, generación de reportes, seguimiento de clientes y notificaciones." },
      { q: "¿Necesito reemplazar mis herramientas actuales?", a: "No. Las automatizaciones conectan las herramientas que ya usás para eliminar trabajo manual." },
      { q: "¿Cómo se mide el resultado?", a: "Definimos indicadores concretos: tiempo ahorrado, errores eliminados y tareas procesadas." },
    ],
    includesNote: "Lo que decimos concretamente al armar una automatización.",
    processNote: "Primero entendemos el proceso, después conectamos herramientas.",
    casesNote: "Automatizaciones concretas que ya corren solas.",
    metaTitle: "Automatización de procesos | Sigma Tecnologías",
    metaDescription: "Automatizamos tareas repetitivas con n8n, Make y APIs para que tu equipo dedique tiempo a lo que importa. Automatización de procesos en Tandil, Argentina.",
  },
  {
    slug: "inteligencia-artificial",
    icon: "brain",
    name: "Inteligencia artificial",
    category: "Inteligencia artificial",
    title: "Inteligencia artificial aplicada",
    tagline: "Integramos IA donde puede mejorar procesos, análisis y productos digitales.",
    hero:
      "Desarrollamos soluciones que utilizan modelos de inteligencia artificial para analizar información, procesar contenido, generar resultados y asistir tareas específicas de negocio.",
    problem: [
      "Tenés grandes volúmenes de información difíciles de analizar.",
      "Tu equipo dedica horas a revisar, clasificar o resumir contenido.",
      "Querés incorporar IA a un producto o proceso existente.",
      "Tenés una oportunidad concreta de automatización con IA pero no sabés cómo implementarla.",
    ],
    includes: [
      "Integración de modelos de IA.",
      "Procesamiento y análisis de información.",
      "Clasificación y extracción de datos.",
      "Generación automática de contenido y documentos.",
      "Asistentes y flujos con lenguaje natural.",
      "Integración con sistemas y fuentes de datos.",
      "Evaluación y mejora de resultados.",
    ],
    audience: [
      "Empresas con grandes volúmenes de información para analizar.",
      "Equipos que dedican horas a revisar, clasificar o resumir contenido.",
      "Negocios que quieren sumar IA a un producto o proceso existente.",
      "Organizaciones con una oportunidad concreta de automatización con IA.",
    ],
    howWeWork: [
      { title: "Definición del problema", description: "Identificamos dónde la IA agrega valor real a tu operación." },
      { title: "Selección de modelo", description: "Elegimos el enfoque técnico según datos, costo y objetivo." },
      { title: "Integración y validación", description: "Conectamos el modelo con tus datos y validamos que los resultados respondan al objetivo." },
      { title: "Métricas", description: "Medimos resultados y ajustamos para mejorar en el tiempo." },
    ],
    cases: [
      { name: "Sigma Trend Engine", description: "Motor de IA que analiza contenido de redes sociales y detecta tendencias emergentes para agencias de marketing." },
      { name: "Sigma Analytics", description: "Analítica inteligente de rendimiento para clubes, analistas y jugadores." },
    ],
    faqs: [
      { q: "¿Qué resuelve la IA en un proyecto?", a: "Análisis de datos, motores de recomendación, automatización con lenguaje natural, generación de reportes e insights estratégicos." },
      { q: "¿Necesito conocimientos técnicos de IA?", a: "No. Lo integramos nosotros y mantenemos el foco en el resultado de negocio." },
    ],
    includesNote: "Lo que puede hacer la IA cuando se integra a un proceso o producto.",
    processNote: "Definimos por qué y dónde la IA suma antes de hablar de modelos.",
    casesNote: "Proyectos donde la IA ya está funcionando sobre datos reales.",
    metaTitle: "Inteligencia artificial aplicada | Sigma Tecnologías",
    metaDescription: "Integramos IA a procesos y productos para analizar información, procesar contenido y asistir tareas de negocio. IA aplicada en Tandil, Argentina.",
  },
  {
    slug: "integraciones",
    icon: "plug",
    name: "Integraciones",
    category: "Integraciones",
    title: "Integraciones de sistemas",
    tagline: "Conectamos las herramientas que ya utilizás para que compartan información automáticamente.",
    hero:
      "Integramos APIs, plataformas y sistemas existentes para sincronizar información y eliminar la carga manual de datos.",
    problem: [
      "Tus sistemas no se comunican entre sí.",
      "Tenés que cargar la misma información varias veces.",
      "Los datos están distribuidos en distintas plataformas.",
      "Una integración existente falla o necesita mantenimiento.",
    ],
    includes: [
      "Integraciones mediante APIs.",
      "Sincronización de datos.",
      "Webhooks y eventos.",
      "Importación y exportación automática.",
      "Manejo de errores.",
      "Monitoreo.",
      "Documentación técnica.",
    ],
    audience: [
      "Empresas que usan varias herramientas que no se hablan entre sí.",
      "Equipos que cargan la misma información dos veces o más.",
      "Negocios con datos distribuidos en distintas plataformas.",
      "Organizaciones con integraciones que fallan o nadie mantiene.",
    ],
    howWeWork: [
      { title: "Inventario de herramientas", description: "Relevamos qué se usa y qué debería conectarse." },
      { title: "Diseño de la integración", description: "Definimos flujo, frecuencia y manejo de errores." },
      { title: "Conexión y pruebas", description: "Implementamos con entornos de prueba y monitoreo." },
      { title: "Soporte", description: "Acompañamos la operación y escalamos si el volumen crece." },
    ],
    cases: [
      { name: "Iceberg", description: "Integración con Google Sheets para leer datos y generar visualizaciones estructuradas.", url: "https://icebergpol.com/" },
      { name: "Integraciones de Sigma Analytics", description: "Sincronización automática de datos de rendimiento dentro de Sigma Analytics." },
    ],
    faqs: [
      { q: "¿Se integran con las herramientas que ya uso?", a: "Sí. Trabajamos con APIs de herramientas populares y plataformas de automatización como n8n y Make." },
      { q: "¿Una integración puede romper mi sistema?", a: "Trabajamos con entornos de prueba y monitoreo para minimizar riesgos. Validamos todo antes de tocar producción." },
    ],
    includesNote: "Lo que implica conectar dos sistemas de forma confiable.",
    processNote: "Relevamos qué se conecta, cómo fluye y qué pasa si falla.",
    casesNote: "Sistemas que hoy comparten información sin intervención manual.",
    metaTitle: "Integraciones de sistemas | Sigma Tecnologías",
    metaDescription: "Conectamos APIs, plataformas y sistemas para sincronizar datos y eliminar la carga manual. Integraciones de sistemas en Tandil, Argentina.",
  },
];

export const getService = (slug?: string) => services.find((s) => s.slug === slug);

export const serviceByRelatedSlug = (related: string | null | undefined) => {
  if (!related) return undefined;
  return getService(related) ?? getService(services.find((s) => s.name.toLowerCase().includes(related.toLowerCase()))?.slug);
};

export const BASE_TOTAL_TAGLINE = BASE_TOTAL;
export const CTA_DEFAULT = CTA;