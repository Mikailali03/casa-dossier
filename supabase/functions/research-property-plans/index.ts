import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { city, state, year_built } = await req.json()
    const apiKey = Deno.env.get('GOOGLE_AI_KEY')?.trim()
    if (!apiKey) throw new Error("GOOGLE_AI_KEY_NOT_CONFIGURED")

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`

    const prompt = `
      You are a regional property steward. Provide a vital stewardship plan for a home in ${city}, ${state} built in ${year_built}.
      Focus on items NOT associated with a specific appliance (Gutter cleaning, hose bibs, smoke detectors, foundation checks, siding).
      
      You MUST return a JSON object with this exact structure:
      {
        "tasks": [
          {
            "task_name": "WINTERIZE EXTERIOR HOSE BIBS",
            "frequency_months": 12,
            "instructions": "Step 1: Disconnect hoses\\nStep 2: Turn off internal shutoff\\nStep 3: Open exterior tap to drain"
          }
        ]
      }

      CRITICAL: "instructions" must be a single string using \\n. Do NOT use commas to separate steps.
      Return ONLY valid JSON. No preamble.`

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
      })
    })

    const result = await response.json()
    const text = result.candidates[0].content.parts[0].text
    return new Response(text, { status: 200, headers: corsHeaders })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
  }
})