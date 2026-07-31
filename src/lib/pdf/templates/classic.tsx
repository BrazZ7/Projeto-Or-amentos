import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import type { QuotePdfData } from '../types';
import { formatCurrency, formatDate, QUOTE_STATUS_LABELS } from '@/lib/utils';

export function ClassicTemplate({ data }: { data: QuotePdfData }) {
  const { company } = data;
  const styles = buildStyles(company.primaryColor, company.secondaryColor, company.fontFamily);
  const logoAlign =
    company.logoPosition === 'CENTER'
      ? 'center'
      : company.logoPosition === 'RIGHT'
        ? 'flex-end'
        : 'flex-start';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {company.headerText && <Text style={styles.headerText}>{company.headerText}</Text>}

        <View style={[styles.headerRow, { justifyContent: 'space-between' }]}>
          <View style={{ alignItems: logoAlign, flex: 1 }}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image, not next/image */}
            {company.logoUrl && <Image src={company.logoUrl} style={styles.logo} />}
            <Text style={styles.companyName}>{company.tradeName || company.legalName}</Text>
            <Text style={styles.smallText}>
              {company.documentType}: {company.document}
            </Text>
            {company.addressLine && <Text style={styles.smallText}>{company.addressLine}</Text>}
            <Text style={styles.smallText}>
              {[company.phone, company.whatsapp, company.email].filter(Boolean).join(' · ')}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.title}>ORÇAMENTO</Text>
            <Text style={styles.smallText}>
              Nº {data.quotePrefix}-{String(data.number).padStart(4, '0')}
            </Text>
            <Text style={styles.smallText}>Emissão: {formatDate(data.issueDate)}</Text>
            <Text style={styles.smallText}>Validade: {formatDate(data.validUntil)}</Text>
            <Text style={[styles.statusBadge, { color: company.primaryColor }]}>
              {QUOTE_STATUS_LABELS[data.status] || data.status}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <Text style={styles.clientName}>{data.client.name}</Text>
          {data.client.document && <Text style={styles.smallText}>Documento: {data.client.document}</Text>}
          {data.client.addressLine && <Text style={styles.smallText}>{data.client.addressLine}</Text>}
          <Text style={styles.smallText}>
            {[data.client.phone, data.client.email].filter(Boolean).join(' · ')}
          </Text>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, { flex: 3 }]}>Descrição</Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>Qtd.</Text>
            <Text style={[styles.tableCell, { flex: 1.2, textAlign: 'right' }]}>Vlr. unit.</Text>
            <Text style={[styles.tableCell, { flex: 1.2, textAlign: 'right' }]}>Desconto</Text>
            <Text style={[styles.tableCell, { flex: 1.3, textAlign: 'right' }]}>Total</Text>
          </View>
          {data.items.map((item, index) => (
            <View
              key={index}
              style={index % 2 === 1 ? [styles.tableRow, styles.tableRowAlt] : [styles.tableRow]}
            >
              <View style={{ flex: 3 }}>
                <Text style={styles.tableCell}>{item.description}</Text>
              </View>
              <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>
                {item.quantity}
              </Text>
              <Text style={[styles.tableCell, { flex: 1.2, textAlign: 'right' }]}>
                {formatCurrency(item.unitPrice)}
              </Text>
              <Text style={[styles.tableCell, { flex: 1.2, textAlign: 'right' }]}>
                {formatCurrency(item.discount)}
              </Text>
              <Text style={[styles.tableCell, { flex: 1.3, textAlign: 'right' }]}>
                {formatCurrency(item.total)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.summaryBox}>
          <SummaryLine label="Subtotal" value={formatCurrency(data.subtotal)} />
          <SummaryLine
            label={data.discountType === 'PERCENT' ? `Desconto (${data.discountValue}%)` : 'Desconto'}
            value={`- ${formatCurrency(data.discountAmount)}`}
          />
          <SummaryLine label="Frete" value={formatCurrency(data.freight)} />
          <View style={styles.totalDivider} />
          <SummaryLine
            label="Total"
            value={formatCurrency(data.total)}
            bold
            color={company.primaryColor}
          />
        </View>

        <View style={styles.section}>
          {data.paymentTerms && (
            <TextBlock title="Condições de pagamento" content={data.paymentTerms} styles={styles} />
          )}
          {data.deliveryTerms && (
            <TextBlock title="Prazo de entrega" content={data.deliveryTerms} styles={styles} />
          )}
          {data.warranty && <TextBlock title="Garantia" content={data.warranty} styles={styles} />}
          {data.notes && <TextBlock title="Observações" content={data.notes} styles={styles} />}
          {(company.bankName || company.pixKey) && (
            <TextBlock
              title="Dados para pagamento"
              content={[
                company.bankName && `Banco: ${company.bankName}`,
                company.bankAgency && `Agência: ${company.bankAgency}`,
                company.bankAccount && `Conta: ${company.bankAccount}`,
                company.pixKey && `PIX: ${company.pixKey}`,
                company.paymentNotes,
              ]
                .filter(Boolean)
                .join('\n')}
              styles={styles}
            />
          )}
        </View>

        {company.signatureUrl && (
          <View style={styles.signatureBox}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image, not next/image */}
            <Image src={company.signatureUrl} style={styles.signatureImage} />
            <Text style={styles.smallText}>{company.tradeName || company.legalName}</Text>
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

function SummaryLine({
  label,
  value,
  bold,
  color,
}: {
  label: string;
  value: string;
  bold?: boolean;
  color?: string;
}) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
      <Text style={{ fontSize: bold ? 12 : 10, fontWeight: bold ? 700 : 400 }}>{label}</Text>
      <Text style={{ fontSize: bold ? 13 : 10, fontWeight: bold ? 700 : 400, color: color || '#000' }}>
        {value}
      </Text>
    </View>
  );
}

function TextBlock({
  title,
  content,
  styles,
}: {
  title: string;
  content: string;
  styles: ReturnType<typeof buildStyles>;
}) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.bodyText}>{content}</Text>
    </View>
  );
}

export function buildStyles(primaryColor: string, secondaryColor: string, fontFamily: string) {
  return StyleSheet.create({
    page: {
      padding: 36,
      fontFamily,
      fontSize: 10,
      color: '#1e293b',
    },
    headerText: {
      fontSize: 9,
      color: '#64748b',
      marginBottom: 8,
      textAlign: 'center',
    },
    headerRow: { flexDirection: 'row', marginBottom: 12 },
    logo: { width: 90, height: 50, objectFit: 'contain', marginBottom: 4 },
    companyName: { fontSize: 13, fontWeight: 700, color: secondaryColor },
    title: { fontSize: 18, fontWeight: 700, color: primaryColor },
    smallText: { fontSize: 9, color: '#475569', marginTop: 1 },
    statusBadge: { fontSize: 10, fontWeight: 700, marginTop: 4 },
    divider: { borderBottomWidth: 1, borderBottomColor: '#e2e8f0', marginVertical: 8 },
    section: { marginBottom: 10 },
    sectionTitle: {
      fontSize: 10,
      fontWeight: 700,
      color: secondaryColor,
      marginBottom: 3,
      textTransform: 'uppercase',
    },
    clientName: { fontSize: 12, fontWeight: 700, marginBottom: 2 },
    bodyText: { fontSize: 9.5, color: '#334155', lineHeight: 1.4 },
    table: { marginTop: 6, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: 6,
      paddingHorizontal: 6,
      borderBottomWidth: 1,
      borderBottomColor: '#e2e8f0',
    },
    tableRowAlt: { backgroundColor: '#f8fafc' },
    tableHeader: { backgroundColor: '#f1f5f9' },
    tableCell: { fontSize: 9, color: '#1e293b' },
    summaryBox: {
      alignSelf: 'flex-end',
      width: 220,
      marginBottom: 14,
      padding: 10,
      backgroundColor: '#f8fafc',
      borderRadius: 4,
    },
    totalDivider: { borderBottomWidth: 1, borderBottomColor: '#cbd5e1', marginVertical: 4 },
    signatureBox: { marginTop: 20, alignItems: 'center' },
    signatureImage: { width: 140, height: 50, objectFit: 'contain', marginBottom: 4 },
    footer: {
      position: 'absolute',
      bottom: 20,
      left: 36,
      right: 36,
      fontSize: 8,
      color: '#94a3b8',
      textAlign: 'center',
      borderTopWidth: 1,
      borderTopColor: '#e2e8f0',
      paddingTop: 6,
    },
  });
}
