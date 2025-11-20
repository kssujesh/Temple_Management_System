import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingEmailData {
  name: string;
  email: string;
  poojaName: string;
  scheduledDate: string;
  scheduledTime: string;
  amountPaid: number;
}

interface DonationEmailData {
  name: string;
  email: string;
  amount: number;
  campaignTitle?: string;
  paymentReference?: string;
}

interface FestivalReminderData {
  name: string;
  email: string;
  festivalTitle: string;
  eventDate: string;
  startTime?: string;
  location?: string;
}

interface EmailRequest {
  type: "booking" | "donation" | "festival";
  data: BookingEmailData | DonationEmailData | FestivalReminderData;
}

const generateBookingEmail = (data: BookingEmailData) => `
  <!DOCTYPE html>
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
        .details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-row:last-child { border-bottom: none; }
        .label { font-weight: bold; color: #6b7280; }
        .value { color: #111827; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .button { background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🙏 Pooja Booking Confirmed</h1>
        </div>
        <div class="content">
          <p>Namaste ${data.name},</p>
          <p>Your pooja booking has been confirmed! We look forward to serving you.</p>
          
          <div class="details">
            <div class="detail-row">
              <span class="label">Pooja Name:</span>
              <span class="value">${data.poojaName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">${data.scheduledDate}</span>
            </div>
            <div class="detail-row">
              <span class="label">Time:</span>
              <span class="value">${data.scheduledTime}</span>
            </div>
            <div class="detail-row">
              <span class="label">Amount Paid:</span>
              <span class="value">₹${data.amountPaid}</span>
            </div>
          </div>
          
          <p>Please arrive 15 minutes before the scheduled time. If you need to reschedule, please contact us at least 24 hours in advance.</p>
          
          <p style="margin-top: 30px;">With blessings,<br><strong>Temple Management</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
  </html>
`;

const generateDonationEmail = (data: DonationEmailData) => `
  <!DOCTYPE html>
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
        .amount { font-size: 36px; font-weight: bold; color: #10b981; text-align: center; margin: 20px 0; }
        .details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-row:last-child { border-bottom: none; }
        .label { font-weight: bold; color: #6b7280; }
        .value { color: #111827; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🙏 Thank You for Your Donation</h1>
        </div>
        <div class="content">
          <p>Dear ${data.name},</p>
          <p>Your generous contribution has been received with heartfelt gratitude.</p>
          
          <div class="amount">₹${data.amount}</div>
          
          <div class="details">
            ${data.campaignTitle ? `
            <div class="detail-row">
              <span class="label">Campaign:</span>
              <span class="value">${data.campaignTitle}</span>
            </div>
            ` : ''}
            ${data.paymentReference ? `
            <div class="detail-row">
              <span class="label">Receipt No:</span>
              <span class="value">${data.paymentReference}</span>
            </div>
            ` : ''}
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">${new Date().toLocaleDateString('en-IN')}</span>
            </div>
          </div>
          
          <p>Your donation helps us continue our sacred services and maintain the temple. May your generosity bring you abundant blessings.</p>
          
          <p style="margin-top: 30px;">With prayers and blessings,<br><strong>Temple Management</strong></p>
        </div>
        <div class="footer">
          <p>This receipt is for your records. Please save it for tax purposes if applicable.</p>
        </div>
      </div>
    </body>
  </html>
`;

const generateFestivalEmail = (data: FestivalReminderData) => `
  <!DOCTYPE html>
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
        .festival-title { font-size: 28px; font-weight: bold; color: #8b5cf6; text-align: center; margin: 20px 0; }
        .details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-row:last-child { border-bottom: none; }
        .label { font-weight: bold; color: #6b7280; }
        .value { color: #111827; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🪔 Festival Reminder</h1>
        </div>
        <div class="content">
          <p>Namaste ${data.name},</p>
          <p>We are delighted to remind you about the upcoming festival celebration:</p>
          
          <div class="festival-title">${data.festivalTitle}</div>
          
          <div class="details">
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">${data.eventDate}</span>
            </div>
            ${data.startTime ? `
            <div class="detail-row">
              <span class="label">Time:</span>
              <span class="value">${data.startTime}</span>
            </div>
            ` : ''}
            ${data.location ? `
            <div class="detail-row">
              <span class="label">Location:</span>
              <span class="value">${data.location}</span>
            </div>
            ` : ''}
          </div>
          
          <p>Join us for this sacred celebration. Your presence will make this occasion even more special.</p>
          
          <p style="margin-top: 30px;">Looking forward to seeing you,<br><strong>Temple Management</strong></p>
        </div>
        <div class="footer">
          <p>May this festival bring joy, peace, and prosperity to you and your family.</p>
        </div>
      </div>
    </body>
  </html>
`;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // SECURITY: Require authentication to prevent spam and abuse
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Verify the JWT token
    const supabaseClient = createClient(
      SUPABASE_URL!,
      SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { 
          status: 401, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Check if user has staff or admin role
    const { data: roles, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);
    
    if (roleError) {
      console.error('Error checking user roles:', roleError);
      return new Response(
        JSON.stringify({ error: 'Authorization check failed' }),
        { 
          status: 500, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    const hasPermission = roles?.some(r => r.role === 'admin' || r.role === 'staff');
    
    if (!hasPermission) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions. Only staff and admins can send emails.' }),
        { 
          status: 403, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    const { type, data }: EmailRequest = await req.json();
    
    let html = "";
    let subject = "";
    
    switch (type) {
      case "booking":
        const bookingData = data as BookingEmailData;
        html = generateBookingEmail(bookingData);
        subject = `Pooja Booking Confirmation - ${bookingData.poojaName}`;
        break;
      
      case "donation":
        const donationData = data as DonationEmailData;
        html = generateDonationEmail(donationData);
        subject = "Thank You for Your Donation";
        break;
      
      case "festival":
        const festivalData = data as FestivalReminderData;
        html = generateFestivalEmail(festivalData);
        subject = `Festival Reminder - ${festivalData.festivalTitle}`;
        break;
      
      default:
        throw new Error("Invalid email type");
    }
    
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Temple Notifications <onboarding@resend.dev>",
        to: [data.email],
        subject,
        html,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      throw new Error(`Resend API error: ${errorText}`);
    }

    const result = await emailResponse.json();

    console.log("Email sent successfully:", result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

Deno.serve(handler);
