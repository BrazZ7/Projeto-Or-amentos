import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import type { QuotePdfData } from '../types';
import { resolveImageSrc } from '../image-src';
import { formatCurrency, formatDate, QUOTE_STATUS_LABELS } from '@/lib/utils';

const SIDEBAR_WIDTH = 172;

export function SidebarTemplate({ data }: { data: QuotePdfData }) {
  const { company } = data;
  const styles = buildSidebarStyles(company.primaryColor, company.secondaryColor, company.fontFamily);
  const logo = resolveImageSrc(company.logoUrl);
  const signature = resolveImageSrc(company.signatureUrl);
  const quoteCode = `${data.quotePrefix}-${String(data.number).padStart(4, '0')}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* A barra é fixed para se repetir em todas as páginas quando o
            orçamento tiver itens suficientes para quebrar. */}
        <View style={styles.sidebar} fixed>
          <View>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image, not next/image */}
            {logo && <Image src={logo} style={styles.logo} />}
            <Text style={styles.sidebarCompany}>{company.tradeName || company.legalName}</Text>
            <Text style={styles.sidebarMuted}>
              {company.documentType} {company.document}
            </Text>

            <View style={styles.sidebarDivider} />

            <SidebarField label="Contato" styles={styles}>
              {company.phone && <Text style={styles.sidebarValue}>{company.phone}</Text>}
              {company.whatsapp && <Text style={styles.sidebarValue}>{company.whatsapp}</Text>}
              {company.email && <Text style={styles.sidebarValue}>{company.email}</Text>}
            </SidebarField>

            {company.addressLine && (
              <SidebarField label="Endereço" styles={styles}>
                <Text style={styles.sidebarValue}>{company.addressLine}</Text>
              </SidebarField>
            )}

            <View style={styles.sidebarDivider} />

            <SidebarField label="Cliente" styles={styles}>
              <Text style={styles.sidebarClient}>{data.client.name}</Text>
              {data.client.document && <Text style={styles.sidebarValue}>{data.client.document}</Text>}
              {data.client.phone && <Text style={styles.sidebarValue}>{data.client.phone}</Text>}
              {data.client.email && <Text style={styles.sidebarValue}>{data.client.email}</Text>}
            </SidebarField>

            <SidebarField label="Emissão" styles={styles}>
              <Text style={styles.sidebarValue}>{formatDate(data.issueDate)}</Text>
            </SidebarField>

            <SidebarField label="Válido até" styles={styles}>
              <Text style={styles.sidebarValue}>{formatDate(data.validUntil)}</Text>
            </SidebarField>
          </View>

          <View style={styles.sidebarTotal}>
            <Text style={styles.sidebarTotalLabel}>Total</Text>
            <Text style={styles.sidebarTotalValue}>{formatCurrency(data.total)}</Text>
          </View>
        </View>

        <View style={styles.main}>
          <View style={styles.mainHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Orçamento</Text>
              <Text style={styles.code}>{quoteCode}</Text>
            </View>
            <Text style={styles.statusPill}>{QUOTE_STATUS_LABELS[data.status] || data.status}</Text>
          </View>

          {company.headerText && <Text style={styles.intro}>{company.headerText}</Text>}

          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeadCell, { flex: 1 }]}>Descrição</Text>
            <Text style={[styles.tableHeadCell, { width: 38, textAlign: 'center' }]}>Qtd.</Text>
            <Text style={[styles.tableHeadCell, { width: 62, textAlign: 'right' }]}>Unit.</Text>
            <Text style={[styles.tableHeadCell, { width: 68, textAlign: 'right' }]}>Total</Text>
          </View>

          {data.items.map((item, index) => (
            <View key={index} style={styles.tableRow} wrap={false}>
              <Text style={[styles.tableCell, { flex: 1, paddingRight: 8 }]}>{item.description}</Text>
              <Text style={[styles.tableCell, { width: 38, textAlign: 'center' }]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, { width: 62, textAlign: 'right' }]}>
                {formatCurrency(item.unitPrice)}
              </Text>
              <Text style={[styles.tableCell, styles.tableCellStrong, { width: 68, textAlign: 'right' }]}>
                {formatCurrency(item.total)}
              </Text>
            </View>
          ))}

          <View style={styles.summary} wrap={false}>
            <SummaryLine label="Subtotal" value={formatCurrency(data.subtotal)} styles={styles} />
            <SummaryLine
              label={data.discountType === 'PERCENT' ? `Desconto (${data.discountValue}%)` : 'Desconto'}
              value={`- ${formatCurrency(data.discountAmount)}`}
              styles={styles}
            />
            <SummaryLine label="Frete" value={formatCurrency(data.freight)} styles={styles} />
            <View style={styles.summaryRule} />
            <SummaryLine label="Total" value={formatCurrency(data.total)} styles={styles} strong />
          </View>

          {data.paymentTerms && <Block title="Pagamento" content={data.paymentTerms} styles={styles} />}
          {data.deliveryTerms && <Block title="Prazo de entrega" content={data.deliveryTerms} styles={styles} />}
          {data.warranty && <Block title="Garantia" content={data.warranty} styles={styles} />}
          {data.notes && <Block title="Observações" content={data.notes} styles={styles} />}

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

          <View style={styles.signature} wrap={false}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image, not next/image */}
            {signature && <Image src={signature} style={styles.signatureImage} />}
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>{company.tradeName || company.legalName}</Text>
          </View>
        </View>

        {/* Fora de "main": posição absoluta é relativa ao pai, e main já
            carrega o deslocamento lateral da barra. */}
        {company.footerText && (
          <Text style={styles.footer} fixed>
            {company.footerText}
          </Text>
        )}
      </Page>
    </Document>
  );
}

function SidebarField({
  label,
  children,
  styles,
}: {
  label: string;
  children: React.ReactNode;
  styles: ReturnType<typeof buildSidebarStyles>;
}) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.sidebarLabel}>{label}</Text>
      {children}
    </View>
  );
}

function SummaryLine({
  label,
  value,
  styles,
  strong,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof buildSidebarStyles>;
  strong?: boolean;
}) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
      <Text style={strong ? styles.summaryLabelStrong : styles.summaryLabel}>{label}</Text>
      <Text style={strong ? styles.summaryValueStrong : styles.summaryValue}>{value}</Text>
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
  styles: ReturnType<typeof buildSidebarStyles>;
}) {
  return (
    <View style={styles.block} wrap={false}>
      <Text style={styles.blockTitle}>{title}</Text>
      <Text style={styles.blockText}>{content}</Text>
    </View>
  );
}

function buildSidebarStyles(primary: string, secondary: string, fontFamily: string) {
  return StyleSheet.create({
    page: { fontFamily, fontSize: 10, color: '#1e293b' },
    sidebar: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      width: SIDEBAR_WIDTH,
      backgroundColor: primary,
      paddingHorizontal: 20,
      paddingTop: 32,
      paddingBottom: 24,
      justifyContent: 'space-between',
    },
    logo: { width: 92, height: 40, objectFit: 'contain', marginBottom: 10 },
    sidebarCompany: { fontSize: 13, fontWeight: 700, color: '#ffffff' },
    sidebarMuted: { fontSize: 8, color: 'rgba(255, 255, 255, 0.7)', marginTop: 2 },
    sidebarDivider: {
      height: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.28)',
      marginVertical: 14,
    },
    sidebarLabel: {
      fontSize: 7,
      color: 'rgba(255, 255, 255, 0.6)',
      textTransform: 'uppercase',
      letterSpacing: 1.4,
      marginBottom: 3,
    },
    sidebarValue: { fontSize: 8.5, color: 'rgba(255, 255, 255, 0.9)', marginTop: 1, lineHeight: 1.4 },
    sidebarClient: { fontSize: 11, fontWeight: 700, color: '#ffffff', marginBottom: 1 },
    sidebarTotal: { borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.28)', paddingTop: 12 },
    sidebarTotalLabel: {
      fontSize: 7.5,
      color: 'rgba(255, 255, 255, 0.6)',
      textTransform: 'uppercase',
      letterSpacing: 1.5,
    },
    sidebarTotalValue: { fontSize: 17, fontWeight: 700, color: '#ffffff', marginTop: 3 },

    main: { marginLeft: SIDEBAR_WIDTH, paddingHorizontal: 30, paddingTop: 34, paddingBottom: 44 },
    mainHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
    title: {
      fontSize: 9,
      color: '#94a3b8',
      textTransform: 'uppercase',
      letterSpacing: 3,
    },
    code: { fontSize: 20, fontWeight: 700, color: secondary, marginTop: 2 },
    statusPill: {
      fontSize: 8,
      fontWeight: 700,
      color: primary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      borderWidth: 1,
      borderColor: primary,
      borderRadius: 10,
      paddingVertical: 3,
      paddingHorizontal: 8,
    },
    intro: { fontSize: 9.5, color: '#475569', lineHeight: 1.5, marginBottom: 16 },

    tableHeader: {
      flexDirection: 'row',
      borderBottomWidth: 1.5,
      borderBottomColor: secondary,
      paddingBottom: 5,
    },
    tableHeadCell: {
      fontSize: 7.5,
      fontWeight: 700,
      color: secondary,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    tableRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 7,
      borderBottomWidth: 1,
      borderBottomColor: '#f1f5f9',
    },
    tableCell: { fontSize: 9, color: '#334155', lineHeight: 1.35 },
    tableCellStrong: { fontWeight: 700, color: '#0f172a' },

    summary: { alignSelf: 'flex-end', width: 190, marginTop: 12, marginBottom: 18 },
    summaryLabel: { fontSize: 9, color: '#64748b' },
    summaryValue: { fontSize: 9, color: '#334155' },
    summaryLabelStrong: { fontSize: 11, fontWeight: 700, color: secondary },
    summaryValueStrong: { fontSize: 12, fontWeight: 700, color: primary },
    summaryRule: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 5 },

    block: { marginBottom: 10 },
    blockTitle: {
      fontSize: 8,
      fontWeight: 700,
      color: secondary,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      marginBottom: 2,
    },
    blockText: { fontSize: 9, color: '#475569', lineHeight: 1.5 },

    signature: { alignItems: 'center', marginTop: 22 },
    signatureImage: { width: 120, height: 40, objectFit: 'contain', marginBottom: 2 },
    signatureLine: { width: 170, borderBottomWidth: 1, borderBottomColor: '#cbd5e1', marginBottom: 4 },
    signatureName: { fontSize: 8.5, color: '#64748b' },

    footer: {
      position: 'absolute',
      bottom: 18,
      left: SIDEBAR_WIDTH + 30,
      right: 30,
      fontSize: 7.5,
      color: '#94a3b8',
      textAlign: 'center',
    },
  });
}
