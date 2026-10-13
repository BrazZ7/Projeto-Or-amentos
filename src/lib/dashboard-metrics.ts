import { prisma } from '@/lib/prisma';

/**
 * Métricas do painel numa consulta só.
 *
 * Eram dez consultas separadas — três contagens, duas somas e cinco contagens
 * por período. Em `Promise.all` elas pareciam paralelas, mas com o pooler do
 * Supabase a aplicação usa `connection_limit=1` por instância, e aí as dez
 * enfileiram numa única conexão: dez idas e voltas em sequência a cada abertura
 * do painel.
 *
 * Agregação condicional resolve tudo numa passada só da mesma tabela. O
 * `FILTER` é padrão SQL e o Postgres o resolve sem varrer de novo.
 *
 * A consulta é parametrizada pela template tag do Prisma — os valores não são
 * concatenados —, e o `companyId` entra no WHERE de fora, cobrindo todos os
 * agregados de uma vez: nenhum deles pode escapar do isolamento por empresa.
 */
export interface DashboardMetrics {
  totalQuotes: number;
  approvedCount: number;
  pendingCount: number;
  monthRevenue: number;
  prevMonthRevenue: number;
  quotesThisMonth: number;
  quotesLastMonth: number;
  approvedThisMonth: number;
  approvedLastMonth: number;
  pendingLastMonth: number;
}

/** O Postgres devolve count como bigint e sum como numeric; ambos chegam aqui como string. */
function num(valor: unknown): number {
  if (typeof valor === 'number') return valor;
  if (typeof valor === 'bigint') return Number(valor);
  if (valor === null || valor === undefined) return 0;
  const n = Number(valor);
  return Number.isFinite(n) ? n : 0;
}

export async function getDashboardMetrics({
  companyId,
  thisMonthStart,
  lastMonthStart,
  lastMonthEnd,
  pendingStatuses,
}: {
  companyId: string;
  thisMonthStart: Date;
  lastMonthStart: Date;
  lastMonthEnd: Date;
  pendingStatuses: readonly string[];
}): Promise<DashboardMetrics> {
  const pendentes = [...pendingStatuses];

  const [linha] = await prisma.$queryRaw<Record<string, unknown>[]>`
    SELECT
      COUNT(*)                                                          AS total_quotes,
      COUNT(*) FILTER (WHERE status = 'APPROVED')                       AS approved_count,
      COUNT(*) FILTER (WHERE status::text = ANY(${pendentes}))          AS pending_count,

      COALESCE(SUM(total) FILTER (
        WHERE status = 'APPROVED' AND "approvedAt" >= ${thisMonthStart}
      ), 0)                                                             AS month_revenue,
      COALESCE(SUM(total) FILTER (
        WHERE status = 'APPROVED'
          AND "approvedAt" >= ${lastMonthStart}
          AND "approvedAt" <= ${lastMonthEnd}
      ), 0)                                                             AS prev_month_revenue,

      COUNT(*) FILTER (WHERE "createdAt" >= ${thisMonthStart})          AS quotes_this_month,
      COUNT(*) FILTER (
        WHERE "createdAt" >= ${lastMonthStart} AND "createdAt" <= ${lastMonthEnd}
      )                                                                 AS quotes_last_month,

      COUNT(*) FILTER (
        WHERE status = 'APPROVED' AND "approvedAt" >= ${thisMonthStart}
      )                                                                 AS approved_this_month,
      COUNT(*) FILTER (
        WHERE status = 'APPROVED'
          AND "approvedAt" >= ${lastMonthStart}
          AND "approvedAt" <= ${lastMonthEnd}
      )                                                                 AS approved_last_month,

      COUNT(*) FILTER (
        WHERE status::text = ANY(${pendentes})
          AND "createdAt" >= ${lastMonthStart}
          AND "createdAt" <= ${lastMonthEnd}
      )                                                                 AS pending_last_month
    FROM "Quote"
    WHERE "companyId" = ${companyId}
  `;

  return {
    totalQuotes: num(linha?.total_quotes),
    approvedCount: num(linha?.approved_count),
    pendingCount: num(linha?.pending_count),
    monthRevenue: num(linha?.month_revenue),
    prevMonthRevenue: num(linha?.prev_month_revenue),
    quotesThisMonth: num(linha?.quotes_this_month),
    quotesLastMonth: num(linha?.quotes_last_month),
    approvedThisMonth: num(linha?.approved_this_month),
    approvedLastMonth: num(linha?.approved_last_month),
    pendingLastMonth: num(linha?.pending_last_month),
  };
}
