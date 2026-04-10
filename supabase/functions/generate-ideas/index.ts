const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(clientIp)) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Try again in a minute." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { occupation, problem } = body as Record<string, unknown>;

    // Validate inputs
    const trimOccupation = typeof occupation === "string" ? occupation.trim().slice(0, 200) : "";
    const trimProblem = typeof problem === "string" ? problem.trim().slice(0, 500) : "";

    if (!trimOccupation && !trimProblem) {
      return new Response(
        JSON.stringify({ error: "Please provide an occupation or problem" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = `Sos un generador de ideas de apps. Basándote en la ocupación y el problema del usuario, sugerí 3 ideas MUY ESPECÍFICAS de apps web que resuelvan DIRECTAMENTE el problema planteado. Cada idea debe ser una oración concreta describiendo la app.

Ocupación del usuario: ${trimOccupation || "No especificado"}
Problema que quiere resolver: ${trimProblem || "No especificado"}

IMPORTANTE: Las ideas DEBEN resolver directamente el problema mencionado. Sé creativo pero 100% relevante. Escribí en español.

Devolvé ÚNICAMENTE un JSON válido: {"ideas":["idea1","idea2","idea3"]}. Sin markdown, sin explicación.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI API error:", response.status, errText);
      throw new Error(`AI API returned ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    console.log("AI content:", content);

    const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.ideas && Array.isArray(parsed.ideas) && parsed.ideas.length > 0) {
        return new Response(JSON.stringify({ ideas: parsed.ideas.slice(0, 3) }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Fallback
    const ideas = content
      .split("\n")
      .filter((l: string) => l.trim().length > 10)
      .slice(0, 3);

    if (ideas.length > 0) {
      return new Response(JSON.stringify({ ideas }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Could not parse AI response");
  } catch (error) {
    console.error("Error generating ideas:", error);
    return new Response(
      JSON.stringify({
        ideas: [
          "Dashboard personalizado para gestionar tu negocio con métricas en tiempo real",
          "Landing page optimizada para captar clientes con formulario inteligente",
          "Herramienta de automatización para eliminar tareas repetitivas del día a día",
        ],
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
