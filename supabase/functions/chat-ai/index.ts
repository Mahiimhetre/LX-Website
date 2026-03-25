import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { message } = await req.json()
        const apiKey = Deno.env.get('GEMINI_API_KEY')

        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not set')
        }

        console.log('Calling Google Gemini API with message:', message)

        const MODEL_NAME = 'gemini-2.5-flash';
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are a helpful AI assistant for Locator-X, a tool for generating and managing consistent test locators (XPath, CSS, ID) for QA teams. Answer the user's question concisely.\n\nUser: ${message}`
                        }]
                    }]
                }),
            }
        )

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Gemini API Error: ${response.status} ${errorText}`)
        }

        const data = await response.json()
        console.log('Gemini response:', JSON.stringify(data))

        const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that."

        return new Response(
            JSON.stringify({
                reply: aiMessage,
                meta: {
                    provider: 'Google Gemini',
                    model: MODEL_NAME
                }
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        console.error('Error:', error.message)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            }
        )
    }
})
