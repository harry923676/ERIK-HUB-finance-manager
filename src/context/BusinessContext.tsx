import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Order, 
  OrderItem, 
  OrderPayment, 
  Expenditure, 
  Customer, 
  ActivityLog, 
  BusinessSettings, 
  DateFilterType, 
  FinancialSummary,
  MonthlyFinancialRecord,
  CategoryBreakdown,
  Product,
  ExpenseProduct
} from '../types';
import { 
  calculateFinancialSummary, 
  getMonthlyFinancials, 
  getExpenditureCategoryBreakdown,
  aggregateCustomerStats,
  calculateOrderTotal,
  calculateItemTotal
} from '../utils/calculations';
import { getSampleData, defaultSettings, defaultCategories, defaultProducts, defaultExpenseProducts, defaultExpensePurposes } from '../utils/sampleData';
import { 
  downloadCSVFile, 
  generateUnifiedBusinessCSV, 
  generateOrdersCSV, 
  generateExpendituresCSV, 
  generateCustomersCSV, 
  generateProductsCSV 
} from '../utils/csvUtils';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface BusinessContextType {
  // Data
  orders: Order[];
  expenditures: Expenditure[];
  customers: Customer[];
  activityLogs: ActivityLog[];
  settings: BusinessSettings;
  categories: string[];
  products: Product[];
  expenseProducts: ExpenseProduct[];
  expensePurposes: string[];
  
  // Navigation & View State
  activeTab: string;
  setActiveTab: (tab: string) => void;
  dateFilter: DateFilterType;
  customStartDate: string;
  customEndDate: string;
  setDateFilter: (type: DateFilterType, customStart?: string, customEnd?: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Modals & Active selections
  selectedOrderForDetail: Order | null;
  setSelectedOrderForDetail: (order: Order | null) => void;
  selectedOrderForPayment: Order | null;
  setSelectedOrderForPayment: (order: Order | null) => void;
  selectedOrderForInvoice: Order | null;
  setSelectedOrderForInvoice: (order: Order | null) => void;
  orderModalOpen: boolean;
  setOrderModalOpen: (open: boolean) => void;
  isOrderModalOpen: boolean;
  setIsOrderModalOpen: (open: boolean) => void;
  orderToEdit: Order | null;
  setOrderToEdit: (order: Order | null) => void;
  expenditureModalOpen: boolean;
  setExpenditureModalOpen: (open: boolean) => void;
  isExpenditureModalOpen: boolean;
  setIsExpenditureModalOpen: (open: boolean) => void;
  customDateModalOpen: boolean;
  setCustomDateModalOpen: (open: boolean) => void;
  selectedCustomerForDetail: Customer | null;
  setSelectedCustomerForDetail: (customer: Customer | null) => void;

  // Actions - Orders
  addOrder: (orderData: {
    order_number?: string;
    customer_name: string;
    customer_business?: string;
    customer_phone?: string;
    customer_email?: string;
    customer_address?: string;
    order_date: string;
    delivery_date?: string;
    status: Order['status'];
    items: { product_name: string; rate: number; quantity: number }[];
    notes?: string;
    initial_payment?: {
      amount: number;
      payment_method: OrderPayment['payment_method'];
      reference_number?: string;
      notes?: string;
    };
  }) => Order;
  updateOrder: (id: string, orderData: Partial<Order>) => void;
  deleteOrder: (id: string) => void;

  // Actions - Payments
  addPaymentToOrder: (
    orderId: string, 
    paymentData: { 
      amount: number; 
      payment_date: string; 
      payment_method: OrderPayment['payment_method']; 
      reference_number?: string; 
      notes?: string 
    }
  ) => void;
  updatePayment: (orderId: string, paymentId: string, paymentData: Partial<OrderPayment>) => void;
  deletePayment: (orderId: string, paymentId: string) => void;

  // Actions - Expenditures
  addExpenditure: (expData: {
    expenditure_date: string;
    category: string;
    description: string;
    vendor?: string;
    rate: number;
    quantity: number;
    total_amount?: number;
    payment_method: Expenditure['payment_method'];
    notes?: string;
  }) => Expenditure;
  updateExpenditure: (id: string, expData: Partial<Expenditure>) => void;
  deleteExpenditure: (id: string) => void;
  addCategory: (categoryName: string) => void;
  deleteCategory: (categoryName: string) => void;

  // Actions - Customers
  addCustomer: (custData: Omit<Customer, 'id' | 'created_at'>) => Customer;
  updateCustomer: (id: string, custData: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Actions - Products & Catalogue
  addProduct: (prodData: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, prodData: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Actions - Expense Products (Cost / Material Items)
  addExpenseProduct: (prodData: Omit<ExpenseProduct, 'id'>) => ExpenseProduct;
  updateExpenseProduct: (id: string, prodData: Partial<ExpenseProduct>) => void;
  deleteExpenseProduct: (id: string) => void;

  // Actions - Expense Purposes
  addExpensePurpose: (purpose: string) => void;
  deleteExpensePurpose: (purpose: string) => void;

  // Actions - Settings & Data management
  updateSettings: (settingsData: Partial<BusinessSettings>) => void;
  loadDemoData: () => void;
  resetToSampleData: () => void;
  clearAllData: () => void;
  exportDataJSON: () => void;
  exportDataAsJSON: () => void;
  importDataJSON: (jsonStr: string) => boolean;
  importDataFromJSON: (jsonStr: string) => boolean;
  exportAllDataCSV: () => void;
  exportOrdersCSV: () => void;
  exportExpendituresCSV: () => void;
  exportCustomersCSV: () => void;
  exportProductsCSV: () => void;
  importParsedCSVData: (
    data: {
      orders?: Order[];
      expenditures?: Expenditure[];
      customers?: Customer[];
      products?: Product[];
      settings?: Partial<BusinessSettings>;
    },
    mode: 'merge' | 'replace'
  ) => boolean;

  // Computed Values
  financialSummary: FinancialSummary;
  monthlyFinancials: MonthlyFinancialRecord[];
  categoryBreakdowns: CategoryBreakdown[];
  customerStats: (Customer & {
    totalOrders: number;
    totalOrderValue: number;
    totalPaid: number;
    totalOutstanding: number;
    recentOrders: Order[];
  })[];

  // Theme & Toasts
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastItem['type'], duration?: number) => void;
  removeToast: (id: string) => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ORDERS: 'bizpulse_orders_v1',
  EXPENDITURES: 'bizpulse_expenditures_v1',
  CUSTOMERS: 'bizpulse_customers_v1',
  LOGS: 'bizpulse_logs_v1',
  SETTINGS: 'bizpulse_settings_v1',
  CATEGORIES: 'bizpulse_categories_v1',
  PRODUCTS: 'bizpulse_products_v1',
  EXPENSE_PRODUCTS: 'bizpulse_expense_products_v1',
  EXPENSE_PURPOSES: 'bizpulse_expense_purposes_v1',
  THEME: 'bizpulse_theme_v1'
};

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state with persistent storage or sample data fallback
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return getSampleData().orders;
  });

  const [expenditures, setExpenditures] = useState<Expenditure[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EXPENDITURES);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return getSampleData().expenditures;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return getSampleData().customers;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return defaultProducts;
  });

  const [expenseProducts, setExpenseProducts] = useState<ExpenseProduct[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EXPENSE_PRODUCTS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return defaultExpenseProducts;
  });

  const [expensePurposes, setExpensePurposes] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EXPENSE_PURPOSES);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return defaultExpensePurposes;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return getSampleData().activityLogs;
  });

  const [settings, setSettings] = useState<BusinessSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) return { ...defaultSettings, ...JSON.parse(stored) };
    } catch (e) {
      console.error(e);
    }
    return defaultSettings;
  });

  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return defaultCategories;
  });

  // UI state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [dateFilter, setDateFilterState] = useState<DateFilterType>('this_month');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & drawers
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);
  const [selectedCustomerForDetail, setSelectedCustomerForDetail] = useState<Customer | null>(null);
  const [orderModalOpen, setOrderModalOpen] = useState<boolean>(false);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);
  const [expenditureModalOpen, setExpenditureModalOpen] = useState<boolean>(false);
  const [expenditureToEdit, setExpenditureToEdit] = useState<Expenditure | null>(null);
  const [customDateModalOpen, setCustomDateModalOpen] = useState<boolean>(false);

  // Dark Mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.THEME);
      if (stored) return stored === 'dark';
    } catch (e) {}
    return false;
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {}
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENDITURES, JSON.stringify(expenditures));
    } catch (e) {}
  }, [expenditures]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    } catch (e) {}
  }, [customers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(activityLogs));
    } catch (e) {}
  }, [activityLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {}
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {}
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {}
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSE_PRODUCTS, JSON.stringify(expenseProducts));
    } catch (e) {}
  }, [expenseProducts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSE_PURPOSES, JSON.stringify(expensePurposes));
    } catch (e) {}
  }, [expensePurposes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, isDarkMode ? 'dark' : 'light');
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // Toast Helper
  const showToast = useCallback((message: string, type: ToastItem['type'] = 'success', duration: number = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Helper to log activities
  const logActivity = useCallback((
    type: ActivityLog['type'],
    title: string,
    description: string,
    amount?: number,
    order_id?: string
  ) => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      type,
      title,
      description,
      amount,
      order_id
    };
    setActivityLogs(prev => [newLog, ...prev.slice(0, 49)]); // Keep top 50
  }, []);

  const setDateFilter = useCallback((type: DateFilterType, customStart?: string, customEnd?: string) => {
    setDateFilterState(type);
    if (customStart) setCustomStartDate(customStart);
    if (customEnd) setCustomEndDate(customEnd);
  }, []);

  // Auto-sync customer entity from order
  const syncCustomerFromOrder = useCallback((
    name: string,
    phone?: string,
    email?: string,
    business_name?: string,
    address?: string
  ) => {
    if (!name || !name.trim()) return;
    const cleanName = name.trim();
    
    setCustomers(prev => {
      const existing = prev.find(c => 
        c.name.toLowerCase() === cleanName.toLowerCase() ||
        (email && c.email && c.email.toLowerCase() === email.toLowerCase()) ||
        (phone && c.phone && c.phone === phone)
      );

      if (existing) {
        // Update customer details if missing
        return prev.map(c => {
          if (c.id === existing.id) {
            return {
              ...c,
              phone: phone || c.phone,
              email: email || c.email,
              business_name: business_name || c.business_name,
              address: address || c.address
            };
          }
          return c;
        });
      }

      // Create new customer
      const newCust: Customer = {
        id: `cust-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: cleanName,
        phone,
        email,
        business_name,
        address,
        created_at: new Date().toISOString()
      };
      return [...prev, newCust];
    });
  }, []);

  // ORDER CRUD
  const addOrder = useCallback((orderData: {
    order_number?: string;
    customer_name: string;
    customer_business?: string;
    customer_phone?: string;
    customer_email?: string;
    customer_address?: string;
    order_date: string;
    delivery_date?: string;
    status: Order['status'];
    items: { product_name: string; rate: number; quantity: number }[];
    notes?: string;
    initial_payment?: {
      amount: number;
      payment_method: OrderPayment['payment_method'];
      reference_number?: string;
      notes?: string;
    };
  }): Order => {
    const orderId = `ord-${Date.now()}`;
    const autoNumber = orderData.order_number?.trim() || `${settings.invoice_prefix || 'ORD-'}${orders.length + 101}`;

    const items: OrderItem[] = orderData.items.map((it, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      product_name: it.product_name,
      rate: Number(it.rate),
      quantity: Number(it.quantity),
      total_amount: calculateItemTotal(it.rate, it.quantity)
    }));

    const total_amount = calculateOrderTotal(items);
    const payments: OrderPayment[] = [];

    if (orderData.initial_payment && orderData.initial_payment.amount > 0) {
      payments.push({
        id: `pay-${Date.now()}`,
        order_id: orderId,
        payment_date: orderData.order_date,
        amount: Number(orderData.initial_payment.amount),
        payment_method: orderData.initial_payment.payment_method || 'Bank Transfer',
        reference_number: orderData.initial_payment.reference_number,
        notes: orderData.initial_payment.notes || 'Initial Advance',
        created_at: new Date().toISOString()
      });
    }

    const newOrder: Order = {
      id: orderId,
      order_number: autoNumber,
      customer_name: orderData.customer_name.trim(),
      customer_business: orderData.customer_business?.trim(),
      customer_phone: orderData.customer_phone?.trim(),
      customer_email: orderData.customer_email?.trim(),
      customer_address: orderData.customer_address?.trim(),
      order_date: orderData.order_date,
      delivery_date: orderData.delivery_date,
      status: orderData.status,
      items,
      total_amount,
      payments,
      notes: orderData.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setOrders(prev => [newOrder, ...prev]);

    // Sync Customer
    syncCustomerFromOrder(
      newOrder.customer_name,
      newOrder.customer_phone,
      newOrder.customer_email,
      newOrder.customer_business,
      newOrder.customer_address
    );

    // Log Activity
    logActivity(
      'order_created',
      'Order Created',
      `New order ${newOrder.order_number} for ${newOrder.customer_name} totaling ${settings.currency_symbol}${newOrder.total_amount.toLocaleString()}`,
      newOrder.total_amount,
      newOrder.id
    );

    if (payments.length > 0) {
      logActivity(
        'payment_added',
        'Advance Payment Recorded',
        `Payment of ${settings.currency_symbol}${payments[0].amount.toLocaleString()} received for ${newOrder.order_number}`,
        payments[0].amount,
        newOrder.id
      );
    }

    showToast(`Order ${newOrder.order_number} created successfully!`, 'success');
    return newOrder;
  }, [orders.length, settings.invoice_prefix, settings.currency_symbol, syncCustomerFromOrder, logActivity, showToast]);

  const updateOrder = useCallback((id: string, orderData: Partial<Order>) => {
    setOrders(prev => prev.map(o => {
      if (o.id === id) {
        let updatedItems = o.items;
        if (orderData.items) {
          updatedItems = orderData.items.map(it => ({
            ...it,
            total_amount: calculateItemTotal(it.rate, it.quantity)
          }));
        }

        const total_amount = orderData.items ? calculateOrderTotal(updatedItems) : (orderData.total_amount ?? o.total_amount);

        const updated: Order = {
          ...o,
          ...orderData,
          items: updatedItems,
          total_amount,
          updated_at: new Date().toISOString()
        };

        // If customer details were updated, sync customer directory
        if (orderData.customer_name) {
          syncCustomerFromOrder(
            updated.customer_name,
            updated.customer_phone,
            updated.customer_email,
            updated.customer_business,
            updated.customer_address
          );
        }

        return updated;
      }
      return o;
    }));

    // Update active modal order if matching
    setSelectedOrderForDetail(prev => prev && prev.id === id ? { ...prev, ...orderData } : prev);

    logActivity('order_updated', 'Order Updated', `Order ${id} details updated.`);
    showToast('Order updated successfully', 'success');
  }, [syncCustomerFromOrder, logActivity, showToast]);

  const deleteOrder = useCallback((id: string) => {
    const target = orders.find(o => o.id === id);
    if (!target) return;

    setOrders(prev => prev.filter(o => o.id !== id));
    if (selectedOrderForDetail?.id === id) setSelectedOrderForDetail(null);
    if (selectedOrderForPayment?.id === id) setSelectedOrderForPayment(null);
    if (selectedOrderForInvoice?.id === id) setSelectedOrderForInvoice(null);

    logActivity('order_deleted', 'Order Deleted', `Order ${target.order_number} deleted.`);
    showToast(`Order ${target.order_number} deleted and financial calculations updated.`, 'info');
  }, [orders, selectedOrderForDetail, selectedOrderForPayment, selectedOrderForInvoice, logActivity, showToast]);

  // PAYMENT CRUD
  const addPaymentToOrder = useCallback((
    orderId: string,
    paymentData: { 
      amount: number; 
      payment_date: string; 
      payment_method: OrderPayment['payment_method']; 
      reference_number?: string; 
      notes?: string 
    }
  ) => {
    const paymentAmount = Number(paymentData.amount);
    if (paymentAmount <= 0) {
      showToast('Payment amount must be greater than zero.', 'error');
      return;
    }

    const newPayment: OrderPayment = {
      id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      order_id: orderId,
      payment_date: paymentData.payment_date || new Date().toISOString().split('T')[0],
      amount: paymentAmount,
      payment_method: paymentData.payment_method || 'Cash',
      reference_number: paymentData.reference_number?.trim(),
      notes: paymentData.notes?.trim(),
      created_at: new Date().toISOString()
    };

    let targetOrderNumber = '';

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        targetOrderNumber = o.order_number;
        const updatedPayments = [...o.payments, newPayment];
        return {
          ...o,
          payments: updatedPayments,
          updated_at: new Date().toISOString()
        };
      }
      return o;
    }));

    // Update active modal references
    setSelectedOrderForDetail(prev => {
      if (prev && prev.id === orderId) {
        return {
          ...prev,
          payments: [...prev.payments, newPayment]
        };
      }
      return prev;
    });

    logActivity(
      'payment_added',
      'Payment Received',
      `Payment of ${settings.currency_symbol}${paymentAmount.toLocaleString()} recorded for ${targetOrderNumber || orderId} via ${paymentData.payment_method}.`,
      paymentAmount,
      orderId
    );

    showToast(`Payment of ${settings.currency_symbol}${paymentAmount.toLocaleString()} recorded successfully!`, 'success');
  }, [settings.currency_symbol, logActivity, showToast]);

  const updatePayment = useCallback((orderId: string, paymentId: string, paymentData: Partial<OrderPayment>) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updatedPayments = o.payments.map(p => {
          if (p.id === paymentId) {
            return {
              ...p,
              ...paymentData,
              amount: paymentData.amount !== undefined ? Number(paymentData.amount) : p.amount
            };
          }
          return p;
        });
        return { ...o, payments: updatedPayments, updated_at: new Date().toISOString() };
      }
      return o;
    }));

    setSelectedOrderForDetail(prev => {
      if (prev && prev.id === orderId) {
        return {
          ...prev,
          payments: prev.payments.map(p => p.id === paymentId ? { ...p, ...paymentData } : p)
        };
      }
      return prev;
    });

    logActivity('payment_updated', 'Payment Updated', `Payment record updated.`);
    showToast('Payment updated successfully', 'success');
  }, [logActivity, showToast]);

  const deletePayment = useCallback((orderId: string, paymentId: string) => {
    let deletedAmount = 0;
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const target = o.payments.find(p => p.id === paymentId);
        if (target) deletedAmount = target.amount;
        return {
          ...o,
          payments: o.payments.filter(p => p.id !== paymentId),
          updated_at: new Date().toISOString()
        };
      }
      return o;
    }));

    setSelectedOrderForDetail(prev => {
      if (prev && prev.id === orderId) {
        return {
          ...prev,
          payments: prev.payments.filter(p => p.id !== paymentId)
        };
      }
      return prev;
    });

    logActivity(
      'payment_deleted',
      'Payment Deleted',
      `Payment of ${settings.currency_symbol}${deletedAmount.toLocaleString()} removed. Financial totals updated.`,
      deletedAmount,
      orderId
    );

    showToast('Payment record removed. Financials recalculated.', 'info');
  }, [settings.currency_symbol, logActivity, showToast]);

  // EXPENDITURE CRUD
  const addExpenditure = useCallback((expData: {
    expenditure_date: string;
    category: string;
    description: string;
    vendor?: string;
    rate: number;
    quantity: number;
    total_amount?: number;
    payment_method: Expenditure['payment_method'];
    notes?: string;
  }): Expenditure => {
    const rate = Number(expData.rate) || 0;
    const quantity = Number(expData.quantity) || 1;
    const total_amount = expData.total_amount !== undefined 
      ? Number(expData.total_amount) 
      : calculateItemTotal(rate, quantity);

    const newExp: Expenditure = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      expenditure_date: expData.expenditure_date || new Date().toISOString().split('T')[0],
      category: expData.category || 'Miscellaneous',
      description: expData.description.trim(),
      vendor: expData.vendor?.trim(),
      rate,
      quantity,
      total_amount,
      payment_method: expData.payment_method || 'Bank Transfer',
      notes: expData.notes?.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setExpenditures(prev => [newExp, ...prev]);

    // Add category if new
    if (newExp.category && !categories.includes(newExp.category)) {
      setCategories(prev => [...prev, newExp.category]);
    }

    logActivity(
      'expenditure_added',
      'Expenditure Added',
      `Logged ${settings.currency_symbol}${newExp.total_amount.toLocaleString()} for "${newExp.description}" under ${newExp.category}.`,
      newExp.total_amount
    );

    showToast(`Expenditure of ${settings.currency_symbol}${newExp.total_amount.toLocaleString()} logged successfully!`, 'success');
    return newExp;
  }, [categories, settings.currency_symbol, logActivity, showToast]);

  const updateExpenditure = useCallback((id: string, expData: Partial<Expenditure>) => {
    setExpenditures(prev => prev.map(e => {
      if (e.id === id) {
        const rate = expData.rate !== undefined ? Number(expData.rate) : e.rate;
        const quantity = expData.quantity !== undefined ? Number(expData.quantity) : e.quantity;
        const total_amount = expData.total_amount !== undefined 
          ? Number(expData.total_amount) 
          : calculateItemTotal(rate, quantity);

        return {
          ...e,
          ...expData,
          rate,
          quantity,
          total_amount,
          updated_at: new Date().toISOString()
        };
      }
      return e;
    }));

    if (expData.category && !categories.includes(expData.category)) {
      setCategories(prev => [...prev, expData.category!]);
    }

    logActivity('expenditure_updated', 'Expenditure Updated', `Expenditure record updated.`);
    showToast('Expenditure updated successfully', 'success');
  }, [categories, logActivity, showToast]);

  const deleteExpenditure = useCallback((id: string) => {
    const target = expenditures.find(e => e.id === id);
    if (!target) return;

    setExpenditures(prev => prev.filter(e => e.id !== id));

    logActivity(
      'expenditure_deleted',
      'Expenditure Deleted',
      `Expenditure "${target.description}" (${settings.currency_symbol}${target.total_amount.toLocaleString()}) deleted.`,
      target.total_amount
    );

    showToast('Expenditure deleted and financials recalculated.', 'info');
  }, [expenditures, settings.currency_symbol, logActivity, showToast]);

  const addCategory = useCallback((categoryName: string) => {
    const clean = categoryName.trim();
    if (!clean) return;
    if (!categories.includes(clean)) {
      setCategories(prev => [...prev, clean]);
      showToast(`Category "${clean}" added.`, 'success');
    }
  }, [categories, showToast]);

  const deleteCategory = useCallback((categoryName: string) => {
    setCategories(prev => prev.filter(c => c !== categoryName));
    showToast(`Category "${categoryName}" removed.`, 'info');
  }, [showToast]);

  // CUSTOMER CRUD
  const addCustomer = useCallback((custData: Omit<Customer, 'id' | 'created_at'>): Customer => {
    const newCust: Customer = {
      id: `cust-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: custData.name.trim(),
      phone: custData.phone?.trim(),
      email: custData.email?.trim(),
      business_name: custData.business_name?.trim(),
      address: custData.address?.trim(),
      notes: custData.notes?.trim(),
      created_at: new Date().toISOString()
    };

    setCustomers(prev => [...prev, newCust]);
    showToast(`Customer "${newCust.name}" added successfully.`, 'success');
    return newCust;
  }, [showToast]);

  const updateCustomer = useCallback((id: string, custData: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...custData } : c));
    showToast('Customer profile updated', 'success');
  }, [showToast]);

  const deleteCustomer = useCallback((id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    if (selectedCustomerForDetail?.id === id) setSelectedCustomerForDetail(null);
    showToast('Customer removed from directory', 'info');
  }, [selectedCustomerForDetail, showToast]);

  // PRODUCT CRUD (Order / Sales Products)
  const addProduct = useCallback((prodData: Omit<Product, 'id'>): Product => {
    const newProd: Product = {
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: prodData.name.trim(),
      default_rate: prodData.default_rate !== undefined ? Number(prodData.default_rate) : undefined,
      category: prodData.category?.trim() || 'General',
      unit: prodData.unit?.trim() || 'pcs',
      sku: prodData.sku?.trim(),
      description: prodData.description?.trim()
    };

    setProducts(prev => [...prev, newProd]);
    showToast(`Order product "${newProd.name}" added to catalogue.`, 'success');
    return newProd;
  }, [showToast]);

  const updateProduct = useCallback((id: string, prodData: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...prodData } : p));
    showToast('Product catalogue item updated', 'success');
  }, [showToast]);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast('Product removed from catalogue', 'info');
  }, [showToast]);

  // EXPENSE PRODUCT CRUD (Cost / Purchase / Materials)
  const addExpenseProduct = useCallback((prodData: Omit<ExpenseProduct, 'id'>): ExpenseProduct => {
    const newExpProd: ExpenseProduct = {
      id: `exp-prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: prodData.name.trim(),
      default_rate: Number(prodData.default_rate) || 0,
      category: prodData.category?.trim() || 'Miscellaneous',
      unit: prodData.unit?.trim() || 'unit',
      default_vendor: prodData.default_vendor?.trim(),
      description: prodData.description?.trim()
    };

    setExpenseProducts(prev => [...prev, newExpProd]);
    setExpensePurposes(prev => prev.includes(newExpProd.name) ? prev : [...prev, newExpProd.name]);
    showToast(`Expense item "${newExpProd.name}" added to catalogue.`, 'success');
    return newExpProd;
  }, [showToast]);

  const updateExpenseProduct = useCallback((id: string, prodData: Partial<ExpenseProduct>) => {
    setExpenseProducts(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, ...prodData };
        if (prodData.name && prodData.name !== p.name) {
          setExpensePurposes(purpList => purpList.map(item => item === p.name ? prodData.name! : item));
        }
        return updated;
      }
      return p;
    }));
    showToast('Expense product updated', 'success');
  }, [showToast]);

  const deleteExpenseProduct = useCallback((id: string) => {
    setExpenseProducts(prev => {
      const target = prev.find(p => p.id === id);
      if (target) {
        setExpensePurposes(purpList => purpList.filter(item => item !== target.name));
      }
      return prev.filter(p => p.id !== id);
    });
    showToast('Expense item removed from catalogue', 'info');
  }, [showToast]);

  // EXPENSE PURPOSE CRUD
  const addExpensePurpose = useCallback((purpose: string) => {
    const clean = purpose.trim();
    if (!clean) return;
    if (!expensePurposes.includes(clean)) {
      setExpensePurposes(prev => [...prev, clean]);
      showToast(`Expense purpose "${clean}" added.`, 'success');
    }
  }, [expensePurposes, showToast]);

  const deleteExpensePurpose = useCallback((purpose: string) => {
    setExpensePurposes(prev => prev.filter(p => p !== purpose));
    showToast(`Expense purpose "${purpose}" removed.`, 'info');
  }, [showToast]);

  // SETTINGS & DATA RESET
  const updateSettings = useCallback((settingsData: Partial<BusinessSettings>) => {
    setSettings(prev => ({ ...prev, ...settingsData }));
    showToast('Business settings saved successfully', 'success');
  }, [showToast]);

  const loadDemoData = useCallback(() => {
    const demo = getSampleData();
    setOrders(demo.orders);
    setExpenditures(demo.expenditures);
    setCustomers(demo.customers);
    setActivityLogs(demo.activityLogs);
    setSettings(demo.settings);
    setCategories(defaultCategories);
    setProducts(defaultProducts);
    setExpenseProducts(defaultExpenseProducts);
    setExpensePurposes(defaultExpensePurposes);
    showToast('Demo business dataset loaded successfully!', 'success');
  }, [showToast]);

  const clearAllData = useCallback(() => {
    setOrders([]);
    setExpenditures([]);
    setCustomers([]);
    setActivityLogs([]);
    showToast('All business records cleared.', 'info');
  }, [showToast]);

  const exportDataJSON = useCallback(() => {
    const backup = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      settings,
      orders,
      expenditures,
      customers,
      categories,
      products,
      expenseProducts,
      expensePurposes,
      activityLogs
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BizPulse-Backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Data exported successfully as JSON file.', 'success');
  }, [settings, orders, expenditures, customers, categories, products, expenseProducts, expensePurposes, activityLogs, showToast]);

  const importDataJSON = useCallback((jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.orders) setOrders(data.orders);
      if (data.expenditures) setExpenditures(data.expenditures);
      if (data.customers) setCustomers(data.customers);
      if (data.settings) setSettings(data.settings);
      if (data.categories) setCategories(data.categories);
      if (data.products) setProducts(data.products);
      if (data.expenseProducts) setExpenseProducts(data.expenseProducts);
      if (data.expensePurposes) setExpensePurposes(data.expensePurposes);
      if (data.activityLogs) setActivityLogs(data.activityLogs);
      showToast('Data restored successfully from backup!', 'success');
      return true;
    } catch (e) {
      showToast('Failed to parse backup JSON file. Please check format.', 'error');
      return false;
    }
  }, [showToast]);

  // CSV EXPORT FUNCTIONS
  const exportAllDataCSV = useCallback(() => {
    const csv = generateUnifiedBusinessCSV({
      settings,
      orders,
      expenditures,
      customers,
      products,
      expenseProducts
    });
    const dateTag = new Date().toISOString().split('T')[0];
    const cleanBizName = (settings.business_name || 'Business').replace(/[^a-zA-Z0-9-_]/g, '_');
    downloadCSVFile(csv, `${cleanBizName}_Full_Business_Backup_${dateTag}.csv`);
    showToast('Complete business dataset downloaded as CSV.', 'success');
  }, [settings, orders, expenditures, customers, products, expenseProducts, showToast]);

  const exportOrdersCSV = useCallback(() => {
    const csv = generateOrdersCSV(orders);
    const dateTag = new Date().toISOString().split('T')[0];
    downloadCSVFile(csv, `Orders_Invoices_${dateTag}.csv`);
    showToast(`Exported ${orders.length} orders to CSV.`, 'success');
  }, [orders, showToast]);

  const exportExpendituresCSV = useCallback(() => {
    const csv = generateExpendituresCSV(expenditures);
    const dateTag = new Date().toISOString().split('T')[0];
    downloadCSVFile(csv, `Expenditures_Expenses_${dateTag}.csv`);
    showToast(`Exported ${expenditures.length} expenditure records to CSV.`, 'success');
  }, [expenditures, showToast]);

  const exportCustomersCSV = useCallback(() => {
    const csv = generateCustomersCSV(customers, orders);
    const dateTag = new Date().toISOString().split('T')[0];
    downloadCSVFile(csv, `Customer_Directory_${dateTag}.csv`);
    showToast(`Exported ${customers.length} customer records to CSV.`, 'success');
  }, [customers, orders, showToast]);

  const exportProductsCSV = useCallback(() => {
    const csv = generateProductsCSV(products);
    const dateTag = new Date().toISOString().split('T')[0];
    downloadCSVFile(csv, `Product_Catalogue_${dateTag}.csv`);
    showToast(`Exported ${products.length} products to CSV.`, 'success');
  }, [products, showToast]);

  // CSV IMPORT HANDLER
  const importParsedCSVData = useCallback((
    imported: {
      orders?: Order[];
      expenditures?: Expenditure[];
      customers?: Customer[];
      products?: Product[];
      settings?: Partial<BusinessSettings>;
    },
    mode: 'merge' | 'replace'
  ): boolean => {
    try {
      let importedCount = 0;

      if (imported.orders && imported.orders.length > 0) {
        if (mode === 'replace') {
          setOrders(imported.orders);
        } else {
          setOrders(prev => {
            const existingIds = new Set(prev.map(o => o.id));
            const existingNumbers = new Set(prev.map(o => o.order_number.toLowerCase()));
            const newOrders = imported.orders!.filter(
              o => !existingIds.has(o.id) && !existingNumbers.has(o.order_number.toLowerCase())
            );
            return [...newOrders, ...prev];
          });
        }
        importedCount += imported.orders.length;
      }

      if (imported.expenditures && imported.expenditures.length > 0) {
        if (mode === 'replace') {
          setExpenditures(imported.expenditures);
        } else {
          setExpenditures(prev => {
            const existingIds = new Set(prev.map(e => e.id));
            const newExps = imported.expenditures!.filter(e => !existingIds.has(e.id));
            return [...newExps, ...prev];
          });
        }
        importedCount += imported.expenditures.length;
      }

      if (imported.customers && imported.customers.length > 0) {
        if (mode === 'replace') {
          setCustomers(imported.customers);
        } else {
          setCustomers(prev => {
            const existingNames = new Set(prev.map(c => c.name.trim().toLowerCase()));
            const existingPhones = new Set(prev.map(c => c.phone?.trim()).filter(Boolean));
            const newCusts = imported.customers!.filter(
              c => !existingNames.has(c.name.trim().toLowerCase()) &&
                   (!c.phone || !existingPhones.has(c.phone.trim()))
            );
            return [...prev, ...newCusts];
          });
        }
        importedCount += imported.customers.length;
      }

      if (imported.products && imported.products.length > 0) {
        if (mode === 'replace') {
          setProducts(imported.products);
        } else {
          setProducts(prev => {
            const existingNames = new Set(prev.map(p => p.name.trim().toLowerCase()));
            const newProds = imported.products!.filter(p => !existingNames.has(p.name.trim().toLowerCase()));
            return [...prev, ...newProds];
          });
        }
        importedCount += imported.products.length;
      }

      if (imported.settings) {
        setSettings(prev => ({ ...prev, ...imported.settings }));
      }

      showToast(`Successfully imported ${importedCount} records from CSV (${mode === 'merge' ? 'Merged' : 'Replaced'}).`, 'success');
      return true;
    } catch (err) {
      console.error('Error importing CSV data:', err);
      showToast('An error occurred while importing CSV data.', 'error');
      return false;
    }
  }, [showToast]);

  // COMPUTED ENGINE MEMOS
  const financialSummary = useMemo(() => {
    return calculateFinancialSummary(orders, expenditures, dateFilter, customStartDate, customEndDate);
  }, [orders, expenditures, dateFilter, customStartDate, customEndDate]);

  const monthlyFinancials = useMemo(() => {
    return getMonthlyFinancials(orders, expenditures, 6);
  }, [orders, expenditures]);

  const categoryBreakdowns = useMemo(() => {
    return getExpenditureCategoryBreakdown(expenditures, dateFilter, customStartDate, customEndDate);
  }, [expenditures, dateFilter, customStartDate, customEndDate]);

  const customerStats = useMemo(() => {
    return aggregateCustomerStats(customers, orders);
  }, [customers, orders]);

  return (
    <BusinessContext.Provider
      value={{
        orders,
        expenditures,
        customers,
        activityLogs,
        settings,
        categories,
        products,
        expenseProducts,
        expensePurposes,
        activeTab,
        setActiveTab,
        dateFilter,
        customStartDate,
        customEndDate,
        setDateFilter,
        searchQuery,
        setSearchQuery,
        selectedOrderForDetail,
        setSelectedOrderForDetail,
        selectedOrderForPayment,
        setSelectedOrderForPayment,
        selectedOrderForInvoice,
        setSelectedOrderForInvoice,
        selectedCustomerForDetail,
        setSelectedCustomerForDetail,
        orderModalOpen,
        setOrderModalOpen,
        isOrderModalOpen: orderModalOpen,
        setIsOrderModalOpen: setOrderModalOpen,
        orderToEdit,
        setOrderToEdit,
        expenditureModalOpen,
        setExpenditureModalOpen,
        isExpenditureModalOpen: expenditureModalOpen,
        setIsExpenditureModalOpen: setExpenditureModalOpen,
        customDateModalOpen,
        setCustomDateModalOpen,
        expenditureToEdit,
        setExpenditureToEdit,
        addOrder,
        updateOrder,
        deleteOrder,
        addPaymentToOrder,
        updatePayment,
        deletePayment,
        addExpenditure,
        updateExpenditure,
        deleteExpenditure,
        addCategory,
        deleteCategory,
        addProduct,
        updateProduct,
        deleteProduct,
        addExpenseProduct,
        updateExpenseProduct,
        deleteExpenseProduct,
        addExpensePurpose,
        deleteExpensePurpose,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        updateSettings,
        loadDemoData,
        resetToSampleData: loadDemoData,
        clearAllData,
        exportDataJSON,
        exportDataAsJSON: exportDataJSON,
        importDataJSON,
        importDataFromJSON: importDataJSON,
        exportAllDataCSV,
        exportOrdersCSV,
        exportExpendituresCSV,
        exportCustomersCSV,
        exportProductsCSV,
        importParsedCSVData,
        financialSummary,
        monthlyFinancials,
        categoryBreakdowns,
        customerStats,
        isDarkMode,
        toggleDarkMode,
        toasts,
        showToast,
        removeToast
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};
