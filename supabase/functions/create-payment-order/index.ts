import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Razorpay from "npm:razorpay@2.9.2"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { amount, currency, receipt, notes } = await req.json()

        if (!amount || !currency) {
            throw new Error("Missing amount or currency");
        }

        const razorpay = new Razorpay({
            key_id: Deno.env.get('RAZORPAY_KEY_ID') ?? '',
            key_secret: Deno.env.get('RAZORPAY_KEY_SECRET') ?? '',
        })

        const options = {
            amount: amount * 100, // Razorpay takes amount in paise (sub-unit)
            currency: currency,
            receipt: receipt,
            notes: notes,
        }

        const order = await razorpay.orders.create(options)

        // LOG TO DATABASE
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { error: dbError } = await supabase
            .from('payment_history')
            .insert({
                user_id: notes.user_id,
                order_id: order.id,
                amount: amount,
                currency: currency,
                status: 'pending',
                plan_name: notes.plan_name,
                notes: notes
            })

        if (dbError) {
            console.error("Database Log Error:", dbError)
            // We don't throw here to not block the user from paying if just logging fails, 
            // but in production, you might want more strictness.
        }

        return new Response(
            JSON.stringify(order),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            },
        )
    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message || 'Unknown error' }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            },
        )
    }
})
