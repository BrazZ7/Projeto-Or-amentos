export interface QuotePdfCompany {
  legalName: string;
  tradeName: string | null;
  documentType: string;
  document: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  addressLine: string;
  logoUrl: string | null;
  signatureUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  bankName: string | null;
  bankAgency: string | null;
  bankAccount: string | null;
  pixKey: string | null;
  paymentNotes: string | null;
  headerText: string | null;
  footerText: string | null;
  logoPosition: 'LEFT' | 'CENTER' | 'RIGHT';
}

export interface QuotePdfClient {
  name: string;
  type: string;
  document: string | null;
  email: string | null;
  phone: string | null;
  addressLine: string;
}

export interface QuotePdfItem {
  description: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface QuotePdfData {
  number: number;
  quotePrefix: string;
  status: string;
  issueDate: Date;
  validUntil: Date;
  items: QuotePdfItem[];
  subtotal: number;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  freight: number;
  total: number;
  paymentTerms: string | null;
  deliveryTerms: string | null;
  warranty: string | null;
  notes: string | null;
  company: QuotePdfCompany;
  client: QuotePdfClient;
}
