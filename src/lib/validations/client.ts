import { z } from 'zod';

export const clientSchema = z.object({
  type: z.enum(['PF', 'PJ']),
  name: z.string().min(2, 'Informe o nome ou razão social.'),
  document: z.string().optional().nullable(),
  email: z.string().email('E-mail inválido.').optional().or(z.literal('')),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  addressStreet: z.string().optional().nullable(),
  addressNumber: z.string().optional().nullable(),
  addressComplement: z.string().optional().nullable(),
  addressNeighborhood: z.string().optional().nullable(),
  addressCity: z.string().optional().nullable(),
  addressState: z.string().optional().nullable(),
  addressZipCode: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});
export type ClientInput = z.infer<typeof clientSchema>;
