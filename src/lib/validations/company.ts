import { z } from 'zod';

export const companySchema = z.object({
  legalName: z.string().min(2, 'Informe a razão social.'),
  tradeName: z.string().optional().nullable(),
  documentType: z.enum(['CPF', 'CNPJ']),
  document: z.string().min(11, 'Documento inválido.'),

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

  logoUrl: z.string().optional().nullable(),
  signatureUrl: z.string().optional().nullable(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  fontFamily: z.string().optional(),

  bankName: z.string().optional().nullable(),
  bankAgency: z.string().optional().nullable(),
  bankAccount: z.string().optional().nullable(),
  pixKey: z.string().optional().nullable(),
  paymentNotes: z.string().optional().nullable(),
});
export type CompanyInput = z.infer<typeof companySchema>;

export const pdfSettingsSchema = z.object({
  pdfTemplate: z.enum(['CLASSIC', 'MODERN', 'PROPOSAL', 'FORMAL']),
  logoPosition: z.enum(['LEFT', 'CENTER', 'RIGHT']),
  headerText: z.string().optional().nullable(),
  footerText: z.string().optional().nullable(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  fontFamily: z.string().optional(),
  quotePrefix: z.string().optional(),
  defaultValidityDays: z.coerce.number().int().min(1).max(365).optional(),
  defaultPaymentTerms: z.string().optional().nullable(),
  defaultDeliveryTerms: z.string().optional().nullable(),
  defaultWarranty: z.string().optional().nullable(),
  defaultNotes: z.string().optional().nullable(),
});
export type PdfSettingsInput = z.infer<typeof pdfSettingsSchema>;
