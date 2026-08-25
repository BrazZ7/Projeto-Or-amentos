import { describe, expect, it } from 'vitest';
import { UNIDADES, UNIDADES_DE_PRODUTO, pareceVendidoPorMetro, semAcento } from '@/lib/units';

describe('sugestao de cobrar por metro', () => {
  it('reconhece o que se vende por comprimento', () => {
    expect(pareceVendidoPorMetro('Fibra Optica')).toBe(true);
    expect(pareceVendidoPorMetro('Cabo drop óptico 1FO')).toBe(true);
    expect(pareceVendidoPorMetro('Fio flexível 2,5mm2')).toBe(true);
    expect(pareceVendidoPorMetro('Mangueira de jardim 3/4')).toBe(true);
    expect(pareceVendidoPorMetro('Eletroduto corrugado 25mm')).toBe(true);
  });

  it('ignora acento e caixa', () => {
    expect(pareceVendidoPorMetro('FIBRA ÓPTICA')).toBe(true);
    expect(pareceVendidoPorMetro('conduíte flexível')).toBe(true);
  });

  it('nao cai quando a palavra aparece longe do inicio', () => {
    // O produto e o alicate, nao o cabo: "cabo" aqui e o punho da ferramenta.
    expect(pareceVendidoPorMetro('Alicate universal 8 pol com cabo isolado')).toBe(false);
    expect(pareceVendidoPorMetro('Chave de fenda com cabo emborrachado')).toBe(false);
  });

  it('nao sugere para peca avulsa nem servico', () => {
    expect(pareceVendidoPorMetro('Conector SC/APC')).toBe(false);
    expect(pareceVendidoPorMetro('Câmera Wi-Fi motorizada')).toBe(false);
    expect(pareceVendidoPorMetro('Instalação de tomada')).toBe(false);
  });

  it('aguenta descricao vazia', () => {
    expect(pareceVendidoPorMetro('')).toBe(false);
    expect(pareceVendidoPorMetro('   ')).toBe(false);
  });
});

describe('unidades', () => {
  it('tem metro e unidade na lista', () => {
    expect(UNIDADES).toContain('m');
    expect(UNIDADES).toContain('un');
  });

  it('nao oferece hora no cadastro de produto, que e servico', () => {
    expect(UNIDADES).toContain('h');
    expect(UNIDADES_DE_PRODUTO).not.toContain('h');
  });

  it('semAcento normaliza para comparacao', () => {
    expect(semAcento('Óptico')).toBe('optico');
    expect(semAcento('CONDUÍTE')).toBe('conduite');
  });
});
