import { 
  Order, 
  OrderItem, 
  OrderPayment, 
  Expenditure, 
  PaymentStatus, 
  DateFilterType, 
  FinancialSummary,
  MonthlyFinancialRecord,
  CategoryBreakdown,
  Customer
} from '../types';

/**
 * Standard item total: Rate × Quantity
 */
export function calculateItemTotal(rate: number, quantity: number): number {
  const r = isNaN(rate) ? 0 : Number(rate);
  const q = isNaN(quantity) ? 0 : Number(quantity);
  return Math.round(r * q * 100) / 100;
}

/**
 * Total order amount: Sum of all item totals
 */
export function calculateOrderTotal(items: OrderItem[]): number {
  if (!items || items.length === 0) return 0;
  const sum = items.reduce((acc, item) => {
    return acc + (item.total_amount || calculateItemTotal(item.rate, item.quantity));
  }, 0);
  return Math.round(sum * 100) / 100;
}

/**
 * Total amount received for an order: Sum of payments for that order
 */
export function calculateOrderPaidAmount(payments: OrderPayment[]): number {
  if (!payments || payments.length === 0) return 0;
  const sum = payments.reduce((acc, payment) => acc + (Number(payment.amount) || 0), 0);
  return Math.round(sum * 100) / 100;
}

/**
 * Total due for an order: Total Order Amount - Amount Received
 */
export function calculateOrderDueAmount(totalAmount: number, payments: OrderPayment[]): number {
  const paid = calculateOrderPaidAmount(payments);
  const due = totalAmount - paid;
  return Math.max(0, Math.round(due * 100) / 100);
}

/**
 * Automatically determine payment status
 * - Fully Paid: Amount Received >= Order Total
 * - Partially Paid: Amount Received > 0 AND Amount Received < Order Total
 * - Pending: Amount Received = 0
 */
export function getOrderPaymentStatus(totalAmount: number, payments: OrderPayment[]): PaymentStatus {
  const paid = calculateOrderPaidAmount(payments);
  if (paid >= totalAmount && totalAmount > 0) {
    return 'fully_paid';
  }
  if (paid > 0) {
    return 'partially_paid';
  }
  return 'pending';
}

/**
 * Calculate payment percentage for progress bars
 */
export function getOrderPaymentProgress(totalAmount: number, payments: OrderPayment[]): number {
  if (totalAmount <= 0) return 0;
  const paid = calculateOrderPaidAmount(payments);
  const pct = Math.min(100, Math.round((paid / totalAmount) * 100));
  return isNaN(pct) ? 0 : pct;
}

/**
 * Date range boundaries utility
 */
export function getDateRangeBounds(type: DateFilterType, customStart?: string, customEnd?: string): { start: Date; end: Date; prevStart: Date; prevEnd: Date } {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  let start = new Date(todayStart);
  let end = new Date(todayEnd);
  let prevStart = new Date(todayStart);
  let prevEnd = new Date(todayEnd);

  switch (type) {
    case 'today': {
      start = todayStart;
      end = todayEnd;
      prevStart = new Date(todayStart);
      prevStart.setDate(prevStart.getDate() - 1);
      prevEnd = new Date(todayEnd);
      prevEnd.setDate(prevEnd.getDate() - 1);
      break;
    }
    case 'yesterday': {
      start = new Date(todayStart);
      start.setDate(start.getDate() - 1);
      end = new Date(todayEnd);
      end.setDate(end.getDate() - 1);

      prevStart = new Date(start);
      prevStart.setDate(prevStart.getDate() - 1);
      prevEnd = new Date(end);
      prevEnd.setDate(prevEnd.getDate() - 1);
      break;
    }
    case 'this_week': {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday start
      start = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0, 0);
      end = todayEnd;

      prevStart = new Date(start);
      prevStart.setDate(prevStart.getDate() - 7);
      prevEnd = new Date(end);
      prevEnd.setDate(prevEnd.getDate() - 7);
      break;
    }
    case 'this_month': {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      end = todayEnd;

      prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;
    }
    case 'last_month': {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

      prevStart = new Date(now.getFullYear(), now.getMonth() - 2, 1, 0, 0, 0, 0);
      prevEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59, 999);
      break;
    }
    case 'last_3_months': {
      start = new Date(now.getFullYear(), now.getMonth() - 2, 1, 0, 0, 0, 0);
      end = todayEnd;

      prevStart = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0);
      prevEnd = new Date(now.getFullYear(), now.getMonth() - 2, 0, 23, 59, 59, 999);
      break;
    }
    case 'last_6_months': {
      start = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0);
      end = todayEnd;

      prevStart = new Date(now.getFullYear(), now.getMonth() - 11, 1, 0, 0, 0, 0);
      prevEnd = new Date(now.getFullYear(), now.getMonth() - 5, 0, 23, 59, 59, 999);
      break;
    }
    case 'this_year': {
      start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      end = todayEnd;

      prevStart = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
      prevEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
      break;
    }
    case 'financial_year': {
      // Indian FY starts April 1
      const currentYear = now.getFullYear();
      const isPostApril = now.getMonth() >= 3;
      const fyStartYear = isPostApril ? currentYear : currentYear - 1;
      start = new Date(fyStartYear, 3, 1, 0, 0, 0, 0);
      end = todayEnd;

      prevStart = new Date(fyStartYear - 1, 3, 1, 0, 0, 0, 0);
      prevEnd = new Date(fyStartYear, 2, 31, 23, 59, 59, 999);
      break;
    }
    case 'custom': {
      if (customStart) {
        start = new Date(customStart + 'T00:00:00');
      } else {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      if (customEnd) {
        end = new Date(customEnd + 'T23:59:59.999');
      } else {
        end = todayEnd;
      }
      const duration = end.getTime() - start.getTime();
      prevEnd = new Date(start.getTime() - 1);
      prevStart = new Date(prevEnd.getTime() - duration);
      break;
    }
    case 'all':
    default: {
      start = new Date(2000, 0, 1, 0, 0, 0, 0);
      end = new Date(2099, 11, 31, 23, 59, 59, 999);
      prevStart = new Date(1990, 0, 1);
      prevEnd = new Date(1999, 11, 31);
      break;
    }
  }

  return { start, end, prevStart, prevEnd };
}

/**
 * Filter items by date within bounds
 */
export function isDateInRange(dateStr: string, start: Date, end: Date): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const time = d.getTime();
  return time >= start.getTime() && time <= end.getTime();
}

/**
 * Comprehensive financial summary calculation engine
 */
export function calculateFinancialSummary(
  orders: Order[],
  expenditures: Expenditure[],
  dateFilter: DateFilterType = 'this_month',
  customStart?: string,
  customEnd?: string
): FinancialSummary {
  const { start, end, prevStart, prevEnd } = getDateRangeBounds(dateFilter, customStart, customEnd);

  // Current period orders
  const currentOrders = dateFilter === 'all' 
    ? orders 
    : orders.filter(o => isDateInRange(o.order_date, start, end));

  // Current period payments (extracted from all orders by payment_date)
  let currentPaymentsReceived = 0;
  orders.forEach(order => {
    order.payments.forEach(payment => {
      if (dateFilter === 'all' || isDateInRange(payment.payment_date, start, end)) {
        currentPaymentsReceived += Number(payment.amount) || 0;
      }
    });
  });

  // Current period expenditures
  const currentExpenditures = dateFilter === 'all'
    ? expenditures
    : expenditures.filter(e => isDateInRange(e.expenditure_date, start, end));

  const totalExpenditure = currentExpenditures.reduce((sum, e) => sum + (Number(e.total_amount) || 0), 0);

  // Total order value (sum of current orders)
  const totalOrderValue = currentOrders.reduce((sum, o) => {
    // exclude cancelled orders from valid order value
    if (o.status === 'cancelled') return sum;
    return sum + (Number(o.total_amount) || 0);
  }, 0);

  // Total Pending Payments: Sum of (total_amount - payments) for active orders
  // For overall business single source of truth, pending owed by active orders
  let totalPendingPayments = 0;
  let pendingOrdersCount = 0;
  let fullyPaidOrdersCount = 0;
  let partiallyPaidOrdersCount = 0;

  currentOrders.forEach(o => {
    if (o.status === 'cancelled') return;
    const paid = calculateOrderPaidAmount(o.payments);
    const due = Math.max(0, o.total_amount - paid);
    if (due > 0) {
      totalPendingPayments += due;
      if (paid === 0) pendingOrdersCount++;
      else partiallyPaidOrdersCount++;
    } else {
      fullyPaidOrdersCount++;
    }
  });

  // Current Running Profit = Total Payments Received - Total Expenditure
  const runningProfit = currentPaymentsReceived - totalExpenditure;
  const profitMarginPercent = currentPaymentsReceived > 0 
    ? Math.round((runningProfit / currentPaymentsReceived) * 100 * 10) / 10 
    : 0;

  // Previous period calculations for trend comparisons
  let prevOrdersCount = 0;
  let prevOrderValue = 0;
  let prevPaymentsReceived = 0;
  let prevExpenditure = 0;

  if (dateFilter !== 'all') {
    orders.forEach(o => {
      if (isDateInRange(o.order_date, prevStart, prevEnd) && o.status !== 'cancelled') {
        prevOrdersCount++;
        prevOrderValue += Number(o.total_amount) || 0;
      }
      o.payments.forEach(p => {
        if (isDateInRange(p.payment_date, prevStart, prevEnd)) {
          prevPaymentsReceived += Number(p.amount) || 0;
        }
      });
    });

    expenditures.forEach(e => {
      if (isDateInRange(e.expenditure_date, prevStart, prevEnd)) {
        prevExpenditure += Number(e.total_amount) || 0;
      }
    });
  }

  const prevRunningProfit = prevPaymentsReceived - prevExpenditure;

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / Math.abs(previous)) * 100 * 10) / 10;
  };

  return {
    totalOrders: currentOrders.length,
    totalOrderValue: Math.round(totalOrderValue * 100) / 100,
    totalPaymentsReceived: Math.round(currentPaymentsReceived * 100) / 100,
    totalPendingPayments: Math.round(totalPendingPayments * 100) / 100,
    pendingOrdersCount,
    fullyPaidOrdersCount,
    partiallyPaidOrdersCount,
    totalExpenditure: Math.round(totalExpenditure * 100) / 100,
    runningProfit: Math.round(runningProfit * 100) / 100,
    profitMarginPercent,
    previousPeriod: {
      totalOrders: prevOrdersCount,
      totalOrderValue: prevOrderValue,
      totalPaymentsReceived: prevPaymentsReceived,
      totalExpenditure: prevExpenditure,
      runningProfit: prevRunningProfit
    },
    growth: {
      ordersGrowth: calculateGrowth(currentOrders.length, prevOrdersCount),
      revenueGrowth: calculateGrowth(currentPaymentsReceived, prevPaymentsReceived),
      expenditureGrowth: calculateGrowth(totalExpenditure, prevExpenditure),
      profitGrowth: calculateGrowth(runningProfit, prevRunningProfit)
    }
  };
}

/**
 * Generate monthly financial breakdown records for charts & reports
 */
export function getMonthlyFinancials(orders: Order[], expenditures: Expenditure[], monthsCount: number = 6): MonthlyFinancialRecord[] {
  const result: MonthlyFinancialRecord[] = [];
  const now = new Date();

  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const monthName = d.toLocaleString('default', { month: 'short' });
    const year = d.getFullYear();
    const monthKey = `${monthName} ${year}`;

    // Payments received in this month
    let revenue = 0;
    orders.forEach(o => {
      o.payments.forEach(p => {
        if (isDateInRange(p.payment_date, monthStart, monthEnd)) {
          revenue += Number(p.amount) || 0;
        }
      });
    });

    // Expenditures in this month
    let monthExpenditure = 0;
    expenditures.forEach(e => {
      if (isDateInRange(e.expenditure_date, monthStart, monthEnd)) {
        monthExpenditure += Number(e.total_amount) || 0;
      }
    });

    // Orders created in this month
    let orderValue = 0;
    let ordersCount = 0;
    orders.forEach(o => {
      if (isDateInRange(o.order_date, monthStart, monthEnd) && o.status !== 'cancelled') {
        ordersCount++;
        orderValue += Number(o.total_amount) || 0;
      }
    });

    result.push({
      monthKey,
      monthName,
      year,
      revenue: Math.round(revenue * 100) / 100,
      expenditure: Math.round(monthExpenditure * 100) / 100,
      profit: Math.round((revenue - monthExpenditure) * 100) / 100,
      orderValue: Math.round(orderValue * 100) / 100,
      ordersCount
    });
  }

  return result;
}

/**
 * Generate category breakdown for expenditures
 */
export function getExpenditureCategoryBreakdown(
  expenditures: Expenditure[],
  dateFilter: DateFilterType = 'this_month',
  customStart?: string,
  customEnd?: string
): CategoryBreakdown[] {
  const { start, end } = getDateRangeBounds(dateFilter, customStart, customEnd);
  const filtered = dateFilter === 'all' 
    ? expenditures 
    : expenditures.filter(e => isDateInRange(e.expenditure_date, start, end));

  const total = filtered.reduce((sum, e) => sum + (Number(e.total_amount) || 0), 0);
  const map = new Map<string, { amount: number; count: number }>();

  filtered.forEach(e => {
    const cat = e.category || 'Miscellaneous';
    const current = map.get(cat) || { amount: 0, count: 0 };
    map.set(cat, {
      amount: current.amount + (Number(e.total_amount) || 0),
      count: current.count + 1
    });
  });

  const result: CategoryBreakdown[] = [];
  map.forEach((value, category) => {
    result.push({
      category,
      amount: Math.round(value.amount * 100) / 100,
      count: value.count,
      percentage: total > 0 ? Math.round((value.amount / total) * 1000) / 10 : 0
    });
  });

  return result.sort((a, b) => b.amount - a.amount);
}

/**
 * Aggregate customer metrics (Total Orders, Total Value, Amount Paid, Outstanding)
 */
export function aggregateCustomerStats(customers: Customer[], orders: Order[]) {
  return customers.map(c => {
    const customerOrders = orders.filter(o => 
      o.customer_name.toLowerCase().trim() === c.name.toLowerCase().trim() ||
      (o.customer_email && c.email && o.customer_email.toLowerCase() === c.email.toLowerCase()) ||
      (o.customer_phone && c.phone && o.customer_phone === c.phone)
    );

    const validOrders = customerOrders.filter(o => o.status !== 'cancelled');
    const totalOrders = validOrders.length;
    const totalOrderValue = validOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    
    let totalPaid = 0;
    validOrders.forEach(o => {
      totalPaid += calculateOrderPaidAmount(o.payments);
    });

    const totalOutstanding = Math.max(0, totalOrderValue - totalPaid);

    return {
      ...c,
      totalOrders,
      totalOrderValue: Math.round(totalOrderValue * 100) / 100,
      totalPaid: Math.round(totalPaid * 100) / 100,
      totalOutstanding: Math.round(totalOutstanding * 100) / 100,
      recentOrders: validOrders.sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime()).slice(0, 5)
    };
  });
}

/**
 * Format currency nicely with Indian Rupees (₹) by default or any symbol
 */
export function formatCurrency(amount: number, symbol: string = '₹'): string {
  const num = isNaN(amount) ? 0 : Number(amount);
  
  if (symbol === '₹') {
    // Format Indian numbering system: 1,00,000
    const parts = num.toFixed(2).split('.');
    let integerPart = parts[0];
    const isNegative = integerPart.startsWith('-');
    if (isNegative) integerPart = integerPart.substring(1);

    const lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);
    const formattedOther = otherNumbers !== '' ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' : '';
    const formatted = (isNegative ? '-' : '') + formattedOther + lastThree;
    
    // Omit .00 if whole number for cleaner UI or keep 2 decimals if fraction
    const decimals = parts[1] === '00' ? '' : `.${parts[1]}`;
    return `${symbol}${formatted}${decimals}`;
  }

  // Standard international formatter
  const formatted = num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  return `${symbol}${formatted}`;
}

/**
 * Format date display (e.g., '14 Oct 2026', 'Today, 2:30 PM')
 */
export function formatDate(dateString: string, includeTime: boolean = false): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;

    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    };

    if (includeTime) {
      options.hour = 'numeric';
      options.minute = '2-digit';
      options.hour12 = true;
    }

    return d.toLocaleDateString('en-IN', options);
  } catch (e) {
    return dateString;
  }
}

/**
 * Get relative time label (e.g., 'Today', 'Yesterday', '3 days ago')
 */
export function getRelativeTime(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay === 0) {
    if (diffHour === 0) {
      if (diffMin < 2) return 'Just now';
      return `${diffMin} mins ago`;
    }
    return `Today at ${date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  }
  if (diffDay === 1) return `Yesterday at ${date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  if (diffDay < 7) return `${diffDay} days ago`;
  return formatDate(dateString);
}
