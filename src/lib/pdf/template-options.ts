// Fonte única da lista de modelos de PDF: alimenta os enums Zod, o seletor das
// configurações da empresa e o seletor do formulário de orçamento. Este módulo
// é importado por componentes client, então não pode depender de nada do
// servidor (prisma, fs).

export const PDF_TEMPLATE_VALUES = [
  'CLASSIC',
  'MODERN',
  'PROPOSAL',
  'FORMAL',
  'EXECUTIVE',
  'SIDEBAR',
  'CATALOG',
] as const;

export type PdfTemplateValue = (typeof PDF_TEMPLATE_VALUES)[number];

export interface PdfTemplateOption {
  value: PdfTemplateValue;
  label: string;
  description: string;
  /** Exige plano com identidade visual personalizada (hasCustomBrand). */
  premium: boolean;
}

export const PDF_TEMPLATE_OPTIONS: PdfTemplateOption[] = [
  {
    value: 'CLASSIC',
    label: 'Clássico',
    description: 'Layout tradicional, tabela simples.',
    premium: false,
  },
  {
    value: 'MODERN',
    label: 'Moderno',
    description: 'Visual arrojado com destaque de cores.',
    premium: false,
  },
  {
    value: 'PROPOSAL',
    label: 'Proposta comercial',
    description: 'Foco em apresentação e argumentação.',
    premium: false,
  },
  {
    value: 'FORMAL',
    label: 'Formal',
    description: 'Sóbrio, ideal para órgãos públicos e licitações.',
    premium: false,
  },
  {
    value: 'EXECUTIVE',
    label: 'Executivo',
    description: 'Capa escura, valor em destaque e numeração de páginas.',
    premium: true,
  },
  {
    value: 'SIDEBAR',
    label: 'Lateral',
    description: 'Barra colorida fixa com seus dados e o total sempre visível.',
    premium: true,
  },
  {
    value: 'CATALOG',
    label: 'Catálogo',
    description: 'Mostra a foto de cada item — ideal para quem vende produto.',
    premium: true,
  },
];

const PREMIUM_TEMPLATES = new Set<string>(
  PDF_TEMPLATE_OPTIONS.filter((option) => option.premium).map((option) => option.value),
);

export function isPremiumTemplate(template: string | null | undefined): boolean {
  return !!template && PREMIUM_TEMPLATES.has(template);
}

export function templateLabel(template: string): string {
  return PDF_TEMPLATE_OPTIONS.find((option) => option.value === template)?.label ?? template;
}
