/**
 * Busca de preço de mercado na web.
 *
 * Usa a ferramenta de busca do próprio servidor da Anthropic: o modelo pesquisa,
 * lê os resultados e devolve as ofertas que encontrou. Diferente do resto de
 * src/lib/ai.ts, a chamada é feita por fetch direto na API em vez do SDK — o
 * pacote instalado é o 0.32.1, que é anterior à ferramenta de busca e não a
 * conhece. Chamar a API direto evita subir 86 versões de SDK e mexer nos seis
 * recursos de IA que já funcionam.
 *
 * O resultado é sempre referência, nunca verdade: preço de varejo muda por dia,
 * região e vendedor, e pode ou não incluir frete. Por isso cada oferta carrega a
 * loja e o link, e quem decide o valor do orçamento é o usuário.
 */

const MODEL = 'claude-sonnet-5';
const API_URL = 'https://api.anthropic.com/v1/messages';

/** Teto de buscas por chamada. Cada busca é cobrada, então não deixamos aberto. */
const MAX_BUSCAS = 4;

export interface PriceOffer {
  /** Nome da loja como apareceu no resultado. */
  store: string;
  price: number;
  url: string | null;
  /** Observação curta: condição, voltagem, se é kit, se o frete está incluso. */
  note: string | null;
}

export interface PriceSearchResult {
  query: string;
  offers: PriceOffer[];
  lowest: number | null;
  average: number | null;
  /** Uma frase sobre o que foi encontrado, ou por que não foi. */
  summary: string;
  searchedAt: string;
}

export class PriceSearchError extends Error {}

const SYSTEM = `Você pesquisa preços de produtos no varejo brasileiro para ajudar uma empresa a montar orçamentos.

Use a busca na web para encontrar o preço atual do produto pedido em lojas brasileiras. Prefira lojas conhecidas e páginas do produto específico.

Responda APENAS com um JSON válido, sem markdown e sem texto fora dele, neste formato:
{
  "offers": [
    { "store": "nome da loja", "price": 199.9, "url": "link da página do produto ou null", "note": "observação curta ou null" }
  ],
  "summary": "uma frase em português do Brasil sobre o que foi encontrado"
}

Regras que não podem ser quebradas:
- Só inclua preço que apareceu de fato num resultado de busca. Nunca estime, nunca calcule, nunca complete com conhecimento próprio.
- Se não encontrar preço confiável, devolva "offers": [] e explique em "summary". Isso é uma resposta aceitável e melhor que um número inventado.
- "price" é número em reais, sem símbolo e sem separador de milhar. Use ponto decimal.
- Se o preço for "de/por", use o valor atual (o "por").
- Em "note", avise quando o item for kit, tiver voltagem específica, for usado/recondicionado, ou quando o preço depender de frete.
- No máximo 6 ofertas, das mais relevantes.`;

interface BlocoTexto {
  type: string;
  text?: string;
}

export async function searchProductPrices(query: string): Promise<PriceSearchResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new PriceSearchError(
      'Busca de preço indisponível: configure a variável de ambiente ANTHROPIC_API_KEY.',
    );
  }

  const termo = query.trim().slice(0, 200);
  if (termo.length < 3) {
    throw new PriceSearchError('Descreva o produto com pelo menos 3 caracteres.');
  }

  const resposta = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1500,
      system: SYSTEM,
      tools: [
        {
          type: 'web_search_20250305',
          name: 'web_search',
          max_uses: MAX_BUSCAS,
          user_location: { type: 'approximate', country: 'BR' },
        },
      ],
      messages: [{ role: 'user', content: `Preço de mercado no Brasil para: ${termo}` }],
    }),
  });

  if (!resposta.ok) {
    const detalhe = await resposta.text().catch(() => '');
    // 400 aqui costuma ser a API recusando a ferramenta de busca — vale dizer
    // isso em vez de "erro 400", que não ajuda ninguém a resolver.
    if (resposta.status === 400 && detalhe.includes('web_search')) {
      throw new PriceSearchError(
        'A busca na web não está habilitada para esta chave da Anthropic. Ative a ferramenta de busca no console da organização.',
      );
    }
    if (resposta.status === 401) {
      throw new PriceSearchError('Chave da Anthropic inválida ou sem permissão.');
    }
    throw new PriceSearchError(`A busca de preço falhou (erro ${resposta.status}).`);
  }

  const corpo = (await resposta.json()) as { content?: BlocoTexto[] };
  const texto = (corpo.content ?? [])
    .filter((b) => b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text as string)
    .join('\n')
    .trim();

  const bruto = texto.match(/\{[\s\S]*\}/);
  if (!bruto) {
    throw new PriceSearchError('Não foi possível interpretar o resultado da busca.');
  }

  let analisado: { offers?: unknown; summary?: unknown };
  try {
    analisado = JSON.parse(bruto[0]);
  } catch {
    throw new PriceSearchError('Não foi possível interpretar o resultado da busca.');
  }

  const offers = normalizarOfertas(analisado.offers);
  const precos = offers.map((o) => o.price);

  return {
    query: termo,
    offers,
    lowest: precos.length ? Math.min(...precos) : null,
    average: precos.length
      ? Math.round((precos.reduce((s, p) => s + p, 0) / precos.length) * 100) / 100
      : null,
    summary:
      typeof analisado.summary === 'string' && analisado.summary.trim()
        ? analisado.summary.trim()
        : 'Nenhum preço encontrado para esse termo.',
    searchedAt: new Date().toISOString(),
  };
}

/** O modelo pode devolver campo faltando ou tipo errado; nada entra sem passar aqui. */
function normalizarOfertas(entrada: unknown): PriceOffer[] {
  if (!Array.isArray(entrada)) return [];

  return entrada
    .map((item): PriceOffer | null => {
      if (!item || typeof item !== 'object') return null;
      const o = item as Record<string, unknown>;

      const price = typeof o.price === 'number' ? o.price : Number(o.price);
      if (!Number.isFinite(price) || price <= 0) return null;

      const url = typeof o.url === 'string' && /^https?:\/\//i.test(o.url) ? o.url : null;

      return {
        store: typeof o.store === 'string' && o.store.trim() ? o.store.trim().slice(0, 80) : 'Loja',
        price: Math.round(price * 100) / 100,
        url,
        note: typeof o.note === 'string' && o.note.trim() ? o.note.trim().slice(0, 160) : null,
      };
    })
    .filter((o): o is PriceOffer => o !== null)
    .sort((a, b) => a.price - b.price)
    .slice(0, 6);
}
