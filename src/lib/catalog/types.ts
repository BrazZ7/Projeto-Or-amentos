/**
 * Catálogo de sugestões de produtos.
 *
 * É uma biblioteca de referência curada, não dado do usuário: serve para a
 * empresa escolher itens comuns do ramo em vez de digitar um por um. Importar
 * um item cria o produto no cadastro dela — e só isso. Estoque continua zerado
 * até existir uma movimentação de entrada, porque ter o item no catálogo não
 * significa ter o item na prateleira.
 *
 * Mora em código, e não no banco, de propósito: é dado versionado, revisável em
 * diff e igual para todas as empresas. Não precisa de migração para crescer.
 */
export type CatalogCategory =
  | 'FERRAMENTA_MANUAL'
  | 'FERRAMENTA_ELETRICA'
  | 'FIO_CABO'
  | 'MATERIAL_ELETRICO'
  | 'REDE_ISP'
  | 'ILUMINACAO'
  | 'HIDRAULICA'
  | 'FIXACAO'
  | 'EPI_SEGURANCA';

export const CATEGORY_LABELS: Record<CatalogCategory, string> = {
  FERRAMENTA_MANUAL: 'Ferramentas manuais',
  FERRAMENTA_ELETRICA: 'Ferramentas elétricas',
  FIO_CABO: 'Fios e cabos',
  MATERIAL_ELETRICO: 'Material elétrico',
  REDE_ISP: 'Redes e ISP',
  ILUMINACAO: 'Iluminação',
  HIDRAULICA: 'Hidráulica',
  FIXACAO: 'Fixação e parafusos',
  EPI_SEGURANCA: 'EPI e segurança',
};

export interface CatalogItem {
  /** Slug estável: é o que a interface envia para importar. */
  id: string;
  name: string;
  brand: string;
  category: CatalogCategory;
  /** Unidade comercial sugerida (un, m, rolo, pç). */
  unit: string;
  description: string;
  /**
   * NCM sugerido para a classe do produto. É ponto de partida para poupar
   * pesquisa, NÃO classificação fiscal conferida: o mesmo item muda de código
   * conforme composição, tensão e finalidade. Confira antes de emitir NF-e.
   */
  ncm: string | null;
  /** Sugestão de código interno; o usuário pode trocar. */
  code: string;
}
