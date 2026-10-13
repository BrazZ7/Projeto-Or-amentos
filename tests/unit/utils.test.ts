import { describe, expect, it } from 'vitest';
import { formatCurrency, formatDocument, formatRelativeTime } from '@/lib/utils';
import { resolveImageSrc } from '@/lib/pdf/image-src';
import { PDF_TEMPLATE_OPTIONS, isPremiumTemplate, templateLabel } from '@/lib/pdf/template-options';

describe('formatacao', () => {
  it('formata moeda em real', () => {
    expect(formatCurrency(1234.5)).toContain('1.234,50');
    expect(formatCurrency('0')).toContain('0,00');
  });

  it('formata CPF e CNPJ', () => {
    expect(formatDocument('12345678901')).toBe('123.456.789-01');
    expect(formatDocument('12345678000199')).toBe('12.345.678/0001-99');
    expect(formatDocument(null)).toBe('');
  });

  it('descreve tempo relativo', () => {
    const agora = new Date();
    expect(formatRelativeTime(agora)).toBe('agora mesmo');
    expect(formatRelativeTime(new Date(Date.now() - 2 * 60 * 60 * 1000))).toBe('há 2 horas');
    expect(formatRelativeTime(new Date(Date.now() - 60 * 60 * 1000))).toBe('há 1 hora');
    expect(formatRelativeTime(new Date(Date.now() - 3 * 86400000))).toBe('há 3 dias');
  });
});

describe('resolucao de imagem para o PDF', () => {
  it('deixa passar URL absoluta e data URI', () => {
    expect(resolveImageSrc('https://exemplo.com/a.png')).toBe('https://exemplo.com/a.png');
    expect(resolveImageSrc('data:image/png;base64,AAA')).toBe('data:image/png;base64,AAA');
  });

  it('recusa vazio e caminho fora de uploads', () => {
    expect(resolveImageSrc(null)).toBeNull();
    expect(resolveImageSrc('')).toBeNull();
    expect(resolveImageSrc('/outro/lugar/a.png')).toBeNull();
  });

  // logoUrl e imageUrl sao string livre no Zod: um valor forjado nao pode virar
  // leitura de arquivo arbitraria.
  it('bloqueia travessia de diretorio', () => {
    expect(resolveImageSrc('/uploads/../../.env')).toBeNull();
    expect(resolveImageSrc('/uploads/../prisma/schema.prisma')).toBeNull();
  });

  it('recusa extensao que o renderizador nao decodifica', () => {
    expect(resolveImageSrc('/uploads/foto.webp')).toBeNull();
    expect(resolveImageSrc('/uploads/foto.svg')).toBeNull();
  });

  it('devolve null quando o arquivo nao existe, sem lancar', () => {
    expect(resolveImageSrc('/uploads/nao-existe-mesmo.png')).toBeNull();
  });
});

describe('modelos de PDF', () => {
  it('marca como premium exatamente os tres modelos novos', () => {
    const premium = PDF_TEMPLATE_OPTIONS.filter((o) => o.premium).map((o) => o.value);
    expect(premium.sort()).toEqual(['CATALOG', 'EXECUTIVE', 'SIDEBAR']);
  });

  it('reconhece modelo premium', () => {
    expect(isPremiumTemplate('EXECUTIVE')).toBe(true);
    expect(isPremiumTemplate('CLASSIC')).toBe(false);
    expect(isPremiumTemplate(null)).toBe(false);
    expect(isPremiumTemplate('INEXISTENTE')).toBe(false);
  });

  it('traduz o valor para rotulo', () => {
    expect(templateLabel('EXECUTIVE')).toBe('Executivo');
    expect(templateLabel('DESCONHECIDO')).toBe('DESCONHECIDO');
  });
});
