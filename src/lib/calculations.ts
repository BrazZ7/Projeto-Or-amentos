export type DiscountType = 'PERCENT' | 'FIXED';

export interface QuoteItemInput {
  quantity: number;
  unitPrice: number;
  discount: number; // desconto em valor absoluto, aplicado ao total do item
}

export interface QuoteTotalsInput {
  items: QuoteItemInput[];
  discountType: DiscountType;
  discountValue: number;
  freight: number;
}

export interface QuoteTotals {
  itemTotals: number[];
  subtotal: number;
  discountAmount: number;
  freight: number;
  total: number;
}

function round2(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateItemTotal(item: QuoteItemInput) {
  const gross = item.quantity * item.unitPrice;
  return round2(Math.max(gross - (item.discount || 0), 0));
}

/**
 * Calcula subtotal (soma dos itens), o desconto geral do orçamento
 * (percentual ou fixo, aplicado sobre o subtotal), o frete e o total final.
 */
export function calculateQuoteTotals({
  items,
  discountType,
  discountValue,
  freight,
}: QuoteTotalsInput): QuoteTotals {
  const itemTotals = items.map(calculateItemTotal);
  const subtotal = round2(itemTotals.reduce((sum, value) => sum + value, 0));

  const discountAmount =
    discountType === 'PERCENT'
      ? round2((subtotal * (discountValue || 0)) / 100)
      : round2(discountValue || 0);

  const total = round2(Math.max(subtotal - discountAmount + (freight || 0), 0));

  return {
    itemTotals,
    subtotal,
    discountAmount,
    freight: round2(freight || 0),
    total,
  };
}
