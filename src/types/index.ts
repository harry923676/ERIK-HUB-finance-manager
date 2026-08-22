export type OrderStatus = 'new' | 'processing' | 'completed' | 'cancelled';
export type PaymentStatus = 'fully_paid' | 'partially_paid' | 'pending';
export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'UPI' | 'Credit Card' | 'Debit Card' | 'Cheque' | 'Other';

export interface OrderItem {
  id: string;
  product_name: string;
  rate: number;
  quantity: number;
  total_amount: number;
}

export interface Product {
  id: string;
  name: string;
  default_rate?: number;
  category?: string;
  unit?: string;
  description?: string;
  sku?: string;
}

export interface ExpenseProduct {
  id: string;
  name: string;
  default_rate: number;
  category: string;
  unit?: string;
  default_vendor?: string;
  description?: string;
}

export interface OrderPayment {
  id: string;
  order_id: string;
  payment_date: string;
  amount: number;
  payment_method: PaymentMethod;
  reference_number?: string;
  notes?: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  customer_business?: string;
  customer_address?: string;
  order_date: string;
  delivery_date?: string;
  status: OrderStatus;
  items: OrderItem[];
  total_amount: number;
  payments: OrderPayment[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Expenditure {
  id: string;
  expenditure_date: string;
  category: string;
  description: string;
  vendor?: string;
  rate: number;
  quantity: number;
  total_amount: number;
  payment_method: PaymentMethod;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  business_name?: string;
  address?: string;
  notes?: string;
  created_at: string;
}

export type ActivityType = 
  | 'order_created'
  | 'order_updated'
  | 'order_deleted'
  | 'payment_added'
  | 'payment_updated'
  | 'payment_deleted'
  | 'expenditure_added'
  | 'expenditure_updated'
  | 'expenditure_deleted';

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: ActivityType;
  title: string;
  description: string;
  amount?: number;
  order_id?: string;
}

export interface BusinessSettings {
  business_name: string;
  tagline: string;
  owner_name: string;
  phone: string;
  email: string;
  address: string;
  tax_id: string; // GSTIN / Tax Number
  currency_symbol: string;
  currency_code: string;
  financial_year_start: string; // e.g. '04-01' (April 1st)
  invoice_prefix: string;
  notes_default: string;
}

export type DateFilterType =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'this_month'
  | 'last_month'
  | 'last_3_months'
  | 'last_6_months'
  | 'this_year'
  | 'financial_year'
  | 'custom'
  | 'all';

export interface DateRange {
  type: DateFilterType;
  startDate?: string;
  endDate?: string;
  label: string;
}

export interface FinancialSummary {
  totalOrders: number;
  totalOrderValue: number;
  totalPaymentsReceived: number;
  totalPendingPayments: number;
  pendingOrdersCount: number;
  fullyPaidOrdersCount: number;
  partiallyPaidOrdersCount: number;
  totalExpenditure: number;
  runningProfit: number;
  profitMarginPercent: number;
  previousPeriod?: {
    totalOrders: number;
    totalOrderValue: number;
    totalPaymentsReceived: number;
    totalExpenditure: number;
    runningProfit: number;
  };
  growth: {
    ordersGrowth: number;
    revenueGrowth: number;
    expenditureGrowth: number;
    profitGrowth: number;
  };
}

export interface MonthlyFinancialRecord {
  monthKey: string;
  monthName: string;
  year: number;
  revenue: number;
  expenditure: number;
  profit: number;
  orderValue: number;
  ordersCount: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}
