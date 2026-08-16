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

  // Fiscais (NF-e). Sem NCM e CFOP a SEFAZ rejeita a nota, mas o cadastro
  // segue válido sem eles — a cobrança acontece na emissão.
  ncm: z
    .string()
    .regex(/^\d{8}$/, 'O NCM tem 8 dígitos.')
    .optional()
    .nullable()
    .or(z.literal('')),
  cest: z
    .string()
    .regex(/^\d{7}$/, 'O CEST tem 7 dígitos.')
    .optional()
    .nullable()
    .or(z.literal('')),
  cfop: z
    .string()
    .regex(/^\d{4}$/, 'O CFOP tem 4 dígitos.')
    .optional()
    .nullable()
    .or(z.literal('')),
  taxOrigin: z.coerce.number().int().min(0).max(8).default(0),
  taxSituation: z.string().optional().nullable(),
});
export type ProductInput = z.infer<typeof productSchema>;
