import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-sonnet-5';

let client: Anthropic | null = null;

function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      'Recurso de IA indisponível: configure a variável de ambiente ANTHROPIC_API_KEY.',
    );
  }
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

async function ask(system: string, prompt: string, maxTokens = 1024) {
  const anthropic = getClient();
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: prompt }],
  });

  const block = response.content.find((c) => c.type === 'text');
  return block && block.type === 'text' ? block.text.trim() : '';
}

export type TextAiAction = 'improve' | 'fix' | 'professional' | 'summarize';

const actionInstructions: Record<TextAiAction, string> = {
  improve: 'Melhore a redação do texto a seguir, deixando-o mais claro e atraente, em português do Brasil, mantendo o sentido original.',
  fix: 'Corrija a ortografia, gramática e pontuação do texto a seguir, em português do Brasil, sem alterar o sentido.',
  professional: 'Reescreva o texto a seguir em um tom mais profissional e formal, adequado para um orçamento comercial, em português do Brasil.',
  summarize: 'Resuma o texto a seguir de forma objetiva, mantendo as informações essenciais, em português do Brasil.',
};

export async function transformText(action: TextAiAction, text: string) {
  if (!text.trim()) throw new Error('Informe um texto para processar.');
  const system =
    'Você é um assistente que ajuda pequenas e médias empresas a escrever textos comerciais para orçamentos. Responda APENAS com o texto resultante, sem comentários, aspas ou explicações adicionais.';
  return ask(system, `${actionInstructions[action]}\n\nTexto:\n"""\n${text}\n"""`);
}

export async function generateProductDescription(input: {
  name: string;
  category?: string;
  notes?: string;
}) {
  const system =
    'Você é um assistente que escreve descrições comerciais curtas e atrativas de produtos/serviços para catálogos de orçamento em português do Brasil. Responda APENAS com a descrição, sem comentários.';
  const prompt = `Escreva uma descrição comercial (2 a 4 frases) para o seguinte item:\nNome: ${input.name}\nCategoria: ${input.category || 'não informada'}\nObservações adicionais: ${input.notes || 'nenhuma'}`;
  return ask(system, prompt, 300);
}

export async function generateCommercialNotes(context: string) {
  const system =
    'Você é um assistente que redige observações comerciais para orçamentos (garantias, prazos, condições gerais), em português do Brasil, em tom profissional e objetivo. Responda APENAS com o texto das observações.';
  return ask(system, `Gere observações comerciais para um orçamento com o seguinte contexto:\n${context}`, 400);
}

export async function generatePaymentTerms(context: string) {
  const system =
    'Você é um assistente que redige condições de pagamento claras e profissionais para orçamentos comerciais em português do Brasil. Responda APENAS com o texto das condições de pagamento.';
  return ask(system, `Gere condições de pagamento para o seguinte contexto:\n${context}`, 300);
}

export interface AiGeneratedQuoteItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface AiGeneratedQuote {
  clientName?: string;
  items: AiGeneratedQuoteItem[];
  paymentTerms?: string;
  deliveryTerms?: string;
  warranty?: string;
  notes?: string;
}

/**
 * Interpreta uma solicitação em texto livre (ex: "orçamento para pintura de
 * uma sala de 20m2, com tinta acrílica, prazo de 5 dias") e monta uma
 * estrutura de orçamento (itens, valores estimados, condições) para o
 * usuário revisar e ajustar antes de salvar.
 */
export async function generateQuoteFromRequest(requestText: string): Promise<AiGeneratedQuote> {
  const system = `Você é um assistente que transforma pedidos em texto livre em um rascunho estruturado de orçamento comercial para uma empresa brasileira.
Responda APENAS com um JSON válido, sem comentários, sem markdown, no seguinte formato:
{
  "clientName": "nome do cliente se mencionado, ou null",
  "items": [ { "description": "string", "quantity": number, "unitPrice": number } ],
  "paymentTerms": "string ou null",
  "deliveryTerms": "string ou null",
  "warranty": "string ou null",
  "notes": "string ou null"
}
Estime valores de mercado plausíveis em reais (BRL) quando o usuário não informar preços. Sempre inclua ao menos um item.`;

  const raw = await ask(system, requestText, 1200);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Não foi possível interpretar a resposta da IA.');
  }

  const parsed = JSON.parse(jsonMatch[0]) as AiGeneratedQuote;
  if (!parsed.items || !Array.isArray(parsed.items) || parsed.items.length === 0) {
    throw new Error('A IA não conseguiu identificar itens para o orçamento.');
  }
  return parsed;
}
