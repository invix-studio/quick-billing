export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  image?: string;
  available: boolean;
  preparationTime?: number;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  notes?: string;
  subtotal: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  createdAt: Date;
  customerName?: string;
  tableNumber?: string;
}

export interface SalesStats {
  todayTotal: number;
  todayOrders: number;
  shiftTotal: number;
  openTabs: number;
}