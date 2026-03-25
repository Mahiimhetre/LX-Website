import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";
import { encode } from "https://deno.land/std@0.177.0/encoding/hex.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    const signature = req.headers.get('x-razorpay-signature');
    const secret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');

    if (!signature || !secret) {
        return new Response(JSON.stringify({ error: 'Missing signature or secret' }), { status: 400 });
    }

    try {
        const bodyText = await req.text();

        // 1. Verify Signature (Using Deno's native crypto for speed)
        const key = await crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(secret),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
        );
        const sigBuffer = await crypto.subtle.sign(
            "HMAC",
            key,
            new TextEncoder().encode(bodyText)
        );
        const expectedSignature = new TextDecoder().decode(encode(new Uint8Array(sigBuffer)));

        if (expectedSignature !== signature) {
            console.error("Signature mismatch");
            return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401 });
        }

        const event = JSON.parse(bodyText);
        console.log("Webhook received:", event.event);

        if (event.event === 'payment.captured') {
            const payment = event.payload.payment.entity;
            const orderId = payment.order_id;
            const notes = payment.notes;
            const userId = notes.user_id;

            const supabase = createClient(
                Deno.env.get('SUPABASE_URL') ?? '',
                Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
            )

            // 2. Fetch Payment History
            const { data: history, error: historyError } = await supabase
                .from('payment_history')
                .select('*')
                .eq('order_id', orderId)
                .single();

            if (historyError || !history) {
                console.error("Order not found in history:", orderId);
                // We should still try to process it if we have user_id in notes
                if (!userId) return new Response("Order not found and no user_id", { status: 404 });
            }

            // 3. Subscription Stacking Logic
            const { data: profile } = await supabase
                .from('profiles')
                .select('billing_expiry_date, plan, email, name')
                .eq('user_id', userId)
                .single();

            let currentExpiry = profile?.billing_expiry_date ? new Date(profile.billing_expiry_date) : new Date();
            const now = new Date();

            if (currentExpiry < now) {
                currentExpiry = now;
            }

            const daysToAdd = history?.expiry_extension_days || 30;
            const newExpiry = new Date(currentExpiry.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));

            // 4. Update Profile
            await supabase
                .from('profiles')
                .update({
                    plan: notes.plan_name || 'pro',
                    billing_expiry_date: newExpiry.toISOString(),
                })
                .eq('user_id', userId);

            // 5. Update Payment History
            await supabase
                .from('payment_history')
                .update({
                    status: 'captured',
                    payment_id: payment.id,
                })
                .eq('order_id', orderId);

            // 6. Send Email Receipt
            const resendKey = Deno.env.get("RESEND_API_KEY");
            if (resendKey && profile?.email) {
                try {
                    const resend = new Resend(resendKey);
                    const amount = (payment.amount / 100).toLocaleString('en-IN', {
                        style: 'currency',
                        currency: payment.currency || 'INR'
                    });

                    await resend.emails.send({
                        from: "LocatorX <billing@resend.dev>",
                        to: [profile.email],
                        subject: `Payment Successful - ${payment.id}`,
                        html: `
                            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                                <h2 style="color: #1e40af;">Payment Received</h2>
                                <p>Hi ${profile.name || 'there'},</p>
                                <p>Thank you for your payment. Your <strong>${notes.plan_name || 'pro'}</strong> subscription has been successfully extended.</p>
                                
                                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                    <table style="width: 100%;">
                                        <tr><td style="color: #64748b;">Payment ID:</td><td style="text-align: right;">${payment.id}</td></tr>
                                        <tr><td style="color: #64748b;">Amount:</td><td style="text-align: right;"><strong>${amount}</strong></td></tr>
                                        <tr><td style="color: #64748b;">New Expiry:</td><td style="text-align: right;">${newExpiry.toLocaleDateString()}</td></tr>
                                    </table>
                                </div>

                                <p>You can download your full receipt from your dashboard at any time.</p>
                                <p>Best regards,<br>The LocatorX Team</p>
                            </div>
                        `
                    });
                    console.log(`Receipt email sent to ${profile.email}`);
                } catch (emailErr) {
                    console.error("Failed to send receipt email:", emailErr);
                }
            }

            console.log(`Successfully updated plan for user ${userId}. New expiry: ${newExpiry}`);
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error: any) {
        console.error("Webhook Error:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
})
