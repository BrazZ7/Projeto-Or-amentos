import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import type { QuotePdfData } from '../types';
import { formatCurrency, formatDate } from '@/lib/utils';

export function ProposalTemplate({ data }: { data: QuotePdfData }) {
  const { company } = data;
  const styles = buildProposalStyles(company.primaryColor, company.secondaryColor, company.fontFamily);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.coverHeader}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image, not next/image */}
          {company.logoUrl && <Image src={company.logoUrl} style={styles.logo} />}
          <Text style={styles.eyebrow}>Proposta comercial</Text>
          <Text style={styles.title}>
            {data.quotePrefix}-{String(data.number).padStart(4, '0')}
          </Text>
          <Text style={styles.subtitle}>Preparada para {data.client.name}</Text>
          <Text style={styles.subtitleSmall}>
            {company.tradeName || company.legalName} · {formatDate(data.issueDate)}
          </Text>
        </View>

        {company.headerText && (
          <View style={styles.intro}>
            <Text style={styles.introText}>{company.headerText}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Escopo proposto</Text>
          <View style={styles.table}>
            {data.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.description}</Text>
                  <Text style={styles.itemMeta}>
                    {item.quantity} × {formatCurrency(item.unitPrice)}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>{formatCurrency(item.total)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.investmentBox}>
          <Text style={styles.investmentLabel}>Investimento total</Text>
          <Text style={styles.investmentValue}>{formatCurrency(data.total)}</Text>
          <Text style={styles.investmentDetail}>
            Subtotal {formatCurrency(data.subtotal)} · Desconto {formatCurrency(data.discountAmount)} ·
            Frete {formatCurrency(data.freight)}
          </Text>
          <Text style={styles.investmentDetail}>Proposta válida até {formatDate(data.validUntil)}</Text>
        </View>

        <View style={styles.section}>
          {data.paymentTerms && (
            <View style={styles.textBlock}>
              <Text style={styles.sectionTitle}>Como funciona o pagamento</Text>
              <Text style={styles.bodyText}>{data.paymentTerms}</Text>
            </View>
          )}
          {data.deliveryTerms && (
            <View style={styles.textBlock}>
              <Text style={styles.sectionTitle}>Prazo</Text>
              <Text style={styles.bodyText}>{data.deliveryTerms}</Text>
            </View>
          )}
          {data.warranty && (
            <View style={styles.textBlock}>
              <Text style={styles.sectionTitle}>Garantia</Text>
              <Text style={styles.bodyText}>{data.warranty}</Text>
            </View>
          )}
          {data.notes && (
            <View style={styles.textBlock}>
              <Text style={styles.sectionTitle}>Observações</Text>
              <Text style={styles.bodyText}>{data.notes}</Text>
            </View>
          )}
        </View>

        {company.signatureUrl && (
          <View style={{ marginTop: 10, alignItems: 'center' }}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image, not next/image */}
            <Image src={company.signatureUrl} style={{ width: 140, height: 48, objectFit: 'contain' }} />
            <Text style={styles.itemMeta}>{company.tradeName || company.legalName}</Text>
          </View>
        )}

        {company.footerText && (
          <Text style={styles.footer} fixed>
            {company.footerText}
          </Text>
        )}
      </Page>
    </Document>
  );
}

function buildProposalStyles(primary: string, secondary: string, fontFamily: string) {
  return StyleSheet.create({
    page: { padding: 36, fontFamily, fontSize: 10, color: '#1e293b' },
    coverHeader: { marginBottom: 18, alignItems: 'center', textAlign: 'center' },
    logo: { width: 90, height: 46, objectFit: 'contain', marginBottom: 10 },
    eyebrow: {
      fontSize: 9,
      letterSpacing: 2,
      color: primary,
      fontWeight: 700,
      textTransform: 'uppercase',
    },
    title: { fontSize: 22, fontWeight: 700, color: secondary, marginTop: 4 },
    subtitle: { fontSize: 12, color: '#334155', marginTop: 6 },
    subtitleSmall: { fontSize: 9, color: '#94a3b8', marginTop: 2 },
    intro: { marginBottom: 16, padding: 12, backgroundColor: '#f8fafc', borderRadius: 6 },
    introText: { fontSize: 10, lineHeight: 1.5, color: '#334155', textAlign: 'center' },
    section: { marginBottom: 14 },
    sectionTitle: {
      fontSize: 10,
      fontWeight: 700,
      color: secondary,
      marginBottom: 6,
      textTransform: 'uppercase',
    },
    table: { gap: 0 },
    itemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#e2e8f0',
    },
    itemName: { fontSize: 10.5, fontWeight: 700 },
    itemMeta: { fontSize: 9, color: '#64748b', marginTop: 1 },
    itemTotal: { fontSize: 11, fontWeight: 700, color: primary },
    investmentBox: {
      alignItems: 'center',
      textAlign: 'center',
      padding: 16,
      marginVertical: 14,
      borderWidth: 1,
      borderColor: primary,
      borderRadius: 8,
    },
    investmentLabel: { fontSize: 9, textTransform: 'uppercase', color: secondary, letterSpacing: 1 },
    investmentValue: { fontSize: 26, fontWeight: 700, color: primary, marginVertical: 4 },
    investmentDetail: { fontSize: 8.5, color: '#64748b' },
    textBlock: { marginBottom: 10 },
    bodyText: { fontSize: 9.5, color: '#334155', lineHeight: 1.5 },
    footer: {
      position: 'absolute',
      bottom: 20,
      left: 36,
      right: 36,
      fontSize: 8,
      color: '#94a3b8',
      textAlign: 'center',
    },
  });
}
