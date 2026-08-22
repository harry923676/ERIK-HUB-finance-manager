import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  User, 
  Calendar, 
  CreditCard, 
  Printer, 
  Edit3, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  Phone,
  Mail,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, OrderPayment } from '../types';
import { useBusiness } from '../context/BusinessContext';
import { 
  calculateOrderPaidAmount, 
  calculateOrderDueAmount, 
  getOrderPaymentProgress, 
  getOrderPaymentStatus, 
  formatCurrency, 
  formatDate 
} from '../utils/calculations';
import { ConfirmDialog } from './ConfirmDialog';

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose }) => {
  const { 
    settings, 
    setOrderToEdit, 
    setOrderModalOpen, 
    setSelectedOrderForPayment, 
    setSelectedOrderForInvoice,
    deleteOrder,
    deletePayment,
    updateOrder
  } = useBusiness();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);

  if (!order) return null;

  const totalPaid = calculateOrderPaidAmount(order.payments);
  const totalDue = calculateOrderDueAmount(order.total_amount, order.payments);
  const paymentProgress = getOrderPaymentProgress(order.total_amount, order.payments);
  const paymentStatus = getOrderPaymentStatus(order.total_amount, order.payments);

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'processing':
        return 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800';
      case 'cancelled':
        return 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'fully_paid':
        return 'bg-emerald-500 text-white';
      case 'partially_paid':
        return 'bg-amber-500 text-white';
      default:
        return 'bg-rose-500 text-white';
    }
  };

  const handleStatusChange = (newStatus: Order['status']) => {
    updateOrder(order.id, { status: newStatus });
  };

  return (
    <>
      <AnimatePresence>
        <div id="order-detail-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
                      Order Details #{order.order_number}
                    </h2>
                    <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded-full border ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded-full ${getPaymentStatusBadge(paymentStatus)}`}>
                      {paymentStatus.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Created on {formatDate(order.order_date)}
                  </p>
                </div>
              </div>

              {/* Top actions */}
              <div className="flex items-center gap-2">
                <button
                  id="detail-print-invoice-btn"
                  onClick={() => setSelectedOrderForInvoice(order)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" /> Invoice
                </button>

                <button
                  id="detail-edit-order-btn"
                  onClick={() => {
                    setOrderToEdit(order);
                    setOrderModalOpen(true);
                    onClose();
                  }}
                  className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  title="Edit Order"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  id="detail-delete-order-btn"
                  onClick={() => setDeleteConfirmOpen(true)}
                  className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  title="Delete Order"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  id="detail-close-btn"
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Financial Summary & Payment Progress Bar */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-md">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-indigo-800/40">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Total Order Amount
                    </span>
                    <div className="text-2xl font-extrabold font-['Outfit'] mt-0.5 text-white">
                      {formatCurrency(order.total_amount, settings.currency_symbol)}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Amount Received
                    </span>
                    <div className="text-2xl font-extrabold font-['Outfit'] mt-0.5 text-emerald-300">
                      {formatCurrency(totalPaid, settings.currency_symbol)}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Amount Due
                    </span>
                    <div className="text-2xl font-extrabold font-['Outfit'] mt-0.5 text-amber-300">
                      {formatCurrency(totalDue, settings.currency_symbol)}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                    <span>Payment Progress</span>
                    <span>{paymentProgress}% Paid</span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        paymentProgress === 100 ? 'bg-emerald-500' : paymentProgress > 0 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${paymentProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Customer & Fulfillment Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Details Box */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2.5 flex items-center gap-1.5">
                    <User className="w-4 h-4" /> Customer Information
                  </div>
                  <div className="text-base font-bold text-slate-900 dark:text-white">
                    {order.customer_name}
                  </div>
                  {order.customer_business && (
                    <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                      {order.customer_business}
                    </div>
                  )}
                  <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    {order.customer_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> {order.customer_phone}
                      </div>
                    )}
                    {order.customer_email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" /> {order.customer_email}
                      </div>
                    )}
                    {order.customer_address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {order.customer_address}
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Status & Delivery Info Box */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2.5 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" /> Fulfillment & Timeline
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400">Order Placed:</span>
                        <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                          {formatDate(order.order_date)}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">Target Delivery:</span>
                        <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                          {order.delivery_date ? formatDate(order.delivery_date) : 'Not specified'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Update Status:
                    </span>
                    <select
                      value={order.status}
                      onChange={e => handleStatusChange(e.target.value as Order['status'])}
                      className="px-2.5 py-1 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    >
                      <option value="new">New</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2.5 flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4" /> Products & Services ({order.items.length})
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-2.5 px-4 font-bold text-slate-600 dark:text-slate-300">#</th>
                        <th className="py-2.5 px-4 font-bold text-slate-600 dark:text-slate-300">Item Description</th>
                        <th className="py-2.5 px-4 font-bold text-slate-600 dark:text-slate-300 text-right">Rate</th>
                        <th className="py-2.5 px-4 font-bold text-slate-600 dark:text-slate-300 text-center">Qty</th>
                        <th className="py-2.5 px-4 font-bold text-slate-600 dark:text-slate-300 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {order.items.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-3 px-4 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{item.product_name}</td>
                          <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300 font-mono">
                            {formatCurrency(item.rate, settings.currency_symbol)}
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-slate-900 dark:text-white">{item.quantity}</td>
                          <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white font-mono">
                            {formatCurrency(item.total_amount, settings.currency_symbol)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payments History Timeline */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4" /> Payments Received History ({order.payments.length})
                  </div>
                  {totalDue > 0 && (
                    <button
                      id="detail-add-payment-btn"
                      onClick={() => setSelectedOrderForPayment(order)}
                      className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> Record Payment
                    </button>
                  )}
                </div>

                {order.payments.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                    No payment has been recorded yet for this order.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {order.payments.map((payment, idx) => (
                      <div key={payment.id} className="p-3.5 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {payment.payment_method}
                              </span>
                              {payment.reference_number && (
                                <span className="text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                  {payment.reference_number}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {formatDate(payment.payment_date)} {payment.notes && `• ${payment.notes}`}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-['Outfit']">
                            +{formatCurrency(payment.amount, settings.currency_symbol)}
                          </span>
                          <button
                            onClick={() => setDeletePaymentId(payment.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                            title="Delete Payment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Order Notes: </span>
                  <span className="text-slate-600 dark:text-slate-400">{order.notes}</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Delete Order Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Order"
        message={`Are you sure you want to delete order #${order.order_number}? This will remove all associated payment calculations from your dashboard, revenue, and running profit.`}
        confirmText="Delete Order"
        onConfirm={() => {
          deleteOrder(order.id);
          setDeleteConfirmOpen(false);
          onClose();
        }}
        onCancel={() => setDeleteConfirmOpen(false)}
      />

      {/* Delete Single Payment Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletePaymentId}
        title="Delete Payment Record"
        message="Are you sure you want to delete this payment record? This will recalculate the order's due amount, total received payments, and current running profit."
        confirmText="Delete Payment"
        onConfirm={() => {
          if (deletePaymentId) {
            deletePayment(order.id, deletePaymentId);
            setDeletePaymentId(null);
          }
        }}
        onCancel={() => setDeletePaymentId(null)}
      />
    </>
  );
};
