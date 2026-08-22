import React, { useState } from 'react';
import { 
  Building, 
  DollarSign, 
  FileText, 
  Database, 
  Plus, 
  Trash2, 
  Download, 
  Upload, 
  RotateCcw, 
  Save, 
  CheckCircle2, 
  AlertTriangle,
  ShoppingBag,
  Receipt,
  Tag,
  Package,
  ArrowRight
} from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { BusinessSettings } from '../types';
import { ConfirmDialog } from './ConfirmDialog';

export const SettingsView: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    categories, 
    addCategory, 
    deleteCategory, 
    products,
    addProduct,
    deleteProduct,
    expenseProducts,
    deleteExpenseProduct,
    expensePurposes,
    addExpensePurpose,
    deleteExpensePurpose,
    setActiveTab,
    resetToSampleData,
    exportDataAsJSON,
    importDataFromJSON,
    showToast 
  } = useBusiness();

  // Settings form states
  const [formData, setFormData] = useState<BusinessSettings>({ ...settings });
  const [newCatName, setNewCatName] = useState('');
  
  // Product state
  const [newProdName, setNewProdName] = useState('');
  const [newProdRate, setNewProdRate] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Framing');
  const [prodToDelete, setProdToDelete] = useState<string | null>(null);

  // Expense Purpose state
  const [newPurposeName, setNewPurposeName] = useState('');
  const [purposeToDelete, setPurposeToDelete] = useState<string | null>(null);

  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [catToDelete, setCatToDelete] = useState<string | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    showToast('Business settings saved successfully!', 'success');
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      addCategory(newCatName.trim());
      setNewCatName('');
    }
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProdName.trim()) {
      addProduct({
        name: newProdName.trim(),
        default_rate: newProdRate ? Number(newProdRate) : undefined,
        category: newProdCategory.trim() || 'General'
      });
      setNewProdName('');
      setNewProdRate('');
    }
  };

  const handleAddPurposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPurposeName.trim()) {
      addExpensePurpose(newPurposeName.trim());
      setNewPurposeName('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importDataFromJSON(content);
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  return (
    <div id="settings-view" className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white font-['Outfit']">
          Business Settings & Profile
        </h2>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-tighter mt-0.5">
          Configure company profile, invoicing details, currencies, categories, and backups
        </p>
      </div>

      {/* 1. Business Profile Form */}
      <form onSubmit={handleSaveSettings} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Building className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white font-['Outfit']">
            Business Profile & Invoice Header
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Business / Company Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.business_name}
              onChange={e => setFormData({ ...formData, business_name: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tagline / Subtitle
            </label>
            <input
              type="text"
              value={formData.tagline || ''}
              onChange={e => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Owner / Contact Person
            </label>
            <input
              type="text"
              value={formData.owner_name || ''}
              onChange={e => setFormData({ ...formData, owner_name: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tax ID / GSTIN / VAT Number
            </label>
            <input
              type="text"
              value={formData.tax_id || ''}
              onChange={e => setFormData({ ...formData, tax_id: e.target.value })}
              placeholder="e.g. 27AADCB2234M1Z2"
              className="w-full px-3.5 py-2 text-sm bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Official Email
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Business Address
            </label>
            <input
              type="text"
              value={formData.address || ''}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Currency & Invoice Terms */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Currency Symbol
              </label>
              <select
                value={formData.currency_symbol}
                onChange={e => setFormData({ ...formData, currency_symbol: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white font-bold cursor-pointer"
              >
                <option value="₹">₹ INR (Indian Rupee)</option>
                <option value="$">$ USD (US Dollar)</option>
                <option value="€">€ EUR (Euro)</option>
                <option value="£">£ GBP (British Pound)</option>
                <option value="¥">¥ JPY (Japanese Yen)</option>
                <option value="AED ">AED (UAE Dirham)</option>
                <option value="C$">C$ CAD (Canadian Dollar)</option>
                <option value="A$">A$ AUD (Australian Dollar)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Invoice Notes & Terms
              </label>
              <input
                type="text"
                value={formData.notes_default || ''}
                onChange={e => setFormData({ ...formData, notes_default: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save Business Profile
          </button>
        </div>
      </form>

      {/* 2. Product Catalogue Manager */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-base font-bold text-slate-800 dark:text-white font-['Outfit']">
                Product Catalogue & Rates
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              <strong className="text-indigo-600 dark:text-indigo-400">Photo Frame</strong> is automatically selected as default for all new orders. Manage selling and purchasing rates.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('catalogue')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer shrink-0"
          >
            Open Full Catalogue <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Add new product */}
        <form onSubmit={handleAddProductSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <input
              type="text"
              required
              placeholder="Product Name (e.g. Photo Frame, Canvas Print)..."
              value={newProdName}
              onChange={e => setNewProdName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <input
              type="number"
              step="any"
              placeholder={`Default Rate (${settings.currency_symbol})`}
              value={newProdRate}
              onChange={e => setNewProdRate(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-1 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </form>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {products.map(prod => {
            const isDefault = prod.name.toLowerCase() === 'photo frame';
            return (
              <div
                key={prod.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                  isDefault
                    ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/60'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-700/60'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white">
                      {prod.name}
                    </span>
                    {isDefault && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-600 text-white rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {prod.default_rate !== undefined ? `${settings.currency_symbol}${prod.default_rate}` : 'Variable Rate'} {prod.category ? `• ${prod.category}` : ''}
                  </div>
                </div>

                {!isDefault && (
                  <button
                    type="button"
                    onClick={() => setProdToDelete(prod.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    title="Delete product"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Expense Purposes / Descriptions */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <h3 className="text-base font-bold text-slate-800 dark:text-white font-['Outfit']">
                Expense Descriptions / Purposes
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Preset purpose options available in the expenditure recording form
            </p>
          </div>
        </div>

        {/* Add new expense purpose */}
        <form onSubmit={handleAddPurposeSubmit} className="flex items-center gap-3">
          <input
            type="text"
            placeholder="New expense purpose (e.g. Courier Charges, Frame Mouldings)..."
            value={newPurposeName}
            onChange={e => setNewPurposeName(e.target.value)}
            className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          <button
            type="submit"
            className="flex items-center gap-1 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Purpose
          </button>
        </form>

        {/* Purpose Badges */}
        <div className="flex flex-wrap gap-2 pt-2">
          {expensePurposes.map(purpose => (
            <div
              key={purpose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold"
            >
              <span>{purpose}</span>
              {expensePurposes.length > 1 && (
                <button
                  type="button"
                  onClick={() => setPurposeToDelete(purpose)}
                  className="text-slate-400 hover:text-rose-500 transition-colors ml-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Expense Category Manager */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-base font-bold text-slate-800 dark:text-white font-['Outfit']">
                Expenditure Categories
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage custom expense buckets for tracking costs
            </p>
          </div>
        </div>

        {/* Add new category */}
        <form onSubmit={handleAddCategorySubmit} className="flex items-center gap-3">
          <input
            type="text"
            placeholder="New category name (e.g. Packaging, Commissions)..."
            value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
            className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="flex items-center gap-1 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </form>

        {/* Category Badges */}
        <div className="flex flex-wrap gap-2 pt-2">
          {categories.map(cat => (
            <div
              key={cat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold"
            >
              <span>{cat}</span>
              {categories.length > 1 && (
                <button
                  type="button"
                  onClick={() => setCatToDelete(cat)}
                  className="text-slate-400 hover:text-rose-500 transition-colors ml-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 5. Data Backup, Export & Restore */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white font-['Outfit']">
            Data Management & Offline Backups
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          {/* Export JSON */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white">
                Export JSON Backup
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Save a complete local backup of all orders, products, purposes, payments, expenses, and customers.
              </p>
            </div>
            <button
              onClick={exportDataAsJSON}
              className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Download Backup
            </button>
          </div>

          {/* Import JSON */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white">
                Restore from Backup
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Upload and restore your business records from a previously exported JSON backup.
              </p>
            </div>
            <label className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-xl transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" /> Upload File
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Reset Demo Data */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white">
                Load Sample Data
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Reset or populate realistic business demo records to test features.
              </p>
            </div>
            <button
              onClick={() => setConfirmResetOpen(true)}
              className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Demo Data
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={confirmResetOpen}
        title="Reset to Sample Demo Records?"
        message="This will overwrite your existing orders and expenditure with realistic sample business data. Make sure to download a backup if you have real data you wish to keep."
        confirmText="Reset Demo Data"
        onConfirm={() => {
          resetToSampleData();
          setConfirmResetOpen(false);
        }}
        onCancel={() => setConfirmResetOpen(false)}
      />

      <ConfirmDialog
        isOpen={!!catToDelete}
        title="Delete Expense Category"
        message={catToDelete ? `Are you sure you want to delete category "${catToDelete}"? Existing expense records will retain their data.` : ''}
        confirmText="Delete Category"
        onConfirm={() => {
          if (catToDelete) {
            deleteCategory(catToDelete);
            setCatToDelete(null);
          }
        }}
        onCancel={() => setCatToDelete(null)}
      />

      <ConfirmDialog
        isOpen={!!prodToDelete}
        title="Delete Product from Catalogue"
        message="Are you sure you want to delete this product? Existing orders will retain their line item descriptions."
        confirmText="Delete Product"
        onConfirm={() => {
          if (prodToDelete) {
            deleteProduct(prodToDelete);
            setProdToDelete(null);
          }
        }}
        onCancel={() => setProdToDelete(null)}
      />

      <ConfirmDialog
        isOpen={!!purposeToDelete}
        title="Delete Expense Purpose"
        message={purposeToDelete ? `Are you sure you want to remove "${purposeToDelete}" from preset purposes?` : ''}
        confirmText="Delete Purpose"
        onConfirm={() => {
          if (purposeToDelete) {
            deleteExpensePurpose(purposeToDelete);
            setPurposeToDelete(null);
          }
        }}
        onCancel={() => setPurposeToDelete(null)}
      />
    </div>
  );
};
