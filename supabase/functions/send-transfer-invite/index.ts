import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { record } = await req.json()
    
    // 1. Initialize Admin Client to get property details
    const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // 2. Fetch the property address
    const { data: property } = await supabaseAdmin
      .from('properties')
      .select('address')
      .eq('id', record.property_id)
      .single()

    const address = property?.address || "A Private Property"

    // 3. Send the Email via Resend
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Casa Dossier <onboarding@resend.dev>',
        to: record.recipient_email,
        subject: `Deed Transfer: ${address}`,
        html: `
          <div style="font-family: sans-serif; background-color: #020617; color: white; padding: 40px; text-align: center; border: 1px solid #1e293b;">
            <h1 style="text-transform: uppercase; letter-spacing: 4px; color: #f59e0b;">CASA DOSSIER</h1>
            <p style="color: #94a3b8; font-size: 14px; text-transform: uppercase; tracking-widest: 2px;">Official Property Transfer</p>
            <div style="background-color: #0f172a; border: 1px solid #1e293b; padding: 30px; margin: 30px 0;">
              <p style="font-size: 10px; color: #f59e0b; font-weight: bold; text-transform: uppercase; margin: 0; letter-spacing: 2px;">Property Deed Transferred</p>
              <p style="font-size: 22px; font-weight: 900; margin: 10px 0; color: white;">${address}</p>
            </div>
            <p style="color: #94a3b8; font-size: 14px; line-height: 1.8; max-width: 400px; margin: 0 auto;">
              The digital dossier, maintenance history, and capital ledger for this property have been escrowed for your account.
            </p>
            <a href="${Deno.env.get('PUBLIC_SITE_URL') || 'http://localhost:5173'}" 
               style="background-color: #f59e0b; color: #020617; padding: 18px 35px; text-decoration: none; font-weight: 900; display: inline-block; margin-top: 30px; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">
               Claim Digital Deed
            </a>
            <p style="color: #475569; font-size: 9px; margin-top: 50px; text-transform: uppercase;">Authenticated via Casa Dossier Protocol v1.0</p>
          </div>
        `,
      }),
    })

    const result = await emailRes.json()
    return new Response(JSON.stringify(result), { status: 200, headers: corsHeaders })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
  }
})