import type { NfeIssueRequest, NfeProvider, NfeResult } from '../types';

/**
 * Provedor local, usado quando não há token de gateway configurado. Simula o
 * ciclo da SEFAZ para o fluxo da aplicação ser testável de ponta a ponta sem
 * conta em provedor nenhum — inclusive o caminho de rejeição.
 *
 * Nunca emite documento fiscal de verdade: só é escolhido quando
 * NFE_PROVIDER=sandbox ou quando falta credencial.
 */
export class SandboxNfeProvider implements NfeProvider {
  readonly name = 'sandbox';

  private readonly store = new Map<string, NfeResult>();

  private buildAccessKey(request: NfeIssueRequest) {
    // A chave real tem 44 dígitos: UF + AAMM + CNPJ + modelo + série + número
    // + tipo de emissão + código numérico + DV. Aqui só o formato importa.
    const now = new Date();
    const yearMonth = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const raw =
      '35' +
      yearMonth +
      request.issuer.document.padStart(14, '0') +
      '55' +
      String(request.series).padStart(3, '0') +
      String(request.number).padStart(9, '0') +
      '1' +
      String(Date.now()).slice(-8);
    return raw.padEnd(44, '0').slice(0, 44);
  }

  async issue(request: NfeIssueRequest): Promise<NfeResult> {
    // Item sem NCM é a rejeição mais comum na vida real; reproduzida aqui para
    // a interface de erro poder ser exercitada.
    const invalid = request.items.find((item) => !/^\d{8}$/.test(item.ncm));
    if (invalid) {
      const rejected: NfeResult = {
        status: 'REJECTED',
        providerRef: request.reference,
        accessKey: null,
        protocol: null,
        xmlUrl: null,
        danfeUrl: null,
        rejectionCode: '778',
        rejectionMessage: `Rejeição: NCM inválido no item "${invalid.description}".`,
      };
      this.store.set(request.reference, rejected);
      return rejected;
    }

    const accessKey = this.buildAccessKey(request);
    const authorized: NfeResult = {
      status: 'AUTHORIZED',
      providerRef: request.reference,
      accessKey,
      protocol: `135${Date.now()}`,
      xmlUrl: null,
      danfeUrl: null,
      rejectionCode: null,
      rejectionMessage: null,
    };
    this.store.set(request.reference, authorized);
    return authorized;
  }

  async consult(reference: string): Promise<NfeResult> {
    return (
      this.store.get(reference) || {
        status: 'ERROR',
        providerRef: reference,
        accessKey: null,
        protocol: null,
        xmlUrl: null,
        danfeUrl: null,
        rejectionCode: null,
        rejectionMessage: 'Nota não encontrada no provedor de teste.',
      }
    );
  }

  async cancel(reference: string): Promise<NfeResult> {
    const current = await this.consult(reference);
    const canceled: NfeResult = { ...current, status: 'CANCELED' };
    this.store.set(reference, canceled);
    return canceled;
  }
}
