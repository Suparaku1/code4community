import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReportNotificationRequest {
  title: string;
  description: string;
  tracking_code: string;
  neighborhood?: string;
  has_location: boolean;
  reporter_name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-report-notification function invoked");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { title, description, tracking_code, neighborhood, has_location, reporter_name }: ReportNotificationRequest = await req.json();
    
    console.log("Received report notification request:", { title, tracking_code });

    // Fetch all admins
    const { data: admins, error: adminError } = await supabase
      .from("admins")
      .select("email, full_name");

    if (adminError) {
      console.error("Error fetching admins:", adminError);
      throw adminError;
    }

    if (!admins || admins.length === 0) {
      console.log("No admins found to notify");
      return new Response(JSON.stringify({ message: "No admins to notify" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Found ${admins.length} admins to notify`);

    const adminEmails = admins.map(admin => admin.email);
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0f; color: #ffffff; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05)); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 16px; padding: 32px; }
            .header { text-align: center; margin-bottom: 24px; }
            .logo { font-size: 24px; font-weight: bold; background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .tracking-code { background: rgba(99, 102, 241, 0.2); padding: 12px 24px; border-radius: 8px; font-family: monospace; font-size: 24px; text-align: center; color: #6366f1; margin: 16px 0; }
            .detail { padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
            .label { color: #888; font-size: 12px; text-transform: uppercase; }
            .value { color: #fff; font-size: 16px; margin-top: 4px; }
            .button { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 24px; }
            .footer { text-align: center; margin-top: 32px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🏛️ CODE4COMMUNITY</div>
              <p style="color: #888; margin-top: 8px;">Raport i Ri</p>
            </div>
            
            <div class="tracking-code">${tracking_code}</div>
            
            <div class="detail">
              <div class="label">Titulli</div>
              <div class="value">${title}</div>
            </div>
            
            <div class="detail">
              <div class="label">Përshkrimi</div>
              <div class="value">${description}</div>
            </div>
            
            ${neighborhood ? `
            <div class="detail">
              <div class="label">Lagja</div>
              <div class="value">${neighborhood}</div>
            </div>
            ` : ''}
            
            ${reporter_name ? `
            <div class="detail">
              <div class="label">Raportuar nga</div>
              <div class="value">${reporter_name}</div>
            </div>
            ` : ''}
            
            <div class="detail">
              <div class="label">Vendndodhja</div>
              <div class="value">${has_location ? '📍 E përfshirë' : '❌ Jo e përfshirë'}</div>
            </div>
            
            <div style="text-align: center;">
              <a href="https://yqsijgxueeyhmmeodwkr.lovableproject.com/login" class="button">Shiko në Dashboard</a>
            </div>
            
            <div class="footer">
              Code4Community - Elbasan<br>
              Platformë për raportimin e problemeve qytetare
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email using Resend API directly
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Code4Community <onboarding@resend.dev>",
        to: adminEmails,
        subject: `🔔 Raport i Ri: ${title} [${tracking_code}]`,
        html: emailHtml,
      }),
    });

    const emailResult = await emailResponse.json();
    console.log("Email sent:", emailResult);

    if (!emailResponse.ok) {
      throw new Error(emailResult.message || "Failed to send email");
    }

    return new Response(JSON.stringify({ success: true, emailResult }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-report-notification:", error);
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
