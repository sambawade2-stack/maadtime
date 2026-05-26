export interface Store {
  id: number;
  name: string;
  slug: string;
  description: string;
  logo: string | null;
  phone: string;
  whatsapp: string;
  address: string;
  is_active: boolean;
  created_at: string;
}

export interface StoreStats {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  is_active: boolean;
  phone: string;
  whatsapp: string;
  address: string;
  orders_total: number;
  orders_pending: number;
  orders_today: number;
  revenue_total: number;
  revenue_monthly: number;
  products_total: number;
  low_stock: number;
  out_of_stock: number;
}

export interface StoreUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  store: { id: number; name: string; slug: string } | null;
}

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: "admin" | "client";
  is_staff: boolean;
  is_superuser: boolean;
  store: { id: number; name: string; slug: string } | null;
  avatar: string | null;
  created_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user: User;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  is_active: boolean;
  order: number;
  product_count: number;
}

export interface ProductImage {
  id: number;
  image: string;
  alt_text: string;
  is_main: boolean;
  order: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  compare_price: number | null;
  stock: number;
  weight: string;
  category: Category;
  category_name?: string;
  images: ProductImage[];
  main_image: string | null;
  in_stock: boolean;
  is_active: boolean;
  discount_percent: number | null;
  is_featured: boolean;
  is_new: boolean;
  reviews_count?: number;
  average_rating?: number | null;
  created_at: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface WishlistItem {
  id: number;
  product: Product;
  created_at: string;
}

export interface Address {
  id: number;
  full_name: string;
  phone: string;
  address_line: string;
  city: string;
  neighborhood: string;
  is_default: boolean;
  created_at: string;
}

export interface OrderItem {
  id: number;
  product: number | null;
  product_name: string;
  product_image: string;
  price: number;
  quantity: number;
  total: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  id: number;
  order_number: string;
  status: OrderStatus;
  status_display: string;
  payment_method: string;
  payment_method_display: string;
  full_name: string;
  phone: string;
  country: string;
  address_line: string;
  city: string;
  neighborhood: string;
  notes: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  items: OrderItem[];
  items_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CheckoutForm {
  full_name: string;
  phone: string;
  country: string;
  address_line: string;
  city: string;
  neighborhood?: string;
  notes?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface DashboardStats {
  revenue: { total: number; monthly: number; daily: number };
  orders: { today: number; week: number; total: number; period: number; by_status: { status: string; count: number }[] };
  customers: { total: number; new_month: number };
  products: { total: number; low_stock: number; out_of_stock: number };
}

export interface DeliveryZone {
  id: number;
  name: string;
  city: string;
  fee: number;
  estimated_days: number;
  is_active: boolean;
}
