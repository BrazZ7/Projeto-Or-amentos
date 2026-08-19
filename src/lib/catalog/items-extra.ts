import type { CatalogItem } from './types';

/**
 * Segunda leva do catálogo: iluminação, hidráulica, fixação e EPI, mais
 * reforço das categorias que já existiam.
 *
 * Arquivo separado por tamanho, não por natureza — items.ts já passava de 80
 * entradas e um único arquivo tornaria o diff de cada ampliação ilegível.
 */
export const CATALOG_ITEMS_EXTRA: CatalogItem[] = [
  // ---------------------------------------------------------------------------
  // Iluminação
  // ---------------------------------------------------------------------------
  { id: 'lampada-led-9w-philips', name: 'Lâmpada LED bulbo 9W E27', brand: 'Philips', category: 'ILUMINACAO', unit: 'un', description: 'Lâmpada LED bulbo 9W, base E27, luz branca.', ncm: '85395200', code: 'LAM-LED-9W-PHI' },
  { id: 'lampada-led-12w-osram', name: 'Lâmpada LED bulbo 12W E27', brand: 'Osram', category: 'ILUMINACAO', unit: 'un', description: 'Lâmpada LED bulbo 12W, base E27.', ncm: '85395200', code: 'LAM-LED-12W-OSR' },
  { id: 'lampada-led-15w-avant', name: 'Lâmpada LED bulbo 15W E27', brand: 'Avant', category: 'ILUMINACAO', unit: 'un', description: 'Lâmpada LED alta potência para área ampla.', ncm: '85395200', code: 'LAM-LED-15W-AVT' },
  { id: 'lampada-led-tubular-18w', name: 'Lâmpada LED tubular 18W 1,20m', brand: 'Taschibra', category: 'ILUMINACAO', unit: 'un', description: 'Tubular LED T8 para luminária de calha.', ncm: '85395200', code: 'LAM-TUB-18W' },
  { id: 'painel-led-18w-embutir', name: 'Painel LED embutir 18W quadrado', brand: 'Avant', category: 'ILUMINACAO', unit: 'un', description: 'Painel LED de embutir em forro, 18W.', ncm: '94051100', code: 'PNL-LED-18W' },
  { id: 'painel-led-24w-sobrepor', name: 'Painel LED sobrepor 24W redondo', brand: 'Taschibra', category: 'ILUMINACAO', unit: 'un', description: 'Plafon LED de sobrepor, 24W.', ncm: '94051100', code: 'PNL-LED-24W' },
  { id: 'refletor-led-50w', name: 'Refletor LED 50W IP65', brand: 'Avant', category: 'ILUMINACAO', unit: 'un', description: 'Refletor LED para área externa, com vedação IP65.', ncm: '94051100', code: 'REF-LED-50W' },
  { id: 'refletor-led-100w', name: 'Refletor LED 100W IP65', brand: 'Taschibra', category: 'ILUMINACAO', unit: 'un', description: 'Refletor LED de alta potência para pátio e fachada.', ncm: '94051100', code: 'REF-LED-100W' },
  { id: 'fita-led-5m-2835', name: 'Fita LED 5m com fonte', brand: 'Avant', category: 'ILUMINACAO', unit: 'rl', description: 'Rolo de fita LED 5 metros com fonte de alimentação.', ncm: '94051100', code: 'FIT-LED-5M' },
  { id: 'luminaria-publica-led-60w', name: 'Luminária pública LED 60W', brand: 'Intelbras', category: 'ILUMINACAO', unit: 'un', description: 'Luminária LED para poste, uso em via e estacionamento.', ncm: '94051100', code: 'LUM-PUB-60W' },
  { id: 'sensor-presenca-teto', name: 'Sensor de presença de teto', brand: 'Intelbras', category: 'ILUMINACAO', unit: 'un', description: 'Sensor de presença 360 graus para acionamento automático.', ncm: '85365090', code: 'SEN-PRE-TET' },
  { id: 'rele-fotocelula', name: 'Relé fotocélula 1000W', brand: 'Steck', category: 'ILUMINACAO', unit: 'un', description: 'Relé fotoelétrico para acionamento de iluminação ao anoitecer.', ncm: '85365090', code: 'REL-FOT-1000' },
  { id: 'soquete-e27-porcelana', name: 'Soquete E27 de porcelana', brand: 'Pial', category: 'ILUMINACAO', unit: 'un', description: 'Soquete E27 resistente a alta temperatura.', ncm: '85366100', code: 'SOQ-E27-POR' },

  // ---------------------------------------------------------------------------
  // Hidráulica
  // ---------------------------------------------------------------------------
  { id: 'tubo-pvc-soldavel-25-tigre', name: 'Tubo PVC soldável 25mm', brand: 'Tigre', category: 'HIDRAULICA', unit: 'm', description: 'Tubo PVC soldável para água fria, 25mm.', ncm: '39172300', code: 'TUB-PVC-25-TIG' },
  { id: 'tubo-pvc-soldavel-32-tigre', name: 'Tubo PVC soldável 32mm', brand: 'Tigre', category: 'HIDRAULICA', unit: 'm', description: 'Tubo PVC soldável para água fria, 32mm.', ncm: '39172300', code: 'TUB-PVC-32-TIG' },
  { id: 'tubo-esgoto-100-amanco', name: 'Tubo PVC esgoto 100mm', brand: 'Amanco', category: 'HIDRAULICA', unit: 'm', description: 'Tubo PVC para esgoto predial, 100mm.', ncm: '39172300', code: 'TUB-ESG-100-AMC' },
  { id: 'joelho-90-25-tigre', name: 'Joelho 90 graus soldável 25mm', brand: 'Tigre', category: 'HIDRAULICA', unit: 'un', description: 'Conexão joelho 90 graus para tubo soldável 25mm.', ncm: '39174090', code: 'JOE-90-25-TIG' },
  { id: 'te-soldavel-25-tigre', name: 'Tê soldável 25mm', brand: 'Tigre', category: 'HIDRAULICA', unit: 'un', description: 'Conexão tê para derivação em tubo soldável 25mm.', ncm: '39174090', code: 'TE-SOL-25-TIG' },
  { id: 'luva-soldavel-25-amanco', name: 'Luva soldável 25mm', brand: 'Amanco', category: 'HIDRAULICA', unit: 'un', description: 'Luva de emenda para tubo soldável 25mm.', ncm: '39174090', code: 'LUV-SOL-25-AMC' },
  { id: 'adaptador-flange-caixa', name: 'Adaptador com flange para caixa d água 25mm', brand: 'Tigre', category: 'HIDRAULICA', unit: 'un', description: 'Adaptador soldável com flange e anel de vedação.', ncm: '39174090', code: 'ADP-FLG-25' },
  { id: 'registro-esfera-25-tigre', name: 'Registro esfera soldável 25mm', brand: 'Tigre', category: 'HIDRAULICA', unit: 'un', description: 'Registro de esfera para bloqueio de água fria.', ncm: '84818095', code: 'REG-ESF-25-TIG' },
  { id: 'registro-gaveta-34-docol', name: 'Registro de gaveta 3/4 pol', brand: 'Docol', category: 'HIDRAULICA', unit: 'un', description: 'Registro de gaveta com acabamento cromado.', ncm: '84818095', code: 'REG-GAV-34-DOC' },
  { id: 'torneira-jardim-12', name: 'Torneira de jardim 1/2 pol', brand: 'Docol', category: 'HIDRAULICA', unit: 'un', description: 'Torneira metálica para área externa e tanque.', ncm: '84818011', code: 'TOR-JAR-12-DOC' },
  { id: 'caixa-agua-500l', name: 'Caixa d água polietileno 500L', brand: 'Fortlev', category: 'HIDRAULICA', unit: 'un', description: 'Reservatório de polietileno 500 litros com tampa.', ncm: '39251000', code: 'CXA-500L-FTL' },
  { id: 'boia-caixa-agua', name: 'Torneira boia para caixa d água', brand: 'Tigre', category: 'HIDRAULICA', unit: 'un', description: 'Válvula boia automática para reservatório.', ncm: '84818095', code: 'BOI-CXA-TIG' },
  { id: 'veda-rosca-18mm', name: 'Fita veda rosca 18mm x 50m', brand: 'Tigre', category: 'HIDRAULICA', unit: 'un', description: 'Fita de vedação para roscas hidráulicas.', ncm: '39191000', code: 'VED-ROS-18' },
  { id: 'adesivo-pvc-175g', name: 'Adesivo plástico para PVC 175g', brand: 'Tigre', category: 'HIDRAULICA', unit: 'un', description: 'Cola para junta soldável de PVC.', ncm: '35061000', code: 'ADE-PVC-175' },
  { id: 'sifao-universal', name: 'Sifão universal sanfonado', brand: 'Amanco', category: 'HIDRAULICA', unit: 'un', description: 'Sifão flexível para pia e lavatório.', ncm: '39172300', code: 'SIF-UNI-AMC' },

  // ---------------------------------------------------------------------------
  // Fixação e parafusos
  // ---------------------------------------------------------------------------
  { id: 'parafuso-bucha-6-100', name: 'Parafuso com bucha 6mm (100 peças)', brand: 'Fischer', category: 'FIXACAO', unit: 'pct', description: 'Conjunto parafuso e bucha 6mm para alvenaria.', ncm: '73181500', code: 'PAR-BUC-6-100' },
  { id: 'parafuso-bucha-8-100', name: 'Parafuso com bucha 8mm (100 peças)', brand: 'Fischer', category: 'FIXACAO', unit: 'pct', description: 'Conjunto parafuso e bucha 8mm para alvenaria.', ncm: '73181500', code: 'PAR-BUC-8-100' },
  { id: 'parafuso-drywall-35-500', name: 'Parafuso drywall 3,5x35mm (500 peças)', brand: 'Ciser', category: 'FIXACAO', unit: 'pct', description: 'Parafuso para chapa de gesso acartonado.', ncm: '73181500', code: 'PAR-DRY-35' },
  { id: 'parafuso-autobrocante-100', name: 'Parafuso autobrocante 4,2x13mm (100 peças)', brand: 'Ciser', category: 'FIXACAO', unit: 'pct', description: 'Parafuso autoperfurante para chapa metálica.', ncm: '73181500', code: 'PAR-AUT-42' },
  { id: 'bucha-nylon-8-100', name: 'Bucha de nylon 8mm (100 peças)', brand: 'Fischer', category: 'FIXACAO', unit: 'pct', description: 'Bucha plástica para fixação em concreto e alvenaria.', ncm: '39269090', code: 'BUC-NYL-8' },
  { id: 'chumbador-parabolt-38', name: 'Chumbador parabolt 3/8 pol', brand: 'Fischer', category: 'FIXACAO', unit: 'un', description: 'Chumbador mecânico para fixação pesada em concreto.', ncm: '73181500', code: 'CHM-PAR-38' },
  { id: 'arruela-lisa-14-100', name: 'Arruela lisa 1/4 pol (100 peças)', brand: 'Ciser', category: 'FIXACAO', unit: 'pct', description: 'Arruela lisa galvanizada.', ncm: '73182200', code: 'ARR-LIS-14' },
  { id: 'abracadeira-metalica-d', name: 'Abraçadeira metálica tipo D 3/4 pol (50 peças)', brand: 'Vonder', category: 'FIXACAO', unit: 'pct', description: 'Abraçadeira metálica com cunha para eletroduto.', ncm: '73269090', code: 'ABR-MET-34' },
  { id: 'broca-concreto-6', name: 'Broca para concreto 6mm', brand: 'Bosch', category: 'FIXACAO', unit: 'un', description: 'Broca com ponta de vídea para alvenaria e concreto.', ncm: '82075010', code: 'BRC-CON-6-BSH' },
  { id: 'broca-concreto-8', name: 'Broca para concreto 8mm', brand: 'Bosch', category: 'FIXACAO', unit: 'un', description: 'Broca com ponta de vídea para alvenaria e concreto.', ncm: '82075010', code: 'BRC-CON-8-BSH' },
  { id: 'jogo-brocas-aco-rapido', name: 'Jogo de brocas aço rápido (13 peças)', brand: 'Vonder', category: 'FIXACAO', unit: 'jg', description: 'Brocas de 1,5 a 6,5mm para metal e madeira.', ncm: '82075010', code: 'BRC-JG13-VND' },

  // ---------------------------------------------------------------------------
  // EPI e segurança
  // ---------------------------------------------------------------------------
  { id: 'capacete-aba-frontal', name: 'Capacete de segurança com jugular', brand: '3M', category: 'EPI_SEGURANCA', unit: 'un', description: 'Capacete classe B com suspensão e jugular, para trabalho elétrico.', ncm: '65061000', code: 'EPI-CAP-3M' },
  { id: 'luva-isolante-classe0', name: 'Luva isolante classe 0 (1000V)', brand: 'Danny', category: 'EPI_SEGURANCA', unit: 'par', description: 'Luva de borracha isolante para trabalho em baixa tensão.', ncm: '40151900', code: 'EPI-LUV-CL0' },
  { id: 'luva-vaqueta-cobertura', name: 'Luva de vaqueta para cobertura', brand: 'Danny', category: 'EPI_SEGURANCA', unit: 'par', description: 'Luva de couro usada sobre a luva isolante.', ncm: '42032900', code: 'EPI-LUV-VAQ' },
  { id: 'oculos-protecao-incolor', name: 'Óculos de proteção incolor', brand: '3M', category: 'EPI_SEGURANCA', unit: 'un', description: 'Óculos de segurança com lente antirrisco.', ncm: '90049090', code: 'EPI-OCU-INC' },
  { id: 'botina-seguranca-bico-pvc', name: 'Botina de segurança bico PVC', brand: 'Marluvas', category: 'EPI_SEGURANCA', unit: 'par', description: 'Calçado de segurança com biqueira de composite.', ncm: '64034000', code: 'EPI-BOT-PVC' },
  { id: 'cinto-paraquedista', name: 'Cinto paraquedista com talabarte', brand: 'MSA', category: 'EPI_SEGURANCA', unit: 'un', description: 'Cinturão de segurança tipo paraquedista para trabalho em altura.', ncm: '63079090', code: 'EPI-CIN-PQD' },
  { id: 'protetor-auricular-plug', name: 'Protetor auricular plug (par)', brand: '3M', category: 'EPI_SEGURANCA', unit: 'par', description: 'Protetor auditivo tipo plug com cordão.', ncm: '63079090', code: 'EPI-AUR-PLG' },
  { id: 'cone-sinalizacao-75', name: 'Cone de sinalização 75cm', brand: 'Vonder', category: 'EPI_SEGURANCA', unit: 'un', description: 'Cone refletivo para sinalização de área de trabalho.', ncm: '39269090', code: 'EPI-CON-75' },
  { id: 'fita-zebrada-200m', name: 'Fita zebrada de isolamento 200m', brand: 'Vonder', category: 'EPI_SEGURANCA', unit: 'rl', description: 'Fita plástica para isolamento de área.', ncm: '39269090', code: 'EPI-FIT-ZEB' },
  { id: 'detector-tensao-nao-contato', name: 'Detector de tensão sem contato', brand: 'Minipa', category: 'EPI_SEGURANCA', unit: 'un', description: 'Caneta detectora de tensão por aproximação.', ncm: '90303390', code: 'EPI-DET-TEN' },

  // ---------------------------------------------------------------------------
  // Reforço: ferramentas
  // ---------------------------------------------------------------------------
  { id: 'serra-copo-jogo-vonder', name: 'Jogo de serra copo (11 peças)', brand: 'Vonder', category: 'FERRAMENTA_MANUAL', unit: 'jg', description: 'Serras copo bimetálicas de 19 a 64mm com arraste.', ncm: '82029900', code: 'SER-COP-JG-VND' },
  { id: 'nivel-bolha-45-stanley', name: 'Nível de bolha 45cm', brand: 'Stanley', category: 'FERRAMENTA_MANUAL', unit: 'un', description: 'Nível de alumínio com três bolhas.', ncm: '90158000', code: 'NIV-BOL-45-STA' },
  { id: 'nivel-laser-bosch', name: 'Nível a laser de linhas', brand: 'Bosch', category: 'FERRAMENTA_ELETRICA', unit: 'un', description: 'Nível a laser autonivelante para marcação horizontal e vertical.', ncm: '90158000', code: 'NIV-LAS-BSH' },
  { id: 'chave-grifo-12-tramontina', name: 'Chave grifo 12 pol', brand: 'Tramontina', category: 'FERRAMENTA_MANUAL', unit: 'un', description: 'Chave para tubos com mordente ajustável.', ncm: '82041100', code: 'CHV-GRF-12-TRA' },
  { id: 'chave-ajustavel-10-gedore', name: 'Chave ajustável 10 pol', brand: 'Gedore', category: 'FERRAMENTA_MANUAL', unit: 'un', description: 'Chave inglesa ajustável de 10 polegadas.', ncm: '82041200', code: 'CHV-AJU-10-GED' },
  { id: 'talhadeira-vonder', name: 'Talhadeira 12 pol', brand: 'Vonder', category: 'FERRAMENTA_MANUAL', unit: 'un', description: 'Talhadeira de aço para abertura de rasgo em alvenaria.', ncm: '82055900', code: 'TAL-12-VND' },
  { id: 'maleta-ferramentas-vonder', name: 'Maleta de ferramentas 18 pol', brand: 'Vonder', category: 'FERRAMENTA_MANUAL', unit: 'un', description: 'Maleta plástica com bandeja para organização.', ncm: '39269090', code: 'MAL-FER-18' },
  { id: 'escada-fibra-7-degraus', name: 'Escada de fibra de vidro 7 degraus', brand: 'Vonder', category: 'EPI_SEGURANCA', unit: 'un', description: 'Escada isolante de fibra, indicada para trabalho elétrico.', ncm: '73269090', code: 'ESC-FIB-7' },
  { id: 'lanterna-cabeca-led', name: 'Lanterna de cabeça LED recarregável', brand: 'Vonder', category: 'FERRAMENTA_MANUAL', unit: 'un', description: 'Lanterna de cabeça para trabalho com as mãos livres.', ncm: '85131000', code: 'LAN-CAB-LED' },

  // ---------------------------------------------------------------------------
  // Reforço: material elétrico e redes
  // ---------------------------------------------------------------------------
  { id: 'contator-25a-weg', name: 'Contator tripolar 25A', brand: 'WEG', category: 'MATERIAL_ELETRICO', unit: 'un', description: 'Contator para acionamento de motores e cargas.', ncm: '85364100', code: 'CNT-25A-WEG' },
  { id: 'rele-termico-weg', name: 'Relé térmico de sobrecarga', brand: 'WEG', category: 'MATERIAL_ELETRICO', unit: 'un', description: 'Relé de proteção térmica para motor.', ncm: '85363000', code: 'REL-TER-WEG' },
  { id: 'canaleta-pvc-20x10', name: 'Canaleta PVC 20x10mm com adesivo', brand: 'Tigre', category: 'MATERIAL_ELETRICO', unit: 'm', description: 'Canaleta aparente para passagem de cabos.', ncm: '39172300', code: 'CAN-PVC-2010' },
  { id: 'caixa-passagem-30x30', name: 'Caixa de passagem 30x30cm', brand: 'Steck', category: 'MATERIAL_ELETRICO', unit: 'un', description: 'Caixa de passagem com tampa para instalação aparente.', ncm: '85381000', code: 'CXP-3030-STK' },
  { id: 'haste-aterramento-24m', name: 'Haste de aterramento cobreada 2,4m', brand: 'Intelli', category: 'MATERIAL_ELETRICO', unit: 'un', description: 'Haste para malha de aterramento, 5/8 pol.', ncm: '85369090', code: 'HST-ATR-24' },
  { id: 'conector-split-bolt-16', name: 'Conector split bolt 16mm', brand: 'Intelli', category: 'MATERIAL_ELETRICO', unit: 'un', description: 'Conector parafuso fendido para emenda de aterramento.', ncm: '85369090', code: 'CON-SPL-16' },
  { id: 'nobreak-1200va', name: 'Nobreak 1200VA', brand: 'Intelbras', category: 'MATERIAL_ELETRICO', unit: 'un', description: 'Nobreak com estabilizador para equipamentos de rede.', ncm: '85044090', code: 'NBR-1200VA' },
  { id: 'fonte-poe-48v', name: 'Fonte PoE 48V', brand: 'Intelbras', category: 'REDE_ISP', unit: 'un', description: 'Injetor PoE para alimentar rádios e antenas.', ncm: '85044090', code: 'FNT-POE-48V' },
  { id: 'clivador-fibra', name: 'Clivador de fibra óptica', brand: 'Furukawa', category: 'REDE_ISP', unit: 'un', description: 'Clivador de precisão para preparo de fibra antes da fusão.', ncm: '84561200', code: 'CLV-FIB-FUR' },
  { id: 'power-meter-optico', name: 'Power meter óptico', brand: 'Intelbras', category: 'REDE_ISP', unit: 'un', description: 'Medidor de potência óptica para certificação de enlace.', ncm: '90314990', code: 'PWM-OPT-ITB' },
  { id: 'organizador-cabo-rack', name: 'Organizador de cabos para rack 1U', brand: 'Nazda', category: 'REDE_ISP', unit: 'un', description: 'Guia de cabos horizontal para rack 19 polegadas.', ncm: '85177099', code: 'ORG-CAB-1U' },
  { id: 'patch-panel-24-cat6', name: 'Patch panel 24 portas Cat6', brand: 'Furukawa', category: 'REDE_ISP', unit: 'un', description: 'Painel de conexão 24 portas para rack 19 polegadas.', ncm: '85177099', code: 'PPN-24-CAT6' },
  { id: 'abracadeira-fita-velcro', name: 'Fita velcro para organização de cabos 5m', brand: 'Vonder', category: 'REDE_ISP', unit: 'rl', description: 'Fita autoaderente reutilizável para chicote de cabos.', ncm: '58063200', code: 'VEL-CAB-5M' },
];
