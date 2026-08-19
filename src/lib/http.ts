/**
 * Resultado de uma chamada à API já normalizado: ou deu certo e tem dado, ou
 * falhou e tem uma mensagem pronta para mostrar ao usuário.
 */
export type JsonResult<T> = { ok: true; data: T } | { ok: false; error: string };

/**
 * `fetch` que não estoura na cara do usuário.
 *
 * O `fetch` do navegador rejeita com "TypeError: Failed to fetch" quando não
 * consegue nem falar com o servidor — internet caída, servidor reiniciando,
 * aba offline. Num handler de formulário sem try/catch isso vira tela de erro
 * do Next em cima do formulário preenchido, e o usuário perde o que digitou
 * sem entender o motivo.
 *
 * Aqui a falha de rede volta como mensagem, o formulário continua na tela com
 * os dados intactos, e é só tentar de novo.
 */
export async function requestJson<T = unknown>(
  url: string,
  init?: RequestInit,
  fallback = 'Não foi possível concluir a operação.',
): Promise<JsonResult<T>> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    return {
      ok: false,
      error: 'Não foi possível falar com o servidor. Verifique a conexão e tente de novo.',
    };
  }

  // Resposta pode não ter corpo JSON (204, erro de proxy, HTML de gateway).
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const doApi = (body as { error?: unknown } | null)?.error;
    return { ok: false, error: typeof doApi === 'string' ? doApi : `${fallback} (erro ${res.status})` };
  }

  return { ok: true, data: body as T };
}

/** Atalho para as chamadas que enviam JSON, que é o caso da maioria. */
export function sendJson<T = unknown>(
  url: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: unknown,
  fallback?: string,
) {
  return requestJson<T>(
    url,
    {
      method,
      headers: { 'Content-Type': 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    },
    fallback,
  );
}
