/**
 * Leitura de um orçamento pronto vindo de fora — PDF do fornecedor, foto de um
 * orçamento em papel, print de planilha — para virar um orçamento aqui dentro.
 *
 * O modelo lê o documento e devolve as linhas que identificou. Nada é gravado:
 * o resultado vai para uma tela de conferência onde o usuário escolhe o que
 * aproveitar. Documento de terceiro tem erro de digitalização, item em duas
 * linhas e valor que não fecha — aceitar tudo às cegas colocaria número errado
 * num orçamento que vai para o cliente.
 *
 * Como em src/lib/price-search.ts, a chamada vai por fetch direto na API: o SDK
 * instalado é o 0.32.1 e não conhece bloco de documento PDF.
 */

const MODEL = 'claude-sonnet-5';
const API_URL = 'https://api.anthropic.com/v1/messages';

/** 8 MB depois do base64 — acima disso a API recusa e o upload demora demais. */
export const MAX_ARQUIVO_BYTES = 8 * 1024 * 1024;

export const TIPOS_ACEITOS = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export type TipoArquivoAceito = (typeof TIPOS_ACEITOS)[number];

export interface ImportedQuoteItem {
  description: string;
  /** Como o item foi lido: mercadoria ou mão de obra. Só orienta o usuário. */
  kind: 'produto' | 'servico';
  quantity: number;
  unit: string;
  unitPrice: number;
}

export interface ImportedQuote {
  /** Nome de quem emitiu o documento, se aparecer. */
  supplier: string | null;
  clientName: string | null;
  items: ImportedQuoteItem[];
  /** Total impresso no documento, para conferir contra a soma dos itens. */
  documentTotal: number | null;
  itemsTotal: number;
  paymentTerms: string | null;
  deliveryTerms: string | null;
  notes: string | null;
  /** O que o modelo não conseguiu ler com confiança. */
  warnings: string[];
}

export class QuoteImportError extends Error {}

const SYSTEM = `Você lê orçamentos, propostas e notas comerciais brasileiras e extrai os itens para um sistema de orçamentos.

Responda APENAS com JSON válido, sem markdown e sem texto fora dele:
{
  "supplier": "quem emitiu o documento, ou null",
  "clientName": "para quem foi feito, ou null",
  "items": [
    {
      "description": "descrição do item como está no documento",
      "kind": "produto" ou "servico",
      "quantity": number,
      "unit": "unidade de medida",
      "unitPrice": number
    }
  ],
  "documentTotal": number ou null,
  "paymentTerms": "condição de pagamento, ou null",
  "deliveryTerms": "prazo de entrega, ou null",
  "notes": "observações relevantes, ou null",
  "warnings": ["o que ficou ilegível ou duvidoso"]
}

Regras:
- Transcreva o que está escrito. Nunca invente item, quantidade ou valor que não apareça no documento.
- "kind": "produto" para mercadoria e material; "servico" para mão de obra, instalação, projeto, visita, frete e locação.
- "unit": use a unidade impressa. Cabo e fio em "m", área em "m2", mão de obra em "h", peça avulsa em "un". Se não houver unidade, use "un".
- "unitPrice" é o valor de UMA unidade. Se o documento só trouxer o total da linha, divida pelo quantidade e avise em "warnings".
- Números em reais, ponto decimal, sem símbolo e sem separador de milhar. "1.234,56" vira 1234.56.
- Se algo estiver ilegível, descreva em "warnings" em vez de adivinhar.
- Se não for um orçamento nem lista de itens, devolva "items": [] e explique em "warnings".`;

interface BlocoTexto {
  type: string;
  text?: string;
}

export async function importQuoteFromFile(
  base64: string,
  mediaType: TipoArquivoAceito,
): Promise<ImportedQuote> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new QuoteImportError(
      'Importação indisponível: configure a variável de ambiente ANTHROPIC_API_KEY.',
    );
  }

  // O documento PDF vai como bloco "document"; imagem vai como "image".
  const conteudoArquivo =
    mediaType === 'application/pdf'
      ? { type: 'document', source: { type: 'base64', media_type: mediaType, data: base64 } }
      : { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } };

  const resposta = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4000,
      system: SYSTEM,
      messages: [
        {
          role: 'user',
          content: [
            conteudoArquivo,
            { type: 'text', text: 'Extraia os itens deste orçamento.' },
          ],
        },
      ],
    }),
  });

  if (!resposta.ok) {
    const detalhe = await resposta.text().catch(() => '');
    if (resposta.status === 401) {
      throw new QuoteImportError('Chave da Anthropic inválida ou sem permissão.');
    }
    if (resposta.status === 413 || detalhe.includes('too large')) {
      throw new QuoteImportError('Arquivo grande demais. Envie um documento menor que 8 MB.');
    }
    throw new QuoteImportError(`Não foi possível ler o documento (erro ${resposta.status}).`);
  }

  const corpo = (await resposta.json()) as { content?: BlocoTexto[] };
  const texto = (corpo.content ?? [])
    .filter((b) => b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text as string)
    .join('\n');

  const bruto = texto.match(/\{[\s\S]*\}/);
  if (!bruto) throw new QuoteImportError('Não foi possível interpretar o documento.');

  let dados: Record<string, unknown>;
  try {
    dados = JSON.parse(bruto[0]);
  } catch {
    throw new QuoteImportError('Não foi possível interpretar o documento.');
  }

  const items = normalizarItens(dados.items);
  const itemsTotal =
    Math.round(items.reduce((s, i) => s + i.quantity * i.unitPrice, 0) * 100) / 100;

  return {
    supplier: texto_ou_nulo(dados.supplier, 120),
    clientName: texto_ou_nulo(dados.clientName, 120),
    items,
    documentTotal: numero_ou_nulo(dados.documentTotal),
    itemsTotal,
    paymentTerms: texto_ou_nulo(dados.paymentTerms, 500),
    deliveryTerms: texto_ou_nulo(dados.deliveryTerms, 500),
    notes: texto_ou_nulo(dados.notes, 1000),
    warnings: Array.isArray(dados.warnings)
      ? dados.warnings.filter((w): w is string => typeof w === 'string').slice(0, 10)
      : [],
  };
}

function texto_ou_nulo(valor: unknown, max: number): string | null {
  return typeof valor === 'string' && valor.trim() ? valor.trim().slice(0, max) : null;
}

function numero_ou_nulo(valor: unknown): number | null {
  const n = typeof valor === 'number' ? valor : Number(valor);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null;
}

/** O modelo pode omitir campo ou trocar o tipo; nada entra sem passar por aqui. */
function normalizarItens(entrada: unknown): ImportedQuoteItem[] {
  if (!Array.isArray(entrada)) return [];

  return entrada
    .map((item): ImportedQuoteItem | null => {
      if (!item || typeof item !== 'object') return null;
      const o = item as Record<string, unknown>;

      const description = texto_ou_nulo(o.description, 300);
      if (!description) return null;

      const quantity = Number(o.quantity);
      const unitPrice = Number(o.unitPrice);

      return {
        description,
        kind: o.kind === 'servico' ? 'servico' : 'produto',
        quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
        unit: texto_ou_nulo(o.unit, 10) ?? 'un',
        unitPrice: Number.isFinite(unitPrice) && unitPrice >= 0 ? Math.round(unitPrice * 100) / 100 : 0,
      };
    })
    .filter((i): i is ImportedQuoteItem => i !== null)
    .slice(0, 100);
}
