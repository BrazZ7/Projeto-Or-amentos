import { CATALOG_ITEMS } from './items';
import { CATEGORY_LABELS, type CatalogCategory, type CatalogItem } from './types';

export * from './types';
export { CATALOG_ITEMS };

const BY_ID = new Map(CATALOG_ITEMS.map((item) => [item.id, item]));

export function getCatalogItems(ids: string[]): CatalogItem[] {
  // Ignora id desconhecido em vez de falhar: o catálogo muda entre versões e um
  // item removido não deve impedir a importação dos demais.
  return ids.map((id) => BY_ID.get(id)).filter((item): item is CatalogItem => !!item);
}

export const CATALOG_BRANDS = [...new Set(CATALOG_ITEMS.map((item) => item.brand))].sort((a, b) =>
  a.localeCompare(b, 'pt-BR'),
);

/** Remove acento e caixa para a busca casar "eletrico" com "elétrico". */
function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function filterCatalog({
  term,
  category,
  brand,
}: {
  term?: string;
  category?: CatalogCategory | 'ALL';
  brand?: string | 'ALL';
}): CatalogItem[] {
  const needle = term ? normalize(term.trim()) : '';

  return CATALOG_ITEMS.filter((item) => {
    if (category && category !== 'ALL' && item.category !== category) return false;
    if (brand && brand !== 'ALL' && item.brand !== brand) return false;
    if (!needle) return true;

    // Inclui o rótulo da categoria: sem isso, buscar "elétrico" não acha nada
    // mesmo existindo a categoria "Material elétrico".
    const haystack = normalize(
      `${item.name} ${item.brand} ${item.description} ${item.code} ${CATEGORY_LABELS[item.category]}`,
    );
    // Cada palavra precisa aparecer, em qualquer ordem: "cabo 2,5" encontra
    // "Cabo flexivel 2,5mm2" sem depender da sequência digitada.
    return needle.split(/\s+/).every((word) => haystack.includes(word));
  });
}
