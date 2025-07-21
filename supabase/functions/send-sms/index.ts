import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { memberName, phoneNumber, clientName, dealerName } = await req.json()

    // Message prédéfini
    const message = `Salut ${memberName}, un nouvel acheteur vient de t'être attribué. ${clientName} + ${dealerName}. Peux-tu le mettre à ton numéro et prendre contact ASAP. Merci ! 😊`

    // Pour l'instant, on simule l'envoi SMS (vous devrez intégrer un service SMS réel)
    console.log(`SMS à envoyer à ${phoneNumber}:`, message)

    // TODO: Intégrer avec un service SMS comme Twilio, TextMagic, etc.
    // Exemple avec Twilio:
    /*
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER')

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: fromNumber,
        To: phoneNumber,
        Body: message,
      }),
    })
    */

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SMS envoyé avec succès',
        preview: message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})