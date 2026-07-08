# Cobros LATAM

Cobros LATAM es una plataforma base para cobrar facturas en México con Next.js, Node.js, PostgreSQL y Mercado Pago. Incluye dashboard web, autenticación con Auth.js, modelo de datos de clientes/facturas/pagos, endpoints de checkout y webhook, y una app móvil React Native de referencia para equipos de campo.

## Stack

- **Web / Backend:** Next.js 15 App Router, Node.js, TypeScript.
- **UI:** React 19, Tailwind CSS, componentes shadcn/ui.
- **Auth:** Auth.js / NextAuth con GitHub OAuth.
- **Base de datos:** PostgreSQL con Drizzle ORM.
- **Pagos:** Mercado Pago México mediante Checkout Pro y webhooks.
- **Móvil:** React Native / Expo en `mobile/`.

## Variables de entorno

Copia `.env.example` a `.env.local` y configura:

```bash
POSTGRES_URL=postgres://...
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
AUTH_SECRET=...
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...
MERCADO_PAGO_ACCESS_TOKEN=TEST-...
```

## Esquema SQL

```sql
CREATE TYPE customer_status AS ENUM ('active', 'paused', 'delinquent');
CREATE TYPE invoice_status AS ENUM ('draft', 'pending', 'paid', 'overdue', 'cancelled');
CREATE TYPE payment_provider AS ENUM ('mercado_pago_mx', 'cash', 'bank_transfer');

CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  business_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  rfc TEXT,
  country TEXT NOT NULL DEFAULT 'MX',
  status customer_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  folio TEXT NOT NULL,
  concept TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'MXN',
  subtotal NUMERIC(12, 2) NOT NULL,
  tax NUMERIC(12, 2) NOT NULL,
  total NUMERIC(12, 2) NOT NULL,
  status invoice_status NOT NULL DEFAULT 'pending',
  due_at TIMESTAMP NOT NULL,
  paid_at TIMESTAMP,
  mercado_pago_preference_id TEXT,
  mercado_pago_init_point TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER NOT NULL REFERENCES invoices(id),
  provider payment_provider NOT NULL,
  provider_payment_id TEXT,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'MXN',
  status TEXT NOT NULL,
  live_mode BOOLEAN NOT NULL DEFAULT false,
  raw_payload TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Desarrollo

```bash
pnpm install
pnpm dev
```

Para cargar datos demo, visita `http://localhost:3000/api/seed` después de crear el esquema.

## Flujo Mercado Pago México

1. Desde el dashboard, selecciona **Crear liga** en una factura pendiente.
2. `GET /api/mercado-pago/preferences?invoiceId=ID` crea una preferencia Checkout Pro en MXN.
3. Mercado Pago redirige al cliente a la liga de pago.
4. `POST /api/mercado-pago/webhook` consulta el pago, registra la transacción y marca la factura como `paid` si el estado es `approved`.

## App móvil

La carpeta `mobile/` contiene una app Expo mínima para consultar cobros, abrir ligas de Mercado Pago y apoyar cobranza en ruta. Configura `EXPO_PUBLIC_API_URL` apuntando al despliegue web.
