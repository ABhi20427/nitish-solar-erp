import { NextRequest, NextResponse } from 'next/server';
import { sendLeadEmail } from '@/lib/mailer';

export async function GET(req: NextRequest) {
  try {
    const info = await sendLeadEmail({
      name: 'Diagnostic System Test',
      phone: '+91 98765 43210',
      email: 'test@nitishsolar.com',
      company: 'Nitish Solar Diagnostic Engine',
      location: 'Pune, Maharashtra',
      propertyType: 'TEST_DIAGNOSTIC',
      requiredCapacity: '10',
      monthlyBill: '5000',
      message: 'This is an automated Zoho Mail connection test executed from /api/test-email endpoint.',
      source: 'Zoho Mail Diagnostic Route',
    });

    return NextResponse.json({
      success: true,
      message: 'Zoho SMTP test email delivered successfully!',
      messageId: info.messageId,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Zoho SMTP email send failed.',
      },
      { status: 500 }
    );
  }
}
