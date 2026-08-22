/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Order, OrderItem, OrderPayment, Expenditure, Customer, Product, ExpenseProduct, BusinessSettings, ActivityLog } from '../types';

/**
 * Escapes a cell value for standard CSV compatibility (RFC 4180)
 */
export function escapeCSV(val: any): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Downloads a string as a CSV file with UTF-8 BOM so Excel, Sheets, and Numbers open correctly
 */
export function downloadCSVFile(csvContent: string, filename: string): void {
  // UTF-8 BOM (\uFEFF) ensures Excel correctly recognizes currency symbols and accented characters
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ----------------------------------------------------
// INDIVIDUAL CSV EXPORTERS
// ----------------------------------------------------

/**
 * Generates CSV string for Orders
 */
export function generateOrdersCSV(orders: Order[]): string {
  const headers = [
    'Order ID',
    'Order Number',
    'Order Date',
    'Customer Name',
    'Customer Business',
    'Customer Phone',
    'Customer Email',
    'Customer Address',
    'Delivery Date',
    'Order Status',
    'Total Amount',
    'Total Paid',
    'Balance Due',
    'Payment Status',
    'Items Count',
    'Items Summary',
    'Notes',
    'Created At'
  ];

  const rows = orders.map(order => {
    const totalPaid = (order.payments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const balanceDue = Math.max(0, (Number(order.total_amount) || 0) - totalPaid);
    const paymentStatus = balanceDue <= 0 ? 'Fully Paid' : totalPaid > 0 ? 'Partially Paid' : 'Pending';
    const itemsSummary = (order.items || [])
      .map(it => `${it.product_name || 'Item'} (${it.quantity}x @ ${it.rate || 0})`)
      .join('; ');

    return [
      escapeCSV(order.id),
      escapeCSV(order.order_number),
      escapeCSV(order.order_date),
      escapeCSV(order.customer_name),
      escapeCSV(order.customer_business || ''),
      escapeCSV(order.customer_phone || ''),
      escapeCSV(order.customer_email || ''),
      escapeCSV(order.customer_address || ''),
      escapeCSV(order.delivery_date || ''),
      escapeCSV(order.status),
      escapeCSV(order.total_amount),
      escapeCSV(totalPaid),
      escapeCSV(balanceDue),
      escapeCSV(paymentStatus),
      escapeCSV((order.items || []).length),
      escapeCSV(itemsSummary),
      escapeCSV(order.notes || ''),
      escapeCSV(order.created_at || '')
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Generates CSV string for Order Line Items breakdown
 */
export function generateOrderItemsCSV(orders: Order[]): string {
  const headers = [
    'Order Number',
    'Order Date',
    'Customer Name',
    'Product Name',
    'Unit Rate',
    'Quantity',
    'Line Total Amount'
  ];

  const rows: string[] = [];
  orders.forEach(order => {
    (order.items || []).forEach(item => {
      rows.push([
        escapeCSV(order.order_number),
        escapeCSV(order.order_date),
        escapeCSV(order.customer_name),
        escapeCSV(item.product_name),
        escapeCSV(item.rate),
        escapeCSV(item.quantity),
        escapeCSV(item.total_amount)
      ].join(','));
    });
  });

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Generates CSV string for Payments Received
 */
export function generatePaymentsCSV(orders: Order[]): string {
  const headers = [
    'Payment ID',
    'Order Number',
    'Customer Name',
    'Payment Date',
    'Amount',
    'Payment Method',
    'Reference Number',
    'Notes',
    'Recorded At'
  ];

  const rows: string[] = [];
  orders.forEach(order => {
    (order.payments || []).forEach(p => {
      rows.push([
        escapeCSV(p.id),
        escapeCSV(order.order_number),
        escapeCSV(order.customer_name),
        escapeCSV(p.payment_date),
        escapeCSV(p.amount),
        escapeCSV(p.payment_method),
        escapeCSV(p.reference_number || ''),
        escapeCSV(p.notes || ''),
        escapeCSV(p.created_at || '')
      ].join(','));
    });
  });

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Generates CSV string for Expenditures & Expenses
 */
export function generateExpendituresCSV(expenditures: Expenditure[]): string {
  const headers = [
    'Expenditure ID',
    'Expense Date',
    'Category',
    'Description / Item',
    'Vendor / Payee',
    'Unit Rate',
    'Quantity',
    'Total Amount',
    'Payment Method',
    'Notes',
    'Recorded At'
  ];

  const rows = expenditures.map(exp => [
    escapeCSV(exp.id),
    escapeCSV(exp.expenditure_date),
    escapeCSV(exp.category),
    escapeCSV(exp.description),
    escapeCSV(exp.vendor || ''),
    escapeCSV(exp.rate),
    escapeCSV(exp.quantity),
    escapeCSV(exp.total_amount),
    escapeCSV(exp.payment_method),
    escapeCSV(exp.notes || ''),
    escapeCSV(exp.created_at || '')
  ].join(','));

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Generates CSV string for Customer Directory
 */
export function generateCustomersCSV(customers: Customer[], orders: Order[] = []): string {
  const headers = [
    'Customer ID',
    'Customer Name',
    'Business / Company Name',
    'Phone Number',
    'Email Address',
    'Billing / Shipping Address',
    'Total Orders Placed',
    'Total Amount Spent',
    'Total Payments Made',
    'Outstanding Balance Due',
    'Notes',
    'Added On'
  ];

  const rows = customers.map(cust => {
    // Calculate customer stats if orders provided
    const custOrders = orders.filter(
      o => (o.customer_name && o.customer_name.trim().toLowerCase() === cust.name.trim().toLowerCase()) ||
           (cust.phone && o.customer_phone && o.customer_phone.trim() === cust.phone.trim())
    );

    const totalOrders = custOrders.length;
    const totalSpent = custOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    const totalPaid = custOrders.reduce((sum, o) => {
      const pSum = (o.payments || []).reduce((ps, p) => ps + (Number(p.amount) || 0), 0);
      return sum + pSum;
    }, 0);
    const balanceDue = Math.max(0, totalSpent - totalPaid);

    return [
      escapeCSV(cust.id),
      escapeCSV(cust.name),
      escapeCSV(cust.business_name || ''),
      escapeCSV(cust.phone || ''),
      escapeCSV(cust.email || ''),
      escapeCSV(cust.address || ''),
      escapeCSV(totalOrders),
      escapeCSV(totalSpent),
      escapeCSV(totalPaid),
      escapeCSV(balanceDue),
      escapeCSV(cust.notes || ''),
      escapeCSV(cust.created_at || '')
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Generates CSV string for Product Catalogue
 */
export function generateProductsCSV(products: Product[]): string {
  const headers = [
    'Product ID',
    'Product Name',
    'Category',
    'Default Rate',
    'Unit',
    'SKU',
    'Description'
  ];

  const rows = products.map(prod => [
    escapeCSV(prod.id),
    escapeCSV(prod.name),
    escapeCSV(prod.category || 'General'),
    escapeCSV(prod.default_rate !== undefined ? prod.default_rate : ''),
    escapeCSV(prod.unit || 'pcs'),
    escapeCSV(prod.sku || ''),
    escapeCSV(prod.description || '')
  ].join(','));

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Generates a unified, complete all-in-one business CSV with marked sections
 */
export function generateUnifiedBusinessCSV(data: {
  settings?: BusinessSettings;
  orders: Order[];
  expenditures: Expenditure[];
  customers: Customer[];
  products: Product[];
  expenseProducts?: ExpenseProduct[];
}): string {
  const dateStr = new Date().toLocaleDateString();
  const timeStr = new Date().toLocaleTimeString();

  const sections: string[] = [];

  // Header banner
  sections.push([
    '# ==========================================================================',
    `# BUSINESS DATA BACKUP & EXPORT - ${data.settings?.business_name || 'Finance Hub'}`,
    `# Exported At: ${dateStr} ${timeStr}`,
    `# Total Orders: ${data.orders.length} | Total Expenses: ${data.expenditures.length} | Total Customers: ${data.customers.length} | Total Products: ${data.products.length}`,
    '# =========================================================================='
  ].join('\r\n'));

  // Section 1: Business Profile
  if (data.settings) {
    sections.push([
      '# --- SECTION: BUSINESS PROFILE & SETTINGS ---',
      'Setting Key,Setting Value',
      `Business Name,${escapeCSV(data.settings.business_name)}`,
      `Owner Name,${escapeCSV(data.settings.owner_name)}`,
      `Phone,${escapeCSV(data.settings.phone)}`,
      `Email,${escapeCSV(data.settings.email)}`,
      `Tax ID / GSTIN,${escapeCSV(data.settings.tax_id)}`,
      `Address,${escapeCSV(data.settings.address)}`,
      `Currency Symbol,${escapeCSV(data.settings.currency_symbol)}`,
      `Currency Code,${escapeCSV(data.settings.currency_code)}`
    ].join('\r\n'));
  }

  // Section 2: Orders Summary
  sections.push([
    '# --- SECTION: ORDERS ---',
    generateOrdersCSV(data.orders)
  ].join('\r\n'));

  // Section 3: Order Line Items
  sections.push([
    '# --- SECTION: ORDER LINE ITEMS ---',
    generateOrderItemsCSV(data.orders)
  ].join('\r\n'));

  // Section 4: Payments Received
  sections.push([
    '# --- SECTION: PAYMENTS RECEIVED ---',
    generatePaymentsCSV(data.orders)
  ].join('\r\n'));

  // Section 5: Expenditures
  sections.push([
    '# --- SECTION: EXPENDITURES ---',
    generateExpendituresCSV(data.expenditures)
  ].join('\r\n'));

  // Section 6: Customers
  sections.push([
    '# --- SECTION: CUSTOMERS ---',
    generateCustomersCSV(data.customers, data.orders)
  ].join('\r\n'));

  // Section 7: Products Catalogue
  sections.push([
    '# --- SECTION: PRODUCTS ---',
    generateProductsCSV(data.products)
  ].join('\r\n'));

  return sections.join('\r\n\r\n');
}

// ----------------------------------------------------
// CSV PARSING & IMPORT ENGINE
// ----------------------------------------------------

/**
 * Standard compliant CSV Parser that handles commas inside quotes, multi-line cells, and escaped quotes
 */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  // Normalize line breaks
  const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped double quote
          currentCell += '"';
          i++; // Skip next quote
        } else {
          // Closing quote
          inQuotes = false;
        }
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if (char === '\n') {
        currentRow.push(currentCell.trim());
        // Only push row if it contains at least one non-empty cell
        if (currentRow.some(c => c.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
  }

  // Flush remaining cell/row
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some(c => c.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

export interface CSVImportResult {
  detectedType: 'unified' | 'orders' | 'expenditures' | 'customers' | 'products' | 'unknown';
  summary: string;
  counts: {
    orders: number;
    expenditures: number;
    customers: number;
    products: number;
    payments: number;
  };
  parsedData: {
    orders: Order[];
    expenditures: Expenditure[];
    customers: Customer[];
    products: Product[];
    settings?: Partial<BusinessSettings>;
  };
  warnings: string[];
}

/**
 * Analyzes CSV content and parses it into structured business records
 */
export function analyzeAndParseCSV(csvText: string): CSVImportResult {
  const result: CSVImportResult = {
    detectedType: 'unknown',
    summary: '',
    counts: { orders: 0, expenditures: 0, customers: 0, products: 0, payments: 0 },
    parsedData: { orders: [], expenditures: [], customers: [], products: [] },
    warnings: []
  };

  if (!csvText || !csvText.trim()) {
    result.summary = 'File is empty.';
    return result;
  }

  // Check if it is a unified multi-section CSV
  if (csvText.includes('# --- SECTION:') || csvText.includes('=== SECTION:')) {
    result.detectedType = 'unified';
    parseUnifiedCSV(csvText, result);
    result.summary = `Unified Business Backup: Found ${result.counts.orders} orders, ${result.counts.expenditures} expenditures, ${result.counts.customers} customers, and ${result.counts.products} products.`;
    return result;
  }

  // Single table CSV detection
  const rows = parseCSV(csvText);
  if (rows.length < 2) {
    result.summary = 'CSV does not contain sufficient data rows.';
    return result;
  }

  const headerRow = rows[0].map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

  // 1. Check for Orders CSV
  if (headerRow.includes('ordernumber') || (headerRow.includes('orderdate') && headerRow.includes('customername'))) {
    result.detectedType = 'orders';
    parseOrdersTable(rows, result);
    result.summary = `Orders CSV: Found ${result.counts.orders} order records.`;
    return result;
  }

  // 2. Check for Expenditures CSV
  if (headerRow.includes('expenditureid') || headerRow.includes('expensedate') || (headerRow.includes('category') && headerRow.includes('vendor'))) {
    result.detectedType = 'expenditures';
    parseExpendituresTable(rows, result);
    result.summary = `Expenditures CSV: Found ${result.counts.expenditures} expenditure records.`;
    return result;
  }

  // 3. Check for Customers CSV
  if (headerRow.includes('customerid') || (headerRow.includes('customername') && (headerRow.includes('phonenumber') || headerRow.includes('billing')))) {
    result.detectedType = 'customers';
    parseCustomersTable(rows, result);
    result.summary = `Customer Directory CSV: Found ${result.counts.customers} customer records.`;
    return result;
  }

  // 4. Check for Products CSV
  if (headerRow.includes('productid') || (headerRow.includes('productname') && (headerRow.includes('defaultrate') || headerRow.includes('sku')))) {
    result.detectedType = 'products';
    parseProductsTable(rows, result);
    result.summary = `Products CSV: Found ${result.counts.products} catalogue items.`;
    return result;
  }

  result.summary = 'Could not automatically identify standard column headers in CSV.';
  result.warnings.push('Header row did not match standard Orders, Expenses, Customers, or Product formats.');
  return result;
}

/**
 * Parses a unified CSV file with multiple section headers
 */
function parseUnifiedCSV(text: string, result: CSVImportResult): void {
  const lines = text.split(/\r?\n/);
  let currentSection = '';
  let sectionLines: string[] = [];

  const processSection = (sectionName: string, contentLines: string[]) => {
    if (!contentLines.length) return;
    const sectionText = contentLines.join('\n');
    const tableRows = parseCSV(sectionText).filter(r => !r[0]?.startsWith('#'));

    if (sectionName.includes('ORDERS') && !sectionName.includes('LINE ITEMS')) {
      parseOrdersTable(tableRows, result);
    } else if (sectionName.includes('EXPENDITURES')) {
      parseExpendituresTable(tableRows, result);
    } else if (sectionName.includes('CUSTOMERS')) {
      parseCustomersTable(tableRows, result);
    } else if (sectionName.includes('PRODUCTS')) {
      parseProductsTable(tableRows, result);
    }
  };

  for (const line of lines) {
    if (line.startsWith('# --- SECTION:') || line.startsWith('=== SECTION:')) {
      if (currentSection && sectionLines.length) {
        processSection(currentSection, sectionLines);
      }
      currentSection = line.toUpperCase();
      sectionLines = [];
    } else {
      sectionLines.push(line);
    }
  }

  if (currentSection && sectionLines.length) {
    processSection(currentSection, sectionLines);
  }
}

/**
 * Parses rows into Order objects
 */
function parseOrdersTable(rows: string[][], result: CSVImportResult): void {
  if (rows.length < 2) return;
  const headers = rows[0].map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

  const getIdx = (...names: string[]) => {
    for (const name of names) {
      const idx = headers.indexOf(name.toLowerCase().replace(/[^a-z0-9]/g, ''));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const idIdx = getIdx('orderid', 'id');
  const numIdx = getIdx('ordernumber', 'number', 'invoicenumber');
  const dateIdx = getIdx('orderdate', 'date');
  const nameIdx = getIdx('customername', 'customer', 'name');
  const bizIdx = getIdx('customerbusiness', 'business', 'company');
  const phoneIdx = getIdx('customerphone', 'phone', 'mobile');
  const emailIdx = getIdx('customeremail', 'email');
  const addressIdx = getIdx('customeraddress', 'address');
  const delivIdx = getIdx('deliverydate', 'duedate');
  const statusIdx = getIdx('orderstatus', 'status');
  const totalIdx = getIdx('totalamount', 'total', 'amount');
  const paidIdx = getIdx('totalpaid', 'advancepaid', 'paid');
  const notesIdx = getIdx('notes', 'note');

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 2) continue;

    const customerName = nameIdx !== -1 && row[nameIdx] ? row[nameIdx] : 'Walk-in Customer';
    const orderNumber = numIdx !== -1 && row[numIdx] ? row[numIdx] : `ORD-${1000 + result.counts.orders + i}`;
    const orderDate = dateIdx !== -1 && row[dateIdx] ? row[dateIdx] : new Date().toISOString().split('T')[0];
    const totalAmount = totalIdx !== -1 ? Number(row[totalIdx]) || 0 : 0;
    const paidAmount = paidIdx !== -1 ? Number(row[paidIdx]) || 0 : 0;
    const rawStatus = statusIdx !== -1 && row[statusIdx] ? row[statusIdx].toLowerCase() : 'new';
    
    let status: Order['status'] = 'new';
    if (rawStatus.includes('comp') || rawStatus.includes('deliver')) status = 'completed';
    else if (rawStatus.includes('proc') || rawStatus.includes('prog')) status = 'processing';
    else if (rawStatus.includes('canc')) status = 'cancelled';

    const orderId = idIdx !== -1 && row[idIdx] ? row[idIdx] : `ord-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`;

    // Reconstruct payments if paidAmount > 0
    const payments: OrderPayment[] = [];
    if (paidAmount > 0) {
      payments.push({
        id: `pay-${Date.now()}-${i}`,
        order_id: orderId,
        payment_date: orderDate,
        amount: paidAmount,
        payment_method: 'Cash',
        notes: 'Imported initial payment from CSV',
        created_at: new Date().toISOString()
      });
    }

    const order: Order = {
      id: orderId,
      order_number: orderNumber,
      customer_name: customerName,
      customer_business: bizIdx !== -1 ? row[bizIdx] : undefined,
      customer_phone: phoneIdx !== -1 ? row[phoneIdx] : undefined,
      customer_email: emailIdx !== -1 ? row[emailIdx] : undefined,
      customer_address: addressIdx !== -1 ? row[addressIdx] : undefined,
      order_date: orderDate,
      delivery_date: delivIdx !== -1 ? row[delivIdx] : undefined,
      status,
      items: [
        {
          id: `item-${Date.now()}-${i}`,
          product_name: 'Custom Order Item',
          rate: totalAmount,
          quantity: 1,
          total_amount: totalAmount
        }
      ],
      total_amount: totalAmount,
      payments,
      notes: notesIdx !== -1 ? row[notesIdx] : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    result.parsedData.orders.push(order);
    result.counts.orders++;
    if (payments.length) result.counts.payments += payments.length;
  }
}

/**
 * Parses rows into Expenditure objects
 */
function parseExpendituresTable(rows: string[][], result: CSVImportResult): void {
  if (rows.length < 2) return;
  const headers = rows[0].map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

  const getIdx = (...names: string[]) => {
    for (const name of names) {
      const idx = headers.indexOf(name.toLowerCase().replace(/[^a-z0-9]/g, ''));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const idIdx = getIdx('expenditureid', 'id');
  const dateIdx = getIdx('expensedate', 'expendituredate', 'date');
  const catIdx = getIdx('category');
  const descIdx = getIdx('description', 'item', 'details', 'purpose');
  const vendorIdx = getIdx('vendor', 'payee', 'supplier');
  const rateIdx = getIdx('unitrate', 'rate', 'price');
  const qtyIdx = getIdx('quantity', 'qty');
  const totalIdx = getIdx('totalamount', 'total', 'amount');
  const methodIdx = getIdx('paymentmethod', 'method', 'paidvia');
  const notesIdx = getIdx('notes', 'note');

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 2) continue;

    const desc = descIdx !== -1 && row[descIdx] ? row[descIdx] : 'Expense item';
    const cat = catIdx !== -1 && row[catIdx] ? row[catIdx] : 'General';
    const rate = rateIdx !== -1 ? Number(row[rateIdx]) || 0 : 0;
    const qty = qtyIdx !== -1 ? Number(row[qtyIdx]) || 1 : 1;
    const totalAmount = totalIdx !== -1 && row[totalIdx] ? Number(row[totalIdx]) || (rate * qty) : (rate * qty);

    const exp: Expenditure = {
      id: idIdx !== -1 && row[idIdx] ? row[idIdx] : `exp-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
      expenditure_date: dateIdx !== -1 && row[dateIdx] ? row[dateIdx] : new Date().toISOString().split('T')[0],
      category: cat,
      description: desc,
      vendor: vendorIdx !== -1 ? row[vendorIdx] : undefined,
      rate: rate || totalAmount,
      quantity: qty || 1,
      total_amount: totalAmount,
      payment_method: (methodIdx !== -1 && row[methodIdx] as any) || 'Cash',
      notes: notesIdx !== -1 ? row[notesIdx] : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    result.parsedData.expenditures.push(exp);
    result.counts.expenditures++;
  }
}

/**
 * Parses rows into Customer objects
 */
function parseCustomersTable(rows: string[][], result: CSVImportResult): void {
  if (rows.length < 2) return;
  const headers = rows[0].map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

  const getIdx = (...names: string[]) => {
    for (const name of names) {
      const idx = headers.indexOf(name.toLowerCase().replace(/[^a-z0-9]/g, ''));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const idIdx = getIdx('customerid', 'id');
  const nameIdx = getIdx('customername', 'name', 'client');
  const bizIdx = getIdx('businessname', 'business', 'company');
  const phoneIdx = getIdx('phonenumber', 'phone', 'mobile');
  const emailIdx = getIdx('emailaddress', 'email');
  const addrIdx = getIdx('billingaddress', 'address', 'location');
  const notesIdx = getIdx('notes', 'note');

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 1) continue;

    const name = nameIdx !== -1 && row[nameIdx] ? row[nameIdx] : `Customer ${i}`;

    const cust: Customer = {
      id: idIdx !== -1 && row[idIdx] ? row[idIdx] : `cust-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      business_name: bizIdx !== -1 ? row[bizIdx] : undefined,
      phone: phoneIdx !== -1 ? row[phoneIdx] : undefined,
      email: emailIdx !== -1 ? row[emailIdx] : undefined,
      address: addrIdx !== -1 ? row[addrIdx] : undefined,
      notes: notesIdx !== -1 ? row[notesIdx] : undefined,
      created_at: new Date().toISOString()
    };

    result.parsedData.customers.push(cust);
    result.counts.customers++;
  }
}

/**
 * Parses rows into Product objects
 */
function parseProductsTable(rows: string[][], result: CSVImportResult): void {
  if (rows.length < 2) return;
  const headers = rows[0].map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

  const getIdx = (...names: string[]) => {
    for (const name of names) {
      const idx = headers.indexOf(name.toLowerCase().replace(/[^a-z0-9]/g, ''));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const idIdx = getIdx('productid', 'id');
  const nameIdx = getIdx('productname', 'name', 'itemname', 'title');
  const catIdx = getIdx('category');
  const rateIdx = getIdx('defaultrate', 'rate', 'price');
  const unitIdx = getIdx('unit');
  const skuIdx = getIdx('sku', 'code');
  const descIdx = getIdx('description', 'details');

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 1) continue;

    const name = nameIdx !== -1 && row[nameIdx] ? row[nameIdx] : `Product ${i}`;
    const rate = rateIdx !== -1 && row[rateIdx] ? Number(row[rateIdx]) || undefined : undefined;

    const prod: Product = {
      id: idIdx !== -1 && row[idIdx] ? row[idIdx] : `prod-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      category: catIdx !== -1 && row[catIdx] ? row[catIdx] : 'General',
      default_rate: rate,
      unit: unitIdx !== -1 && row[unitIdx] ? row[unitIdx] : 'pcs',
      sku: skuIdx !== -1 ? row[skuIdx] : undefined,
      description: descIdx !== -1 ? row[descIdx] : undefined
    };

    result.parsedData.products.push(prod);
    result.counts.products++;
  }
}
