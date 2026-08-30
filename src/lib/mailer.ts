import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export interface EmailData {
  name: string;
  email?: string;
  phone: string;
  company?: string;
  propertyType?: string;
  requiredCapacity?: string | number;
  monthlyBill?: string | number;
  location?: string;
  message?: string;
  source?: string;
}

export async function sendLeadEmail(data: EmailData) {
  const primaryHost = process.env.ZOHO_SMTP_HOST || 'smtp.zoho.in';
  const primaryPort = Number(process.env.ZOHO_SMTP_PORT) || 465;
  const user = process.env.ZOHO_SMTP_USER || 'nitishsolar@zohomail.in';
  const pass = process.env.ZOHO_SMTP_PASS || process.env.ZOHO_SMTP_PASSWORD || 'VKVV81LVARf8';
  const toEmail = process.env.ZOHO_MAIL_TO || 'nitishsolar@zohomail.in';

  console.log('[MAILER] Initiating email delivery sequence...');
  console.log(`[MAILER] Target User: ${user} | Recipient: ${toEmail} | Primary Host: ${primaryHost}:${primaryPort}`);

  const subject = `New Nitish Solar Website Enquiry - ${data.name}`;

  const plainText = `
New Nitish Solar Website Enquiry
----------------------------------------
Name: ${data.name}
Phone: ${data.phone}
Email: ${data.email || 'Not Provided'}
Company: ${data.company || 'N/A'}
Property / Project Type: ${data.propertyType || 'N/A'}
Location / City: ${data.location || 'N/A'}
Required Capacity: ${data.requiredCapacity ? `${data.requiredCapacity} kWp` : 'N/A'}
Monthly Electric Bill: ${data.monthlyBill ? `₹${data.monthlyBill}` : 'N/A'}
Source: ${data.source || 'Website Contact Form'}

Message:
${data.message || 'No additional message provided.'}
----------------------------------------
`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; background-color: #f8fafc; margin: 0; padding: 20px; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .header { background: #0b0f17; color: #ffffff; padding: 24px; text-align: center; border-bottom: 3px solid #f59e0b; }
    .header h2 { margin: 0; font-size: 22px; color: #ffffff; font-weight: 800; letter-spacing: -0.025em; }
    .header p { margin: 4px 0 0; font-size: 11px; color: #f59e0b; font-family: monospace; text-transform: uppercase; letter-spacing: 0.1em; }
    .content { padding: 24px; }
    .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .table td { padding: 12px 10px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .table td.label { font-weight: 600; color: #475569; width: 38%; background: #f8fafc; }
    .message-box { background: #f1f5f9; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 6px; font-size: 14px; color: #334155; white-space: pre-wrap; }
    .footer { text-align: center; padding: 16px; font-size: 12px; color: #64748b; background: #f8fafc; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2>nitish solar</h2>
      <p>New Website Enquiry</p>
    </div>
    <div class="content">
      <table class="table">
        <tr><td class="label">Customer Name</td><td><strong>${data.name}</strong></td></tr>
        <tr><td class="label">Phone Number</td><td><a href="tel:${data.phone}" style="color:#0284c7; font-weight:bold;">${data.phone}</a></td></tr>
        <tr><td class="label">Email Address</td><td>${data.email ? `<a href="mailto:${data.email}" style="color:#0284c7;">${data.email}</a>` : 'Not Provided'}</td></tr>
        <tr><td class="label">Company / Firm</td><td>${data.company || 'Individual / Residential'}</td></tr>
        <tr><td class="label">Location / City</td><td>${data.location || 'Not Specified'}</td></tr>
        <tr><td class="label">Property / Service Type</td><td>${data.propertyType || 'N/A'}</td></tr>
        <tr><td class="label">Required Capacity</td><td>${data.requiredCapacity ? `${data.requiredCapacity} kWp` : 'N/A'}</td></tr>
        <tr><td class="label">Monthly Electric Bill</td><td>${data.monthlyBill ? `₹${data.monthlyBill}` : 'N/A'}</td></tr>
        <tr><td class="label">Enquiry Source</td><td>${data.source || 'Website Contact Form'}</td></tr>
      </table>

      <h4 style="margin-top: 20px; margin-bottom: 8px; font-size: 14px; color: #0f172a;">Message / Requirements:</h4>
      <div class="message-box">
        ${data.message || 'No additional message provided.'}
      </div>
    </div>
    <div class="footer">
      Automated Enquiry Notification — Nitish Solar Engineering Portal
    </div>
  </div>
</body>
</html>
`;

  const mailOptions: nodemailer.SendMailOptions = {
    from: `"Nitish Solar Website" <${user}>`,
    to: toEmail,
    replyTo: data.email || user,
    subject,
    text: plainText,
    html: htmlContent,
  };

  // Attempt 1: Port 465 (SSL)
  try {
    console.log(`[MAILER ATTEMPT 1] Trying ${primaryHost}:${primaryPort} (SSL)...`);
    const transporter465 = nodemailer.createTransport({
      host: primaryHost,
      port: 465,
      secure: true,
      auth: { user, pass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    const info = await transporter465.sendMail(mailOptions);
    console.log('[MAILER SUCCESS] Delivered via Port 465 SSL. Message ID:', info.messageId);
    return info;
  } catch (err465: any) {
    console.warn('[MAILER ATTEMPT 1 FAILED] Port 465 SSL failed:', err465.message || err465);

    // Attempt 2: Port 587 (STARTTLS)
    try {
      console.log(`[MAILER ATTEMPT 2] Trying ${primaryHost}:587 (STARTTLS)...`);
      const transporter587 = nodemailer.createTransport({
        host: primaryHost,
        port: 587,
        secure: false,
        requireTLS: true,
        auth: { user, pass },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      });

      const info = await transporter587.sendMail(mailOptions);
      console.log('[MAILER SUCCESS] Delivered via Port 587 STARTTLS. Message ID:', info.messageId);
      return info;
    } catch (err587: any) {
      console.warn('[MAILER ATTEMPT 2 FAILED] Port 587 STARTTLS failed:', err587.message || err587);

      // Attempt 3: Alternative Host (smtp.zoho.com)
      const altHost = primaryHost.includes('zoho.in') ? 'smtp.zoho.com' : 'smtp.zoho.in';
      try {
        console.log(`[MAILER ATTEMPT 3] Trying Alternative Host ${altHost}:465 (SSL)...`);
        const transporterAlt = nodemailer.createTransport({
          host: altHost,
          port: 465,
          secure: true,
          auth: { user, pass },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000,
        });

        const info = await transporterAlt.sendMail(mailOptions);
        console.log(`[MAILER SUCCESS] Delivered via ${altHost}:465 SSL. Message ID:`, info.messageId);
        return info;
      } catch (errAlt: any) {
        console.error('[MAILER FATAL ERROR] All Zoho SMTP attempts failed:', errAlt.message || errAlt);
        throw new Error(`Zoho SMTP Email Delivery Failed: ${err465.message || err587.message || errAlt.message || 'Authentication or network error'}`);
      }
    }
  }
}

export async function sendCustomerThankYouEmail(data: EmailData) {
  const primaryHost = process.env.ZOHO_SMTP_HOST || 'smtp.zoho.in';
  const primaryPort = Number(process.env.ZOHO_SMTP_PORT) || 465;
  const user = process.env.ZOHO_SMTP_USER || 'nitishsolar@zohomail.in';
  const pass = process.env.ZOHO_SMTP_PASS || process.env.ZOHO_SMTP_PASSWORD || 'VKVV81LVARf8';

  if (!data.email || !data.email.trim()) {
    throw new Error('Customer email address is missing.');
  }

  const customerEmail = data.email.trim();
  const subject = `Thank You for Your Enquiry — Nitish Solar`;

  console.log(`[CUSTOMER MAILER] Sending thank-you email to customer: ${customerEmail}`);

  let logoDataUri = '';
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    logoDataUri = fs.readFileSync(logoPath).toString('base64');
  } catch {
    logoDataUri = '';
  }

  const logoLockup = (logoHeight: number, textSize: number, dividerHeight: number) => `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
      <tr>
        <td style="padding-right: 9px;">${logoDataUri ? `<img src="cid:nitishlogo" alt="nitish" height="${logoHeight}" style="height:${logoHeight}px; width:auto; display:block;" />` : `<span style="font-size:${textSize}px; font-weight:800; color:#ffffff;">nitish</span>`}</td>
        <td style="padding-right: 9px;"><div style="width:1.5px; height:${dividerHeight}px; background:rgba(255,255,255,0.4); line-height:${dividerHeight}px; font-size:1px;">&nbsp;</div></td>
        <td><span style="font-size:${textSize}px; font-weight:500; color:#ffffff; font-family:'Segoe UI', Arial, sans-serif; letter-spacing: 0.01em;">Solar</span></td>
      </tr>
    </table>`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #334155; background-color: #eef2f7; margin: 0; padding: 24px 16px; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 30px -8px rgba(11, 62, 115, 0.18); border: 1px solid #e2e8f0; }
    .header { padding: 32px 32px 24px; text-align: center; background: linear-gradient(135deg, #0B3E73 0%, #165A9E 100%); border-bottom: 3px solid #F39A4A; }
    .header .tagline { margin: 14px 0 0; font-size: 11.5px; letter-spacing: 0.08em; text-transform: uppercase; color: #FFC78A; font-weight: 600; }
    .ref-badge { display: inline-block; margin-top: 14px; padding: 5px 14px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.25); border-radius: 20px; font-size: 11.5px; font-weight: 700; color: #ffffff; letter-spacing: 0.03em; }
    .content { padding: 30px 32px; }
    .greeting { font-size: 16px; font-weight: 700; color: #0B3E73; margin: 0 0 12px; }
    .lead { margin: 0 0 18px; font-size: 14.5px; color: #475569; }
    .highlight-box { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #F39A4A; padding: 18px 20px; border-radius: 8px; margin: 22px 0; }
    .highlight-box strong { display: block; margin-bottom: 10px; color: #0B3E73; font-size: 13.5px; letter-spacing: 0.02em; text-transform: uppercase; }
    .highlight-box ul { margin: 0; padding: 0; list-style: none; }
    .highlight-box li { position: relative; padding: 5px 0 5px 22px; font-size: 13.5px; color: #475569; }
    .highlight-box li:before { content: ''; position: absolute; left: 0; top: 13px; width: 7px; height: 7px; border-radius: 50%; background: #F39A4A; }
    .contact-line { margin: 20px 0 0; font-size: 13.5px; color: #475569; }
    .contact-line a { color: #165A9E; text-decoration: none; font-weight: 600; }
    .signature { margin-top: 28px; padding-top: 20px; border-top: 1px solid #eef2f7; }
    .signature .sig-text p { margin: 0; }
    .signature .sig-name { font-weight: 700; color: #0B3E73; font-size: 14px; }
    .signature .sig-role { font-size: 12px; color: #64748b; }
    .footer { text-align: center; padding: 18px; font-size: 11px; color: #94a3b8; background: #f8fafc; border-top: 1px solid #e2e8f0; letter-spacing: 0.02em; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      ${logoLockup(30, 21, 22)}
      <p class="tagline">Renewable Energy &middot; Turnkey EPC Solutions</p>
    </div>
    <div class="content">
      <p class="greeting">Dear ${data.name || 'Valued Customer'},</p>
      <p class="lead">Thank you for your interest in Nitish Solar. We've received your enquiry and our engineering team is already reviewing your requirements.</p>

      <div class="highlight-box">
        <strong>What Happens Next</strong>
        <ul>
          <li>Our solar engineering team reviews your site & energy requirements</li>
          <li>We prepare a tailored system capacity & cost recommendation</li>
          <li>A member of our team reaches out to confirm details & next steps</li>
          <li>We schedule a free on-site technical inspection, if required</li>
        </ul>
      </div>

      <p class="contact-line">Have questions or want to schedule an on-site technical inspection? Call us at <a href="tel:+917010899473">+91 70108 99473</a> or email <a href="mailto:nitishsolar@zohomail.in">nitishsolar@zohomail.in</a>.</p>

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="signature">
        <tr>
          <td style="background:#0B3E73; border-radius:8px; padding:9px 12px; vertical-align:middle;">${logoLockup(16, 13, 13)}</td>
          <td style="width:14px;">&nbsp;</td>
          <td class="sig-text" style="vertical-align:middle;">
            <p class="sig-name">Nitish Solar Team</p>
            <p class="sig-role">Chromepet, Chennai &middot; GSTIN 33AAYFN9905F1ZS</p>
          </td>
        </tr>
      </table>
    </div>
    <div class="footer">
      Automated Enquiry Confirmation &middot; Nitish Solar Engineering Portal
    </div>
  </div>
</body>
</html>
`;

  const mailOptions: nodemailer.SendMailOptions = {
    from: `"Nitish Solar" <${user}>`,
    to: customerEmail,
    subject,
    html: htmlContent,
    attachments: logoDataUri
      ? [
          {
            filename: 'nitish-solar-logo.png',
            content: logoDataUri,
            encoding: 'base64' as const,
            cid: 'nitishlogo',
            contentDisposition: 'inline' as const,
          },
        ]
      : [],
  };

  // Attempt delivery
  const transporter = nodemailer.createTransport({
    host: primaryHost,
    port: primaryPort,
    secure: primaryPort === 465,
    auth: { user, pass },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000
  });

  const info = await transporter.sendMail(mailOptions);
  console.log(`[CUSTOMER MAILER SUCCESS] Delivered thank-you email to ${customerEmail}. Message ID:`, info.messageId);
  return info;
}
