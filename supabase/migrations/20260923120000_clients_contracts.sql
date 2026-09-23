-- ============================================================
-- Contratos de clientes · contratos y plantillas
-- ============================================================

-- ------------------------------------------------------------
-- 1) contract_templates · plantillas reutilizables
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contract_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  contract_type text NOT NULL DEFAULT 'general' CHECK (contract_type IN ('desarrollo','mantenimiento','general')),
  body text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contract_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read contract templates"
ON public.contract_templates FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()));

CREATE POLICY "Backoffice can manage contract templates"
ON public.contract_templates FOR ALL TO authenticated
USING (public.is_backoffice(auth.uid()))
WITH CHECK (public.is_backoffice(auth.uid()));

-- ------------------------------------------------------------
-- 2) contracts · contratos firmados/enviados por cliente
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  title text NOT NULL,
  contract_type text NOT NULL DEFAULT 'general' CHECK (contract_type IN ('desarrollo','mantenimiento','general')),
  amount numeric(14,2),
  currency text NOT NULL DEFAULT 'ARS',
  project text,
  body text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','signed')),
  sent_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Backoffice can manage contracts"
ON public.contracts FOR ALL TO authenticated
USING (public.is_backoffice(auth.uid()))
WITH CHECK (public.is_backoffice(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_contracts_client ON public.contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_created_at ON public.contracts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON public.contracts(status);

-- ------------------------------------------------------------
-- 3) Plantillas iniciales: desarrollo y mantenimiento
--    Tokens que se reemplazan al generar: {{cliente}} {{empresa}}
--    {{proyecto}} {{moneda}} {{monto}} {{fecha}}
-- ------------------------------------------------------------
INSERT INTO public.contract_templates (name, contract_type, body) VALUES
('Desarrollo de software', 'desarrollo', $TEMPLATES$CONTRATO DE DESARROLLO DE SOFTWARE

Entre: SIGMA TECNOLOGÍAS, con domicilio en la República Argentina, en adelante "EL PROVEEDOR", y {{cliente}}{{empresa}}, en adelante "EL CLIENTE", se celebra el presente contrato sujeto a las siguientes cláusulas:

1. OBJETO
El PROVEEDOR se compromete a desarrollar el proyecto "{{proyecto}}" para el CLIENTE, de acuerdo con el alcance oportunamente acordado y detallado en el presupuesto asociado.

2. MONTO Y FORMA DE PAGO
El CLIENTE abonará la suma de {{moneda}} {{monto}} por la totalidad de los servicios de desarrollo, bajo las condiciones de pago pactadas en el presupuesto correspondiente.

3. PLAZO DE ENTREGA
El desarrollo será entregado dentro de los plazos estipulados entre las partes, contados desde la firma del presente contrato.

4. PROPIEDAD INTELECTUAL
Una vez abonado el total pactado, el código fuente y los derechos de uso del desarrollo pasan al CLIENTE. Quedan exceptuadas las librerías, componentes y herramientas de terceros utilizadas en el proyecto.

5. GARANTÍA
El PROVEEDOR garantiza el correcto funcionamiento del entregable durante un período acordado, cubriendo errores detectados dentro de ese plazo. No incluye desarrollos nuevos ni modificaciones de alcance, que serán presupuestados por separado.

6. CONFIDENCIALIDAD
Ambas partes se comprometen a mantener la confidencialidad de la información intercambiada en el marco del presente contrato.

7. JURISDICCIÓN
Para cualquier controversia derivada del presente, las partes se someten a la jurisdicción de los tribunales de la República Argentina.

En lugar y fecha: {{fecha}}

____________________________            ____________________________
Firma EL PROVEEDOR                       Firma EL CLIENTE$TEMPLATES$),
('Servicio de mantenimiento', 'mantenimiento', $TEMPLATES$CONTRATO DE SERVICIO DE MANTENIMIENTO

Entre: SIGMA TECNOLOGÍAS, en adelante "EL PROVEEDOR", y {{cliente}}{{empresa}}, en adelante "EL CLIENTE", se celebra el presente contrato de servicio de mantenimiento sujeto a las siguientes cláusulas:

1. OBJETO
El PROVEEDOR prestará servicios de mantenimiento técnico sobre el proyecto "{{proyecto}}" de acuerdo con las condiciones detalladas a continuación.

2. MONTO MENSUAL
El CLIENTE abonará un monto mensual de {{moneda}} {{monto}} por los servicios de mantenimiento, renovable mes a mes.

3. ALCANCE
El servicio incluye: monitoreo de disponibilidad, corrección de errores, actualizaciones menores de seguridad y compatibilidad, y soporte técnico. No incluye desarrollos de nuevas funcionalidades, los cuales serán cotizados por separado.

4. VIGENCIA
El contrato tendrá vigencia mensual y se renovará automáticamente, salvo aviso previo de cualquiera de las partes con al menos treinta días de anticipación.

5. TIEMPO DE RESPUESTA
El PROVEEDOR se compromete a responder los incidentes dentro de un plazo razonable y a resolver las fallas que impidan el uso normal del sitio en el menor tiempo posible.

6. CONFIDENCIALIDAD
Ambas partes se comprometen a mantener la confidencialidad de la información intercambiada en el marco del presente contrato.

7. JURISDICCIÓN
Para cualquier controversia derivada del presente, las partes se someten a la jurisdicción de los tribunales de la República Argentina.

En lugar y fecha: {{fecha}}

____________________________            ____________________________
Firma EL PROVEEDOR                       Firma EL CLIENTE$TEMPLATES$)
ON CONFLICT (name) DO NOTHING;