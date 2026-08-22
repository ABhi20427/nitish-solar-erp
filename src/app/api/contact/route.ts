import { NextRequest, NextResponse } from 'next/server';
import { sendLeadEmail } from '@/lib/mailer';

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

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // 3. Attempt Server-Side Mail Delivery via Reusable Mailer
    await sendLeadEmail({
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
    });

    // 4. Return success ONLY if sendMail completes successfully!
    return NextResponse.json({
      success: true,
      message: 'Thank you. Your enquiry has been sent successfully.',
    });
  } catch (err: any) {
    console.error('[API CONTACT ERROR]', err?.message || err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "We couldn't send your enquiry. Please try again.",
      },
      { status: 500 }
    );
  }
}
