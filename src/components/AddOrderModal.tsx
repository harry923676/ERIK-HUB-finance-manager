import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  User, 
  Calendar, 
  CreditCard, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useBusiness } from '../context/BusinessContext';
import { Order, OrderItem, PaymentMethod } from '../types';
import { calculateItemTotal, calculateOrderTotal } from '../utils/calculations';

interface AddOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderToEdit?: Order | null;
}

interface ItemInput {
  product_name: string;
  rate: number | string;
  quantity: number | string;
}

export const AddOrderModal: React.FC<AddOrderModalProps> = ({
  isOpen,
  onClose,
  orderToEdit
}) => {
  const { addOrder, updateOrder, customers, settings, products, addProduct, showToast } = useBusiness();

  // Quick new product inline modal
  const [showQuickAddProduct, setShowQuickAddProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductRate, setNewProductRate] = useState('');

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerBusiness, setCustomerBusiness] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [status, setStatus] = useState<Order['status']>('new');
  const [notes, setNotes] = useState('');

  // Get default "Photo Frame" item details
  const getPhotoFrameDefault = () => {
    const matched = products.find(p => p.name.toLowerCase() === 'photo frame');
    return {
      product_name: matched ? matched.name : 'Photo Frame',
      rate: matched?.default_rate !== undefined ? matched.default_rate : 450,
      quantity: 1
    };
  };

  // Items line state
  const [items, setItems] = useState<ItemInput[]>([
    { product_name: 'Photo Frame', rate: 450, quantity: 1 }
  ]);

  // Initial payment state (only for new orders)
  const [hasInitialPayment, setHasInitialPayment] = useState(false);
  const [initialPaymentAmount, setInitialPaymentAmount] = useState<number | string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [referenceNumber, setReferenceNumber] = useState('');

  // Sync edit mode or reset with default Photo Frame
  useEffect(() => {
    if (orderToEdit) {
      setCustomerName(orderToEdit.customer_name);
      setCustomerBusiness(orderToEdit.customer_business || '');
      setCustomerPhone(orderToEdit.customer_phone || '');
      setCustomerEmail(orderToEdit.customer_email || '');
      setCustomerAddress(orderToEdit.customer_address || '');
      setOrderDate(orderToEdit.order_date);
      setDeliveryDate(orderToEdit.delivery_date || '');
      setOrderNumber(orderToEdit.order_number);
      setStatus(orderToEdit.status);
      setNotes(orderToEdit.notes || '');
      setItems(orderToEdit.items.map(it => ({
        product_name: it.product_name,
        rate: it.rate,
        quantity: it.quantity
      })));
      setHasInitialPayment(false);
    } else {
      // Reset form with Photo Frame as default product
      setCustomerName('');
      setCustomerBusiness('');
      setCustomerPhone('');
      setCustomerEmail('');
      setCustomerAddress('');
      setOrderDate(new Date().toISOString().split('T')[0]);
      setDeliveryDate('');
      setOrderNumber('');
      setStatus('new');
      setNotes('');
      const defaultProd = getPhotoFrameDefault();
      setItems([{ product_name: defaultProd.product_name, rate: defaultProd.rate, quantity: 1 }]);
      setHasInitialPayment(false);
      setInitialPaymentAmount('');
      setPaymentMethod('Bank Transfer');
      setReferenceNumber('');
    }
  }, [orderToEdit, isOpen]);

  // When customer name changes, autofill if existing customer selected
  const handleCustomerSelect = (name: string) => {
    setCustomerName(name);
    const existing = customers.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      if (existing.business_name) setCustomerBusiness(existing.business_name);
      if (existing.phone) setCustomerPhone(existing.phone);
      if (existing.email) setCustomerEmail(existing.email);
      if (existing.address) setCustomerAddress(existing.address);
    }
  };

  const handleAddItem = () => {
    const defaultProd = getPhotoFrameDefault();
    setItems([...items, { product_name: defaultProd.product_name, rate: defaultProd.rate, quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      showToast('Order must contain at least one item.', 'warning');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleProductSelect = (index: number, selectedName: string) => {
    if (selectedName === '__ADD_NEW__') {
      setShowQuickAddProduct(true);
      return;
    }
    const matched = products.find(p => p.name.toLowerCase() === selectedName.toLowerCase());
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      product_name: selectedName,
      rate: matched?.default_rate !== undefined ? matched.default_rate : updated[index].rate
    };
    setItems(updated);
  };

  const handleItemChange = (index: number, field: keyof ItemInput, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleQuickAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;
    const added = addProduct({
      name: newProductName.trim(),
      default_rate: newProductRate ? Number(newProductRate) : undefined,
      category: 'Framing'
    });
    // Set to the latest item
    if (items.length > 0) {
      const updated = [...items];
      updated[updated.length - 1] = {
        ...updated[updated.length - 1],
        product_name: added.name,
        rate: added.default_rate !== undefined ? added.default_rate : updated[updated.length - 1].rate
      };
      setItems(updated);
    }
    setNewProductName('');
    setNewProductRate('');
    setShowQuickAddProduct(false);
  };

  // Calculate live order total
  const calculatedTotal = items.reduce((sum, item) => {
    const r = Number(item.rate) || 0;
    const q = Number(item.quantity) || 0;
    return sum + calculateItemTotal(r, q);
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      showToast('Please enter the customer name.', 'error');
      return;
    }

    const validItems = items.filter(it => it.product_name.trim() !== '');
    if (validItems.length === 0) {
      showToast('Please add at least one valid product or service item.', 'error');
      return;
    }

    // Rate & Quantity validation
    for (const it of validItems) {
      if (Number(it.rate) < 0 || Number(it.quantity) <= 0) {
        showToast('Rates and quantities must be positive numbers.', 'error');
        return;
      }
    }

    if (orderToEdit) {
      updateOrder(orderToEdit.id, {
        order_number: orderNumber.trim() || orderToEdit.order_number,
        customer_name: customerName.trim(),
        customer_business: customerBusiness.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: customerEmail.trim(),
        customer_address: customerAddress.trim(),
        order_date: orderDate,
        delivery_date: deliveryDate || undefined,
        status,
        notes: notes.trim(),
        items: validItems.map(it => ({
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          product_name: it.product_name.trim(),
          rate: Number(it.rate) || 0,
          quantity: Number(it.quantity) || 1,
          total_amount: calculateItemTotal(Number(it.rate) || 0, Number(it.quantity) || 1)
        }))
      });
    } else {
      addOrder({
        order_number: orderNumber.trim() || undefined,
        customer_name: customerName.trim(),
        customer_business: customerBusiness.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: customerEmail.trim(),
        customer_address: customerAddress.trim(),
        order_date: orderDate,
        delivery_date: deliveryDate || undefined,
        status,
        notes: notes.trim(),
        items: validItems.map(it => ({
          product_name: it.product_name.trim(),
          rate: Number(it.rate) || 0,
          quantity: Number(it.quantity) || 1
        })),
        initial_payment: hasInitialPayment && Number(initialPaymentAmount) > 0 ? {
          amount: Number(initialPaymentAmount),
          payment_method: paymentMethod,
          reference_number: referenceNumber.trim() || undefined,
          notes: 'Advance at order creation'
        } : undefined
      });
    }

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="add-order-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
                    {orderToEdit ? `Edit Order #${orderToEdit.order_number}` : 'Create New Order'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Fill in order details, line items, and customer information
                  </p>
                </div>
              </div>
              <button
                id="add-order-close-btn"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Customer Details Section */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-1.5">
                  <User className="w-4 h-4" /> 1. Customer Information
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Customer Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="order-customer-name"
                      type="text"
                      required
                      placeholder="e.g. Pawan Sharma"
                      list="customer-suggestions"
                      value={customerName}
                      onChange={e => handleCustomerSelect(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <datalist id="customer-suggestions">
                      {customers.map(c => (
                        <option key={c.id} value={c.name}>
                          {c.business_name ? `${c.business_name} (${c.name})` : c.name}
                        </option>
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Business / Company Name (Optional)
                    </label>
                    <input
                      id="order-customer-business"
                      type="text"
                      placeholder="e.g. ABC Enterprises"
                      value={customerBusiness}
                      onChange={e => setCustomerBusiness(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      id="order-customer-phone"
                      type="tel"
                      placeholder="e.g. +91 98201 11223"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      id="order-customer-email"
                      type="email"
                      placeholder="e.g. pawan@abcenterprises.in"
                      value={customerEmail}
                      onChange={e => setCustomerEmail(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Delivery / Billing Address (Optional)
                    </label>
                    <input
                      id="order-customer-address"
                      type="text"
                      placeholder="e.g. Plot 45, MIDC Industrial Hub, Andheri East, Mumbai"
                      value={customerAddress}
                      onChange={e => setCustomerAddress(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Order Metadata */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> 2. Order Details
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Order Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="order-date-input"
                      type="date"
                      required
                      value={orderDate}
                      onChange={e => setOrderDate(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Delivery Date (Optional)
                    </label>
                    <input
                      id="order-delivery-date-input"
                      type="date"
                      value={deliveryDate}
                      onChange={e => setDeliveryDate(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Order Status
                    </label>
                    <select
                      id="order-status-select"
                      value={status}
                      onChange={e => setStatus(e.target.value as Order['status'])}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="new">New</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Line Items Table with Auto Calculation */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4" /> 3. Products & Services (Rate × Quantity)
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      Default product is <strong className="text-slate-700 dark:text-slate-300">Photo Frame</strong>. Select other products from the catalogue dropdown.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowQuickAddProduct(true)}
                      className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-300 transition-colors"
                    >
                      <Plus className="w-3 h-3" /> New Product
                    </button>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-lg"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Row
                    </button>
                  </div>
                </div>

                {/* Quick Add Product Inline Banner */}
                {showQuickAddProduct && (
                  <div className="mb-3 p-3.5 bg-indigo-50/80 dark:bg-indigo-950/50 rounded-xl border border-indigo-200 dark:border-indigo-900/60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                        Add New Product to Catalogue
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowQuickAddProduct(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Product Name (e.g. Vintage Frame)"
                        value={newProductName}
                        onChange={e => setNewProductName(e.target.value)}
                        className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-lg text-slate-900 dark:text-white"
                      />
                      <input
                        type="number"
                        placeholder={`Default Rate (${settings.currency_symbol})`}
                        value={newProductRate}
                        onChange={e => setNewProductRate(e.target.value)}
                        className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-lg text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={handleQuickAddProduct}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                      >
                        Save & Select
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2.5">
                  {items.map((item, index) => {
                    const itemTotal = calculateItemTotal(Number(item.rate) || 0, Number(item.quantity) || 0);
                    // Match current product name with catalogue
                    const isCatalogueMatch = products.some(
                      p => p.name.toLowerCase() === item.product_name.toLowerCase()
                    );

                    return (
                      <div key={index} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/70 space-y-2">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          {/* Product Selection Dropdown */}
                          <div className="w-full sm:w-56">
                            <select
                              value={isCatalogueMatch ? item.product_name : '__CUSTOM__'}
                              onChange={e => {
                                if (e.target.value === '__CUSTOM__') {
                                  // keep custom typing
                                } else {
                                  handleProductSelect(index, e.target.value);
                                }
                              }}
                              className="w-full px-2.5 py-1.5 text-xs sm:text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                            >
                              <optgroup label="Product Catalogue">
                                {products.map(prod => (
                                  <option key={prod.id} value={prod.name}>
                                    {prod.name} {prod.default_rate ? `(${settings.currency_symbol}${prod.default_rate})` : ''}
                                  </option>
                                ))}
                              </optgroup>
                              <option value="__ADD_NEW__">+ Add New Product...</option>
                              {!isCatalogueMatch && item.product_name && (
                                <option value="__CUSTOM__">Custom: {item.product_name}</option>
                              )}
                            </select>
                          </div>

                          {/* Editable Product Title / Detail */}
                          <div className="flex-1">
                            <input
                              type="text"
                              placeholder="Product description or specifics"
                              required
                              value={item.product_name}
                              onChange={e => handleItemChange(index, 'product_name', e.target.value)}
                              className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="w-28">
                              <div className="relative">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                                  {settings.currency_symbol}
                                </span>
                                <input
                                  type="number"
                                  step="any"
                                  min="0"
                                  placeholder="Rate"
                                  required
                                  value={item.rate}
                                  onChange={e => handleItemChange(index, 'rate', e.target.value)}
                                  className="w-full pl-6 pr-2 py-1.5 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                              </div>
                            </div>

                            <div className="w-20">
                              <input
                                type="number"
                                step="any"
                                min="1"
                                placeholder="Qty"
                                required
                                value={item.quantity}
                                onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>

                            <div className="w-24 text-right font-bold text-xs sm:text-sm text-slate-900 dark:text-white font-['Outfit'] px-1">
                              {settings.currency_symbol}{itemTotal.toLocaleString()}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Auto Calculated Summary Footer */}
                <div className="mt-4 p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Order Total (Calculated Automatically)
                  </span>
                  <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 font-['Outfit']">
                    {settings.currency_symbol}{calculatedTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Optional Initial Advance Payment (for new orders) */}
              {!orderToEdit && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasInitialPayment}
                        onChange={e => {
                          setHasInitialPayment(e.target.checked);
                          if (e.target.checked && !initialPaymentAmount) {
                            setInitialPaymentAmount(calculatedTotal);
                          }
                        }}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                        Record Advance / Immediate Payment
                      </span>
                    </label>
                  </div>

                  {hasInitialPayment && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Amount Received ({settings.currency_symbol})
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="1"
                          placeholder="e.g. 25000"
                          value={initialPaymentAmount}
                          onChange={e => setInitialPaymentAmount(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Payment Method
                        </label>
                        <select
                          value={paymentMethod}
                          onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                          className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                        >
                          <option value="Cash">Cash</option>
                          <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                          <option value="UPI">UPI (Google Pay/PhonePe/Paytm)</option>
                          <option value="Credit Card">Credit Card</option>
                          <option value="Debit Card">Debit Card</option>
                          <option value="Cheque">Cheque</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Reference # (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. UPI-9821038"
                          value={referenceNumber}
                          onChange={e => setReferenceNumber(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Order Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Order Notes & Terms (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Special packing instructions, warranty clauses..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Form Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  id="save-order-submit-btn"
                  type="submit"
                  className="px-6 py-2 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-md shadow-indigo-600/20 transition-all"
                >
                  {orderToEdit ? 'Save Changes' : 'Create Order'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
