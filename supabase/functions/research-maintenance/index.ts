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
        text: `You are a technical home systems inspector. Analyze this technical plate photo and research official protocols.
        
        OUTPUT RULES:
        1. "brand", "model", "serial_number", "manufacture_date" (YYYY-MM-DD).
        2. "category": HVAC, PLUMBING, APPLIANCES, ELECTRICAL, SMART HOME, or STRUCTURE.
        3. "replacement_cost_est": Integer USD to buy/install new.
        4. "tasks": Array of objects.
           - "task_name": Concise action (e.g. REPLACE FILTER).
           - "frequency_months": Integer.
           - "instructions": Single string. 3-5 steps separated by \\n. 
        
        CRITICAL: Do NOT use JSON arrays for instructions. Do NOT use commas to separate steps.
        Return ONLY valid JSON.`
      }, {
        inline_data: { mime_type: "image/jpeg", data: image }
      }];
    } else {
      userContent = [{
        text: `Research manufacturer maintenance for: ${brand} ${model} (${category}).
        
        You MUST return a JSON object with this exact structure:
        {
          "replacement_cost_est": 2500,
          "tasks": [
            {
              "task_name": "CLEAN CONDENSER COILS",
              "frequency_months": 12,
              "instructions": "Step 1: Power down\\nStep 2: Remove debris\\nStep 3: Vacuum fins"
            }
          ]
        }
        
        CRITICAL: instructions must be a single string using \\n for newlines. Return ONLY JSON.`
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
    const text = result.candidates[0].content.parts[0].text
    return new Response(text, { status: 200, headers: corsHeaders })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
  }
})