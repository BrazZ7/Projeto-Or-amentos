import { z } from 'zod';

export const registerSchema = z.object({
  companyLegalName: z.string().min(2, 'Informe a razão social.'),
  documentType: z.enum(['CPF', 'CNPJ']),
  document: z.string().min(11, 'Documento inválido.'),
  name: z.string().min(2, 'Informe seu nome.'),
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(8, 'A senha deve ter ao menos 8 caracteres.'),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(1, 'Informe a senha.'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('E-mail inválido.'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'A senha deve ter ao menos 8 caracteres.'),
});
