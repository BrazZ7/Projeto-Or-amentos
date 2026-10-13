import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { assertAiAllowed } from '@/lib/plan-limits';
import { enforceRateLimit } from '@/lib/rate-limit';
import { handleApiError } from '@/lib/api-utils';
import {
  importQuoteFromFile,
  QuoteImportError,
  MAX_ARQUIVO_BYTES,
  TIPOS_ACEITOS,
  type TipoArquivoAceito,
} from '@/lib/quote-import';

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    await assertAiAllowed(session.user.companyId);
    await enforceRateLimit('ai', session.user.companyId);

    const form = await request.formData();
    const arquivo = form.get('file');

    if (!(arquivo instanceof File)) {
      return NextResponse.json({ error: 'Envie um arquivo.' }, { status: 422 });
    }

    if (!TIPOS_ACEITOS.includes(arquivo.type as TipoArquivoAceito)) {
      return NextResponse.json(
        { error: 'Formato não aceito. Envie PDF, JPG, PNG ou WebP.' },
        { status: 422 },
      );
    }

    // Checado aqui e não só no navegador: o limite protege a chamada à API,
    // e o cliente pode mandar o que quiser direto na rota.
    if (arquivo.size > MAX_ARQUIVO_BYTES) {
      return NextResponse.json(
        { error: 'Arquivo grande demais. O limite é 8 MB.' },
        { status: 422 },
      );
    }

    const base64 = Buffer.from(await arquivo.arrayBuffer()).toString('base64');
    const resultado = await importQuoteFromFile(base64, arquivo.type as TipoArquivoAceito);

    return NextResponse.json(resultado);
  } catch (error) {
    if (error instanceof QuoteImportError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    return handleApiError(error);
  }
}
