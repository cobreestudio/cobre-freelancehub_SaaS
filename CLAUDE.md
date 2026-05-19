# Cobre — SaaS de gestión para freelancers

## Identidad del proyecto
- **Nombre:** Cobre
- **Repo:** https://github.com/cobreestudio/cobre-freelancehub_SaaS (rama `main`)
- **Deploy:** Vercel (CD automático) — https://cobre-rho.vercel.app
- **Ruta local:** `C:\Users\AlumnoSMR1\Projects\freelancehub`

## Stack
- Next.js 16.x + TypeScript + Tailwind CSS v4
- Supabase (Auth + PostgreSQL + RLS)
- next-intl v4 — i18n: `es` / `en` / `fr` (config en `src/i18n/request.ts`)
- `withNextIntl()` envuelve `next.config.ts` — imprescindible para el build
- Recharts (gráficos dashboard)
- jsPDF (exportar facturas a PDF)
- Resend (emails automáticos de recordatorio)
- Vercel Cron (recordatorios diarios vía `/api/send-reminders`)
- Stripe (suscripciones Free / Pro 12€/mes)
- Anthropic SDK — claude-haiku-4-5-20251001 (4 endpoints AI, solo plan Pro)
- Upstash Redis — rate limiting en endpoints AI (20 req/h por usuario)

## Supabase
- URL: `https://wbusmpjadhnogodsoxjh.supabase.co`
- Tablas: `clients`, `projects`, `invoices`, `profiles`, `reminder_logs`
- RLS por `user_id` en todas las tablas
- `profiles`: columnas `plan` (free/pro), `stripe_customer_id`, `full_name`, `business_name`

## Variables de entorno necesarias
Ver `.env.example` para la lista completa. Las críticas:
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — solo server-side
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_PRO_PRICE_ID`
- `RESEND_API_KEY` / `RESEND_FROM_EMAIL`
- `CRON_SECRET` — protege `/api/send-reminders`
- `ANTHROPIC_API_KEY`
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`
- `NEXT_PUBLIC_APP_URL`

## Reglas críticas de Git/Vercel
- **NUNCA** añadir `Co-Authored-By` en commits — Vercel Hobby lo bloquea
- Rama activa: `main`

## Funcionalidades completadas
- Auth (registro, login, logout)
- Dashboard con gráficos (BarChart + PieChart), comparativa mensual, salud del negocio
- CRUD completo: Clientes, Proyectos, Facturas
- Numeración automática facturas: `FAC-YYYY-NNN`
- Exportar factura a PDF (jsPDF)
- Recordatorios manuales (mailto) y automáticos (Resend + Vercel Cron, dedup 7 días)
- Perfil con datos fiscales + métodos de pago (IBAN/Bizum)
- Stripe: Free (3 clientes / 5 facturas) y Pro (ilimitado)
- Página `/billing` con checkout y portal de gestión
- i18n completo (es/en/fr)
- Estadísticas por cliente (`/stats`)
- PWA (manifest + service worker)
- Landing pública

## Endpoints AI (solo plan Pro)
| Ruta | Función |
|---|---|
| `POST /api/ai/advisor` | Análisis financiero general |
| `POST /api/ai/collections` | Email de recordatorio de cobro |
| `POST /api/ai/proposal` | Propuesta comercial para proyecto |
| `POST /api/ai/tax` | Orientación fiscal trimestral |

Todos tienen: auth Bearer, validación de body, rate limiting (Upstash), error genérico en catch.

## Seguridad implementada
- CSP + 5 security headers en `next.config.ts`
- `connect-src` permite `*.supabase.co` y `wss://*.supabase.co`
- `form-action` permite `checkout.stripe.com`
- Input validation + `err.message` ocultado en todos los endpoints
- Rate limiting: 20 req/h por usuario en rutas AI (Upstash Redis)

## Agentes disponibles (`.claude/agents/`)
- `finance-financial-analyst.md`
- `finance-tax-strategist.md`
- `sales-proposal-strategist.md`
- `sales-outbound-strategist.md`

## Pendiente
- Esperar parche de Next.js para CVEs (no hay versión fix disponible aún — monitorizar github.com/vercel/next.js/releases)
- CSP nonces para eliminar `'unsafe-inline'` (opcional, mejora puntuación)
