import { getCustomers } from '@/lib/db';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const dynamic = 'force-dynamic';

export default async function CustomersPage(props: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await props.searchParams;
  const customers = await getCustomers(q);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clientes</CardTitle>
        <CardDescription>Directorio comercial para cobranza, RFC y seguimiento de cartera.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead className="hidden md:table-cell">RFC</TableHead>
              <TableHead className="hidden lg:table-cell">Teléfono</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">
                  <div>{customer.businessName}</div>
                  <div className="text-xs text-muted-foreground">{customer.email}</div>
                </TableCell>
                <TableCell>{customer.contactName}</TableCell>
                <TableCell className="hidden md:table-cell">{customer.rfc ?? '—'}</TableCell>
                <TableCell className="hidden lg:table-cell">{customer.phone}</TableCell>
                <TableCell><Badge variant="outline">{customer.status}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
