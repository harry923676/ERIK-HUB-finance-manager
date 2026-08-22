import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  CreditCard,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order } from '../types';
import { useBusiness } from '../context/BusinessContext';
import { 
  calculateOrderPaidAmount, 
  calculateOrderDueAmount, 
  formatCurrency, 
  formatDate,
  getOrderPaymentStatus
} from '../utils/calculations';

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  const { settings } = useBusiness();

  if (!order) return null;

  const totalPaid = calculateOrderPaidAmount(order.payments);
  const totalDue = calculateOrderDueAmount(order.total_amount, order.payments);
  const paymentStatus = getOrderPaymentStatus(order.total_amount, order.payments);

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div id="invoice-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col"
        >
          {/* Controls Header (Hidden on Print) */}
          <div className="no-print px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 shrink-0">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="font-bold text-sm text-slate-900 dark:text-white font-['Outfit']">
                Tax Invoice Preview • {order.order_number}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                id="invoice-print-btn"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
              >
                <Printer className="w-4 h-4" /> Print / Save PDF
              </button>
              <button
                id="invoice-close-btn"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Invoice Container */}
          <div className="p-8 overflow-y-auto bg-white text-slate-900 font-sans print-card">
            {/* Header: Company Details & Invoice Meta */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b border-slate-200">
              <div>
                <div className="text-2xl font-black text-indigo-900 tracking-tight font-['Outfit']">
                  {settings.business_name}
                </div>
                {settings.tagline && (
                  <div className="text-xs text-slate-500 font-medium mt-0.5">
                    {settings.tagline}
                  </div>
                )}
                <div className="mt-3 text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {settings.address}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {settings.phone} • <Mail className="w-3.5 h-3.5 text-slate-400 ml-1" /> {settings.email}
                  </div>
                  {settings.tax_id && (
                    <div className="font-semibold text-slate-700 font-mono text-[11px]">
                      GSTIN / TAX ID: {settings.tax_id}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="inline-block px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-black uppercase tracking-wider rounded-lg mb-2">
                  TAX INVOICE
                </div>
                <div className="text-lg font-extrabold text-slate-900 font-mono">
                  {order.order_number}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Date: <span className="font-semibold text-slate-800">{formatDate(order.order_date)}</span>
                </div>
                {order.delivery_date && (
                  <div className="text-xs text-slate-500">
                    Delivery Due: <span className="font-semibold text-slate-800">{formatDate(order.delivery_date)}</span>
                  </div>
                )}
                <div className="mt-2">
                  <span className={`inline-block px-2.5 py-0.5 text-xs font-bold uppercase rounded-full ${
                    paymentStatus === 'fully_paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : paymentStatus === 'partially_paid'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                  }`}>
                    {paymentStatus.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Bill To Section */}
            <div className="py-6 border-b border-slate-200">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Billed To
              </div>
              <div className="text-base font-bold text-slate-900">
                {order.customer_name}
              </div>
              {order.customer_business && (
                <div className="text-sm font-semibold text-indigo-700">
                  {order.customer_business}
                </div>
              )}
              {order.customer_address && (
                <div className="text-xs text-slate-600 mt-1">
                  {order.customer_address}
                </div>
              )}
              <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-4">
                {order.customer_phone && <span>Phone: {order.customer_phone}</span>}
                {order.customer_email && <span>Email: {order.customer_email}</span>}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="py-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200 bg-slate-50">
                    <th className="py-2.5 px-3 font-bold text-slate-700 uppercase tracking-wider">#</th>
                    <th className="py-2.5 px-3 font-bold text-slate-700 uppercase tracking-wider">Item & Description</th>
                    <th className="py-2.5 px-3 font-bold text-slate-700 uppercase tracking-wider text-right">Rate</th>
                    <th className="py-2.5 px-3 font-bold text-slate-700 uppercase tracking-wider text-center">Qty</th>
                    <th className="py-2.5 px-3 font-bold text-slate-700 uppercase tracking-wider text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="py-3 px-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-3 px-3 font-medium text-slate-900">{item.product_name}</td>
                      <td className="py-3 px-3 text-right text-slate-700 font-mono">
                        {formatCurrency(item.rate, settings.currency_symbol)}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-700 font-bold">{item.quantity}</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 font-mono">
                        {formatCurrency(item.total_amount, settings.currency_symbol)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations & Totals Summary */}
            <div className="pt-4 pb-6 border-t-2 border-slate-200 flex flex-col sm:flex-row justify-between items-start gap-6">
              <div className="max-w-xs text-xs text-slate-600">
                <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                  Payment History & Terms
                </div>
                <p className="leading-relaxed">
                  {order.notes || settings.notes_default}
                </p>
                {order.payments.length > 0 && (
                  <div className="mt-3 space-y-1 text-[11px] font-mono">
                    <div className="font-bold text-slate-700">Payments Recorded:</div>
                    {order.payments.map(p => (
                      <div key={p.id} className="text-slate-600">
                        • {formatDate(p.payment_date)}: {formatCurrency(p.amount, settings.currency_symbol)} via {p.payment_method} {p.reference_number ? `(${p.reference_number})` : ''}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-full sm:w-64 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {formatCurrency(order.total_amount, settings.currency_symbol)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-700">
                  <span className="font-semibold">Total Paid</span>
                  <span className="font-bold font-mono">
                    (-) {formatCurrency(totalPaid, settings.currency_symbol)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-t-2 border-slate-900 text-sm font-extrabold">
                  <span className="text-slate-900">Balance Due</span>
                  <span className="text-indigo-900 font-mono">
                    {formatCurrency(totalDue, settings.currency_symbol)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Signature */}
            <div className="pt-8 mt-6 border-t border-dashed border-slate-200 flex justify-between items-end text-xs text-slate-500">
              <div>
                <p className="text-[11px]">This is a computer generated invoice. No physical signature required.</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Powered by BizPulse Financial Organiser</p>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-800 text-xs uppercase">{settings.business_name}</div>
                <div className="text-[11px] text-slate-500 mt-6 pt-1 border-t border-slate-300">Authorized Signatory</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
