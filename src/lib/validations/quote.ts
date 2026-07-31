import { z } from 'zod';

export const quoteItemSchema = z.object({
  productId: z.string().optional().nullable(),
  description: z.string().min(1, 'Descreva o item.'),
  imageUrl: z.string().optional().nullable(),
  quantity: z.coerce.number().positive('Quantidade deve ser maior que zero.'),
  unitPrice: z.coerce.number().min(0, 'Valor unitário não pode ser negativo.'),
  discount: z.coerce.number().min(0).default(0),
});
export type QuoteItemInput = z.infer<typeof quoteItemSchema>;

export const quoteSchema = z.object({
  clientId: z.string().min(1, 'Selecione um cliente.'),
  issueDate: z.string().min(1),
  validUntil: z.string().min(1),
  status: z
    .enum(['DRAFT', 'SENT', 'VIEWED', 'APPROVED', 'REJECTED', 'EXPIRED', 'CANCELED'])
    .optional(),
  items: z.array(quoteItemSchema).min(1, 'Adicione ao menos um item.'),
  discountType: z.enum(['PERCENT', 'FIXED']).default('PERCENT'),
  discountValue: z.coerce.number().min(0).default(0),
  freight: z.coerce.number().min(0).default(0),
  paymentTerms: z.string().optional().nullable(),
  deliveryTerms: z.string().optional().nullable(),
  warranty: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  template: z.enum(['CLASSIC', 'MODERN', 'PROPOSAL', 'FORMAL']).optional(),
});
export type QuoteInput = z.infer<typeof quoteSchema>;
