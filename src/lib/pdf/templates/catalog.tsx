import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import type { QuotePdfData } from '../types';
import { resolveImageSrc } from '../image-src';
import { formatCurrency, formatDate } from '@/lib/utils';

/**
 * Único modelo que usa a foto do item (QuoteItem.imageUrl). Itens sem imagem
 * caem num quadro numerado, para a lista não ficar desalinhada.
 */
export function CatalogTemplate({ data }: { data: QuotePdfData }) {
  const { company } = data;
  const styles = buildCatalogStyles(company.primaryColor, company.secondaryColor, company.fontFamily);
  const logo = resolveImageSrc(company.logoUrl);
  const signature = resolveImageSrc(company.signatureUrl);
  const quoteCode = `${data.quotePrefix}-${String(data.number).padStart(4, '0')}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <View style={{ flex: 1 }}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image, not next/image */}
            {logo && <Image src={logo} style={styles.logo} />}
            <Text style={styles.company}>{company.tradeName || company.legalName}</Text>
            <Text style={styles.headerMuted}>
              {[company.phone, company.email].filter(Boolean).join('  ·  ')}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.headerCode}>{quoteCode}</Text>
            <Text style={styles.headerMuted}>Emitido em {formatDate(data.issueDate)}</Text>
            <Text style={styles.headerMuted}>Válido até {formatDate(data.validUntil)}</Text>
          </View>
        </View>

        <View style={styles.clientBar}>
          <Text style={styles.clientLabel}>Orçamento para</Text>
          <Text style={styles.clientName}>{data.client.name}</Text>
          {data.client.document && <Text style={styles.clientMeta}>{data.client.document}</Text>}
        </View>

        {company.headerText && <Text style={styles.intro}>{company.headerText}</Text>}

        {data.items.map((item, index) => {
          const image = resolveImageSrc(item.imageUrl);
          return (
            <View key={index} style={styles.itemCard} wrap={false}>
              {image ? (
                // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image, not next/image
                <Image src={image} style={styles.itemImage} />
              ) : (
                <View style={styles.itemImagePlaceholder}>
                  <Text style={styles.itemImagePlaceholderText}>{String(index + 1).padStart(2, '0')}</Text>
                </View>
              )}

              <View style={styles.itemBody}>
                <Text style={styles.itemName}>{item.description}</Text>
                <Text style={styles.itemMeta}>
                  {item.quantity} × {formatCurrency(item.unitPrice)}
                  {item.discount > 0 ? `   ·   desconto ${formatCurrency(item.discount)}` : ''}
                </Text>
              </View>

              <View style={styles.itemPriceBox}>
                <Text style={styles.itemPriceLabel}>Total</Text>
                <Text style={styles.itemPrice}>{formatCurrency(item.total)}</Text>
              </View>
            </View>
          );
        })}

        <View style={styles.totalsRow} wrap={false}>
          <View style={styles.totalsBreakdown}>
            <TotalLine label="Subtotal" value={formatCurrency(data.subtotal)} styles={styles} />
            <TotalLine
              label={data.discountType === 'PERCENT' ? `Desconto (${data.discountValue}%)` : 'Desconto'}
              value={`- ${formatCurrency(data.discountAmount)}`}
              styles={styles}
            />
            <TotalLine label="Frete" value={formatCurrency(data.freight)} styles={styles} />
          </View>
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>Total do orçamento</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(data.total)}</Text>
          </View>
        </View>

        <View style={styles.conditions}>
          {data.paymentTerms && <Block title="Pagamento" content={data.paymentTerms} styles={styles} />}
          {data.deliveryTerms && <Block title="Entrega" content={data.deliveryTerms} styles={styles} />}
          {data.warranty && <Block title="Garantia" content={data.warranty} styles={styles} />}
          {data.notes && <Block title="Observações" content={data.notes} styles={styles} />}
        </View>

        {/* Dados bancários e assinatura dividem a mesma faixa: com fotos de
            item ocupando altura, empilhar os dois joga a assinatura sozinha
            para a página seguinte. */}
        <View style={styles.closingRow} wrap={false}>
          <View style={{ flex: 1 }}>
            {(company.bankName || company.pixKey) && (
              <Block
                title="Dados para pagamento"
                content={[
                  company.bankName && `Banco: ${company.bankName}`,
                  company.bankAgency && `Agência: ${company.bankAgency}`,
                  company.bankAccount && `Conta: ${company.bankAccount}`,
                  company.pixKey && `PIX: ${company.pixKey}`,
                  company.paymentNotes,
                ]
                  .filter(Boolean)
                  .join('   ·   ')}
                styles={styles}
              />
            )}
          </View>

          {signature && (
            <View style={styles.signature}>
              {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image, not next/image */}
              <Image src={signature} style={styles.signatureImage} />
              <View style={styles.signatureLine} />
              <Text style={styles.signatureName}>{company.tradeName || company.legalName}</Text>
            </View>
          )}
        </View>

        <Text
          style={styles.footer}
          fixed
          render={({ pageNumber, totalPages }) =>
            [company.footerText, `${quoteCode}  ·  ${pageNumber}/${totalPages}`]
              .filter(Boolean)
              .join('     ')
          }
        />
      </Page>
    </Document>
  );
}

function TotalLine({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof buildCatalogStyles>;
}) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
      <Text style={styles.totalLineLabel}>{label}</Text>
      <Text style={styles.totalLineValue}>{value}</Text>
    </View>
  );
}

function Block({
  title,
  content,
  styles,
}: {
  title: string;
  content: string;
  styles: ReturnType<typeof buildCatalogStyles>;
}) {
  return (
    <View style={styles.block} wrap={false}>
      <Text style={styles.blockTitle}>{title}</Text>
      <Text style={styles.blockText}>{content}</Text>
    </View>
  );
}

function buildCatalogStyles(primary: string, secondary: string, fontFamily: string) {
  return StyleSheet.create({
    page: { fontFamily, fontSize: 10, color: '#1e293b', paddingHorizontal: 36, paddingTop: 26, paddingBottom: 46 },

    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      borderBottomWidth: 2,
      borderBottomColor: secondary,
      paddingBottom: 8,
      marginBottom: 11,
    },
    logo: { width: 88, height: 38, objectFit: 'contain', marginBottom: 6 },
    company: { fontSize: 12.5, fontWeight: 700, color: secondary },
    headerMuted: { fontSize: 8.5, color: '#64748b', marginTop: 2 },
    headerCode: { fontSize: 16, fontWeight: 700, color: primary },

    clientBar: {
      backgroundColor: '#f8fafc',
      borderRadius: 6,
      paddingVertical: 8,
      paddingHorizontal: 14,
      marginBottom: 10,
    },
    clientLabel: {
      fontSize: 7.5,
      color: '#94a3b8',
      textTransform: 'uppercase',
      letterSpacing: 1.4,
    },
    clientName: { fontSize: 13, fontWeight: 700, color: secondary, marginTop: 2 },
    clientMeta: { fontSize: 8.5, color: '#64748b', marginTop: 1 },

    intro: { fontSize: 9.5, color: '#475569', lineHeight: 1.5, marginBottom: 10 },

    itemCard: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#e2e8f0',
      borderRadius: 8,
      padding: 8,
      marginBottom: 6,
    },
    itemImage: {
      width: 54,
      height: 54,
      objectFit: 'cover',
      borderRadius: 6,
      marginRight: 12,
    },
    itemImagePlaceholder: {
      width: 54,
      height: 54,
      borderRadius: 6,
      marginRight: 12,
      backgroundColor: '#f1f5f9',
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemImagePlaceholderText: { fontSize: 15, fontWeight: 700, color: '#cbd5e1' },
    itemBody: { flex: 1, paddingRight: 10 },
    itemName: { fontSize: 11, fontWeight: 700, color: '#0f172a', lineHeight: 1.3 },
    itemMeta: { fontSize: 8.5, color: '#94a3b8', marginTop: 3 },
    itemPriceBox: { alignItems: 'flex-end', width: 88 },
    itemPriceLabel: {
      fontSize: 7,
      color: '#94a3b8',
      textTransform: 'uppercase',
      letterSpacing: 1.2,
    },
    itemPrice: { fontSize: 12.5, fontWeight: 700, color: primary, marginTop: 1 },

    totalsRow: { flexDirection: 'row', alignItems: 'stretch', gap: 10, marginTop: 6, marginBottom: 12 },
    totalsBreakdown: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 14,
    },
    totalLineLabel: { fontSize: 9, color: '#64748b' },
    totalLineValue: { fontSize: 9, color: '#334155' },
    grandTotal: {
      width: 200,
      backgroundColor: secondary,
      borderRadius: 8,
      paddingVertical: 14,
      paddingHorizontal: 16,
      justifyContent: 'center',
      alignItems: 'flex-end',
    },
    grandTotalLabel: {
      fontSize: 7.5,
      color: 'rgba(255, 255, 255, 0.6)',
      textTransform: 'uppercase',
      letterSpacing: 1.4,
    },
    grandTotalValue: { fontSize: 20, fontWeight: 700, color: '#ffffff', marginTop: 3 },

    conditions: { marginBottom: 8 },
    block: { marginBottom: 7 },
    blockTitle: {
      fontSize: 8,
      fontWeight: 700,
      color: primary,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      marginBottom: 2,
    },
    blockText: { fontSize: 9, color: '#475569', lineHeight: 1.5 },

    closingRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 18, marginTop: 2 },
    signature: { width: 168, alignItems: 'center' },
    signatureImage: { width: 112, height: 34, objectFit: 'contain', marginBottom: 2 },
    signatureLine: { width: '100%', borderBottomWidth: 1, borderBottomColor: '#cbd5e1', marginBottom: 4 },
    signatureName: { fontSize: 8.5, color: '#64748b' },

    footer: {
      position: 'absolute',
      bottom: 20,
      left: 36,
      right: 36,
      fontSize: 7.5,
      color: '#94a3b8',
      textAlign: 'center',
      borderTopWidth: 1,
      borderTopColor: '#e2e8f0',
      paddingTop: 7,
    },
  });
}
