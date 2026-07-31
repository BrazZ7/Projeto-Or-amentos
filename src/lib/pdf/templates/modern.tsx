import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import type { QuotePdfData } from '../types';
import { formatCurrency, formatDate, QUOTE_STATUS_LABELS } from '@/lib/utils';

export function ModernTemplate({ data }: { data: QuotePdfData }) {
  const { company } = data;
  const styles = buildModernStyles(company.primaryColor, company.secondaryColor, company.fontFamily);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.band}>
          <View>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image, not next/image */}
            {company.logoUrl && <Image src={company.logoUrl} style={styles.logo} />}
            <Text style={styles.companyName}>{company.tradeName || company.legalName}</Text>
            <Text style={styles.bandSmall}>
              {[company.phone, company.whatsapp, company.email].filter(Boolean).join(' · ')}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.title}>Orçamento {data.quotePrefix}-{String(data.number).padStart(4, '0')}</Text>
            <Text style={styles.bandSmall}>Emitido em {formatDate(data.issueDate)}</Text>
            <Text style={styles.bandSmall}>Válido até {formatDate(data.validUntil)}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.row}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Para</Text>
              <Text style={styles.cardMain}>{data.client.name}</Text>
              {data.client.document && <Text style={styles.cardSmall}>{data.client.document}</Text>}
              <Text style={styles.cardSmall}>
                {[data.client.phone, data.client.email].filter(Boolean).join(' · ')}
              </Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Status</Text>
              <Text style={[styles.cardMain, { color: company.primaryColor }]}>
                {QUOTE_STATUS_LABELS[data.status] || data.status}
              </Text>
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeadCell, { flex: 3 }]}>Item</Text>
              <Text style={[styles.tableHeadCell, { flex: 1, textAlign: 'center' }]}>Qtd.</Text>
              <Text style={[styles.tableHeadCell, { flex: 1.3, textAlign: 'right' }]}>Unitário</Text>
              <Text style={[styles.tableHeadCell, { flex: 1.3, textAlign: 'right' }]}>Total</Text>
            </View>
            {data.items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 3 }]}>{item.description}</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{item.quantity}</Text>
                <Text style={[styles.tableCell, { flex: 1.3, textAlign: 'right' }]}>
                  {formatCurrency(item.unitPrice)}
                </Text>
                <Text style={[styles.tableCell, { flex: 1.3, textAlign: 'right' }]}>
                  {formatCurrency(item.total)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.totalBanner}>
            <View>
              <Text style={styles.totalBannerLabel}>Subtotal: {formatCurrency(data.subtotal)}</Text>
              <Text style={styles.totalBannerLabel}>Desconto: -{formatCurrency(data.discountAmount)}</Text>
              <Text style={styles.totalBannerLabel}>Frete: {formatCurrency(data.freight)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.totalBannerCaption}>TOTAL</Text>
              <Text style={styles.totalBannerValue}>{formatCurrency(data.total)}</Text>
            </View>
          </View>

          <View style={styles.row}>
            {data.paymentTerms && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Pagamento</Text>
                <Text style={styles.cardSmall}>{data.paymentTerms}</Text>
              </View>
            )}
            {data.deliveryTerms && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Entrega</Text>
                <Text style={styles.cardSmall}>{data.deliveryTerms}</Text>
              </View>
            )}
          </View>

          {(data.warranty || data.notes) && (
            <View style={styles.card}>
              {data.warranty && <Text style={styles.cardSmall}>Garantia: {data.warranty}</Text>}
              {data.notes && <Text style={[styles.cardSmall, { marginTop: 4 }]}>{data.notes}</Text>}
            </View>
          )}

          {company.signatureUrl && (
            <View style={{ marginTop: 16, alignItems: 'center' }}>
              {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image, not next/image */}
              <Image src={company.signatureUrl} style={{ width: 130, height: 45, objectFit: 'contain' }} />
            </View>
          )}
        </View>

        {company.footerText && (
          <Text style={styles.footer} fixed>
            {company.footerText}
          </Text>
        )}
      </Page>
    </Document>
  );
}

function buildModernStyles(primary: string, secondary: string, fontFamily: string) {
  return StyleSheet.create({
    page: { fontFamily, fontSize: 10, color: '#1e293b' },
    band: {
      backgroundColor: primary,
      color: '#ffffff',
      padding: 28,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    logo: { width: 80, height: 40, objectFit: 'contain', marginBottom: 6 },
    companyName: { fontSize: 14, fontWeight: 700, color: '#ffffff' },
    bandSmall: { fontSize: 9, color: '#ffffffcc', marginTop: 2 },
    title: { fontSize: 14, fontWeight: 700, color: '#ffffff' },
    body: { padding: 28 },
    row: { flexDirection: 'row', gap: 10, marginBottom: 10 },
    card: {
      flex: 1,
      backgroundColor: '#f8fafc',
      borderRadius: 6,
      padding: 10,
    },
    cardTitle: {
      fontSize: 8,
      fontWeight: 700,
      color: secondary,
      textTransform: 'uppercase',
      marginBottom: 3,
    },
    cardMain: { fontSize: 12, fontWeight: 700 },
    cardSmall: { fontSize: 9, color: '#475569', marginTop: 1 },
    table: { marginBottom: 10 },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: secondary,
      paddingVertical: 7,
      paddingHorizontal: 8,
      borderRadius: 4,
    },
    tableHeadCell: { fontSize: 8.5, color: '#ffffff', fontWeight: 700, textTransform: 'uppercase' },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: 7,
      paddingHorizontal: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#e2e8f0',
    },
    tableCell: { fontSize: 9.5 },
    totalBanner: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#0f172a',
      borderRadius: 6,
      padding: 14,
      marginBottom: 10,
    },
    totalBannerLabel: { fontSize: 9, color: '#cbd5e1', marginBottom: 2 },
    totalBannerCaption: { fontSize: 9, color: '#cbd5e1' },
    totalBannerValue: { fontSize: 18, fontWeight: 700, color: '#ffffff' },
    footer: {
      position: 'absolute',
      bottom: 16,
      left: 28,
      right: 28,
      fontSize: 8,
      color: '#94a3b8',
      textAlign: 'center',
    },
  });
}
