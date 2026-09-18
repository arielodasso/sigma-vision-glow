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
    tagline: "Sitios y plataformas diseñados para comunicar, captar clientes y vender.",
    hero:
      "Desarrollamos sitios web y plataformas digitales de alto rendimiento, pensados para comunicar tu propuesta, captar clientes y estructurar tu presencia digital. Desde la landing que convierte hasta el sitio más complejo con panel de administración.",
    problem: [
      "Sitios lentos o desactualizados que no convierten visitas en clientes.",
      "Presencia digital que no comunica valor ni diferencia a tu empresa.",
      "Dependencia de equipos técnicos para los cambios más simples.",
      "Diseño genérico que no representa tu marca ni tu negocio.",
    ],
    includes: [
      "Diseño con propósito: usabilidad, jerarquía y conversión.",
      "Desarrollo optimizado para velocidad y SEO técnico.",
      "Panel de administración para editar contenido sin depender de nadie.",
      "Metadatos, Open Graph, sitemap y structured data listos para Google.",
      "Puesta en producción, dominio y monitoreo inicial.",
      "Soporte antes, durante y después de la entrega.",
    ],
    audience: [
      "Empresas que necesitan una web que venda y no solo \"exista\".",
      "Profesionales y marcas que quieren presencia digital profesional.",
      "Organizaciones que buscan autonomía para publicar contenido.",
      "Agencias que tercerizan el desarrollo de sus clientes.",
    ],
    howWeWork: [
      { title: "Reunión de relevamiento", description: "Entendemos tu negocio, tu público y el objetivo real del sitio." },
      { title: "Arquitectura y diseño", description: "Definimos estructura, contenido y una interfaz orientada a conversión." },
      { title: "Desarrollo por etapas", description: "Construimos el sitio con entregas parciales para validar en el camino." },
      { title: "Lanzamiento y soporte", description: "Publicamos, monitoreamos y acompañamos el crecimiento." },
    ],
    cases: [
      { name: "OffMarket", description: "Sitio corporativo para el ecosistema tech argentino.", url: "https://www.offmarket.com.ar/" },
      { name: "Justa", description: "Sitio institucional para agencia creativa.", url: "https://justaagencia.com/" },
      { name: "Geonosis", description: "Sitio para consultora tecnológica.", url: "https://geonosis.com.ar/" },
      { name: "Cristian Schauvinhold", description: "Sitio profesional personal.", url: "https://cristianschauvinhold.com/" },
      { name: "Estamos Unidos", description: "Plataforma web para organización social.", url: "https://somosestamosunidos.com/" },
      { name: "Calisthenia Online", description: "Presencia digital para marca deportiva.", url: "https://calisthenia.online/" },
    ],
    faqs: [
      { q: "¿Cuánto tarda un desarrollo web a medida?", a: "Depende del alcance. Una landing optimizada se entrega en 1 a 3 semanas; un sitio con panel de administración suele llevar de 4 a 8 semanas. En la reunión inicial definimos un plazo concreto." },
      { q: "¿Incluyen diseño o solo desarrollo?", a: "Cubrimos diseño con propósito, desarrollo y puesta en producción. Interfaces orientadas a negocio, usabilidad y conversión." },
      { q: "¿Puedo actualizar el contenido yo mismo?", a: "Sí. En muchos proyectos integramos un panel de administración para que edites contenido sin depender de un equipo técnico." },
    ],
    metaTitle: "Desarrollo web a medida | Sigma Tecnologías",
    metaDescription: "Sitios y plataformas web de alto rendimiento, optimizados para SEO y conversión. Desarrollo web a medida en Tandil, Buenos Aires, Argentina.",
  },
  {
    slug: "desarrollo-software",
    icon: "code",
    name: "Desarrollo de software",
    category: "Desarrollo de software",
    title: "Software y sistemas a medida",
    tagline: "Sistemas complejos con backend, paneles de administración y datos.",
    hero:
      "Construimos software y plataformas digitales con lógica de backend, paneles de administración y procesamiento de datos. Sistemas robustos que se adaptan a tu operación y escalan con tu negocio.",
    problem: [
      "Planillas y correos que ya no alcanzan para operar.",
      "Sistemas genéricos que no se adaptan a tu proceso.",
      "Información dispersa sin un panel central de gestión.",
      "Procesos manuales que frenan el crecimiento.",
    ],
    includes: [
      "Análisis de tu operación y modelado del sistema.",
      "Backend, base de datos y lógica de negocio a medida.",
      "Paneles de administración para gestión diaria.",
      "Procesamiento y visualización de datos.",
      "Seguridad, roles y control de acceso.",
      "Documentación y transferencia del código a tu propiedad.",
    ],
    audience: [
      "Empresas que quieren digitalizar su operación interna.",
      "Negocios que necesitan un panel para gestionar clientes, stock o contenido.",
      "Organizaciones que centralizan datos y procesos en un solo sistema.",
      "Equipos que hoy operan con herramientas desconectadas.",
    ],
    howWeWork: [
      { title: "Diagnóstico", description: "Relevamos tu proceso real y definimos el sistema alrededor de él." },
      { title: "Diseño y arquitectura", description: "Modelamos datos, flujos y permisos antes de escribir código." },
      { title: "Construcción iterativa", description: "Entregamos módulos funcionales para validar en producción gradual." },
      { title: "Operación", description: "Publicamos, mantenemos y seguimos evolucionando el sistema." },
    ],
    cases: [
      { name: "Iceberg", description: "Plataforma digital que procesa archivos y lee Google Sheets para generar gráficos y visualizaciones estructuradas.", url: "https://icebergpol.com/" },
      { name: "Sigma Trend Engine", description: "Motor de IA que analiza contenido de redes sociales y genera documentos estratégicos." },
      { name: "Faztred", description: "Plataforma digital con lógica de backend y datos estructurados.", url: "https://faztred.com.ar/" },
    ],
    faqs: [
      { q: "¿Desarrollan sistemas a medida sobre mi proceso?", a: "Sí. Analizamos tu operación y construimos el sistema alrededor de tus procesos reales, no al revés." },
      { q: "¿Incluyen panel de administración?", a: "En general sí. La mayoría de los sistemas incluyen paneles para gestionar usuarios, contenido y operación diaria." },
    ],
    metaTitle: "Desarrollo de software a medida | Sigma Tecnologías",
    metaDescription: "Software y sistemas a medida con backend, paneles de administración y datos. Desarrollo de software en Tandil, Argentina.",
  },
  {
    slug: "desarrollo-saas",
    icon: "cloud",
    name: "SaaS y plataformas",
    category: "SaaS y plataformas",
    title: "SaaS y plataformas digitales",
    tagline: "Productos de software como servicio diseñados desde cero.",
    hero:
      "Diseñamos y desarrollamos plataformas de software como servicio con modelo recurrente. Productos escalables que resuelven un problema específico y se sostienen en el tiempo.",
    problem: [
      "Ideas de producto sin desarrollo técnico para llevarlas a producción.",
      "Desarrolladores sueltos que no piensan el negocio detrás del sistema.",
      "Plataformas que no pueden escalar ni agregar usuarios.",
      "Código sin transferencia, sin documentación y sin soporte.",
    ],
    includes: [
      "Validación inicial de producto y modelo de negocio.",
      "Arquitectura escalable desde el día uno.",
      "Panel de administración y gestión de usuarios.",
      "Autenticación, pagos y facturación si corresponde.",
      "Despliegue, monitoreo y mantenimiento.",
      "Código y propiedad transferidos al finalizar.",
    ],
    audience: [
      "Emprendedores con una idea de producto digital.",
      "Empresas que quieren lanzar una plataforma para su industria.",
      "Negocios que buscan un software propio como ventaja competitiva.",
      "Equipos que necesitan una plataforma multiusuario segura.",
    ],
    howWeWork: [
      { title: "Idea y alcance", description: "Definimos el problema, el usuario y el modelo de negocio antes de construir." },
      { title: "MVP", description: "Construimos una versión mínima viable rápida para validar con usuarios reales." },
      { title: "Iteración", description: "Agregamos módulos según aprendizaje real de uso." },
      { title: "Escala", description: "Optimizamos, lanzamos y acompañamos el crecimiento." },
    ],
    cases: [
      { name: "Iceberg", description: "Plataforma digital que procesa archivos y lee datos de Google Sheets para generar visualizaciones estructuradas.", url: "https://icebergpol.com/" },
      { name: "Faztred", description: "Plataforma digital con lógica de backend y datos estructurados.", url: "https://faztred.com.ar/" },
    ],
    faqs: [
      { q: "¿Pueden construir un SaaS desde cero?", a: "Sí. Diseñamos, desarrollamos y lanzamos plataformas de software como servicio con modelo recurrente, incluyendo panel de administración." },
      { q: "¿La plataforma queda nuestra al terminar?", a: "Sí. El código y la infraestructura se transfieren a tu propiedad al completar el proyecto." },
      { q: "¿Cómo se factura?", a: "Cada proyecto define su esquema: desarrollo inicial y mantenimiento mensual opcional. Se detalla en la propuesta sin costos ocultos." },
    ],
    metaTitle: "Desarrollo de SaaS y plataformas | Sigma Tecnologías",
    metaDescription: "Plataformas de software como servicio diseñadas desde cero: SaaS a medida, multiusuario y escalable. Desarrollo SaaS en Tandil, Argentina.",
  },
  {
    slug: "automatizacion",
    icon: "workflow",
    name: "Automatización",
    category: "Automatización",
    title: "Automatización de procesos",
    tagline: "Eliminamos tareas manuales y conectamos tus herramientas.",
    hero:
      "Sistemas que eliminan tareas manuales, conectan tus herramientas y optimizan flujos de trabajo con n8n, Make y plataformas modernas. Menos tiempo operativo, más eficiencia y menos errores.",
    problem: [
      "Tareas repetitivas que consumen horas de tu equipo.",
      "Herramientas desconectadas: datos copiados a mano entre sistemas.",
      "Errores humanos en procesos críticos.",
      "Procesos que funcionan solo cuando alguien los recuerda.",
    ],
    includes: [
      "Mapeo de tu proceso actual y puntos de fricción.",
      "Automatizaciones con n8n y Make.",
      "Integraciones entre herramientas (planes, CRM, email, WhatsApp).",
      "Reportes y notificaciones automáticas.",
      "Monitoreo de flujos para detectar fallas.",
      "Documentación para operar sin depender de nosotros.",
    ],
    audience: [
      "PyMEs con procesos operativos manuales.",
      "Agencias que necesitan escalar sin contratar más horas humano.",
      "Equipos comerciales que pierden tiempo en carga de datos.",
      "Empresas que quieren reducir errores y costos operativos.",
    ],
    howWeWork: [
      { title: "Relevamiento", description: "Entendemos el proceso, las herramientas y el objetivo de eficiencia." },
      { title: "Maquetado del flujo", description: "Diseñamos la automatización antes de conectar nada." },
      { title: "Implementación y pruebas", description: "Construimos con testeo en entornos seguros." },
      { title: "Puesta en marcha", description: "Activamos, monitoreamos y medimos resultados." },
    ],
    cases: [
      { name: "Sigma Trend Engine", description: "Motor de IA que procesa datos de múltiples plataformas y genera documentos estratégicos de forma automática." },
      { name: "Iceberg", description: "Automatización de lectura de Google Sheets y generación de visualizaciones.", url: "https://icebergpol.com/" },
    ],
    faqs: [
      { q: "¿Qué tipo de procesos se pueden automatizar?", a: "Tareas repetitivas, integraciones entre herramientas, generación de reportes, seguimiento de clientes y notificaciones." },
      { q: "¿Necesito reemplazar mis herramientas actuales?", a: "No. Las automatizaciones conectan las herramientas que ya usás para eliminar trabajo manual." },
      { q: "¿Cómo se mide el resultado?", a: "Definimos indicadores concretos: tiempo ahorrado, errores eliminados y tareas procesadas." },
    ],
    metaTitle: "Automatización de procesos | Sigma Tecnologías",
    metaDescription: "Automatización de procesos con n8n y Make: eliminá tareas manuales y conectá tus herramientas. Automatización en Tandil, Argentina.",
  },
  {
    slug: "inteligencia-artificial",
    icon: "brain",
    name: "Inteligencia artificial",
    category: "Inteligencia artificial",
    title: "Inteligencia artificial aplicada",
    tagline: "Herramientas con IA para analizar, decidir y automatizar mejor.",
    hero:
      "Integramos inteligencia artificial en productos y procesos: análisis de datos, motores de tendencias, automatización con lenguaje natural y generación de insights estratégicos. Tecnología que resuelve problemas reales de negocio.",
    problem: [
      "Datos dispersos que no se convierten en decisiones.",
      "Señales del mercado que llegás a ver tarde.",
      "Procesos con lenguaje natural que hoy hacés a mano.",
      "Reportes e insights que consumen horas de análisis.",
    ],
    includes: [
      "Análisis y procesamiento de datos con IA.",
      "Motores de detección de tendencias e insights.",
      "Asistentes y bots con lenguaje natural.",
      "Automatización inteligente de reportes.",
      "Integración con tus fuentes de datos y herramientas.",
      "Enfoque en resultado de negocio, no en tecnología por sí misma.",
    ],
    audience: [
      "Agencias y marcas que necesitan leer el mercado en tiempo real.",
      "Empresas con datos desaprovechados.",
      "Equipos que quieren automatizar análisis y documentos.",
      "Negocios que buscan una ventaja competitiva con IA aplicada.",
    ],
    howWeWork: [
      { title: "Definición del problema", description: "Identificamos dónde la IA agrega valor real a tu operación." },
      { title: "Selección de modelo", description: "Elegimos el enfoque técnico según datos, costo y objetivo." },
      { title: "Integración y entrenamiento", description: "Conectamos el modelo con tus datos y herramientas." },
      { title: "Métricas", description: "Validamos que los resultados se midan y mejoren en el tiempo." },
    ],
    cases: [
      { name: "Sigma Trend Engine", description: "Motor de IA que analiza contenido de redes sociales y detecta tendencias emergentes para agencias de marketing." },
      { name: "Sigma Analytics", description: "Analítica inteligente de rendimiento para clubes, analistas y jugadores." },
    ],
    faqs: [
      { q: "¿Qué resuelve la IA en un proyecto?", a: "Análisis de datos, motores de recomendación, automatización con lenguaje natural, generación de reportes e insights estratégicos." },
      { q: "¿Necesito conocimientos técnicos de IA?", a: "No. Lo integramos nosotros y mantenemos el foco en el resultado de negocio." },
    ],
    metaTitle: "Inteligencia artificial aplicada | Sigma Tecnologías",
    metaDescription: "Herramientas con IA para analizar datos, detectar tendencias y automatizar procesos. Inteligencia artificial aplicada en Tandil, Argentina.",
  },
  {
    slug: "integraciones",
    icon: "plug",
    name: "Integraciones",
    category: "Integraciones",
    title: "Integraciones entre herramientas",
    tagline: "Conectamos tus sistemas para que trabajen en sincronía.",
    hero:
      "Conectamos herramientas y sistemas para que compartan datos en tiempo real. Con APIs propias y plataformas como n8n y Make, tus sistemas trabajan en sincronía sin fricción ni doble carga de datos.",
    problem: [
      "Datos duplicados entre sistemas que nunca coinciden.",
      "Información que tenés que pasar a mano de una herramienta a otra.",
      "APIs y conexiones que nadie sabe mantener.",
      "Flujos entre herramientas que fallan sin que nadie lo note.",
    ],
    includes: [
      "Integraciones vía API con herramientas populares.",
      "Flujos de sincronización bidireccional.",
      "Automatización de carga y exportación de datos.",
      "Manejo de errores y monitoreo de conexiones.",
      "Documentación técnica para tu equipo.",
      "Mantenimiento proactivo de las conexiones.",
    ],
    audience: [
      "Empresas que usan muchas herramientas sin conexión entre ellas.",
      "Equipos que pierden tiempo en carga manual de datos.",
      "Organizaciones que necesitan una fuente de verdad única.",
      "Negocios que quieren datos en tiempo real entre sistemas.",
    ],
    howWeWork: [
      { title: "Inventario de herramientas", description: "Relevamos qué uso y qué debería conectarse." },
      { title: "Diseño de la integración", description: "Definimos flujo, frecuencia y manejo de errores." },
      { title: "Conexión y pruebas", description: "Implementamos con entornos de prueba y monitoreo." },
      { title: "Soporte", description: "Acompañamos la operación y escalamos si el volumen crece." },
    ],
    cases: [
      { name: "Iceberg", description: "Integración con Google Sheets para leer datos y generar visualizaciones estructuradas.", url: "https://icebergpol.com/" },
      { name: "Sigma Trend Engine", description: "Procesa datos de múltiples plataformas sociales y genera documentos de forma automática." },
    ],
    faqs: [
      { q: "¿Se integran con las herramientas que ya uso?", a: "Sí. Trabajamos con APIs de herramientas populares y plataformas de automatización como n8n y Make." },
      { q: "¿Una integración puede romper mi sistema?", a: "Trabajamos con entornos de prueba y monitoreo para minimizar riesgos. Validamos todo antes de tocar producción." },
    ],
    metaTitle: "Integraciones entre herramientas | Sigma Tecnologías",
    metaDescription: "Integraciones entre sistemas con APIs, n8n y Make: datos sincronizados en tiempo real. Integraciones tecnológicas en Tandil, Argentina.",
  },
];

export const getService = (slug?: string) => services.find((s) => s.slug === slug);

export const serviceByRelatedSlug = (related: string | null | undefined) => {
  if (!related) return undefined;
  return getService(related) ?? getService(services.find((s) => s.name.toLowerCase().includes(related.toLowerCase()))?.slug);
};

export const BASE_TOTAL_TAGLINE = BASE_TOTAL;
export const CTA_DEFAULT = CTA;