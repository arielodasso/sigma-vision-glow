-- ============================================================
-- Ajustes de contenido · FAQ de servicios
-- ============================================================

-- Suavizar la promesa de "transferencia del código a tu propiedad" en el FAQ de SaaS.
-- La transferencia puede formar parte del contrato de cada proyecto, pero no debería
-- afirmarse como una capacidad estándar del servicio.
UPDATE public.faqs
SET answer = 'Las condiciones de propiedad, código y operación se definen por contrato en cada proyecto. Lo conversamos con transparencia en la propuesta.'
WHERE category = 'desarrollo-saas'
  AND question = '¿La plataforma queda nuestra al terminar?';