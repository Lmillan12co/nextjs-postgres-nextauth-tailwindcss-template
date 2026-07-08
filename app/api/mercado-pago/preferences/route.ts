import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, getInvoiceById, invoices } from '@/lib/db';

export async function GET(request: NextRequest) {
  const invoiceId = Number(request.nextUrl.searchParams.get('invoiceId'));

  if (!invoiceId) {
    return NextResponse.json({ error: 'invoiceId is required' }, { status: 400 });
  }

  const invoice = await getInvoiceById(invoiceId);
  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  if (invoice.mercadoPagoInitPoint) {
    return NextResponse.redirect(invoice.mercadoPagoInitPoint);
  }

  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json(
      { error: 'MERCADO_PAGO_ACCESS_TOKEN is not configured' },
      { status: 500 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? request.nextUrl.origin;
  const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      external_reference: invoice.folio,
      notification_url: `${baseUrl}/api/mercado-pago/webhook`,
      back_urls: {
        success: `${baseUrl}/?payment=success`,
        failure: `${baseUrl}/?payment=failure`,
        pending: `${baseUrl}/?payment=pending`
      },
      auto_return: 'approved',
      payer: { email: invoice.customerEmail, name: invoice.customerName },
      items: [
        {
          id: invoice.folio,
          title: invoice.concept,
          description: `Cobro ${invoice.folio} · Cobros LATAM`,
          quantity: 1,
          currency_id: 'MXN',
          unit_price: Number(invoice.total)
        }
      ]
    })
  });

  if (!response.ok) {
    const details = await response.text();
    return NextResponse.json({ error: 'Mercado Pago preference failed', details }, { status: 502 });
  }

  const preference = await response.json();
  const initPoint = preference.init_point ?? preference.sandbox_init_point;

  await db
    .update(invoices)
    .set({
      mercadoPagoPreferenceId: preference.id,
      mercadoPagoInitPoint: initPoint
    })
    .where(eq(invoices.id, invoice.id));

  return NextResponse.redirect(initPoint);
}
