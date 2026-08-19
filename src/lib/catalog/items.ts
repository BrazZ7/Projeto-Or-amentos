import type { CatalogItem } from './types';

// Sem preço de propósito: valor de compra e de venda variam por fornecedor,
// região e negociação. Um número sugerido aqui viraria orçamento errado lá.
export const CATALOG_ITEMS: CatalogItem[] = [
  // ---------------------------------------------------------------------------
  // Ferramentas manuais
  // ---------------------------------------------------------------------------
  { id: 'alicate-universal-8-vonder', name: 'Alicate universal 8 pol', brand: 'Vonder', category: 'FERRAMENTA_MANUAL', unit: 'un', description: 'Alicate universal 8 polegadas com cabo isolado.', ncm: '82032000', code: 'ALI-UNI-8-VND' },
  { id: 'alicate-universal-8-tramontina', name: 'Alicate universal 8 pol isolado 1000V', brand: 'Tramontina', category: 'FERRAMENTA_MANUAL', unit: 'un', description: 'Alicate universal isolado para trabalho em baixa tensão.', ncm: '82032000', code: 'ALI-UNI-8-TRA' },
  { id: 'alicate-universal-8-stanley', name: 'Alicate universal 8 pol', brand: 'Stanley', category: 'FERRAMENTA_MANUAL', unit: 'un', description: 'Alicate universal com mordente temperado.', ncm: '82032000', code: 'ALI-UNI-8-STA' },
  { id: 'alicate-corte-diagonal-6-vonder', name: 'Alicate de corte diagonal 6 pol', brand: 'Vonder', category: 'FERRAMENTA_MANUAL', unit: 'un', description: 'Alicate de corte diagonal para fios e cabos.', ncm: '82032000', code: 'ALI-COR-6-VND' },
  { id: 'alicate-corte-diagonal-6-dewalt', name: 'Alicate de corte diagonal 6 pol', brand: 'DeWalt', category: 'FERRAMENTA_MANUAL', unit: 'un', description: 'Alicate de corte diagonal com lâmina endurecida.', ncm: '82032000', code: 'ALI-COR-6-DW' },
  { id: 'alicate-bico-meia-cana-6-vonder', name: 'Alicate bico meia-cana 6 pol', brand: 'Vonder', category: 'FERRAMENTA_MANUAL', unit: 'un', description: 'Alicate de bico longo para trabalho em espaço reduzido.', ncm: '82032000', code: 'ALI-BIC-6-VND' },
  { id: 'alicate-bico-meia-cana-6-tramontina', name: 'Alicate bico meia-cana 6 pol isolado', brand: 'Tramontina', category: 'FERRAMENTA_MANUAL', unit: 'un', description: 'Alicate de bico isolado 1000V.', ncm: '82032000', code: 'ALI-BIC-6-TRA' },
  { id: 'alicate-prensa-terminal-vonder', name: 'Alicate prensa terminal', brand: 'Vonder', category: 'FERRAMENTA_MANUAL', unit: 'un', description: 'Para crimpagem de terminais tubulares e pré-isolados.', ncm: '82032000', code: 'ALI-PRE-VND' },
  { id: 'alicate-decapador-vonder', name: 'Alicate decapador de fios', brand: 'Vonder', category: 'FERRAMENTA_MANUAL', unit: 'un', description: 'Decapa condutores sem danificar o cobre.', ncm: '82032000', code: 'ALI-DEC-VND' },
  { id: 'alicate-rebitador-vonder', name: 'Alicate rebitador', brand: 'Vonder', category: 'FERRAMENTA_MANUAL', unit: 'un', description: 'Rebitador manual para rebites de repuxo.', ncm: '82032000', code: 'ALI-REB-VND' },
  { id: 'alicate-pressao-10-dewalt', name: 'Alicate de pressao 10 pol', brand: 'DeWalt', category: 'FERRAMENTA_MANUAL', unit: 'un', description: 'Alicate de pressao com ajuste rápido.', ncm: '82032000', code: 'ALI-PRS-10-DW' },
  { id: 'chave-fenda-jogo-vonder', name: 'Jogo de chaves de fenda e philips (6 peças)', brand: 'Vonder', category: 'FERRAMENTA_MANUAL', unit: 'jg', description: 'Jogo com pontas fenda e philips, cabo isolado.', ncm: '82054000', code: 'CHV-JG6-VND' },
  { id: 'chave-teste-tramontina', name: 'Chave teste 1000V', brand: 'Tramontina', category: 'FERRAMENTA_MANUAL', unit: 'un', description: 'Chave de teste neon para verificação de fase.', ncm: '82054000', code: 'CHV-TST-TRA' },
  { id: 'martelo-unha-vonder', name: 'Martelo unha 25mm com cabo', brand: 'Vonder', category: 'FERRAMENTA_MANUAL', unit: 'un', description: 'Martelo de unha com cabo de madeira.', ncm: '82052000', code: 'MAR-UNH-VND' },
  { id: 'trena-5m-stanley', name: 'Trena 5m', brand: 'Stanley', category: 'FERRAMENTA_MANUAL', unit: 'un', description: 'Trena de aço com trava e clipe.', ncm: '90178010', code: 'TRE-5M-STA' },
  { id: 'trena-8m-vonder', name: 'Trena 8m', brand: 'Vonder', category: 'FERRAMENTA_MANUAL', unit: 'un', description: 'Trena de aço 8 metros com trava.', ncm: '90178010', code: 'TRE-8M-VND' },
  { id: 'arco-serra-vonder', name: 'Arco de serra 12 pol', brand: 'Vonder', category: 'FERRAMENTA_MANUAL', unit: 'un', description: 'Arco de serra ajustável com lâmina.', ncm: '82024000', code: 'ARC-SER-VND' },
  { id: 'jogo-chave-allen-tramontina', name: 'Jogo de chaves Allen (9 peças)', brand: 'Tramontina', category: 'FERRAMENTA_MANUAL', unit: 'jg', description: 'Chaves hexagonais de 1,5 a 10mm.', ncm: '82040000', code: 'CHV-ALL-TRA' },

  // ---------------------------------------------------------------------------
  // Ferramentas elétricas
  // ---------------------------------------------------------------------------
  { id: 'furadeira-impacto-dewalt', name: 'Furadeira de impacto 1/2 pol 700W', brand: 'DeWalt', category: 'FERRAMENTA_ELETRICA', unit: 'un', description: 'Furadeira de impacto com velocidade variável e reversão.', ncm: '84672100', code: 'FUR-IMP-DW' },
  { id: 'furadeira-impacto-bosch', name: 'Furadeira de impacto 1/2 pol 650W', brand: 'Bosch', category: 'FERRAMENTA_ELETRICA', unit: 'un', description: 'Furadeira de impacto para alvenaria, madeira e metal.', ncm: '84672100', code: 'FUR-IMP-BSH' },
  { id: 'furadeira-impacto-vonder', name: 'Furadeira de impacto 1/2 pol 560W', brand: 'Vonder', category: 'FERRAMENTA_ELETRICA', unit: 'un', description: 'Furadeira de impacto de uso geral.', ncm: '84672100', code: 'FUR-IMP-VND' },
  { id: 'parafusadeira-12v-makita', name: 'Parafusadeira e furadeira a bateria 12V', brand: 'Makita', category: 'FERRAMENTA_ELETRICA', unit: 'un', description: 'Parafusadeira a bateria com maleta e carregador.', ncm: '84672100', code: 'PAR-12V-MKT' },
  { id: 'parafusadeira-20v-dewalt', name: 'Parafusadeira e furadeira a bateria 20V', brand: 'DeWalt', category: 'FERRAMENTA_ELETRICA', unit: 'un', description: 'Parafusadeira 20V com duas baterias.', ncm: '84672100', code: 'PAR-20V-DW' },
  { id: 'esmerilhadeira-45-bosch', name: 'Esmerilhadeira angular 4.1/2 pol 850W', brand: 'Bosch', category: 'FERRAMENTA_ELETRICA', unit: 'un', description: 'Esmerilhadeira angular para corte e desbaste.', ncm: '84672991', code: 'ESM-45-BSH' },
  { id: 'esmerilhadeira-45-vonder', name: 'Esmerilhadeira angular 4.1/2 pol 720W', brand: 'Vonder', category: 'FERRAMENTA_ELETRICA', unit: 'un', description: 'Esmerilhadeira angular de uso geral.', ncm: '84672991', code: 'ESM-45-VND' },
  { id: 'serra-marmore-makita', name: 'Serra mármore 4.3/8 pol 1200W', brand: 'Makita', category: 'FERRAMENTA_ELETRICA', unit: 'un', description: 'Serra mármore para corte de piso e revestimento.', ncm: '84672920', code: 'SER-MAR-MKT' },
  { id: 'martelete-sds-dewalt', name: 'Martelete perfurador rompedor SDS-Plus', brand: 'DeWalt', category: 'FERRAMENTA_ELETRICA', unit: 'un', description: 'Martelete SDS-Plus com três funcoes.', ncm: '84672100', code: 'MTL-SDS-DW' },
  { id: 'multimetro-digital-vonder', name: 'Multímetro digital', brand: 'Vonder', category: 'FERRAMENTA_ELETRICA', unit: 'un', description: 'Multímetro digital com medição de tensão, corrente e resistência.', ncm: '90304000', code: 'MUL-DIG-VND' },
  { id: 'alicate-amperimetro-minipa', name: 'Alicate amperímetro digital', brand: 'Minipa', category: 'FERRAMENTA_ELETRICA', unit: 'un', description: 'Alicate amperímetro para medição sem interromper o circuito.', ncm: '90304000', code: 'ALI-AMP-MNP' },

  // ---------------------------------------------------------------------------
  // Fios e cabos
  // ---------------------------------------------------------------------------
  { id: 'cabo-flex-15-sil', name: 'Cabo flexível 1,5mm2 750V', brand: 'Sil', category: 'FIO_CABO', unit: 'm', description: 'Cabo flexível de cobre 1,5mm2, isolação 750V.', ncm: '85444900', code: 'CAB-FLX-15-SIL' },
  { id: 'cabo-flex-25-sil', name: 'Cabo flexível 2,5mm2 750V', brand: 'Sil', category: 'FIO_CABO', unit: 'm', description: 'Cabo flexível de cobre 2,5mm2, isolação 750V.', ncm: '85444900', code: 'CAB-FLX-25-SIL' },
  { id: 'cabo-flex-40-sil', name: 'Cabo flexível 4mm2 750V', brand: 'Sil', category: 'FIO_CABO', unit: 'm', description: 'Cabo flexível de cobre 4mm2, isolação 750V.', ncm: '85444900', code: 'CAB-FLX-40-SIL' },
  { id: 'cabo-flex-60-cobrecom', name: 'Cabo flexível 6mm2 750V', brand: 'Cobrecom', category: 'FIO_CABO', unit: 'm', description: 'Cabo flexível de cobre 6mm2, isolação 750V.', ncm: '85444900', code: 'CAB-FLX-60-CBC' },
  { id: 'cabo-flex-100-cobrecom', name: 'Cabo flexível 10mm2 750V', brand: 'Cobrecom', category: 'FIO_CABO', unit: 'm', description: 'Cabo flexível de cobre 10mm2 para circuitos de maior carga.', ncm: '85444900', code: 'CAB-FLX-100-CBC' },
  { id: 'cabo-flex-160-nambei', name: 'Cabo flexível 16mm2 750V', brand: 'Nambei', category: 'FIO_CABO', unit: 'm', description: 'Cabo flexível de cobre 16mm2 para alimentação de quadros.', ncm: '85444900', code: 'CAB-FLX-160-NMB' },
  { id: 'cabo-pp-2x25-cobrecom', name: 'Cabo PP 2x2,5mm2', brand: 'Cobrecom', category: 'FIO_CABO', unit: 'm', description: 'Cabo PP de dois condutores, uso em extensoes e equipamentos.', ncm: '85444900', code: 'CAB-PP-2X25' },
  { id: 'cabo-pp-3x25-cobrecom', name: 'Cabo PP 3x2,5mm2', brand: 'Cobrecom', category: 'FIO_CABO', unit: 'm', description: 'Cabo PP de três condutores com neutro e terra.', ncm: '85444900', code: 'CAB-PP-3X25' },
  { id: 'cabo-coaxial-rg6-sil', name: 'Cabo coaxial RG6', brand: 'Sil', category: 'FIO_CABO', unit: 'm', description: 'Cabo coaxial RG6 com malha, para TV e CFTV.', ncm: '85442000', code: 'CAB-RG6-SIL' },
  { id: 'fio-rigido-25-prysmian', name: 'Fio rígido 2,5mm2 750V', brand: 'Prysmian', category: 'FIO_CABO', unit: 'm', description: 'Fio rígido de cobre 2,5mm2 para instalação embutida.', ncm: '85444900', code: 'FIO-RIG-25-PRY' },
  { id: 'cabo-cobre-nu-16', name: 'Cabo de cobre nu 16mm2', brand: 'Cobrecom', category: 'FIO_CABO', unit: 'm', description: 'Cabo de cobre nu para aterramento.', ncm: '85443000', code: 'CAB-NU-16' },

  // ---------------------------------------------------------------------------
  // Material elétrico
  // ---------------------------------------------------------------------------
  { id: 'disjuntor-mono-16-steck', name: 'Disjuntor monopolar 16A DIN', brand: 'Steck', category: 'MATERIAL_ELETRICO', unit: 'un', description: 'Disjuntor termomagnético monopolar curva C 16A.', ncm: '85362000', code: 'DIS-MO-16-STK' },
  { id: 'disjuntor-mono-20-steck', name: 'Disjuntor monopolar 20A DIN', brand: 'Steck', category: 'MATERIAL_ELETRICO', unit: 'un', description: 'Disjuntor termomagnético monopolar curva C 20A.', ncm: '85362000', code: 'DIS-MO-20-STK' },
  { id: 'disjuntor-mono-25-schneider', name: 'Disjuntor monopolar 25A DIN', brand: 'Schneider', category: 'MATERIAL_ELETRICO', unit: 'un', description: 'Disjuntor termomagnético monopolar curva C 25A.', ncm: '85362000', code: 'DIS-MO-25-SCH' },
  { id: 'disjuntor-bipolar-40-schneider', name: 'Disjuntor bipolar 40A DIN', brand: 'Schneider', category: 'MATERIAL_ELETRICO', unit: 'un', description: 'Disjuntor termomagnético bipolar curva C 40A.', ncm: '85362000', code: 'DIS-BI-40-SCH' },
  { id: 'dr-2p-40a-steck', name: 'Interruptor diferencial DR 2P 40A 30mA', brand: 'Steck', category: 'MATERIAL_ELETRICO', unit: 'un', description: 'Dispositivo diferencial residual bipolar.', ncm: '85362000', code: 'DR-2P-40-STK' },
  { id: 'dps-classe2-steck', name: 'DPS classe II 275V 20kA', brand: 'Steck', category: 'MATERIAL_ELETRICO', unit: 'un', description: 'Dispositivo de proteção contra surtos.', ncm: '85363000', code: 'DPS-CL2-STK' },
  { id: 'tomada-10a-tramontina', name: 'Tomada 2P+T 10A com placa', brand: 'Tramontina', category: 'MATERIAL_ELETRICO', unit: 'un', description: 'Conjunto tomada padrão brasileiro 10A com placa 4x2.', ncm: '85366990', code: 'TOM-10A-TRA' },
  { id: 'tomada-20a-pial', name: 'Tomada 2P+T 20A com placa', brand: 'Pial', category: 'MATERIAL_ELETRICO', unit: 'un', description: 'Conjunto tomada 20A para ar-condicionado e chuveiro.', ncm: '85366990', code: 'TOM-20A-PIA' },
  { id: 'interruptor-simples-tramontina', name: 'Interruptor simples com placa', brand: 'Tramontina', category: 'MATERIAL_ELETRICO', unit: 'un', description: 'Conjunto interruptor simples 10A com placa 4x2.', ncm: '85365090', code: 'INT-SIM-TRA' },
  { id: 'interruptor-paralelo-pial', name: 'Interruptor paralelo three-way com placa', brand: 'Pial', category: 'MATERIAL_ELETRICO', unit: 'un', description: 'Interruptor paralelo para acionamento em dois pontos.', ncm: '85365090', code: 'INT-PAR-PIA' },
  { id: 'caixa-luz-4x2-tigre', name: 'Caixa de luz 4x2 embutir', brand: 'Tigre', category: 'MATERIAL_ELETRICO', unit: 'un', description: 'Caixa de PVC 4x2 para embutir em alvenaria.', ncm: '39259090', code: 'CX-4X2-TIG' },
  { id: 'quadro-12-steck', name: 'Quadro de distribuição 12 disjuntores', brand: 'Steck', category: 'MATERIAL_ELETRICO', unit: 'un', description: 'Quadro de embutir para 12 disjuntores DIN com barramento.', ncm: '85381000', code: 'QDR-12-STK' },
  { id: 'eletroduto-corrugado-20-tigre', name: 'Eletroduto corrugado 20mm', brand: 'Tigre', category: 'MATERIAL_ELETRICO', unit: 'm', description: 'Eletroduto flexível corrugado para instalação embutida.', ncm: '39172300', code: 'ELD-COR-20-TIG' },
  { id: 'eletroduto-rigido-25-tigre', name: 'Eletroduto rígido PVC 25mm', brand: 'Tigre', category: 'MATERIAL_ELETRICO', unit: 'm', description: 'Eletroduto rígido roscável 3/4 pol.', ncm: '39172300', code: 'ELD-RIG-25-TIG' },
  { id: 'fita-isolante-3m', name: 'Fita isolante 19mm x 20m', brand: '3M', category: 'MATERIAL_ELETRICO', unit: 'un', description: 'Fita isolante autoextinguível para até 750V.', ncm: '39191000', code: 'FIT-ISO-3M' },
  { id: 'terminal-tubular-25', name: 'Terminal tubular 2,5mm2 (100 peças)', brand: 'Intelli', category: 'MATERIAL_ELETRICO', unit: 'pct', description: 'Terminais tubulares para crimpagem em cabo flexível.', ncm: '85369090', code: 'TRM-TUB-25' },
  { id: 'conector-emenda-wago', name: 'Conector de emenda 3 vias', brand: 'Wago', category: 'MATERIAL_ELETRICO', unit: 'un', description: 'Conector rápido para emenda de condutores.', ncm: '85369090', code: 'CON-EMD-3V' },
  { id: 'abracadeira-nylon-200', name: 'Abracadeira de nylon 200mm (100 peças)', brand: 'Vonder', category: 'MATERIAL_ELETRICO', unit: 'pct', description: 'Abracadeiras plásticas para organização de cabos.', ncm: '39239000', code: 'ABR-NYL-200' },

  // ---------------------------------------------------------------------------
  // Redes e ISP
  // ---------------------------------------------------------------------------
  { id: 'cabo-utp-cat6-furukawa', name: 'Cabo de rede UTP Cat6', brand: 'Furukawa', category: 'REDE_ISP', unit: 'm', description: 'Cabo UTP categoria 6 para cabeamento estruturado.', ncm: '85444900', code: 'UTP-CAT6-FUR' },
  { id: 'cabo-utp-cat5e-nexans', name: 'Cabo de rede UTP Cat5e', brand: 'Nexans', category: 'REDE_ISP', unit: 'm', description: 'Cabo UTP categoria 5e para rede local.', ncm: '85444900', code: 'UTP-CAT5E-NEX' },
  { id: 'cabo-drop-1fo-furukawa', name: 'Cabo drop óptico 1FO', brand: 'Furukawa', category: 'REDE_ISP', unit: 'm', description: 'Cabo drop de fibra óptica monomodo para atendimento externo.', ncm: '85447010', code: 'DROP-1FO-FUR' },
  { id: 'cabo-optico-12fo-furukawa', name: 'Cabo óptico 12FO monomodo', brand: 'Furukawa', category: 'REDE_ISP', unit: 'm', description: 'Cabo de fibra óptica de 12 fibras para backbone.', ncm: '85447010', code: 'OPT-12FO-FUR' },
  { id: 'conector-rj45-cat6', name: 'Conector RJ45 Cat6 (100 peças)', brand: 'Furukawa', category: 'REDE_ISP', unit: 'pct', description: 'Plugue RJ45 categoria 6 para crimpagem.', ncm: '85366990', code: 'RJ45-CAT6' },
  { id: 'alicate-crimpar-rj45-vonder', name: 'Alicate de crimpar RJ45 e RJ11', brand: 'Vonder', category: 'REDE_ISP', unit: 'un', description: 'Alicate para crimpagem de conectores de rede e telefonia.', ncm: '82032000', code: 'ALI-CRP-RJ45' },
  { id: 'keystone-cat6-furukawa', name: 'Keystone jack Cat6', brand: 'Furukawa', category: 'REDE_ISP', unit: 'un', description: 'Conector fêmea keystone categoria 6 para espelho.', ncm: '85366990', code: 'KEY-CAT6' },
  { id: 'patch-cord-25-cat6', name: 'Patch cord Cat6 2,5m', brand: 'Furukawa', category: 'REDE_ISP', unit: 'un', description: 'Cordão de manobra categoria 6 montado.', ncm: '85444200', code: 'PCH-25-CAT6' },
  { id: 'onu-gpon-intelbras', name: 'ONU/ONT GPON', brand: 'Intelbras', category: 'REDE_ISP', unit: 'un', description: 'Terminal óptico de assinante GPON com Wi-Fi.', ncm: '85176255', code: 'ONU-GPON-ITB' },
  { id: 'roteador-wifi6-tplink', name: 'Roteador Wi-Fi 6 dual band', brand: 'TP-Link', category: 'REDE_ISP', unit: 'un', description: 'Roteador Wi-Fi 6 para atendimento residencial.', ncm: '85176259', code: 'RTR-WIFI6-TPL' },
  { id: 'roteador-routerboard-mikrotik', name: 'Roteador RouterBoard', brand: 'Mikrotik', category: 'REDE_ISP', unit: 'un', description: 'Roteador com RouterOS para borda e roteamento.', ncm: '85176259', code: 'RTR-RB-MKT' },
  { id: 'switch-8p-intelbras', name: 'Switch 8 portas Gigabit', brand: 'Intelbras', category: 'REDE_ISP', unit: 'un', description: 'Switch não gerenciável de 8 portas 10/100/1000.', ncm: '85176259', code: 'SW-8P-ITB' },
  { id: 'switch-24p-poe-ubiquiti', name: 'Switch 24 portas Gigabit PoE+', brand: 'Ubiquiti', category: 'REDE_ISP', unit: 'un', description: 'Switch gerenciável de 24 portas com PoE+.', ncm: '85176259', code: 'SW-24P-POE' },
  { id: 'antena-setorial-5g-ubiquiti', name: 'Antena setorial 5GHz', brand: 'Ubiquiti', category: 'REDE_ISP', unit: 'un', description: 'Antena setorial para enlace ponto-multiponto.', ncm: '85177011', code: 'ANT-SET-5G' },
  { id: 'caixa-emenda-24fo', name: 'Caixa de emenda óptica 24FO', brand: 'Furukawa', category: 'REDE_ISP', unit: 'un', description: 'Caixa de emenda para fusão de fibras em rede externa.', ncm: '85369090', code: 'CX-EMD-24FO' },
  { id: 'splitter-1x8-furukawa', name: 'Splitter óptico 1x8', brand: 'Furukawa', category: 'REDE_ISP', unit: 'un', description: 'Divisor óptico balanceado 1x8 para rede GPON.', ncm: '85176299', code: 'SPL-1X8' },
  { id: 'pigtail-sc-apc-furukawa', name: 'Pigtail SC/APC (paçote)', brand: 'Furukawa', category: 'REDE_ISP', unit: 'pct', description: 'Pigtails para fusão em distribuidor óptico.', ncm: '85447010', code: 'PGT-SCAPC' },
  { id: 'dio-12p-furukawa', name: 'DIO 12 portas', brand: 'Furukawa', category: 'REDE_ISP', unit: 'un', description: 'Distribuidor interno óptico para rack 19 pol.', ncm: '85369090', code: 'DIO-12P' },
  { id: 'rack-19-12u-nazda', name: 'Rack 19 pol 12U', brand: 'Nazda', category: 'REDE_ISP', unit: 'un', description: 'Rack de parede 19 polegadas 12U com porta.', ncm: '85177099', code: 'RACK-12U' },
  { id: 'testador-cabo-intelbras', name: 'Testador de cabo de rede', brand: 'Intelbras', category: 'REDE_ISP', unit: 'un', description: 'Testador de continuidade para cabos RJ45 e RJ11.', ncm: '90308900', code: 'TST-CAB-ITB' },
];
