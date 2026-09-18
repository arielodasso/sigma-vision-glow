type AnalyticsParams = Record<string, string | number | boolean>;

declare global {
  interface Window {
    dataLayer?: AnalyticsParams[];
  }
}

const ENABLED = true;

/**
 * Eventos de negocio para GA4 vía GTM (GTM-PC242KMQ).
 * Se empujan a dataLayer como eventos "custom".
 */
const track = (event: string, params?: AnalyticsParams) => {
  if (!ENABLED || typeof window === "undefined") return;
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...params });
  } catch (err) {
    console.warn("[analytics] no se pudo registrar el evento", event, err);
  }
};

export const analytics = {
  agendaReunion: (label?: string) => track("click_agendar_reunion", { label }),
  servicio: (servicio: string) => track("click_servicio", { servicio }),
  caso: (caso?: string) => track("click_caso", { caso }),
  testimonio: (name?: string) => track("click_testimonio", { name }),
  blog: (slug?: string) => track("click_blog", { slug }),
  contacto: (label?: string) => track("click_contacto", { label }),
  submitContacto: (data?: { service?: string }) => track("submit_contacto", { ...(data?.service ? { servicio: data.service } : {}) }),
  producto: (producto?: string) => track("click_producto", { producto }),
};