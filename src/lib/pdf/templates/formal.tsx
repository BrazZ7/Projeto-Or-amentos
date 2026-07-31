import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import type { QuotePdfData } from '../types';
import { formatCurrency, formatDate, QUOTE_STATUS_LABELS } from '@/lib/utils';

export function FormalTemplate({ data }: { data: QuotePdfData }) {
  const { company } = data;
  const styles = buildFormalStyles(company.fontFamily);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          {company.logoUrl ? (
            // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image, not next/image
            <Image src={company.logoUrl} style={styles.logo} />
          ) : (
            <Text style={styles.companyName}>{company.legalName}</Text>
          )}
          <Text style={styles.docNumber}>
            Orçamento nº {data.quotePrefix}-{String(data.number).padStart(4, '0')}
          </Text>
        </View>

        <Text style={styles.mainTitle}>ORÇAMENTO DE PRODUTOS E/OU SERVIÇOS</Text>

        <View style={styles.infoTable}>
          <InfoRow label="Emitente" value={`${company.legalName} — ${company.documentType} ${company.document}`} />
          <InfoRow label="Endereço" value={company.addressLine || '—'} />
          <InfoRow label="Contato" value={[company.phone, company.email].filter(Boolean).join(' | ') || '—'} />
          <InfoRow label="Cliente" value={`${data.client.name}${data.client.document ? ` — ${data.client.document}` : ''}`} />
          <InfoRow label="Data de emissão" value={formatDate(data.issueDate)} />
          <InfoRow label="Validade da proposta" value={formatDate(data.validUntil)} />
          <InfoRow label="Situação" value={QUOTE_STATUS_LABELS[data.status] || data.status} />
        </View>

        <Text style={styles.sectionTitle}>1. Itens do orçamento</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.tableHeadText, { flex: 3 }]}>Descrição</Text>
            <Text style={[styles.tableCell, styles.tableHeadText, { flex: 1, textAlign: 'center' }]}>Qtd.</Text>
            <Text style={[styles.tableCell, styles.tableHeadText, { flex: 1.3, textAlign: 'right' }]}>
              Vlr. unitário
            </Text>
            <Text style={[styles.tableCell, styles.tableHeadText, { flex: 1.3, textAlign: 'right' }]}>
              Vlr. total
            </Text>
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

        <Text style={styles.sectionTitle}>2. Resumo financeiro</Text>
        <View style={styles.infoTable}>
          <InfoRow label="Subtotal" value={formatCurrency(data.subtotal)} />
          <InfoRow label="Desconto" value={formatCurrency(data.discountAmount)} />
          <InfoRow label="Frete" value={formatCurrency(data.freight)} />
          <InfoRow label="Valor total" value={formatCurrency(data.total)} bold />
        </View>

        <Text style={styles.sectionTitle}>3. Condições gerais</Text>
        <View style={styles.infoTable}>
          <InfoRow label="Condições de pagamento" value={data.paymentTerms || '—'} />
          <InfoRow label="Prazo de entrega" value={data.deliveryTerms || '—'} />
          <InfoRow label="Garantia" value={data.warranty || '—'} />
        </View>

        {data.notes && (
          <>
            <Text style={styles.sectionTitle}>4. Observações</Text>
            <Text style={styles.bodyText}>{data.notes}</Text>
          </>
        )}

        <View style={styles.signatureRow}>
          <View style={styles.signatureField}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image, not next/image */}
            {company.signatureUrl && <Image src={company.signatureUrl} style={styles.signatureImage} />}
            <View style={styles.signatureLine} />
            <Text style={styles.smallText}>{company.legalName}</Text>
          </View>
          <View style={styles.signatureField}>
            <View style={styles.signatureLine} />
            <Text style={styles.smallText}>{data.client.name}</Text>
          </View>
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

function InfoRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#cbd5e1', paddingVertical: 4 }}>
      <Text style={{ flex: 1, fontSize: 9, color: '#475569', fontWeight: 700 }}>{label}</Text>
      <Text style={{ flex: 2, fontSize: 9, fontWeight: bold ? 700 : 400 }}>{value}</Text>
    </View>
  );
}

function buildFormalStyles(fontFamily: string) {
  return StyleSheet.create({
    page: { padding: 40, fontFamily, fontSize: 10, color: '#0f172a' },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    logo: { width: 90, height: 40, objectFit: 'contain' },
    companyName: { fontSize: 12, fontWeight: 700 },
    docNumber: { fontSize: 9, color: '#475569' },
    mainTitle: {
      fontSize: 13,
      fontWeight: 700,
      textAlign: 'center',
      marginVertical: 14,
      letterSpacing: 1,
    },
    infoTable: { marginBottom: 14 },
    sectionTitle: { fontSize: 10, fontWeight: 700, marginBottom: 6, marginTop: 4 },
    table: { marginBottom: 14, borderWidth: 0.5, borderColor: '#0f172a' },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: 6,
      paddingHorizontal: 6,
      borderBottomWidth: 0.5,
      borderBottomColor: '#cbd5e1',
    },
    tableHeader: { backgroundColor: '#e2e8f0' },
    tableCell: { fontSize: 9 },
    tableHeadText: { fontWeight: 700 },
    bodyText: { fontSize: 9.5, lineHeight: 1.5, marginBottom: 10 },
    signatureRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
    signatureField: { width: '45%', alignItems: 'center' },
    signatureImage: { width: 120, height: 40, objectFit: 'contain', marginBottom: 4 },
    signatureLine: { borderBottomWidth: 1, borderBottomColor: '#0f172a', width: '100%', marginBottom: 4 },
    smallText: { fontSize: 9, color: '#475569' },
    footer: {
      position: 'absolute',
      bottom: 20,
      left: 40,
      right: 40,
      fontSize: 8,
      color: '#94a3b8',
      textAlign: 'center',
    },
  });
}
