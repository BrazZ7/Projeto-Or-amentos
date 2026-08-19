import { readFileSync } from 'fs';
import path from 'path';

// O @react-pdf/renderer decodifica apenas PNG e JPEG. WebP é aceito no upload
// (ver src/app/api/upload/route.ts) mas não pode ser embutido no PDF, então
// cai no placeholder do template em vez de quebrar a geração.
const MIME_BY_EXTENSION: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

/**
 * Resolve o src de uma imagem para algo que o @react-pdf/renderer consiga
 * embutir no PDF.
 *
 * URLs absolutas (Vercel Blob) e data URIs passam direto. Uploads locais são
 * gravados como "/uploads/arquivo.png" — o renderer recusa caminho de arquivo
 * ("Only absolute URLs are supported"), então o arquivo é lido do disco e vira
 * um data URI. Qualquer entrada fora desse contrato retorna null, e o template
 * mostra o placeholder em vez de derrubar a geração inteira do PDF.
 *
 * A leitura é restrita a public/uploads: logoUrl/imageUrl são strings livres no
 * banco (nenhum schema Zod restringe o formato), então um valor forjado como
 * "/uploads/../../.env" não pode virar leitura de arquivo arbitrária aqui.
 */
export function resolveImageSrc(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^(https?:|data:)/i.test(url)) return url;
  if (!url.startsWith('/uploads/')) return null;

  const mime = MIME_BY_EXTENSION[path.extname(url).toLowerCase()];
  if (!mime) return null;

  const file = path.resolve(process.cwd(), 'public', `.${url}`);
  if (path.relative(UPLOADS_DIR, file).startsWith('..')) return null;

  try {
    return `data:${mime};base64,${readFileSync(file).toString('base64')}`;
  } catch {
    return null;
  }
}
