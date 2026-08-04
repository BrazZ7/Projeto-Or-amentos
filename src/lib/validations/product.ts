import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2, 'Informe o nome do produto/serviço.'),
  code: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  unit: z.string().min(1).default('un'),
  price: z.coerce.number().min(0, 'Preço não pode ser negativo.'),
  cost: z.coerce.number().min(0, 'Custo não pode ser negativo.').default(0),
  warranty: z.string().optional().nullable(),
  active: z.boolean().default(true),
  trackStock: z.boolean().default(true),
  minStockAlert: z.coerce.number().min(0).optional().nullable(),
});
export type ProductInput = z.infer<typeof productSchema>;
