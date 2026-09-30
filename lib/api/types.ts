// ============================================================================
// KREZOEMA — Stage 13A & 13C: Ecommerce API Types
// Types matching the Laravel backend API response structure.
// ============================================================================

// --- Category ---

export interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  products_count?: number;
  active_products_count?: number;
}

// --- Product Image ---

export interface ApiProductImage {
  id: number;
  variant_id: number | null;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
}

// --- Product Variant ---

export interface ApiProductVariant {
  id: number;
  sku: string;
  name: string;
  options: Record<string, string>; // e.g. { warna: "Violet Pendar", ukuran: "6mm" }
  price: number | null;
  effective_price: number;
  stock: number;
  is_active: boolean;
}

// --- Product ---

export interface ApiProduct {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  material: string | null;
  base_price: number;
  stock?: number;
  image: string | null; // primary image URL
  category: ApiCategory;
  variants?: ApiProductVariant[];
  images?: ApiProductImage[];
}

// --- Pagination Meta ---

export interface PaginationLinkItem {
  url: string | null;
  label: string;
  active: boolean;
}

export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
  path: string;
  links?: PaginationLinkItem[];
}

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

// --- Paginated Response ---

export interface PaginatedResponse<T> {
  data: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

// --- Single Resource Response ---

export interface SingleResponse<T> {
  data: T;
}

// --- Product List Query Parameters ---

export interface ProductListParams {
  category?: string;
  search?: string;
  sort?: "latest" | "oldest" | "price_asc" | "price_desc" | "name_asc" | "name_desc";
  per_page?: number;
  page?: number;
}

// ============================================================================
// Stage 13C: Customer Authentication Types
// ============================================================================

export interface ApiCustomer {
  id: number;
  name: string;
  email: string;
  default_address?: any;
}

export interface RegisterCustomerPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface LoginCustomerPayload {
  email: string;
  password: string;
}

export interface UpdateCustomerProfilePayload {
  name?: string;
  email?: string;
}

export interface CustomerAuthResponse {
  message: string;
  data: ApiCustomer;
  customer?: ApiCustomer;
  token: string;
}

// ============================================================================
// Stage 13D: Customer Address Types
// ============================================================================

export interface ApiCustomerAddress {
  id: number;
  user_id: number;
  label: string;
  recipient_name: string;
  whatsapp: string;
  address: string;
  district: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface CustomerAddressPayload {
  label: string;
  recipient_name: string;
  whatsapp: string;
  address: string;
  district: string;
  city: string;
  province: string;
  postal_code: string;
  is_default?: boolean;
}

// ============================================================================
// Stage 13E: Checkout preparation types (no order API is called yet)
// ============================================================================

export type CheckoutShippingMethod = "jnt" | "jne";

export interface CheckoutState {
  addressId: number | null;
  shippingMethod: CheckoutShippingMethod | null;
  notes: string;
}

export interface PreparedCheckoutItem {
  product_id: number | null;
  variant_id: number | null;
  quantity: number;
}

export interface PreparedCheckoutPayload {
  address_id: number;
  shipping_method: CheckoutShippingMethod;
  notes: string | null;
  items: PreparedCheckoutItem[];
}

// ============================================================================
// Stage 14: Order Types
// ============================================================================

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";

export type PaymentStatus =
  | "unpaid"
  | "waiting_verification"
  | "paid"
  | "rejected";

export interface ApiOrderPaymentDetails {
  bank_name: string;
  account_number: string;
  account_holder: string;
  expires_at?: string | null;
}

export interface ApiOrderItem {
  id: number;
  order_id: number;
  product_id: number | null;
  variant_id: number | null;
  product_name: string;
  variant_name: string | null;
  sku: string | null;
  unit_price: number;
  quantity: number;
  subtotal: number;
  created_at?: string;
  updated_at?: string;
}

export interface ApiOrder {
  id: number;
  customer_id: number;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method?: string;
  payment_details?: ApiOrderPaymentDetails;
  shipping_method: string;
  shipping_name: string;
  shipping_whatsapp: string;
  shipping_address: string;
  shipping_kecamatan: string;
  shipping_city: string;
  shipping_province: string;
  shipping_postal_code: string;
  shipping_address_snapshot?: {
    recipient_name: string;
    whatsapp: string;
    address: string;
    district: string;
    city: string;
    province: string;
    postal_code: string;
  };
  notes: string | null;
  subtotal: number;
  shipping_cost: number;
  total: number;
  transfer_proof_url?: string | null;
  items?: ApiOrderItem[];
  customer?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  } | null;
  created_at: string;
  updated_at: string;
}

