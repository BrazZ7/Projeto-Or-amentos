import { z } from 'zod';

export const stockMovementSchema = z.object({
  productId: z.string().min(1, 'Selecione um produto.'),
  type: z.enum(['IN', 'OUT']),
  reason: z.enum(['PURCHASE', 'SALE', 'RETURN', 'ADJUSTMENT', 'LOSS', 'OTHER']),
  quantity: z.coerce.number().positive('Quantidade deve ser maior que zero.'),
  unitCost: z.coerce.number().min(0).optional().nullable(),
  unitPrice: z.coerce.number().min(0).optional().nullable(),
  notes: z.string().optional().nullable(),
});
export type StockMovementInput = z.infer<typeof stockMovementSchema>;
