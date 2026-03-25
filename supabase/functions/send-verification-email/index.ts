// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  name: string;
  redirectTo?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, redirectTo }: EmailRequest = await req.json();

    console.log(`Generating verification link for: ${email}`);

    // Generate Verification Link using Admin API
    const { data, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "signup",
      email: email,
      options: {
        redirectTo: redirectTo ?? "http://localhost:3000"
      }
    });

    if (linkError) {
      console.error("Error generating link:", linkError);
      throw linkError;
    }

    const verificationUrl = data.properties.action_link;
    console.log("Link generated successfully");

    console.log(`Sending verification email to: ${email}`);

    const emailResponse = await resend.emails.send({
      from: "LocatorX <onboarding@resend.dev>",
      to: [email],
      subject: "Verify your LocatorX account",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; }
            .logo { font-size: 24px; font-weight: bold; background: linear-gradient(to right, #1e90ff, #ff7a00); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 10px; }
            .button { display: inline-block; background: linear-gradient(135deg, #1e90ff, #ff7a00); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">LocatorX</div>
              <p>Locator Generator & Manager</p>
            </div>
            <div class="content">
              <h2>Welcome, ${name}!</h2>
              <p>Thank you for registering with LocatorX. Please verify your email address by clicking the button below:</p>
              <p style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email</a>
              </p>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #1e90ff;">${verificationUrl}</p>
              <p>This link will expire in 24 hours.</p>
            </div>
            <div class="footer">
              <p>If you didn't create an account with LocatorX, you can safely ignore this email.</p>
              <p>&copy; 2024 LocatorX. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
