import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Search, 
  Calendar, 
  Plus, 
  Sun, 
  Moon, 
  Bell, 
  ChevronDown, 
  Sparkles, 
  ShoppingBag, 
  CreditCard, 
  Receipt,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { DateFilterType } from '../types';
import { CustomDateRangeModal } from './CustomDateRangeModal';
import { getRelativeTime } from '../utils/calculations';

interface TopNavProps {
  onMobileMenuClick?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onMobileMenuClick }) => {
  const { 
    activeTab, 
    dateFilter, 
    setDateFilter, 
    customStartDate, 
    customEndDate,
    searchQuery, 
    setSearchQuery,
    isDarkMode, 
    toggleDarkMode,
    setOrderModalOpen,
    setOrderToEdit,
    setExpenditureModalOpen,
    setExpenditureToEdit,
    setSelectedOrderForPayment,
    orders,
    activityLogs,
    settings
  } = useBusiness();

  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [customDateModalOpen, setCustomDateModalOpen] = useState(false);

  const dateRef = useRef<HTMLDivElement>(null);
  const addRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setDateDropdownOpen(false);
      }
      if (addRef.current && !addRef.current.contains(event.target as Node)) {
        setQuickAddOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dateFilterOptions: { value: DateFilterType; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'this_week', label: 'This Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'last_3_months', label: 'Last 3 Months' },
    { value: 'last_6_months', label: 'Last 6 Months' },
    { value: 'this_year', label: 'This Year' },
    { value: 'financial_year', label: 'Financial Year (FY)' },
    { value: 'custom', label: 'Custom Date Range...' },
    { value: 'all', label: 'All Time' },
  ];

  const getCurrentDateLabel = () => {
    if (dateFilter === 'custom' && customStartDate && customEndDate) {
      return `${customStartDate} to ${customEndDate}`;
    }
    const found = dateFilterOptions.find(o => o.value === dateFilter);
    return found ? found.label : 'Date Range';
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Business Overview';
      case 'orders': return 'Orders Management';
      case 'payments': return 'Payments Received';
      case 'expenditures':
      case 'expenditure': return 'Expenditure & Costs';
      case 'customers': return 'Customer Directory';
      case 'reports':
      case 'analytics': return 'Reports & Analytics';
      case 'settings': return 'Business Settings';
      default: return 'Business Overview';
    }
  };

  return (
    <>
      <header id="top-nav-bar" className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-30 transition-colors">
        {/* Left Side: Mobile Menu + Page Title & Subtitle */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <button
            id="mobile-menu-toggle-btn"
            type="button"
            onClick={onMobileMenuClick}
            className="flex items-center justify-center w-10 h-10 min-w-[40px] text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 rounded-xl lg:hidden border border-slate-200/80 dark:border-slate-700/80 shadow-2xs transition-all cursor-pointer shrink-0"
            aria-label="Open navigation menu"
            title="Open Menu"
          >
            <Menu className="w-5 h-5 text-slate-700 dark:text-slate-200" strokeWidth={2.2} />
          </button>
          
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-bold text-slate-800 dark:text-white font-['Outfit'] tracking-tight truncate">
              {getPageTitle()}
            </h1>
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-tighter hidden sm:block truncate">
              {settings.tax_id ? `GSTIN: ${settings.tax_id} • ` : ''}{getCurrentDateLabel()}
            </p>
          </div>
        </div>

        {/* Right Side: Global Search + Developer Credit + Controls */}
        <div className="flex items-center gap-2.5 sm:gap-4 lg:gap-5">
          {/* Header Developer Credit */}
          <div 
            id="header-developer-credit"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 shadow-2xs select-none transition-colors shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shine-star-sparkle shrink-0" />
            <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">developed by</span>
            <span className="font-extrabold tracking-wide shine-text-pawan font-['Outfit'] cursor-default text-xs sm:text-xs">
              Pawan Paji
            </span>
          </div>

          {/* Search Bar */}
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="global-search-input"
              type="text"
              placeholder="Search records..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border-none rounded-full py-2 pl-10 pr-8 text-sm w-48 lg:w-64 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Date Filter Pill Button */}
          <div className="relative" ref={dateRef}>
            <button
              id="date-filter-dropdown-btn"
              onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors shrink-0 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span className="hidden sm:inline">{getCurrentDateLabel()}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dateDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  Select Period
                </div>
                {dateFilterOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      if (option.value === 'custom') {
                        setCustomDateModalOpen(true);
                      } else {
                        setDateFilter(option.value);
                      }
                      setDateDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm transition-colors flex items-center justify-between cursor-pointer ${
                      dateFilter === option.value
                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{option.label}</span>
                    {dateFilter === option.value && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Action Button & Dropdown */}
          <div className="relative flex items-center gap-2" ref={addRef}>
            {/* Contextual primary button or Dropdown */}
            {activeTab === 'expenditure' || activeTab === 'expenditures' ? (
              <button
                id="top-nav-add-expense-btn"
                onClick={() => {
                  setExpenditureToEdit(null);
                  setExpenditureModalOpen(true);
                }}
                className="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg shadow-rose-200 dark:shadow-none transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span className="font-bold">Record Expense</span>
              </button>
            ) : (
              <button
                id="quick-add-btn"
                onClick={() => {
                  setOrderToEdit(null);
                  setOrderModalOpen(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span className="font-bold">New Order</span>
              </button>
            )}

            {/* Quick Add Menu Button */}
            <button
              id="quick-add-dropdown-toggle"
              onClick={() => setQuickAddOpen(!quickAddOpen)}
              className="p-2 text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer shrink-0"
              title="Quick Actions Menu"
              aria-label="Quick Actions Menu"
            >
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${quickAddOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Quick Action Dropdown Menu */}
            {quickAddOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  Quick Actions
                </div>

                <button
                  onClick={() => {
                    setOrderToEdit(null);
                    setOrderModalOpen(true);
                    setQuickAddOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2.5 transition-colors cursor-pointer font-medium"
                >
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </div>
                  <span>Create New Order</span>
                </button>

                <button
                  id="dropdown-record-expense-btn"
                  onClick={() => {
                    setExpenditureToEdit(null);
                    setExpenditureModalOpen(true);
                    setQuickAddOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-2.5 transition-colors cursor-pointer font-medium"
                >
                  <div className="w-6 h-6 rounded-lg bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <Receipt className="w-3.5 h-3.5" />
                  </div>
                  <span>Record New Expense</span>
                </button>

                {orders.length > 0 && (
                  <button
                    onClick={() => {
                      const firstPending = orders.find(o => {
                        const paid = o.payments.reduce((s, p) => s + p.amount, 0);
                        return o.total_amount > paid;
                      });
                      if (firstPending) {
                        setSelectedOrderForPayment(firstPending);
                      } else {
                        setSelectedOrderForPayment(orders[0]);
                      }
                      setQuickAddOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-2.5 transition-colors cursor-pointer font-medium"
                  >
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <CreditCard className="w-3.5 h-3.5" />
                    </div>
                    <span>Record Payment</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={toggleDarkMode}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Activity Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              id="notifications-btn"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer"
              aria-label="Activity Feed"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {activityLogs.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 max-h-[450px] overflow-y-auto">
                <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                  <div className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    Recent Activity Timeline
                  </div>
                  <span className="text-[11px] text-slate-400">{activityLogs.length} events</span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {activityLogs.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      No activity recorded yet.
                    </div>
                  ) : (
                    activityLogs.slice(0, 10).map(log => (
                      <div key={log.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {log.title}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {getRelativeTime(log.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {log.description}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar Avatar Badge */}
          <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200 select-none">
            {settings.owner_name ? settings.owner_name.charAt(0).toUpperCase() : 'A'}
          </div>
        </div>
      </header>

      {/* Custom Date Range Picker Modal */}
      <CustomDateRangeModal
        isOpen={customDateModalOpen}
        onClose={() => setCustomDateModalOpen(false)}
      />
    </>
  );
};
