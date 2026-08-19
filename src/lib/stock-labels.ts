export const STOCK_MOVEMENT_REASON_LABELS: Record<string, string> = {
  PURCHASE: 'Compra / aquisição',
  SALE: 'Venda',
  RETURN: 'Devolução',
  ADJUSTMENT: 'Ajuste de contagem',
  LOSS: 'Perda / quebra',
  OTHER: 'Outro / uso interno',
};

export const STOCK_MOVEMENT_REASONS_BY_TYPE: Record<'IN' | 'OUT', { value: string; label: string }[]> = {
  IN: [
    { value: 'PURCHASE', label: 'Compra / aquisição' },
    { value: 'RETURN', label: 'Devolução de cliente' },
    { value: 'ADJUSTMENT', label: 'Ajuste de contagem' },
    { value: 'OTHER', label: 'Outra entrada' },
  ],
  OUT: [
    { value: 'SALE', label: 'Venda' },
    { value: 'LOSS', label: 'Perda / quebra' },
    { value: 'ADJUSTMENT', label: 'Ajuste de contagem' },
    { value: 'OTHER', label: 'Uso interno / outra saída' },
  ],
};
