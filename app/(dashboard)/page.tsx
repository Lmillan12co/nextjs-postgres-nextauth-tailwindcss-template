import { CreditCard, DollarSign, FileText, Users2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InvoicesTable } from './invoices-table';
import { getDashboardMetrics, getInvoices } from '@/lib/db';

export const dynamic = 'force-dynamic';

const money = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN'
});

export default async function DashboardPage(props: {
  searchParams: Promise<{ q?: string; offset?: string }>;
}) {
  const searchParams = await props.searchParams;
  const search = searchParams.q ?? '';
  const offset = Number(searchParams.offset ?? 0);
  const [{ invoices, newOffset, totalInvoices }, metrics] = await Promise.all([
    getInvoices(search, offset),
    getDashboardMetrics()
  ]);

  return (
    <div className="grid gap-4">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Cobrado" value={money.format(Number(metrics.totalRevenue))} icon={<DollarSign />} />
        <MetricCard title="Por cobrar" value={money.format(Number(metrics.pendingRevenue))} icon={<CreditCard />} />
        <MetricCard title="Facturas" value={String(metrics.totalInvoices)} icon={<FileText />} />
        <MetricCard title="Clientes activos" value={String(metrics.activeCustomers)} icon={<Users2 />} />
      </section>
      <InvoicesTable invoices={invoices} offset={newOffset ?? 0} totalInvoices={totalInvoices} />
    </div>
  );
}

function MetricCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">Mercado Pago México · MXN</p>
      </CardContent>
    </Card>
  );
}
