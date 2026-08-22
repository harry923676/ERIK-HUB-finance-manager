import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  CreditCard, 
  Receipt, 
  Users, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  TrendingUp,
  X,
  ShieldCheck,
  Package,
  Cloud,
  CloudCheck,
  RefreshCw,
  Smartphone
} from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean) => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  setCollapsed,
  mobileOpen = false,
  setMobileOpen
}) => {
  const { 
    activeTab, 
    setActiveTab, 
    orders, 
    products,
    expenseProducts,
    financialSummary, 
    settings,
    setOrderModalOpen,
    setOrderToEdit,
    setExpenditureModalOpen,
    setExpenditureToEdit
  } = useBusiness();

  const { 
    user, 
    isAuthenticated, 
    isGoogleLinked, 
    openAuthModal, 
    syncStatus, 
    lastSyncTime 
  } = useAuth();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingBag,
      badge: orders.length > 0 ? orders.length : null
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: CreditCard,
      badge: null
    },
    {
      id: 'expenditure',
      label: 'Expenditure',
      icon: Receipt,
      badge: null
    },
    {
      id: 'catalogue',
      label: 'Product Catalogue',
      icon: Package,
      badge: products.length + expenseProducts.length
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      badge: null
    },
    {
      id: 'analytics',
      label: 'Reports & Analytics',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null
    }
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          id="mobile-sidebar-backdrop"
          onClick={() => setMobileOpen && setMobileOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-900 text-slate-400 border-r border-slate-800/80 transition-all duration-300 ease-in-out shrink-0 select-none ${
          collapsed ? 'w-20' : 'w-72 sm:w-64'
        } ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-500/30">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-white font-bold text-xl tracking-tight font-['Outfit'] truncate">
                  {settings.business_name || 'ERIK-HUB Finance manager'}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold truncate">
                  {settings.tagline || 'Financial Suite'}
                </span>
              </div>
            )}
          </div>

          {/* Close mobile button */}
          {setMobileOpen && (
            <button
              id="mobile-sidebar-close-btn"
              onClick={() => setMobileOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation links */}
        <div className="flex-1 px-4 py-3 space-y-1 overflow-y-auto">
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || 
                (item.id === 'expenditures' && activeTab === 'expenditure') ||
                (item.id === 'reports' && activeTab === 'analytics');

              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer text-left text-sm group ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/20 font-medium'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl'
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-white'
                  }`} />
                  
                  {!collapsed && (
                    <span className="truncate flex-1 font-medium">
                      {item.label}
                    </span>
                  )}

                  {!collapsed && item.badge !== null && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Cloud Sync & Account Widget */}
        {!collapsed ? (
          <div className="mt-auto px-3 py-2">
            <div 
              id="sidebar-cloud-sync-card"
              onClick={() => {
                if (!isAuthenticated) {
                  openAuthModal('google');
                } else {
                  handleNavClick('settings');
                }
              }}
              className="p-3 bg-slate-800/80 hover:bg-slate-800 rounded-2xl border border-slate-700/60 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Cloud className={`w-4 h-4 ${isGoogleLinked ? 'text-emerald-400' : 'text-indigo-400'}`} />
                  <span className="text-[11px] font-bold text-white tracking-tight">
                    {isAuthenticated ? (isGoogleLinked ? 'Google Drive Synced' : 'Phone Account') : 'Cloud Backup'}
                  </span>
                </div>
                <span className={`w-2 h-2 rounded-full ${
                  syncStatus === 'synced' ? 'bg-emerald-400 animate-pulse' :
                  syncStatus === 'syncing' ? 'bg-amber-400 animate-spin' :
                  isAuthenticated ? 'bg-indigo-400' : 'bg-slate-500'
                }`} />
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span className="truncate max-w-[130px]">
                  {isAuthenticated ? (user?.name || user?.email || user?.phone) : 'Sign in to auto-sync'}
                </span>
                <span className="text-[10px] text-indigo-400 font-semibold group-hover:underline">
                  {isAuthenticated ? 'Manage' : 'Sign In'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-auto px-2 py-2 flex justify-center">
            <button
              onClick={() => openAuthModal('google')}
              title={isAuthenticated ? `Logged in: ${user?.name}` : 'Sign in / Sync'}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 flex items-center justify-center transition-colors"
            >
              <Cloud className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Bottom Financial / Plan Widget in Sleek Interface */}
        {!collapsed && (
          <div className="p-4 mx-3 mb-3 bg-slate-800/60 rounded-2xl border border-slate-700/40">
            <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-widest mb-1">
              <span>Running Profit</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                financialSummary.runningProfit >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}>
                {financialSummary.profitMarginPercent}% Margin
              </span>
            </div>
            <div className="text-base text-white font-bold font-['Outfit'] mb-3 truncate">
              {settings.currency_symbol}{financialSummary.runningProfit.toLocaleString()}
            </div>
            <button
              onClick={() => handleNavClick('reports')}
              className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 active:scale-[0.98] text-white text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              VIEW FULL REPORT
            </button>
          </div>
        )}

        {/* Collapse toggle footer on desktop */}
        {setCollapsed && (
          <div className="p-3 border-t border-slate-800 hidden lg:flex items-center justify-end">
            <button
              id="sidebar-toggle-btn"
              onClick={() => setCollapsed(!collapsed)}
              className="w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
