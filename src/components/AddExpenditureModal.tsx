import React, { useState, useEffect } from 'react';
import { 
  X, 
  Receipt, 
  DollarSign, 
  Calendar, 
  Tag, 
  Building, 
  CreditCard,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useBusiness } from '../context/BusinessContext';
import { Expenditure, PaymentMethod } from '../types';

interface AddExpenditureModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenditureToEdit?: Expenditure | null;
}

export const AddExpenditureModal: React.FC<AddExpenditureModalProps> = ({
  isOpen,
  onClose,
  expenditureToEdit
}) => {
  const { 
    addExpenditure, 
    updateExpenditure, 
    categories, 
    addCategory, 
    expensePurposes,
    expenseProducts,
    addExpensePurpose,
    settings, 
    showToast 
  } = useBusiness();

  const [description, setDescription] = useState('');
  const [rate, setRate] = useState<number | string>('');
  const [quantity, setQuantity] = useState<number | string>(1);
  const [category, setCategory] = useState<string>('Raw Materials');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [vendor, setVendor] = useState('');
  const [notes, setNotes] = useState('');

  // New category creation input toggle
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Helper to auto-assign category and rate based on expense product catalogue
  const handleSelectPurpose = (chosenPurpose: string) => {
    setDescription(chosenPurpose);
    
    // Look up in expense product catalogue for rate, category, and vendor
    const matchedExpProd = expenseProducts.find(
      p => p.name.trim().toLowerCase() === chosenPurpose.trim().toLowerCase()
    );

    if (matchedExpProd) {
      if (matchedExpProd.default_rate && (!rate || rate === 0)) {
        setRate(matchedExpProd.default_rate);
      }
      if (matchedExpProd.category && (categories.includes(matchedExpProd.category) || matchedExpProd.category)) {
        setCategory(matchedExpProd.category);
      }
      if (matchedExpProd.default_vendor && !vendor) {
        setVendor(matchedExpProd.default_vendor);
      }
    } else {
      // Fallback heuristics
      const p = chosenPurpose.toLowerCase();
      if (p.includes('frame')) {
        const found = categories.find(c => c.toLowerCase().includes('raw')) || categories.find(c => c.toLowerCase().includes('inventory')) || 'Raw Materials';
        setCategory(found);
      } else if (p.includes('printer ink') || p.includes('ink')) {
        const found = categories.find(c => c.toLowerCase().includes('office')) || categories.find(c => c.toLowerCase().includes('raw')) || 'Office Expenses';
        setCategory(found);
      } else if (p.includes('photo paper') || p.includes('paper')) {
        const found = categories.find(c => c.toLowerCase().includes('raw')) || categories.find(c => c.toLowerCase().includes('inventory')) || 'Raw Materials';
        setCategory(found);
      } else if (p.includes('transport')) {
        const found = categories.find(c => c.toLowerCase().includes('transport')) || 'Transportation';
        setCategory(found);
      } else if (p.includes('speaker') || p.includes('mic')) {
        const found = categories.find(c => c.toLowerCase().includes('equipment')) || categories.find(c => c.toLowerCase().includes('maintenance')) || 'Equipment';
        setCategory(found);
      } else if (p.includes('misc')) {
        const found = categories.find(c => c.toLowerCase().includes('misc')) || 'Miscellaneous';
        setCategory(found);
      }
    }
  };

  useEffect(() => {
    if (expenditureToEdit) {
      setDescription(expenditureToEdit.description);
      setRate(expenditureToEdit.rate);
      setQuantity(expenditureToEdit.quantity || 1);
      setCategory(expenditureToEdit.category);
      setDate(expenditureToEdit.expenditure_date);
      setPaymentMethod(expenditureToEdit.payment_method);
      setVendor(expenditureToEdit.vendor || '');
      setNotes(expenditureToEdit.notes || '');
    } else {
      setDescription('');
      setRate('');
      setQuantity(1);
      setCategory(categories[0] || 'Raw Materials');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('Bank Transfer');
      setVendor('');
      setNotes('');
    }
    setShowNewCatInput(false);
    setNewCategoryName('');
  }, [expenditureToEdit, isOpen, categories]);

  const handleAddNewCategory = () => {
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim());
      setCategory(newCategoryName.trim());
      setNewCategoryName('');
      setShowNewCatInput(false);
    }
  };

  const calculatedTotal = (Number(rate) || 0) * (Number(quantity) || 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numRate = Number(rate);
    const numQty = Number(quantity) || 1;
    if (isNaN(numRate) || numRate <= 0) {
      showToast('Please enter a valid expense rate/amount.', 'error');
      return;
    }

    if (!description.trim()) {
      showToast('Please enter an expense description or purpose.', 'error');
      return;
    }

    if (expenditureToEdit) {
      updateExpenditure(expenditureToEdit.id, {
        description: description.trim(),
        rate: numRate,
        quantity: numQty,
        total_amount: numRate * numQty,
        category,
        expenditure_date: date,
        payment_method: paymentMethod,
        vendor: vendor.trim() || undefined,
        notes: notes.trim() || undefined
      });
    } else {
      addExpenditure({
        description: description.trim(),
        rate: numRate,
        quantity: numQty,
        total_amount: numRate * numQty,
        category,
        expenditure_date: date,
        payment_method: paymentMethod,
        vendor: vendor.trim() || undefined,
        notes: notes.trim() || undefined
      });
    }

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="expenditure-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
                    {expenditureToEdit ? 'Edit Expense Record' : 'Record New Expenditure'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Track operating costs, materials, and vendor payouts
                  </p>
                </div>
              </div>
              <button
                id="expenditure-close-btn"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Expense Purpose / Description Section */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Expense Description / Purpose <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Select standard purpose or type below</span>
                </div>

                {/* Dropdown Selector */}
                <div className="mb-2">
                  <select
                    value={expensePurposes.includes(description) ? description : '__CUSTOM__'}
                    onChange={e => {
                      if (e.target.value !== '__CUSTOM__') {
                        handleSelectPurpose(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 text-xs sm:text-sm font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none cursor-pointer"
                  >
                    <option value="" disabled>-- Select Expense Purpose / Item --</option>
                    {expensePurposes.map(purpose => (
                      <option key={purpose} value={purpose}>
                        {purpose}
                      </option>
                    ))}
                    <option value="__CUSTOM__">Other / Custom Description...</option>
                  </select>
                </div>

                {/* Quick Purpose Selection Chips */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {expensePurposes.map(purpose => {
                    const isSelected = description.trim().toLowerCase() === purpose.toLowerCase();
                    return (
                      <button
                        key={purpose}
                        type="button"
                        onClick={() => handleSelectPurpose(purpose)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
                            : 'bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200/60 dark:border-slate-700/60'
                        }`}
                      >
                        {purpose}
                      </button>
                    );
                  })}
                </div>

                {/* Text input with datalist */}
                <input
                  id="expenditure-title-input"
                  type="text"
                  list="expense-purposes-datalist"
                  required
                  placeholder="e.g. Frame, Printer Ink, Photo Paper..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
                <datalist id="expense-purposes-datalist">
                  {expensePurposes.map(purpose => (
                    <option key={purpose} value={purpose} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rate ({settings.currency_symbol}) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      {settings.currency_symbol}
                    </span>
                    <input
                      id="expenditure-rate-input"
                      type="number"
                      step="any"
                      min="0.01"
                      required
                      placeholder="0.00"
                      value={rate}
                      onChange={e => setRate(e.target.value)}
                      className="w-full pl-7 pr-2.5 py-2 text-xs sm:text-sm font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Qty / Units
                  </label>
                  <input
                    id="expenditure-qty-input"
                    type="number"
                    step="any"
                    min="1"
                    required
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Total Expense
                  </label>
                  <div className="px-3 py-2 text-xs sm:text-sm font-extrabold text-rose-600 dark:text-rose-400 bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-xl font-['Outfit'] truncate">
                    {settings.currency_symbol}{calculatedTotal.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date of Expense <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="expenditure-date-input"
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                {/* Category */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Category
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowNewCatInput(!showNewCatInput)}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> {showNewCatInput ? 'List' : 'New'}
                    </button>
                  </div>

                  {showNewCatInput ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Category name..."
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddNewCategory}
                        className="px-2.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                      >
                        Add
                      </button>
                    </div>
                  ) : (
                    <select
                      id="expenditure-category-select"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Payment Method & Vendor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    id="expenditure-method-select"
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  >
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="UPI">UPI / Google Pay / Paytm</option>
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Vendor / Supplier (Optional)
                  </label>
                  <input
                    id="expenditure-vendor-input"
                    type="text"
                    placeholder="e.g. Apex Packaging Ltd"
                    value={vendor}
                    onChange={e => setVendor(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Advance paid for machine replacement part..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  id="save-expenditure-btn"
                  type="submit"
                  className="px-6 py-2 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-xl shadow-md shadow-rose-600/20 transition-all"
                >
                  {expenditureToEdit ? 'Update Expense' : 'Save Expense'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
