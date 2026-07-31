import Link from 'next/link';
import {
  FileText,
  Sparkles,
  Palette,
  ShieldCheck,
  Send,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

const features = [
  {
    icon: Sparkles,
    title: 'IA integrada',
    description:
      'Melhore descrições, corrija textos e monte orçamentos completos a partir de um pedido em texto livre.',
  },
  {
    icon: Palette,
    title: 'Identidade visual própria',
    description: 'Logotipo, cores da marca, assinatura e vários modelos de PDF para escolher.',
  },
  {
    icon: Send,
    title: 'Link público de aprovação',
    description: 'Seu cliente visualiza, aprova ou recusa o orçamento direto pelo link, sem login.',
  },
  {
    icon: BarChart3,
    title: 'Painel completo',
    description: 'Acompanhe conversão, valores aprovados e orçamentos próximos do vencimento.',
  },
  {
    icon: ShieldCheck,
    title: 'Dados isolados por empresa',
    description: 'Cada conta tem seu próprio ambiente, sem acesso cruzado de informações.',
  },
  {
    icon: FileText,
    title: 'Vários modelos de PDF',
    description: 'Clássico, moderno, proposta comercial e formal — personalize cores e fontes.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-muted">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <FileText className="h-6 w-6 text-brand-600" />
          OrcaFacil
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost">Entrar</Button>
          </Link>
          <Link href="/register">
            <Button>Criar conta grátis</Button>
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-4xl px-6 pb-16 pt-12 text-center">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl">
            Orçamentos profissionais em PDF, prontos em minutos.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            Cadastre clientes e produtos, gere propostas com sua marca e acompanhe cada orçamento
            até a aprovação — tudo em um só lugar.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/register">
              <Button size="lg">Começar gratuitamente</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Já tenho conta
              </Button>
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900">{feature.title}</h3>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} OrcaFacil. Todos os direitos reservados.
      </footer>
    </div>
  );
}
