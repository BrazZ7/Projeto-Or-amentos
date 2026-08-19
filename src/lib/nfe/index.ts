import type { NfeProvider } from './types';
import { FocusNfeProvider } from './providers/focus';
import { SandboxNfeProvider } from './providers/sandbox';

export * from './types';
export { buildNfeRequest, FiscalDataError } from './build-request';

const sandbox = new SandboxNfeProvider();

/**
 * Escolhe o gateway fiscal pelo ambiente. Sem FOCUS_NFE_TOKEN configurado cai
 * no provedor de teste — assim o fluxo continua utilizável em desenvolvimento,
 * em vez de quebrar por falta de credencial.
 */
export function getNfeProvider(environment: 'HOMOLOGACAO' | 'PRODUCAO'): NfeProvider {
  if (process.env.NFE_PROVIDER === 'sandbox') return sandbox;

  const token = process.env.FOCUS_NFE_TOKEN;
  if (!token) return sandbox;

  return new FocusNfeProvider(token, environment);
}

export function isSandboxProvider(provider: NfeProvider) {
  return provider.name === 'sandbox';
}
