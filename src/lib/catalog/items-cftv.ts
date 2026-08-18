import type { CatalogItem } from './types';

/**
 * CFTV, cabo de rede e conectores.
 *
 * Os nomes trazem o modelo porque é assim que o instalador procura o item — no
 * balcão se pede "VHD 1220" e não "câmera bullet". As descrições ficam no nível
 * da função, sem cravar alcance de infravermelho, resolução ou taxa de quadros:
 * fabricante troca especificação entre revisões do mesmo modelo, e um número
 * errado aqui viraria orçamento errado. Confirme a ficha com o fornecedor.
 */
export const CATALOG_ITEMS_CFTV: CatalogItem[] = [
  // ---------------------------------------------------------------------------
  // Câmeras — Intelbras
  // ---------------------------------------------------------------------------
  { id: 'cam-intelbras-vhd-1120-b', name: 'Câmera bullet VHD 1120 B G7', brand: 'Intelbras', category: 'CFTV', unit: 'un', description: 'Câmera bullet analógica HD com infravermelho, uso interno e externo.', ncm: '85258990', code: 'CAM-VHD1120B' },
  { id: 'cam-intelbras-vhd-1220-b', name: 'Câmera bullet VHD 1220 B G7', brand: 'Intelbras', category: 'CFTV', unit: 'un', description: 'Câmera bullet analógica Full HD com infravermelho.', ncm: '85258990', code: 'CAM-VHD1220B' },
  { id: 'cam-intelbras-vhd-1220-d', name: 'Câmera dome VHD 1220 D G7', brand: 'Intelbras', category: 'CFTV', unit: 'un', description: 'Câmera dome analógica Full HD para ambiente interno.', ncm: '85258990', code: 'CAM-VHD1220D' },
  { id: 'cam-intelbras-vhd-3230-b', name: 'Câmera bullet VHD 3230 B', brand: 'Intelbras', category: 'CFTV', unit: 'un', description: 'Câmera bullet analógica com lente varifocal e infravermelho de longo alcance.', ncm: '85258990', code: 'CAM-VHD3230B' },
  { id: 'cam-intelbras-vip-1230-b', name: 'Câmera IP bullet VIP 1230 B', brand: 'Intelbras', category: 'CFTV', unit: 'un', description: 'Câmera IP bullet Full HD com PoE.', ncm: '85258990', code: 'CAM-VIP1230B' },
  { id: 'cam-intelbras-vip-1230-d', name: 'Câmera IP dome VIP 1230 D', brand: 'Intelbras', category: 'CFTV', unit: 'un', description: 'Câmera IP dome Full HD com PoE para ambiente interno.', ncm: '85258990', code: 'CAM-VIP1230D' },
  { id: 'cam-intelbras-vip-3230-b', name: 'Câmera IP bullet VIP 3230 B', brand: 'Intelbras', category: 'CFTV', unit: 'un', description: 'Câmera IP bullet com inteligência de vídeo e PoE.', ncm: '85258990', code: 'CAM-VIP3230B' },
  { id: 'cam-intelbras-im5-sc', name: 'Câmera Wi-Fi interna iM5 SC', brand: 'Intelbras', category: 'CFTV', unit: 'un', description: 'Câmera Wi-Fi interna com áudio e cartão microSD, controle pelo app Mibo.', ncm: '85258990', code: 'CAM-IM5SC' },
  { id: 'cam-intelbras-im7', name: 'Câmera Wi-Fi motorizada iM7', brand: 'Intelbras', category: 'CFTV', unit: 'un', description: 'Câmera Wi-Fi interna motorizada com rotação horizontal e vertical.', ncm: '85258990', code: 'CAM-IM7' },
  { id: 'cam-intelbras-ex-wifi', name: 'Câmera Wi-Fi externa IM6 EX', brand: 'Intelbras', category: 'CFTV', unit: 'un', description: 'Câmera Wi-Fi para área externa com proteção contra intempéries.', ncm: '85258990', code: 'CAM-IM6EX' },
  { id: 'cam-intelbras-speed-dome', name: 'Speed dome VHD 3220 SD', brand: 'Intelbras', category: 'CFTV', unit: 'un', description: 'Câmera speed dome com zoom óptico e movimentação motorizada.', ncm: '85258990', code: 'CAM-SD3220' },

  // ---------------------------------------------------------------------------
  // Câmeras — Hikvision e outras marcas
  // ---------------------------------------------------------------------------
  { id: 'cam-hikvision-ds2ce16d0t', name: 'Câmera bullet DS-2CE16D0T-IRF', brand: 'Hikvision', category: 'CFTV', unit: 'un', description: 'Câmera bullet analógica Full HD com infravermelho.', ncm: '85258990', code: 'CAM-2CE16D0T' },
  { id: 'cam-hikvision-ds2ce56d0t', name: 'Câmera dome DS-2CE56D0T-IRF', brand: 'Hikvision', category: 'CFTV', unit: 'un', description: 'Câmera dome analógica Full HD para ambiente interno.', ncm: '85258990', code: 'CAM-2CE56D0T' },
  { id: 'cam-hikvision-ds2cd1043g0', name: 'Câmera IP bullet DS-2CD1043G0-I', brand: 'Hikvision', category: 'CFTV', unit: 'un', description: 'Câmera IP bullet 4MP com PoE.', ncm: '85258990', code: 'CAM-2CD1043' },
  { id: 'cam-hikvision-ds2cd1143g0', name: 'Câmera IP dome DS-2CD1143G0-I', brand: 'Hikvision', category: 'CFTV', unit: 'un', description: 'Câmera IP dome 4MP com PoE.', ncm: '85258990', code: 'CAM-2CD1143' },
  { id: 'cam-hikvision-colorvu', name: 'Câmera bullet ColorVu', brand: 'Hikvision', category: 'CFTV', unit: 'un', description: 'Câmera com imagem colorida em baixa luminosidade e iluminador branco.', ncm: '85258990', code: 'CAM-COLORVU' },
  { id: 'cam-ezviz-c3n', name: 'Câmera Wi-Fi externa C3N', brand: 'Ezviz', category: 'CFTV', unit: 'un', description: 'Câmera Wi-Fi externa com visão noturna colorida.', ncm: '85258990', code: 'CAM-EZ-C3N' },
  { id: 'cam-icsee-wifi-robo', name: 'Câmera Wi-Fi robô iCSee', brand: 'iCSee', category: 'CFTV', unit: 'un', description: 'Câmera Wi-Fi motorizada com app iCSee, cartão microSD e áudio.', ncm: '85258990', code: 'CAM-ICSEE-ROB' },
  { id: 'cam-icsee-solar', name: 'Câmera Wi-Fi solar iCSee', brand: 'iCSee', category: 'CFTV', unit: 'un', description: 'Câmera Wi-Fi com painel solar e bateria, para local sem tomada.', ncm: '85258990', code: 'CAM-ICSEE-SOL' },
  { id: 'cam-tapo-c200', name: 'Câmera Wi-Fi Tapo C200', brand: 'TP-Link', category: 'CFTV', unit: 'un', description: 'Câmera Wi-Fi interna motorizada com detecção de movimento.', ncm: '85258990', code: 'CAM-TAPO-C200' },
  { id: 'cam-multilaser-wifi', name: 'Câmera Wi-Fi interna', brand: 'Multilaser', category: 'CFTV', unit: 'un', description: 'Câmera Wi-Fi de baixo custo para monitoramento interno.', ncm: '85258990', code: 'CAM-MTL-WIFI' },

  // ---------------------------------------------------------------------------
  // Gravadores
  // ---------------------------------------------------------------------------
  { id: 'dvr-intelbras-mhdx-1104', name: 'DVR MHDX 1104 (4 canais)', brand: 'Intelbras', category: 'CFTV', unit: 'un', description: 'Gravador multi-HD de 4 canais para câmeras analógicas e IP.', ncm: '85219090', code: 'DVR-MHDX1104' },
  { id: 'dvr-intelbras-mhdx-1108', name: 'DVR MHDX 1108 (8 canais)', brand: 'Intelbras', category: 'CFTV', unit: 'un', description: 'Gravador multi-HD de 8 canais para câmeras analógicas e IP.', ncm: '85219090', code: 'DVR-MHDX1108' },
  { id: 'dvr-intelbras-mhdx-3116', name: 'DVR MHDX 3116 (16 canais)', brand: 'Intelbras', category: 'CFTV', unit: 'un', description: 'Gravador multi-HD de 16 canais com detecção inteligente.', ncm: '85219090', code: 'DVR-MHDX3116' },
  { id: 'nvr-intelbras-nvd-1408', name: 'NVR NVD 1408 (8 canais)', brand: 'Intelbras', category: 'CFTV', unit: 'un', description: 'Gravador de rede para câmeras IP, 8 canais.', ncm: '85219090', code: 'NVR-NVD1408' },
  { id: 'nvr-intelbras-nvd-1432-poe', name: 'NVR NVD 1432 PoE (32 canais)', brand: 'Intelbras', category: 'CFTV', unit: 'un', description: 'Gravador de rede com portas PoE integradas.', ncm: '85219090', code: 'NVR-NVD1432' },
  { id: 'dvr-hikvision-ds7204', name: 'DVR DS-7204HGHI (4 canais)', brand: 'Hikvision', category: 'CFTV', unit: 'un', description: 'Gravador digital híbrido de 4 canais.', ncm: '85219090', code: 'DVR-7204HGHI' },
  { id: 'nvr-hikvision-ds7608', name: 'NVR DS-7608NI (8 canais)', brand: 'Hikvision', category: 'CFTV', unit: 'un', description: 'Gravador de rede de 8 canais para câmeras IP.', ncm: '85219090', code: 'NVR-7608NI' },

  // ---------------------------------------------------------------------------
  // Armazenamento e alimentação
  // ---------------------------------------------------------------------------
  { id: 'hd-wd-purple-1tb', name: 'HD WD Purple 1TB', brand: 'Western Digital', category: 'CFTV', unit: 'un', description: 'Disco rígido para gravação contínua em DVR e NVR.', ncm: '84717012', code: 'HD-PUR-1TB' },
  { id: 'hd-wd-purple-2tb', name: 'HD WD Purple 2TB', brand: 'Western Digital', category: 'CFTV', unit: 'un', description: 'Disco rígido para videovigilância, gravação 24 horas.', ncm: '84717012', code: 'HD-PUR-2TB' },
  { id: 'hd-wd-purple-4tb', name: 'HD WD Purple 4TB', brand: 'Western Digital', category: 'CFTV', unit: 'un', description: 'Disco rígido de alta capacidade para CFTV.', ncm: '84717012', code: 'HD-PUR-4TB' },
  { id: 'hd-seagate-skyhawk-2tb', name: 'HD Seagate SkyHawk 2TB', brand: 'Seagate', category: 'CFTV', unit: 'un', description: 'Disco rígido para sistemas de vigilância.', ncm: '84717012', code: 'HD-SKY-2TB' },
  { id: 'fonte-12v-1a', name: 'Fonte 12V 1A', brand: 'Intelbras', category: 'CFTV', unit: 'un', description: 'Fonte chaveada 12V para alimentar uma câmera.', ncm: '85044090', code: 'FNT-12V-1A' },
  { id: 'fonte-12v-2a', name: 'Fonte 12V 2A', brand: 'Intelbras', category: 'CFTV', unit: 'un', description: 'Fonte chaveada 12V 2A para câmera com infravermelho.', ncm: '85044090', code: 'FNT-12V-2A' },
  { id: 'fonte-colmeia-12v-10a', name: 'Fonte colmeia 12V 10A', brand: 'Intelbras', category: 'CFTV', unit: 'un', description: 'Fonte de distribuição para alimentar várias câmeras num ponto.', ncm: '85044090', code: 'FNT-COL-10A' },
  { id: 'fonte-colmeia-12v-20a', name: 'Fonte colmeia 12V 20A', brand: 'Multilaser', category: 'CFTV', unit: 'un', description: 'Fonte de distribuição de maior corrente para CFTV.', ncm: '85044090', code: 'FNT-COL-20A' },
  { id: 'switch-poe-4p-intelbras', name: 'Switch PoE 4 portas SF 500', brand: 'Intelbras', category: 'CFTV', unit: 'un', description: 'Switch com PoE para alimentar câmeras IP pelo cabo de rede.', ncm: '85176259', code: 'SW-POE-4P' },
  { id: 'switch-poe-8p-intelbras', name: 'Switch PoE 8 portas', brand: 'Intelbras', category: 'CFTV', unit: 'un', description: 'Switch PoE de 8 portas para instalação de câmeras IP.', ncm: '85176259', code: 'SW-POE-8P' },

  // ---------------------------------------------------------------------------
  // Acessórios de instalação CFTV
  // ---------------------------------------------------------------------------
  { id: 'balun-passivo-par', name: 'Video balun passivo (par)', brand: 'Intelbras', category: 'CFTV', unit: 'par', description: 'Conversor que leva o sinal de vídeo analógico por cabo de rede.', ncm: '85176299', code: 'BAL-PAS-PAR' },
  { id: 'balun-passivo-borne', name: 'Video balun passivo com borne (par)', brand: 'Multilaser', category: 'CFTV', unit: 'par', description: 'Balun com conexão por borne, dispensa solda.', ncm: '85176299', code: 'BAL-BOR-PAR' },
  { id: 'conector-bnc-mola', name: 'Conector BNC mola (par)', brand: 'Intelbras', category: 'CFTV', unit: 'par', description: 'Conector BNC de encaixe por mola para cabo coaxial.', ncm: '85366990', code: 'CON-BNC-MOL' },
  { id: 'conector-bnc-borne', name: 'Conector BNC com borne (par)', brand: 'Multilaser', category: 'CFTV', unit: 'par', description: 'Conector BNC com parafuso, para instalação sem solda.', ncm: '85366990', code: 'CON-BNC-BOR' },
  { id: 'conector-p4-macho', name: 'Plug P4 macho com borne (10 peças)', brand: 'Multilaser', category: 'CFTV', unit: 'pct', description: 'Conector de alimentação P4 macho para câmera.', ncm: '85366990', code: 'CON-P4-MAC' },
  { id: 'conector-p4-femea', name: 'Plug P4 fêmea com borne (10 peças)', brand: 'Multilaser', category: 'CFTV', unit: 'pct', description: 'Conector de alimentação P4 fêmea para fonte.', ncm: '85366990', code: 'CON-P4-FEM' },
  { id: 'cabo-cftv-coaxial-bipolar', name: 'Cabo CFTV coaxial com bipolar 4mm', brand: 'Sil', category: 'CFTV', unit: 'm', description: 'Cabo combinado de vídeo e alimentação para câmera analógica.', ncm: '85442000', code: 'CAB-CFTV-4MM' },
  { id: 'suporte-camera-parede', name: 'Suporte de parede para câmera', brand: 'Intelbras', category: 'CFTV', unit: 'un', description: 'Suporte metálico articulado para fixação de câmera.', ncm: '73269090', code: 'SUP-CAM-PAR' },
  { id: 'caixa-protecao-camera', name: 'Caixa de proteção para câmera', brand: 'Intelbras', category: 'CFTV', unit: 'un', description: 'Caixa plástica de proteção e passagem de cabo para câmera externa.', ncm: '39269090', code: 'CX-PRT-CAM' },
  { id: 'monitor-19-cftv', name: 'Monitor 19 pol para CFTV', brand: 'Intelbras', category: 'CFTV', unit: 'un', description: 'Monitor para visualização local do gravador.', ncm: '85285210', code: 'MON-19-CFTV' },
  { id: 'cartao-microsd-64gb', name: 'Cartão microSD 64GB para vigilância', brand: 'Western Digital', category: 'CFTV', unit: 'un', description: 'Cartão de memória para gravação em câmera Wi-Fi.', ncm: '85235210', code: 'SD-64GB-VIG' },
  { id: 'placa-captura-teste-cftv', name: 'Testador de câmera CFTV portátil', brand: 'Multilaser', category: 'CFTV', unit: 'un', description: 'Monitor de teste portátil para apontamento de câmera em campo.', ncm: '90308900', code: 'TST-CFTV-POR' },

  // ---------------------------------------------------------------------------
  // Cabo de rede por marca e categoria
  // ---------------------------------------------------------------------------
  { id: 'cabo-cat5e-cobre-furukawa', name: 'Cabo de rede Cat5e U/UTP 100% cobre', brand: 'Furukawa', category: 'REDE_ISP', unit: 'm', description: 'Cabo Cat5e de cobre puro para cabeamento estruturado interno.', ncm: '85444900', code: 'CAB-C5E-CU-FUR' },
  { id: 'cabo-cat5e-cca', name: 'Cabo de rede Cat5e CCA', brand: 'Multilaser', category: 'REDE_ISP', unit: 'm', description: 'Cabo Cat5e com condutor de alumínio revestido de cobre, uso econômico em lance curto.', ncm: '85444900', code: 'CAB-C5E-CCA' },
  { id: 'cabo-cat6-cobre-furukawa', name: 'Cabo de rede Cat6 U/UTP 100% cobre', brand: 'Furukawa', category: 'REDE_ISP', unit: 'm', description: 'Cabo Cat6 de cobre puro para rede gigabit.', ncm: '85444900', code: 'CAB-C6-CU-FUR' },
  { id: 'cabo-cat6-lszh-furukawa', name: 'Cabo de rede Cat6 LSZH', brand: 'Furukawa', category: 'REDE_ISP', unit: 'm', description: 'Cabo Cat6 com capa de baixa emissão de fumaça, para área de circulação.', ncm: '85444900', code: 'CAB-C6-LSZH' },
  { id: 'cabo-cat5e-nexans', name: 'Cabo de rede Cat5e U/UTP', brand: 'Nexans', category: 'REDE_ISP', unit: 'm', description: 'Cabo Cat5e para cabeamento estruturado.', ncm: '85444900', code: 'CAB-C5E-NEX' },
  { id: 'cabo-cat6-nexans', name: 'Cabo de rede Cat6 U/UTP', brand: 'Nexans', category: 'REDE_ISP', unit: 'm', description: 'Cabo Cat6 para rede gigabit em ambiente interno.', ncm: '85444900', code: 'CAB-C6-NEX' },
  { id: 'cabo-cat5e-intelbras', name: 'Cabo de rede Cat5e', brand: 'Intelbras', category: 'REDE_ISP', unit: 'm', description: 'Cabo Cat5e para rede local e CFTV com balun.', ncm: '85444900', code: 'CAB-C5E-ITB' },
  { id: 'cabo-cat6-externo-gel', name: 'Cabo de rede Cat6 externo com gel', brand: 'Furukawa', category: 'REDE_ISP', unit: 'm', description: 'Cabo Cat6 para uso externo, com proteção contra umidade e UV.', ncm: '85444900', code: 'CAB-C6-EXT-GEL' },
  { id: 'cabo-cat5e-externo-multilan', name: 'Cabo de rede Cat5e externo CMX', brand: 'Furukawa', category: 'REDE_ISP', unit: 'm', description: 'Cabo Cat5e com capa resistente a intempéries para lance externo.', ncm: '85444900', code: 'CAB-C5E-EXT' },
  { id: 'cabo-cat6a-blindado', name: 'Cabo de rede Cat6A F/UTP blindado', brand: 'Furukawa', category: 'REDE_ISP', unit: 'm', description: 'Cabo Cat6A blindado para ambiente com interferência eletromagnética.', ncm: '85444900', code: 'CAB-C6A-FTP' },

  // ---------------------------------------------------------------------------
  // Conectores de rede por marca e modelo
  // ---------------------------------------------------------------------------
  { id: 'rj45-cat5e-furukawa-100', name: 'Conector RJ45 Cat5e (100 peças)', brand: 'Furukawa', category: 'REDE_ISP', unit: 'pct', description: 'Plugue RJ45 categoria 5e para crimpagem em cabo de cobre.', ncm: '85366990', code: 'RJ45-C5E-FUR' },
  { id: 'rj45-cat6-nexans-100', name: 'Conector RJ45 Cat6 (100 peças)', brand: 'Nexans', category: 'REDE_ISP', unit: 'pct', description: 'Plugue RJ45 categoria 6 com guia interno para condutores.', ncm: '85366990', code: 'RJ45-C6-NEX' },
  { id: 'rj45-blindado-cat6', name: 'Conector RJ45 Cat6 blindado (10 peças)', brand: 'Furukawa', category: 'REDE_ISP', unit: 'pct', description: 'Plugue RJ45 metálico para cabo blindado.', ncm: '85366990', code: 'RJ45-C6-BLI' },
  { id: 'capa-protetora-rj45', name: 'Capa protetora para RJ45 (100 peças)', brand: 'Multilaser', category: 'REDE_ISP', unit: 'pct', description: 'Capa plástica que protege a trava do conector.', ncm: '39269090', code: 'CAP-RJ45-100' },
  { id: 'keystone-cat5e-furukawa', name: 'Keystone jack Cat5e', brand: 'Furukawa', category: 'REDE_ISP', unit: 'un', description: 'Conector fêmea keystone Cat5e para espelho e patch panel.', ncm: '85366990', code: 'KEY-C5E-FUR' },
  { id: 'keystone-cat6-nexans', name: 'Keystone jack Cat6', brand: 'Nexans', category: 'REDE_ISP', unit: 'un', description: 'Conector fêmea keystone Cat6 com engate rápido.', ncm: '85366990', code: 'KEY-C6-NEX' },
  { id: 'espelho-4x2-2-portas', name: 'Espelho 4x2 para 2 keystones', brand: 'Furukawa', category: 'REDE_ISP', unit: 'un', description: 'Placa 4x2 para acomodar conectores keystone.', ncm: '85366990', code: 'ESP-4X2-2P' },
  { id: 'conector-sc-apc-campo', name: 'Conector de campo SC/APC', brand: 'Furukawa', category: 'REDE_ISP', unit: 'un', description: 'Conector óptico de campo para terminação sem fusão.', ncm: '85447010', code: 'CON-SCAPC-CP' },
  { id: 'conector-sc-upc-campo', name: 'Conector de campo SC/UPC', brand: 'Furukawa', category: 'REDE_ISP', unit: 'un', description: 'Conector óptico de campo SC/UPC para rede interna.', ncm: '85447010', code: 'CON-SCUPC-CP' },
  { id: 'adaptador-sc-apc-buchas', name: 'Adaptador óptico SC/APC', brand: 'Furukawa', category: 'REDE_ISP', unit: 'un', description: 'Acoplador óptico para emenda de cordões em DIO.', ncm: '85369090', code: 'ADP-SCAPC' },
];
