-- ============================================================
-- Seed Real Cases · Casos reales para coincidir con la home
-- ============================================================

INSERT INTO public.real_cases (name, description, logo_url, logo_theme, url, services, published, sort_order) VALUES
  (
    'Capitán Deportes',
    'Sitio web para la marca Capitán Deportes, con foco en presencia digital y captación de clientes.',
    '/assets/clients/capitan-2.png',
    'dark',
    'https://capitandeportes.com/',
    ARRAY['desarrollo-web'],
    true,
    1
  ),
  (
    'OffMarket',
    'Sitio corporativo para el ecosistema tech argentino.',
    '/assets/clients/offmarket.png',
    'dark',
    'https://www.offmarket.com.ar/',
    ARRAY['desarrollo-web'],
    true,
    2
  ),
  (
    'Justa',
    'Sitio institucional para agencia creativa.',
    '/assets/clients/justa.png',
    'light',
    'https://justaagencia.com/',
    ARRAY['desarrollo-web'],
    true,
    3
  ),
  (
    'Unidos Para Amar',
    'Plataforma digital para organización sin fines de lucro.',
    '/assets/clients/unidos-para-amar.png',
    'light',
    'https://unidosparaamar.org/',
    ARRAY['desarrollo-web'],
    true,
    4
  ),
  (
    'Geonosis',
    'Sitio web para empresa de tecnología y desarrollo.',
    '/assets/clients/geonosis.png',
    'light',
    'https://geonosis.com.ar/',
    ARRAY['desarrollo-web'],
    true,
    5
  ),
  (
    'Cristian Schauvinhold',
    'Sitio web personal para profesional de la salud.',
    '/assets/clients/cristian-schauvinhold.png',
    'light',
    'https://cristianschauvinhold.com/',
    ARRAY['desarrollo-web'],
    true,
    6
  ),
  (
    'Estamos Unidos',
    'Plataforma digital para comunidad y eventos.',
    '/assets/clients/estamos-unidos.png',
    'dark',
    'https://somosestamosunidos.com/',
    ARRAY['desarrollo-web'],
    true,
    7
  ),
  (
    'Calisthenia Online',
    'Plataforma de entrenamiento y comunidad fitness.',
    '/assets/clients/calisthenia-online.png',
    'light',
    'https://calisthenia.online/',
    ARRAY['desarrollo-web', 'desarrollo-saas'],
    true,
    8
  ),
  (
    'Peris Electricidad',
    'Sitio web corporativo para empresa de instalaciones eléctricas.',
    '/assets/clients/peris-electricidad.png',
    'light',
    'https://www.periselectricidad.es/',
    ARRAY['desarrollo-web'],
    true,
    9
  ),
  (
    'Mobihunter',
    'Plataforma SaaS para gestión de flotas y logística.',
    '/assets/clients/mobihunter.png',
    'dark',
    'http://mobihunter.io/',
    ARRAY['desarrollo-saas', 'desarrollo-software'],
    true,
    10
  ),
  (
    'Faztred',
    'Sistema digital con lógica de backend y datos estructurados.',
    '/assets/clients/faztred.png',
    'dark',
    'https://faztred.com.ar/',
    ARRAY['desarrollo-software', 'automatizacion'],
    true,
    11
  ),
  (
    'Solcitos',
    'Sistema a medida para centralizar la información y digitalizar la gestión diaria de una guardería.',
    '/assets/clients/solcitos.png',
    'dark',
    NULL,
    ARRAY['desarrollo-software'],
    true,
    12
  ),
  (
    'Iceberg',
    'Integración con Google Sheets para leer datos y generar visualizaciones estructuradas.',
    '/assets/platforms/iceberg.svg',
    'dark',
    'https://icebergpol.com/',
    ARRAY['integraciones', 'automatizacion'],
    true,
    13
  ),
  (
    'Sigma Trend Engine',
    'Motor de IA que analiza contenido de redes sociales y detecta tendencias emergentes.',
    '/assets/platforms/sigma-trend-engine.png',
    'dark',
    NULL,
    ARRAY['inteligencia-artificial', 'automatizacion', 'desarrollo-saas'],
    true,
    14
  ),
  (
    'Precios Tandil',
    'Automatización de relevamiento y publicación de precios para el mercado local.',
    '/assets/clients/preciostandil.png',
    'dark',
    'https://preciostandil.vercel.app/',
    ARRAY['automatizacion', 'integraciones'],
    true,
    15
  )
ON CONFLICT (name) DO NOTHING;