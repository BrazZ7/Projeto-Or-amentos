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
import { BackgroundBlobs } from '@/components/ui/BackgroundBlobs';

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
    <div className="relative min-h-screen overflow-hidden bg-surface-muted">
      <BackgroundBlobs position="fixed" />

      <header className="sticky top-0 z-20 border-b border-white/60 bg-white/70 shadow-sm backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
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
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-4xl px-6 pb-16 pt-16 text-center">
          <div className="glass mb-6 inline-flex animate-fade-in-up items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-brand-700">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-glow-pulse rounded-full bg-brand-500" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-600" />
            </span>
            Novo: orçamentos gerados por IA a partir de um pedido em texto livre
          </div>
          <h1 className="animate-fade-in-up text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl">
            Orçamentos{' '}
            <span className="animate-gradient-x bg-[length:200%_auto] bg-gradient-to-r from-brand-600 via-purple-500 to-brand-600 bg-clip-text text-transparent">
              profissionais em PDF
            </span>
            , prontos em minutos.
          </h1>
          <p
            className="mx-auto mt-5 max-w-2xl animate-fade-in-up text-lg text-slate-600"
            style={{ animationDelay: '80ms' }}
          >
            Cadastre clientes e produtos, gere propostas com sua marca e acompanhe cada orçamento
            até a aprovação — tudo em um só lugar.
          </p>
          <div
            className="mt-8 flex animate-fade-in-up items-center justify-center gap-3"
            style={{ animationDelay: '160ms' }}
          >
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
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                glass
                hoverable
                glow
                className="group animate-fade-in-up"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <CardContent className="flex flex-col gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-transform duration-300 group-hover:scale-110 group-hover:animate-float">
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
