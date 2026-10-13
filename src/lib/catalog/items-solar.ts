import type { CatalogItem } from './types';

/**
 * Energia solar fotovoltaica: módulo, inversor, estrutura, cabo CC, proteção e
 * armazenamento.
 *
 * A potência aparece no nome do módulo e do inversor porque é por ela que o
 * item é pedido e cotado. Já rendimento, número de células e faixa de tensão
 * ficam de fora: variam por lote e revisão do mesmo modelo, e o datasheet do
 * fornecedor é a fonte correta na hora de dimensionar.
 *
 * O dimensionamento em si continua sendo trabalho do projetista — este catálogo
 * agiliza o cadastro, não substitui cálculo de string, sombreamento ou
 * compatibilidade entre módulo e inversor.
 */
export const CATALOG_ITEMS_SOLAR: CatalogItem[] = [
  // ---------------------------------------------------------------------------
  // Módulos fotovoltaicos
  // ---------------------------------------------------------------------------
  { id: 'modulo-canadian-550w', name: 'Módulo fotovoltaico 550W monocristalino', brand: 'Canadian Solar', category: 'SOLAR', unit: 'un', description: 'Módulo monocristalino half-cell para sistema conectado à rede.', ncm: '85414300', code: 'MOD-CAN-550', keywords: 'painel solar placa fotovoltaica painel fotovoltaico' },
  { id: 'modulo-canadian-585w', name: 'Módulo fotovoltaico 585W monocristalino', brand: 'Canadian Solar', category: 'SOLAR', unit: 'un', description: 'Módulo monocristalino de alta potência para telhado e solo.', ncm: '85414300', code: 'MOD-CAN-585', keywords: 'painel solar placa fotovoltaica painel fotovoltaico' },
  { id: 'modulo-jinko-550w', name: 'Módulo fotovoltaico 550W Tiger Neo', brand: 'Jinko Solar', category: 'SOLAR', unit: 'un', description: 'Módulo monocristalino tipo N com célula half-cell.', ncm: '85414300', code: 'MOD-JKO-550', keywords: 'painel solar placa fotovoltaica painel fotovoltaico' },
  { id: 'modulo-jinko-610w', name: 'Módulo fotovoltaico 610W Tiger Neo', brand: 'Jinko Solar', category: 'SOLAR', unit: 'un', description: 'Módulo de alta potência para usina e geração distribuída.', ncm: '85414300', code: 'MOD-JKO-610', keywords: 'painel solar placa fotovoltaica painel fotovoltaico' },
  { id: 'modulo-trina-550w', name: 'Módulo fotovoltaico 550W Vertex', brand: 'Trina Solar', category: 'SOLAR', unit: 'un', description: 'Módulo monocristalino half-cell para sistema on-grid.', ncm: '85414300', code: 'MOD-TRI-550', keywords: 'painel solar placa fotovoltaica painel fotovoltaico' },
  { id: 'modulo-ja-solar-560w', name: 'Módulo fotovoltaico 560W DeepBlue', brand: 'JA Solar', category: 'SOLAR', unit: 'un', description: 'Módulo monocristalino para instalação residencial e comercial.', ncm: '85414300', code: 'MOD-JAS-560', keywords: 'painel solar placa fotovoltaica painel fotovoltaico' },
  { id: 'modulo-longi-570w', name: 'Módulo fotovoltaico 570W Hi-MO', brand: 'Longi', category: 'SOLAR', unit: 'un', description: 'Módulo monocristalino de alta eficiência.', ncm: '85414300', code: 'MOD-LON-570', keywords: 'painel solar placa fotovoltaica painel fotovoltaico' },
  { id: 'modulo-risen-550w', name: 'Módulo fotovoltaico 550W', brand: 'Risen', category: 'SOLAR', unit: 'un', description: 'Módulo monocristalino half-cell.', ncm: '85414300', code: 'MOD-RIS-550', keywords: 'painel solar placa fotovoltaica painel fotovoltaico' },
  { id: 'modulo-dah-solar-600w', name: 'Módulo fotovoltaico 600W full black', brand: 'DAH Solar', category: 'SOLAR', unit: 'un', description: 'Módulo com moldura e fundo pretos, para telhado aparente.', ncm: '85414300', code: 'MOD-DAH-600', keywords: 'painel solar placa fotovoltaica painel fotovoltaico' },

  // ---------------------------------------------------------------------------
  // Inversores on-grid
  // ---------------------------------------------------------------------------
  { id: 'inversor-growatt-3kw', name: 'Inversor on-grid 3kW monofásico', brand: 'Growatt', category: 'SOLAR', unit: 'un', description: 'Inversor string monofásico 220V para sistema residencial.', ncm: '85044090', code: 'INV-GRW-3K' },
  { id: 'inversor-growatt-5kw', name: 'Inversor on-grid 5kW monofásico', brand: 'Growatt', category: 'SOLAR', unit: 'un', description: 'Inversor string monofásico com duas entradas MPPT.', ncm: '85044090', code: 'INV-GRW-5K' },
  { id: 'inversor-growatt-10kw', name: 'Inversor on-grid 10kW trifásico', brand: 'Growatt', category: 'SOLAR', unit: 'un', description: 'Inversor string trifásico 380V para sistema comercial.', ncm: '85044090', code: 'INV-GRW-10K' },
  { id: 'inversor-solis-5kw', name: 'Inversor on-grid 5kW monofásico', brand: 'Solis', category: 'SOLAR', unit: 'un', description: 'Inversor string monofásico com monitoramento integrado.', ncm: '85044090', code: 'INV-SOL-5K' },
  { id: 'inversor-sungrow-8kw', name: 'Inversor on-grid 8kW trifásico', brand: 'Sungrow', category: 'SOLAR', unit: 'un', description: 'Inversor string trifásico para geração distribuída.', ncm: '85044090', code: 'INV-SUN-8K' },
  { id: 'inversor-fronius-8kw', name: 'Inversor on-grid 8kW trifásico Primo', brand: 'Fronius', category: 'SOLAR', unit: 'un', description: 'Inversor string trifásico com monitoramento por rede.', ncm: '85044090', code: 'INV-FRO-8K' },
  { id: 'inversor-goodwe-6kw', name: 'Inversor on-grid 6kW monofásico', brand: 'GoodWe', category: 'SOLAR', unit: 'un', description: 'Inversor string monofásico com duas MPPT.', ncm: '85044090', code: 'INV-GWE-6K' },
  { id: 'inversor-sma-5kw', name: 'Inversor on-grid 5kW Sunny Boy', brand: 'SMA', category: 'SOLAR', unit: 'un', description: 'Inversor string monofásico para sistema residencial.', ncm: '85044090', code: 'INV-SMA-5K' },

  // ---------------------------------------------------------------------------
  // Microinversores e híbridos
  // ---------------------------------------------------------------------------
  { id: 'micro-hoymiles-hms-2000', name: 'Microinversor HMS-2000 (4 módulos)', brand: 'Hoymiles', category: 'SOLAR', unit: 'un', description: 'Microinversor para até quatro módulos, indicado para telhado com sombreamento.', ncm: '85044090', code: 'MIC-HOY-2000' },
  { id: 'micro-hoymiles-hms-800', name: 'Microinversor HMS-800 (2 módulos)', brand: 'Hoymiles', category: 'SOLAR', unit: 'un', description: 'Microinversor para dois módulos, sistema pequeno ou ampliação.', ncm: '85044090', code: 'MIC-HOY-800' },
  { id: 'micro-apsystems-ds3', name: 'Microinversor DS3 (2 módulos)', brand: 'APsystems', category: 'SOLAR', unit: 'un', description: 'Microinversor de dois canais com monitoramento por módulo.', ncm: '85044090', code: 'MIC-APS-DS3' },
  { id: 'micro-deye-sun-2000', name: 'Microinversor SUN-2000G (4 módulos)', brand: 'Deye', category: 'SOLAR', unit: 'un', description: 'Microinversor para quatro módulos com Wi-Fi integrado.', ncm: '85044090', code: 'MIC-DEY-2000' },
  { id: 'inversor-hibrido-deye-5kw', name: 'Inversor híbrido 5kW', brand: 'Deye', category: 'SOLAR', unit: 'un', description: 'Inversor híbrido com entrada para bateria e saída de backup.', ncm: '85044090', code: 'INV-HIB-DEY-5K' },
  { id: 'inversor-hibrido-growatt-5kw', name: 'Inversor híbrido 5kW SPH', brand: 'Growatt', category: 'SOLAR', unit: 'un', description: 'Inversor híbrido para sistema com armazenamento.', ncm: '85044090', code: 'INV-HIB-GRW-5K' },
  { id: 'inversor-offgrid-epever-3kw', name: 'Inversor off-grid 3kW', brand: 'Epever', category: 'SOLAR', unit: 'un', description: 'Inversor autônomo com carregador para sistema isolado.', ncm: '85044090', code: 'INV-OFF-EPV-3K' },
  { id: 'controlador-carga-mppt-60a', name: 'Controlador de carga MPPT 60A', brand: 'Epever', category: 'SOLAR', unit: 'un', description: 'Controlador MPPT para sistema off-grid com banco de baterias.', ncm: '90328990', code: 'CTR-MPPT-60A' },

  // ---------------------------------------------------------------------------
  // Estrutura de fixação
  // ---------------------------------------------------------------------------
  { id: 'perfil-aluminio-solar-4m', name: 'Perfil de alumínio para módulo 4,20m', brand: 'Romagnole', category: 'SOLAR', unit: 'un', description: 'Trilho de alumínio para fixação de módulos em telhado.', ncm: '76109000', code: 'EST-PERF-420', keywords: 'trilho suporte estrutura' },
  { id: 'perfil-aluminio-solar-6m', name: 'Perfil de alumínio para módulo 6,30m', brand: 'Romagnole', category: 'SOLAR', unit: 'un', description: 'Trilho de alumínio de maior vão para estrutura fotovoltaica.', ncm: '76109000', code: 'EST-PERF-630', keywords: 'trilho suporte estrutura' },
  { id: 'emenda-perfil-aluminio', name: 'Emenda para perfil de alumínio', brand: 'Romagnole', category: 'SOLAR', unit: 'un', description: 'Junta de união entre trilhos da estrutura.', ncm: '76109000', code: 'EST-EMD-PERF' },
  { id: 'grampo-intermediario-35', name: 'Grampo intermediário 35mm', brand: 'Romagnole', category: 'SOLAR', unit: 'un', description: 'Fixador entre dois módulos vizinhos no trilho.', ncm: '76109000', code: 'EST-GRP-INT35' },
  { id: 'grampo-final-35', name: 'Grampo final 35mm', brand: 'Romagnole', category: 'SOLAR', unit: 'un', description: 'Fixador da extremidade da fileira de módulos.', ncm: '76109000', code: 'EST-GRP-FIN35' },
  { id: 'gancho-telha-ceramica', name: 'Gancho para telha cerâmica', brand: 'Solar Group', category: 'SOLAR', unit: 'un', description: 'Suporte de aço inox para fixar o trilho sob telha cerâmica.', ncm: '73181500', code: 'EST-GAN-CER' },
  { id: 'suporte-telha-fibrocimento', name: 'Suporte para telha de fibrocimento', brand: 'Solar Group', category: 'SOLAR', unit: 'un', description: 'Parafuso prisioneiro com vedação para telha ondulada.', ncm: '73181500', code: 'EST-SUP-FIB' },
  { id: 'suporte-telha-metalica', name: 'Suporte para telha metálica trapezoidal', brand: 'Solar Group', category: 'SOLAR', unit: 'un', description: 'Fixador com vedação para telhado metálico.', ncm: '73181500', code: 'EST-SUP-MET' },
  { id: 'estrutura-solo-2-modulos', name: 'Estrutura de solo para 2 módulos', brand: 'PratyC', category: 'SOLAR', unit: 'un', description: 'Conjunto de suporte para instalação em solo.', ncm: '76109000', code: 'EST-SOLO-2M' },
  { id: 'parafuso-inox-solar', name: 'Parafuso inox para estrutura solar (50 peças)', brand: 'Ciser', category: 'SOLAR', unit: 'pct', description: 'Parafusos de aço inox para montagem de estrutura fotovoltaica.', ncm: '73181500', code: 'EST-PAR-INOX' },

  // ---------------------------------------------------------------------------
  // Cabos e conectores de corrente contínua
  // ---------------------------------------------------------------------------
  { id: 'cabo-solar-4mm-preto', name: 'Cabo solar 4mm2 1500V preto', brand: 'Cobrecom', category: 'SOLAR', unit: 'm', description: 'Cabo fotovoltaico com dupla isolação e resistência a UV.', ncm: '85444900', code: 'CAB-SOL-4-PT' },
  { id: 'cabo-solar-4mm-vermelho', name: 'Cabo solar 4mm2 1500V vermelho', brand: 'Cobrecom', category: 'SOLAR', unit: 'm', description: 'Cabo fotovoltaico para o polo positivo da string.', ncm: '85444900', code: 'CAB-SOL-4-VM' },
  { id: 'cabo-solar-6mm-preto', name: 'Cabo solar 6mm2 1500V preto', brand: 'Prysmian', category: 'SOLAR', unit: 'm', description: 'Cabo fotovoltaico de maior seção para string longa.', ncm: '85444900', code: 'CAB-SOL-6-PT' },
  { id: 'conector-mc4-par', name: 'Conector MC4 (par)', brand: 'Staubli', category: 'SOLAR', unit: 'par', description: 'Conector fotovoltaico macho e fêmea para cabo solar.', ncm: '85366990', code: 'CON-MC4-PAR' },
  { id: 'conector-mc4-y', name: 'Conector MC4 tipo Y (par)', brand: 'Staubli', category: 'SOLAR', unit: 'par', description: 'Conector de derivação para paralelismo de strings.', ncm: '85366990', code: 'CON-MC4-Y' },
  { id: 'alicate-crimpar-mc4', name: 'Alicate de crimpar MC4', brand: 'Vonder', category: 'SOLAR', unit: 'un', description: 'Alicate para crimpagem de terminais de conector fotovoltaico.', ncm: '82032000', code: 'ALI-CRP-MC4' },

  // ---------------------------------------------------------------------------
  // Proteção e medição
  // ---------------------------------------------------------------------------
  { id: 'string-box-1e-1s', name: 'String box CC 1 entrada 1 saída', brand: 'Clamper', category: 'SOLAR', unit: 'un', description: 'Caixa de proteção CC com DPS e seccionadora para uma string.', ncm: '85371090', code: 'STB-1E1S-CLP' },
  { id: 'string-box-2e-1s', name: 'String box CC 2 entradas 1 saída', brand: 'Clamper', category: 'SOLAR', unit: 'un', description: 'Caixa de proteção CC para duas strings.', ncm: '85371090', code: 'STB-2E1S-CLP' },
  { id: 'dps-cc-1000v', name: 'DPS corrente contínua 1000V', brand: 'Clamper', category: 'SOLAR', unit: 'un', description: 'Protetor de surto para o lado CC do sistema fotovoltaico.', ncm: '85363000', code: 'DPS-CC-1000' },
  { id: 'dps-ca-solar', name: 'DPS corrente alternada para inversor', brand: 'Steck', category: 'SOLAR', unit: 'un', description: 'Protetor de surto para o lado CA, entre inversor e quadro.', ncm: '85363000', code: 'DPS-CA-SOL' },
  { id: 'seccionadora-cc-32a', name: 'Chave seccionadora CC 32A 1000V', brand: 'Soprano', category: 'SOLAR', unit: 'un', description: 'Seccionadora para manobra e manutenção do lado CC.', ncm: '85365090', code: 'SEC-CC-32A' },
  { id: 'disjuntor-cc-20a', name: 'Disjuntor CC 20A 1000V', brand: 'Soprano', category: 'SOLAR', unit: 'un', description: 'Disjuntor específico para corrente contínua fotovoltaica.', ncm: '85362000', code: 'DIS-CC-20A' },
  { id: 'smart-meter-growatt', name: 'Smart meter para inversor', brand: 'Growatt', category: 'SOLAR', unit: 'un', description: 'Medidor de energia para controle de injeção e monitoramento.', ncm: '90283011', code: 'MED-SMT-GRW' },
  { id: 'datalogger-wifi-solar', name: 'Datalogger Wi-Fi para inversor', brand: 'Growatt', category: 'SOLAR', unit: 'un', description: 'Módulo de comunicação para monitoramento remoto da geração.', ncm: '85176299', code: 'DTL-WIFI-GRW' },

  // ---------------------------------------------------------------------------
  // Armazenamento
  // ---------------------------------------------------------------------------
  { id: 'bateria-litio-pylontech-5kwh', name: 'Bateria de lítio 5kWh', brand: 'Pylontech', category: 'SOLAR', unit: 'un', description: 'Bateria LiFePO4 para sistema híbrido com backup.', ncm: '85076000', code: 'BAT-LI-PYL-5' },
  { id: 'bateria-litio-byd-10kwh', name: 'Bateria de lítio 10kWh', brand: 'BYD', category: 'SOLAR', unit: 'un', description: 'Módulo de armazenamento LiFePO4 para residência.', ncm: '85076000', code: 'BAT-LI-BYD-10' },
  { id: 'bateria-estacionaria-220ah', name: 'Bateria estacionária 220Ah', brand: 'Moura', category: 'SOLAR', unit: 'un', description: 'Bateria chumbo-ácido estacionária para sistema off-grid.', ncm: '85072010', code: 'BAT-EST-220' },
  { id: 'bateria-estacionaria-150ah-freedom', name: 'Bateria estacionária 150Ah', brand: 'Freedom', category: 'SOLAR', unit: 'un', description: 'Bateria estacionária de ciclo profundo para banco off-grid.', ncm: '85072010', code: 'BAT-EST-150' },
];
