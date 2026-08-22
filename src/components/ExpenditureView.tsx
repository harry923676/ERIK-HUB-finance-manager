import React, { useState } from 'react';
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  TrendingDown, 
  Tag, 
  Calendar,
  PieChart as PieIcon,
  Download,
  Building,
  CreditCard
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useBusiness } from '../context/BusinessContext';
import { Expenditure } from '../types';
import { 
  formatCurrency, 
  formatDate, 
  isDateInRange, 
  getDateRangeBounds 
} from '../utils/calculations';
import { ConfirmDialog } from './ConfirmDialog';

export const ExpenditureView: React.FC = () => {
  const { 
    expenditures, 
    categories, 
    settings, 
    dateFilter, 
    customStartDate, 
    customEndDate,
    setExpenditureModalOpen, 
    setExpenditureToEdit, 
    deleteExpenditure 
  } = useBusiness();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [expenditureToDelete, setExpenditureToDelete] = useState<Expenditure | null>(null);

  // Date range
  const { start, end } = getDateRangeBounds(dateFilter, customStartDate, customEndDate);

  // Filter
  const filteredExpenses = expenditures.filter(exp => {
    // Date filter
    if (dateFilter !== 'all' && !isDateInRange(exp.expenditure_date, start, end)) {
      return false;
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchDesc = exp.description.toLowerCase().includes(q);
      const matchVendor = exp.vendor && exp.vendor.toLowerCase().includes(q);
      const matchCategory = exp.category.toLowerCase().includes(q);
      if (!matchDesc && !matchVendor && !matchCategory) return false;
    }

    // Category filter
    if (categoryFilter !== 'all' && exp.category !== categoryFilter) {
      return false;
    }

    // Method filter
    if (methodFilter !== 'all' && exp.payment_method !== methodFilter) {
      return false;
    }

    return true;
  });

  // Sort
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (sortBy === 'date_desc') return new Date(b.expenditure_date).getTime() - new Date(a.expenditure_date).getTime();
    if (sortBy === 'date_asc') return new Date(a.expenditure_date).getTime() - new Date(b.expenditure_date).getTime();
    if (sortBy === 'amount_desc') return b.total_amount - a.total_amount;
    if (sortBy === 'amount_asc') return a.total_amount - b.total_amount;
    return 0;
  });

  // Total expenditure in view
  const totalExpenditureInView = filteredExpenses.reduce((sum, e) => sum + e.total_amount, 0);

  // Category distribution
  const categoryTotals = filteredExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.total_amount;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categoryTotals).sort((a, b) => (b[1] as number) - (a[1] as number))[0];

  return (
    <div id="expenditure-view" className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white font-['Outfit']">
            Expenditure & Cost Management
          </h2>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-tighter mt-0.5">
            Log business expenses, overheads, raw materials, bills, and vendor payouts
          </p>
        </div>

        <button
          id="add-expenditure-btn"
          onClick={() => {
            setExpenditureToEdit(null);
            setExpenditureModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Record New Expense
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Expenditures (Filtered)
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-['Outfit'] mt-1">
            {formatCurrency(totalExpenditureInView, settings.currency_symbol)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {filteredExpenses.length} expense items recorded
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Highest Expense Category
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-white font-['Outfit'] mt-1 truncate">
            {topCategory ? topCategory[0] : 'None'}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {topCategory ? `${formatCurrency(Number(topCategory[1]), settings.currency_symbol)} (${Math.round((Number(topCategory[1]) / (totalExpenditureInView || 1)) * 100)}% of total)` : 'No expenses in range'}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Average Expense Item
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-white font-['Outfit'] mt-1">
            {filteredExpenses.length > 0
              ? formatCurrency(Math.round(totalExpenditureInView / filteredExpenses.length), settings.currency_symbol)
              : formatCurrency(0, settings.currency_symbol)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Across {filteredExpenses.length} transactions
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search description, vendor..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-slate-800 dark:text-white w-48 sm:w-60 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Category Filter */}
            <select
              id="expenditure-category-filter"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Method Filter */}
            <select
              id="expenditure-payment-method-filter"
              value={methodFilter}
              onChange={e => setMethodFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Payment Methods</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Cheque">Cheque</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Sort */}
          <select
            id="expenditure-sort-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="amount_desc">Highest Amount</option>
            <option value="amount_asc">Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      {sortedExpenses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white font-['Outfit']">
            No expenditures found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
            {search || categoryFilter !== 'all' || methodFilter !== 'all'
              ? 'No expense records match your active search or filters.'
              : 'Keep track of all your overheads and raw materials by recording your first expense.'}
          </p>
          <button
            onClick={() => {
              setExpenditureToEdit(null);
              setExpenditureModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Record First Expense
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                <tr>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Expense Description</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Vendor</th>
                  <th className="px-6 py-3.5 text-center">Rate × Qty</th>
                  <th className="px-6 py-3.5">Method</th>
                  <th className="px-6 py-3.5 text-right">Total Amount</th>
                  <th className="px-6 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                {sortedExpenses.map(expense => (
                  <tr key={expense.id} className="text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Date */}
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-white text-xs">
                      {formatDate(expense.expenditure_date)}
                    </td>

                    {/* Description */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 dark:text-white">
                        {expense.description}
                      </div>
                      {expense.notes && (
                        <div className="text-[11px] text-slate-400 mt-0.5 max-w-xs truncate">
                          {expense.notes}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                        {expense.category}
                      </span>
                    </td>

                    {/* Vendor */}
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-xs">
                      {expense.vendor ? <div className="font-semibold">{expense.vendor}</div> : '-'}
                    </td>

                    {/* Rate x Qty */}
                    <td className="px-6 py-4 text-center text-slate-500 font-mono text-xs">
                      {formatCurrency(expense.rate, settings.currency_symbol)} × {expense.quantity}
                    </td>

                    {/* Payment Method */}
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {expense.payment_method}
                      </span>
                    </td>

                    {/* Total Amount */}
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-rose-600 dark:text-rose-400 font-['Outfit']">
                        {formatCurrency(expense.total_amount, settings.currency_symbol)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          id={`edit-expense-${expense.id}`}
                          onClick={() => {
                            setExpenditureToEdit(expense);
                            setExpenditureModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                          title="Edit Expense"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          id={`delete-expense-${expense.id}`}
                          onClick={() => setExpenditureToDelete(expense)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Showing {sortedExpenses.length} of {expenditures.length} expenses</span>
            <span className="font-bold text-rose-600 dark:text-rose-400">
              Total: {formatCurrency(totalExpenditureInView, settings.currency_symbol)}
            </span>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!expenditureToDelete}
        title="Delete Expense Record"
        message={expenditureToDelete ? `Are you sure you want to delete "${expenditureToDelete.description}" for ${formatCurrency(expenditureToDelete.total_amount, settings.currency_symbol)}? This will automatically recalculate your total expenditure and increase your running profit.` : ''}
        confirmText="Delete Expense"
        onConfirm={() => {
          if (expenditureToDelete) {
            deleteExpenditure(expenditureToDelete.id);
            setExpenditureToDelete(null);
          }
        }}
        onCancel={() => setExpenditureToDelete(null)}
      />
    </div>
  );
};
