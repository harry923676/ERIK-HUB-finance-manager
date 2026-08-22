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
  ArrowRight,
  Cloud,
  RefreshCw,
  Smartphone,
  ShieldCheck,
  LogOut,
  ExternalLink,
  Link as LinkIcon,
  FileSpreadsheet,
  Table,
  FileDown
} from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { useAuth } from '../context/AuthContext';
import { BusinessSettings } from '../types';
import { ConfirmDialog } from './ConfirmDialog';
import { CSVImportModal } from './CSVImportModal';
import { analyzeAndParseCSV, CSVImportResult } from '../utils/csvUtils';

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
    exportAllDataCSV,
    exportOrdersCSV,
    exportExpendituresCSV,
    exportCustomersCSV,
    exportProductsCSV,
    importParsedCSVData,
    showToast,
    orders,
    expenditures,
    customers,
    activityLogs
  } = useBusiness();

  const {
    user,
    isAuthenticated,
    isGoogleLinked,
    openAuthModal,
    linkGoogleAccount,
    logout,
    syncStatus,
    lastSyncTime,
    driveBackupInfo,
    autoSyncEnabled,
    setAutoSyncEnabled,
    syncNow,
    restoreFromDrive
  } = useAuth();

  const [isSyncingDrive, setIsSyncingDrive] = useState(false);

  // CSV Import State
  const [csvImportResult, setCsvImportResult] = useState<CSVImportResult | null>(null);
  const [csvModalOpen, setCsvModalOpen] = useState(false);

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

  const handleCSVFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const result = analyzeAndParseCSV(text);
        const totalRecords = 
          result.counts.orders + 
          result.counts.expenditures + 
          result.counts.customers + 
          result.counts.products;

        if (totalRecords === 0 && result.warnings.length > 0) {
          showToast('Could not find recognizable business data in this CSV file.', 'error');
          return;
        }

        setCsvImportResult(result);
        setCsvModalOpen(true);
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  const handleConfirmCSVImport = (mode: 'merge' | 'replace') => {
    if (!csvImportResult) return;
    importParsedCSVData(csvImportResult.parsedData, mode);
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

      {/* 5. Google Drive & Cloud Synchronization Card */}
      <div id="settings-google-drive-card" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white font-['Outfit']">
                Google Drive & Cloud Synchronization
              </h3>
              <p className="text-xs text-slate-400">
                Continuous encrypted cloud backups saved directly to your personal Google Drive
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                syncStatus === 'synced' 
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  : syncStatus === 'syncing'
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                  : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  syncStatus === 'synced' ? 'bg-emerald-500 animate-pulse' :
                  syncStatus === 'syncing' ? 'bg-amber-500 animate-spin' : 'bg-indigo-500'
                }`} />
                {syncStatus === 'syncing' ? 'Syncing...' : isGoogleLinked ? 'Drive Synced' : 'Phone Account'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Offline Mode (Local Storage)
              </span>
            )}
          </div>
        </div>

        {isAuthenticated ? (
          <div className="space-y-4">
            {/* User Profile Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm overflow-hidden shrink-0">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white font-['Outfit']">
                      {user?.name}
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                      {user?.provider === 'google' ? 'Google Account' : 'Phone Account'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {user?.email || user?.phone || 'Logged in user'}
                  </p>
                  {isGoogleLinked && user?.googleEmail && user.provider === 'phone' && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      Linked Drive: {user.googleEmail}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isGoogleLinked && (
                  <button
                    type="button"
                    onClick={linkGoogleAccount}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Link Google Drive</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    showToast('Signed out of cloud account', 'info');
                  }}
                  className="px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl text-xs font-semibold border border-rose-200 dark:border-rose-900/50 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {/* Sync Controls & Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Cloud Sync Actions
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {lastSyncTime ? `Last: ${new Date(lastSyncTime).toLocaleTimeString()}` : 'Not synced yet'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Push current orders & finances to Google Drive, or restore your previous cloud state anytime.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={isSyncingDrive}
                    onClick={async () => {
                      setIsSyncingDrive(true);
                      try {
                        const res = await syncNow(() => ({
                          orders,
                          expenditures,
                          customers,
                          products,
                          expenseProducts,
                          expensePurposes,
                          categories,
                          settings,
                          activityLogs
                        }), true);
                        if (res.success) showToast(res.message, 'success');
                        else showToast(res.message, 'warning');
                      } catch (e: any) {
                        showToast(e.message || 'Sync error', 'error');
                      } finally {
                        setIsSyncingDrive(false);
                      }
                    }}
                    className="flex-1 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSyncingDrive ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Cloud className="w-3.5 h-3.5" />
                    )}
                    <span>Backup Now to Drive</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSyncingDrive}
                    onClick={async () => {
                      if (!window.confirm('Restore records from Google Drive backup? Any unbacked local modifications will be replaced.')) return;
                      setIsSyncingDrive(true);
                      try {
                        const res = await restoreFromDrive((data) => {
                          importDataFromJSON(JSON.stringify(data));
                        });
                        if (res.success) showToast(res.message, 'success');
                        else showToast(res.message, 'warning');
                      } catch (e: any) {
                        showToast(e.message || 'Restore error', 'error');
                      } finally {
                        setIsSyncingDrive(false);
                      }
                    }}
                    className="py-2.5 px-3.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Restore from Drive</span>
                  </button>
                </div>
              </div>

              {/* Automatic Sync Preferences */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Automatic Real-Time Sync
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoSyncEnabled}
                        onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    When active, changes to invoices, payments, expenditures, and customers are quietly saved to your Google Drive in the background.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-200/60 dark:border-slate-700/60 mt-3">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    Drive File: erik_hub_finance_backup.json
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-indigo-50/30 to-purple-50/40 dark:from-slate-800/70 dark:via-slate-800/40 dark:to-slate-800/60 border border-indigo-100 dark:border-slate-700 text-center space-y-4">
            <div className="max-w-md mx-auto">
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">
                Log In or Sign Up to Enable Google Drive Cloud Sync
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Connect with your Google Account or Phone Number. All your business records, orders, invoices, and expense records will be safely backed up to your personal Google Drive so you can access or sync them anytime from any device.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => openAuthModal('google')}
                className="flex items-center gap-2.5 px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-600 shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={() => openAuthModal('phone')}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Sign in with Phone</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. CSV Data Export & Spreadsheet Reporting */}
      <div id="settings-csv-export-card" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white font-['Outfit']">
                CSV Export & External Spreadsheet Reporting
              </h3>
              <p className="text-xs text-slate-400">
                Export orders, expenditures, customers, and product catalogue for Excel, Google Sheets, or tax reporting
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Excel & Sheets Ready
            </span>
          </div>
        </div>

        {/* Primary All-in-One CSV Export Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-slate-50/60 dark:from-emerald-950/30 dark:via-slate-800/40 dark:to-slate-800/60 border border-emerald-200/80 dark:border-emerald-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white font-['Outfit']">
                Download Complete Business CSV Backup
              </h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                All Tables
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
              Downloads your entire business database including {orders.length} orders, {expenditures.length} expense records, {customers.length} customers, product catalogue, and payment logs in a clean, UTF-8 formatted CSV file.
            </p>
          </div>

          <button
            id="download-full-csv-btn"
            type="button"
            onClick={exportAllDataCSV}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV</span>
          </button>
        </div>

        {/* Granular Table CSV Exports & CSV Import */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          {/* Orders CSV */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-indigo-500" /> Orders & Invoices
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                  {orders.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Order details, customer info, delivery dates, and balances.
              </p>
            </div>
            <button
              onClick={exportOrdersCSV}
              className="flex items-center justify-center gap-1.5 w-full py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-xl transition-colors cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" /> Export Orders (.csv)
            </button>
          </div>

          {/* Expenditures CSV */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-rose-500" /> Expenditures
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
                  {expenditures.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Business purchases, categories, vendors, and cost breakdown.
              </p>
            </div>
            <button
              onClick={exportExpendituresCSV}
              className="flex items-center justify-center gap-1.5 w-full py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-xl transition-colors cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" /> Export Expenses (.csv)
            </button>
          </div>

          {/* Customers CSV */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-cyan-500" /> Customer List
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300">
                  {customers.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Customer directory, contact numbers, emails, and balances.
              </p>
            </div>
            <button
              onClick={exportCustomersCSV}
              className="flex items-center justify-center gap-1.5 w-full py-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 rounded-xl transition-colors cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" /> Export Customers (.csv)
            </button>
          </div>

          {/* CSV Import */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-emerald-500" /> Import CSV Data
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                  Import
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Upload CSV file with orders, expenses, or customer lists.
              </p>
            </div>
            <label className="flex items-center justify-center gap-1.5 w-full py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-xl transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" /> Upload CSV
              <input type="file" accept=".csv,text/csv" onChange={handleCSVFileUpload} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* 7. Data Backup, JSON Export & Restore */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white font-['Outfit']">
            Local JSON Files & Offline Data
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

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={csvModalOpen}
        onClose={() => setCsvModalOpen(false)}
        importResult={csvImportResult}
        onConfirm={handleConfirmCSVImport}
      />

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
