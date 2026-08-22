import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  CreditCard, 
  Eye, 
  Printer, 
  Trash2, 
  Edit3, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { Order, OrderStatus, PaymentStatus } from '../types';
import { 
  calculateOrderPaidAmount, 
  calculateOrderDueAmount, 
  getOrderPaymentProgress, 
  getOrderPaymentStatus, 
  formatCurrency, 
  formatDate 
} from '../utils/calculations';
import { ConfirmDialog } from './ConfirmDialog';

export const OrdersView: React.FC = () => {
  const { 
    orders, 
    settings, 
    searchQuery, 
    setSearchQuery,
    setOrderModalOpen, 
    setOrderToEdit,
    setSelectedOrderForDetail,
    setSelectedOrderForPayment,
    setSelectedOrderForInvoice,
    deleteOrder
  } = useBusiness();

  // Local filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc' | 'due_desc'>('date_desc');
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  // Filter & Search Logic
  const filteredOrders = orders.filter(order => {
    // Search query matches customer, order number, or items
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchCustomer = order.customer_name.toLowerCase().includes(q) || (order.customer_business && order.customer_business.toLowerCase().includes(q));
      const matchNumber = order.order_number.toLowerCase().includes(q);
      const matchItems = order.items.some(it => it.product_name.toLowerCase().includes(q));
      if (!matchCustomer && !matchNumber && !matchItems) return false;
    }

    // Status filter
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }

    // Payment filter
    if (paymentFilter !== 'all') {
      const pStatus = getOrderPaymentStatus(order.total_amount, order.payments);
      if (pStatus !== paymentFilter) return false;
    }

    return true;
  });

  // Sort logic
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'date_desc') return new Date(b.order_date).getTime() - new Date(a.order_date).getTime();
    if (sortBy === 'date_asc') return new Date(a.order_date).getTime() - new Date(b.order_date).getTime();
    if (sortBy === 'amount_desc') return b.total_amount - a.total_amount;
    if (sortBy === 'amount_asc') return a.total_amount - b.total_amount;
    if (sortBy === 'due_desc') {
      const dueA = calculateOrderDueAmount(a.total_amount, a.payments);
      const dueB = calculateOrderDueAmount(b.total_amount, b.payments);
      return dueB - dueA;
    }
    return 0;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300';
      case 'processing':
        return 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300';
      case 'cancelled':
        return 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
    }
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'fully_paid':
        return (
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 text-[10px] font-bold rounded-md uppercase tracking-wider">
            Fully Paid
          </span>
        );
      case 'partially_paid':
        return (
          <span className="px-2.5 py-1 bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 text-[10px] font-bold rounded-md uppercase tracking-wider">
            Partially Paid
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 text-[10px] font-bold rounded-md uppercase tracking-wider">
            Pending
          </span>
        );
    }
  };

  return (
    <div id="orders-view" className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Create Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white font-['Outfit']">
            Orders Management
          </h2>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-tighter mt-0.5">
            Track customer orders, fulfillment statuses, and billings
          </p>
        </div>

        <button
          id="create-order-top-btn"
          onClick={() => {
            setOrderToEdit(null);
            setOrderModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Add New Order
        </button>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Order Status Filters */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            {['all', 'new', 'processing', 'completed', 'cancelled'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Payment Status Filter */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Payment:
              </span>
              <select
                id="payment-status-filter"
                value={paymentFilter}
                onChange={e => setPaymentFilter(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="all">All Payments</option>
                <option value="fully_paid">Fully Paid</option>
                <option value="partially_paid">Partially Paid</option>
                <option value="pending">Pending Payment</option>
              </select>
            </div>

            {/* Sort Filter */}
            <select
              id="order-sort-filter"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="amount_desc">Highest Amount</option>
              <option value="amount_asc">Lowest Amount</option>
              <option value="due_desc">Highest Due</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List Table */}
      {sortedOrders.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white font-['Outfit']">
            No orders found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
            {searchQuery || statusFilter !== 'all' || paymentFilter !== 'all'
              ? 'No orders match your active search or filters. Try resetting the criteria.'
              : 'Start managing your business by creating your very first client order.'}
          </p>
          <button
            onClick={() => {
              setOrderToEdit(null);
              setOrderModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create First Order
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                <tr>
                  <th className="px-6 py-3.5">Order ID</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                  <th className="px-6 py-3.5">Payment</th>
                  <th className="px-6 py-3.5 text-right">Total</th>
                  <th className="px-6 py-3.5 text-right">Due</th>
                  <th className="px-6 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                {sortedOrders.map(order => {
                  const paid = calculateOrderPaidAmount(order.payments);
                  const due = calculateOrderDueAmount(order.total_amount, order.payments);
                  const paymentStatus = getOrderPaymentStatus(order.total_amount, order.payments);
                  const progress = getOrderPaymentProgress(order.total_amount, order.payments);

                  return (
                    <tr 
                      key={order.id} 
                      className="text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedOrderForDetail(order)}
                    >
                      {/* Order ID */}
                      <td className="px-6 py-4">
                        <div className="font-mono font-bold text-xs text-slate-800 dark:text-white">
                          {order.order_number}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {formatDate(order.order_date)} • {order.items.length} items
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800 dark:text-white">
                          {order.customer_name}
                        </div>
                        {order.customer_business && (
                          <div className="text-[11px] text-indigo-600 dark:text-indigo-400">
                            {order.customer_business}
                          </div>
                        )}
                      </td>

                      {/* Order Status */}
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase rounded-md tracking-wider ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>

                      {/* Payment Status & Progress */}
                      <td className="px-6 py-4">
                        <div>
                          {getPaymentBadge(paymentStatus)}
                          <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                progress === 100 ? 'bg-emerald-500' : progress > 0 ? 'bg-amber-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="px-6 py-4 text-right font-bold text-slate-800 dark:text-white font-['Outfit']">
                        <div>{formatCurrency(order.total_amount, settings.currency_symbol)}</div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">
                          Paid: {formatCurrency(paid, settings.currency_symbol)}
                        </div>
                      </td>

                      {/* Balance Due */}
                      <td className="px-6 py-4 text-right font-bold font-['Outfit']">
                        {due > 0 ? (
                          <span className="text-rose-500">{formatCurrency(due, settings.currency_symbol)}</span>
                        ) : (
                          <span className="text-slate-400 font-normal">₹0</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          {due > 0 && (
                            <button
                              id={`record-payment-btn-${order.id}`}
                              onClick={() => setSelectedOrderForPayment(order)}
                              className="px-2.5 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                              title="Record Payment"
                            >
                              + Pay
                            </button>
                          )}

                          <button
                            id={`view-order-btn-${order.id}`}
                            onClick={() => setSelectedOrderForDetail(order)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            id={`invoice-btn-${order.id}`}
                            onClick={() => setSelectedOrderForInvoice(order)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Generate Invoice"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          <button
                            id={`delete-order-btn-${order.id}`}
                            onClick={() => setOrderToDelete(order)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer count */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Showing {sortedOrders.length} of {orders.length} orders</span>
            <span>Real-time billing & settlement</span>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!orderToDelete}
        title="Delete Order"
        message={orderToDelete ? `Are you sure you want to delete order #${orderToDelete.order_number}? All associated payments will be deducted from your total payments received and running profit.` : ''}
        confirmText="Delete Order"
        onConfirm={() => {
          if (orderToDelete) {
            deleteOrder(orderToDelete.id);
            setOrderToDelete(null);
          }
        }}
        onCancel={() => setOrderToDelete(null)}
      />
    </div>
  );
};
