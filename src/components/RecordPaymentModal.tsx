import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  AlertCircle, 
  Calendar, 
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useBusiness } from '../context/BusinessContext';
import { Order, PaymentMethod } from '../types';
import { calculateOrderPaidAmount, calculateOrderDueAmount, formatCurrency } from '../utils/calculations';

interface RecordPaymentModalProps {
  order: Order | null;
  onClose: () => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  order,
  onClose
}) => {
  const { addPaymentToOrder, settings } = useBusiness();

  const [amount, setAmount] = useState<number | string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Default to full due amount when order opens
  useEffect(() => {
    if (order) {
      const due = calculateOrderDueAmount(order.total_amount, order.payments);
      setAmount(due > 0 ? due : '');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('Bank Transfer');
      setReferenceNumber('');
      setNotes('');
    }
  }, [order]);

  if (!order) return null;

  const totalPaid = calculateOrderPaidAmount(order.payments);
  const totalDue = calculateOrderDueAmount(order.total_amount, order.payments);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    addPaymentToOrder(order.id, {
      amount: numAmount,
      payment_date: paymentDate,
      payment_method: paymentMethod,
      reference_number: referenceNumber.trim() || undefined,
      notes: notes.trim() || undefined
    });

    onClose();
  };

  return (
    <AnimatePresence>
      <div id="record-payment-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
                  Record Payment
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {order.order_number} • {order.customer_name}
                </p>
              </div>
            </div>
            <button
              id="record-pay-close-btn"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Financial summary card */}
          <div className="my-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Order Total</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white font-['Outfit'] mt-0.5">
                {formatCurrency(order.total_amount, settings.currency_symbol)}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-500">Paid So Far</div>
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-['Outfit'] mt-0.5">
                {formatCurrency(totalPaid, settings.currency_symbol)}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-amber-500">Current Due</div>
              <div className="text-xs font-bold text-amber-600 dark:text-amber-400 font-['Outfit'] mt-0.5">
                {formatCurrency(totalDue, settings.currency_symbol)}
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payment Amount ({settings.currency_symbol}) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  {settings.currency_symbol}
                </span>
                <input
                  id="record-pay-amount-input"
                  type="number"
                  step="any"
                  min="1"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2 text-sm font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              {Number(amount) > totalDue && totalDue > 0 && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Amount exceeds current due amount of {formatCurrency(totalDue, settings.currency_symbol)}.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Date <span className="text-rose-500">*</span>
                </label>
                <input
                  id="record-pay-date-input"
                  type="date"
                  required
                  value={paymentDate}
                  onChange={e => setPaymentDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method
                </label>
                <select
                  id="record-pay-method-select"
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                  <option value="UPI">UPI / Google Pay</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reference / Transaction # (Optional)
              </label>
              <input
                id="record-pay-ref-input"
                type="text"
                placeholder="e.g. UTR-98210398 or CHQ-00192"
                value={referenceNumber}
                onChange={e => setReferenceNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Notes (Optional)
              </label>
              <input
                id="record-pay-notes-input"
                type="text"
                placeholder="e.g. Cleared against invoice milestone"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                id="record-pay-submit-btn"
                type="submit"
                className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-md shadow-emerald-600/20 transition-all"
              >
                Record Payment
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
