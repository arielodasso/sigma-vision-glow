const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { occupation, problem } = await req.json();

    const prompt = `Sos un generador de ideas de apps. Basándote en la ocupación y el problema del usuario, sugerí 3 ideas específicas de apps web que podrían construir con Lovable (un constructor de apps web con IA). Cada idea debe ser una oración específica describiendo la app, lo suficientemente detallada como para usarse como prompt. Escribí en español.

Ocupación del usuario: ${occupation || "No especificado"}
Problema que quiere resolver: ${problem || "No especificado"}

Las ideas DEBEN estar directamente relacionadas con la ocupación y el problema del usuario. Sé creativo pero relevante.

Devolvé ÚNICAMENTE un objeto JSON válido con un array "ideas" de 3 strings. Cada string es una idea de app concisa (una oración, en español). Sin markdown, sin code fences, sin explicación. Solo el JSON puro.`;

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

    // Parse JSON, handling markdown code fences
    const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.ideas && Array.isArray(parsed.ideas) && parsed.ideas.length > 0) {
        return new Response(JSON.stringify(parsed), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Fallback: split by newlines
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
