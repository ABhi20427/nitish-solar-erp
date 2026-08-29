import { NextRequest, NextResponse } from 'next/server';
import { sendLeadEmail, sendCustomerProposalEmail } from '@/lib/mailer';
import { generateProposalHtml } from '@/lib/proposal-generator';
import { renderHtmlToPdfBuffer } from '@/lib/pdf-generator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Lightweight Spam Protection: Honeypot check
    if (body.website_hp && body.website_hp.trim() !== '') {
      return NextResponse.json({
        success: true,
        message: 'Thank you. Your enquiry has been sent successfully.',
      });
    }

    // 2. Input Extraction
    const name = body.name || body.fullName || '';
    const email = (body.email || '').trim();
    const phone = body.phone || '';
    const company = body.company || body.companyName || '';
    const propertyType = body.propertyType || body.customerType || body.service || 'Residential';
    const capacity = body.requiredCapacity || body.proposedCapacityKw || '';
    const monthlyBill = body.monthlyBill || body.monthlyBillAmount || '';
    const location = body.location || body.city || body.address || '';
    const message = body.message || body.notes || '';
    const source = body.source || 'Website Contact Form';

    // 3. Strict Input & Email Validation
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

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address to receive your solar proposal PDF.' },
        { status: 400 }
      );
    }

    const emailData = {
      name,
      email,
      phone,
      company,
      propertyType,
      requiredCapacity: capacity,
      monthlyBill,
      location,
      message,
      source,
    };

    console.log(`[API CONTACT] Processing proposal PDF generation & email delivery for: ${email}`);

    // 4. Generate Personalized Solar Proposal HTML
    const { html, specs } = generateProposalHtml(emailData);

    // 5. Convert Proposal HTML to High-Resolution A4 PDF Buffer
    console.log(`[API CONTACT] Rendering A4 PDF for ${specs.quotNo}...`);
    const pdfBuffer = await renderHtmlToPdfBuffer(html);

    // 6. Deliver Proposal PDF as Attachment to Customer's Email Address
    console.log(`[API CONTACT] Transmitting PDF email to customer ${email}...`);
    await sendCustomerProposalEmail(emailData, pdfBuffer, specs.quotNo);

    // 7. Internal Admin Notification (Non-blocking fallback)
    try {
      await sendLeadEmail(emailData);
    } catch (adminErr: any) {
      console.warn('[API CONTACT] Internal admin lead notification notice:', adminErr?.message || adminErr);
    }

    // 8. Return Success ONLY after PDF generation & customer email delivery succeed!
    return NextResponse.json({
      success: true,
      message: `Your personalized solar proposal PDF (${specs.quotNo}) has been generated and sent to your email (${email})!`,
      quotNo: specs.quotNo,
      pdfBase64: pdfBuffer.toString('base64'),
    });

  } catch (err: any) {
    console.error('[API CONTACT PROPOSAL ERROR]', err?.message || err);
    return NextResponse.json(
      {
        success: false,
        error: `Could not send proposal to your email: ${err?.message || 'SMTP or PDF generation error.'}. Please verify your email address.`,
      },
      { status: 500 }
    );
  }
}
