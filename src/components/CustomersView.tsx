import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  ShoppingBag, 
  CreditCard, 
  Clock, 
  ExternalLink,
  Edit3,
  Trash2,
  Calendar
} from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { Customer } from '../types';
import { formatCurrency, formatDate } from '../utils/calculations';

export const CustomersView: React.FC = () => {
  const { 
    customers, 
    orders, 
    settings, 
    setOrderModalOpen, 
    setOrderToEdit,
    setSelectedOrderForDetail,
    setActiveTab,
    showToast
  } = useBusiness();

  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Filter customers by search
  const filteredCustomers = customers.filter(c => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.business_name && c.business_name.toLowerCase().includes(q)) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  // Calculate customer orders and metrics
  const getCustomerStats = (customerName: string, customerId: string) => {
    const custOrders = orders.filter(
      o => o.customer_id === customerId || o.customer_name.toLowerCase() === customerName.toLowerCase()
    );
    const totalOrdersCount = custOrders.length;
    const totalOrderValue = custOrders.reduce((sum, o) => sum + o.total_amount, 0);
    const totalPaid = custOrders.reduce((sum, o) => sum + o.payments.reduce((pSum, p) => pSum + p.amount, 0), 0);
    const totalDue = Math.max(0, totalOrderValue - totalPaid);
    const lastOrder = [...custOrders].sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())[0];

    return {
      custOrders,
      totalOrdersCount,
      totalOrderValue,
      totalPaid,
      totalDue,
      lastOrderDate: lastOrder ? lastOrder.order_date : null
    };
  };

  const handleCreateOrderForCustomer = (customer: Customer) => {
    setOrderToEdit({
      id: '',
      order_number: '',
      customer_id: customer.id,
      customer_name: customer.name,
      customer_business: customer.business_name || '',
      customer_phone: customer.phone || '',
      customer_email: customer.email || '',
      customer_address: customer.address || '',
      order_date: new Date().toISOString().split('T')[0],
      status: 'new',
      items: [{ id: '1', product_name: '', rate: 0, quantity: 1, total_amount: 0 }],
      total_amount: 0,
      payments: [],
      created_at: '',
      updated_at: ''
    });
    setOrderModalOpen(true);
  };

  return (
    <div id="customers-view" className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white font-['Outfit']">
            Customer Directory & Accounts
          </h2>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-tighter mt-0.5">
            Client profiles, lifetime order values, and account balances
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, phone, co..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 border-none rounded-full text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>
      </div>

      {/* Customer Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white font-['Outfit']">
            No customers found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Customers are automatically added to this directory whenever you create an order with client details.
          </p>
          <button
            onClick={() => {
              setOrderToEdit(null);
              setOrderModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Order
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map(customer => {
            const stats = getCustomerStats(customer.name, customer.id);

            return (
              <div
                key={customer.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  {/* Top Name & Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-slate-800 dark:text-white truncate font-['Outfit']">
                        {customer.name}
                      </h3>
                      {customer.business_name && (
                        <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 truncate flex items-center gap-1 mt-0.5">
                          <Building className="w-3.5 h-3.5 shrink-0" />
                          {customer.business_name}
                        </div>
                      )}
                    </div>

                    <div className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                      {stats.totalOrdersCount} {stats.totalOrdersCount === 1 ? 'Order' : 'Orders'}
                    </div>
                  </div>

                  {/* Contact info */}
                  <div className="mt-4 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    {customer.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{customer.phone}</span>
                      </div>
                    )}
                    {customer.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}
                    {customer.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{customer.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Financial Stats Summary Box */}
                  <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-center">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Total Billed</div>
                      <div className="text-xs font-bold text-slate-800 dark:text-white font-['Outfit'] mt-0.5">
                        {formatCurrency(stats.totalOrderValue, settings.currency_symbol)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-amber-500">Balance Due</div>
                      <div className={`text-xs font-bold font-['Outfit'] mt-0.5 ${stats.totalDue > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
                        {formatCurrency(stats.totalDue, settings.currency_symbol)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-400">
                    {stats.lastOrderDate ? `Last: ${formatDate(stats.lastOrderDate)}` : 'No orders yet'}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCreateOrderForCustomer(customer)}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl transition-all shadow-md shadow-indigo-200 dark:shadow-none flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> + Order
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
