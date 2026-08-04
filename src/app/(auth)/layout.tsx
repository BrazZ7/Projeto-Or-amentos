import Link from 'next/link';
import { FileText } from 'lucide-react';
import { BackgroundBlobs } from '@/components/ui/BackgroundBlobs';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 p-12 text-white lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute -left-20 -top-20 h-72 w-72 animate-blob rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 right-0 h-80 w-80 animate-blob-delay rounded-full bg-brand-300/20 blur-3xl" />
        </div>
        <Link href="/" className="flex animate-fade-in-up items-center gap-2 text-lg font-semibold">
          <FileText className="h-6 w-6" />
          OrcaFacil
        </Link>
        <div className="animate-fade-in-up" style={{ animationDelay: '80ms' }}>
          <h1 className="text-3xl font-semibold leading-tight">
            Orçamentos profissionais em minutos, para sua empresa crescer.
          </h1>
          <p className="mt-4 max-w-md text-brand-100">
            Cadastre clientes, produtos e gere PDFs personalizados com identidade visual própria,
            acompanhamento de status e aprovação online.
          </p>
        </div>
        <p className="text-sm text-brand-200">© {new Date().getFullYear()} OrcaFacil</p>
      </div>
      <div className="relative flex w-full flex-col items-center justify-center bg-surface-muted px-6 py-12 lg:w-1/2">
        <BackgroundBlobs className="opacity-60" />
        <div className="glass-strong w-full max-w-sm animate-scale-in rounded-2xl p-6 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
