-- ============================================================
-- Seed de FAQs por servicio
-- Administrables desde el admin: /admin/contenidos/faqs
-- Idempotente: no duplica preguntas existentes por (category, question).
-- ============================================================

WITH seed(category, question, answer, sort_order) AS (
  VALUES
    -- Desarrollo web
    ('desarrollo-web', '¿Cuánto tarda un desarrollo web a medida?', 'Depende del alcance. Una landing optimizada se entrega en 1 a 3 semanas; un sitio con panel de administración suele llevar de 4 a 8 semanas. En la reunión inicial definimos un plazo concreto.', 1),
    ('desarrollo-web', '¿Incluyen diseño o solo desarrollo?', 'Cubrimos diseño con propósito, desarrollo y puesta en producción. Interfaces orientadas a negocio, usabilidad y conversión.', 2),
    ('desarrollo-web', '¿Puedo actualizar el contenido yo mismo?', 'Sí. En muchos proyectos integramos un panel de administración para que edites contenido sin depender de un equipo técnico.', 3),
    ('desarrollo-web', '¿El sitio queda preparado para buscadores?', 'Sí. Trabajamos SEO técnico, estructura y rendimiento optimizado para que el sitio tenga una base sólida en Google desde el día uno.', 4),

    -- Desarrollo de software
    ('desarrollo-software', '¿Desarrollan sistemas a medida sobre mi proceso?', 'Sí. Analizamos tu operación y construimos el sistema alrededor de tus procesos reales, no al revés.', 1),
    ('desarrollo-software', '¿Incluyen panel de administración?', 'En general sí. La mayoría de los sistemas incluyen paneles para gestionar usuarios, contenido y operación diaria.', 2),
    ('desarrollo-software', '¿Con qué tecnologías construyen los sistemas?', 'Usamos tecnologías web modernas, bases de datos sólidas e integraciones según el problema. La tecnología se elige en función de tu proceso y presupuesto.', 3),
    ('desarrollo-software', '¿Quién se encarga del mantenimiento?', 'Publicamos y acompañamos la operación. Ofrecemos mantenimiento y evolución del sistema para que se adapte a tu negocio en el tiempo.', 4),

    -- SaaS y plataformas
    ('desarrollo-saas', '¿Pueden construir un SaaS desde cero?', 'Sí. Diseñamos, desarrollamos y lanzamos productos digitales con usuarios, administración y modelo de negocio propios, desde el MVP hasta la evolución.', 1),
    ('desarrollo-saas', '¿La plataforma queda nuestra al terminar?', 'Las condiciones de propiedad, código y operación se definen por contrato en cada proyecto. Lo conversamos con transparencia en la propuesta.', 2),
    ('desarrollo-saas', '¿Cómo se factura?', 'Cada proyecto define su esquema: desarrollo inicial y mantenimiento mensual opcional. Se detalla en la propuesta sin costos ocultos.', 3),
    ('desarrollo-saas', '¿Cuánto cuesta un MVP para validar una idea?', 'Cada MVP es distinto según alcance y funcionalidades. En la reunión inicial definimos el MVP mínimo para validar y te pasamos una propuesta con costos claros.', 4),

    -- Automatización
    ('automatizacion', '¿Qué tipo de procesos se pueden automatizar?', 'Tareas repetitivas, integraciones entre herramientas, generación de reportes, seguimiento de clientes y notificaciones.', 1),
    ('automatizacion', '¿Necesito reemplazar mis herramientas actuales?', 'No. Las automatizaciones conectan las herramientas que ya usás para eliminar trabajo manual.', 2),
    ('automatizacion', '¿Cómo se mide el resultado?', 'Definimos indicadores concretos: tiempo ahorrado, errores eliminados y tareas procesadas.', 3),
    ('automatizacion', '¿Qué pasa si falla una automatización?', 'Diseñamos manejo de errores, reintentos y monitoreo. Si algo falla, te notificamos y la automatización se recupera sin detener tu operación.', 4),

    -- Inteligencia artificial
    ('inteligencia-artificial', '¿Qué resuelve la IA en un proyecto?', 'Análisis de datos, motores de recomendación, automatización con lenguaje natural, generación de reportes e insights estratégicos.', 1),
    ('inteligencia-artificial', '¿Necesito conocimientos técnicos de IA?', 'No. Lo integramos nosotros y mantenemos el foco en el resultado de negocio.', 2),
    ('inteligencia-artificial', '¿Con qué datos trabaja la IA?', 'Trabajamos con tus datos y fuentes de información, definiendo flujos seguros y controlados para cada caso.', 3),
    ('inteligencia-artificial', '¿La IA reemplaza a mi equipo?', 'No. La IA asiste tareas de análisis y generación de contenido. Tu equipo gana tiempo y se enfoca en decisiones y criterio.', 4),

    -- Integraciones
    ('integraciones', '¿Se integran con las herramientas que ya uso?', 'Sí. Trabajamos con APIs de herramientas populares y plataformas de automatización como n8n y Make.', 1),
    ('integraciones', '¿Una integración puede romper mi sistema?', 'Trabajamos con entornos de prueba y monitoreo para minimizar riesgos. Validamos todo antes de tocar producción.', 2),
    ('integraciones', '¿Cuánto tiempo lleva una integración?', 'Depende de la complejidad: APIs y sincronizaciones simples suelen tomar días; integraciones con lógica de negocio llevan más. Lo definimos en el relevamiento inicial.', 3),
    ('integraciones', '¿Qué pasa si una integración falla?', 'Diseñamos manejo de errores, reintentos y monitoreo con notificaciones para que los datos sigan fluyendo sin intervención manual.', 4)
)
INSERT INTO public.faqs (category, question, answer, published, sort_order)
SELECT seed.category, seed.question, seed.answer, true, seed.sort_order
FROM seed
WHERE NOT EXISTS (
  SELECT 1 FROM public.faqs f
  WHERE f.category = seed.category AND f.question = seed.question
);