import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { marca, modelo, anio, kilometraje, descripcion } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = `Eres un experto tasador de autos usados. Evalúa el siguiente vehículo y responde SOLAMENTE con el JSON solicitado.

Vehículo:
- Marca: ${marca}
- Modelo: ${modelo}
- Año: ${anio}
- Kilometraje: ${kilometraje ? kilometraje + " km" : "No especificado"}
- Descripción del vendedor: ${descripcion || "Sin descripción"}

Responde con la evaluación del vehículo.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "Eres un tasador experto de vehículos usados." },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "vehicle_assessment",
              description: "Return a structured vehicle condition assessment",
              parameters: {
                type: "object",
                properties: {
                  estado: {
                    type: "string",
                    enum: ["Excelente", "Bueno", "Regular", "Malo"],
                    description: "Overall condition of the vehicle",
                  },
                  estimacion_danos: {
                    type: "string",
                    description: "Brief description of estimated damages or wear in Spanish",
                  },
                  puntaje: {
                    type: "number",
                    description: "Score from 1 to 100",
                  },
                },
                required: ["estado", "estimacion_danos", "puntaje"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "vehicle_assessment" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again later" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const assessment = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(assessment), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("assess-vehicle error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
