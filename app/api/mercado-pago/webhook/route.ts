import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, invoices, payments } from '@/lib/db';

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const paymentId = payload?.data?.id ?? payload?.id;

  if (!paymentId) {
    return NextResponse.json({ received: true });
  }

  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json({ error: 'Mercado Pago token missing' }, { status: 500 });
  }

  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    return NextResponse.json({ received: false }, { status: 502 });
  }

  const payment = await response.json();
  const [invoice] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.folio, payment.external_reference));

  if (invoice) {
    await db.insert(payments).values({
      invoiceId: invoice.id,
      provider: 'mercado_pago_mx',
      providerPaymentId: String(payment.id),
      amount: String(payment.transaction_amount ?? invoice.total),
      currency: payment.currency_id ?? 'MXN',
      status: payment.status ?? 'unknown',
      liveMode: Boolean(payment.live_mode),
      rawPayload: JSON.stringify(payment)
    });

    if (payment.status === 'approved') {
      await db
        .update(invoices)
        .set({ status: 'paid', paidAt: new Date() })
        .where(eq(invoices.id, invoice.id));
    }
  }

  return NextResponse.json({ received: true });
}
