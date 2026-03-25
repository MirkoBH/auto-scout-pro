import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { marca, modelo, anio, kilometraje, descripcion, imagen_urls } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Build image content parts for multimodal
    const imageContent: any[] = (imagen_urls || []).slice(0, 5).map((url: string) => ({
      type: "image_url",
      image_url: { url },
    }));

    const textPrompt = `Eres un experto tasador de autos usados. Evalúa el siguiente vehículo considerando todos los datos proporcionados y las imágenes adjuntas.

Vehículo:
- Marca: ${marca}
- Modelo: ${modelo}
- Año: ${anio}
- Kilometraje: ${kilometraje ? kilometraje + " km" : "No especificado"}
- Descripción del vendedor: ${descripcion || "Sin descripción"}

INSTRUCCIONES:
1. Analiza las fotos del vehículo buscando daños visibles: rayones, abolladuras, óxido, partes faltantes, desgaste interior, etc.
2. Identifica qué partes específicas del auto están dañadas (ej: paragolpes delantero, puerta trasera derecha, capó, etc.)
3. Considera la marca, modelo, año, kilometraje y estado visible para dar un rango de precio estimado en USD.
4. Da una valoración general del 1 al 100.

Responde con la evaluación completa del vehículo.`;

    const userContent: any[] = [{ type: "text", text: textPrompt }, ...imageContent];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Eres un tasador experto de vehículos usados con capacidad de análisis visual de imágenes." },
          { role: "user", content: userContent },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "vehicle_assessment",
              description: "Return a structured vehicle condition assessment with price range",
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
                    description: "Detailed description of visible damages, affected parts, and wear in Spanish. If no damage, say so.",
                  },
                  puntaje: {
                    type: "number",
                    description: "Quality score from 1 to 100",
                  },
                  precio_estimado_min: {
                    type: "number",
                    description: "Minimum estimated price in USD",
                  },
                  precio_estimado_max: {
                    type: "number",
                    description: "Maximum estimated price in USD",
                  },
                },
                required: ["estado", "estimacion_danos", "puntaje", "precio_estimado_min", "precio_estimado_max"],
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
