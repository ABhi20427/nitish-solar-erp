import { NextRequest, NextResponse } from 'next/server';
import { sendLeadEmail, sendCustomerThankYouEmail } from '@/lib/mailer';

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
        { success: false, error: 'Please enter a valid email address so we can confirm your enquiry.' },
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

    console.log(`[API CONTACT] Processing enquiry for: ${email}`);

    // 4. Send Thank-You Email to Customer
    console.log(`[API CONTACT] Sending thank-you email to customer ${email}...`);
    await sendCustomerThankYouEmail(emailData);

    // 5. Internal Admin Notification (Non-blocking fallback)
    try {
      await sendLeadEmail(emailData);
    } catch (adminErr: any) {
      console.warn('[API CONTACT] Internal admin lead notification notice:', adminErr?.message || adminErr);
    }

    // 6. Return Success ONLY after customer thank-you email delivery succeeds!
    return NextResponse.json({
      success: true,
      message: `Thank you! Your enquiry has been received and a confirmation has been sent to your email (${email}).`,
    });

  } catch (err: any) {
    console.error('[API CONTACT ERROR]', err?.message || err);
    return NextResponse.json(
      {
        success: false,
        error: `Could not send confirmation to your email: ${err?.message || 'SMTP error.'}. Please verify your email address.`,
      },
      { status: 500 }
    );
  }
}
