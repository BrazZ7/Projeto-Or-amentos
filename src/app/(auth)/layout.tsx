import Link from 'next/link';

/** O que o produto faz, em substantivo. Sem adjetivo e sem promessa. */
const RECURSOS = [
  'Orçamento em PDF com a identidade da sua empresa',
  'Cadastro de clientes, produtos e controle de estoque',
  'Aprovação do cliente por link, sem exigir cadastro',
  'Emissão de NF-e modelo 55',
];

/** Mesma marca da sidebar: entrar e usar o sistema têm que parecer o mesmo produto. */
function Marca({ className }: { className?: string }) {
  return (
    <Link href="/" className={`group inline-flex items-center gap-3 ${className ?? ''}`}>
      <span className="relative flex h-9 w-9 items-center justify-center">
        <span className="absolute inset-0 rounded-xl bg-brand-500/30 blur-lg transition-opacity duration-300 group-hover:opacity-80" />
        <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-glow-brand">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" aria-hidden>
            <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2" opacity="0.55" />
          </svg>
        </span>
      </span>
      <span className="text-lg font-semibold tracking-tight text-white">
        Orça<span className="text-brand-300">Fácil</span>
      </span>
    </Link>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    // Sem manchas flutuantes: o fundo é só o grafite do body, com o clareamento
    // difuso e a faixa de luz que ele já pinta. Quem carrega o vidro aqui são o
    // cartão e os campos.
    <div className="relative min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-10 px-6 py-12 lg:flex-row lg:items-center lg:gap-16 lg:py-16">
        {/* Coluna de apresentação. Separada por um filete prateado, não por um
            bloco de cor: a divisa em gradiente é a mesma linguagem da aresta
            da sidebar. */}
        <aside className="relative hidden flex-1 flex-col justify-center lg:flex lg:after:absolute lg:after:inset-y-6 lg:after:right-[-2rem] lg:after:w-px lg:after:bg-gradient-to-b lg:after:from-transparent lg:after:via-white/15 lg:after:to-transparent">
          <Marca />

          <p className="mt-8 max-w-md text-lg leading-relaxed text-slate-300">
            Sistema de orçamentos para quem presta serviço e vende material.
          </p>

          <ul className="mt-8 max-w-md divide-y divide-hairline border-y border-hairline">
            {RECURSOS.map((recurso) => (
              <li key={recurso} className="py-3 text-sm text-slate-400">
                {recurso}
              </li>
            ))}
          </ul>

          <p className="mt-8 text-xs text-slate-500">
            © {new Date().getFullYear()} OrçaFácil
          </p>
        </aside>

        <main className="flex w-full flex-col items-center lg:w-[26rem] lg:shrink-0">
          <Marca className="mb-8 lg:hidden" />
          <div className="panel glass-fields w-full animate-scale-in p-6 sm:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
