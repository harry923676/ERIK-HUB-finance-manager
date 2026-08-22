import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Receipt, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Layers, 
  Tag, 
  TrendingUp, 
  Building2,
  DollarSign,
  Package,
  Boxes,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { Product, ExpenseProduct } from '../types';
import { ConfirmDialog } from './ConfirmDialog';
import { motion, AnimatePresence } from 'motion/react';

type CatalogueTab = 'order_products' | 'expense_products';

export const ProductCatalogueView: React.FC = () => {
  const { 
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct,
    expenseProducts,
    addExpenseProduct,
    updateExpenseProduct,
    deleteExpenseProduct,
    categories,
    settings,
    setOrderModalOpen,
    setExpenditureModalOpen
  } = useBusiness();

  const [activeTab, setActiveTab] = useState<CatalogueTab>('order_products');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modals for Order Products
  const [isOrderProductModalOpen, setIsOrderProductModalOpen] = useState(false);
  const [editingOrderProduct, setEditingOrderProduct] = useState<Product | null>(null);
  const [orderProductFormData, setOrderProductFormData] = useState<{
    name: string;
    default_rate: string;
    category: string;
    unit: string;
    sku: string;
    description: string;
  }>({
    name: '',
    default_rate: '',
    category: 'Framing',
    unit: 'pcs',
    sku: '',
    description: ''
  });

  // Modals for Expense Products
  const [isExpenseProductModalOpen, setIsExpenseProductModalOpen] = useState(false);
  const [editingExpenseProduct, setEditingExpenseProduct] = useState<ExpenseProduct | null>(null);
  const [expenseProductFormData, setExpenseProductFormData] = useState<{
    name: string;
    default_rate: string;
    category: string;
    unit: string;
    default_vendor: string;
    description: string;
  }>({
    name: '',
    default_rate: '',
    category: 'Raw Materials',
    unit: 'pcs',
    default_vendor: '',
    description: ''
  });

  // Delete Confirm Dialog state
  const [prodToDelete, setProdToDelete] = useState<string | null>(null);
  const [expProdToDelete, setExpProdToDelete] = useState<string | null>(null);

  // Filtered lists
  const filteredOrderProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [products, searchTerm, selectedCategory]);

  const filteredExpenseProducts = useMemo(() => {
    return expenseProducts.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.default_vendor && p.default_vendor.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [expenseProducts, searchTerm, selectedCategory]);

  // Order product unique categories
  const orderProductCategories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [products]);

  // Expense product unique categories
  const expenseProductCategories = useMemo(() => {
    const cats = new Set<string>();
    expenseProducts.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [expenseProducts]);

  // Handle opening Order Product Modal
  const handleOpenAddOrderProduct = () => {
    setEditingOrderProduct(null);
    setOrderProductFormData({
      name: '',
      default_rate: '',
      category: 'Framing',
      unit: 'pcs',
      sku: '',
      description: ''
    });
    setIsOrderProductModalOpen(true);
  };

  const handleOpenEditOrderProduct = (prod: Product) => {
    setEditingOrderProduct(prod);
    setOrderProductFormData({
      name: prod.name,
      default_rate: prod.default_rate !== undefined ? String(prod.default_rate) : '',
      category: prod.category || 'Framing',
      unit: prod.unit || 'pcs',
      sku: prod.sku || '',
      description: prod.description || ''
    });
    setIsOrderProductModalOpen(true);
  };

  const handleSaveOrderProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderProductFormData.name.trim()) return;

    if (editingOrderProduct) {
      updateProduct(editingOrderProduct.id, {
        name: orderProductFormData.name.trim(),
        default_rate: orderProductFormData.default_rate ? Number(orderProductFormData.default_rate) : undefined,
        category: orderProductFormData.category.trim() || 'General',
        unit: orderProductFormData.unit.trim() || 'pcs',
        sku: orderProductFormData.sku.trim() || undefined,
        description: orderProductFormData.description.trim() || undefined
      });
    } else {
      addProduct({
        name: orderProductFormData.name.trim(),
        default_rate: orderProductFormData.default_rate ? Number(orderProductFormData.default_rate) : undefined,
        category: orderProductFormData.category.trim() || 'General',
        unit: orderProductFormData.unit.trim() || 'pcs',
        sku: orderProductFormData.sku.trim() || undefined,
        description: orderProductFormData.description.trim() || undefined
      });
    }

    setIsOrderProductModalOpen(false);
    setEditingOrderProduct(null);
  };

  // Handle opening Expense Product Modal
  const handleOpenAddExpenseProduct = () => {
    setEditingExpenseProduct(null);
    setExpenseProductFormData({
      name: '',
      default_rate: '',
      category: 'Raw Materials',
      unit: 'pcs',
      default_vendor: '',
      description: ''
    });
    setIsExpenseProductModalOpen(true);
  };

  const handleOpenEditExpenseProduct = (prod: ExpenseProduct) => {
    setEditingExpenseProduct(prod);
    setExpenseProductFormData({
      name: prod.name,
      default_rate: String(prod.default_rate || 0),
      category: prod.category || 'Raw Materials',
      unit: prod.unit || 'pcs',
      default_vendor: prod.default_vendor || '',
      description: prod.description || ''
    });
    setIsExpenseProductModalOpen(true);
  };

  const handleSaveExpenseProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseProductFormData.name.trim()) return;

    if (editingExpenseProduct) {
      updateExpenseProduct(editingExpenseProduct.id, {
        name: expenseProductFormData.name.trim(),
        default_rate: Number(expenseProductFormData.default_rate) || 0,
        category: expenseProductFormData.category.trim() || 'Miscellaneous',
        unit: expenseProductFormData.unit.trim() || 'unit',
        default_vendor: expenseProductFormData.default_vendor.trim() || undefined,
        description: expenseProductFormData.description.trim() || undefined
      });
    } else {
      addExpenseProduct({
        name: expenseProductFormData.name.trim(),
        default_rate: Number(expenseProductFormData.default_rate) || 0,
        category: expenseProductFormData.category.trim() || 'Miscellaneous',
        unit: expenseProductFormData.unit.trim() || 'unit',
        default_vendor: expenseProductFormData.default_vendor.trim() || undefined,
        description: expenseProductFormData.description.trim() || undefined
      });
    }

    setIsExpenseProductModalOpen(false);
    setEditingExpenseProduct(null);
  };

  return (
    <div id="product-catalogue-view" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header & Navigation Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
              Master Price List
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5 font-['Outfit']">
            Product Catalogue & Rates
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Manage your sales items (Order Products with default selling rates) and purchasing supplies (Expense Products with buying cost rates).
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {activeTab === 'order_products' ? (
            <button
              id="add-order-product-btn"
              onClick={handleOpenAddOrderProduct}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-2xl font-bold text-sm shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Order Product
            </button>
          ) : (
            <button
              id="add-expense-product-btn"
              onClick={handleOpenAddExpenseProduct}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white rounded-2xl font-bold text-sm shadow-md shadow-rose-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Expense Item
            </button>
          )}
        </div>
      </div>

      {/* 2. Top Summary KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Stat 1: Order Products */}
        <div 
          onClick={() => { setActiveTab('order_products'); setSelectedCategory('all'); }}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${
            activeTab === 'order_products'
              ? 'bg-indigo-500 text-white border-indigo-600 shadow-lg shadow-indigo-500/25'
              : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`p-2.5 rounded-2xl ${activeTab === 'order_products' ? 'bg-white/20 text-white' : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'}`}>
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              activeTab === 'order_products' ? 'bg-white text-indigo-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}>
              Sales Items
            </span>
          </div>
          <div className="mt-4">
            <div className={`text-2xl sm:text-3xl font-extrabold font-['Outfit'] ${activeTab === 'order_products' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
              {products.length} Products
            </div>
            <div className={`text-xs mt-1 ${activeTab === 'order_products' ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
              Default: <strong className="underline font-bold">Photo Frame</strong> (Auto-selected in new orders)
            </div>
          </div>
        </div>

        {/* Stat 2: Expense Supplies */}
        <div 
          onClick={() => { setActiveTab('expense_products'); setSelectedCategory('all'); }}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${
            activeTab === 'expense_products'
              ? 'bg-rose-600 text-white border-rose-700 shadow-lg shadow-rose-600/25'
              : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`p-2.5 rounded-2xl ${activeTab === 'expense_products' ? 'bg-white/20 text-white' : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'}`}>
              <Receipt className="w-5 h-5" />
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              activeTab === 'expense_products' ? 'bg-white text-rose-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}>
              Cost & Materials
            </span>
          </div>
          <div className="mt-4">
            <div className={`text-2xl sm:text-3xl font-extrabold font-['Outfit'] ${activeTab === 'expense_products' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
              {expenseProducts.length} Expense Items
            </div>
            <div className={`text-xs mt-1 ${activeTab === 'expense_products' ? 'text-rose-100' : 'text-slate-500 dark:text-slate-400'}`}>
              Frame, Ink, Paper, Transport, Speaker, Misc
            </div>
          </div>
        </div>

        {/* Stat 3: Quick Action Launchpad */}
        <div className="p-5 rounded-3xl border bg-slate-900 text-white border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-indigo-300 font-semibold uppercase tracking-wider">
              <span>Quick Transactions</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Test rate auto-fill by creating an order or expense with catalogue items.
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => setOrderModalOpen(true)}
              className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Order
            </button>
            <button
              onClick={() => setExpenditureModalOpen(true)}
              className="flex-1 px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Expense
            </button>
          </div>
        </div>
      </div>

      {/* 3. Catalogue Tabs & Search Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-4 sm:p-6 shadow-sm space-y-4">
        {/* Toggle Pills & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          {/* Main Subtabs */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl shrink-0">
            <button
              id="tab-order-products"
              onClick={() => { setActiveTab('order_products'); setSelectedCategory('all'); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'order_products'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Order Products (Sales)</span>
              <span className="ml-1 px-2 py-0.5 text-[11px] rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-bold">
                {products.length}
              </span>
            </button>

            <button
              id="tab-expense-products"
              onClick={() => { setActiveTab('expense_products'); setSelectedCategory('all'); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'expense_products'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Expense Items (Cost)</span>
              <span className="ml-1 px-2 py-0.5 text-[11px] rounded-full bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 font-bold">
                {expenseProducts.length}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="catalogue-search-input"
              placeholder={activeTab === 'order_products' ? "Search order products, SKU, category..." : "Search expense items, categories, vendors..."}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>

          {(activeTab === 'order_products' ? orderProductCategories : expenseProductCategories).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer shrink-0 ${
                selectedCategory === cat
                  ? activeTab === 'order_products'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-rose-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 4. Tab 1: Order Products Grid */}
        {activeTab === 'order_products' && (
          <div className="space-y-4 pt-2">
            {filteredOrderProducts.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                <Package className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800 dark:text-white">No Order Products Found</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  {searchTerm ? 'Try adjusting your search criteria or clear the filter.' : 'Add your first order product with its default selling rate.'}
                </p>
                <button
                  onClick={handleOpenAddOrderProduct}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow hover:bg-indigo-700 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrderProducts.map(prod => {
                  const isDefault = prod.name.toLowerCase() === 'photo frame';
                  return (
                    <motion.div
                      key={prod.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-5 rounded-3xl border flex flex-col justify-between transition-all hover:shadow-md ${
                        isDefault
                          ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200/80 dark:border-indigo-900/60'
                          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                      }`}
                    >
                      <div>
                        {/* Header Badge */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {prod.category || 'General'}
                            </span>
                            {isDefault && (
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-indigo-600 text-white flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Default Product
                              </span>
                            )}
                            {prod.unit && (
                              <span className="px-2 py-0.5 text-[10px] font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                                per {prod.unit}
                              </span>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditOrderProduct(prod)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                              title="Edit product rate & details"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            {!isDefault && (
                              <button
                                onClick={() => setProdToDelete(prod.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                                title="Delete product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Title */}
                        <h4 className="text-base font-bold text-slate-900 dark:text-white mt-3 font-['Outfit']">
                          {prod.name}
                        </h4>

                        {/* Description / SKU */}
                        {prod.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {prod.description}
                          </p>
                        )}
                        {prod.sku && (
                          <div className="text-[11px] text-slate-400 font-mono mt-1">
                            SKU: {prod.sku}
                          </div>
                        )}
                      </div>

                      {/* Selling Rate Footer */}
                      <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                            Selling Rate
                          </span>
                          <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 font-['Outfit']">
                            {prod.default_rate !== undefined 
                              ? `${settings.currency_symbol}${prod.default_rate.toLocaleString()}`
                              : 'Variable'}
                          </span>
                          {prod.unit && (
                            <span className="text-xs text-slate-400 font-normal ml-1">
                              /{prod.unit}
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] text-slate-400 font-medium">
                          Auto-fills in Orders
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 5. Tab 2: Expense Products Grid */}
        {activeTab === 'expense_products' && (
          <div className="space-y-4 pt-2">
            {filteredExpenseProducts.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                <Receipt className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800 dark:text-white">No Expense Items Found</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  {searchTerm ? 'Try adjusting your search criteria or clear the filter.' : 'Add your first expense item (e.g. Frame, Printer Ink, Photo Paper) with default buying rate.'}
                </p>
                <button
                  onClick={handleOpenAddExpenseProduct}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold shadow hover:bg-rose-700 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Expense Item
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredExpenseProducts.map(expProd => (
                  <motion.div
                    key={expProd.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-3xl border bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 flex flex-col justify-between transition-all hover:shadow-md"
                  >
                    <div>
                      {/* Top Badges & Actions */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40">
                            {expProd.category}
                          </span>
                          {expProd.unit && (
                            <span className="px-2 py-0.5 text-[10px] font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                              per {expProd.unit}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditExpenseProduct(expProd)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Edit expense item rate & category"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setExpProdToDelete(expProd.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Delete expense item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Name */}
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mt-3 font-['Outfit']">
                        {expProd.name}
                      </h4>

                      {/* Description */}
                      {expProd.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {expProd.description}
                        </p>
                      )}

                      {/* Default Vendor */}
                      {expProd.default_vendor && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">Vendor: {expProd.default_vendor}</span>
                        </div>
                      )}
                    </div>

                    {/* Purchase Rate Footer */}
                    <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                          Default Buying Rate
                        </span>
                        <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400 font-['Outfit']">
                          {settings.currency_symbol}{Number(expProd.default_rate).toLocaleString()}
                        </span>
                        {expProd.unit && (
                          <span className="text-xs text-slate-400 font-normal ml-1">
                            /{expProd.unit}
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-slate-400 font-medium">
                        Auto-fills in Expenses
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: Add / Edit Order Product Modal */}
      <AnimatePresence>
        {isOrderProductModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOrderProductModalOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden z-10"
            >
              {/* Header */}
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
                      {editingOrderProduct ? 'Edit Order Product' : 'New Order Product'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Configure sales item name and default selling rate
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOrderProductModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg"
                >
                  ✕
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveOrderProduct} className="p-6 space-y-4">
                {/* Product Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Photo Frame, Acrylic Photo Frame, Canvas Print"
                    value={orderProductFormData.name}
                    onChange={e => setOrderProductFormData({ ...orderProductFormData, name: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Selling Rate & Unit */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Default Rate ({settings.currency_symbol}) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="e.g. 450"
                      value={orderProductFormData.default_rate}
                      onChange={e => setOrderProductFormData({ ...orderProductFormData, default_rate: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Unit (e.g. pcs, set)
                    </label>
                    <input
                      type="text"
                      placeholder="pcs, set, meter"
                      value={orderProductFormData.unit}
                      onChange={e => setOrderProductFormData({ ...orderProductFormData, unit: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Category & SKU */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Category
                    </label>
                    <input
                      type="text"
                      list="order-product-cats-list"
                      placeholder="Framing, Printing..."
                      value={orderProductFormData.category}
                      onChange={e => setOrderProductFormData({ ...orderProductFormData, category: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <datalist id="order-product-cats-list">
                      <option value="Framing" />
                      <option value="Printing" />
                      <option value="Photography" />
                      <option value="Hardware" />
                      <option value="General" />
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      SKU / Product Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. PF-10X12"
                      value={orderProductFormData.sku}
                      onChange={e => setOrderProductFormData({ ...orderProductFormData, sku: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Specifications & Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Premium teak wood frame with protective glass and mount"
                    value={orderProductFormData.description}
                    onChange={e => setOrderProductFormData({ ...orderProductFormData, description: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsOrderProductModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    {editingOrderProduct ? 'Update Product' : 'Save to Catalogue'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Add / Edit Expense Product Modal */}
      <AnimatePresence>
        {isExpenseProductModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpenseProductModalOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden z-10"
            >
              {/* Header */}
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-rose-600 text-white rounded-xl shadow-md">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
                      {editingExpenseProduct ? 'Edit Expense Item' : 'New Expense Item'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Configure purchase supplies, materials, and cost rates
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsExpenseProductModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg"
                >
                  ✕
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveExpenseProduct} className="p-6 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Expense Item / Material Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Frame, Printer Ink, Photo Paper, Transport, Speaker with Mic"
                    value={expenseProductFormData.name}
                    onChange={e => setExpenseProductFormData({ ...expenseProductFormData, name: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                {/* Buying Rate & Unit */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Buying / Cost Rate ({settings.currency_symbol}) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="e.g. 220"
                      value={expenseProductFormData.default_rate}
                      onChange={e => setExpenseProductFormData({ ...expenseProductFormData, default_rate: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none font-semibold text-rose-600 dark:text-rose-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Unit (e.g. bottle, pack, trip)
                    </label>
                    <input
                      type="text"
                      placeholder="pcs, bottle, pack, trip, set"
                      value={expenseProductFormData.unit}
                      onChange={e => setExpenseProductFormData({ ...expenseProductFormData, unit: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Category & Preferred Vendor */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Expense Category *
                    </label>
                    <select
                      value={expenseProductFormData.category}
                      onChange={e => setExpenseProductFormData({ ...expenseProductFormData, category: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Preferred Vendor / Supplier
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Crown Mouldings, Epson Pro"
                      value={expenseProductFormData.default_vendor}
                      onChange={e => setExpenseProductFormData({ ...expenseProductFormData, default_vendor: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Purpose & Specifications
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. 260 GSM Ultra Lustre photo paper pack with 100 sheets"
                    value={expenseProductFormData.description}
                    onChange={e => setExpenseProductFormData({ ...expenseProductFormData, description: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none resize-none"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsExpenseProductModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    {editingExpenseProduct ? 'Update Expense Item' : 'Save to Catalogue'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Dialogs */}
      <ConfirmDialog
        isOpen={!!prodToDelete}
        title="Delete Order Product"
        message="Are you sure you want to remove this product from the sales catalogue? Existing order historical records will remain intact."
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
        isOpen={!!expProdToDelete}
        title="Delete Expense Item"
        message="Are you sure you want to remove this expense item from the catalogue? Existing expense records will not be deleted."
        confirmText="Delete Expense Item"
        onConfirm={() => {
          if (expProdToDelete) {
            deleteExpenseProduct(expProdToDelete);
            setExpProdToDelete(null);
          }
        }}
        onCancel={() => setExpProdToDelete(null)}
      />
    </div>
  );
};
