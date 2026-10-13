/**
 * Unidades de medida e a heurística que sugere cobrar por metro.
 *
 * Vive aqui porque serve o item do orçamento e o cadastro de produto — a mesma
 * regra em dois lugares divergiria na primeira alteração.
 */

/** Unidades mais usadas. Alimentam datalist, não select: quem vende por unidade
    fora da lista (diária, saco, bobina) digita a sua. */
export const UNIDADES = [
  'un',
  'm',
  'm²',
  'm³',
  'pç',
  'cx',
  'kg',
  'L',
  'h',
  'par',
  'jg',
  'pct',
  'rl',
] as const;

/** No cadastro de produto não faz sentido sugerir hora, que é serviço. */
export const UNIDADES_DE_PRODUTO = UNIDADES.filter((u) => u !== 'h');

/** Coisas que se vendem por comprimento. */
const VENDIDOS_POR_METRO = [
  'cabo',
  'fio',
  'fibra',
  'optic',
  'óptic',
  'drop',
  'cordoalha',
  'arame',
  'mangueira',
  'eletroduto',
  'conduite',
  'conduíte',
  'canaleta',
  'perfilado',
  'tubo',
  'cano',
  'corda',
  'trilho',
  'rodape',
  'rodapé',
  'fita',
  'corrente',
];

export function semAcento(texto: string) {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

/**
 * Diz se a descrição parece de algo vendido por comprimento.
 *
 * Olha só as três primeiras palavras de propósito: "alicate universal com cabo
 * isolado" contém "cabo", mas o produto é o alicate. O termo tem que estar no
 * começo, onde fica o substantivo principal.
 */
export function pareceVendidoPorMetro(descricao: string) {
  if (!descricao) return false;
  const inicio = semAcento(descricao).split(/\s+/).slice(0, 3).join(' ');
  return VENDIDOS_POR_METRO.some((termo) => inicio.includes(semAcento(termo)));
}
