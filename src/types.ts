export enum EstimateStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export interface InventoryItem {
  id: string | number;
  userId?: string;
  workspaceId?: string;
  name: string;
  unit: string;
  price: number;
  stock: number;
  minStock: number;
}

export interface Party {
  id: string | number;
  userId?: string;
  workspaceId?: string;
  name: string;
  customerRefNo?: number;
  balance: number;
  type: 'receive' | 'pay';
  phone: string;
  email?: string;
  billingAddress?: string;
  shippingAddress?: string;
  gstin?: string;
}

export interface Item {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  rate: number;
  tax: number;
  discount: number;
}

export interface Estimate {
  id: string;
  userId?: string;
  workspaceId?: string;
  refNo: number;
  date: string;
  customerName: string;
  customerPhone?: string;
  billingAddress?: string;
  partyId?: string | number;
  customerRefNo?: number;
  items: Item[];
  status: EstimateStatus | string;
  discountValue: number;
  discountType: 'percentage' | 'fixed';
  taxType: string;
  description: string;
  totalAmount: number;
  balance: number;
  isSale?: boolean;
  receivedAmount?: number;
  convertedFromId?: string;
  paymentType?: 'Cash' | 'Cheque' | 'Online' | 'Credit';
  txnType?: string;
}

export interface CompanyData {
  userId?: string;
  workspaceId?: string;
  name: string;
  email: string;
  phone: string;
  landline?: string;
  address: string;
  logo?: string;
  signature?: string;
  terms?: string;
}

export type View = 'HOME' | 'REPORTS' | 'MENU' | 'ESTIMATE_LIST' | 'ESTIMATE_FORM' | 'INVOICE_VIEW' | 'RECEIPT_VIEW' | 'PROFILE_EDIT' | 'SALE_FORM' | 'SALE_LIST' | 'PARTIES_LIST' | 'ITEMS_LIST' | 'PAYMENT_IN_LIST' | 'PAYMENT_IN_FORM';
