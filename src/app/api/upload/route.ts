import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { put } from '@vercel/blob';
import { requireSession } from '@/lib/session';
import { handleApiError } from '@/lib/api-utils';
import { enforceRateLimit } from '@/lib/rate-limit';

// SVG é deliberadamente excluído: por ser XML, pode conter <script> e seria
// executado se aberto diretamente na mesma origem (armazenamento estático
// de public/uploads ou Vercel Blob), o que criaria um vetor de XSS
// armazenado a partir de um upload de logotipo/assinatura/imagem.
const EXTENSION_BY_TYPE: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

// Assinaturas binárias (magic bytes) usadas para confirmar que o conteúdo
// real do arquivo corresponde ao Content-Type declarado pelo cliente, que é
// livremente falsificável em um multipart/form-data manual.
function matchesDeclaredType(buffer: Buffer, type: string) {
  if (type === 'image/png') {
    return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }
  if (type === 'image/jpeg') {
    return buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
  }
  if (type === 'image/webp') {
    return (
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    );
  }
  return false;
}

// Upload de logotipo, assinatura e imagens de produto. Usa o Vercel Blob
// quando o projeto está conectado a ele (BLOB_READ_WRITE_TOKEN definido —
// necessário em produção na Vercel, cujo sistema de arquivos é somente
// leitura); caso contrário, grava em public/uploads para desenvolvimento
// local. Ambos os caminhos retornam o mesmo contrato de resposta ({ url }).
export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    await enforceRateLimit('upload', session.user.companyId);

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }
    const extension = EXTENSION_BY_TYPE[file.type];
    if (!extension) {
      return NextResponse.json({ error: 'Formato de arquivo não suportado.' }, { status: 422 });
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'Arquivo maior que 5MB.' }, { status: 422 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!matchesDeclaredType(buffer, file.type)) {
      return NextResponse.json(
        { error: 'O conteúdo do arquivo não corresponde ao formato declarado.' },
        { status: 422 },
      );
    }
    const fileName = `${randomUUID()}.${extension}`;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(fileName, buffer, {
        access: 'public',
        contentType: file.type,
      });
      return NextResponse.json({ url: blob.url });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });
    await writeFile(path.join(uploadsDir, fileName), buffer);

    return NextResponse.json({ url: `/uploads/${fileName}` });
  } catch (error) {
    return handleApiError(error);
  }
}
