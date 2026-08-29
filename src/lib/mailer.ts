import nodemailer from 'nodemailer';

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

export async function sendCustomerProposalEmail(
  data: EmailData,
  pdfBuffer: Buffer,
  quotNo: string
) {
  const primaryHost = process.env.ZOHO_SMTP_HOST || 'smtp.zoho.in';
  const primaryPort = Number(process.env.ZOHO_SMTP_PORT) || 465;
  const user = process.env.ZOHO_SMTP_USER || 'nitishsolar@zohomail.in';
  const pass = process.env.ZOHO_SMTP_PASS || process.env.ZOHO_SMTP_PASSWORD || 'VKVV81LVARf8';

  if (!data.email || !data.email.trim()) {
    throw new Error('Customer email address is missing.');
  }

  const customerEmail = data.email.trim();
  const filename = `Solar_Proposal_${quotNo}.pdf`;
  const subject = `☀️ Your Official Solar EPC Proposal & Quotation (${quotNo}) — Nitish Solar`;

  console.log(`[CUSTOMER MAILER] Sending proposal PDF to customer: ${customerEmail}`);

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #334155; background-color: #f8fafc; margin: 0; padding: 20px; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05); }
    .header { background: linear-gradient(135deg, #0B3E73 0%, #165A9E 100%); color: #ffffff; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 1px; }
    .header p { margin: 4px 0 0; font-size: 12px; color: #FFC78A; }
    .content { padding: 24px; }
    .highlight-box { background: #f0f7ff; border-left: 4px solid #F39A4A; padding: 14px; border-radius: 6px; margin: 18px 0; font-size: 13.5px; }
    .footer { text-align: center; padding: 14px; font-size: 11px; color: #64748b; background: #f1f5f9; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>NITISH SOLAR EPC</h1>
      <p>Your Trusted Partner in Renewable Energy Solutions</p>
    </div>
    <div class="content">
      <p style="font-size: 16px; font-weight: 700; color: #0B3E73;">Dear ${data.name || 'Valued Customer'},</p>
      <p>Thank you for requesting a customized Solar EPC Proposal from <strong>Nitish Solar</strong>.</p>
      <p>We are pleased to attach your official Solar Proposal & Quotation PDF (Ref: <strong>${quotNo}</strong>) tailored specifically for your site requirements.</p>

      <div class="highlight-box">
        <strong style="color: #0B3E73;">What's inside your PDF proposal:</strong>
        <ul style="margin: 8px 0 0; padding-left: 20px; color: #475569;">
          <li>Recommended Solar PV System Capacity & Specification</li>
          <li>Itemized Equipment & Turnkey EPC Cost Breakdown</li>
          <li>PM Surya Ghar Government Subsidy & Net Out-of-Pocket Investment</li>
          <li>Estimated Monthly Generation, Bill Savings & Payback Period</li>
        </ul>
      </div>

      <p>If you have any questions or would like to schedule an on-site technical inspection, please call us at <strong>+91 7010899473</strong> or email <strong>nitishsolar@zohomail.in</strong>.</p>
      <br>
      <p style="margin: 0;">Warm regards,</p>
      <p style="margin: 2px 0 0; font-weight: 700; color: #0B3E73;">Nitish Solar Team</p>
      <p style="margin: 0; font-size: 12px; color: #64748b;">Chromepet, Chennai | GSTIN: 33AAYFN9905F1ZS</p>
    </div>
    <div class="footer">
      Automated Proposal Delivery — Nitish Solar Engineering Portal
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
    attachments: [
      {
        filename: filename,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
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
  console.log(`[CUSTOMER MAILER SUCCESS] Delivered proposal PDF to ${customerEmail}. Message ID:`, info.messageId);
  return info;
}
