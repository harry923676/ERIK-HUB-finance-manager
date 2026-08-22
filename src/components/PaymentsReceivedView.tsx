import React, { useState } from 'react';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Calendar, 
  TrendingUp, 
  ArrowUpRight, 
  Trash2, 
  ExternalLink,
  DollarSign,
  Layers,
  ShoppingBag,
  Building,
  CheckCircle2
} from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { OrderPayment, PaymentMethod } from '../types';
import { formatCurrency, formatDate, isDateInRange, getDateRangeBounds } from '../utils/calculations';
import { ConfirmDialog } from './ConfirmDialog';

export const PaymentsReceivedView: React.FC = () => {
  const { 
    orders, 
    settings, 
    dateFilter, 
    customStartDate, 
    customEndDate,
    setSelectedOrderForDetail,
    deletePayment
  } = useBusiness();

  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  
  // Payment to delete state
  const [paymentToDelete, setPaymentToDelete] = useState<{ orderId: string; paymentId: string; amount: number; orderNumber: string } | null>(null);

  // Flatten all payments from all orders
  const allPaymentsWithMeta: (OrderPayment & {
    orderNumber: string;
    customerName: string;
    customerBusiness?: string;
    orderTotal: number;
  })[] = [];

  orders.forEach(order => {
    order.payments.forEach(p => {
      allPaymentsWithMeta.push({
        ...p,
        orderNumber: order.order_number,
        customerName: order.customer_name,
        customerBusiness: order.customer_business,
        orderTotal: order.total_amount
      });
    });
  });

  // Extract unique customers & payment methods for filters
  const uniqueCustomers = Array.from(new Set(allPaymentsWithMeta.map(p => p.customerName)));
  const uniqueMethods = Array.from(new Set(allPaymentsWithMeta.map(p => p.payment_method)));

  // Date range bounds
  const { start, end } = getDateRangeBounds(dateFilter, customStartDate, customEndDate);

  // Apply filters
  const filteredPayments = allPaymentsWithMeta.filter(p => {
    // Date filter
    if (dateFilter !== 'all' && !isDateInRange(p.payment_date, start, end)) {
      return false;
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchCustomer = p.customerName.toLowerCase().includes(q) || (p.customerBusiness && p.customerBusiness.toLowerCase().includes(q));
      const matchOrder = p.orderNumber.toLowerCase().includes(q);
      const matchRef = p.reference_number && p.reference_number.toLowerCase().includes(q);
      const matchMethod = p.payment_method.toLowerCase().includes(q);
      if (!matchCustomer && !matchOrder && !matchRef && !matchMethod) return false;
    }

    // Method filter
    if (methodFilter !== 'all' && p.payment_method !== methodFilter) {
      return false;
    }

    // Customer filter
    if (customerFilter !== 'all' && p.customerName !== customerFilter) {
      return false;
    }

    return true;
  });

  // Sort
  const sortedPayments = [...filteredPayments].sort((a, b) => {
    if (sortBy === 'date_desc') return new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime();
    if (sortBy === 'date_asc') return new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime();
    if (sortBy === 'amount_desc') return b.amount - a.amount;
    if (sortBy === 'amount_asc') return a.amount - b.amount;
    return 0;
  });

  // Total collected in current view
  const totalCollectedInView = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  // Method breakdown in current view
  const methodStats = filteredPayments.reduce((acc, p) => {
    acc[p.payment_method] = (acc[p.payment_method] || 0) + p.amount;
    return acc;
  }, {} as Record<string, number>);

  const topMethod = Object.entries(methodStats).sort((a, b) => b[1] - a[1])[0];

  const handleOpenOrder = (orderId: string) => {
    const target = orders.find(o => o.id === orderId);
    if (target) setSelectedOrderForDetail(target);
  };

  return (
    <div id="payments-received-view" className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white font-['Outfit']">
          Payments Received
        </h2>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-tighter mt-0.5">
          Automatic ledger of all cash, UPI, bank transfers, and client settlements
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Inflow in Period
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-['Outfit'] mt-1">
            {formatCurrency(totalCollectedInView, settings.currency_symbol)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {filteredPayments.length} settlements recorded
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Top Payment Channel
          </div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 font-['Outfit'] mt-1 truncate">
            {topMethod ? topMethod[0] : 'None'}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {topMethod ? `${formatCurrency(topMethod[1], settings.currency_symbol)} collected` : 'No transactions'}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Average Payment Size
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-white font-['Outfit'] mt-1">
            {filteredPayments.length > 0
              ? formatCurrency(Math.round(totalCollectedInView / filteredPayments.length), settings.currency_symbol)
              : formatCurrency(0, settings.currency_symbol)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Per transaction settlement
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search payments, ref..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-slate-800 dark:text-white w-48 sm:w-60 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Method filter */}
            <select
              id="payment-method-filter"
              value={methodFilter}
              onChange={e => setMethodFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Channels</option>
              {uniqueMethods.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            {/* Customer filter */}
            <select
              id="payment-customer-filter"
              value={customerFilter}
              onChange={e => setCustomerFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Customers</option>
              {uniqueCustomers.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <select
            id="payments-sort-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="date_desc">Newest Date</option>
            <option value="date_asc">Oldest Date</option>
            <option value="amount_desc">Highest Amount</option>
            <option value="amount_asc">Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      {sortedPayments.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white font-['Outfit']">
            No payments received in this view
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Payments are automatically recorded here whenever client payments are recorded on orders.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                <tr>
                  <th className="px-6 py-3.5">Payment Date</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Order Ref</th>
                  <th className="px-6 py-3.5">Channel</th>
                  <th className="px-6 py-3.5">Reference / Notes</th>
                  <th className="px-6 py-3.5 text-right">Amount Received</th>
                  <th className="px-6 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                {sortedPayments.map(payment => (
                  <tr key={payment.id} className="text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Date */}
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-white text-xs">
                      {formatDate(payment.payment_date)}
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 dark:text-white">
                        {payment.customerName}
                      </div>
                      {payment.customerBusiness && (
                        <div className="text-[11px] text-slate-400">
                          {payment.customerBusiness}
                        </div>
                      )}
                    </td>

                    {/* Order Ref */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleOpenOrder(payment.order_id)}
                        className="inline-flex items-center gap-1 font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                        title="View Order"
                      >
                        {payment.orderNumber}
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>

                    {/* Method */}
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {payment.payment_method}
                      </span>
                    </td>

                    {/* Reference / Notes */}
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-xs">
                      {payment.reference_number && (
                        <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 mr-2">
                          #{payment.reference_number}
                        </span>
                      )}
                      {payment.notes && (
                        <span className="text-[11px] text-slate-400">
                          {payment.notes}
                        </span>
                      )}
                      {!payment.reference_number && !payment.notes && '-'}
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-['Outfit']">
                        +{formatCurrency(payment.amount, settings.currency_symbol)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-center">
                      <button
                        id={`delete-payment-btn-${payment.id}`}
                        onClick={() => setPaymentToDelete({
                          orderId: payment.order_id,
                          paymentId: payment.id,
                          amount: payment.amount,
                          orderNumber: payment.orderNumber
                        })}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete Payment Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Showing {sortedPayments.length} of {allPaymentsWithMeta.length} payments</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              Total: {formatCurrency(totalCollectedInView, settings.currency_symbol)}
            </span>
          </div>
        </div>
      )}

      {/* Delete Payment Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!paymentToDelete}
        title="Delete Payment Record"
        message={paymentToDelete ? `Are you sure you want to remove the payment of ${formatCurrency(paymentToDelete.amount, settings.currency_symbol)} for order #${paymentToDelete.orderNumber}? This will automatically increase the outstanding balance and update running profit.` : ''}
        confirmText="Delete Payment"
        onConfirm={() => {
          if (paymentToDelete) {
            deletePayment(paymentToDelete.orderId, paymentToDelete.paymentId);
            setPaymentToDelete(null);
          }
        }}
        onCancel={() => setPaymentToDelete(null)}
      />
    </div>
  );
};
