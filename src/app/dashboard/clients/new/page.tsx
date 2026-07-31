import { ClientForm } from '@/components/clients/ClientForm';

export default function NewClientPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Novo cliente</h1>
        <p className="mt-1 text-sm text-slate-500">Cadastre um cliente pessoa física ou jurídica.</p>
      </div>
      <ClientForm />
    </div>
  );
}
