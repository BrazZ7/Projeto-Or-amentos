// Contrato entre a aplicação e o gateway fiscal. A aplicação nunca fala o
// dialeto de um provedor específico: monta este payload neutro e o adaptador
// traduz. Trocar de gateway é escrever um novo NfeProvider.

export interface NfeIssuerData {
  document: string; // CNPJ, somente números
  stateRegistration: string;
  legalName: string;
  tradeName: string | null;
  taxRegime: 'SIMPLES' | 'SIMPLES_EXCESSO' | 'NORMAL';
  addressStreet: string;
  addressNumber: string;
  addressComplement: string | null;
  addressNeighborhood: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
  cityCode: string;
}

export interface NfeRecipientData {
  document: string; // CPF ou CNPJ, somente números
  name: string;
  stateRegistration: string | null;
  stateRegistrationType: 'CONTRIBUINTE' | 'ISENTO' | 'NAO_CONTRIBUINTE';
  email: string | null;
  phone: string | null;
  addressStreet: string;
  addressNumber: string;
  addressComplement: string | null;
  addressNeighborhood: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
  cityCode: string;
}

export interface NfeItemData {
  code: string;
  description: string;
  ncm: string;
  cest: string | null;
  cfop: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  total: number;
  discount: number;
  taxOrigin: number;
  taxSituation: string;
}

export interface NfeIssueRequest {
  reference: string; // identificador nosso, idempotente no provedor
  environment: 'HOMOLOGACAO' | 'PRODUCAO';
  operationNature: string;
  series: number;
  number: number;
  issuer: NfeIssuerData;
  recipient: NfeRecipientData;
  items: NfeItemData[];
  freight: number;
  totalAmount: number;
  notes: string | null;
}

export type NfeStatus =
  | 'PROCESSING'
  | 'AUTHORIZED'
  | 'REJECTED'
  | 'CANCELED'
  | 'ERROR';

export interface NfeResult {
  status: NfeStatus;
  providerRef: string | null;
  accessKey: string | null;
  protocol: string | null;
  xmlUrl: string | null;
  danfeUrl: string | null;
  rejectionCode: string | null;
  rejectionMessage: string | null;
}

export interface NfeProvider {
  readonly name: string;
  /** Envia a nota. O retorno costuma ser PROCESSING — a SEFAZ é assíncrona. */
  issue(request: NfeIssueRequest): Promise<NfeResult>;
  /** Consulta o desfecho de uma nota já enviada. */
  consult(reference: string): Promise<NfeResult>;
  cancel(reference: string, reason: string): Promise<NfeResult>;
}

/** Erro de comunicação/configuração do provedor — não é rejeição da SEFAZ. */
export class NfeProviderError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'NfeProviderError';
  }
}
