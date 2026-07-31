import Link from 'next/link';
import { FileText } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 p-12 text-white lg:flex">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <FileText className="h-6 w-6" />
          OrcaFacil
        </Link>
        <div>
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
      <div className="flex w-full flex-col items-center justify-center bg-surface-muted px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
