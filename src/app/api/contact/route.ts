import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Lightweight Spam Protection: Honeypot check
    // If the hidden website_hp field is filled out, it's a bot.
    if (body.website_hp && body.website_hp.trim() !== '') {
      // Silently discard bot submission with simulated success
      return NextResponse.json({
        success: true,
        message: 'Thank you. Your enquiry has been sent successfully.',
      });
    }

    // 2. Input Validation
    const name = body.name || body.fullName || '';
    const email = body.email || '';
    const phone = body.phone || '';
    const company = body.company || body.companyName || '';
    const propertyType = body.propertyType || body.customerType || body.service || 'N/A';
    const capacity = body.requiredCapacity || body.proposedCapacityKw || '';
    const monthlyBill = body.monthlyBill || body.monthlyBillAmount || '';
    const location = body.location || body.city || body.address || '';
    const message = body.message || body.notes || '';
    const source = body.source || 'Website Contact Form';

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Full name is required.' },
        { status: 400 }
      );
    }

    if (!phone || phone.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Phone number is required.' },
        { status: 400 }
      );
    }

    // Basic email format validation if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // 3. Server-Side Email Formatting
    const targetEmail = process.env.TO_EMAIL || 'nitishsolar@zohomail.in';
    const smtpHost = process.env.ZOHO_SMTP_HOST || 'smtpro.zoho.in';
    const smtpPort = Number(process.env.ZOHO_SMTP_PORT) || 465;
    const smtpUser = process.env.ZOHO_SMTP_USER || 'nitishsolar@zohomail.in';
    const smtpPass = process.env.ZOHO_SMTP_PASSWORD || '';

    const plainText = `
New Website Lead / Enquiry — Nitish Solar
------------------------------------------
Submitted From: ${source}
Date/Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

Contact Information:
- Full Name: ${name}
- Phone Number: ${phone}
- Email Address: ${email || 'Not Provided'}
- Company Name: ${company || 'Individual / Residential'}
- Location / City: ${location || 'Not Specified'}

Project / System Requirements:
- Property / Service Type: ${propertyType}
- Required Capacity: ${capacity ? `${capacity} kWp` : 'Not Specified'}
- Monthly Electric Bill: ${monthlyBill ? `₹${monthlyBill}` : 'Not Specified'}

Message / Requirements Note:
${message || 'No additional message provided.'}
------------------------------------------
`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 20px; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: #0b0f17; color: #ffffff; padding: 24px; text-align: center; border-bottom: 3px solid #f59e0b; }
    .header h2 { margin: 0; font-size: 20px; color: #ffffff; }
    .header p { margin: 4px 0 0; font-size: 12px; color: #fbbf24; }
    .content { padding: 24px; }
    .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .table td { padding: 10px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .table td.label { font-weight: bold; color: #475569; width: 40%; background: #f8fafc; }
    .message-box { background: #f1f5f9; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; font-size: 14px; color: #334155; }
    .footer { text-align: center; padding: 16px; font-size: 12px; color: #64748b; background: #f8fafc; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2>nitish solar</h2>
      <p>NEW WEBSITE ENQUIRY</p>
    </div>
    <div class="content">
      <table class="table">
        <tr><td class="label">Full Name</td><td><strong>${name}</strong></td></tr>
        <tr><td class="label">Phone Number</td><td><a href="tel:${phone}">${phone}</a></td></tr>
        <tr><td class="label">Email Address</td><td>${email ? `<a href="mailto:${email}">${email}</a>` : 'Not Provided'}</td></tr>
        <tr><td class="label">Company Name</td><td>${company || 'Individual / Residential'}</td></tr>
        <tr><td class="label">Location / City</td><td>${location || 'Not Specified'}</td></tr>
        <tr><td class="label">Property / Service Type</td><td>${propertyType}</td></tr>
        <tr><td class="label">Required Capacity</td><td>${capacity ? `${capacity} kWp` : 'Not Specified'}</td></tr>
        <tr><td class="label">Monthly Electric Bill</td><td>${monthlyBill ? `₹${monthlyBill}` : 'Not Specified'}</td></tr>
        <tr><td class="label">Submission Source</td><td>${source}</td></tr>
      </table>

      <h4 style="margin-top: 20px; margin-bottom: 8px; font-size: 14px; color: #0f172a;">Message / Requirements:</h4>
      <div class="message-box">
        ${message ? message.replace(/\n/g, '<br/>') : 'No additional message provided.'}
      </div>
    </div>
    <div class="footer">
      This is an automated enquiry notification from the nitish solar corporate website.
    </div>
  </div>
</body>
</html>
`;

    // 4. Send Email via NodeMailer (Zoho Mail SMTP)
    if (smtpPass && smtpPass.trim() !== '') {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"nitish solar Website" <${smtpUser}>`,
        to: targetEmail,
        replyTo: email || smtpUser,
        subject: `New Lead: ${name} (${propertyType}) — nitish solar`,
        text: plainText,
        html: htmlContent,
      });
    } else {
      // Log on server if SMTP password environment variable is not set yet
      console.log('----------------------------------------------------');
      console.log('[SERVER LOG] New Lead Submission (SMTP Password not configured in .env.local):');
      console.log(plainText);
      console.log('----------------------------------------------------');
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you. Your enquiry has been sent successfully. Our team will get back to you shortly.',
    });
  } catch (err: any) {
    console.error('Error processing contact form submission:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'Something went wrong while sending your enquiry. Please try again.',
      },
      { status: 500 }
    );
  }
}
