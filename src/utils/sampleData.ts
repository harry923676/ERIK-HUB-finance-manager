import { Order, Expenditure, Customer, ActivityLog, BusinessSettings, Product, ExpenseProduct } from '../types';

export const defaultSettings: BusinessSettings = {
  business_name: 'ERIK-HUB Finance manager',
  tagline: 'Precision Accounting & Financial Suite',
  owner_name: 'Rajesh Sharma',
  phone: '+91 98765 43210',
  email: 'contact@apexhorizon.com',
  address: 'Suite 402, Trade Center, Industrial Area Phase II, Mumbai, MH 400013',
  tax_id: 'GSTIN27AAACA1234F1Z5',
  currency_symbol: '₹',
  currency_code: 'INR',
  financial_year_start: '04-01',
  invoice_prefix: 'INV-2026-',
  notes_default: 'Thank you for your business. Please remit payments within 15 days of invoice date.'
};

export const defaultProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Photo Frame',
    default_rate: 450,
    category: 'Framing',
    unit: 'pcs',
    description: 'Standard custom photo frame with mount'
  },
  {
    id: 'prod-2',
    name: 'Custom Wooden Photo Frame',
    default_rate: 850,
    category: 'Framing',
    unit: 'pcs',
    description: 'Handcrafted premium teak wooden frame'
  },
  {
    id: 'prod-3',
    name: 'Acrylic Photo Frame',
    default_rate: 1200,
    category: 'Framing',
    unit: 'pcs',
    description: 'Crystal-clear frameless acrylic wall display'
  },
  {
    id: 'prod-4',
    name: 'Canvas Print & Stretched Frame',
    default_rate: 950,
    category: 'Printing',
    unit: 'pcs',
    description: 'High-grade canvas wrap on pinewood stretcher bars'
  },
  {
    id: 'prod-5',
    name: 'Studio Photo Album & Print Set',
    default_rate: 1800,
    category: 'Photography',
    unit: 'set',
    description: 'Layflat premium lustre photo album'
  }
];

export const defaultExpenseProducts: ExpenseProduct[] = [
  {
    id: 'exp-prod-1',
    name: 'Frame',
    default_rate: 220,
    category: 'Raw Materials',
    unit: 'pcs',
    default_vendor: 'Crown Mouldings & Glass',
    description: 'Wooden moulding frame body and backing support'
  },
  {
    id: 'exp-prod-2',
    name: 'Printer Ink',
    default_rate: 850,
    category: 'Office Expenses',
    unit: 'bottle',
    default_vendor: 'Epson Pro Inks Ltd',
    description: 'High-density pigment ink refill bottles (CMYK)'
  },
  {
    id: 'exp-prod-3',
    name: 'Photo Paper',
    default_rate: 420,
    category: 'Raw Materials',
    unit: 'pack',
    default_vendor: 'FineArt Print Supplies',
    description: '260 GSM Premium Ultra Lustre Photo Paper (100 sheets)'
  },
  {
    id: 'exp-prod-4',
    name: 'Transport',
    default_rate: 150,
    category: 'Transportation',
    unit: 'trip',
    default_vendor: 'City Dispatch Logistics',
    description: 'Local delivery, courier, and raw material transport'
  },
  {
    id: 'exp-prod-5',
    name: 'Speaker with Mic',
    default_rate: 2400,
    category: 'Equipment',
    unit: 'set',
    default_vendor: 'Acoustic Sound Tech',
    description: 'Portable PA speaker with wireless UHF microphone'
  },
  {
    id: 'exp-prod-6',
    name: 'Miscellaneous',
    default_rate: 100,
    category: 'Miscellaneous',
    unit: 'item',
    default_vendor: 'Local Vendors',
    description: 'General consumables, hardware screws, and incidentals'
  }
];

export const defaultExpensePurposes: string[] = [
  'Frame',
  'Printer Ink',
  'Photo Paper',
  'Transport',
  'Speaker with Mic',
  'Miscellaneous'
];

export const defaultCategories = [
  'Raw Materials',
  'Inventory',
  'Transportation',
  'Salaries',
  'Rent',
  'Electricity',
  'Internet',
  'Marketing',
  'Advertising',
  'Office Expenses',
  'Maintenance',
  'Packaging',
  'Equipment',
  'Miscellaneous'
];

export function getSampleData(): {
  orders: Order[];
  expenditures: Expenditure[];
  customers: Customer[];
  activityLogs: ActivityLog[];
  settings: BusinessSettings;
} {
  const now = new Date();
  
  // Helper to format ISO date strings for N days ago
  const daysAgo = (days: number, hour: number = 11, minute: number = 30): string => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  };

  const dateStr = (days: number): string => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  };

  const customers: Customer[] = [
    {
      id: 'cust-1',
      name: 'Pawan Sharma',
      business_name: 'ABC Enterprises',
      phone: '+91 98201 11223',
      email: 'pawan@abcenterprises.in',
      address: 'Plot 45, MIDC Industrial Hub, Andheri East, Mumbai',
      notes: 'Key client for industrial polymers. Prefers Net 30 terms.',
      created_at: daysAgo(60)
    },
    {
      id: 'cust-2',
      name: 'Vikram Mehta',
      business_name: 'XYZ Traders & Co.',
      phone: '+91 98112 44556',
      email: 'vikram@xyztraders.com',
      address: 'Shop 12, Wholesale Market, Chandni Chowk, New Delhi',
      notes: 'High volume buyer. Frequently pays via RTGS/Bank Transfer.',
      created_at: daysAgo(50)
    },
    {
      id: 'cust-3',
      name: 'Ananya Deshmukh',
      business_name: 'Zenith Logistics & Retail',
      phone: '+91 97665 99887',
      email: 'ananya@zenithlogistics.in',
      address: 'Tower B, Tech Park, Hinjewadi, Pune',
      notes: 'Requires delivery confirmation on email.',
      created_at: daysAgo(40)
    },
    {
      id: 'cust-4',
      name: 'Karan Singhal',
      business_name: 'Singhal Hardware Mart',
      phone: '+91 98450 33441',
      email: 'singhal.hardware@gmail.com',
      address: '24 BTM 2nd Stage, Outer Ring Road, Bengaluru',
      notes: 'Regular monthly orders for tooling and packaging materials.',
      created_at: daysAgo(35)
    },
    {
      id: 'cust-5',
      name: 'Rohan Gupta',
      business_name: 'Gupta Steel & Fabrication',
      phone: '+91 99234 88771',
      email: 'rohan@guptasteel.co.in',
      address: 'GIDC Industrial Estate, Vatva, Ahmedabad',
      notes: 'Fabrication client, regular repeat orders.',
      created_at: daysAgo(25)
    },
    {
      id: 'cust-6',
      name: 'Meera Iyer',
      business_name: 'Shree Tech Solutions',
      phone: '+91 94440 12345',
      email: 'meera.iyer@shreetech.com',
      address: 'T. Nagar, Chennai, Tamil Nadu',
      notes: 'Consulting client and commercial supplies.',
      created_at: daysAgo(15)
    }
  ];

  const orders: Order[] = [
    {
      id: 'ord-101',
      order_number: 'ORD-2026-101',
      customer_name: 'Pawan Sharma',
      customer_business: 'ABC Enterprises',
      customer_phone: '+91 98201 11223',
      customer_email: 'pawan@abcenterprises.in',
      customer_address: 'Plot 45, MIDC Industrial Hub, Andheri East, Mumbai',
      order_date: dateStr(2),
      delivery_date: dateStr(-3),
      status: 'processing',
      total_amount: 145000,
      items: [
        {
          id: 'item-1',
          product_name: 'High-Density Polymer Pellets (Grade A)',
          rate: 1450,
          quantity: 80,
          total_amount: 116000
        },
        {
          id: 'item-2',
          product_name: 'Custom Industrial Mold Castings',
          rate: 5800,
          quantity: 5,
          total_amount: 29000
        }
      ],
      payments: [
        {
          id: 'pay-1',
          order_id: 'ord-101',
          payment_date: dateStr(2),
          amount: 50000,
          payment_method: 'Bank Transfer',
          reference_number: 'NEFT-AXIS-982103',
          notes: 'Advance 35% on order confirmation',
          created_at: daysAgo(2, 14, 30)
        },
        {
          id: 'pay-2',
          order_id: 'ord-101',
          payment_date: dateStr(0),
          amount: 35000,
          payment_method: 'UPI',
          reference_number: 'UPI-238491823901',
          notes: 'Second milestone payment',
          created_at: daysAgo(0, 10, 15)
        }
      ],
      notes: 'Priority dispatch required once molding is inspected.',
      created_at: daysAgo(2, 11, 0),
      updated_at: daysAgo(0, 10, 15)
    },
    {
      id: 'ord-102',
      order_number: 'ORD-2026-102',
      customer_name: 'Vikram Mehta',
      customer_business: 'XYZ Traders & Co.',
      customer_phone: '+91 98112 44556',
      customer_email: 'vikram@xyztraders.com',
      customer_address: 'Shop 12, Wholesale Market, Chandni Chowk, New Delhi',
      order_date: dateStr(5),
      delivery_date: dateStr(1),
      status: 'completed',
      total_amount: 84000,
      items: [
        {
          id: 'item-3',
          product_name: 'Heavy Duty Packaging Straps (Rolls)',
          rate: 420,
          quantity: 150,
          total_amount: 63000
        },
        {
          id: 'item-4',
          product_name: 'Corrugated Export Shipping Boxes',
          rate: 70,
          quantity: 300,
          total_amount: 21000
        }
      ],
      payments: [
        {
          id: 'pay-3',
          order_id: 'ord-102',
          payment_date: dateStr(5),
          amount: 40000,
          payment_method: 'UPI',
          reference_number: 'UPI-9832109823',
          notes: 'Initial deposit',
          created_at: daysAgo(5, 12, 0)
        },
        {
          id: 'pay-4',
          order_id: 'ord-102',
          payment_date: dateStr(1),
          amount: 44000,
          payment_method: 'Bank Transfer',
          reference_number: 'HDFC-IMPS-887102',
          notes: 'Final settlement against delivery',
          created_at: daysAgo(1, 16, 45)
        }
      ],
      notes: 'Fully settled and delivered with inspection slip.',
      created_at: daysAgo(5, 11, 20),
      updated_at: daysAgo(1, 16, 45)
    },
    {
      id: 'ord-103',
      order_number: 'ORD-2026-103',
      customer_name: 'Ananya Deshmukh',
      customer_business: 'Zenith Logistics & Retail',
      customer_phone: '+91 97665 99887',
      customer_email: 'ananya@zenithlogistics.in',
      customer_address: 'Tower B, Tech Park, Hinjewadi, Pune',
      order_date: dateStr(8),
      delivery_date: dateStr(3),
      status: 'completed',
      total_amount: 196000,
      items: [
        {
          id: 'item-5',
          product_name: 'Automated Conveyor Rollers (Heavy duty)',
          rate: 9800,
          quantity: 20,
          total_amount: 196000
        }
      ],
      payments: [
        {
          id: 'pay-5',
          order_id: 'ord-103',
          payment_date: dateStr(8),
          amount: 100000,
          payment_method: 'Bank Transfer',
          reference_number: 'ICICI-RTGS-990182',
          notes: '50% project advance',
          created_at: daysAgo(8, 15, 0)
        },
        {
          id: 'pay-6',
          order_id: 'ord-103',
          payment_date: dateStr(4),
          amount: 96000,
          payment_method: 'Bank Transfer',
          reference_number: 'ICICI-RTGS-991450',
          notes: 'Final invoice clearance',
          created_at: daysAgo(4, 11, 30)
        }
      ],
      notes: 'Installation warranty included for 12 months.',
      created_at: daysAgo(8, 14, 0),
      updated_at: daysAgo(4, 11, 30)
    },
    {
      id: 'ord-104',
      order_number: 'ORD-2026-104',
      customer_name: 'Karan Singhal',
      customer_business: 'Singhal Hardware Mart',
      customer_phone: '+91 98450 33441',
      customer_email: 'singhal.hardware@gmail.com',
      customer_address: '24 BTM 2nd Stage, Outer Ring Road, Bengaluru',
      order_date: dateStr(12),
      delivery_date: dateStr(6),
      status: 'processing',
      total_amount: 112500,
      items: [
        {
          id: 'item-6',
          product_name: 'Precision Carbide Cutting Tools',
          rate: 750,
          quantity: 110,
          total_amount: 82500
        },
        {
          id: 'item-7',
          product_name: 'Lubricant Coolant Barrels (50L)',
          rate: 6000,
          quantity: 5,
          total_amount: 30000
        }
      ],
      payments: [
        {
          id: 'pay-7',
          order_id: 'ord-104',
          payment_date: dateStr(12),
          amount: 50000,
          payment_method: 'Cheque',
          reference_number: 'CHQ-SBI-443901',
          notes: 'Cheque cleared on 14th',
          created_at: daysAgo(12, 10, 0)
        }
      ],
      notes: 'Pending balance due on final delivery consignment.',
      created_at: daysAgo(12, 9, 30),
      updated_at: daysAgo(12, 10, 0)
    },
    {
      id: 'ord-105',
      order_number: 'ORD-2026-105',
      customer_name: 'Rohan Gupta',
      customer_business: 'Gupta Steel & Fabrication',
      customer_phone: '+91 99234 88771',
      customer_email: 'rohan@guptasteel.co.in',
      customer_address: 'GIDC Industrial Estate, Vatva, Ahmedabad',
      order_date: dateStr(1),
      delivery_date: dateStr(-4),
      status: 'new',
      total_amount: 72000,
      items: [
        {
          id: 'item-8',
          product_name: 'Alloy Steel Fasteners (Box of 500)',
          rate: 3600,
          quantity: 20,
          total_amount: 72000
        }
      ],
      payments: [],
      notes: 'New order waiting for proforma invoice approval & advance.',
      created_at: daysAgo(1, 14, 20),
      updated_at: daysAgo(1, 14, 20)
    },
    {
      id: 'ord-106',
      order_number: 'ORD-2026-106',
      customer_name: 'Meera Iyer',
      customer_business: 'Shree Tech Solutions',
      customer_phone: '+91 94440 12345',
      customer_email: 'meera.iyer@shreetech.com',
      customer_address: 'T. Nagar, Chennai, Tamil Nadu',
      order_date: dateStr(18),
      delivery_date: dateStr(10),
      status: 'completed',
      total_amount: 156000,
      items: [
        {
          id: 'item-9',
          product_name: 'Server Rack Mounting Assemblies',
          rate: 13000,
          quantity: 12,
          total_amount: 156000
        }
      ],
      payments: [
        {
          id: 'pay-8',
          order_id: 'ord-106',
          payment_date: dateStr(18),
          amount: 80000,
          payment_method: 'Credit Card',
          reference_number: 'CC-STRIPE-78912',
          notes: 'Online payment gateway',
          created_at: daysAgo(18, 11, 0)
        },
        {
          id: 'pay-9',
          order_id: 'ord-106',
          payment_date: dateStr(11),
          amount: 76000,
          payment_method: 'UPI',
          reference_number: 'UPI-7718293901',
          notes: 'Full settlement upon dispatch',
          created_at: daysAgo(11, 17, 30)
        }
      ],
      notes: 'Completed with full 5-star customer feedback.',
      created_at: daysAgo(18, 10, 0),
      updated_at: daysAgo(11, 17, 30)
    },
    // Historical orders from previous month (30-55 days ago)
    {
      id: 'ord-107',
      order_number: 'ORD-2026-095',
      customer_name: 'Pawan Sharma',
      customer_business: 'ABC Enterprises',
      customer_phone: '+91 98201 11223',
      customer_email: 'pawan@abcenterprises.in',
      customer_address: 'Plot 45, MIDC Industrial Hub, Andheri East, Mumbai',
      order_date: dateStr(38),
      delivery_date: dateStr(30),
      status: 'completed',
      total_amount: 120000,
      items: [
        {
          id: 'item-10',
          product_name: 'Raw Plastic Granules Batch #88',
          rate: 1200,
          quantity: 100,
          total_amount: 120000
        }
      ],
      payments: [
        {
          id: 'pay-10',
          order_id: 'ord-107',
          payment_date: dateStr(38),
          amount: 60000,
          payment_method: 'Bank Transfer',
          reference_number: 'NEFT-556102',
          notes: 'First installment',
          created_at: daysAgo(38)
        },
        {
          id: 'pay-11',
          order_id: 'ord-107',
          payment_date: dateStr(31),
          amount: 60000,
          payment_method: 'Bank Transfer',
          reference_number: 'NEFT-559812',
          notes: 'Balance received',
          created_at: daysAgo(31)
        }
      ],
      created_at: daysAgo(38),
      updated_at: daysAgo(31)
    },
    {
      id: 'ord-108',
      order_number: 'ORD-2026-096',
      customer_name: 'Vikram Mehta',
      customer_business: 'XYZ Traders & Co.',
      customer_phone: '+91 98112 44556',
      customer_email: 'vikram@xyztraders.com',
      customer_address: 'Shop 12, Wholesale Market, Chandni Chowk, New Delhi',
      order_date: dateStr(45),
      delivery_date: dateStr(40),
      status: 'completed',
      total_amount: 98000,
      items: [
        {
          id: 'item-11',
          product_name: 'Industrial Corrugated Cartons (Custom Print)',
          rate: 98,
          quantity: 1000,
          total_amount: 98000
        }
      ],
      payments: [
        {
          id: 'pay-12',
          order_id: 'ord-108',
          payment_date: dateStr(45),
          amount: 98000,
          payment_method: 'Bank Transfer',
          reference_number: 'HDFC-RTGS-11029',
          notes: 'Full payment up front with 2% cash discount',
          created_at: daysAgo(45)
        }
      ],
      created_at: daysAgo(45),
      updated_at: daysAgo(45)
    },
    // Historical from 2 months ago (65-80 days ago)
    {
      id: 'ord-109',
      order_number: 'ORD-2026-088',
      customer_name: 'Zenith Logistics & Retail',
      customer_business: 'Zenith Logistics & Retail',
      customer_phone: '+91 97665 99887',
      customer_email: 'ananya@zenithlogistics.in',
      customer_address: 'Tower B, Tech Park, Hinjewadi, Pune',
      order_date: dateStr(70),
      delivery_date: dateStr(62),
      status: 'completed',
      total_amount: 210000,
      items: [
        {
          id: 'item-12',
          product_name: 'Warehouse Storage Rack Systems',
          rate: 21000,
          quantity: 10,
          total_amount: 210000
        }
      ],
      payments: [
        {
          id: 'pay-13',
          order_id: 'ord-109',
          payment_date: dateStr(70),
          amount: 110000,
          payment_method: 'Bank Transfer',
          reference_number: 'ICICI-9921',
          notes: 'Deposit',
          created_at: daysAgo(70)
        },
        {
          id: 'pay-14',
          order_id: 'ord-109',
          payment_date: dateStr(63),
          amount: 100000,
          payment_method: 'Bank Transfer',
          reference_number: 'ICICI-9988',
          notes: 'Final settlement',
          created_at: daysAgo(63)
        }
      ],
      created_at: daysAgo(70),
      updated_at: daysAgo(63)
    }
  ];

  const expenditures: Expenditure[] = [
    {
      id: 'exp-1',
      expenditure_date: dateStr(1),
      category: 'Salaries',
      description: 'Monthly Staff & Operations Salaries (Mid-Month Disbursal)',
      vendor: 'Staff Payroll Account',
      rate: 45000,
      quantity: 1,
      total_amount: 45000,
      payment_method: 'Bank Transfer',
      notes: 'Direct account transfer to technical staff.',
      created_at: daysAgo(1, 9, 30),
      updated_at: daysAgo(1, 9, 30)
    },
    {
      id: 'exp-2',
      expenditure_date: dateStr(3),
      category: 'Rent',
      description: 'Commercial Warehouse & Office Rent (Current Month)',
      vendor: 'Mahalaxmi Commercial Properties',
      rate: 35000,
      quantity: 1,
      total_amount: 35000,
      payment_method: 'Bank Transfer',
      notes: 'Rent receipt #ML-4091 received.',
      created_at: daysAgo(3, 10, 0),
      updated_at: daysAgo(3, 10, 0)
    },
    {
      id: 'exp-3',
      expenditure_date: dateStr(4),
      category: 'Raw Materials',
      description: 'High-Purity Polymer Granule Bags (25kg bags)',
      vendor: 'Supreme Petrochem Ltd.',
      rate: 1800,
      quantity: 25,
      total_amount: 45000,
      payment_method: 'Bank Transfer',
      notes: 'Tax Invoice SPL-8819. Quality checked.',
      created_at: daysAgo(4, 14, 15),
      updated_at: daysAgo(4, 14, 15)
    },
    {
      id: 'exp-4',
      expenditure_date: dateStr(6),
      category: 'Transportation',
      description: 'Freight Dispatch & Container Logistics (Pune - Mumbai)',
      vendor: 'SpeedX Express Logistics',
      rate: 4500,
      quantity: 2,
      total_amount: 9000,
      payment_method: 'UPI',
      notes: 'Bill for 2 truckload deliveries.',
      created_at: daysAgo(6, 17, 0),
      updated_at: daysAgo(6, 17, 0)
    },
    {
      id: 'exp-5',
      expenditure_date: dateStr(9),
      category: 'Electricity',
      description: 'Industrial High-Tension Power Bill (MSEDCL)',
      vendor: 'State Electricity Distribution Co.',
      rate: 14200,
      quantity: 1,
      total_amount: 14200,
      payment_method: 'Bank Transfer',
      notes: 'Paid online via electricity portal.',
      created_at: daysAgo(9, 11, 45),
      updated_at: daysAgo(9, 11, 45)
    },
    {
      id: 'exp-6',
      expenditure_date: dateStr(11),
      category: 'Packaging',
      description: 'Heavy duty stretch wrap and corrugated sheets',
      vendor: 'Krishna Packaging Industries',
      rate: 350,
      quantity: 20,
      total_amount: 7000,
      payment_method: 'Cash',
      notes: 'Cash receipt #KP-1029.',
      created_at: daysAgo(11, 13, 0),
      updated_at: daysAgo(11, 13, 0)
    },
    {
      id: 'exp-7',
      expenditure_date: dateStr(14),
      category: 'Maintenance',
      description: 'Hydraulic Press Servicing & Oil Replacement',
      vendor: 'Apex Tech Works',
      rate: 6500,
      quantity: 1,
      total_amount: 6500,
      payment_method: 'UPI',
      notes: 'Routine scheduled preventative maintenance.',
      created_at: daysAgo(14, 15, 30),
      updated_at: daysAgo(14, 15, 30)
    },
    {
      id: 'exp-8',
      expenditure_date: dateStr(16),
      category: 'Marketing',
      description: 'Google Ads & B2B Directory Listing Campaign',
      vendor: 'Google India / TradeIndia',
      rate: 8500,
      quantity: 1,
      total_amount: 8500,
      payment_method: 'Credit Card',
      notes: 'Monthly digital marketing promotion.',
      created_at: daysAgo(16, 18, 0),
      updated_at: daysAgo(16, 18, 0)
    },
    {
      id: 'exp-9',
      expenditure_date: dateStr(20),
      category: 'Internet',
      description: 'High-Speed Optical Fiber Broadband (200 Mbps)',
      vendor: 'Airtel Business Broadband',
      rate: 2499,
      quantity: 1,
      total_amount: 2499,
      payment_method: 'UPI',
      notes: 'Monthly commercial internet subscription.',
      created_at: daysAgo(20, 10, 0),
      updated_at: daysAgo(20, 10, 0)
    },
    // Last month expenditures
    {
      id: 'exp-10',
      expenditure_date: dateStr(35),
      category: 'Salaries',
      description: 'Staff Monthly Salary Disbursal',
      vendor: 'Staff Payroll',
      rate: 45000,
      quantity: 1,
      total_amount: 45000,
      payment_method: 'Bank Transfer',
      created_at: daysAgo(35),
      updated_at: daysAgo(35)
    },
    {
      id: 'exp-11',
      expenditure_date: dateStr(37),
      category: 'Rent',
      description: 'Warehouse Rent',
      vendor: 'Mahalaxmi Commercial Properties',
      rate: 35000,
      quantity: 1,
      total_amount: 35000,
      payment_method: 'Bank Transfer',
      created_at: daysAgo(37),
      updated_at: daysAgo(37)
    },
    {
      id: 'exp-12',
      expenditure_date: dateStr(40),
      category: 'Raw Materials',
      description: 'Polymer Raw Batch 44',
      vendor: 'Supreme Petrochem Ltd.',
      rate: 1500,
      quantity: 30,
      total_amount: 45000,
      payment_method: 'Bank Transfer',
      created_at: daysAgo(40),
      updated_at: daysAgo(40)
    },
    {
      id: 'exp-13',
      expenditure_date: dateStr(44),
      category: 'Electricity',
      description: 'Factory Electricity Bill',
      vendor: 'State Electricity Distribution Co.',
      rate: 13800,
      quantity: 1,
      total_amount: 13800,
      payment_method: 'Bank Transfer',
      created_at: daysAgo(44),
      updated_at: daysAgo(44)
    },
    // 2 months ago expenditures
    {
      id: 'exp-14',
      expenditure_date: dateStr(65),
      category: 'Salaries',
      description: 'Staff Salaries',
      vendor: 'Staff Payroll',
      rate: 45000,
      quantity: 1,
      total_amount: 45000,
      payment_method: 'Bank Transfer',
      created_at: daysAgo(65),
      updated_at: daysAgo(65)
    },
    {
      id: 'exp-15',
      expenditure_date: dateStr(68),
      category: 'Rent',
      description: 'Warehouse Rent',
      vendor: 'Mahalaxmi Commercial Properties',
      rate: 35000,
      quantity: 1,
      total_amount: 35000,
      payment_method: 'Bank Transfer',
      created_at: daysAgo(68),
      updated_at: daysAgo(68)
    },
    {
      id: 'exp-16',
      expenditure_date: dateStr(72),
      category: 'Equipment',
      description: 'CNC Tool Calibration Kit & Machine Spare',
      vendor: 'Industrial Tools Corp',
      rate: 28000,
      quantity: 1,
      total_amount: 28000,
      payment_method: 'Bank Transfer',
      created_at: daysAgo(72),
      updated_at: daysAgo(72)
    }
  ];

  const activityLogs: ActivityLog[] = [
    {
      id: 'act-1',
      timestamp: daysAgo(0, 10, 15),
      type: 'payment_added',
      title: 'Payment Received',
      description: 'Payment of ₹35,000 received from Pawan Sharma (ABC Enterprises) via UPI.',
      amount: 35000,
      order_id: 'ord-101'
    },
    {
      id: 'act-2',
      timestamp: daysAgo(1, 14, 20),
      type: 'order_created',
      title: 'New Order Created',
      description: 'New order ORD-2026-105 created for Rohan Gupta (Gupta Steel) totaling ₹72,000.',
      amount: 72000,
      order_id: 'ord-105'
    },
    {
      id: 'act-3',
      timestamp: daysAgo(1, 9, 30),
      type: 'expenditure_added',
      title: 'Expenditure Logged',
      description: 'Logged expenditure of ₹45,000 under Salaries for monthly payroll.',
      amount: 45000
    },
    {
      id: 'act-4',
      timestamp: daysAgo(1, 16, 45),
      type: 'payment_added',
      title: 'Final Payment Cleared',
      description: 'Settlement of ₹44,000 received for ORD-2026-102 (XYZ Traders & Co.).',
      amount: 44000,
      order_id: 'ord-102'
    },
    {
      id: 'act-5',
      timestamp: daysAgo(2, 14, 30),
      type: 'payment_added',
      title: 'Advance Payment Received',
      description: 'Advance payment of ₹50,000 received for ORD-2026-101 via Bank Transfer.',
      amount: 50000,
      order_id: 'ord-101'
    },
    {
      id: 'act-6',
      timestamp: daysAgo(2, 11, 0),
      type: 'order_created',
      title: 'New Order Created',
      description: 'Order ORD-2026-101 created for ABC Enterprises with 2 items worth ₹1,45,000.',
      amount: 145000,
      order_id: 'ord-101'
    },
    {
      id: 'act-7',
      timestamp: daysAgo(3, 10, 0),
      type: 'expenditure_added',
      title: 'Expenditure Logged',
      description: 'Warehouse Rent payment of ₹35,000 recorded under Rent.',
      amount: 35000
    },
    {
      id: 'act-8',
      timestamp: daysAgo(4, 14, 15),
      type: 'expenditure_added',
      title: 'Raw Material Purchased',
      description: 'High-Purity Polymer Granules ₹45,000 from Supreme Petrochem Ltd.',
      amount: 45000
    }
  ];

  return {
    orders,
    expenditures,
    customers,
    activityLogs,
    settings: defaultSettings
  };
}
