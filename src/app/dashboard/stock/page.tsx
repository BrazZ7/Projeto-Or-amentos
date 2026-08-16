import { AlertTriangle } from 'lucide-react';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { NewStockMovementButton } from '@/components/stock/NewStockMovementButton';
import { formatCurrency, formatDate } from '@/lib/utils';
import { STOCK_MOVEMENT_REASON_LABELS } from '@/lib/stock-labels';

export default async function StockPage({
  searchParams,
}: {
  searchParams: { productId?: string };
}) {
  const session = await requireSession();
  const companyId = session.user.companyId;

  const [products, movements] = await Promise.all([
    prisma.product.findMany({
      where: { companyId, trackStock: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, unit: true, stockQuantity: true, minStockAlert: true },
    }),
    prisma.stockMovement.findMany({
      where: { companyId },
      include: { product: { select: { name: true, unit: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ]);

  const lowStockProducts = products.filter(
    (p) => p.minStockAlert != null && Number(p.stockQuantity) < Number(p.minStockAlert),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Estoque</h1>
          <p className="mt-1 text-sm text-slate-400">
            Controle simples de entradas e saídas dos produtos.
          </p>
        </div>
        <NewStockMovementButton
          products={products.map((p) => ({
            id: p.id,
            name: p.name,
            unit: p.unit,
            stockQuantity: Number(p.stockQuantity),
          }))}
          defaultProductId={searchParams.productId}
        />
      </div>

      {lowStockProducts.length > 0 && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                {lowStockProducts.length} produto(s) com estoque abaixo do mínimo
              </p>
              <p className="mt-0.5 text-sm text-amber-700">
                {lowStockProducts.map((p) => p.name).join(', ')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Estoque atual</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <EmptyState
              title="Nenhum produto com controle de estoque"
              description="Ative 'Controla estoque' no cadastro de um produto para ele aparecer aqui."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-2 py-2">Produto</th>
                    <th className="px-2 py-2 text-right">Estoque atual</th>
                    <th className="px-2 py-2 text-right">Estoque mínimo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {products.map((product) => {
                    const isLow =
                      product.minStockAlert != null &&
                      Number(product.stockQuantity) < Number(product.minStockAlert);
                    return (
                      <tr key={product.id}>
                        <td className="px-2 py-2 font-medium text-slate-100">{product.name}</td>
                        <td className="px-2 py-2 text-right">
                          <span className={isLow ? 'font-semibold text-amber-700' : 'text-slate-300'}>
                            {Number(product.stockQuantity)} {product.unit}
                          </span>
                          {isLow && (
                            <Badge className="ml-2 bg-amber-100 text-amber-700">Baixo</Badge>
                          )}
                        </td>
                        <td className="px-2 py-2 text-right text-slate-400">
                          {product.minStockAlert != null ? Number(product.minStockAlert) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Movimentações recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {movements.length === 0 ? (
            <EmptyState
              title="Nenhuma movimentação registrada"
              description="Compras, vendas avulsas e ajustes de estoque aparecem aqui. Vendas de orçamentos aprovados entram automaticamente."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-2 py-2">Data</th>
                    <th className="px-2 py-2">Produto</th>
                    <th className="px-2 py-2">Tipo</th>
                    <th className="px-2 py-2">Motivo</th>
                    <th className="px-2 py-2 text-right">Quantidade</th>
                    <th className="px-2 py-2 text-right">Valor</th>
                    <th className="px-2 py-2">Observações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {movements.map((movement) => (
                    <tr key={movement.id}>
                      <td className="whitespace-nowrap px-2 py-2 text-slate-400">
                        {formatDate(movement.createdAt)}
                      </td>
                      <td className="px-2 py-2 font-medium text-slate-100">
                        {movement.product.name}
                      </td>
                      <td className="px-2 py-2">
                        <Badge
                          className={
                            movement.type === 'IN'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }
                        >
                          {movement.type === 'IN' ? 'Entrada' : 'Saída'}
                        </Badge>
                      </td>
                      <td className="px-2 py-2 text-slate-400">
                        {STOCK_MOVEMENT_REASON_LABELS[movement.reason]}
                      </td>
                      <td className="px-2 py-2 text-right text-slate-300">
                        {Number(movement.quantity)} {movement.product.unit}
                      </td>
                      <td className="px-2 py-2 text-right text-slate-400">
                        {movement.unitCost
                          ? formatCurrency(Number(movement.unitCost))
                          : movement.unitPrice
                            ? formatCurrency(Number(movement.unitPrice))
                            : '—'}
                      </td>
                      <td className="max-w-[200px] truncate px-2 py-2 text-slate-400">
                        {movement.notes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
