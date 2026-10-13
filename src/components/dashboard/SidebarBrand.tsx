import Link from 'next/link';

/** Marca com o halo do mockup: quadrado de gradiente sobre um borrão da cor. */
export function SidebarBrand() {
  return (
    <Link href="/dashboard" className="group flex items-center gap-3 px-2">
      <span className="relative flex h-9 w-9 items-center justify-center">
        <span className="absolute inset-0 rounded-xl bg-brand-500/40 blur-lg transition-opacity duration-300 group-hover:opacity-80" />
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
    </Link>
  );
}
