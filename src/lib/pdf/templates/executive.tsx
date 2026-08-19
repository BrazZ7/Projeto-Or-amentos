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
import { resolveImageSrc } from '../image-src';
import { formatCurrency, formatDate } from '@/lib/utils';

export function ExecutiveTemplate({ data }: { data: QuotePdfData }) {
  const { company } = data;
  const styles = buildExecutiveStyles(company.primaryColor, company.secondaryColor, company.fontFamily);
  const logo = resolveImageSrc(company.logoUrl);
  const signature = resolveImageSrc(company.signatureUrl);
  const quoteCode = `${data.quotePrefix}-${String(data.number).padStart(4, '0')}`;
  const paymentData = [
    company.bankName && `Banco: ${company.bankName}`,
    company.bankAgency && `Agência: ${company.bankAgency}`,
    company.bankAccount && `Conta: ${company.bankAccount}`,
    company.pixKey && `PIX: ${company.pixKey}`,
  ].filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.hero}>
          <Svg style={styles.heroAccent} viewBox="0 0 600 5" preserveAspectRatio="none">
            <Defs>
              <LinearGradient id="heroAccent" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={company.primaryColor} />
                <Stop offset="1" stopColor={company.primaryColor} stopOpacity={0.15} />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="600" height="5" fill="url(#heroAccent)" />
          </Svg>

          <View style={styles.heroInner}>
            <View style={{ flex: 1 }}>
              {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image, not next/image */}
              {logo && <Image src={logo} style={styles.logo} />}
              <Text style={styles.heroCompany}>{company.tradeName || company.legalName}</Text>
              <Text style={styles.heroMuted}>
                {company.documentType} {company.document}
              </Text>
              <Text style={styles.heroMuted}>
                {[company.phone, company.email].filter(Boolean).join('  ·  ')}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.heroEyebrow}>Orçamento</Text>
              <Text style={styles.heroCode}>{quoteCode}</Text>
              <Text style={styles.heroMuted}>Emitido em {formatDate(data.issueDate)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <SummaryCard label="Preparado para" value={data.client.name} styles={styles} />
          <SummaryCard label="Proposta válida até" value={formatDate(data.validUntil)} styles={styles} />
          <SummaryCard
            label="Investimento"
            value={formatCurrency(data.total)}
            styles={styles}
            highlight
          />
        </View>

        <View style={styles.content}>
          {company.headerText && <Text style={styles.intro}>{company.headerText}</Text>}

          <SectionLabel title="Escopo" styles={styles} />
          <View style={styles.items}>
            {data.items.map((item, index) => (
              <View key={index} style={styles.itemRow} wrap={false}>
                <Text style={styles.itemIndex}>{String(index + 1).padStart(2, '0')}</Text>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.itemName}>{item.description}</Text>
                  <Text style={styles.itemMeta}>
                    {item.quantity} × {formatCurrency(item.unitPrice)}
                    {item.discount > 0 ? `   ·   desconto ${formatCurrency(item.discount)}` : ''}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>{formatCurrency(item.total)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.totalBlock} wrap={false}>
            <View style={{ flex: 1, gap: 3 }}>
              <TotalLine label="Subtotal" value={formatCurrency(data.subtotal)} styles={styles} />
              <TotalLine
                label={data.discountType === 'PERCENT' ? `Desconto (${data.discountValue}%)` : 'Desconto'}
                value={`- ${formatCurrency(data.discountAmount)}`}
                styles={styles}
              />
              <TotalLine label="Frete" value={formatCurrency(data.freight)} styles={styles} />
            </View>
            <View style={styles.totalRight}>
              <Text style={styles.totalCaption}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(data.total)}</Text>
            </View>
          </View>

          <View style={styles.conditions}>
            {data.paymentTerms && (
              <ConditionBlock title="Pagamento" content={data.paymentTerms} styles={styles} />
            )}
            {data.deliveryTerms && (
              <ConditionBlock title="Prazo de entrega" content={data.deliveryTerms} styles={styles} />
            )}
            {data.warranty && <ConditionBlock title="Garantia" content={data.warranty} styles={styles} />}
            {data.notes && <ConditionBlock title="Observações" content={data.notes} styles={styles} />}
          </View>

          {paymentData.length > 0 && (
            <View style={styles.paymentBox} wrap={false}>
              <Text style={styles.paymentTitle}>Dados para pagamento</Text>
              <Text style={styles.paymentText}>{paymentData.join('   ·   ')}</Text>
              {company.paymentNotes && <Text style={styles.paymentText}>{company.paymentNotes}</Text>}
            </View>
          )}

          <View style={styles.signatureRow} wrap={false}>
            <View style={{ alignItems: 'center' }}>
              {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image, not next/image */}
              {signature && <Image src={signature} style={styles.signatureImage} />}
              <View style={styles.signatureLine} />
              <Text style={styles.signatureName}>{company.tradeName || company.legalName}</Text>
            </View>
          </View>
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

function SummaryCard({
  label,
  value,
  styles,
  highlight,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof buildExecutiveStyles>;
  highlight?: boolean;
}) {
  return (
    <View style={highlight ? [styles.summaryCard, styles.summaryCardHighlight] : [styles.summaryCard]}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={highlight ? [styles.summaryValue, styles.summaryValueHighlight] : [styles.summaryValue]}>
        {value}
      </Text>
    </View>
  );
}

function SectionLabel({ title, styles }: { title: string; styles: ReturnType<typeof buildExecutiveStyles> }) {
  return (
    <View style={styles.sectionLabelRow}>
      <Text style={styles.sectionLabel}>{title}</Text>
      <View style={styles.sectionRule} />
    </View>
  );
}

function TotalLine({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof buildExecutiveStyles>;
}) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', maxWidth: 190 }}>
      <Text style={styles.totalLineLabel}>{label}</Text>
      <Text style={styles.totalLineValue}>{value}</Text>
    </View>
  );
}

function ConditionBlock({
  title,
  content,
  styles,
}: {
  title: string;
  content: string;
  styles: ReturnType<typeof buildExecutiveStyles>;
}) {
  return (
    <View style={styles.conditionBlock}>
      <Text style={styles.conditionTitle}>{title}</Text>
      <Text style={styles.conditionText}>{content}</Text>
    </View>
  );
}

function buildExecutiveStyles(primary: string, secondary: string, fontFamily: string) {
  return StyleSheet.create({
    page: { fontFamily, fontSize: 10, color: '#1e293b', paddingBottom: 54 },
    hero: { backgroundColor: secondary },
    heroAccent: { height: 5, width: '100%' },
    heroInner: { flexDirection: 'row', paddingHorizontal: 40, paddingTop: 26, paddingBottom: 34 },
    logo: { width: 96, height: 42, objectFit: 'contain', marginBottom: 10 },
    heroCompany: { fontSize: 15, fontWeight: 700, color: '#ffffff' },
    heroMuted: { fontSize: 9, color: 'rgba(255, 255, 255, 0.7)', marginTop: 3 },
    heroEyebrow: {
      fontSize: 8.5,
      color: 'rgba(255, 255, 255, 0.7)',
      textTransform: 'uppercase',
      letterSpacing: 3,
    },
    heroCode: { fontSize: 22, fontWeight: 700, color: '#ffffff', marginTop: 2, marginBottom: 4 },

    summaryRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: -20,
      marginHorizontal: 40,
    },
    summaryCard: {
      flex: 1,
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#e2e8f0',
      borderRadius: 6,
      paddingVertical: 10,
      paddingHorizontal: 12,
    },
    summaryCardHighlight: { borderColor: primary, borderWidth: 1.5 },
    summaryLabel: {
      fontSize: 7.5,
      color: '#94a3b8',
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      marginBottom: 3,
    },
    summaryValue: { fontSize: 11, fontWeight: 700, color: secondary },
    summaryValueHighlight: { color: primary, fontSize: 13 },

    content: { paddingHorizontal: 40, paddingTop: 22 },
    intro: { fontSize: 10, lineHeight: 1.5, color: '#475569', marginBottom: 18 },

    sectionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    sectionLabel: {
      fontSize: 8.5,
      fontWeight: 700,
      color: secondary,
      textTransform: 'uppercase',
      letterSpacing: 2,
    },
    sectionRule: { flex: 1, height: 1, backgroundColor: '#e2e8f0' },

    items: { marginBottom: 16 },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 9,
      borderBottomWidth: 1,
      borderBottomColor: '#f1f5f9',
    },
    itemIndex: {
      width: 26,
      fontSize: 9,
      fontWeight: 700,
      color: primary,
    },
    itemName: { fontSize: 10.5, fontWeight: 700, color: '#0f172a' },
    itemMeta: { fontSize: 8.5, color: '#94a3b8', marginTop: 2 },
    itemTotal: { fontSize: 11, fontWeight: 700, color: '#0f172a', textAlign: 'right', width: 82 },

    totalBlock: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: secondary,
      borderRadius: 8,
      paddingVertical: 16,
      paddingHorizontal: 20,
      marginBottom: 18,
    },
    totalLineLabel: { fontSize: 8.5, color: 'rgba(255, 255, 255, 0.6)' },
    totalLineValue: { fontSize: 8.5, color: 'rgba(255, 255, 255, 0.8)' },
    totalRight: { alignItems: 'flex-end' },
    totalCaption: {
      fontSize: 8,
      color: 'rgba(255, 255, 255, 0.6)',
      textTransform: 'uppercase',
      letterSpacing: 2,
    },
    totalValue: { fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 2 },

    conditions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 14 },
    conditionBlock: { width: '47%' },
    conditionTitle: {
      fontSize: 8,
      fontWeight: 700,
      color: primary,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      marginBottom: 3,
    },
    conditionText: { fontSize: 9, color: '#475569', lineHeight: 1.5 },

    paymentBox: {
      backgroundColor: '#f8fafc',
      borderLeftWidth: 3,
      borderLeftColor: primary,
      borderRadius: 4,
      padding: 10,
      marginBottom: 18,
    },
    paymentTitle: {
      fontSize: 8,
      fontWeight: 700,
      color: secondary,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      marginBottom: 3,
    },
    paymentText: { fontSize: 9, color: '#475569', marginTop: 1 },

    signatureRow: { alignItems: 'center', marginTop: 16 },
    signatureImage: { width: 130, height: 44, objectFit: 'contain', marginBottom: 2 },
    signatureLine: { width: 180, borderBottomWidth: 1, borderBottomColor: '#cbd5e1', marginBottom: 4 },
    signatureName: { fontSize: 9, color: '#64748b' },

    footer: {
      position: 'absolute',
      bottom: 22,
      left: 40,
      right: 40,
      fontSize: 7.5,
      color: '#94a3b8',
      textAlign: 'center',
      borderTopWidth: 1,
      borderTopColor: '#e2e8f0',
      paddingTop: 8,
    },
  });
}
