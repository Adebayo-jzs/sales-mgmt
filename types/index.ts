// types/index.ts

export interface Product {
  id: string;
  name: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  _count?: { saleItems: number };
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  costPrice: string | number;
  sellingPrice: string | number;
  profit: string | number;
  product?: Product;
}

export interface Sale {
  id: string;
  totalAmount: string | number;
  totalProfit: string | number;
  customerName?: string | null;
  createdAt: string;
  items?: SaleItem[];
}

export interface BusinessStats {
  id: string;
  initialCapital: string | number;
  totalSalesProfit: string | number;
  totalNetProfit: string | number;
  totalExpenditure: string | number;
  presentValue: string | number;
  updatedAt: string;
}

export interface DashboardData {
  stats: BusinessStats;
  totalRevenue: number;
  totalSales: number;
  totalProducts: number;
  recentSales: Sale[];
  monthlyRevenue: { month: string; revenue: number; profit: number }[];
  topProducts: { name: string; totalRevenue: number; totalProfit: number; totalUnits: number }[];
}

export interface SaleFormItem {
  productId: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Expenditure {
  id: string;
  amount: string | number;
  description: string;
  createdAt: string;
}
