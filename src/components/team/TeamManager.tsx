'use client';

import { useEffect, useState } from 'react';
import { UserPlus, Trash2, MailCheck, Copy, Check, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { RoleGate, useRole } from '@/components/auth/RoleGate';
import { ROLE_LABELS, type Role } from '@/lib/rbac';
import { requestJson, sendJson } from '@/lib/http';

interface Membro {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface Convite {
  id: string;
  email: string;
  role: Role;
  expiresAt: string;
  expirado: boolean;
}

interface Equipe {
  membros: Membro[];
  convites: Convite[];
  limite: number | null;
  planoNome: string | null;
}

/**
 * Equipe da empresa: quem já entrou, quem foi convidado e ainda não entrou.
 *
 * O convite não cria conta — quem recebe define o próprio nome e a própria
 * senha. Por isso a lista separa membro de convite pendente: são estados
 * diferentes, e o pendente ocupa vaga do plano do mesmo jeito.
 */
export function TeamManager({ meuId }: { meuId: string }) {
  const { can } = useRole();
  const [equipe, setEquipe] = useState<Equipe | null>(null);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('MEMBER');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [linkGerado, setLinkGerado] = useState<{ url: string; enviado: boolean } | null>(null);
  const [copiado, setCopiado] = useState(false);

  async function carregar() {
    const res = await requestJson<Equipe>('/api/team', undefined, 'Não foi possível carregar a equipe.');
    if (res.ok) setEquipe(res.data);
    else setErro(res.error);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function convidar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    setLinkGerado(null);

    const res = await sendJson<{ url: string; emailEnviado: boolean }>(
      '/api/team',
      'POST',
      { email, role },
      'Não foi possível enviar o convite.',
    );
    setEnviando(false);

    if (!res.ok) {
      setErro(res.error);
      return;
    }

    setLinkGerado({ url: res.data.url, enviado: res.data.emailEnviado });
    setEmail('');
    carregar();
  }

  async function cancelarConvite(id: string) {
    const res = await sendJson(`/api/team/invitations/${id}`, 'DELETE', undefined, 'Não foi possível cancelar.');
    if (!res.ok) setErro(res.error);
    carregar();
  }

  async function removerMembro(membro: Membro) {
    if (!confirm(`Remover ${membro.name} da equipe? Ele perde o acesso imediatamente.`)) return;
    const res = await sendJson(`/api/team/members/${membro.id}`, 'DELETE', undefined, 'Não foi possível remover.');
    if (!res.ok) setErro(res.error);
    carregar();
  }

  async function mudarCargo(membro: Membro, novo: Role) {
    const res = await sendJson(`/api/team/members/${membro.id}`, 'PATCH', { role: novo }, 'Não foi possível alterar o cargo.');
    if (!res.ok) setErro(res.error);
    carregar();
  }

  if (!equipe) {
    return <p className="text-sm text-slate-400">Carregando equipe...</p>;
  }

  const ocupadas = equipe.membros.length + equipe.convites.filter((c) => !c.expirado).length;
  const lotado = equipe.limite !== null && ocupadas >= equipe.limite;

  return (
    <div className="space-y-6">
      {equipe.limite !== null && (
        <p className="text-sm text-slate-400">
          <span className="text-slate-100">
            {ocupadas} de {equipe.limite}
          </span>{' '}
          {equipe.limite === 1 ? 'vaga usada' : 'vagas usadas'} no plano {equipe.planoNome}. Convite
          pendente também ocupa vaga.
        </p>
      )}

      <RoleGate minimum="ADMIN" notice="Só administradores podem convidar pessoas.">
        <form onSubmit={convidar} className="panel space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
            <Input
              label="Convidar por e-mail"
              name="inviteEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="pessoa@empresa.com.br"
              required
            />
            <Select
              label="Cargo"
              name="inviteRole"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="MEMBER">{ROLE_LABELS.MEMBER}</option>
              <option value="ADMIN">{ROLE_LABELS.ADMIN}</option>
              {/* Só o dono pode criar outro dono. */}
              {can('OWNER') && <option value="OWNER">{ROLE_LABELS.OWNER}</option>}
            </Select>
            <Button type="submit" loading={enviando} disabled={lotado}>
              <UserPlus className="h-4 w-4" />
              Convidar
            </Button>
          </div>

          <p className="text-xs text-slate-500">
            <span className="text-slate-400">{ROLE_LABELS.MEMBER}</span> monta orçamentos, clientes e
            estoque. <span className="text-slate-400">{ROLE_LABELS.ADMIN}</span> também altera a
            empresa e emite nota fiscal.{' '}
            <span className="text-slate-400">{ROLE_LABELS.OWNER}</span> ainda mexe no plano.
          </p>

          {lotado && (
            <p className="flex items-center gap-2 text-sm text-amber-300">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Todas as vagas do plano estão ocupadas. Cancele um convite, remova alguém ou faça
              upgrade.
            </p>
          )}

          {erro && <p className="text-sm text-rose-400">{erro}</p>}

          {linkGerado && (
            <div className="rounded-xl border border-hairline bg-white/[0.03] p-3">
              <p className="flex items-center gap-2 text-sm text-emerald-300">
                <MailCheck className="h-4 w-4 shrink-0" />
                {linkGerado.enviado
                  ? 'Convite enviado por e-mail.'
                  : 'Convite criado, mas o e-mail não pôde ser enviado — repasse o link abaixo.'}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded-lg bg-black/30 px-2 py-1.5 font-mono text-xs text-slate-400">
                  {linkGerado.url}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(linkGerado.url);
                    setCopiado(true);
                    setTimeout(() => setCopiado(false), 2000);
                  }}
                  className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
                  aria-label="Copiar link do convite"
                >
                  {copiado ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}
        </form>
      </RoleGate>

      <div>
        <h2 className="mb-2 text-sm font-medium uppercase tracking-wider text-slate-500">
          Na equipe
        </h2>
        <ul className="divide-y divide-hairline border-y border-hairline">
          {equipe.membros.map((membro) => (
            <li key={membro.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-slate-100">
                  {membro.name}
                  {membro.id === meuId && <span className="text-slate-500"> · você</span>}
                </p>
                <p className="truncate text-xs text-slate-500">{membro.email}</p>
              </div>

              {can('ADMIN') && membro.id !== meuId ? (
                // O Select embrulha o campo num div w-full; sem esta caixa de
                // largura fixa ele come a linha inteira e empurra o nome para fora.
                <div className="w-36 shrink-0">
                  <Select
                    name={`role-${membro.id}`}
                    className="py-1 text-xs"
                    value={membro.role}
                    onChange={(e) => mudarCargo(membro, e.target.value as Role)}
                  >
                    <option value="MEMBER">{ROLE_LABELS.MEMBER}</option>
                    <option value="ADMIN">{ROLE_LABELS.ADMIN}</option>
                    {can('OWNER') && <option value="OWNER">{ROLE_LABELS.OWNER}</option>}
                  </Select>
                </div>
              ) : (
                <span className="shrink-0 text-xs text-slate-400">{ROLE_LABELS[membro.role]}</span>
              )}

              {can('ADMIN') && membro.id !== meuId && (
                <button
                  type="button"
                  onClick={() => removerMembro(membro)}
                  aria-label={`Remover ${membro.name}`}
                  className="shrink-0 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {equipe.convites.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-medium uppercase tracking-wider text-slate-500">
            Convites pendentes
          </h2>
          <ul className="divide-y divide-hairline border-y border-hairline">
            {equipe.convites.map((convite) => (
              <li key={convite.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-slate-200">{convite.email}</p>
                  <p className="text-xs text-slate-500">
                    {ROLE_LABELS[convite.role]} ·{' '}
                    {convite.expirado ? (
                      <span className="text-amber-300">expirado</span>
                    ) : (
                      `vence em ${new Date(convite.expiresAt).toLocaleDateString('pt-BR')}`
                    )}
                  </p>
                </div>
                {can('ADMIN') && (
                  <button
                    type="button"
                    onClick={() => cancelarConvite(convite.id)}
                    aria-label={`Cancelar convite de ${convite.email}`}
                    className="shrink-0 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
