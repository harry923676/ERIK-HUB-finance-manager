/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BusinessProvider, useBusiness } from './context/BusinessContext';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { DashboardView } from './components/DashboardView';
import { OrdersView } from './components/OrdersView';
import { PaymentsReceivedView } from './components/PaymentsReceivedView';
import { ExpenditureView } from './components/ExpenditureView';
import { CustomersView } from './components/CustomersView';
import { AnalyticsView } from './components/AnalyticsView';
import { ProductCatalogueView } from './components/ProductCatalogueView';
import { SettingsView } from './components/SettingsView';
import { AddOrderModal } from './components/AddOrderModal';
import { OrderDetailModal } from './components/OrderDetailModal';
import { AddExpenditureModal } from './components/AddExpenditureModal';
import { RecordPaymentModal } from './components/RecordPaymentModal';
import { InvoiceModal } from './components/InvoiceModal';
import { CustomDateRangeModal } from './components/CustomDateRangeModal';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';
import { motion, AnimatePresence } from 'motion/react';

const MainLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const { 
    activeTab, 
    isOrderModalOpen, 
    setOrderModalOpen, 
    orderToEdit, 
    setOrderToEdit,
    selectedOrderForDetail,
    setSelectedOrderForDetail,
    isExpenditureModalOpen,
    setExpenditureModalOpen,
    expenditureToEdit,
    setExpenditureToEdit,
    selectedOrderForPayment,
    setSelectedOrderForPayment,
    selectedOrderForInvoice,
    setSelectedOrderForInvoice,
    customDateModalOpen,
    setCustomDateModalOpen
  } = useBusiness();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'orders':
        return <OrdersView />;
      case 'payments':
        return <PaymentsReceivedView />;
      case 'expenditure':
      case 'expenditures':
        return <ExpenditureView />;
      case 'catalogue':
      case 'products':
        return <ProductCatalogueView />;
      case 'customers':
        return <CustomersView />;
      case 'analytics':
      case 'reports':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* 1. Left Collapsible Sidebar */}
      <Sidebar 
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Navbar */}
        <TopNav onMobileMenuClick={() => setMobileMenuOpen(true)} />

        {/* Dynamic View Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Global Application Footer with Developer Credit */}
        <Footer />
      </div>

      {/* 3. Global Dynamic Modals */}
      {/* Add / Edit Order Modal */}
      <AddOrderModal
        isOpen={isOrderModalOpen}
        orderToEdit={orderToEdit}
        onClose={() => {
          setOrderModalOpen(false);
          setOrderToEdit(null);
        }}
      />

      {/* Order Details Modal */}
      <OrderDetailModal
        order={selectedOrderForDetail}
        onClose={() => setSelectedOrderForDetail(null)}
      />

      {/* Add / Edit Expenditure Modal */}
      <AddExpenditureModal
        isOpen={isExpenditureModalOpen}
        expenditureToEdit={expenditureToEdit}
        onClose={() => {
          setExpenditureModalOpen(false);
          setExpenditureToEdit(null);
        }}
      />

      {/* Record Payment against an Order Modal */}
      <RecordPaymentModal
        order={selectedOrderForPayment}
        onClose={() => setSelectedOrderForPayment(null)}
      />

      {/* Printable Invoice Modal */}
      <InvoiceModal
        order={selectedOrderForInvoice}
        onClose={() => setSelectedOrderForInvoice(null)}
      />

      {/* Custom Date Range Picker Modal */}
      <CustomDateRangeModal
        isOpen={customDateModalOpen}
        onClose={() => setCustomDateModalOpen(false)}
      />

      {/* Global Toast System */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <BusinessProvider>
      <MainLayout />
    </BusinessProvider>
  );
}
