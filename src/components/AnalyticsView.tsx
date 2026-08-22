import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart as PieChartIcon, 
  BarChart3, 
  Download, 
  Calendar, 
  Percent, 
  Award, 
  ArrowUpRight, 
  ArrowDownRight,
  Printer,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { useBusiness } from '../context/BusinessContext';
import { formatCurrency, formatDate } from '../utils/calculations';

export const AnalyticsView: React.FC = () => {
  const { 
    financialSummary, 
    monthlyFinancials, 
    orders, 
    expenditures, 
    customers, 
    settings, 
    showToast 
  } = useBusiness();

  // Chart data
  const monthlyData = monthlyFinancials.map(m => ({
    name: m.monthKey,
    Revenue: m.revenue,
    Expenditure: m.expenditure,
    Profit: m.profit,
    OrderVolume: m.orderCount,
    OrderTotal: m.orderValue
  }));

  // Customer leaderboard by revenue
  const customerLTV = customers.map(c => {
    const custOrders = orders.filter(
      o => o.customer_id === c.id || o.customer_name.toLowerCase() === c.name.toLowerCase()
    );
    const totalOrderValue = custOrders.reduce((sum, o) => sum + o.total_amount, 0);
    const totalPaid = custOrders.reduce((sum, o) => sum + o.payments.reduce((pSum, p) => pSum + p.amount, 0), 0);
    const orderCount = custOrders.length;
    return {
      ...c,
      totalOrderValue,
      totalPaid,
      orderCount
    };
  }).sort((a, b) => b.totalPaid - a.totalPaid).slice(0, 5);

  // Expense categories breakdown
  const categoryTotals = expenditures.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.total_amount;
    return acc;
  }, {} as Record<string, number>);

  const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];
  const expensePieData: { name: string; value: number; color: string }[] = Object.entries(categoryTotals).map(([name, value], i) => ({
    name,
    value: Number(value),
    color: COLORS[i % COLORS.length]
  }));

  // Export financial report to CSV
  const handleExportCSV = () => {
    const headers = ['Month', 'Total Orders Value', 'Payments Received (Revenue)', 'Expenditure', 'Net Running Profit'];
    const rows = monthlyFinancials.map(m => [
      m.monthKey,
      m.orderValue,
      m.revenue,
      m.expenditure,
      m.profit
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Financial_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Financial report CSV downloaded successfully!', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  // Collection Efficiency calculation: Total Payments Received / Total Order Value
  const collectionEfficiency = financialSummary.totalOrderValue > 0
    ? Math.round((financialSummary.totalPaymentsReceived / financialSummary.totalOrderValue) * 100)
    : 100;

  // Average Order Value
  const averageOrderValue = financialSummary.totalOrders > 0
    ? Math.round(financialSummary.totalOrderValue / financialSummary.totalOrders)
    : 0;

  return (
    <div id="analytics-view" className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white font-['Outfit']">
            Financial Analytics & Reports
          </h2>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-tighter mt-0.5">
            Deep dive into revenue velocity, margins, and customer lifetime values
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> Print Report
          </button>
        </div>
      </div>

      {/* Primary KPI Ratio Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Net Running Profit */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Net Running Profit
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-800 dark:text-white font-['Outfit']">
            {formatCurrency(financialSummary.runningProfit, settings.currency_symbol)}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Cash Inflow ({formatCurrency(financialSummary.totalPaymentsReceived, settings.currency_symbol)}) - Outflow ({formatCurrency(financialSummary.totalExpenditure, settings.currency_symbol)})
          </div>
        </div>

        {/* Operating Margin */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Operating Profit Margin
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-['Outfit']">
            {financialSummary.profitMarginPercent}%
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Profit margin generated per unit of revenue
          </div>
        </div>

        {/* Collection Efficiency */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Collection Efficiency
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400 font-['Outfit']">
            {collectionEfficiency}%
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Of total billed order value collected
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Average Order Value
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-800 dark:text-white font-['Outfit']">
            {formatCurrency(averageOrderValue, settings.currency_symbol)}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Across {financialSummary.totalOrders} total client orders
          </div>
        </div>
      </div>

      {/* Main Performance Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white font-['Outfit'] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Monthly Financial Overview & Trends
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical view of payments received, expenditures, and net profits
            </p>
          </div>
        </div>

        <div className="h-80 mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
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
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '15px' }} />
              <Bar dataKey="Revenue" name="Revenue (Payments Received)" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={32} />
              <Bar dataKey="Expenditure" name="Total Expenditure" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={32} />
              <Bar dataKey="Profit" name="Net Running Profit" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lower Row: Category Distribution & Customer Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Expense Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-800 dark:text-white font-['Outfit'] flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-rose-500" />
              Expenditure by Category
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Where your business capital is allocated
            </p>
          </div>

          <div className="h-56 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {expensePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${settings.currency_symbol}${Number(value).toLocaleString()}`, '']}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 space-y-1.5 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {expensePieData.slice(0, 5).map((item, idx) => (
              <div key={idx} className="pt-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{item.name}</span>
                </div>
                <span className="font-bold text-slate-800 dark:text-white font-mono">
                  {formatCurrency(item.value, settings.currency_symbol)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Customers Leaderboard (LTV) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-800 dark:text-white font-['Outfit'] flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Top Customers by Revenue (LTV)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Highest contributing client relationships
            </p>
          </div>

          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {customerLTV.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No customer orders recorded yet.
              </div>
            ) : (
              customerLTV.map((cust, idx) => (
                <div key={cust.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs shrink-0 font-['Outfit']">
                      #{idx + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-white truncate">
                        {cust.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {cust.business_name || `${cust.orderCount} Orders`}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 font-['Outfit']">
                      {formatCurrency(cust.totalPaid, settings.currency_symbol)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Billed: {formatCurrency(cust.totalOrderValue, settings.currency_symbol)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
