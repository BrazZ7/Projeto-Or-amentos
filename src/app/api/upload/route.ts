import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { put } from '@vercel/blob';
import { requireSession } from '@/lib/session';
import { handleApiError } from '@/lib/api-utils';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

// Upload de logotipo, assinatura e imagens de produto. Usa o Vercel Blob
// quando o projeto está conectado a ele (BLOB_READ_WRITE_TOKEN definido —
// necessário em produção na Vercel, cujo sistema de arquivos é somente
// leitura); caso contrário, grava em public/uploads para desenvolvimento
// local. Ambos os caminhos retornam o mesmo contrato de resposta ({ url }).
export async function POST(request: NextRequest) {
  try {
    await requireSession();

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Formato de arquivo não suportado.' }, { status: 422 });
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'Arquivo maior que 5MB.' }, { status: 422 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = file.name.split('.').pop() || 'png';
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
