import Link from 'next/link';
import { Button } from '@/components/ui/Button';

/**
 * Página pública. Mesmo grafite com vidro do sistema, sem manchas flutuantes:
 * quem entra aqui e depois cria a conta tem que reconhecer o mesmo produto.
 *
 * O texto diz o que a ferramenta faz, com número quando existe número. Sem
 * "em minutos", sem "tudo em um só lugar" e sem gradiente arco-íris no título —
 * era isso que fazia a página parecer template de qualquer coisa.
 */

/** O fluxo real de quem usa, na ordem em que acontece. */
const ETAPAS = [
  {
    passo: '01',
    titulo: 'Monte o orçamento',
    texto:
      'Escolha itens do seu cadastro ou do catálogo com 272 produtos de 72 marcas. Cobre por unidade, metro, hora ou m².',
  },
  {
    passo: '02',
    titulo: 'Envie o PDF',
    texto:
      'Sete modelos com o seu logotipo, as suas cores e a sua assinatura. Vai por e-mail, WhatsApp ou link.',
  },
  {
    passo: '03',
    titulo: 'Receba o aceite',
    texto:
      'O cliente abre o link, aprova ou recusa sem criar conta. Você vê quando ele visualizou e o que decidiu.',
  },
];

const RECURSOS = [
  ['Catálogo de produtos', 'Ferramentas, elétrica, redes, CFTV, energia solar e hidráulica.'],
  ['Controle de estoque', 'Entrada, saída e ajuste de contagem, com histórico de cada movimentação.'],
  ['Nota fiscal', 'Emissão de NF-e modelo 55 a partir do orçamento aprovado.'],
  ['Cargos na equipe', 'Quem monta orçamento, quem muda a empresa e quem mexe no plano.'],
  ['Recursos de IA', 'Rascunho de orçamento por texto, revisão de descrição e busca de preço na web.'],
  ['Relatórios', 'Conversão, valores aprovados e o que está perto de vencer.'],
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen">
      <header className="sticky top-0 z-20 border-b border-hairline bg-night-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="flex items-center gap-3">
            <span className="relative flex h-9 w-9 items-center justify-center">
              <span className="absolute inset-0 rounded-xl bg-brand-500/30 blur-lg" />
              <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-glow-brand">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" aria-hidden>
                  <path
                    d="M12 3v18M3 12h18"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2" opacity="0.55" />
                </svg>
              </span>
            </span>
            <span className="text-lg font-semibold tracking-tight text-white">
              Orça<span className="text-brand-300">Fácil</span>
            </span>
          </span>

          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button>Criar conta</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6">
        {/* Alinhado à esquerda: título centralizado com gradiente é a assinatura
            de landing genérica, e a leitura em bloco à esquerda é mais direta. */}
        <section className="animate-fade-in-up py-16 lg:py-24">
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.15] tracking-tight text-white sm:text-5xl">
            Monte o orçamento, mande o PDF, receba o aceite.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
            Sistema de orçamentos para quem presta serviço e vende material. Clientes, produtos e
            estoque no mesmo cadastro — e o cliente aprova por link, sem criar conta.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/register">
              <Button size="lg">Criar conta grátis</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Já tenho conta
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-sm text-slate-500">
            Plano gratuito com 5 orçamentos por mês. Sem cartão para começar.
          </p>
        </section>

        <section className="border-t border-hairline py-14">
          <div className="grid gap-10 sm:grid-cols-3">
            {ETAPAS.map((etapa) => (
              <div key={etapa.passo}>
                <span className="font-mono text-xs text-brand-400">{etapa.passo}</span>
                <h2 className="mt-2 text-lg font-semibold text-slate-100">{etapa.titulo}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{etapa.texto}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-hairline py-14">
          <h2 className="text-sm font-medium uppercase tracking-wider text-slate-500">
            Também vem junto
          </h2>
          <dl className="mt-6 grid gap-x-10 sm:grid-cols-2">
            {RECURSOS.map(([titulo, texto]) => (
              <div key={titulo} className="border-b border-hairline py-4">
                <dt className="text-sm font-medium text-slate-200">{titulo}</dt>
                <dd className="mt-1 text-sm text-slate-400">{texto}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="border-t border-hairline py-16">
          <div className="panel flex flex-wrap items-center justify-between gap-6 p-8">
            <div>
              <h2 className="text-xl font-semibold text-slate-100">
                Comece pelo próximo orçamento.
              </h2>
              <p className="mt-1.5 text-sm text-slate-400">
                Cadastro em um minuto, sem instalar nada.
              </p>
            </div>
            <Link href="/register">
              <Button size="lg">Criar conta grátis</Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-hairline">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-8 text-sm text-slate-500">
          <span>© {new Date().getFullYear()} OrçaFácil</span>
          <span className="flex gap-5">
            <Link href="/login" className="transition-colors hover:text-slate-300">
              Entrar
            </Link>
            <Link href="/register" className="transition-colors hover:text-slate-300">
              Criar conta
            </Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
