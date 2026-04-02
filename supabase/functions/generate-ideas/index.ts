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

    const prompt = `You are an app idea generator. Based on the user's occupation and problem, suggest 3 specific web app ideas they could build with Lovable (an AI web app builder). Each idea should be a single sentence describing the app, specific enough to be used as a prompt. Write in Spanish.

Occupation: ${occupation || "No especificado"}
Problem: ${problem || "No especificado"}

Return ONLY a valid JSON object with an "ideas" array of 3 strings. Each string is a concise app idea (one sentence, in Spanish). No markdown, no code fences, no explanation. Just the raw JSON object.`;

    const response = await fetch(
      "https://qxkeungqbgaytxdfhccn.supabase.co/functions/v1/ai",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );

    if (!response.ok) {
      console.error("AI API error:", response.status, await response.text());
      throw new Error(`AI API returned ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response:", JSON.stringify(data));
    
    const content = data.choices?.[0]?.message?.content || "";
    console.log("Content:", content);

    // Try to parse JSON from the response, handling markdown code fences
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
