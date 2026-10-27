export type Platform = 
  | 'shopee' 
  | 'tiktok' 
  | 'lazada' 
  | 'facebook' 
  | 'instagram' 
  | 'zalo' 
  | 'website' 
  | 'pos';

export type OrderStatus = 
  | 'pending'     // Chưa xác nhận
  | 'confirmed'   // Đã xác nhận
  | 'packed'      // Đã đóng gói (sẵn sàng)
  | 'shipping'    // Đã giao cho shipper
  | 'delivered'   // Giao thành công
  | 'cancelled';  // Đã hủy / hoàn trả

export interface OrderItem {
  id: string;
  name: string;
  sku: string;
  variant?: string; // Ví dụ: Màu Hồng Baby, Size S
  price: number;
  quantity: number;
  imageUrl: string;
  checkedForPacking?: boolean;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  avatar?: string;
  isVip?: boolean;
  totalOrdersCount?: number;
}

export interface CustomerFeedback {
  rating: number; // 1 to 5
  comment: string;
  date: string;
  tags?: string[];
  reply?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // ví dụ: ORD-2491
  platform: Platform;
  channelSourceNote?: string; // Ghi chú nguồn kênh bán: Livestream TikTok, Inbox Fanpage, Zalo cá nhân...
  createdAt: string; // ISO string or format
  status: OrderStatus;
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  shopVoucher: number;
  platformVoucher: number;
  totalAmount: number;
  paymentMethod: 'COD' | 'Banking' | 'Ví ShopeePay' | 'Ví MoMo';
  isPaid: boolean;
  shippingPartner: string; // GHTK, GHN, Viettel Post, SPX Express, J&T
  trackingCode: string;
  notes?: string;
  internalNote?: string;
  feedback?: CustomerFeedback;
  packingVerified?: boolean;
  packageBox?: string; // Ví dụ: Hộp Carton Cỡ M (20x15x10cm)
  packedAt?: string;
  shippedAt?: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  imageUrl: string;
  variant: string;
  price: number;
  systemStock: number;   // Tồn hệ thống
  actualStock: number;   // Tồn thực tế kiểm kê
  minAlertThreshold: number; // Ngưỡng báo động sắp hết
  lastAuditDate: string;
  discrepancyReason?: string; // Lý do lệch (Ví dụ: Thất thoát đóng gói, Hàng mẫu, Khách đổi trả chưa nhập)
}

export interface SalesMetrics {
  totalOrders: number;
  totalRevenue: number;
  totalVouchersDiscount: number;
  averageRating: number;
  totalReviewsCount: number;
  pendingCount: number;
  confirmedCount: number;
  packedCount: number;
  shippingCount: number;
  deliveredCount: number;
}
