import { NextResponse } from 'next/server';
import { db, customers, invoices } from '@/lib/db';

export async function GET() {
  const insertedCustomers = await db
    .insert(customers)
    .values([
      { businessName: 'Abarrotes Lupita', contactName: 'Lupita García', email: 'pagos@abarroteslupita.mx', phone: '+52 55 1234 5678', rfc: 'LUGL850101AB1' },
      { businessName: 'Tacos El Norte', contactName: 'Raúl Martínez', email: 'admin@tacoselnorte.mx', phone: '+52 81 2222 3333', rfc: 'TEN2204059Z1' },
      { businessName: 'Clínica Roma', contactName: 'Dra. Ana Torres', email: 'finanzas@clinicaroma.mx', phone: '+52 55 8765 4321', rfc: 'CRO990312H45' }
    ])
    .returning();

  await db.insert(invoices).values([
    { customerId: insertedCustomers[0].id, folio: 'CL-2026-0001', concept: 'Suscripción mensual POS', subtotal: '1200.00', tax: '192.00', total: '1392.00', status: 'pending', dueAt: new Date('2026-07-20') },
    { customerId: insertedCustomers[1].id, folio: 'CL-2026-0002', concept: 'Terminal y onboarding', subtotal: '3500.00', tax: '560.00', total: '4060.00', status: 'paid', dueAt: new Date('2026-07-05'), paidAt: new Date('2026-07-04') },
    { customerId: insertedCustomers[2].id, folio: 'CL-2026-0003', concept: 'Paquete cobranza recurrente', subtotal: '2200.00', tax: '352.00', total: '2552.00', status: 'overdue', dueAt: new Date('2026-06-30') }
  ]);

  return NextResponse.json({ ok: true, customers: insertedCustomers.length, invoices: 3 });
}
