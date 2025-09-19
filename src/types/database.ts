export interface Profile {
  id: string;
  user_id: string;
  business_name?: string;
  contact_info?: any;
  created_at: string;
  updated_at: string;
}

export interface DatabaseProduct {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  image_url?: string;
  is_available: boolean;
  preparation_time?: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseOrder {
  id: string;
  user_id: string;
  customer_name?: string;
  table_number?: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  tax_rate?: number;
  package_charge?: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  notes?: string;
  created_at: string;
}

export interface OrderWithItems extends DatabaseOrder {
  order_items: (OrderItem & { product: DatabaseProduct })[];
}