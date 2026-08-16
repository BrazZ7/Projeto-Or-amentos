import dns from 'dns/promises';

const MAX_BYTES = 2 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 8000;
const MAX_REDIRECTS = 3;

export class UnsafeUrlError extends Error {
  status = 422;
}

function isPrivateIPv4(ip: string) {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return true;
  const [a, b] = parts;
  if (a === 10 || a === 127 || a === 0) return true;
  if (a === 169 && b === 254) return true; // link-local (inclui metadata cloud 169.254.169.254)
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  return false;
}

function isPrivateIPv6(ip: string) {
  const lower = ip.toLowerCase();
  if (lower === '::1' || lower === '::') return true;
  if (lower.startsWith('fe80:') || lower.startsWith('fc') || lower.startsWith('fd')) return true;
  if (lower.startsWith('::ffff:')) {
    const v4 = lower.split(':').pop();
    if (v4?.includes('.')) return isPrivateIPv4(v4);
  }
  return false;
}

/**
 * Bloqueia hosts que resolvem para IPs privados/loopback/link-local (proteção
 * básica contra SSRF). Isso é uma checagem prévia via DNS — não protege contra
 * DNS rebinding (o host responder um IP público na checagem e um IP privado
 * na conexão real feita pelo fetch logo em seguida); mitigar isso por completo
 * exigiria fixar o IP resolvido na camada de conexão TCP/TLS.
 */
async function assertPublicHost(hostname: string) {
  const lower = hostname.toLowerCase();
  if (lower === 'localhost' || lower === '0.0.0.0' || lower === '[::]' || lower === '::1') {
    throw new UnsafeUrlError('Esse endereço não pode ser importado.');
  }
  const records = await dns.lookup(hostname, { all: true }).catch(() => []);
  if (records.length === 0) {
    throw new UnsafeUrlError('Não foi possível resolver esse endereço.');
  }
  for (const { address, family } of records) {
    if (family === 4 && isPrivateIPv4(address)) {
      throw new UnsafeUrlError('Esse endereço não pode ser importado.');
    }
    if (family === 6 && isPrivateIPv6(address)) {
      throw new UnsafeUrlError('Esse endereço não pode ser importado.');
    }
  }
}

export async function safeFetchHtml(inputUrl: string): Promise<{ html: string; finalUrl: string }> {
  let current: URL;
  try {
    current = new URL(inputUrl);
  } catch {
    throw new UnsafeUrlError('Informe um link válido.');
  }

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount++) {
    if (current.protocol !== 'http:' && current.protocol !== 'https:') {
      throw new UnsafeUrlError('Use um link http:// ou https://.');
    }
    await assertPublicHost(current.hostname);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetch(current.toString(), {
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; OrcaFacilImportBot/1.0; +https://orcafacil.local)',
          Accept: 'text/html,application/xhtml+xml',
        },
      });
    } catch {
      throw new Error('Não foi possível acessar esse link.');
    } finally {
      clearTimeout(timeout);
    }

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      if (!location) throw new UnsafeUrlError('O link redireciona para um destino inválido.');
      current = new URL(location, current);
      continue;
    }

    if (!response.ok) {
      throw new Error(`Não foi possível acessar o link (HTTP ${response.status}).`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      throw new Error('Esse link não aponta para uma página web (HTML).');
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('Não foi possível ler o conteúdo da página.');

    const chunks: Uint8Array[] = [];
    let received = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        received += value.byteLength;
        chunks.push(value);
        if (received > MAX_BYTES) {
          await reader.cancel().catch(() => {});
          break;
        }
      }
    }

    const html = Buffer.concat(chunks.map((c) => Buffer.from(c))).toString('utf-8');
    return { html, finalUrl: current.toString() };
  }

  throw new UnsafeUrlError('Esse link tem redirecionamentos demais.');
}

function decodeBasicEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'");
}

/** Extrai um texto plano (com título/meta descrição em destaque) para alimentar a IA. */
export function htmlToPlainText(html: string): string {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i);
  const descMatch =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);

  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const parts: string[] = [];
  if (titleMatch) parts.push(`Título: ${decodeBasicEntities(titleMatch[1]).trim()}`);
  if (ogTitleMatch) parts.push(`Título (og:title): ${decodeBasicEntities(ogTitleMatch[1]).trim()}`);
  if (descMatch) parts.push(`Meta descrição: ${decodeBasicEntities(descMatch[1]).trim()}`);
  parts.push(decodeBasicEntities(body).slice(0, 15000));

  return parts.join('\n');
}
