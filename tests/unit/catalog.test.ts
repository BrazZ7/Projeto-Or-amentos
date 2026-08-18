import { describe, expect, it } from 'vitest';
import {
  CATALOG_ITEMS,
  CATALOG_BRANDS,
  CATEGORY_LABELS,
  filterCatalog,
  getCatalogItems,
} from '@/lib/catalog';

describe('integridade do catalogo', () => {
  it('nao tem id repetido', () => {
    const ids = CATALOG_ITEMS.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('nao tem codigo repetido', () => {
    const codes = CATALOG_ITEMS.map((item) => item.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  // O id vai na requisicao de importacao e o codigo vira SKU no banco: acento
  // em qualquer um dos dois ja quebrou a importacao uma vez.
  it('mantem id e codigo em ASCII', () => {
    for (const item of CATALOG_ITEMS) {
      expect(item.id, `id "${item.id}"`).toMatch(/^[a-z0-9-]+$/);
      expect(item.code, `codigo "${item.code}"`).toMatch(/^[A-Z0-9-]+$/);
    }
  });

  it('preenche unidade e descricao em todo item', () => {
    for (const item of CATALOG_ITEMS) {
      expect(item.unit.trim(), item.id).not.toBe('');
      expect(item.description.length, item.id).toBeGreaterThan(10);
    }
  });

  it('usa NCM de 8 digitos quando informado', () => {
    for (const item of CATALOG_ITEMS) {
      if (item.ncm !== null) expect(item.ncm, item.id).toMatch(/^\d{8}$/);
    }
  });

  it('so usa categoria declarada', () => {
    for (const item of CATALOG_ITEMS) {
      expect(CATEGORY_LABELS[item.category], item.id).toBeDefined();
    }
  });

  it('tem item em todas as categorias', () => {
    for (const categoria of Object.keys(CATEGORY_LABELS)) {
      const itens = CATALOG_ITEMS.filter((item) => item.category === categoria);
      expect(itens.length, categoria).toBeGreaterThan(0);
    }
  });
});

describe('busca no catalogo', () => {
  it('encontra sem acento texto que tem acento', () => {
    expect(filterCatalog({ term: 'flexivel' }).length).toBeGreaterThan(0);
  });

  it('trata acento e ausencia de acento como o mesmo termo', () => {
    expect(filterCatalog({ term: 'flexível' }).length).toBe(
      filterCatalog({ term: 'flexivel' }).length,
    );
  });

  it('ignora a ordem das palavras', () => {
    expect(filterCatalog({ term: 'flexivel cabo' }).length).toBe(
      filterCatalog({ term: 'cabo flexivel' }).length,
    );
  });

  // Sem o rotulo da categoria no indice, buscar "eletrico" nao achava nada
  // apesar de existir a categoria "Material eletrico".
  it('encontra pelo nome da categoria', () => {
    expect(filterCatalog({ term: 'eletrico' }).length).toBeGreaterThan(0);
  });

  it('filtra por categoria', () => {
    const itens = filterCatalog({ category: 'HIDRAULICA' });
    expect(itens.length).toBeGreaterThan(0);
    expect(itens.every((item) => item.category === 'HIDRAULICA')).toBe(true);
  });

  it('filtra por marca', () => {
    const itens = filterCatalog({ brand: 'DeWalt' });
    expect(itens.length).toBeGreaterThan(0);
    expect(itens.every((item) => item.brand === 'DeWalt')).toBe(true);
  });

  it('combina termo, categoria e marca', () => {
    const itens = filterCatalog({ term: 'alicate', category: 'FERRAMENTA_MANUAL', brand: 'Vonder' });
    expect(itens.length).toBeGreaterThan(0);
    expect(itens.every((i) => i.brand === 'Vonder' && i.name.toLowerCase().includes('alicate'))).toBe(true);
  });

  it('devolve vazio para termo sem correspondencia', () => {
    expect(filterCatalog({ term: 'xyzabc123' })).toHaveLength(0);
  });

  it('lista as marcas em ordem', () => {
    expect(CATALOG_BRANDS.length).toBeGreaterThan(20);
    expect([...CATALOG_BRANDS].sort((a, b) => a.localeCompare(b, 'pt-BR'))).toEqual(CATALOG_BRANDS);
  });
});

describe('selecao por id', () => {
  it('ignora id desconhecido em vez de falhar', () => {
    const itens = getCatalogItems([CATALOG_ITEMS[0].id, 'nao-existe']);
    expect(itens).toHaveLength(1);
    expect(itens[0].id).toBe(CATALOG_ITEMS[0].id);
  });

  it('devolve lista vazia sem ids', () => {
    expect(getCatalogItems([])).toHaveLength(0);
  });
});
