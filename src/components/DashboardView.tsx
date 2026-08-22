import React, { useState } from 'react';
import { 
  ShoppingBag, 
  CreditCard, 
  Clock, 
  Receipt, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  PieChart as PieChartIcon,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  Plus
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area,
  CartesianGrid
} from 'recharts';
import { useBusiness } from '../context/BusinessContext';
import { formatCurrency, formatDate, getRelativeTime, calculateOrderPaidAmount, calculateOrderDueAmount, getOrderPaymentStatus } from '../utils/calculations';
import { motion } from 'motion/react';

export const DashboardView: React.FC = () => {
  const { 
    financialSummary, 
    monthlyFinancials, 
    orders, 
    activityLogs, 
    settings, 
    setActiveTab,
    setOrderModalOpen,
    setOrderToEdit,
    setExpenditureModalOpen,
    setExpenditureToEdit,
    setSelectedOrderForPayment,
    setSelectedOrderForDetail
  } = useBusiness();

  const [chartViewMode, setChartViewMode] = useState<'bar' | 'area'>('bar');

  // Chart data for revenue vs expenditure vs profit
  const chartData = monthlyFinancials.map(item => ({
    name: item.monthKey,
    Revenue: item.revenue,
    Expenditure: item.expenditure,
    Profit: item.profit,
    OrderValue: item.orderValue
  }));

  // Top high-value orders
  const recentHighValueOrders = [...orders]
    .filter(o => o.status !== 'cancelled')
    .sort((a, b) => b.total_amount - a.total_amount)
    .slice(0, 5);

  const getTrendBadge = (rate: number, isExpenditure: boolean = false) => {
    const isPositive = rate > 0;
    const isNeutral = rate === 0;

    return (
      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
        isNeutral 
          ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' 
          : isPositive 
            ? (isExpenditure ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/50' : 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50')
            : (isExpenditure ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50' : 'text-rose-500 bg-rose-50 dark:bg-rose-950/50')
      }`}>
        {isPositive ? `+${rate}%` : `${rate}%`}
      </span>
    );
  };

  const collectionRate = financialSummary.totalOrderValue > 0 
    ? Math.round((financialSummary.totalPaymentsReceived / financialSummary.totalOrderValue) * 100)
    : 100;

  return (
    <div id="dashboard-view" className="space-y-6 max-w-7xl mx-auto">
      {/* 1. TOP OVERVIEW METRIC CARDS (Sleek 4-Card Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Orders */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-lg">
                <ShoppingBag className="w-5 h-5" />
              </div>
              {getTrendBadge(financialSummary.growth.revenueGrowth)}
            </div>
            <div className="text-slate-400 dark:text-slate-400 text-sm font-medium">Total Orders</div>
            <div className="text-2xl font-bold text-slate-800 dark:text-white font-['Outfit'] mt-0.5">
              {formatCurrency(financialSummary.totalOrderValue, settings.currency_symbol)}
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            {financialSummary.totalOrders} {financialSummary.totalOrders === 1 ? 'order' : 'orders'} in period
          </div>
        </motion.div>

        {/* Card 2: Payments Received */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-lg">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-1 rounded-full">
                {collectionRate}% Paid
              </span>
            </div>
            <div className="text-slate-400 dark:text-slate-400 text-sm font-medium">Payments Received</div>
            <div className="text-2xl font-bold text-slate-800 dark:text-white font-['Outfit'] mt-0.5">
              {formatCurrency(financialSummary.totalPaymentsReceived, settings.currency_symbol)}
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            {formatCurrency(financialSummary.totalPendingPayments, settings.currency_symbol)} Pending
          </div>
        </motion.div>

        {/* Card 3: Total Expenditure */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-lg">
                <Receipt className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <button
                  id="dashboard-record-expense-btn"
                  onClick={() => {
                    setExpenditureToEdit(null);
                    setExpenditureModalOpen(true);
                  }}
                  className="px-2.5 py-1 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-full transition-colors flex items-center gap-1 cursor-pointer"
                  title="Record New Expense"
                >
                  <Plus className="w-3.5 h-3.5" /> Expense
                </button>
                {getTrendBadge(financialSummary.growth.expenditureGrowth, true)}
              </div>
            </div>
            <div className="text-slate-400 dark:text-slate-400 text-sm font-medium">Total Expenditure</div>
            <div className="text-2xl font-bold text-slate-800 dark:text-white font-['Outfit'] mt-0.5">
              {formatCurrency(financialSummary.totalExpenditure, settings.currency_symbol)}
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex items-center justify-between">
            <span>Operating costs & vendor outflows</span>
            <button
              onClick={() => setActiveTab('expenditure')}
              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              View List →
            </button>
          </div>
        </motion.div>

        {/* Card 4: Running Net Profit (Sleek Featured Hero Card) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.15 }}
          className="bg-indigo-600 p-5 rounded-3xl shadow-xl shadow-indigo-100 dark:shadow-none text-white flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-indigo-500 text-white rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-bold text-white/90 border border-white/20 px-2 py-1 rounded-full">
                {financialSummary.profitMarginPercent}% Margin
              </span>
            </div>
            <div className="text-indigo-100 text-sm font-medium">Running Net Profit</div>
            <div className="text-2xl font-bold text-white font-['Outfit'] mt-0.5">
              {formatCurrency(financialSummary.runningProfit, settings.currency_symbol)}
            </div>
          </div>
          <div className="mt-3 text-xs text-indigo-200">
            Actual Cash Profit (Inflow - Outflow)
          </div>
        </motion.div>
      </div>

      {/* 2. CHARTS & RECENT ACTIVITY SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Revenue vs Expenditure Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="font-bold text-slate-800 dark:text-white text-lg font-['Outfit']">
                Revenue vs Expenditure
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Monthly inflow vs cost trends and profit generation
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex gap-3">
                <span className="flex items-center gap-2 text-xs font-medium text-slate-400">
                  <span className="w-3 h-3 bg-indigo-500 rounded-full" /> Revenue
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-slate-400">
                  <span className="w-3 h-3 bg-slate-200 dark:bg-slate-700 rounded-full" /> Expense
                </span>
              </div>

              {/* Chart Mode Toggle */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setChartViewMode('bar')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    chartViewMode === 'bar'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Bar
                </button>
                <button
                  onClick={() => setChartViewMode('area')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    chartViewMode === 'area'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Area
                </button>
              </div>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              {chartViewMode === 'bar' ? (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={val => `${val >= 1000 ? `${val / 1000}k` : val}`} />
                  <Tooltip
                    formatter={(value: any) => [`${settings.currency_symbol}${Number(value).toLocaleString()}`, '']}
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderRadius: '16px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                    }}
                  />
                  <Bar dataKey="Revenue" name="Revenue" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="Expenditure" name="Expense" fill="#e2e8f0" radius={[6, 6, 0, 0]} maxBarSize={28} />
                </BarChart>
              ) : (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={val => `${val >= 1000 ? `${val / 1000}k` : val}`} />
                  <Tooltip
                    formatter={(value: any) => [`${settings.currency_symbol}${Number(value).toLocaleString()}`, '']}
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderRadius: '16px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Area type="monotone" dataKey="Revenue" name="Revenue" stroke="#6366f1" fillOpacity={1} fill="url(#gradRevenue)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="Expenditure" name="Expense" stroke="#94a3b8" fillOpacity={1} fill="url(#gradExpense)" strokeWidth={2} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Recent Activity */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 dark:text-white text-lg font-['Outfit']">
              Recent Activity
            </h2>
            <span className="text-xs font-semibold text-slate-400">Live</span>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto max-h-[300px] pr-1">
            {activityLogs.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                No activity recorded yet.
              </div>
            ) : (
              activityLogs.slice(0, 5).map(log => {
                let dotColor = 'bg-blue-500 ring-blue-50 dark:ring-blue-950/60';
                if (log.type.includes('payment')) {
                  dotColor = 'bg-emerald-500 ring-emerald-50 dark:ring-emerald-950/60';
                } else if (log.type.includes('expenditure')) {
                  dotColor = 'bg-rose-500 ring-rose-50 dark:ring-rose-950/60';
                }

                return (
                  <div key={log.id} className="flex gap-4">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ring-4 shrink-0 ${dotColor}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                        {log.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {log.description}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {getRelativeTime(log.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <button
            onClick={() => setActiveTab('reports')}
            className="w-full mt-4 py-2.5 text-indigo-600 dark:text-indigo-400 font-bold text-sm bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-xl transition-colors cursor-pointer"
          >
            View All Logs
          </button>
        </div>
      </div>

      {/* 3. RECENT HIGH-VALUE ORDERS TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800 dark:text-white text-lg font-['Outfit']">
              Recent High-Value Orders
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Highest billable customer orders and payment statuses
            </p>
          </div>
          <button
            onClick={() => setActiveTab('orders')}
            className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            View All Orders <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              <tr>
                <th className="px-6 py-3.5">Order ID</th>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Total Amount</th>
                <th className="px-6 py-3.5">Paid</th>
                <th className="px-6 py-3.5">Due</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
              {recentHighValueOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400 text-xs">
                    No orders placed yet. Click "Add New Order" to get started.
                  </td>
                </tr>
              ) : (
                recentHighValueOrders.map(order => {
                  const paid = calculateOrderPaidAmount(order.payments);
                  const due = calculateOrderDueAmount(order.total_amount, order.payments);
                  const pStatus = getOrderPaymentStatus(order.total_amount, order.payments);

                  let badge = (
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 text-[10px] font-bold rounded-md uppercase tracking-wider">
                      Fully Paid
                    </span>
                  );
                  if (pStatus === 'partially_paid') {
                    badge = (
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 text-[10px] font-bold rounded-md uppercase tracking-wider">
                        Partially Paid
                      </span>
                    );
                  } else if (pStatus === 'pending') {
                    badge = (
                      <span className="px-2.5 py-1 bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 text-[10px] font-bold rounded-md uppercase tracking-wider">
                        Pending
                      </span>
                    );
                  }

                  return (
                    <tr key={order.id} className="text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-xs text-slate-900 dark:text-white">
                        {order.order_number}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {order.customer_name}
                        </div>
                        {order.customer_business && (
                          <div className="text-[11px] text-slate-400">
                            {order.customer_business}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white font-['Outfit']">
                        {formatCurrency(order.total_amount, settings.currency_symbol)}
                      </td>
                      <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400 font-bold font-['Outfit']">
                        {formatCurrency(paid, settings.currency_symbol)}
                      </td>
                      <td className="px-6 py-4 font-bold font-['Outfit']">
                        {due > 0 ? (
                          <span className="text-rose-500">{formatCurrency(due, settings.currency_symbol)}</span>
                        ) : (
                          <span className="text-slate-400">₹0</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {badge}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {due > 0 && (
                            <button
                              onClick={() => setSelectedOrderForPayment(order)}
                              className="px-2.5 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 rounded-lg transition-colors"
                            >
                              + Pay
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedOrderForDetail(order)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
