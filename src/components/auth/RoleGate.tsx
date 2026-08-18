'use client';

import { Lock } from 'lucide-react';
import { usePlanFeatures } from '@/components/providers/PlanFeaturesProvider';
import { hasRole, type Role } from '@/lib/rbac';

/** Cargo do usuário logado, para decidir o que mostrar. */
export function useRole() {
  const { role } = usePlanFeatures();
  return {
    role,
    can: (minimum: Role) => hasRole(role, minimum),
  };
}

/**
 * Esconde o que o cargo do usuário não permite fazer.
 *
 * Isto é conveniência, não segurança: quem pode falsificar o contexto no
 * navegador ainda esbarra no `requireRole` da rota. O ganho é o usuário não
 * preencher um formulário inteiro para receber 403 no envio.
 *
 * Com `notice`, em vez de sumir, explica por que a ação não está disponível —
 * usar quando o espaço vazio confundiria mais do que a mensagem.
 */
export function RoleGate({
  minimum,
  notice,
  children,
}: {
  minimum: Role;
  notice?: string;
  children: React.ReactNode;
}) {
  const { can } = useRole();
  if (can(minimum)) return <>{children}</>;
  if (!notice) return null;

  return (
    <p className="flex items-center gap-2 text-sm text-slate-400">
      <Lock className="h-3.5 w-3.5 shrink-0" />
      {notice}
    </p>
  );
}
