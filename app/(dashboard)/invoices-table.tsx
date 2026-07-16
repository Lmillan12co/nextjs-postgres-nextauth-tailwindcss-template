'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { InvoiceWithCustomer } from '@/lib/db';
type InvoiceRow = Omit<InvoiceWithCustomer, 'customerName' | 'customerEmail'> & { customerName: string | null; customerEmail: string | null };

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const statusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  paid: 'default',
  pending: 'secondary',
  overdue: 'destructive',
  draft: 'outline',
  cancelled: 'outline'
};

export function InvoicesTable({ invoices, offset, totalInvoices }: { invoices: InvoiceRow[]; offset: number; totalInvoices: number }) {
  const router = useRouter();
  const pageSize = 6;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cobros LATAM</CardTitle>
        <CardDescription>Administra facturas, ligas de pago y conciliación para México.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Folio</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="hidden md:table-cell">Concepto</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden lg:table-cell">Vence</TableHead>
              <TableHead><span className="sr-only">Acciones</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.folio}</TableCell>
                <TableCell>
                  <div>{invoice.customerName ?? 'Cliente sin nombre'}</div>
                  <div className="text-xs text-muted-foreground">{invoice.customerEmail ?? 'Sin correo'}</div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{invoice.concept}</TableCell>
                <TableCell>{money.format(Number(invoice.total))}</TableCell>
                <TableCell><Badge variant={statusVariant[invoice.status]}>{invoice.status}</Badge></TableCell>
                <TableCell className="hidden lg:table-cell">{new Date(invoice.dueAt).toLocaleDateString('es-MX')}</TableCell>
                <TableCell className="text-right">
                  {invoice.mercadoPagoInitPoint ? (
                    <Button asChild size="sm" variant="outline">
                      <Link href={invoice.mercadoPagoInitPoint} target="_blank">Pagar <ExternalLink className="ml-2 h-3 w-3" /></Link>
                    </Button>
                  ) : (
                    <Button asChild size="sm"><Link href={`/api/mercado-pago/preferences?invoiceId=${invoice.id}`}>Crear liga</Link></Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">Mostrando <strong>{Math.min(offset || pageSize, totalInvoices)}</strong> de <strong>{totalInvoices}</strong> cobros</div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" disabled={offset === pageSize || totalInvoices <= pageSize} onClick={() => router.back()}><ChevronLeft className="mr-2 h-4 w-4" />Anterior</Button>
          <Button variant="ghost" size="sm" disabled={!offset || offset >= totalInvoices} onClick={() => router.push(`/?offset=${offset}`, { scroll: false })}>Siguiente<ChevronRight className="ml-2 h-4 w-4" /></Button>
        </div>
      </CardFooter>
    </Card>
  );
}
