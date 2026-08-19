import Link from 'next/link';
import { Building2, Palette, CreditCard, ChevronRight } from 'lucide-react';

// Índice de configurações. Existe porque a sidebar passou a ter uma única
// entrada "Configurações": sem esta tela, empresa, modelos de PDF e plano
// ficariam sem caminho de navegação.
const SECTIONS = [
  {
    href: '/dashboard/company',
    icon: Building2,
    title: 'Minha empresa',
    description: 'Dados fiscais, identidade visual, endereço e dados de pagamento.',
    accent: 'bg-blue-500/15 text-blue-300 ring-1 ring-inset ring-blue-400/25',
  },
  {
    href: '/dashboard/settings/pdf',
    icon: Palette,
    title: 'Modelos de PDF',
    description: 'Escolha o modelo, a posição da logo e os textos padrão dos orçamentos.',
    accent: 'bg-violet-500/15 text-violet-300 ring-1 ring-inset ring-violet-400/25',
  },
  {
    href: '/dashboard/settings/plan',
    icon: CreditCard,
    title: 'Plano e assinatura',
    description: 'Consulte os limites do seu plano e faça upgrade.',
    accent: 'bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-400/25',
  },
];

export default function SettingsPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Configurações</h1>
        <p className="mt-1 text-sm text-slate-400">
          Ajuste os dados da empresa, a aparência dos orçamentos e seu plano.
        </p>
      </div>

      <div className="grid gap-4">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="panel group flex items-center gap-4 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-hairline-strong"
          >
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${section.accent}`}>
              <section.icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-slate-100">{section.title}</span>
              <span className="mt-0.5 block text-sm text-slate-400">{section.description}</span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-300" />
          </Link>
        ))}
      </div>
    </div>
  );
}
