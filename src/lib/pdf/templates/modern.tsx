import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Svg,
  Defs,
  LinearGradient,
  Stop,
  Rect,
} from '@react-pdf/renderer';
import type { QuotePdfData } from '../types';
import { formatCurrency, formatDate, QUOTE_STATUS_LABELS } from '@/lib/utils';

/**
 * Modelo Moderno — o orçamento na mesma linguagem do sistema: grafite neutro
 * com painéis de vidro.
 *
 * Vidro de verdade depende de backdrop-blur, que não existe em PDF: não há como
 * borrar o que está atrás. O que reproduz a sensação é o resto da receita —
 * branco translúcido baixíssimo sobre o grafite, aresta prateada de 1pt e o
 * filete de luz no topo de cada painel. Os dois últimos são SVG com gradiente,
 * porque borda uniforme não tem o brilho que some nas pontas.
 *
 * Cuidado ao editar: fundo escuro consome muita tinta se o cliente imprimir.
 * A escolha aqui é deliberada — este modelo é para ser lido na tela.
 */

/** Grafite do app (night-950 e vizinhos), para o PDF falar a mesma língua. */
const GRAFITE = '#0d0f12';
const PAINEL = 'rgba(255, 255, 255, 0.045)';
const PAINEL_ALTO = 'rgba(255, 255, 255, 0.075)';
const ARESTA = 'rgba(255, 255, 255, 0.14)';
const ARESTA_FORTE = 'rgba(255, 255, 255, 0.26)';

const BRANCO = '#f8fafc';
const CLARO = '#cbd5e1';
const MEDIO = '#94a3b8';
const FRACO = '#64748b';

/** Filete prateado no topo do painel — o mesmo do .panel::before no app. */
function FileteDeLuz({ forte = false }: { forte?: boolean }) {
  return (
    <Svg
      height={1}
      style={{ position: 'absolute', top: 0, left: '12%', right: '12%', width: '76%' }}
    >
      <Defs>
        <LinearGradient id={forte ? 'luzForte' : 'luz'} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#e2e8f0" stopOpacity={0} />
          <Stop offset="0.5" stopColor="#e2e8f0" stopOpacity={forte ? 0.75 : 0.5} />
          <Stop offset="1" stopColor="#e2e8f0" stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="1" fill={`url(#${forte ? 'luzForte' : 'luz'})`} />
    </Svg>
  );
}

export function ModernTemplate({ data }: { data: QuotePdfData }) {
  const { company } = data;
  const cor = company.primaryColor;
  const styles = buildModernStyles(company.fontFamily);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Clareamento difuso vindo de cima, como o fundo do app. Fixo para
            repetir em toda página, senão a segunda folha sai chapada. */}
        <View fixed style={styles.brilhoTopo}>
          <Svg width="100%" height="220">
            <Defs>
              <LinearGradient id="ambiente" x1="0" y1="0" x2="0.55" y2="1">
                <Stop offset="0" stopColor="#ffffff" stopOpacity={0.075} />
                <Stop offset="1" stopColor="#ffffff" stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="220" fill="url(#ambiente)" />
          </Svg>
        </View>

        {/* Cabeçalho */}
        <View style={styles.cabecalho}>
          <View style={{ flex: 1 }}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image, not next/image */}
            {company.logoUrl && <Image src={company.logoUrl} style={styles.logo} />}
            <Text style={styles.nomeEmpresa}>{company.tradeName || company.legalName}</Text>
            <Text style={styles.meta}>
              {[company.phone, company.whatsapp, company.email].filter(Boolean).join('  ·  ')}
            </Text>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.rotulo}>ORÇAMENTO</Text>
            <Text style={styles.numero}>
              {data.quotePrefix}-{String(data.number).padStart(4, '0')}
            </Text>
            <View style={[styles.selo, { borderColor: cor }]}>
              <Text style={[styles.seloTexto, { color: cor }]}>
                {QUOTE_STATUS_LABELS[data.status] || data.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Cliente e datas, lado a lado */}
        <View style={styles.linha}>
          <View style={[styles.painel, { flex: 2 }]}>
            <FileteDeLuz />
            <Text style={styles.painelRotulo}>PARA</Text>
            <Text style={styles.painelPrincipal}>{data.client.name}</Text>
            {data.client.document && (
              <Text style={styles.painelSecundario}>{data.client.document}</Text>
            )}
            <Text style={styles.painelSecundario}>
              {[data.client.phone, data.client.email].filter(Boolean).join('  ·  ')}
            </Text>
          </View>

          <View style={[styles.painel, { flex: 1 }]}>
            <FileteDeLuz />
            <Text style={styles.painelRotulo}>EMISSÃO</Text>
            <Text style={styles.painelPrincipal}>{formatDate(data.issueDate)}</Text>
            <Text style={[styles.painelRotulo, { marginTop: 10 }]}>VÁLIDO ATÉ</Text>
            <Text style={styles.painelPrincipal}>{formatDate(data.validUntil)}</Text>
          </View>
        </View>

        {/* Itens */}
        <View style={styles.painelTabela}>
          <FileteDeLuz />
          <View style={styles.tabelaCabecalho}>
            <Text style={[styles.tabelaTitulo, { flex: 3.4 }]}>ITEM</Text>
            <Text style={[styles.tabelaTitulo, { width: 62, textAlign: 'center' }]}>QTD.</Text>
            <Text style={[styles.tabelaTitulo, { width: 76, textAlign: 'right' }]}>UNITÁRIO</Text>
            <Text style={[styles.tabelaTitulo, { width: 76, textAlign: 'right' }]}>TOTAL</Text>
          </View>

          {data.items.map((item, index) => (
            <View key={index} style={styles.tabelaLinha} wrap={false}>
              <Text style={[styles.celula, styles.celulaDestaque, { flex: 3.4 }]}>
                {item.description}
              </Text>
              <Text style={[styles.celula, { width: 62, textAlign: 'center' }]}>
                {item.quantity} {item.unit}
              </Text>
              <Text style={[styles.celula, { width: 76, textAlign: 'right' }]}>
                {formatCurrency(item.unitPrice)}
              </Text>
              <Text style={[styles.celula, styles.celulaDestaque, { width: 76, textAlign: 'right' }]}>
                {formatCurrency(item.total)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totais. O valor final é o que o cliente procura primeiro. */}
        <View style={styles.blocoTotal} wrap={false}>
          <FileteDeLuz forte />
          <View style={{ flex: 1 }}>
            <View style={styles.somaLinha}>
              <Text style={styles.somaRotulo}>Subtotal</Text>
              <Text style={styles.somaValor}>{formatCurrency(data.subtotal)}</Text>
            </View>
            {data.discountAmount > 0 && (
              <View style={styles.somaLinha}>
                <Text style={styles.somaRotulo}>Desconto</Text>
                <Text style={styles.somaValor}>- {formatCurrency(data.discountAmount)}</Text>
              </View>
            )}
            {data.freight > 0 && (
              <View style={styles.somaLinha}>
                <Text style={styles.somaRotulo}>Frete</Text>
                <Text style={styles.somaValor}>{formatCurrency(data.freight)}</Text>
              </View>
            )}
          </View>

          <View style={styles.totalCaixa}>
            <Text style={styles.totalRotulo}>TOTAL</Text>
            <Text style={[styles.totalValor, { color: cor }]}>{formatCurrency(data.total)}</Text>
          </View>
        </View>

        {/* Condições */}
        {(data.paymentTerms || data.deliveryTerms) && (
          <View style={styles.linha}>
            {data.paymentTerms && (
              <View style={[styles.painel, { flex: 1 }]}>
                <FileteDeLuz />
                <Text style={styles.painelRotulo}>PAGAMENTO</Text>
                <Text style={styles.painelSecundario}>{data.paymentTerms}</Text>
              </View>
            )}
            {data.deliveryTerms && (
              <View style={[styles.painel, { flex: 1 }]}>
                <FileteDeLuz />
                <Text style={styles.painelRotulo}>ENTREGA</Text>
                <Text style={styles.painelSecundario}>{data.deliveryTerms}</Text>
              </View>
            )}
          </View>
        )}

        {(data.warranty || data.notes) && (
          <View style={styles.painel}>
            <FileteDeLuz />
            {data.warranty && (
              <>
                <Text style={styles.painelRotulo}>GARANTIA</Text>
                <Text style={styles.painelSecundario}>{data.warranty}</Text>
              </>
            )}
            {data.notes && (
              <Text style={[styles.painelSecundario, { marginTop: data.warranty ? 8 : 0 }]}>
                {data.notes}
              </Text>
            )}
          </View>
        )}

        {company.signatureUrl && (
          <View style={styles.assinatura}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image, not next/image */}
            <Image src={company.signatureUrl} style={{ width: 130, height: 44, objectFit: 'contain' }} />
            <View style={styles.linhaAssinatura} />
            <Text style={styles.meta}>{company.legalName}</Text>
          </View>
        )}

        <Text style={styles.rodape} fixed>
          {company.footerText || `${company.tradeName || company.legalName} · ${company.document}`}
        </Text>

        <Text
          style={styles.paginacao}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}

function buildModernStyles(fontFamily: string) {
  return StyleSheet.create({
    page: {
      backgroundColor: GRAFITE,
      fontFamily,
      paddingTop: 38,
      paddingHorizontal: 38,
      paddingBottom: 54,
      color: CLARO,
    },
    brilhoTopo: { position: 'absolute', top: 0, left: 0, right: 0 },

    cabecalho: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 22,
    },
    logo: { width: 116, height: 38, objectFit: 'contain', marginBottom: 8 },
    nomeEmpresa: { fontSize: 15, color: BRANCO, marginBottom: 3 },
    meta: { fontSize: 8, color: FRACO },

    rotulo: { fontSize: 7, letterSpacing: 1.6, color: MEDIO },
    numero: { fontSize: 20, color: BRANCO, marginTop: 2 },
    selo: {
      marginTop: 7,
      borderWidth: 1,
      borderRadius: 999,
      paddingHorizontal: 9,
      paddingVertical: 2.5,
    },
    seloTexto: { fontSize: 7.5, letterSpacing: 0.5 },

    linha: { flexDirection: 'row', gap: 10, marginBottom: 10 },

    painel: {
      position: 'relative',
      backgroundColor: PAINEL,
      borderWidth: 1,
      borderColor: ARESTA,
      borderRadius: 9,
      padding: 12,
      marginBottom: 10,
    },
    painelRotulo: { fontSize: 6.5, letterSpacing: 1.4, color: MEDIO, marginBottom: 3 },
    painelPrincipal: { fontSize: 11, color: BRANCO },
    painelSecundario: { fontSize: 8.5, color: CLARO, lineHeight: 1.5 },

    painelTabela: {
      position: 'relative',
      backgroundColor: PAINEL,
      borderWidth: 1,
      borderColor: ARESTA,
      borderRadius: 9,
      marginBottom: 10,
      overflow: 'hidden',
    },
    tabelaCabecalho: {
      flexDirection: 'row',
      paddingHorizontal: 12,
      paddingTop: 11,
      paddingBottom: 7,
      borderBottomWidth: 1,
      borderBottomColor: ARESTA,
    },
    tabelaTitulo: { fontSize: 6.5, letterSpacing: 1.2, color: MEDIO },
    tabelaLinha: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    },
    celula: { fontSize: 8.5, color: CLARO },
    celulaDestaque: { color: BRANCO },

    blocoTotal: {
      position: 'relative',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      backgroundColor: PAINEL_ALTO,
      borderWidth: 1,
      borderColor: ARESTA_FORTE,
      borderRadius: 9,
      padding: 14,
      marginBottom: 10,
    },
    somaLinha: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
    somaRotulo: { fontSize: 8.5, color: MEDIO },
    somaValor: { fontSize: 8.5, color: CLARO },
    totalCaixa: { alignItems: 'flex-end', minWidth: 130 },
    totalRotulo: { fontSize: 7, letterSpacing: 1.6, color: MEDIO },
    totalValor: { fontSize: 21, marginTop: 1 },

    assinatura: { marginTop: 18, alignItems: 'center' },
    linhaAssinatura: {
      width: 180,
      borderTopWidth: 1,
      borderTopColor: ARESTA,
      marginTop: 4,
      marginBottom: 4,
    },

    rodape: {
      position: 'absolute',
      bottom: 24,
      left: 38,
      right: 38,
      fontSize: 7,
      color: FRACO,
    },
    paginacao: {
      position: 'absolute',
      bottom: 24,
      right: 38,
      fontSize: 7,
      color: FRACO,
      textAlign: 'right',
    },
  });
}
