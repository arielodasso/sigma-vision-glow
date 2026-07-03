import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "get_brand_info",
  title: "Get brand info",
  description:
    "Return positioning, services, and contact info for Sigma Tecnologías — useful to answer questions about the studio.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const info = {
      name: "Sigma Tecnologías",
      type: "Estudio de software",
      founder: "Ariel Odasso",
      positioning:
        "Socio técnico para desarrollo a medida, automatizaciones y productos con IA. No prometemos, construimos.",
      services: [
        "Desarrollo de software a medida",
        "Automatizaciones e integraciones",
        "Productos propios con IA (Sigma Analytics, Sigma Trend Engine)",
      ],
      products: [
        { name: "Sigma Analytics", description: "Analítica de rendimiento para fútbol." },
        { name: "Sigma Trend Engine", description: "Motor de inteligencia de tendencias con IA." },
      ],
      websites: [
        "https://sigmatecnologiasarg.com",
        "https://www.sigmatecnologiasarg.com",
      ],
      contactPath: "/contacto",
    };
    return {
      content: [{ type: "text", text: JSON.stringify(info) }],
      structuredContent: info,
    };
  },
});
