import type { NfeIssueRequest, NfeProvider, NfeResult, NfeStatus } from '../types';
import { NfeProviderError } from '../types';

// Adaptador do Focus NFe (https://focusnfe.com.br). O token é o usuário do
// HTTP Basic, com senha vazia. Homologação e produção têm hosts distintos.
const HOSTS = {
  HOMOLOGACAO: 'https://homologacao.focusnfe.com.br',
  PRODUCAO: 'https://api.focusnfe.com.br',
} as const;

const STATUS_MAP: Record<string, NfeStatus> = {
  autorizado: 'AUTHORIZED',
  cancelado: 'CANCELED',
  processando_autorizacao: 'PROCESSING',
  erro_autorizacao: 'REJECTED',
  denegado: 'REJECTED',
};

interface FocusResponse {
  status?: string;
  status_sefaz?: string;
  mensagem_sefaz?: string;
  chave_nfe?: string;
  numero?: string;
  serie?: string;
  protocolo?: string;
  caminho_xml_nota_fiscal?: string;
  caminho_danfe?: string;
  codigo?: string;
  mensagem?: string;
  erros?: { campo?: string; mensagem?: string }[];
}

const TAX_REGIME_CODE = { SIMPLES: 1, SIMPLES_EXCESSO: 2, NORMAL: 3 } as const;
const IE_INDICATOR_CODE = { CONTRIBUINTE: 1, ISENTO: 2, NAO_CONTRIBUINTE: 9 } as const;

export class FocusNfeProvider implements NfeProvider {
  readonly name = 'focus';

  constructor(
    private readonly token: string,
    private readonly environment: 'HOMOLOGACAO' | 'PRODUCAO',
  ) {}

  private get host() {
    return HOSTS[this.environment];
  }

  private get authHeader() {
    return `Basic ${Buffer.from(`${this.token}:`).toString('base64')}`;
  }

  private async request(method: string, path: string, body?: unknown): Promise<FocusResponse> {
    let response: Response;
    try {
      response = await fetch(`${this.host}${path}`, {
        method,
        headers: {
          Authorization: this.authHeader,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (error) {
      throw new NfeProviderError(
        `Não foi possível falar com o Focus NFe: ${(error as Error).message}`,
      );
    }

    const text = await response.text();
    let data: FocusResponse = {};
    try {
      data = text ? (JSON.parse(text) as FocusResponse) : {};
    } catch {
      throw new NfeProviderError(`Resposta inesperada do Focus NFe: ${text.slice(0, 200)}`);
    }

    // 422 carrega rejeição da SEFAZ, que é resultado de negócio e não falha de
    // comunicação — quem chama decide o que fazer com ela.
    if (!response.ok && response.status !== 422) {
      throw new NfeProviderError(
        data.mensagem || `Focus NFe respondeu ${response.status}.`,
        response.status,
      );
    }
    return data;
  }

  private toResult(reference: string, data: FocusResponse): NfeResult {
    const status = STATUS_MAP[data.status || ''] || 'PROCESSING';
    const rejection =
      status === 'REJECTED'
        ? {
            rejectionCode: data.status_sefaz || data.codigo || null,
            rejectionMessage:
              data.mensagem_sefaz ||
              data.mensagem ||
              data.erros?.map((e) => [e.campo, e.mensagem].filter(Boolean).join(': ')).join('; ') ||
              'A SEFAZ recusou a nota sem detalhar o motivo.',
          }
        : { rejectionCode: null, rejectionMessage: null };

    return {
      status,
      providerRef: reference,
      accessKey: data.chave_nfe || null,
      protocol: data.protocolo || null,
      xmlUrl: data.caminho_xml_nota_fiscal ? `${this.host}${data.caminho_xml_nota_fiscal}` : null,
      danfeUrl: data.caminho_danfe ? `${this.host}${data.caminho_danfe}` : null,
      ...rejection,
    };
  }

  async issue(request: NfeIssueRequest): Promise<NfeResult> {
    const payload = {
      natureza_operacao: request.operationNature,
      data_emissao: new Date().toISOString(),
      tipo_documento: 1, // saída
      finalidade_emissao: 1, // normal
      consumidor_final: request.recipient.stateRegistrationType === 'NAO_CONTRIBUINTE' ? 1 : 0,
      presenca_comprador: 9, // operação não presencial
      modalidade_frete: request.freight > 0 ? 0 : 9,
      serie: request.series,
      numero: request.number,

      cnpj_emitente: request.issuer.document,
      inscricao_estadual_emitente: request.issuer.stateRegistration,
      nome_emitente: request.issuer.legalName,
      nome_fantasia_emitente: request.issuer.tradeName || request.issuer.legalName,
      regime_tributario_emitente: TAX_REGIME_CODE[request.issuer.taxRegime],
      logradouro_emitente: request.issuer.addressStreet,
      numero_emitente: request.issuer.addressNumber,
      bairro_emitente: request.issuer.addressNeighborhood,
      municipio_emitente: request.issuer.addressCity,
      uf_emitente: request.issuer.addressState,
      cep_emitente: request.issuer.addressZipCode,
      codigo_municipio_emitente: request.issuer.cityCode,

      [request.recipient.document.length === 14 ? 'cnpj_destinatario' : 'cpf_destinatario']:
        request.recipient.document,
      nome_destinatario: request.recipient.name,
      inscricao_estadual_destinatario: request.recipient.stateRegistration || undefined,
      indicador_inscricao_estadual_destinatario:
        IE_INDICATOR_CODE[request.recipient.stateRegistrationType],
      email_destinatario: request.recipient.email || undefined,
      telefone_destinatario: request.recipient.phone || undefined,
      logradouro_destinatario: request.recipient.addressStreet,
      numero_destinatario: request.recipient.addressNumber,
      bairro_destinatario: request.recipient.addressNeighborhood,
      municipio_destinatario: request.recipient.addressCity,
      uf_destinatario: request.recipient.addressState,
      cep_destinatario: request.recipient.addressZipCode,
      codigo_municipio_destinatario: request.recipient.cityCode,

      valor_frete: request.freight || undefined,
      informacoes_adicionais_contribuinte: request.notes || undefined,

      items: request.items.map((item, index) => ({
        numero_item: index + 1,
        codigo_produto: item.code,
        descricao: item.description,
        codigo_ncm: item.ncm,
        cest: item.cest || undefined,
        cfop: item.cfop,
        unidade_comercial: item.unit,
        quantidade_comercial: item.quantity,
        valor_unitario_comercial: item.unitPrice,
        unidade_tributavel: item.unit,
        quantidade_tributavel: item.quantity,
        valor_unitario_tributavel: item.unitPrice,
        valor_bruto: item.total,
        valor_desconto: item.discount || undefined,
        icms_origem: item.taxOrigin,
        ...(request.issuer.taxRegime === 'NORMAL'
          ? { icms_situacao_tributaria: item.taxSituation }
          : { icms_situacao_tributaria: item.taxSituation, icms_aliquota: 0 }),
      })),
    };

    const data = await this.request(
      'POST',
      `/v2/nfe?ref=${encodeURIComponent(request.reference)}`,
      payload,
    );
    return this.toResult(request.reference, data);
  }

  async consult(reference: string): Promise<NfeResult> {
    const data = await this.request('GET', `/v2/nfe/${encodeURIComponent(reference)}`);
    return this.toResult(reference, data);
  }

  async cancel(reference: string, reason: string): Promise<NfeResult> {
    const data = await this.request('DELETE', `/v2/nfe/${encodeURIComponent(reference)}`, {
      justificativa: reason,
    });
    return this.toResult(reference, data);
  }
}
