import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { brand, model, category, image } = await req.json()
    const apiKey = Deno.env.get('GOOGLE_AI_KEY')?.trim()
    if (!apiKey) throw new Error("GOOGLE_AI_KEY_NOT_CONFIGURED")

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`

    let userContent = [];
    
    if (image) {
      userContent = [{
        text: `Analyze this technical plate photo. 
        1. Extract: brand, model, serial_number, manufacture_date (YYYY-MM-DD).
        2. Assign CATEGORY: HVAC, PLUMBING, APPLIANCES, ELECTRICAL, SMART HOME, or STRUCTURE.
        3. Estimate "estimated_replacement_cost" (Integer USD) for a new unit + professional installation.
        4. Research official maintenance.
        
        OUTPUT RULES:
        - Return a JSON object with: "brand", "model", "serial_number", "manufacture_date", "category", "estimated_replacement_cost", and a "tasks" array.
        - "instructions" in tasks must be a single string with \\n separators.
        - Return ONLY JSON.`
      }, {
        inline_data: { mime_type: "image/jpeg", data: image }
      }];
    } else {
      userContent = [{
        text: `Research maintenance and replacement costs for: ${brand} ${model} (${category}).
        
        Output a JSON object with:
        1. "estimated_replacement_cost": Integer (Typical cost to buy and professionally install a new equivalent).
        2. "tasks": Array of objects (task_name, frequency_months, instructions string with \\n).
           
        Return ONLY valid JSON.`
      }];
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: userContent }],
        generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
      })
    })

    const result = await response.json()
    return new Response(result.candidates[0].content.parts[0].text, { status: 200, headers: corsHeaders })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
  }
})